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
import { coverageOf, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M15_CONCEPTS, M15_CONTEXT_ONLY } from './mission15Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  KITCHEN_CHECK_SENT, M15_PROPS, M15_SLOTS, NUT_ANSWERS, N_BACK, N_CREAM, N_OTHER, N_READY, N_RISOTTO, N_TELL, SITUATIONS,
  Y_ALLERGY, Y_DAIRY, Y_ONIONS, Y_THANKS, Y_VEG, foodCheck, foodCheckState,
} from './practiceAllergies.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 15 — Food Preferences & Allergies: a SMALL survival mission. The conversation is LOCKED.
 * Four functions (allergy, diet, ask about an ingredient, remove one) and one safety idea: "I'll check
 * with the kitchen" means NOT CONFIRMED. Nothing in the mission ever says the food is safe.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 15): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M15_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
const quotes = (s: string): string => s.replace(/[’‘]/g, "'");
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, r: Round): string => { const o = r.options.find((x) => x.correct)!; return o.text ?? text(d, o.itemId); };
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const gameAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.every((r) => r.situation));
const supportedAt = (d: BootcampDayContent): number => gameAt(d) + 1;
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const scene = (d: BootcampDayContent) => d.dialogues['allergy-order']!;
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);

/** The conversation exactly as the brief froze it (pasted verbatim). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hi there! Are you ready to order?', 'YOU: I’m allergic to nuts.', 'NPC: Thank you for telling me. Any other allergies or dietary restrictions?', 'YOU: I’m vegetarian.',
    'NPC: Got it. The mushroom risotto is vegetarian, but I’ll check with the kitchen about the nuts.', 'YOU: Does it have dairy?', 'NPC: Yes, it has some cream, but we can make it without.',
    'YOU: Great. Without onions, please.', 'NPC: Of course. I’ll tell the kitchen about your allergy.', 'YOU: Thank you!', 'NPC: I’ll check with them and come right back.'],
  es: ['NPC: ¡Hola! ¿Está listo para pedir?', 'YOU: Soy alérgico a los frutos secos.', 'NPC: Gracias por avisarme. ¿Alguna otra alergia o restricción alimentaria?', 'YOU: Soy vegetariano.',
    'NPC: Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', 'YOU: ¿Esto lleva lácteos?', 'NPC: Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.',
    'YOU: Genial. Sin cebolla, por favor.', 'NPC: Claro. Aviso a la cocina de su alergia.', 'YOU: ¡Gracias!', 'NPC: Lo compruebo con ellos y vuelvo enseguida.'],
  fr: ['NPC: Bonjour ! Vous êtes prêt à commander ?', 'YOU: Je suis allergique aux noix.', 'NPC: Merci de me le dire. D’autres allergies ou restrictions alimentaires ?', 'YOU: Je suis végétarien.',
    'NPC: Compris. Le risotto aux champignons est végétarien, mais je vérifie avec la cuisine pour les noix.', 'YOU: Est-ce qu’il y a des produits laitiers dedans ?', 'NPC: Oui, il y a un peu de crème, mais on peut le faire sans.',
    'YOU: Parfait. Sans oignons, s’il vous plaît.', 'NPC: Bien sûr. Je préviens la cuisine pour votre allergie.', 'YOU: Merci !', 'NPC: Je vérifie avec eux et je reviens tout de suite.'],
};
/** The five lines the traveller says ("Thank you!" is the toolkit's own sentence). */
const LEARNER = ['phrase.diet.allergic-nuts', 'phrase.diet.vegetarian', 'phrase.diet.does-have-dairy', 'phrase.diet.without-onions', 'phrase.recovery.thank-you'];
const YOU_LINES = [Y_ALLERGY, Y_VEG, Y_DAIRY, Y_ONIONS, Y_THANKS];
const WAITER = [N_READY, N_OTHER, N_RISOTTO, N_CREAM, N_TELL];
/** Canonical transcript ([who, text], exact) — the same value before this pass (14cf6bd) and after. */
const TRANSCRIPT_PRINT = { en: 'ac564961', es: 'b33dbcbc', fr: '1351a340' };
/** The dialogue TREE — changed on purpose: the spicy branch and the recovery-tool branches out, every turn a decision. */
const DIALOGUE_PRINT = { en: '32cff592', es: '0c00b5fa', fr: '5ccc9fc6' };
/** Anything that could read as a safety assurance — in the app language or a target language. */
const SAFE = /\bsafe\b|approved|all clear|cleared|confirmed safe|nut[- ]free|sans noix|sin frutos secos|בטוח|מאושר|נקי מאגוזים/i;
const ALLERGENS = /gluten|shellfish|seafood|fish|poisson|pescado|peanut|cacahu|cacahuète|egg|œuf|huevo|soja|soybean|sesame|sésame|sésamo|wheat|blé|trigo|lactose|lactosa|vegan|végan|vegano|meat|viande|carne|spicy|épicé|pica\b|גלוטן|ביצים|סויה|שומשום|טבעוני|חריף/i;

/* ── the Food Check reveal checker (each run, in order) ────────────────────────────────────────── */

