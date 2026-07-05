import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';
import { createApp } from './app.js';
import { seedAll, seedItalianFromPack } from './seed/seeders.js';
import { WordModel } from './models/content.js';

/**
 * MongoDB-backed content + practice API (M6). Seeds run against an in-memory MongoDB —
 * the same code path as `npm run seed:all` against the real cluster.
 */

let mongod: MongoMemoryServer;
let app: Express;
const anonymousId = `anon-${'11111111-1111-4111-8111-111111111111'}`;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
  await seedAll();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('health + languages + packs', () => {
  it('GET /health reports mongo connected', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, mongo: 'connected' });
  });

  it('GET /content/languages lists all five languages with pack status', async () => {
    const res = await request(app).get('/api/v1/content/languages');
    expect(res.status).toBe(200);
    const byCode = Object.fromEntries(res.body.languages.map((l: { code: string }) => [l.code, l]));
    expect(Object.keys(byCode).sort()).toEqual(['ar', 'en', 'es', 'fr', 'it']);
    expect(byCode.it.status).toBe('active');
    expect(byCode.es.status).toBe('coming_soon');
    expect(byCode.ar.status).toBe('coming_soon');
    expect(byCode.fr.wordCount).toBeGreaterThan(500);
  });

  it('GET /content/packs/:lang returns meta; /full returns the engine payload for active packs', async () => {
    const meta = await request(app).get('/api/v1/content/packs/it');
    expect(meta.status).toBe(200);
    expect(meta.body.pack.status).toBe('active');
    expect(meta.body.pack.payload).toBeUndefined(); // meta never ships the heavy payload

    const full = await request(app).get('/api/v1/content/packs/it/full');
    expect(full.status).toBe(200);
    expect(full.body.lang).toBe('it');
    expect(full.body.items.length).toBeGreaterThan(150);

    const locked = await request(app).get('/api/v1/content/packs/es/full');
    expect(locked.status).toBe(404); // coming_soon has no payload — honest lock
  });
});

describe('words / phrases / situations', () => {
  it('GET /words?languageCode=it returns Italian words', async () => {
    const res = await request(app).get('/api/v1/words?languageCode=it');
    expect(res.status).toBe(200);
    expect(res.body.words.length).toBeGreaterThan(40);
    expect(res.body.words[0].languageCode).toBe('it');
  });

  it('GET /words?languageCode=fr returns bank-seeded French recognition words', async () => {
    const res = await request(app).get('/api/v1/words?languageCode=fr');
    expect(res.body.words.length).toBeGreaterThan(500);
    const merci = res.body.words.find((w: { _id: string }) => w._id === 'bank.fr.thank');
    expect(merci.word).toBe('remercier');
    expect(merci.translations.he).toBe('תודה');
  });

  it('GET /words/:id and 404 on unknown', async () => {
    const ok = await request(app).get('/api/v1/words/bank.en.thank');
    expect(ok.status).toBe(200);
    expect(ok.body.word.translations.fr).toBe('remercier');
    const nope = await request(app).get('/api/v1/words/bank.xx.nope');
    expect(nope.status).toBe(404);
  });

  it('GET /phrases?languageCode=it filters by situation', async () => {
    const res = await request(app).get('/api/v1/phrases?languageCode=it&situationSlug=restaurant');
    expect(res.status).toBe(200);
    expect(res.body.phrases.length).toBeGreaterThan(8);
    expect(res.body.phrases.every((p: { situationSlug: string }) => p.situationSlug === 'restaurant')).toBe(true);
  });

  it('GET /situations + /situations/:slug', async () => {
    const list = await request(app).get('/api/v1/situations?languageCode=it');
    expect(list.body.situations.length).toBe(10);
    const one = await request(app).get('/api/v1/situations/restaurant?languageCode=it');
    expect(one.status).toBe(200);
    expect(one.body.situation.phraseIds.length).toBeGreaterThan(10);
  });

  it('rejects unsupported languages with 404', async () => {
    const res = await request(app).get('/api/v1/words?languageCode=xx');
    expect(res.status).toBe(404);
  });
});

describe('seed idempotency', () => {
  it('re-running the Italian seed inserts nothing new', async () => {
    const before = await WordModel.countDocuments();
    await seedItalianFromPack();
    const after = await WordModel.countDocuments();
    expect(after).toBe(before);
  });
});

