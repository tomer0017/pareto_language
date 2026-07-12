import { describe, expect, it } from 'vitest';
import { frenchNumber, FR_TRICKY_NUMBERS, FR_PRICE_EXAMPLES } from './frenchNumbers.js';

/**
 * French number construction (Part 6). The vigesimal 70/80/90 patterns and the et/-s rules are the
 * whole point — pinned exactly so a regression is caught, not shipped to a learner as wrong French.
 */
describe('frenchNumber — canonical forms', () => {
  const cases: [number, string][] = [
    [0, 'zéro'], [1, 'un'], [5, 'cinq'], [11, 'onze'], [16, 'seize'], [17, 'dix-sept'], [19, 'dix-neuf'],
    [20, 'vingt'], [21, 'vingt et un'], [22, 'vingt-deux'], [30, 'trente'], [31, 'trente et un'],
    [60, 'soixante'], [61, 'soixante et un'],
    // the hard patterns
    [70, 'soixante-dix'], [71, 'soixante et onze'], [72, 'soixante-douze'], [79, 'soixante-dix-neuf'],
    [80, 'quatre-vingts'], [81, 'quatre-vingt-un'], [85, 'quatre-vingt-cinq'], [89, 'quatre-vingt-neuf'],
    [90, 'quatre-vingt-dix'], [91, 'quatre-vingt-onze'], [95, 'quatre-vingt-quinze'], [99, 'quatre-vingt-dix-neuf'],
    [100, 'cent'], [101, 'cent un'], [200, 'deux cents'], [201, 'deux cent un'],
    [1000, 'mille'], [2000, 'deux mille'], [1500, 'mille cinq cents'],
  ];
  for (const [n, fr] of cases) {
    it(`${n} → ${fr}`, () => expect(frenchNumber(n)).toBe(fr));
  }

  it('rejects negatives and non-integers', () => {
    expect(() => frenchNumber(-1)).toThrow();
    expect(() => frenchNumber(1.5)).toThrow();
  });
});

describe('FR_TRICKY_NUMBERS + FR_PRICE_EXAMPLES', () => {
  it('covers the required irregular set with glosses', () => {
    const byValue = new Map(FR_TRICKY_NUMBERS.map((d) => [d.value, d.fr]));
    expect(byValue.get(70)).toBe('soixante-dix');
    expect(byValue.get(71)).toBe('soixante et onze');
    expect(byValue.get(80)).toBe('quatre-vingts');
    expect(byValue.get(81)).toBe('quatre-vingt-un');
    expect(byValue.get(90)).toBe('quatre-vingt-dix');
    expect(byValue.get(91)).toBe('quatre-vingt-onze');
    expect(byValue.get(99)).toBe('quatre-vingt-dix-neuf');
    expect(byValue.get(100)).toBe('cent');
    expect(byValue.get(1000)).toBe('mille');
    for (const d of FR_TRICKY_NUMBERS) expect(d.meaning.en && d.meaning.he).toBeTruthy();
  });

  it('prices are spoken French + euros for the common travel amounts', () => {
    const p = new Map(FR_PRICE_EXAMPLES.map((d) => [d.value, d.fr]));
    expect(p.get(70)).toBe('soixante-dix euros');
    expect(p.get(80)).toBe('quatre-vingts euros');
    expect(p.get(95)).toBe('quatre-vingt-quinze euros');
    expect(p.get(15)).toBe('quinze euros');
  });
});
