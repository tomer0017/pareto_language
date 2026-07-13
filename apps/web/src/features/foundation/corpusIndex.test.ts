import { describe, it, expect } from 'vitest';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { buildCorpusIndex, normalizeKey, segmentText } from './corpusIndex.js';

const w = (word: string, over: Partial<CoreWord> = {}): CoreWord => ({
  id: `en.word.${word}`,
  conceptId: `concept.word.${word.replace(/\s+/g, '_')}`,
  word,
  meaning: { en: word, he: word },
  category: 'actions',
  pos: 'verb',
  tier: 1,
  rank: 100,
  skill: 'recall',
  ...over,
});

const index = buildCorpusIndex([w('pay'), w('help'), w('I'), w('card'), w('avoir besoin'), w('How many')]);

/** Which segment texts were marked tappable (had a matched Core word). */
const tappable = (text: string) => segmentText(text, index).filter((s) => s.word).map((s) => s.text);
/** Rebuild the original text from all segments (must be lossless). */
const rebuilt = (text: string) => segmentText(text, index).map((s) => s.text).join('');

describe('normalizeKey', () => {
  it('lowercases, drops punctuation, collapses to space-joined word tokens', () => {
    expect(normalizeKey('How many?')).toBe('how many');
    expect(normalizeKey('Here you go.')).toBe('here you go');
    expect(normalizeKey("I’m")).toBe("i'm");
  });
});

describe('segmentText (Universal Tap tokenizer)', () => {
  it('marks a whole-word Core match, case-insensitively', () => {
    expect(tappable('I want to pay')).toEqual(['I', 'pay']);
  });

  it('never matches a substring (card ≠ cardboard, pay ≠ payment)', () => {
    expect(tappable('a cardboard payment')).toEqual([]);
  });

  it('greedily prefers the longer multi-word entry over its parts', () => {
    // "avoir besoin" is an entry; "avoir"/"besoin" alone are not here.
    expect(tappable("j'ai avoir besoin de ça")).toEqual(['avoir besoin']);
  });

  it('preserves original spacing and punctuation exactly (lossless)', () => {
    const s = 'Can I pay by card?';
    expect(rebuilt(s)).toBe(s);
    expect(tappable(s)).toEqual(['I', 'pay', 'card']);
  });

  it('returns a single plain segment when nothing matches', () => {
    const segs = segmentText('xyz qwerty', index);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toEqual({ text: 'xyz qwerty' });
  });
});
