import type { ReadinessState } from '@ready/content-schema';
import { t } from '../i18n/strings.js';

const KEY: Record<ReadinessState, 'notStarted' | 'inProgress' | 'ready' | 'fading'> = {
  notStarted: 'notStarted',
  inProgress: 'inProgress',
  ready: 'ready',
  fading: 'fading',
};

/** Honest readiness badge (PDF §10.4) — four states, no inflated progress. */
export function Badge({ state }: { state: ReadinessState }) {
  return <span className={`badge badge-${state}`}>{t(KEY[state])}</span>;
}
