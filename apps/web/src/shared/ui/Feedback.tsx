import { useEffect, useState } from 'react';

/**
 * The one reusable success/error burst (Pareto UX sprint). Fires an icon pop — a green ✓ (correct)
 * or red ✕ (wrong) — whenever `trigger` changes to a non-zero value, then clears itself. Supersedes
 * the correct-only CheckPop by covering both polarities from a single component, so every screen
 * shows identical feedback. Pair with feedbackCorrect()/feedbackWrong() for sound + haptic and the
 * .fx-correct / .fx-wrong classes for card motion.
 */
export function Feedback({ kind, trigger }: { kind: 'correct' | 'wrong'; trigger: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(id);
  }, [trigger]);
  if (!visible) return null;
  return (
    <div className={`fx-burst fx-burst-${kind}`} aria-hidden>
      <span>{kind === 'correct' ? '✓' : '✕'}</span>
    </div>
  );
}
