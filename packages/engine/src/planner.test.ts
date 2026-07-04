import { describe, expect, it } from 'vitest';
import { DAY_MS } from './memory.js';
import { buildPlan, orderLearnQueue, selectTier } from './planner.js';
import { makeSyntheticPack } from './pack.fixtures.js';

const NOW = Date.parse('2026-07-04T09:00:00.000Z');
const pack = makeSyntheticPack();

describe('selectTier', () => {
  it('selects a deeper tier when more time is available', () => {
    const small = selectTier(pack, 2, 20);
    const big = selectTier(pack, 40, 45);
    expect(big).toBeGreaterThanOrEqual(small);
  });

  it('never exceeds capacity — a tiny budget selects Tier 0', () => {
    expect(selectTier(pack, 1, 10)).toBe(0);
  });
});

describe('orderLearnQueue', () => {
  it('front-loads emergency situations', () => {
    const queue = orderLearnQueue(pack, 1, undefined);
    const emergencySituation = pack.situations.find((s) => s.isEmergency)!;
    const firstEmergencyIdx = queue.findIndex((it) =>
      it.situationIds.includes(emergencySituation.id),
    );
    // An emergency item should appear within the first two situations' worth of items.
    expect(firstEmergencyIdx).toBeGreaterThanOrEqual(0);
    expect(firstEmergencyIdx).toBeLessThan(pack.situations[0]!.corePhraseIds.length * 2 + 10);
  });

  it('respects user priorities by pulling a ranked situation forward', () => {
    const target = pack.situations[pack.situations.length - 2]!; // a non-emergency, low default
    const queue = orderLearnQueue(pack, 1, [{ situationId: target.id, rank: 0 }]);
    const idx = queue.findIndex((it) => it.situationIds.includes(target.id));
    const baselineIdx = orderLearnQueue(pack, 1, undefined).findIndex((it) =>
      it.situationIds.includes(target.id),
    );
    expect(idx).toBeLessThan(baselineIdx);
  });
});

describe('buildPlan', () => {
  const departureAt = new Date(NOW + 7 * DAY_MS).toISOString();

  it('produces one plan-day per day until departure', () => {
    const plan = buildPlan({ pack, userId: 'u1', departureAt, nowMs: NOW, minutesPerDay: 30 });
    expect(plan.days.length).toBe(7);
    expect(plan.lang).toBe(pack.lang);
  });

  it('tapers: the final days introduce no new items (spacing effect)', () => {
    const plan = buildPlan({ pack, userId: 'u1', departureAt, nowMs: NOW, minutesPerDay: 30 });
    const lastDay = plan.days.at(-1)!;
    const secondLast = plan.days.at(-2)!;
    expect(lastDay.newItemIds.length).toBe(0);
    expect(secondLast.newItemIds.length).toBe(0);
    // ...but earlier days do introduce new items.
    expect(plan.days[0]!.newItemIds.length).toBeGreaterThan(0);
  });

  it('introduces every planned item exactly once across the plan', () => {
    const plan = buildPlan({ pack, userId: 'u1', departureAt, nowMs: NOW, minutesPerDay: 30 });
    const all = plan.days.flatMap((d) => d.newItemIds);
    expect(new Set(all).size).toBe(all.length);
  });

  it('re-plans by excluding already-seen items and narrowing scope on a missed day', () => {
    const plan = buildPlan({ pack, userId: 'u1', departureAt, nowMs: NOW, minutesPerDay: 30 });
    const introducedDay1 = new Set(plan.days[0]!.newItemIds);
    // Simulate a missed day: replan with less runway and day-1 items already seen.
    const replanned = buildPlan({
      pack,
      userId: 'u1',
      departureAt,
      nowMs: NOW + 2 * DAY_MS,
      minutesPerDay: 30,
      seenItemIds: introducedDay1,
      version: 2,
    });
    const replannedNew = new Set(replanned.days.flatMap((d) => d.newItemIds));
    for (const id of introducedDay1) expect(replannedNew.has(id)).toBe(false);
    expect(replanned.version).toBe(2);
    expect(replanned.days.length).toBe(5);
  });

  it('assigns a focus situation to active days', () => {
    const plan = buildPlan({ pack, userId: 'u1', departureAt, nowMs: NOW, minutesPerDay: 30 });
    expect(plan.days[0]!.focusSituationId).toBeDefined();
  });
});
