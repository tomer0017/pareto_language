import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { travelReadiness } from './readiness.js';

/**
 * Travel Readiness is derived from stored mission progress only: ready ÷ the plan's length. These
 * tests pin that honesty (no invented numbers) and the "what do I do next?" decision Home relies on.
 */
const all = (): boolean => true;
const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;
const fresh = { completedDays: [], stepIndex: {} };

describe('travelReadiness — real progress, never a guess', () => {
  it('a new learner is 0 of 29 (0%), and the next step is Introduce Myself', () => {
    const r = travelReadiness(fresh, all);
    expect(r.total).toBe(29);
    expect(r.total).toBe(BOOTCAMP_PLAN.length);
    expect(r.ready).toBe(0);
    expect(r.pct).toBe(0);
    expect(r.remaining).toBe(29);
    expect(r.allDone).toBe(false);
    expect(r.next?.id).toBe('introduce-myself');
    expect(r.nextIsResume).toBe(false);
  });

  it('the percentage is exactly completed ÷ total', () => {
    const eight = BOOTCAMP_PLAN.slice(0, 8).map((m) => m.day);
    const r = travelReadiness({ completedDays: eight, stepIndex: {} }, all);
    expect(r.ready).toBe(8);
    expect(r.pct).toBe(Math.round((8 / 29) * 100));
    expect(r.remaining).toBe(21);
    expect(travelReadiness({ completedDays: [eight[0]!], stepIndex: {} }, all).pct).toBe(3);
  });

  it('a started-but-unfinished mission is the next step (resume beats the next new one)', () => {
    const r = travelReadiness({ completedDays: [dayOf('introduce-myself')], stepIndex: { [String(dayOf('coffee-shop'))]: 4 } }, all);
    expect(r.next?.id).toBe('coffee-shop');
    expect(r.nextIsResume).toBe(true);
    expect(r.statusOf(dayOf('introduce-myself'))).toBe('ready');
    expect(r.statusOf(dayOf('coffee-shop'))).toBe('inProgress');
    expect(r.statusOf(dayOf('numbers-money'))).toBe('notStarted');
  });

  it('with nothing in progress, the next step is the first mission not yet completed', () => {
    const r = travelReadiness({ completedDays: [dayOf('introduce-myself'), dayOf('coffee-shop')], stepIndex: {} }, all);
    expect(r.next?.id).toBe('numbers-money');
    expect(r.nextIsResume).toBe(false);
  });

  it('everything completed → 100%, all done, and the first mission is offered as a replay', () => {
    const r = travelReadiness({ completedDays: BOOTCAMP_PLAN.map((m) => m.day), stepIndex: {} }, all);
    expect(r.pct).toBe(100);
    expect(r.remaining).toBe(0);
    expect(r.allDone).toBe(true);
    expect(r.next?.id).toBe('introduce-myself');
  });

  it('a mission not built for the language is unavailable, never next, never counted', () => {
    const builtOnly = (id: string) => (m: { id: string }) => m.id === id;
    const r = travelReadiness({ completedDays: [dayOf('introduce-myself')], stepIndex: {} }, builtOnly('numbers-money'));
    expect(r.statusOf(dayOf('coffee-shop'))).toBe('unavailable');
    expect(r.next?.id).toBe('numbers-money');
    expect(r.ready).toBe(0); // the completed mission is not built here, so it is not counted
    expect(r.total).toBe(29); // the denominator stays the whole curriculum
    expect(travelReadiness(fresh, () => false).next).toBeUndefined();
  });

  it('ignores completions that are not in the plan (e.g. a retired mission)', () => {
    const r = travelReadiness({ completedDays: [999, dayOf('taxi')], stepIndex: {} }, all);
    expect(r.ready).toBe(1);
    expect(r.statusOf(999)).toBe('unavailable');
  });
});
