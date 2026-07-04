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

/**
 * Session runtime (PDF §10.2): fixed rhythm Warm-up → Learn → Integrate → Close, adaptive
 * content from the deadline-aware scheduler. Every drill persists its event immediately, so
 * closing the app mid-session loses nothing (interruptibility bar).
 */

export type BlockKind = 'warmup' | 'learn' | 'integrate';

export interface DrillStep {
  item: ContentItem;
  mode: PracticeMode;
  block: BlockKind;
}

interface SessionState {
  steps: DrillStep[];
  index: number;
  startedAt: number;
  failCounts: Map<string, number>;
  /** Item ids that produced at least one pass this session, for the Close summary. */
  passedItems: Set<string>;
  simulatorSituation: Situation | null;
  finished: boolean;
  fiveMinutePreset: boolean;

  build(preset?: 'full' | 'five'): void;
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
  fiveMinutePreset: false,

  build(preset = 'full') {
    const app = useAppStore.getState();
    const { pack, plan, states, itemsById, situationById } = app;
    if (!pack || !plan) return;
    const nowMs = Date.now();
    const departureMs = Date.parse(plan.departureAt);
    const five = preset === 'five';
    const minutesBudget = five ? 5 : plan.minutesPerDay;

    const priorityFor = (item: ContentItem): { p: number; e: boolean } => {
      for (const sid of item.situationIds) {
        const s = situationById.get(sid);
        if (s) return { p: s.priorityDefault, e: s.isEmergency };
      }
      return { p: 0, e: item.tier === 0 };
    };

    const candidates: SchedulableItem[] = [];
    for (const st of states.values()) {
      if (!isDue(st, nowMs, 0.95)) continue;
      const item = itemsById.get(st.itemId);
      if (!item) continue;
      const { p, e } = priorityFor(item);
      candidates.push({ item, state: st, situationPriority: p, isEmergency: e });
    }

    // Today's (or the next unfinished) plan day supplies new items; 5-min preset reviews only.
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
      minutesBudget,
    });

    // Map scheduler steps into the session rhythm. New phrases expand to Echo → Flash Recall
    // (PDF §9.1); reviews keep their recommended mode. First review burst = warm-up.
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
        const block: BlockKind = reviewsSeen < 8 ? 'warmup' : 'integrate';
        reviewsSeen++;
        steps.push({ item, mode: s.mode, block });
      }
    }

    // Integrate: one Number Sprint round if any numbers are in play (PDF §10.2).
    const numberItems = pack.items.filter((i) => i.kind === 'number');
    const anyNumbersSeen =
      numberItems.some((i) => states.has(i.id)) ||
      steps.some((s) => s.item.kind === 'number');
    if (!five && anyNumbersSeen && numberItems.length >= 4) {
      const anchor = numberItems[0];
      if (anchor) steps.push({ item: anchor, mode: 'numberSprint', block: 'integrate' });
    }

    // Integrate: Situation Simulator once its core phrases reach L2 and it isn't done (PDF §9.1).
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

    set({
      steps,
      index: 0,
      startedAt: Date.now(),
      failCounts: new Map(),
      passedItems: new Set(),
      simulatorSituation,
      finished: steps.length === 0 && !simulatorSituation,
      fiveMinutePreset: five,
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
      // 3-strike relearn loop (PDF §8.2): immediate corrective retrieval + end-of-session check.
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

  /** For modes that generate their own event batches (Number Sprint, Simulator). */
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
      .map((r) => app.situationById.get(r.situationId)?.name)
      .filter(Boolean);
    if (readySituations.length > 0) lines.push(`Ready: ${readySituations.join(', ')}`);
    if (lines.length === 0) lines.push('Progress saved. Every review sharpens departure-day recall.');
    return lines;
  },

  async finish() {
    const app = useAppStore.getState();
    const { steps, startedAt, passedItems } = get();
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
    await app.replanAfterSession();
    set({ finished: true });
    void passedItems;
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
      fiveMinutePreset: false,
    });
  },
}));
