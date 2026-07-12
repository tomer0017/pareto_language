import type { ContentItem } from '@ready/content-schema';
import { resolveVoice, prepareTextForSpeech, isNativeAccent, type VoiceLike, type VoiceMatchQuality } from './voiceResolver.js';
import { speechProfile } from './voiceProfiles.js';

/**
 * Audio playback (asset-first, Web Speech fallback).
 *
 * CHROME ROOT CAUSE #1 (Sprint 8): Chrome's autoplay policy blocks speechSynthesis.speak()
 * unless the engine has been "unlocked" by a speak() call that originated INSIDE a real user
 * gesture. Our drill/dialogue audio fires from React effects and promise chains — never a
 * gesture — so Chrome silently refused every utterance. Safari has no such policy, so it
 * always worked. (My earlier setTimeout-defer made it strictly worse by moving the first
 * speak out of any gesture.) Fix: prime the engine on the first pointer/key gesture; once
 * unlocked, programmatic speak() works for the session. This is the intended way to satisfy
 * the policy, not a workaround.
 *
 * CHROME ROOT CAUSE #2 ("works then stops later", Sprint 9): Chrome's speech engine does not
 * stay running on its own. Two documented failure modes make audio die mid-session with NO
 * error — exactly the "worked at launch, dead later" symptom:
 *   (a) An internal ~15s watchdog pauses/kills any utterance that runs too long.
 *   (b) Chrome pauses speechSynthesis whenever the tab is backgrounded (visibilitychange /
 *       tab switch) and frequently leaves it stuck `paused` after the tab returns — so every
 *       later speak() enqueues behind a paused engine and never plays.
 * The engine exposes exactly one lever for both: speechSynthesis.resume(). The real fix is to
 * (1) run a resume() keep-alive while an utterance is live, defeating the watchdog and any
 * spontaneous pause, and (2) resume() the moment the tab becomes visible again. This is the
 * canonical, engine-level fix — not a per-call retry hack. Safari/Firefox ignore resume() on a
 * running engine, so the keep-alive is a harmless no-op there.
 */

/**
 * How a speak() request ended — so callers can distinguish a natural finish from an interruption.
 * A chained action (dialogue auto-advance, Transcript Play-All) MUST only proceed on `ended`; when a
 * newer utterance supersedes this one (or the learner navigates), the result is `interrupted` and the
 * stale callback is ignored — never advancing the UI after the audio it belonged to was cancelled.
 */
export type SpeakResult = 'ended' | 'interrupted' | 'error' | 'unavailable';

/* ── Diagnostics (dev panel + Test Audio) ───────────────────────────────── */

export interface AudioDiag {
  browser: string;
  synthAvailable: boolean;
  voicesLoaded: number;
  selectedVoice: string | null;
  selectedLang: string | null;
  /** Resolver score of the selected voice (diagnostics; null when engine default / none). */
  selectedScore: number | null;
  /** Explicit accent match quality of the selected voice (honest — never flattens a wrong region). */
  selectedQuality: VoiceMatchQuality;
  /** True ONLY for a native-accent match (exact locale or an explicitly approved fallback). */
  selectedExact: boolean;
  lastRequest: string | null;
  lastError: string | null;
  unlocked: boolean;
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'ssr';
  const ua = navigator.userAgent;
  if (/CriOS/.test(ua)) return 'Chrome (iOS)';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Unknown';
}

const diag: AudioDiag = {
  browser: detectBrowser(),
  synthAvailable: false,
  voicesLoaded: 0,
  selectedVoice: null,
  selectedLang: null,
  selectedScore: null,
  selectedQuality: 'unavailable',
  selectedExact: false,
  lastRequest: null,
  lastError: null,
  unlocked: false,
};

