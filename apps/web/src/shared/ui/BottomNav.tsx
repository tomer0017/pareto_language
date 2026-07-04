import { t } from '../i18n/strings.js';
import { useAppStore, type View } from '../stores/appStore.js';
import { tap } from './haptics.js';

const TABS: { view: View; icon: string; key: 'mission' | 'words' | 'phrases' | 'situations' | 'practice' }[] = [
  { view: 'mission', icon: '🎯', key: 'mission' },
  { view: 'words', icon: '🔤', key: 'words' },
  { view: 'phrases', icon: '💬', key: 'phrases' },
  { view: 'situations', icon: '🧭', key: 'situations' },
  { view: 'practice', icon: '🕹️', key: 'practice' },
];

/** Every core surface is one tap away and equally important — Mission holds the center of gravity. */
export function BottomNav() {
  const { view, navigate } = useAppStore();
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.view}
          className={`nav-item ${view === tab.view ? 'active' : ''}`}
          onClick={() => {
            tap();
            navigate(tab.view);
          }}
          aria-current={view === tab.view ? 'page' : undefined}
        >
          <span className="nav-bubble">{tab.icon}</span>
          {t(tab.key)}
        </button>
      ))}
    </nav>
  );
}
