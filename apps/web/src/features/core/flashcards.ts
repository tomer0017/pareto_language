import type { LocalizedText } from '@ready/content-schema';
import { sentenceCatalog } from './phraseGroups.js';
import { seededShuffle } from '../../shared/util/shuffle.js';

/**
 * Sentence flashcards (Part 2) — a REVIEW surface over the SAME canonical mission sentences the
 * Bootcamp and Core Phrases already teach. This file is pure (no store, no React) so the deck is
 * unit-testable and language-agnostic: it reads a learning language's own missions via `missionsFor`
 * and NEVER duplicates or hardcodes sentence text. A language with no missions yields an empty deck
 * (the UI shows an honest empty state) — never an English fallback.
 */

export interface FlashCard {
  id: string;              // the canonical mission item id ({lang}.phrase.* / {lang}.reply.*)
  target: string;          // the sentence in the learning language
  meaning: LocalizedText;  // gloss ({en, he, …})
  missionDay: number;      // which mission it came from (for grouping / context)
}

/** Which review direction a card is being shown in. Both are pedagogically useful:
 *  - `target-first`: read/hear the target sentence → recall its meaning (comprehension).
 *  - `meaning-first`: read the meaning → recall the useful target sentence (production/recognition). */
export type FlashDirection = 'target-first' | 'meaning-first';

/**
 * The sentence deck for a learning language — the canonical catalog (`sentenceCatalog`) flattened to
 * cards, in the same order: each mission's own sentences in journey order, then the shared
 * conversation-help phrases LAST. One card per canonical sentence, so flashcards, the library, Listen
 * and every "N core sentences" count are the SAME content and the SAME number.
 */
export function buildSentenceDeck(lang: string): FlashCard[] {
  const catalog = sentenceCatalog(lang);
  return catalog.groups.flatMap((group) => group.items.map((item) => ({
    id: item.id,
    target: item.text,
    meaning: item.meaning,
    missionDay: group.mission?.day ?? catalog.firstDay.get(item.id) ?? 0,
  })));
}

/** A shuffled copy of a deck (seeded → deterministic in tests, stable per session in the UI).
 *  Never mutates the input; every card is preserved exactly once. */
export function shuffledDeck(deck: FlashCard[], seed: number): FlashCard[] {
  return seededShuffle(deck, seed);
}

/** Next card index with wrap-around (pure → the navigation bug is unit-testable, not gesture-only).
 *  `delta` is +1 (next) or -1 (prev); the result always stays within `[0, len)`. */
export function nextIndex(i: number, delta: number, len: number): number {
  if (len <= 0) return 0;
  return (((i + delta) % len) + len) % len;
}

/** What a horizontal drag of `dx` pixels means. Swipe LEFT (dx negative) → next card; swipe RIGHT
 *  (dx positive) → previous; anything under the threshold is a tap (→ flip), not a swipe. */
export type SwipeOutcome = 'next' | 'prev' | 'none';
export function swipeOutcome(dx: number, threshold = 80): SwipeOutcome {
  if (dx <= -threshold) return 'next';
  if (dx >= threshold) return 'prev';
  return 'none';
}
