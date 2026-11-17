import { freshRecord, type DailyGoalRecord, type DailyGoalStorage, type SessionFlagStore } from './dailyGoalStorage.js';
import { CHECKPOINT_MS, IDLE_MS, MAX_TICK_GAP_MS, RELOAD_GRACE_MS, goalMs, localDateKey, type GoalMinutes } from './dailyGoalTime.js';

/**
 * Daily Goal — the engine: the ONE place that decides what counts as active learning time. No DOM,
 * no React, no mission: the browser (or a test) feeds it the clock, page visibility, the learner's
 * activity and storage; it keeps the day's record and tells its subscribers when the view changes.
 *
 * Active time is never a counter incremented by a timer. It is
 *
 *   counted today (stored)  +  (end − countingSince)   for the one interval running now,
 *
 * where `end` is now — but never later than two minutes after the last activity (idle), and never
 * later than the last moment the page was seen alive (a sleeping laptop, a frozen tab). The running
 * interval is folded into the stored total at checkpoints and at every lifecycle change.
 *
 * Counting needs ALL of: a goal, today's session switched on (by the learner, in this tab), a visible
 * page, recent activity, and this tab being the counting tab (the last READY tab the learner used).
 */
export type DailyGoalStatus = 'unset' | 'paused' | 'running' | 'done';

export interface DailyGoalView {
  /** unset = no goal yet · paused = a goal, today's timer off · running = timer on · done = goal reached. */
  status: DailyGoalStatus;
  goalMinutes: GoalMinutes | null;
  /** Active time today, in whole seconds (live). */
  seconds: number;
  /** Time is moving right now. */
  counting: boolean;
  /** Today's timer is switched on in this tab (it counts whenever the learner is active here). */
  sessionActive: boolean;
  /** 0…1 toward today's goal. */
  progress: number;
  /** Goes up by one each time a celebration is due — at most once per day. */
  celebrations: number;
}

export interface DailyGoalEnv {
  storage: DailyGoalStorage;
  session: SessionFlagStore;
  now: () => number;
  isVisible: () => boolean;
  /** This tab's id (random per page load). */
  tabId: string;
}

/** Activity closer together than this changes nothing worth recomputing (a scroll fires many events). */
const ACTIVITY_THROTTLE_MS = 1000;
const DAY_MS = 86_400_000;

export const UNSET_VIEW: DailyGoalView = { status: 'unset', goalMinutes: null, seconds: 0, counting: false, sessionActive: false, progress: 0, celebrations: 0 };
const sameView = (a: DailyGoalView, b: DailyGoalView): boolean =>
  a.status === b.status && a.goalMinutes === b.goalMinutes && a.seconds === b.seconds && a.counting === b.counting
  && a.sessionActive === b.sessionActive && a.progress === b.progress && a.celebrations === b.celebrations;

export class DailyGoalEngine {
  private rec: DailyGoalRecord;
  private sessionOn: boolean;
  /** Start of the interval being counted right now — null when the timer is not counting. */
  private countingSince: number | null = null;
  private lastActivityAt = -Infinity;
  /** The last moment this page was seen alive (a tick, an event). */
  private lastSeenAt: number;
  private lastCheckpointAt: number;
  private owner: string | null;
  private celebrationCount = 0;
  private view: DailyGoalView;
  private readonly listeners = new Set<() => void>();
  private readonly stopSync: () => void;

  constructor(private readonly env: DailyGoalEnv) {
    const now = env.now();
    const today = localDateKey(now);
    const stored = env.storage.read(); // null when absent, corrupted or of another version: start clean
    if (stored && stored.date === today) this.rec = stored;
    else {
      // A new local day (or no usable record): nothing counted yet, the goal preference is kept.
      this.rec = freshRecord(today, stored?.goalMinutes ?? null, now);
      if (stored) env.storage.write(this.rec);
    }
    // A refresh continues the open session; a tab opened later (or long after) never starts by itself.
    const flag = env.session.read();
    this.sessionOn = this.rec.goalMinutes !== null && flag !== null && flag.date === today && now - flag.at >= 0 && now - flag.at <= RELOAD_GRACE_MS;
    if (!this.sessionOn && flag) env.session.write(null);
    this.owner = env.storage.readOwner();
    this.lastSeenAt = now;
    this.lastCheckpointAt = now;
    this.view = this.compute(now);
    this.stopSync = env.storage.subscribe(() => this.syncFromStorage());
  }

