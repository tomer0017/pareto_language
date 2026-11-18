import { afterEach, describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DailyGoalEngine, type DailyGoalView } from './dailyGoalEngine.js';
import {
  DAILY_GOAL_KEY, DAILY_GOAL_SESSION_KEY, browserDailyGoalStorage, memoryArea, memorySessionFlag, parseRecord,
  type DailyGoalStorage, type SessionFlagStore,
} from './dailyGoalStorage.js';
import { CHECKPOINT_MS, GOAL_OPTIONS, IDLE_MS, formatActive, localDateKey } from './dailyGoalTime.js';
import { ACTIVITY_EVENTS, bottomClearance, celebrationFor, connectDailyGoal, prefersReducedMotion, restingBar } from './useDailyGoalTimer.js';
import { DailyGoalBubble, DailyGoalPanel, GoalConfetti, bubbleLabel } from './DailyGoalTimer.js';
import { UI_DICTIONARIES, setUiLangDict } from '../../shared/i18n/strings.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { useBootcampStore } from '../bootcamp/bootcampStore.js';

/**
 * Daily Goal — the global timer. The engine is driven here exactly as the browser drives it (the clock,
 * page visibility, the learner's activity, page lifecycle, other tabs), with a simulated clock.
 */
const SEC = 1000;
const MIN = 60 * SEC;
/** 09:00 on 17 Nov 2026, LOCAL time — the tests never depend on the machine's time zone. */
const T0 = new Date(2026, 10, 17, 9, 0, 0).getTime();

function harness(o: { area?: ReturnType<typeof memoryArea>; session?: SessionFlagStore; at?: number; tab?: string; storage?: DailyGoalStorage } = {}) {
  const area = o.area ?? memoryArea();
  const clock = { now: o.at ?? T0 };
  const page = { visible: true };
  const session = o.session ?? memorySessionFlag();
  const storage = o.storage ?? area.tab();
  const engine = new DailyGoalEngine({ storage, session, now: () => clock.now, isVisible: () => page.visible, tabId: o.tab ?? 'tab-a' });
  /** Let `ms` pass, ticking every second like the page does; `active` = the learner keeps acting (a tap every 20 s). */
  const run = (ms: number, { active = true, ticks = true }: { active?: boolean; ticks?: boolean } = {}): void => {
    const end = clock.now + ms;
    let nextTap = clock.now + 20 * SEC;
    while (clock.now < end) {
      clock.now = Math.min(end, clock.now + SEC);
      if (active && clock.now >= nextTap) { engine.activity(); nextTap += 20 * SEC; }
      if (ticks) engine.tick();
    }
  };
  const view = (): DailyGoalView => engine.getView();
  return { engine, area, clock, page, session, storage, run, view };
}
const stored = (area: ReturnType<typeof memoryArea>) => parseRecord(area.raw(DAILY_GOAL_KEY));