const listeners = new Set<() => void>();
// Cached immutable snapshot: getAudioDiag MUST return a stable reference between changes,
// or useSyncExternalStore loops forever ("getSnapshot should be cached"). Rebuilt only on emit.
let snapshot: AudioDiag = { ...diag };
function emit(): void {
  snapshot = { ...diag };
  for (const l of listeners) l();
}
export function subscribeAudioDiag(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getAudioDiag(): AudioDiag {
  return snapshot;
}

/* ── Global speech rate (single source of truth) ─────────────────────────── */
// One user-controlled speed multiplies EVERY spoken sentence (Bootcamp, transcript, replay,
// future simulator/vocabulary). Per-call rates (fast/slow beats) stay relative to it. Persisted
// so it survives reloads; guarded so it never throws in non-browser (test) environments.
const RATE_KEY = 'ready.speechRate';
const RATE_MIN = 0.8;
const RATE_MAX = 1.05;
const RATE_DEFAULT = 0.95;
const clampUserRate = (r: number): number => Math.min(RATE_MAX, Math.max(RATE_MIN, Number.isFinite(r) ? r : RATE_DEFAULT));

let userRate = RATE_DEFAULT;
try {
  const stored = localStorage.getItem(RATE_KEY);
  if (stored) userRate = clampUserRate(parseFloat(stored));
} catch {
  /* no localStorage (SSR/test) — keep default */
}

export const SPEECH_RATE_RANGE = { min: RATE_MIN, max: RATE_MAX, default: RATE_DEFAULT } as const;

/** Current global speech rate (0.8–1.05). */
export function getSpeechRate(): number {
  return userRate;
}

/** Set the global speech rate; clamped and persisted. Affects all future speak() calls. */
export function setSpeechRate(rate: number): void {
  userRate = clampUserRate(rate);
  try {
    localStorage.setItem(RATE_KEY, String(userRate));
  } catch {
    /* ignore persistence failure */
  }
}

/* ── Voices ─────────────────────────────────────────────────────────────── */

let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null; // GC guard (Chrome drops collected utterances)

/* ── Keep-alive: defeat Chrome's watchdog + auto-pause (ROOT CAUSE #2) ────── */
let keepAlive: ReturnType<typeof setInterval> | null = null;

function startKeepAlive(): void {
  if (keepAlive !== null || !ttsAvailable()) return;
  // 5s < Chrome's ~15s watchdog. Each tick nudges the engine so a live utterance keeps
  // flowing and a spontaneously-paused engine un-sticks itself. Stops itself once idle.
  keepAlive = setInterval(() => {
    try {
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.resume();
      else stopKeepAlive();
    } catch {
      stopKeepAlive();
    }
  }, 5000);
}

function stopKeepAlive(): void {
  if (keepAlive !== null) {
    clearInterval(keepAlive);
    keepAlive = null;
  }
}

function refreshVoices(): void {
  try {
    cachedVoices = speechSynthesis.getVoices();
    diag.voicesLoaded = cachedVoices.length;
    emit();
  } catch {
    cachedVoices = [];
  }
}

export function ttsAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Bounded wait for the voice list to populate (Chrome/Safari load voices asynchronously). Resolves
 * as soon as voices appear (via `voiceschanged` or a short poll) or after ~1.2s — never an infinite
 * loop. Not awaited on the gesture-critical first speak (that would break the iOS gesture chain);
 * used by Test Voice / diagnostics where a small delay is fine.
 */
function ensureVoices(timeoutMs = 1200): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsAvailable()) return resolve();
    refreshVoices();
    if (cachedVoices.length > 0) return resolve();
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      speechSynthesis.removeEventListener?.('voiceschanged', onChange);
      clearInterval(poll);
      clearTimeout(timer);
      resolve();
    };
    const onChange = (): void => { refreshVoices(); if (cachedVoices.length > 0) finish(); };
    speechSynthesis.addEventListener?.('voiceschanged', onChange);
    const poll = setInterval(() => { refreshVoices(); if (cachedVoices.length > 0) finish(); }, 150);
    const timer = setTimeout(finish, timeoutMs);
  });
}

/** Resolve the best voice for a learning language via the scored resolver (registry locale). */
function voiceFor(lang: string): { voice: SpeechSynthesisVoice; score: number; quality: VoiceMatchQuality } | null {
  if (cachedVoices.length === 0) refreshVoices();
  const profile = speechProfile(lang);
  const scored = resolveVoice(cachedVoices as VoiceLike[], profile);
  if (!scored) return null;
  return { voice: scored.voice as SpeechSynthesisVoice, score: scored.score, quality: scored.quality };
}

