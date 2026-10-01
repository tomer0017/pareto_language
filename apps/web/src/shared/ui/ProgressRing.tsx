import type { ReactNode } from 'react';

/**
 * The progress ring — READY's one visual for "how far along". Purely presentational: the caller
 * passes a real percentage and whatever belongs in the centre. Draws clockwise from 12 o'clock in
 * every interface direction (a quantity, not text).
 */
export function ProgressRing({ pct, size = 132, stroke = 12, label, children }: {
  pct: number;
  size?: number;
  stroke?: number;
  /** Accessible description of what the ring measures. */
  label: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, pct / 100));
  return (
    <div className="progress-ring" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * filled} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="progress-ring-center">{children}</div>
    </div>
  );
}
