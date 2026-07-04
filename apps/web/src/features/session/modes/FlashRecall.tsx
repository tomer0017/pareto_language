import { useEffect, useRef, useState } from 'react';
import type { ContentItem, Outcome, ReviewEvent } from '@ready/content-schema';
import { playItem } from '../../../shared/audio/tts.js';
import { t } from '../../../shared/i18n/strings.js';
import { languageInfo } from '../../../shared/i18n/languages.js';
import { useAppStore } from '../../../shared/stores/appStore.js';

/** Mode 2 — Flash Recall: say it aloud → reveal → self-grade. Latency = fluency evidence. */
export function FlashRecall({
  item,
  onDone,
}: {
  item: ContentItem;
  onDone: (o: Outcome, extras?: Partial<ReviewEvent>) => void;
}) {
  const learningLang = useAppStore((s) => s.learningLang);
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
        <p className="drill-label">{t('sayIt', { language: languageInfo(learningLang).name })}</p>
        <p className="drill-phrase">{item.meaning}</p>
        {revealed ? (
          <p className="reveal-answer fade-in">{item.text}</p>
        ) : (
          <p className="faint small">{t('speakAloud')}</p>
        )}
      </div>
      <div className="action-zone">
        {!revealed ? (
          <button className="btn-primary" onClick={reveal}>
            {t('reveal')}
          </button>
        ) : (
          <div className="btn-row">
            <button className="btn-danger-soft" onClick={() => onDone('fail', { latencyMs: latency.current })}>
              {t('no')}
            </button>
            <button className="btn-secondary" onClick={() => onDone('partial', { latencyMs: latency.current })}>
              {t('almost')}
            </button>
            <button className="btn-accent" onClick={() => onDone('pass', { latencyMs: latency.current })}>
              {t('gotIt')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
