import { describe, expect, it } from 'vitest';
import { ConceptSchema } from '@ready/content-schema';
import { PILOT100 } from './pilot100.js';
import { buildConcepts, buildPackWords, validatePilot } from './corpus.js';

/** Task D1 — Core 100 corpus validation (the build/pipeline gate, mirrored as a unit test). */
describe('Core 100 corpus', () => {
  it('passes every corpus invariant', () => {
    expect(() => validatePilot(PILOT100)).not.toThrow();
  });

  it('has exactly 100 concepts with unique ids, ranks and emoji', () => {
    const concepts = buildConcepts();
    expect(concepts.length).toBe(100);
    expect(new Set(concepts.map((c) => c.id)).size).toBe(100);
    expect(new Set(concepts.map((c) => c.rank)).size).toBe(100);
    expect(new Set(PILOT100.map((w) => w.emoji)).size).toBe(100); // no dup emoji → safe quiz distractors
  });

  it('every concept is ConceptSchema-valid with emoji, he gloss, category and example', () => {
    for (const c of buildConcepts()) {
      expect(() => ConceptSchema.parse(c)).not.toThrow();
      expect(c.emoji).toBeTruthy();
      expect(c.iconEligible).toBe(true);
      expect(c.gloss.he).toBeTruthy();
      expect(c.gloss.en).toBeTruthy();
      expect(c.categories.length).toBeGreaterThan(0);
      expect(c.realizations.en?.text).toBeTruthy();
      expect(c.example?.he).toBeTruthy();
      expect(c.situationSlugs.length).toBeGreaterThan(0); // non-orphan
    }
  });

  it('quality stays honest — realizations are ai_reviewed, never fake native review', () => {
    for (const c of buildConcepts()) {
      expect(c.realizations.en?.quality).toBe('ai_reviewed');
    }
  });

  it('the app pack rows carry everything the games + Core Words need', () => {
    const words = buildPackWords();
    expect(words.length).toBe(100);
    for (const w of words) {
      expect(w.id).toMatch(/^en\.word\./);
      expect(w.conceptId).toMatch(/^concept\.word\./);
      expect(w.meaning.en && w.meaning.he).toBeTruthy();
      expect(w.emoji).toBeTruthy();
      expect(w.category).toBeTruthy();
    }
  });

  it('rejects a corpus with a duplicate emoji', () => {
    const dup = [...PILOT100];
    dup[1] = { ...dup[1]!, emoji: dup[0]!.emoji };
    expect(() => validatePilot(dup)).toThrow(/duplicate emoji/);
  });

  it('rejects a corpus that is not exactly 100', () => {
    expect(() => validatePilot(PILOT100.slice(0, 99))).toThrow(/exactly 100/);
  });
});
