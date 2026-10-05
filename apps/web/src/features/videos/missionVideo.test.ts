import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readVideoManifest, scanMissionVideos } from '../../../videoManifest.js';
import { BOOTCAMP_PLAN, missionNumber } from '../bootcamp/plan.js';
import { MISSIONS_BY_LANG } from '../bootcamp/registry.js';
import { VIDEO_MANIFEST, getMissionVideo, missionVideo, missionVideos } from './missionVideo.js';
import { EMPTY_VIDEO_MANIFEST, MISSION_COUNT, VIDEO_LANGS, candidateVideoUrl, normalizeVideoLang, parseVideoFileName, resolveMissionVideoUrl, videoFileName, videoPublicPath, type VideoManifest } from './videoConvention.js';

/**
 * Mission videos are found by ONE convention, never wired by hand:
 *
 *   apps/web/public/videos/{language}/{language}_{displayedMissionNumber}.mp4
 *
 * The build scans the folders; the app asks one resolver. Adding a correctly named file is all it
 * takes — these tests fail if a mission file, a mapping table or a per-video list ever comes back.
 */
const PUBLIC = fileURLToPath(new URL('../../../public', import.meta.url));
const SRC = fileURLToPath(new URL('../..', import.meta.url));
const BASE = '/pareto_language/'; // the GitHub Pages sub-path (vitest.config.ts sets the same base)
const ALL: VideoManifest = { en: Array.from({ length: 30 }, (_, i) => i + 1), es: Array.from({ length: 30 }, (_, i) => i + 1), fr: Array.from({ length: 30 }, (_, i) => i + 1) };
const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;
const url = (lang: string, n: number, manifest: VideoManifest = ALL): string | null => getMissionVideo({ learningLanguage: lang, missionNumber: n }, manifest, BASE);

describe('the convention: language + displayed mission number', () => {
  it('English M01, Spanish M30, French M14', () => {
    expect(videoPublicPath('en', 1)).toBe('videos/en/en_1.mp4');
    expect(videoPublicPath('es', 30)).toBe('videos/es/es_30.mp4');
    expect(videoPublicPath('fr', 14)).toBe('videos/fr/fr_14.mp4');
    expect(videoFileName('es', 7)).toBe('es_7.mp4'); // no zero padding
  });
  it('the number is the one the learner sees — never the registry key', () => {
    // Airport & Border: registry key 10, shown as Mission 6.
    expect([dayOf('airport-border'), missionNumber(dayOf('airport-border'))]).toEqual([10, 6]);
    expect(missionVideo('en', dayOf('airport-border'), ALL, BASE)!.src).toBe('/pareto_language/videos/en/en_6.mp4');
    // Taxi: key 6, Mission 7.   Restaurant Meal: key 4, Mission 14.
    expect(missionVideo('en', dayOf('taxi'), ALL, BASE)!.src).toBe('/pareto_language/videos/en/en_7.mp4');
    expect(missionVideo('en', dayOf('restaurant-meal'), ALL, BASE)!.src).toBe('/pareto_language/videos/en/en_14.mp4');
    expect(missionVideo('es', dayOf('everyday-core'), ALL, BASE)!.src).toBe('/pareto_language/videos/es/es_4.mp4');
    expect(missionVideo('es', dayOf('complete-day-abroad'), ALL, BASE)!.src).toBe('/pareto_language/videos/es/es_30.mp4');
    // Every mission: the file number is its position in the journey, whatever its key.
    BOOTCAMP_PLAN.forEach((m, i) => {
      for (const lang of VIDEO_LANGS) expect(missionVideo(lang, m.day, ALL, BASE)!.src, `${lang} ${m.id}`).toBe(`/pareto_language/videos/${lang}/${lang}_${i + 1}.mp4`);
    });
    // A key that is not in the journey has no video.
    expect(missionVideo('en', 999, ALL, BASE)).toBeUndefined();
  });
  it('the highest number is the number of Core missions', () => {
    expect(MISSION_COUNT).toBe(BOOTCAMP_PLAN.length);
    expect(() => videoFileName('en', 31)).toThrow();
    expect(() => videoFileName('en', 0)).toThrow();
  });
});

