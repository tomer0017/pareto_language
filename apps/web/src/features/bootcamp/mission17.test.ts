import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitJourney } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { coachFor } from '../companion/companionCoach.js';
import { answersFollow, runNpcBeat } from './dialogueBeat.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M17_CONCEPTS, M17_PRODUCT_CONCEPTS } from './mission17Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  AISLE_TILES, CASHIER_SIGNALS, CHECKOUT_CUE, M17_PROPS, M17_SLOTS, N_AISLE, N_BAG, N_EVERYTHING, N_HELP, N_PAY, PRODUCTS, PRODUCT_TILES,
  PRODUCT_WORD, QUICK_SHOP_COMPLETE, SAID, SHELF_ROUNDS, Y_BAG, Y_JUST, Y_THANKS, Y_WHERE, sprint, sprintState,
} from './practiceSupermarket.js';
import { fillFrame, validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, teachingEncounters, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 17 — Supermarket & Everyday Shopping: a MINIMAL, VISUAL, FAST sprint. The conversation is
 * LOCKED. Three production tools (where is · just this · could I get a bag), the staff's five lines as
 * comprehension, six essentials for recognition — and "At the checkout…" is a silent scene change.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 17): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const quotes = (s: string): string => s.replace(/[’‘]/g, "'");
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type VM = Extract<BootcampStep, { kind: 'visualMatch' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, r: Round): string => { const o = r.options.find((x) => x.correct)!; return o.text ?? text(d, o.itemId); };
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const scene = (d: BootcampDayContent) => d.dialogues.supermarket!;
const isShelf = (s: BootcampStep): s is VM => s.kind === 'visualMatch' && s.tiles === PRODUCT_TILES || (s.kind === 'visualMatch' && s.tiles.every((t) => (PRODUCTS as readonly string[]).includes(t.id)));
const isAisle = (s: BootcampStep): s is VM => s.kind === 'visualMatch' && s.tiles.some((t) => t.id === 'a3l');
const isSignals = (s: BootcampStep): s is VM => s.kind === 'visualMatch' && s.tiles.some((t) => t.id === 'card');
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);

/** The conversation exactly as the brief froze it (pasted verbatim; the scene cue is not a line). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hi there! Can I help you find something?', 'YOU: Where is the milk?', 'NPC: The milk is in aisle three, on the left.', 'YOU: Thank you!',
    'NPC: Hi! Is that everything?', 'YOU: Just this, thanks.', 'NPC: Do you need a bag?', 'YOU: Could I get a bag?', 'NPC: Insert your card here… all done. Have a nice day!'],
  es: ['NPC: ¡Hola! ¿Le ayudo a encontrar algo?', 'YOU: ¿Dónde está la leche?', 'NPC: La leche está en el pasillo tres, a la izquierda.', 'YOU: ¡Gracias!',
    'NPC: ¡Hola! ¿Eso es todo?', 'YOU: Solo esto, gracias.', 'NPC: ¿Necesita una bolsa?', 'YOU: ¿Me da una bolsa?', 'NPC: Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!'],
  fr: ['NPC: Bonjour ! Je peux vous aider à trouver quelque chose ?', 'YOU: Où est le lait ?', 'NPC: Le lait est dans l’allée trois, sur la gauche.', 'YOU: Merci !',
    'NPC: Bonjour ! Ce sera tout ?', 'YOU: Juste ça, merci.', 'NPC: Vous avez besoin d’un sac ?', 'YOU: Je peux avoir un sac ?', 'NPC: Insérez votre carte ici… c’est bon. Bonne journée !'],
};
const YOU_LINES = [Y_WHERE, Y_THANKS, Y_JUST, Y_BAG];
const STAFF = [N_HELP, N_AISLE, N_EVERYTHING, N_BAG, N_PAY];
const TOOLS = ['phrase.super.where-is', 'phrase.super.just-this', 'phrase.super.need-bag'];
const LEARNER = ['phrase.super.where-is', 'phrase.recovery.thank-you', 'phrase.super.just-this', 'phrase.super.need-bag'];
/** Canonical transcript ([who, text], exact) — the same value before this pass (28f2e68) and after. */
const TRANSCRIPT_PRINT = { en: '64d0ebcb', es: 'a2f31eb6', fr: 'b5a61521' };
/** The dialogue TREE — changed on purpose: the bread / recovery / show-me branches out, every turn a real decision. */
const DIALOGUE_PRINT = { en: 'e622289c', es: '3555ed87', fr: 'b274bd7c' };
/** The scene cue in every form it could take (app language and each target language). */
const CHECKOUT = /checkout|caisse|caja|בקופה|קופה…/i;
/** Product words that are NOT the six essentials (EN / FR / ES). */
const EXTRA_PRODUCTS = /\b(meat|chicken|rice|pasta|yog(h)?urt|butter|coffee|juice|sugar|salt|vegetables?|toilet|soap|cereal|fish|beer|snacks?|viande|poulet|riz|pâtes|yaourt|beurre|café|jus|sucre|sel|légumes|savon|céréales|poisson|bière|carne|pollo|arroz|yogur|mantequilla|zumo|jugo|azúcar|sal|verduras|jabón|cereales|pescado|cerveza|sliced|de molde|de mie)\b/i;
const MONEY = /€|\$|£|\b(?:price|how much|total|change|cash|receipt|PIN|contactless|prix|combien|monnaie|espèces|reçu|precio|cuánto|cambio|efectivo|recibo)\b|מחיר|כמה עולה|עודף|מזומן|קבלה/i;

