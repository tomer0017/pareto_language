import { useEffect, useState } from 'react';
import type { Outcome, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../shared/stores/appStore.js';
import { useSessionStore } from '../../shared/stores/sessionStore.js';
import { t } from '../../shared/i18n/strings.js';
import { CheckPop } from '../../shared/ui/CheckPop.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { SwipeCard } from './modes/SwipeCard.js';
import { FlashRecall } from './modes/FlashRecall.js';
import { Echo } from './modes/Echo.js';
import { Listen } from './modes/Listen.js';
import { NumberSprint } from './modes/NumberSprint.js';
import { Simulator } from './modes/Simulator.js';

/**
 * Session Player — one consistent interaction shell for all modes (PDF §10.3): progress on top,
 * card in the center, actions in the thumb zone. Passing feels satisfying (check pop + haptic);
 * failing feels like information, not punishment.
 */
export function SessionPlayer() {
  const app = useAppStore();
  const session = useSessionStore();
  const [phase, setPhase] = useState<'drill' | 'simulator' | 'close'>('drill');
  const [summary, setSummary] = useState<string[]>([]);
  const [checkTrigger, setCheckTrigger] = useState(0);

  const step = session.current();

  useEffect(() => {
    if (phase !== 'drill') return;
    if (step === null) {
      if (session.simulatorSituation) setPhase('simulator');
      else void closeSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);

  const closeSession = async () => {
    setSummary(session.capabilitySummary());
    await session.finish();
    setPhase('close');
  };

  const submit = (outcome: Outcome, extras?: Partial<ReviewEvent>) => {
    if (outcome === 'pass') {
      success();
      setCheckTrigger((n) => n + 1);
    } else {
      tap();
    }
    void session.submit(outcome, extras);
  };

  const exit = () => {
    session.reset();
    app.navigate(session.isPractice ? 'practice' : 'mission');
  };

  const BLOCK_LABEL = { warmup: t('warmup'), learn: t('learn'), integrate: t('integrate') } as const;
  const progressPct = session.steps.length > 0 ? Math.round((session.index / session.steps.length) * 100) : 0;

  return (
    <div className="screen">
      <CheckPop trigger={checkTrigger} />
      <div className="topbar">
        <button className="btn-ghost" onClick={phase === 'close' ? exit : () => void closeSession()}>
          {phase === 'close' ? t('home') : t('endEarly')}
        </button>
        <span className="chip">
          {step ? BLOCK_LABEL[step.block] : phase === 'simulator' ? t('integrate') : t('closeBlock')}
        </span>
        <span style={{ width: 44 }} />
      </div>

      <div className="progress-track" aria-hidden style={{ marginBottom: 6 }}>
        <div className="progress-fill brand" style={{ width: `${phase === 'close' ? 100 : progressPct}%` }} />
      </div>

      {phase === 'drill' && step && (
        <div className="fade-in" key={`${step.item.id}-${session.index}`}>
          {step.mode === 'swipe' && <SwipeCard item={step.item} onDone={submit} />}
          {step.mode === 'flashRecall' && <FlashRecall item={step.item} onDone={submit} />}
          {step.mode === 'echo' && <Echo item={step.item} onDone={submit} />}
          {step.mode === 'listen' && <Listen item={step.item} onDone={submit} />}
          {step.mode === 'numberSprint' && (
            <NumberSprint
              onFinish={(events) => {
                void session.recordExtraEvents(events).then(() => session.skipStep());
              }}
            />
          )}
          {step.mode === 'simulator' && session.simulatorSituation && (
            <Simulator
              situation={session.simulatorSituation}
              onFinish={(events) => {
                void session.recordExtraEvents(events).then(() => session.skipStep());
              }}
            />
          )}
        </div>
      )}

      {phase === 'simulator' && session.simulatorSituation && (
        <Simulator
          situation={session.simulatorSituation}
          onFinish={(events) => {
            void session.recordExtraEvents(events).then(() => void closeSession());
          }}
        />
      )}

      {phase === 'close' && (
        <div className="pop-in">
          <div className="drill-card" style={{ minHeight: 220 }}>
            <p className="drill-label">{t('sessionComplete')}</p>
            <p style={{ fontSize: '2.6rem' }}>🏁</p>
            {summary.map((line, i) => (
              <p key={i} className={i === 0 ? 'drill-meaning' : 'faint small'}>
                {line}
              </p>
            ))}
            <p className="faint small">
              ✈ {app.daysLeft()} {app.daysLeft() === 1 ? t('dayToGo') : t('daysToGo')}
            </p>
          </div>
          <div className="action-zone">
            <button className="btn-primary" onClick={exit}>
              {t('done')}
            </button>
          </div>
        </div>
      )}

      {phase === 'drill' && !step && !session.simulatorSituation && (
        <div className="drill-card" style={{ minHeight: 160 }}>
          <p className="drill-meaning">{t('nothingDue')}</p>
        </div>
      )}
    </div>
  );
}
