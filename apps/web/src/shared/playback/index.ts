/**
 * Parrot Mode — the shared Universal Listen system. One engine, one controls component, one panel;
 * every listening surface imports from here. See useParrotPlayback for the architecture overview.
 */
export type {
  PlaybackItem, PlaybackScope, PlaybackSettings, PlaybackStatus, PlaybackOrder, RepeatCount,
  PauseDuration, SleepTimerMinutes,
} from './types.js';
export { useParrotPlayback, type ParrotPlayback, type ParrotOptions } from './useParrotPlayback.js';
export { PlaybackControls, Seg } from './PlaybackControls.js';
export { ListenPanel } from './ListenPanel.js';
export { buildOrder, buildUtterancePlan, runUtterancePlan, planNextCycle, pausePlan, formatDuration, PAUSE_PRESETS } from './playbackPlan.js';
