import { useMemo, useState } from 'react';
import type { ContentItem } from '@ready/content-schema';
import { useAppStore } from '../../shared/stores/appStore.js';
import { isPhraseSolid } from '@ready/engine';
import { t } from '../../shared/i18n/strings.js';
import { playItem } from '../../shared/audio/tts.js';

/** Phrases — the atomic production unit (PDF §6.1). Survival glue first, then per situation. */
export function Phrases() {
  const app = useAppStore();
  const [query, setQuery] = useState('');

  const { glue, bySituation } = useMemo(() => {
    const empty = { glue: [] as ContentItem[], bySituation: [] as { name: string; items: ContentItem[] }[] };
    if (!app.pack) return empty;
    const q = query.trim().toLowerCase();
    const match = (i: ContentItem) =>
      q === '' || i.text.toLowerCase().includes(q) || i.meaning.toLowerCase().includes(q);
    const phrases = app.pack.items.filter((i) => i.kind === 'phrase' && match(i));
    return {
      glue: phrases.filter((i) => i.situationIds.length === 0),
      bySituation: app.pack.situations
        .map((s) => ({ name: s.name, items: phrases.filter((i) => i.situationIds.includes(s.id)) }))
        .filter((g) => g.items.length > 0),
    };
  }, [app.pack, query]);

  const row = (item: ContentItem) => {
    const solid = isPhraseSolid(app.states.get(item.id));
    return (
      <div className="list-row" key={item.id}>
        <div>
          <p style={{ fontWeight: 700 }}>
            {item.text} {solid && <span style={{ color: 'var(--good)' }}>✓</span>}
          </p>
          <p className="dim small">{item.meaning}</p>
        </div>
        <button className="btn-ghost" onClick={() => void playItem(item)} aria-label={t('play')}>
          🔊
        </button>
      </div>
    );
  };

  return (
    <div className="screen">
      <h1 style={{ marginBottom: 12 }}>{t('phrases')}</h1>
      <input
        placeholder={t('searchPhrases')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t('searchPhrases')}
        style={{ marginBottom: 8 }}
      />
      <div className="screen-scroll">
        {glue.length > 0 && (
          <div className="card card-accent fade-in">
            <h2>{t('survivalGuide')}</h2>
            <p className="dim small" style={{ marginBottom: 6 }}>{t('survivalSub')}</p>
            {glue.map(row)}
          </div>
        )}
        {bySituation.map((group) => (
          <div className="card fade-in" key={group.name}>
            <h2 style={{ marginBottom: 6 }}>{group.name}</h2>
            {group.items.map(row)}
          </div>
        ))}
      </div>
    </div>
  );
}
