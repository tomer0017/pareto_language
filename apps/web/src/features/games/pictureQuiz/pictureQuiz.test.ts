import { describe, expect, it } from 'vitest';
import { buildRounds } from './rounds.js';
import type { GameWord } from '../types.js';

const W = (id: string, word: string, emoji: string): GameWord => ({ id, word, translation: { en: word, he: word }, emoji });

const WORDS: GameWord[] = [
  W('a', 'nose', '👃'), W('b', 'leg', '🦵'), W('c', 'eye', '👁️'), W('d', 'ear', '👂'),
  W('e', 'dog', '🐶'), W('f', 'cat', '🐱'), W('g', 'car', '🚗'), W('h', 'bus', '🚌'),
];

/** Task D2 — Picture Quiz round construction (pure; the React shell is thin over this). */
describe('Picture Quiz rounds', () => {
  it('builds one round per word', () => {
    expect(buildRounds(WORDS).length).toBe(WORDS.length);
  });

  it('each round has exactly 4 options with one correct and three distractors', () => {
    for (const r of buildRounds(WORDS)) {
      expect(r.options.length).toBe(4);
      expect(r.options.filter((o) => o.id === r.word.id).length).toBe(1);
      expect(r.options.filter((o) => o.id !== r.word.id).length).toBe(3);
      expect(r.options).toContainEqual(r.word);
    }
  });

  it('never shows a duplicate emoji within a question', () => {
    for (const r of buildRounds(WORDS)) {
      const emojis = r.options.map((o) => o.emoji);
      expect(new Set(emojis).size).toBe(emojis.length);
    }
  });

  it('skips words with no emoji (no blank options)', () => {
    const withBlank = [...WORDS, { id: 'x', word: 'blank', translation: { en: 'x', he: 'x' }, emoji: '' }];
    for (const r of buildRounds(withBlank)) {
      expect(r.options.every((o) => o.emoji)).toBe(true);
    }
  });
});
