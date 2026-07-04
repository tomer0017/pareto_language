import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';
import { createApp } from './app.js';

/**
 * API integration tests (mission M3): anonymous users, plan CRUD, idempotent event batch,
 * engine-projected memory states, readiness. Runs against an in-memory MongoDB.
 * Requires built content (npm run build:content) — same precondition as the running server.
 */

let mongod: MongoMemoryServer;
let app: Express;
let token = '';
let userId = '';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('API v1', () => {
  it('GET /content/manifest lists the Italian pack', async () => {
    const res = await request(app).get('/api/v1/content/manifest');
    expect(res.status).toBe(200);
    expect(res.body.languages[0].lang).toBe('it');
  });

  it('POST /users/anonymous creates a user and a JWT', async () => {
    const res = await request(app).post('/api/v1/users/anonymous');
    expect(res.status).toBe(201);
    expect(res.body.user.identities[0].provider).toBe('anonymous');
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
    userId = res.body.user.id;
  });

  it('rejects /me routes without a token', async () => {
    const res = await request(app).get('/api/v1/me/plan');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthenticated');
  });

  it('PUT + GET /me/plan round-trips', async () => {
    const plan = {
      userId,
      lang: 'it',
      departureAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      minutesPerDay: 30,
      tier: 1,
      situationPriorities: [{ situationId: 'restaurant', rank: 0 }],
      days: [{ date: new Date().toISOString(), newItemIds: ['it.phrase.glue.grazie'] }],
      version: 1,
    };
    const put = await request(app).put('/api/v1/me/plan').set(auth()).send(plan);
    expect(put.status).toBe(200);
    const get = await request(app).get('/api/v1/me/plan').set(auth());
    expect(get.body.plan.minutesPerDay).toBe(30);
  });

  it('PUT /me/plan validates with zod', async () => {
    const res = await request(app).put('/api/v1/me/plan').set(auth()).send({ nonsense: true });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_failed');
  });

  it('POST /me/review-events:batch is idempotent and projects memory states', async () => {
    const event = {
      id: '11111111-1111-4111-8111-111111111111',
      userId,
      itemId: 'it.phrase.glue.grazie',
      mode: 'flashRecall',
      outcome: 'pass',
      at: new Date().toISOString(),
    };
    const first = await request(app)
      .post('/api/v1/me/review-events:batch')
      .set(auth())
      .send({ events: [event] });
    expect(first.status).toBe(200);
    expect(first.body.accepted).toBe(1);

    // Same UUID again — no duplicate, no error.
    const second = await request(app)
      .post('/api/v1/me/review-events:batch')
      .set(auth())
      .send({ events: [event] });
    expect(second.status).toBe(200);

    const events = await request(app).get('/api/v1/me/review-events').set(auth());
    expect(events.body.events.length).toBe(1);

    const states = await request(app).get('/api/v1/me/memory-states').set(auth());
    expect(states.status).toBe(200);
    expect(states.body.memoryStates.length).toBe(1);
    expect(states.body.memoryStates[0].itemId).toBe('it.phrase.glue.grazie');
    expect(states.body.memoryStates[0].successfulRecalls).toBe(1);
  });

  it('POST /me/sessions persists a session log', async () => {
    const res = await request(app)
      .post('/api/v1/me/sessions')
      .set(auth())
      .send({
        id: '22222222-2222-4222-8222-222222222222',
        userId,
        startedAt: new Date().toISOString(),
        durationSec: 900,
        blocks: [{ kind: 'warmup', itemIds: ['it.phrase.glue.grazie'] }],
        capabilitySummary: ['You can now say: “Grazie”'],
      });
    expect(res.status).toBe(201);
  });

  it('GET /me/readiness returns honest snapshots for all 10 situations', async () => {
    const res = await request(app).get('/api/v1/me/readiness').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.readiness.length).toBe(10);
    const states = new Set(res.body.readiness.map((r: { state: string }) => r.state));
    expect(states.has('notStarted')).toBe(true);
  });

  it('POST /auth/google fails cleanly when unconfigured', async () => {
    const res = await request(app).post('/api/v1/auth/google').send({ credential: 'x'.repeat(20) });
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('google_not_configured');
  });

  it('unknown routes return a typed 404', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });
});
