import { useState, type ReactNode } from 'react';
import { CARD_VISUALS } from './cardVisuals.js';

/** Decorative presentation only: the enclosing card owns its label, action and progress. */
export function CardVisual({ id, fallback }: { id: string; fallback?: ReactNode }) {
  const asset = CARD_VISUALS[id];
  const [failed, setFailed] = useState<string>();
  if (!asset || failed === asset) return <span aria-hidden>{fallback}</span>;
  return <img className="card-visual" src={`${import.meta.env.BASE_URL}images/cards/${asset}`} alt="" aria-hidden draggable={false} decoding="async" onError={() => setFailed(asset)} />;
}
