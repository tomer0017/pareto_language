import { describe, expect, it } from 'vitest';
import { assertCorpusParity, corpusParity } from './parity.js';
import { CORPUS } from './data/index.js';
import { FR_PILOT } from './data/fr-pilot.js';

/**
 * Corpus parity gates (Phase 7). French realizations merge onto the SAME concept rows, so ids /
 * categories / metadata are identical by construction; parity = coverage + no orphans. These tests
 * document the honest current state (French vocabulary is a subset) and prove enforcement is loud.
 */
describe('Corpus parity (French vs English reference)', () => {
  const report = corpusParity('fr', FR_PILOT, CORPUS);

  it('measures French coverage of the full corpus (honest — a subset today)', () => {
    expect(report.total).toBe(CORPUS.length);
    expect(report.covered).toBe(Object.keys(FR_PILOT).length);
    expect(report.covered).toBeLessThan(report.total); // brutally honest: not full parity yet
    expect(report.missing.length).toBe(report.total - report.covered);
  });

  it('has NO orphan French realizations (every fr key is a real concept id)', () => {
    expect(report.orphans).toEqual([]);
  });

  it('fails loudly while French is incomplete (Phase 7 — no silent gaps)', () => {
    expect(() => assertCorpusParity(report)).toThrow(/Corpus parity FAILED for "fr"/);
  });

  it('passes for the complete reference language (English realizes every row)', () => {
    const en = Object.fromEntries(CORPUS.map((r) => [r.slug, r.en]));
    expect(() => assertCorpusParity(corpusParity('en', en, CORPUS))).not.toThrow();
  });

  it('flags an orphan realization (typo / stale slug) loudly', () => {
    const withOrphan = { ...FR_PILOT, 'not-a-real-concept': { w: 'x' } };
    expect(corpusParity('fr', withOrphan, CORPUS).orphans).toContain('not-a-real-concept');
  });
});
