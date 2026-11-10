import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { learnedBefore, auditWords } from './priorLearning.js';
import { auditCheckpoint, checkpointTransfer } from './checkpointAudit.js';
import {
  checkpointScreen, currentTurn, interactionCount, isConcealed, isMastered, isRestorable, planConcepts, proceed, respond, revealOptions, sceneProgress, startCheckpoint, turnConcepts,
  type CheckpointPlan, type CheckpointScreen, type CheckpointState,
} from './checkpoint.js';
import { ARRIVAL_ANSWER, ARRIVAL_FACTS } from './core/arrivalDay.js';
import type { BootcampDayContent, BootcampStep } from './types.js';
import type * as CheckpointUi from './CheckpointStep.js';
import type * as BootcampStore from './bootcampStore.js';

/**
 * Mission 10 — CHECKPOINT: Arrival Day, as an ADAPTIVE checkpoint: retrieve first → repair only what
 * fails → retrieve again in real context. What is pinned here: the locked dialogue in all three
 * languages; nothing taught before the day; no answer on screen before its line; repairs by concept,
 * only of what was missed; mastery by demonstration, not by score; a state that saves and restores;
 * the narrow, checkpoint-only recombination rule (and that it is no loophole); and that every other
 * mission is byte-for-byte as it was.
 */
const LANGS = ['en', 'fr', 'es'] as const;
type Lang = (typeof LANGS)[number];
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const mission = (lang: Lang, n = 10): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const planOf = (lang: Lang): CheckpointPlan => {
  const step = mission(lang).steps.find((s): s is Extract<BootcampStep, { kind: 'checkpoint' }> => s.kind === 'checkpoint');
  if (!step) throw new Error(`no checkpoint in ${lang}`);
  return step.plan;
};

/* ── the locked dialogue ─────────────────────────────────────────────────────────────────────── */

type Line = readonly ['npc' | 'you', string];
const LOCKED: Record<Lang, readonly (readonly Line[])[]> = {
  en: [
    [['npc', 'Passport, please.'], ['you', 'Here you go.'], ['npc', "What's the purpose of your visit?"], ['you', "I'm here on holiday."], ['npc', 'How long are you staying?'], ['you', 'For two weeks.'], ['npc', 'Where are you staying?'], ['you', 'At a hotel in the city centre.'], ['npc', 'Anything to declare?'], ['you', 'Nothing to declare.'], ['npc', 'Welcome, and enjoy your stay!']],
    [['npc', 'Hello! Where to?'], ['you', 'To this address, please.'], ['npc', "It's about fifteen euros. There's a lot of traffic right now."], ['you', 'Okay, thank you.'], ['npc', '…We are almost there. Is here okay?'], ['you', 'Stop here, please. Keep the change.'], ['npc', 'Thank you very much! Enjoy your trip!']],
    [['npc', 'Good evening! How can I help you?'], ['you', 'I have a reservation, under the name Cohen.'], ['npc', 'Welcome, Mr. Cohen. Your passport, please.'], ['you', 'Here you go.'], ['npc', "Thank you. You're in room two-oh-four, on the second floor. Here is your key."], ['you', 'Is breakfast included?'], ['npc', 'Yes, from seven to ten. Enjoy your stay.']],
  ],
  es: [
    [['npc', 'Pasaporte, por favor.'], ['you', 'Aquí tiene.'], ['npc', '¿Cuál es el motivo de su viaje?'], ['you', 'Estoy de vacaciones.'], ['npc', '¿Cuánto tiempo se queda?'], ['you', 'Dos semanas.'], ['npc', '¿Dónde se aloja?'], ['you', 'En un hotel en el centro.'], ['npc', '¿Algo que declarar?'], ['you', 'Nada que declarar.'], ['npc', 'Bienvenido, ¡y que disfrute su estancia!']],
    [['npc', '¡Hola! ¿A dónde va?'], ['you', 'A esta dirección, por favor.'], ['npc', 'Son unos quince euros. Hay mucho tráfico ahora mismo.'], ['you', 'De acuerdo, gracias.'], ['npc', '…Ya casi llegamos. ¿Aquí está bien?'], ['you', 'Pare aquí, por favor. Quédese con el cambio.'], ['npc', '¡Muchas gracias! ¡Buen viaje!']],
    [['npc', '¡Buenas noches! ¿En qué puedo ayudarle?'], ['you', 'Tengo una reserva, a nombre de Cohen.'], ['npc', 'Bienvenido, señor Cohen. Su pasaporte, por favor.'], ['you', 'Aquí tiene.'], ['npc', 'Gracias. Está en la habitación doscientos cuatro, en el segundo piso. Aquí tiene su llave.'], ['you', '¿El desayuno está incluido?'], ['npc', 'Sí, de siete a diez. Que disfrute su estancia.']],
  ],
  fr: [
    [['npc', 'Passeport, s’il vous plaît.'], ['you', 'Voilà, tenez.'], ['npc', 'Quel est le motif de votre visite ?'], ['you', 'Je suis en vacances.'], ['npc', 'Vous restez combien de temps ?'], ['you', 'Pour deux semaines.'], ['npc', 'Où logez-vous ?'], ['you', 'Dans un hôtel dans le centre-ville.'], ['npc', 'Quelque chose à déclarer ?'], ['you', 'Rien à déclarer.'], ['npc', 'Bienvenue, et bon séjour !']],
    [['npc', 'Bonjour ! Où allez-vous ?'], ['you', 'À cette adresse, s’il vous plaît.'], ['npc', 'C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.'], ['you', 'D’accord, merci.'], ['npc', '…On est presque arrivés. Ici, ça va ?'], ['you', 'Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.'], ['npc', 'Merci beaucoup ! Bon voyage !']],
    [['npc', 'Bonsoir ! Comment puis-je vous aider ?'], ['you', 'J’ai une réservation, au nom de Cohen.'], ['npc', 'Bienvenue, monsieur Cohen. Votre passeport, s’il vous plaît.'], ['you', 'Voilà, tenez.'], ['npc', 'Merci. Vous êtes dans la chambre deux cent quatre, au deuxième étage. Voici votre clé.'], ['you', 'Le petit-déjeuner est compris ?'], ['npc', 'Oui, de sept à dix heures. Bon séjour.']],
  ],
};
const youLines = (lang: Lang): Set<string> => new Set(LOCKED[lang].flat().filter(([w]) => w === 'you').map(([, t]) => t));
const npcLines = (lang: Lang): Set<string> => new Set(LOCKED[lang].flat().filter(([w]) => w === 'npc').map(([, t]) => t));
/** A scene, line by line, as the mission stores it. */
const sceneLines = (lang: Lang, id: string): Line[] => mission(lang).dialogues[id]!.nodes.map((n) => [n.who, n.who === 'npc' ? n.en : n.choices!.map((c) => c.en).join(' | ')] as Line);

/* ── a learner, driven through the state machine ─────────────────────────────────────────────── */

/** Whether the learner answers this concept right, in this phase, on this attempt (1-based). */
type Policy = (phase: CheckpointState['phase'], conceptId: string, attempt: number) => boolean;
const perfect: Policy = () => true;
/** Misses the given concepts the first time it meets them in the given phase, and only then. */
const missing = (phase: CheckpointState['phase'], ids: readonly string[]): Policy => (p, c, n) => !(p === phase && ids.includes(c) && n === 1);
const both = (a: Policy, b: Policy): Policy => (p, c, n) => a(p, c, n) && b(p, c, n);