const boardOf = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** The facts the Food Check shows: 1 dish vegetarian / nuts → kitchen checking · 2 dairy → cream, can remove · 3 kitchen notified. */
const MARKS: [number, RegExp][] = [[1, /Dish: Vegetarian|מנה: צמחונית|Nuts: Kitchen checking|אגוזים: המטבח בודק/], [2, /Dairy: Cream|חלב: יש שמנת/], [3, /Kitchen: Allergy notified|מטבח: האלרגיה נמסרה/]];
const shownFacts = (s: BootcampStep): number[] => MARKS.filter(([, re]) => boardOf(s).some((b) => b.split(' ¦ ').some((p) => p.includes('‖') && re.test(p)))).map(([n]) => n);
/** What a step makes known for the NEXT steps: the waiter's lines, once heard. */
function revealed(d: BootcampDayContent, s: BootcampStep, lang: CoverageLang): number[] {
  const heard: string[] = [];
  if (s.kind === 'prime') heard.push(...s.words.map((w) => w.text));
  if (s.kind === 'quickReply') for (const r of s.rounds) if (!r.situation) heard.push(heardIn(d, r));
  if (s.kind === 'visualMatch') heard.push(...s.rounds.map((r) => r.audio.en));
  if (s.kind === 'dialogue') heard.push(...scene(d).nodes.map((x) => x.en));
  return ([[1, N_RISOTTO], [2, N_CREAM], [3, N_TELL]] as const).filter(([, l]) => heard.includes(at(l, lang))).map(([n]) => n);
}
function revealViolations(d: BootcampDayContent, lang: CoverageLang, from: number, to: number, steps: readonly BootcampStep[] = d.steps): string[] {
  const known = new Set<number>();
  const bad: string[] = [];
  for (let i = from; i < to; i++) {
    const s = steps[i]!;
    for (const f of shownFacts(s)) if (!known.has(f)) bad.push(`step ${i + 1} ${s.kind} shows fact ${f} before the waiter says it`);
    for (const f of revealed(d, s, lang)) known.add(f);
  }
  return bad;
}
const RUNS = (d: BootcampDayContent): [string, number, number][] => [
  ['teaching', 1, supportedAt(d)], ['supported', supportedAt(d), dialogueAt(d)], ['no help', dialogueAt(d) + 1, videoAt(d)], ['final', videoAt(d) + 1, d.steps.length],
];
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
/** Every target-language text a step or the conversation shows or speaks. */
function targetText(d: BootcampDayContent): string[] {
  const out = scene(d).nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]);
  for (const s of d.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(r.situation ? '' : heardIn(d, r), ...r.options.map((o) => o.text ?? text(d, o.itemId)));
    if (s.kind === 'visualMatch') for (const r of s.rounds) out.push(r.audio.en);
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
  }
  return out.filter(Boolean);
}

