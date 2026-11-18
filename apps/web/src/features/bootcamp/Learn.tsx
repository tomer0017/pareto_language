import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { missionsFor, useBootcampStore } from './bootcampStore.js';
import { missionIcon } from './missionFlow.js';
import { MissionCard } from './MissionCard.js';
import { useTravelReadiness } from './useReadiness.js';
import { CompanionPresence } from '../companion/Companion.js';

/**
 * Situations — the 30-situation learning path, and the ONE route to it (internally the `bootcamp`
 * view). It answers two questions at a glance and then gets out of the way:
 *
 *   How far am I?    "You've learned X of 30 situations" + one bar (completed ÷ the plan)
 *   Where do I go?   the situations themselves, 1 → 30, with exactly one marked as the next step
 *
 * The buddy adds ONE short, progress-aware line. Nothing stands between the learner and Situation
 * 1: the fundamentals (building blocks, words, the sentence library, start-from-zero) live under
 * Basic words on Home, not here.
 */
export function Learn() {
  const learningLang = useAppStore((s) => s.learningLang);
  const startDay = useBootcampStore((s) => s.startDay);
  const readiness = useTravelReadiness();
  const missions = missionsFor(learningLang);
  const nextDay = readiness.allDone ? undefined : readiness.next?.day;
  const { ready, total, pct } = readiness;
  const progressLine = ready === 1 ? t('situationsProgressOne', { total }) : t('situationsProgress', { done: ready, total });

  return (
    <div className="screen screen-wide">
      <PageHeader title={t('learnTitle')} />
      <div className="screen-scroll">
        <div className="card situations-progress">
          <p className="situations-progress-text">{progressLine}</p>
          <span className="progress-track" role="progressbar" aria-valuenow={ready} aria-valuemin={0} aria-valuemax={total} aria-label={progressLine}>
            <span className="progress-fill brand" style={{ width: `${pct}%` }} />
          </span>
        </div>

        {/* The buddy: one short line about how far the learner has come — a note, not a chat box. */}
        <CompanionPresence compact />

        <div className="mission-grid situation-list">
          {BOOTCAMP_PLAN.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              icon={missionIcon(missions[m.day])}
              status={readiness.statusOf(m.day)}
              isNext={m.day === nextDay}
              onOpen={() => startDay(m.day)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
