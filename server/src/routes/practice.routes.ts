import { Router } from 'express';
import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { practiceController } from '../controllers/practiceController.js';

type H = (req: AuthedRequest, res: Response) => Promise<void>;
const ah = (fn: H) => (req: AuthedRequest, res: Response, next: (e?: unknown) => void) => fn(req, res).catch(next);

export const practiceRoutes = Router();
practiceRoutes.post('/review-events', ah(practiceController.createReviewEvent));
practiceRoutes.get('/memory-states', ah(practiceController.memoryStates));
practiceRoutes.post('/practice-sessions', ah(practiceController.startSession));
practiceRoutes.patch('/practice-sessions/:id/end', ah(practiceController.endSession));
practiceRoutes.get('/readiness', ah(practiceController.readiness));