describe('the conversation is locked, and Mission 15 is in its place', () => {
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (14cf6bd) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
  });
  for (const lang of LANGS) it(`${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision; the spicy branch and the recovery-tool branches are gone', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      for (const n of nodes.filter((x) => x.who === 'you' && x.id !== 'c2b')) {
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        // a miss is re-asked slowly — except a polite "Thank you!" to the restrictions question, which keeps its own follow-up
        if (n.id === 'c2') expect([again.id, again.next, strip(wrong[0]!.itemId)]).toEqual(['r2', 'c2b', 'phrase.recovery.thank-you']);
        else expect([again.who, again.slow, again.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
      }
      expect(JSON.stringify(nodes), lang).not.toMatch(/spicy|épicé|pica|recovery\.(repeat|slowly)/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('Mission 15 is "Food Preferences & Allergies", fifteenth on the journey (registry key 13)', () => {
    expect(BOOTCAMP_PLAN[14]!.id).toBe('special-requests-allergies');
    expect(BOOTCAMP_PLAN[14]!.day).toBe(13);
    expect(missionNumber(13)).toBe(15);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Food Preferences & Allergies');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('Missions 01–14 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 14)).toEqual({ en: 'ff40b97d', es: '81eb2485', fr: '18e0f495' }); });
  it('Missions 19–30 (Missions 16–18 have their own passes since: mission16.test.ts … mission18.test.ts) are byte-for-byte unchanged by this pass', () => { expect(raw(18, 23)).toEqual({ en: '2610dcde', es: 'b7abb616', fr: '223af58a' }); expect(raw(24)).toEqual({ en: 'aee7fe64', es: '4b9c9cd9', fr: '6af8deb0' }); }); // Mission 24 left out: its own correction since (the "should" card — practiceCity.test.ts)
  it('EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.transferOnly ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => r.correct)];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      for (const [x, y] of [[N_READY, 0], [Y_ALLERGY, 1], [N_OTHER, 2], [Y_VEG, 3], [N_RISOTTO, 4], [Y_DAIRY, 5], [N_CREAM, 6], [Y_ONIONS, 7], [N_TELL, 8], [Y_THANKS, 9], [N_BACK, 10]] as const) expect(script(lang)[y]!.slice(5), lang).toBe(at(x, lang));
    }
  });
});

describe('SAFETY SEMANTICS — "I\'ll check with the kitchen" means NOT CONFIRMED', () => {
  it('1. the nuts are NEVER marked safe — not on the Food Check, the cards, the board, the receipts or the result', () => {
    for (let n = 0; n <= 3; n++) for (const t of foodCheck(n as 0)) expect(t).not.toMatch(SAFE);
    expect(KITCHEN_CHECK_SENT.join(' ')).not.toMatch(SAFE);
    for (const lang of LANGS) {
      expect(appCopy(day(lang)), lang).not.toMatch(SAFE);
      for (const t of targetText(day(lang))) expect(t, lang).not.toMatch(SAFE);
      for (const n of [0, 1, 2, 3] as const) expect(foodCheck(n).join(' ')).not.toMatch(/Nuts: [^/‖]*✅|אגוזים: [^/‖]*✅/);
    }
  });
  it('2. the kitchen check is still pending at the end of the mission', () => {
    expect(foodCheckState(3)).toMatchObject({ nutStatus: 'checking', phase: 'waiting-for-kitchen' });
    expect(KITCHEN_CHECK_SENT[1]).toContain('Nuts: Kitchen checking…');
    expect(KITCHEN_CHECK_SENT[0]).toContain('אגוזים: המטבח בודק…');
    for (const lang of LANGS) expect(cardsOf(day(lang)).find((w) => w.key === 'diet.line.back')!.meaning.en).toMatch(/not confirmed yet — wait for the answer/);
  });
  it('3. "I\'ll check with the kitchen" is taught and checked as unresolved: the board\'s answer is "not known yet"', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).find((w) => w.key === 'diet.line.risotto')!.meaning.en).toMatch(/vegetarian: yes ✅ · nuts: not known yet — the kitchen will check/);
      const vm = stepsOf(d, 'visualMatch');
      expect(vm.map((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[[at(N_RISOTTO, lang), 'checking']]]);
      expect(vm[0]!.tiles).toEqual(Object.values(NUT_ANSWERS));
      expect(vm[0]!.ordered).toBeUndefined(); // shuffled: the meaning, never a position
    }
    expect(NUT_ANSWERS.checking.caption).toEqual({ he: 'עוד לא ידוע — המטבח יבדוק', en: 'Not known yet — the kitchen will check' });
  });
  it('4. the final result does not claim the food is safe: KITCHEN CHECK SENT, and the nuts still checking', () => {
    expect(KITCHEN_CHECK_SENT[1]).toBe('👨‍🍳 KITCHEN CHECK SENT ¦ 🙋 My needs: Allergy: Nuts / Diet: Vegetarian / Onions: Remove ‖ 👨‍🍳 What the waiter said: Dish: Vegetarian ✅ / Nuts: Kitchen checking… / Dairy: Cream — can remove / Kitchen: Allergy notified ✅ ¦ The waiter went to check — wait for the answer about the nuts.');
    expect(KITCHEN_CHECK_SENT[1]).not.toMatch(/%|points|score|\d+\/\d+/i);
  });
  it('5. vegetarian is confirmed separately from the allergy: the dish ✅ while the nuts stay pending', () => {
    expect(foodCheckState(1)).toMatchObject({ dishVegetarian: true, nutStatus: 'checking' });
    expect(foodCheck(1)[1]).toContain('Dish: Vegetarian ✅ / Nuts: Kitchen checking…');
  });
  it('6. dairy can be present AND removable', () => {
    expect(foodCheckState(2).dairyStatus).toBe('contains-cream-can-remove');
    expect(foodCheck(2)[1]).toContain('Dairy: Cream — can remove');
  });
  it('7. "kitchen notified" is not "kitchen confirmed": notified, while the nuts are still being checked — the state has no "safe" value', () => {
    const s = foodCheckState(3);
    expect([s.kitchenStatus, s.nutStatus]).toEqual(['notified', 'checking']);
    for (let n = 0; n <= 3; n++) { expect(['unknown', 'checking']).toContain(foodCheckState(n as 0).nutStatus); expect(JSON.stringify(foodCheckState(n as 0))).not.toMatch(/safe|confirmed|approved/i); }
    const src = readFileSync(fileURLToPath(new URL('./practiceAllergies.ts', import.meta.url)), 'utf8');
    expect(src).toMatch(/export type NutStatus = 'unknown' \| 'checking';/);
  });
  it('the pending row reads as not yet known on screen', () => {
    const b = splitTimeBoard(foodCheck(3)[1])!;
    expect(b.plan!.map((c) => [c.day, c.rows.map((r) => [r.text, r.known])])).toEqual([
      ['🙋 My needs', [['Allergy: Nuts', true], ['Diet: Vegetarian', true], ['Onions: Remove', true]]],
      ['👨‍🍳 What the waiter said', [['Dish: Vegetarian ✅', true], ['Nuts: Kitchen checking…', false], ['Dairy: Cream — can remove', true], ['Kitchen: Allergy notified ✅', true]]],
    ]);
    expect(renderToStaticMarkup(createElement(HotelStaySummary, { text: foodCheck(3)[1] })).match(/data-known="false"/g)).toHaveLength(1);
  });
});

describe('PRIOR LEARNING — verified, not assumed (learnedBefore(lang, 15))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 15);
  it('8. "Are you ready to order?" is Mission 14\'s signal: prior in English; in French / Spanish the singular form is shown once, on the allergy card — never drilled alone', () => {
    expect(prior('en').knowsChunk(chunk('ready-to-order', 'en'))).toBe(true);
    expect(prior('es').knowsChunk('para pedir')).toBe(true);
    expect(prior('fr').knowsChunk('à commander')).toBe(true);
    expect(prior('es').words.has('listo')).toBe(false); // Mission 14 said "listos" (two of you)
    expect(prior('fr').words.has('prêt')).toBe(false); // Mission 14 said "prêts"
    for (const lang of LANGS) {
      const d = day(lang);
      const step = d.steps[primeAt(d, 'diet.line.ready')] as Extract<BootcampStep, { kind: 'prime' }>;
      expect(step.words.map((w) => w.key)).toEqual(['diet.line.ready', 'diet.line.allergic']); // context for the allergy, not a lesson of its own
      expect(cardsOf(d).find((w) => w.key === 'diet.line.ready')!.meaning.en).toMatch(/you know it from Mission 14/);
    }
  });
  it('9. "Without onions" is reused from Mission 14 (and "Great" is prior): no card, no builder — only retrieval', () => {
    for (const lang of LANGS) {
      const p = prior(lang);
      expect(p.knowsChunk(chunk('without-onions', lang)), lang).toBe(true);
      expect(p.knowsChunk(chunk('great', lang)), lang).toBe(true);
      expect(p.knowsChunk(chunk('please', lang)), lang).toBe(true);
      for (const w of cardsOf(day(lang))) expect(hasChunk(w.text, chunk('without-onions', lang)), `${lang} ${w.key}`).toBe(false);
      expect(stepsOf(day(lang), 'sentenceBuilder'), lang).toHaveLength(0);
    }
  });
  it('10. "Thank you!" gets no teaching: prior, no card, no builder, no drill of its own', () => {
    for (const lang of LANGS) {
      expect(prior(lang).knowsChunk(at(Y_THANKS, lang)), lang).toBe(true);
      for (const w of cardsOf(day(lang))) expect(w.text, lang).not.toBe(at(Y_THANKS, lang));
      const rounds = stepsOf(day(lang), 'quickReply').flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.recovery.thank-you');
      expect(rounds.every((r) => heardIn(day(lang), r) === at(N_TELL, lang) || text(day(lang), r.promptItemId) === at(N_TELL, lang)), lang).toBe(true);
      expect(rounds, lang).toHaveLength(3); // supported, no help, final — the conversation's own turn
    }
  });
  it('11. without Mission 14\'s order card, "onions" is NOT prepared — the audit detects the missing dependency', () => {
    for (const lang of LANGS) {
      const noOrderCard = (l: CoverageLang, n: number): BootcampDayContent => {
        const m = missionContent(l, n);
        return n !== 14 ? m : { ...m, steps: m.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'rest.line.order') } : s)) };
      };
      const p = learnedBefore(lang, 15, noOrderCard);
      expect(p.knowsChunk(chunk('without-onions', lang)), lang).toBe(false);
      expect(unpreparedWords(day(lang), p.words, lang).join(' '), lang).toMatch(/“onions”|“oignons”|“cebolla”/);
      expect(unpreparedWords(day(lang), prior(lang).words, lang), lang).toEqual([]);
    }
  });
  it('12. conversation-only material still does not count: "dairy" placed only in an earlier conversation is not learned', () => {
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 14) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} Does it have dairy?` } : x)) } } };
    };
    const earlier = learnedBefore('en', 15, seen);
    expect(earlier.words.has('dairy')).toBe(false);
    const d = day('en');
    const noCard = { ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'diet.line.dairy') } : s)) };
    expect(unpreparedWords(noCard, earlier.words, 'en').join(' ')).toMatch(/“dairy”/);
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M15_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every new chunk taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a new card fails the audit (allergy, vegetarian, dairy, the kitchen check, the cream answer, "I\'ll tell the kitchen")', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      expect(unprepared(without('diet.line.allergic'), lang).join(' '), lang).toMatch(/allergic-nuts/);
      expect(unprepared(without('diet.line.vegetarian'), lang).join(' '), lang).toMatch(/vegetarian/);
      expect(unprepared(without('diet.line.dairy'), lang).join(' '), lang).toMatch(/dairy-q/);
      expect(unprepared(without('diet.line.risotto'), lang).join(' '), lang).toMatch(/check-kitchen|risotto-vegetarian/);
      expect(unprepared(without('diet.line.cream'), lang).join(' '), lang).toMatch(/some-cream|make-without/);
      expect(unprepared(without('diet.line.tell'), lang).join(' '), lang).toMatch(/tell-kitchen/);
    }
  });
});

