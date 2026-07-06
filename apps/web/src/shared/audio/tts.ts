import type { ContentItem } from '@ready/content-schema';

/**
 * Audio playback (asset-first, Web Speech fallback). Cross-browser notes — Chrome specifics
 * are ROOT-CAUSE handling of a genuinely asynchronous engine, not hacks:
 *
 * 1) Chrome processes `speechSynthesis.cancel()` asynchronously. Calling `speak()` in the
 *    same tick races the cancel inside the engine and the new utterance is SILENTLY dropped
 *    (Safari tolerates it). Fix: when the engine is speaking/pending, cancel, then hand the
 *    new utterance over on a short deferral so the engine reaches idle first.
 * 2) Chrome drops utterances whose JS object is garbage-collected mid-speech. Fix: hold a
 *    module-level reference to the active utterance until it ends.
 * 3) Chrome populates `getVoices()` asynchronously (empty until `voiceschanged`). Fix: prime
 *    the voice list eagerly at module load AND on voiceschanged; never depend on a voice being
 *    present — an unset voice still speaks with the browser default for `utterance.lang`.
 */

const LANG_TAG: Record<string, string> = { it: 'it-IT', en: 'en-US', es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA' };

let cachedVoices: SpeechSynthesisVoice[] = [];
/** GC guard (Chrome drops collected utterances mid-speech). */
let activeUtterance: SpeechSynthesisUtterance | null = null;

function refreshVoices(): void {
  try {
    cachedVoices = speechSynthesis.getVoices();
  } catch {
    cachedVoices = [];
  }
}

if (typeof speechSynthesis !== 'undefined') {
  refreshVoices(); // prime eagerly — Chrome returns [] until the async load completes
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

function voiceFor(langTag: string): SpeechSynthesisVoice | undefined {
  if (cachedVoices.length === 0) refreshVoices();
  return (
    cachedVoices.find((v) => v.lang === langTag) ??
    cachedVoices.find((v) => v.lang.replace('_', '-').startsWith(langTag.slice(0, 2)))
  );
}

export function ttsAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** Speak text. Resolves when playback ends; resolves (never rejects) on any failure. */
export function speak(text: string, lang = 'it', rate = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsAvailable()) {
      console.warn('[audio] speechSynthesis unavailable; drill continues text-only');
      resolve();
      return;
    }
    const synth = speechSynthesis;

    const start = (): void => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        activeUtterance = u; // (2) keep referenced until done
        const tag = LANG_TAG[lang] ?? lang;
        u.lang = tag;
        const voice = voiceFor(tag);
        if (voice) u.voice = voice;
        u.rate = rate;
        let settled = false;
        const done = (): void => {
          if (settled) return;
          settled = true;
          if (activeUtterance === u) activeUtterance = null;
          resolve();
        };
        u.onend = done;
        u.onerror = done; // 'interrupted'/'canceled' from a later cancel() also settle us
        synth.speak(u);
        // Safety net scaled to text length — some engines drop onend under fast rates.
        setTimeout(done, Math.max(4000, text.length * 220));
      } catch (err) {
        console.warn('[audio] TTS threw; drill continues text-only', err);
        resolve();
      }
    };

    if (synth.speaking || synth.pending) {
      synth.cancel(); // (1) never speak in the same tick as cancel — Chrome drops it
      setTimeout(start, 90);
    } else {
      start();
    }
  });
}

/** Try a real audio asset; fall back to TTS. The clean swap path (PDF §11.3). */
export async function playItem(item: ContentItem, opts?: { slow?: boolean; lang?: string }): Promise<void> {
  const lang = opts?.lang ?? 'it';
  const path = opts?.slow ? (item.audio.slow ?? item.audio.natural) : item.audio.natural;
  const url = `/${path}`;
  try {
    const ok = await assetExists(url);
    if (ok) {
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
