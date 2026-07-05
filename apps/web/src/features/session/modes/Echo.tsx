import { useEffect, useState } from 'react';
import type { ContentItem, Outcome } from '@ready/content-schema';
import { playItem } from '../../../shared/audio/tts.js';
import { L, t } from '../../../shared/i18n/strings.js';

/** Mode 3 — Echo: hear it, say it. Introduction drill; no fake scoring (P3). */
export function Echo({ item, onDone }: { item: ContentItem; onDone: (o: Outcome) => void }) {
  const [plays, setPlays] = useState(0);

  useEffect(() => {
    setPlays(0);
    void playItem(item);
  }, [item]);

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('newPhrase')}</p>
        <p className="drill-phrase">{item.text}</p>
        <p className="drill-meaning">{L(item.meaning)}</p>
        {item.literal && <p className="faint small">lit. {L(item.literal)}</p>}
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
            🔊 {plays >= 1 ? t('playSlow') : t('playAgain')}
          </button>
          <button className="btn-accent" onClick={() => onDone('pass')}>
            {t('saidIt')}
          </button>
        </div>
      </div>
    </>
  );
}