/* ── the sprint reveal checker ─────────────────────────────────────────────────────────────────── */

const boardText = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** Aisle 3 / left, on screen: the located stage, or anything naming the place before it is said. */
const LOCATED = /Aisle 3 ⬅️|מעבר 3 ⬅️/;
/** Every text a step speaks or shows in the target language. */
function speakable(d: BootcampDayContent): string[] {
  const out = scene(d).nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]);
  for (const s of d.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(r.situation ? '' : heardIn(d, r), ...r.options.map((o) => o.text ?? text(d, o.itemId)));
    if (s.kind === 'visualMatch') for (const r of s.rounds) out.push(r.audio.en, r.reinforce?.en ?? '');
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
    if (s.kind === 'swap') for (const r of s.rounds) out.push(...r.options.map((o) => fillFrame(r.frame, o.slot)));
  }
  return out.filter(Boolean);
}
/** All app-language copy of the mission (labels, intros, meanings, receipts, situations, captions). */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    out.push(...boardText(s));
    if (s.kind === 'talk') for (const b of s.body) out.push(b.he ?? '', b.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.caption?.he ?? '', t.caption?.en ?? '');
    if (s.kind === 'swap') for (const r of s.rounds) out.push(r.cue.text.he ?? '', r.cue.text.en ?? '');
  }
  return out.join(' | ');
}

