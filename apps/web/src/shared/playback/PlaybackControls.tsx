import { useState } from 'react';
import { t } from '../i18n/strings.js';
import { tap } from '../ui/haptics.js';
import { formatDuration } from './playbackPlan.js';
import type { ParrotPlayback } from './useParrotPlayback.js';
import type { PauseDuration, PlaybackOrder, PlaybackSpeed, RepeatCount, SleepTimerMinutes } from './types.js';

/**
 * The ONE Parrot-Mode controls component — used by every listening surface (Core Words, Core
 * Sentences, Dialogue Transcript). There is no second set of controls anywhere. It's a pure view over
 * the engine handle ({@link ParrotPlayback}).
 *
 * Progressive disclosure (Task 9): the PRIMARY row (Prev · Play/Pause · Next · Repeat) is always
 * visible; the remaining settings (Translation, Order, Loop, Speed, Pause, Sleep timer) live in a
 * collapsible panel so nothing overflows on a phone and the Transcript keeps its reading space.
 * Accessibility (Task 10): every icon control has a translated aria-label, toggle groups expose
 * aria-pressed, the settings disclosure exposes aria-expanded, and a polite live region announces
 * status changes (never the per-second countdown).
 */

/** A labelled segmented toggle group — the single reusable pattern for every Parrot setting. */
function Seg<T extends string | number>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="parrot-group">
      <span className="parrot-label">{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            className={`seg-btn ${value === o.v ? 'on' : ''}`}
            aria-pressed={value === o.v}
            onClick={() => { tap(); onChange(o.v); }}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );
}

const REPEATS: RepeatCount[] = [1, 2, 3];
const SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25];
const SLEEP_OPTIONS: SleepTimerMinutes[] = [0, 10, 15, 30, 60];

/** Translated, non-spammy status line for the live region (announced only when it changes). */
function statusAnnouncement(pb: ParrotPlayback): string {
  if (pb.sleepFinished) return t('parrotSleepFinished');
  switch (pb.status) {
    case 'playing': return t('parrotStatusPlaying');
    case 'paused': return t('parrotStatusPaused');
    case 'finished': return t('parrotStatusFinished');
    default: return '';
  }
}

export function PlaybackControls({ pb }: { pb: ParrotPlayback }) {
  const [open, setOpen] = useState(false);
  const playing = pb.status === 'playing';
  const empty = pb.total === 0;

  return (
    <div className="parrot-controls">
      {/* Polite live region — status only, so screen readers aren't flooded by the countdown. */}
      <span className="sr-only" role="status" aria-live="polite">{statusAnnouncement(pb)}</span>

      {/* Primary row: always visible. Forced LTR so the transport reads like a media player everywhere
          (‹ = previous, › = next) — never mirrored/inconsistent under an RTL (Hebrew) interface. */}
      <div className="parrot-transport" dir="ltr">
        <button type="button" className="parrot-step" onClick={() => { tap(); pb.prev(); }} disabled={empty} aria-label={t('parrotPrev')}>‹</button>
        <button
          type="button"
          className="parrot-play"
          onClick={() => { tap(); pb.toggle(); }}
          disabled={empty}
          aria-label={playing ? t('parrotPause') : t('parrotPlay')}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button type="button" className="parrot-step" onClick={() => { tap(); pb.next(); }} disabled={empty} aria-label={t('parrotNext')}>›</button>
      </div>

      <Seg
        label={t('parrotRepeat')}
        value={pb.settings.repeat}
        options={REPEATS.map((r) => ({ v: r, label: `×${r}` }))}
        onChange={pb.setRepeat}
      />

      {/* Sleep countdown / finished notice — non-blocking, not in the live region. */}
      {(pb.sleepRemainingMs != null || pb.sleepFinished) && (
        <p className="parrot-sleep" aria-hidden={false}>
          {pb.sleepFinished
            ? `🌙 ${t('parrotSleepFinished')}`
            : `🌙 ${t('parrotSleepLeft', { time: formatDuration(pb.sleepRemainingMs ?? 0) })}`}
        </p>
      )}

      {/* Disclosure for the secondary settings */}
      <button
        type="button"
        className="parrot-more"
        aria-expanded={open}
        onClick={() => { tap(); setOpen((o) => !o); }}
      >
        {open ? t('parrotLessSettings') : t('parrotMoreSettings')}
      </button>

      {open && (
        <div className="parrot-settings">
          <Seg
            label={t('parrotTranslation')}
            value={pb.settings.translation ? 'on' : 'off'}
            options={[{ v: 'on', label: t('parrotOn') }, { v: 'off', label: t('parrotOff') }]}
            onChange={(v) => pb.setTranslation(v === 'on')}
          />
          <Seg
            label={t('parrotOrder')}
            value={pb.settings.order}
            options={[
              { v: 'sequential' as PlaybackOrder, label: t('parrotSequential') },
              { v: 'random' as PlaybackOrder, label: t('parrotRandom') },
            ]}
            onChange={pb.setOrder}
          />
          <Seg
            label={t('parrotLoop')}
            value={pb.settings.loop ? 'on' : 'off'}
            options={[{ v: 'on', label: t('parrotOn') }, { v: 'off', label: t('parrotOff') }]}
            onChange={(v) => pb.setLoop(v === 'on')}
          />
          <Seg
            label={t('parrotSpeed')}
            value={pb.settings.speed}
            options={SPEEDS.map((s) => ({ v: s, label: `${s}×` }))}
            onChange={pb.setSpeed}
          />
          <Seg
            label={t('parrotPauseLength')}
            value={pb.settings.pause}
            options={[
              { v: 'short' as PauseDuration, label: t('parrotPauseShort') },
              { v: 'normal' as PauseDuration, label: t('parrotPauseNormal') },
              { v: 'long' as PauseDuration, label: t('parrotPauseLong') },
            ]}
            onChange={pb.setPause}
          />
          <Seg
            label={t('parrotSleepTimer')}
            value={pb.settings.sleepTimer}
            options={SLEEP_OPTIONS.map((m) => ({ v: m, label: m === 0 ? t('parrotSleepOff') : t('parrotMinutesShort', { n: m }) }))}
            onChange={pb.setSleepTimer}
          />
        </div>
      )}
    </div>
  );
}
