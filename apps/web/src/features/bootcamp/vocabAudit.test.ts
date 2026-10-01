import { describe, expect, it } from 'vitest';
import { MISSION_VOCAB_AUDIT } from './vocabAudit.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { BOOTCAMP_PLAN } from './plan.js';
import type { BootcampStep } from './types.js';

/**
 * The audit must stay bound to reality: every English mission is audited, and each priming DECISION
 * matches whether the mission actually has a `prime` step. This is what makes "all missions
 * audited" a fact rather than a claim.
 */

const primeWords = (day: number): string[] => {
  const steps = MISSIONS_BY_LANG.en![day]?.steps ?? [];
  return steps.filter((s): s is Extract<BootcampStep, { kind: 'prime' }> => s.kind === 'prime').flatMap((s) => s.words.map((w) => w.text.toLowerCase()));
};

describe('mission vocabulary audit — complete and consistent (Part 9)', () => {
  it('audits every English mission in the plan', () => {
    expect(Object.keys(MISSION_VOCAB_AUDIT).map(Number).sort((a, b) => a - b)).toEqual(BOOTCAMP_PLAN.map((m) => m.day));
  });

  for (const { day } of BOOTCAMP_PLAN) {
    it(`mission ${day}: decision matches the actual mission, with a justification`, () => {
      const audit = MISSION_VOCAB_AUDIT[day]!;
      expect(audit.day).toBe(day);
      expect(audit.justification.length).toBeGreaterThan(10);
      const hasPrime = primeWords(day).length > 0;
      expect(audit.decision).toBe(hasPrime ? 'primed' : 'no-priming-needed');
      if (audit.decision === 'primed') {
        expect(audit.primingWords.length).toBeGreaterThan(0);
        // Every listed priming word really is a prime word in the mission.
        const actual = primeWords(day);
        for (const w of audit.primingWords) expect(actual).toContain(w.toLowerCase());
      } else {
        expect(audit.primingWords).toEqual([]);
      }
    });
  }

  it('explicitly marks checkpoints/cold missions as no-priming-needed', () => {
    for (const cp of [9, 17, 23, 27, 28, 29]) expect(MISSION_VOCAB_AUDIT[cp]!.decision).toBe('no-priming-needed');
  });

  it('reports the exact primed count (7 foundation missions)', () => {
    const primed = Object.values(MISSION_VOCAB_AUDIT).filter((a) => a.decision === 'primed').map((a) => a.day);
    expect(primed).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
