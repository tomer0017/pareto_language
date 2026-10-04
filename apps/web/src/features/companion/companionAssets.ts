import type { CompanionStage } from './companionModel.js';

/**
 * The ONE place the companion's artwork is named. Screens ask for "stage 3, compact, happy" — never
 * for a file. Replacing the art (clean transparent renders, per-mood poses, sprite sheets, Lottie /
 * Rive) is a change to this table and, for animated formats, to `CompanionFigure`; no screen and no
 * logic changes.
 *
 * Current art: square crops of the approved concept illustration, one per stage. They are NOT
 * transparent — they carry some of the sheet's scenery — so the figure feathers their edges into the
 * page (`transparent: false`). They are stand-ins, not final production art. A final isolated render
 * sets `transparent: true` and is then shown with no feathering at all.
 *
 * Poses: a stage may name a different image per pose (`poses.happy`, `poses.thinking`, …). Any pose
 * without its own image falls back to the stage's base image, where motion alone carries the mood.
 *
 * Naming: `public/companion/stage-<n>.png` (full) and `stage-<n>-avatar.png` (compact, only where
 * the full scene is too busy to read small — today that is Stage 6's living room).
 */
export type ArtVariant = 'full' | 'compact';
/** The poses final artwork is expected to supply. `idle` is the base image. */
export const ART_POSES = ['idle', 'happy', 'thinking', 'listening', 'celebrate', 'encouraging', 'talking'] as const;
export type ArtPose = (typeof ART_POSES)[number];

export interface StageArt {
  /** The full character — the companion's own page, the evolution reveal, celebrations. */
  full: string;
  /** The compact version for small placements. */
  compact: string;
  /** Intrinsic pixel size of the two images (they are square). */
  size: { full: number; compact: number };
  /** true once the art is an isolated render on a transparent background. */
  transparent?: boolean;
  /** Per-pose images, when they exist. Missing poses use `full` / `compact`. */
  poses?: Partial<Record<ArtPose, Partial<Record<ArtVariant, string>>>>;
}

export const COMPANION_ART: Record<CompanionStage, StageArt> = {
  1: { full: '/companion/stage-1.png', compact: '/companion/stage-1.png', size: { full: 210, compact: 210 } },
  2: { full: '/companion/stage-2.png', compact: '/companion/stage-2.png', size: { full: 250, compact: 250 } },
  3: { full: '/companion/stage-3.png', compact: '/companion/stage-3.png', size: { full: 250, compact: 250 } },
  4: { full: '/companion/stage-4.png', compact: '/companion/stage-4.png', size: { full: 285, compact: 285 } },
  5: { full: '/companion/stage-5.png', compact: '/companion/stage-5.png', size: { full: 310, compact: 310 } },
  // Stage 6's full scene is reserved for the big moments; ordinary UI shows the simplified crop.
  6: { full: '/companion/stage-6.png', compact: '/companion/stage-6-avatar.png', size: { full: 417, compact: 215 } },
};

/** The image path for a stage / variant / pose, falling back to the stage's base image. */
export function artPath(stage: CompanionStage, variant: ArtVariant, pose: ArtPose = 'idle'): string {
  const art = COMPANION_ART[stage];
  return art.poses?.[pose]?.[variant] ?? art[variant];
}

/** Resolve a public path against the app's base, so it works on the deployed sub-path and offline. */
export function artUrl(stage: CompanionStage, variant: ArtVariant, base: string = import.meta.env.BASE_URL || '/', pose: ArtPose = 'idle'): string {
  return `${base.replace(/\/$/, '')}${artPath(stage, variant, pose)}`;
}

export const isTransparentArt = (stage: CompanionStage): boolean => COMPANION_ART[stage].transparent === true;