describe('the clock and the calendar', () => {
  it('time is human and compact: M:SS under an hour, H:MM:SS after — never 00:04:21', () => {
    expect([0, 59, 60, 261, 768, 3599].map((s) => formatActive(s * SEC))).toEqual(['0:00', '0:59', '1:00', '4:21', '12:48', '59:59']);
    expect([3600, 3725, 7385].map((s) => formatActive(s * SEC))).toEqual(['1:00:00', '1:02:05', '2:03:05']);
    expect(formatActive(261_999)).toBe('4:21'); // whole seconds, never rounded up
  });
  it('the day is the learner\'s LOCAL calendar day (YYYY-MM-DD), cut at local midnight — never UTC', () => {
    expect(localDateKey(new Date(2026, 10, 17, 0, 0, 0))).toBe('2026-11-17');
    expect(localDateKey(new Date(2026, 10, 17, 0, 30))).toBe('2026-11-17');
    expect(localDateKey(new Date(2026, 10, 17, 23, 59, 59))).toBe('2026-11-17');
    expect(localDateKey(new Date(2026, 10, 18, 0, 0, 0))).toBe('2026-11-18');
    expect(localDateKey(new Date(2026, 0, 5, 12).getTime())).toBe('2026-01-05');
    const src = readFileSync(fileURLToPath(new URL('./dailyGoalTime.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/toISOString|getUTC/);
  });
  it('the goals are exactly 5, 10 and 15 minutes; the idle limit is about two minutes', () => {
    expect([...GOAL_OPTIONS]).toEqual([5, 10, 15]);
    expect(IDLE_MS).toBe(2 * MIN);
  });
});

describe('choosing a goal starts today\'s timer', () => {
  it('1. no goal → the timer is not running, whatever the learner does', () => {
    const h = harness();
    expect(h.view()).toMatchObject({ status: 'unset', goalMinutes: null, counting: false, seconds: 0 });
    h.engine.activity();
    h.run(5 * MIN);
    expect(h.view()).toMatchObject({ status: 'unset', counting: false, seconds: 0 });
  });
  for (const [n, minutes] of [[2, 5], [3, 10], [4, 15]] as const) {
    it(`${n}. choosing ${minutes} starts the timer at once — no second Start button`, () => {
      const h = harness();
      h.engine.chooseGoal(minutes);
      expect(h.view()).toMatchObject({ status: 'running', goalMinutes: minutes, counting: true, sessionActive: true, seconds: 0 });
      h.run(30 * SEC);
      expect(h.view()).toMatchObject({ status: 'running', seconds: 30 });
      expect(stored(h.area)?.goalMinutes).toBe(minutes);
    });
  }
});

describe('global — the same timer everywhere in READY', () => {
  it('5. route changes do not reset or pause it (the engine knows no route)', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(MIN);
    for (const view of ['listen', 'profile', 'home', 'bootcamp', 'core'] as const) {
      useAppStore.getState().navigate(view);
      h.engine.activity(); // the tap that navigated
      h.run(10 * SEC);
    }
    expect(h.view()).toMatchObject({ status: 'running', seconds: 110, counting: true });
  });
  it('6. mission changes do not reset or pause it (no mission owns it)', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(MIN);
    for (const day of [18, 16, 17, null]) {
      useBootcampStore.setState({ activeDay: day });
      h.engine.activity();
      h.run(15 * SEC);
    }
    expect(h.view().seconds).toBe(120);
  });
  it('5–6. it is mounted ONCE, at the app shell — outside the screen switch; no mission, content or store file touches it', () => {
    const app = readFileSync(fileURLToPath(new URL('../../app/App.tsx', import.meta.url)), 'utf8');
    expect(app.match(/<DailyGoalTimer \/>/g)).toHaveLength(1);
    expect(app.slice(app.indexOf('const SCREENS'), app.indexOf('export function App'))).not.toMatch(/DailyGoal/);
    expect(app).toMatch(/\{shell && \(\s*<DailyGoalBoundary>\s*<DailyGoalTimer \/>/);
    const src = fileURLToPath(new URL('../../', import.meta.url));
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) { if (name !== 'dailyGoal') walk(p); continue; }
        // (Tests elsewhere may name it — to check, for instance, that it is still global and not a Home card.)
        if (!/\.(ts|tsx)$/.test(name) || /\.test\.tsx?$/.test(name) || p.endsWith(join('app', 'App.tsx')) || p.endsWith(join('i18n', 'strings.ts'))) continue;
        if (/dailyGoal|DailyGoal/.test(readFileSync(p, 'utf8'))) offenders.push(p.slice(src.length));
      }
    };
    walk(src);
    expect(offenders).toEqual([]);
  });
  it('7. activity anywhere in READY counts: taps, keys, touches, wheel and scroll on the document (capture phase)', () => {
    const h = harness();
    const doc = new EventTarget();
    const win = new EventTarget();
    const added: [string, unknown][] = [];
    const spyDoc = Object.assign(doc, { addEventListener: (type: string, fn: EventListenerOrEventListenerObject, opts?: unknown) => { added.push([type, opts]); EventTarget.prototype.addEventListener.call(doc, type, fn, opts as AddEventListenerOptions); } });
    let tick: () => void = () => {};
    const stop = connectDailyGoal(h.engine, { doc: spyDoc, win, every: (fn) => { tick = fn; return () => { tick = () => {}; }; } });
    h.engine.chooseGoal(10);
    for (const type of ACTIVITY_EVENTS) {
      for (let i = 0; i < 25; i++) { h.clock.now += SEC; tick(); }
      doc.dispatchEvent(new Event(type));
    }
    expect(h.view().seconds).toBe(125); // five events, 25 s apart: every second counted
    expect([...ACTIVITY_EVENTS]).toEqual(['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll']);
    for (const type of ACTIVITY_EVENTS) expect(added.find(([t]) => t === type)?.[1]).toEqual({ capture: true, passive: true });
    expect(added.map(([t]) => t)).not.toContain('mousemove'); // a cursor drifting over an open tab is not learning
    stop();
  });
});

