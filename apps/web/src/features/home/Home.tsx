import { useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { useSessionStore } from '../../shared/stores/sessionStore.js';
import { Badge } from '../../shared/ui/Badge.js';

/** Home / Mission Control (PDF §10.3): the whole app in one glance. */
export function Home() {
  const app = useAppStore();
  const buildSession = useSessionStore((s) => s.build);
  const readiness = useMemo(() => app.readiness(), [app]);
  const days = app.daysLeft();
  const plan = app.plan;

  const today = new Date().toISOString().slice(0, 10);
  const dayIndex = plan ? plan.days.findIndex((d) => d.date.slice(0, 10) === today) : -1;
  const focusName =
    dayIndex >= 0 && plan
      ? app.situationById.get(plan.days[dayIndex]?.focusSituationId ?? '')?.name
      : undefined;
  const departed = plan ? Date.parse(plan.departureAt) < Date.now() : false;

  const startSession = (preset: 'full' | 'five') => {
    buildSession(preset);
    app.navigate('session');
  };

  return (
    <div className="screen">
      <div className="screen-scroll">
        <div className="topbar">
          <h1>READY</h1>
          <button className="btn-ghost" onClick={() => app.navigate('plan')} aria-label="Plan and settings">
            ⚙︎
          </button>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          {departed ? (
            <>
              <p className="countdown">In trip</p>
              <p className="dim">Refresh any situation in 2 minutes from the Phrasebook.</p>
            </>
          ) : (
            <>
              <p className="countdown">{days}</p>
              <p className="dim">{days === 1 ? 'day' : 'days'} until departure</p>
            </>
          )}
        </div>

        <div className="card">
          <h3>Today’s session</h3>
          <p style={{ margin: '8px 0' }}>
            {dayIndex >= 0 && plan ? `Day ${dayIndex + 1} of ${plan.days.length}` : 'Training'}
            {focusName ? ` · ${focusName}` : ''} · {plan?.minutesPerDay ?? 30} min
          </p>
        </div>

        <h3 style={{ margin: '16px 0 8px' }}>Readiness</h3>
        {readiness.map((r) => {
          const s = app.situationById.get(r.situationId);
          if (!s) return null;
          return (
            <button key={r.situationId} className="situation-row" onClick={() => app.navigate('readiness')}>
              <span>{s.name}</span>
              <Badge state={r.state} />
            </button>
          );
        })}
      </div>

      <div className="action-zone">
        <button className="btn-primary" onClick={() => startSession('full')}>
          Start today’s session
        </button>
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => startSession('five')}>
            I have 5 minutes
          </button>
          <button className="btn-danger-soft" onClick={() => app.navigate('emergency')}>
            Emergency Card
          </button>
        </div>
        <button className="btn-ghost" onClick={() => app.navigate('phrasebook')}>
          Phrasebook
        </button>
      </div>
    </div>
  );
}
