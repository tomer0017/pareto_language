import { useEffect } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { useFoundationStore } from './foundationStore.js';

/**
 * The 🛟 Foundation floating action button — always accessible inside the Bootcamp (mounted by the
 * app shell, gated by `shouldShowFoundationFab`), never part of the mission list. One tap opens the
 * Foundation sheet. After onboarding it briefly pulses (store `pulse`) to reveal where it lives.
 */
export function FoundationFab() {
  const openSheet = useFoundationStore((s) => s.openSheet);
  const pulse = useFoundationStore((s) => s.pulse);
  const clearPulse = useFoundationStore((s) => s.clearPulse);

  useEffect(() => {
    if (!pulse) return;
    const id = setTimeout(clearPulse, 2600); // matches the pulse animation length
    return () => clearTimeout(id);
  }, [pulse, clearPulse]);

  return (
    <button
      className={`foundation-fab ${pulse ? 'foundation-fab-pulse' : ''}`}
      aria-label={t('foundationTitle')}
      onClick={() => { tap(); openSheet(); }}
    >
      🛟
    </button>
  );
}
