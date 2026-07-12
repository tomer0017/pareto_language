import { describe, expect, it } from 'vitest';
import { buildSentenceDeck, shuffledDeck } from './flashcards.js';
import { missionsFor } from '../bootcamp/registry.js';

/**
 * Sentence flashcards reuse the canonical mission sentences — these tests prove the deck is NOT a
 * hand-maintained copy (every card id resolves to a real mission item), shuffles safely, and stays
 * per-language (no English leak into French).
 */

describe('buildSentenceDeck — canonical, deduped, per-language', () => {
  it('English deck is non-empty and every card maps to a real English mission item', () => {
    const deck = buildSentenceDeck('en');
    expect(deck.length).toBeGreaterThan(20);
    const enIds = new Set(Object.values(missionsFor('en')).flatMap((d) => d.items.map((i) => i.id)));
    for (const c of deck) {
      expect(enIds.has(c.id)).toBe(true);
      expect(c.target.length).toBeGreaterThan(0);
      expect(c.meaning.en && c.meaning.he).toBeTruthy();
    }
  });

  it('has no duplicate ids (recovery tools shared across missions appear once)', () => {
    const deck = buildSentenceDeck('en');
    expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
  });

  it('leads with the recovery survival kit, then mission sentences', () => {
    const deck = buildSentenceDeck('en');
    expect(deck[0]!.id).toContain('.phrase.recovery.');
    expect(deck.some((c) => !c.id.includes('.phrase.recovery.'))).toBe(true);
  });

  it('French deck is French only — never leaks English target text', () => {
    const deck = buildSentenceDeck('fr');
    expect(deck.length).toBeGreaterThan(10);
    for (const c of deck) expect(c.id.startsWith('fr.')).toBe(true);
  });

  it('an unbuilt language yields an empty deck (honest empty state, no fallback)', () => {
    expect(buildSentenceDeck('xx')).toEqual([]);
  });
});

describe('shuffledDeck', () => {
  const deck = buildSentenceDeck('en');
  it('preserves every card exactly once', () => {
    const out = shuffledDeck(deck, 7);
    expect(out.map((c) => c.id).sort()).toEqual(deck.map((c) => c.id).sort());
  });
  it('is deterministic per seed and varies across seeds', () => {
    expect(shuffledDeck(deck, 3).map((c) => c.id)).toEqual(shuffledDeck(deck, 3).map((c) => c.id));
    expect(shuffledDeck(deck, 1).map((c) => c.id)).not.toEqual(shuffledDeck(deck, 2).map((c) => c.id));
  });
  it('does not mutate the source deck', () => {
    const before = deck.map((c) => c.id);
    shuffledDeck(deck, 9);
    expect(deck.map((c) => c.id)).toEqual(before);
  });
});
