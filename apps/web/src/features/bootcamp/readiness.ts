import { BOOTCAMP_PLAN, type MissionPlan } from './plan.js';

/**
 * Travel Readiness — the ONE honest progress model of READY: how many of the plan's real-world
 * situations the learner has completed. PURE (no store / React) so it is unit-testable.
 *
 * It is deliberately NOT "percent of a language": a situation is "ready" when its mission is
 * completed, and the percentage is exactly ready ÷ total. Nothing here is estimated or invented —
 * if a richer model (spaced recall, cold checks) is added later it replaces this one function.
 */

export type MissionStatus = 'ready' | 'inProgress' | 'notStarted' | 'unavailable';

export interface ReadinessInput {
  completedDays: number[];
  /** Per-day resume point (a value > 0 means the mission was started). */
  stepIndex: Record<string, number>;
}

export interface TravelReadiness {
  /** Situations in the curriculum (the plan's length — never a hard-coded number). */
  total: number;
  /** Situations completed. */
  ready: number;
  /** ready ÷ total, as a whole percent. */
  pct: number;
  /** Situations still to complete. */
  remaining: number;
  allDone: boolean;
  statusOf(day: number): MissionStatus;
  /** The single best next mission: the one in progress, else the first not yet completed, else
   *  (everything done) the first mission for a replay. Undefined only if nothing is built. */
  next: MissionPlan | undefined;
  /** True when `next` is a mission the learner already started. */
  nextIsResume: boolean;
}

export function travelReadiness(
  progress: ReadinessInput,
  isBuilt: (m: MissionPlan) => boolean,
  plan: readonly MissionPlan[] = BOOTCAMP_PLAN,
): TravelReadiness {
  const done = new Set(progress.completedDays);
  const started = (m: MissionPlan): boolean => (progress.stepIndex[String(m.day)] ?? 0) > 0;
  const statusOf = (day: number): MissionStatus => {
    const m = plan.find((p) => p.day === day);
    if (!m || !isBuilt(m)) return 'unavailable';
    if (done.has(day)) return 'ready';
    return started(m) ? 'inProgress' : 'notStarted';
  };
  const built = plan.filter(isBuilt);
  const ready = built.filter((m) => done.has(m.day)).length;
  const total = plan.length;
  const resume = built.find((m) => !done.has(m.day) && started(m));
  const next = resume ?? built.find((m) => !done.has(m.day)) ?? built[0];
  return {
    total,
    ready,
    pct: total > 0 ? Math.round((ready / total) * 100) : 0,
    remaining: total - ready,
    allDone: built.length > 0 && ready >= built.length,
    statusOf,
    next,
    nextIsResume: resume !== undefined,
  };
}
