import { L, t } from '../../shared/i18n/strings.js';
import { Icon } from '../../shared/ui/Icon.js';
import { tap } from '../../shared/ui/haptics.js';
import { missionNumber, type MissionPlan } from './plan.js';
import type { MissionStatus } from './readiness.js';

/**
 * One mission, as a compact card — the single presentation used wherever missions are listed (Learn,
 * Travel Readiness). Everything shown is real: number from plan order, title/objective/minutes from
 * the plan, status from stored progress. `isNext` marks THE one recommended mission.
 */
export function MissionCard({ mission, icon, status, isNext = false, onOpen }: {
  mission: MissionPlan;
  icon: string;
  status: MissionStatus;
  isNext?: boolean;
  onOpen: () => void;
}) {
  const unavailable = status === 'unavailable';
  const done = status === 'ready';
  return (
    <button
      className={`mcard card-press ${done ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}
      disabled={unavailable}
      onClick={() => { tap(); onOpen(); }}
    >
      <span className="mcard-num" aria-hidden>{done ? <Icon name="check" size={18} /> : missionNumber(mission.day)}</span>
      <span className="icon-tile" aria-hidden>{icon}</span>
      <span className="mcard-body">
        <span className="mcard-title">{L(mission.title)}</span>
        <span className="mcard-sub">{unavailable ? t('comingSoon') : L(mission.objective)}</span>
        {(isNext || mission.checkpoint || status === 'inProgress' || done) && (
          <span className="mcard-tags">
            {isNext && <span className="badge badge-next">{t('nextStepTitle')}</span>}
            {isNext && <span className="badge badge-notStarted"><Icon name="clock" size={13} />{t('aboutMinutes', { n: mission.minutes })}</span>}
            {!isNext && status === 'inProgress' && <span className="badge badge-inProgress">{t('statusInProgress')}</span>}
            {done && <span className="badge badge-ready">{t('statusReady')}</span>}
            {mission.checkpoint && <span className="badge badge-fading">{t('checkpointTag')}</span>}
          </span>
        )}
      </span>
      {!unavailable && <Icon name="chevron" size={20} flip />}
    </button>
  );
}
