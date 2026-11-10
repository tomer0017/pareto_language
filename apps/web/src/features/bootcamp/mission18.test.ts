import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { learnedBefore, missionContent } from './priorLearning.js';
import type { CoverageLang } from './mission01Coverage.js';
import { checkpointTransfer } from './checkpointAudit.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { MISSION_CONCEPTS } from './priorLearning.js';
import {
  checkpointReport, checkpointScreen, currentEntry, interactionCount, isRestorable, planConcepts, proceed, requestHelp, respond, revealOptions,
  sceneProgress, startCheckpoint, type CheckpointPlan, type CheckpointScreen, type CheckpointState,
} from './checkpoint.js';
import { CORE, EVERYDAY_ANSWER, PRIORITY, SAY, WRONG } from './core/everydayDay.js';
import { missionVideo } from '../videos/missionVideo.js';
import type { VideoManifest } from '../videos/videoConvention.js';
import type { BootcampDayContent, BootcampStep } from './types.js';
import type * as CheckpointUi from './CheckpointStep.js';

/**
 * Mission 18 — CHECKPOINT: Everyday Day. A SAMPLED adaptive checkpoint: quick scan (six core probes, try
 * first) → quick fix of ONLY the misses → the one-take day (☕ → 👋 → 🛒 → 🍽️) → at most two final repairs
 * → an honest readiness level. The dialogue is LOCKED; nothing new is taught; there is no video.
 * Every adaptive path below is played through the real state machine by a scripted learner.
 */
const LANGS = ['en', 'es', 'fr'] as const;
type Lang = (typeof LANGS)[number];
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const mission = (lang: Lang, n = 18): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const planOf = (lang: Lang): CheckpointPlan => (mission(lang).steps.find((s) => s.kind === 'checkpoint') as Extract<BootcampStep, { kind: 'checkpoint' }>).plan;
const quotes = (s: string): string => s.replace(/[’‘]/g, "'");

/** The day exactly as the brief froze it (pasted verbatim; the scene cues are not lines). */
const LOCKED: Record<Lang, string[][]> = {
  en: [
    ['NPC: Good morning! What can I get you?', "YOU: I'd like an iced coffee, please.", 'NPC: Sure. Anything to eat?', 'YOU: Maybe later.', 'NPC: No problem. Cash or card?', 'YOU: By card, please.', 'NPC: Thank you! Have a nice day!'],
    ['NPC: Hi! Are you free tomorrow?', "YOU: Yes, I'm free tomorrow.", 'NPC: I surf a lot. Do you like surfing?', 'YOU: I love surfing!', 'NPC: Then come with us! But we leave early.', "YOU: Let's meet here at seven.", 'NPC: Perfect. And what are you doing tonight?', "YOU: I'm tired. I'm going home.", 'NPC: Good night. See you tomorrow!'],
    ['NPC: Hi there! Can I help you find something?', 'YOU: Where is the milk?', 'NPC: The milk is in aisle three, on the left.', 'YOU: Thank you!', 'NPC: Hi! Is that everything?', 'YOU: Just this, thanks.', 'NPC: Do you need a bag?', 'YOU: Could I get a bag?', 'NPC: Insert your card here… all done. Have a nice day!'],
    ['NPC: Good evening! Do you have a reservation?', 'YOU: No — a table for two, please.', 'NPC: Are you ready to order?', "YOU: I'll have the chicken, without onions, please.", 'NPC: Of course. Anything to drink?', 'YOU: A bottle of water, please.', 'NPC: Is everything okay?', 'YOU: Yes, that was delicious! The bill, please.', 'NPC: So glad you enjoyed it. Here you are — have a lovely evening!'],
  ],
  es: [
    ['NPC: ¡Buenos días! ¿Qué le sirvo?', 'YOU: Quiero un café con hielo, por favor.', 'NPC: Claro. ¿Algo de comer?', 'YOU: Quizás más tarde.', 'NPC: Sin problema. ¿Efectivo o tarjeta?', 'YOU: Con tarjeta, por favor.', 'NPC: ¡Gracias! ¡Que tenga un buen día!'],
    ['NPC: ¡Hola! ¿Estás libre mañana?', 'YOU: Sí, estoy libre mañana.', 'NPC: Hago mucho surf. ¿Te gusta el surf?', 'YOU: ¡Me encanta el surf!', 'NPC: ¡Entonces ven con nosotros! Pero salimos temprano.', 'YOU: Quedamos aquí a las siete.', 'NPC: Perfecto. ¿Y qué haces esta noche?', 'YOU: Estoy cansado. Me voy a casa.', 'NPC: Buenas noches. ¡Nos vemos mañana!'],
    ['NPC: ¡Hola! ¿Le ayudo a encontrar algo?', 'YOU: ¿Dónde está la leche?', 'NPC: La leche está en el pasillo tres, a la izquierda.', 'YOU: ¡Gracias!', 'NPC: ¡Hola! ¿Eso es todo?', 'YOU: Solo esto, gracias.', 'NPC: ¿Necesita una bolsa?', 'YOU: ¿Me da una bolsa?', 'NPC: Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!'],
    ['NPC: ¡Buenas noches! ¿Tiene reserva?', 'YOU: No — una mesa para dos, por favor.', 'NPC: ¿Están listos para pedir?', 'YOU: Voy a tomar el pollo, sin cebolla, por favor.', 'NPC: Claro. ¿Algo de beber?', 'YOU: Una botella de agua, por favor.', 'NPC: ¿Va todo bien?', 'YOU: ¡Sí, estaba delicioso! La cuenta, por favor.', 'NPC: Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!'],
  ],
  fr: [
    ['NPC: Bonjour ! Qu’est-ce que je vous sers ?', 'YOU: Je voudrais un café glacé, s’il vous plaît.', 'NPC: Très bien. Quelque chose à manger ?', 'YOU: Peut-être plus tard.', 'NPC: Pas de problème. Espèces ou carte ?', 'YOU: Par carte, s’il vous plaît.', 'NPC: Merci ! Bonne journée !'],
    ['NPC: Salut ! Tu es libre demain ?', 'YOU: Oui, je suis libre demain.', 'NPC: Je fais beaucoup de surf. Tu aimes le surf ?', 'YOU: J’adore le surf !', 'NPC: Alors viens avec nous ! Mais on part tôt.', 'YOU: On se retrouve ici à sept heures.', 'NPC: Parfait. Et tu fais quoi ce soir ?', 'YOU: Je suis fatigué. Je rentre chez moi.', 'NPC: Bonne nuit. À demain !'],
    ['NPC: Bonjour ! Je peux vous aider à trouver quelque chose ?', 'YOU: Où est le lait ?', 'NPC: Le lait est dans l’allée trois, sur la gauche.', 'YOU: Merci !', 'NPC: Bonjour ! Ce sera tout ?', 'YOU: Juste ça, merci.', 'NPC: Vous avez besoin d’un sac ?', 'YOU: Je peux avoir un sac ?', 'NPC: Insérez votre carte ici… c’est bon. Bonne journée !'],
    ['NPC: Bonsoir ! Vous avez une réservation ?', 'YOU: Non — une table pour deux, s’il vous plaît.', 'NPC: Vous êtes prêts à commander ?', 'YOU: Je vais prendre le poulet, sans oignons, s’il vous plaît.', 'NPC: Bien sûr. Quelque chose à boire ?', 'YOU: Une bouteille d’eau, s’il vous plaît.', 'NPC: Tout va bien ?', 'YOU: Oui, c’était délicieux ! L’addition, s’il vous plaît.', 'NPC: Ravi que ça vous ait plu. Voici — passez une bonne soirée !'],
  ],
};
/** Canonical transcript ([who, text], exact) — the same value before this pass (3dbaab0) and after. */
const TRANSCRIPT_PRINT = { en: 'b92ef125', es: '76207cc9', fr: '6c036041' };
const CORE_CONCEPTS = CORE.map((k) => k.concept as string);

