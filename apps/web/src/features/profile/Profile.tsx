import { useState } from 'react';
import { useSyncExternalStore } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { UI_LANGUAGES, languageInfo, languageName, PILOT_LANG } from '../../shared/i18n/languages.js';
import {
  getSpeechRate, setSpeechRate, SPEECH_RATE_RANGE, testVoice,
  getAudioDiag, subscribeAudioDiag, unlockAudio, testAudio,
} from '../../shared/audio/tts.js';

/**
 * Profile — everything personal in one calm place. Learning Preferences own the single global
 * speech-speed control (no duplicate speed settings anywhere). Language, appearance and audio
 * follow; genuinely-future items are shown as honest, disabled "coming soon" rows.
 */
export function Profile() {
  const app = useAppStore();
  const [rate, setRate] = useState(getSpeechRate());
  const [testing, setTesting] = useState(false);
  const diag = useSyncExternalStore(subscribeAudioDiag, getAudioDiag, getAudioDiag);
  const pilot = languageInfo(PILOT_LANG);

  const onRate = (value: number): void => {
    setRate(value);
    setSpeechRate(value); // single source of truth — affects every spoken sentence app-wide
  };

  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <LangStrip />
        <h1>{t('profileTitle')}</h1>
      </div>
      <div className="screen-scroll">
        {/* ── Learning Preferences ── */}
        <h3 style={{ margin: '16px 0 8px' }}>{t('learningPreferences')}</h3>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700 }}>{t('speechSpeed')}</span>
            <strong style={{ color: 'var(--brand)', fontSize: '1.1rem' }}>{Math.round(rate * 100)}%</strong>
          </div>
          <p className="dim small" style={{ margin: '4px 0 10px' }}>{t('speechSpeedSub')}</p>
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
          <div className="slider-range">
            <span>{Math.round(SPEECH_RATE_RANGE.min * 100)}%</span>
            <span>{Math.round(SPEECH_RATE_RANGE.max * 100)}%</span>
          </div>
          <button
            className="btn-secondary"
            onClick={async () => { tap(); setTesting(true); await testVoice(); setTesting(false); }}
          >
            🔊 {testing ? t('listenFirst') : t('testVoice')}
          </button>
        </div>

        {/* ── Language ── */}
        <h3 style={{ margin: '18px 0 8px' }}>{t('languageSettings')}</h3>
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

        {/* ── Appearance ── */}
        <h3 style={{ margin: '18px 0 8px' }}>{t('appearance')}</h3>
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 8 }}>{t('darkMode')}</p>
          <div className="btn-row">
            <button className={app.theme === 'light' ? 'btn-accent' : 'btn-secondary'} onClick={() => { tap(); app.setTheme('light'); }}>☀️ {t('lightTheme')}</button>
            <button className={app.theme === 'dark' ? 'btn-accent' : 'btn-secondary'} onClick={() => { tap(); app.setTheme('dark'); }}>🌙 {t('darkTheme')}</button>
          </div>
        </div>

        {/* ── Audio ── */}
        <h3 style={{ margin: '18px 0 8px' }}>{t('audioSettings')}</h3>
        <div className="card">
          <div className="list-row" style={{ borderBottom: 'none', paddingTop: 0 }}>
            <span style={{ fontWeight: 700 }}>{t('sound')}</span>
            <span className={`badge ${diag.unlocked ? 'badge-ready' : 'badge-notStarted'}`}>{diag.unlocked ? t('audioReady') : t('audioOff')}</span>
          </div>
          <button className="btn-secondary" onClick={() => { tap(); unlockAudio(); void testAudio(); }}>🔊 {t('testAudioBtn')}</button>
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
