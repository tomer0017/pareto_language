import { describe, expect, it } from 'vitest';
import { assertBootcampParity, missionParity, unreachableOrDeadEnds } from './parity.js';
import { DAYS } from './registry.js';
import { DAYS_FR } from './fr/index.js';

/**
 * Bootcamp parity gates (Phase 7). English is the reference; French must reach the same mission set
 * with structurally equivalent missions. These tests DOCUMENT the honest current state (French is
 * in progress) and prove the enforcement fails loudly, and that the one authored French mission is
 * a true structural match for its English counterpart.
 */
describe('Bootcamp parity (French vs English reference)', () => {
  const report = missionParity('fr', DAYS, DAYS_FR);

  it('measures French mission coverage against the 30 English missions (honest, not complete)', () => {
    expect(report.total).toBe(30);
    expect(report.covered).toBe(Object.keys(DAYS_FR).length);
    expect(report.complete).toBe(false); // brutally honest: French Bootcamp is not yet at parity
    expect(report.missing.length).toBe(30 - report.covered);
  });

  it('the authored French mission 1 structurally matches English mission 1 (same journey)', () => {
    const m1 = report.perMission.find((m) => m.day === 1);
    expect(m1).toBeDefined();
    expect(m1!.ok).toBe(true);
    expect(m1!.frSteps).toBe(m1!.enSteps);
    expect(m1!.frItems).toBe(m1!.enItems);
    expect(m1!.frDialogues).toBe(m1!.enDialogues);
  });

  it('fails loudly for an incomplete language (Phase 7 — no silent gaps)', () => {
    expect(() => assertBootcampParity(report)).toThrow(/Bootcamp parity FAILED for "fr"/);
  });

  it('passes only when the language fully matches the reference', () => {
    expect(() => assertBootcampParity(missionParity('en', DAYS, DAYS))).not.toThrow();
  });

  it('every French dialogue branch terminates or recovers (no dead ends)', () => {
    for (const day of Object.values(DAYS_FR)) {
      for (const d of Object.values(day.dialogues)) {
        expect(unreachableOrDeadEnds(d)).toEqual([]);
      }
    }
  });
});
