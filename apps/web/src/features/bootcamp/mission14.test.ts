import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitTimeBoard } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { coachFor } from '../companion/companionCoach.js';
import { answersFollow, runNpcBeat } from './dialogueBeat.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M14_CONCEPTS, M14_CONTEXT_ONLY } from './mission14Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  LATER_NOTE, MEAL_COMPLETE, MEAL_PHASES, M14_FLEX, M14_PROPS, M14_SLOTS, PARTY_SIZES, SIGNAL_ROUNDS, WAITER_SIGNALS,
  W_BYE, W_COMING, W_DRINK, W_ELSE, W_FOLLOW, W_OKAY, W_READY, W_RES, Y_ALL, Y_BILL, Y_ORDER, Y_TABLE, Y_WATER,
  restaurantTicket, restaurantTicketState,
} from './practiceRestaurant.js';
import { validatePracticeStep } from './practiceEngines.js';
import { auditWords, learnedBefore, missionContent, missionWalk, teachingEncounters, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 14 — Restaurant Meal: one ordinary sit-down meal, deliberately SHORT. The conversation is
 * LOCKED. The learner says five lines; the waiter's lines are comprehension. "Later…" is a scene cue,
 * never a line. A one-round Flex (transfer only) proves "table for X", not a memorised "for two".
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 14): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M14_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
/** Typography only: the brief writes ’ where the content writes ' (an apostrophe is an apostrophe). */
const quotes = (s: string): string => s.replace(/[’‘]/g, "'");
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type VM = Extract<BootcampStep, { kind: 'visualMatch' }>;
type Prime = Extract<BootcampStep, { kind: 'prime' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, r: Round): string => { const o = r.options.find((x) => x.correct)!; return o.text ?? text(d, o.itemId); };
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const isFlex = (s: BootcampStep): boolean => 'transferOnly' in s && s.transferOnly === true;
const flexAt = (d: BootcampDayContent): number[] => d.steps.flatMap((s, i) => (isFlex(s) ? [i] : []));
const supportedAt = (d: BootcampDayContent): number => Math.max(...flexAt(d)) + 1;
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const withoutFlex = (d: BootcampDayContent): BootcampDayContent => ({ ...d, steps: d.steps.filter((s) => !isFlex(s)) });
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);
const scene = (d: BootcampDayContent) => d.dialogues['sit-down-meal']!;
const replace = (d: BootcampDayContent, i: number, s: BootcampStep): BootcampDayContent => ({ ...d, steps: d.steps.map((x, k) => (k === i ? s : x)) });

/** The conversation exactly as the brief froze it (pasted verbatim; the scene cue is not a line). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Good evening! Do you have a reservation?', 'YOU: No — a table for two, please.', 'NPC: Perfect, follow me. Here are your menus.', 'NPC: Are you ready to order?', 'YOU: I’ll have the chicken, without onions, please.',
    'NPC: Of course. Anything to drink?', 'YOU: A bottle of water, please.', 'NPC: Anything else?', 'YOU: That’s all, thanks.', 'NPC: Coming right up!', 'NPC: Is everything okay?', 'YOU: Yes, that was delicious! The bill, please.',
    'NPC: So glad you enjoyed it. Here you are — have a lovely evening!'],
  es: ['NPC: ¡Buenas noches! ¿Tiene reserva?', 'YOU: No — una mesa para dos, por favor.', 'NPC: Perfecto, sígame. Aquí tienen las cartas.', 'NPC: ¿Están listos para pedir?', 'YOU: Voy a tomar el pollo, sin cebolla, por favor.',
    'NPC: Claro. ¿Algo de beber?', 'YOU: Una botella de agua, por favor.', 'NPC: ¿Algo más?', 'YOU: Eso es todo, gracias.', 'NPC: ¡Enseguida se lo traigo!', 'NPC: ¿Va todo bien?', 'YOU: ¡Sí, estaba delicioso! La cuenta, por favor.',
    'NPC: Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!'],
  fr: ['NPC: Bonsoir ! Vous avez une réservation ?', 'YOU: Non — une table pour deux, s’il vous plaît.', 'NPC: Parfait, suivez-moi. Voici vos menus.', 'NPC: Vous êtes prêts à commander ?', 'YOU: Je vais prendre le poulet, sans oignons, s’il vous plaît.',
    'NPC: Bien sûr. Quelque chose à boire ?', 'YOU: Une bouteille d’eau, s’il vous plaît.', 'NPC: Autre chose ?', 'YOU: C’est tout, merci.', 'NPC: Ça arrive tout de suite !', 'NPC: Tout va bien ?', 'YOU: Oui, c’était délicieux ! L’addition, s’il vous plaît.',
    'NPC: Ravi que ça vous ait plu. Voici — passez une bonne soirée !'],
};
/** The five lines the traveller says — the same sentence ids in every language ("That's all" is Mission 03's own). */
const LEARNER = ['phrase.rest.table-two', 'phrase.rest.ill-have-chicken', 'phrase.rest.water', 'phrase.coffee.thats-all', 'phrase.rest.the-bill'];
const PRODUCED = [...LEARNER, 'phrase.rest.chicken-no-onions'];
const YOU_LINES = [Y_TABLE, Y_ORDER, Y_WATER, Y_ALL, Y_BILL];
/** Canonical transcript ([who, text], exact) — the same value before this pass (12ce7bc) and after. */
const TRANSCRIPT_PRINT = { en: 'df1b104a', es: '121bd80a', fr: '94019625' };
/** The dialogue TREE — changed on purpose: every turn a real decision, a miss re-asked; the pasta and "one moment" branches out. */
const DIALOGUE_PRINT = { en: 'bf3bdf3f', es: '347647d4', fr: 'd73a5e24' };
/** The scene cue in every form it could take (app language and each target language). */
const LATER = /\blater\b|plus tard|más tarde|מאוחר|אחר כך/i;
const FOOD_EXTRA = /\b(pasta|pâtes|fish|poisson|pescado|beef|bœuf|salad|salade|ensalada|dessert|postre|wine|vin|vino|fork|knife|spoon|napkin|starter|tip|tipping|allerg\w*|vegetarian|végétarien|vegetariano|vegan|gluten|nuts|noix|dairy|spicy|piquant|picante|sauce|cheese|fromage|queso|ice|sugar|sucre|azúcar|cash|price|prix|precio|tax)\b|פסטה|קינוח|טיפ|אלרג|צמחוני/i;

/* ── the Restaurant Ticket reveal checker (each run, in order) ──────────────────────────────────── */

