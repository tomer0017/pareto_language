import { CardVisual } from './CardVisual.js';
import { Icon } from './Icon.js';
import { tap } from './haptics.js';

/**
 * One large, obviously tappable way in: an icon, a strong title, ONE short line and a chevron that
 * points along the reading direction. The same card is every primary choice in READY — Home's four
 * ways to learn, the Listening hub's four modes, the fundamentals under Basic words — so a learner
 * meets one shape that always means "tap here to go there". Whole-card touch target (≥ 84px tall).
 */
export function ChoiceCard({ id, icon, title, sub, tone = 'brand', onSelect }: {
  /** A stable hook for tests and styles (`data-choice`). */
  id: string;
  /** The content icon (an emoji); decorative — the title names the choice. */
  icon: string;
  title: string;
  sub: string;
  /** The soft tint behind the icon, so the choices are told apart at a glance. */
  tone?: 'brand' | 'accent' | 'good' | 'warn';
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`choice-card card-press tone-${tone}`} data-choice={id} onClick={() => { tap(); onSelect(); }}>
      <span className="choice-icon" aria-hidden><CardVisual id={id} fallback={icon} /></span>
      <span className="choice-body">
        <span className="choice-title">{title}</span>
        <span className="choice-sub">{sub}</span>
      </span>
      <Icon name="chevron" size={20} flip />
    </button>
  );
}
