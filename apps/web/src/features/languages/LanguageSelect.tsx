import { LEARNING_LANGUAGES, UI_LANGUAGES, languageName } from '../../shared/i18n/languages.js';
import { t } from '../../shared/i18n/strings.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { TopBar } from '../../shared/ui/TopBar.js';
import { tap } from '../../shared/ui/haptics.js';

/**
 * The language system's front door: five trip languages with native names, flags and their own
 * accent colors. One tap re-themes the entire app. Unshipped packs are honest "coming soon"
 * (R1: one language done superbly beats five done adequately).
 */
export function LanguageSelect() {
  const app = useAppStore();

  return (
    <div className="screen">
      <TopBar title={t('learningLanguage')} backTo="home" />
      <div className="screen-scroll">
        <p className="dim small" style={{ marginBottom: 14 }}>{t('moreLanguagesSoon')}</p>
        <div className="lang-grid stagger">
          {LEARNING_LANGUAGES.map((l) => {
            const selected = l.code === app.learningLang;
            return (
              <button
                key={l.code}
                className={`lang-card card-press ${selected ? 'selected' : ''} ${l.available ? '' : 'locked'}`}
                style={selected ? undefined : { borderColor: 'transparent' }}
                onClick={() => {
                  if (!l.available) return;
                  tap();
                  void app.setLearningLang(l.code).then(() => app.navigate('bootcamp'));
                }}
                aria-pressed={selected}
              >
                <span className="lang-flag">{l.flag}</span>
                <span className="lang-native" style={{ color: l.accent }}>{languageName(l.code)}</span>
                {!l.available && <span className="badge badge-notStarted">{t('comingSoon')}</span>}
                {l.available && l.earlyAccess && <span className="badge badge-ready">{t('earlyAccess')}</span>}
              </button>
            );
          })}
        </div>

        <h3 style={{ margin: '22px 0 10px' }}>{t('uiLanguage')}</h3>
        <div className="btn-row">
          {UI_LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={app.uiLang === l.code ? 'btn-accent' : 'btn-secondary'}
              onClick={() => {
                tap();
                app.setUiLang(l.code);
              }}
            >
              {l.nativeName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
