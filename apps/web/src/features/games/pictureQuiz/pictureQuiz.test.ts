import { describe, expect, it } from 'vitest';
import { buildRounds, buildSession } from './rounds.js';
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

describe('Picture Quiz sessions (Beta polish)', () => {
  it('builds exactly `size` rounds when enough words exist', () => {
    expect(buildSession(WORDS, 5).length).toBe(5);
    expect(buildSession(WORDS, 8).length).toBe(8);
  });

  it('never repeats a concept within a session', () => {
    for (let n = 0; n < 30; n++) {
      const ids = buildSession(WORDS, 6).map((r) => r.word.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('clamps the size to the available words (future-proof for 100 → 1500)', () => {
    expect(buildSession(WORDS, 999).length).toBe(WORDS.length);
    expect(buildSession(WORDS, 0).length).toBe(1); // always at least one question
  });

  it('each session round is still a valid 4-option question with one correct, no dup emoji', () => {
    for (const r of buildSession(WORDS, 8)) {
      expect(r.options.length).toBe(4);
      expect(r.options.filter((o) => o.id === r.word.id).length).toBe(1);
      expect(new Set(r.options.map((o) => o.emoji)).size).toBe(4);
    }
  });
});
