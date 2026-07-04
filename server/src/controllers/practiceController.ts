import type { Response } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { resolveActor } from '../services/actor.js';
import { practiceService } from '../services/practiceService.js';
import { readinessForUser } from '../services/readiness.js';

const Anon = z.string().regex(/^anon-[0-9a-fA-F-]{36}$/).optional();

const ReviewBody = z.object({
  anonymousId: Anon,
  itemId: z.string().min(1),
  itemType: z.enum(['word', 'phrase', 'situation']).optional(),
  languageCode: z.string().min(2).max(5),
  result: z.enum(['correct', 'wrong', 'known', 'unknown']),
  sourceGame: z.string().min(1),
  responseTimeMs: z.number().nonnegative().optional(),
});

const SessionBody = z.object({
  anonymousId: Anon,
  languageCode: z.string().min(2).max(5),
  mode: z.string().min(1),
  itemIds: z.array(z.string()).optional(),
});

const EndBody = z.object({
  anonymousId: Anon,
  correctCount: z.number().int().nonnegative().optional(),
  wrongCount: z.number().int().nonnegative().optional(),
  itemIds: z.array(z.string()).optional(),
});

const StateQuery = z.object({ languageCode: z.string().min(2).max(5).optional(), anonymousId: Anon });

export const practiceController = {
  async createReviewEvent(req: AuthedRequest, res: Response) {
    const body = ReviewBody.parse(req.body);
    const userId = await resolveActor(req, body.anonymousId);
    const result = await practiceService.recordReview(userId, body);
    res.status(201).json(result);
  },

  async memoryStates(req: AuthedRequest, res: Response) {
    const q = StateQuery.parse(req.query);
    const userId = await resolveActor(req, q.anonymousId);
    res.json({ memoryStates: await practiceService.memoryStates(userId, q.languageCode) });
  },

  async startSession(req: AuthedRequest, res: Response) {
    const body = SessionBody.parse(req.body);
    const userId = await resolveActor(req, body.anonymousId);
    res.status(201).json(await practiceService.startSession(userId, body));
  },

  async endSession(req: AuthedRequest, res: Response) {
    const body = EndBody.parse(req.body);
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const userId = await resolveActor(req, body.anonymousId);
    res.json({ session: await practiceService.endSession(userId, id, body) });
  },

  async readiness(req: AuthedRequest, res: Response) {
    const q = StateQuery.parse(req.query);
    const userId = await resolveActor(req, q.anonymousId);
    res.json({ readiness: await readinessForUser(userId, q.languageCode) });
  },
};
