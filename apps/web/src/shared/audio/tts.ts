import type { ContentItem } from '@ready/content-schema';

/**
 * Audio playback (asset-first, Web Speech fallback).
 *
 * CHROME ROOT CAUSE (Sprint 8): Chrome's autoplay policy blocks speechSynthesis.speak()
 * unless the engine has been "unlocked" by a speak() call that originated INSIDE a real user
 * gesture. Our drill/dialogue audio fires from React effects and promise chains — never a
 * gesture — so Chrome silently refused every utterance. Safari has no such policy, so it
 * always worked. (My earlier setTimeout-defer made it strictly worse by moving the first
 * speak out of any gesture.) Fix: prime the engine on the first pointer/key gesture; once
 * unlocked, programmatic speak() works for the session. This is the intended way to satisfy
 * the policy, not a workaround.
 */

const LANG_TAG: Record<string, string> = { it: 'it-IT', en: 'en-US', es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA' };

/* ── Diagnostics (dev panel + Test Audio) ───────────────────────────────── */

export interface AudioDiag {
  browser: string;
  synthAvailable: boolean;
  voicesLoaded: number;
  selectedVoice: string | null;
  selectedLang: string | null;
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
  lastRequest: null,
  lastError: null,
  unlocked: false,
};

const listeners = new Set<() => void>();
function emit(): void {
  for (const l of listeners) l();
}
export function subscribeAudioDiag(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getAudioDiag(): AudioDiag {
  return { ...diag };
}

/* ── Voices ─────────────────────────────────────────────────────────────── */

let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null; // GC guard (Chrome drops collected utterances)

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

function voiceFor(langTag: string): SpeechSynthesisVoice | undefined {
  if (cachedVoices.length === 0) refreshVoices();
  return (
    cachedVoices.find((v) => v.lang === langTag) ??
    cachedVoices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(langTag.slice(0, 2).toLowerCase()))
  );
}

/* ── Gesture unlock ─────────────────────────────────────────────────────── */

/** Prime the engine inside a user gesture. Idempotent; safe to call on every click. */
export function unlockAudio(): void {
  if (diag.unlocked || !ttsAvailable()) return;
  try {
    speechSynthesis.resume(); // Chrome can get stuck paused
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

/* ── Speak ──────────────────────────────────────────────────────────────── */

/** Speak text via Web Speech. Resolves when done; resolves (never rejects) on failure. */
export function speak(text: string, lang = 'it', rate = 1): Promise<void> {
  return new Promise((resolve) => {
    diag.lastRequest = `${lang} · "${text.slice(0, 42)}" @${rate}`;
    if (!ttsAvailable()) {
      diag.lastError = 'speechSynthesis unavailable';
      emit();
      console.warn('[audio] speechSynthesis unavailable; drill continues text-only');
      resolve();
      return;
    }
    const synth = speechSynthesis;
    try {
      if (synth.speaking || synth.pending) synth.cancel();
      synth.resume(); // defensive: unstick a paused engine (Chrome)

      const u = new SpeechSynthesisUtterance(text);
      activeUtterance = u;
      const tag = LANG_TAG[lang] ?? lang;
      u.lang = tag;
      const voice = voiceFor(tag);
      if (voice) {
        u.voice = voice;
        diag.selectedVoice = `${voice.name} (${voice.lang})`;
      } else {
        diag.selectedVoice = '(browser default)'; // fallback: unset voice still speaks tag
      }
      diag.selectedLang = tag;
      emit();

      let settled = false;
      const done = (error?: string): void => {
        if (settled) return;
        settled = true;
        if (error) {
          diag.lastError = error;
          emit();
        }
        if (activeUtterance === u) activeUtterance = null;
        resolve();
      };
      u.onend = () => done();
      u.onerror = (e) => {
        // 'interrupted'/'canceled' are our own cancel() — not real failures.
        const err = e.error;
        done(err && err !== 'interrupted' && err !== 'canceled' ? `speak error: ${err}` : undefined);
      };
      synth.speak(u);
      // Safety net scaled to text length — some engines never fire onend.
      setTimeout(() => done(), Math.max(4000, text.length * 220));
    } catch (err) {
      diag.lastError = `speak threw: ${String(err)}`;
      emit();
      console.warn('[audio] TTS threw; drill continues text-only', err);
      resolve();
    }
  });
}

/** Audible self-test for the Test Audio button — real English at full volume. */
export function testAudio(): Promise<void> {
  unlockAudio();
  return speak('Hello! Ready audio is working.', 'en', 1);
}

/* ── Asset-first item playback ──────────────────────────────────────────── */

export async function playItem(item: ContentItem, opts?: { slow?: boolean; lang?: string }): Promise<void> {
  const lang = opts?.lang ?? 'it';
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
