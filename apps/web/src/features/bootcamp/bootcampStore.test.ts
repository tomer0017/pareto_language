import { beforeAll, describe, expect, it, vi } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import type * as StoreModule from './bootcampStore.js';

/**
 * The store's real load path: an existing local learner on the old 30-mission layout (v1, raw day
 * numbers) opens the app after the 29-mission change. Their completions must land on the same
 * missions, the retired Recovery Toolkit must vanish, and the result must be saved as v2.
 */
const disk = new Map<string, string>();
const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;

describe('bootcampStore — existing v1 progress survives the 29-mission change', () => {
  let useBootcampStore: typeof StoreModule.useBootcampStore;

  beforeAll(async () => {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => disk.get(k) ?? null,
      setItem: (k: string, v: string) => void disk.set(k, v),
      removeItem: (k: string) => void disk.delete(k),
    });
    // Old layout: Recovery Toolkit (1) + Introduce Myself (2) done, mid-way through Numbers & Money (3).
    disk.set('ready.bootcamp.v1.en', JSON.stringify({
      completedDays: [1, 2],
      receipts: [
        { day: 1, text: 'survived', at: '2026-01-01T00:00:00.000Z' },
        { day: 2, text: 'introduced', at: '2026-01-02T00:00:00.000Z' },
      ],
      stepIndex: { '1': 0, '2': 0, '3': 5 },
    }));
    ({ useBootcampStore } = await import('./bootcampStore.js'));
  });

  it('keeps Introduce Myself completed as Mission 1 and drops the Recovery Toolkit', () => {
    const s = useBootcampStore.getState();
    expect(s.completedDays).toEqual([dayOf('introduce-myself')]);
    expect(s.receipts.map((r) => r.text)).toEqual(['introduced']);
    expect(BOOTCAMP_PLAN.filter((m) => s.completedDays.includes(m.day)).length).toBe(1); // "1 of 29"
  });

  it('keeps the resume point on Numbers & Money', () => {
    expect(useBootcampStore.getState().stepIndex[String(dayOf('numbers-money'))]).toBe(5);
  });

  it('writes the migrated progress as v2 (keyed by mission id) and leaves v1 untouched', () => {
    const v2 = JSON.parse(disk.get('ready.bootcamp.v2.en')!) as { completed: string[]; stepIndex: Record<string, number> };
    expect(v2.completed).toEqual(['introduce-myself']);
    expect(v2.stepIndex['numbers-money']).toBe(5);
    expect(disk.has('ready.bootcamp.v1.en')).toBe(true);
  });

  it('the mission overview can enter the step-flow at a chosen step, which becomes the resume point', () => {
    const s = useBootcampStore.getState();
    s.startDay(dayOf('coffee-shop'));
    expect(useBootcampStore.getState().stage).toBe('hub');
    s.enterPractice(6);
    expect(useBootcampStore.getState().stage).toBe('play');
    expect(useBootcampStore.getState().index).toBe(6);
    const v2 = JSON.parse(disk.get('ready.bootcamp.v2.en')!) as { stepIndex: Record<string, number> };
    expect(v2.stepIndex['coffee-shop']).toBe(6);
    // ...and entering with no argument resumes there (reload-safe resume is unchanged).
    s.toHub();
    s.enterPractice();
    expect(useBootcampStore.getState().index).toBe(6);
    s.exit();
  });

  it('new completions persist by mission id', () => {
    const s = useBootcampStore.getState();
    s.startDay(dayOf('numbers-money'));
    s.completeDay();
    const v2 = JSON.parse(disk.get('ready.bootcamp.v2.en')!) as { completed: string[] };
    expect(v2.completed).toEqual(['introduce-myself', 'numbers-money']);
  });
});