/** UI-facing voice info for Test Voice / diagnostics: the target locale + what actually resolved. */
export interface VoiceInfo {
  locale: string;
  voiceName: string | null;
  voiceLocale: string | null;
  /** Explicit accent quality — distinguishes exact / approved / different-region / browser-managed. */
  quality: VoiceMatchQuality;
  /** True only for a genuine native accent (exact or approved). A different region is NOT native. */
  nativeAccent: boolean;
  available: boolean; // any correct-language voice exists on this device
}
export async function resolveVoiceInfo(lang: string): Promise<VoiceInfo> {
  await ensureVoices();
  const profile = speechProfile(lang);
  const hit = voiceFor(lang);
  const quality: VoiceMatchQuality = hit ? hit.quality : ttsAvailable() ? 'browser-managed' : 'unavailable';
  return {
    locale: profile.locale,
    voiceName: hit?.voice.name ?? null,
    voiceLocale: hit?.voice.lang ?? null,
    quality,
    nativeAccent: isNativeAccent(quality),
    available: hit !== null,
  };
}

/* ── Gesture unlock ─────────────────────────────────────────────────────── */

/** Prime the engine inside a user gesture. Idempotent; safe to call on every click. */
export function unlockAudio(): void {
  if (diag.unlocked || !ttsAvailable()) return;
  try {
    speechSynthesis.resume(); // Chrome can get stuck paused
    refreshVoices(); // the gesture is also a good moment to (re)load the voice list
    const primer = new SpeechSynthesisUtterance(' ');
    primer.volume = 0; // silent — this call's only job is to satisfy the gesture policy
    speechSynthesis.speak(primer);
    diag.unlocked = true;
    diag.lastError = null;
    emit();
  } catch (err) {
    diag.lastError = `unlock failed: ${String(err)}`;
    emit();
  }
}

if (ttsAvailable()) {
  diag.synthAvailable = true;
  refreshVoices();
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

// First gesture anywhere unlocks audio — belt-and-suspenders with explicit unlock on Start.
if (typeof window !== 'undefined' && ttsAvailable()) {
  const onGesture = (): void => {
    unlockAudio();
    if (diag.unlocked) {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    }
  };
  window.addEventListener('pointerdown', onGesture);
  window.addEventListener('keydown', onGesture);
  window.addEventListener('touchstart', onGesture);
}

// Tab switching / visibility change is the #1 cause of Chrome speech dying mid-session:
// backgrounding pauses the engine and it often stays stuck paused on return. Resume on
// every return to foreground so the next (and any in-flight) speak() actually plays.
if (typeof document !== 'undefined' && ttsAvailable()) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      try {
        speechSynthesis.resume();
      } catch {
        /* engine may be momentarily unavailable; next speak() re-primes */
      }
    }
  });
}

/* ── Speak ──────────────────────────────────────────────────────────────── */

/** Stop any in-flight speech immediately. Safe to call on unmount / route change. */
export function cancelSpeech(): void {
  if (!ttsAvailable()) return;
  try {
    activeUtterance = null;
    stopKeepAlive();
    speechSynthesis.cancel();
  } catch {
    /* nothing to cancel */
  }
}

/**
 * Speak text in a LEARNING language via Web Speech. Resolves (never rejects) with a `SpeakResult`:
 * `ended` on natural finish, `interrupted` when superseded/cancelled, `error`/`unavailable` otherwise.
 * The locale comes from the language registry (via the speech profile) and the voice from the scored
 * resolver — a wrong-language voice is never chosen; when no correct voice exists we still set the
 * locale tag so the engine speaks the right language. Effective rate = per-call rate × global speed.
 */