describe('the resolver: one answer to "is there a video, and where?"', () => {
  const some: VideoManifest = { en: [1, 6], es: [5], fr: [] };

  it('a file that exists resolves to its URL; one that does not resolves to nothing', () => {
    expect(url('en', 1, some)).toBe('/pareto_language/videos/en/en_1.mp4');
    expect(url('en', 2, some)).toBeNull();
    expect(url('fr', 20, some)).toBeNull();
    expect(missionVideo('fr', dayOf('taxi'), some, BASE)).toBeUndefined();
    expect(url('es', 30, EMPTY_VIDEO_MANIFEST)).toBeNull();
    expect(url('en', 31)).toBeNull();
    expect(url('en', 0)).toBeNull();
    expect(url('en', 1.5)).toBeNull();
  });
  it('the candidate path is right even when the file is not there yet', () => {
    expect(candidateVideoUrl(BASE, 'es', 30)).toBe('/pareto_language/videos/es/es_30.mp4');
    expect(resolveMissionVideoUrl(some, BASE, 'es', 30)).toBeNull(); // …but it is not available
  });
  it('languages never mix: Spanish M05 is es/es_5.mp4, whatever the other languages have', () => {
    expect(url('es', 5, some)).toBe('/pareto_language/videos/es/es_5.mp4');
    expect(url('en', 5, some)).toBeNull(); // English does not borrow the Spanish file
    expect(url('fr', 5, some)).toBeNull();
    const onlyOthers: VideoManifest = { en: [5], es: [], fr: [5] };
    expect(url('es', 5, onlyOthers)).toBeNull(); // Spanish does not fall back to English or French
    for (const lang of VIDEO_LANGS) for (const n of [1, 5, 30]) expect(url(lang, n)).toContain(`/videos/${lang}/${lang}_${n}.mp4`);
  });
  it('the language is the one being LEARNED — the interface language is not an input at all', () => {
    // UI Hebrew, learning Spanish, Mission 5: the resolver is only ever given the learning language.
    expect(getMissionVideo.length).toBe(1);
    expect(url('es', 5)).toBe('/pareto_language/videos/es/es_5.mp4');
    expect(normalizeVideoLang('he')).toBeNull(); // an interface-only language has no videos
    expect(url('he', 5)).toBeNull();
    expect([normalizeVideoLang('ES'), normalizeVideoLang('es-ES'), normalizeVideoLang(' fr ')]).toEqual(['es', 'es', 'fr']);
    // Every call site passes the app's learning language and nothing else.
    const player = readFileSync(join(SRC, 'features/bootcamp/Bootcamp.tsx'), 'utf8');
    expect(player.match(/missionVideo\(useAppStore\.getState\(\)\.learningLang, day\.day\)/g)).toHaveLength(3);
    expect(readFileSync(join(SRC, 'features/videos/Videos.tsx'), 'utf8')).toContain('allVideos(app.learningLang)');
    for (const f of ['features/bootcamp/Bootcamp.tsx', 'features/videos/Videos.tsx', 'features/videos/missionVideo.ts']) expect(readFileSync(join(SRC, f), 'utf8'), f).not.toMatch(/uiLang[^\n]*[vV]ideo|[vV]ideo[^\n]*uiLang/);
  });
  it('the URL respects the site base (GitHub Pages serves the app under /pareto_language/)', () => {
    expect(import.meta.env.BASE_URL).toBe('/pareto_language/');
    expect(getMissionVideo({ learningLanguage: 'es', missionNumber: 5 }, ALL)).toBe('/pareto_language/videos/es/es_5.mp4'); // default base = the app's
    expect(getMissionVideo({ learningLanguage: 'es', missionNumber: 5 }, ALL, '/')).toBe('/videos/es/es_5.mp4');
    expect(getMissionVideo({ learningLanguage: 'es', missionNumber: 5 }, ALL, undefined)).toBe('/pareto_language/videos/es/es_5.mp4');
    expect(resolveMissionVideoUrl(ALL, '/sub/path', 'en', 1)).toBe('/sub/path/videos/en/en_1.mp4');
  });
  it('what the player receives: the URL, and that it is the full conversation in the learning language', () => {
    expect(missionVideo('es', dayOf('directions'), ALL, BASE)).toEqual({ src: '/pareto_language/videos/es/es_5.mp4', title: { he: 'השיחה המלאה', en: 'Full conversation' }, language: 'es', type: 'intro' });
    expect(missionVideos('es', some, BASE).map((v) => [v.missionNumber, v.day, v.video.src])).toEqual([[5, 5, '/pareto_language/videos/es/es_5.mp4']]);
    expect(missionVideos('en', some, BASE).map((v) => [v.missionNumber, v.day])).toEqual([[1, 1], [6, 10]]);
    expect(missionVideos('fr', some, BASE)).toEqual([]);
  });
});

