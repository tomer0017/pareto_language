import { useEffect, useSyncExternalStore } from 'react';
import { DailyGoalEngine, UNSET_VIEW, type DailyGoalView } from './dailyGoalEngine.js';
import { browserDailyGoalStorage, browserSessionFlag } from './dailyGoalStorage.js';

/**
 * Daily Goal — the bridge between the engine and the browser. The engine is ONE per page (a module
 * singleton), created at the app shell: no screen, mission or route owns it, so navigating anywhere in
 * READY never resets or pauses it. Only the timer's own component subscribes, so the once-a-second
 * update re-renders the bubble — never the app.
 */

/** What counts as the learner doing something in READY. Mouse movement alone does not. */
export const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const;
export const TICK_MS = 1000;

/** The page as the wiring needs it — the real `document` / `window`, or a stand-in in a test. */
export interface DailyGoalPage {
  doc: EventTarget;
  win: EventTarget;
  every: (fn: () => void, ms: number) => () => void;
}

/**
 * Connect an engine to a page: activity anywhere in the document (capture phase, so a screen that
 * stops propagation still counts), visibility, page lifecycle and a once-a-second tick. Returns the
 * disconnect function.
 */
export function connectDailyGoal(engine: DailyGoalEngine, page: DailyGoalPage): () => void {
  const onActivity = (): void => engine.activity();
  const onVisibility = (): void => engine.visibilityChanged();
  const onPageHide = (): void => engine.pageHide();
  const onPageShow = (e: Event): void => { if ((e as PageTransitionEvent).persisted) engine.pageShow(); };
  const opts: AddEventListenerOptions = { capture: true, passive: true };
  for (const type of ACTIVITY_EVENTS) page.doc.addEventListener(type, onActivity, opts);
  page.doc.addEventListener('visibilitychange', onVisibility);
  page.win.addEventListener('pagehide', onPageHide);
  page.win.addEventListener('pageshow', onPageShow);
  const stopTicking = page.every(() => engine.tick(), TICK_MS);
  return () => {
    for (const type of ACTIVITY_EVENTS) page.doc.removeEventListener(type, onActivity, opts);
    page.doc.removeEventListener('visibilitychange', onVisibility);
    page.win.removeEventListener('pagehide', onPageHide);
    page.win.removeEventListener('pageshow', onPageShow);
    stopTicking();
  };
}

const newTabId = (): string =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

let shared: DailyGoalEngine | null = null;
/** The page's engine (created on first use), or null where there is no browser (tests, server render). */
export function dailyGoalEngine(): DailyGoalEngine | null {
  if (shared || typeof window === 'undefined' || typeof document === 'undefined') return shared;
  shared = new DailyGoalEngine({
    storage: browserDailyGoalStorage(window),
    session: browserSessionFlag(window),
    now: () => Date.now(),
    isVisible: () => document.visibilityState !== 'hidden',
    tabId: newTabId(),
  });
  return shared;
}

const noSubscription = (): (() => void) => () => {};
const unsetView = (): DailyGoalView => UNSET_VIEW;

/** The timer for the component that shows it: the live view, and the engine to act on. */
export function useDailyGoal(): { view: DailyGoalView; engine: DailyGoalEngine | null } {
  const engine = dailyGoalEngine();
  useEffect(() => (engine ? connectDailyGoal(engine, {
    doc: document,
    win: window,
    every: (fn, ms) => { const id = window.setInterval(fn, ms); return () => window.clearInterval(id); },
  }) : undefined), [engine]);
  const view = useSyncExternalStore(engine ? engine.subscribe : noSubscription, engine ? engine.getView : unsetView, unsetView);
  return { view, engine };
}

/** The learner asked the system for less motion: the celebration is then a calm colour change. */
export function prefersReducedMotion(win: Pick<Window, 'matchMedia'> | undefined = typeof window !== 'undefined' ? window : undefined): boolean {
  return typeof win?.matchMedia === 'function' && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
export type Celebration = 'confetti' | 'calm';
export const celebrationFor = (reducedMotion: boolean): Celebration => (reducedMotion ? 'calm' : 'confetti');

/**
 * Where the bubble may sit: the height, from the bottom of the viewport, of every fixed bottom bar
 * (the navigation bar, a flow's action zone, the reader's transport) that shares its horizontal span.
 * The bubble floats just above it — so it never covers a CTA, an answer button or the navigation.
 */
export interface BarRect { top: number; left: number; right: number }
export function bottomClearance(bars: readonly BarRect[], span: { left: number; right: number }, viewportHeight: number): number {
  let clear = 0;
  for (const b of bars) if (b.right > span.left && b.left < span.right) clear = Math.max(clear, viewportHeight - b.top);
  return Math.max(0, Math.round(clear));
}
export const BOTTOM_BARS = '.app-nav, .action-zone, .reader-transport';

/**
 * The resting place of a bottom bar, from LAYOUT (offset sizes), never from the painted box: a bar that
 * slides in is measured where it will sit, not where its animation happens to be. Every bottom bar is
 * anchored at `bottom: 0`. An action zone is see-through around its controls (a fade above, the gutters
 * beside), so its first control is what must stay clear — on a wide screen the corner beside it is free.
 */
export function restingBar(bar: HTMLElement, viewportHeight: number): BarRect | null {
  if (!bar.offsetHeight || !bar.offsetWidth || getComputedStyle(bar).position !== 'fixed') return null; // hidden, or a static action zone (content)
  const top = viewportHeight - bar.offsetHeight;
  const first = bar.classList.contains('action-zone') ? (bar.firstElementChild as HTMLElement | null) : null;
  if (first && first.offsetHeight && first.offsetWidth) {
    const left = bar.offsetLeft + first.offsetLeft;
    return { top: top + first.offsetTop, left, right: left + first.offsetWidth };
  }
  return { top, left: bar.offsetLeft, right: bar.offsetLeft + bar.offsetWidth };
}

/** Keep `--dg-clear` on the element up to date as screens, bars and the viewport change. */
export function useBottomClearance(el: { current: HTMLElement | null }): void {
  useEffect(() => {
    const root = el.current;
    if (!root || typeof MutationObserver === 'undefined') return undefined;
    let frame = 0;
    let last = '';
    const measure = (): void => {
      frame = 0;
      const bars: BarRect[] = [];
      for (const bar of document.querySelectorAll<HTMLElement>(BOTTOM_BARS)) { const b = restingBar(bar, window.innerHeight); if (b) bars.push(b); }
      const next = `${bottomClearance(bars, { left: root.offsetLeft, right: root.offsetLeft + root.offsetWidth }, window.innerHeight)}px`;
      if (next !== last) { last = next; root.style.setProperty('--dg-clear', next); }
    };
    const schedule = (): void => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', schedule);
    // A layout can also change with no DOM change (a web font arriving, a bar resizing): a cheap check each second.
    const every = window.setInterval(schedule, 1000);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.clearInterval(every);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [el]);
}
