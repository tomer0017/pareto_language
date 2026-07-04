import { Router, type Response } from 'express';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { ReviewEventSchema, SessionLogSchema, TripPlanSchema } from './apiSchemas.js';
import {
  MemoryStateModel,
  ReviewEventModel,
  SessionLogModel,
  TripPlanModel,
  UserModel,
} from '../models/index.js';
import { requireAuth, setAuthCookie, signToken, tryGetUserId, type AuthedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { config } from '../config.js';
import { loadManifest } from '../services/content.js';
import { reprojectUser } from '../services/projection.js';
import { readinessForUser } from '../services/readiness.js';
import type { UserProfile } from '@ready/content-schema';
import { randomUUID } from 'node:crypto';

export const api = Router();

type AsyncHandler = (req: AuthedRequest, res: Response) => Promise<void | Response>;
/** Route rejections must reach the error middleware — Express 4 doesn't do this for async. */
const ah = (fn: AsyncHandler) => (req: AuthedRequest, res: Response, next: (err?: unknown) => void) => {
  fn(req, res).catch(next);
};

const googleClient = new OAuth2Client(config.googleClientId);

function toProfile(doc: { _id: string; identities: UserProfile['identities']; createdAt: string; settings: UserProfile['settings'] }): UserProfile {
  return { id: doc._id, identities: doc.identities, createdAt: doc.createdAt, settings: doc.settings };
}

/* ── Content ─────────────────────────────────────────────────────────────── */

api.get('/content/manifest', (_req, res) => {
  res.json(loadManifest());
});

/* ── Users & auth ────────────────────────────────────────────────────────── */

const AnonBody = z.object({
  /** Client-generated id so the device's local user and the server user are the same id. */
  clientUserId: z.string().regex(/^anon-[0-9a-fA-F-]{36}$/).optional(),
});

api.post('/users/anonymous', ah(async (req, res) => {
  const { clientUserId } = AnonBody.parse(req.body ?? {});
  const id = clientUserId ?? `anon-${randomUUID()}`;
  let user = await UserModel.findById(id);
  if (!user) {
    user = await UserModel.create({
      _id: id,
      identities: [{ provider: 'anonymous', subject: randomUUID() }],
      createdAt: new Date().toISOString(),
      settings: { playbackRate: 1, dyslexiaFont: false },
    });
  }
  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.status(201).json({ user: toProfile(user), token });
}));

const GoogleAuthBody = z.object({ credential: z.string().min(10) });

/**
 * Google Sign-In + anonymous→Google identity merge (PDF §13, mission M3 step 10).
 * If the caller is already authenticated as an anonymous user, their progress is merged into
 * the Google-linked account (or the anonymous account is upgraded in place).
 */
const handleGoogleAuth = ah(async (req: AuthedRequest, res: Response): Promise<void> => {
  const { credential } = GoogleAuthBody.parse(req.body);
  if (!config.googleClientId) {
    throw new AppError(503, 'google_not_configured', 'GOOGLE_CLIENT_ID is not set on the server');
  }
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: config.googleClientId }).catch(() => {
    throw new AppError(401, 'invalid_google_token', 'Google ID token verification failed');
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) throw new AppError(401, 'invalid_google_token', 'Google token missing subject');

  const googleIdentity = { provider: 'google' as const, subject: payload.sub, email: payload.email };
  const existing = await UserModel.findOne({ 'identities.provider': 'google', 'identities.subject': payload.sub });

  // Identify a possible anonymous session to merge from (cookie/bearer is optional here).
  let anonUserId: string | null = tryGetUserId(req);
  if (anonUserId) {
    const anon = await UserModel.findById(anonUserId);
    if (!anon || anon.identities.some((i) => i.provider === 'google')) anonUserId = null;
  }

  let finalUserId: string;
  if (existing && anonUserId && existing._id !== anonUserId) {
    // Merge: replay-in-timestamp-order is trivial because events are append-only — just move them.
    await ReviewEventModel.updateMany({ userId: anonUserId }, { $set: { userId: existing._id } });
    await SessionLogModel.updateMany({ userId: anonUserId }, { $set: { userId: existing._id } });
    const anonPlan = await TripPlanModel.findOne({ userId: anonUserId });
    const googlePlan = await TripPlanModel.findOne({ userId: existing._id });
    if (anonPlan && !googlePlan) {
      await TripPlanModel.updateOne({ userId: anonUserId }, { $set: { userId: existing._id } });
    } else if (anonPlan) {
      await TripPlanModel.deleteOne({ userId: anonUserId });
    }
    await MemoryStateModel.deleteMany({ userId: anonUserId });
    await UserModel.deleteOne({ _id: anonUserId });
    await reprojectUser(existing._id);
    finalUserId = existing._id;
  } else if (existing) {
    finalUserId = existing._id;
  } else if (anonUserId) {
    // Upgrade the anonymous user in place — progress kept with zero data movement.
    await UserModel.updateOne({ _id: anonUserId }, { $push: { identities: googleIdentity } });
    finalUserId = anonUserId;
  } else {
    const created = await UserModel.create({
      _id: `u-${randomUUID()}`,
      identities: [googleIdentity],
      createdAt: new Date().toISOString(),
      settings: { playbackRate: 1, dyslexiaFont: false },
    });
    finalUserId = created._id;
  }

  const user = await UserModel.findById(finalUserId);
  if (!user) throw new AppError(500, 'merge_failed', 'User disappeared during merge');
  const token = signToken(finalUserId);
  setAuthCookie(res, token);
  res.json({ user: toProfile(user), token });
});