describe('production — five locked learner lines, nothing invented', () => {
  const productions = (d: BootcampDayContent) => stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => ({ id: accepted(r), text: said(d, r) })));
  it('13. exactly five canonical learner turns', () => {
    for (const lang of LANGS) expect(cinematicTranscript(scene(day(lang))).filter((l) => l.who === 'you').map((l) => l.en), lang).toEqual(YOU_LINES.map((y) => at(y, lang)));
  });
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : []));
  it('14–16. all five, in order, in the supported run, the no-help run and the final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, supportedAt(d), dialogueAt(d)), lang).toEqual(LEARNER);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(LEARNER);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual(LEARNER);
    }
  });
  it('17. no line of the waiter is ever an answer', () => {
    for (const lang of LANGS) {
      const offered = stepsOf(day(lang), 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(day(lang), o.itemId))));
      for (const w of [...WAITER, N_BACK]) expect(offered, lang).not.toContain(at(w, lang));
    }
  });
  it('18. no invented learner line: every option is one of the five lines, said whole', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const allowed = YOU_LINES.map((y) => at(y, lang));
      for (const p of productions(d)) expect(allowed, lang).toContain(p.text);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) { expect(LEARNER, lang).toContain(strip(o.itemId)); expect(allowed, lang).toContain(o.text ?? text(d, o.itemId)); }
    }
  });
});

