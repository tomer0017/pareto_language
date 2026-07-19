import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, cancelSpeech } from '../audio/tts.js';
import { sessionSeed } from '../util/shuffle.js';
import { acquireWakeLock, releaseWakeLock } from './wakeLock.js';
import { buildOrder, buildUtterancePlan, pausePlan, planNextCycle, sleepDurationMs } from './playbackPlan.js';
import { loadSettings, persistSettings, loadBookmark, saveBookmark, resolveBookmarkIndex } from './preferences.js';
import { createSleepTimer, type SleepTimer } from './sleepTimer.js';
import type {
  PauseDuration, PlaybackItem, PlaybackOrder, PlaybackSettings, PlaybackSpeed, PlaybackStatus, RepeatCount, SleepTimerMinutes, SpeakOrderOverride,
} from './types.js';

/**
 * Parrot Mode engine — the ONE playback runtime every listening surface reuses.
 *
 * A screen passes a stable list of {@link PlaybackItem} (and an optional `bookmarkKey`); this hook
 * owns EVERYTHING else: play / pause / resume, sequential & random order, repeat ×1–3, translation,
 * continuous Loop, playback speed, pause durations, a sleep timer, Screen Wake Lock, and resume from
 * the exact item (restored from a persisted per-surface bookmark). Screens only render the current
 * item and mount {@link PlaybackControls}. No playback logic is ever duplicated.
 *
 * Cancellation mirrors the proven Transcript reader: a monotonic run token invalidates any in-flight
 * async loop, and each `speak()` result is checked so a superseded/cancelled line never advances.
 * Settings are read through refs so a change takes effect at the next item boundary without
 * restarting the current line. Pure decisions (order/plan/pauses/persistence/sleep) live in siblings.
 */

const SLEEP_TICK_MS = 1000;

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Everything a listening surface needs. Returned by {@link useParrotPlayback}. */
export interface ParrotPlayback {
  status: PlaybackStatus;
  /** Index into the caller's `items` array of the item currently focused. */
  currentIndex: number;
  /** 1-based position within the (possibly shuffled) play order — for "3 of 12" style progress. */
  position: number;
  total: number;
  settings: PlaybackSettings;
  /** Remaining sleep-timer ms while a countdown is armed, else null. */
  sleepRemainingMs: number | null;
  /** True once the sleep timer has expired (non-blocking notice); cleared on the next play. */
  sleepFinished: boolean;
  /** Start, or resume from the exact item where it paused. */
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Restart the ACTIVE sequence from its first position (line 0 sequential; shuffle pos 0 random). */
  restart: (opts?: { play?: boolean }) => void;
  /** Step forward/back one item (previews it; keeps playing if it was playing). */
  next: () => void;
  prev: () => void;
  /** Focus a specific item; `play` starts the loop there, else it just previews the line once. */
  jumpTo: (itemIndex: number, opts?: { play?: boolean }) => void;
  setRepeat: (r: RepeatCount) => void;
  setOrder: (o: PlaybackOrder) => void;
  setTranslation: (on: boolean) => void;
  setLoop: (on: boolean) => void;
  setSpeed: (s: PlaybackSpeed) => void;
  setPause: (p: PauseDuration) => void;
  setSleepTimer: (minutes: SleepTimerMinutes) => void;
}

export interface ParrotOptions {
  /** Namespaces the listening-position bookmark for this surface (e.g. `words:en`). Omit to disable. */
  bookmarkKey?: string;
  /** Pin the play order for this surface, ignoring the shared preference (e.g. Reading is always
   *  `'sequential'`). When set, `setOrder` is a no-op and the surface never shuffles. */
  order?: PlaybackOrder;
  /** Per-surface listening-order OVERRIDE (Reading owns its own translation-order UI). When set, it
   *  decides whether/what order the translation is spoken WITHOUT touching the shared `translation`
   *  preference; speed/pause/repeat/loop stay global. Omit to follow the shared preference. */
  speakOrder?: SpeakOrderOverride;
}

