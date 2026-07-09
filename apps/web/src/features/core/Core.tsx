import { useMemo, useState } from 'react';
import { L, t, type StringKey } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { RECOVERY_ITEMS } from '../bootcamp/recovery.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { DAYS } from '../bootcamp/bootcampStore.js';
import type { BootcampItem } from '../bootcamp/types.js';

/**
 * Core — the practical communication engine, and the shell for READY's future knowledge center.
 * Today only "Core Phrases" carries content (every sentence the missions teach, tap to hear); the
 * other tabs are honest, empty scaffolding (Words / Patterns / Common Questions / Emergency /
 * Favorites) shown as "coming soon" so the structure is ready without faking content (Task 5).
 */
interface Group { title: string; items: BootcampItem[] }

type CoreTab = 'phrases' | 'words' | 'patterns' | 'questions' | 'emergency' | 'favorites';

const TABS: { id: CoreTab; key: StringKey; ready: boolean }[] = [
  { id: 'phrases', key: 'coreTabPhrases', ready: true },
  { id: 'words', key: 'coreTabWords', ready: false },
  { id: 'patterns', key: 'coreTabPatterns', ready: false },
  { id: 'questions', key: 'coreTabQuestions', ready: false },
  { id: 'emergency', key: 'coreTabEmergency', ready: false },
  { id: 'favorites', key: 'coreTabFavorites', ready: false },
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
  const groups = useMemo(buildGroups, []);
  const [tab, setTab] = useState<CoreTab>('phrases');
  const [playing, setPlaying] = useState<string | null>(null);
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  const say = (item: BootcampItem): void => {
    tap();
    setPlaying(item.id);
    void speak(item.text, 'en').then(() => setPlaying((p) => (p === item.id ? null : p)));
  };

  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <LangStrip />
        <h1>{t('coreTitle')}</h1>
        <p className="dim" style={{ marginTop: 4 }}>{tab === 'phrases' ? t('coreSub', { n: total }) : t('coreCenterSub')}</p>
      </div>
      <div className="core-tabs" role="tablist">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            className={`core-tab ${tab === tb.id ? 'active' : ''}`}
            onClick={() => { tap(); setTab(tb.id); }}
          >
            {t(tb.key)}
          </button>
        ))}
      </div>
      <div className="screen-scroll">
        {tab === 'phrases' ? (
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
            <p className="drill-phrase" style={{ fontSize: '1.2rem' }}>{t(TABS.find((x) => x.id === tab)!.key)}</p>
            <p className="drill-meaning">{t('coreTabComingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