describe('the opening briefing — your own needs, nothing of the waiter', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing is the brief\'s Hebrew, the only opening card, with no target-language line', () => {
    for (const lang of LANGS) {
      expect(briefing(lang).body.map((x) => x.he)).toEqual(['אתה אלרגי לאגוזים, צמחוני, רוצה לבדוק אם יש מוצרי חלב ולא רוצה בצל. תוודא שהמלצר מעביר את זה למטבח.']);
      expect(briefing(lang).title.en).toBe('Mission 15: Food Preferences & Allergies');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      const b = JSON.stringify(briefing(lang));
      for (const l of LOCKED[lang]) expect(b, lang).not.toContain(l.slice(5));
      expect(b, lang).not.toMatch(/risotto|mushroom|cream|champi|crème|nata|ריזוטו|שמנת/i); // the waiter's answers are not in your briefing
    }
  });
});

describe('the Food Check — your needs, and only what the waiter has said', () => {
  it('19–20. it starts with the learner\'s own needs; the waiter\'s side, and the kitchen, start unknown', () => {
    expect(foodCheck(0)[1]).toBe('🙋 My needs: Allergy: Nuts / Diet: Vegetarian / Onions: Remove ‖ 👨‍🍳 What the waiter said: Dish: ? / Nuts: ? / Dairy: ? / Kitchen: —');
    expect(foodCheckState(0)).toEqual({ stage: 'nothing', phase: 'ordering', allergy: 'nuts', diet: 'vegetarian', onionPreference: 'remove', dishVegetarian: null, nutStatus: 'unknown', dairyStatus: 'unknown', kitchenStatus: 'unknown' });
    for (const lang of LANGS) expect(boardOf(day(lang).steps[1]!).join(' ')).toContain(foodCheck(0)[1]);
  });
  it('21–25. each fact appears first right after the waiter\'s line that says it — never before', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const first = (n: number) => d.steps.findIndex((s) => shownFacts(s).includes(n));
      expect(first(1), lang).toBeGreaterThan(primeAt(d, 'diet.line.risotto')); // 21–22: dish vegetarian, nuts → CHECKING (not safe)
      expect(first(2), lang).toBeGreaterThan(primeAt(d, 'diet.line.cream')); // 23: dairy after the cream line
      expect(first(3), lang).toBeGreaterThan(primeAt(d, 'diet.line.tell')); // 25: notified after "I'll tell the kitchen"
      expect(foodCheck(0)[1]).toContain('Onions: Remove'); // 24: the learner's own requirement
    }
  });
  it('no fact leaks early in any run (teaching, supported, no help, final)', () => {
    for (const lang of LANGS) for (const [name, from, to] of RUNS(day(lang))) expect(revealViolations(day(lang), lang, from, to), `${lang} ${name}`).toEqual([]);
  });
  it('26. the final state still says checking — and the Food Check stays small: no calories, menu, prices or ingredient list', () => {
    expect(foodCheck(3)[1]).toContain('Nuts: Kitchen checking…');
    for (let n = 0; n <= 3; n++) for (const t of foodCheck(n as 0)) { expect(t).not.toMatch(/kcal|calor|€|\$|menu|תפריט|קלור/i); expect(splitTimeBoard(t)!.plan!.flatMap((c) => c.rows)).toHaveLength(7); }
  });
  it('negative mutations: the cream fact or "notified" shown too early is caught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const n of [1, 2, 3] as const) {
        const early = d.steps.map((s, i) => (i === 1 && s.kind === 'prime' ? { ...s, intro: { he: foodCheck(n)[0], en: foodCheck(n)[1] } } : s));
        expect(revealViolations(d, lang, 1, supportedAt(d), early).join(' '), `${lang} ${n}`).toMatch(new RegExp(`fact ${n}`));
      }
    }
  });
});