interface Trace { phase: CheckpointState['phase']; screen: CheckpointScreen; json: string }
function drive(plan: CheckpointPlan, policy: Policy, from: CheckpointState = startCheckpoint(plan)): { state: CheckpointState; trace: Trace[] } {
  let state = from;
  const trace: Trace[] = [];
  for (let guard = 0; guard < 400; guard++) {
    const screen = checkpointScreen(plan, state);
    trace.push({ phase: state.phase, screen, json: JSON.stringify(screen) });
    if (screen.kind === 'complete') return { state, trace };
    const attempt = (c: string): number => state.attempts.filter((a) => a.conceptId === c && a.phase === state.phase).length + 1;
    if (screen.kind === 'say' && screen.concealed) state = revealOptions(plan, state); // one-take: "show the options"
    else if (screen.kind === 'say') {
      const ok = policy(state.phase, screen.turn.conceptId, attempt(screen.turn.conceptId));
      state = respond(plan, state, { kind: 'say', conceptId: ok ? screen.turn.conceptId : screen.turn.wrong[0]!.conceptId });
    } else if (screen.kind === 'capture') {
      const picks = Object.fromEntries(screen.groups.map((g) => [g.conceptId, policy(state.phase, g.conceptId, attempt(g.conceptId)) ? g.correct : g.choices.find((c) => c.id !== g.correct)!.id]));
      state = respond(plan, state, { kind: 'capture', picks });
    } else state = proceed(plan, state);
  }
  throw new Error('the checkpoint never finished');
}
const asks = (t: Trace[]): Trace[] => t.filter((x) => (x.screen.kind === 'say' && !x.screen.concealed) || x.screen.kind === 'capture');
const phasesSeen = (t: Trace[]): string[] => [...new Set(t.map((x) => x.phase))];
/** The state right after the diagnostic (the first screen of whatever comes next). */
function afterDiagnostic(plan: CheckpointPlan, policy: Policy): CheckpointState {
  let state = startCheckpoint(plan);
  const run = drive(plan, policy);
  // Re-walk to the first non-diagnostic state.
  for (const _ of run.trace) {
    if (state.phase !== 'diagnostic') return state;
    const screen = checkpointScreen(plan, state);
    if (screen.kind === 'say') state = respond(plan, state, { kind: 'say', conceptId: policy('diagnostic', screen.turn.conceptId, 1) ? screen.turn.conceptId : screen.turn.wrong[0]!.conceptId });
    else if (screen.kind === 'capture') state = respond(plan, state, { kind: 'capture', picks: Object.fromEntries(screen.groups.map((g) => [g.conceptId, policy('diagnostic', g.conceptId, 1) ? g.correct : g.choices.find((c) => c.id !== g.correct)!.id])) });
    else state = proceed(plan, state);
  }
  return state;
}

const CONCEPTS = [
  'border.passport-response', 'border.holiday', 'border.duration', 'border.stay', 'border.declaration',
  'taxi.destination', 'taxi.fare', 'taxi.traffic', 'taxi.acknowledge', 'taxi.stop-change',
  'hotel.reservation', 'hotel.passport-response', 'hotel.room', 'hotel.floor', 'hotel.breakfast-question', 'hotel.breakfast-hours',
];

/* ── 1–12 structure ──────────────────────────────────────────────────────────────────────────── */

