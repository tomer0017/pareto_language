import { create } from 'zustand';
import type {
  ContentItem,
  Outcome,
  PracticeMode,
  ReviewEvent,
  SessionLog,
  Situation,
} from '@ready/content-schema';
import { isDue, scheduleSession, shouldRequeue, type SchedulableItem } from '@ready/engine';
import { useAppStore } from './appStore.js';
import { L } from '../i18n/strings.js';
import { shuffle } from '../util/shuffle.js';

/**
 * Session runtime (PDF §10.2): fixed rhythm Warm-up → Learn → Integrate → Close, adaptive
 * content from the deadline-aware scheduler. Every drill persists its event immediately —
 * closing the app mid-session loses nothing. Today's Mission IS the product; the same
 * machinery also powers the Practice mini-games (single-mode focused sessions).
 */

export type BlockKind = 'warmup' | 'learn' | 'integrate';
export type PracticeGame = 'swipe' | 'flashRecall' | 'listen' | 'numberSprint' | 'simulator' | 'echo';

export interface DrillStep {
  item: ContentItem;
  mode: PracticeMode;
  block: BlockKind;
}

export interface MissionPreview {
  reviewCount: number;
  newCount: number;
  phraseCount: number;
  hasSprint: boolean;
  scenarioName: string | null;
  estMinutes: number;
  empty: boolean;
}

interface ComputedSession {
  steps: DrillStep[];
  simulatorSituation: Situation | null;
  estSeconds: number;
}

function priorityFor(item: ContentItem): { p: number; e: boolean } {
  const { situationById } = useAppStore.getState();
  for (const sid of item.situationIds) {
    const s = situationById.get(sid);
    if (s) return { p: s.priorityDefault, e: s.isEmergency };
  }
  return { p: 0, e: item.tier === 0 };
}

/** The mission builder — shared by the runtime and the Mission-card preview. */
function computeSession(preset: 'full' | 'five'): ComputedSession {
  const app = useAppStore.getState();
  const { pack, plan, states, itemsById } = app;
  if (!pack || !plan) return { steps: [], simulatorSituation: null, estSeconds: 0 };
  const nowMs = Date.now();
  const departureMs = Date.parse(plan.departureAt);
  const five = preset === 'five';

  const candidates: SchedulableItem[] = [];
  for (const st of states.values()) {
    if (!isDue(st, nowMs, 0.95)) continue;
    const item = itemsById.get(st.itemId);
    if (!item) continue;
    const { p, e } = priorityFor(item);
    candidates.push({ item, state: st, situationPriority: p, isEmergency: e });
  }

  const today = new Date().toISOString().slice(0, 10);
  const planDay =
    plan.days.find((d) => d.date.slice(0, 10) === today) ??
    plan.days.find((d) => d.newItemIds.some((id) => !states.has(id)));
  const newQueue: SchedulableItem[] = five
    ? []
    : (planDay?.newItemIds ?? [])
        .filter((id) => !states.has(id))
        .map((id) => itemsById.get(id))
        .filter((it): it is ContentItem => it !== undefined)
        .map((item) => {
          const { p, e } = priorityFor(item);
          return { item, state: null, situationPriority: p, isEmergency: e };
        });

  const schedule = scheduleSession({
    candidates,
    newQueue,
    departureMs,
    nowMs,
    minutesBudget: five ? 5 : plan.minutesPerDay,
  });

  const steps: DrillStep[] = [];
  let reviewsSeen = 0;
  for (const s of schedule.steps) {
    const item = itemsById.get(s.itemId);
    if (!item) continue;
    if (s.kind === 'new') {
      if (item.kind === 'phrase') {
        steps.push({ item, mode: 'echo', block: 'learn' });
        steps.push({ item, mode: 'flashRecall', block: 'learn' });
      } else {
        steps.push({ item, mode: s.mode, block: 'learn' });
      }
    } else {
      steps.push({ item, mode: s.mode, block: reviewsSeen < 8 ? 'warmup' : 'integrate' });
      reviewsSeen++;
    }
  }

  const numberItems = pack.items.filter((i) => i.kind === 'number');
  const anyNumbers =
    numberItems.some((i) => states.has(i.id)) || steps.some((s) => s.item.kind === 'number');
  if (!five && anyNumbers && numberItems.length >= 4 && numberItems[0]) {
    steps.push({ item: numberItems[0], mode: 'numberSprint', block: 'integrate' });
  }

  let simulatorSituation: Situation | null = null;
  if (!five) {
    for (const situation of pack.situations) {
      const unlocked =
        situation.corePhraseIds.length > 0 &&
        situation.corePhraseIds.every((id) => (states.get(id)?.level ?? 0) >= 2);
      const done = situation.corePhraseIds.some((id) => (states.get(id)?.level ?? 0) >= 4);
      if (unlocked && !done) {
        simulatorSituation = situation;
        break;
      }
    }
  }

  const estSeconds =
    schedule.estTotalSeconds + (simulatorSituation ? 75 : 0);
  return { steps, simulatorSituation, estSeconds };
}

