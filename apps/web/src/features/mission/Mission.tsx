import { useMemo } from 'react';
import { confidencePct, useAppStore } from '../../shared/stores/appStore.js';
import { previewMission, useSessionStore } from '../../shared/stores/sessionStore.js';
import { languageInfo } from '../../shared/i18n/languages.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Ring } from '../../shared/ui/Ring.js';

const SITUATION_ICONS: Record<string, string> = {
  utensils: '🍝', train: '🚕', bag: '🛍️', compass: '🧭', bed: '🏨',
  chat: '💬', plane: '✈️', alert: '🚨', cross: '💊', wifi: '📶',
};

/**
 * Mission Control — the whole product in one glance (PDF §10.3), redesigned mission-first:
 * the app decides what to study; the user only presses Start. Everything on this screen
 * whispers the Pareto promise: a few minutes, today's mission, closer to the trip.
 */
export function Mission() {
  const app = useAppStore();
  const buildSession = useSessionStore((s) => s.build);
  const lang = languageInfo(app.learningLang);
  const days = app.daysLeft();
  const departed = app.plan ? Date.parse(app.plan.departureAt) < Date.now() : false;

  const mission = useMemo(() => previewMission(), [app.states, app.plan]); // eslint-disable-line react-hooks/exhaustive-deps
  const readiness = useMemo(() => app.readiness(), [app]);  

  const start = (preset: 'full' | 'five') => {
    tap();
    buildSession(preset);
    app.navigate('session');
  };

  const steps: { icon: string; label: string }[] = [];
  if (mission.reviewCount > 0) steps.push({ icon: '🔁', label: t('reviewWords', { n: mission.reviewCount }) });
  if (mission.newCount > 0) steps.push({ icon: '✨', label: t('learnNew', { n: mission.newCount }) });
  if (mission.phraseCount > 0) steps.push({ icon: '💬', label: t('practicePhrases', { n: mission.phraseCount }) });
  if (mission.hasSprint) steps.push({ icon: '⚡', label: t('numberSprintStep') });
  if (mission.scenarioName) steps.push({ icon: '🎬', label: t('scenarioStep', { name: mission.scenarioName }) });

  return (
    <div className="screen">
      <div className="screen-scroll">
        <div className="topbar">
          <button className="chip" onClick={() => app.navigate('languages')}>
            {lang.flag} {lang.nativeName}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="chip chip-accent">
              {departed ? t('inTrip') : `✈ ${days} ${days === 1 ? t('dayToGo') : t('daysToGo')}`}
            </span>
            <button className="btn-ghost" onClick={() => app.navigate('plan')} aria-label={t('planSettings')}>
              ⚙︎
            </button>
          </div>
        </div>

        <button className="card card-accent card-press fade-in" style={{ width: '100%', textAlign: 'start', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => app.navigate('bootcamp')}>
          <span style={{ fontSize: '1.8rem' }}>🎖️</span>
          <span>
            <p style={{ fontWeight: 800 }}>{t('bootcamp')}</p>
            <p className="dim small">{t('bootcampSub')}</p>
          </span>
        </button>

        <h1 className="fade-in" style={{ marginBottom: 14 }}>{t('todaysMission')}</h1>

        <div className="mission-card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{t('estimatedTime')}</h3>
            <span className="chip chip-accent">⏱ {mission.estMinutes} {t('min')}</span>
          </div>
          {mission.empty ? (
            <p className="dim" style={{ marginTop: 12 }}>{t('nothingDue')}</p>
          ) : (
            <div className="stagger">
              {steps.map((s) => (
                <div className="mission-step" key={s.label}>
                  <span className="step-icon">{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </div>
          )}
          <button className="btn-primary breathe" style={{ marginTop: 16 }} onClick={() => start('full')}>
            {t('startMission')}
          </button>
          <div className="btn-row" style={{ marginTop: 10 }}>
            <button className="btn-soft" onClick={() => start('five')}>
              {t('fiveMinutes')}
            </button>
            <button className="btn-danger-soft" onClick={() => app.navigate('emergency')}>
              🚨 {t('emergency')}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 12px' }}>
          <h2>{t('travelConfidence')}</h2>
        </div>
        <div className="conf-grid stagger">
          {readiness.map((snap) => {
            const s = app.situationById.get(snap.situationId);
            if (!s) return null;
            const pct = confidencePct(snap);
            const cls = snap.state === 'ready' ? 'is-ready' : snap.state === 'fading' ? 'is-fading' : '';
            return (
              <button key={snap.situationId} className={`conf-card card-press ${cls}`} onClick={() => app.navigate('situations')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="conf-icon">{SITUATION_ICONS[s.icon] ?? '📍'}</span>
                  <Ring pct={pct} color={snap.state === 'fading' ? 'var(--warn)' : snap.state === 'ready' ? 'var(--good)' : 'var(--accent)'} />
                </div>
                <span className="conf-name">{L(s.name)}</span>
                <span className={`badge badge-${snap.state}`}>{t(snap.state)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