const boardOf = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** The facts a ticket shows: 1 table · 2 chicken / no onions · 3 water · 4 order closed · 5 the scene cue (meal over) · 6 bill requested. */
const MARKS: [number, RegExp][] = [[1, /Table: 2|שולחן: 2/], [2, /Main: Chicken|מנה: עוף|Change: No onions|שינוי: בלי בצל/], [3, /Drink: Water|שתייה: מים/],
  [4, /Order: Closed|הזמנה: נסגרה|Order: Complete|הזמנה: הושלמה/], [5, /^⏳/], [6, /Bill: Requested|חשבון: התבקש/]];
const shownFacts = (s: BootcampStep): number[] => MARKS.filter(([, re]) => boardOf(s).some((b) => b.split(' ¦ ').some((p) => (p.includes('‖') || p.startsWith('⏳')) && re.test(p)))).map(([n]) => n);
/** What a step makes known for the NEXT steps: only what the LEARNER said (the cue follows the closed order). */
function revealed(d: BootcampDayContent, s: BootcampStep, lang: CoverageLang): number[] {
  const spoken: string[] = [];
  if (s.kind === 'quickReply') for (const r of s.rounds) spoken.push(said(d, r));
  if (s.kind === 'sentenceBuilder') spoken.push(...s.rounds.map((r) => r.chunks.join(' ')));
  if (s.kind === 'dialogue') spoken.push(...scene(d).nodes.flatMap((x) => (x.choices ?? []).filter((c) => c.correct).map((c) => c.en)));
  const out: number[] = [];
  for (const [n, id] of [[1, 'table-for-two'], [2, 'without-onions'], [3, 'bottle-of-water'], [4, 'thats-all'], [6, 'the-bill']] as const) if (spoken.some((t) => hasChunk(t, chunk(id, lang)))) out.push(n);
  if (out.includes(4)) out.push(5); // the order is in → "later…": the meal can be over
  return out;
}
function revealViolations(d: BootcampDayContent, lang: CoverageLang, from: number, to: number, steps: readonly BootcampStep[] = d.steps): string[] {
  const known = new Set<number>();
  const bad: string[] = [];
  for (let i = from; i < to; i++) {
    const s = steps[i]!;
    for (const f of shownFacts(s)) if (!known.has(f)) bad.push(`step ${i + 1} ${s.kind} shows fact ${f} before it is said`);
    for (const f of revealed(d, s, lang)) known.add(f);
  }
  return bad;
}
const RUNS = (d: BootcampDayContent): [string, number, number][] => [
  ['teaching + flex', 1, supportedAt(d)], ['supported', supportedAt(d), dialogueAt(d)], ['no help', dialogueAt(d) + 1, videoAt(d)], ['final', videoAt(d) + 1, d.steps.length],
];
/** Every target-language text the app could speak: dialogue lines and choices, sentences, heard rounds, options. */
function speakable(d: BootcampDayContent): string[] {
  const out = [...d.items.map((i) => i.text), ...scene(d).nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])];
  for (const s of d.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(heardIn(d, r), ...r.options.map((o) => o.text ?? text(d, o.itemId)));
    if (s.kind === 'visualMatch') for (const r of s.rounds) out.push(r.audio.en, r.reinforce?.en ?? '');
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
    if (s.kind === 'sentenceBuilder') out.push(...s.rounds.flatMap((r) => r.chunks));
  }
  return out.filter(Boolean);
}
/** All app-language copy of the mission (labels, intros, meanings, receipts, situations, captions) — never target text. */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    out.push(...boardOf(s));
    if (s.kind === 'talk') for (const b of s.body) out.push(b.he ?? '', b.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'quickReply') for (const r of s.rounds) if (r.situation) out.push(r.situation.he ?? '', r.situation.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.caption?.he ?? '', t.caption?.en ?? '');
  }
  return out.join(' | ');
}
const withoutCue = (d: BootcampDayContent): BootcampDayContent => ({ ...d, dialogues: { 'sit-down-meal': { ...scene(d), nodes: scene(d).nodes.map(({ cue: _cue, ...n }) => n) } } });

