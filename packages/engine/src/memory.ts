import type {
  ContentItem,
  LadderLevel,
  Lifecycle,
  MemoryState,
  ReviewEvent,
} from '@ready/content-schema';
import { DEFAULT_PARAMS, evidenceWeight, type EngineParams } from './params.js';

export const DAY_MS = 86_400_000;
const HALF_DAY_MS = DAY_MS / 2;

function clampDifficulty(d: number): number {
  return Math.min(10, Math.max(1, d));
}

function outcomeGrade(outcome: ReviewEvent['outcome']): number {
  return outcome === 'pass' ? 1 : outcome === 'partial' ? 0.5 : 0;
}

/**
 * Current retrievability R(t) = exp(-t / S), the probability of successful recall right now
 * (PDF §8.2). `t` is days elapsed since the last review; before that, R is 1.
 */
export function retrievabilityAt(state: Pick<MemoryState, 'stability' | 'lastReviewAt'>, nowMs: number): number {
  const t = (nowMs - Date.parse(state.lastReviewAt)) / DAY_MS;
  if (t <= 0) return 1;
  return Math.exp(-t / state.stability);
}

/**
 * Retrievability projected forward to an arbitrary future timestamp (e.g. the departure date),
 * assuming no further review. Used by the scheduler's objective and by readiness (PDF §8.3).
 */
export function projectedRetrievability(
  state: Pick<MemoryState, 'stability' | 'lastReviewAt'>,
  targetMs: number,
): number {
  return retrievabilityAt(state, targetMs);
}

/** Derive the knowledge-ladder level (L0–L4) from demonstrated evidence (PDF §6.2). */
function deriveLevel(
  prevLevel: LadderLevel,
  successfulRecalls: number,
  fluentDemonstrated: boolean,
  simulatorPassed: boolean,
  hadAnySuccess: boolean,
): LadderLevel {
  let level: number = prevLevel;
  if (hadAnySuccess) level = Math.max(level, 1);
  if (successfulRecalls >= 1) level = Math.max(level, 2);
  if (fluentDemonstrated) level = Math.max(level, 3);
  if (simulatorPassed) level = Math.max(level, 4);
  return level as LadderLevel;
}

function lifecycleAfterReview(
  stability: number,
  level: LadderLevel,
  isFail: boolean,
  params: EngineParams,
): Lifecycle {
  if (isFail) return 'learning';
  if (stability >= params.consolidatedStability && level >= 2) return 'consolidated';
  if (level >= 1) return 'reviewing';
  return 'learning';
}

/**
 * Apply one review event to an item's memory state, returning the new state. Pure and
 * deterministic: replaying the full event log in timestamp order reproduces state exactly
 * (PDF §11.4). `prev` is null for the first-ever event on an item.
 */