describe('only REAL active time counts', () => {
  it('8. a hidden tab does not count — and showing it again waits for the learner', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(30 * SEC);
    h.page.visible = false;
    h.engine.visibilityChanged();
    h.run(5 * MIN);
    h.engine.activity(); // even a stray event while hidden
    expect(h.view()).toMatchObject({ seconds: 30, counting: false, sessionActive: true });
    h.page.visible = true;
    h.engine.visibilityChanged();
    h.run(MIN, { active: false });
    expect(h.view().seconds).toBe(30); // the hidden interval and the untouched return are not counted
    h.engine.activity();
    h.run(20 * SEC);
    expect(h.view()).toMatchObject({ seconds: 50, counting: true });
  });
  it('9. inactivity stops counting after about two minutes (those two minutes count, nothing after)', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(10 * MIN, { active: false });
    expect(h.view()).toMatchObject({ seconds: 120, counting: false, sessionActive: true, status: 'running' });
    expect(stored(h.area)?.activeMs).toBe(120 * SEC); // flushed at the idle limit
  });
  it('10. activity resumes the open session — the idle gap is not counted', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(10 * MIN, { active: false });
    h.engine.activity();
    expect(h.view().counting).toBe(true);
    h.run(30 * SEC);
    expect(h.view().seconds).toBe(150);
  });
  it('21. a sleeping device (no ticks, no events) is not counted — not even the idle allowance', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(30 * SEC);
    h.clock.now += 3 * 60 * MIN; // lid closed for three hours: the page saw nothing
    h.engine.tick();
    expect(h.view()).toMatchObject({ seconds: 30, counting: false });
    // waking up straight into a tap: the sleep is still excluded, then counting goes on
    const w = harness();
    w.engine.chooseGoal(10);
    w.run(30 * SEC);
    w.clock.now += 90 * SEC; // shorter than the idle limit — still a suspension, still excluded
    w.engine.activity();
    w.run(20 * SEC);
    expect(w.view().seconds).toBe(50);
  });
  it('the time is never a tick counter: irregular, throttled ticks still give the exact active time', () => {
    const h = harness();
    h.engine.chooseGoal(15);
    for (let i = 0; i < 60; i++) { h.clock.now += (i % 3 + 1) * SEC; if (i % 10 === 0) h.engine.activity(); h.engine.tick(); }
    expect(h.view().seconds).toBe(120); // 60 ticks of 1–3 s = 120 s of wall time, all active
    const src = readFileSync(fileURLToPath(new URL('./dailyGoalEngine.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/setInterval|\+\+|\+= 1000|\+= SEC/);
  });
  it('storage is written at checkpoints, not every second (and not on every event)', () => {
    const area = memoryArea();
    const base = area.tab();
    let writes = 0;
    const storage: DailyGoalStorage = { ...base, write: (r) => { writes++; base.write(r); } };
    const h = harness({ area, storage });
    h.engine.chooseGoal(15);
    for (let i = 0; i < 300; i++) { h.clock.now += SEC; h.engine.activity(); h.engine.activity(); h.engine.tick(); }
    expect(h.view().seconds).toBe(300);
    expect(writes).toBeLessThanOrEqual(1 + Math.ceil(300 * SEC / CHECKPOINT_MS) + 1);
    expect(stored(area)!.activeMs).toBeGreaterThanOrEqual(300 * SEC - CHECKPOINT_MS);
  });
});

describe('leaving and coming back', () => {
  it('11. closing or reloading keeps every counted second; a refresh continues the open session', () => {
    const area = memoryArea();
    const session = memorySessionFlag();
    const a = harness({ area, session });
    a.engine.chooseGoal(10);
    a.run(90 * SEC);
    a.engine.pageHide();
    expect(stored(area)?.activeMs).toBe(90 * SEC);
    // the reload: a new page, a new tab id, the same tab's sessionStorage, a second later
    const b = harness({ area, session, at: a.clock.now + SEC, tab: 'tab-a2' });
    expect(b.view()).toMatchObject({ seconds: 90, status: 'running', sessionActive: true, counting: false });
    b.engine.activity();
    b.run(30 * SEC);
    expect(b.view().seconds).toBe(120);
    // a crash without pagehide loses at most one checkpoint
    const c = harness();
    c.engine.chooseGoal(10);
    c.run(MIN);
    expect(stored(c.area)!.activeMs).toBeGreaterThanOrEqual(MIN - CHECKPOINT_MS);
  });
  it('12. reopening the same day keeps the time but never starts counting by itself', () => {
    const area = memoryArea();
    const morning = harness({ area });
    morning.engine.chooseGoal(10);
    morning.run(6 * MIN + 42 * SEC);
    morning.engine.pageHide();
    // evening: a new tab (fresh sessionStorage)
    const evening = harness({ area, at: morning.clock.now + 9 * 60 * MIN, tab: 'tab-b' });
    expect(evening.view()).toMatchObject({ seconds: 402, status: 'paused', sessionActive: false, counting: false, goalMinutes: 10 });
    evening.engine.activity();
    evening.run(10 * MIN);
    expect(evening.view()).toMatchObject({ seconds: 402, counting: false });
    // the same tab, reloaded long after it was left: not a refresh — it does not continue either
    const session = memorySessionFlag();
    const left = harness({ area: memoryArea(), session });
    left.engine.chooseGoal(5);
    left.run(MIN);
    left.engine.pageHide();
    const back = harness({ area: left.area, session, at: left.clock.now + 30 * MIN, tab: 'tab-c' });
    expect(back.view()).toMatchObject({ status: 'paused', sessionActive: false, seconds: 60 });
    expect(session.raw()).toBeNull();
  });
  it('13. resuming by hand continues from the stored time', () => {
    const area = memoryArea();
    const first = harness({ area });
    first.engine.chooseGoal(10);
    first.run(6 * MIN + 42 * SEC);
    first.engine.pageHide();
    const later = harness({ area, at: first.clock.now + 5 * 60 * MIN, tab: 'tab-b' });
    later.engine.resume();
    expect(later.view()).toMatchObject({ status: 'running', counting: true, seconds: 402 });
    later.run(MIN);
    expect(later.view().seconds).toBe(462);
  });
  it('pausing stops counting at once and keeps the time; nothing counts until resumed', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(MIN);
    h.engine.pause();
    expect(h.view()).toMatchObject({ status: 'paused', sessionActive: false, counting: false, seconds: 60 });
    h.run(5 * MIN);
    expect(h.view().seconds).toBe(60);
    h.engine.resume();
    h.run(MIN);
    expect(h.view()).toMatchObject({ status: 'running', seconds: 120 });
  });
});