describe('the conversation is locked, and Mission 14 is in its place', () => {
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (12ce7bc) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
    expect(script('en')[4]).toBe("YOU: I'll have the chicken, without onions, please."); // the repo's own straight apostrophe, kept as it was
  });
  for (const lang of LANGS) it(`${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored) (tests 1–3)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision, a miss is asked again slowly; at the door, "I don\'t understand" stays the one recovery move', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      for (const n of nodes.filter((x) => x.who === 'you' && x.id !== 'c1b')) {
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        expect(n.choices!.filter((c) => c.correct && !strip(c.itemId).startsWith('phrase.recovery.')), `${lang} ${n.id}`).toHaveLength(1);
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        expect([again.who, again.slow, again.next, again.cue], `${lang} ${n.id}`).toEqual(['npc', true, n.id, undefined]);
      }
      const help = nodes.flatMap((n) => (n.choices ?? []).filter((c) => strip(c.itemId).startsWith('phrase.recovery.')).map((c) => [n.id, strip(c.itemId)]));
      expect(help, lang).toEqual([['c1', 'phrase.recovery.dont-understand']]);
      expect(JSON.stringify(nodes), lang).not.toMatch(/pasta|pâtes|recovery\.one-moment/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('4. Mission 14 is "Restaurant Meal", fourteenth on the journey (registry key 4)', () => {
    expect(BOOTCAMP_PLAN[13]!.id).toBe('restaurant-meal');
    expect(BOOTCAMP_PLAN[13]!.day).toBe(4);
    expect(missionNumber(4)).toBe(14);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Restaurant Meal');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('5. Missions 01–13 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 13)).toEqual({ en: '2b8faccd', es: 'aedb877a', fr: 'b86a1b63' }); });
  it('6. Missions 18–30 (Missions 16 and 17 have their own passes since: mission16.test.ts, mission17.test.ts) are byte-for-byte unchanged by this pass — Mission 15 has its own pass since (mission15.test.ts)', () => { expect(raw(17, 23)).toEqual({ en: '3c691979', es: 'e2037f1d', fr: '44a927c5' }); expect(raw(24)).toEqual({ en: 'aee7fe64', es: '4b9c9cd9', fr: '6af8deb0' }); }); // Mission 24 left out: its own correction since (the "should" card — practiceCity.test.ts)
  it('7. EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.transferOnly ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.transferOnly ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.label, s.rounds.map((r) => [strip(r.itemId), r.chunks.length])];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      for (const [x, y] of [[W_RES, 0], [Y_TABLE, 1], [W_FOLLOW, 2], [W_READY, 3], [Y_ORDER, 4], [W_DRINK, 5], [Y_WATER, 6], [W_ELSE, 7], [Y_ALL, 8], [W_COMING, 9], [W_OKAY, 10], [Y_BILL, 11], [W_BYE, 12]] as const) expect(script(lang)[y]!.slice(5), lang).toBe(at(x, lang));
    }
  });
});

describe('the scene cue "Later…" — a transition, never a line', () => {
  it('8–9. it is not a spoken sentence and has no sentence id: it is a cue on the waiter\'s line, in the app language', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cued = scene(d).nodes.filter((n) => n.cue);
      expect(cued.map((n) => [n.id, n.cue, n.en]), lang).toEqual([['n5b', { he: 'מאוחר יותר…', en: 'Later…' }, at(W_OKAY, lang)]]);
      for (const l of script(lang)) expect(l, lang).not.toMatch(LATER);
      for (const i of d.items) expect(i.text, `${lang} ${i.id}`).not.toMatch(LATER);
      for (const i of d.items) expect(JSON.stringify(i.meaning), `${lang} ${i.id}`).not.toMatch(LATER);
    }
  });
  it('10. it is never sent to TTS: nothing the app can speak contains it, and the conversation speaks only the line itself', () => {
    for (const lang of LANGS) for (const t of speakable(day(lang))) expect(t, lang).not.toMatch(LATER);
    const ui = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(ui).toMatch(/speak: \(\) => speakL\(node\.en,/);
    expect(ui).toMatch(/displayNpc\.cue && <p className="faint small convo-cue"/);
    expect(ui).not.toMatch(/speakL\([^)]*\.cue/);
  });
  it('11–12. it adds nothing to prior learning or coverage: removing it changes neither', () => {
    for (const lang of LANGS) {
      const plain15 = (l: CoverageLang, n: number) => (n === 14 ? withoutCue(missionContent(l, n)) : missionContent(l, n));
      const a = learnedBefore(lang, 15);
      const b = learnedBefore(lang, 15, plain15);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      for (const e of teachingEncounters(day(lang))) expect(e.text, lang).not.toMatch(LATER);
      for (const c of M14_CONCEPTS) expect(c.chunk[lang], lang).not.toMatch(LATER);
      expect(coverageOf(withoutCue(day(lang)), lang, M14_CONCEPTS), lang).toEqual(coverageOf(day(lang), lang, M14_CONCEPTS));
    }
  });
  it('13. it is only a scene/state transition: the ticket is the same, only the meal phase moves (eating → bill)', () => {
    expect(restaurantTicket(5)).toEqual(restaurantTicket(4));
    const { stage: s4, mealPhase: p4, ...rest4 } = restaurantTicketState(4);
    const { stage: s5, mealPhase: p5, ...rest5 } = restaurantTicketState(5);
    expect(rest5).toEqual(rest4);
    expect([s4, p4, s5, p5]).toEqual(['closed', 'eating', 'later', 'bill']);
    expect(LATER_NOTE).toEqual(['⏳ מאוחר יותר… הארוחה נגמרה.', '⏳ Later… the meal is over.']);
    for (const lang of LANGS) {
      const d = day(lang);
      const later = d.steps.filter((s) => boardOf(s).some((b) => b.startsWith('⏳')));
      expect(later.length, lang).toBeGreaterThan(0);
      for (const s of later) expect(s.kind === 'prime' || s.kind === 'quickReply', lang).toBe(true); // shown on a step that is there anyway — no interaction of its own
      expect(later.every((s) => boardOf(s)[1]!.split(' ¦ ')[0] === LATER_NOTE[1])).toBe(true);
    }
  });
});

describe('roles — the traveller says the five locked lines; the waiter is understood', () => {
  const productions = (d: BootcampDayContent): { id: string; text: string }[] => [
    ...stepsOf(d, 'quickReply').filter((s) => !s.transferOnly).flatMap((s) => s.rounds.map((r) => ({ id: accepted(r), text: said(d, r) }))),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => ({ id: strip(r.itemId), text: r.chunks.join(' ') }))),
  ];
  it('14. exactly five canonical learner turns', () => {
    for (const lang of LANGS) expect(LOCKED[lang].filter((l) => l.startsWith('YOU')), lang).toHaveLength(5);
    for (const lang of LANGS) expect(cinematicTranscript(scene(day(lang))).filter((l) => l.who === 'you').map((l) => l.en), lang).toEqual(YOU_LINES.map((y) => at(y, lang)));
  });
  it('15. the learner produces all five, whole; every production is a locked YOU line', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const you = LOCKED[lang].filter((l) => l.startsWith('YOU')).map((l) => quotes(l.slice(5)));
      expect(new Set(productions(d).map((p) => p.id)), lang).toEqual(new Set(PRODUCED));
      for (const p of productions(d)) expect(you.some((y) => quotes(p.text) === y), `${lang} “${p.text}”`).toBe(true);
      for (const y of you) expect(productions(d).some((p) => quotes(p.text) === y), `${lang} “${y}” is produced whole`).toBe(true);
    }
  });
  it('16. no line of the waiter is ever an answer, a builder target or a learner production', () => {
    const waiter = [W_RES, W_FOLLOW, W_READY, W_DRINK, W_ELSE, W_COMING, W_OKAY, W_BYE];
    for (const lang of LANGS) {
      const d = day(lang);
      const offered = stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(d, o.itemId))));
      for (const w of waiter) expect(offered, lang).not.toContain(at(w, lang));
      for (const c of M14_CONCEPTS.filter((x) => x.role === 'hear' && !['perfect', 'of-course', 'good-evening'].includes(x.id))) expect(offered.some((o) => hasChunk(o, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
      for (const s of stepsOf(d, 'sentenceBuilder')) for (const c of M14_CONCEPTS.filter((x) => x.role === 'hear')) expect(hasChunk(s.rounds[0]!.chunks.join(' '), c.chunk[lang]), `${lang} ${c.id}`).toBe(false);
    }
  });
  it('17. no invented learner line: every option of every round is one of the five lines (or the order, whole)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const allowed = YOU_LINES.map((y) => at(y, lang));
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) {
        expect(LEARNER, lang).toContain(strip(o.itemId));
        expect(allowed, lang).toContain(o.text ?? text(d, o.itemId));
      }
    }
  });
});

describe('the opening briefing — your own situation, nothing of the waiter', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing is the brief\'s Hebrew, the only opening card, and no target-language line', () => {
    for (const lang of LANGS) {
      expect(briefing(lang).body.map((x) => x.he)).toEqual(['אתם שניים ואין לכם הזמנה. אתה רוצה עוף בלי בצל ומים. תעברו את הארוחה עד החשבון.']);
      expect(briefing(lang).title.en).toBe('Mission 14: Restaurant Meal');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      const b = JSON.stringify(briefing(lang));
      for (const l of LOCKED[lang]) expect(b, lang).not.toContain(l.slice(5));
      expect(b, lang).not.toMatch(/ready to order|anything else|everything okay|coming right up|menus/i);
    }
  });
});

describe('the Restaurant Ticket — "?" until YOU have said it', () => {
  it('18. it starts unknown, and so does the state', () => {
    expect(restaurantTicket(0)[1]).toBe('🍽️ Table order: Table: ? / Main: ? / Change: ? ‖ 🥤 Drink & bill: Drink: ? / Order: Open / Bill: —');
    expect(restaurantTicketState(0)).toEqual({ stage: 'nothing', mealPhase: 'arrival', tableSize: null, mainDish: null, removedIngredient: null, drink: null, orderClosed: false, billRequested: false });
    for (const lang of LANGS) expect(boardOf(day(lang).steps[1]!).join(' ')).toContain(restaurantTicket(0)[1]);
  });
  it('19–24. each fact appears first right after the learner says it — never before', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const firstFact = (n: number) => d.steps.findIndex((s) => shownFacts(s).includes(n));
      const answer = (id: string) => d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === id));
      expect(firstFact(1), lang).toBe(answer('phrase.rest.table-two') + 1); // 19: Table → 2
      expect(firstFact(2), lang).toBe(d.steps.findIndex((s) => s.kind === 'sentenceBuilder') + 1); // 20–21: Chicken / No onions
      expect(firstFact(3), lang).toBe(answer('phrase.rest.water') + 1); // 22: Water
      expect(firstFact(4), lang).toBe(answer('phrase.coffee.thats-all') + 1); // 23: Order → CLOSED
      expect(firstFact(6), lang).toBe(answer('phrase.rest.the-bill') + 1); // 24: Bill → REQUESTED
      expect(firstFact(5), lang).toBeGreaterThan(firstFact(4)); // the cue only after the order is in
    }
  });
  it('25. no ticket fact leaks early in any run (teaching + flex, supported, no help, final)', () => {
    for (const lang of LANGS) for (const [name, from, to] of RUNS(day(lang))) expect(revealViolations(day(lang), lang, from, to), `${lang} ${name}`).toEqual([]);
  });
  it('the ticket stays simple: no prices, tips, tax, payment or calories — six rows, nothing else', () => {
    for (let n = 0; n <= 6; n++) for (const t of restaurantTicket(n as 0)) { expect(t).not.toMatch(/€|\$|£|\d+[.,]\d\d|tip|tax|card|cash|kcal|טיפ|מע"מ|כרטיס|מזומן/i); expect(splitTimeBoard(t)!.plan!.flatMap((c) => c.rows)).toHaveLength(6); }
  });
  it('the ticket renders as two columns; "?" and "—" read as not yet known', () => {
    const b = splitTimeBoard(`${restaurantTicket(0)[1]} ¦ What do you answer?`)!;
    expect(b.plan!.map((p) => [p.day, p.rows.map((r) => r.known)])).toEqual([['🍽️ Table order', [false, false, false]], ['🥤 Drink & bill', [false, true, false]]]);
    expect(b.after).toEqual(['What do you answer?']);
    const done = splitTimeBoard(restaurantTicket(6)[1])!;
    expect(done.plan!.flatMap((p) => p.rows.map((r) => r.known))).toEqual([true, true, true, true, true, true]);
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${LATER_NOTE[1]} ¦ ${restaurantTicket(4)[1]}` }));
    expect(html.match(/class="plan-day-row"/g)).toHaveLength(6);
    expect(html).toContain('⏳ Later… the meal is over.');
  });
});