/** What the Mission card shows before the user presses Start. */
export function previewMission(): MissionPreview {
  const { steps, simulatorSituation, estSeconds } = computeSession('full');
  const seenNew = new Set<string>();
  let reviewCount = 0;
  let phraseCount = 0;
  let hasSprint = false;
  for (const s of steps) {
    if (s.mode === 'numberSprint') {
      hasSprint = true;
      continue;
    }
    if (s.block === 'learn') {
      seenNew.add(s.item.id);
      if (s.item.kind === 'phrase') phraseCount++;
    } else {
      reviewCount++;
    }
  }
  return {
    reviewCount,
    newCount: seenNew.size,
    phraseCount: Math.ceil(phraseCount / 2), // echo+recall pairs count once
    hasSprint,
    scenarioName: simulatorSituation ? L(simulatorSituation.name) : null,
    estMinutes: Math.max(1, Math.round(estSeconds / 60)),
    empty: steps.length === 0 && !simulatorSituation,
  };
}

/** Focused single-skill sessions for the Practice hub — mini-games, not flashcards. */
function computePractice(game: PracticeGame): ComputedSession {
  const app = useAppStore.getState();
  const { pack, states, itemsById } = app;
  if (!pack) return { steps: [], simulatorSituation: null, estSeconds: 0 };
  const seen = [...states.values()]
    .map((st) => itemsById.get(st.itemId))
    .filter((i): i is ContentItem => i !== undefined);

  const pick = (items: ContentItem[], mode: PracticeMode, cap: number): DrillStep[] =>
    items.slice(0, cap).map((item) => ({ item, mode, block: 'integrate' as const }));

  switch (game) {
    case 'swipe':
      return { steps: pick(shuffle(seen), 'swipe', 12), simulatorSituation: null, estSeconds: 45 };
    case 'flashRecall':
      return {
        steps: pick(shuffle(seen.filter((i) => i.kind === 'phrase')), 'flashRecall', 10),
        simulatorSituation: null,
        estSeconds: 80,
      };
    case 'echo':
      return {
        steps: pick(shuffle(seen.filter((i) => i.kind === 'phrase')), 'echo', 8),
        simulatorSituation: null,
        estSeconds: 80,
      };
    case 'listen': {
      // Replies of situations the learner has started — the anti-freeze muscle.
      const startedSituations = new Set(seen.flatMap((i) => i.situationIds));
      const replies = pack.items.filter(
        (i) => i.kind === 'reply' && i.situationIds.some((s) => startedSituations.has(s)),
      );
      return { steps: pick(shuffle(replies), 'listen', 10), simulatorSituation: null, estSeconds: 70 };
    }
    case 'numberSprint': {
      const anchor = pack.items.find((i) => i.kind === 'number');
      return {
        steps: anchor ? [{ item: anchor, mode: 'numberSprint', block: 'integrate' }] : [],
        simulatorSituation: null,
        estSeconds: 70,
      };
    }
    case 'simulator': {
      // Replay allowed: pick the first unlocked situation, preferring not-yet-done ones.
      let fallback: Situation | null = null;
      for (const s of pack.situations) {
        const unlocked =
          s.corePhraseIds.length > 0 &&
          s.corePhraseIds.every((id) => (states.get(id)?.level ?? 0) >= 2);
        if (!unlocked) continue;
        const done = s.corePhraseIds.some((id) => (states.get(id)?.level ?? 0) >= 4);
        if (!done) return { steps: [], simulatorSituation: s, estSeconds: 80 };
        fallback = fallback ?? s;
      }
      return { steps: [], simulatorSituation: fallback, estSeconds: 80 };
    }
  }
}


interface SessionState {
  steps: DrillStep[];
  index: number;
  startedAt: number;
  failCounts: Map<string, number>;
  passedItems: Set<string>;
  simulatorSituation: Situation | null;
  finished: boolean;
  isPractice: boolean;

  build(preset?: 'full' | 'five'): void;
  buildPractice(game: PracticeGame): void;
  current(): DrillStep | null;
  submit(outcome: Outcome, extras?: Partial<ReviewEvent>): Promise<void>;
  recordExtraEvents(events: ReviewEvent[]): Promise<void>;
  skipStep(): void;
  capabilitySummary(): string[];
  finish(): Promise<void>;
  reset(): void;
}

function newUuid(): string {
  return crypto.randomUUID();
}

