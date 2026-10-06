import { create } from 'zustand';
import { useAppStore } from '../../shared/stores/appStore.js';
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
 *
 * Progress is PER LEARNING LANGUAGE (finishing a story in English says nothing about it in Spanish);
 * the mode and voice order are preferences, shared. On disk (one key):
 *   { mode, playback, byLang: { en: { stories, streak }, es: {...} } }
 * The pre-2026-10-06 shape kept one unscoped `stories` / `streak`; on first load they are migrated to
 * the learning language that was active when they were saved (`ready.lang`, else English) — never
 * copied to other languages. The store exposes the ACTIVE language's `stories` / `streak`.
 */

const STORAGE_KEY = 'ready.reading.v1';

/** Durable per-story progress. `pos` = last-read sentence index (resume); `done` = completed. */
export interface StoryProgress {
  pos: number;
  done: boolean;
  /** Best quiz percentage (0–100), if the quiz was taken. */
  score?: number;
}

interface LangProgress { stories: Record<string, StoryProgress>; streak: { count: number; lastDay: string | null } }
type ByLang = Record<string, LangProgress>;

interface ReadingPersisted {
  mode: ReadingMode;
  /** Reading-only voice order (target only / target→translation / translation→target). */
  playback: ReadingPlayback;
  /** Progress of every learning language. */
  byLang: ByLang;
  /** The learning language whose progress `stories` / `streak` show. */
  lang: string;
  stories: Record<string, StoryProgress>;
  streak: { count: number; lastDay: string | null };
}

const NO_PROGRESS = (): LangProgress => ({ stories: {}, streak: { count: 0, lastDay: null } });
const activeLang = (): string => useAppStore.getState().learningLang;
const asProgress = (p: Partial<LangProgress> | undefined): LangProgress => ({
  stories: p?.stories && typeof p.stories === 'object' ? p.stories : {},
  streak: p?.streak && typeof p.streak === 'object' ? p.streak : { count: 0, lastDay: null },
});

function load(): ReadingPersisted {
  const lang = activeLang();
  let mode: ReadingMode = 'bilingual';
  let playback: ReadingPlayback = 'target-tr';
  let byLang: ByLang = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const p = raw ? (JSON.parse(raw) as Partial<ReadingPersisted> & { byLang?: Record<string, Partial<LangProgress>> }) : {};
    mode = p.mode === 'target' || p.mode === 'hidden' ? p.mode : 'bilingual';
    playback = p.playback && READING_PLAYBACKS.includes(p.playback) ? p.playback : 'target-tr';
    for (const [l, prog] of Object.entries(p.byLang ?? {})) byLang[l] = asProgress(prog);
    // One-time migration: unscoped progress belongs to the language that was active when it was saved.
    if (p.stories || p.streak) {
      let owner = 'en';
      try { owner = localStorage.getItem('ready.lang') || 'en'; } catch { /* keep en */ }
      const legacy = asProgress({ stories: p.stories, streak: p.streak });
      const cur = byLang[owner] ?? NO_PROGRESS();
      byLang[owner] = { stories: { ...legacy.stories, ...cur.stories }, streak: cur.streak.count >= legacy.streak.count ? cur.streak : legacy.streak };
    }
  } catch {
    byLang = {};
  }
  const active = byLang[lang] ?? NO_PROGRESS();
  return { mode, playback, byLang, lang, stories: active.stories, streak: active.streak };
}

/** Persist: the active language's progress is folded into `byLang`; the legacy fields are not written. */
function save(state: ReadingPersisted): ByLang {
  const byLang = { ...state.byLang, [state.lang]: { stories: state.stories, streak: state.streak } };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: state.mode, playback: state.playback, byLang }));
  } catch {
    /* ignore (private mode / SSR) */
  }
  return byLang;
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
  /** Show another language's progress (called when the learning language changes). */
  switchLang(lang: string): void;
}

const EMPTY: StoryProgress = { pos: 0, done: false };

export const useReadingStore = create<ReadingState>((set, get) => ({
  ...load(),

  setMode(mode) {
    set({ mode });
    set({ byLang: save(get()) });
  },

  setPlayback(playback) {
    set({ playback });
    set({ byLang: save(get()) });
  },

  savePosition(storyId, pos) {
    const cur = get().stories[storyId] ?? EMPTY;
    if (pos <= cur.pos && !(cur.pos === 0 && pos === 0)) return; // resume only moves forward
    set({ stories: { ...get().stories, [storyId]: { ...cur, pos: Math.max(cur.pos, pos) } } });
    set({ byLang: save(get()) });
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
    set({ byLang: save(get()) });
  },

  progressFor(storyId) {
    return get().stories[storyId] ?? EMPTY;
  },

  completedCount() {
    return Object.values(get().stories).filter((p) => p.done).length;
  },

  switchLang(lang) {
    if (get().lang === lang) return;
    const byLang = save(get()); // bank the language we are leaving
    const next = byLang[lang] ?? NO_PROGRESS();
    set({ lang, byLang, stories: next.stories, streak: next.streak });
  },
}));

// Progress shown always belongs to the language being learned.
useAppStore.subscribe((state, previous) => {
  if (state.learningLang !== previous.learningLang) useReadingStore.getState().switchLang(state.learningLang);
});