describe('the main order — one builder, no grammar, no extra food', () => {
  it('26. the builder uses each language\'s own chunks and spells the locked line', () => {
    const c = (lang: CoverageLang) => stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
    expect(c('en')).toEqual(["I'll have", 'the chicken,', 'without onions, please.']);
    expect(c('fr')).toEqual(['Je vais prendre', 'le poulet,', 'sans oignons, s’il vous plaît.']);
    expect(c('es')).toEqual(['Voy a tomar', 'el pollo,', 'sin cebolla, por favor.']);
    for (const lang of LANGS) expect(c(lang).join(' ')).toBe(at(Y_ORDER, lang));
  });
  it('27. without / sin / sans = take this ingredient out: the card says so, the ticket shows it, the state holds it', () => {
    for (const lang of LANGS) {
      const card = cardsOf(day(lang)).find((w) => w.key === 'rest.line.order')!;
      expect(card.meaning.en).toMatch(/without = take it out of the dish/);
      expect(card.meaning.he).toMatch(/בלי = להוריד מהמנה/);
      expect(hasChunk(card.text, chunk('without-onions', lang))).toBe(true);
    }
    expect(restaurantTicket(2)[1]).toContain('Change: No onions');
    expect(restaurantTicketState(2)).toMatchObject({ mainDish: 'chicken', removedIngredient: 'onions' });
  });
  it('28. no grammar explanation: no rule, tense or "I\'ll = I will" anywhere in the copy', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(/grammar|tense|future|past|I will|conjugat|infinitive|voy a = |je vais = |דקדוק|זמן עתיד|זמן עבר|פועל|נטייה/i);
  });
  it('29. no extra food or restaurant vocabulary, and nothing of Mission 15 (allergies, preferences)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const used = JSON.stringify([d.steps, d.dialogues]);
      const unused = d.items.filter((i) => !used.includes(`"${i.id}"`)).map((i) => i.text);
      for (const t of [...speakable(d).filter((x) => !unused.includes(x) || used.includes(JSON.stringify(x))), appCopy(d)]) expect(t, lang).not.toMatch(FOOD_EXTRA);
      // The Restaurant Basics pasta sentence keeps its id (the sentence catalog relies on it) — but no step or line uses it.
      expect(used, lang).not.toContain(`"${lang}.phrase.rest.ill-have"`);
    }
  });
  it('one major builder only, and the bill line is never built word by word', () => {
    for (const lang of LANGS) {
      const b = stepsOf(day(lang), 'sentenceBuilder');
      expect(b.map((s) => strip(s.rounds[0]!.itemId)), lang).toEqual(['phrase.rest.chicken-no-onions']);
      expect(b[0]!.rounds).toHaveLength(1);
    }
  });
});

