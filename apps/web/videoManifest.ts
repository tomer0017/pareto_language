import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { MISSION_COUNT, VIDEO_LANGS, parseVideoFileName, type VideoLang, type VideoManifest } from './src/features/videos/videoConvention.js';

/**
 * Build-time discovery of mission videos.
 *
 * `scanMissionVideos` reads `public/videos/{en,es,fr}/` and returns which displayed mission numbers
 * have a file. `videoManifestPlugin` serves that to the app as the module
 * `virtual:ready-video-manifest`, computed fresh on every `npm run dev`, `npm run build` and test
 * run — there is no generated file to commit and no command to remember. The MP4s themselves are
 * ordinary static files, fetched only when a learner plays one.
 *
 * A file that breaks the naming convention FAILS the build with an explanation, so a typo never
 * silently ships a mission without its video.
 */
export const VIDEO_MANIFEST_MODULE = 'virtual:ready-video-manifest';

export interface VideoScan { manifest: VideoManifest; errors: string[] }

const CONVENTION = `Mission videos must be named  videos/{language}/{language}_{mission number}.mp4  — language is one of ${VIDEO_LANGS.join(' / ')}, the number is the mission number the learner sees, 1–${MISSION_COUNT}, with no zero padding (for example videos/es/es_7.mp4).`;
const hidden = (name: string): boolean => name.startsWith('.');

export function scanMissionVideos(publicDir: string): VideoScan {
  const root = join(publicDir, 'videos');
  const manifest: VideoManifest = { en: [], es: [], fr: [] };
  const errors: string[] = [];
  if (!existsSync(root)) return { manifest, errors };

  for (const name of readdirSync(root).filter((n) => !hidden(n)).sort()) {
    const isDir = statSync(join(root, name)).isDirectory();
    if (isDir && (VIDEO_LANGS as readonly string[]).includes(name)) continue;
    errors.push(isDir ? `videos/${name}/ is not a language folder` : `videos/${name} is not inside a language folder`);
  }
  for (const lang of VIDEO_LANGS) {
    const dir = join(root, lang);
    if (!existsSync(dir)) continue;
    const seen = new Map<number, string>();
    for (const name of readdirSync(dir).filter((n) => !hidden(n)).sort()) {
      const n = statSync(join(dir, name)).isFile() ? parseVideoFileName(lang as VideoLang, name) : null;
      if (n === null) { errors.push(`videos/${lang}/${name} is not a valid name (expected ${lang}_<1–${MISSION_COUNT}>.mp4)`); continue; }
      if (seen.has(n)) { errors.push(`videos/${lang}/${name} and videos/${lang}/${seen.get(n)} are both Mission ${n}`); continue; }
      seen.set(n, name);
    }
    manifest[lang] = [...seen.keys()].sort((a, b) => a - b);
  }
  return { manifest, errors };
}

/** The manifest, or a thrown error that names every offending file and states the convention. */
export function readVideoManifest(publicDir: string): VideoManifest {
  const { manifest, errors } = scanMissionVideos(publicDir);
  if (errors.length) throw new Error(`[videos] ${errors.length} file(s) break the mission-video naming convention:\n  - ${errors.join('\n  - ')}\n${CONVENTION}`);
  return manifest;
}

export function videoManifestPlugin(publicDir: string): Plugin {
  const id = `\0${VIDEO_MANIFEST_MODULE}`;
  const videos = resolve(publicDir, 'videos');
  return {
    name: 'ready-video-manifest',
    resolveId: (source) => (source === VIDEO_MANIFEST_MODULE ? id : null),
    load: (loaded) => (loaded === id ? `export default ${JSON.stringify(readVideoManifest(publicDir))};` : null),
    // Dev: a video added, renamed or removed while the server runs is picked up without a restart.
    configureServer(server) {
      server.watcher.add(videos);
      const refresh = (file: string): void => {
        if (!resolve(file).startsWith(videos)) return;
        const mod = server.moduleGraph.getModuleById(id);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}
