import { useEffect, useRef, useState } from 'react';
import type { ContentItem, Outcome } from '@ready/content-schema';
import { playItem } from '../../../shared/audio/tts.js';
import { L, t } from '../../../shared/i18n/strings.js';

/** Mode 1 — Swipe (PDF §9): fast triage; weak prior only, never sole evidence. */
export function SwipeCard({ item, onDone }: { item: ContentItem; onDone: (o: Outcome) => void }) {
  const [flipped, setFlipped] = useState(false);
  const startX = useRef<number | null>(null);
  const [dx, setDx] = useState(0);

  useEffect(() => {
    setFlipped(false);
    void playItem(item);
  }, [item]);

  const settle = (x: number) => {
    if (x > 70) onDone('pass');
    else if (x < -70) onDone('fail');
    setDx(0);
    startX.current = null;
  };

  return (
    <>
      <div
        className="drill-card"
        style={{ transform: `translateX(${dx}px) rotate(${dx / 30}deg)`, touchAction: 'pan-y' }}
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerMove={(e) => {
          if (startX.current !== null) setDx(e.clientX - startX.current);
        }}
        onPointerUp={() => settle(dx)}
        onClick={() => setFlipped(true)}
      >
        <p className="drill-label">{t('swipeTriage')}</p>
        <p className="drill-phrase">{item.text}</p>
        {flipped ? (
          <p className="drill-meaning fade-in">{L(item.meaning)}</p>
        ) : (
          <p className="faint small">{t('tapToFlip')}</p>
        )}
      </div>
      <div className="swipe-hint">
        <span>← {t('dontKnow')}</span>
        <span>{t('know')} →</span>
      </div>
      <div className="action-zone">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => onDone('fail')}>
            {t('dontKnow')}
          </button>
          <button className="btn-accent" onClick={() => onDone('pass')}>
            {t('know')}
          </button>
        </div>
      </div>
    </>
  );
}
