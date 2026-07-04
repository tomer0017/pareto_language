import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { playItem } from '../../shared/audio/tts.js';

/** Words — recognition vocabulary and numbers, with honest level dots (L0–L4). */
export function Words() {
  const app = useAppStore();
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    if (!app.pack) return [];
    const q = query.trim().toLowerCase();
    return app.pack.items.filter((i) => {
      if (i.kind !== 'word' && i.kind !== 'number') return false;
      if (q === '') return true;
      return i.text.toLowerCase().includes(q) || i.meaning.toLowerCase().includes(q);
    });
  }, [app.pack, query]);

  return (
    <div className="screen">
      <h1 style={{ marginBottom: 4 }}>{t('words')}</h1>
      <p className="dim small" style={{ marginBottom: 12 }}>
        {items.filter((i) => (app.states.get(i.id)?.level ?? 0) >= 1).length} / {items.length}
      </p>
      <input
        placeholder={t('searchWords')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t('searchWords')}
        style={{ marginBottom: 8 }}
      />
      <div className="screen-scroll">
        {items.slice(0, 150).map((item) => {
          const level = app.states.get(item.id)?.level ?? 0;
          return (
            <div className="list-row fade-in" key={item.id}>
              <div>
                <p style={{ fontWeight: 700 }}>{item.text}</p>
                <p className="dim small">{item.meaning}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="level-dots" aria-label={`L${level}`}>
                  {[1, 2, 3, 4].map((l) => (
                    <span key={l} className={`level-dot ${level >= l ? 'on' : ''}`} />
                  ))}
                </span>
                <button className="btn-ghost" onClick={() => void playItem(item)} aria-label={t('play')}>
                  🔊
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
