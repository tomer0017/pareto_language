import { useAppStore, type View } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { ChoiceCard } from '../../shared/ui/ChoiceCard.js';
import { Icon } from '../../shared/ui/Icon.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { useBootcampStore } from '../bootcamp/bootcampStore.js';
import { useTravelReadiness } from '../bootcamp/useReadiness.js';
import { CompanionPeek } from '../companion/Companion.js';

/**
 * Home — where am I, and what can I do? Nothing else. Read top to bottom:
 *
 *   READY ✈️
 *   the two languages in play        ("I speak: Hebrew · I'm learning: Spanish")
 *   ONE progress number              (situations completed ÷ the plan — the one progress model)
 *   FOUR ways to learn               Basic words · Situations · Games & stories · Quick listening
 *
 * Each choice opens a surface that already exists (the fundamentals, the 30-situation journey, the
 * free-practice hub, the listening hub) — Home owns no content and no state of its own. Every
 * deeper tool (reviews, players, libraries) lives one step further in, never here.
 */
export function Home() {
  const navigate = useAppStore((s) => s.navigate);
  const setListenPage = useAppStore((s) => s.setListenPage);
  const exitMission = useBootcampStore((s) => s.exit);
  const readiness = useTravelReadiness();
  const pct = readiness.pct;

  const go = (view: View): void => {
    // Each choice opens its area's own first screen: the list of situations (never inside a mission
    // left open earlier), the listening hub's four modes (never inside a player).
    if (view === 'bootcamp') exitMission();
    if (view === 'listen') setListenPage(null);
    navigate(view);
  };

  return (
    <div className="screen screen-wide home-screen">
      <div className="brand-top"><span className="brand-mark">READY <Icon name="plane" size={22} /></span></div>
      <LangStrip />
      <div className="screen-scroll">
        {/* ONE progress — no second metric competing with it. The buddy rides along, small. */}
        <div className="card home-progress">
          <span className="home-progress-text">
            <b className="home-progress-value" dir="ltr">{pct}%</b>
            <span>{t('homeProgressLabel')}</span>
          </span>
          <span className="progress-track home-progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t('homeProgressAria', { pct })}>
            <span className="progress-fill brand" style={{ width: `${pct}%` }} />
          </span>
          <CompanionPeek size={52} inline />
        </div>

        {/* The four ways to learn — the only choices on Home. */}
        <div className="choice-list home-choices" role="group" aria-label={t('homeChoicesAria')}>
          <ChoiceCard id="basics" icon="🔤" title={t('basicsTitle')} sub={t('basicsSub')} onSelect={() => go('basics')} />
          <ChoiceCard id="situations" icon="🎬" tone="accent" title={t('learnTitle')} sub={t('homeSituationsSub')} onSelect={() => go('bootcamp')} />
          <ChoiceCard id="games" icon="🎮" tone="warn" title={t('freeLearningTitle')} sub={t('freeLearningSub')} onSelect={() => go('free')} />
          <ChoiceCard id="listen" icon="🎧" tone="good" title={t('homeListenTitle')} sub={t('homeListenSub')} onSelect={() => go('listen')} />
        </div>
      </div>
    </div>
  );
}
