import type { FlashCard } from './flashcards.js';

/**
 * Quick Review — which sentences are worth refreshing, derived ONLY from the learner's real review
 * log (the append-only events every mission drill already writes). PURE and unit-tested.
 *
 * "Practiced" means: the learner answered at least one drill on that sentence. Nothing is inferred
 * from exposure, and with no log there is nothing to review (the UI shows a neutral state).
 */

/** The slice of a review event this module needs (structurally compatible with ReviewEvent). */
export interface ReviewLogEntry {
  itemId: string;
  outcome: string;
  at: string;
}

const isMiss = (outcome: string): boolean => outcome !== 'pass';

/** Maps a logged item id to the canonical sentence it counts for (identity when there is no alias). */
export type Canonicalize = (id: string) => string;
const same: Canonicalize = (id) => id;

/**
 * Canonical sentences the learner has actually drilled at least once. A drill logged under an alias
 * id (the same wording re-declared by a later mission) counts for its canonical sentence — once.
 */
export function practicedIds(deck: readonly FlashCard[], log: readonly ReviewLogEntry[], canonical: Canonicalize = same): Set<string> {
  const inDeck = new Set(deck.map((c) => c.id));
  return new Set(log.map((e) => canonical(e.itemId)).filter((id) => inDeck.has(id)));
}

/**
 * Up to `n` practiced sentences, the ones most worth a refresh first: a sentence whose LATEST answer
 * was a miss beats one answered correctly; within each, the one practiced longest ago comes first.
 */
export function pickReviewCards(deck: readonly FlashCard[], log: readonly ReviewLogEntry[], n = 5, canonical: Canonicalize = same): FlashCard[] {
  const latest = new Map<string, ReviewLogEntry>();
  for (const e of log) {
    const id = canonical(e.itemId);
    const prev = latest.get(id);
    if (!prev || Date.parse(e.at) >= Date.parse(prev.at)) latest.set(id, e);
  }
  return deck
    .filter((c) => latest.has(c.id))
    .map((card) => ({ card, last: latest.get(card.id)! }))
    .sort((a, b) => Number(isMiss(b.last.outcome)) - Number(isMiss(a.last.outcome)) || Date.parse(a.last.at) - Date.parse(b.last.at))
    .slice(0, Math.max(0, n))
    .map((x) => x.card);
}
