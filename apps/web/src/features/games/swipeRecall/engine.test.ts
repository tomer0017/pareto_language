import { describe, expect, it } from 'vitest';
import { applySwipe, cardFace, reinsertGap, DEFAULT_GAP } from './engine.js';

/**
 * Part-E regression — icon ambiguity. Before reveal the card must show the learner-language MEANING
 * (so 🚻 is unmistakably "toilets") but NOT the target-language word (recall, not reading). After
 * the press-and-hold reveal both are shown. This is the rule the card renders from.
 */
describe('Swipe Recall card face (Part E — meaning before reveal, word hidden)', () => {
  it('shows the meaning but hides the target word before reveal', () => {
    const face = cardFace('toilettes', 'שירותים', false);
    expect(face.meaning).toBe('שירותים');
    expect(face.target).toBeNull();
  });

  it('shows both the target word and the meaning after reveal', () => {
    const face = cardFace('toilettes', 'שירותים', true);
    expect(face.target).toBe('toilettes');
    expect(face.meaning).toBe('שירותים');
  });

  it('is app-language agnostic (whatever gloss the caller resolves is what is shown)', () => {
    expect(cardFace('toilettes', 'toilet', false).meaning).toBe('toilet');
    expect(cardFace('toilettes', 'toilette', false).meaning).toBe('toilette');
  });
});

describe('Swipe Recall re-queue engine', () => {
  const deck = ['a', 'b', 'c', 'd', 'e'];

  it('drops a known card from the front', () => {
    expect(applySwipe(deck, 'known')).toEqual(['b', 'c', 'd', 'e']);
  });

  it('never re-queues an unknown card immediately (at least one card in front)', () => {
    // gapFn forced to 1 would still put it behind ≥1 card; force 0 and verify it is clamped up.
    const next = applySwipe(deck, 'unknown', () => 0);
    expect(next[0]).not.toBe('a'); // 'a' is not the very next card
    expect(next).toContain('a');
    expect(next.length).toBe(deck.length); // unknown stays in the deck
  });

  it('re-inserts an unknown card ~gap positions back', () => {
    const next = applySwipe(deck, 'unknown', () => 3);
    // rest = [b,c,d,e]; insert 'a' at index 3 → [b,c,d,a,e]
    expect(next).toEqual(['b', 'c', 'd', 'a', 'e']);
  });

  it('clamps the gap to the end of a short deck', () => {
    const next = applySwipe(['a', 'b'], 'unknown', () => 99);
    expect(next).toEqual(['b', 'a']); // 'a' goes to the end, still not immediate
  });

  it('handles the last card gracefully', () => {
    expect(applySwipe(['a'], 'known')).toEqual([]);
    expect(applySwipe(['a'], 'unknown', () => 5)).toEqual(['a']); // nothing else to defer behind
    expect(applySwipe([], 'known')).toEqual([]);
  });

  it('reinsertGap stays within the 10–15 window and never runs past the deck', () => {
    for (let i = 0; i < 200; i++) {
      const g = reinsertGap(100);
      expect(g).toBeGreaterThanOrEqual(DEFAULT_GAP.min);
      expect(g).toBeLessThanOrEqual(DEFAULT_GAP.max);
    }
    expect(reinsertGap(4)).toBeLessThanOrEqual(4); // clamped to a short deck
  });

  it('with the DEFAULT gap, an unknown card reappears no sooner than 10 cards later', () => {
    const big = Array.from({ length: 20 }, (_, i) => `w${i}`);
    for (let i = 0; i < 100; i++) {
      const next = applySwipe(big, 'unknown'); // default random gap 10–15
      expect(next.indexOf('w0')).toBeGreaterThanOrEqual(10);
    }
  });

  it('answering "known" repeatedly empties the deck (round completes, no infinite loop)', () => {
    let deck = ['a', 'b', 'c'];
    let steps = 0;
    while (deck.length > 0 && steps < 50) { deck = applySwipe(deck, 'known'); steps++; }
    expect(deck).toEqual([]);
    expect(steps).toBe(3);
  });
});
