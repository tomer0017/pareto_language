/**
 * THE mission-video convention — the single definition of where a mission's video lives.
 *
 *   apps/web/public/videos/{language}/{language}_{displayedMissionNumber}.mp4
 *
 *   Mission 04, Spanish  →  videos/es/es_4.mp4
 *   Mission 14, English  →  videos/en/en_14.mp4
 *   Mission 30, Spanish  →  videos/es/es_30.mp4
 *
 * The number is the mission number the LEARNER SEES (1–30, no zero padding) — never the registry
 * key (`day`), a source file name or an old position. The language is the language being LEARNED,
 * never the interface language.
 *
 * Nothing lists the videos by hand: the build scans the folders (`apps/web/videoManifest.ts`) and
 * hands the app a manifest of what exists. Dropping a correctly named file into the folder is all it
 * takes — no mission file, mapping table or manifest is ever edited.
 *
 * PURE (no Node, no Vite, no React): shared by the build-time scanner, the runtime resolver
 * (`missionVideo.ts`), the doc generators and the tests.
 */
export const VIDEO_LANGS = ['en', 'es', 'fr'] as const;
export type VideoLang = (typeof VIDEO_LANGS)[number];

/** How many missions the Core has — the highest number a video file may carry. (A test pins this
 *  to the mission plan.) */
export const MISSION_COUNT = 30;

/** For each learning language, the displayed mission numbers that have a video file. */
export type VideoManifest = Record<VideoLang, number[]>;
export const EMPTY_VIDEO_MANIFEST: VideoManifest = { en: [], es: [], fr: [] };

/** The app's learning-language code → a video language, or null when there are no videos for it. */
export function normalizeVideoLang(lang: string | null | undefined): VideoLang | null {
  const code = (lang ?? '').trim().toLowerCase().split(/[-_]/)[0] ?? '';
  return (VIDEO_LANGS as readonly string[]).includes(code) ? (code as VideoLang) : null;
}

const isMissionNumber = (n: number): boolean => Number.isInteger(n) && n >= 1 && n <= MISSION_COUNT;

/** `es_30.mp4` */
export function videoFileName(lang: VideoLang, missionNumber: number): string {
  if (!isMissionNumber(missionNumber)) throw new Error(`[videos] ${missionNumber} is not a mission number (1–${MISSION_COUNT})`);
  return `${lang}_${missionNumber}.mp4`;
}

/** `videos/es/es_30.mp4` — relative to the public folder / the site base, no leading slash. */
export const videoPublicPath = (lang: VideoLang, missionNumber: number): string => `videos/${lang}/${videoFileName(lang, missionNumber)}`;

/** The mission number a file name carries, or null when the name breaks the convention
 *  (`Es_1.mp4`, `es_01.mp4`, `es_day1.mp4`, `es_31.mp4`, `en_0.mp4`, another language's prefix…). */
export function parseVideoFileName(lang: VideoLang, fileName: string): number | null {
  const hit = new RegExp(`^${lang}_([1-9][0-9]?)\\.mp4$`).exec(fileName);
  if (!hit) return null;
  const n = Number(hit[1]);
  return isMissionNumber(n) ? n : null;
}

/** Join the site base (`/pareto_language/`) and a public path: `/pareto_language/videos/es/es_5.mp4`. */
export function withBase(base: string | undefined, publicPath: string): string {
  return `${(base || '/').replace(/\/+$/, '')}/${publicPath.replace(/^\/+/, '')}`;
}

/** Where the video WOULD be for this language and displayed mission number — whether or not the
 *  file exists. Null only when the language has no video folder or the number is not a mission. */
export function candidateVideoUrl(base: string | undefined, learningLanguage: string | null | undefined, missionNumber: number): string | null {
  const lang = normalizeVideoLang(learningLanguage);
  return lang && isMissionNumber(missionNumber) ? withBase(base, videoPublicPath(lang, missionNumber)) : null;
}

/** The URL of the video for this language and displayed mission number, or null when no file exists. */
export function resolveMissionVideoUrl(manifest: VideoManifest, base: string | undefined, learningLanguage: string | null | undefined, missionNumber: number): string | null {
  const lang = normalizeVideoLang(learningLanguage);
  if (!lang || !isMissionNumber(missionNumber) || !manifest[lang]?.includes(missionNumber)) return null;
  return withBase(base, videoPublicPath(lang, missionNumber));
}
