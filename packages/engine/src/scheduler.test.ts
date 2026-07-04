import { describe, expect, it } from 'vitest';
import type { MemoryState, ReviewEvent } from '@ready/content-schema';
import { applyReview, DAY_MS } from './memory.js';
import {
  expectedRGain,
  isDue,
  itemValue,
  scheduleSession,
  shouldRequeue,
  type SchedulableItem,
} from './scheduler.js';
import { makeItem } from './pack.fixtures.js';

const NOW = Date.parse('2026-07-04T18:00:00.000Z');
const DEPARTURE = NOW + 5 * DAY_MS;

function seenItem(id: string, opts: Partial<SchedulableItem> = {}): SchedulableItem {
  const item = makeItem({ id, kind: 'phrase', skillTarget: 'recall', ...opts.item });
  const ev: ReviewEvent = {
    id: crypto.randomUUID(),
    userId: 'u1',
    itemId: id,
    mode: 'flashRecall',
    outcome: 'pass',
    at: new Date(NOW - 3 * DAY_MS).toISOString(),
  };
  const state = applyReview(null, ev, item);
  return { item, state, situationPriority: 1, isEmergency: false, ...opts };
}

describe('itemValue', () => {
  it('values lower tiers and emergency items more', () => {
    const t0 = makeItem({ id: 'a', tier: 0 });
    const t3 = makeItem({ id: 'b', tier: 3 });
    expect(itemValue(t0, 1, false)).toBeGreaterThan(itemValue(t3, 1, false));
    expect(itemValue(t0, 1, true)).toBeGreaterThan(itemValue(t0, 1, false));
  });
});

describe('expectedRGain', () => {
  it('is positive for a decayed item and larger than for a fresh one', () => {
    const decayed = seenItem('decayed');
    const fresh: SchedulableItem = {
      item: makeItem({ id: 'fresh', kind: 'phrase' }),
      state: applyReview(null, {
        id: crypto.randomUUID(),
        userId: 'u1',
        itemId: 'fresh',
        mode: 'flashRecall',
        outcome: 'pass',
        at: new Date(NOW).toISOString(),
      }, makeItem({ id: 'fresh' })),
      situationPriority: 1,
      isEmergency: false,
    };
    const gDecayed = expectedRGain(decayed, NOW, DEPARTURE);
    const gFresh = expectedRGain(fresh, NOW, DEPARTURE);
    expect(gDecayed).toBeGreaterThan(0);
    expect(gDecayed).toBeGreaterThan(gFresh);
  });
});

describe('scheduleSession', () => {
  it('never exceeds the minutes budget', () => {
    const candidates = Array.from({ length: 60 }, (_, i) => seenItem(`c${i}`));
    const sched = scheduleSession({
      candidates,
      newQueue: [],
      departureMs: DEPARTURE,
      nowMs: NOW,
      minutesBudget: 5,
    });
    expect(sched.estTotalSeconds).toBeLessThanOrEqual(sched.budgetSeconds);
    expect(sched.steps.length).toBeGreaterThan(0);
  });

  it('ranks higher-value, more-decayed, cheaper items first', () => {
    const emergency = seenItem('emergency', { isEmergency: true, situationPriority: 5 });
    const trivial = seenItem('trivial', { situationPriority: 0 });
    const sched = scheduleSession({
      candidates: [trivial, emergency],
      newQueue: [],
      departureMs: DEPARTURE,
      nowMs: NOW,
      minutesBudget: 30,
    });
    const first = sched.steps.find((s) => s.kind === 'review');
    expect(first?.itemId).toBe('emergency');
  });

  it('interleaves new-item micro-batches between review bursts', () => {
    const candidates = Array.from({ length: 20 }, (_, i) => seenItem(`c${i}`));
    const newQueue: SchedulableItem[] = Array.from({ length: 6 }, (_, i) => ({
      item: makeItem({ id: `n${i}`, kind: 'phrase' }),
      state: null,
      situationPriority: 1,
      isEmergency: false,
    }));
    const sched = scheduleSession({
      candidates,
      newQueue,
      departureMs: DEPARTURE,
      nowMs: NOW,
      minutesBudget: 30,
      newBatchSize: 3,
    });
    const kinds = sched.steps.map((s) => s.kind);
    expect(kinds).toContain('new');
    expect(kinds).toContain('review');
    // The first steps should be reviews (warm-up before new material).
    expect(kinds[0]).toBe('review');
  });

  it('reverts to a long horizon after departure (still schedules useful reviews)', () => {
    const candidates = Array.from({ length: 10 }, (_, i) => seenItem(`c${i}`));
    const past = DEPARTURE + 3 * DAY_MS;
    const sched = scheduleSession({
      candidates,
      newQueue: [],
      departureMs: DEPARTURE,
      nowMs: past,
      minutesBudget: 10,
    });
    expect(sched.steps.length).toBeGreaterThan(0);
  });
});

describe('relearn loop and due check', () => {
  it('re-queues an item up to 3 strikes', () => {
    expect(shouldRequeue(0)).toBe(true);
    expect(shouldRequeue(2)).toBe(true);
    expect(shouldRequeue(3)).toBe(false);
  });

  it('marks an item due once retrievability drops', () => {
    const item = makeItem({ id: 'x' });
    const state: MemoryState = applyReview(null, {
      id: crypto.randomUUID(),
      userId: 'u1',
      itemId: 'x',
      mode: 'flashRecall',
      outcome: 'pass',
      at: new Date(NOW).toISOString(),
    }, item);
    expect(isDue(state, NOW)).toBe(false);
    expect(isDue(state, NOW + 3 * DAY_MS)).toBe(true);
  });
});