describe('the goal — a milestone, not a maximum', () => {
  it('14. changing the goal never resets the time: 7:30 / 10m → 7:30 / 15m', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(7 * MIN + 30 * SEC);
    h.engine.chooseGoal(15);
    expect(h.view()).toMatchObject({ seconds: 450, goalMinutes: 15, status: 'running', counting: true });
    expect(stored(h.area)).toMatchObject({ goalMinutes: 15, activeMs: 450 * SEC });
  });
  it('15. reaching the goal marks it complete — at the first second it is reached', () => {
    const h = harness();
    h.engine.chooseGoal(5);
    h.run(5 * MIN - SEC);
    expect(h.view()).toMatchObject({ status: 'running', celebrations: 0 });
    h.run(SEC);
    expect(h.view()).toMatchObject({ status: 'done', seconds: 300, progress: 1, celebrations: 1 });
    expect(stored(h.area)?.celebratedForDate).toBe('2026-11-17');
  });
  it('16. the time keeps going after the goal: ✓ 12:48', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(12 * MIN + 48 * SEC);
    expect(h.view()).toMatchObject({ status: 'done', seconds: 768, counting: true });
  });
  it('a lower goal already passed is complete at once; it celebrates only if today has not', () => {
    const h = harness();
    h.engine.chooseGoal(15);
    h.run(7 * MIN);
    h.engine.chooseGoal(5);
    expect(h.view()).toMatchObject({ status: 'done', seconds: 420, celebrations: 1 });
    h.engine.chooseGoal(15);
    expect(h.view()).toMatchObject({ status: 'running', seconds: 420 });
    h.run(8 * MIN);
    expect(h.view()).toMatchObject({ status: 'done', celebrations: 1 }); // reached again — no second celebration
  });
  it('17. the celebration happens ONCE a day — pause, resume, goal changes, more time: never again', () => {
    const h = harness();
    h.engine.chooseGoal(5);
    h.run(6 * MIN);
    expect(h.view().celebrations).toBe(1);
    h.engine.pause();
    h.engine.resume();
    h.engine.chooseGoal(10);
    h.run(5 * MIN);
    h.engine.chooseGoal(5);
    h.run(MIN);
    expect(h.view().celebrations).toBe(1);
  });
  it('18. a reload (or a remount, or reopening) after completion never replays it', () => {
    const area = memoryArea();
    const session = memorySessionFlag();
    const a = harness({ area, session });
    a.engine.chooseGoal(5);
    a.run(5 * MIN);
    a.engine.pageHide();
    expect(a.view().celebrations).toBe(1);
    const b = harness({ area, session, at: a.clock.now + SEC, tab: 'tab-a2' });
    expect(b.view()).toMatchObject({ status: 'done', celebrations: 0 });
    b.engine.activity();
    b.run(3 * MIN);
    expect(b.view()).toMatchObject({ status: 'done', celebrations: 0, seconds: 480 });
  });
  it('no failure state: before the goal it is running or paused — never anything worse', () => {
    const h = harness();
    h.engine.chooseGoal(15);
    h.run(MIN);
    h.engine.pause();
    const states = new Set<string>([h.view().status]);
    h.engine.resume();
    h.run(30 * MIN, { active: false });
    states.add(h.view().status);
    expect([...states].sort()).toEqual(['paused', 'running']);
  });
});

