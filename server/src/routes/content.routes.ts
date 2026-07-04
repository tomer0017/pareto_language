import { Router } from 'express';
import type { Response } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { contentController } from '../controllers/contentController.js';

type H = (req: AuthedRequest, res: Response) => Promise<void>;
const ah = (fn: H) => (req: AuthedRequest, res: Response, next: (e?: unknown) => void) => fn(req, res).catch(next);

/** Routes wire endpoints only — no logic here. */
export const contentRoutes = Router();
contentRoutes.get('/health', ah(contentController.health));
contentRoutes.get('/content/languages', ah(contentController.languages));
contentRoutes.get('/content/packs', ah(contentController.packs));
contentRoutes.get('/content/packs/:languageCode', ah(contentController.packByLanguage));
contentRoutes.get('/content/packs/:languageCode/full', ah(contentController.packPayload));
contentRoutes.get('/words', ah(contentController.words));
contentRoutes.get('/words/:id', ah(contentController.wordById));
contentRoutes.get('/phrases', ah(contentController.phrases));
contentRoutes.get('/phrases/:id', ah(contentController.phraseById));
contentRoutes.get('/situations', ah(contentController.situations));
contentRoutes.get('/situations/:slug', ah(contentController.situationBySlug));
