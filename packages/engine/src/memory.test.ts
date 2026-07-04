import { describe, expect, it } from 'vitest';
import type { ReviewEvent } from '@ready/content-schema';
import {
  applyReview,
  DAY_MS,
  lifecycleAt,
  projectAll,
  projectItem,
  projectedRetrievability,
  retrievabilityAt,
} from './memory.js';
import { DEFAULT_PARAMS } from './params.js';
import { makeItem } from './pack.fixtures.js';

const BASE = Date.parse('2026-07-01T18:00:00.000Z');
const recallItem = makeItem({ id: 'it.phrase.a', kind: 'phrase', skillTarget: 'recall' });
const recognizeItem = makeItem({ id: 'it.word.a', kind: 'word', skillTarget: 'recognize' });

function ev(partial: Partial<ReviewEvent> & Pick<ReviewEvent, 'mode' | 'outcome' | 'at'>): ReviewEvent {
  return {
    id: crypto.randomUUID(),
    userId: 'u1',
    itemId: recallItem.id,
    ...partial,
  };
}

describe('retrievability R(t) = exp(-t/S)', () => {
  it('is 1 at t=0 and decays exponentially', () => {
    const state = { stability: 2, lastReviewAt: new Date(BASE).toISOString() };
    expect(retrievabilityAt(state, BASE)).toBe(1);
    // After exactly S days, R should equal exp(-1) ≈ 0.3679.
    expect(retrievabilityAt(state, BASE + 2 * DAY_MS)).toBeCloseTo(Math.exp(-1), 5);
    // Larger stability decays slower.
    const stable = { stability: 10, lastReviewAt: new Date(BASE).toISOString() };
    expect(retrievabilityAt(stable, BASE + 2 * DAY_MS)).toBeGreaterThan(
      retrievabilityAt(state, BASE + 2 * DAY_MS),
    );
  });
});

describe('applyReview — first evidence', () => {
  it('seeds a strong initial stability on a recall pass', () => {
    const s = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    expect(s.stability).toBeCloseTo(DEFAULT_PARAMS.initialStabilitySuccess, 5);
    expect(s.level).toBeGreaterThanOrEqual(2); // a recall pass demonstrates production
    expect(s.successfulRecalls).toBe(1);
  });

  it('treats a swipe as a weak prior (low initial stability)', () => {
    const swipe = applyReview(null, ev({ mode: 'swipe', outcome: 'pass', at: new Date(BASE).toISOString() }), recognizeItem);
    const recall = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    expect(swipe.stability).toBeLessThan(recall.stability);
    expect(swipe.level).toBe(1); // recognition only, never claims recall
    expect(swipe.successfulRecalls).toBe(0);
  });

  it('seeds a low stability and stays at learning on a first failure', () => {
    const s = applyReview(null, ev({ mode: 'flashRecall', outcome: 'fail', at: new Date(BASE).toISOString() }), recallItem);
    expect(s.stability).toBeLessThanOrEqual(DEFAULT_PARAMS.initialStabilityFail);
    expect(s.lifecycle).toBe('learning');
  });
});