export const useSessionStore = create<SessionState>((set, get) => ({
  steps: [],
  index: 0,
  startedAt: 0,
  failCounts: new Map(),
  passedItems: new Set(),
  simulatorSituation: null,
  finished: false,
  isPractice: false,

  build(preset = 'full') {
    const { steps, simulatorSituation } = computeSession(preset);
    set({
      steps,
      index: 0,
      startedAt: Date.now(),
      failCounts: new Map(),
      passedItems: new Set(),
      simulatorSituation,
      finished: steps.length === 0 && !simulatorSituation,
      isPractice: false,
    });
  },

  buildPractice(game) {
    const { steps, simulatorSituation } = computePractice(game);
    set({
      steps,
      index: 0,
      startedAt: Date.now(),
      failCounts: new Map(),
      passedItems: new Set(),
      simulatorSituation,
      finished: steps.length === 0 && !simulatorSituation,
      isPractice: true,
    });
  },

  current() {
    const { steps, index } = get();
    return steps[index] ?? null;
  },

  async submit(outcome, extras = {}) {
    const app = useAppStore.getState();
    const step = get().current();
    if (!step || !app.user) return;

    const event: ReviewEvent = {
      id: newUuid(),
      userId: app.user.id,
      itemId: step.item.id,
      mode: step.mode,
      outcome,
      at: new Date().toISOString(),
      ...extras,
    };
    // Persist instantly — interruptible by design (PDF §10.2).
    await app.recordEvents([event]);

    const { steps, index, failCounts, passedItems } = get();
    const nextSteps = [...steps];
    const fails = new Map(failCounts);
    const passed = new Set(passedItems);

    if (outcome === 'fail') {
      const count = (fails.get(step.item.id) ?? 0) + 1;
      fails.set(step.item.id, count);
      // 3-strike relearn loop (PDF §8.2).
      if (shouldRequeue(count)) {
        nextSteps.splice(index + 2, 0, { ...step });
        nextSteps.push({ ...step, block: 'integrate' });
      }
    } else {
      passed.add(step.item.id);
    }

    set({
      steps: nextSteps,
      index: index + 1,
      failCounts: fails,
      passedItems: passed,
      finished: index + 1 >= nextSteps.length && !get().simulatorSituation,
    });
  },

  async recordExtraEvents(events) {
    const app = useAppStore.getState();
    if (!app.user) return;
    await app.recordEvents(events);
    const passed = new Set(get().passedItems);
    for (const e of events) if (e.outcome === 'pass') passed.add(e.itemId);
    set({ passedItems: passed });
  },

  skipStep() {
    const { steps, index } = get();
    set({ index: index + 1, finished: index + 1 >= steps.length && !get().simulatorSituation });
  },

  capabilitySummary(): string[] {
    const app = useAppStore.getState();
    const { passedItems } = get();
    const phrases = [...passedItems]
      .map((id) => app.itemsById.get(id))
      .filter((i): i is ContentItem => i !== undefined && i.kind === 'phrase')
      .slice(0, 3);
    const lines: string[] = [];
    if (phrases.length > 0) {
      lines.push(`You can now say: ${phrases.map((p) => `“${p.text}”`).join(' · ')}`);
    }
    const readySituations = app
      .readiness()
      .filter((r) => r.state === 'ready')
      .map((r) => { const n = app.situationById.get(r.situationId)?.name; return n ? L(n) : undefined; })
      .filter(Boolean);
    if (readySituations.length > 0) lines.push(`Ready: ${readySituations.join(', ')}`);
    if (lines.length === 0) lines.push('Progress saved. Every review sharpens departure-day recall.');
    return lines;
  },

  async finish() {
    const app = useAppStore.getState();
    const { steps, startedAt, isPractice } = get();
    if (!app.user) return;
    const byBlock = (kind: BlockKind): string[] =>
      [...new Set(steps.filter((s) => s.block === kind).map((s) => s.item.id))];
    const log: SessionLog = {
      id: newUuid(),
      userId: app.user.id,
      startedAt: new Date(startedAt).toISOString(),
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      blocks: [
        { kind: 'warmup', itemIds: byBlock('warmup') },
        { kind: 'learn', itemIds: byBlock('learn') },
        { kind: 'integrate', itemIds: byBlock('integrate') },
      ],
      capabilitySummary: get().capabilitySummary(),
    };
    await app.saveSessionLog(log);
    if (!isPractice) await app.replanAfterSession();
    set({ finished: true });
  },

  reset() {
    set({
      steps: [],
      index: 0,
      startedAt: 0,
      failCounts: new Map(),
      passedItems: new Set(),
      simulatorSituation: null,
      finished: false,
      isPractice: false,
    });
  },
}));
