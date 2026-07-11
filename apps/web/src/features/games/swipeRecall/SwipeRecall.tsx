import { useEffect, useMemo, useRef, useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { feedback } from '../../../shared/ui/feedbackCue.js';
import { recordReview } from '../../../shared/review/recordReview.js';
import { applySwipe, type SwipeResult } from './engine.js';
import type { GameWord } from '../types.js';

const HOLD_MS = 500;

/**
 * Swipe Recall Cards (Part B3) — a card shows ONLY an emoji + a persistent "press and hold to
 * reveal" helper. Holding ~0.5s (with a fill indicator) reveals the word, translation and audio;
 * releasing hides them again. Swipe RIGHT = "I knew it" (leaves the round), LEFT = "I didn't know
 * it" (returns after ~10–15 cards via the pure engine — never immediately). Buttons mirror the
 * swipes. Physical-pointer direction is layout-independent, so RTL never reverses the semantics.
 * Generic over any GameWord[] (now the real Core 100); records review events through the canon log.
 */
export function SwipeRecall({ words, onDone }: { words: GameWord[]; onDone?: (knownFirstTry: number) => void }) {
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const [queue, setQueue] = useState<string[]>(() => words.map((w) => w.id));
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(false);
  const missed = useRef<Set<string>>(new Set());
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = queue.length > 0 ? byId.get(queue[0]!) : undefined;

  const clearHold = (): void => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  };

  // Safety: clear any pending hold timer on unmount / card change.
  useEffect(() => clearHold, []);

  const answer = (result: SwipeResult): void => {
    const cur = queue[0];
    if (!cur) return;
    if (result === 'unknown') missed.current.add(cur);
    recordReview(cur, 'swipe', result === 'known' ? 'pass' : 'fail');
    feedback(result === 'known');
    clearHold();
    setRevealed(false);
    setQueue((q) => applySwipe(q, result));
  };

  if (!current) {
    const knownFirstTry = words.length - missed.current.size;
    return (
      <div className="drill-card pop-in center">
        <p style={{ fontSize: '3rem' }}>🎉</p>
        <p className="drill-phrase">{t('deckComplete')}</p>
        <p className="dim">{t('gameScore', { n: knownFirstTry, total: words.length })}</p>
        {onDone && <button className="btn-primary" onClick={() => onDone(knownFirstTry)} style={{ marginTop: 12 }}>{t('continue')}</button>}
      </div>
    );
  }

  const reveal = (): void => {
    setHolding(false);
    setRevealed(true);
    void speak(current.word, 'en');
  };

  return (
    <>
      <div
        className="recall-card"
        onPointerDown={(e) => {
          startX.current = e.clientX;
          swiped.current = false;
          setHolding(true);
          holdTimer.current = setTimeout(reveal, HOLD_MS); // reveal only after a ~0.5s hold
        }}
        onPointerMove={(e) => {
          if (startX.current === null || swiped.current) return;
          const dx = e.clientX - startX.current;
          if (!revealed && Math.abs(dx) > 8) clearHold(); // a drag is a swipe, not a hold
          if (Math.abs(dx) > 60) {
            swiped.current = true;
            startX.current = null;
            tap();
            answer(dx > 0 ? 'known' : 'unknown'); // physical right = knew it (RTL-safe)
          }
        }}
        onPointerUp={() => { startX.current = null; clearHold(); if (!swiped.current) setRevealed(false); }}
        onPointerLeave={() => { startX.current = null; clearHold(); setRevealed(false); }}
      >
        <span className="recall-emoji">{current.emoji}</span>
        {revealed ? (
          <div className="fade-in">
            <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{current.word}</p>
            <p className="drill-meaning">{L(current.translation)}</p>
          </div>
        ) : (
          <>
            <p className="faint small">🤏 {t('swipeRevealHint')}</p>
            {holding && <span className="hold-bar" aria-hidden><span className="hold-fill" /></span>}
          </>
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
