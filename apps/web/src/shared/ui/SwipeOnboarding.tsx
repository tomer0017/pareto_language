import { useState } from 'react';
import { t } from '../i18n/strings.js';
import { hasSeen, markSeen } from '../util/onceFlag.js';

/**
 * One-time swipe/long-press coach for card decks (word + sentence flashcards). Shows a short
 * left↔right swipe animation and the relevant gesture tips, then never again (persisted per user).
 * Shared so every card surface teaches gestures the same way — no per-deck re-implementation.
 *
 * `variant` picks the copy + its own once-flag: word cards reveal on LONG PRESS; sentence cards flip
 * on TAP. Renders nothing once seen. Mount it inside any swipeable card screen.
 */
export function SwipeOnboarding({ variant = 'words' }: { variant?: 'words' | 'sentences' }) {
  const key = `ready.onboard.swipecards.${variant}`;
  const [show, setShow] = useState(() => !hasSeen(key));
  if (!show) return null;
  const dismiss = (): void => { markSeen(key); setShow(false); };
  return (
    <div className="swipe-onboard-scrim" onClick={dismiss}>
      <div className="swipe-onboard-card pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="swipe-onboard-demo" aria-hidden>
          <span className="swipe-onboard-ghost" />
          <span className="swipe-onboard-arrow start">←</span>
          <span className="swipe-onboard-arrow end">→</span>
        </div>
        <p className="drill-phrase" style={{ fontSize: '1.15rem' }}>{t('swipeHintTitle')}</p>
        <p className="dim small">{t('swipeHintBody')}</p>
        {variant === 'words' && <p className="dim small" style={{ marginTop: 6 }}>🤏 {t('flashLongPressHint')}</p>}
        <button className="btn-primary" style={{ marginTop: 14 }} onClick={dismiss}>{t('swipeHintGot')}</button>
      </div>
    </div>
  );
}
