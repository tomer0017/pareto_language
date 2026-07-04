import type {
  ContentItem,
  ContentPack,
  Situation,
  SituationPriority,
  Tier,
  TripPlan,
} from '@ready/content-schema';
import { DEFAULT_PARAMS, type EngineParams } from './params.js';
import { DAY_MS } from './memory.js';

export interface PlanInput {
  pack: ContentPack;
  userId: string;
  departureAt: string;
  nowMs: number;
  minutesPerDay: number;
  /** User's ranked situation priorities (rank 0 = most important). Optional → pack defaults. */
  situationPriorities?: SituationPriority[];
  /** Items already introduced (for re-planning); excluded from new-item allocation. */
  seenItemIds?: ReadonlySet<string>;
  /** Version to stamp (bumped on every re-plan). */
  version?: number;
  params?: EngineParams;
}

const TIERS: Tier[] = [3, 2, 1, 0];

function studyDaysUntil(nowMs: number, departureMs: number): number {
  const days = Math.floor((departureMs - nowMs) / DAY_MS);
  return Math.max(1, days);
}

function itemsUpToTier(pack: ContentPack, tier: Tier): ContentItem[] {
  return pack.items.filter((it) => it.tier <= tier);
}

/**
 * Select the deepest tier whose item count fits within the capacity reserve (PDF §8.1):
 * capacity = days × minutes × acquisitionRate, used at ≤85%.
 */
export function selectTier(
  pack: ContentPack,
  days: number,
  minutesPerDay: number,
  params: EngineParams = DEFAULT_PARAMS,
): Tier {
  const capacity = days * minutesPerDay * params.acquisitionRatePerMinute * params.capacityUtilization;
  for (const tier of TIERS) {
    if (itemsUpToTier(pack, tier).length <= capacity) return tier;
  }
  return 0;
}

function situationOrder(
  pack: ContentPack,
  priorities: SituationPriority[] | undefined,
): Map<string, number> {
  const rankById = new Map<string, number>();
  priorities?.forEach((p) => rankById.set(p.situationId, p.rank));
  const n = pack.situations.length;

  const scored = pack.situations.map((s) => {
    // Higher score = earlier. Combine frequency×criticality default with the user's ranking.
    const userRank = rankById.get(s.id);
    const userWeight = userRank === undefined ? 0 : (n - userRank) * 3;
    const emergencyBoost = s.isEmergency ? 1000 : 0; // Emergency & survival glue front-loaded.
    return { s, score: emergencyBoost + s.priorityDefault + userWeight };
  });
  scored.sort((a, b) => b.score - a.score);

  const order = new Map<string, number>();
  scored.forEach((entry, idx) => order.set(entry.s.id, idx));
  return order;
}

function bestSituationOrder(item: ContentItem, order: Map<string, number>): number {
  let best = Number.POSITIVE_INFINITY;
  for (const sid of item.situationIds) {
    const o = order.get(sid);
    if (o !== undefined && o < best) best = o;
  }
  if (best === Number.POSITIVE_INFINITY) {
    // Item without a situation (numbers, glue): front-load survival tiers.
    return item.tier === 0 ? -1 : order.size + item.tier;
  }
  return best;
}

const KIND_RANK: Record<ContentItem['kind'], number> = {
  phrase: 0,
  number: 0,
  reply: 1,
  word: 2,
};

/** Order the tier's items into the sequence they should be introduced across the plan. */
export function orderLearnQueue(
  pack: ContentPack,
  tier: Tier,
  priorities: SituationPriority[] | undefined,
): ContentItem[] {
  const order = situationOrder(pack, priorities);
  return itemsUpToTier(pack, tier)
    .map((item) => ({ item, so: bestSituationOrder(item, order) }))
    .sort((a, b) => {
      if (a.so !== b.so) return a.so - b.so;
      if (a.item.tier !== b.item.tier) return a.item.tier - b.item.tier;
      if (KIND_RANK[a.item.kind] !== KIND_RANK[b.item.kind]) {
        return KIND_RANK[a.item.kind] - KIND_RANK[b.item.kind];
      }
      return (a.item.frequencyRank ?? 9999) - (b.item.frequencyRank ?? 9999);
    })
    .map((x) => x.item);
}

function startOfDayMs(ms: number): number {
  const d = new Date(ms);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Build (or re-build) a day-by-day trip plan (PDF §8.1). New-item introductions are allocated
 * across days with a deliberate taper — the final 1–2 days introduce almost nothing new and are
 * dominated by consolidation (spacing effect). Re-planning excludes already-seen items and, if
 * the remaining runway can't hold the remaining items, drops fringe items to protect the core.
 */
export function buildPlan(input: PlanInput): TripPlan {
  const params = input.params ?? DEFAULT_PARAMS;
  const departureMs = Date.parse(input.departureAt);
  const days = studyDaysUntil(input.nowMs, departureMs);
  const tier = selectTier(input.pack, days, input.minutesPerDay, params);

  const fullQueue = orderLearnQueue(input.pack, tier, input.situationPriorities);
  const seen = input.seenItemIds ?? new Set<string>();
  let toIntroduce = fullQueue.filter((it) => !seen.has(it.id));

  // Taper: the last min(2, days-1) days introduce no new items.
  const taperDays = Math.min(2, Math.max(0, days - 1));
  const activeDays = Math.max(1, days - taperDays);

  // Narrow scope if the remaining runway can't hold everything: drop fringe (protect core).
  const perDayCapacity = Math.floor(input.minutesPerDay * params.acquisitionRatePerMinute);
  const capacity = Math.max(1, Math.floor(activeDays * perDayCapacity * params.capacityUtilization));
  if (toIntroduce.length > capacity) {
    // fullQueue is already core-first; keep the front (core), drop the tail (fringe).
    toIntroduce = toIntroduce.slice(0, capacity);
  }

  const perDay = Math.ceil(toIntroduce.length / activeDays);
  const startMs = startOfDayMs(input.nowMs);
  const situationById = new Map<string, Situation>(input.pack.situations.map((s) => [s.id, s]));

  const daysOut = [];
  let cursor = 0;
  for (let d = 0; d < days; d++) {
    const isActive = d < activeDays;
    const slice = isActive ? toIntroduce.slice(cursor, cursor + perDay) : [];
    cursor += slice.length;
    const focus = focusSituationFor(slice, situationById);
    const day = {
      date: new Date(startMs + d * DAY_MS).toISOString(),
      newItemIds: slice.map((it) => it.id),
      ...(focus ? { focusSituationId: focus } : {}),
    };
    daysOut.push(day);
  }

  return {
    userId: input.userId,
    lang: input.pack.lang,
    departureAt: input.departureAt,
    minutesPerDay: input.minutesPerDay,
    tier,
    situationPriorities:
      input.situationPriorities ??
      input.pack.situations.map((s, i) => ({ situationId: s.id, rank: i })),
    days: daysOut,
    version: input.version ?? 1,
  };
}

function focusSituationFor(
  items: ContentItem[],
  situationById: Map<string, Situation>,
): string | undefined {
  const counts = new Map<string, number>();
  for (const it of items) {
    for (const sid of it.situationIds) {
      if (situationById.has(sid)) counts.set(sid, (counts.get(sid) ?? 0) + 1);
    }
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [sid, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      best = sid;
    }
  }
  return best;
}
