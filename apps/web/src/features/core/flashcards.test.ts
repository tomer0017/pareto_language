import { describe, expect, it } from 'vitest';
import { buildSentenceDeck, shuffledDeck, nextIndex, swipeOutcome } from './flashcards.js';
import { resolveLearningItem } from '../../shared/i18n/display.js';
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

describe('flashcard navigation (regression: cannot get stuck on one card)', () => {
  it('nextIndex advances with wrap-around and never leaves the valid range', () => {
    expect(nextIndex(0, 1, 5)).toBe(1);       // next
    expect(nextIndex(4, 1, 5)).toBe(0);       // wraps forward past the end
    expect(nextIndex(0, -1, 5)).toBe(4);      // wraps backward from the first card
    expect(nextIndex(2, -1, 5)).toBe(1);      // previous
  });

  it('is safe for degenerate decks (0 or 1 card)', () => {
    expect(nextIndex(0, 1, 0)).toBe(0);
    expect(nextIndex(0, 1, 1)).toBe(0);
    expect(nextIndex(0, -1, 1)).toBe(0);
  });

  it('stepping forward visits every card exactly once, then returns to start (no stuck card)', () => {
    const len = 7;
    let i = 0;
    const visited: number[] = [i];
    for (let step = 0; step < len - 1; step++) { i = nextIndex(i, 1, len); visited.push(i); }
    expect(new Set(visited).size).toBe(len);   // all distinct — never stuck
    expect(nextIndex(i, 1, len)).toBe(0);      // wraps back to the beginning
  });

  it('swipeOutcome maps drags to navigation (left → next, right → prev, small → flip/none)', () => {
    expect(swipeOutcome(-120)).toBe('next');   // swipe left
    expect(swipeOutcome(120)).toBe('prev');    // swipe right
    expect(swipeOutcome(-80)).toBe('next');    // exactly the threshold commits
    expect(swipeOutcome(80)).toBe('prev');
    expect(swipeOutcome(-30)).toBe('none');    // a tap, not a swipe
    expect(swipeOutcome(0)).toBe('none');
  });
});

describe('flashcard audio (regression: TTS uses the right sentence + learning locale)', () => {
  it('the audio model speaks the target sentence in the learning language (en)', () => {
    const card = buildSentenceDeck('en')[3]!;
    const m = resolveLearningItem({ id: card.id, target: card.target, meaning: card.meaning }, 'he', 'en');
    expect(m.audioText).toBe(card.target); // the sentence itself, not the gloss
    expect(m.audioLang).toBe('en');        // learning language drives voice selection
  });

  it('French cards speak French, regardless of the app (UI) language', () => {
    const card = buildSentenceDeck('fr')[2]!;
    const m = resolveLearningItem({ id: card.id, target: card.target, meaning: card.meaning }, 'en', 'fr');
    expect(m.audioText).toBe(card.target);
    expect(m.audioLang).toBe('fr'); // never the UI language
  });
});
