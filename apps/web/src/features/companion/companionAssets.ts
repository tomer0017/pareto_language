import type { CompanionStage } from './companionModel.js';

/**
 * The ONE place the companion's artwork is named. Screens ask for "stage 3, compact" — never for a
 * file. Replacing the art (clean transparent renders, sprite sheets, Lottie / Rive) is a change to
 * this table and, for animated formats, to `CompanionAvatar`; no screen and no logic changes.
 *
 * Current art: square crops of the approved concept illustration (the evolution sheet), one per
 * stage. They carry a little of the sheet's scenery, so the avatar fades their edges with a mask.
 * They are stand-ins for final isolated assets, not final production art.
 *
 * Naming: `public/companion/stage-<n>.png` (full) and `stage-<n>-avatar.png` (compact, only where
 * the full scene is too busy for a small circle — today that is the Chatterbox's living room).
 */
export interface StageArt {
  /** The full character — the companion page, the evolution reveal, celebrations. */
  full: string;
  /** The compact version for cards and small reactions. */
  compact: string;
  /** Intrinsic pixel size of the two images (they are square). */
  size: { full: number; compact: number };
}

export const COMPANION_ART: Record<CompanionStage, StageArt> = {
  1: { full: '/companion/stage-1.png', compact: '/companion/stage-1.png', size: { full: 210, compact: 210 } },
  2: { full: '/companion/stage-2.png', compact: '/companion/stage-2.png', size: { full: 250, compact: 250 } },
  3: { full: '/companion/stage-3.png', compact: '/companion/stage-3.png', size: { full: 250, compact: 250 } },
  4: { full: '/companion/stage-4.png', compact: '/companion/stage-4.png', size: { full: 285, compact: 285 } },
  5: { full: '/companion/stage-5.png', compact: '/companion/stage-5.png', size: { full: 310, compact: 310 } },
  // The Chatterbox's full scene (phone, headphones, TV, popcorn) is reserved for the big moments;
  // ordinary UI shows the simplified head-and-phone crop.
  6: { full: '/companion/stage-6.png', compact: '/companion/stage-6-avatar.png', size: { full: 417, compact: 215 } },
};

export type ArtVariant = 'full' | 'compact';

/** Resolve a public path against the app's base, so it works on the deployed sub-path and offline. */
export function artUrl(stage: CompanionStage, variant: ArtVariant, base: string = import.meta.env.BASE_URL || '/'): string {
  const path = COMPANION_ART[stage][variant];
  return `${base.replace(/\/$/, '')}${path}`;
}
