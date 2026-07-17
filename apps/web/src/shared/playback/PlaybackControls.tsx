import { t } from '../i18n/strings.js';
import { tap } from '../ui/haptics.js';
import type { ParrotPlayback } from './useParrotPlayback.js';
import type { RepeatCount } from './types.js';

/**
 * The ONE Parrot-Mode controls component — Play/Pause, Repeat (×1/×2/×3), Sequential/Random and
 * Translation ON/OFF, plus prev/next. Every listening surface (Core Words, Core Sentences, Dialogue
 * Transcript) mounts THIS; there is no second set of controls anywhere. It's a pure view over the
 * engine handle ({@link ParrotPlayback}) returned by `useParrotPlayback`, so future knobs (speed,
 * loop, pause length) are added here once and appear everywhere.
 */
const REPEATS: RepeatCount[] = [1, 2, 3];

export function PlaybackControls({ pb }: { pb: ParrotPlayback }) {
  const playing = pb.status === 'playing';
  const empty = pb.total === 0;
  return (
    <div className="parrot-controls">
      {/* Transport: prev · play/pause · next */}
      <div className="parrot-transport">
        <button className="parrot-step" onClick={() => { tap(); pb.prev(); }} disabled={empty} aria-label={t('parrotPrev')}>‹</button>
        <button
          className="parrot-play"
          onClick={() => { tap(); pb.toggle(); }}
          disabled={empty}
          aria-label={playing ? t('parrotPause') : t('parrotPlay')}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button className="parrot-step" onClick={() => { tap(); pb.next(); }} disabled={empty} aria-label={t('parrotNext')}>›</button>
      </div>

      {/* Repeat count */}
      <div className="parrot-group">
        <span className="parrot-label">{t('parrotRepeat')}</span>
        <div className="seg" role="group">
          {REPEATS.map((r) => (
            <button
              key={r}
              className={`seg-btn ${pb.settings.repeat === r ? 'on' : ''}`}
              aria-pressed={pb.settings.repeat === r}
              onClick={() => { tap(); pb.setRepeat(r); }}
            >×{r}</button>
          ))}
        </div>
      </div>

      {/* Order: sequential vs random */}
      <div className="parrot-group">
        <span className="parrot-label">{t('parrotOrder')}</span>
        <div className="seg" role="group">
          <button
            className={`seg-btn ${pb.settings.order === 'sequential' ? 'on' : ''}`}
            aria-pressed={pb.settings.order === 'sequential'}
            onClick={() => { tap(); pb.setOrder('sequential'); }}
          >{t('parrotSequential')}</button>
          <button
            className={`seg-btn ${pb.settings.order === 'random' ? 'on' : ''}`}
            aria-pressed={pb.settings.order === 'random'}
            onClick={() => { tap(); pb.setOrder('random'); }}
          >{t('parrotRandom')}</button>
        </div>
      </div>

      {/* Translation on/off */}
      <div className="parrot-group">
        <span className="parrot-label">{t('parrotTranslation')}</span>
        <div className="seg" role="group">
          <button
            className={`seg-btn ${pb.settings.translation ? 'on' : ''}`}
            aria-pressed={pb.settings.translation}
            onClick={() => { tap(); pb.setTranslation(true); }}
          >{t('parrotOn')}</button>
          <button
            className={`seg-btn ${!pb.settings.translation ? 'on' : ''}`}
            aria-pressed={!pb.settings.translation}
            onClick={() => { tap(); pb.setTranslation(false); }}
          >{t('parrotOff')}</button>
        </div>
      </div>
    </div>
  );
}
