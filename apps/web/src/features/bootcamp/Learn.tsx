import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { ProgressRing } from '../../shared/ui/ProgressRing.js';
import { useFoundationStore } from '../foundation/foundationStore.js';
import { ZERO_LANGS } from '../zerostart/types.js';
import { BOOTCAMP_PLAN, PHASES } from './plan.js';
import { missionsFor, useBootcampStore } from './bootcampStore.js';
import { missionIcon } from './missionFlow.js';
import { MissionCard } from './MissionCard.js';
import { useTravelReadiness } from './useReadiness.js';

/**
 * Learn — the real-world travel curriculum, and the ONE route to it. The plan's missions grouped by
 * its phases, with a small readiness summary and exactly one mission highlighted as the next step,
 * so a glance answers: where am I, what have I finished, what comes next.
 *
 * Supporting practice (the zero-beginner path, the Foundation building blocks, words, the sentence
 * library) sits below the curriculum in ordinary rows — useful, but never competing with it and
 * never floating over it.
 */
export function Learn() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const readiness = useTravelReadiness();
  const missions = missionsFor(app.learningLang);
  const openFoundation = useFoundationStore((s) => s.openSheet);
  const nextDay = readiness.allDone ? undefined : readiness.next?.day;
  const open = (view: 'zerostart' | 'core', category?: string): void => {
    tap();
    if (category) app.setCoreCategory(category);
    app.navigate(view);
  };

  return (
    <div className="screen screen-wide">
      <div className="brand-top"><span className="brand-mark">READY <Icon name="plane" size={22} /></span></div>
      <LangStrip />
      <PageHeader title={t('learnTitle')} sub={t('learnSub', { n: BOOTCAMP_PLAN.length })} />
      <div className="screen-scroll">
        <button className="card card-press summary-card" onClick={() => { tap(); app.navigate('readiness'); }} aria-label={t('readinessOpen')}>
          <ProgressRing pct={readiness.pct} size={68} stroke={8} label={`${t('readinessTitle')} ${readiness.pct}%`}>
            <span className="ring-value small">{readiness.pct}%</span>
          </ProgressRing>
          <span>
            <strong style={{ display: 'block', fontSize: '1.15rem' }}>{t('readinessTitle')}</strong>
            <span className="dim">{t('readinessSituations', { done: readiness.ready, total: readiness.total })}</span>
          </span>
          <Icon name="chevron" size={20} flip />
        </button>

        {PHASES.map((phase) => {
          const inPhase = BOOTCAMP_PLAN.filter((m) => m.phase === phase.n);
          if (inPhase.length === 0) return null;
          const done = inPhase.filter((m) => readiness.statusOf(m.day) === 'ready').length;
          return (
            <section key={phase.n} className="phase" aria-label={L(phase.title)}>
              <div className="phase-head">
                <span className="icon-tile icon-tile-brand" aria-hidden>{phase.icon}</span>
                <h2 className="phase-title">{L(phase.title)}</h2>
                <span className="phase-count">{t('phaseCount', { done, total: inPhase.length })}</span>
              </div>
              <div className="mission-grid">
                {inPhase.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    icon={missionIcon(missions[m.day])}
                    status={readiness.statusOf(m.day)}
                    isNext={m.day === nextDay}
                    onOpen={() => bc.startDay(m.day)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <div className="section-head"><h2>{t('morePractice')}</h2></div>
        <div className="support-grid">
          {(ZERO_LANGS as readonly string[]).includes(app.learningLang) && (
            <button className="link-row card-press" onClick={() => open('zerostart')}>
              <span className="icon-tile" aria-hidden>🌱</span>
              <span className="link-row-body"><span className="link-row-title">{t('homeZeroStart')}</span><span className="link-row-sub">{t('homeZeroStartSub')}</span></span>
              <Icon name="chevron" size={20} flip />
            </button>
          )}
          <button className="link-row card-press" onClick={() => { tap(); openFoundation(); }}>
            <span className="icon-tile" aria-hidden>🧱</span>
            <span className="link-row-body"><span className="link-row-title">{t('foundationTitle')}</span><span className="link-row-sub">{t('foundationEntrySub')}</span></span>
            <Icon name="chevron" size={20} flip />
          </button>
          <button className="link-row card-press" onClick={() => open('core', 'words')}>
            <span className="icon-tile" aria-hidden>📝</span>
            <span className="link-row-body"><span className="link-row-title">{t('homeLearnWords')}</span><span className="link-row-sub">{t('homeLearnWordsSub')}</span></span>
            <Icon name="chevron" size={20} flip />
          </button>
          <button className="link-row card-press" onClick={() => open('core', 'phrases')}>
            <span className="icon-tile" aria-hidden>💬</span>
            <span className="link-row-body"><span className="link-row-title">{t('phraseLibrary')}</span><span className="link-row-sub">{t('phraseLibrarySub')}</span></span>
            <Icon name="chevron" size={20} flip />
          </button>
        </div>
      </div>
    </div>
  );
}
