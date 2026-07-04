import type { ContentItem, MemoryState, ReviewEvent } from '@ready/content-schema';
import { DEFAULT_PARAMS, type EngineParams } from './params.js';
import { applyReview, DAY_MS, projectedRetrievability, retrievabilityAt } from './memory.js';
import { estimateSeconds, recommendedMode } from './modemixer.js';

/** Long-horizon target (days) used once the trip has passed and the objective reverts (§8.3). */
const POST_TRIP_HORIZON_DAYS = 30;

export interface SchedulableItem {
  item: ContentItem;
  /** null = not yet seen (a candidate for introduction, not review). */
  state: MemoryState | null;
  /** Situation priority resolved from the plan (higher = more valuable). */
  situationPriority: number;
  isEmergency: boolean;
}

export interface SessionScheduleInput {
  /** All *seen* items eligible for review this session (state must be non-null). */
  candidates: SchedulableItem[];
  /** Today's new items to introduce, already ordered by the plan. */
  newQueue: SchedulableItem[];
  departureMs: number;
  nowMs: number;
  minutesBudget: number;
  /** Micro-batch size for interleaving new items between review bursts (PDF §8.3: 4–6). */
  newBatchSize?: number;
  params?: EngineParams;
}

export interface ScheduledStep {
  itemId: string;
  kind: 'review' | 'new';
  mode: ReturnType<typeof recommendedMode>;
  estSeconds: number;
  /** Ranking score (review steps only) for transparency and testing. */
  score: number;
}

export interface SessionSchedule {
  steps: ScheduledStep[];
  estTotalSeconds: number;
  budgetSeconds: number;
}

/**
 * Item value in the objective Σ value × R(item, T) — encodes tier, situation priority, and
 * criticality; Emergency items carry a multiplier (PDF §8.3).
 */
export function itemValue(
  item: ContentItem,
  situationPriority: number,
  isEmergency: boolean,
  params: EngineParams = DEFAULT_PARAMS,
): number {
  const tierWeight = 4 - item.tier; // Tier 0 → 4 (most valuable), Tier 3 → 1
  let value = tierWeight * (1 + Math.max(0, situationPriority));
  if (isEmergency) value *= params.emergencyValueMultiplier;
  return value;
}

/** The forward target time for the objective: departure, or a long horizon once the trip passed. */
function objectiveTargetMs(nowMs: number, departureMs: number): number {
  if (nowMs >= departureMs) return nowMs + POST_TRIP_HORIZON_DAYS * DAY_MS;
  return departureMs;
}

/**
 * Expected retrievability gain at the objective target if this item is reviewed now (assuming a
 * successful review), versus left alone. Low-R at-risk items yield the largest gains (§8.3).
 */
export function expectedRGain(
  s: SchedulableItem,
  nowMs: number,
  targetMs: number,
  params: EngineParams = DEFAULT_PARAMS,
): number {
  if (!s.state) return 0;
  const withoutReview = projectedRetrievability(s.state, targetMs);
  const mode = recommendedMode(s.item, s.state);
  const synthetic: ReviewEvent = {
    id: '00000000-0000-0000-0000-000000000000',
    userId: s.state.userId,
    itemId: s.item.id,
    mode,
    outcome: 'pass',
    at: new Date(nowMs).toISOString(),
  };
  const reviewed = applyReview(s.state, synthetic, s.item, params);
  const withReview = projectedRetrievability(reviewed, targetMs);
  return Math.max(0, withReview - withoutReview);
}

/**
 * Build a session schedule using the greedy deadline-aware algorithm (PDF §8.3): rank review
 * candidates by `value × R-gain / seconds-cost`, fill the review block from the top, and
 * interleave new-item micro-batches between review bursts.
 */
export function scheduleSession(input: SessionScheduleInput): SessionSchedule {
  const params = input.params ?? DEFAULT_PARAMS;
  const batchSize = input.newBatchSize ?? 5;
  const budgetSeconds = Math.round(input.minutesBudget * 60);
  const targetMs = objectiveTargetMs(input.nowMs, input.departureMs);

  const ranked = input.candidates
    .filter((c) => c.state !== null)
    .map((c) => {
      const value = itemValue(c.item, c.situationPriority, c.isEmergency, params);
      const gain = expectedRGain(c, input.nowMs, targetMs, params);
      const cost = estimateSeconds(c.item, c.state);
      const score = cost > 0 ? (value * gain) / cost : 0;
      return { s: c, value, gain, cost, score };
    })
    .filter((r) => r.gain > 0)
    .sort((a, b) => b.score - a.score);

  const reviewSteps: ScheduledStep[] = ranked.map((r) => ({
    itemId: r.s.item.id,
    kind: 'review' as const,
    mode: recommendedMode(r.s.item, r.s.state),
    estSeconds: r.cost,
    score: r.score,
  }));

  const newSteps: ScheduledStep[] = input.newQueue.map((s) => ({
    itemId: s.item.id,
    kind: 'new' as const,
    mode: recommendedMode(s.item, null),
    estSeconds: estimateSeconds(s.item, null),
    score: 0,
  }));

  // Interleave: a burst of reviews, then a micro-batch of new items, repeating, until budget.
  const steps: ScheduledStep[] = [];
  let used = 0;
  let ri = 0;
  let ni = 0;
  const reviewBurst = Math.max(batchSize, 6);

  const push = (step: ScheduledStep): boolean => {
    if (used + step.estSeconds > budgetSeconds && steps.length > 0) return false;
    steps.push(step);
    used += step.estSeconds;
    return true;
  };

  while ((ri < reviewSteps.length || ni < newSteps.length) && used < budgetSeconds) {
    let placed = false;
    for (let k = 0; k < reviewBurst && ri < reviewSteps.length; k++) {
      const step = reviewSteps[ri];
      if (step === undefined) break;
      if (!push(step)) {
        ri = reviewSteps.length;
        break;
      }
      ri++;
      placed = true;
    }
    for (let k = 0; k < batchSize && ni < newSteps.length; k++) {
      const step = newSteps[ni];
      if (step === undefined) break;
      if (!push(step)) {
        ni = newSteps.length;
        break;
      }
      ni++;
      placed = true;
    }
    if (!placed) break;
  }

  return { steps, estTotalSeconds: used, budgetSeconds };
}

/**
 * The same-session relearn loop (PDF §8.2, "3-strike relearn"): after a failure, an item is
 * re-queued for immediate corrective retrieval and again before session end. Returns whether the
 * item should be shown again now given how many times it has already failed this session.
 */
export function shouldRequeue(failCountThisSession: number, maxStrikes = 3): boolean {
  return failCountThisSession < maxStrikes;
}

/** Whether an item is currently "due" — its retrievability has decayed enough to warrant review. */
export function isDue(state: MemoryState, nowMs: number, threshold = 0.9): boolean {
  return retrievabilityAt(state, nowMs) < threshold;
}
