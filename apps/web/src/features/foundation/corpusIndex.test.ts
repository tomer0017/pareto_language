import { describe, it, expect } from 'vitest';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { alternateSenses, buildCorpusIndex, normalizeKey, segmentText, senseLabel } from './corpusIndex.js';

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

describe('homograph resolution (pos-scoped surfaces share one written form)', () => {
  // Two concepts, same surface "book", different POS — the real corpus shape after the pos-scoped
  // uniqueness change. Verb outranks noun (lower rank = higher communicative value).
  const bookVerb = w('book', { conceptId: 'concept.word.book', pos: 'verb', rank: 138, meaning: { en: 'reserve', he: 'להזמין מראש' } });
  const bookNoun = w('book', { conceptId: 'concept.word.book-noun', pos: 'noun', rank: 427, meaning: { en: 'book', he: 'ספר' } });
  const orangeAdj = w('orange', { conceptId: 'concept.word.orange', pos: 'adj', rank: 429, meaning: { en: 'orange', he: 'כתום' } });
  const orangeNoun = w('orange', { conceptId: 'concept.word.orange-fruit', pos: 'noun', rank: 503, meaning: { en: 'orange', he: 'תפוז' } });

  it('keeps EVERY sense of a homograph surface (nothing silently dropped)', () => {
    const idx = buildCorpusIndex([bookVerb, bookNoun]);
    const senses = idx.sensesBySurface.get('book');
    expect(senses?.map((s) => s.conceptId)).toEqual(['concept.word.book', 'concept.word.book-noun']);
  });

  it('selects the primary sense deterministically — independent of input order (no first-match)', () => {
    // Both orderings must yield the SAME primary; the old iteration-order behavior would not.
    expect(buildCorpusIndex([bookVerb, bookNoun]).bySurface.get('book')?.conceptId).toBe('concept.word.book');
    expect(buildCorpusIndex([bookNoun, bookVerb]).bySurface.get('book')?.conceptId).toBe('concept.word.book');
    expect(buildCorpusIndex([orangeNoun, orangeAdj]).bySurface.get('orange')?.pos).toBe('adj');
    expect(buildCorpusIndex([orangeAdj, orangeNoun]).bySurface.get('orange')?.pos).toBe('adj');
  });

  it('tags a matched homograph span with all its senses so the sheet can offer the other meaning', () => {
    const idx = buildCorpusIndex([bookVerb, bookNoun, w('read', { pos: 'verb', rank: 90 })]);
    const seg = segmentText('I read a book here', idx).find((s) => s.text === 'book');
    expect(seg?.word?.conceptId).toBe('concept.word.book'); // primary
    expect(seg?.senses?.map((s) => s.pos)).toEqual(['verb', 'noun']); // both reachable
  });

  it('leaves single-sense words without a senses list (only homographs carry it)', () => {
    const idx = buildCorpusIndex([bookVerb, bookNoun, w('read', { pos: 'verb', rank: 90 })]);
    const seg = segmentText('read', idx).find((s) => s.text === 'read');
    expect(seg?.word?.conceptId).toBe('concept.word.read');
    expect(seg?.senses).toBeUndefined();
  });

  describe('disambiguation chip (alternateSenses + senseLabel)', () => {
    const senses = [bookVerb, bookNoun];

    it('offers exactly the OTHER sense(s) — the correct conceptId, never the current one', () => {
      // Primary open (verb) → chip offers the noun.
      expect(alternateSenses(bookVerb, senses).map((s) => s.conceptId)).toEqual(['concept.word.book-noun']);
      // After switching to the noun → chip offers the verb (both directions reachable).
      expect(alternateSenses(bookNoun, senses).map((s) => s.conceptId)).toEqual(['concept.word.book']);
      // Never lists the sense already on screen.
      expect(alternateSenses(bookVerb, senses).some((s) => s.conceptId === bookVerb.conceptId)).toBe(false);
    });

    it('labels each chip with the sense\'s OWN meaning, not a generic label', () => {
      expect(senseLabel(bookNoun, 'he')).toBe('ספר');
      expect(senseLabel(bookVerb, 'he')).toBe('להזמין מראש');
      expect(senseLabel(orangeNoun, 'he')).toBe('תפוז');
      expect(senseLabel(orangeAdj, 'he')).toBe('כתום');
      expect(senseLabel(bookNoun, 'en')).toBe('book'); // falls back to the en gloss for an en UI
    });

    it('returns no alternates for a single-sense (non-homograph) word', () => {
      expect(alternateSenses(w('read'), undefined)).toEqual([]);
      expect(alternateSenses(w('read'), [w('read')])).toEqual([]);
    });
  });
});
