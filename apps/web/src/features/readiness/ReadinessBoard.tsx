import { useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { Badge } from '../../shared/ui/Badge.js';
import { TopBar } from '../../shared/ui/TopBar.js';
import { isPhraseSolid } from '@ready/engine';

/** Readiness Board (PDF §10.3/§10.4): honest per-situation detail, incl. Fading repair. */
export function ReadinessBoard() {
  const app = useAppStore();
  const snapshots = useMemo(() => app.readiness(), [app]);

  return (
    <div className="screen">
      <TopBar title="Readiness" />
      <div className="screen-scroll">
        {snapshots.map((snap) => {
          const s = app.situationById.get(snap.situationId);
          if (!s) return null;
          const fadingItems = s.corePhraseIds.filter((id) => {
            const st = app.states.get(id);
            return st !== undefined && !isPhraseSolid(st);
          }).length;
          return (
            <div className="card" key={snap.situationId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>{s.name}</h2>
                <Badge state={snap.state} />
              </div>
              <p className="dim small" style={{ marginTop: 8 }}>
                {snap.detail.phrasesSolid} of {snap.detail.phrasesTotal} phrases solid ·{' '}
                {Math.round(snap.detail.repliesPct * 100)}% replies understood ·{' '}
                {snap.detail.simulatorDone ? 'simulator done' : 'simulator pending'}
              </p>
              {snap.state === 'fading' && (
                <p className="small" style={{ color: 'var(--warn)', marginTop: 6 }}>
                  {fadingItems} phrase{fadingItems === 1 ? '' : 's'} got rusty — a 5-minute session
                  polishes them.
                </p>
              )}
              <p className="dim small" style={{ marginTop: 4 }}>
                Projected recall at departure: {Math.round(snap.projectedAtDeparture * 100)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
