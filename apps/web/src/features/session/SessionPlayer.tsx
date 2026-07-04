import { useEffect, useState } from 'react';
import type { Outcome, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../shared/stores/appStore.js';
import { useSessionStore } from '../../shared/stores/sessionStore.js';
import { SwipeCard } from './modes/SwipeCard.js';
import { FlashRecall } from './modes/FlashRecall.js';
import { Echo } from './modes/Echo.js';
import { Listen } from './modes/Listen.js';
import { NumberSprint } from './modes/NumberSprint.js';
import { Simulator } from './modes/Simulator.js';

/**
 * Session Player (PDF §10.3): one consistent interaction shell — card center, primary action
 * bottom, progress dots top — hosting all modes. Warm-up → Learn → Integrate → Close (§10.2).
 */
export function SessionPlayer() {
  const app = useAppStore();
  const session = useSessionStore();
  const [phase, setPhase] = useState<'drill' | 'simulator' | 'close'>('drill');
  const [summary, setSummary] = useState<string[]>([]);

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
    void session.submit(outcome, extras);
  };

  const exit = () => {
    session.reset();
    app.navigate('home');
  };

  const BLOCK_LABEL = { warmup: 'Warm-up', learn: 'Learn', integrate: 'Integrate' } as const;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" onClick={phase === 'close' ? exit : () => void closeSession()}>
          {phase === 'close' ? 'Home' : 'End early'}
        </button>
        <span className="dim small">{step ? BLOCK_LABEL[step.block] : phase === 'simulator' ? 'Integrate' : 'Close'}</span>
        <span style={{ width: 64 }} />
      </div>

      <div className="progress-dots" aria-hidden>
        {session.steps.slice(0, 60).map((_, i) => (
          <span key={i} className={`dot ${i < session.index ? 'done' : i === session.index ? 'now' : ''}`} />
        ))}
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
        <div className="fade-in">
          <div className="drill-card" style={{ minHeight: 200 }}>
            <p className="drill-prompt-label">Session complete</p>
            {summary.map((line, i) => (
              <p key={i} className={i === 0 ? 'drill-meaning' : 'dim small'}>
                {line}
              </p>
            ))}
            <p className="dim small">{app.daysLeft()} days to departure.</p>
          </div>
          <div className="action-zone">
            <button className="btn-primary" onClick={exit}>
              Done
            </button>
          </div>
        </div>
      )}

      {phase === 'drill' && !step && !session.simulatorSituation && (
        <div className="drill-card" style={{ minHeight: 160 }}>
          <p className="drill-meaning">Nothing due right now — you’re on plan.</p>
        </div>
      )}
    </div>
  );
}
