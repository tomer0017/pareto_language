import { seededShuffle } from '../util/shuffle.js';
import type { PlaybackItem, PlaybackOrder, PlaybackSettings } from './types.js';

/**
 * Pure playback planning — the testable seam of Parrot Mode.
 *
 * Two decisions live here and NOWHERE else, so the React engine ({@link useParrotPlayback}) stays a
 * thin runner around them and every future tuning knob (pause duration, playback speed, loop-forever)
 * has an obvious home:
 *   1. `buildOrder` — the sequence of item indices to walk (sequential vs a seeded shuffle).
 *   2. `buildUtterancePlan` — the flat list of speak/pause steps for a SINGLE item, honouring the
 *      repeat count and the translation toggle.
 *
 * Keeping these pure (no React, no TTS, no timers) makes the whole playback contract unit-testable.
 */

/** Pause after the target line, before its translation (ms). */
export const PAUSE_AFTER_TARGET = 500;
/** Pause between repeats of the same item (ms). */
export const PAUSE_BETWEEN_REPEATS = 700;
/** Pause between two different items (ms). */
export const PAUSE_BETWEEN_ITEMS = 800;

/** One executable step: speak a line, or wait. `role` lets the UI/tests reason about what plays. */
export type UtteranceStep =
  | { kind: 'speak'; text: string; lang: string; role: 'target' | 'translation' }
  | { kind: 'pause'; ms: number };

/** The order of item indices to play: identity for sequential, a seeded shuffle for random. */
export function buildOrder(count: number, order: PlaybackOrder, seed: number): number[] {
  const seq = Array.from({ length: Math.max(0, count) }, (_, i) => i);
  return order === 'random' ? seededShuffle(seq, seed) : seq;
}

/**
 * The flat plan for one item: target → (pause → translation)? repeated `repeat` times, with a beat
 * between repeats. Translation is only spoken when the toggle is ON *and* the item actually carries
 * one. The engine simply executes each step in order.
 */
export function buildUtterancePlan(item: PlaybackItem, settings: PlaybackSettings): UtteranceStep[] {
  const steps: UtteranceStep[] = [];
  const speakTranslation = settings.translation && !!item.translation;
  const repeat = Math.max(1, settings.repeat);
  for (let r = 0; r < repeat; r++) {
    steps.push({ kind: 'speak', text: item.target, lang: item.targetLang, role: 'target' });
    if (speakTranslation) {
      steps.push({ kind: 'pause', ms: PAUSE_AFTER_TARGET });
      steps.push({ kind: 'speak', text: item.translation!, lang: item.translationLang ?? item.targetLang, role: 'translation' });
    }
    if (r < repeat - 1) steps.push({ kind: 'pause', ms: PAUSE_BETWEEN_REPEATS });
  }
  return steps;
}
