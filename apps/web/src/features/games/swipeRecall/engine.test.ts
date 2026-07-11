import { describe, expect, it } from 'vitest';
import { applySwipe, reinsertGap, DEFAULT_GAP } from './engine.js';

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
});
