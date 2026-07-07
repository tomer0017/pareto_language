/**
 * The language system — the app is designed around this registry, not around any single
 * language. Each learning language carries its own accent color, flag, native name and script
 * direction; the whole UI re-themes when the language changes (CSS custom properties).
 */

export interface LanguageInfo {
  /** BCP-47-ish code used by content packs (ContentPack.lang). */
  code: string;
  name: string;
  nativeName: string;
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
}

// English is the current pilot — the only playable trip language today (the READY Missions
// Bootcamp is fully English). Italian and the rest are honest "coming soon" until their packs
// ship. English leads the list so it is the default everywhere it matters.
export const LEARNING_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', accent: '#2f6fed', accentSoft: '#e3ecfd', dir: 'ltr', ttsTag: 'en-US', available: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', accent: '#e8590c', accentSoft: '#fdeadd', dir: 'ltr', ttsTag: 'es-ES', available: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', accent: '#3b5bdb', accentSoft: '#e5eafb', dir: 'ltr', ttsTag: 'fr-FR', available: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', accent: '#0ca678', accentSoft: '#dcf5ec', dir: 'ltr', ttsTag: 'it-IT', available: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', accent: '#b8860b', accentSoft: '#f7efd8', dir: 'rtl', ttsTag: 'ar-SA', available: false },
];

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
  const info = UI_LANGUAGES.find((l) => l.code === uiLang);
  document.documentElement.dir = info?.dir ?? 'ltr';
  document.documentElement.lang = uiLang;
}
