import type { ReadinessState } from '@ready/content-schema';

const LABEL: Record<ReadinessState, string> = {
  notStarted: 'Not started',
  inProgress: 'In progress',
  ready: 'Ready ✓',
  fading: 'Fading',
};

/** Honest readiness badge (PDF §10.4) — four states, no inflated progress. */
export function Badge({ state }: { state: ReadinessState }) {
  return <span className={`badge badge-${state}`}>{LABEL[state]}</span>;
}