export function useParrotPlayback(items: PlaybackItem[], opts?: ParrotOptions): ParrotPlayback {
  const bookmarkKey = opts?.bookmarkKey;
  const lockedOrder = opts?.order;
  const [settings, setSettings] = useState<PlaybackSettings>(loadSettings);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  // Effective order: a surface lock (Reading) overrides the shared preference.
  const effectiveOrder = lockedOrder ?? settings.order;
  const [order, setOrderState] = useState<number[]>(() => buildOrder(items.length, effectiveOrder, sessionSeed()));
  const [pos, setPos] = useState(0);
  const [sleepRemainingMs, setSleepRemainingMs] = useState<number | null>(null);
  const [sleepFinished, setSleepFinished] = useState(false);

  // Live mirrors so the async loop / timers / event handlers read current values (no stale closures).
  const runToken = useRef(0);
  const settingsRef = useRef(settings);
  const statusRef = useRef(status);
  const orderRef = useRef(order);
  const posRef = useRef(0);
  const itemsRef = useRef(items);
  const speakOrderRef = useRef(opts?.speakOrder);
  settingsRef.current = settings;
  statusRef.current = status;
  orderRef.current = order;
  itemsRef.current = items;
  speakOrderRef.current = opts?.speakOrder;

  // One stable seed per mount; each loop cycle draws a fresh seed so random reshuffles.
  const seed = useRef<number>(sessionSeed()).current;

  const applyPos = useCallback((p: number) => {
    posRef.current = p;
    setPos(p);
  }, []);

  const total = order.length;
  const currentIndex = order[pos] ?? 0;

  /* ── Sleep timer (framework-free controller; expiry handler read via a ref) ── */

  const onExpireRef = useRef<() => void>(() => undefined);
  const sleepTimerRef = useRef<SleepTimer | null>(null);
  if (sleepTimerRef.current === null) {
    sleepTimerRef.current = createSleepTimer({
      tickMs: SLEEP_TICK_MS,
      onTick: (ms) => setSleepRemainingMs(ms),
      onExpire: () => onExpireRef.current(),
    });
  }

  // Rebuild the play order when the item count or the order mode changes, keeping the SAME item
  // focused across the change (so toggling Shuffle mid-list doesn't jump the learner elsewhere, and
  // "select Random while playing" builds the remaining order around the current item).
  useEffect(() => {
    const keep = orderRef.current[posRef.current] ?? 0;
    const next = buildOrder(items.length, effectiveOrder, seed);
    orderRef.current = next;
    setOrderState(next);
    const np = Math.max(0, next.indexOf(keep));
    applyPos(next.length ? np : 0);
  }, [items.length, effectiveOrder, seed, applyPos]);

  /* ── Playback ────────────────────────────────────────────────────────── */

  const previewCurrent = useCallback(() => {
    const item = itemsRef.current[orderRef.current[posRef.current] ?? 0];
    if (item) void speak(item.target, item.targetLang, settingsRef.current.speed);
  }, []);

  const play = useCallback(() => {
    if (itemsRef.current.length === 0) return;
    const token = ++runToken.current;
    setStatus('playing');
    statusRef.current = 'playing';
    setSleepFinished(false);
    void acquireWakeLock();

    // Arm / resume the sleep timer: fresh duration if none pending, else continue the remainder.
    if (settingsRef.current.sleepTimer > 0) {
      const st = sleepTimerRef.current!;
      if (st.remaining() == null) st.arm(sleepDurationMs(settingsRef.current.sleepTimer));
      else st.resume();
    }

    void (async () => {
      // Outer loop = cycles (one pass through the order); may repeat forever when Loop is ON.
      while (true) {
        let p = posRef.current;
        while (p < orderRef.current.length) {
          if (token !== runToken.current) return;
          applyPos(p);
          const item = itemsRef.current[orderRef.current[p]!];
          if (item) {
            const plan = buildUtterancePlan(item, settingsRef.current, speakOrderRef.current);
            for (const stepItem of plan) {
              if (token !== runToken.current) return;
              if (stepItem.kind === 'pause') { await wait(stepItem.ms); continue; }
              const r = await speak(stepItem.text, stepItem.lang, stepItem.rate);
              // A cancelled/superseded line never advances — the Transcript play-all contract.
              if (token !== runToken.current || r === 'interrupted') return;
            }
          }
          p += 1;
          if (p < orderRef.current.length) await wait(pausePlan(settingsRef.current.pause).betweenItems);
        }
        if (token !== runToken.current) return;

        const cycle = planNextCycle(
          lockedOrder ? { ...settingsRef.current, order: lockedOrder } : settingsRef.current,
          orderRef.current, itemsRef.current.length, sessionSeed());
        if (cycle.finished) {
          setStatus('finished');
          statusRef.current = 'finished';
          applyPos(0); // rewind so the next explicit Play restarts from the beginning
          releaseWakeLock();
          sleepTimerRef.current?.off();
          return;
        }
        // Start a fresh cycle (random reshuffles, avoiding an immediate boundary repeat).
        orderRef.current = cycle.order;
        setOrderState(cycle.order);
        applyPos(0);
        await wait(pausePlan(settingsRef.current.pause).betweenItems);
      }
    })();
  }, [applyPos, lockedOrder]);

  const pause = useCallback(() => {
    runToken.current += 1; // invalidate the loop; the current line settles 'interrupted'
    setStatus('paused');
    statusRef.current = 'paused';
    cancelSpeech();
    releaseWakeLock();
    sleepTimerRef.current?.pauseTicking(); // pausing playback also pauses the countdown
  }, []);

  // Sleep expiry: stop speech + playback cleanly, release the lock, keep the item as resume position,
  // and surface a non-blocking "finished" notice. The controller has already cleared its remainder.
  onExpireRef.current = () => {
    runToken.current += 1;
    cancelSpeech();
    releaseWakeLock();
    setStatus('paused');
    statusRef.current = 'paused';
    setSleepFinished(true);
  };

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') pause();
    else play();
  }, [pause, play]);

  const restart = useCallback((o?: { play?: boolean }) => {
    const wasPlaying = statusRef.current === 'playing';
    runToken.current += 1;
    cancelSpeech();
    applyPos(0); // first position of the ACTIVE order (line 0 sequential; shuffle pos 0 random)
    if (o?.play || wasPlaying) play();
    else previewCurrent();
  }, [applyPos, play, previewCurrent]);

  const step = useCallback((delta: number) => {
    const np = clamp(posRef.current + delta, 0, Math.max(0, orderRef.current.length - 1));
    const wasPlaying = statusRef.current === 'playing';
    runToken.current += 1;
    cancelSpeech();
    applyPos(np);
    if (wasPlaying) play();
    else previewCurrent();
  }, [applyPos, play, previewCurrent]);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const jumpTo = useCallback((itemIndex: number, o?: { play?: boolean }) => {
    const np = orderRef.current.indexOf(itemIndex);
    if (np < 0) return;
    const wasPlaying = statusRef.current === 'playing';
    runToken.current += 1;
    cancelSpeech();
    applyPos(np);
    if (o?.play || wasPlaying) play();
    else previewCurrent();
  }, [applyPos, play, previewCurrent]);

  const update = useCallback((patch: Partial<PlaybackSettings>) => {
    setSettings((prev) => {
      const nextSettings = { ...prev, ...patch };
      settingsRef.current = nextSettings;
      persistSettings(nextSettings);
      return nextSettings;
    });
  }, []);

  const setRepeat = useCallback((r: RepeatCount) => update({ repeat: r }), [update]);
  // A surface with a pinned order (Reading) ignores order changes entirely.
  const setOrder = useCallback((o: PlaybackOrder) => { if (!lockedOrder) update({ order: o }); }, [update, lockedOrder]);
  const setTranslation = useCallback((on: boolean) => update({ translation: on }), [update]);
  const setLoop = useCallback((on: boolean) => update({ loop: on }), [update]);
  const setSpeed = useCallback((s: PlaybackSpeed) => update({ speed: s }), [update]);
  const setPause = useCallback((p: PauseDuration) => update({ pause: p }), [update]);

  const setSleepTimer = useCallback((minutes: SleepTimerMinutes) => {
    update({ sleepTimer: minutes });
    setSleepFinished(false);
    const st = sleepTimerRef.current!;
    if (minutes === 0) { st.off(); return; } // Off cancels the countdown
    st.reset(sleepDurationMs(minutes));        // changing the duration resets the countdown
    if (statusRef.current === 'playing') st.resume(); // ...and keeps counting while playing
  }, [update]);

  /* ── Listening-position bookmark (per surface, by stable id) ──────────── */

  const restoredRef = useRef(false);
  const firstSaveSkipRef = useRef(true);

  // Restore once on mount: focus the saved item (never auto-play). Runs after the order effect.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (!bookmarkKey) return;
    const idx = resolveBookmarkIndex(itemsRef.current, loadBookmark(bookmarkKey));
    const p = orderRef.current.indexOf(idx);
    if (p > 0) applyPos(p);
  }, [bookmarkKey, applyPos]);

  // Persist the focused item id whenever it changes (skip the initial commit so we never clobber a
  // saved bookmark with item 0 before restore has run).
  useEffect(() => {
    if (!bookmarkKey) return;
    if (firstSaveSkipRef.current) { firstSaveSkipRef.current = false; return; }
    const item = itemsRef.current[currentIndex];
    if (item) saveBookmark(bookmarkKey, item.id);
  }, [currentIndex, bookmarkKey]);

  /* ── Wake lock: keep only while actively playing ─────────────────────── */

  // Wake locks auto-release when the tab is hidden; re-acquire on return while still playing.
  useEffect(() => {
    const onVis = (): void => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && statusRef.current === 'playing') {
        void acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Stop cleanly on unmount (leaving the screen): no orphaned speech, timer, or wake lock.
  useEffect(() => () => {
    runToken.current += 1;
    cancelSpeech();
    releaseWakeLock();
    sleepTimerRef.current?.dispose();
  }, []);

  return {
    status,
    currentIndex,
    position: total === 0 ? 0 : pos + 1,
    total,
    settings,
    sleepRemainingMs,
    sleepFinished,
    play,
    pause,
    toggle,
    restart,
    next,
    prev,
    jumpTo,
    setRepeat,
    setOrder,
    setTranslation,
    setLoop,
    setSpeed,
    setPause,
    setSleepTimer,
  };
}
