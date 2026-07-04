import type { ContentItem } from '@ready/content-schema';

/**
 * Audio playback for content items (PDF §11.3, content/tts.ts integration point).
 * Strategy: try the pre-generated asset path first (real recordings / neural TTS, added later
 * without client changes); fall back to the Web Speech API so the app is fully usable today.
 * Every failure path resolves — a drill must never dead-end on audio (M4 quality bar).
 */

const LANG_TAG: Record<string, string> = { it: 'it-IT' };

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function voicesFor(langTag: string): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === 'undefined') return undefined;
  if (!cachedVoices || cachedVoices.length === 0) cachedVoices = speechSynthesis.getVoices();
  return (
    cachedVoices.find((v) => v.lang === langTag) ??
    cachedVoices.find((v) => v.lang.startsWith(langTag.slice(0, 2)))
  );
}

if (typeof speechSynthesis !== 'undefined') {
  // Voice list loads asynchronously in some browsers.
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoices = speechSynthesis.getVoices();
  });
}

export function ttsAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** Speak text via Web Speech API. Resolves when done; resolves (not rejects) on failure. */
export function speak(text: string, lang = 'it', rate = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsAvailable()) {
      console.warn('[audio] speechSynthesis unavailable; drill continues text-only');
      resolve();
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const tag = LANG_TAG[lang] ?? lang;
      u.lang = tag;
      const voice = voicesFor(tag);
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onend = () => resolve();
      u.onerror = (e) => {
        console.warn('[audio] TTS error; drill continues text-only', e.error);
        resolve();
      };
      speechSynthesis.speak(u);
      // Safety net: some engines never fire onend.
      setTimeout(resolve, 15000);
    } catch (err) {
      console.warn('[audio] TTS threw; drill continues text-only', err);
      resolve();
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
