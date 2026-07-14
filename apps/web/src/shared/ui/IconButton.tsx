import type { ReactNode } from 'react';
import { tap } from './haptics.js';

/**
 * The ONE circular icon button. Every round control (close ✕, back ‹, play ▶︎, lifebuoy 🛟, …)
 * renders through this so they are all perfectly centered (CSS grid `place-items: center`), the same
 * size system, and consistent press feedback — no per-surface re-implementation. Content-agnostic:
 * pass an emoji or a glyph as `icon`. `variant` picks the surface treatment; `size` is the diameter.
 */
export function IconButton({
  icon,
  label,
  onClick,
  size = 44,
  variant = 'surface',
  className = '',
  stop = false,
  haptic = true,
}: {
  icon: ReactNode;
  /** Accessible label (the button shows only an icon). */
  label: string;
  onClick?: () => void;
  /** Diameter in px. */
  size?: number;
  variant?: 'surface' | 'ghost' | 'brand';
  className?: string;
  /** Stop propagation (for a button nested inside a tappable row/card). */
  stop?: boolean;
  haptic?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn-${variant} ${className}`}
      style={{ width: size, height: size, minHeight: size, fontSize: Math.round(size * 0.42) }}
      aria-label={label}
      onClick={(e) => {
        if (stop) e.stopPropagation();
        if (haptic) tap();
        onClick?.();
      }}
    >
      {icon}
    </button>
  );
}
