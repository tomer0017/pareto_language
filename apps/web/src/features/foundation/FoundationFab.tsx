import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { useFoundationStore } from './foundationStore.js';

/**
 * The 🛟 Foundation floating action button — always accessible inside the Bootcamp (mounted by the
 * app shell, gated by `shouldShowFoundationFab`), never part of the mission list. One tap opens the
 * Foundation sheet: the Pareto "grab the missing building block and keep going" surface.
 */
export function FoundationFab() {
  const openSheet = useFoundationStore((s) => s.openSheet);
  return (
    <button
      className="foundation-fab"
      aria-label={t('foundationTitle')}
      onClick={() => { tap(); openSheet(); }}
    >
      🛟
    </button>
  );
}
