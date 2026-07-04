import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { TopBar } from '../../shared/ui/TopBar.js';

/** Plan & Settings (PDF §10.3): edit trip date/minutes; view the day-by-day plan. */
export function PlanSettings() {
  const app = useAppStore();
  const plan = app.plan;
  const [departure, setDeparture] = useState(plan ? plan.departureAt.slice(0, 10) : '');
  const [minutes, setMinutes] = useState(plan?.minutesPerDay ?? 30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!plan) return null;

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await app.updatePlanSettings({
        departureAt: new Date(`${departure}T09:00:00`).toISOString(),
        minutesPerDay: minutes,
        situationPriorities: plan.situationPriorities,
      });
      setSaved(true);
    } catch (err) {
      console.error('[plan] update failed', err);
      setError('Could not update the plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Plan & Settings" />
      <div className="screen-scroll">
        <div className="card">
          <h3>Departure date</h3>
          <input
            type="date"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            aria-label="Departure date"
            style={{ marginTop: 8 }}
          />
          <h3 style={{ marginTop: 16 }}>Minutes per day</h3>
          <div className="keypad" style={{ marginTop: 8 }}>
            {[10, 20, 30, 45].map((m) => (
              <button
                key={m}
                className={m === minutes ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setMinutes(m)}
              >
                {m} min
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={save} disabled={saving}>
            {saving ? 'Re-planning…' : 'Save & re-plan'}
          </button>
          {saved && (
            <p className="small" style={{ color: 'var(--accent)', marginTop: 8 }}>
              Plan updated. Scope adjusts honestly — core first, fringe dropped if needed.
            </p>
          )}
          {error && <div className="error-box" style={{ marginTop: 8 }}>{error}</div>}
        </div>

        <h3 style={{ margin: '16px 0 8px' }}>Day-by-day</h3>
        {plan.days.map((d, i) => {
          const focus = d.focusSituationId ? app.situationById.get(d.focusSituationId)?.name : null;
          return (
            <div className="list-row" key={d.date}>
              <span>
                Day {i + 1} <span className="dim small">{d.date.slice(0, 10)}</span>
              </span>
              <span className="dim small">
                {d.newItemIds.length > 0 ? `${d.newItemIds.length} new` : 'consolidate'}
                {focus ? ` · ${focus}` : ''}
              </span>
            </div>
          );
        })}
        <p className="dim small" style={{ marginTop: 12 }}>
          Plan v{plan.version} · Tier {plan.tier} · pack it-IT
        </p>
      </div>
    </div>
  );
}