export function speak(text: string, lang = 'en', rate = 1): Promise<SpeakResult> {
  return new Promise((resolve) => {
    const profile = speechProfile(lang);
    const tag = profile.locale;
    diag.lastRequest = `${lang}→${tag} · "${text.slice(0, 42)}" @${rate}`;
    if (!ttsAvailable()) {
      diag.lastError = 'speechSynthesis unavailable';
      emit();
      console.warn('[audio] speechSynthesis unavailable; drill continues text-only');
      resolve('unavailable');
      return;
    }
    const spoken = prepareTextForSpeech(text);
    if (spoken === '') { resolve('ended'); return; } // nothing audible (e.g. an emoji-only line)
    const synth = speechSynthesis;
    try {
      // A new utterance supersedes any in-flight one; its promise settles 'interrupted' below.
      if (synth.speaking || synth.pending) synth.cancel();
      synth.resume(); // defensive: unstick a paused engine (Chrome)

      const u = new SpeechSynthesisUtterance(spoken);
      activeUtterance = u;
      const base = profile.defaultRate ?? 1;
      u.rate = Math.min(1.5, Math.max(0.5, rate * base * userRate));
      u.lang = tag; // ALWAYS set — even without an explicit voice, this drives the language
      const hit = voiceFor(lang);
      if (hit) {
        u.voice = hit.voice;
        diag.selectedVoice = `${hit.voice.name} (${hit.voice.lang})`;
        diag.selectedScore = hit.score;
        diag.selectedQuality = hit.quality;
        diag.selectedExact = isNativeAccent(hit.quality);
      } else {
        // No specific voice — the engine picks from the locale tag we set on the utterance.
        diag.selectedVoice = '(engine default for locale)';
        diag.selectedScore = null;
        diag.selectedQuality = 'browser-managed';
        diag.selectedExact = false;
      }
      diag.selectedLang = tag;
      emit();

      let settled = false;
      const done = (result: SpeakResult, error?: string): void => {
        if (settled) return;
        settled = true;
        if (error) { diag.lastError = error; emit(); }
        if (activeUtterance === u) {
          activeUtterance = null;
          stopKeepAlive(); // no live utterance of ours — let the engine idle
        }
        resolve(result);
      };
      u.onend = () => done('ended');
      u.onerror = (e) => {
        // 'interrupted'/'canceled' are our own cancel() — a supersede, not a failure.
        const err = e.error;
        if (err === 'interrupted' || err === 'canceled') done('interrupted');
        else done('error', `speak error: ${err}`);
      };
      synth.speak(u);
      startKeepAlive(); // keep Chrome's engine alive for the whole utterance
      // Safety net scaled to text length — some engines never fire onend.
      setTimeout(() => done('ended'), Math.max(4000, spoken.length * 220));
    } catch (err) {
      diag.lastError = `speak threw: ${String(err)}`;
      emit();
      console.warn('[audio] TTS threw; drill continues text-only', err);
      resolve('error');
    }
  });
}

/** Audible self-test for the Test Audio button — the learning language's natural test phrase. */
export function testAudio(lang = 'en'): Promise<SpeakResult> {
  unlockAudio();
  return speak(speechProfile(lang).testPhrase, lang, 1);
}

/** Preview the current global speech speed on a natural sentence in the learning language. */
export function testVoice(lang = 'en'): Promise<SpeakResult> {
  unlockAudio();
  return speak(speechProfile(lang).testPhrase, lang, 1);
}

/* ── Asset-first item playback ──────────────────────────────────────────── */

export async function playItem(item: ContentItem, opts?: { slow?: boolean; lang?: string }): Promise<void> {
  const lang = opts?.lang ?? 'en';
  const path = opts?.slow ? (item.audio.slow ?? item.audio.natural) : item.audio.natural;
  const url = `/${path}`;
  try {
    if (await assetExists(url)) {
      await playUrl(url);
      return;
    }
  } catch (err) {
    console.warn('[audio] asset playback failed, falling back to TTS', err);
  }
  await speak(item.text, lang, opts?.slow ? 0.65 : 1);
}

const assetCache = new Map<string, boolean>();

async function assetExists(url: string): Promise<boolean> {
  const cached = assetCache.get(url);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const ok = res.ok && (res.headers.get('content-type')?.startsWith('audio') ?? false);
    assetCache.set(url, ok);
    return ok;
  } catch {
    assetCache.set(url, false);
    return false;
  }
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error(`audio failed: ${url}`));
    void audio.play().catch(reject);
  });
}