describe('WAITER SIGNALS — what does the waiter want now?', () => {
  const signals = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => !s.transferOnly);
  it('30–34. one fast integration board: reservation, ready to order, drink, anything else, everything okay → what the waiter wants', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(signals(d), lang).toHaveLength(1);
      const s = signals(d)[0]!;
      expect(s.challenge, lang).toBe(true); // natural pace: intent recognition, not translation
      expect(s.tiles).toEqual(Object.values(WAITER_SIGNALS));
      expect(s.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[at(W_DRINK, lang), 'drink'], [at(W_RES, lang), 'table'], [at(W_OKAY, lang), 'check'], [at(W_READY, lang), 'food'], [at(W_ELSE, lang), 'more']]);
      expect(s.label!.en).toBe('⚡ Waiter signals — what does the waiter want now?');
      expect(s.ordered).toBeUndefined(); // shuffled — correctness is the intent, never a position
    }
    expect(SIGNAL_ROUNDS.map(([, c]) => c)).toEqual(['drink', 'table', 'check', 'food', 'more']); // out of meal order
    for (const t of Object.values(WAITER_SIGNALS)) { expect(t.caption!.he).toBeTruthy(); expect(t.caption!.en).toBeTruthy(); expect(t.image).toBeUndefined(); }
  });
  it('the companion introduces the board as the waiter\'s intent — never the generic "hear the price"', () => {
    const d = day('en');
    const coach = coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[13]!.id)!;
    expect(coach.line).toEqual({ he: 'שמע את המלצר — והקש על מה שהוא רוצה.', en: 'Hear the waiter — and tap what he wants.' });
    expect(coach.line.en).not.toMatch(/price/);
  });
  it('the signals are comprehension: their cards give the intent, and each is answered in every run', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const intent = (key: string) => cardsOf(d).find((w) => w.key === key)!.meaning.en;
      expect(intent('rest.line.reservation')).toMatch(/did you book a table/);
      expect(intent('rest.line.ready')).toMatch(/wants your food order now/);
      expect(intent('rest.line.drink')).toMatch(/asks for your drink/);
      expect(intent('rest.line.okay')).toMatch(/checks the meal was okay/);
      const rounds = stepsOf(d, 'quickReply').flatMap((s) => s.rounds);
      for (const [w, id] of [[W_RES, 'phrase.rest.table-two'], [W_READY, 'phrase.rest.ill-have-chicken'], [W_DRINK, 'phrase.rest.water'], [W_ELSE, 'phrase.coffee.thats-all'], [W_OKAY, 'phrase.rest.the-bill']] as const)
        expect(rounds.filter((r) => r.npc?.en === at(w, lang)).every((r) => accepted(r) === id), `${lang} ${id}`).toBe(true);
    }
  });
});

describe('PRIOR LEARNING — verified, not assumed (learnedBefore(lang, 14))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 14);
  it('35. Mission 03\'s genuine teaching is reused: "That\'s all, thanks." is its own sentence, "Anything else?" its own signal', () => {
    for (const lang of LANGS) {
      const p = prior(lang);
      expect(p.concepts.map((c) => c.id), lang).toEqual(expect.arrayContaining(['m03:thats-all', 'm03:thanks', 'm03:please', 'm03:anything-else']));
      expect(p.knowsChunk(chunk('thats-all', lang)), lang).toBe(true);
      expect(p.knowsChunk(chunk('anything-else', lang).replace(/[¿?]/g, '').trim()), lang).toBe(true);
      const m03 = missionContent(lang, 3).items.find((i) => strip(i.id) === 'phrase.coffee.thats-all')!;
      const m14 = day(lang).items.find((i) => strip(i.id) === 'phrase.coffee.thats-all')!;
      expect(m14).toEqual(m03);
      expect(m14.text).toBe(at(Y_ALL, lang));
      for (const id of ['good-evening', 'please', 'perfect', 'of-course', 'thanks', 'no', 'yes']) expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(true);
      expect(p.words.has({ en: 'reservation', es: 'reserva', fr: 'réservation' }[lang]), lang).toBe(true);
      expect(p.words.has({ en: 'two', es: 'dos', fr: 'deux' }[lang]), lang).toBe(true);
    }
  });
  it('partial prior: "please" is known, "a table for two" and "without onions" are new; "Thanks" is known, the order is new', () => {
    for (const lang of LANGS) {
      const p = prior(lang);
      for (const id of ['table-for-two', 'ill-have', 'the-chicken', 'without-onions', 'bottle-of-water', 'delicious', 'the-bill', 'ready-to-order', 'to-drink', 'everything-okay', 'coming-right-up', 'follow-me', 'glad-enjoyed', 'lovely-evening'])
        expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id} is new`).toBe(false);
      for (const w of { en: ['table', 'chicken', 'onions', 'bottle', 'bill', 'delicious', 'menus', 'drink'], es: ['mesa', 'pollo', 'cebolla', 'botella', 'cuenta', 'delicioso', 'cartas', 'beber'], fr: ['table', 'poulet', 'oignons', 'bouteille', "l'addition", 'délicieux', 'menus', 'boire'] }[lang])
        expect(p.words.has(w), `${lang} ${w} is new`).toBe(false);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M14_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every new chunk taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('36. dialogue-only exposure still does not count: "bottle" placed only in an earlier conversation is not learned', () => {
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 13) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} A bottle of water, please.` } : x)) } } };
    };
    const earlier = learnedBefore('en', 14, seen);
    expect(earlier.words.has('bottle')).toBe(false);
    const d = day('en');
    const noCard = { ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'rest.line.water') } : s)) };
    expect(unpreparedWords(noCard, earlier.words, 'en').join(' ')).toMatch(/“bottle”/);
  });
  it('37. removing required new teaching fails the audit (table, order, drink, bill cards; the order builder)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (...keys: string[]): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => !keys.includes(w.key ?? '')) } : s)) });
      expect(unprepared(without('rest.line.table-two'), lang).join(' '), lang).toMatch(/table-for-two/);
      expect(unprepared(without('rest.line.order'), lang).join(' '), lang).toMatch(/without-onions|the-chicken|ill-have/);
      expect(unprepared(without('rest.line.water'), lang).join(' '), lang).toMatch(/bottle-of-water/);
      expect(unprepared(without('rest.line.bill'), lang).join(' '), lang).toMatch(/the-bill|delicious/);
      expect(unprepared(without('rest.line.ready'), lang).join(' '), lang).toMatch(/ready-to-order/);
      expect(unprepared(without('rest.line.okay'), lang).join(' '), lang).toMatch(/everything-okay/);
    }
  });
  it('38. prior chunks get no redundant teaching: no card, builder or drill for "That\'s all" / "Anything else?" / please / Perfect / Of course', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) {
        expect(w.line, `${lang} ${w.key}`).toBe(true); // whole lines only — never a word card
        expect(w.text, lang).not.toBe(at(Y_ALL, lang));
        expect(w.text, lang).not.toBe(at(W_ELSE, lang));
        expect(plain(w.text).trim(), lang).not.toMatch(/^(please|thanks|perfect|of course|por favor|gracias|perfecto|claro|s'il vous plaît|merci|parfait|bien sûr)$/);
      }
      expect(stepsOf(d, 'quiz').length + stepsOf(d, 'replies').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'swap').length + stepsOf(d, 'ambush').length, lang).toBe(0);
      // "That's all, thanks." is only ever retrieved — exactly once per run, plus the teaching moment the order closes on
      const retrieved = stepsOf(d, 'quickReply').filter((s) => !s.transferOnly).flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.coffee.thats-all');
      expect(retrieved, lang).toHaveLength(4);
    }
  });
});

