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
    expect(Object.keys(MISSION_VOCAB_AUDIT).map(Number).sort((a, b) => a - b)).toEqual(BOOTCAMP_PLAN.map((m) => m.day).sort((a, b) => a - b));
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

  it('explicitly marks checkpoints/cold missions as no-priming-needed — City & Conversation primes exactly one line ("should")', () => {
    for (const cp of [9, 17, 27, 28, 29]) expect(MISSION_VOCAB_AUDIT[cp]!.decision).toBe('no-priming-needed');
    expect([MISSION_VOCAB_AUDIT[23]!.decision, MISSION_VOCAB_AUDIT[23]!.primingWords]).toEqual(['primed', ['You should take the boat tour.']]);
  });

  it('reports the exact primed set (the 7 original foundation missions + Everyday Core + Airport & Border + Shopping + Small Talk + Time & Plans + Home & Family + Restaurant Meal + Food Preferences & Allergies + Hobbies & Free Time + City & Conversation\'s one card)', () => {
    const primed = Object.values(MISSION_VOCAB_AUDIT).filter((a) => a.decision === 'primed').map((a) => a.day);
    expect(primed).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 22, 23, 30, 31, 32, 33]); // registry keys; 30 = Everyday Core (Mission 4), 10 = Airport & Border (Mission 6), 8 = Shopping (Mission 9), 22 = Small Talk (Mission 11), 31 = Time & Plans (Mission 12), 32 = Home & Family (Mission 13), 33 = Hobbies & Free Time (Mission 16), 13 = Food Preferences & Allergies (Mission 15), 23 = City & Conversation (Mission 24: one "should" card)
  });
});
