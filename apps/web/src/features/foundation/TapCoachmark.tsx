import { useEffect, useState, type RefObject } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { canShowTapHint, claimTapHint } from './foundationCoach.js';

/**
 * One-time tooltip that points at the FIRST tappable Foundation word the learner ever meets, so they
 * discover that underlined words are interactive. Shows once (claimed globally + persisted),
 * auto-dismisses after ~2s, dismisses on any tap, and never blocks reading. Rendered by
 * `TappableText` for its first word; only the first instance to mount wins the claim.
 */
export function TapCoachmark({ anchorRef }: { anchorRef: RefObject<HTMLElement> }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el || !canShowTapHint()) return;
    claimTapHint();
    const r = el.getBoundingClientRect();
    const width = Math.min(260, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPos({ top: r.bottom + 8, left });

    const hide = () => setPos(null);
    const timer = setTimeout(hide, 2200);
    // Dismiss on the next interaction anywhere (never steals the tap).
    document.addEventListener('pointerdown', hide, { once: true, capture: true });
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', hide, { capture: true } as EventListenerOptions);
    };
  }, [anchorRef]);

  if (!pos) return null;
  return (
    <div className="tap-coachmark fade-in" role="status" style={{ top: pos.top, left: pos.left }}>
      <span className="tap-coachmark-arrow" aria-hidden />
      👆 {t('foundationTapHint')}
    </div>
  );
}
