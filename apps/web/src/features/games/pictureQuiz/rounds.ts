import type { GameWord } from '../types.js';

/** A Picture Quiz round: one target word + four emoji options (one correct, three distractors). */
export interface Round {
  word: GameWord;
  options: GameWord[];
}

/** Default questions per session. NOT hardcoded at call sites — overridable per game/config, and
 *  always clamped to the number of available words, so the same engine serves Core 100 → 500 → 1500. */
export const DEFAULT_SESSION_SIZE = 10;

function shuffle<T>(arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

/** Four options for a word: the target + three OTHER words' emoji (deduped so no picture repeats). */
function makeOptions(word: GameWord, pool: GameWord[]): GameWord[] {
  const distractors = shuffle(pool.filter((w) => w.id !== word.id && w.emoji !== word.emoji)).slice(0, 3);
  return shuffle([word, ...distractors]);
}

/**
 * Pure round construction (React/store-free → unit-testable). Words without an emoji are skipped so
 * options are never blank.
 */
export function buildRounds(words: GameWord[]): Round[] {
  const pool = words.filter((w) => w.emoji);
  return pool.map((word) => ({ word, options: makeOptions(word, pool) }));
}

/**
 * A randomized game SESSION of `size` DISTINCT concepts (never repeats a concept within a session),
 * each rendered as a 4-option round. Distractors are drawn from the FULL pool so they stay varied.
 * `size` is clamped to what's available — future-proof for larger corpora.
 */
export function buildSession(words: GameWord[], size: number = DEFAULT_SESSION_SIZE): Round[] {
  const pool = words.filter((w) => w.emoji);
  const chosen = shuffle(pool).slice(0, Math.max(1, Math.min(size, pool.length)));
  return chosen.map((word) => ({ word, options: makeOptions(word, pool) }));
}
