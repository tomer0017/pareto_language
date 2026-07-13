import type { ReactNode } from 'react';
import { useEffect } from 'react';

/**
 * Reusable BOTTOM SHEET (Foundation sprint). Generalizes the scrim pattern from `Modal` into a
 * slide-up panel anchored to the bottom of the app column — the shell every "peek without leaving
 * the screen" surface shares (Foundation today; the future Universal-Tap word sheet reuses it as-is).
 *
 * Layout-only, like `Modal`: the caller supplies the content and the close handler; the sheet owns
 * no business logic and no navigation state. RTL-aware (inherits `dir` from the app root), closes on
 * scrim tap or Escape, and locks background scroll while open.
 */
export function Sheet({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the sheet (a11y). */
  labelledBy?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div
        className="sheet-panel sheet-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden onClick={onClose} />
        {children}
      </div>
    </div>
  );
}
