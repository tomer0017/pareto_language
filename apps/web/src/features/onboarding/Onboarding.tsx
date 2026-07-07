import { useMemo, useState } from 'react';
import type { SituationPriority } from '@ready/content-schema';
import { selectTier, DAY_MS } from '@ready/engine';
import { useAppStore } from '../../shared/stores/appStore.js';
import { LEARNING_LANGUAGES, languageInfo, PILOT_LANG } from '../../shared/i18n/languages.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';

const MINUTE_CHOICES = [10, 20, 30, 45];

/**
 * Onboarding — 60 seconds, zero friction, no account (PDF §10.1), now language-first:
 * trip language → date → minutes/day → rank situations → plan preview (the aha-moment).
 */
export function Onboarding() {
  const app = useAppStore();
  const [step, setStep] = useState(0);
  const [departure, setDeparture] = useState(() =>
    new Date(Date.now() + 7 * DAY_MS).toISOString().slice(0, 10),
  );
  const [minutes, setMinutes] = useState(30);
  const [ranking, setRanking] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const situations = useMemo(() => app.pack?.situations ?? [], [app.pack]);
  const orderedRanking = ranking.length > 0 ? ranking : situations.map((s) => s.id);
  const lang = languageInfo(app.learningLang);

  const departureAtIso = useMemo(() => new Date(`${departure}T09:00:00`).toISOString(), [departure]);
  const previewDays = Math.max(1, Math.ceil((Date.parse(departureAtIso) - Date.now()) / DAY_MS));
  const previewTier = app.pack ? selectTier(app.pack, previewDays, minutes) : 0;

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
      const priorities: SituationPriority[] = orderedRanking.map((situationId, rank) => ({ situationId, rank }));
      await app.createPlan({ departureAt: departureAtIso, minutesPerDay: minutes, situationPriorities: priorities });
    } catch (err) {
      console.error('[onboarding] createPlan failed', err);
      setError(t('planSaveError'));
      setSaving(false);
    }
  };

  // English pilot (Bootcamp-first): until a content pack ships, onboarding is a single honest
  // welcome — English is the pilot, the rest are coming soon — then it hands off to the Bootcamp.
  // The full trip-plan flow below is preserved for when a shipped pack makes it meaningful again.
  if (!app.pack) {
    return (
      <div className="screen">
        <div className="screen-scroll no-nav fade-in">
          <h1>{t('pilotWelcomeTitle')}</h1>
          <p className="dim" style={{ margin: '8px 0 20px' }}>{t('pilotWelcomeSub')}</p>
          <p className="drill-label" style={{ marginBottom: 10 }}>{t('pilotLanguageLabel')}</p>
          <div className="lang-grid stagger">
            {LEARNING_LANGUAGES.map((l) => (
              <div
                key={l.code}
                className={`lang-card ${l.code === PILOT_LANG ? 'selected' : 'locked'}`}
                aria-disabled={!l.available}
              >
                <span className="lang-flag">{l.flag}</span>
                <span className="lang-native" style={{ color: l.accent }}>{l.nativeName}</span>
                {l.available
                  ? <span className="badge badge-ready">{t('ready')}</span>
                  : <span className="badge badge-notStarted">{t('comingSoon')}</span>}
              </div>
            ))}
          </div>
          <p className="faint small" style={{ marginTop: 14 }}>{t('moreLanguagesSoon')}</p>
        </div>
        <div className="action-zone">
          <button
            className="btn-primary breathe"
            onClick={() => {
              tap();
              localStorage.setItem('ready.entered', '1');
              app.navigate('bootcamp');
            }}
          >
            {t('startPilot')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-scroll no-nav fade-in" key={step}>
        {step === 0 && (
          <>
            <h1>{t('chooseLanguage')}</h1>
            <p className="dim" style={{ margin: '8px 0 18px' }}>{t('chooseLanguageSub')}</p>
            <div className="lang-grid stagger">
              {LEARNING_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  className={`lang-card card-press ${l.code === app.learningLang ? 'selected' : ''} ${l.available ? '' : 'locked'}`}
                  onClick={() => {
                    if (!l.available) return;
                    tap();
                    void app.setLearningLang(l.code);
                  }}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <span className="lang-native" style={{ color: l.accent }}>{l.nativeName}</span>
                  {!l.available && <span className="badge badge-notStarted">{t('comingSoon')}</span>}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h1>{t('whenFly')}</h1>
            <p className="dim" style={{ margin: '8px 0 18px' }}>{t('whenFlySub')}</p>
            <input
              type="date"
              value={departure}
              min={new Date(Date.now() + DAY_MS).toISOString().slice(0, 10)}
              onChange={(e) => setDeparture(e.target.value)}
              aria-label={t('departureDate')}
            />
          </>
        )}
        {step === 2 && (
          <>
            <h1>{t('minutesQ')}</h1>
            <p className="dim" style={{ margin: '8px 0 18px' }}>{t('minutesSub')}</p>
            <div className="keypad">
              {MINUTE_CHOICES.map((m) => (
                <button key={m} className={m === minutes ? 'btn-accent' : 'btn-secondary'} onClick={() => setMinutes(m)}>
                  {m} {t('min')}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h1>{t('rankQ')}</h1>
            <p className="dim" style={{ margin: '8px 0 18px' }}>{t('rankSub')}</p>
            {orderedRanking.map((id, i) => {
              const s = situations.find((x) => x.id === id);
              if (!s) return null;
              return (
                <div className="card" key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginBottom: 8 }}>
                  <span>
                    <span className="faint small">{i + 1}.</span> <strong>{L(s.name)}</strong>
                  </span>
                  <button className="btn-ghost" onClick={() => moveUp(id)} aria-label={`↑ ${s.name}`}>
                    ↑
                  </button>
                </div>
              );
            })}
          </>
        )}
        {step === 4 && (
          <>
            <h1>{t('yourPlan')}</h1>
            <div className="card card-accent center pop-in" style={{ marginTop: 16 }}>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent)' }}>
                {lang.flag} {previewDays}
              </p>
              <p className="dim">{previewDays === 1 ? t('dayToGo') : t('daysToGo')}</p>
            </div>
            <div className="card">
              <p>
                <strong>{minutes} {t('min')}/day</strong> ·{' '}
                {previewTier === 0 ? t('coverageSurvival') : t('coverageCore')}
              </p>
              <p className="dim small" style={{ marginTop: 8 }}>{t('planPreviewNote')}</p>
            </div>
            {error && <div className="error-box">{error}</div>}
          </>
        )}
      </div>
      <div className="action-zone">
        {step < 4 ? (
          <button className="btn-primary" onClick={() => setStep(step + 1)}>
            {t('continue')}
          </button>
        ) : (
          <button className="btn-primary breathe" onClick={start} disabled={saving}>
            {saving ? t('buildingPlan') : t('startTraining')}
          </button>
        )}
        {step > 0 && (
          <button className="btn-ghost" onClick={() => setStep(step - 1)}>
            {t('back')}
          </button>
        )}
      </div>
    </div>
  );
}
