/** Small SVG confidence ring — progress you can feel, not a percentage you must read. */
export function Ring({ pct, size = 44, color = 'var(--accent)' }: { pct: number; size?: number; color?: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, pct / 100));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${c * filled} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" className="ring-label" fill="var(--ink)">
        {pct}%
      </text>
    </svg>
  );
}
