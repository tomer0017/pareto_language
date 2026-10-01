import { useState, useSyncExternalStore } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { UI_LANGUAGES, languageInfo, languageName } from '../../shared/i18n/languages.js';
import { getAudioDiag, getSpeechRate, setSpeechRate, SPEECH_RATE_RANGE, subscribeAudioDiag, testAudio, unlockAudio } from '../../shared/audio/tts.js';

/**
 * Profile — the one home for everything personal and configurable: the two languages, the voice
 * (the single global speech speed + a test), appearance, and honest placeholders for what comes
 * next (account, sync). Nothing here is duplicated elsewhere: each control reads and writes the same
 * store / TTS preference the whole app uses.
 */
export function Profile() {
  const app = useAppStore();
  const diag = useSyncExternalStore(subscribeAudioDiag, getAudioDiag, getAudioDiag);
  const [rate, setRate] = useState(getSpeechRate());
  const learning = languageInfo(app.learningLang);
  const onRate = (value: number): void => {
    setRate(value);
    setSpeechRate(value); // the ONE global speech-speed preference
  };

  return (
    <div className="screen screen-wide">
      <div className="brand-top"><span className="brand-mark">READY <Icon name="plane" size={22} /></span></div>
      <PageHeader title={t('profileTitle')} icon={<Icon name="profile" />} />
      <div className="screen-scroll">
        <div className="settings-grid">
          {/* ── Languages ── */}
          <section className="card" aria-labelledby="set-lang">
            <h2 className="setting-title" id="set-lang">{t('languageSettings')}</h2>
            <div className="setting-line">
              <span>
                <span className="dim small" style={{ display: 'block' }}>{t('learningLanguage')}</span>
                <strong>{learning.flag} {languageName(app.learningLang)}</strong>
              </span>
              <button className="btn-link" onClick={() => { tap(); app.navigate('languages'); }}>{t('changeBtn')}</button>
            </div>
            <div className="setting-line" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <span className="dim small">{t('uiLanguage')}</span>
              <div className="btn-row">
                {UI_LANGUAGES.map((l) => (
                  <button key={l.code} className={app.uiLang === l.code ? 'btn-soft' : 'btn-secondary'} aria-pressed={app.uiLang === l.code} onClick={() => { tap(); app.setUiLang(l.code); }}>
                    {l.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Voice: the one speech speed + test ── */}
          <section className="card" aria-labelledby="set-voice">
            <h2 className="setting-title" id="set-voice">{t('audioSettings')}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700 }}>{t('speechSpeed')}</span>
              <strong style={{ color: 'var(--brand)', direction: 'ltr' }}>{Math.round(rate * 100)}%</strong>
            </div>
            <p className="dim small" style={{ marginBottom: 10 }}>{t('speechSpeedSub')}</p>
            <input
              type="range"
              className="slider"
              min={SPEECH_RATE_RANGE.min}
              max={SPEECH_RATE_RANGE.max}
              step={0.05}
              value={rate}
              onChange={(e) => onRate(parseFloat(e.target.value))}
              aria-label={t('speechSpeed')}
            />
            <div className="setting-line" style={{ marginTop: 12 }}>
              <span style={{ fontWeight: 700 }}>{t('sound')}</span>
              <span className={`badge ${diag.unlocked ? 'badge-ready' : 'badge-notStarted'}`}>{diag.unlocked ? t('audioReady') : t('audioOff')}</span>
            </div>
            <button className="btn-secondary btn-icon" onClick={() => { tap(); unlockAudio(); void testAudio(app.learningLang); }}>
              <Icon name="volume" size={18} />{t('testVoice')}
            </button>
            {/* Honest: the browser/OS owns the voices — show the locale we target and what resolved. */}
            {diag.selectedVoice && (
              <p className="faint small" style={{ marginTop: 8 }}>
                {diag.selectedLang} · {diag.selectedVoice}
                {diag.selectedQuality === 'same-language-different-region' && ' · ' + t('voiceAccentNote')}
                {diag.selectedQuality === 'browser-managed' && ' · ' + t('voiceFallbackNote')}
              </p>
            )}
          </section>

          {/* ── Appearance ── */}
          <section className="card" aria-labelledby="set-look">
            <h2 className="setting-title" id="set-look">{t('appearance')}</h2>
            <div className="btn-row">
              <button className={app.theme === 'light' ? 'btn-soft' : 'btn-secondary'} aria-pressed={app.theme === 'light'} onClick={() => { tap(); app.setTheme('light'); }}>☀️ {t('lightTheme')}</button>
              <button className={app.theme === 'dark' ? 'btn-soft' : 'btn-secondary'} aria-pressed={app.theme === 'dark'} onClick={() => { tap(); app.setTheme('dark'); }}>🌙 {t('darkTheme')}</button>
            </div>
          </section>

          {/* ── Account (not built yet — shown honestly) ── */}
          <section className="card" aria-labelledby="set-account" style={{ opacity: 0.7 }}>
            <h2 className="setting-title" id="set-account">{t('accountSection')}</h2>
            {[t('googleSignIn'), t('statistics'), t('notificationsPref')].map((label) => (
              <div key={label} className="setting-line">
                <span>{label}</span>
                <span className="badge badge-notStarted">{t('comingSoon')}</span>
              </div>
            ))}
          </section>
        </div>
        <p className="faint small center" style={{ margin: '18px 4px 0' }}>READY · {t('pilotTag')}</p>
      </div>
    </div>
  );
}