describe('a new local day', () => {
  const lateEvening = new Date(2026, 10, 17, 23, 58, 0).getTime();
  it('19. at local midnight today\'s progress resets: time, completion and celebration', () => {
    const h = harness({ at: lateEvening });
    h.engine.chooseGoal(5);
    h.run(2 * MIN - SEC); // 23:59:59
    expect(h.view().seconds).toBe(119);
    h.run(3 * MIN);
    expect(h.view()).toMatchObject({ seconds: 0, status: 'paused', sessionActive: false, counting: false, celebrations: 0 });
    expect(stored(h.area)).toMatchObject({ date: '2026-11-18', activeMs: 0, celebratedForDate: null });
  });
  it('20. the goal preference survives the day change — and today\'s timer does not start by itself', () => {
    const h = harness({ at: lateEvening });
    h.engine.chooseGoal(10);
    h.run(5 * MIN);
    expect(h.view()).toMatchObject({ goalMinutes: 10, status: 'paused', seconds: 0 });
    h.run(5 * MIN);
    expect(h.view().seconds).toBe(0);
    h.engine.resume();
    h.run(MIN);
    expect(h.view()).toMatchObject({ goalMinutes: 10, status: 'running', seconds: 60 });
    // and a page opened the next morning finds the same: ⏱ 0:00 / 10m, not started
    const area = memoryArea();
    const y = harness({ area });
    y.engine.chooseGoal(10);
    y.run(12 * MIN);
    y.engine.pageHide();
    const tomorrow = harness({ area, at: T0 + 24 * 60 * MIN, tab: 'tab-n' });
    expect(tomorrow.view()).toMatchObject({ goalMinutes: 10, seconds: 0, status: 'paused', sessionActive: false, celebrations: 0 });
    expect(stored(area)).toMatchObject({ date: '2026-11-18', goalMinutes: 10, activeMs: 0, celebratedForDate: null });
  });
});

describe('several READY tabs', () => {
  it('22. two tabs never double-count: the tab the learner uses counts, the other stops', () => {
    const area = memoryArea();
    const a = harness({ area, tab: 'A' });
    const b = harness({ area, tab: 'B' });
    a.engine.chooseGoal(15);
    b.engine.resume(); // both tabs switched on, both visible (two windows side by side)
    const both = (ms: number, user: 'A' | 'B'): void => {
      for (let t = 0; t < ms; t += SEC) {
        a.clock.now += SEC; b.clock.now += SEC;
        if (t % (10 * SEC) === 0) (user === 'A' ? a : b).engine.activity();
        a.engine.tick(); b.engine.tick();
      }
    };
    both(MIN, 'A');
    both(MIN, 'B');
    both(MIN, 'A');
    a.engine.pageHide(); b.engine.pageHide();
    expect(stored(area)!.activeMs).toBe(3 * MIN); // three minutes of learning — not five or six
    expect(a.view().seconds).toBe(180);
    expect(b.view().seconds).toBe(180);
    expect(a.view().counting || b.view().counting).toBe(false);
  });
  it('a tab that only hears about the goal (from another tab) does not celebrate it too', () => {
    const area = memoryArea();
    const a = harness({ area, tab: 'A' });
    const b = harness({ area, tab: 'B' });
    a.engine.chooseGoal(5);
    for (let i = 0; i < 5 * 60; i++) { a.clock.now += SEC; b.clock.now += SEC; if (i % 20 === 0) a.engine.activity(); a.engine.tick(); b.engine.tick(); }
    expect(a.view()).toMatchObject({ status: 'done', celebrations: 1 });
    expect(b.view()).toMatchObject({ status: 'done', celebrations: 0 });
  });
});

