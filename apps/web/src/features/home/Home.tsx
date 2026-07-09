import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { DAYS, useBootcampStore } from '../bootcamp/bootcampStore.js';

/**
 * Home — the pilot's overview (20/80): where am I, and what's the one thing to do next.
 * A single "Continue" hero (resume in-progress → else next mission → else replay), a progress
 * bar, and a quiet path to the full map. No dashboards, no vanity metrics.
 */
export function Home() {
  const app = useAppStore();
  const bc = useBootcampStore();

  // The journey the learner walks — numbered missions only. The optional Recovery Toolkit is a
  // special companion (Task 6), so it never becomes "up next" and doesn't gate progress.
  const built = BOOTCAMP_PLAN.filter((m) => m.day in DAYS && !m.special);
  const doneCount = built.filter((m) => bc.completedDays.includes(m.day)).length;
  const pct = built.length ? Math.round((doneCount / built.length) * 100) : 0;

  const resumeDay = built.find((m) => (bc.stepIndex[String(m.day)] ?? 0) > 0 && !bc.completedDays.includes(m.day));
  const nextDay = built.find((m) => !bc.completedDays.includes(m.day));
  const target = resumeDay ?? nextDay ?? built[0];
  const allDone = doneCount >= built.length && built.length > 0;

  const open = (day: number): void => {
    tap();
    bc.startDay(day);
    app.navigate('bootcamp');
  };

  const heroLabel = allDone
    ? t('replayMissions')
    : resumeDay
      ? t('continueMissionCta', { title: L(target!.title) })
      : doneCount > 0
        ? t('nextMissionCta', { title: L(target!.title) })
        : t('startMissionCta', { title: L(target!.title) });

  return (
    <div className="screen">
      <div className="screen-scroll">
        <LangStrip />
        <div style={{ padding: '6px 0 4px' }}>
          <h1>{t('homeGreeting')}</h1>
          <p className="dim" style={{ marginTop: 4 }}>{t('homeSub')}</p>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill brand" style={{ width: `${pct}%` }} />
          </div>
          <span className="chip">{t('missionsProgress', { done: doneCount, total: built.length })}</span>
        </div>

        {target && (
          <button className="mission-card card-press" style={{ width: '100%', textAlign: 'start', border: 'none' }} onClick={() => open(target.day)}>
            <p className="drill-label" style={{ color: 'var(--brand)' }}>{allDone ? t('allMissionsDone') : t('upNext')}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 4px' }}>
              🎖️ {L(target.title)}
            </p>
            <p className="dim small">{L(target.confidenceGain)}</p>
            <div className="btn-primary breathe" style={{ marginTop: 14, textAlign: 'center' }}>{heroLabel}</div>
          </button>
        )}

        <button className="game-card card-press" style={{ marginTop: 4 }} onClick={() => { tap(); bc.exit(); app.navigate('bootcamp'); }}>
          <span className="game-icon" style={{ background: 'var(--brand)' }}>🎯</span>
          <span>
            <p style={{ fontWeight: 800 }}>{t('allMissions')}</p>
            <p className="dim small">{t('allMissionsSub')}</p>
          </span>
        </button>
      </div>
    </div>
  );
}