api.post('/auth/google', handleGoogleAuth);
/** PDF §13 alias: attach a (Google) identity to the current user, merging progress. */
api.post('/me/identities', handleGoogleAuth);

/* ── Me: plan, events, states, sessions, readiness ───────────────────────── */

api.get('/me/plan', requireAuth, ah(async (req: AuthedRequest, res) => {
  const plan = await TripPlanModel.findOne({ userId: req.userId }).lean();
  res.json({ plan: plan ?? null });
}));

api.put('/me/plan', requireAuth, ah(async (req: AuthedRequest, res) => {
  const plan = TripPlanSchema.parse(req.body);
  if (plan.userId !== req.userId) throw new AppError(403, 'forbidden', 'Plan userId mismatch');
  await TripPlanModel.updateOne({ userId: req.userId }, { $set: plan }, { upsert: true });
  res.json({ plan });
}));

const BatchBody = z.object({ events: z.array(ReviewEventSchema).max(1000) });

/** Idempotent batch upload from the offline queue (PDF §13): client UUIDs are _ids. */
api.post(/^\/me\/review-events:batch$/, requireAuth, ah(async (req: AuthedRequest, res) => {
  const { events } = BatchBody.parse(req.body);
  const userId = req.userId as string;
  const docs = events.map((e) => ({ ...e, _id: e.id, userId }));
  if (docs.length > 0) {
    try {
      await ReviewEventModel.insertMany(docs, { ordered: false });
    } catch (err) {
      // Duplicate _ids are expected on retry — idempotency by design. Anything else re-throws.
      const anyErr = err as { code?: number; writeErrors?: { code?: number }[] };
      const dupOnly =
        anyErr.code === 11000 ||
        (Array.isArray(anyErr.writeErrors) && anyErr.writeErrors.every((w) => w.code === 11000));
      if (!dupOnly) throw err;
    }
  }
  const states = await reprojectUser(userId);
  res.json({ accepted: docs.length, memoryStates: states.length });
}));

api.get('/me/memory-states', requireAuth, ah(async (req: AuthedRequest, res) => {
  const states = await MemoryStateModel.find({ userId: req.userId }).lean();
  res.json({ memoryStates: states });
}));

api.get('/me/review-events', requireAuth, ah(async (req: AuthedRequest, res) => {
  const events = await ReviewEventModel.find({ userId: req.userId }).sort({ at: 1 }).lean();
  res.json({ events: events.map((e) => ({ ...e, id: e._id })) });
}));

api.post('/me/sessions', requireAuth, ah(async (req: AuthedRequest, res) => {
  const log = SessionLogSchema.parse(req.body);
  if (log.userId !== req.userId) throw new AppError(403, 'forbidden', 'Session userId mismatch');
  await SessionLogModel.updateOne({ _id: log.id }, { $set: { ...log, _id: log.id } }, { upsert: true });
  res.status(201).json({ ok: true });
}));

api.get('/me/readiness', requireAuth, ah(async (req: AuthedRequest, res) => {
  res.json({ readiness: await readinessForUser(req.userId as string) });
}));