describe('applyReview — subsequent reviews', () => {
  it('successful recall increases stability (spacing growth)', () => {
    const first = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    const second = applyReview(
      first,
      ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + DAY_MS).toISOString() }),
      recallItem,
    );
    expect(second.stability).toBeGreaterThan(first.stability);
  });

  it('failure collapses stability toward the floor and re-queues (learning)', () => {
    let s = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    s = applyReview(s, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + 2 * DAY_MS).toISOString() }), recallItem);
    const strong = s.stability;
    const failed = applyReview(
      s,
      ev({ mode: 'flashRecall', outcome: 'fail', at: new Date(BASE + 4 * DAY_MS).toISOString() }),
      recallItem,
    );
    expect(failed.stability).toBeLessThan(strong);
    expect(failed.stability).toBeCloseTo(strong * DEFAULT_PARAMS.failStabilityFactor, 5);
    expect(failed.lifecycle).toBe('learning');
  });

  it('grows more when the item is more overdue (lower R → bigger gain)', () => {
    const first = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    const soon = applyReview(first, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + 0.2 * DAY_MS).toISOString() }), recallItem);
    const late = applyReview(first, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + 3 * DAY_MS).toISOString() }), recallItem);
    const soonGain = soon.stability / first.stability;
    const lateGain = late.stability / first.stability;
    expect(lateGain).toBeGreaterThan(soonGain);
  });

  it('marks fluent when a fast recall pass beats the fluency latency threshold', () => {
    let s = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    expect(s.fluentDemonstrated).toBe(false);
    s = applyReview(
      s,
      ev({ mode: 'flashRecall', outcome: 'pass', latencyMs: 1500, at: new Date(BASE + DAY_MS).toISOString() }),
      recallItem,
    );
    expect(s.fluentDemonstrated).toBe(true);
    expect(s.level).toBeGreaterThanOrEqual(3);
  });

  it('a swipe prior is overridden by objective recall evidence (P3)', () => {
    const swipe = applyReview(null, ev({ itemId: recognizeItem.id, mode: 'swipe', outcome: 'pass', at: new Date(BASE).toISOString() }), recognizeItem);
    const afterRecall = applyReview(
      swipe,
      ev({ itemId: recognizeItem.id, mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + DAY_MS).toISOString() }),
      recognizeItem,
    );
    expect(afterRecall.level).toBeGreaterThanOrEqual(2);
    expect(afterRecall.successfulRecalls).toBe(1);
  });
});

describe('spaced-recall counting', () => {
  it('counts two recalls only when ≥12h apart', () => {
    let s = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    // second recall only 1 hour later — should NOT count as a separate occasion
    s = applyReview(s, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + 3_600_000).toISOString() }), recallItem);
    expect(s.successfulRecalls).toBe(1);
    // third recall a day later — counts
    s = applyReview(s, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + DAY_MS).toISOString() }), recallItem);
    expect(s.successfulRecalls).toBe(2);
  });
});

describe('lifecycleAt', () => {
  it('surfaces a decayed consolidated item as lapsed', () => {
    const consolidated = {
      userId: 'u1',
      itemId: recallItem.id,
      stability: 10,
      difficulty: 5,
      level: 3 as const,
      lastReviewAt: new Date(BASE).toISOString(),
      lifecycle: 'consolidated' as const,
      successfulRecalls: 3,
      recallTimestamps: [],
      fluentDemonstrated: true,
    };
    expect(lifecycleAt(consolidated, BASE)).toBe('consolidated');
    // Far in the future, retrievability drops below the lapse threshold.
    expect(lifecycleAt(consolidated, BASE + 40 * DAY_MS)).toBe('lapsed');
  });
});

describe('projection from the event log (event sourcing, §11.4)', () => {
  it('projectItem replays events deterministically regardless of input order', () => {
    const e1 = ev({ mode: 'echo', outcome: 'pass', at: new Date(BASE).toISOString() });
    const e2 = ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + DAY_MS).toISOString() });
    const e3 = ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE + 2 * DAY_MS).toISOString() });
    const forward = projectItem([e1, e2, e3], recallItem);
    const shuffled = projectItem([e3, e1, e2], recallItem);
    expect(shuffled).toEqual(forward);
  });

  it('projectAll rebuilds states for many items and ignores unknown items', () => {
    const itemsById = new Map([[recallItem.id, recallItem]]);
    const events = [
      ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }),
      ev({ itemId: 'unknown', mode: 'swipe', outcome: 'pass', at: new Date(BASE).toISOString() }),
    ];
    const states = projectAll(events, itemsById);
    expect(states.size).toBe(1);
    expect(states.get(recallItem.id)?.successfulRecalls).toBe(1);
  });

  it('projectedRetrievability is monotically decreasing in the future', () => {
    const s = applyReview(null, ev({ mode: 'flashRecall', outcome: 'pass', at: new Date(BASE).toISOString() }), recallItem);
    const near = projectedRetrievability(s, BASE + DAY_MS);
    const far = projectedRetrievability(s, BASE + 5 * DAY_MS);
    expect(far).toBeLessThan(near);
  });
});
