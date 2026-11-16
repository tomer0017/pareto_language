import { everydayDayPlan } from './core/everydayDay.js';
import { checkpointScreen, proceed, requestHelp, respond, revealOptions, startCheckpoint, type CheckpointState } from './checkpoint.js';
import type { MissionLang } from './author.js';

/** Real engine states for visual regression and manual QA, never imported by the product. */
export function mission18VisualStates(lang: MissionLang) {
  const plan = everydayDayPlan(lang);
  const run = (miss: (s: CheckpointState, concept: string) => boolean) => {
    let state = startCheckpoint(plan);
    const trace: CheckpointState[] = [];
    for (let guard = 0; guard < 300 && state.phase !== 'complete'; guard++) {
      trace.push(state);
      const screen = checkpointScreen(plan, state);
      if (screen.kind === 'say') {
        if (screen.concealed) state = revealOptions(plan, state);
        else state = respond(plan, state, { kind: 'say', conceptId: miss(state, screen.turn.conceptId) ? screen.turn.wrong[0]!.conceptId : screen.turn.conceptId });
      } else if (screen.kind === 'capture') {
        state = respond(plan, state, { kind: 'capture', picks: Object.fromEntries(screen.groups.map(g => [g.conceptId, g.correct])) });
      } else state = proceed(plan, state);
    }
    if (state.phase !== 'complete') throw new Error('Fixture did not finish');
    return { trace, state };
  };
  const clean = run(() => false);
  const one = run((s, c) => s.phase === 'diagnostic' && c === 'coffee.order');
  const two = run((s, c) => s.phase === 'diagnostic' && ['coffee.order', 'shop.bag'].includes(c));
  const almost = run((s, c) => s.phase === 'diagnostic' && ['coffee.order', 'shop.bag', 'plans.surf'].includes(c));
  const review = run((_s, c) => ['dinner.order', 'shop.where', 'shop.bag'].includes(c));
  const retry = run((s, c) => s.phase === 'one-take' && c === 'coffee.later' && !s.retry);
  const find = (trace: CheckpointState[], pred: (s: CheckpointState) => boolean) => {
    const s = trace.find(pred); if (!s) throw new Error('Missing visual state'); return s;
  };
  const at = (id: string) => find(clean.trace, s => s.phase === 'one-take' && s.beat === 'ask' && s.agenda[s.cursor]?.turn === id);
  const card = (s: CheckpointState) => s.phase === 'repair' && checkpointScreen(plan, s).kind === 'card';
  const start = startCheckpoint(plan);
  return { plan, states: {
    'scan-start': start,
    'scan-help': requestHelp(plan, start),
    'scan-options': revealOptions(plan, start),
    'scan-five': find(clean.trace, s => s.phase === 'diagnostic' && s.cursor === 4),
    'one-fix': find(one.trace, card),
    'two-fixes': find(two.trace, card),
    morning: at('morning.order'), plans: at('plans.free'), supermarket: at('shop.help'),
    checkout: at('shop.everything'), dinner: at('dinner.reservation'), later: at('dinner.okay'),
    slow: find(retry.trace, s => !!s.slow && s.beat === 'ask'),
    reveal: find(retry.trace, s => s.phase === 'one-take' && s.beat === 'reveal'),
    'final-fix': find(retry.trace, s => s.phase === 'final-repair' && checkpointScreen(plan, s).kind === 'card'),
    ready: clean.state, almost: almost.state, review: review.state,
  } };
}