describe('structure', () => {
  for (const [k, lang] of [[1, 'en'], [2, 'es'], [3, 'fr']] as const) {
    it(`${k}. the ${lang.toUpperCase()} dialogue is exactly the locked one — wording, order, scenes, roles`, () => {
      expect(Object.keys(mission(lang).dialogues)).toEqual(['cold-border', 'cold-taxi', 'cold-hotel']);
      expect(['cold-border', 'cold-taxi', 'cold-hotel'].map((id) => sceneLines(lang, id))).toEqual(LOCKED[lang]);
      // …and nothing hangs off it: no wrong branch, no recovery beat, no tool.
      for (const dl of Object.values(mission(lang).dialogues)) for (const n of dl.nodes) expect(n.choices?.length ?? 1, `${lang} ${dl.id}/${n.id}`).toBe(1);
    });
  }
  it('4. Mission 10 is tenth in the Core 30, with its id and key', () => {
    expect(BOOTCAMP_PLAN[9]!.id).toBe('arrival-day-checkpoint');
    expect(BOOTCAMP_PLAN[9]!.checkpoint).toBe(true);
    expect(missionNumber(BOOTCAMP_PLAN[9]!.day)).toBe(10);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('5. Missions 01–09 are byte-for-byte unchanged', () => {
    expect(raw(0, 9)).toEqual({ en: 'cdce44aa', fr: '280ec919', es: '535188cc' });
  });
  it('6. Missions 19–30 (Missions 16–18 have their own passes since: mission16.test.ts … mission18.test.ts) are byte-for-byte unchanged (Missions 11–15 have their own passes since)', () => {
    expect(raw(18, 23)).toEqual({ en: '2610dcde', es: 'b7abb616', fr: '223af58a' }); expect(raw(24)).toEqual({ en: 'aee7fe64', es: '4b9c9cd9', fr: '6af8deb0' }); // Mission 24 left out: its own correction since (the "should" card — practiceCity.test.ts) // Missions 17–30 (Missions 11–15 have their own passes since: mission11.test.ts … mission15.test.ts)
  });
  it('7. no Step 0 — and no vocabulary block of any kind', () => {
    for (const lang of LANGS) {
      const steps = mission(lang).steps;
      expect(steps.map((s) => s.kind), lang).toEqual(['talk', 'checkpoint', 'summary']);
      expect(steps.some((s) => s.kind === 'prime'), lang).toBe(false);
    }
  });
  it('8. no pre-teaching and no builders on the base path: only say and capture turns', () => {
    for (const lang of LANGS) {
      for (const s of mission(lang).steps) expect(['tool', 'prime', 'replies', 'quiz', 'swipe', 'sentenceBuilder', 'matchPairs'], lang).not.toContain(s.kind);
      for (const t of planOf(lang).turns) expect(['say', 'capture'], `${lang} ${t.id}`).toContain(t.kind);
      expect(asks(drive(planOf(lang), perfect).trace).every((x) => x.screen.kind === 'say' || x.screen.kind === 'capture')).toBe(true);
    }
  });
  it('9. the diagnostic comes first, the repair after it', () => {
    const { trace } = drive(planOf('en'), missing('diagnostic', ['border.duration']));
    expect(phasesSeen(trace)).toEqual(['diagnostic', 'repair', 'one-take', 'complete']);
  });
  it('10. a repair happens only when something was missed', () => {
    expect(phasesSeen(drive(planOf('en'), perfect).trace)).not.toContain('repair');
    expect(phasesSeen(drive(planOf('en'), missing('diagnostic', ['taxi.fare'])).trace)).toContain('repair');
  });
  it('11. the one-take comes after the diagnostic and after any repair', () => {
    for (const policy of [perfect, missing('diagnostic', ['hotel.room', 'border.stay'])]) {
      const seen = phasesSeen(drive(planOf('en'), policy).trace);
      expect(seen.indexOf('one-take')).toBeGreaterThan(seen.indexOf('diagnostic'));
      if (seen.includes('repair')) expect(seen.indexOf('one-take')).toBeGreaterThan(seen.indexOf('repair'));
    }
  });
  it('12. completion requires every queue to be empty', () => {
    const plan = planOf('en');
    const { state } = drive(plan, both(missing('diagnostic', ['taxi.traffic']), missing('one-take', ['hotel.floor'])));
    expect(state.phase).toBe('complete');
    expect([state.repairQueue, state.finalRepairQueue]).toEqual([[], []]);
    expect(isMastered(state)).toBe(true);
  });
});

/* ── 13–21 no spoilers ───────────────────────────────────────────────────────────────────────── */

describe('no spoilers', () => {
  const opening = (lang: Lang): string => JSON.stringify(mission(lang).steps[0]);
  const NEVER: [n: number, what: string, pattern: RegExp][] = [
    [13, 'the two-weeks answer', /two weeks|deux semaines|dos semanas|שבועיים|שבועות/i],
    [14, '€15', /€|15|fifteen|quinze|מחיר/i],
    [15, 'the traffic answer', /traffic|circulation|tráfico|פקק/i],
    [16, 'room 204', /204|two-oh-four|חדר/i],
    [17, 'floor 2', /floor|étage|piso|קומה/i],
    [18, '7–10', /7–10|seven to ten|sept|siete|ארוחת/i],
  ];
  for (const [n, what, pattern] of NEVER) {
    it(`${n}. the opening shows no ${what}`, () => {
      for (const lang of LANGS) expect(opening(lang), lang).not.toMatch(pattern);
    });
  }
  /** Every screen of a run before the first one whose cue is `line`. */
  const before = (lang: Lang, line: string): Trace[] => {
    const { trace } = drive(planOf(lang), perfect);
    const at = trace.findIndex((x) => (x.screen.kind === 'say' || x.screen.kind === 'capture') && x.screen.turn.cue.en === line);
    expect(at, line).toBeGreaterThan(0);
    return trace.slice(0, at);
  };
  const FARE: Record<Lang, string> = { en: LOCKED.en[1]![2]![1], fr: LOCKED.fr[1]![2]![1], es: LOCKED.es[1]![2]![1] };
  const ROOM: Record<Lang, string> = { en: LOCKED.en[2]![4]![1], fr: LOCKED.fr[2]![4]![1], es: LOCKED.es[2]![4]![1] };
  const HOURS: Record<Lang, string> = { en: LOCKED.en[2]![6]![1], fr: LOCKED.fr[2]![6]![1], es: LOCKED.es[2]![6]![1] };
  it('19. the fare and the traffic appear only after the driver has said them', () => {
    for (const lang of LANGS) for (const x of before(lang, FARE[lang])) {
      expect(x.json, lang).not.toMatch(/€|taxi\.fare|taxi\.traffic|"traffic"|פקקים|traffic|circulation|tráfico/i);
    }
  });
  it('20. the room and the floor appear only after the receptionist has said them', () => {
    for (const lang of LANGS) for (const x of before(lang, ROOM[lang])) expect(x.json, lang).not.toMatch(/204|hotel\.room|hotel\.floor|floor-2/);
  });
  it('21. the breakfast hours appear only after the receptionist has said them', () => {
    for (const lang of LANGS) for (const x of before(lang, HOURS[lang])) expect(x.json, lang).not.toMatch(/7–10|h7-10|breakfast-hours/);
  });
});

/* ── 22–30 adaptivity ────────────────────────────────────────────────────────────────────────── */

describe('adaptivity — repair only what failed', () => {
  const plan = planOf('en');
  it('22. zero misses: the quick fix is skipped entirely — not even a "nothing to review" screen', () => {
    const { trace } = drive(plan, perfect);
    expect(trace.some((x) => x.phase === 'repair')).toBe(false);
    expect(trace.filter((x) => x.screen.kind === 'intro').map((x) => x.phase)).toEqual(['one-take']);
    expect(JSON.stringify(trace)).not.toMatch(/nothing to review|Quick fix/i);
  });
  it('23. one miss: exactly that concept enters the repair queue', () => {
    expect(afterDiagnostic(plan, missing('diagnostic', ['hotel.breakfast-hours'])).repairQueue).toEqual(['hotel.breakfast-hours']);
  });
  it('24. several misses: only those concepts, in the order of the day', () => {
    const s = afterDiagnostic(plan, missing('diagnostic', ['hotel.floor', 'border.declaration', 'taxi.fare']));
    expect(s.repairQueue).toEqual(['border.declaration', 'taxi.fare', 'hotel.floor']);
    expect(s.phase).toBe('repair');
  });
  it('25. a concept answered right never enters the queue', () => {
    const s = afterDiagnostic(plan, missing('diagnostic', ['taxi.traffic']));
    for (const c of CONCEPTS.filter((x) => x !== 'taxi.traffic')) expect(s.repairQueue).not.toContain(c);
  });
  it('26. queues hold concept ids — never screen, step or question numbers', () => {
    const s = afterDiagnostic(plan, missing('diagnostic', ['taxi.fare', 'hotel.room']));
    for (const c of s.repairQueue) { expect(CONCEPTS).toContain(c); expect(c).toMatch(/^(border|taxi|hotel)\.[a-z-]+$/); }
    expect(planConcepts(plan)).toEqual(CONCEPTS);
  });
  it('27. a repair that succeeds removes its concept', () => {
    let s = afterDiagnostic(plan, missing('diagnostic', ['border.duration', 'hotel.room']));
    s = proceed(plan, proceed(plan, proceed(plan, s))); // the quick-fix intro, then both answers shown (two concepts: exposures first)
    const screen = checkpointScreen(plan, s);
    expect(screen.kind === 'say' && screen.turn.conceptId).toBe('border.duration');
    s = respond(plan, s, { kind: 'say', conceptId: 'border.duration' });
    expect(s.repairQueue).toEqual(['hotel.room']);
  });
  it('the quick fix shows only the missed part of a capture (the road, not the fare)', () => {
    let s = proceed(plan, afterDiagnostic(plan, missing('diagnostic', ['taxi.traffic'])));
    const screen = checkpointScreen(plan, s);
    expect(screen.kind === 'capture' && screen.groups.map((g) => g.conceptId)).toEqual(['taxi.traffic']);
    // …a second miss gets its meaning, then ONE retry — and the day moves on either way.
    s = respond(plan, s, { kind: 'capture', picks: { 'taxi.traffic': 'clear' } });
    expect(checkpointScreen(plan, s).kind).toBe('reveal');
    s = proceed(plan, s);
    expect([s.retry, checkpointScreen(plan, s).kind]).toEqual([true, 'capture']);
    s = respond(plan, s, { kind: 'capture', picks: { 'taxi.traffic': 'clear' } });
    s = proceed(plan, proceed(plan, s));
    expect(s.phase).toBe('one-take');
  });
  it('28. a miss in the one-take creates a final-repair item', () => {
    const { trace } = drive(plan, missing('one-take', ['taxi.stop-change']));
    const final = trace.find((x) => x.phase === 'final-repair')!;
    expect(final).toBeDefined();
    const s = drive(plan, missing('one-take', ['taxi.stop-change'])).state;
    expect(s.attempts.filter((a) => a.phase === 'final-repair').map((a) => a.conceptId)).toEqual(['taxi.stop-change']);
  });
  it('29. the final repair does not rerun the checkpoint: only the missed concept is shown again', () => {
    const { trace } = drive(plan, missing('one-take', ['hotel.reservation']));
    const final = trace.filter((x) => x.phase === 'final-repair');
    const turns = new Set(final.flatMap((x) => ('turn' in x.screen ? [x.screen.turn.id] : [])));
    expect([...turns]).toEqual(['hotel.desk']);
    expect(final.map((x) => x.screen.kind)).toEqual(['intro', 'card', 'say']);
  });
  it('30. completion only once the final queue is empty — a repeated miss keeps the day open', () => {
    // Misses "Nothing to declare" in the one-take AND in the first final retrieval.
    const stubborn: Policy = (p, c, n) => !(c === 'border.declaration' && (p === 'one-take' || (p === 'final-repair' && n === 1)));
    const { state, trace } = drive(plan, stubborn);
    expect(trace.filter((x) => x.phase === 'final-repair' && x.screen.kind === 'say')).toHaveLength(2);
    expect(state.phase).toBe('complete');
    expect(state.finalRepairQueue).toEqual([]);
    // While it was still waiting, the day was not complete.
    const open = trace.findIndex((x) => x.phase === 'final-repair');
    expect(trace.slice(0, open).some((x) => x.screen.kind === 'complete')).toBe(false);
  });
});

/* ── 31–35 roles ─────────────────────────────────────────────────────────────────────────────── */

describe('roles: the learner says only the traveller\'s lines', () => {
  it('31. every line the learner can say is a locked YOU line', () => {
    for (const lang of LANGS) for (const t of planOf(lang).turns) if (t.kind === 'say') for (const o of [t.answer, ...t.wrong]) expect(youLines(lang).has(o.text), `${lang} ${o.text}`).toBe(true);
    // …and each turn's answer is the very line the locked dialogue has there.
    for (const lang of LANGS) {
      const said = planOf(lang).turns.filter((t) => t.kind === 'say').map((t) => (t.kind === 'say' ? t.answer.text : ''));
      expect(said, lang).toEqual(LOCKED[lang].flat().filter(([w]) => w === 'you').map(([, x]) => x));
    }
  });
  it('32. the other person\'s lines are heard and understood — never offered as something to say', () => {
    for (const lang of LANGS) for (const t of planOf(lang).turns) {
      expect(npcLines(lang).has(t.cue.en), `${lang} ${t.cue.en}`).toBe(true);
      if (t.kind === 'say') for (const o of [t.answer, ...t.wrong]) expect(npcLines(lang).has(o.text), lang).toBe(false);
    }
  });
  const skill = (id: string): string => startCheckpoint(planOf('en')).results.find((r) => r.conceptId === id)!.skill;
  it('33. the fare and the traffic are comprehension', () => { expect([skill('taxi.fare'), skill('taxi.traffic')]).toEqual(['comprehension', 'comprehension']); });
  it('34. the room and the floor are comprehension', () => { expect([skill('hotel.room'), skill('hotel.floor')]).toEqual(['comprehension', 'comprehension']); });
  it('35. the breakfast hours are comprehension', () => {
    expect(skill('hotel.breakfast-hours')).toBe('comprehension');
    expect(CONCEPTS.filter((c) => skill(c) === 'production')).toHaveLength(11);
  });
});

/* ── 36–41 information capture ───────────────────────────────────────────────────────────────── */

describe('information capture', () => {
  const plan = planOf('en');
  const captureAt = (id: string): CheckpointState => {
    let s = startCheckpoint(plan);
    while (currentTurn(plan, s)!.id !== id) {
      const screen = checkpointScreen(plan, s);
      s = screen.kind === 'say' ? respond(plan, s, { kind: 'say', conceptId: screen.turn.conceptId })
        : screen.kind === 'capture' ? respond(plan, s, { kind: 'capture', picks: Object.fromEntries(screen.groups.map((g) => [g.conceptId, g.correct])) })
          : proceed(plan, s);
    }
    return s;
  };
  it('36. the taxi capture asks for BOTH the fare and the road, on one screen', () => {
    const s = captureAt('taxi.fare-road');
    const screen = checkpointScreen(plan, s);
    expect(screen.kind === 'capture' && screen.groups.map((g) => g.conceptId)).toEqual(['taxi.fare', 'taxi.traffic']);
    const half = respond(plan, s, { kind: 'capture', picks: { 'taxi.fare': ARRIVAL_ANSWER.fare, 'taxi.traffic': 'clear' } });
    expect(half.repairQueue).toEqual(['taxi.traffic']);
    expect(half.results.find((r) => r.conceptId === 'taxi.fare')!.correct).toBe(true);
    expect(interactionCount(half).diagnostic).toBe(7); // one screen, one interaction
  });
  const right = (id: string, concept: string, pick: string): boolean => {
    const s = respond(plan, captureAt(id), { kind: 'capture', picks: { ...Object.fromEntries((checkpointScreen(plan, captureAt(id)) as Extract<CheckpointScreen, { kind: 'capture' }>).groups.map((g) => [g.conceptId, g.correct])), [concept]: pick } });
    return !s.repairQueue.includes(concept);
  };
  it('37. the room capture accepts 204 — and only 204', () => {
    expect([right('hotel.room-floor', 'hotel.room', 'r204'), right('hotel.room-floor', 'hotel.room', 'r214'), right('hotel.room-floor', 'hotel.room', 'r240')]).toEqual([true, false, false]);
  });
  it('38. the floor capture accepts floor 2 — and only 2', () => {
    expect([right('hotel.room-floor', 'hotel.floor', 'floor-1'), right('hotel.room-floor', 'hotel.floor', 'floor-2'), right('hotel.room-floor', 'hotel.floor', 'floor-3')]).toEqual([false, true, false]);
  });
  it('39. the breakfast capture accepts 7–10 — and only 7–10', () => {
    expect([right('hotel.hours', 'hotel.breakfast-hours', 'h7-9'), right('hotel.hours', 'hotel.breakfast-hours', 'h7-10'), right('hotel.hours', 'hotel.breakfast-hours', 'h8-10')]).toEqual([false, true, false]);
  });
  it('40. no arithmetic: each answer is the very figure that was said', () => {
    const groups = plan.turns.flatMap((t) => (t.kind === 'capture' ? t.groups : []));
    const label = (c: string): string => { const g = groups.find((x) => x.conceptId === c)!; return g.choices.find((x) => x.id === g.correct)!.label ?? g.correct; };
    expect([label('taxi.fare'), label('hotel.room'), label('hotel.floor'), label('hotel.breakfast-hours')]).toEqual([`€${ARRIVAL_FACTS.fare}`, String(ARRIVAL_FACTS.room), String(ARRIVAL_FACTS.floor), ARRIVAL_FACTS.breakfast]);
    for (const g of groups) for (const c of g.choices) expect(c.label ?? '').not.toMatch(/[+×=]|€20/);
  });
  it('41. no positional shortcut: lines are reshuffled per attempt, figures sit in their natural order', () => {
    for (const lang of LANGS) {
      const { trace } = drive(planOf(lang), perfect);
      const slots = asks(trace).flatMap((x) => (x.screen.kind === 'say' ? [x.screen.options.findIndex((o) => o.conceptId === (x.screen as Extract<CheckpointScreen, { kind: 'say' }>).turn.conceptId)] : []));
      expect(new Set(slots).size, lang).toBeGreaterThanOrEqual(3); // the right line is not always in one place
    }
    for (const t of plan.turns) if (t.kind === 'capture') for (const g of t.groups) {
      const figures = g.choices.map((c) => c.label).filter(Boolean).map((l) => Number.parseInt(l!.replace(/\D/g, ''), 10));
      if (g.ui === 'figures') expect(figures).toEqual([...figures].sort((a, b) => a - b));
      if (g.ui === 'floor') expect(figures).toEqual([3, 2, 1]); // the panel, top floor first
    }
    // Equal treatment: within a group, every choice has the same kind of face (figure, or picture + caption).
    for (const t of plan.turns) if (t.kind === 'capture') for (const g of t.groups) expect(new Set(g.choices.map((c) => `${Boolean(c.label)}${Boolean(c.emoji)}${Boolean(c.caption)}`)).size).toBe(1);
  });
});

/* ── 42–46 prior transfer ────────────────────────────────────────────────────────────────────── */

describe('prior transfer — checkpoint-only, and no loophole', () => {
  it('42. prior learning is Missions 01–09, and every line of the day passes the checkpoint audit', () => {
    for (const lang of LANGS) {
      const prior = learnedBefore(lang, 10);
      expect(prior.missions, lang).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(auditCheckpoint(planOf(lang), prior).failures, lang).toEqual([]);
    }
  });
  it('43. the global prior-learning rules are untouched: the allowance lives in checkpointAudit.ts alone', () => {
    const src = readFileSync(fileURLToPath(new URL('./priorLearning.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/checkpoint|recombin/i);
    // The French breakfast line is NOT a taught chunk for learnedBefore — only the checkpoint rule accepts it.
    const prior = learnedBefore('fr', 10);
    expect(prior.knowsChunk('Oui, de sept à dix heures. Bon séjour.')).toBe(false);
    expect(prior.knowsChunk('de sept à dix heures')).toBe(false);
    expect(checkpointTransfer('Oui, de sept à dix heures. Bon séjour.', prior).how).toBe('recombined');
  });
  it('44. recombination accepts only fully known material, chunk by chunk', () => {
    for (const lang of LANGS) {
      const prior = learnedBefore(lang, 10);
      for (const row of auditCheckpoint(planOf(lang), prior).rows) {
        expect(row.result.how, `${lang} ${row.where}`).not.toBe('unknown');
        if (row.result.how === 'recombined') for (const w of auditWords(row.result.text)) expect(prior.words.has(w) || prior.knowsChunk(w), `${lang} ${w}`).toBe(true);
        if (row.role === 'say') expect(['taught', 'chunks'], `${lang} ${row.where}`).toContain(row.result.how);
      }
    }
  });
  it('45. NEGATIVE — a genuinely new word ("customs form") makes the checkpoint audit FAIL', () => {
    const plan = planOf('en');
    const planted: CheckpointPlan = { ...plan, turns: plan.turns.map((t) => (t.id === 'border.declare' ? { ...t, cue: { ...t.cue, en: 'Anything to declare? Your customs form, please.' } } : t)) };
    const { failures } = auditCheckpoint(planted, learnedBefore('en', 10));
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/customs, form/);
    // …and a new word in a learner line fails too, even beside known ones.
    const said: CheckpointPlan = { ...plan, turns: plan.turns.map((t) => (t.kind === 'say' && t.id === 'border.declare' ? { ...t, answer: { ...t.answer, text: 'Nothing to declare. Here is my customs form.' } } : t)) };
    expect(auditCheckpoint(said, learnedBefore('en', 10)).failures.join(' ')).toMatch(/customs/);
  });
  it('46. a line only HEARD in an earlier conversation still does not count as learned', () => {
    // "No rush. Whenever you're ready." is said by the officer in Mission 06 — conversation, never taught.
    const prior = learnedBefore('en', 10);
    expect(prior.words.has('rush')).toBe(false);
    expect(checkpointTransfer('No rush.', prior).how).toBe('unknown');
    const plan = planOf('en');
    const planted: CheckpointPlan = { ...plan, scenes: plan.scenes.map((s) => (s.id === 'border' ? { ...s, closing: { ...s.closing!, en: 'No rush. Welcome, and enjoy your stay!' } } : s)) };
    expect(auditCheckpoint(planted, prior).failures.join(' ')).toMatch(/rush/);
  });
});

/* ── 47–50 mastery ───────────────────────────────────────────────────────────────────────────── */

describe('mastery is demonstration, not a score', () => {
  const plan = planOf('en');
  it('47. every core concept must end up demonstrated', () => {
    for (const policy of [perfect, missing('diagnostic', CONCEPTS), missing('one-take', CONCEPTS), both(missing('diagnostic', CONCEPTS.slice(0, 8)), missing('one-take', CONCEPTS.slice(8)))]) {
      const { state } = drive(plan, policy);
      expect(state.results.map((r) => [r.conceptId, r.correct])).toEqual(CONCEPTS.map((c) => [c, true]));
    }
  });
  it('48. a high score is not mastery: 15 of 16 right in the one-take still leaves the day open', () => {
    let state = startCheckpoint(plan);
    const policy = missing('one-take', ['hotel.room']);
    const run = drive(plan, policy);
    const until = run.trace.findIndex((x) => x.phase === 'final-repair');
    expect(until).toBeGreaterThan(0);
    // Re-walk to the end of the one-take.
    for (let i = 0; i < until; i++) {
      const sc = checkpointScreen(plan, state);
      const n = (c: string): number => state.attempts.filter((a) => a.conceptId === c && a.phase === state.phase).length + 1;
      state = sc.kind === 'say' && sc.concealed ? revealOptions(plan, state)
        : sc.kind === 'say' ? respond(plan, state, { kind: 'say', conceptId: sc.turn.conceptId })
          : sc.kind === 'capture' ? respond(plan, state, { kind: 'capture', picks: Object.fromEntries(sc.groups.map((g) => [g.conceptId, policy(state.phase, g.conceptId, n(g.conceptId)) ? g.correct : 'r214'])) })
          : proceed(plan, state);
    }
    const oneTake = state.attempts.filter((a) => a.phase === 'one-take');
    expect(oneTake.filter((a) => a.correct).length / oneTake.length).toBeGreaterThan(0.9);
    expect(state.phase).toBe('final-repair');
    expect(state.results.every((r) => r.correct)).toBe(true); // every concept demonstrated at least once…
    expect(state.finalRepairQueue).toEqual(['hotel.room']); // …but the miss is repaired before the day is done
    expect(isMastered(state)).toBe(false);
    // And nothing in the engine compares a ratio or counts points.
    const code = readFileSync(fileURLToPath(new URL('./checkpoint.ts', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/\b(score|percent|points|stars)\b|0\.\d|\/ *total/i);
  });
  it('49. a concept missed in the diagnostic is mastered after the quick fix and a retrieval', () => {
    const { state } = drive(plan, missing('diagnostic', ['border.stay']));
    const attempts = state.attempts.filter((a) => a.conceptId === 'border.stay').map((a) => [a.phase, a.correct, a.supported]);
    expect(attempts).toEqual([['diagnostic', false, false], ['repair', true, false], ['one-take', true, false]]);
    expect(state.results.find((r) => r.conceptId === 'border.stay')!.correct).toBe(true);
  });
  it('a correct retry right after being shown the answer does not count as demonstrated', () => {
    const twice: Policy = (p, c, n) => !(c === 'border.stay' && (p === 'diagnostic' || (p === 'repair' && n === 1)));
    let state = afterDiagnostic(plan, twice);
    state = proceed(plan, state);
    state = respond(plan, state, { kind: 'say', conceptId: 'border.duration' }); // the repair cue, missed again
    state = proceed(plan, state); // the meaning → the one retry
    state = respond(plan, state, { kind: 'say', conceptId: 'border.stay' });
    const r = state.results.find((x) => x.conceptId === 'border.stay')!;
    expect([r.correct, r.supportUsed]).toEqual([false, true]);
  });
  it('50. a learner with zero misses gets no teaching at all — and finishes in 28 interactions', () => {
    const { state, trace } = drive(plan, perfect);
    expect(trace.some((x) => x.screen.kind === 'reveal' || x.screen.kind === 'card')).toBe(false);
    expect(interactionCount(state)).toEqual({ diagnostic: 14, repair: 0, 'one-take': 14, 'final-repair': 0 });
  });
});

/* ── 51–55 state ─────────────────────────────────────────────────────────────────────────────── */

describe('state — serializable, restorable, no leak', () => {
  const plan = planOf('en');
  const midway = (): CheckpointState => {
    let s = afterDiagnostic(plan, missing('diagnostic', ['taxi.fare', 'hotel.floor']));
    s = proceed(plan, proceed(plan, proceed(plan, s))); // the intro, then both answers shown
    return respond(plan, s, { kind: 'capture', picks: { 'taxi.fare': 'e15' } });
  };
  it('51. the state serializes to plain JSON and back, unchanged', () => {
    const s = midway();
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });
  it('52. a restored state is accepted and shows the very same screen', () => {
    const s = midway();
    const back: unknown = JSON.parse(JSON.stringify(s));
    expect(isRestorable(plan, back)).toBe(true);
    expect(checkpointScreen(plan, back as CheckpointState)).toEqual(checkpointScreen(plan, s));
    expect(isRestorable(plan, { ...s, plan: 'another' })).toBe(false);
    expect(isRestorable(plan, { ...s, repairQueue: ['step-7'] })).toBe(false);
    expect(isRestorable(plan, null)).toBe(false);
  });
  it('53. the repair queue survives serialization', () => {
    const back = JSON.parse(JSON.stringify(midway())) as CheckpointState;
    expect(back.repairQueue).toEqual(['hotel.floor']);
    expect(back.phase).toBe('repair');
  });
  it('54. scene progress survives serialization', () => {
    let s = startCheckpoint(plan);
    for (let i = 0; i < 6; i++) { const sc = checkpointScreen(plan, s); s = sc.kind === 'say' ? respond(plan, s, { kind: 'say', conceptId: sc.turn.conceptId }) : proceed(plan, s); }
    const back = JSON.parse(JSON.stringify(s)) as CheckpointState;
    expect(sceneProgress(plan, back)).toEqual([{ id: 'border', state: 'done' }, { id: 'taxi', state: 'current' }, { id: 'hotel', state: 'next' }]);
  });
  it('55. a saved state carries no future information — only ids and results', () => {
    let s = startCheckpoint(plan);
    for (let i = 0; i < 3; i++) { const sc = checkpointScreen(plan, s); s = sc.kind === 'say' ? respond(plan, s, { kind: 'say', conceptId: sc.turn.conceptId }) : proceed(plan, s); }
    const json = JSON.stringify(s);
    expect(json).not.toMatch(/€|204|7–10|fifteen|two-oh-four|seven|פקקים|"label"|"choices"/);
    expect(JSON.stringify(checkpointScreen(plan, JSON.parse(json) as CheckpointState))).not.toMatch(/€|204|7–10/);
  });
});

/* ── 56–60 flow ──────────────────────────────────────────────────────────────────────────────── */

describe('flow — one continuous day', () => {
  const plan = planOf('en');
  it('56. border → taxi → hotel, in that order, in every pass', () => {
    expect(plan.scenes.map((s) => s.id)).toEqual(['border', 'taxi', 'hotel']);
    const { trace } = drive(plan, perfect);
    for (const phase of ['diagnostic', 'one-take'] as const) {
      const order = asks(trace).filter((x) => x.phase === phase).map((x) => ('turn' in x.screen ? x.screen.turn.scene : ''));
      expect([...new Set(order)], phase).toEqual(['border', 'taxi', 'hotel']);
    }
  });
  it('57. no summary between turns: a right answer goes straight to the next turn', () => {
    const { trace } = drive(plan, perfect);
    trace.forEach((x, i) => {
      const next = trace[i + 1];
      if (!next || x.screen.kind === 'intro' || x.screen.kind === 'scene-end' || x.screen.kind === 'complete') return;
      const sameScene = 'turn' in next.screen && 'turn' in x.screen && next.screen.turn.scene === x.screen.turn.scene;
      if (sameScene) expect(['say', 'capture']).toContain(next.screen.kind);
    });
    expect(JSON.stringify(trace)).not.toMatch(/Great job|Well done|כל הכבוד/);
  });
  it('58. transitions are brief: one line and a stamp at the end of each scene, nothing more', () => {
    const { trace } = drive(plan, perfect);
    const ends = trace.filter((x) => x.screen.kind === 'scene-end');
    expect(ends.map((x) => [x.phase, x.screen.kind === 'scene-end' && x.screen.scene.id])).toEqual([
      ['diagnostic', 'border'], ['diagnostic', 'taxi'], ['diagnostic', 'hotel'], ['one-take', 'border'], ['one-take', 'taxi'], ['one-take', 'hotel'],
    ]);
    expect(plan.scenes.map((s) => s.stamp.en)).toEqual(['🛂 BORDER CLEARED', '🚕 RIDE COMPLETE', '🏨 CHECK-IN COMPLETE']);
  });
  it('59. the day ends on ARRIVAL DAY COMPLETE — "You handled your first day abroad."', () => {
    const { trace } = drive(plan, perfect);
    expect(trace.at(-1)!.screen.kind).toBe('complete');
    for (const lang of LANGS) expect([planOf(lang).copy.completeTitle.en, planOf(lang).copy.completeBody.en]).toEqual(['🌍 ARRIVAL DAY COMPLETE', 'You handled your first day abroad.']);
    expect(plan.copy.oneTakeIntro.he).toBe('עכשיו מהמטוס עד לחדר — בלי עזרה.');
  });
  it('60. border, taxi and hotel are all marked complete', () => {
    expect(sceneProgress(plan, drive(plan, perfect).state)).toEqual([{ id: 'border', state: 'done' }, { id: 'taxi', state: 'done' }, { id: 'hotel', state: 'done' }]);
  });
});

/* ── parity, interaction counts, the screens, persistence ────────────────────────────────────── */

describe('one checkpoint in three languages', () => {
  it('the same turns, concepts, choices and answers in EN / FR / ES — only the words differ', () => {
    const shape = (p: CheckpointPlan) => [p.id, p.scenes.map((s) => [s.id, s.cast, s.stamp]), p.turns.map((t) => [t.id, t.kind, t.scene, t.heard ?? false, t.cue.pace ?? null, turnConcepts(t), t.kind === 'say' ? t.wrong.map((w) => w.conceptId) : t.groups.map((g) => [g.ui, g.correct, g.choices])]), p.copy];
    for (const lang of ['fr', 'es'] as const) expect(shape(planOf(lang)), lang).toEqual(shape(planOf('en')));
    for (const lang of ['fr', 'es'] as const) for (const [i, t] of planOf(lang).turns.entries()) expect(t.cue.en, `${lang} ${t.id}`).not.toBe(planOf('en').turns[i]!.cue.en);
  });
  it('the learner lines are the sentences Missions 06–08 taught: same id, same wording', () => {
    for (const lang of LANGS) {
      const before = new Map([6, 7, 8].flatMap((n) => mission(lang, n).items.map((i): [string, string] => [i.id, i.text])));
      for (const i of mission(lang).items) expect(before.get(i.id), `${lang} ${i.id}`).toBe(i.text);
      for (const t of planOf(lang).turns) if (t.kind === 'say') expect(before.has(t.answer.itemId), `${lang} ${t.answer.itemId}`).toBe(true);
    }
  });
  it('the elevator, "please speak slowly" and every recovery beat are gone', () => {
    for (const lang of LANGS) expect(JSON.stringify(mission(lang)), lang).not.toMatch(/elevator|ascenseur|ascensor|slowly|lentement|despacio|repeat|répéter|repetir/i);
  });
  it('interaction counts: strong 28 · one gap ≈ 30 · several gaps 30–35+, by design', () => {
    const plan = planOf('en');
    const total = (p: Policy): number => Object.values(interactionCount(drive(plan, p).state)).reduce((a, b) => a + b, 0);
    expect(total(perfect)).toBe(28);
    expect(total(missing('diagnostic', ['hotel.breakfast-hours']))).toBe(29);
    expect(total(both(missing('diagnostic', ['border.duration', 'taxi.fare', 'hotel.room']), missing('one-take', ['hotel.floor'])))).toBe(32);
    expect(total(both(missing('diagnostic', CONCEPTS.slice(0, 6)), missing('one-take', ['taxi.stop-change', 'hotel.reservation'])))).toBe(36);
  });
});

describe('the screens', () => {
  let ui: typeof CheckpointUi;
  let store: typeof BootcampStore;
  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    store = await import('./bootcampStore.js');
    ui = await import('./CheckpointStep.js');
    (await import('../../shared/i18n/strings.js')).setUiLangDict('he');
  });
  const plan = planOf('en');
  const render = (state: CheckpointState): string => renderToStaticMarkup(createElement(ui.CheckpointView, { plan, state, onChange: () => undefined, onDone: () => undefined }));
  const text = (html: string): string => html.replace(/<[^>]+>/g, ' ');
  it('the opening and the first turn give no answer away; the progress reads 🛂 · 🚕 · 🏨', () => {
    const html = render(startCheckpoint(plan));
    expect(html).toContain('Passport, please.');
    expect(text(html)).not.toMatch(/€|204|7–10|דרכון, בבקשה/); // the line is not translated before the answer
    expect(html.match(/<li class="is-/g)).toHaveLength(3);
  });
  it('the taxi capture: figures and road pictures, equal buttons, one confirm', () => {
    let s = startCheckpoint(plan);
    while (currentTurn(plan, s)!.id !== 'taxi.fare-road') { const sc = checkpointScreen(plan, s); s = sc.kind === 'say' ? respond(plan, s, { kind: 'say', conceptId: sc.turn.conceptId }) : proceed(plan, s); }
    const html = render(s);
    expect(html.match(/class="capture-choice"/g)).toHaveLength(5);
    for (const f of ['€5', '€15', '€50', 'פקקים', 'כביש פנוי']) expect(html).toContain(f);
    expect(html).toMatch(/<button class="btn-primary" disabled="">/);
  });
  it('a quick fix shows how many fixes are left — and a miss shows the line, its meaning and its sound', () => {
    const s = proceed(plan, afterDiagnostic(plan, missing('diagnostic', ['border.declaration', 'hotel.floor'])));
    expect(text(render(s))).toContain('נשארו 2');
    const missed = respond(plan, proceed(plan, proceed(plan, s)), { kind: 'say', conceptId: 'border.holiday' }); // past the two exposures
    const html = render(missed);
    expect(html).toContain('Nothing to declare.');
    expect(html).toContain('אין לי מה להצהיר.');
  });
  it('ARRIVAL DAY COMPLETE shows all three scenes ✅ and no score', () => {
    const html = text(render(drive(plan, perfect).state));
    expect(html).toContain('יום ההגעה הושלם');
    expect(html.match(/✅/g)!.length).toBeGreaterThanOrEqual(6);
    expect(html).not.toMatch(/%|\d+\s*\/\s*\d+|נקודות|כוכבים/);
  });
  it('watching the video or leaving keeps the checkpoint exactly where it was; a fresh start clears it', () => {
    const bc = store.useBootcampStore;
    bc.setState({ activeDay: 9, checkpoints: {}, stepIndex: {} });
    const s = afterDiagnostic(plan, missing('diagnostic', ['taxi.fare']));
    bc.getState().saveCheckpoint(s);
    bc.getState().toHub();          // the video overlay / the hub
    bc.getState().enterPractice();  // "continue" resumes
    expect(bc.getState().checkpoints['9']).toEqual(s);
    expect(JSON.parse(localStorage.getItem('ready.bootcamp.checkpoint.v1.en')!)['9']).toEqual(s);
    bc.getState().restartDay();
    expect(bc.getState().checkpoints['9']).toBeUndefined();
  });
});

/* ── refinement: concealed one-take retrieval · interleaved repairs ──────────────────────────── */

describe('refinement — recall before recognition, space between seeing and retrieving', () => {
  const plan = planOf('en');
  /** The first one-take screen (after its intro). */
  const oneTakeStart = (): CheckpointState => {
    let s = startCheckpoint(plan);
    while (s.phase !== 'one-take') {
      const sc = checkpointScreen(plan, s);
      s = sc.kind === 'say' ? respond(plan, s, { kind: 'say', conceptId: sc.turn.conceptId })
        : sc.kind === 'capture' ? respond(plan, s, { kind: 'capture', picks: Object.fromEntries(sc.groups.map((g) => [g.conceptId, g.correct])) })
          : proceed(plan, s);
    }
    return proceed(plan, s); // past "now from the plane to your room"
  };
  const render = async (state: CheckpointState): Promise<string> => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    const ui = await import('./CheckpointStep.js');
    (await import('../../shared/i18n/strings.js')).setUiLangDict('he');
    return renderToStaticMarkup(createElement(ui.CheckpointView, { plan, state, onChange: () => undefined, onDone: () => undefined }));
  };

  it('R1. one-take: a line of the learner\'s starts concealed — the cue only, no options', async () => {
    for (const lang of LANGS) {
      const p = planOf(lang);
      const { trace } = drive(p, perfect);
      const says = trace.filter((x) => x.phase === 'one-take' && x.screen.kind === 'say');
      // Each of the 11 lines: first concealed (cue only), then — once asked for — its options.
      expect(says.map((x) => (x.screen.kind === 'say' ? `${x.screen.concealed ?? false}:${x.screen.options.length}` : '')), lang).toEqual(Array.from({ length: 11 }, () => ['true:0', 'false:3']).flat());
    }
    const html = await render(oneTakeStart());
    expect(html).toContain('Passport, please.');
    expect(html).toContain('מה היית אומר?');
    expect(html).toContain('הצג אפשרויות');
    expect(html).not.toMatch(/btn-reply|Here you go\.|For two weeks\./);
  });
  it('R2. the learner must reveal the options: an answer while concealed is ignored', () => {
    const s = oneTakeStart();
    expect(isConcealed(plan, s)).toBe(true);
    expect(respond(plan, s, { kind: 'say', conceptId: 'border.passport-response' })).toBe(s);
    const shown = revealOptions(plan, s);
    const screen = checkpointScreen(plan, shown);
    expect(screen.kind === 'say' && [screen.concealed ?? false, screen.options.map((o) => o.conceptId).sort()]).toEqual([false, ['border.duration', 'border.passport-response', 'taxi.destination']]);
  });
  it('R3. revealing the options marks nothing — no attempt, no result, no queue', () => {
    const s = oneTakeStart();
    const shown = revealOptions(plan, s);
    expect({ ...shown, optionsShown: undefined }).toEqual({ ...s, optionsShown: undefined });
    expect([shown.attempts, shown.results, shown.repairQueue, shown.finalRepairQueue]).toEqual([s.attempts, s.results, s.repairQueue, s.finalRepairQueue]);
    // …and the options are the very same lines, in the same order, as before concealment existed.
    const screen = checkpointScreen(plan, shown);
    expect(screen.kind === 'say' && screen.options).toEqual(screen.kind === 'say' && [screen.turn.answer, ...screen.turn.wrong].sort((a, b) => screen.options.indexOf(a) - screen.options.indexOf(b)));
  });
  it('R4. the diagnostic (and the repairs) show their options at once, as before', () => {
    const { trace } = drive(plan, both(missing('diagnostic', ['border.stay', 'hotel.reservation']), missing('one-take', ['taxi.destination', 'hotel.passport-response'])));
    for (const x of trace.filter((t) => t.phase !== 'one-take' && t.screen.kind === 'say')) expect(x.screen.kind === 'say' && [x.screen.concealed ?? false, x.screen.options.length], x.phase).toEqual([false, 3]);
    expect(isConcealed(plan, startCheckpoint(plan))).toBe(false);
  });
  it('R5. comprehension captures are unchanged in the one-take: shown at once, never concealed', () => {
    const { trace } = drive(plan, perfect);
    const caps = trace.filter((x) => x.phase === 'one-take' && x.screen.kind === 'capture');
    expect(caps.map((x) => (x.screen.kind === 'capture' ? x.screen.groups.map((g) => g.conceptId) : []))).toEqual([['taxi.fare', 'taxi.traffic'], ['hotel.room', 'hotel.floor'], ['hotel.breakfast-hours']]);
    expect(JSON.stringify(caps)).not.toMatch(/concealed/);
  });
  it('R6. ONE missed concept keeps the compact fix: its cue straight away, no exposure card', () => {
    for (const c of ['border.duration', 'taxi.traffic', 'hotel.breakfast-hours']) {
      const { trace } = drive(plan, missing('diagnostic', [c]));
      expect(trace.filter((x) => x.phase === 'repair').map((x) => x.screen.kind), c).toEqual(['intro', c.startsWith('border') ? 'say' : 'capture']);
    }
  });
  it('R7. several missed concepts: every answer is shown first, then each is retrieved — in day order', () => {
    const { trace } = drive(plan, missing('diagnostic', ['hotel.floor', 'border.declaration', 'taxi.acknowledge']));
    const repair = trace.filter((x) => x.phase === 'repair').map((x) => `${x.screen.kind}:${'turn' in x.screen ? x.screen.turn.id : ''}`);
    expect(repair).toEqual([
      'intro:', 'card:border.declare', 'card:taxi.okay', 'card:hotel.room-floor',
      'say:border.declare', 'say:taxi.okay', 'capture:hotel.room-floor',
    ]);
    // A capture's exposure shows only its missed value; its retrieval asks only that.
    const floor = trace.find((x) => x.phase === 'repair' && x.screen.kind === 'capture')!;
    expect(floor.screen.kind === 'capture' && floor.screen.groups.map((g) => g.conceptId)).toEqual(['hotel.floor']);
  });
  it('R8. several final-repair concepts: the same rule — all cards, then all retrievals; one concept stays compact', () => {
    const many = drive(plan, missing('one-take', ['hotel.reservation', 'border.holiday', 'taxi.fare'])).trace.filter((x) => x.phase === 'final-repair');
    expect(many.map((x) => `${x.screen.kind}:${'turn' in x.screen ? x.screen.turn.id : ''}`)).toEqual([
      'intro:', 'card:border.purpose', 'card:taxi.fare-road', 'card:hotel.desk', 'say:border.purpose', 'capture:taxi.fare-road', 'say:hotel.desk',
    ]);
    const one = drive(plan, missing('one-take', ['hotel.reservation'])).trace.filter((x) => x.phase === 'final-repair');
    expect(one.map((x) => x.screen.kind)).toEqual(['intro', 'card', 'say']);
  });
  it('R9. queues and mastery are unchanged: same queues, same results, same interaction counts', () => {
    const policy = both(missing('diagnostic', ['border.stay', 'taxi.fare', 'hotel.floor']), missing('one-take', ['taxi.stop-change', 'hotel.room']));
    const { state } = drive(plan, policy);
    expect(state.results.every((r) => r.correct)).toBe(true);
    expect([state.repairQueue, state.finalRepairQueue, state.phase]).toEqual([[], [], 'complete']);
    expect(interactionCount(state)).toEqual({ diagnostic: 14, repair: 3, 'one-take': 14, 'final-repair': 2 });
    // Exposure cards record nothing; every retrieval after them is a real (unsupported) attempt.
    expect(state.attempts.filter((a) => a.phase === 'repair').map((a) => [a.conceptId, a.correct, a.supported])).toEqual([['border.stay', true, false], ['taxi.fare', true, false], ['hotel.floor', true, false]]);
    // A correct retry right after being shown the answer still does not count.
    const twice: Policy = (p, c, n) => !(c === 'border.stay' && (p === 'diagnostic' || (p === 'repair' && n === 1)));
    const after = drive(plan, twice).state.attempts.filter((a) => a.conceptId === 'border.stay').map((a) => [a.phase, a.correct, a.supported]);
    expect(after).toEqual([['diagnostic', false, false], ['repair', false, false], ['repair', true, true], ['one-take', true, false]]);
  });
  it('R10. a concealed one-take turn is saved and restored concealed; a revealed one, revealed', () => {
    const s = oneTakeStart();
    const back = JSON.parse(JSON.stringify(s)) as CheckpointState;
    expect(isRestorable(plan, back)).toBe(true);
    expect(checkpointScreen(plan, back)).toEqual(checkpointScreen(plan, s));
    const shown = JSON.parse(JSON.stringify(revealOptions(plan, s))) as CheckpointState;
    expect(isRestorable(plan, shown)).toBe(true);
    const screen = checkpointScreen(plan, shown);
    expect(screen.kind === 'say' && screen.options.length).toBe(3);
  });
  it('R11. reload mid-one-take resumes exactly there: same phase, same turn, earlier answers kept, next line concealed again', async () => {
    let s = revealOptions(plan, oneTakeStart());
    s = respond(plan, s, { kind: 'say', conceptId: 'border.passport-response' });
    const store = await import('./bootcampStore.js');
    store.useBootcampStore.setState({ activeDay: 9, checkpoints: {} });
    store.useBootcampStore.getState().saveCheckpoint(s);
    const saved = JSON.parse(localStorage.getItem('ready.bootcamp.checkpoint.v1.en')!)['9'] as CheckpointState;
    expect(isRestorable(plan, saved)).toBe(true);
    expect([saved.phase, currentTurn(plan, saved)!.id, saved.attempts.filter((a) => a.phase === 'one-take').length, isConcealed(plan, saved)]).toEqual(['one-take', 'border.purpose', 1, true]);
    // A state saved before this refinement (no `optionsShown`) restores as concealed — never as revealed.
    const { optionsShown: _gone, ...old } = s;
    expect(isRestorable(plan, old)).toBe(true);
    expect(isConcealed(plan, old as CheckpointState)).toBe(true);
  });
  it('R12. EN / ES / FR: the same concealment and the same interleaving, turn for turn', () => {
    const shape = (lang: Lang) => {
      const policy = both(missing('diagnostic', ['border.duration', 'hotel.room']), missing('one-take', ['taxi.destination', 'hotel.breakfast-hours']));
      return drive(planOf(lang), policy).trace.map((x) => [x.phase, x.screen.kind, 'turn' in x.screen ? x.screen.turn.id : '', x.screen.kind === 'say' ? (x.screen.concealed ?? false) : null]);
    };
    for (const lang of ['fr', 'es'] as const) expect(shape(lang), lang).toEqual(shape('en'));
  });
});
