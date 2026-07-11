import type { GameWord } from '../types.js';

/** A Picture Quiz round: one target word + four emoji options (one correct, three distractors). */
export interface Round {
  word: GameWord;
  options: GameWord[];
}

/**
 * Pure round construction (kept React/store-free so it is unit-testable in node). Distractors are
 * three OTHER words' emoji, deduped so a question never shows the same picture twice. Words without
 * an emoji are skipped so options are never blank.
 */
export function buildRounds(words: GameWord[]): Round[] {
  const pool = words.filter((w) => w.emoji);
  return pool.map((word) => {
    const distractors = pool
      .filter((w) => w.id !== word.id && w.emoji !== word.emoji)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [word, ...distractors].sort(() => Math.random() - 0.5);
    return { word, options };
  });
}
