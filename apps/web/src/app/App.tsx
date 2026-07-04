import { useEffect } from 'react';
import { useAppStore } from '../shared/stores/appStore.js';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary.js';
import { Onboarding } from '../features/onboarding/Onboarding.js';
import { Home } from '../features/home/Home.js';
import { SessionPlayer } from '../features/session/SessionPlayer.js';
import { ReadinessBoard } from '../features/readiness/ReadinessBoard.js';
import { Phrasebook } from '../features/phrasebook/Phrasebook.js';
import { EmergencyCard } from '../features/emergency/EmergencyCard.js';
import { PlanSettings } from '../features/plan/PlanSettings.js';

export function App() {
  const { view, loading, fatalError, init } = useAppStore();

  useEffect(() => {
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <p className="dim">READY</p>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div className="error-box">
          <p>{fatalError}</p>
          <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => void init()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  switch (view) {
    case 'onboarding':
      return (
        <ErrorBoundary feature="Onboarding">
          <Onboarding />
        </ErrorBoundary>
      );
    case 'session':
      return (
        <ErrorBoundary feature="Session">
          <SessionPlayer />
        </ErrorBoundary>
      );
    case 'readiness':
      return (
        <ErrorBoundary feature="Readiness">
          <ReadinessBoard />
        </ErrorBoundary>
      );
    case 'phrasebook':
      return (
        <ErrorBoundary feature="Phrasebook">
          <Phrasebook />
        </ErrorBoundary>
      );
    case 'emergency':
      return (
        <ErrorBoundary feature="Emergency Card">
          <EmergencyCard />
        </ErrorBoundary>
      );
    case 'plan':
      return (
        <ErrorBoundary feature="Plan">
          <PlanSettings />
        </ErrorBoundary>
      );
    case 'home':
    default:
      return (
        <ErrorBoundary feature="Home">
          <Home />
        </ErrorBoundary>
      );
  }
}
