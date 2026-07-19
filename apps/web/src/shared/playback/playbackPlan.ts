import { seededShuffle } from '../util/shuffle.js';
import type { PauseDuration, PlaybackItem, PlaybackOrder, PlaybackSettings, SpeakOrderOverride } from './types.js';

/**
 * Pure playback planning — the testable seam of Parrot Mode.
 *
 * Everything about WHAT to play (and in what order, at what rate, with what silences) lives here as
 * pure functions (no React, no TTS, no timers), so the React engine ({@link useParrotPlayback}) stays
 * a thin runner and every tuning knob has ONE home:
 *   1. `buildOrder` / `planNextCycle` — the sequence of item indices to walk (sequential vs a seeded
 *      shuffle), including a fresh cycle for Loop that avoids an immediate boundary repeat.
 *   2. `buildUtterancePlan` — the flat speak/pause steps for a SINGLE item (repeat, translation,
 *      speed, pause durations).
 *   3. `PAUSE_PRESETS` — the single mapping of Short/Normal/Long → concrete millisecond silences.
 */

/** Concrete silences (ms) for one pause preset. `betweenItems` is applied by the engine. */
export interface PausePlan {
  /** Between a target line and its translation. */
  afterTarget: number;
  /** Between repeats of the same item. */
  betweenRepeats: number;
  /** Before moving to the next item (and between loop cycles). */
  betweenItems: number;
}

/**
 * The ONE pause-duration mapping (Task 4). Short ≈ 300–500 ms, Normal ≈ 700–1000 ms, Long ≈
 * 1400–1800 ms. Keep every timing value here — never scatter literals across components.
 */
export const PAUSE_PRESETS: Record<PauseDuration, PausePlan> = {
  short: { afterTarget: 300, betweenRepeats: 400, betweenItems: 500 },
  normal: { afterTarget: 700, betweenRepeats: 850, betweenItems: 1000 },
  long: { afterTarget: 1400, betweenRepeats: 1600, betweenItems: 1800 },
};

/** Resolve a pause preset, defaulting safely to Normal for any unexpected value. */
export function pausePlan(d: PauseDuration): PausePlan {
  return PAUSE_PRESETS[d] ?? PAUSE_PRESETS.normal;
}

/** One executable step: speak a line (at a rate), or wait. `role` lets the UI/tests reason about it. */
export type UtteranceStep =
  | { kind: 'speak'; text: string; lang: string; role: 'target' | 'translation'; rate: number }
  | { kind: 'pause'; ms: number };

/**
 * The order of item indices to play: identity for sequential, a seeded shuffle for random. When
 * `avoidFirst` is given (starting a fresh random cycle) and the shuffle would repeat that item first,
 * swap the first two so the new cycle never opens with the item the previous cycle just ended on —
 * while staying a complete permutation (every item appears exactly once).
 */
export function buildOrder(count: number, order: PlaybackOrder, seed: number, avoidFirst?: number): number[] {
  const seq = Array.from({ length: Math.max(0, count) }, (_, i) => i);
  if (order !== 'random') return seq;
  const shuffled = seededShuffle(seq, seed);
  if (avoidFirst !== undefined && shuffled.length > 1 && shuffled[0] === avoidFirst) {
    [shuffled[0], shuffled[1]] = [shuffled[1]!, shuffled[0]!];
  }
  return shuffled;
}

/** Result of reaching the end of a cycle: finish (Loop OFF), or the next cycle's order (Loop ON). */
export type NextCycle = { finished: true } | { finished: false; order: number[] };

/**
 * Decide what happens after the final item of a cycle. Loop OFF (or an empty list) → finished. Loop
 * ON → the next cycle's order: sequential restarts from the first item; random reshuffles, avoiding an
 * immediate repeat of the item the previous cycle ended on.
 */
export function planNextCycle(settings: PlaybackSettings, prevOrder: number[], count: number, nextSeed: number): NextCycle {
  if (!settings.loop || count <= 0) return { finished: true };
  if (settings.order === 'sequential') return { finished: false, order: buildOrder(count, 'sequential', nextSeed) };
  const lastItem = prevOrder[prevOrder.length - 1];
  return { finished: false, order: buildOrder(count, 'random', nextSeed, lastItem) };
}

/**
 * The flat plan for one item, repeated `repeat` times with a beat between repeats. Whether — and in
 * which order — the translation is spoken is decided by the optional per-surface `order` OVERRIDE, and
 * otherwise by the shared `settings.translation` (target → translation). A translation is only ever
 * spoken when the item actually carries one. `order.translationFirst` flips to translation → target.
 * Each line keeps its OWN locale (`targetLang` for the target, `translationLang` for the translation)
 * so voices never cross. Every speak step carries the current playback `speed` for the TTS layer.
 */
export function buildUtterancePlan(item: PlaybackItem, settings: PlaybackSettings, order?: SpeakOrderOverride): UtteranceStep[] {
  const steps: UtteranceStep[] = [];
  const p = pausePlan(settings.pause);
  const rate = settings.speed;
  const translationOn = (order ? order.translation : settings.translation) && !!item.translation;
  const translationFirst = order?.translationFirst ?? false;
  const repeat = Math.max(1, settings.repeat);
  const target: UtteranceStep = { kind: 'speak', text: item.target, lang: item.targetLang, role: 'target', rate };
  const translation: UtteranceStep = { kind: 'speak', text: item.translation ?? '', lang: item.translationLang ?? item.targetLang, role: 'translation', rate };
  for (let r = 0; r < repeat; r++) {
    if (translationOn && translationFirst) {
      steps.push(translation, { kind: 'pause', ms: p.afterTarget }, target);
    } else if (translationOn) {
      steps.push(target, { kind: 'pause', ms: p.afterTarget }, translation);
    } else {
      steps.push(target);
    }
    if (r < repeat - 1) steps.push({ kind: 'pause', ms: p.betweenRepeats });
  }
  return steps;
}

/** Sleep-timer selection (minutes) → milliseconds. */
export function sleepDurationMs(minutes: number): number {
  return Math.max(0, minutes) * 60_000;
}

/** Format a remaining duration as compact `M:SS` (e.g. 14:32, 9:05). Clamped at zero. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
