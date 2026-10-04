import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN, EXTENDED_POOL, MERGED_MISSIONS } from './plan.js';
import { fromStored, migrateV1, toStored, type BootcampProgress } from './progress.js';

/**
 * Bootcamp progress persistence. On disk, progress is keyed by stable mission id (v2); the one-time
 * v1 migration maps the old 30-mission day numbers onto those ids — old 2 → Introduce Myself, …,
 * old 30 → the finale — and drops the retired Recovery Toolkit (old day 1).
 */
const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;

describe('v1 → v2 migration (30-mission day numbers → stable mission ids)', () => {
  it('maps every old mission 2–30 onto its stable id — the v1 curriculum is frozen history', () => {
    const v1 = { completedDays: Array.from({ length: 29 }, (_, i) => i + 2), receipts: [], stepIndex: {} };
    const migrated = migrateV1(v1);
    expect(migrated.completed).toHaveLength(29);
    expect(migrated.completed[0]).toBe('introduce-myself');
    expect(migrated.completed.at(-1)).toBe('complete-day-abroad');
    // Loaded into today's app: every mission that still exists keeps its completion — the Core ones
    // and the Extended Pool ones. Only the three merged-away missions have nowhere to land.
    const loaded = fromStored(migrated).completedDays;
    const survivors = [...BOOTCAMP_PLAN, ...EXTENDED_POOL].filter((m) => migrated.completed.includes(m.id));
    expect(loaded.slice().sort((a, b) => a - b)).toEqual(survivors.map((m) => m.day).sort((a, b) => a - b));
    expect(loaded).toHaveLength(29 - MERGED_MISSIONS.length);
    for (const gone of MERGED_MISSIONS) expect(migrated.completed).toContain(gone.id);
  });

  it('a learner who finished old Mission 2 keeps Introduce Myself completed', () => {
    const progress = fromStored(migrateV1({ completedDays: [2], receipts: [], stepIndex: {} }));
    expect(progress.completedDays).toEqual([dayOf('introduce-myself')]);
  });

  it('drops the old Recovery Toolkit (day 1): completion, receipts and resume point', () => {
    const migrated = migrateV1({
      completedDays: [1, 3],
      receipts: [
        { day: 1, text: 'survived', at: '2026-01-01T00:00:00.000Z' },
        { day: 3, text: 'paid', at: '2026-01-02T00:00:00.000Z' },
      ],
      stepIndex: { '1': 4, '4': 6 },
    });
    expect(migrated.completed).toEqual(['numbers-money']);
    expect(migrated.receipts).toEqual([{ mission: 'numbers-money', text: 'paid', at: '2026-01-02T00:00:00.000Z' }]);
    expect(migrated.stepIndex).toEqual({ 'coffee-shop': 6 });
  });

  it('moves the old checkpoints 10/18/24/30 with their missions', () => {
    expect(migrateV1({ completedDays: [10, 18, 24, 30], receipts: [], stepIndex: {} }).completed)
      .toEqual(['arrival-day-checkpoint', 'food-day-checkpoint', 'city-day-checkpoint', 'complete-day-abroad']);
  });

  it('tolerates partial or out-of-range v1 data without throwing', () => {
    expect(migrateV1({})).toEqual({ completed: [], receipts: [], stepIndex: {} });
    expect(migrateV1({ completedDays: [0, 31, 99], receipts: [], stepIndex: { '31': 2 } }))
      .toEqual({ completed: [], receipts: [], stepIndex: {} });
  });
});

describe('v2 storage round-trip (keyed by mission id, not by number)', () => {
  it('stores ids and restores the same in-memory progress', () => {
    const progress: BootcampProgress = {
      completedDays: [dayOf('introduce-myself'), dayOf('coffee-shop')],
      receipts: [{ day: dayOf('coffee-shop'), text: 'ordered', at: '2026-02-01T00:00:00.000Z' }],
      stepIndex: { [String(dayOf('directions'))]: 3 },
    };
    const stored = toStored(progress);
    expect(stored.completed).toEqual(['introduce-myself', 'coffee-shop']);
    expect(stored.receipts[0]!.mission).toBe('coffee-shop');
    expect(stored.stepIndex).toEqual({ directions: 3 });
    expect(fromStored(stored)).toEqual(progress);
  });

  it('ignores ids the plan no longer has, and malformed data, instead of crashing', () => {
    expect(fromStored({ completed: ['recovery-toolkit', 'taxi'], receipts: [], stepIndex: { gone: 2 } }))
      .toEqual({ completedDays: [dayOf('taxi')], receipts: [], stepIndex: {} });
    expect(fromStored({})).toEqual({ completedDays: [], receipts: [], stepIndex: {} });
  });

  it('a new learner has 0 of 30 missions complete', () => {
    const fresh = fromStored({});
    const done = BOOTCAMP_PLAN.filter((m) => fresh.completedDays.includes(m.day)).length;
    expect(`${done}/${BOOTCAMP_PLAN.length}`).toBe('0/30');
  });
});
