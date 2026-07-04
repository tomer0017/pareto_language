import { computeReadiness, DAY_MS } from '@ready/engine';
import type { MemoryState, ReadinessSnapshot } from '@ready/content-schema';
import { MemoryStateModel, TripPlanModel } from '../models/index.js';
import { loadPack } from './content.js';

/** One readiness computation for every route that needs it (auth'd or anonymous). */
export async function readinessForUser(userId: string, languageCode?: string): Promise<ReadinessSnapshot[]> {
  const plan = await TripPlanModel.findOne({ userId }).lean();
  const lang = languageCode ?? plan?.lang ?? 'it';
  const pack = loadPack(lang);
  const stateList = (await MemoryStateModel.find({ userId }).lean()) as unknown as MemoryState[];
  const states = new Map(stateList.map((s) => [s.itemId, s]));
  const departureMs = plan ? Date.parse(plan.departureAt) : Date.now() + 7 * DAY_MS;
  return pack.situations.map((situation) => {
    const simulatorDone = situation.corePhraseIds.some((id) => (states.get(id)?.level ?? 0) >= 4);
    return computeReadiness({ situation, statesByItem: states, simulatorDone, departureMs, nowMs: Date.now() });
  });
}
