import type { PracticeMode, SkillTarget } from '@ready/content-schema';

/**
 * Engine parameters (PDF §8, §16 R2).
 * Conservative defaults inspired by published FSRS parameterizations, kept in one place so the
 * event-sourced state can be re-computed with better values later without data migration.
 */
export interface EngineParams {
  /** Minimum stability floor in days — a failed item never drops below this. */
  stabilityFloor: number;
  /** Default per-item difficulty on a scale of 1 (easy) to 10 (hard). */
  defaultDifficulty: number;
  /** Multiplier applied to stability on a failed review (collapse toward the floor). */
  failStabilityFactor: number;
  /** Base stability (days) seeded by a first *strong* successful review. */
  initialStabilitySuccess: number;
  /** Base stability (days) seeded by a first successful *swipe* (weak prior). */
  initialStabilitySwipe: number;
  /** Base stability (days) seeded by a first failed review of a new item. */
  initialStabilityFail: number;
  /** Global growth coefficient controlling how fast stability rises on success. */
  spacingGain: number;
  /** Latency (ms) under which a recall counts as fluent (L3), per PDF §9.1 (<3s to speak). */
  fluentLatencyMs: number;
  /** Retrievability below which a consolidated item is considered lapsed / at risk. */
  lapseRetrievability: number;
  /** Retrievability threshold above which a well-known item is hidden (consolidated). */
  consolidatedRetrievability: number;
  /** Stability (days) above which an item may be considered consolidated. */
  consolidatedStability: number;
  /** Blended acquisition rate — new items masterable per minute (PDF §8.1). */
  acquisitionRatePerMinute: number;
  /** Capacity safety reserve — use at most this fraction of raw capacity (PDF §8.1: 85%). */
  capacityUtilization: number;
  /** Emergency-situation value multiplier in the scheduler objective (PDF §8.3). */
  emergencyValueMultiplier: number;
  /** Projected-R floor at departure below which a met-criteria situation reads as Fading (§10.4). */
  readinessFadingThreshold: number;
}

export const DEFAULT_PARAMS: EngineParams = {
  stabilityFloor: 0.1,
  defaultDifficulty: 5,
  failStabilityFactor: 0.4,
  initialStabilitySuccess: 1.0,
  initialStabilitySwipe: 0.35,
  initialStabilityFail: 0.15,
  spacingGain: 2.2,
  fluentLatencyMs: 3000,
  lapseRetrievability: 0.7,
  consolidatedRetrievability: 0.9,
  consolidatedStability: 8,
  acquisitionRatePerMinute: 0.7,
  capacityUtilization: 0.85,
  emergencyValueMultiplier: 2.5,
  readinessFadingThreshold: 0.8,
};

/**
 * Evidence weight per practice mode (PDF §8.2). Higher = more diagnostic of the target skill.
 * Swipe is a weak prior; recall / listening / fluency are strong.
 */
export const MODE_EVIDENCE_WEIGHT: Record<PracticeMode, number> = {
  flashRecall: 1.0, // recall test — direct measurement of production
  listen: 0.9, // listening comprehension — direct for L1 items
  numberSprint: 0.9, // timed number comprehension
  simulator: 0.95, // integrative production + comprehension under context
  echo: 0.3, // exposure / pronunciation, not a knowledge test
  swipe: 0.2, // self-report, illusion-of-competence bias
};

/**
 * Adjust a mode's evidence weight given the item's target skill. Listening is fully diagnostic
 * for recognition-target items; recall is fully diagnostic for recall/fluent-target items.
 */
export function evidenceWeight(
  mode: PracticeMode,
  skillTarget: SkillTarget,
  params: EngineParams = DEFAULT_PARAMS,
): number {
  void params;
  const base = MODE_EVIDENCE_WEIGHT[mode];
  if (mode === 'listen' && skillTarget !== 'recognize') {
    // Listening is a weaker signal for items whose real target is production.
    return base * 0.6;
  }
  if (mode === 'flashRecall' && skillTarget === 'recognize') {
    // Producing a recognition-only item is nice but beyond its target — mild discount.
    return base * 0.8;
  }
  return base;
}
