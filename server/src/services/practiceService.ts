import { randomUUID } from 'node:crypto';
import type { PracticeMode, ReviewEvent } from '@ready/content-schema';
import { DAY_MS } from '@ready/engine';
import { MemoryStateModel, ReviewEventModel } from '../models/index.js';
import { practiceSessionDal } from '../dal/practiceDal.js';
import { AppError } from '../middleware/error.js';
import { reprojectUser } from './projection.js';

/**
 * Practice + progress. The append-only engine event log stays the single source of truth
 * (PDF §11.4) — the simplified result/status vocabulary requested by the product maps onto it,
 * it does not replace it. Spaced repetition comes from the engine's FSRS-style model: a wrong
 * answer collapses stability (item returns almost immediately = "weak"), successes grow the
 * interval, mastered items return rarely but are never hidden forever (R(t) always decays).
 */

export type SimpleResult = 'correct' | 'wrong' | 'known' | 'unknown';

const MODE_ALIASES: Record<string, PracticeMode> = {
  swipe: 'swipe',
  flashRecall: 'flashRecall',
  recall: 'flashRecall',
  echo: 'echo',
  listen: 'listen',
  listening: 'listen',
  numberSprint: 'numberSprint',
  speedChallenge: 'numberSprint',
  simulator: 'simulator',
};

function toEngineEvent(input: {
  userId: string;
  itemId: string;
  result: SimpleResult;
  sourceGame: string;
  responseTimeMs?: number;
}): ReviewEvent {
  const mode = MODE_ALIASES[input.sourceGame];
  if (!mode) throw new AppError(400, 'unknown_game', `Unknown sourceGame "${input.sourceGame}"`);
  const outcome = input.result === 'correct' || input.result === 'known' ? 'pass' : 'fail';
  return {
    id: randomUUID(),
    userId: input.userId,
    itemId: input.itemId,
    mode,
    outcome,
    at: new Date().toISOString(),
    ...(input.responseTimeMs !== undefined ? { latencyMs: input.responseTimeMs } : {}),
  };
}

/** Simplified status view over the engine state (never stored — always derived). */
function simplify(state: {
  itemId: string;
  lifecycle: string;
  level: number;
  stability: number;
  lastReviewAt: string;
  successfulRecalls: number;
}): {
  itemId: string;
  status: 'new' | 'learning' | 'known' | 'weak' | 'mastered';
  correctCount: number;
  lastSeenAt: string;
  nextReviewAt: string;
  knownUntil: string;
} {
  // weak = it slid back (lapsed, or failed after having been recalled before).
  const status =
    state.lifecycle === 'new'
      ? 'new'
      : state.lifecycle === 'lapsed'
        ? 'weak'
        : state.lifecycle === 'consolidated'
          ? 'mastered'
          : state.lifecycle === 'learning' && state.successfulRecalls >= 1
            ? 'weak'
            : state.level >= 2
              ? 'known'
              : 'learning';
  const last = Date.parse(state.lastReviewAt);
  // Due when R(t)=exp(-t/S) falls to 0.9 → t = S·ln(1/0.9); "known until" at the 0.7 lapse line.
  const nextReviewAt = new Date(last + state.stability * Math.log(1 / 0.9) * DAY_MS).toISOString();
  const knownUntil = new Date(last + state.stability * Math.log(1 / 0.7) * DAY_MS).toISOString();
  return {
    itemId: state.itemId,
    status,
    correctCount: state.successfulRecalls,
    lastSeenAt: state.lastReviewAt,
    nextReviewAt,
    knownUntil,
  };
}

export const practiceService = {
  /** Record one answer: append the engine event, re-project memory state. */
  async recordReview(userId: string, input: { itemId: string; result: SimpleResult; sourceGame: string; responseTimeMs?: number }) {
    const event = toEngineEvent({ userId, ...input });
    try {
      await ReviewEventModel.create({ ...event, _id: event.id });
    } catch (err) {
      const code = (err as { code?: number }).code;
      if (code !== 11000) throw err; // duplicate id = idempotent retry, fine
    }
    await reprojectUser(userId);
    const state = await MemoryStateModel.findOne({ userId, itemId: input.itemId }).lean();
    return { eventId: event.id, memoryState: state ? simplify(state) : null };
  },

  async memoryStates(userId: string, languageCode?: string) {
    const filter: Record<string, unknown> = { userId };
    if (languageCode) filter.itemId = { $regex: `^${languageCode}\\.` };
    const states = await MemoryStateModel.find(filter).lean();
    // Wrong-answer counts come from the event log (the projection doesn't cache them).
    const fails = await ReviewEventModel.aggregate<{ _id: string; n: number }>([
      { $match: { userId, outcome: 'fail' } },
      { $group: { _id: '$itemId', n: { $sum: 1 } } },
    ]);
    const failByItem = new Map(fails.map((f) => [f._id, f.n]));
    return states.map((s) => ({ ...simplify(s), wrongCount: failByItem.get(s.itemId) ?? 0, languageCode: s.itemId.split('.')[0] }));
  },

  async startSession(userId: string, input: { languageCode: string; mode: string; itemIds?: string[] }) {
    const doc = await practiceSessionDal.create({
      _id: randomUUID(),
      userId,
      languageCode: input.languageCode,
      mode: input.mode,
      startedAt: new Date(),
      itemIds: input.itemIds ?? [],
      correctCount: 0,
      wrongCount: 0,
    });
    return { id: doc._id, startedAt: doc.startedAt.toISOString() };
  },

  async endSession(userId: string, id: string, patch: { correctCount?: number; wrongCount?: number; itemIds?: string[] }) {
    const existing = await practiceSessionDal.byId(id);
    if (!existing) throw new AppError(404, 'session_not_found', `No practice session "${id}"`);
    if (existing.userId !== userId) throw new AppError(403, 'forbidden', 'Not your session');
    return practiceSessionDal.end(id, { endedAt: new Date(), ...patch });
  },
};
