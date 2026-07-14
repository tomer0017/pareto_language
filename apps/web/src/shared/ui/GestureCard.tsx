import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { tap } from './haptics.js';

/**
 * The ONE swipe-card gesture/animation shell — shared by word flashcards (Swipe Recall) and sentence
 * flashcards so both feel identical: the card follows the finger with a live rotate (direct GPU
 * transforms on a ref → 60 FPS, no re-render per move), springs back under the threshold, and flies
 * off-screen when committed; a fresh card deals in via `dealKey`. Optional press-and-hold and tap are
 * reported as callbacks. Physical-pointer direction (`left`/`right`) is layout-independent, so RTL
 * never flips meaning. This shell owns ONLY gestures + motion; each surface keeps its own SEMANTICS
 * (word cards: knew/didn't-know + hold-to-reveal · sentence cards: flip on tap, prev/next on swipe).
 */
export type SwipeDir = 'left' | 'right';

/** Imperative handle: trigger a committed swipe from outside (e.g. the on-screen ← / → buttons). */
export interface GestureCardHandle {
  commit: (dir: SwipeDir) => void;
}

export interface GestureCardProps {
  /** Changing this deals a fresh card (replays the deal-in animation, clears any inline transform). */
  dealKey: number | string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  /** Horizontal distance (px) that commits a swipe. */
  swipePx?: number;
  /** Fly-off duration (ms). */
  flyMs?: number;
  /** Enable press-and-hold; fires `onHold` after this many ms of a still hold. Omit to disable. */
  holdMs?: number;
  /** Animate the card off-screen on commit (else commit immediately). */
  flyOff?: boolean;
  /** A committed swipe (after the fly-off). Do the state change / review here. */
  onCommit?: (dir: SwipeDir) => void;
  /** Fired at the START of a committed fly-off (e.g. play the correct/incorrect chime). */
  onSwipeStart?: (dir: SwipeDir) => void;
  /** A quick tap (no drag, no completed hold). */
  onTap?: () => void;
  /** Pointer went down — a potential hold begins (e.g. show the hold bar). */
  onPressStart?: () => void;
  /** A still hold reached `holdMs` (e.g. reveal the word). */
  onHold?: () => void;
  /** The press/hold ended without a tap — release or drag-start (e.g. hide the reveal). */
  onPressCancel?: () => void;
  /** Live drag delta in px (for overlay stamps); called WITHOUT re-render — write to a ref. */
  onDragMove?: (dx: number) => void;
  children: ReactNode;
}

export const GestureCard = forwardRef<GestureCardHandle, GestureCardProps>(function GestureCard({
  dealKey,
  className = '',
  style,
  ariaLabel,
  swipePx = 110,
  flyMs = 280,
  holdMs,
  flyOff = true,
  onCommit,
  onSwipeStart,
  onTap,
  onPressStart,
  onHold,
  onPressCancel,
  onDragMove,
  children,
}, ref) {
  const cardRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const animating = useRef(false);
  const holdFired = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHold = (): void => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };
  useEffect(() => clearHold, []);

  const springBack = (): void => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.32s cubic-bezier(0.22, 1.4, 0.4, 1)';
    card.style.transform = '';
    onDragMove?.(0);
  };

  const commit = (dir: SwipeDir): void => {
    const card = cardRef.current;
    if (!card || animating.current) return;
    animating.current = true;
    tap();
    onSwipeStart?.(dir);
    if (!flyOff) { animating.current = false; onCommit?.(dir); return; }
    const toX = (dir === 'right' ? 1 : -1) * (window.innerWidth || 400) * 1.2;
    card.style.transition = `transform ${flyMs}ms ease-out, opacity ${flyMs}ms ease-out`;
    card.style.transform = `translate3d(${toX}px, 0, 0) rotate(${dir === 'right' ? 28 : -28}deg)`;
    card.style.opacity = '0';
    setTimeout(() => { animating.current = false; onCommit?.(dir); }, flyMs);
  };

  useImperativeHandle(ref, () => ({ commit }));

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') { e.preventDefault(); commit('right'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); commit('left'); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap?.(); }
  };

  return (
    <div
      ref={cardRef}
      key={dealKey}
      className={`gesture-card ${className}`}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        if (animating.current) return;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
        dragging.current = false;
        holdFired.current = false;
        const card = cardRef.current;
        if (card) { card.style.transition = 'none'; card.style.animation = 'none'; }
        onPressStart?.();
        if (holdMs !== undefined) holdTimer.current = setTimeout(() => { holdFired.current = true; onHold?.(); }, holdMs);
      }}
      onPointerMove={(e) => {
        if (!start.current || animating.current) return;
        const dx = e.clientX - start.current.x;
        if (!dragging.current && Math.abs(dx) > 8) {
          dragging.current = true;
          clearHold();
          onPressCancel?.(); // a drag cancels any pending/active hold-reveal
        }
        if (dragging.current && cardRef.current) {
          cardRef.current.style.transform = `translate3d(${dx}px, 0, 0) rotate(${dx / 18}deg)`;
          onDragMove?.(dx);
        }
      }}
      onPointerUp={(e) => {
        if (animating.current) return;
        const s = start.current;
        start.current = null;
        clearHold();
        if (dragging.current && s) {
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > swipePx) commit(dx > 0 ? 'right' : 'left');
          else springBack();
        } else if (holdFired.current) {
          onPressCancel?.(); // release after a hold-reveal → hide it
        } else {
          onTap?.(); // quick tap
        }
        dragging.current = false;
      }}
      onPointerCancel={() => {
        start.current = null;
        dragging.current = false;
        clearHold();
        springBack();
        onPressCancel?.();
      }}
    >
      {children}
    </div>
  );
});
