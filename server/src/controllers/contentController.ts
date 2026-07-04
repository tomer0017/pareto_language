import type { Response } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { contentService } from '../services/contentService.js';

/** Controllers: request/response + validation only; business logic lives in the service. */

const LangQuery = z.object({ languageCode: z.string().min(2).max(5) });
const IdParam = z.object({ id: z.string().min(1) });
const SlugParam = z.object({ slug: z.string().min(1) });
const LangParam = z.object({ languageCode: z.string().min(2).max(5) });

export const contentController = {
  async health(_req: AuthedRequest, res: Response) {
    const mongoose = (await import('mongoose')).default;
    res.json({ ok: true, mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  },

  async languages(_req: AuthedRequest, res: Response) {
    res.json({ languages: await contentService.languages() });
  },

  async packs(_req: AuthedRequest, res: Response) {
    res.json({ packs: await contentService.listPacks() });
  },

  async packByLanguage(req: AuthedRequest, res: Response) {
    const { languageCode } = LangParam.parse(req.params);
    res.json({ pack: await contentService.packMeta(languageCode) });
  },

  async packPayload(req: AuthedRequest, res: Response) {
    const { languageCode } = LangParam.parse(req.params);
    res.json(await contentService.packPayload(languageCode));
  },

  async words(req: AuthedRequest, res: Response) {
    const { languageCode } = LangQuery.parse(req.query);
    res.json({ words: await contentService.words(languageCode) });
  },
  async wordById(req: AuthedRequest, res: Response) {
    const { id } = IdParam.parse(req.params);
    res.json({ word: await contentService.wordById(id) });
  },

  async phrases(req: AuthedRequest, res: Response) {
    const q = LangQuery.extend({ situationSlug: z.string().optional() }).parse(req.query);
    res.json({ phrases: await contentService.phrases(q.languageCode, q.situationSlug) });
  },
  async phraseById(req: AuthedRequest, res: Response) {
    const { id } = IdParam.parse(req.params);
    res.json({ phrase: await contentService.phraseById(id) });
  },

  async situations(req: AuthedRequest, res: Response) {
    const { languageCode } = LangQuery.parse(req.query);
    res.json({ situations: await contentService.situations(languageCode) });
  },
  async situationBySlug(req: AuthedRequest, res: Response) {
    const { slug } = SlugParam.parse(req.params);
    const { languageCode } = LangQuery.parse(req.query);
    res.json({ situation: await contentService.situationBySlug(languageCode, slug) });
  },
};
