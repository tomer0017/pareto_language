import { useMemo, useState } from 'react';
import type { SituationPriority } from '@ready/content-schema';
import { selectTier, DAY_MS } from '@ready/engine';
import { useAppStore } from '../../shared/stores/appStore.js';
import { LEARNING_LANGUAGES, UI_LANGUAGES, isSelectableLanguage, languageBadge, languageInfo, languageName } from '../../shared/i18n/languages.js';
import { L, t, uiLangCode } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { CompanionHello } from '../companion/Companion.js';

/** A flag for each app language on the entry screen. */
const ENTRY_FLAGS: Record<string, string> = { en: '🇺🇸', he: '🇮🇱' };

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
  // Very first launch: the app must not assume the user reads English. Ask for the app language
  // before anything else (Task 3). Once chosen (ready.uiLang set), this step never shows again.
  const [askAppLang, setAskAppLang] = useState(() => localStorage.getItem('ready.uiLang') === null);

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
    // Step 1 (first launch only): choose the app language before the learning language (Task 3).
    if (askAppLang) {
      // The first thing a new learner sees: a classroom where a language is being taught, READY, a
      // warm line, and one choice. Tapping a language switches the whole screen to it at once.
      const chosen = uiLangCode();
      return (
        <div className="entry fade-in">
          <div className="entry-hero" aria-hidden>
            <img src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/onboarding/classroom.jpg`} alt="" draggable={false} />
          </div>
          <div className="entry-sheet">
            <span className="brand-mark entry-brand">READY <Icon name="plane" size={26} /></span>
            <h1>{t('entryTitle')}</h1>
            <p className="dim entry-sub">{t('entrySub')}</p>
            <p className="entry-choose" id="entry-choose">{t('entryChoose')}</p>
            <div className="entry-langs" role="radiogroup" aria-labelledby="entry-choose">
              {UI_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  role="radio"
                  aria-checked={l.code === chosen}
                  className={`entry-lang ${l.code === chosen ? 'is-selected' : ''}`}
                  onClick={() => { tap(); app.setUiLang(l.code); }}
                >
                  <span className="entry-flag" aria-hidden>{ENTRY_FLAGS[l.code] ?? '🌍'}</span>
                  <span className="entry-lang-name" lang={l.code} dir={l.dir}>{l.nativeName}</span>
                  <Icon name={l.code === chosen ? 'check' : 'chevron'} size={20} flip={l.code !== chosen} />
                </button>
              ))}
            </div>
            <button className="btn-primary btn-icon" onClick={() => { tap(); app.setUiLang(chosen); setAskAppLang(false); }}>
              {t('continue')}<Icon name="arrow" size={20} flip />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="screen">
        <div className="screen-scroll no-nav fade-in">
          {/* The buddy says hello before anything is asked of the learner. */}
          <CompanionHello />
          <h1 style={{ textAlign: 'center' }}>{t('pilotWelcomeTitle')}</h1>
          <p className="dim center" style={{ margin: '8px 0 20px' }}>{t('pilotWelcomeSub')}</p>
          <p className="drill-label" style={{ marginBottom: 10 }}>{t('pilotLanguageLabel')}</p>
          {/* The same readiness model as the in-app picker: a READY language is a real button and can
              be chosen right here, on the very first run. */}
          <div className="lang-grid stagger" role="radiogroup" aria-label={t('pilotLanguageLabel')}>
            {LEARNING_LANGUAGES.map((l) => {
              const badge = languageBadge(l.code);
              const selectable = isSelectableLanguage(l.code);
              const selected = l.code === app.learningLang;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!selectable}
                  className={`lang-card ${selectable ? 'card-press' : 'locked'} ${selected ? 'selected' : ''}`}
                  onClick={() => { if (!selectable) return; tap(); void app.setLearningLang(l.code); }}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <span className="lang-native" style={{ color: l.accent }}>{languageName(l.code)}</span>
                  {badge === 'comingSoon' && <span className="badge badge-notStarted">{t('comingSoon')}</span>}
                  {badge === 'earlyAccess' && <span className="badge badge-ready">{t('earlyAccess')}</span>}
                  {badge === 'ready' && <span className="badge badge-ready">{t('ready')}</span>}
                </button>
              );
            })}
          </div>
          <p className="faint small" style={{ marginTop: 14 }}>{t('moreLanguagesSoon')}</p>
        </div>
        <div className="action-zone">
          <button
            className="btn-primary breathe"
            onClick={() => {
              tap();
              localStorage.setItem('ready.entered', '1');
              app.navigate('home');
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
                  className={`lang-card card-press ${l.code === app.learningLang ? 'selected' : ''} ${isSelectableLanguage(l.code) ? '' : 'locked'}`}
                  disabled={!isSelectableLanguage(l.code)}
                  onClick={() => {
                    if (!isSelectableLanguage(l.code)) return;
                    tap();
                    void app.setLearningLang(l.code);
                  }}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <span className="lang-native" style={{ color: l.accent }}>{languageName(l.code)}</span>
                  {languageBadge(l.code) === 'comingSoon' && <span className="badge badge-notStarted">{t('comingSoon')}</span>}
                  {languageBadge(l.code) === 'earlyAccess' && <span className="badge badge-ready">{t('earlyAccess')}</span>}
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
