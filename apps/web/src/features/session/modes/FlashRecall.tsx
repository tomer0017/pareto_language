import { useEffect, useRef, useState } from 'react';
import type { ContentItem, Outcome, ReviewEvent } from '@ready/content-schema';
import { playItem } from '../../../shared/audio/tts.js';

/**
 * Mode 2 — Flash Recall (PDF §9): English prompt → say it aloud → reveal → self-grade against
 * the visible answer. Latency to reveal is the fluency evidence (<3s target, §9.1).
 */
export function FlashRecall({
  item,
  onDone,
}: {
  item: ContentItem;
  onDone: (o: Outcome, extras?: Partial<ReviewEvent>) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const shownAt = useRef(Date.now());
  const latency = useRef<number | undefined>(undefined);

  useEffect(() => {
    shownAt.current = Date.now();
    setRevealed(false);
  }, [item]);

  const reveal = () => {
    latency.current = Date.now() - shownAt.current;
    setRevealed(true);
    void playItem(item);
  };

  return (
    <>
      <div className="drill-card">
        <p className="drill-prompt-label">Say it in Italian</p>
        <p className="drill-phrase">{item.meaning}</p>
        {revealed && (
          <p className="drill-meaning fade-in" style={{ color: 'var(--accent)', fontSize: '1.4rem' }}>
            {item.text}
          </p>
        )}
        {!revealed && <p className="dim small">speak aloud, then reveal</p>}
      </div>
      <div className="action-zone">
        {!revealed ? (
          <button className="btn-primary" onClick={reveal}>
            Reveal
          </button>
        ) : (
          <div className="btn-row">
            <button className="btn-danger-soft" onClick={() => onDone('fail', { latencyMs: latency.current })}>
              No
            </button>
            <button className="btn-secondary" onClick={() => onDone('partial', { latencyMs: latency.current })}>
              Almost
            </button>
            <button className="btn-primary" onClick={() => onDone('pass', { latencyMs: latency.current })}>
              Got it
            </button>
          </div>
        )}
      </div>
    </>
  );
}
