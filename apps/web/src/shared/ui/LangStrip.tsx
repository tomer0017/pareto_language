import { useAppStore } from '../stores/appStore.js';
import { languageInfo, UI_LANGUAGES, languageName } from '../i18n/languages.js';
import { t } from '../i18n/strings.js';
import { tap } from './haptics.js';

/**
 * The language row — one compact, always-honest line naming the two languages in play, in the
 * learner's own words: "I speak: Hebrew · I'm learning: Spanish" (the app language, then the
 * learning language). Reads appStore (uiLang + learningLang) — no duplicate state. Tapping opens the
 * existing Languages screen. Shown on Home and in Profile, never inside an active mission (focus).
 */
export function LangStrip() {
  const uiLang = useAppStore((s) => s.uiLang);
  const learningLang = useAppStore((s) => s.learningLang);
  const navigate = useAppStore((s) => s.navigate);
  const learn = languageInfo(learningLang);
  const ui = UI_LANGUAGES.find((l) => l.code === uiLang);
  return (
    <button className="lang-strip card-press" onClick={() => { tap(); navigate('languages'); }} aria-label={t('stripAria')}>
      {/* Two self-labelled halves: on a narrow phone they simply stack, each one whole. */}
      <span className="lang-strip-seg"><span className="dim">{t('stripAppPrefix')}</span> {ui?.nativeName ?? uiLang}</span>
      <span className="lang-strip-seg"><span className="dim">{t('stripLearnPrefix')}</span> {learn.flag} {languageName(learningLang)} <span className="lang-strip-globe" aria-hidden>🌐</span></span>
    </button>
  );
}
