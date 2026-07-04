import { useMemo, useState } from 'react';
import type { SituationPriority } from '@ready/content-schema';
import { selectTier, DAY_MS } from '@ready/engine';
import { useAppStore } from '../../shared/stores/appStore.js';

/**
 * Onboarding — 60 seconds, zero friction, no account (PDF §10.1):
 * destination → date → minutes/day → rank situations → plan preview.
 */

const MINUTE_CHOICES = [10, 20, 30, 45];

export function Onboarding() {
  const { pack, createPlan } = useAppStore();
  const [step, setStep] = useState(0);
  const [departure, setDeparture] = useState(() =>
    new Date(Date.now() + 7 * DAY_MS).toISOString().slice(0, 10),
  );
  const [minutes, setMinutes] = useState(30);
  const [ranking, setRanking] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const situations = useMemo(() => pack?.situations ?? [], [pack]);
  const orderedRanking = ranking.length > 0 ? ranking : situations.map((s) => s.id);

  const departureAtIso = useMemo(() => {
    const d = new Date(`${departure}T09:00:00`);
    return d.toISOString();
  }, [departure]);

  const previewDays = Math.max(1, Math.ceil((Date.parse(departureAtIso) - Date.now()) / DAY_MS));
  const previewTier = pack ? selectTier(pack, previewDays, minutes) : 0;

  const moveUp = (id: string) => {
    const arr = [...orderedRanking];
    const i = arr.indexOf(id);
    if (i > 0) {
      const prev = arr[i - 1];
      const cur = arr[i];
      if (prev !== undefined && cur !== undefined) {
        arr[i - 1] = cur;
        arr[i] = prev;
      }
      setRanking(arr);
    }
  };

  const start = async () => {
    setSaving(true);
    setError(null);
    try {
      const priorities: SituationPriority[] = orderedRanking.map((situationId, rank) => ({
        situationId,
        rank,
      }));
      await createPlan({ departureAt: departureAtIso, minutesPerDay: minutes, situationPriorities: priorities });
    } catch (err) {
      console.error('[onboarding] createPlan failed', err);
      setError('Could not save your plan. Please try again.');
      setSaving(false);
    }
  };

  if (!pack) return null;

  return (
    <div className="screen">
      <div className="screen-scroll fade-in" key={step}>
        {step === 0 && (
          <>
            <h1>Where are you going?</h1>
            <p className="dim" style={{ margin: '8px 0 20px' }}>
              READY prepares you for real conversations before you land.
            </p>
            <div className="card">
              <h3>Destination</h3>
              <p style={{ fontSize: '1.3rem', marginTop: 6 }}>🇮🇹 Italy — Italian</p>
              <p className="small dim" style={{ marginTop: 6 }}>
                More languages arrive after the Italian pack is native-approved.
              </p>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h1>When do you fly?</h1>
            <p className="dim" style={{ margin: '8px 0 20px' }}>
              Your whole plan is built backwards from this date.
            </p>
            <input
              type="date"
              value={departure}
              min={new Date(Date.now() + DAY_MS).toISOString().slice(0, 10)}
              onChange={(e) => setDeparture(e.target.value)}
              aria-label="Departure date"
            />
          </>
        )}
        {step === 2 && (
          <>
            <h1>Minutes per day?</h1>
            <p className="dim" style={{ margin: '8px 0 20px' }}>
              Honest budgets beat heroic ones. You can change this later.
            </p>
            <div className="keypad">
              {MINUTE_CHOICES.map((m) => (
                <button
                  key={m}
                  className={m === minutes ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setMinutes(m)}
                >
                  {m} min
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1>What matters most?</h1>
            <p className="dim" style={{ margin: '8px 0 20px' }}>
              Tap ↑ to pull a situation earlier in your plan.
            </p>
            {orderedRanking.map((id, i) => {
              const s = situations.find((x) => x.id === id);
              if (!s) return null;
              return (
                <div className="situation-row" key={id}>
                  <span>
                    <span className="dim small">{i + 1}.</span> {s.name}
                  </span>
                  <button className="btn-ghost" onClick={() => moveUp(id)} aria-label={`Move ${s.name} up`}>
                    ↑
                  </button>
                </div>
              );
            })}
          </>
        )}
        {step === 4 && (
          <>
            <h1>Your plan</h1>
            <div className="card" style={{ marginTop: 16 }}>
              <p className="countdown">{previewDays} days</p>
              <p className="dim">until departure</p>
            </div>
            <div className="card">
              <p>
                <strong>{minutes} min/evening</strong> · Tier {previewTier}{' '}
                {previewTier === 0 ? '· Survival essentials' : '· Core 180'}
              </p>
              <p className="dim small" style={{ marginTop: 8 }}>
                Emergency phrases and politeness glue are front-loaded. The final two days
                consolidate — no cramming.
              </p>
            </div>
            {error && <div className="error-box">{error}</div>}
          </>
        )}
      </div>
      <div className="action-zone">
        {step < 4 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)}>
            Continue
          </button>
        ) : (
          <button className="btn-primary" onClick={start} disabled={saving}>
            {saving ? 'Building your plan…' : 'Start training'}
          </button>
        )}
        {step > 0 && (
          <button className="btn-ghost" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
