import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { ProgressRing } from '../../shared/ui/ProgressRing.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionsFor, useBootcampStore } from '../bootcamp/bootcampStore.js';
import { missionIcon } from '../bootcamp/missionFlow.js';
import { useTravelReadiness } from '../bootcamp/useReadiness.js';
import type { MissionStatus } from '../bootcamp/readiness.js';
import { useSentenceProgress } from '../core/useSentenceProgress.js';
import type { StringKey } from '../../shared/i18n/strings.js';

const STATUS_KEY: Record<MissionStatus, StringKey> = {
  ready: 'statusReady',
  inProgress: 'statusInProgress',
  notStarted: 'statusNotStarted',
  unavailable: 'comingSoon',
};

/**
 * Travel Readiness — the detail behind Home's ring: which real situations the learner can already
 * handle, which are under way, and which are still ahead. Capability is the motivation ("Coffee
 * Shop — ready"), so the list IS the reward; there are no points, streaks or invented badges.
 * Every row is read from stored mission progress.
 */
export function Readiness() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const readiness = useTravelReadiness();
  const missions = missionsFor(app.learningLang);
  const sentences = useSentenceProgress();

  const openMission = (day: number): void => {
    tap();
    bc.startDay(day);
    app.navigate('bootcamp');
  };

  return (
    <div className="screen screen-wide">
      <PageHeader title={t('readinessTitle')} sub={t('readinessDetailSub')} onBack={() => app.navigate('home')} />
      <div className="screen-scroll">
        <div className="card readiness-card">
          <ProgressRing pct={readiness.pct} label={`${t('readinessTitle')} ${readiness.pct}%`}>
            <span className="ring-value">{readiness.pct}%</span>
            <span className="ring-caption">{t('readinessTitle')}</span>
          </ProgressRing>
          <div className="readiness-body">
            <p className="dim">{readiness.allDone ? t('readinessAllDone', { total: readiness.total }) : t('readinessRemaining', { n: readiness.remaining })}</p>
            <p className="stat-row good"><Icon name="check" size={18} />{t('readinessSituations', { done: readiness.ready, total: readiness.total })}</p>
            {sentences.practiced !== null && (
              <p className="stat-row"><Icon name="chat" size={18} />{t('readinessPhrases', { done: sentences.practiced, total: sentences.total })}</p>
            )}
          </div>
        </div>

        <div className="section-head"><h2>{t('yourSituations')}</h2></div>
        <div className="mission-grid">
          {BOOTCAMP_PLAN.map((m) => {
            const status = readiness.statusOf(m.day);
            return (
              <button key={m.id} className="link-row card-press" style={{ marginBottom: 0 }} disabled={status === 'unavailable'} onClick={() => openMission(m.day)}>
                <span className={`status-dot ${status}`} aria-hidden>{status === 'ready' && <Icon name="check" size={14} />}</span>
                <span className="icon-tile" aria-hidden>{missionIcon(missions[m.day])}</span>
                <span className="link-row-body">
                  <span className="link-row-title">{L(m.title)}</span>
                  <span className={`status-label ${status}`}>{t(STATUS_KEY[status])}</span>
                </span>
                <Icon name="chevron" size={20} flip />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