/* ── a scripted learner, played through the real state machine ─────────────────────────────────── */

type Move = 'right' | 'wrong' | 'help';
/** What the learner does with a concept in a phase, on its n-th attempt there (1-based). */
type Policy = (phase: CheckpointState['phase'], concept: string, n: number) => Move;
interface Trace { phase: CheckpointState['phase']; screen: CheckpointScreen; state: CheckpointState }
const perfect: Policy = () => 'right';
const nth = (s: CheckpointState, c: string): number => s.attempts.filter((a) => a.conceptId === c && a.phase === s.phase).length + 1;

function drive(plan: CheckpointPlan, policy: Policy, from: CheckpointState = startCheckpoint(plan), stopAfter = Infinity): { state: CheckpointState; trace: Trace[] } {
  let s = from;
  const trace: Trace[] = [];
  for (let guard = 0; s.phase !== 'complete' && guard < 400 && trace.length < stopAfter; guard++) {
    const screen = checkpointScreen(plan, s);
    trace.push({ phase: s.phase, screen, state: s });
    if (screen.kind === 'say' && screen.concealed) { s = policy(s.phase, screen.turn.conceptId, nth(s, screen.turn.conceptId)) === 'help' ? requestHelp(plan, s) : revealOptions(plan, s); continue; }
    if (screen.kind === 'say') {
      const c = screen.turn.conceptId;
      s = respond(plan, s, { kind: 'say', conceptId: policy(s.phase, c, nth(s, c)) === 'wrong' ? screen.turn.wrong[0]!.conceptId : c });
      continue;
    }
    if (screen.kind === 'capture') {
      const picks = Object.fromEntries(screen.groups.map((g) => [g.conceptId, policy(s.phase, g.conceptId, nth(s, g.conceptId)) === 'wrong' ? g.choices.find((x) => x.id !== g.correct)!.id : g.correct]));
      s = respond(plan, s, { kind: 'capture', picks });
      continue;
    }
    s = proceed(plan, s);
  }
  return { state: s, trace };
}
/** Wrong at `phase` for these concepts (every attempt there); right everywhere else. */
const wrongIn = (phase: CheckpointState['phase'] | 'all', ids: readonly string[]): Policy => (p, c) => ((phase === 'all' || p === phase) && ids.includes(c) ? 'wrong' : 'right');
const merge = (...ps: Policy[]): Policy => (p, c, n) => { for (const x of ps) { const m = x(p, c, n); if (m !== 'right') return m; } return 'right'; };
const helpOn = (ids: readonly string[]): Policy => (p, c) => (p === 'diagnostic' && ids.includes(c) ? 'help' : 'right');
const phases = (t: Trace[]): string[] => [...new Set(t.map((x) => x.phase))];