describe('practice + progress (anonymous, no login)', () => {
  it('POST /review-events creates the event and an engine-projected memory state', async () => {
    const res = await request(app).post('/api/v1/review-events').send({
      anonymousId,
      itemId: 'it.phrase.glue.grazie',
      itemType: 'phrase',
      languageCode: 'it',
      result: 'correct',
      sourceGame: 'recall',
      responseTimeMs: 1400,
    });
    expect(res.status).toBe(201);
    expect(res.body.memoryState.status).toBe('known'); // one demonstrated recall = known
    expect(res.body.memoryState.correctCount).toBe(1);
    expect(Date.parse(res.body.memoryState.nextReviewAt)).toBeGreaterThan(Date.now());
  });

  it('a wrong answer marks the item weak and due almost immediately', async () => {
    const res = await request(app).post('/api/v1/review-events').send({
      anonymousId,
      itemId: 'it.phrase.glue.grazie',
      languageCode: 'it',
      result: 'wrong',
      sourceGame: 'recall',
    });
    expect(res.status).toBe(201);
    // Engine collapses stability on failure → next review lands within hours, not days.
    const dueIn = Date.parse(res.body.memoryState.nextReviewAt) - Date.now();
    expect(dueIn).toBeLessThan(6 * 3600 * 1000);
  });

  it('GET /memory-states returns simplified states with wrong counts', async () => {
    const res = await request(app).get(`/api/v1/memory-states?languageCode=it&anonymousId=${anonymousId}`);
    expect(res.status).toBe(200);
    const s = res.body.memoryStates.find((x: { itemId: string }) => x.itemId === 'it.phrase.glue.grazie');
    expect(s.wrongCount).toBe(1);
    expect(s.status).toBe('weak'); // failed after prior success → weak
  });

  it('practice session lifecycle: start → end', async () => {
    const start = await request(app)
      .post('/api/v1/practice-sessions')
      .send({ anonymousId, languageCode: 'it', mode: 'recall' });
    expect(start.status).toBe(201);
    const end = await request(app)
      .patch(`/api/v1/practice-sessions/${start.body.id}/end`)
      .send({ anonymousId, correctCount: 5, wrongCount: 1 });
    expect(end.status).toBe(200);
    expect(end.body.session.correctCount).toBe(5);
    expect(end.body.session.endedAt).toBeTruthy();
  });

  it('GET /readiness works for anonymous users', async () => {
    const res = await request(app).get(`/api/v1/readiness?languageCode=it&anonymousId=${anonymousId}`);
    expect(res.status).toBe(200);
    expect(res.body.readiness.length).toBe(10);
  });

  it('rejects requests with neither token nor anonymousId', async () => {
    const res = await request(app).get('/api/v1/memory-states?languageCode=it');
    expect(res.status).toBe(401);
  });
});

describe('Sprint 4 — concepts + quality gate', () => {
  it('seeds sample concepts idempotently', async () => {
    const { seedConcepts } = await import('./seed/seeders.js');
    const { ConceptModel } = await import('./models/content.js');
    await seedConcepts();
    const first = await ConceptModel.countDocuments();
    expect(first).toBeGreaterThanOrEqual(4);
    await seedConcepts();
    expect(await ConceptModel.countDocuments()).toBe(first); // no duplicates
    const exit = await ConceptModel.findById('concept.word.exit').lean();
    expect((exit!.gloss as Record<string, string>).he).toBe('יציאה');
  });

  it('computes a quality histogram + honest gate report on the pack row', async () => {
    const { computeQualityGate } = await import('./seed/seeders.js');
    const { histogram, gateReport } = await computeQualityGate('it');
    expect(Object.values(histogram).reduce((a, b) => a + b, 0)).toBeGreaterThan(150);
    // Legacy it content defaults to ai_generated → gate must honestly say not-yet-eligible.
    expect(gateReport.activeEligible).toBe(false);
    expect(gateReport.reasons.length).toBeGreaterThan(0);
  });

  it('neverTeach concepts are excluded from the default concept listing', async () => {
    const { conceptDal } = await import('./dal/contentDal.js');
    const list = await conceptDal.list();
    expect(list.some((c) => c._id === 'concept.word.carburetor')).toBe(false);
    expect(list.some((c) => c._id === 'concept.word.exit')).toBe(true);
  });
});
