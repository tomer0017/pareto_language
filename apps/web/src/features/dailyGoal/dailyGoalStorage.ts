import { isGoalMinutes, type GoalMinutes } from './dailyGoalTime.js';

/**
 * Daily Goal — what is persisted, and where. The engine only ever talks to the `DailyGoalStorage` /
 * `SessionFlagStore` interfaces, so localStorage can later be replaced (or mirrored) by an account
 * sync without touching the timer logic or the UI.
 *
 *   `ready.dailyGoal.v1`          the day's record (shared by every READY tab of this browser)
 *   `ready.dailyGoal.owner.v1`    which tab is counting right now (multi-tab: one counter at a time)
 *   `ready.dailyGoal.session.v1`  sessionStorage, per tab: this tab's open session, so a refresh
 *                                 continues it — but a tab opened later never starts counting by itself
 */
export const DAILY_GOAL_KEY = 'ready.dailyGoal.v1';
export const DAILY_GOAL_OWNER_KEY = 'ready.dailyGoal.owner.v1';
export const DAILY_GOAL_SESSION_KEY = 'ready.dailyGoal.session.v1';

/** One local day of practice — plain, serialisable data. */
export interface DailyGoalRecord {
  v: 1;
  /** The local calendar day (`YYYY-MM-DD`) the counted time belongs to. */
  date: string;
  /** The learner's goal — a preference: it survives the day change. */
  goalMinutes: GoalMinutes | null;
  /** Active learning time counted on `date`. Whether the goal is reached is derived from it. */
  activeMs: number;
  /** The day whose completion celebration already played — it plays once per day. */
  celebratedForDate: string | null;
  /** When this record was last written (ms since the epoch). */
  updatedAt: number;
}

export const freshRecord = (date: string, goalMinutes: GoalMinutes | null = null, at = 0): DailyGoalRecord =>
  ({ v: 1, date, goalMinutes, activeMs: 0, celebratedForDate: null, updatedAt: at });

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** A stored record, or null when it is absent, unreadable, of another version, or impossible. */
export function parseRecord(raw: string | null): DailyGoalRecord | null {
  if (!raw) return null;
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (typeof value !== 'object' || value === null) return null;
  const r = value as Record<string, unknown>;
  if (r.v !== 1) return null;
  if (typeof r.date !== 'string' || !DATE.test(r.date)) return null;
  if (r.goalMinutes !== null && !isGoalMinutes(r.goalMinutes)) return null;
  // A day has 24 hours: more active time than that is a corrupted value, not a learner.
  if (typeof r.activeMs !== 'number' || !Number.isFinite(r.activeMs) || r.activeMs < 0 || r.activeMs > DAY_MS) return null;
  if (r.celebratedForDate !== null && (typeof r.celebratedForDate !== 'string' || !DATE.test(r.celebratedForDate))) return null;
  const updatedAt = typeof r.updatedAt === 'number' && Number.isFinite(r.updatedAt) ? r.updatedAt : 0;
  return { v: 1, date: r.date, goalMinutes: r.goalMinutes, activeMs: r.activeMs, celebratedForDate: r.celebratedForDate, updatedAt };
}

/** The shared store: the day's record and the counting tab. */
export interface DailyGoalStorage {
  read(): DailyGoalRecord | null;
  write(record: DailyGoalRecord): void;
  readOwner(): string | null;
  writeOwner(tabId: string, at: number): void;
  /** Called when ANOTHER tab changed the record or the owner (never for this tab's own writes). */
  subscribe(listener: () => void): () => void;
}

/** This tab's open session: the day it was switched on, and when the page was last alive. */
export interface SessionFlag { date: string; at: number }
export interface SessionFlagStore {
  read(): SessionFlag | null;
  write(flag: SessionFlag | null): void;
}

const parseOwner = (raw: string | null): string | null => {
  try {
    const o = raw ? (JSON.parse(raw) as { tab?: unknown }) : null;
    return typeof o?.tab === 'string' ? o.tab : null;
  } catch { return null; }
};
const parseFlag = (raw: string | null): SessionFlag | null => {
  try {
    const f = raw ? (JSON.parse(raw) as Partial<SessionFlag>) : null;
    return f && typeof f.date === 'string' && DATE.test(f.date) && typeof f.at === 'number' && Number.isFinite(f.at) ? { date: f.date, at: f.at } : null;
  } catch { return null; }
};

