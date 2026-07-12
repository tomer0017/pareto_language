import { useEffect, useMemo, useRef, useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { feedback } from '../../../shared/ui/feedbackCue.js';
import { recordReview } from '../../../shared/review/recordReview.js';
import { applySwipe, cardFace, type SwipeResult } from './engine.js';
import type { GameWord } from '../types.js';

const HOLD_MS = 500;      // press-and-hold time to reveal
const SWIPE_PX = 110;     // drag distance that commits a swipe
const FLY_MS = 280;       // off-screen fly duration

/**
 * Swipe Recall Cards (Beta polish — Tinder feel). The card follows the finger with a live rotate,
 * springs back under the threshold, and flies off-screen when committed; the next card animates in.
 * Drag runs through direct GPU transforms on a ref (no React re-render per move → 60 FPS, no
 * reflow). Press-and-hold (no drag) reveals the word + translation + audio. RIGHT = "I knew it"
 * (leaves the round), LEFT = "I didn't know it" (returns after ~10–15 cards via the pure engine).
 * Physical-pointer direction is layout-independent, so RTL never flips the meaning. Generic over any
 * GameWord[] (Core 100 → 500 → 1500 unchanged); records review events through the canonical log.
 */
export function SwipeRecall({ words, lang = 'en', onExit }: { words: GameWord[]; lang?: string; onExit?: () => void }) {
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const [queue, setQueue] = useState<string[]>(() => words.map((w) => w.id));
  const [dealt, setDealt] = useState(0);       // monotonic — forces a fresh card element per deal
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(false);
  const missed = useRef<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  const likeRef = useRef<HTMLSpanElement>(null);
  const nopeRef = useRef<HTMLSpanElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const animating = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = queue.length > 0 ? byId.get(queue[0]!) : undefined;

  const clearHold = (): void => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setHolding(false);
  };
  useEffect(() => clearHold, []);

  const setHint = (dx: number): void => {
    if (likeRef.current) likeRef.current.style.opacity = String(Math.max(0, Math.min(1, dx / SWIPE_PX)));
    if (nopeRef.current) nopeRef.current.style.opacity = String(Math.max(0, Math.min(1, -dx / SWIPE_PX)));
  };

  /** Record the decision + advance the deck. Visuals are handled by the caller (fly-off). */
  const decide = (result: SwipeResult): void => {
    const cur = queue[0];
    if (!cur) return;
    if (result === 'unknown') missed.current.add(cur);
    recordReview(cur, 'swipe', result === 'known' ? 'pass' : 'fail');
    clearHold();
    setRevealed(false);
    setQueue((q) => applySwipe(q, result));
    setDealt((n) => n + 1);
  };

  const flyOff = (dir: 'left' | 'right'): void => {
    const card = cardRef.current;
    if (!card || animating.current) return;
    animating.current = true;
    tap();
    feedback(dir === 'right');
    const toX = (dir === 'right' ? 1 : -1) * (window.innerWidth || 400) * 1.2;
    card.style.transition = `transform ${FLY_MS}ms ease-out, opacity ${FLY_MS}ms ease-out`;
    card.style.transform = `translate3d(${toX}px, 0, 0) rotate(${dir === 'right' ? 28 : -28}deg)`;
    card.style.opacity = '0';
    setTimeout(() => { animating.current = false; decide(dir === 'right' ? 'known' : 'unknown'); }, FLY_MS);
  };

  const springBack = (): void => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.32s cubic-bezier(0.22, 1.4, 0.4, 1)';
    card.style.transform = '';
    setHint(0);
  };

  if (!current) {
    const knownFirstTry = words.length - missed.current.size;
    return (
      <div className="drill-card pop-in center" style={{ gap: 10 }}>
        <p style={{ fontSize: '3.4rem' }}>🎉</p>
        <p className="drill-phrase" style={{ fontSize: '1.4rem' }}>{t('deckComplete')}</p>
        <p className="dim">{t('gameScore', { n: knownFirstTry, total: words.length })}</p>
        {onExit && <button className="btn-primary" onClick={() => { tap(); onExit(); }} style={{ marginTop: 12 }}>{t('backToWords')}</button>}
      </div>
    );
  }

  const reveal = (): void => { setHolding(false); setRevealed(true); void speak(current.word, lang); };
  const face = cardFace(current.word, L(current.translation), revealed);

  return (
    <>
      <div
        ref={cardRef}
        key={dealt}
        className="recall-card recall-dealt"
        onPointerDown={(e) => {
          if (animating.current) return;
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          start.current = { x: e.clientX, y: e.clientY };
          dragging.current = false;
          const card = cardRef.current;
          if (card) { card.style.transition = 'none'; card.style.animation = 'none'; }
          setHolding(true);
          holdTimer.current = setTimeout(reveal, HOLD_MS); // reveal only after a ~0.5s still hold
        }}
        onPointerMove={(e) => {
          if (!start.current || animating.current) return;
          const dx = e.clientX - start.current.x;
          if (!dragging.current && Math.abs(dx) > 8) { dragging.current = true; clearHold(); setRevealed(false); }
          if (dragging.current && cardRef.current) {
            cardRef.current.style.transform = `translate3d(${dx}px, 0, 0) rotate(${dx / 18}deg)`;
            setHint(dx);
          }
        }}
        onPointerUp={(e) => {
          if (animating.current) return;
          const s = start.current;
          start.current = null;
          if (dragging.current && s) {
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > SWIPE_PX) flyOff(dx > 0 ? 'right' : 'left');
            else springBack();
          } else {
            clearHold();
            setRevealed(false);
          }
          dragging.current = false;
        }}
        onPointerCancel={() => { start.current = null; dragging.current = false; clearHold(); springBack(); setRevealed(false); }}
      >
        <span ref={likeRef} className="recall-badge like" aria-hidden>✓ {t('knewIt')}</span>
        <span ref={nopeRef} className="recall-badge nope" aria-hidden>✕ {t('didntKnow')}</span>
        <span className="recall-emoji">{current.emoji}</span>
        {/* Part-E: the learner-language MEANING is always on the card (an ambiguous icon like 🚻 is
            never a guessing game); the target WORD appears only after the press-and-hold reveal. */}
        {face.target !== null && (
          <p className="drill-phrase fade-in" style={{ fontSize: '1.5rem' }}>{face.target}</p>
        )}
        <p className={revealed ? 'drill-meaning' : 'recall-prompt-meaning'}>{face.meaning}</p>
        {!revealed && (
          <>
            <p className="faint small">🤏 {t('swipeRevealHint')}</p>
            {holding && <span className="hold-bar" aria-hidden><span className="hold-fill" /></span>}
          </>
        )}
      </div>
      <div className="action-zone">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => flyOff('left')}>← {t('didntKnow')}</button>
          <button className="btn-primary" onClick={() => flyOff('right')}>{t('knewIt')} →</button>
        </div>
      </div>
    </>
  );
}
