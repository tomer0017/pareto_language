import { useMemo, useRef, useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { feedback } from '../../../shared/ui/feedbackCue.js';
import { recordReview } from '../../../shared/review/recordReview.js';
import { shuffle, mulberry32, sessionSeed } from '../../../shared/util/shuffle.js';
import { SwipeOnboarding } from '../../../shared/ui/SwipeOnboarding.js';
import { GestureCard, type GestureCardHandle } from '../../../shared/ui/GestureCard.js';
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
  // Shuffle ONCE per session (seed captured on mount) — the deck order is stable while you review it,
  // never reshuffled after every card.
  const [queue, setQueue] = useState<string[]>(() => shuffle(words.map((w) => w.id), mulberry32(sessionSeed())));
  const [dealt, setDealt] = useState(0);       // monotonic — forces a fresh card element per deal
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(false);
  const missed = useRef<Set<string>>(new Set());
  const likeRef = useRef<HTMLSpanElement>(null);
  const nopeRef = useRef<HTMLSpanElement>(null);
  const deckRef = useRef<GestureCardHandle>(null);

  const current = queue.length > 0 ? byId.get(queue[0]!) : undefined;

  // Live drag → Tinder like/nope stamp opacity (written straight to the DOM, no re-render).
  const setHint = (dx: number): void => {
    if (likeRef.current) likeRef.current.style.opacity = String(Math.max(0, Math.min(1, dx / SWIPE_PX)));
    if (nopeRef.current) nopeRef.current.style.opacity = String(Math.max(0, Math.min(1, -dx / SWIPE_PX)));
  };

  /** Record the decision + advance the deck. The fly-off motion is owned by the shared GestureCard. */
  const decide = (result: SwipeResult): void => {
    const cur = queue[0];
    if (!cur) return;
    if (result === 'unknown') missed.current.add(cur);
    recordReview(cur, 'swipe', result === 'known' ? 'pass' : 'fail');
    setRevealed(false);
    setQueue((q) => applySwipe(q, result));
    setDealt((n) => n + 1);
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
      <SwipeOnboarding />
      <GestureCard
        ref={deckRef}
        dealKey={dealt}
        className="recall-card"
        ariaLabel={face.meaning}
        swipePx={SWIPE_PX}
        flyMs={FLY_MS}
        holdMs={HOLD_MS}
        onSwipeStart={(dir) => feedback(dir === 'right')}
        onCommit={(dir) => decide(dir === 'right' ? 'known' : 'unknown')}
        onPressStart={() => setHolding(true)}
        onHold={reveal}
        onPressCancel={() => { setHolding(false); setRevealed(false); }}
        onDragMove={setHint}
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
      </GestureCard>
      {/* The two answer buttons map to PHYSICAL swipe directions (left card = "didn't know", right
          card = "knew it"), and the swipe itself is layout-independent (see the header comment). So
          the row keeps a CONSTANT physical order in every UI direction — `recall-actions` pins it
          LTR so the positive action is always on the RIGHT with a right arrow, and the negative on
          the LEFT with a left arrow, in both Hebrew (RTL) and LTR. */}
      <div className="action-zone">
        <div className="btn-row recall-actions">
          <button className="btn-secondary" onClick={() => deckRef.current?.commit('left')} aria-label={t('didntKnow')}>← {t('didntKnow')}</button>
          <button className="btn-primary" onClick={() => deckRef.current?.commit('right')} aria-label={t('knewIt')}>{t('knewIt')} →</button>
        </div>
      </div>
    </>
  );
}