/** A storage area of string keys (localStorage / sessionStorage, or the in-memory stand-in). */
interface KeyValue { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
const safeGet = (area: KeyValue | null, key: string): string | null => { try { return area?.getItem(key) ?? null; } catch { return null; } };
// Private mode, a full quota, a blocked storage: progress then lives for this page only — never a crash.
const safeSet = (area: KeyValue | null, key: string, value: string | null): void => {
  try { if (value === null) area?.removeItem(key); else area?.setItem(key, value); } catch { /* non-fatal */ }
};
const area = (get: () => Storage): KeyValue | null => { try { return get(); } catch { return null; } };

/** The browser stores: localStorage (shared across tabs, with `storage` events) + sessionStorage. */
export function browserDailyGoalStorage(win: Window): DailyGoalStorage {
  const local = area(() => win.localStorage);
  return {
    read: () => parseRecord(safeGet(local, DAILY_GOAL_KEY)),
    write: (record) => safeSet(local, DAILY_GOAL_KEY, JSON.stringify(record)),
    readOwner: () => parseOwner(safeGet(local, DAILY_GOAL_OWNER_KEY)),
    writeOwner: (tab, at) => safeSet(local, DAILY_GOAL_OWNER_KEY, JSON.stringify({ tab, at })),
    subscribe(listener) {
      // `storage` fires in every OTHER tab of the origin when one tab writes — the cross-tab channel.
      const onStorage = (e: StorageEvent): void => { if (e.key === DAILY_GOAL_KEY || e.key === DAILY_GOAL_OWNER_KEY || e.key === null) listener(); };
      win.addEventListener('storage', onStorage);
      return () => win.removeEventListener('storage', onStorage);
    },
  };
}
export function browserSessionFlag(win: Window): SessionFlagStore {
  const session = area(() => win.sessionStorage);
  return {
    read: () => parseFlag(safeGet(session, DAILY_GOAL_SESSION_KEY)),
    write: (flag) => safeSet(session, DAILY_GOAL_SESSION_KEY, flag ? JSON.stringify(flag) : null),
  };
}

/**
 * An in-memory storage area that several "tabs" can share — each `tab()` handle behaves like one
 * browser tab: its writes notify the OTHER handles, exactly like the `storage` event. Used by the
 * tests (two tabs, corruption, reloads) and usable wherever localStorage does not exist.
 */
export function memoryArea() {
  const map = new Map<string, string>();
  const handles = new Set<{ notify: () => void }>();
  const kv: KeyValue = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); }, removeItem: (k) => { map.delete(k); } };
  return {
    /** The raw value under a key (as another program — or a corruption — would see it). */
    raw: (key: string): string | null => map.get(key) ?? null,
    setRaw: (key: string, value: string): void => { map.set(key, value); },
    tab(): DailyGoalStorage {
      const listeners = new Set<() => void>();
      const handle = { notify: () => { for (const l of listeners) l(); } };
      handles.add(handle);
      const broadcast = (): void => { for (const h of handles) if (h !== handle) h.notify(); };
      return {
        read: () => parseRecord(safeGet(kv, DAILY_GOAL_KEY)),
        write: (record) => { safeSet(kv, DAILY_GOAL_KEY, JSON.stringify(record)); broadcast(); },
        readOwner: () => parseOwner(safeGet(kv, DAILY_GOAL_OWNER_KEY)),
        writeOwner: (tab, at) => { safeSet(kv, DAILY_GOAL_OWNER_KEY, JSON.stringify({ tab, at })); broadcast(); },
        subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
      };
    },
  };
}
export function memorySessionFlag(): SessionFlagStore & { raw: () => string | null } {
  let value: string | null = null;
  return {
    raw: () => value,
    read: () => parseFlag(value),
    write: (flag) => { value = flag ? JSON.stringify(flag) : null; },
  };
}