describe('the conversation is locked, and Mission 17 is in its place', () => {
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (28f2e68) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
  });
  for (const lang of LANGS) it(`${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision (a line from another moment, asked again slowly); the bread, repeat and show-me branches are gone', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        expect([again.who, again.slow, again.next, again.cue], `${lang} ${n.id}`).toEqual(['npc', true, n.id, undefined]);
      }
      expect(JSON.stringify(nodes), lang).not.toMatch(/do-you-have|recovery\.(repeat|slowly|show-me)/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('Mission 17 is "Supermarket & Everyday Shopping", seventeenth on the journey (registry key 16)', () => {
    expect(BOOTCAMP_PLAN[16]!.id).toBe('supermarket');
    expect(BOOTCAMP_PLAN[16]!.day).toBe(16);
    expect(missionNumber(16)).toBe(17);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Supermarket & Everyday Shopping');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('Missions 01–16 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 16)).toEqual({ en: '56e5cb39', es: 'f204ca09', fr: 'aab4fee6' }); });
  it('Missions 18–30 are byte-for-byte unchanged by this pass — the Everyday checkpoint still reuses the same four sentences', () => {
    expect(raw(17)).toEqual({ en: 'eea3fd7e', es: '49fc9e27', fr: '5aecf189' });
    for (const lang of LANGS) for (const id of [...TOOLS, 'phrase.super.do-you-have']) expect(text(day(lang, 18), `${lang}.${id}`), `${lang} ${id}`).toBe(text(day(lang), `${lang}.${id}`));
  });
  it('EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'swap') return [s.kind, s.transferOnly, s.label, s.rounds.map((r) => [r.cue, r.options.map((o) => [o.correct, o.meaning])])];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
    }
  });
});

describe('PRIOR LEARNING — verified per language, not assumed (learnedBefore(lang, 17))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 17);
  const chunk = (id: string, lang: CoverageLang): string => M17_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
  it('really prior: "Thank you!", "Hi", "Where is"; card and here — and English prior does not imply French or Spanish', () => {
    for (const lang of LANGS) {
      expect(prior(lang).knowsChunk(chunk('thank-you', lang)), lang).toBe(true);
      expect(prior(lang).knowsChunk(chunk('hi', lang)), lang).toBe(true);
      expect(prior(lang).knowsChunk({ en: 'Where is', es: '¿Dónde está', fr: 'Où est' }[lang]), lang).toBe(true);
    }
    expect(prior('en').words.has('left')).toBe(true);
    expect(prior('es').knowsChunk('a la izquierda')).toBe(true);
    expect(prior('fr').words.has('gauche')).toBe(true);
    expect(prior('en').words.has('milk')).toBe(true);
    expect(prior('fr').words.has('pain')).toBe(false);
    expect(prior('es').knowsChunk(chunk('everything', 'es'))).toBe(true); // ¿Eso es todo? — Spanish only
    expect(prior('en').knowsChunk(chunk('everything', 'en'))).toBe(false);
  });
  it('NOT prior anywhere, so taught here: the aisle, "three", the bag, the card instruction — and bread, cheese, eggs, apples', () => {
    for (const lang of LANGS) {
      for (const w of { en: ['aisle', 'three', 'bag', 'insert', 'bread', 'cheese', 'eggs', 'apples'], fr: ['allée', 'trois', 'sac', 'insérez', 'pain', 'fromage', 'œufs', 'pommes'], es: ['pasillo', 'tres', 'bolsa', 'inserte', 'pan', 'queso', 'huevos', 'manzanas'] }[lang]) expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(false);
    }
  });
  it('34. "Thank you!" gets ZERO teaching: prior, no card, no drill — it is answered only in the conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(w.text, lang).not.toBe(at(Y_THANKS, lang));
      expect(stepsOf(d, 'quickReply').flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.recovery.thank-you'), lang).toHaveLength(0);
      expect(cinematicTranscript(scene(d)).filter((l) => l.who === 'you').map((l) => l.en), lang).toContain(at(Y_THANKS, lang));
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M17_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every new chunk taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a card fails the audit (the shelf, where is, the aisle, just this, the bag, the card)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      expect(unpreparedWords(without('super.cheese'), prior(lang).words, lang).join(' '), lang).toMatch({ en: /cheese/, fr: /fromage/, es: /queso/ }[lang]);
      expect(unprepared(without('super.line.aisle'), lang).join(' '), lang).toMatch(/milk-aisle-three/);
      expect(unprepared(without('super.line.just-this'), lang).join(' '), lang).toMatch(/just-this/);
      expect(unprepared(without('super.line.bag'), lang).join(' '), lang).toMatch(/get-bag/);
      expect(unprepared(without('super.line.card'), lang).join(' '), lang).toMatch(/insert-card/);
    }
  });
});

describe('TRANSFER — Where is the ___?', () => {
  const swap = (d: BootcampDayContent) => stepsOf(d, 'swap');
  it('1. the canonical "Where is the milk?" is unchanged', () => {
    for (const lang of LANGS) {
      expect(script(lang)[1], lang).toBe(`YOU: ${at(Y_WHERE, lang)}`);
      expect(text(day(lang), `${lang}.phrase.super.where-is`), lang).toBe(at(Y_WHERE, lang));
    }
  });
  it('2. bread and cheese use the SAME pattern: one frame, the product swapped — two rounds, no more', () => {
    const expected = { en: ['Where is the bread?', 'Where is the cheese?'], fr: ['Où est le pain ?', 'Où est le fromage ?'], es: ['¿Dónde está el pan?', '¿Dónde está el queso?'] };
    for (const lang of LANGS) {
      const s = swap(day(lang));
      expect(s, lang).toHaveLength(1);
      expect(s[0]!.rounds.map((r) => fillFrame(r.frame, r.options.find((o) => o.correct)!.slot)), lang).toEqual(expected[lang]);
      for (const r of s[0]!.rounds) expect(fillFrame(r.frame, r.options[0]!.slot), lang).toBe(at(Y_WHERE, lang)); // the milk is the same frame
    }
  });
  it('3. the transfer lines are never in the conversation, never a sentence, never a card', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const lines = { en: /bread|cheese/i, fr: /pain|fromage/i, es: /\bpan\b|queso/i }[lang];
      for (const n of scene(d).nodes) { expect(n.en, lang).not.toMatch(lines); for (const c of n.choices ?? []) expect(c.en, lang).not.toMatch(lines); }
      for (const i of d.items.filter((x) => !x.id.endsWith('do-you-have'))) expect(i.text, lang).not.toMatch(lines);
      for (const w of cardsOf(d).filter((x) => x.line)) expect(w.text, lang).not.toMatch(lines);
    }
  });
  it('4. no separate Flex Round: the only transferOnly step is the bread / cheese check; no step is labelled a flex round', () => {
    for (const lang of LANGS) {
      const flex = day(lang).steps.filter((s) => 'transferOnly' in s && s.transferOnly);
      expect(flex.map((s) => s.kind), lang).toEqual(['swap']);
      expect(appCopy(day(lang)), lang).not.toMatch(/flex|גמיש/i);
    }
  });
  it('5. transfer is not guaranteed learning: no teaching, no coverage — cutting it out changes nothing learned', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(teachingEncounters(d).some((e) => d.steps[e.step]!.kind === 'swap'), lang).toBe(false);
      const cut = (l: CoverageLang, n: number): BootcampDayContent => (n === 17 ? { ...missionContent(l, n), steps: missionContent(l, n).steps.filter((s) => s.kind !== 'swap') } : missionContent(l, n));
      const a = learnedBefore(lang, 18);
      const b = learnedBefore(lang, 18, cut);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      expect(coverageOf(cut(lang, 17), lang, M17_CONCEPTS), lang).toEqual(coverageOf(d, lang, M17_CONCEPTS));
    }
  });
});

describe('THE SIX ESSENTIALS — recognition, exactly six', () => {
  it('6–13. exactly six products — milk, water, bread, cheese, eggs, apples — and no seventh', () => {
    expect(PRODUCTS).toEqual(['milk', 'water', 'bread', 'cheese', 'eggs', 'apples']);
    expect(M17_PRODUCT_CONCEPTS.map((c) => c.id)).toEqual([...PRODUCTS]);
    expect(PRODUCT_TILES.map((t) => t.id)).toEqual([...PRODUCTS]);
    for (const lang of LANGS) {
      const shelf = stepsOf(day(lang), 'prime').filter((p) => p.words.some((w) => w.key?.startsWith('super.') && !w.line));
      expect(shelf, lang).toHaveLength(1);
      expect(shelf[0]!.words.map((w) => w.key), lang).toEqual(PRODUCTS.map((p) => `super.${p}`));
      expect(shelf[0]!.words.map((w) => w.text), lang).toEqual(PRODUCTS.map((p) => PRODUCT_WORD[p][IX[lang]]));
    }
  });
  it('14. bread is taught generically: "bread / pain / pan" — never a kind of bread', () => {
    expect(PRODUCT_WORD.bread).toEqual(['bread', 'le pain', 'el pan']);
    for (const lang of LANGS) expect([...speakable(day(lang)), appCopy(day(lang))].join(' '), lang).not.toMatch(/sliced|de molde|de mie|toast|baguette|תבנית/i);
  });
  it('15. the same six concepts in EN / ES / FR, each a word of its own language', () => {
    for (const p of PRODUCTS) { expect(PRODUCT_WORD[p][1]).not.toBe(PRODUCT_WORD[p][0]); expect(PRODUCT_WORD[p][2]).not.toBe(PRODUCT_WORD[p][0]); }
    expect(PRODUCT_WORD.milk).toEqual(['milk', 'le lait', 'la leche']);
    expect(PRODUCT_WORD.eggs).toEqual(['eggs', 'les œufs', 'los huevos']);
    expect(PRODUCT_WORD.apples).toEqual(['apples', 'les pommes', 'las manzanas']);
  });
  it('43. no supermarket vocabulary beyond the six — in any spoken or shown line, or the copy', () => {
    for (const lang of LANGS) {
      for (const t of speakable(day(lang))) expect(t, lang).not.toMatch(EXTRA_PRODUCTS);
      expect(appCopy(day(lang)), lang).not.toMatch(EXTRA_PRODUCTS);
    }
  });
});

describe('SHELF SCAN — one shelf, three recognition moments', () => {
  it('16. at most four recognition interactions (here: three)', () => {
    for (const lang of LANGS) expect(day(lang).steps.filter(isShelf).reduce((k, s) => k + s.rounds.length, 0), lang).toBe(3);
  });
  it('17. no product is drilled twice: three different answers, each round over three products', () => {
    for (const lang of LANGS) {
      const rounds = day(lang).steps.filter(isShelf).flatMap((s) => s.rounds);
      expect(new Set(rounds.map((r) => r.correct)).size).toBe(3);
      for (const r of rounds) { expect(r.show, lang).toHaveLength(3); expect(r.show, lang).toContain(r.correct); }
    }
    expect(SHELF_ROUNDS.map(([a]) => a)).toEqual(['cheese', 'eggs', 'apples']);
  });
  it('18. every product tile gets the same treatment: one picture (placeholder now), no caption, same shape', () => {
    const shapes = PRODUCT_TILES.map((t) => Object.keys(t).sort().join());
    expect(new Set(shapes).size).toBe(1);
    for (const t of PRODUCT_TILES) { expect(t.caption).toBeUndefined(); expect(t.label).toBeUndefined(); expect(t.emoji ?? t.image).toBeTruthy(); }
    const slotShapes = PRODUCTS.map((p) => Object.keys(M17_SLOTS[p]).sort().join());
    expect(new Set(slotShapes).size).toBe(1);
  });
  it('19. Shelf Scan is not production: it hears a word and taps a picture — nothing is said', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of d.steps.filter(isShelf)) for (const r of s.rounds) expect(r.audio.en, lang).toBe(PRODUCT_WORD[r.correct as 'milk'][IX[lang]]);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
    }
  });
  it('20. no extra supermarket vocabulary leaks into the shelf', () => {
    for (const lang of LANGS) for (const s of day(lang).steps.filter(isShelf)) expect(s.tiles.map((t) => t.id)).toEqual([...PRODUCTS]);
  });
});

describe('AISLE FINDER — aisle 3, on the left', () => {
  it('21–22. the assistant says aisle THREE, on the LEFT — and that is the answer', () => {
    for (const lang of LANGS) {
      const finders = day(lang).steps.filter(isAisle);
      expect(finders.flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_AISLE, lang), 'a3l'], [at(N_AISLE, lang), 'a3l']]);
    }
    expect(sprintState(2).aisleKnown).toEqual({ aisle: 3, side: 'left' });
  });
  it('23. the exact place is not revealed before the assistant says it — not in the briefing, the sprint or any label', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = primeAt(d, 'super.line.aisle');
      const first = d.steps.findIndex((s) => boardText(s).some((t) => LOCATED.test(t)));
      expect(first, lang).toBeGreaterThan(d.steps.findIndex(isAisle));
      expect(first, lang).toBeGreaterThan(said);
      for (const s of d.steps.slice(0, said)) expect(JSON.stringify(s), lang).not.toMatch(/aisle 3|aisle three|מעבר 3|מעבר שלוש|3 ⬅️|allée trois|pasillo tres/i);
    }
    expect(sprint(1).join(' ')).not.toMatch(LOCATED);
    expect(sprint(2)[1]).toContain('📍 Aisle 3 ⬅️ ✅');
  });
  it('24–25. deterministic UI carries the number and the side: six tiles, aisles 1–3 × left / right, in order — no picture', () => {
    expect(AISLE_TILES.map((t) => [t.id, t.label])).toEqual([['a1l', '1 ⬅️'], ['a2l', '2 ⬅️'], ['a3l', '3 ⬅️'], ['a1r', '1 ➡️'], ['a2r', '2 ➡️'], ['a3r', '3 ➡️']]);
    for (const t of AISLE_TILES) { expect(t.image).toBeUndefined(); expect(t.emoji).toBeUndefined(); }
    for (const lang of LANGS) for (const s of day(lang).steps.filter(isAisle)) expect(s.ordered, lang).toBe(true);
    expect(JSON.stringify(M17_SLOTS)).not.toMatch(/aisle|\b3\b/);
  });
});

describe('THE CHECKOUT — silent scene change, then the cashier', () => {
  it('26. "At the checkout…" is silent: a cue on the cashier\'s line — no sentence, no audio, no coverage, no prior learning', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cued = scene(d).nodes.filter((n) => n.cue);
      expect(cued.map((n) => [n.id, n.cue, n.en]), lang).toEqual([['n3', { he: CHECKOUT_CUE[0], en: CHECKOUT_CUE[1] }, at(N_EVERYTHING, lang)]]);
      for (const t of speakable(d)) expect(t, lang).not.toMatch(CHECKOUT);
      for (const i of d.items) expect(`${i.text} ${JSON.stringify(i.meaning)}`, `${lang} ${i.id}`).not.toMatch(CHECKOUT);
      for (const l of script(lang)) expect(l, lang).not.toMatch(CHECKOUT);
      for (const e of teachingEncounters(d)) expect(e.text, lang).not.toMatch(CHECKOUT);
      for (const c of [...M17_CONCEPTS, ...M17_PRODUCT_CONCEPTS]) expect(c.chunk[lang], lang).not.toMatch(CHECKOUT);
      expect(learnedBefore(lang, 18).concepts.filter((c) => c.mission === 17 && CHECKOUT.test(c.chunk)), lang).toEqual([]); // (Spanish "caja" = box is Mission 02's own word)
    }
    const ui = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(ui).toMatch(/displayNpc\.cue && <p className="faint small convo-cue"/);
    expect(ui).not.toMatch(/speakL\([^)]*\.cue/);
  });
  it('the cued beat speaks only the cashier\'s line — the cue itself produces no audio and is not an interaction', () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const n3 = d.nodes.find((n) => n.id === 'n3')!;
      const spoken: string[] = [];
      runNpcBeat(d, n3, { speak: () => { spoken.push(n3.en); return Promise.resolve('ended' as SpeakResult); }, go: () => undefined, end: () => undefined, later: (fn) => fn(), cancelled: () => false });
      expect(spoken, lang).toEqual([at(N_EVERYTHING, lang)]);
    }
  });
  it('27–31. NPC lines are comprehension, the two tools are production; the card instruction is comprehension only', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const qr = stepsOf(d, 'quickReply').flatMap((s) => s.rounds);
      const heard = (x: L4) => qr.filter((r) => heardIn(d, r) === at(x, lang));
      expect(heard(N_EVERYTHING).every((r) => accepted(r) === 'phrase.super.just-this'), lang).toBe(true);
      expect(heard(N_BAG).every((r) => accepted(r) === 'phrase.super.need-bag'), lang).toBe(true);
      expect(qr.filter((r) => accepted(r) === 'phrase.super.just-this').length, lang).toBe(3);
      expect(qr.filter((r) => accepted(r) === 'phrase.super.need-bag').length, lang).toBe(3);
      // the card: heard on a cashier-signal board, never answered with a sentence
      expect(d.steps.filter(isSignals).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_PAY, lang), 'card'], [at(N_PAY, lang), 'card']]);
      expect(heard(N_PAY), lang).toHaveLength(0);
    }
    expect(CASHIER_SIGNALS.card.caption!.en).toBe('Card in the machine — paid');
  });
});

describe('production — four locked learner turns, three tools, nothing invented', () => {
  it('32–33. exactly four canonical learner turns, all in the supported conversation — run ONCE, translations on', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cinematicTranscript(scene(d)).filter((l) => l.who === 'you').map((l) => l.en), lang).toEqual(YOU_LINES.map((y) => at(y, lang)));
      expect(stepsOf(d, 'dialogue'), lang).toHaveLength(1);
      expect(scene(d).cold, lang).toBeUndefined();
    }
  });
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : []));
  it('35. no help: exactly the three tools — where is · just this · a bag — no meanings, no cards, no sprint', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(TOOLS);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect(run.some((s) => s.kind === 'prime')).toBe(false);
      for (const s of run) if (s.kind === 'quickReply') { expect(s.challenge).toBe(true); expect(s.label).toBeUndefined(); for (const r of s.rounds) expect(r.situation).toBeUndefined(); }
    }
  });
  it('36. the final micro run: find → locate → checkout → bag → pay — three productions, two comprehension moments', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(videoAt(d) + 1).filter((s) => s.kind === 'quickReply' || s.kind === 'visualMatch');
      expect(run.map((s) => (s.kind === 'quickReply' ? accepted(s.rounds[0]!) : isAisle(s) ? 'aisle' : 'card')), lang).toEqual(['phrase.super.where-is', 'aisle', 'phrase.super.just-this', 'phrase.super.need-bag', 'card']);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual(TOOLS);
    }
  });
  it('37. no line of the staff is ever an answer; every option is one of the four lines, said whole', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const offered = stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(d, o.itemId))));
      for (const st of STAFF) expect(offered, lang).not.toContain(at(st, lang));
      for (const o of offered) expect(YOU_LINES.map((y) => at(y, lang)), lang).toContain(o);
      for (const id of LEARNER) expect(SAID[id]![IX[lang]], lang).toBe(text(d, `${lang}.${id}`));
    }
  });
  it('sentences: three tools, "Thank you!", five whole staff lines — and "Do you have bread?" kept untaught for the Everyday checkpoint; two sentences archived', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.recovery.thank-you', 'phrase.super.do-you-have', 'phrase.super.just-this', 'phrase.super.need-bag', 'phrase.super.where-is',
        'reply.super.aisle-three', 'reply.super.bag-q', 'reply.super.can-help', 'reply.super.card-here', 'reply.super.everything',
      ]);
      expect(JSON.stringify([d.steps, d.dialogues]), lang).not.toContain(`${lang}.phrase.super.do-you-have`);
      for (const r of STAFF) expect(d.items.map((i) => i.text), lang).toContain(at(r, lang));
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'supermarket').map((r) => strip(r.id)), lang).toEqual(['reply.super.weigh-it', 'reply.super.over-there', 'reply.super.sold-out']);
    }
  });
  it('every line card is a whole line of this conversation', () => {
    for (const lang of LANGS) {
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(day(lang)).filter((x) => x.line)) expect(lines, `${lang} ${w.key}`).toContain(w.text);
    }
  });
});

describe('the opening briefing — buy milk; nothing to discover is given away', () => {
  it('the brief\'s Hebrew, the only opening card, with no aisle, side or checkout answer', () => {
    for (const lang of LANGS) {
      const b = day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      expect(b.body.map((x) => x.he).join('\n')).toBe('נכנסת לסופר לקנות חלב.\nמצא אותו, עבור בקופה ובקש שקית.');
      expect(b.title.en).toBe('Mission 17: Supermarket');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      expect(JSON.stringify(b), lang).not.toMatch(/aisle|three|left|שלוש|שמאל|מעבר|everything|זה הכל|card|כרטיס/i);
    }
  });
});

describe('bloat guards — the shortest mission yet', () => {
  it('38. 18 meaningful interactions (target 17–20, hard ceiling 20): 10 teaching · 3 no help · 5 final — shorter than Mission 16', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(18);
      expect(interactions(d), lang).toBeLessThanOrEqual(20);
      expect(interactions(d), lang).toBeLessThan(interactions(missionContent(lang, 16)));
      expect(interactions({ ...d, steps: d.steps.slice(0, dialogueAt(d)) }), lang).toBe(10);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(3);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(5);
    }
  });
  it('39–40, 44–45. no prices, no payment methods, no quantities, no receipt — in any line or any copy', () => {
    for (const lang of LANGS) {
      for (const t of speakable(day(lang))) { expect(t, lang).not.toMatch(MONEY); expect(t, lang).not.toMatch(/\b\d+\b(?! ⬅️| ➡️)/); }
      expect(appCopy(day(lang)).replace(/🧾 (?:Checkout|קופה)/g, ''), lang).not.toMatch(MONEY);
      expect(appCopy(day(lang)), lang).not.toMatch(/\b(kilo|gram|litre|liter|dozen|bottle|carton|pack)\b|ליטר|קילו|תריסר/i);
    }
  });
  it('41, 46. no Flex section, no builder, no swap beyond the transfer, no quiz, no review deck, no tool cards, no ambush', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'sentenceBuilder').length + stepsOf(d, 'quiz').length + stepsOf(d, 'replies').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'ambush').length + stepsOf(d, 'miniMap').length, lang).toBe(0);
      expect(stepsOf(d, 'swap').map((s) => s.transferOnly), lang).toEqual([true]);
    }
  });
  it('42. no grammar lesson anywhere in the copy', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(/grammar|tense|conjugat|infinitive|politeness form|conditional|article|verb|דקדוק|נטייה|פועל|תנאי|יידוע/i);
  });
});

describe('🛒 SUPERMARKET SPRINT — FIND → LOCATE → CHECKOUT → BAG → PAY', () => {
  it('the sprint is a five-stage journey the board draws; it fills as the learner does each stage', () => {
    for (let n = 0; n <= 5; n++) {
      const j = splitJourney(sprint(n)[1])!;
      expect(j.facts, `${n}`).toHaveLength(5);
      expect(j.facts.filter((f) => f.endsWith('✅')), `${n}`).toHaveLength(n);
    }
    expect(sprint(0)[1]).toBe('🔎 Find ⬜ · 📍 Locate ⬜ · 🧾 Checkout ⬜ · 🛍️ Bag ⬜ · 💳 Pay ⬜');
    expect(renderToStaticMarkup(createElement(HotelStaySummary, { text: `🛒 Supermarket sprint · ${sprint(2)[1]} · go` })).match(/data-known="true"/g)).toHaveLength(2);
  });
  it('each stage turns ✅ only after the learner has done it (in teaching and again in the final)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const firstDone = (n: number) => d.steps.findIndex((s) => boardText(s).some((t) => splitJourney(t)?.facts.filter((f) => f.endsWith('✅')).length === n));
      expect(firstDone(1), lang).toBeGreaterThan(d.steps.findIndex((s) => s.kind === 'quickReply'));
      expect(firstDone(2), lang).toBeGreaterThan(d.steps.findIndex(isAisle));
      expect(firstDone(3), lang).toBeGreaterThan(primeAt(d, 'super.line.just-this'));
      expect(firstDone(5), lang).toBeGreaterThan(d.steps.findIndex(isSignals));
    }
  });
  it('the result: 🛒 QUICK SHOP COMPLETE with the whole route — no score, no price, no vocabulary test', () => {
    expect(QUICK_SHOP_COMPLETE[1]).toBe('🛒 QUICK SHOP COMPLETE · 🔎 Find ✅ · 📍 Aisle 3 ⬅️ ✅ · 🧾 Checkout ✅ · 🛍️ Bag ✅ · 💳 Pay ✅ · You found it, understood where, checked out, asked for a bag and paid.');
    expect(QUICK_SHOP_COMPLETE.join(' ')).not.toMatch(/%|points|score|\d+\/\d+|€|\$/);
    for (const lang of LANGS) {
      const d = day(lang);
      const ends = d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('QUICK SHOP COMPLETE'));
      expect(ends.map(([, i]) => i)).toEqual([d.steps.length - 2]);
      expect(d.steps.at(-1)!.kind).toBe('summary');
    }
  });
});

describe('audio never blocks the answer (the approved conversation behaviour)', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('every answered line of the staff shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBe(8); // four lines + four slow re-asks
      for (const n of answered) {
        const calls: string[] = [];
        let finish: (r: SpeakResult) => void = () => undefined;
        runNpcBeat(d, n, { speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); }, go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false });
        expect(calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]);
        finish('ended'); await Promise.resolve();
      }
    }
  });
  it('answering mid-line stops the staff\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const q = tts.speak(N_HELP[0], 'en');
    void tts.speak(Y_WHERE[0], 'en');
    expect(await q).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_WHERE[0]);
    tts.cancelSpeech();
  });
});

describe('serialisable state', () => {
  it('the sprint state serialises, and restoring it never leaks the future (no cart: one carton of milk)', () => {
    for (let n = 0; n <= 5; n++) {
      const s = JSON.parse(JSON.stringify(sprintState(n))) as ReturnType<typeof sprintState>;
      expect(s).toEqual(sprintState(n));
      expect([s.milkFound, s.aisleKnown !== null, s.checkoutReached, s.bagRequested, s.paymentDone]).toEqual([n >= 1, n >= 2, n >= 3, n >= 4, n >= 5]);
      expect(s.productsSeen).toEqual([...PRODUCTS]);
    }
    expect(Object.keys(sprintState(0)).sort()).toEqual(['aisleKnown', 'bagRequested', 'checkoutReached', 'milkFound', 'paymentDone', 'phase', 'productsSeen']);
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M17_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M17_CONCEPTS.flatMap((c) => plain(quotes(c.chunk[lang])).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED here or VERIFIED PRIOR — the three tools always covered`, () => {
    const prior = learnedBefore(lang, 17);
    const rows = coverageOf(day(lang), lang, M17_CONCEPTS);
    for (const row of rows) if (!prior.knowsChunk(M17_CONCEPTS.find((x) => x.id === row.id)!.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    for (const id of ['where-is-milk', 'just-this', 'get-bag', 'milk-aisle-three', 'insert-card']) expect(rows.find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
  });
  it('the six essentials are RECOGNITION vocabulary: each shown with its meaning; none is ever a production answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const c of M17_PRODUCT_CONCEPTS) expect(cardsOf(d).some((w) => !w.line && hasChunk(w.text, c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const answers = stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => said(d, r)));
      for (const p of ['bread', 'cheese', 'eggs', 'apples', 'water'] as const) for (const a of answers) expect(hasChunk(a, PRODUCT_WORD[p][IX[lang]]), `${lang} ${p}`).toBe(false);
    }
  });
});

