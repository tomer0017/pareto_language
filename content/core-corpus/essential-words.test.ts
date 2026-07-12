import { describe, expect, it } from 'vitest';
import { buildPackWords, mergePilotRealizations, type CorePackWord } from './corpus.js';
import { FR_PILOT } from './data/fr-pilot.js';

/**
 * Essential functional vocabulary (Part 4 + 5). These high-reuse words must exist as GLOBAL Core
 * concepts — not trapped inside one mission — so a learner can see them in Browse, hear them (the
 * pack carries the realization → TTS uses the learning-language locale), and review them in word
 * flashcards / games. This test binds that requirement to the emitted packs for BOTH languages.
 */

const ESSENTIAL = [
  'i', 'you', 'we', 'they',
  'want', 'need', 'have', 'can', 'understand', 'speak', 'go', 'pay', 'help',
  'with', 'without', 'and', 'or',
  'this', 'that', 'here', 'there',
  'small', 'medium', 'large', 'more', 'less', 'hot', 'cold', 'open', 'closed',
];

const slugOf = (w: CorePackWord): string => w.id.slice(w.id.lastIndexOf('.') + 1);

const FR_REALIZATIONS = Object.fromEntries(Object.entries(FR_PILOT).map(([slug, e]) => [slug, e.w]));
const enPack = buildPackWords('en');
const frPack = buildPackWords('fr', mergePilotRealizations('fr', FR_REALIZATIONS));

describe('essential Core words are globally available (Browse · audio · flashcards)', () => {
  it('every essential word exists in the English pack with a surface form + gloss', () => {
    const bySlug = new Map(enPack.map((w) => [slugOf(w), w]));
    for (const slug of ESSENTIAL) {
      const w = bySlug.get(slug);
      expect(w, `missing en concept "${slug}"`).toBeDefined();
      expect(w!.word.trim().length).toBeGreaterThan(0); // surface form → TTS can speak it
      expect(w!.meaning.en && w!.meaning.he).toBeTruthy(); // gloss shown in Browse/flashcards
    }
  });

  it('every essential word exists in the French pilot pack (parity, natural French)', () => {
    const bySlug = new Map(frPack.map((w) => [slugOf(w), w]));
    for (const slug of ESSENTIAL) {
      const w = bySlug.get(slug);
      expect(w, `missing fr realization for "${slug}"`).toBeDefined();
      expect(w!.word.trim().length).toBeGreaterThan(0);
    }
  });

  it('the newly promoted connectors/sizes carry the expected natural French', () => {
    const fr = new Map(frPack.map((w) => [slugOf(w), w.word]));
    expect(fr.get('with')).toBe('avec');
    expect(fr.get('without')).toBe('sans');
    expect(fr.get('and')).toBe('et');
    expect(fr.get('or')).toBe('ou');
    expect(fr.get('here')).toBe('ici');
    expect(fr.get('medium')).toBe('moyen');
    expect(fr.get('large')).toBe('grand');
  });

  it('English and French stay isolated (ids namespaced per language)', () => {
    expect(enPack.every((w) => w.id.startsWith('en.'))).toBe(true);
    expect(frPack.every((w) => w.id.startsWith('fr.'))).toBe(true);
  });
});
