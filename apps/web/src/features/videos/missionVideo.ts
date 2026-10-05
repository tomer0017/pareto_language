import manifest from 'virtual:ready-video-manifest';
import { BOOTCAMP_PLAN, missionNumber } from '../bootcamp/plan.js';
import type { BootcampVideo } from '../bootcamp/types.js';
import { normalizeVideoLang, resolveMissionVideoUrl, type VideoManifest } from './videoConvention.js';

/**
 * THE mission-video resolver — the one place the app asks "is there a video, and where?".
 *
 *   learning language + displayed mission number  →  {base}/videos/{lang}/{lang}_{number}.mp4
 *
 * Availability comes from the build-time manifest (`apps/web/videoManifest.ts` scans the folders),
 * so the app never probes URLs and never loads a video it does not play. Every video entry point —
 * the mission hub, the "watch the full conversation" button, the video steps, the victory screen,
 * the Videos screen — goes through here: a mission without a file simply has no video UI.
 *
 * The language is always the one being LEARNED; the interface language plays no part.
 */
export const VIDEO_MANIFEST: VideoManifest = manifest;

/** What every mission video is: the whole conversation, played before or after practice. */
const FULL_CONVERSATION = { he: 'השיחה המלאה', en: 'Full conversation' } as const;

/** The URL of the video for this learning language and DISPLAYED mission number (1–30), or null
 *  when no file exists. The URL already carries the site base (GitHub Pages sub-path included). */
export function getMissionVideo(
  { learningLanguage, missionNumber: n }: { learningLanguage: string; missionNumber: number },
  from: VideoManifest = VIDEO_MANIFEST,
  base: string | undefined = import.meta.env.BASE_URL,
): string | null {
  return resolveMissionVideoUrl(from, base, learningLanguage, n);
}

/** The video of a mission given by its registry key (`day`), as the player takes it — or undefined.
 *  The key is turned into the number the learner sees; the key itself never reaches a file name. */
export function missionVideo(learningLanguage: string, day: number, from: VideoManifest = VIDEO_MANIFEST, base: string | undefined = import.meta.env.BASE_URL): BootcampVideo | undefined {
  const n = missionNumber(day);
  const lang = normalizeVideoLang(learningLanguage);
  const src = n === null ? null : getMissionVideo({ learningLanguage, missionNumber: n }, from, base);
  return src && lang ? { src, title: { ...FULL_CONVERSATION }, language: lang, type: 'intro' } : undefined;
}

/** Every mission of the journey that has a video in this learning language, in journey order. */
export function missionVideos(learningLanguage: string, from: VideoManifest = VIDEO_MANIFEST, base: string | undefined = import.meta.env.BASE_URL): { day: number; missionNumber: number; video: BootcampVideo }[] {
  return BOOTCAMP_PLAN.flatMap((m, i) => {
    const video = missionVideo(learningLanguage, m.day, from, base);
    return video ? [{ day: m.day, missionNumber: i + 1, video }] : [];
  });
}
