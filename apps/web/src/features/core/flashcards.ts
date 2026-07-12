import type { LocalizedText } from '@ready/content-schema';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionsFor } from '../bootcamp/registry.js';
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
 * The canonical sentence deck for a learning language, in mission order, deduped by id. Recovery
 * tools come first (they recur across every mission), then each mission's own sentences — mirroring
 * how Core Phrases already groups them, so flashcards and the phrase list are the SAME content.
 */
export function buildSentenceDeck(lang: string): FlashCard[] {
  const missions = missionsFor(lang);
  const seen = new Set<string>();
  const recovery: FlashCard[] = [];
  const rest: FlashCard[] = [];
  for (const plan of BOOTCAMP_PLAN) {
    const day = missions[plan.day];
    if (!day) continue;
    for (const item of day.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const card: FlashCard = { id: item.id, target: item.text, meaning: item.meaning, missionDay: plan.day };
      if (item.id.includes('.phrase.recovery.')) recovery.push(card);
      else rest.push(card);
    }
  }
  return [...recovery, ...rest];
}

/** A shuffled copy of a deck (seeded → deterministic in tests, stable per session in the UI).
 *  Never mutates the input; every card is preserved exactly once. */
export function shuffledDeck(deck: FlashCard[], seed: number): FlashCard[] {
  return seededShuffle(deck, seed);
}
