import { t, type StringKey } from '../i18n/strings.js';
import { useAppStore, type View } from '../stores/appStore.js';
import { useBootcampStore } from '../../features/bootcamp/bootcampStore.js';
import { PRIMARY_TABS, navTabOf } from '../../app/nav.js';
import { Icon, type IconName } from './Icon.js';
import { tap } from './haptics.js';

/**
 * READY's primary navigation — Home · Learn · Listen · Profile. ONE component and ONE model
 * (`app/nav.ts`) for every screen size: a floating bottom bar on phones/tablets, a side rail on
 * desktop (the rail sits on the inline-start edge, so it is on the right in Hebrew and on the left
 * in English). Only CSS differs between the two presentations.
 *
 * `barHidden` hides the BOTTOM BAR inside focused flows (so it never covers a flow's primary
 * action); the desktop rail ignores it and stays put as a calm way out.
 */
const TAB_META: Record<string, { icon: IconName; key: StringKey }> = {
  home: { icon: 'home', key: 'homeTab' },
  bootcamp: { icon: 'learn', key: 'bootcampTab' },
  listen: { icon: 'listen', key: 'listenTab' },
  profile: { icon: 'profile', key: 'profileTab' },
};

export function AppNav({ barHidden }: { barHidden: boolean }) {
  const view = useAppStore((s) => s.view);
  const navigate = useAppStore((s) => s.navigate);
  const setCoreCategory = useAppStore((s) => s.setCoreCategory);
  const exitMission = useBootcampStore((s) => s.exit);
  const current = navTabOf(view);

  const go = (tab: View): void => {
    tap();
    // The nav is always a reliable way out: it lands on a destination's home surface, never
    // mid-mission and never deep inside a secondary screen.
    exitMission();
    setCoreCategory(null);
    navigate(tab);
  };

  return (
    <nav className={`app-nav ${barHidden ? 'is-bar-hidden' : ''}`} aria-label={t('appName')}>
      <div className="app-nav-brand" aria-hidden>
        <span className="brand-mark">READY <Icon name="plane" size={22} /></span>
        <span className="brand-tagline">{t('appTagline')}</span>
      </div>
      {PRIMARY_TABS.map((tab) => {
        const meta = TAB_META[tab]!;
        const active = current === tab;
        return (
          <button key={tab} className={`nav-item ${active ? 'active' : ''}`} onClick={() => go(tab)} aria-current={active ? 'page' : undefined}>
            <span className="nav-bubble"><Icon name={meta.icon} size={22} /></span>
            <span className="nav-label">{t(meta.key)}</span>
          </button>
        );
      })}
    </nav>
  );
}
