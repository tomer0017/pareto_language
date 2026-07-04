import { useEffect, useState } from 'react';
import type { ContentItem, Outcome } from '@ready/content-schema';
import { playItem } from '../../../shared/audio/tts.js';

/**
 * Mode 3 — Echo (PDF §9): hear native audio → repeat aloud. Introduction drill; no scoring
 * (P3: no fake precision). Comparison itself drives improvement.
 */
export function Echo({ item, onDone }: { item: ContentItem; onDone: (o: Outcome) => void }) {
  const [plays, setPlays] = useState(0);

  useEffect(() => {
    setPlays(0);
    void playItem(item);
  }, [item]);

  return (
    <>
      <div className="drill-card">
        <p className="drill-prompt-label">New phrase — listen & repeat</p>
        <p className="drill-phrase">{item.text}</p>
        <p className="drill-meaning">{item.meaning}</p>
        {item.literal && <p className="dim small">lit. {item.literal}</p>}
      </div>
      <div className="action-zone">
        <div className="btn-row">
          <button
            className="btn-secondary"
            onClick={() => {
              setPlays(plays + 1);
              void playItem(item, { slow: plays >= 1 });
            }}
          >
            🔊 {plays >= 1 ? 'Play slow' : 'Play again'}
          </button>
          <button className="btn-primary" onClick={() => onDone('pass')}>
            I said it
          </button>
        </div>
      </div>
    </>
  );
}
