import { describe, it, expect } from 'vitest';
import { shuffle, seededShuffle, sample, pickOne, mulberry32 } from './shuffle.js';

const ITEMS = Array.from({ length: 12 }, (_, i) => i);

describe('shuffle', () => {
  it('keeps every item exactly once (no missing, no duplicates)', () => {
    const out = seededShuffle(ITEMS, 42);
    expect(out.slice().sort((a, b) => a - b)).toEqual(ITEMS);
    expect(new Set(out).size).toBe(ITEMS.length);
  });

  it('does not mutate the input array', () => {
    const input = ITEMS.slice();
    seededShuffle(input, 7);
    expect(input).toEqual(ITEMS);
  });

  it('is deterministic for the same seed', () => {
    expect(seededShuffle(ITEMS, 123)).toEqual(seededShuffle(ITEMS, 123));
  });

  it('produces a different order for different seeds', () => {
    expect(seededShuffle(ITEMS, 1)).not.toEqual(seededShuffle(ITEMS, 2));
  });

  it('actually reorders (not the identity) for a typical seed', () => {
    expect(seededShuffle(ITEMS, 99)).not.toEqual(ITEMS);
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([5])).toEqual([5]);
  });

  it('is approximately uniform — every element reaches position 0 (answer positions vary)', () => {
    const counts = new Array(4).fill(0) as number[];
    const rng = mulberry32(2024);
    for (let i = 0; i < 4000; i++) {
      const first = shuffle([0, 1, 2, 3], rng)[0]!;
      counts[first]! += 1;
    }
    // Each of 4 positions should get ~1000; assert none is starved or dominant (bias guard).
    for (const c of counts) expect(c).toBeGreaterThan(750);
  });
});

describe('sample', () => {
  it('returns n distinct items', () => {
    const out = sample(ITEMS, 3, mulberry32(5));
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3);
  });
  it('clamps n to the array length', () => {
    expect(sample([1, 2], 10, mulberry32(5))).toHaveLength(2);
  });
});

describe('pickOne', () => {
  it('returns an element of the array, deterministic under a seed', () => {
    const x = pickOne(ITEMS, mulberry32(11));
    expect(ITEMS).toContain(x);
    expect(pickOne(ITEMS, mulberry32(11))).toBe(x);
  });
  it('returns undefined for an empty array', () => {
    expect(pickOne([])).toBeUndefined();
  });
});
