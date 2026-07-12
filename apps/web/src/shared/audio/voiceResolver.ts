/**
 * VoiceResolver — deterministic, unit-tested selection of the best installed voice for a learning
 * locale. The browser/OS owns the voice list, so we SCORE candidates rather than trust one hardcoded
 * name: an exact locale match wins; a same-language region wins only when no exact match exists; a
 * wrong language is disqualified outright (never speak French with an English voice). Preferred voice
 * names, local (offline-capable) voices and the engine default are tie-breaking bonuses, never
 * overrides for the wrong locale.
 *
 * Pure: no browser globals — pass in the voice list (or a POJO in tests).
 */

/**
 * How well a chosen voice matches the course accent — reported honestly, never flattened. A
 * different-region voice of the same language is NOT a native-accent match: en-US ≠ en-GB,
 * fr-FR ≠ fr-CA, es-ES ≠ es-MX, pt-PT ≠ pt-BR. Only locales EXPLICITLY listed in a profile's
 * `fallbackLocales` earn `approved-fallback`; any other same-language region is the degraded
 * `same-language-different-region`, used only as a last resort.
 */
export type VoiceMatchQuality =
  | 'exact-locale'
  | 'approved-fallback'
  | 'same-language-different-region'
  | 'browser-managed' // no explicit voice chosen; the engine picks from the locale tag
  | 'unavailable'; // no speech at all

/** True only for a genuine native-accent match (exact locale or an explicitly approved fallback). */
export function isNativeAccent(q: VoiceMatchQuality): boolean {
  return q === 'exact-locale' || q === 'approved-fallback';
}

export interface SpeechLanguageProfile {
  /** Primary BCP-47 locale from the language registry (e.g. 'en-US', 'fr-FR'). */
  locale: string;
  /** EXPLICITLY approved alternate locales (accent-acceptable), ordered. A same-language region that
   *  is NOT listed here is degraded, never treated as a native match. Empty by default. */
  fallbackLocales: string[];
  /** Known high-quality voice names for a bonus (never the sole mechanism). */
  preferredVoiceNames: string[];
  /** A natural sentence in the language, for Test Voice. */
  testPhrase: string;
  /** Optional language-specific base rate (still multiplied by the global user speed). */
  defaultRate?: number;
}

/** Minimal shape of a voice — matches SpeechSynthesisVoice, but POJO-friendly for tests. */
export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

export interface ScoredVoice {
  voice: VoiceLike;
  score: number;
  /** Accent match quality of THIS voice (one of the voice-level qualities, never browser/unavailable). */
  quality: Extract<VoiceMatchQuality, 'exact-locale' | 'approved-fallback' | 'same-language-different-region'>;
  /** Human-readable reasons (diagnostics only). */
  reasons: string[];
}

// Scoring weights — documented so the ranking is auditable (see docs/TTS_RESEARCH.md §Resolver).
const SCORE = {
  EXACT_LOCALE: 1000,
  FALLBACK_LOCALE: 500, // minus the fallback index, so earlier fallbacks rank higher
  SAME_BASE: 200, // same language, an unlisted region
  PREFERRED_NAME: 100,
  LOCAL_SERVICE: 40,
  IS_DEFAULT: 10,
} as const;

/** Normalize a language tag: `en_US` / `EN-us` → `en-us`. */
export function normalizeTag(lang: string): string {
  return lang.replace(/_/g, '-').toLowerCase().trim();
}

/** Base (primary) language subtag: 'en-US' → 'en'. */
export function baseLang(lang: string): string {
  return normalizeTag(lang).split('-')[0] ?? '';
}

type VoiceQuality = ScoredVoice['quality'];

/**
 * Score one voice for a profile. Returns `null` when the voice is a WRONG LANGUAGE (disqualified);
 * otherwise a score (higher = better) plus the explicit accent match quality. A same-language voice
 * of a DIFFERENT region that is not an approved fallback is `same-language-different-region` — never
 * silently treated as exact or approved.
 */
export function scoreVoice(voice: VoiceLike, profile: SpeechLanguageProfile): { score: number; quality: VoiceQuality; reasons: string[] } | null {
  const nv = normalizeTag(voice.lang);
  const nt = normalizeTag(profile.locale);
  const fallbacks = profile.fallbackLocales.map(normalizeTag);
  const allowedBases = new Set<string>([baseLang(nt), ...fallbacks.map(baseLang)]);
  if (!allowedBases.has(baseLang(nv))) return null; // wrong language — never selectable

  let score = 0;
  let quality: VoiceQuality;
  const reasons: string[] = [];
  if (nv === nt) {
    score += SCORE.EXACT_LOCALE;
    quality = 'exact-locale';
    reasons.push('exact-locale');
  } else {
    const fi = fallbacks.indexOf(nv);
    if (fi >= 0) {
      score += SCORE.FALLBACK_LOCALE - fi * 10;
      quality = 'approved-fallback';
      reasons.push(`approved-fallback#${fi}`);
    } else {
      // Same language, a DIFFERENT (unapproved) region — degraded, last resort. Not a native match.
      score += SCORE.SAME_BASE;
      quality = 'same-language-different-region';
      reasons.push('same-language-different-region');
    }
  }
  if (profile.preferredVoiceNames.some((n) => voice.name.toLowerCase().includes(n.toLowerCase()))) {
    score += SCORE.PREFERRED_NAME;
    reasons.push('preferred-name');
  }
  if (voice.localService) {
    score += SCORE.LOCAL_SERVICE;
    reasons.push('local-service');
  }
  if (voice.default) {
    score += SCORE.IS_DEFAULT;
    reasons.push('engine-default');
  }
  return { score, quality, reasons };
}

/**
 * Pick the best voice for a profile, or `null` when no correct-language voice exists (a controlled
 * failure — the caller then speaks with the locale tag only, never a wrong-language voice).
 * Deterministic: ties resolve to the earliest voice in the list.
 */
export function resolveVoice(voices: VoiceLike[], profile: SpeechLanguageProfile): ScoredVoice | null {
  let best: ScoredVoice | null = null;
  for (const voice of voices) {
    const scored = scoreVoice(voice, profile);
    if (scored === null) continue;
    if (best === null || scored.score > best.score) best = { voice, score: scored.score, quality: scored.quality, reasons: scored.reasons };
  }
  return best;
}

/**
 * Remove content that should never be SPOKEN (emoji, control chars) and normalize whitespace, WITHOUT
 * changing meaning or the displayed text. The learning sentence is untouched on screen; only the
 * string handed to the engine is cleaned. Returns the input trimmed when nothing needs stripping.
 */
export function prepareTextForSpeech(text: string): string {
  // Engines read emoji as odd words. Strip pictograph ranges as classes; strip the combining marks
  // (ZWJ, variation selector, keycap) as standalone patterns — a character CLASS of combining marks
  // is flagged as misleading. Displayed text is untouched; only the spoken string is cleaned.
  return text
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '') // emoji & supplementary pictographs
    .replace(/[\u{2600}-\u{27BF}]/gu, '') // misc symbols & dingbats
    .replace(/\u{FE0F}/gu, '') // variation selector-16 (emoji presentation)
    .replace(/\u{20E3}/gu, '') // combining enclosing keycap
    .replace(/\u{200D}/gu, '') // zero-width joiner
    .replace(/\s+/g, ' ')
    .trim();
}