describe('WHAT DO YOU DO? — one mini-game, four situations → four functions', () => {
  it('27–31. exactly four situations: nuts → allergy, no meat → vegetarian, dairy → the question, onions → without onions', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const games = stepsOf(d, 'quickReply').filter((s) => s.rounds.some((r) => r.situation));
      expect(games, lang).toHaveLength(1);
      const map = games[0]!.rounds.map((r) => [r.situation!.en!.slice(0, 2), accepted(r)]);
      expect(Object.fromEntries(map), lang).toEqual({ '🥜': 'phrase.diet.allergic-nuts', '🌱': 'phrase.diet.vegetarian', '🥛': 'phrase.diet.does-have-dairy', '🧅': 'phrase.diet.without-onions' });
      expect(games[0]!.rounds).toHaveLength(4);
      for (const r of games[0]!.rounds) expect(r.options).toHaveLength(3);
    }
    expect(SITUATIONS.map(([c]) => c[1])).toEqual(['🥛 You need to know whether the dish contains dairy.', '🥜 Nuts are dangerous for you.', '🧅 You don’t want onions.', '🌱 You don’t eat meat.']);
  });
  it('32. no new lexical content: every option is a line already taught (or prior); the situations are app-language only', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const g = gameAt(d);
      const known = new Set([...learnedBefore(lang, 15).words]);
      const taught = d.steps.slice(0, g).flatMap((s) => (s.kind === 'prime' ? s.words.map((w) => w.text) : []));
      for (const r of (d.steps[g] as QR).rounds) for (const o of r.options) for (const w of plain(o.text ?? text(d, o.itemId)).trim().split(' ')) expect(known.has(w) || taught.some((t) => plain(t).includes(` ${w} `)), `${lang} “${w}”`).toBe(true);
    }
  });
  it('33. no Flex Round: nothing in Mission 15 is transferOnly', () => {
    for (const lang of LANGS) expect(day(lang).steps.some((s) => 'transferOnly' in s && s.transferOnly), lang).toBe(false);
  });
});

describe('bloat guards — keep it small', () => {
  it('34. 20 meaningful interactions (target 18–21): 1 kitchen check · 4 situations · 5 supported · 5 no help · 5 final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(20);
      expect(interactions(d), lang).toBeLessThanOrEqual(21);
      expect(interactions({ ...d, steps: d.steps.slice(0, supportedAt(d)) }), lang).toBe(5);
      expect(interactions({ ...d, steps: d.steps.slice(supportedAt(d), dialogueAt(d)) }), lang).toBe(5);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(5);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(5);
    }
  });
  it('35–36. no allergen list, no vegan, no meat or spicy vocabulary — and the off-scope sentences are archived', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const t of targetText(d)) expect(t, lang).not.toMatch(ALLERGENS);
      expect(appCopy(d).replace('🌱 אתה לא אוכל בשר.', '').replace('🌱 You don’t eat meat.', ''), lang).not.toMatch(ALLERGENS); // "you don't eat meat" is the brief's own situation
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.diet.allergic-nuts', 'phrase.diet.does-have-dairy', 'phrase.diet.vegetarian', 'phrase.diet.without-onions', 'phrase.recovery.thank-you',
        'reply.diet.back', 'reply.diet.cream', 'reply.diet.other', 'reply.diet.ready', 'reply.diet.risotto', 'reply.diet.tell',
      ]);
      const archived = RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'special-requests-allergies').map((r) => strip(r.id));
      expect(archived, lang).toEqual(['reply.diet.good-option', 'phrase.diet.is-spicy', 'reply.diet.let-me-check', 'reply.diet.make-without', 'reply.diet.contains-nuts', 'reply.diet.not-spicy', 'reply.diet.anything-else-allergic']);
    }
  });
  it('37–39. no cream drill, no builder at all (not for "Thank you", not for "without onions")', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'sentenceBuilder').length + stepsOf(d, 'quiz').length + stepsOf(d, 'replies').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'swap').length + stepsOf(d, 'ambush').length, lang).toBe(0);
      expect(stepsOf(d, 'visualMatch').flatMap((s) => s.rounds.map((r) => r.audio.en)), lang).toEqual([at(N_RISOTTO, lang)]);
    }
  });
  it('40. no grammar lesson anywhere in the copy', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(/grammar|tense|conjugat|question form|infinitive|verb|דקדוק|נטייה|פועל|זמן/i);
  });
  it('41. no standalone ready-to-order teaching: its card is the allergy moment\'s context; no drill answers it alone', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const p of stepsOf(d, 'prime')) if (p.words.some((w) => w.key === 'diet.line.ready')) expect(p.words.length, lang).toBeGreaterThan(1);
    }
  });
  it('42. every card is a whole line of this conversation — never a word card', () => {
    for (const lang of LANGS) {
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(day(lang))) { expect(w.line, `${lang} ${w.key}`).toBe(true); expect(lines, `${lang} ${w.key}`).toContain(w.text); }
    }
  });
});

