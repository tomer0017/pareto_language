import { describe, expect, it } from 'vitest';
import { MISSIONS_BY_LANG } from './registry.js';
import { priorPrimeVocabulary, primeKey } from './primeVocab.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Vocabulary priming (Parts 5–7). A `prime` step teaches 3–8 building-block words BEFORE a longer
 * sentence, to cut overload — sentences stay the learning unit. These tests enforce the pedagogy:
 * small sets, resolvable references, and priming that appears BEFORE the sentence it prepares.
 */

const RECOMMENDED_MAX = 8; // Part 5: "3 to 6 essential items; occasionally up to 8 when justified"

type Prime = Extract<BootcampStep, { kind: 'prime' }>;
const primes = (day: BootcampDayContent): Prime[] => day.steps.filter((s): s is Prime => s.kind === 'prime');

describe('mission vocabulary priming — all languages', () => {
  for (const [lang, missions] of Object.entries(MISSIONS_BY_LANG)) {
    for (const [num, day] of Object.entries(missions)) {
      for (const [i, p] of primes(day).entries()) {
        it(`${lang} mission ${num} prime #${i + 1}: 1–${RECOMMENDED_MAX} words, all glossed`, () => {
          expect(p.words.length).toBeGreaterThanOrEqual(1);
          expect(p.words.length).toBeLessThanOrEqual(RECOMMENDED_MAX);
          for (const w of p.words) {
            expect(w.text.trim().length).toBeGreaterThan(0);
            // Gloss present in at least the two pilot app-languages (en pivot + he).
            expect(w.meaning.en && w.meaning.he).toBeTruthy();
          }
        });

        it(`${lang} mission ${num} prime #${i + 1}: builds a real mission sentence, shown BEFORE it`, () => {
          if (!p.buildFromItemId) return; // buildFromItemId is optional
          const ids = new Set(day.items.map((it) => it.id));
          expect(ids.has(p.buildFromItemId)).toBe(true);
          // The prime must appear before the FIRST step that teaches/uses that sentence as a tool.
          const primeIdx = day.steps.indexOf(p);
          const toolIdx = day.steps.findIndex((s) => s.kind === 'tool' && s.itemId === p.buildFromItemId);
          if (toolIdx >= 0) expect(primeIdx).toBeLessThan(toolIdx);
          // The primed words should genuinely be pieces of the built sentence (not arbitrary vocab):
          // at least one primed word appears (case-insensitively) inside the target sentence.
          const sentence = day.items.find((it) => it.id === p.buildFromItemId)!.text.toLowerCase();
          expect(p.words.some((w) => sentence.includes(w.text.toLowerCase().split(' ')[0]!))).toBe(true);
        });
      }
    }
  }
});

describe('priming is present where the sprint required it, absent elsewhere', () => {
  it('English foundation missions (1–8) each prime before the sentences', () => {
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8]) expect(primes(MISSIONS_BY_LANG.en![d]!).length).toBeGreaterThanOrEqual(1);
  });
  it('French built missions (1–4) all prime (feature parity for what exists)', () => {
    for (const d of [1, 2, 3, 4]) expect(primes(MISSIONS_BY_LANG.fr![d]!).length).toBeGreaterThanOrEqual(1);
  });
  it('checkpoint / cold missions carry NO priming (they introduce no new content)', () => {
    // Day 10 is a cold arrival checkpoint — a well-formed mission that intentionally skips priming.
    expect(primes(MISSIONS_BY_LANG.en![10]!).length).toBe(0);
    expect(MISSIONS_BY_LANG.en![10]!.steps.at(-1)!.kind).toBe('summary');
  });
});

describe('prior-knowledge tracking — new vs review words are honest', () => {
  for (const [lang, missions] of Object.entries(MISSIONS_BY_LANG)) {
    for (const [num, day] of Object.entries(missions)) {
      for (const p of primes(day)) {
        const prior = priorPrimeVocabulary(lang, Number(num));
        for (const w of p.words) {
          if (w.review) {
            it(`${lang} mission ${num}: review word "${w.text}" was introduced earlier`, () => {
              expect(prior.has(primeKey(w))).toBe(true);
            });
          } else {
            it(`${lang} mission ${num}: new word "${w.text}" is genuinely new (else mark it review)`, () => {
              expect(prior.has(primeKey(w))).toBe(false);
            });
          }
        }
      }
    }
  }

  it('the review mechanism is actually exercised (≥1 review word exists)', () => {
    let reviews = 0;
    for (const missions of Object.values(MISSIONS_BY_LANG))
      for (const day of Object.values(missions))
        for (const p of primes(day)) reviews += p.words.filter((w) => w.review).length;
    expect(reviews).toBeGreaterThanOrEqual(1);
  });
});
