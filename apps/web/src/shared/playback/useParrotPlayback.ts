import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, cancelSpeech } from '../audio/tts.js';
import { sessionSeed } from '../util/shuffle.js';
import { acquireWakeLock, releaseWakeLock } from './wakeLock.js';
import { buildOrder, buildUtterancePlan, PAUSE_BETWEEN_ITEMS } from './playbackPlan.js';
import type { PlaybackItem, PlaybackOrder, PlaybackSettings, PlaybackStatus, RepeatCount } from './types.js';

/**
 * Parrot Mode engine — the ONE playback runtime every listening surface reuses.
 *
 * A screen passes a stable list of {@link PlaybackItem}; this hook owns EVERYTHING else: play /
 * pause / resume, sequential & random order, repeat ×1–3, translation on/off, wake lock, and
 * resume-from-the-exact-item. It knows nothing about Words/Sentences/Dialogue — those screens only
 * render the current item and mount {@link PlaybackControls}. Adding a new surface = build items,
 * call this hook. No playback logic is ever duplicated.
 *
 * Cancellation model mirrors the proven Transcript reader: a monotonic run token invalidates any
 * in-flight async loop, and each `speak()` result is checked so a superseded/cancelled line never
 * advances the UI. Settings are read through refs so changing them mid-session takes effect at the
 * next item boundary without restarting the current line.
 */

const SETTINGS_KEY = 'ready.parrot.settings';

const DEFAULT_SETTINGS: PlaybackSettings = { repeat: 1, order: 'sequential', translation: true };

function loadSettings(): PlaybackSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PlaybackSettings>;
    return {
      repeat: parsed.repeat === 2 || parsed.repeat === 3 ? parsed.repeat : 1,
      order: parsed.order === 'random' ? 'random' : 'sequential',
      translation: parsed.translation !== false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(s: PlaybackSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore persistence failure (private mode / SSR) */
  }
}

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Everything a listening surface needs. Returned by {@link useParrotPlayback}. */
export interface ParrotPlayback {
  status: PlaybackStatus;
  /** Index into the caller's `items` array of the item currently focused. */
  currentIndex: number;
  /** 1-based position within the (possibly shuffled) play order — for "3 of 12" style progress. */
  position: number;
  total: number;
  settings: PlaybackSettings;
  /** Start, or resume from the exact item where it paused. */
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Step forward/back one item (previews it; keeps playing if it was playing). */
  next: () => void;
  prev: () => void;
  /** Focus a specific item; `play` starts the loop there, else it just previews the line once. */
  jumpTo: (itemIndex: number, opts?: { play?: boolean }) => void;
  setRepeat: (r: RepeatCount) => void;
  setOrder: (o: PlaybackOrder) => void;
  setTranslation: (on: boolean) => void;
}

export function useParrotPlayback(items: PlaybackItem[]): ParrotPlayback {
  const [settings, setSettings] = useState<PlaybackSettings>(loadSettings);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [order, setOrderState] = useState<number[]>(() => buildOrder(items.length, settings.order, sessionSeed()));
  const [pos, setPos] = useState(0);

  // Live mirrors so the async loop / event handlers read current values without stale closures.
  const runToken = useRef(0);
  const settingsRef = useRef(settings);
  const statusRef = useRef(status);
  const orderRef = useRef(order);
  const posRef = useRef(0);
  const itemsRef = useRef(items);
  settingsRef.current = settings;
  statusRef.current = status;
  orderRef.current = order;
  itemsRef.current = items;

  // One stable seed per mount so a random order is shuffled once for the session, not per render.
  const seed = useRef<number>(sessionSeed()).current;

  const applyPos = useCallback((p: number) => {
    posRef.current = p;
    setPos(p);
  }, []);

  const total = order.length;
  const currentIndex = order[pos] ?? 0;

  // Rebuild the play order when the item count or the order mode changes, keeping the SAME item
  // focused across the change (so toggling Shuffle mid-list doesn't jump the learner elsewhere).
  useEffect(() => {
    const keep = orderRef.current[posRef.current] ?? 0;
    const next = buildOrder(items.length, settings.order, seed);
    orderRef.current = next;
    setOrderState(next);
    const np = Math.max(0, next.indexOf(keep));
    applyPos(next.length ? np : 0);
  }, [items.length, settings.order, seed, applyPos]);

  const previewCurrent = useCallback(() => {
    const item = itemsRef.current[orderRef.current[posRef.current] ?? 0];
    if (item) void speak(item.target, item.targetLang);
  }, []);

  const play = useCallback(() => {
    if (itemsRef.current.length === 0) return;
    const token = ++runToken.current;
    setStatus('playing');
    statusRef.current = 'playing';
    void acquireWakeLock();
    void (async () => {
      let p = posRef.current;
      while (p < orderRef.current.length) {
        if (token !== runToken.current) return;
        applyPos(p);
        const item = itemsRef.current[orderRef.current[p]!];
        if (item) {
          const plan = buildUtterancePlan(item, settingsRef.current);
          for (const step of plan) {
            if (token !== runToken.current) return;
            if (step.kind === 'pause') {
              await sleep(step.ms);
              continue;
            }
            const r = await speak(step.text, step.lang);
            // A cancelled/superseded line never advances — exactly the Transcript play-all contract.
            if (token !== runToken.current || r === 'interrupted') return;
          }
        }
        p += 1;
        if (p < orderRef.current.length) await sleep(PAUSE_BETWEEN_ITEMS);
      }
      if (token === runToken.current) {
        // Reached the end — rewind to the start and go idle, ready to play again.
        setStatus('idle');
        statusRef.current = 'idle';
        applyPos(0);
        releaseWakeLock();
      }
    })();
  }, [applyPos]);

  const pause = useCallback(() => {
    runToken.current += 1; // invalidate the loop; the current line settles 'interrupted'
    setStatus('paused');
    statusRef.current = 'paused';
    cancelSpeech();
    releaseWakeLock();
  }, []);

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') pause();
    else play();
  }, [pause, play]);

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

  const jumpTo = useCallback((itemIndex: number, opts?: { play?: boolean }) => {
    const np = orderRef.current.indexOf(itemIndex);
    if (np < 0) return;
    const wasPlaying = statusRef.current === 'playing';
    runToken.current += 1;
    cancelSpeech();
    applyPos(np);
    if (opts?.play || wasPlaying) play();
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
  const setOrder = useCallback((o: PlaybackOrder) => update({ order: o }), [update]);
  const setTranslation = useCallback((on: boolean) => update({ translation: on }), [update]);

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

  // Stop cleanly on unmount (leaving the screen): no orphaned speech, no lingering wake lock.
  useEffect(() => () => {
    runToken.current += 1;
    cancelSpeech();
    releaseWakeLock();
  }, []);

  return {
    status,
    currentIndex,
    position: total === 0 ? 0 : pos + 1,
    total,
    settings,
    play,
    pause,
    toggle,
    next,
    prev,
    jumpTo,
    setRepeat,
    setOrder,
    setTranslation,
  };
}