describe('the runs — supported, no help, final', () => {
  it('43–44. supported: canonical order, heard as the waiter\'s whole lines; the Food Check updates correctly', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(supportedAt(d), dialogueAt(d));
      expect(run.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => text(d, r.promptItemId)) : []))).toEqual(WAITER.map((w) => at(w, lang)));
      expect(revealViolations(d, lang, supportedAt(d), dialogueAt(d)), lang).toEqual([]);
      expect((d.steps[dialogueAt(d) - 1] as Extract<BootcampStep, { kind: 'receipt' }>).text.en).toContain(foodCheck(3)[1]);
    }
  });
  it('45–46. no help: no meanings, no cards, no hints; the Food Check shows only what this run has heard', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect((run[0] as QR).label).toBeUndefined();
      expect(run.some((s) => s.kind === 'prime')).toBe(false);
      for (const s of run) if (s.kind === 'quickReply') { expect(s.challenge).toBe(true); for (const r of s.rounds) { expect(r.npc).toBeDefined(); expect(r.situation).toBeUndefined(); } }
      expect(revealViolations(d, lang, dialogueAt(d) + 1, videoAt(d)), lang).toEqual([]);
      expect(run.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => r.npc!.en) : []))).toEqual(WAITER.map((w) => at(w, lang)));
    }
  });
  it('47–48. the final: the brief\'s setup, every function, no leak — and a result that never claims safety', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect((d.steps[videoAt(d) + 1] as QR).label!.he).toContain('תוודא שהמלצר מבין מה חשוב לך לפני שהוא חוזר למטבח.');
      expect(revealViolations(d, lang, videoAt(d) + 1, d.steps.length), lang).toEqual([]);
      const ends = d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('KITCHEN CHECK SENT'));
      expect(ends.map(([, i]) => i)).toEqual([d.steps.length - 2]);
      expect((ends[0]![0] as Extract<BootcampStep, { kind: 'receipt' }>).text).toEqual({ he: KITCHEN_CHECK_SENT[0], en: KITCHEN_CHECK_SENT[1] });
      expect(d.steps.at(-1)!.kind).toBe('summary');
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
  it('every answered line of the waiter shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.map((n) => n.id), lang).toEqual(['n1', 'm1', 'n2', 'r2', 'n3', 'm3', 'n4', 'm4', 'n5', 'm5']);
      for (const n of answered) {
        const run = beat(lang, n.id);
        expect(run.calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]);
        await run.finish('ended');
        expect(run.calls.filter((c) => c.startsWith('go:'))).toHaveLength(1);
      }
      const back = beat(lang, d.nodes.find((n) => n.end)!.id);
      expect(back.calls).toEqual(['speak']);
      await back.finish('ended');
      expect(back.calls.at(-1)).toBe('end');
    }
  });
  it('answering mid-line stops the waiter\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const ready = tts.speak(N_READY[0], 'en');
    void tts.speak(Y_ALLERGY[0], 'en');
    expect(await ready).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_ALLERGY[0]);
    tts.cancelSpeech();
  });
  it('replay stays: nothing waits for "audio finished"', () => {
    const read = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(read('./Bootcamp.tsx')).toContain("🔊 {t('replayQuestion')}");
    expect(read('./PracticeSteps.tsx')).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
});