describe('the FLEX ROUND — one transfer, no new language, no contamination', () => {
  it('39–40. at most 2 interactions — here ONE, marked transferOnly, after the whole meal has been taught', () => {
    expect(M14_FLEX.transferOnly).toBe(true);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(flexAt(d).reduce((k, i) => k + (d.steps[i] as VM).rounds.length, 0), lang).toBe(1);
      expect(flexAt(d).map((i) => d.steps[i]!.kind), lang).toEqual(['visualMatch']);
      expect(flexAt(d)[0]!, lang).toBeGreaterThan(primeAt(d, 'rest.line.bye'));
      expect(Math.max(...flexAt(d)), lang).toBeLessThan(dialogueAt(d));
      expect((boardOf(d.steps[flexAt(d)[0]!]!)[1] ?? '').startsWith('🔁 Flex round'), lang).toBe(true);
      const vm = d.steps[flexAt(d)[0]!] as VM;
      expect(vm.tiles).toEqual([PARTY_SIZES.two, PARTY_SIZES.four]); // semantic numbers, equal treatment — never a picture answer
      expect(vm.rounds[0]!.correct).toBe('four');
    }
  });
  it('41. Flex content is never canonical: not a dialogue line, not a sentence of the course', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const audio = at(M14_FLEX.partySize.audio, lang);
      expect(JSON.stringify(d.dialogues), lang).not.toContain(audio);
      expect(d.items.map((i) => i.text), lang).not.toContain(audio);
      expect(script(lang).map((l) => l.slice(5)), lang).not.toContain(audio);
    }
  });
  it('42. Flex creates no prior learning for Mission 15: learnedBefore(15) is identical with or without it; coverage too', () => {
    for (const lang of LANGS) {
      const without = (l: CoverageLang, n: number) => (n === 14 ? withoutFlex(missionContent(l, n)) : missionContent(l, n));
      const a = learnedBefore(lang, 15);
      const b = learnedBefore(lang, 15, without);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      expect(teachingEncounters(day(lang)).some((e) => isFlex(day(lang).steps[e.step]!)), lang).toBe(false);
      expect(coverageOf(withoutFlex(day(lang)), lang, M14_CONCEPTS)).toEqual(coverageOf(day(lang), lang, M14_CONCEPTS));
    }
  });
  it('43–44. no unknown word, and the number is genuine prior learning ("four"; "three" is not, so it is not used)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const first = flexAt(d)[0]!;
      const known = new Set([...learnedBefore(lang, 14).words, ...missionWalk(d).taught.filter((e) => e.at < first).flatMap((e) => auditWords(e.text))]);
      for (const w of auditWords(at(M14_FLEX.partySize.audio, lang))) expect(known.has(w), `${lang} “${w}”`).toBe(true);
      const four = { en: 'four', es: 'cuatro', fr: 'quatre' }[lang];
      expect(learnedBefore(lang, 14).words.has(four), lang).toBe(true);
      expect(learnedBefore(lang, 14).words.has({ en: 'three', es: 'tres', fr: 'trois' }[lang]), lang).toBe(false);
      expect(at(M14_FLEX.partySize.audio, lang)).toBe(at(Y_TABLE, lang).replace({ en: 'two', es: 'dos', fr: 'deux' }[lang], four)); // the canonical chunk, another number
    }
  });
  it('negative mutation: an unknown word in the Flex Round fails the audit ("a table for three")', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const i = flexAt(d)[0]!;
      const vm = d.steps[i] as VM;
      const three = { en: 'No — a table for three, please.', es: 'No — una mesa para tres, por favor.', fr: 'Non — une table pour trois, s’il vous plaît.' }[lang];
      const planted = replace(d, i, { ...vm, rounds: [{ ...vm.rounds[0]!, audio: { en: three, he: 'x' } }] });
      expect(unpreparedWords(planted, learnedBefore(lang, 14).words, lang).join(' '), lang).toMatch(/“three”|“tres”|“trois”/);
    }
  });
});

