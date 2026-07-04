import { describe, expect, it } from 'vitest';
import type { ContentItem, ContentPack, MemoryState, ReviewEvent } from '@ready/content-schema';
import { applyReview, DAY_MS } from './memory.js';
import { buildPlan } from './planner.js';
import { scheduleSession, type SchedulableItem } from './scheduler.js';
import { makeSyntheticPack } from './pack.fixtures.js';

/**
 * The engine proof (PDF §8, §15 sequencing rationale, mission brief M0).
 *
 * A virtual learner with a configurable forgetting rate runs a real 7-day × 30-min plan produced
 * by the plan engine and driven by the deadline-aware scheduler. We assert:
 *   1. The scheduler never exceeds the daily minutes budget.
 *   2. ≥80% of Tier-1 core phrases reach L2+ (recall) at departure.
 *   3. ≥80% of recognition items (replies/words) reach L1+ (their asymmetric target, §6.3).
 * These behaviours are the product; a regression in any of them fails this test.
 */

/** Deterministic PRNG (mulberry32) so the simulation is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface LearnerConfig {
  forgetRate: number; // higher = forgets faster
  learnRate: number; // fractional true-stability growth per successful practice
  baseStability: number; // days of true stability from a first exposure
  seed: number;
}

interface TrueMem {
  trueStability: number;
  lastAt: number;
}

interface SimResult {
  phraseMasteredPct: number;
  recognitionKnownPct: number;
  budgetAlwaysRespected: boolean;
  daysSimulated: number;
}

function simulate(pack: ContentPack, cfg: LearnerConfig, minutesPerDay: number): SimResult {
  const rng = mulberry32(cfg.seed);
  const itemsById = new Map<string, ContentItem>(pack.items.map((it) => [it.id, it]));
  const situationById = new Map(pack.situations.map((s) => [s.id, s]));
  const states = new Map<string, MemoryState>();
  const trueMem = new Map<string, TrueMem>();

  const NOW = Date.parse('2026-07-04T09:00:00.000Z');
  const departureAt = new Date(NOW + 7 * DAY_MS).toISOString();
  const departureMs = Date.parse(departureAt);

  const plan = buildPlan({ pack, userId: 'u1', departureAt, nowMs: NOW, minutesPerDay });

  const priorityFor = (item: ContentItem): { priority: number; emergency: boolean } => {
    for (const sid of item.situationIds) {
      const s = situationById.get(sid);
      if (s) return { priority: s.priorityDefault, emergency: s.isEmergency };
    }
    return { priority: 0, emergency: false };
  };

  const onLearn = (itemId: string, atMs: number, success: boolean): void => {
    const tm = trueMem.get(itemId);
    if (!tm) {
      trueMem.set(itemId, { trueStability: cfg.baseStability * (success ? 1 : 0.5), lastAt: atMs });
      return;
    }
    tm.trueStability = Math.max(0.2, tm.trueStability * (success ? 1 + cfg.learnRate : 0.85));
    tm.lastAt = atMs;
  };

  const runTest = (itemId: string, atMs: number): boolean => {
    const tm = trueMem.get(itemId);
    if (!tm) return false;
    const elapsedDays = (atMs - tm.lastAt) / DAY_MS;
    const p = Math.exp((-elapsedDays * cfg.forgetRate) / tm.trueStability);
    return rng() < p;
  };

  let budgetAlwaysRespected = true;

  for (const day of plan.days) {
    const dayStart = Date.parse(day.date) + 18 * 3_600_000; // evening session

    const candidates: SchedulableItem[] = [...states.entries()].map(([itemId, state]) => {
      const item = itemsById.get(itemId)!;
      const { priority, emergency } = priorityFor(item);
      return { item, state, situationPriority: priority, isEmergency: emergency };
    });

    const newQueue: SchedulableItem[] = day.newItemIds
      .map((id) => itemsById.get(id))
      .filter((it): it is ContentItem => it !== undefined)
      .map((item) => {
        const { priority, emergency } = priorityFor(item);
        return { item, state: null, situationPriority: priority, isEmergency: emergency };
      });

    const sched = scheduleSession({
      candidates,
      newQueue,
      departureMs,
      nowMs: dayStart,
      minutesPerDay: minutesPerDay,
      minutesBudget: minutesPerDay,
    });

    if (sched.estTotalSeconds > sched.budgetSeconds) budgetAlwaysRespected = false;

    let cursorSec = 0;
    const apply = (itemId: string, mode: ReviewEvent['mode'], outcome: ReviewEvent['outcome'], latencyMs?: number): void => {
      const at = new Date(dayStart + cursorSec * 1000).toISOString();
      const item = itemsById.get(itemId)!;
      const event: ReviewEvent = {
        id: crypto.randomUUID(),
        userId: 'u1',
        itemId,
        mode,
        outcome,
        at,
        ...(latencyMs !== undefined ? { latencyMs } : {}),
      };
      const prev = states.get(itemId) ?? null;
      states.set(itemId, applyReview(prev, event, item));
    };

    for (const step of sched.steps) {
      const atMs = dayStart + cursorSec * 1000;
      const isExposure = step.kind === 'new' || step.mode === 'echo' || step.mode === 'swipe';
      if (isExposure) {
        onLearn(step.itemId, atMs, true);
        apply(step.itemId, step.mode, 'pass');
      } else {
        const pass = runTest(step.itemId, atMs);
        if (pass) {
          onLearn(step.itemId, atMs, true);
          const latency = 800 + rng() * 4000;
          apply(step.itemId, step.mode, 'pass', step.mode === 'flashRecall' ? latency : undefined);
        } else {
          onLearn(step.itemId, atMs, false);
          apply(step.itemId, step.mode, 'fail');
          // 3-strike relearn: immediate corrective retrieval after seeing the answer (§8.2).
          cursorSec += 4;
          onLearn(step.itemId, atMs + 4000, true);
          apply(step.itemId, step.mode, 'pass');
        }
      }
      cursorSec += step.estSeconds;
    }
  }

  // Evaluate at departure over the items the plan actually taught.
  const taught = new Set(plan.days.flatMap((d) => d.newItemIds));
  const tier1Phrases = pack.items.filter(
    (it) => taught.has(it.id) && it.kind === 'phrase' && it.tier === 1,
  );
  const recognitionItems = pack.items.filter(
    (it) => taught.has(it.id) && (it.kind === 'reply' || it.kind === 'word'),
  );

  const phraseMastered = tier1Phrases.filter((it) => (states.get(it.id)?.level ?? 0) >= 2).length;
  const recognitionKnown = recognitionItems.filter(
    (it) => (states.get(it.id)?.level ?? 0) >= 1,
  ).length;

  return {
    phraseMasteredPct: tier1Phrases.length ? phraseMastered / tier1Phrases.length : 1,
    recognitionKnownPct: recognitionItems.length ? recognitionKnown / recognitionItems.length : 1,
    budgetAlwaysRespected,
    daysSimulated: plan.days.length,
  };
}

describe('simulated learner — 7-day × 30-min plan', () => {
  const pack = makeSyntheticPack();

  it('never exceeds the daily budget and masters ≥80% of Tier-1 phrases (normal forgetter)', () => {
    const res = simulate(pack, { forgetRate: 1.0, learnRate: 0.9, baseStability: 1.0, seed: 42 }, 30);
    expect(res.daysSimulated).toBe(7);
    expect(res.budgetAlwaysRespected).toBe(true);
    expect(res.phraseMasteredPct).toBeGreaterThanOrEqual(0.8);
    expect(res.recognitionKnownPct).toBeGreaterThanOrEqual(0.8);
  });

  it('holds up across a cohort of forgetting rates (mean ≥80%)', () => {
    const seeds = [1, 7, 13, 21, 99];
    const results = seeds.map((seed, i) =>
      simulate(pack, { forgetRate: 0.8 + i * 0.15, learnRate: 0.9, baseStability: 1.0, seed }, 30),
    );
    const meanPhrase =
      results.reduce((a, r) => a + r.phraseMasteredPct, 0) / results.length;
    expect(results.every((r) => r.budgetAlwaysRespected)).toBe(true);
    expect(meanPhrase).toBeGreaterThanOrEqual(0.8);
  });

  it('a faster/smaller time budget still respects the budget every day', () => {
    const res = simulate(pack, { forgetRate: 1.2, learnRate: 0.8, baseStability: 1.0, seed: 5 }, 10);
    expect(res.budgetAlwaysRespected).toBe(true);
  });
});