describe('the scanner: what the build finds in public/videos/', () => {
  const folder = (files: Record<string, string[]>, loose: string[] = []): string => {
    const dir = mkdtempSync(join(tmpdir(), 'ready-videos-'));
    mkdirSync(join(dir, 'videos'));
    for (const f of loose) writeFileSync(join(dir, 'videos', f), '');
    for (const [lang, names] of Object.entries(files)) { mkdirSync(join(dir, 'videos', lang)); for (const n of names) writeFileSync(join(dir, 'videos', lang, n), ''); }
    return dir;
  };

  it('accepts canonical names and reports the mission numbers, sorted', () => {
    const scan = scanMissionVideos(folder({ es: ['es_30.mp4', 'es_4.mp4', 'es_10.mp4'], en: ['en_1.mp4'], fr: [] }));
    expect(scan).toEqual({ manifest: { en: [1], es: [4, 10, 30], fr: [] }, errors: [] });
    expect(parseVideoFileName('es', 'es_30.mp4')).toBe(30);
    expect(parseVideoFileName('en', 'en_1.mp4')).toBe(1);
  });
  it('rejects every malformed name, with the reason', () => {
    for (const bad of ['es_030.mp4', 'Es_30.mp4', 'es_31.mp4', 'es_01.mp4', 'es_day1.mp4', 'spanish_1.mp4', 'es_0.mp4', 'en_5.mp4', 'es_5.MP4', 'es_5.mov', 'es_5', 'es_5.mp4.part', 'es_-1.mp4', 'es_1 .mp4']) {
      expect(parseVideoFileName('es', bad), bad).toBeNull();
      const scan = scanMissionVideos(folder({ es: [bad] }));
      expect(scan.manifest.es, bad).toEqual([]);
      expect(scan.errors, bad).toHaveLength(1);
      expect(scan.errors[0], bad).toContain(`videos/es/${bad}`);
    }
    expect(parseVideoFileName('en', 'en_0.mp4')).toBeNull();
  });
  it('a malformed name fails the build with an explanation of the convention', () => {
    const dir = folder({ es: ['es_7.mp4', 'Es_1.mp4', 'es_31.mp4'] });
    expect(() => readVideoManifest(dir)).toThrow(/2 file\(s\) break the mission-video naming convention/);
    expect(() => readVideoManifest(dir)).toThrow(/videos\/es\/Es_1\.mp4/);
    expect(() => readVideoManifest(dir)).toThrow(/videos\/\{language\}\/\{language\}_\{mission number\}\.mp4/);
    expect(() => readVideoManifest(dir)).toThrow(/no zero padding/);
  });
  it('a video outside a language folder, or in an unknown folder, is an error — never silently ignored', () => {
    expect(scanMissionVideos(folder({ en: ['en_1.mp4'] }, ['En_day1.mp4'])).errors).toEqual(['videos/En_day1.mp4 is not inside a language folder']);
    expect(scanMissionVideos(folder({ de: ['de_1.mp4'] })).errors).toEqual(['videos/de/ is not a language folder']);
  });
  it('hidden files are ignored; no videos at all is fine', () => {
    expect(scanMissionVideos(folder({ es: ['.DS_Store', 'es_2.mp4'] }, ['.DS_Store'])).errors).toEqual([]);
    expect(readVideoManifest(mkdtempSync(join(tmpdir(), 'ready-none-')))).toEqual(EMPTY_VIDEO_MANIFEST);
    expect(readVideoManifest(folder({}))).toEqual(EMPTY_VIDEO_MANIFEST);
  });
});

describe('the real folder: what exists is exactly what the app plays', () => {
  const onDisk = readVideoManifest(PUBLIC);

  it('the manifest the app was built with is the scan of public/videos/', () => {
    expect(VIDEO_MANIFEST).toEqual(onDisk);
  });
  it('the Spanish videos are picked up with no wiring of their own', () => {
    expect(onDisk.es).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7]));
    for (const n of [1, 2, 3, 4, 5, 6, 7]) {
      expect(getMissionVideo({ learningLanguage: 'es', missionNumber: n }), `M${n}`).toBe(`/pareto_language/videos/es/es_${n}.mp4`);
      expect(existsSync(join(PUBLIC, 'videos', 'es', `es_${n}.mp4`))).toBe(true);
    }
    // Nothing in the source names a Spanish video file.
    const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sources(join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.test.ts') ? [join(dir, e.name)] : []));
    for (const f of sources(SRC).filter((x) => !x.endsWith('videoConvention.ts'))) expect(readFileSync(f, 'utf8'), f).not.toMatch(/es_[1-9][0-9]?\.mp4/); // (the convention's own doc comment gives examples)
  });
  it('the videos that predate the Core 30 sit under their displayed mission numbers', () => {
    expect(onDisk.en).toEqual(expect.arrayContaining([1, 2, 3, 6, 7, 8, 9, 14]));
    expect(onDisk.fr).toEqual(expect.arrayContaining([1, 2, 3, 5, 6, 9, 14]));
  });
  it('every file found is a playable mission video, and nothing is left in the old location', () => {
    for (const lang of VIDEO_LANGS) for (const n of onDisk[lang]) {
      expect(existsSync(join(PUBLIC, videoPublicPath(lang, n))), `${lang} ${n}`).toBe(true);
      expect(missionVideo(lang, BOOTCAMP_PLAN[n - 1]!.day)?.src).toBe(`/pareto_language/videos/${lang}/${lang}_${n}.mp4`);
    }
    expect(readdirSync(join(PUBLIC, 'videos')).filter((f) => f.endsWith('.mp4'))).toEqual([]);
  });
});