describe('storage that cannot be trusted', () => {
  const bad = ['{not json', 'null', '"text"', '[]', JSON.stringify({ v: 1, date: '17/11/2026', goalMinutes: 10, activeMs: 1000, celebratedForDate: null }),
    JSON.stringify({ v: 1, date: '2026-11-17', goalMinutes: 7, activeMs: 1000, celebratedForDate: null }),
    JSON.stringify({ v: 1, date: '2026-11-17', goalMinutes: 10, activeMs: -5, celebratedForDate: null }),
    JSON.stringify({ v: 1, date: '2026-11-17', goalMinutes: 10, activeMs: 9e15, celebratedForDate: null }),
    JSON.stringify({ v: 1, date: '2026-11-17', goalMinutes: 10, activeMs: 'lots', celebratedForDate: null })];
  it('23. a corrupted record falls back safely to a clean day — and the next choice repairs it', () => {
    for (const raw of bad) {
      const area = memoryArea();
      area.setRaw(DAILY_GOAL_KEY, raw);
      const h = harness({ area });
      expect(h.view(), raw).toMatchObject({ status: 'unset', seconds: 0 });
      h.engine.chooseGoal(10);
      h.run(10 * SEC);
      h.engine.pageHide();
      expect(stored(area), raw).toMatchObject({ v: 1, date: '2026-11-17', goalMinutes: 10, activeMs: 10 * SEC });
    }
    // a garbled session flag is ignored the same way
    const session = memorySessionFlag();
    const area = memoryArea();
    area.setRaw(DAILY_GOAL_SESSION_KEY, '{oops');
    expect(harness({ area, session }).view().sessionActive).toBe(false);
  });
  it('23. storage that throws (private mode, blocked, full) never breaks the timer: it lives for this page', () => {
    const blocked = { get localStorage(): Storage { throw new Error('denied'); }, get sessionStorage(): Storage { throw new Error('denied'); }, addEventListener() {}, removeEventListener() {} } as unknown as Window;
    const h = harness({ storage: browserDailyGoalStorage(blocked) });
    h.engine.chooseGoal(5);
    h.run(MIN);
    h.engine.pageHide();
    expect(h.view()).toMatchObject({ status: 'running', seconds: 60 });
  });
  it('24. another (old or future) version, or no version, fails safely to a clean day', () => {
    for (const v of [0, 2, '1', undefined]) {
      const area = memoryArea();
      area.setRaw(DAILY_GOAL_KEY, JSON.stringify({ v, date: '2026-11-17', goalMinutes: 10, activeMs: 300_000, celebratedForDate: null }));
      expect(harness({ area }).view(), String(v)).toMatchObject({ status: 'unset', seconds: 0, goalMinutes: null });
    }
  });
  it('the stored record is plain, versioned, serialisable data — ready to sync to an account later', () => {
    const h = harness();
    h.engine.chooseGoal(10);
    h.run(MIN);
    h.engine.pageHide();
    const raw = JSON.parse(h.area.raw(DAILY_GOAL_KEY)!) as Record<string, unknown>;
    expect(Object.keys(raw).sort()).toEqual(['activeMs', 'celebratedForDate', 'date', 'goalMinutes', 'updatedAt', 'v']);
    expect(raw).toMatchObject({ v: 1, date: '2026-11-17', goalMinutes: 10, activeMs: 60_000, celebratedForDate: null });
    expect(DAILY_GOAL_KEY).toBe('ready.dailyGoal.v1');
  });
});

describe('the celebration', () => {
  it('25. reduced motion: no confetti — a calm change to green ✓', () => {
    expect(celebrationFor(true)).toBe('calm');
    expect(celebrationFor(false)).toBe('confetti');
    const media = (matches: boolean) => ({ matchMedia: (q: string) => ({ matches: matches && q === '(prefers-reduced-motion: reduce)' }) as MediaQueryList });
    expect(prefersReducedMotion(media(true))).toBe(true);
    expect(prefersReducedMotion(media(false))).toBe(false);
    expect(prefersReducedMotion(undefined)).toBe(false);
    const css = readFileSync(fileURLToPath(new URL('./dailyGoal.css', import.meta.url)), 'utf8');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \.dg-confetti \{ display: none; \} \}/);
    const ui = readFileSync(fileURLToPath(new URL('./DailyGoalTimer.tsx', import.meta.url)), 'utf8');
    expect(ui).toMatch(/celebrationFor\(prefersReducedMotion\(\)\) !== 'confetti'/);
  });
  it('the confetti is the app\'s own (`.confetti`), about one second, and never blocks a tap', () => {
    const html = renderToStaticMarkup(createElement(GoalConfetti));
    expect(html).toMatch(/^<div class="confetti dg-confetti" aria-hidden="true">/);
    expect(html.match(/<span /g)).toHaveLength(30);
    for (const d of html.matchAll(/animation-duration:([\d.]+)s/g)) expect(Number(d[1])).toBeLessThanOrEqual(1.05);
    const app = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
    expect(app).toMatch(/\.confetti \{ position: fixed; inset: 0; pointer-events: none;/);
  });
});

