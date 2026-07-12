/**
 * Swipe Recall spaced re-queue engine (Task 9) — pure, deterministic, and unit-tested.
 *
 * The rule: a card the learner did NOT know must reappear, but never immediately — only after
 * roughly 10–15 other cards. A known card leaves the deck. This is the seam a real spaced-
 * repetition scheduler plugs into later (swap `reinsertGap` for an FSRS interval) WITHOUT
 * rewriting the game: the game only ever asks "what's next?" and reports "known / unknown".
 */
export type SwipeResult = 'known' | 'unknown';

/** What a Swipe Recall card renders (Part-E fix). */
export interface CardFace {
  /** The concept meaning in the learner's app language — shown in EVERY state so an ambiguous icon
   *  (🚻 = toilets? bathroom? public facilities?) is never a guessing game. */
  meaning: string;
  /** The target-language word — `null` until the learner has tried to recall it (press-and-hold
   *  reveal). Hiding it before reveal is the whole point: the game trains recall, not reading. */
  target: string | null;
}

/** Pure card-face rule (unit-tested): meaning is always visible; the target word only after reveal. */
export function cardFace(word: string, meaning: string, revealed: boolean): CardFace {
  return { meaning, target: revealed ? word : null };
}

export const DEFAULT_GAP = { min: 10, max: 15 } as const;

/** Where an unknown card re-enters the queue: `gap` cards from the front (clamped to the deck).
 *  Injectable so tests are deterministic; defaults to a random point in the 10–15 window. */
export function reinsertGap(deckLength: number, gap = DEFAULT_GAP): number {
  const span = gap.max - gap.min;
  const g = gap.min + Math.floor(Math.random() * (span + 1));
  return Math.min(g, deckLength); // never past the end
}

/**
 * Advance the deck after swiping the current (front) card.
 * `queue[0]` is the current card id.
 *   known   → drop it.
 *   unknown → move it back `gapFn(remaining)` positions (≈10–15 cards later, never next).
 * Returns a NEW array (no mutation) so it slots straight into React state.
 */
export function applySwipe(
  queue: readonly string[],
  result: SwipeResult,
  gapFn: (remaining: number) => number = (n) => reinsertGap(n),
): string[] {
  if (queue.length === 0) return [];
  const current = queue[0]!;
  const rest = queue.slice(1);
  if (result === 'known') return rest;
  // Unknown: re-insert `current` after `gap` of the remaining cards (or at the end if the deck
  // is short). Guaranteed at least one card in front of it whenever any remain, so never immediate.
  const gap = Math.min(Math.max(gapFn(rest.length), rest.length === 0 ? 0 : 1), rest.length);
  const next = [...rest];
  next.splice(gap, 0, current);
  return next;
}