describe('the meal runs — supported, no help, final', () => {
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : []));
  it('45–46. the supported meal: all five lines in order; the ticket fills as you say them', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, supportedAt(d), dialogueAt(d)), lang).toEqual(LEARNER);
      expect(revealViolations(d, lang, supportedAt(d), dialogueAt(d)), lang).toEqual([]);
      const run = d.steps.slice(supportedAt(d), dialogueAt(d));
      expect(boardOf(run[0]!)[1]).toContain(restaurantTicket(0)[1]);
      for (const s of run) if (s.kind === 'quickReply') { expect(splitTimeBoard(s.label!.en ?? '')!.plan, lang).toBeTruthy(); for (const r of s.rounds) expect(r.promptItemId, lang).toBeDefined(); }
      expect((d.steps[dialogueAt(d) - 1] as Extract<BootcampStep, { kind: 'receipt' }>).text.en).toContain(restaurantTicket(6)[1]);
    }
  });
  it('47–48. no help: no ticket at first, then only what this run has said; the waiter\'s own lines, in order, at natural pace', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(LEARNER);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect((run[0] as QR).label).toBeUndefined();
      expect(run.some((s) => s.kind === 'prime')).toBe(false);
      for (const s of run) if (s.kind === 'quickReply') { expect(s.challenge).toBe(true); for (const r of s.rounds) expect(r.npc).toBeDefined(); }
      expect(revealViolations(d, lang, dialogueAt(d) + 1, videoAt(d)), lang).toEqual([]);
      expect(run.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => r.npc!.en) : []))).toEqual([W_RES, W_READY, W_DRINK, W_ELSE, W_OKAY].map((w) => at(w, lang)));
    }
  });
  it('49. the final is ONE meal: from the door to the bill — every core ability, the brief\'s setup', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual(LEARNER);
      expect((d.steps[videoAt(d) + 1] as QR).label!.he).toContain('ארוחת ערב במסעדה. תגיע מהכניסה עד החשבון.');
      expect(revealViolations(d, lang, videoAt(d) + 1, d.steps.length), lang).toEqual([]);
      expect(d.steps.slice(videoAt(d) + 1).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => r.npc!.en) : []))).toEqual([W_RES, W_READY, W_DRINK, W_ELSE, W_OKAY].map((w) => at(w, lang)));
    }
  });
  it('50. 🍽️ MEAL COMPLETE only once, at the very end, after the bill — the final ticket, no score', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const ends = d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('MEAL COMPLETE'));
      expect(ends.map(([, i]) => i), lang).toEqual([d.steps.length - 2]);
      expect((ends[0]![0] as Extract<BootcampStep, { kind: 'receipt' }>).text).toEqual({ he: MEAL_COMPLETE[0], en: MEAL_COMPLETE[1] });
      expect(MEAL_COMPLETE[1]).toBe('🍽️ MEAL COMPLETE ¦ 🍽️ Table order: Table: 2 / Main: Chicken / Change: No onions ‖ 🥤 Drink & bill: Drink: Water / Order: Complete ✅ / Bill: Requested ✅');
      expect(MEAL_COMPLETE[1]).not.toMatch(/%|points|score|\d+\/\d+/i);
      const billAt = Math.max(...d.steps.map((s, i) => (s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === 'phrase.rest.the-bill') ? i : -1)));
      expect(ends[0]![1]).toBe(billAt + 1);
      expect(d.steps.at(-1)!.kind).toBe('summary');
    }
  });
});

describe('negative mutations — each one is caught', () => {
  const leak = (lang: CoverageLang, n: 1 | 2 | 3 | 4 | 6): string[] => {
    const d = day(lang);
    const early = d.steps.map((s, i) => (i === 1 && s.kind === 'prime' ? { ...s, intro: { he: restaurantTicket(n)[0], en: restaurantTicket(n)[1] } } : s));
    return revealViolations(d, lang, 1, supportedAt(d), early);
  };
  it('Chicken, Water, Order CLOSED or Bill REQUESTED on the ticket too early', () => {
    for (const lang of LANGS) {
      expect(leak(lang, 2).join(' '), lang).toMatch(/fact 2/);
      expect(leak(lang, 3).join(' '), lang).toMatch(/fact 3/);
      expect(leak(lang, 4).join(' '), lang).toMatch(/fact 4/);
      expect(leak(lang, 6).join(' '), lang).toMatch(/fact 6/);
    }
  });
  it('"Later" accidentally inside a spoken line is caught (and changes the locked transcript)', () => {
    const d = day('en');
    const bad: BootcampDayContent = { ...d, dialogues: { 'sit-down-meal': { ...scene(d), nodes: scene(d).nodes.map((n) => (n.id === 'n5b' ? { ...n, en: `Later… ${n.en}` } : n)) } } };
    expect(speakable(bad).some((t) => LATER.test(t))).toBe(true);
    expect(fnv(JSON.stringify(cinematicTranscript(scene(bad)).map((x) => [x.who, x.en])))).not.toBe(TRANSCRIPT_PRINT.en);
  });
  it('removing the order builder\'s card or the table card leaves a tested chunk unprepared (see 37); dialogue exposure never prepares it (see 36)', () => {
    const d = day('fr');
    const noTable = { ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'rest.line.table-two') } : s)) };
    expect(unpreparedWords(noTable, learnedBefore('fr', 14).words, 'fr').join(' ')).toMatch(/“table”/);
  });
});

describe('shortness — Pareto guardrails against bloat', () => {
  it('26 meaningful interactions (target 24–27): 5 teaching · 5 waiter signals · 1 flex · 5 supported · 5 no help · 5 final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(26);
      expect(interactions(d), lang).toBeLessThanOrEqual(27);
      expect(interactions({ ...d, steps: d.steps.slice(0, supportedAt(d)) }), lang).toBe(11);
      expect(interactions({ ...d, steps: d.steps.slice(supportedAt(d), dialogueAt(d)) }), lang).toBe(5);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(5);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(5);
    }
  });
  it('no drill for "Coming right up", the menus, "follow me", Perfect / Of course, or the goodbye: never heard as a question to answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const asked = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => heardIn(d, r))), ...stepsOf(d, 'visualMatch').flatMap((s) => s.rounds.map((r) => r.audio.en))];
      for (const id of ['coming-right-up', 'menus', 'follow-me', 'glad-enjoyed', 'lovely-evening', 'perfect']) expect(asked.some((t) => hasChunk(t, chunk(id, lang))), `${lang} ${id}`).toBe(false);
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0);
    }
  });
  it('no vocabulary section: every card is a whole line of this conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(d)) expect(lines, `${lang} ${w.key}`).toContain(w.text);
      expect(stepsOf(d, 'prime').some((p) => p.gate), lang).toBe(false);
    }
  });
});

describe('audio never blocks the answer (the approved conversation behaviour)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const beat = (lang: CoverageLang, id: string) => {
    const d = scene(day(lang));
    const calls: string[] = [];
    let finish: (r: SpeakResult) => void = () => undefined;
    runNpcBeat(d, d.nodes.find((n) => n.id === id)!, {
      speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); },
      go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false,
    });
    return { calls, finish: async (r: SpeakResult) => { finish(r); await Promise.resolve(); await Promise.resolve(); } };
  };
  it('51–53. every answered line of the waiter shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.map((n) => n.id), lang).toEqual(['n1', 'm1', 'r1', 'n2b', 'm2', 'n3', 'm3', 'n4', 'm4', 'n5b', 'm5']);
      for (const n of answered) {
        const run = beat(lang, n.id);
        expect(run.calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]);
        await run.finish('ended');
        expect(run.calls.filter((c) => c.startsWith('go:'))).toHaveLength(1);
      }
      const bye = beat(lang, d.nodes.find((n) => n.end)!.id);
      expect(bye.calls).toEqual(['speak']);
      await bye.finish('ended');
      expect(bye.calls.at(-1)).toBe('end');
    }
  });
  it('54. answering mid-line stops the waiter\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, spoken: [] as string[], getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; this.spoken.push(u.text); } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const ready = tts.speak(W_READY[0], 'en');
    void tts.speak(Y_ORDER[0], 'en');
    expect(await ready).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_ORDER[0]);
    tts.cancelSpeech();
    expect(synth.current).toBeNull();
    expect(synth.spoken.some((t) => LATER.test(t))).toBe(false);
  });
  it('55. replay stays: the conversation and the quick replies keep their 🔊 replay; nothing waits for "audio finished"', () => {
    const read = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(read('./Bootcamp.tsx')).toContain("🔊 {t('replayQuestion')}");
    expect(read('./PracticeSteps.tsx')).toMatch(/AudioBubble onPlay=/);
    expect(read('./PracticeSteps.tsx')).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
  it('56. the "Later…" beat speaks only the waiter\'s line — once — and the cue itself produces no audio', async () => {
    for (const lang of LANGS) {
      const n = scene(day(lang)).nodes.find((x) => x.id === 'n5b')!;
      expect(n.en).toBe(at(W_OKAY, lang));
      const run = beat(lang, 'n5b');
      expect(run.calls.filter((c) => c === 'speak')).toHaveLength(1);
      // "Coming right up!" (n5) waits for its own audio, then the scene moves on to the cue's line
      const before = beat(lang, 'n5');
      expect(before.calls).toEqual(['speak']);
      await before.finish('ended');
      expect(before.calls).toEqual(['speak', 'go:n5b']);
    }
  });
});