describe('the bubble and the panel (EN · HE)', () => {
  const view = (v: Partial<DailyGoalView>): DailyGoalView => ({ status: 'unset', goalMinutes: null, seconds: 0, counting: false, sessionActive: false, progress: 0, celebrations: 0, ...v });
  const bubble = (lang: string, v: DailyGoalView, open = false): string => { setUiLangDict(lang); return renderToStaticMarkup(createElement(DailyGoalBubble, { view: v, open })); };
  const panel = (lang: string, v: DailyGoalView, changing = false): string => { setUiLangDict(lang); return renderToStaticMarkup(createElement(DailyGoalPanel, { view: v, changing })); };
  const text = (html: string): string => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  it('collapsed: ⏱ Daily goal → ⏱ 4:21 / 10m → ✓ 13:17 (and ⏱ יעד יומי → ⏱ 4:21 / 10 דק׳)', () => {
    expect(text(bubble('en', view({})))).toBe('⏱Daily goal');
    expect(text(bubble('he', view({})))).toBe('⏱יעד יומי');
    expect(text(bubble('en', view({ status: 'running', goalMinutes: 10, seconds: 261, sessionActive: true })))).toBe('⏱4:21/ 10m');
    expect(text(bubble('he', view({ status: 'running', goalMinutes: 10, seconds: 261, sessionActive: true })))).toBe('⏱4:21/ 10 דק׳');
    expect(text(bubble('en', view({ status: 'done', goalMinutes: 10, seconds: 797 })))).toBe('✓13:17');
    expect(text(bubble('en', view({ status: 'done', goalMinutes: 10, seconds: 3725 })))).toBe('✓1:02:05');
    expect(bubble('he', view({ status: 'running', goalMinutes: 10, seconds: 261 }))).toMatch(/<span class="dg-time" dir="ltr">4:21<\/span>/); // digits never mirrored
  });
  it('a real button: state in words (aria-label), popup semantics, colour never alone (✓ when done)', () => {
    const running = bubble('en', view({ status: 'running', goalMinutes: 10, seconds: 261, sessionActive: true }), true);
    expect(running).toMatch(/^<button type="button" class="dg-bubble" data-status="running"/);
    expect(running).toMatch(/aria-haspopup="dialog" aria-expanded="true" aria-controls="dg-panel"/);
    expect(running).toContain('aria-label="Daily goal 10 minutes: 4:21 practiced, timer on"');
    expect(bubble('he', view({ status: 'paused', goalMinutes: 10, seconds: 402 }))).toContain('aria-label="יעד יומי 10 דקות: 6:42 תרגול, הטיימר מושהה"');
    expect(bubbleLabel(view({ status: 'done', goalMinutes: 5, seconds: 400 }))).toBe('היעד היומי הושלם: 6:40 תרגול היום');
    expect(bubbleLabel(view({}))).toBe('יעד יומי: בחר כמה זמן לתרגל היום');
    expect(bubble('en', view({ status: 'done', goalMinutes: 5, seconds: 400 }))).toMatch(/data-status="done".*✓/);
  });
  it('the panel: choose 5 / 10 / 15 — then today\'s goal, the time, the progress, Resume / Pause, Change goal', () => {
    expect(text(panel('he', view({})))).toBe('כמה זמן תרצה לתרגל היום?5 דקות10 דקות15 דקות');
    expect(text(panel('en', view({})))).toBe('How long do you want to practice today?5 min10 min15 min');
    const paused = panel('he', view({ status: 'paused', goalMinutes: 10, seconds: 402, progress: 0.67 }));
    expect(text(paused)).toBe('היעד להיום · 10 דקות6:42המשךשנה יעד');
    expect(paused).toContain('role="progressbar" aria-label="התקדמות ליעד" aria-valuemin="0" aria-valuemax="100" aria-valuenow="67"');
    expect(text(panel('he', view({ status: 'running', goalMinutes: 10, seconds: 402, sessionActive: true, progress: 0.67 })))).toContain('השהה');
    expect(text(panel('he', view({ status: 'paused', goalMinutes: 10, seconds: 0 })))).toContain('התחל');
    expect(text(panel('he', view({ status: 'done', goalMinutes: 10, seconds: 797, sessionActive: true, progress: 1 })))).toContain('היעד הושלם ✓');
    const changing = panel('en', view({ status: 'running', goalMinutes: 10, seconds: 450, sessionActive: true }), true);
    expect(changing).toContain('aria-pressed="true">10 min');
    expect(panel('en', view({}))).toMatch(/^<div id="dg-panel" class="dg-panel" role="dialog" aria-label="Daily goal">/);
  });
  it('no negative gamification: no streak, XP, score, leaderboard or failure — in the copy or the styles', () => {
    for (const [lang, dict] of Object.entries(UI_DICTIONARIES)) {
      const copy = Object.entries(dict).filter(([k]) => k.startsWith('dailyGoal')).map(([, v]) => v).join(' | ');
      expect(copy.length, lang).toBeGreaterThan(0);
      expect(copy, lang).not.toMatch(/streak|XP|score|points|leaderboard|fail|missed|behind|רצף|ניקוד|נקודות|נכשל|פספס/i);
    }
    const css = readFileSync(fileURLToPath(new URL('./dailyGoal.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/danger|#e05252|\bred\b/); // declarations only (the comments may say "no red")
    setUiLangDict('en');
  });
});

describe('placement — a corner of its own, above every bottom bar', () => {
  it('bottom-right in English, bottom-left in Hebrew (logical inset), above the safe area', () => {
    const css = readFileSync(fileURLToPath(new URL('./dailyGoal.css', import.meta.url)), 'utf8');
    expect(css).toMatch(/\.dg-root \{\n {2}position: fixed; z-index: 85;\n {2}inset-inline-end: 12px;\n {2}bottom: max\(calc\(env\(safe-area-inset-bottom\) \+ 14px\), calc\(var\(--dg-clear, 0px\) \+ 10px\)\);/);
    expect(css).not.toMatch(/\bleft:|\bright:/); // logical properties only: the corner follows the app language
    expect(css).toMatch(/min-height: 46px; min-width: 46px;/); // touch target ≥ 44 px
    expect(css).toMatch(/\.dg-option, \.dg-action \{\n {2}min-height: 44px;/);
  });
  it('it floats above the nav bar / an action zone / the reader transport when they share its corner — not when they do not', () => {
    const corner = { left: 250, right: 348 }; // a phone, the bubble in the right corner
    expect(bottomClearance([], corner, 740)).toBe(0);
    expect(bottomClearance([{ top: 662, left: 0, right: 360 }], corner, 740)).toBe(78); // a one-button action zone
    expect(bottomClearance([{ top: 600, left: 0, right: 360 }, { top: 670, left: 0, right: 360 }], corner, 740)).toBe(140); // the taller one wins
    // desktop: the action zone is centred and narrower — the corner is free, the bubble stays low
    expect(bottomClearance([{ top: 820, left: 400, right: 1180 }], { left: 1300, right: 1416 }, 900)).toBe(0);
  });
  describe('a bar is measured where it RESTS (layout), not where an entry animation paints it', () => {
    afterEach(() => vi.unstubAllGlobals());
    const el = (o: { cls?: string; position?: string; h: number; w: number; left?: number; first?: { top: number; left: number; h: number; w: number } }): HTMLElement => ({
      classList: { contains: (c: string) => (o.cls ?? '').split(' ').includes(c) },
      offsetHeight: o.h, offsetWidth: o.w, offsetLeft: o.left ?? 0, __position: o.position ?? 'fixed',
      firstElementChild: o.first ? { offsetTop: o.first.top, offsetLeft: o.first.left, offsetHeight: o.first.h, offsetWidth: o.first.w } : null,
    }) as unknown as HTMLElement;
    const stub = (): void => { vi.stubGlobal('getComputedStyle', (e: { __position: string }) => ({ position: e.__position })); };
    it('a phone action zone: its CTA is what stays clear (the fade above it is see-through) — whatever transform is running', () => {
      stub();
      expect(restingBar(el({ cls: 'action-zone', h: 84, w: 390, first: { top: 12, left: 18, h: 58, w: 354 } }), 844)).toEqual({ top: 772, left: 18, right: 372 });
    });
    it('the nav bar: the whole bar; a hidden bar or a static (in-content) action zone: not a bar at all', () => {
      stub();
      expect(restingBar(el({ cls: 'app-nav', h: 75, w: 390 }), 844)).toEqual({ top: 769, left: 0, right: 390 });
      expect(restingBar(el({ cls: 'app-nav is-bar-hidden', h: 0, w: 0 }), 844)).toBeNull();
      expect(restingBar(el({ cls: 'action-zone', position: 'static', h: 84, w: 300, first: { top: 0, left: 0, h: 58, w: 300 } }), 844)).toBeNull();
    });
  });
});
