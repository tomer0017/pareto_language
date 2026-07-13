import { useEffect } from 'react';
import { useAppStore, type View } from '../shared/stores/appStore.js';
import { shouldShowNav, shouldShowFoundationFab } from './nav.js';
import { t } from '../shared/i18n/strings.js';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary.js';
import { BottomNav } from '../shared/ui/BottomNav.js';
import { AudioDebug } from '../shared/ui/AudioDebug.js';
import { DataDebug } from '../shared/ui/DataDebug.js';
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
import { Home } from '../features/home/Home.js';
import { Core } from '../features/core/Core.js';
import { Profile } from '../features/profile/Profile.js';
import { Videos } from '../features/videos/Videos.js';
import { FoundationFab } from '../features/foundation/FoundationFab.js';
import { FoundationSheet } from '../features/foundation/FoundationSheet.js';
import { useBootcampStore } from '../features/bootcamp/bootcampStore.js';


// Views that render shipped content-pack material. During the English pilot no pack ships, so
// these gate to an honest "coming soon" instead of showing Italian content or crashing on a
// null pack. The Bootcamp (the pilot), the language screen and onboarding never gate.
const PACK_GATED: View[] = ['mission', 'words', 'phrases', 'situations', 'practice', 'session', 'emergency', 'plan'];

/** Honest placeholder for content surfaces not yet rebuilt for the English pilot. */
function ComingSoon() {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div className="drill-card pop-in center">
        <p style={{ fontSize: '2.6rem' }}>🚧</p>
        <p className="drill-phrase" style={{ fontSize: '1.35rem' }}>{t('comingSoonTitle')}</p>
        <p className="drill-meaning">{t('comingSoonBody')}</p>
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={() => navigate('bootcamp')}>{t('backToBootcamp')}</button>
      </div>
    </div>
  );
}

const SCREENS: Partial<Record<View, { feature: string; el: () => JSX.Element | null }>> = {
  onboarding: { feature: 'Onboarding', el: Onboarding },
  home: { feature: 'Home', el: Home },
  core: { feature: 'Core', el: Core },
  profile: { feature: 'Profile', el: Profile },
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
  videos: { feature: 'Videos', el: Videos },
};

export function App() {
  const { view, loading, fatalError, init, pack } = useAppStore();
  const inMission = useBootcampStore((s) => s.activeDay !== null);
  const coreGameActive = useAppStore((s) => s.coreGameActive);

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

  // Pilot: content-pack screens gate to "coming soon" until an English pack ships.
  if (!pack && PACK_GATED.includes(view)) {
    return (
      <ErrorBoundary feature="ComingSoon">
        <ComingSoon />
      </ErrorBoundary>
    );
  }

  const screen = SCREENS[view] ?? SCREENS.home;
  if (!screen) return null;
  const Screen = screen.el;

  const showNav = shouldShowNav(view, inMission, coreGameActive);
  const showFoundation = shouldShowFoundationFab(view, inMission);

  return (
    <>
      <ErrorBoundary feature={screen.feature}>
        <Screen />
      </ErrorBoundary>
      {showFoundation && (
        <ErrorBoundary feature="Foundation">
          <FoundationFab />
        </ErrorBoundary>
      )}
      <ErrorBoundary feature="Foundation">
        <FoundationSheet />
      </ErrorBoundary>
      {showNav && <BottomNav />}
      {import.meta.env.DEV && (
        <ErrorBoundary feature="DevDiagnostics">
          <AudioDebug />
          <DataDebug />
        </ErrorBoundary>
      )}
    </>
  );
}
