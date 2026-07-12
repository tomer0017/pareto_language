import type { GameWord } from '../types.js';
import { shuffle, type RNG } from '../../../shared/util/shuffle.js';

/** A Picture Quiz round: one target word + four emoji options (one correct, three distractors). */
export interface Round {
  word: GameWord;
  options: GameWord[];
}

/** Default questions per session. NOT hardcoded at call sites — overridable per game/config, and
 *  always clamped to the number of available words, so the same engine serves Core 100 → 500 → 1500. */
export const DEFAULT_SESSION_SIZE = 10;

/** Four options for a word: the target + three OTHER words' emoji (deduped so no picture repeats).
 *  Uses the shared uniform shuffle so option positions are unbiased (Part 3). */
function makeOptions(word: GameWord, pool: GameWord[], rng: RNG = Math.random): GameWord[] {
  const distractors = shuffle(pool.filter((w) => w.id !== word.id && w.emoji !== word.emoji), rng).slice(0, 3);
  return shuffle([word, ...distractors], rng);
}

/**
 * Pure round construction (React/store-free → unit-testable). Words without an emoji are skipped so
 * options are never blank. `rng` is injectable for deterministic tests.
 */
export function buildRounds(words: GameWord[], rng: RNG = Math.random): Round[] {
  const pool = words.filter((w) => w.emoji);
  return pool.map((word) => ({ word, options: makeOptions(word, pool, rng) }));
}

/**
 * A randomized game SESSION of `size` DISTINCT concepts (never repeats a concept within a session),
 * each rendered as a 4-option round. Distractors are drawn from the FULL pool so they stay varied.
 * `size` is clamped to what's available — future-proof for larger corpora. `rng` is injectable.
 */
export function buildSession(words: GameWord[], size: number = DEFAULT_SESSION_SIZE, rng: RNG = Math.random): Round[] {
  const pool = words.filter((w) => w.emoji);
  const chosen = shuffle(pool, rng).slice(0, Math.max(1, Math.min(size, pool.length)));
  return chosen.map((word) => ({ word, options: makeOptions(word, pool, rng) }));
}

/** Position in a running session: which question (`i`) and how many correct so far (`score`). */
export interface QuizProgress {
  i: number;
  score: number;
}

/**
 * The one Continue/advance transition (pure → unit-testable; the component just wires it to the
 * button). Moves to the NEXT question exactly once, adding to the score only on a correct answer.
 * `i` always increments by exactly 1, so a session can never skip or repeat a question. When `i`
 * reaches `total`, the caller renders Victory. Rapid double-taps cannot double-advance in the UI
 * because Continue unmounts with the feedback the moment it fires (there is no button to tap twice).
 */
export function advanceQuiz(progress: QuizProgress, wasCorrect: boolean): QuizProgress {
  return { i: progress.i + 1, score: progress.score + (wasCorrect ? 1 : 0) };
}

/** The session is over (show Victory) once every question has been answered. */
export function isQuizComplete(progress: QuizProgress, total: number): boolean {
  return progress.i >= total;
}
