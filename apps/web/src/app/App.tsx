import { useEffect } from 'react';
import { useAppStore, type View } from '../shared/stores/appStore.js';
import { t } from '../shared/i18n/strings.js';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary.js';
import { BottomNav } from '../shared/ui/BottomNav.js';
import { AudioDebug } from '../shared/ui/AudioDebug.js';
import { Onboarding } from '../features/onboarding/Onboarding.js';
import { Mission } from '../features/mission/Mission.js';
import { Words } from '../features/phrasebook/Words.js';
import { Phrases } from '../features/phrasebook/Phrases.js';
import { Situations } from '../features/readiness/Situations.js';
import { PracticeHub } from '../features/practice/PracticeHub.js';
import { SessionPlayer } from '../features/session/SessionPlayer.js';
import { EmergencyCard } from '../features/emergency/EmergencyCard.js';
import { PlanSettings } from '../features/plan/PlanSettings.js';
import { LanguageSelect } from '../features/languages/LanguageSelect.js';
import { Bootcamp } from '../features/bootcamp/Bootcamp.js';

const TAB_VIEWS: View[] = ['mission', 'words', 'phrases', 'situations', 'practice'];

const SCREENS: Partial<Record<View, { feature: string; el: () => JSX.Element | null }>> = {
  onboarding: { feature: 'Onboarding', el: Onboarding },
  mission: { feature: 'Mission', el: Mission },
  words: { feature: 'Words', el: Words },
  phrases: { feature: 'Phrases', el: Phrases },
  situations: { feature: 'Situations', el: Situations },
  practice: { feature: 'Practice', el: PracticeHub },
  session: { feature: 'Session', el: SessionPlayer },
  emergency: { feature: 'Emergency Card', el: EmergencyCard },
  plan: { feature: 'Plan', el: PlanSettings },
  languages: { feature: 'Languages', el: LanguageSelect },
  bootcamp: { feature: 'Bootcamp', el: Bootcamp },
};

export function App() {
  const { view, loading, fatalError, init } = useAppStore();

  useEffect(() => {
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <p className="dim pop-in" style={{ fontWeight: 800, letterSpacing: '0.3em' }}>READY</p>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div className="error-box">
          <p>{t('loadError')}</p>
          <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => void init()}>
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const screen = SCREENS[view] ?? SCREENS.mission;
  if (!screen) return null;
  const Screen = screen.el;

  return (
    <>
      <ErrorBoundary feature={screen.feature}>
        <Screen />
      </ErrorBoundary>
      {TAB_VIEWS.includes(view) && <BottomNav />}
      {import.meta.env.DEV && (
        <ErrorBoundary feature="AudioDebug">
          <AudioDebug />
        </ErrorBoundary>
      )}
    </>
  );
}
