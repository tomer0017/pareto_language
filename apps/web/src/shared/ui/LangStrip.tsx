import { useAppStore } from '../stores/appStore.js';
import { languageInfo, UI_LANGUAGES, languageName } from '../i18n/languages.js';
import { t } from '../i18n/strings.js';
import { tap } from './haptics.js';

/**
 * Global language strip — a compact, always-honest indicator of the two languages in play:
 * the trip/learning language and the app/UI language. Reads appStore (uiLang + learningLang) —
 * no duplicate state. Tapping opens the existing Languages screen, where English is selectable
 * and the other trip languages appear as "coming soon". Shown on the main surfaces, never inside
 * an active mission (focus).
 */
export function LangStrip() {
  const uiLang = useAppStore((s) => s.uiLang);
  const learningLang = useAppStore((s) => s.learningLang);
  const navigate = useAppStore((s) => s.navigate);
  const learn = languageInfo(learningLang);
  const ui = UI_LANGUAGES.find((l) => l.code === uiLang);
  return (
    <button className="lang-strip card-press" onClick={() => { tap(); navigate('languages'); }} aria-label={t('stripAria')}>
      <span className="lang-strip-seg"><span className="dim">{t('stripLearnPrefix')}</span> {learn.flag} {languageName(learningLang)}</span>
      <span className="lang-strip-sep">·</span>
      <span className="lang-strip-seg"><span className="dim">{t('stripAppPrefix')}</span> {ui?.nativeName ?? uiLang}</span>
      <span className="lang-strip-globe" aria-hidden>🌐</span>
    </button>
  );
}
