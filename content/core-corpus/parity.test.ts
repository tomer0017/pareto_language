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

  it('realizes the COMPLETE corpus — French concept count equals English (500/500)', () => {
    expect(report.total).toBe(CORPUS.length);
    expect(report.covered).toBe(report.total); // full vocabulary parity
    expect(report.missing).toEqual([]);
    expect(report.complete).toBe(true);
  });

  it('has NO orphan French realizations (every fr key is a real concept id)', () => {
    expect(report.orphans).toEqual([]);
  });

  it('passes the corpus parity gate for French (no gaps)', () => {
    expect(() => assertCorpusParity(report)).not.toThrow();
  });

  it('still fails loudly for a language with a real gap (Phase 7 — no silent gaps)', () => {
    const partial = Object.fromEntries(Object.entries(FR_PILOT).slice(0, 100));
    expect(() => assertCorpusParity(corpusParity('xx', partial, CORPUS))).toThrow(/Corpus parity FAILED/);
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
