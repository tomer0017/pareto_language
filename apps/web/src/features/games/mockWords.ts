import type { LocalizedText } from '@ready/content-schema';
import type { GameWord, GameWordSource } from './types.js';

/**
 * DEMO data only (Tasks 8 & 9). This is intentionally tiny — the real corpus is the future Core
 * 1500. It exists so the game infrastructure is playable and reviewable today; when the pack ships,
 * a GameWordSource backed by the content pack replaces this file with zero component changes.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });

const w = (id: string, word: string, he: string, emoji: string): GameWord => ({
  id: `demo.word.${id}`,
  word,
  translation: T(he, word),
  emoji,
});

export const MOCK_WORDS: GameWord[] = [
  w('nose', 'Nose', 'אף', '👃'),
  w('leg', 'Leg', 'רגל', '🦵'),
  w('ear', 'Ear', 'אוזן', '👂'),
  w('eye', 'Eye', 'עין', '👁️'),
  w('hand', 'Hand', 'יד', '✋'),
  w('dog', 'Dog', 'כלב', '🐶'),
  w('cat', 'Cat', 'חתול', '🐱'),
  w('apple', 'Apple', 'תפוח', '🍎'),
  w('water', 'Water', 'מים', '💧'),
  w('house', 'House', 'בית', '🏠'),
  w('car', 'Car', 'מכונית', '🚗'),
  w('sun', 'Sun', 'שמש', '☀️'),
];

export const MOCK_WORD_SOURCE: GameWordSource = {
  id: 'demo',
  title: T('הדגמה — מילים בסיסיות', 'Demo — basic words'),
  words: () => MOCK_WORDS,
};