export function applyReview(
  prev: MemoryState | null,
  event: ReviewEvent,
  item: Pick<ContentItem, 'skillTarget'>,
  params: EngineParams = DEFAULT_PARAMS,
): MemoryState {
  const w = evidenceWeight(event.mode, item.skillTarget, params);
  const grade = outcomeGrade(event.outcome);
  const isFail = event.outcome === 'fail';
  const nowMs = Date.parse(event.at);

  let stability: number;
  let difficulty: number;

  if (!prev) {
    const base = isFail
      ? params.initialStabilityFail
      : event.mode === 'swipe'
        ? params.initialStabilitySwipe
        : params.initialStabilitySuccess;
    const gradeFactor = isFail ? 1 : 0.5 + 0.5 * grade;
    stability = Math.max(params.stabilityFloor, base * gradeFactor);
    difficulty = clampDifficulty(params.defaultDifficulty + (isFail ? 1.5 : -0.6 * w * grade));
  } else {
    const r = retrievabilityAt(prev, nowMs);
    if (isFail) {
      // Collapse toward the floor and re-queue for the same-session relearn loop (PDF §8.2).
      stability = Math.max(params.stabilityFloor, prev.stability * params.failStabilityFactor);
      difficulty = clampDifficulty(prev.difficulty + 1.0);
    } else {
      // Spacing growth: the largest gains come when R is low (desirable difficulty) and the
      // item is easy. A brand-new item drilled twice in-session (R≈1) barely grows — correct.
      const difficultyMod = (11 - prev.difficulty) / 10;
      const gradeMod = 0.4 + 0.6 * grade;
      const gain = 1 + params.spacingGain * w * gradeMod * difficultyMod * (1 - r);
      stability = prev.stability * gain;
      difficulty = clampDifficulty(prev.difficulty - 0.3 * w * grade);
    }
  }

  const hadAnySuccess = !isFail || (prev?.level ?? 0) >= 1;
  const isRecallPass = event.mode === 'flashRecall' && event.outcome === 'pass';
  const isSimulatorPass = event.mode === 'simulator' && event.outcome === 'pass';

  // Track successful recalls on separate occasions (≥12h apart) for spaced verification (§10.4).
  const recallTimestamps = [...(prev?.recallTimestamps ?? [])];
  let successfulRecalls = prev?.successfulRecalls ?? 0;
  if (isRecallPass) {
    const last = recallTimestamps.at(-1);
    if (last === undefined || nowMs - Date.parse(last) >= HALF_DAY_MS) {
      recallTimestamps.push(event.at);
      successfulRecalls += 1;
    }
  }

  const fluentDemonstrated =
    (prev?.fluentDemonstrated ?? false) ||
    (isRecallPass && event.latencyMs !== undefined && event.latencyMs < params.fluentLatencyMs);

  const level = deriveLevel(
    (prev?.level ?? 0) as LadderLevel,
    successfulRecalls,
    fluentDemonstrated,
    isSimulatorPass || (prev?.level ?? 0) >= 4,
    hadAnySuccess,
  );

  // A failure slides the ladder back one rung — memory faded under demonstration (PDF §6.2 fig).
  const effectiveLevel = (isFail ? (Math.max(1, level - 1) as LadderLevel) : level) as LadderLevel;

  return {
    userId: event.userId,
    itemId: event.itemId,
    stability,
    difficulty,
    level: effectiveLevel,
    lastReviewAt: event.at,
    lifecycle: lifecycleAfterReview(stability, effectiveLevel, isFail, params),
    successfulRecalls,
    recallTimestamps,
    fluentDemonstrated,
  };
}

/**
 * Recompute an item's lifecycle at an arbitrary "now", accounting for decay since the last
 * review. Consolidated/reviewing items whose retrievability has dropped are surfaced as lapsed
 * so the scheduler re-queues them (PDF §8.4 item lifecycle).
 */
export function lifecycleAt(
  state: MemoryState,
  nowMs: number,
  params: EngineParams = DEFAULT_PARAMS,
): Lifecycle {
  if (state.lifecycle === 'consolidated' || state.lifecycle === 'reviewing') {
    const r = retrievabilityAt(state, nowMs);
    if (r < params.lapseRetrievability) return 'lapsed';
  }
  return state.lifecycle;
}

/**
 * Project the full memory model over an event log for one item, in timestamp order. This is the
 * canonical way to (re)build a MemoryState from the append-only event source (PDF §11.4).
 */
export function projectItem(
  events: ReviewEvent[],
  item: Pick<ContentItem, 'skillTarget'>,
  params: EngineParams = DEFAULT_PARAMS,
): MemoryState | null {
  const ordered = [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  let state: MemoryState | null = null;
  for (const ev of ordered) {
    state = applyReview(state, ev, item, params);
  }
  return state;
}

/**
 * Rebuild every item's MemoryState from a full multi-item event log — the server/client
 * projection used for restore and for silent re-computation after a parameter change.
 */
export function projectAll(
  events: ReviewEvent[],
  itemsById: Map<string, Pick<ContentItem, 'skillTarget'>>,
  params: EngineParams = DEFAULT_PARAMS,
): Map<string, MemoryState> {
  const byItem = new Map<string, ReviewEvent[]>();
  for (const ev of events) {
    const list = byItem.get(ev.itemId);
    if (list) list.push(ev);
    else byItem.set(ev.itemId, [ev]);
  }
  const out = new Map<string, MemoryState>();
  for (const [itemId, evs] of byItem) {
    const item = itemsById.get(itemId);
    if (!item) continue;
    const state = projectItem(evs, item, params);
    if (state) out.set(itemId, state);
  }
  return out;
}
