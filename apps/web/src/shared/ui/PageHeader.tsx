import type { ReactNode } from 'react';
import { t } from '../i18n/strings.js';
import { Icon } from './Icon.js';
import { tap } from './haptics.js';

/**
 * The header of a browse page: an optional back control, a title, an optional one-line purpose and
 * an optional trailing slot. One screen, one obvious purpose — the subtitle says what it is for.
 */
export function PageHeader({ title, sub, onBack, trailing, icon }: {
  title: string;
  sub?: string;
  onBack?: () => void;
  trailing?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        {onBack && <BackButton onBack={onBack} />}
        {icon && <span className="icon-tile icon-tile-brand" aria-hidden>{icon}</span>}
        <h1 className="page-title">{title}</h1>
        {trailing && <span className="page-header-trailing">{trailing}</span>}
      </div>
      {sub && <p className="page-sub">{sub}</p>}
    </header>
  );
}

/** The one "go back" control: a round button whose chevron points against the reading direction. */
export function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className="back-btn" onClick={() => { tap(); onBack(); }} aria-label={t('back')}>
      <Icon name="chevron" size={22} className="icon-back" />
    </button>
  );
}
