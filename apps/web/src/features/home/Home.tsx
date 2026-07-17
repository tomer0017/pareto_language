import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionsFor, useBootcampStore } from '../bootcamp/bootcampStore.js';
import { getSpeechRate, setSpeechRate, SPEECH_RATE_RANGE } from '../../shared/audio/tts.js';
import { QuickTranslator } from './QuickTranslator.js';

/**
 * Home — the real entry point of READY (not a Bootcamp mirror). It answers "what can I do here?"
 * with four large action cards, surfaces the two most-changed settings (Theme + Speech Speed —
 * reusing the exact same appStore/TTS, no duplicate state), and keeps "Continue" available as a
 * quieter secondary card lower down. The language strip and its logic are unchanged.
 */
export function Home() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const [rate, setRate] = useState(getSpeechRate());

  // The journey the learner walks — numbered missions only, IN THE ACTIVE LEARNING LANGUAGE. Using
  // the language's own mission set means "Continue/Next" can never jump into an unbuilt French
  // mission (Early Access), and progress % reflects that language. The optional Recovery Toolkit is
  // a special companion, so it never becomes "up next" and doesn't gate progress.
  const missions = missionsFor(app.learningLang);
  const built = BOOTCAMP_PLAN.filter((m) => m.day in missions && !m.special);
  const doneCount = built.filter((m) => bc.completedDays.includes(m.day)).length;
  const pct = built.length ? Math.round((doneCount / built.length) * 100) : 0;

  const resumeDay = built.find((m) => (bc.stepIndex[String(m.day)] ?? 0) > 0 && !bc.completedDays.includes(m.day));
  const nextDay = built.find((m) => !bc.completedDays.includes(m.day));
  const target = resumeDay ?? nextDay ?? built[0];
  const allDone = doneCount >= built.length && built.length > 0;

  const onRate = (value: number): void => {
    setRate(value);
    setSpeechRate(value); // single global source of truth — same store the whole app uses
  };

  const openMission = (day: number): void => {
    tap();
    bc.startDay(day);
    app.navigate('bootcamp');
  };

  const openCore = (category: string): void => {
    tap();
    app.setCoreCategory(category);
    app.navigate('core');
  };

  return (
    <div className="screen">
      <div className="screen-scroll">
        <LangStrip />
        {/* Compact Quick Translator replaces the old "Your training" hero — one glance, instant
            help, no added vertical weight (source = UI language, target = learning language, locked). */}
        <QuickTranslator />

        {/* ── Quick settings (the two most-changed controls, reused from their stores) ── */}
        <p className="drill-label" style={{ margin: '12px 2px 8px' }}>{t('quickSettings')}</p>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>{t('darkMode')}</p>
            <div className="btn-row">
              <button className={app.theme === 'light' ? 'btn-accent' : 'btn-secondary'} onClick={() => { tap(); app.setTheme('light'); }}>☀️ {t('lightTheme')}</button>
              <button className={app.theme === 'dark' ? 'btn-accent' : 'btn-secondary'} onClick={() => { tap(); app.setTheme('dark'); }}>🌙 {t('darkTheme')}</button>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700 }}>{t('speechSpeed')}</span>
              <strong style={{ color: 'var(--brand)', fontSize: '1.05rem' }}>{Math.round(rate * 100)}%</strong>
            </div>
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
          </div>
        </div>

        {/* ── Main actions — the primary navigation of READY ── */}
        <div className="home-actions stagger">
          <button className="action-card card-press ac-situations" onClick={() => { tap(); bc.exit(); app.navigate('bootcamp'); }}>
            <span className="action-icon">🗣️</span>
            <span className="action-title">{t('homeCommonSituations')}</span>
            <span className="action-sub">{t('homeCommonSituationsSub')}</span>
          </button>
          <button className="action-card card-press ac-words" onClick={() => openCore('words')}>
            <span className="action-icon">📖</span>
            <span className="action-title">{t('homeLearnWords')}</span>
            <span className="action-sub">{t('homeLearnWordsSub')}</span>
          </button>
          <button className="action-card card-press ac-phrases" onClick={() => openCore('phrases')}>
            <span className="action-icon">💬</span>
            <span className="action-title">{t('coreTabPhrases')}</span>
            <span className="action-sub">{t('homeCorePhrasesSub')}</span>
          </button>
          <button className="action-card card-press ac-videos" onClick={() => { tap(); app.navigate('videos'); }}>
            <span className="action-icon">🎬</span>
            <span className="action-title">{t('homeVideos')}</span>
            <span className="action-sub">{t('homeVideosSub')}</span>
          </button>
        </div>

        {/* ── Continue learning — secondary, for returning users ── */}
        {target && (
          <button className="card card-press" style={{ width: '100%', textAlign: 'start', marginTop: 18, border: 'none' }} onClick={() => openMission(target.day)}>
            <p className="drill-label" style={{ color: 'var(--brand)' }}>{allDone ? t('allMissionsDone') : t('continueWhereStopped')}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <span style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 800 }}>🎖️ {L(target.title)}</p>
                <p className="dim small">{t('missionsProgress', { done: doneCount, total: built.length })}</p>
              </span>
              <span className="chip chip-accent">{allDone ? t('replay') : t('continue')}</span>
            </div>
            <div className="progress-track" style={{ marginTop: 10 }}>
              <div className="progress-fill brand" style={{ width: `${pct}%` }} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
