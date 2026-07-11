import type { ReactNode } from 'react';

/**
 * Reusable centered dialog (Pareto UX sprint). Generalizes the scrim + card pattern already
 * used by the Videos "did you understand?" popup so every future confirm/choice dialog — resume
 * mission, restart, leave-without-saving, new game types — shares one accessible, RTL-aware shell.
 *
 * Tapping the scrim dismisses (calls onClose); tapping the card does not. Actions are supplied by
 * the caller so the component stays layout-only (no business logic, no duplicated state).
 */
export function Modal({
  icon,
  title,
  body,
  children,
  onClose,
}: {
  icon?: string;
  title?: string;
  body?: string;
  children?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="modal-scrim" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card pop-in" onClick={(e) => e.stopPropagation()}>
        {icon && <p style={{ fontSize: '3rem', textAlign: 'center', margin: 0 }}>{icon}</p>}
        {title && (
          <p className="drill-phrase center" style={{ fontSize: '1.3rem', margin: '6px 0 2px' }}>
            {title}
          </p>
        )}
        {body && <p className="dim center" style={{ margin: '0 0 4px' }}>{body}</p>}
        {children}
      </div>
    </div>
  );
}

/** A vertical stack of primary/secondary actions, matched to the app's button system. */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>{children}</div>;
}