  /* ── reading ───────────────────────────────────────────────────────────────────────────────── */

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  readonly getView = (): DailyGoalView => this.view;
  /** The day's record as it would be stored now (the running interval included) — plain data. */
  record(): DailyGoalRecord { return { ...this.rec, activeMs: this.liveMs(this.env.now()) }; }

  /* ── the learner ───────────────────────────────────────────────────────────────────────────── */

  /** Pick (or change) today's goal. Choosing starts today's timer; the time counted so far is kept. */
  chooseGoal(minutes: GoalMinutes): void {
    const now = this.env.now();
    this.rollover(now);
    this.commit(now, true);
    this.rec = { ...this.latest(), goalMinutes: minutes, updatedAt: now };
    this.env.storage.write(this.rec);
    this.switchOn(now);
  }
  /** Switch today's timer on (after a pause, a new day, or coming back later). */
  resume(): void {
    const now = this.env.now();
    this.rollover(now);
    if (this.rec.goalMinutes === null) return;
    this.switchOn(now);
  }
  pause(): void {
    const now = this.env.now();
    this.commit(now, false);
    this.sessionOn = false;
    this.env.session.write(null);
    this.refresh(now);
  }

  /** A meaningful action in READY: a tap, a key, a scroll — anywhere in the app. */
  activity(): void {
    const now = this.env.now();
    // Timer off, or already counting with a fresh activity: nothing to recompute.
    if (!this.sessionOn || (this.countingSince !== null && now - this.lastActivityAt < ACTIVITY_THROTTLE_MS && !this.suspended(now))) {
      this.lastActivityAt = now;
      this.lastSeenAt = now;
      return;
    }
    if (!this.rollover(now) && this.countingSince !== null && (this.suspended(now) || now - this.lastActivityAt >= IDLE_MS)) this.commit(now, false);
    this.lastActivityAt = now;
    this.lastSeenAt = now;
    this.start(now);
    this.refresh(now);
  }

  /* ── the page ──────────────────────────────────────────────────────────────────────────────── */

  /** Every second while the page lives: the day, the idle limit, suspension, checkpoints, the goal. */
  tick(): void {
    const now = this.env.now();
    if (!this.rollover(now) && this.countingSince !== null) {
      if (this.owner !== this.env.tabId || !this.env.isVisible() || this.suspended(now) || now - this.lastActivityAt >= IDLE_MS) this.commit(now, false);
      else if (now - this.lastCheckpointAt >= CHECKPOINT_MS) this.commit(now, true);
    }
    this.lastSeenAt = now;
    this.refresh(now);
  }
  /** The page was hidden (fold the running interval in, stop) or shown again (wait for activity). */
  visibilityChanged(): void {
    const now = this.env.now();
    if (!this.rollover(now) && !this.env.isVisible()) {
      this.commit(now, false);
      this.touchSession(now);
    }
    this.lastSeenAt = now;
    this.refresh(now);
  }
  /** The page is going away (closed, reloaded, navigated from): keep every counted second. */
  pageHide(): void {
    const now = this.env.now();
    if (!this.rollover(now)) this.commit(now, false);
    this.touchSession(now);
    this.refresh(now);
  }
  /** The page came back from the back/forward cache: only a short absence continues the session. */
  pageShow(): void {
    const now = this.env.now();
    this.rollover(now);
    const flag = this.env.session.read();
    if (this.sessionOn && !(flag && flag.date === this.rec.date && now - flag.at <= RELOAD_GRACE_MS)) {
      this.sessionOn = false;
      this.env.session.write(null);
    }
    this.lastSeenAt = now;
    this.syncFromStorage();
  }
  dispose(): void {
    this.pageHide();
    this.stopSync();
    this.listeners.clear();
  }

  /* ── internals ─────────────────────────────────────────────────────────────────────────────── */

  /** Silence since the page was last seen alive: the device slept or the tab was frozen. */
  private suspended(now: number): boolean { return now - this.lastSeenAt > MAX_TICK_GAP_MS; }

  /** Where the running interval ends if it is folded in now. */
  private end(now: number): number {
    const since = this.countingSince ?? now;
    const alive = this.suspended(now) ? this.lastSeenAt : now;
    return Math.max(since, Math.min(alive, this.lastActivityAt + IDLE_MS));
  }
  private liveMs(now: number): number {
    return this.rec.activeMs + (this.countingSince === null ? 0 : this.end(now) - this.countingSince);
  }
  /** The stored record when it is today's — another tab may have added time since this one read it. */
  private latest(): DailyGoalRecord {
    const stored = this.env.storage.read();
    return stored && stored.date === this.rec.date ? stored : this.rec;
  }

