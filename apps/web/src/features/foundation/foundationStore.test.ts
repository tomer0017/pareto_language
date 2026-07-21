import { describe, it, expect, beforeEach } from 'vitest';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { useFoundationStore } from './foundationStore.js';

const w = (slug: string): CoreWord => ({
  id: `en.word.${slug}`,
  conceptId: `concept.word.${slug}`,
  word: slug,
  meaning: { en: slug, he: slug },
  category: 'actions',
  pos: 'verb',
  tier: 1,
  rank: 100,
  skill: 'recall',
});

const deck = [w('a'), w('b'), w('c')];

describe('foundationStore guided session', () => {
  beforeEach(() => useFoundationStore.getState().close());

  it('opens a guided session at the given index (the mission "Learn now")', () => {
    useFoundationStore.getState().openSession(deck, 1);
    const s = useFoundationStore.getState();
    expect(s.open).toBe(true);
    expect(s.target).toBeNull();
    expect(s.session).toEqual({ words: deck, index: 1 });
  });

  it('clamps a start index into range and does nothing for an empty deck', () => {
    useFoundationStore.getState().openSession(deck, 99);
    expect(useFoundationStore.getState().session?.index).toBe(2);
    useFoundationStore.getState().close();
    useFoundationStore.getState().openSession([], 0);
    expect(useFoundationStore.getState().open).toBe(false);
  });

  it('sessionGo moves within bounds only', () => {
    useFoundationStore.getState().openSession(deck, 0);
    useFoundationStore.getState().sessionGo(-1);
    expect(useFoundationStore.getState().session?.index).toBe(0); // clamped at start
    useFoundationStore.getState().sessionGo(1);
    expect(useFoundationStore.getState().session?.index).toBe(1);
    useFoundationStore.getState().sessionGo(5);
    expect(useFoundationStore.getState().session?.index).toBe(2); // clamped at end
  });

  it('openWord (Universal Tap) clears any session, and close resets everything', () => {
    useFoundationStore.getState().openSession(deck, 0);
    useFoundationStore.getState().openWord(w('x'));
    let s = useFoundationStore.getState();
    expect(s.session).toBeNull();
    expect(s.target?.conceptId).toBe('concept.word.x');
    useFoundationStore.getState().close();
    s = useFoundationStore.getState();
    expect(s.open).toBe(false);
    expect(s.target).toBeNull();
    expect(s.session).toBeNull();
    expect(s.targetSenses).toBeNull();
  });

  it('openWord carries homograph senses (>1) but not a single-sense list', () => {
    const bookVerb = w('book');
    const bookNoun = { ...w('book'), conceptId: 'concept.word.book-noun' };
    useFoundationStore.getState().openWord(bookVerb, 'book', [bookVerb, bookNoun]);
    let s = useFoundationStore.getState();
    expect(s.target?.conceptId).toBe('concept.word.book'); // primary shown = tapped sense
    expect(s.targetSenses?.map((x) => x.conceptId)).toEqual(['concept.word.book', 'concept.word.book-noun']);
    // A single-sense tap must NOT set targetSenses (no chip for ordinary words).
    useFoundationStore.getState().openWord(w('y'), 'y', [w('y')]);
    s = useFoundationStore.getState();
    expect(s.targetSenses).toBeNull();
  });
});
