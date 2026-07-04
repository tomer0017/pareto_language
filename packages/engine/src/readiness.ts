import type {
  MemoryState,
  ReadinessSnapshot,
  ReadinessState,
  Situation,
} from '@ready/content-schema';
import { DEFAULT_PARAMS, type EngineParams } from './params.js';
import { DAY_MS, projectedRetrievability } from './memory.js';

const HALF_DAY_MS = DAY_MS / 2;

export interface ReadinessInput {
  situation: Situation;
  /** Memory states for the situation's items, keyed by itemId (absent = not started). */
  statesByItem: Map<string, MemoryState>;
  /** Whether the situation's Simulator has been completed at least once. */
  simulatorDone: boolean;
  departureMs: number;
  nowMs: number;
  params?: EngineParams;
  /** Projected-R threshold below which a previously-Ready situation is Fading (PDF §10.4). */
  fadingThreshold?: number;
}

/** Whether an item has ≥2 successful recalls on occasions ≥12h apart (spacing-verified, §10.4). */
export function hasSpacedRecalls(state: MemoryState, occasions = 2): boolean {
  const ts = state.recallTimestamps.map((t) => Date.parse(t)).sort((a, b) => a - b);
  if (ts.length < occasions) return false;
  let count = 1;
  let anchor = ts[0] as number;
  for (let i = 1; i < ts.length; i++) {
    const cur = ts[i] as number;
    if (cur - anchor >= HALF_DAY_MS) {
      count++;
      anchor = cur;
      if (count >= occasions) return true;
    }
  }
  return count >= occasions;
}

/** A core phrase is "solid" when at L2+ and spacing-verified (two occasions ≥12h apart). */
export function isPhraseSolid(state: MemoryState | undefined): boolean {
  if (!state) return false;
  return state.level >= 2 && hasSpacedRecalls(state, 2);
}

/**
 * Compute the honest readiness state for one situation (PDF §10.4):
 * notStarted → inProgress → ready → fading. Emergency additionally requires timed L3 fluency.
 */
export function computeReadiness(input: ReadinessInput): ReadinessSnapshot {
  const params = input.params ?? DEFAULT_PARAMS;
  const fadingThreshold = input.fadingThreshold ?? params.readinessFadingThreshold;
  const { situation, statesByItem } = input;

  const coreIds = situation.corePhraseIds;
  const coreStates = coreIds.map((id) => statesByItem.get(id));
  const introducedCount = coreStates.filter((s) => s !== undefined).length;

  const phrasesSolid = coreStates.filter((s) => isPhraseSolid(s)).length;
  const phrasesTotal = coreIds.length;

  // Likely-reply comprehension: fraction of replies at L1+ (passed a listening check).
  const replyStates = situation.replyIds.map((id) => statesByItem.get(id));
  const repliesKnown = replyStates.filter((s) => s !== undefined && s.level >= 1).length;
  const repliesPct = situation.replyIds.length === 0 ? 1 : repliesKnown / situation.replyIds.length;

  // Projected mean retrievability at departure over core items.
  const projected =
    coreStates.length === 0
      ? 0
      : coreStates.reduce(
          (sum, s) => sum + (s ? projectedRetrievability(s, input.departureMs) : 0),
          0,
        ) / coreStates.length;

  const detail = { phrasesSolid, phrasesTotal, repliesPct, simulatorDone: input.simulatorDone };
  const base = { userId: firstUserId(statesByItem), situationId: situation.id };

  if (introducedCount === 0) {
    return { ...base, state: 'notStarted', detail, projectedAtDeparture: projected };
  }

  const allCoreSolid = phrasesTotal > 0 && phrasesSolid === phrasesTotal;
  const repliesOk = repliesPct >= 0.8;
  const emergencyFluencyOk =
    !situation.isEmergency ||
    coreStates.every((s) => s !== undefined && s.level >= 3 && s.fluentDemonstrated);

  const meetsReady = allCoreSolid && repliesOk && input.simulatorDone && emergencyFluencyOk;

  if (meetsReady) {
    // Ready, unless projected retrievability at the trip date has already fallen → Fading.
    const state: ReadinessState = projected < fadingThreshold ? 'fading' : 'ready';
    return { ...base, state, detail, projectedAtDeparture: projected };
  }

  // Not currently meeting Ready. If it was ever solid (all core reached L2 at some point) but
  // has decayed, surface as Fading; otherwise still In progress.
  const everSolid = coreStates.every((s) => s !== undefined && s.level >= 2);
  const state: ReadinessState = everSolid && projected < fadingThreshold ? 'fading' : 'inProgress';
  return { ...base, state, detail, projectedAtDeparture: projected };
}

function firstUserId(statesByItem: Map<string, MemoryState>): string {
  for (const s of statesByItem.values()) return s.userId;
  return '';
}
