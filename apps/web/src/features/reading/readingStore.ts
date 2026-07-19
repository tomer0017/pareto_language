import { create } from 'zustand';
import type { ReadingMode } from './types.js';

/**
 * Reading's OWN listening order (kept out of the shared Parrot preferences so it never affects Core /
 * Dialogue playback): target only / target → translation / translation → target.
 */
export type ReadingPlayback = 'target' | 'target-tr' | 'tr-target';
const READING_PLAYBACKS: readonly ReadingPlayback[] = ['target', 'target-tr', 'tr-target'];

/**
 * Reading runtime + persistence. Progress and the preferred reading mode live in localStorage
 * (offline-first, engine-independent) under one namespaced key, exactly like the Bootcamp store. The
 * model is collection-agnostic: every collection's stories persist through the SAME per-story map, so
 * a future collection plugs in with zero store changes.
 *
 * "Currently open story" is deliberately NOT persisted (no auto-open on refresh) — only durable
 * progress is (mode, per-story position/completion/score, and the reading streak).
 */

const STORAGE_KEY = 'ready.reading.v1';

/** Durable per-story progress. `pos` = last-read sentence index (resume); `done` = completed. */
export interface StoryProgress {
  pos: number;
  done: boolean;
  /** Best quiz percentage (0–100), if the quiz was taken. */
  score?: number;
}

interface ReadingPersisted {
  mode: ReadingMode;
  /** Reading-only voice order (target only / target→translation / translation→target). */
  playback: ReadingPlayback;
  stories: Record<string, StoryProgress>;
  streak: { count: number; lastDay: string | null };
}

const DEFAULT: ReadingPersisted = { mode: 'bilingual', playback: 'target-tr', stories: {}, streak: { count: 0, lastDay: null } };

function load(): ReadingPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<ReadingPersisted>;
    return {
      mode: p.mode === 'target' || p.mode === 'hidden' ? p.mode : 'bilingual',
      playback: p.playback && READING_PLAYBACKS.includes(p.playback) ? p.playback : 'target-tr',
      stories: p.stories && typeof p.stories === 'object' ? p.stories : {},
      streak: p.streak && typeof p.streak === 'object' ? p.streak : { count: 0, lastDay: null },
    };
  } catch {
    return { ...DEFAULT };
  }
}

function save(state: ReadingPersisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: state.mode, playback: state.playback, stories: state.stories, streak: state.streak }));
  } catch {
    /* ignore (private mode / SSR) */
  }
}

/** Local calendar day (YYYY-MM-DD) — the reading-streak unit. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/** Pure streak transition: same day keeps it; the next day +1; a gap resets to 1. */
export function nextStreak(streak: { count: number; lastDay: string | null }, day: string): { count: number; lastDay: string } {
  if (streak.lastDay === day) return { count: Math.max(1, streak.count), lastDay: day };
  if (streak.lastDay && dayDiff(streak.lastDay, day) === 1) return { count: streak.count + 1, lastDay: day };
  return { count: 1, lastDay: day };
}

interface ReadingState extends ReadingPersisted {
  setMode(mode: ReadingMode): void;
  setPlayback(playback: ReadingPlayback): void;
  /** Save the last-read sentence index for resume (only advances forward). */
  savePosition(storyId: string, pos: number): void;
  /** Mark a story complete and record the quiz score; bumps the reading streak once per day. */
  completeStory(storyId: string, score: number): void;
  progressFor(storyId: string): StoryProgress;
  completedCount(): number;
}

const EMPTY: StoryProgress = { pos: 0, done: false };

export const useReadingStore = create<ReadingState>((set, get) => ({
  ...load(),

  setMode(mode) {
    set({ mode });
    save(get());
  },

  setPlayback(playback) {
    set({ playback });
    save(get());
  },

  savePosition(storyId, pos) {
    const cur = get().stories[storyId] ?? EMPTY;
    if (pos <= cur.pos && !(cur.pos === 0 && pos === 0)) return; // resume only moves forward
    set({ stories: { ...get().stories, [storyId]: { ...cur, pos: Math.max(cur.pos, pos) } } });
    save(get());
  },

  completeStory(storyId, score) {
    const cur = get().stories[storyId] ?? EMPTY;
    const bestScore = Math.max(cur.score ?? 0, score);
    const wasDone = cur.done;
    const streak = wasDone ? get().streak : nextStreak(get().streak, today());
    set({
      stories: { ...get().stories, [storyId]: { ...cur, done: true, score: bestScore } },
      streak,
    });
    save(get());
  },

  progressFor(storyId) {
    return get().stories[storyId] ?? EMPTY;
  },

  completedCount() {
    return Object.values(get().stories).filter((p) => p.done).length;
  },
}));
