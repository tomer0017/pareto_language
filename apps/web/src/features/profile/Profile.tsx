import { useSyncExternalStore } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { UI_LANGUAGES, languageInfo, languageName, PILOT_LANG } from '../../shared/i18n/languages.js';
import { getAudioDiag, subscribeAudioDiag, unlockAudio, testAudio } from '../../shared/audio/tts.js';

/**
 * Profile — everything personal in one calm place. The two most-changed controls (Theme + Speech
 * Speed) now live on Home for one-tap access; both still read/write the exact same appStore/TTS
 * source of truth (no duplicate state). Profile keeps language, audio and honest "coming soon" rows.
 */
export function Profile() {
  const app = useAppStore();
  const diag = useSyncExternalStore(subscribeAudioDiag, getAudioDiag, getAudioDiag);
  const pilot = languageInfo(PILOT_LANG);

  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <LangStrip />
        <h1>{t('profileTitle')}</h1>
      </div>
      <div className="screen-scroll">
        {/* ── Language ── */}
        <h3 style={{ margin: '16px 0 8px' }}>{t('languageSettings')}</h3>
        <div className="card">
          <div className="list-row" style={{ borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 700 }}>{t('learningLanguage')}</span>
            <span className="chip">{pilot.flag} {languageName(PILOT_LANG)} · {t('pilotTag')}</span>
          </div>
          <p className="faint small" style={{ margin: '10px 0 12px' }}>{t('moreLanguagesSoon')}</p>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>{t('uiLanguage')}</p>
          <div className="btn-row">
            {UI_LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={app.uiLang === l.code ? 'btn-accent' : 'btn-secondary'}
                onClick={() => { tap(); app.setUiLang(l.code); }}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* ── Audio ── */}
        <h3 style={{ margin: '18px 0 8px' }}>{t('audioSettings')}</h3>
        <div className="card">
          <div className="list-row" style={{ borderBottom: 'none', paddingTop: 0 }}>
            <span style={{ fontWeight: 700 }}>{t('sound')}</span>
            <span className={`badge ${diag.unlocked ? 'badge-ready' : 'badge-notStarted'}`}>{diag.unlocked ? t('audioReady') : t('audioOff')}</span>
          </div>
          <button className="btn-secondary" onClick={() => { tap(); unlockAudio(); void testAudio(app.learningLang); }}>🔊 {t('testVoiceBtn')}</button>
          {/* Honest: the browser/OS owns the voices — show the locale we target and what resolved. */}
          {diag.selectedVoice && (
            <p className="faint small" style={{ marginTop: 8 }}>
              {diag.selectedLang} · {diag.selectedVoice}
              {diag.selectedQuality === 'same-language-different-region' && ' · ' + t('voiceAccentNote')}
              {diag.selectedQuality === 'browser-managed' && ' · ' + t('voiceFallbackNote')}
            </p>
          )}
        </div>

        {/* ── Coming soon ── */}
        <h3 style={{ margin: '18px 0 8px' }}>{t('comingSoonSection')}</h3>
        <div className="card" style={{ opacity: 0.6 }}>
          {[t('googleSignIn'), t('statistics'), t('notificationsPref')].map((label, i, arr) => (
            <div key={label} className="list-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <span>{label}</span>
              <span className="badge badge-notStarted">{t('comingSoon')}</span>
            </div>
          ))}
        </div>

        <p className="faint small center" style={{ margin: '18px 4px 0' }}>READY · {t('pilotTag')}</p>
      </div>
    </div>
  );
}
