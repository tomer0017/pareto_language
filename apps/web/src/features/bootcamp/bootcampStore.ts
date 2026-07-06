import { create } from 'zustand';
import type { Outcome, PracticeMode, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../shared/stores/appStore.js';
import { DAY1 } from './day1.js';
import { DAY2 } from './day2.js';
import { DAY3 } from './day3.js';
import { DAY4 } from './day4.js';
import { DAY5 } from './day5.js';
import { DAY6 } from './day6.js';
import { DAY7 } from './day7.js';
import { DAY8 } from './day8.js';
import { DAY9 } from './day9.js';
import { DAY10 } from './day10.js';
import type { BootcampDayContent } from './types.js';

/**
 * Bootcamp runtime + persistence (Sprint 6). Progress and receipts live in localStorage
 * (offline-first, engine-independent); every drill ALSO appends real ReviewEvents to the
 * event log — when the full en pack ships with these ids, this history already counts
 * (event-sourcing dividend). Days 2–20 register here as content files. Template rule:
 * new day = new data file + one line in DAYS. Zero new code.
 */

export const DAYS: Record<number, BootcampDayContent> = { 1: DAY1, 2: DAY2, 3: DAY3, 4: DAY4, 5: DAY5, 6: DAY6, 7: DAY7, 8: DAY8, 9: DAY9, 10: DAY10 };

interface BootcampProgress {
  completedDays: number[];
  receipts: { day: number; text: string; at: string }[];
  stepIndex: Record<string, number>; // per-day resume point
}

const STORAGE_KEY = 'ready.bootcamp.v1';

function loadProgress(): BootcampProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BootcampProgress;
  } catch (err) {
    console.warn('[bootcamp] progress unreadable — starting fresh', err);
  }
  return { completedDays: [], receipts: [], stepIndex: {} };
}

interface BootcampState extends BootcampProgress {
  activeDay: number | null;
  index: number;

  startDay(day: number): void;
  next(): void;
  addReceipt(text: string): void;
  recordDrill(itemId: string, mode: PracticeMode, outcome: Outcome, latencyMs?: number): void;
  completeDay(): void;
  exit(): void;
  currentDay(): BootcampDayContent | null;
}

function persist(state: BootcampProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[bootcamp] persist failed', err);
  }
}

export const useBootcampStore = create<BootcampState>((set, get) => ({
  ...loadProgress(),
  activeDay: null,
  index: 0,

  startDay(day) {
    const resume = get().stepIndex[String(day)] ?? 0;
    const content = DAYS[day];
    const max = content ? content.steps.length - 1 : 0;
    set({ activeDay: day, index: Math.min(resume, max) });
  },

  next() {
    const { activeDay, index, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    const nextIndex = index + 1;
    const si = { ...stepIndex, [String(activeDay)]: nextIndex };
    persist({ completedDays, receipts, stepIndex: si });
    set({ index: nextIndex, stepIndex: si });
  },

  addReceipt(text) {
    const { activeDay, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    if (receipts.some((r) => r.day === activeDay && r.text === text)) return; // no dup receipts on resume
    const next = [...receipts, { day: activeDay, text, at: new Date().toISOString() }];
    persist({ completedDays, receipts: next, stepIndex });
    set({ receipts: next });
  },

  /** Real evidence into the append-only log; failures never block bootcamp flow. */
  recordDrill(itemId, mode, outcome, latencyMs) {
    const app = useAppStore.getState();
    if (!app.user) return;
    const event: ReviewEvent = {
      id: crypto.randomUUID(),
      userId: app.user.id,
      itemId,
      mode,
      outcome,
      at: new Date().toISOString(),
      ...(latencyMs !== undefined ? { latencyMs } : {}),
    };
    void app.recordEvents([event]).catch((err) => console.warn('[bootcamp] event skipped', err));
  },

  completeDay() {
    const { activeDay, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    const done = completedDays.includes(activeDay) ? completedDays : [...completedDays, activeDay];
    const si = { ...stepIndex, [String(activeDay)]: 0 }; // replayable from the top
    persist({ completedDays: done, receipts, stepIndex: si });
    set({ completedDays: done, stepIndex: si });
  },

  exit() {
    set({ activeDay: null, index: 0 });
  },

  currentDay() {
    const { activeDay } = get();
    return activeDay === null ? null : (DAYS[activeDay] ?? null);
  },
}));
