import { STAGES, type CompanionStage } from './companionModel.js';

/**
 * The ONE place the companion's artwork is named. Screens never ask for a file: the figure asks for
 * "stage 3, hello" and this table answers. Replacing the art (new renders, sprite sheets, Lottie /
 * Rive) is a change here and, for animated formats, in `CompanionFigure`; no screen or logic changes.
 *
 * Art: one isolated, transparent render per stage and pose, cut from the approved expression sheets
 * (eight poses per stage). Every image of a stage is the same square size with the character
 * centred, so switching pose never makes it jump or resize.
 *
 * Naming: `public/companion/s<stage>-<pose>.png`.
 *
 * These files are NOT part of the app's precache: only the stage the learner has reached is ever
 * requested (and warmed for offline use — see `preloadStageArt`), so a device never even downloads
 * a form its owner has not met.
 */
export type ArtVariant = 'full' | 'compact';

/** The eight poses of the expression sheets, in sheet order. `idle` is the neutral one. */
export const ART_POSES = ['idle', 'hello', 'winner', 'celebrate', 'learning', 'sad', 'crown', 'cheer'] as const;
export type ArtPose = (typeof ART_POSES)[number];

export interface StageArt {
  /** The neutral pose — also the fallback for any pose a stage has no image for. */
  full: string;
  compact: string;
  /** Intrinsic pixel size (the images are square). */
  size: { full: number; compact: number };
  /** true = an isolated render on a transparent background (shown as it is, no edge feathering). */
  transparent?: boolean;
  /** Per-pose images. A missing pose falls back to `full` / `compact`. */
  poses?: Partial<Record<ArtPose, Partial<Record<ArtVariant, string>>>>;
}

const file = (stage: CompanionStage, pose: ArtPose): string => `/companion/s${stage}-${pose}.png`;
const stageArt = (stage: CompanionStage): StageArt => ({
  full: file(stage, 'idle'),
  compact: file(stage, 'idle'),
  size: { full: 320, compact: 320 },
  transparent: true,
  poses: Object.fromEntries(ART_POSES.map((pose) => [pose, { full: file(stage, pose), compact: file(stage, pose) }])),
});

export const COMPANION_ART: Record<CompanionStage, StageArt> = Object.fromEntries(STAGES.map((s) => [s, stageArt(s)])) as Record<CompanionStage, StageArt>;

/** The image path for a stage / variant / pose, falling back to the stage's neutral image. */
export function artPath(stage: CompanionStage, variant: ArtVariant, pose: ArtPose = 'idle'): string {
  const art = COMPANION_ART[stage];
  return art.poses?.[pose]?.[variant] ?? art[variant];
}

/** Resolve a public path against the app's base, so it works on the deployed sub-path and offline. */
export function artUrl(stage: CompanionStage, variant: ArtVariant, base: string = import.meta.env.BASE_URL || '/', pose: ArtPose = 'idle'): string {
  return `${base.replace(/\/$/, '')}${artPath(stage, variant, pose)}`;
}

export const isTransparentArt = (stage: CompanionStage): boolean => COMPANION_ART[stage].transparent === true;

/** Every image of ONE stage — the current one. Nothing here ever lists another stage's art. */
export const stageArtUrls = (stage: CompanionStage, base?: string): string[] => [...new Set(ART_POSES.map((pose) => artUrl(stage, 'compact', base, pose)))];

/** Fetch the current stage's poses in the background, so a reaction never pops in late and the
 *  character still has every expression offline. No-op outside a browser. */
export function preloadStageArt(stage: CompanionStage): void {
  if (typeof Image === 'undefined') return;
  for (const url of stageArtUrls(stage)) { const img = new Image(); img.decoding = 'async'; img.src = url; }
}
