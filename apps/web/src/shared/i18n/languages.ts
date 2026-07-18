/**
 * The language system — the app is designed around this registry, not around any single
 * language. Each learning language carries its own accent color, flag, native name and script
 * direction; the whole UI re-themes when the language changes (CSS custom properties).
 */

import { L } from './strings.js';

export interface LanguageInfo {
  /** BCP-47-ish code used by content packs (ContentPack.lang). */
  code: string;
  name: string;
  nativeName: string;
  /** The language's name written IN each UI language. Beginners see language names in their own
   *  app language (Task 4) — never an unfamiliar endonym like "Français". Add a UI language = add
   *  a key here. Falls back to `name` (English) for any missing UI language. */
  names: { en: string; he: string };
  flag: string;
  /** Accent color driving the per-language theme. */
  accent: string;
  accentSoft: string;
  dir: 'ltr' | 'rtl';
  /** TTS language tag. */
  ttsTag: string;
  /** Whether a validated content pack ships today. Others show as "coming soon" (R1: one
   *  language done superbly before five done adequately). */
  available: boolean;
  /** Early Access: selectable and fully usable, but its Bootcamp is still being authored — unbuilt
   *  missions show honest "Coming Soon" (never English). Core Words/games are complete. */
  earlyAccess?: boolean;
  // ── Capability model (registry-driven; product surfaces read these instead of scattering
  //    per-language checks). Honest per language — a language may be a learnable target, an app/UI
  //    language, or both, at different levels of completeness.
  /** A validated Core corpus pack (`core-{code}.v1.json`) ships for this learning language. */
  coreAvailable?: boolean;
  /** Bootcamp status AS A LEARNING TARGET: full parity, early-access subset, or none. */
  bootcamp?: 'full' | 'early-access' | false;
  /** Shippable as an APP/UI language (a string dictionary + gloss coverage exist). */
  appUi?: boolean;
  /** Realizations signed off by a native reviewer (else AI-drafted / pending). */
  nativeReviewed?: boolean;
}

// English is the current pilot — the only playable trip language today (the READY Missions
// Bootcamp is fully English). Italian and the rest are honest "coming soon" until their packs
// ship. English leads the list so it is the default everywhere it matters.
export const LEARNING_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', names: { en: 'English', he: 'אנגלית' }, flag: '🇺🇸', accent: '#2f6fed', accentSoft: '#e3ecfd', dir: 'ltr', ttsTag: 'en-US', available: true, coreAvailable: true, bootcamp: 'full', appUi: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', names: { en: 'Spanish', he: 'ספרדית' }, flag: '🇪🇸', accent: '#e8590c', accentSoft: '#fdeadd', dir: 'ltr', ttsTag: 'es-ES', available: true, earlyAccess: true, coreAvailable: true, bootcamp: 'full', appUi: false },
  { code: 'fr', name: 'French', nativeName: 'Français', names: { en: 'French', he: 'צרפתית' }, flag: '🇫🇷', accent: '#3b5bdb', accentSoft: '#e5eafb', dir: 'ltr', ttsTag: 'fr-FR', available: true, earlyAccess: true, coreAvailable: true, bootcamp: 'early-access', appUi: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', names: { en: 'Italian', he: 'איטלקית' }, flag: '🇮🇹', accent: '#0ca678', accentSoft: '#dcf5ec', dir: 'ltr', ttsTag: 'it-IT', available: false, coreAvailable: false, bootcamp: false, appUi: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', names: { en: 'Arabic', he: 'ערבית' }, flag: '🇸🇦', accent: '#b8860b', accentSoft: '#f7efd8', dir: 'rtl', ttsTag: 'ar-SA', available: false, coreAvailable: false, bootcamp: false, appUi: false },
];

/** A learning language's name written in the CURRENT app language (Task 4). Uses the active UI
 *  dictionary via L(), so Hebrew users see "אנגלית", English users see "English". */
export function languageName(code: string): string {
  return L(languageInfo(code).names);
}

/** The current pilot / default trip language. Single source of truth for the default. */
export const PILOT_LANG = 'en';

export function languageInfo(code: string): LanguageInfo {
  return LEARNING_LANGUAGES.find((l) => l.code === code)
    ?? LEARNING_LANGUAGES.find((l) => l.code === PILOT_LANG)
    ?? (LEARNING_LANGUAGES[0] as LanguageInfo);
}

/** Apply a learning language's theme to the document (accent drives the whole UI). */
export function applyLanguageTheme(code: string): void {
  const info = languageInfo(code);
  const root = document.documentElement;
  root.style.setProperty('--accent', info.accent);
  root.style.setProperty('--accent-soft', info.accentSoft);
}

/** UI languages (interface chrome). RTL is a first-class citizen. */
export const UI_LANGUAGES = [
  { code: 'en', nativeName: 'English', dir: 'ltr' as const },
  { code: 'he', nativeName: 'עברית', dir: 'rtl' as const },
];

export function applyUiDirection(uiLang: string): void {
  document.documentElement.dir = languageDirection(uiLang);
  document.documentElement.lang = uiLang;
}

/**
 * Writing direction for ANY known language code — app OR learning (RTL is not a Hebrew-only
 * concept: Arabic learning content is RTL even under an LTR app UI, and vice-versa). Reads the
 * registry, so a new language declares its direction once. Defaults to LTR for unknown codes.
 */
export function languageDirection(code: string): 'ltr' | 'rtl' {
  return (
    LEARNING_LANGUAGES.find((l) => l.code === code)?.dir ??
    UI_LANGUAGES.find((l) => l.code === code)?.dir ??
    'ltr'
  );
}

/** TTS locale for a learning language (the audio locale for its realizations). Falls back to a
 *  generated BCP-47-ish tag so a newly-declared language still speaks with a plausible locale. */
export function languageTtsTag(code: string): string {
  return LEARNING_LANGUAGES.find((l) => l.code === code)?.ttsTag ?? `${code}-${code.toUpperCase()}`;
}

export interface LanguageCapabilities {
  learnable: boolean;       // selectable as a learning target
  earlyAccess: boolean;     // learnable but Bootcamp incomplete
  coreAvailable: boolean;   // Core corpus pack ships
  bootcamp: 'full' | 'early-access' | false;
  appUi: boolean;           // selectable as an app/UI language
  nativeReviewed: boolean;
  dir: 'ltr' | 'rtl';
  ttsTag: string;
}

/** One place product surfaces read a language's capabilities from (no scattered `available` checks). */
export function capabilities(code: string): LanguageCapabilities {
  const i = LEARNING_LANGUAGES.find((l) => l.code === code);
  return {
    learnable: i?.available ?? false,
    earlyAccess: i?.earlyAccess ?? false,
    coreAvailable: i?.coreAvailable ?? false,
    bootcamp: i?.bootcamp ?? false,
    appUi: i?.appUi ?? UI_LANGUAGES.some((l) => l.code === code),
    nativeReviewed: i?.nativeReviewed ?? false,
    dir: languageDirection(code),
    ttsTag: languageTtsTag(code),
  };
}
