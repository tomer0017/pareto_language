import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { ProgressRing } from '../../shared/ui/ProgressRing.js';
import { BOOTCAMP_PLAN, missionNumber } from '../bootcamp/plan.js';
import { missionsFor, useBootcampStore } from '../bootcamp/bootcampStore.js';
import { missionIcon } from '../bootcamp/missionFlow.js';
import { useTravelReadiness } from '../bootcamp/useReadiness.js';
import { useSentenceProgress } from '../core/useSentenceProgress.js';
import { ZERO_LANGS } from '../zerostart/types.js';
import { useZeroStartStore } from '../zerostart/zeroStartStore.js';

/**
 * Home — the coach, not a menu. It answers one question: "what is the single best thing for me to
 * do now?" Four surfaces and nothing else:
 *
 *   1. Travel Readiness — real situations completed, out of the plan (never "% of a language").
 *   2. Your next step   — the one mission to continue or start.
 *   3. Quick review     — a few sentences from the learner's own practice log. Shown only once
 *                          there is something to review: an empty, disabled card is noise.
 *   4. Quick listen     — ten hands-free minutes.
 *
 * Every number is derived from stored progress. Settings, libraries and tools live in Learn, Listen
 * and Profile.
 */
export function Home() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const readiness = useTravelReadiness();
  const sentences = useSentenceProgress();
  const missions = missionsFor(app.learningLang);
  const reviewCount = sentences.reviewCards.length;

  const next = readiness.next;
  // A genuinely new learner (nothing done here, and the zero-beginner path untouched) gets one quiet
  // pointer to it — a suggestion, never a second primary action.
  const zeroDone = useZeroStartStore((s) => s.byLang[app.learningLang]?.done);
  const suggestZero = (ZERO_LANGS as readonly string[]).includes(app.learningLang)
    && (zeroDone?.length ?? 0) === 0 && readiness.ready === 0 && !readiness.nextIsResume;

  const openMission = (day: number): void => {
    tap();
    bc.startDay(day);
    app.navigate('bootcamp');
  };
  const quickListen = (): void => {
    tap();
    app.setListenIntent('quick');
    app.navigate('listen');
  };

  return (
    <div className="screen screen-wide">
      <div className="brand-top"><span className="brand-mark">READY <Icon name="plane" size={22} /></span></div>
      <LangStrip />
      <div className="only-desktop">
        <PageHeader title={t('homeGreeting')} sub={t('homeSub')} />
      </div>
      <div className="screen-scroll">
        <div className="home-grid">
          {/* 1 — Travel readiness */}
          <button className="card card-press readiness-card" onClick={() => { tap(); app.navigate('readiness'); }} aria-label={t('readinessOpen')}>
            <ProgressRing pct={readiness.pct} size={116} stroke={11} label={`${t('readinessTitle')} ${readiness.pct}%`}>
              <span className="ring-value">{readiness.pct}%</span>
              <span className="ring-caption">{t('readinessTitle')}</span>
            </ProgressRing>
            <span className="readiness-body">
              <strong style={{ display: 'block', fontSize: '1.3rem' }}>{t('readinessTitle')}</strong>
              <span className="dim small" style={{ display: 'block' }}>{t('readinessSub')}</span>
              <span className="stat-row good"><Icon name="check" size={18} />{t('readinessSituations', { done: readiness.ready, total: readiness.total })}</span>
              {sentences.practiced !== null && (
                <span className="stat-row"><Icon name="chat" size={18} />{t('readinessPhrases', { done: sentences.practiced, total: sentences.total })}</span>
              )}
            </span>
          </button>

          {/* 2 — The next step */}
          {next && (
            <section className="card next-card" aria-labelledby="home-next">
              <p className="eyebrow" id="home-next"><Icon name="flag" size={18} />{readiness.allDone ? t('allMissionsDone') : t('nextStepTitle')}</p>
              <div className="next-head">
                <span className="icon-tile icon-tile-brand icon-tile-lg" aria-hidden>{missionIcon(missions[next.day])}</span>
                <span style={{ minWidth: 0 }}>
                  <strong className="next-title">{L(next.title)}</strong>
                </span>
              </div>
              <p className="dim">{L(next.objective)}</p>
              <p className="meta-row">
                <span>{t('situationOf', { n: missionNumber(next.day) ?? next.day, total: BOOTCAMP_PLAN.length })}</span>
                <span><Icon name="clock" size={16} />{t('aboutMinutes', { n: next.minutes })}</span>
              </p>
              <button className="btn-primary btn-icon" onClick={() => openMission(next.day)}>
                {readiness.allDone ? t('replay') : readiness.nextIsResume ? t('continueLearning') : t('startLearning')}
                <Icon name="arrow" size={20} flip />
              </button>
              {suggestZero && (
                <button className="btn-link" onClick={() => { tap(); app.navigate('zerostart'); }}>{t('newHereZero')}</button>
              )}
            </section>
          )}

          {/* 3 — Quick review: only when the learner has practiced something worth refreshing. */}
          {reviewCount > 0 && (
          <section className="card quick-card" aria-labelledby="home-review">
            <div className="quick-head">
              <span className="icon-tile icon-tile-brand" aria-hidden><Icon name="repeat" /></span>
              <span>
                <h2 id="home-review">{t('quickReviewTitle')}</h2>
                <p className="dim small">{reviewCount === 1 ? t('quickReviewSubOne') : t('quickReviewSub', { n: reviewCount })}</p>
              </span>
            </div>
            <button className="btn-outline btn-icon" onClick={() => { tap(); app.navigate('review'); }}>
              <Icon name="repeat" size={18} />{t('quickReviewCta')}
            </button>
          </section>
          )}

          {/* 4 — Quick listen */}
          <section className={`card quick-card listen ${reviewCount > 0 ? '' : 'span-2'}`} aria-labelledby="home-listen">
            <div className="quick-head">
              <span className="icon-tile icon-tile-good" aria-hidden><Icon name="listen" /></span>
              <span>
                <h2 id="home-listen">{t('quickListenTitle')}</h2>
                <p className="dim small">{t('quickListenSub')}</p>
              </span>
            </div>
            <button className="btn-outline good btn-icon" onClick={quickListen}>
              <Icon name="play" size={18} />{t('quickListenCta')}
            </button>
          </section>

          <p className="encourage span-2">
            <Icon name="flag" size={20} />
            <span>
              {readiness.allDone
                ? t('readinessAllDone', { total: readiness.total })
                : t('readinessRemaining', { n: readiness.remaining })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