describe('no hand-wiring: mission content and runtime code never name a video file', () => {
  const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sources(join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [join(dir, e.name)] : []));
  const runtime = sources(SRC).filter((f) => !f.endsWith('.test.ts') && !f.endsWith('cueFreeze.ts')); // cueFreeze.ts is test support (old fingerprints)

  it('no mission, in any language, carries a video path', () => {
    for (const lang of ['en', 'fr', 'es']) for (const m of BOOTCAMP_PLAN) {
      const day = MISSIONS_BY_LANG[lang]![m.day]!;
      expect(Object.keys(day), `${lang} ${m.id}`).not.toContain('introVideo');
      expect(JSON.stringify(day), `${lang} ${m.id}`).not.toMatch(/\.mp4|\/videos\//);
    }
  });
  it('no runtime source mentions the old registry-key names or builds a path itself', () => {
    for (const f of runtime) {
      const text = readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/En_day|Fr_day|Es_day|introVideo/);
      if (!f.endsWith('videoConvention.ts')) expect(text, f).not.toMatch(/videos\/\$\{|_\$\{[^}]*\}\.mp4/); // only the convention builds a path
    }
  });
  it('the manifest is not a file anyone maintains: it is computed by the build plugin, in dev, build and tests alike', () => {
    expect(readdirSync(join(SRC, 'features/videos')).filter((f) => /manifest/i.test(f))).toEqual([]);
    const vite = readFileSync(join(SRC, '../vite.config.ts'), 'utf8');
    const vitest = readFileSync(join(SRC, '../../../vitest.config.ts'), 'utf8');
    expect(vite).toContain("videoManifestPlugin(r('./public'))");
    expect(vitest).toContain("videoManifestPlugin(r('./apps/web/public'))");
    // Videos are never precached: the service worker's precache list has no mp4, and they are cached on first play.
    expect(vite).toMatch(/globPatterns: \['\*\*\/\*\.\{js,css,html,svg,png,jpg,json\}'\]/);
    expect(vite).toMatch(/urlPattern: \/\\\.mp4\$\//);
  });
});

describe('a mission without a video shows no video UI', () => {
  const player = readFileSync(join(SRC, 'features/bootcamp/Bootcamp.tsx'), 'utf8');

  it('every video entry point is gated on the resolver\'s answer', () => {
    // Hub: the Watch step plays the video only if there is one, else reads the conversation aloud.
    expect(player).toContain('if (video) setShowVideo(true);');
    expect(player).toContain('if (showVideo && video) {');
    // In a lesson: the "watch the full conversation" button exists only with a video.
    expect(player).toContain("{video && step.kind !== 'video' && (");
    // Overlays (lesson and victory screen) open only with a video.
    expect(player.match(/if \(showVideo && video\) return <VideoOverlay video=\{video\}/g)).toHaveLength(2);
    // A video step with no video is passed over, never rendered as an empty player.
    expect(player).toContain("{step.kind === 'video' && (video ? <VideoStep video={video} mode={step.mode} icon={missionIcon(day)} onNext={advance} /> : <SkipStep onNext={advance} />)}");
    expect(player).toMatch(/function SkipStep\(\{ onNext \}[^}]*\}\) \{\n[^\n]*\n\s+useEffect\(\(\) => \{ onNext\(\); \}, \[\]\);\n\s+return null;/);
  });
  it('the Videos screen offers only what exists for the learning language', async () => {
    const none = missionVideos('es', EMPTY_VIDEO_MANIFEST, BASE);
    expect(none).toEqual([]); // → the screen's honest empty state, not a broken player
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    const { VideoPlayer } = await import('../bootcamp/Bootcamp.js');
    const html = renderToStaticMarkup(createElement(VideoPlayer, { video: missionVideo('es', dayOf('directions'), ALL, BASE)! }));
    expect(html).toContain('src="/pareto_language/videos/es/es_5.mp4#t=0.1"'); // the base is applied once, not twice
    expect(html).not.toContain('/pareto_language/pareto_language/');
  });
});
