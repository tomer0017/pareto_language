import { useMemo, useRef, useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { feedback } from '../../../shared/ui/feedbackCue.js';
import { applySwipe, type SwipeResult } from './engine.js';
import type { GameWord } from '../types.js';

/**
 * Swipe Recall Cards (Task 9) — a card shows ONLY an emoji; press & hold reveals the word,
 * translation, pronunciation and audio; releasing hides them again. Swipe right = "I knew it"
 * (card leaves), swipe left = "I didn't know it" (card returns ~10–15 cards later via the pure
 * engine — never immediately). Buttons mirror the swipes for accessibility. Generic over any
 * GameWord[]; the re-queue rule lives in engine.ts so a real SRS scheduler can replace it later.
 */
export function SwipeRecall({ words, onDone }: { words: GameWord[]; onDone?: (knownFirstTry: number) => void }) {
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const [queue, setQueue] = useState<string[]>(() => words.map((w) => w.id));
  const [revealed, setRevealed] = useState(false);
  const missed = useRef<Set<string>>(new Set());
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  const current = queue.length > 0 ? byId.get(queue[0]!) : undefined;

  const answer = (result: SwipeResult): void => {
    const cur = queue[0];
    if (!cur) return;
    if (result === 'unknown') missed.current.add(cur);
    feedback(result === 'known');
    setRevealed(false);
    setQueue((q) => applySwipe(q, result));
  };

  if (!current) {
    const knownFirstTry = words.length - missed.current.size;
    return (
      <div className="drill-card pop-in">
        <p style={{ fontSize: '3rem' }}>🎉</p>
        <p className="drill-phrase">{t('deckComplete')}</p>
        <p className="dim">{t('gameScore', { n: knownFirstTry, total: words.length })}</p>
        {onDone && <button className="btn-primary" onClick={() => onDone(knownFirstTry)} style={{ marginTop: 12 }}>{t('continue')}</button>}
      </div>
    );
  }

  const reveal = (): void => {
    setRevealed(true);
    void speak(current.word, 'en');
  };

  return (
    <>
      <div
        className="recall-card"
        onPointerDown={(e) => { startX.current = e.clientX; swiped.current = false; reveal(); }}
        onPointerMove={(e) => {
          if (startX.current === null || swiped.current) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 60) {
            swiped.current = true;
            startX.current = null;
            tap();
            answer(dx > 0 ? 'known' : 'unknown');
          }
        }}
        onPointerUp={() => { startX.current = null; if (!swiped.current) setRevealed(false); }}
        onPointerLeave={() => { startX.current = null; setRevealed(false); }}
      >
        <span className="recall-emoji">{current.emoji}</span>
        {revealed ? (
          <div className="fade-in">
            <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{current.word}</p>
            <p className="drill-meaning">{L(current.translation)}</p>
            {current.pronunciation && <p className="faint small">{current.pronunciation}</p>}
          </div>
        ) : (
          <p className="faint small">🤏 {t('swipeRevealHint')}</p>
        )}
      </div>
      <div className="action-zone">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => { tap(); answer('unknown'); }}>← {t('didntKnow')}</button>
          <button className="btn-primary" onClick={() => { tap(); answer('known'); }}>{t('knewIt')} →</button>
        </div>
      </div>
    </>
  );
}