describe('serialisable state', () => {
  it('the Food Check state serialises, and restoring it never leaks the future', () => {
    for (let n = 0; n <= 3; n++) {
      const s = JSON.parse(JSON.stringify(foodCheckState(n as 0))) as ReturnType<typeof foodCheckState>;
      expect(s).toEqual(foodCheckState(n as 0));
      expect(s.dishVegetarian === null).toBe(n < 1);
      expect(s.dairyStatus === 'unknown').toBe(n < 2);
      expect(s.kitchenStatus === 'notified').toBe(n >= 3);
    }
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M15_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M15_CONCEPTS.flatMap((c) => plain(quotes(c.chunk[lang])).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED here, VERIFIED PRIOR, or the one CONTEXT line`, () => {
    const prior = learnedBefore(lang, 15);
    for (const row of coverageOf(day(lang), lang, M15_CONCEPTS)) {
      const c = M15_CONCEPTS.find((x) => x.id === row.id)!;
      if (M15_CONTEXT_ONLY.includes(row.id)) { expect(row.byKind.meaning).toBeGreaterThanOrEqual(1); expect(row.byKind.context).toBeGreaterThanOrEqual(1); continue; }
      if (!prior.knowsChunk(c.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    }
    for (const id of ['allergic-nuts', 'vegetarian', 'dairy-q', 'check-kitchen', 'tell-kitchen', 'some-cream', 'make-without']) expect(coverageOf(day(lang), lang, M15_CONCEPTS).find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
  });
});

describe('visuals, the companion and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'quickReply' || s.kind === 'visualMatch') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime', 'prime', 'prime', 'visualMatch', 'prime', 'prime', 'receipt',
      'quickReply',
      'quickReply', 'quickReply', 'quickReply', 'receipt',
      'dialogue', 'receipt',
      'quickReply:speed', 'quickReply:speed', 'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'quickReply', 'quickReply', 'receipt', 'summary',
    ]);
  });
  it('visual slots: 5 semantic slots and 1 result prop — final artwork listed in the asset manifest', () => {
    expect(Object.keys(M15_SLOTS).sort()).toEqual(['dairy', 'kitchen-check', 'nuts', 'vegetarian', 'waiter']);
    expect(Object.keys(M15_PROPS)).toEqual(['kitchen-check-sent']);
    for (const s of [...Object.values(M15_SLOTS), ...Object.values(M15_PROPS)]) { expect(s.image).toMatch(/^images\/mission15\/[a-z-]+\.jpg$/); expect(s).not.toHaveProperty('emoji'); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION15_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/FINAL ARTWORK/);
    for (const key of [...Object.keys(M15_SLOTS), ...Object.keys(M15_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language; tiles are captioned meanings, never pictures', () => {
    const looks = new Set(Object.values(M15_SLOTS).map((s) => s.image));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    for (const t of Object.values(NUT_ANSWERS)) { expect(t.caption!.he).toBeTruthy(); expect(t.image).toBeUndefined(); }
  });
  it('the companion introduces the board as what the waiter really said — never "hear the price"', () => {
    const d = day('en');
    const coach = coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[14]!.id)!;
    expect(coach.line.en).toBe('Hear the waiter — and tap what he really said.');
  });
  it('video: no Mission 15 file in any language — the standard step is there and safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[14]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_15.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});

describe('OPTIONAL EXPOSURE ≠ GUARANTEED LEARNING — the skippable "Thank you!" branch teaches nothing', () => {
  const SHOULD: Record<CoverageLang, string> = { en: 'should', fr: 'devriez', es: 'debería' };
  /** Mission 15 with its optional branch (a polite "Thank you!" → the waiter asks again in other words) cut out. */
  const noBranch = (d: BootcampDayContent): BootcampDayContent => ({ ...d, dialogues: { 'allergy-order': { ...scene(d), nodes: scene(d).nodes
    .filter((n) => n.id !== 'r2' && n.id !== 'c2b').map((n) => (n.id === 'c2' ? { ...n, choices: n.choices!.filter((c) => c.correct) } : n)) } } });
  const skipped = (l: CoverageLang, n: number) => (n === 15 ? noBranch(missionContent(l, n)) : missionContent(l, n));
  it('1. the branch exists — off the guaranteed path — and is not part of the canonical conversation', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      expect(nodes.find((n) => n.id === 'r2')!.en, lang).toMatch({ en: /should know/, fr: /devrais savoir/, es: /deba saber/ }[lang]);
      expect(script(lang).join(' '), lang).not.toMatch({ en: /should/, fr: /devrais/, es: /deba/ }[lang]);
    }
  });
  it('2. "should" is NOT known before Mission 24 — with or without the branch', () => {
    for (const lang of LANGS) {
      expect(learnedBefore(lang, 24).words.has(SHOULD[lang]), lang).toBe(false);
      expect(learnedBefore(lang, 24, skipped).words.has(SHOULD[lang]), lang).toBe(false);
    }
  });
  it('3. Mission 24 meets "should" itself: one context card, right before the chat that uses it', () => {
    for (const lang of LANGS) {
      const d = missionContent(lang, 24);
      const card = d.steps.findIndex((s) => s.kind === 'prime');
      expect(d.steps[card + 1], lang).toEqual({ kind: 'dialogue', dialogueId: 'cold-chat' });
      expect(hasChunk((d.steps[card] as Extract<BootcampStep, { kind: 'prime' }>).words[0]!.text, { en: 'You should', fr: 'Vous devriez', es: 'Debería' }[lang]), lang).toBe(true);
      expect(learnedBefore(lang, 25).words.has(SHOULD[lang]), lang).toBe(true);
    }
  });
  it('4. opening the branch changes nothing guaranteed: prior learning after Mission 15, and its coverage, are identical without it', () => {
    for (const lang of LANGS) {
      for (const n of [16, 24, 30]) {
        const a = learnedBefore(lang, n);
        const b = learnedBefore(lang, n, skipped);
        expect([...a.words].sort(), `${lang} ${n}`).toEqual([...b.words].sort());
        expect(a.concepts, `${lang} ${n}`).toEqual(b.concepts);
      }
      expect(coverageOf(noBranch(day(lang)), lang, M15_CONCEPTS), lang).toEqual(coverageOf(day(lang), lang, M15_CONCEPTS));
    }
  });
  it('5. optional / dialogue-only exposure never counts: a new word planted in the branch is not learned, not covered', () => {
    const planted = (l: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(l, n);
      if (n !== 15) return m;
      return { ...m, dialogues: { 'allergy-order': { ...scene(m), nodes: scene(m).nodes.map((x) => (x.id === 'r2' ? { ...x, en: `${x.en} Gluten?` } : x)) } } };
    };
    expect(learnedBefore('en', 16, planted).words.has('gluten')).toBe(false);
    const d = planted('en', 15);
    expect(coverageOf(d, 'en', [{ id: 'x', label: 'x', role: 'hear', chunk: { en: 'Gluten', es: 'x', fr: 'x' } }])[0]!.total).toBe(0);
  });
  it('10. the eight re-recorded videos are the committed ones, untouched', () => {
    const SIZES: Record<string, number> = { 'en/en_1': 2480516, 'en/en_2': 7156513, 'en/en_3': 2457834, 'en/en_6': 2953702, 'en/en_7': 3794505, 'fr/fr_3': 3998347, 'fr/fr_5': 4477846, 'fr/fr_6': 3312182 };
    for (const [p, size] of Object.entries(SIZES)) {
      const file = fileURLToPath(new URL(`../../../public/videos/${p}.mp4`, import.meta.url));
      expect(readFileSync(file).length, p).toBe(size);
      expect(readFileSync(file).subarray(4, 12).toString('latin1'), p).toBe('ftypisom');
    }
  });
});
