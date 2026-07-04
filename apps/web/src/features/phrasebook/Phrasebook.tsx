import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { TopBar } from '../../shared/ui/TopBar.js';
import { playItem } from '../../shared/audio/tts.js';

/** Phrasebook (PDF §10.3): browsable/searchable, instant audio — serves in-trip lookup. */
export function Phrasebook() {
  const app = useAppStore();
  const [query, setQuery] = useState('');
  const [situationFilter, setSituationFilter] = useState('all');

  const items = useMemo(() => {
    if (!app.pack) return [];
    const q = query.trim().toLowerCase();
    return app.pack.items.filter((item) => {
      if (item.kind === 'number' && q === '' && situationFilter === 'all') return false;
      if (situationFilter !== 'all' && !item.situationIds.includes(situationFilter)) return false;
      if (q === '') return true;
      return item.text.toLowerCase().includes(q) || item.meaning.toLowerCase().includes(q);
    });
  }, [app.pack, query, situationFilter]);

  return (
    <div className="screen">
      <TopBar title="Phrasebook" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search Italian or English…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search phrases"
        />
        <select
          value={situationFilter}
          onChange={(e) => setSituationFilter(e.target.value)}
          aria-label="Filter by situation"
          style={{ maxWidth: 140 }}
        >
          <option value="all">All</option>
          {app.pack?.situations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="screen-scroll">
        {items.slice(0, 120).map((item) => (
          <div className="list-row" key={item.id}>
            <div>
              <p>
                <strong>{item.text}</strong>
              </p>
              <p className="dim small">{item.meaning}</p>
            </div>
            <button className="btn-ghost" onClick={() => void playItem(item)} aria-label={`Play ${item.text}`}>
              🔊
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="dim">No phrases match.</p>}
      </div>
    </div>
  );
}