const plan = planOf('en');

describe('the conversation is locked, and Mission 18 is in its place', () => {
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (3dbaab0)', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(mission(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
  });
  for (const lang of LANGS) it(`23. ${lang}: the four scenes, word for word (apostrophe typography ignored)`, () => {
    const scenes = missionDialogues(mission(lang)).map((d) => cinematicTranscript(d).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${quotes(l.en)}`));
    expect(scenes).toEqual(LOCKED[lang].map((s) => s.map(quotes)));
  });
  it('Mission 18 is "CHECKPOINT: Everyday Day", eighteenth on the journey (registry key 17), a checkpoint with no video', () => {
    expect([BOOTCAMP_PLAN[17]!.id, BOOTCAMP_PLAN[17]!.day, missionNumber(17), BOOTCAMP_PLAN[17]!.checkpoint, BOOTCAMP_PLAN[17]!.video]).toEqual(['food-day-checkpoint', 17, 18, true, false]);
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('Missions 01–17 and 19–30 are byte-for-byte unchanged by this pass', () => {
    expect(raw(0, 17)).toEqual({ en: '920ae8f5', es: 'a24f698d', fr: 'e56da638' });
    expect(raw(18)).toEqual({ en: '9f54e5f9', es: 'c197ddd6', fr: '9baaf7c8' });
  });
});

describe('PHASE 0 — the prior-learning audit (learnedBefore(lang, 18)), per language', () => {
  const prior = (lang: Lang) => learnedBefore(lang as CoverageLang, 18);
  /** Learner lines that are not one taught chunk but a COMPOSITION of verified parts — named, not hidden. */
  const COMPOSED: Record<Lang, string[]> = { en: ['plans.free', 'plans.home'], fr: ['plans.free', 'plans.home'], es: ['plans.free'] };
  it('1. every learner line is verified: taught as such, made of taught chunks, or (named) composed of verified words — none brings an unknown word', () => {
    for (const lang of LANGS) {
      const p = planOf(lang);
      const rows = p.turns.flatMap((t) => (t.kind === 'say' ? [{ c: t.conceptId, r: checkpointTransfer(t.answer.text, prior(lang)) }] : []));
      expect(rows.filter((x) => x.r.how === 'unknown'), lang).toEqual([]);
      expect(rows.filter((x) => x.r.how === 'recombined').map((x) => x.c), lang).toEqual(COMPOSED[lang]);
      for (const x of rows) expect(['taught', 'chunks', 'recombined'], `${lang} ${x.c}`).toContain(x.r.how);
    }
  });
  it('2. every comprehension target (each cue and closing the learner hears) is verified — no unknown word', () => {
    for (const lang of LANGS) {
      const p = planOf(lang);
      for (const t of [...p.turns.map((x) => x.cue.en), ...p.scenes.flatMap((s) => (s.closing ? [s.closing.en] : []))]) expect(checkpointTransfer(t, prior(lang)).unknown, `${lang} “${t}”`).toEqual([]);
    }
  });
  it('3. optional, recovery and transfer-only content never satisfies prior: Mission 17\'s bread transfer, Mission 15\'s optional "should"', () => {
    expect(prior('en').knowsChunk('Where is the bread?')).toBe(false);
    expect(prior('fr').knowsChunk('Où est le pain ?')).toBe(false);
    expect(prior('es').knowsChunk('¿Dónde está el pan?')).toBe(false);
    for (const [lang, w] of [['en', 'should'], ['fr', 'devriez'], ['es', 'debería']] as const) expect(prior(lang).words.has(w), lang).toBe(false);
  });
  it('4 / 6. a sentence list is not learning: "Do you have bread?" is a Mission 17 item, never taught — not prior, and nowhere in the checkpoint', () => {
    for (const lang of LANGS) {
      const m17 = missionContent(lang, 17);
      const item = m17.items.find((i) => i.id === `${lang}.phrase.super.do-you-have`)!;
      expect(item, lang).toBeDefined();
      expect(prior(lang).knowsChunk(item.text), lang).toBe(false);
      expect(JSON.stringify(planOf(lang)), lang).not.toContain(item.text);
      expect(JSON.stringify(mission(lang)), lang).not.toContain('do-you-have');
    }
  });
  it('5. "three" — understood: Mission 02 never taught it (its market conversation uses five, two and eight), so it is NOT prior before Mission 17; Mission 17\'s aisle card makes it prior by Mission 18', () => {
    const THREE: Record<Lang, string> = { en: 'three', fr: 'trois', es: 'tres' };
    for (const lang of LANGS) {
      const m02 = missionContent(lang, 2);
      const said = [...m02.items.map((i) => i.text), ...Object.values(m02.dialogues).flatMap((d) => d.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]))];
      expect(said.some((t) => new RegExp(`\\b${THREE[lang]}\\b|\\b3\\b`, 'i').test(t)), lang).toBe(false);
      expect(learnedBefore(lang as CoverageLang, 17).words.has(THREE[lang]), lang).toBe(false);
      expect(prior(lang).words.has(THREE[lang]), lang).toBe(true);
      expect(prior(lang).words.has({ en: 'seven', fr: 'sept', es: 'siete' }[lang]), lang).toBe(true); // "at seven" — Mission 12
    }
  });
  it('no curriculum gap: Mission 18 teaches nothing — no card, no new sentence, no coverage concepts of its own', () => {
    for (const lang of LANGS) {
      expect(mission(lang).steps.map((s) => s.kind), lang).toEqual(['talk', 'checkpoint', 'summary']);
      for (const i of mission(lang).items) expect(MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN.slice(0, 17).find((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.some((x) => x.id === i.id && x.text === i.text))?.day ?? -1], `${lang} ${i.id}`).toBeDefined();
    }
    expect(MISSION_CONCEPTS[18]).toBeUndefined();
  });
});

describe('PHASE 1 — the quick scan: six core probes, try first', () => {
  it('7–8. exactly six probes — the six core capabilities — in day order, before anything else', () => {
    const s = startCheckpoint(plan);
    expect([s.phase, s.agenda.map((e) => e.concepts[0])]).toEqual(['diagnostic', ['coffee.order', 'plans.surf', 'plans.meet', 'shop.where', 'shop.bag', 'dinner.order']]);
    expect(CORE.map((k) => k.id)).toEqual(['coffee-order', 'preference', 'plan-time', 'find-item', 'bag', 'restaurant-order']);
    const { trace, state } = drive(plan, wrongIn('diagnostic', ['plans.meet']));
    expect(phases(trace)).toEqual(['diagnostic', 'repair', 'one-take']);
    expect(interactionCount(state).diagnostic).toBe(6);
  });
  it('9. nothing is taught before the probe: the first screen is the cue alone — no options, no hint, no answer', () => {
    for (const lang of LANGS) {
      const p = planOf(lang);
      const first = checkpointScreen(p, startCheckpoint(p));
      expect(first.kind === 'say' && first.concealed && first.options.length === 0 && first.situation === undefined, lang).toBe(true);
      expect(mission(lang).steps.some((s) => s.kind === 'prime' || s.kind === 'tool' || s.kind === 'swipe'), lang).toBe(false);
    }
  });
  it('10–11. "💡 Help" shows a hint and the options, and the answer counts as ASSISTED — tracked apart from INDEPENDENT', () => {
    const s0 = startCheckpoint(plan);
    const helped = requestHelp(plan, s0);
    const screen = checkpointScreen(plan, helped);
    expect(screen.kind === 'say' && screen.options.length === 3 && screen.situation?.en).toBe('☕ You want an iced coffee.');
    const plain = checkpointScreen(plan, revealOptions(plan, s0));
    expect(plain.kind === 'say' && plain.situation).toBeFalsy();
    const r = checkpointReport(plan, drive(plan, helpOn(['coffee.order'])).state)!;
    expect(r.capabilityStatus).toEqual({ 'coffee-order': 'assisted', preference: 'independent', 'plan-time': 'independent', 'find-item': 'independent', bag: 'independent', 'restaurant-order': 'independent' });
    expect(drive(plan, helpOn(['coffee.order'])).state.attempts[0]).toMatchObject({ conceptId: 'coffee.order', phase: 'diagnostic', correct: true, assisted: true });
  });
  it('12–13. a miss is noted (not shown) and queued for repair; an independent answer never is', () => {
    let s = startCheckpoint(plan);
    s = revealOptions(plan, s);
    s = respond(plan, s, { kind: 'say', conceptId: WRONG['coffee.order'][0] });
    expect([s.beat, s.repairQueue, currentEntry(s)!.concepts]).toEqual(['ask', ['coffee.order'], ['plans.surf']]);
    const after = drive(plan, wrongIn('diagnostic', ['shop.bag'])).trace.find((x) => x.phase === 'repair')!.state;
    expect(after.repairQueue).toEqual(['shop.bag']);
  });
});

describe('PHASE 2 — the quick fix: only what was missed', () => {
  const repairs = (t: Trace[]) => t.filter((x) => x.phase === 'repair' && (x.screen.kind === 'card' || x.screen.kind === 'say' || x.screen.kind === 'reveal'));
  it('14. zero misses → zero quick fix: straight from the scan to the one-take', () => {
    const { state, trace } = drive(plan, perfect);
    expect(phases(trace)).toEqual(['diagnostic', 'one-take']);
    expect(interactionCount(state).repair).toBe(0);
  });
  it('15–17. one miss → only that capability; two misses → only those two — nothing unrelated', () => {
    const one = drive(plan, wrongIn('diagnostic', ['plans.meet'])).trace;
    expect(repairs(one).map((x) => [x.screen.kind, (x.screen as { turn: { id: string } }).turn.id])).toEqual([['card', 'plans.early'], ['say', 'plans.early']]);
    const two = drive(plan, wrongIn('diagnostic', ['coffee.order', 'shop.bag'])).trace;
    expect(repairs(two).map((x) => [x.screen.kind, (x.screen as { turn: { id: string } }).turn.id])).toEqual([['card', 'morning.order'], ['say', 'morning.order'], ['card', 'shop.bag'], ['say', 'shop.bag']]);
  });
  it('18. each repair is one card + ONE retry — at most one answered interaction per capability, never a loop', () => {
    for (const ids of [['plans.meet'], ['coffee.order', 'shop.bag'], [...CORE_CONCEPTS]]) {
      const right = drive(plan, wrongIn('diagnostic', ids)).state;
      const wrong = drive(plan, wrongIn('all', ids)).state; // even when the retry fails
      expect(interactionCount(right).repair).toBe(ids.length);
      expect(interactionCount(wrong).repair).toBe(ids.length);
    }
  });
  it('19–20. a successful retry → REPAIRED; a second failure → UNRESOLVED, and the day goes on', () => {
    const fixed = checkpointReport(plan, drive(plan, wrongIn('diagnostic', ['shop.where'])).state)!;
    expect(fixed.capabilityStatus['find-item']).toBe('repaired');
    const stuck = drive(plan, merge(wrongIn('diagnostic', ['shop.where']), wrongIn('repair', ['shop.where'])));
    expect(checkpointReport(plan, stuck.state)!.capabilityStatus['find-item']).toBe('unresolved');
    expect(phases(stuck.trace)).toEqual(['diagnostic', 'repair', 'one-take']);
    expect(stuck.state.phase).toBe('complete');
  });
});

describe('PHASE 3 — the one-take day', () => {
  const oneTake = (t: Trace[]) => t.filter((x) => x.phase === 'one-take');
  it('21–22. exactly four scenes, in order: ☕ Morning → 👋 Plans → 🛒 Supermarket → 🍽️ Dinner', () => {
    expect(plan.scenes.map((s) => `${s.icon} ${s.label.en}`)).toEqual(['☕ Morning', '👋 Plans', '🛒 Supermarket', '🍽️ Dinner']);
    const ends = oneTake(drive(plan, perfect).trace).filter((x) => x.screen.kind === 'scene-end').map((x) => (x.screen as { scene: { id: string } }).scene.id);
    expect(ends).toEqual(['morning', 'plans', 'shop', 'dinner']);
  });
  it('24. the learner\'s lines come in canonical order — the fifteen lines of the locked day', () => {
    for (const lang of LANGS) {
      const said = planOf(lang).turns.flatMap((t) => (t.kind === 'say' ? [t.answer.text] : []));
      expect(said.map(quotes), lang).toEqual(LOCKED[lang].flat().filter((l) => l.startsWith('YOU: ')).map((l) => quotes(l.slice(5))));
    }
    expect(interactionCount(drive(plan, perfect).state)['one-take']).toBe(17); // 15 lines + 2 comprehension captures (aisle · card)
  });
  it('25. no teaching card is inserted into the one-take: a clean day is cue → answer → cue, scene by scene', () => {
    const kinds = new Set(oneTake(drive(plan, perfect).trace).map((x) => x.screen.kind));
    expect([...kinds].sort()).toEqual(['capture', 'intro', 'say', 'scene-end']);
  });
  it('26. a first mistake → the line is asked again, slowly — no lecture, no shown answer', () => {
    const { trace } = drive(plan, (p, c, n) => (p === 'one-take' && c === 'coffee.later' && n === 1 ? 'wrong' : 'right'));
    const i = trace.findIndex((x) => x.phase === 'one-take' && x.screen.kind === 'say' && x.screen.turn.conceptId === 'coffee.later' && !x.screen.concealed);
    const next = trace[i + 1]!;
    expect([next.screen.kind, next.state.slow, (next.screen as { turn: { id: string } }).turn.id]).toEqual(['say', true, 'morning.eat']);
    expect(trace.slice(i, i + 3).some((x) => x.screen.kind === 'reveal')).toBe(false);
  });
  it('27. a repeated mistake → the line is shown, ONE supported pick follows — and the day continues', () => {
    const { trace, state } = drive(plan, (p, c, n) => (p === 'one-take' && c === 'coffee.later' && n <= 2 ? 'wrong' : 'right'));
    const at = trace.findIndex((x) => x.phase === 'one-take' && x.screen.kind === 'reveal');
    expect(at).toBeGreaterThan(0);
    expect([trace[at + 1]!.screen.kind, trace[at + 1]!.state.retry]).toEqual(['say', true]);
    expect(checkpointReport(plan, state)!.concepts.find((c) => c.conceptId === 'coffee.later')!.oneTake).toBe('helped');
    expect(trace.filter((x) => x.phase === 'one-take' && x.screen.kind === 'scene-end')).toHaveLength(4);
  });
  it('28. each finished scene fills the Everyday Day progress', () => {
    const ends = oneTake(drive(plan, perfect).trace).filter((x) => x.screen.kind === 'scene-end').map((x) => sceneProgress(plan, x.state).map((p) => p.state));
    expect(ends).toEqual([['done', 'next', 'next', 'next'], ['done', 'done', 'next', 'next'], ['done', 'done', 'done', 'next'], ['done', 'done', 'done', 'done']]);
  });
  it('the supermarket\'s facts come only after the assistant says them: the aisle capture, then "Thank you!" on the same heard line', () => {
    const turns = plan.turns.map((t) => t.id);
    expect(turns.slice(7, 13)).toEqual(['shop.help', 'shop.aisle', 'shop.thanks', 'shop.everything', 'shop.bag', 'shop.card']);
    const aisle = plan.turns.find((t) => t.id === 'shop.aisle')!;
    expect(aisle.kind === 'capture' && aisle.groups.map((g) => [g.conceptId, g.correct])).toEqual([['shop.aisle', EVERYDAY_ANSWER.aisle], ['shop.side', EVERYDAY_ANSWER.side]]);
    expect(plan.turns.find((t) => t.id === 'shop.thanks')!.heard).toBe(true);
  });
});

describe('silent cues — "At the checkout…" and "Later…"', () => {
  const cued = plan.turns.filter((t) => t.sceneCue);
  /** The two cues, in every form they take (app language). ("Maybe later." is a line of its own — not the cue.) */
  const CUES = /At the checkout…|Later…|בקופה…|מאוחר יותר…/;
  it('29–31. two cues, each on the line it introduces — never a sentence, a line, an option or a spoken text', () => {
    expect(cued.map((t) => [t.id, t.sceneCue!.en, t.cue.en])).toEqual([['shop.everything', 'At the checkout…', 'Hi! Is that everything?'], ['dinner.okay', 'Later…', 'Is everything okay?']]);
    for (const lang of LANGS) {
      const p = planOf(lang);
      const spoken = [...p.turns.flatMap((t) => [t.cue.en, ...(t.kind === 'say' ? [t.answer.text, ...t.wrong.map((w) => w.text)] : [])]), ...p.scenes.flatMap((s) => (s.closing ? [s.closing.en] : []))];
      for (const t of spoken) expect(t, lang).not.toMatch(CUES);
      for (const i of mission(lang).items) expect(`${i.text} ${JSON.stringify(i.meaning)}`, lang).not.toMatch(CUES);
    }
  });
  it('32–34. neither enters coverage, prior learning or the interaction count', () => {
    expect(planConcepts(plan).filter((c) => /cue|checkout|^dinner\.later$|^shop\.later$/i.test(c))).toEqual([]);
    for (const lang of LANGS) expect(learnedBefore(lang as CoverageLang, 19).concepts.filter((c) => CUES.test(c.chunk)), lang).toEqual([]);
    expect(interactionCount(drive(plan, perfect).state)['one-take']).toBe(plan.turns.length);
  });
  it('29–30. the screen shows the cue as text and speaks only the line: no speech call ever takes a cue', () => {
    const ui = readFileSync(fileURLToPath(new URL('./CheckpointStep.tsx', import.meta.url)), 'utf8');
    expect(ui).toMatch(/const SceneCue = \(\{ text \}: \{ text\?: string \}\) => \(text \? <p className="faint small convo-cue"/);
    expect(ui).not.toMatch(/speakL\([^)]*sceneCue/);
    expect(ui).not.toMatch(/speak\([^)]*sceneCue/);
  });
});

describe('no video — the one-take is the event', () => {
  const ALL: VideoManifest = { en: Array.from({ length: 30 }, (_, i) => i + 1), es: Array.from({ length: 30 }, (_, i) => i + 1), fr: Array.from({ length: 30 }, (_, i) => i + 1) } as VideoManifest;
  it('35. Mission 18 has ZERO video steps', () => {
    for (const lang of LANGS) expect(mission(lang).steps.some((s) => s.kind === 'video'), lang).toBe(false);
  });
  it('36. the resolver never looks for a Mission 18 video — even when every file exists', () => {
    for (const lang of LANGS) expect(missionVideo(lang, 17, ALL, '/x/'), lang).toBeUndefined();
    expect(missionVideo('en', BOOTCAMP_PLAN[16]!.day, ALL, '/x/')!.src).toBe('/x/videos/en/en_17.mp4'); // the others still resolve
  });
  it('37. the checkpoint runs from scan to report with no video phase', () => {
    const { state, trace } = drive(plan, perfect);
    expect(state.phase).toBe('complete');
    expect(trace.every((x) => !JSON.stringify(x.screen).includes('video'))).toBe(true);
  });
});

describe('PHASE 4 — the final micro-repair', () => {
  const finals = (t: Trace[]) => t.filter((x) => x.phase === 'final-repair' && x.screen.kind === 'say').map((x) => (x.screen as { turn: { conceptId: string } }).turn.conceptId);
  it('38–39. at most two targets — the most survival-critical of what the one-take missed', () => {
    const missedMany = ['coffee.later', 'plans.free', 'shop.bag', 'dinner.order', 'plans.surf'];
    const { trace } = drive(plan, wrongIn('one-take', missedMany));
    expect([...finals(trace)].sort()).toEqual(['dinner.order', 'shop.bag']); // chosen by priority, played in day order
    expect(PRIORITY.slice(0, 3)).toEqual(['dinner.order', 'shop.where', 'shop.bag']);
    expect(PRIORITY.length).toBe(planConcepts(plan).length);
    expect([...PRIORITY].sort()).toEqual([...planConcepts(plan)].sort());
  });
  it('a clean one-take → no final repair at all', () => {
    expect(phases(drive(plan, perfect).trace)).not.toContain('final-repair');
  });
  it('40. no full dialogue after the one-take: the final repair is one card + one retrieval per target', () => {
    const { trace, state } = drive(plan, wrongIn('all', ['dinner.order', 'shop.bag', 'coffee.card']));
    const after = trace.filter((x) => x.phase === 'final-repair');
    expect(after.filter((x) => x.screen.kind === 'card')).toHaveLength(2);
    expect(interactionCount(state)['final-repair']).toBe(2);
  });
});

describe('the readiness report — honest and deterministic', () => {
  const report = (p: Policy) => checkpointReport(plan, drive(plan, p).state)!;
  it('41. a strong, independent learner → 🟢 READY', () => {
    expect(report(perfect).readinessLevel).toBe('ready');
    expect(report(perfect).groups.every((g) => g.outcome === 'independent')).toBe(true);
  });
  it('42. repaired weaknesses: one or two → READY (≥ 4 independent probes); three → ALMOST READY', () => {
    expect(report(wrongIn('diagnostic', ['coffee.order'])).readinessLevel).toBe('ready');
    expect(report(wrongIn('diagnostic', ['coffee.order', 'shop.bag'])).readinessLevel).toBe('ready');
    expect(report(wrongIn('diagnostic', ['coffee.order', 'shop.bag', 'plans.surf'])).readinessLevel).toBe('almost');
    expect(report(helpOn(['coffee.order', 'shop.bag', 'plans.surf'])).readinessLevel).toBe('almost'); // help is not independence
  });
  it('43. several core abilities still failing after every repair → 🔴 REVIEW NEEDED (never "failed")', () => {
    const r = report(wrongIn('all', ['dinner.order', 'shop.where', 'shop.bag']));
    expect(r.readinessLevel).toBe('review');
    expect(r.basis.unresolvedCore).toBe(3);
    expect(plan.copy.readiness!.review.title.en).toBe('🔴 REVIEW NEEDED');
    expect(JSON.stringify(plan.copy)).not.toMatch(/fail|wrong|bad|נכשל/i);
  });
  it('one core ability still failing → 🟡 ALMOST READY', () => {
    expect(report(wrongIn('all', ['plans.surf'])).readinessLevel).toBe('almost');
  });
  it('44. deterministic: the same play gives the same report — and a saved, restored state gives the same report too', () => {
    const p = merge(wrongIn('diagnostic', ['shop.bag']), helpOn(['plans.surf']), (ph, c, n) => (ph === 'one-take' && c === 'coffee.card' && n === 1 ? 'wrong' : 'right'));
    expect(report(p)).toEqual(report(p));
    const half = drive(plan, p, startCheckpoint(plan), 25).state;
    const restored = JSON.parse(JSON.stringify(half)) as CheckpointState;
    expect(isRestorable(plan, restored)).toBe(true);
    expect(checkpointReport(plan, drive(plan, p, restored).state)).toEqual(report(p));
  });
  it('45. no score, XP, percentage or grade anywhere in the result', () => {
    const r = report(wrongIn('diagnostic', ['shop.bag']));
    expect(JSON.stringify([plan.copy, r.groups, r.readinessLevel])).not.toMatch(/%|\bxp\b|points|score|\d+\/\d+|grade|streak|נקודות|ציון/i);
  });
  it('46. the capability report reflects what happened: help → "Needed help", a repaired miss → "Recovered", a lasting failure → "Needs review"', () => {
    const r = report(merge(helpOn(['plans.surf']), wrongIn('diagnostic', ['shop.bag']), wrongIn('all', ['dinner.order'])));
    expect(Object.fromEntries(r.groups.map((g) => [g.id, g.outcome]))).toEqual({ 'order-pay': 'independent', 'plans-time': 'independent', preferences: 'needed-help', shopping: 'recovered', restaurant: 'needs-review' });
    expect(Object.values(plan.copy.outcome!).map((x) => x.en)).toEqual(['Independent', 'Needed help', 'Recovered', 'Needs review']);
  });
  it('the rule, in numbers: READY = 0 core needing review · ≥ 4 independent probes · ≤ 1 core line shown in the one-take; REVIEW = 2+ core needing review', () => {
    const helpedTwice = report(wrongIn('one-take', ['coffee.order', 'shop.where']));
    // two core lines needed the shown answer in the one-take: the final repair recovered both — but that was not a strong day
    expect([helpedTwice.basis, helpedTwice.readinessLevel]).toEqual([{ unresolvedCore: 0, independentDiagnostic: 6, coreHelpedInOneTake: 2 }, 'almost']);
  });
});

describe('the screen', () => {
  let ui: typeof CheckpointUi;
  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    ui = await import('./CheckpointStep.js');
    (await import('../../shared/i18n/strings.js')).setUiLangDict('he');
  });
  const render = (state: CheckpointState): string => renderToStaticMarkup(createElement(ui.CheckpointView, { plan, state, onChange: () => undefined, onDone: () => undefined }));
  const text = (html: string): string => html.replace(/<[^>]+>/g, ' ');
  it('the scan: the cue, "try first", Show options and 💡 Help — no options, no hint, no translation; the scan counter, not the scenes', () => {
    const html = render(startCheckpoint(plan));
    expect(html).toContain('Good morning! What can I get you?');
    expect(text(html)).toMatch(/נסה קודם/);
    expect(text(html)).toMatch(/💡 עזרה/);
    expect(text(html)).toMatch(/סריקה מהירה · 1\/6/);
    expect(text(html)).not.toMatch(/iced coffee|קפה קר|בוקר טוב/);
  });
  it('the one-take: the scene cue is shown as text above the line; the progress shows four scenes with ⬜', () => {
    const s = drive(plan, perfect).trace.find((x) => x.phase === 'one-take' && x.screen.kind === 'say' && x.screen.turn.id === 'shop.everything')!.state;
    const html = render(s);
    expect(html).toMatch(/class="faint small convo-cue"[^>]*>בקופה…</);
    expect(html.match(/⬜/g)?.length).toBe(2); // the supermarket (now) and dinner (next)
  });
  it('the report renders each level with its five rows — and no number', () => {
    for (const [p, title] of [[perfect, '🟢 מוכן'], [wrongIn('diagnostic', ['coffee.order', 'shop.bag', 'plans.surf']), '🟡 כמעט מוכן'], [wrongIn('all', ['dinner.order', 'shop.where', 'shop.bag']), '🔴 צריך חזרה']] as const) {
      const html = render(drive(plan, p).state);
      expect(text(html)).toContain(title);
      expect(html.match(/<dt>/g)).toHaveLength(5);
      expect(text(html).replace(/🌤️|🟢|🟡|🔴/g, '')).not.toMatch(/\d/);
    }
  });
});

describe('bloat guards and parity', () => {
  it('47–53. no vocabulary deck, no prime, no builder, no Flex, no video, no supported / no-help / final runs, no score / streak / timer', () => {
    for (const lang of LANGS) {
      const d = mission(lang);
      expect(d.steps.map((s) => s.kind), lang).toEqual(['talk', 'checkpoint', 'summary']);
      expect(JSON.stringify(d.steps), lang).not.toMatch(/transferOnly|sentenceBuilder|"kind":"video"|"kind":"prime"|"kind":"swipe"|"challenge":true|streak|timer/);
    }
  });
  it('a strong learner\'s checkpoint is short: 6 probes + the 17-moment day, no repair', () => {
    expect(interactionCount(drive(plan, perfect).state)).toEqual({ diagnostic: 6, repair: 0, 'one-take': 17, 'final-repair': 0 });
  });
  it('every wrong option is a canonical line of the same day, from another moment — never the right one, never untaught', () => {
    for (const [c, w] of Object.entries(WRONG)) { expect(w, c).not.toContain(c); for (const x of w) expect(Object.keys(SAY), c).toContain(x); }
    expect(WRONG['shop.bag']).toEqual(['shop.where', 'dinner.water']); // "Do you have bread?" is gone
  });
  it('EN / ES / FR: the same architecture — turns, concepts, capabilities, rules, order and cues — each in its own words', () => {
    const shape = (p: CheckpointPlan) => ({
      turns: p.turns.map((t) => [t.id, t.kind, t.scene, t.heard ?? false, t.sceneCue ?? null, t.kind === 'say' ? [t.conceptId, t.wrong.map((w) => w.conceptId), t.situation ?? null] : t.groups.map((g) => [g.conceptId, g.correct, g.choices.map((c) => c.id)])]),
      scenes: p.scenes.map((s) => [s.id, s.icon, s.label, s.stamp]), adaptive: p.adaptive, copy: p.copy,
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(planOf(lang)), lang).toEqual(shape(planOf('en')));
    for (const lang of ['es', 'fr'] as const) for (const t of planOf(lang).turns) expect(t.cue.en, `${lang} ${t.id}`).not.toBe(plan.turns.find((x) => x.id === t.id)!.cue.en);
  });
  it('the state is plain JSON and restorable at any point — scan, repair, one-take, final repair', () => {
    const p = merge(wrongIn('diagnostic', ['shop.bag']), wrongIn('one-take', ['dinner.order']));
    for (const t of drive(plan, p).trace) {
      const copy = JSON.parse(JSON.stringify(t.state)) as CheckpointState;
      expect(copy).toEqual(t.state);
      expect(isRestorable(plan, copy), t.phase).toBe(true);
    }
  });
});