  /** Fold the running interval into the day's record. `keep` continues counting from now. */
  private commit(now: number, keep: boolean): void {
    if (this.countingSince === null) return;
    const end = this.end(now);
    const delta = end - this.countingSince;
    if (delta > 0) {
      const base = this.latest();
      this.rec = { ...base, activeMs: Math.min(DAY_MS, base.activeMs + delta), updatedAt: now };
      this.env.storage.write(this.rec);
    }
    // An interval cut short (idle, suspended) stops; the next activity starts a new one.
    this.countingSince = keep && end === now ? now : null;
    this.lastCheckpointAt = now;
    this.touchSession(now);
  }

  /** The local day changed: yesterday's time is put away, the goal stays, nothing starts by itself. */
  private rollover(now: number): boolean {
    const today = localDateKey(now);
    if (today === this.rec.date) return false;
    this.countingSince = null;
    this.sessionOn = false;
    this.env.session.write(null);
    const stored = this.env.storage.read();
    if (stored && stored.date === today) this.rec = stored; // another tab already opened the new day
    else {
      this.rec = freshRecord(today, stored?.goalMinutes ?? this.rec.goalMinutes, now);
      this.env.storage.write(this.rec);
    }
    this.refresh(now);
    return true;
  }

  private switchOn(now: number): void {
    this.sessionOn = true;
    this.lastActivityAt = now;
    this.lastSeenAt = now;
    this.touchSession(now);
    this.start(now);
    this.refresh(now);
  }

  /** Start counting if everything allows it — and become the counting tab. */
  private start(now: number): void {
    if (this.countingSince !== null || !this.sessionOn || this.rec.goalMinutes === null || !this.env.isVisible()) return;
    if (now - this.lastActivityAt >= IDLE_MS) return;
    if (this.owner !== this.env.tabId) {
      // The last READY tab the learner used counts; every other tab stops (see syncFromStorage).
      this.owner = this.env.tabId;
      this.env.storage.writeOwner(this.env.tabId, now);
    }
    this.countingSince = now;
    this.lastCheckpointAt = now;
  }

  private touchSession(now: number): void {
    if (this.sessionOn) this.env.session.write({ date: this.rec.date, at: now });
  }

  /** Another tab wrote: take its record; if it is the counting tab now, stop counting here. */
  private syncFromStorage(): void {
    const now = this.env.now();
    this.owner = this.env.storage.readOwner();
    if (this.countingSince !== null && this.owner !== this.env.tabId) this.commit(now, false);
    const stored = this.env.storage.read();
    if (stored && stored.date === this.rec.date) this.rec = stored;
    else if (stored && stored.date === localDateKey(now)) this.rollover(now);
    this.refresh(now, false);
  }

  /** Recompute the view (and celebrate the goal the first time today it is reached). */
  private refresh(now: number, mayCelebrate = this.countingSince !== null): void {
    const goal = this.rec.goalMinutes;
    // Only the tab that is counting celebrates: another tab learning of it from storage stays quiet.
    if (mayCelebrate && goal !== null && this.liveMs(now) >= goalMs(goal) && this.rec.celebratedForDate !== this.rec.date) {
      this.commit(now, true);
      this.rec = { ...this.latest(), celebratedForDate: this.rec.date, updatedAt: now };
      this.env.storage.write(this.rec);
      this.celebrationCount += 1;
    }
    const next = this.compute(now);
    if (sameView(next, this.view)) return;
    this.view = next;
    for (const listener of this.listeners) listener();
  }

  private compute(now: number): DailyGoalView {
    const goal = this.rec.goalMinutes;
    const seconds = Math.floor(this.liveMs(now) / 1000);
    const goalSeconds = goal === null ? 0 : goalMs(goal) / 1000;
    const done = goal !== null && seconds >= goalSeconds;
    return {
      status: goal === null ? 'unset' : done ? 'done' : this.sessionOn ? 'running' : 'paused',
      goalMinutes: goal,
      seconds,
      counting: this.countingSince !== null && this.end(now) === now,
      sessionActive: this.sessionOn,
      progress: goal === null ? 0 : Math.min(1, seconds / goalSeconds),
      celebrations: this.celebrationCount,
    };
  }
}
