/**
 * Scripted smoke test (mission M4 step 13):
 *   create plan → run a session → events persisted → readiness updates → survives reload offline.
 * Runs headless over the REAL production pieces: the built it-IT content pack, LocalProvider on
 * IndexedDB (fake-indexeddb here), and the pure engine. Exits non-zero on any failure.
 */
import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ContentPackSchema,
  type ContentItem,
  type ReviewEvent,
  type ContentPack,
} from '@ready/content-schema';
import { LocalProvider } from '@ready/data';
import {
  buildPlan,
  computeReadiness,
  isDue,
  scheduleSession,
  DAY_MS,
  type SchedulableItem,
} from '@ready/engine';

let failures = 0;
function check(name: string, cond: boolean): void {
  console.info(`${cond ? '✓' : '✗'} ${name}`);
  if (!cond) failures++;
}

const CONTENT = fileURLToPath(new URL('../apps/web/public/content/', import.meta.url));

async function main(): Promise<void> {
  // ── Load the real built pack (same file the PWA precaches) ─────────────
  const packRaw = JSON.parse(readFileSync(`${CONTENT}it-IT.v0.1.0.json`, 'utf8')) as unknown;
  const pack: ContentPack = ContentPackSchema.parse(packRaw);
  check('built content pack validates against the schema', pack.items.length >= 150);

  let fetchCount = 0;
  const provider = new LocalProvider(async () => {
    fetchCount++;
    return pack;
  });

  // ── Onboard: anonymous user + plan ──────────────────────────────────────
  const user = await provider.ensureAnonymousUser();
  await provider.getContentPack('it');
  const departureAt = new Date(Date.now() + 7 * DAY_MS).toISOString();
  const plan = buildPlan({
    pack,
    userId: user.id,
    departureAt,
    nowMs: Date.now(),
    minutesPerDay: 30,
    version: 1,
  });
  await provider.saveTripPlan(plan);
  check('plan created with 7 days', plan.days.length === 7);
  check('final plan days taper (no new items)', plan.days.at(-1)!.newItemIds.length === 0);

  // ── Run a session: schedule → drill every step as a pass ───────────────
  const itemsById = new Map<string, ContentItem>(pack.items.map((i) => [i.id, i]));
  // Day 0 introduces glue+numbers (no situation); day 1 reaches situation phrases —
  // drill both to move a situation's readiness (mirrors two real evenings).
  const day0 = plan.days[0]!;
  const day1 = plan.days[1]!;
  const newQueue: SchedulableItem[] = [...day0.newItemIds, ...day1.newItemIds]
    .map((id) => itemsById.get(id))
    .filter((i): i is ContentItem => i !== undefined)
    .map((item) => ({ item, state: null, situationPriority: 1, isEmergency: false }));
  const schedule = scheduleSession({
    candidates: [],
    newQueue,
    departureMs: Date.parse(departureAt),
    nowMs: Date.now(),
    minutesBudget: 30,
  });
  check('session scheduled within budget', schedule.estTotalSeconds <= schedule.budgetSeconds);
  check('session has steps', schedule.steps.length > 0);

  const events: ReviewEvent[] = schedule.steps.map((step, i) => ({
    id: crypto.randomUUID(),
    userId: user.id,
    itemId: step.itemId,
    mode: step.mode,
    outcome: 'pass',
    latencyMs: 1500,
    at: new Date(Date.now() + i * 8000).toISOString(),
  }));
  await provider.saveReviewEvents(user.id, events);

  // ── Events persisted + projection updated ──────────────────────────────
  const storedEvents = await provider.getReviewEvents(user.id);
  check('events persisted append-only', storedEvents.length === events.length);
  const states = await provider.getMemoryStates(user.id);
  check('memory states projected for every drilled item', states.length === new Set(events.map((e) => e.itemId)).size);
  const pending = await provider.pendingSyncIds();
  check('sync queue holds all events for background push', pending.length === events.length);

  // ── Readiness updates ───────────────────────────────────────────────────
  const statesByItem = new Map(states.map((s) => [s.itemId, s]));
  const snapshots = pack.situations.map((situation) =>
    computeReadiness({
      situation,
      statesByItem,
      simulatorDone: false,
      departureMs: Date.parse(departureAt),
      nowMs: Date.now(),
    }),
  );
  const touched = snapshots.filter((s) => s.state !== 'notStarted');
  check('readiness moved off notStarted for drilled situations', touched.length > 0);

  // ── Survives reload, offline ────────────────────────────────────────────
  // New provider over the same IndexedDB; its fetcher hard-fails to prove offline serving.
  const offlineProvider = new LocalProvider(async () => {
    throw new Error('network disabled');
  });
  const reloadedUser = await offlineProvider.ensureAnonymousUser();
  check('same anonymous user after reload', reloadedUser.id === user.id);
  const offlinePack = await offlineProvider.getContentPack('it');
  check('content pack served from cache with network disabled', offlinePack.items.length === pack.items.length);
  const reloadedStates = await offlineProvider.getMemoryStates(user.id);
  check('memory states intact after offline reload', reloadedStates.length === states.length);
  const reloadedPlan = await offlineProvider.getTripPlan(user.id);
  check('plan intact after offline reload', reloadedPlan?.version === plan.version);

  // Due-ness sanity: everything just drilled is not due immediately.
  const dueNow = reloadedStates.filter((s) => isDue(s, Date.now())).length;
  check('freshly drilled items are not immediately due', dueNow === 0);
  check('pack was fetched exactly once (then cached)', fetchCount === 1);

  console.info(failures === 0 ? '\nSMOKE PASS' : `\nSMOKE FAIL (${failures})`);
  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error('SMOKE CRASH', err);
  process.exit(1);
});
