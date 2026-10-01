import { Icon } from './Icon.js';

/**
 * "A → B" as a relationship between two labels (a language pair, a card direction). The arrow is an
 * icon that follows the reading direction, so it always points from the first label to the second
 * in Hebrew and English alike — never a glyph baked into copy.
 */
export function Pair({ from, to }: { from: string; to: string }) {
  return (
    <span className="pair">
      <span>{from}</span>
      <Icon name="arrow" size={14} flip />
      <span>{to}</span>
    </span>
  );
}
