import { useMemo, useState } from 'react';
import { confidencePct, useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { Badge } from '../../shared/ui/Badge.js';
import { Ring } from '../../shared/ui/Ring.js';
import { playItem } from '../../shared/audio/tts.js';

const SITUATION_ICONS: Record<string, string> = {
  utensils: '🍝', train: '🚕', bag: '🛍️', compass: '🧭', bed: '🏨',
  chat: '💬', plane: '✈️', alert: '🚨', cross: '💊', wifi: '📶',
};

/**
 * Situations — the Travel Confidence board. Answers "what am I already confident doing?"
 * (PDF §10.4 honest states) with tap-through detail per situation.
 */
export function Situations() {
  const app = useAppStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const snapshots = useMemo(() => app.readiness(), [app]);  

  if (openId) {
    const s = app.situationById.get(openId);
    const snap = snapshots.find((x) => x.situationId === openId);
    if (!s || !snap) return null;
    return (
      <div className="screen">
        <div className="topbar">
          <button className="btn-ghost" onClick={() => setOpenId(null)}>←</button>
          <h2 style={{ margin: 0 }}>{s.name}</h2>
          <span style={{ width: 44 }} />
        </div>
        <div className="screen-scroll">
          <div className="card card-accent center fade-in">
            <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
              <Ring pct={confidencePct(snap)} size={72} />
              <Badge state={snap.state} />
              <p className="dim small">
                {snap.detail.phrasesSolid}/{snap.detail.phrasesTotal} {t('solid')} ·{' '}
                {Math.round(snap.detail.repliesPct * 100)}% 👂 ·{' '}
                {snap.detail.simulatorDone ? t('scenarioDone') : t('scenarioPending')}
              </p>
              <p className="faint small">{t('projectedRecall', { n: Math.round(snap.projectedAtDeparture * 100) })}</p>
              {snap.state === 'fading' && (
                <p className="small" style={{ color: 'var(--warn)' }}>{t('refresh5')}</p>
              )}
            </div>
          </div>
          <div className="card">
            {s.corePhraseIds.map((id) => {
              const item = app.itemsById.get(id);
              if (!item) return null;
              const level = app.states.get(id)?.level ?? 0;
              return (
                <div className="list-row" key={id}>
                  <div>
                    <p style={{ fontWeight: 700 }}>
                      {item.text} {level >= 2 && <span style={{ color: 'var(--good)' }}>✓</span>}
                    </p>
                    <p className="dim small">{item.meaning}</p>
                  </div>
                  <button className="btn-ghost" onClick={() => void playItem(item)} aria-label={t('play')}>🔊</button>
                </div>
              );
            })}
          </div>
          {s.cultureTips.length > 0 && (
            <div className="card card-sunken">
              {s.cultureTips.map((tip) => (
                <p className="small dim" key={tip}>💡 {tip}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 style={{ marginBottom: 12 }}>{t('situations')}</h1>
      <div className="screen-scroll">
        <div className="conf-grid stagger">
          {snapshots.map((snap) => {
            const s = app.situationById.get(snap.situationId);
            if (!s) return null;
            const cls = snap.state === 'ready' ? 'is-ready' : snap.state === 'fading' ? 'is-fading' : '';
            return (
              <button key={snap.situationId} className={`conf-card card-press ${cls}`} onClick={() => setOpenId(snap.situationId)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="conf-icon">{SITUATION_ICONS[s.icon] ?? '📍'}</span>
                  <Ring pct={confidencePct(snap)} color={snap.state === 'fading' ? 'var(--warn)' : snap.state === 'ready' ? 'var(--good)' : 'var(--accent)'} />
                </div>
                <span className="conf-name">{s.name}</span>
                <Badge state={snap.state} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