describe('serialisable state', () => {
  it('57–58. the Restaurant Ticket state and the meal phase serialise', () => {
    for (let n = 0; n <= 6; n++) {
      const s = restaurantTicketState(n as 0);
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
      expect(s.mealPhase).toBe(MEAL_PHASES[n]);
    }
    expect([...new Set(MEAL_PHASES)]).toEqual(['arrival', 'ordering', 'eating', 'bill', 'complete']);
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
  it('59. restoring a state never leaks the future: each stage holds only what was said by then', () => {
    for (let n = 0; n <= 6; n++) {
      const s = JSON.parse(JSON.stringify(restaurantTicketState(n as 0))) as ReturnType<typeof restaurantTicketState>;
      expect(s.tableSize === null).toBe(n < 1);
      expect(s.mainDish === null && s.removedIngredient === null).toBe(n < 2);
      expect(s.drink === null).toBe(n < 3);
      expect(s.orderClosed).toBe(n >= 4);
      expect(s.billRequested).toBe(n >= 6);
      if (n < 6) expect(JSON.stringify(restaurantTicket(n as 0))).not.toMatch(/Requested|התבקש/);
    }
  });
  it('60. the Flex Round state serialises', () => { expect(JSON.parse(JSON.stringify(M14_FLEX))).toEqual(M14_FLEX); });
});

describe('coverage: every meaningful chunk, accounted for', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M14_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M14_CONCEPTS.flatMap((c) => plain(quotes(c.chunk[lang])).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED here, VERIFIED PRIOR, or a CONTEXT line (card + conversation) — without the Flex Round`, () => {
    const prior = learnedBefore(lang, 14);
    for (const row of coverageOf(day(lang), lang, M14_CONCEPTS)) {
      const c = M14_CONCEPTS.find((x) => x.id === row.id)!;
      if (M14_CONTEXT_ONLY.includes(row.id)) { expect(row.byKind.meaning, `${lang} ${row.id}`).toBeGreaterThanOrEqual(1); expect(row.byKind.context, `${lang} ${row.id}`).toBeGreaterThanOrEqual(1); continue; }
      expect(row.covered || prior.knowsChunk(c.chunk[lang]), `${lang} ${row.id}: ${row.why}`).toBe(true);
      if (!prior.knowsChunk(c.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    }
    expect(coverageOf(withoutFlex(day(lang)), lang, M14_CONCEPTS)).toEqual(coverageOf(day(lang), lang, M14_CONCEPTS));
  });
  it('the context-only lines are exactly the waiter\'s lines with nothing to answer', () => {
    expect([...M14_CONTEXT_ONLY].sort()).toEqual(['coming-right-up', 'follow-me', 'glad-enjoyed', 'here-you-are', 'lovely-evening', 'menus']);
    for (const id of M14_CONTEXT_ONLY) expect(M14_CONCEPTS.find((c) => c.id === id)!.role).toBe('hear');
  });
  it('80/20: the five production tools get the most retrieval', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = (id: string) => encounters(d, chunk(id, lang)).filter((e) => e.kind === 'retrieval').length;
      for (const id of ['table-for-two', 'without-onions', 'bottle-of-water', 'thats-all', 'the-bill']) expect(n(id), `${lang} ${id}`).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('the arc, visuals and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'quickReply') && s.transferOnly ? `${s.kind}:flex` : (s.kind === 'visualMatch' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'quickReply',
      'prime', 'sentenceBuilder',
      'prime', 'quickReply',
      'quickReply',
      'prime',
      'prime', 'quickReply', 'receipt',
      'visualMatch:speed',
      'visualMatch:flex',
      'quickReply', 'quickReply', 'quickReply', 'quickReply', 'quickReply', 'receipt',
      'dialogue', 'receipt',
      'quickReply:speed', 'quickReply:speed', 'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'quickReply', 'quickReply', 'receipt', 'summary',
    ]);
  });
  it('visual slots: 10 semantic slots and 1 result prop — final artwork, listed in the asset manifest', () => {
    expect(Object.keys(M14_SLOTS).sort()).toEqual(['coming-right-up', 'delicious-bill', 'drink-order', 'follow-to-table', 'goodbye', 'meal-check', 'order-chicken', 'ready-to-order', 'restaurant-entrance', 'table-for-two']);
    expect(Object.keys(M14_PROPS)).toEqual(['meal-complete']);
    for (const s of [...Object.values(M14_SLOTS), ...Object.values(M14_PROPS)]) { expect(s.image).toMatch(/^images\/mission14\/[a-z-]+\.jpg$/); expect('emoji' in s).toBe(false); expect(existsSync(new URL(`../../../public/${s.image}`, import.meta.url))).toBe(true); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION14_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/FINAL ARTWORK INTEGRATED/);
    for (const key of [...Object.keys(M14_SLOTS), ...Object.keys(M14_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language; no picture is ever an answer', () => {
    const looks = new Set(Object.values(M14_SLOTS).map((s) => s.image));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p: Prime) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'visualMatch')) for (const t of s.tiles) { expect(t.caption, lang).toBeDefined(); expect(t.image).toBeUndefined(); }
  });
  it('video: EN and FR have the Mission 14 video, ES has none — the standard step plays or is safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[13]!.day);
      const file = fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_14.mp4`, import.meta.url));
      expect(Boolean(video), lang).toBe(existsSync(file));
      expect(Boolean(video), lang).toBe(lang !== 'es');
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