describe('visuals, the companion and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'quickReply' || s.kind === 'visualMatch') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'visualMatch', // shelf scan
      'prime', 'quickReply', 'swap', // find · where is · bread / cheese
      'prime', 'visualMatch', // aisle finder
      'prime', 'quickReply', // at the checkout · just this
      'prime', 'quickReply', // the bag
      'prime', 'visualMatch', 'receipt', // pay
      'dialogue', 'receipt',
      'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'visualMatch', 'quickReply', 'quickReply', 'visualMatch', 'receipt', 'summary',
    ]);
  });
  it('visual slots: six products, the shop, the checkout, the bag, one result prop — placeholders, listed in the asset manifest (VISUAL PRODUCTION REQUIRED)', () => {
    expect(Object.keys(M17_SLOTS)).toEqual(['milk', 'water', 'bread', 'cheese', 'eggs', 'apples', 'shop', 'checkout', 'bag']);
    expect(Object.keys(M17_PROPS)).toEqual(['quick-shop-complete']);
    for (const s of [...Object.values(M17_SLOTS), ...Object.values(M17_PROPS)]) { expect(s.emoji).toBeTruthy(); if (s.image) expect(s.image).toMatch(/^images\/mission17\/[a-z-]+\.jpg$/); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION17_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED/);
    for (const key of [...Object.keys(M17_SLOTS), ...Object.keys(M17_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language', () => {
    const looks = new Set(Object.values(M17_SLOTS).map((s) => s.image ?? s.emoji));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
  });
  it('the companion introduces the first board as the Shelf Scan — never "hear the price"', () => {
    const d = day('en');
    const coach = coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[16]!.id)!;
    expect(coach.line.en).toBe('Listen — and tap the product.');
  });
  it('video: the standard resolver — no Mission 17 file in any language today, so the step is safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[16]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_17.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
