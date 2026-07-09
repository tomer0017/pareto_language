import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t, type StringKey } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { RECOVERY_ITEMS } from '../bootcamp/recovery.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { DAYS } from '../bootcamp/bootcampStore.js';
import type { BootcampItem } from '../bootcamp/types.js';

/**
 * Core — the travel knowledge center. Navigation is two layers (Task 3): first a grid of
 * category cards, then (once a category is picked) the existing tabbed page with its top tabs and
 * content. The picked category lives in appStore (`coreCategory`) so Home's cards can deep-link
 * straight into a category, and the Core bottom-nav tab resets it to the card grid. Only "Core
 * Phrases" carries content today; the rest are honest "coming soon". Content is unchanged.
 */
interface Group { title: string; items: BootcampItem[] }

type CoreTab = 'phrases' | 'words' | 'patterns' | 'questions' | 'emergency' | 'favorites';

const TABS: { id: CoreTab; key: StringKey }[] = [
  { id: 'phrases', key: 'coreTabPhrases' },
  { id: 'words', key: 'coreTabWords' },
  { id: 'patterns', key: 'coreTabPatterns' },
  { id: 'questions', key: 'coreTabQuestions' },
  { id: 'emergency', key: 'coreTabEmergency' },
  { id: 'favorites', key: 'coreTabFavorites' },
];

const CATEGORIES: { id: CoreTab; key: StringKey; icon: string }[] = [
  { id: 'phrases', key: 'coreTabPhrases', icon: '📖' },
  { id: 'words', key: 'coreTabWords', icon: '📝' },
  { id: 'questions', key: 'coreTabQuestions', icon: '❓' },
  { id: 'emergency', key: 'coreTabEmergency', icon: '🚨' },
  { id: 'patterns', key: 'coreTabPatterns', icon: '🧩' },
  { id: 'favorites', key: 'coreTabFavorites', icon: '⭐' },
];

function buildGroups(): Group[] {
  const seen = new Set<string>();
  const groups: Group[] = [{ title: t('survivalKit'), items: RECOVERY_ITEMS }];
  for (const i of RECOVERY_ITEMS) seen.add(i.id);
  for (const m of BOOTCAMP_PLAN) {
    const day = DAYS[m.day];
    if (!day) continue;
    const items = day.items.filter((i) => !seen.has(i.id) && !i.id.startsWith('en.phrase.recovery.'));
    for (const i of items) seen.add(i.id);
    if (items.length) groups.push({ title: `${t('mission')} ${m.day} · ${L(m.title)}`, items });
  }
  return groups;
}

export function Core() {
  const app = useAppStore();
  const category = app.coreCategory as CoreTab | null;
  const groups = useMemo(buildGroups, []);
  const [playing, setPlaying] = useState<string | null>(null);
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  const say = (item: BootcampItem): void => {
    tap();
    setPlaying(item.id);
    void speak(item.text, 'en').then(() => setPlaying((p) => (p === item.id ? null : p)));
  };

  // Layer 1 — the category cards.
  if (!category) {
    return (
      <div className="screen">
        <div style={{ padding: '6px 0 2px' }}>
          <LangStrip />
          <h1>{t('coreTitle')}</h1>
          <p className="dim" style={{ marginTop: 4 }}>{t('corePickCategory')}</p>
        </div>
        <div className="screen-scroll">
          <div className="home-actions stagger">
            {CATEGORIES.map((c) => (
              <button key={c.id} className="action-card card-press" onClick={() => { tap(); app.setCoreCategory(c.id); }}>
                <span className="action-icon">{c.icon}</span>
                <span className="action-title">{t(c.key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Layer 2 — the existing tabbed page, opened on the chosen category.
  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <div className="topbar" style={{ marginBottom: 6 }}>
          <button className="btn-ghost" onClick={() => { tap(); app.setCoreCategory(null); }}>{t('back')}</button>
          <h2 style={{ margin: 0 }}>{t('coreTitle')}</h2>
          <span style={{ width: 44 }} />
        </div>
        <p className="dim" style={{ marginTop: 2 }}>{category === 'phrases' ? t('coreSub', { n: total }) : t('coreCenterSub')}</p>
      </div>
      <div className="core-tabs" role="tablist">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={category === tb.id}
            className={`core-tab ${category === tb.id ? 'active' : ''}`}
            onClick={() => { tap(); app.setCoreCategory(tb.id); }}
          >
            {t(tb.key)}
          </button>
        ))}
      </div>
      <div className="screen-scroll">
        {category === 'phrases' ? (
          <>
            {groups.map((g) => (
              <div key={g.title} style={{ marginTop: 14 }}>
                <h3 style={{ margin: '0 0 8px' }}>{g.title}</h3>
                {g.items.map((item) => (
                  <button
                    key={item.id}
                    className={`list-row card-press ${playing === item.id ? 'core-playing' : ''}`}
                    style={{ width: '100%', textAlign: 'start', background: 'var(--card)', borderRadius: 'var(--r-md)', border: 'none', padding: '12px 14px', marginBottom: 8, boxShadow: 'var(--shadow-card)' }}
                    onClick={() => say(item)}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700 }}>{item.text}</span>
                      <span className="dim small" style={{ display: 'block' }}>{L(item.meaning)}</span>
                    </span>
                    <span className="core-play" aria-hidden>🔊</span>
                  </button>
                ))}
              </div>
            ))}
            <p className="faint small center" style={{ margin: '18px 4px 0' }}>ℹ️ {t('coreReviewSoon')}</p>
          </>
        ) : (
          <div className="drill-card pop-in center" style={{ marginTop: 24 }}>
            <p style={{ fontSize: '2.4rem' }}>🚧</p>
            <p className="drill-phrase" style={{ fontSize: '1.2rem' }}>{t(TABS.find((x) => x.id === category)!.key)}</p>
            <p className="drill-meaning">{t('coreTabComingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
