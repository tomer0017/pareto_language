import { useEffect, useState } from 'react';

/** A single quiet celebration — an animated checkmark, then gone. No confetti storms (P6). */
export function CheckPop({ trigger }: { trigger: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 620);
    return () => clearTimeout(id);
  }, [trigger]);
  if (!visible) return null;
  return (
    <div className="check-pop" aria-hidden>
      <span>✓</span>
    </div>
  );
}
