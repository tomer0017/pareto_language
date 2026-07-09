import { t } from '../i18n/strings.js';
import { useAppStore, type View } from '../stores/appStore.js';
import { useBootcampStore } from '../../features/bootcamp/bootcampStore.js';
import { tap } from './haptics.js';

/**
 * The permanent English-pilot navigation — always one tap from the four homes, so the learner
 * never depends on the browser Back button. Native feel: floating pill, large targets, safe-area
 * aware, RTL-mirrored automatically by flex. Four tabs, nothing else (20/80).
 */
const TABS: { view: View; icon: string; key: 'homeTab' | 'bootcampTab' | 'coreTab' | 'profileTab' }[] = [
  { view: 'home', icon: '🏠', key: 'homeTab' },
  { view: 'bootcamp', icon: '🎯', key: 'bootcampTab' },
  { view: 'core', icon: '🧠', key: 'coreTab' },
  { view: 'profile', icon: '👤', key: 'profileTab' },
];

export function BottomNav() {
  const { view, navigate, setCoreCategory } = useAppStore();
  const exitMission = useBootcampStore((s) => s.exit);
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((tab) => {
        const active = view === tab.view;
        return (
          <button
            key={tab.view}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => {
              tap();
              // Leaving via the nav always drops back to a tab's home surface (e.g. the Bootcamp
              // map), never mid-mission — so the nav is a reliable escape hatch.
              if (tab.view === 'bootcamp') exitMission();
              // Tapping Core always returns to its category-card grid (the top of Core).
              if (tab.view === 'core') setCoreCategory(null);
              navigate(tab.view);
            }}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-bubble">{tab.icon}</span>
            {t(tab.key)}
          </button>
        );
      })}
    </nav>
  );
}
