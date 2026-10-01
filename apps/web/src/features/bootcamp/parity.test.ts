import { describe, expect, it } from 'vitest';
import { assertBootcampParity, missionParity, unreachableOrDeadEnds } from './parity.js';
import { DAYS } from './registry.js';
import { DAYS_FR } from './fr/index.js';
import { BOOTCAMP_PLAN } from './plan.js';

/**
 * Bootcamp parity gates (Phase 7). English is the reference; French must reach the same mission set
 * with structurally equivalent missions. French is now COMPLETE (every mission of the plan), so these tests assert full
 * coverage AND that every French mission is a true structural match for its English counterpart —
 * while still proving the enforcement gate fails loudly for any incomplete language.
 */
describe('Bootcamp parity (French vs English reference)', () => {
  const report = missionParity('fr', DAYS, DAYS_FR);

  it('French covers every English mission with full structural parity', () => {
    expect(report.total).toBe(BOOTCAMP_PLAN.length);
    expect(report.covered).toBe(BOOTCAMP_PLAN.length);
    expect(report.complete).toBe(true);
    expect(report.missing.length).toBe(0);
  });

  it('EVERY French mission structurally matches its English counterpart (same journey)', () => {
    expect(report.perMission).toHaveLength(BOOTCAMP_PLAN.length);
    for (const m of report.perMission) {
      expect(m.ok, `mission ${m.day} mismatch`).toBe(true);
      expect(m.frSteps).toBe(m.enSteps);
      expect(m.frItems).toBe(m.enItems);
      expect(m.frDialogues).toBe(m.enDialogues);
    }
  });

  it('the parity gate still fails loudly for an INCOMPLETE language (Phase 7 — no silent gaps)', () => {
    const partial = missionParity('fr', DAYS, { 1: DAYS_FR[1]! }); // a deliberately incomplete subset
    expect(() => assertBootcampParity(partial)).toThrow(/Bootcamp parity FAILED for "fr"/);
  });

  it('passes only when the language fully matches the reference (French now, and English self)', () => {
    expect(() => assertBootcampParity(report)).not.toThrow();
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
