import { beforeMission16Artwork } from './mission16Artwork.testSupport.js';
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
import { M19_CONCEPTS } from './mission19Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  FARE_TILES, GET_OFF_TILES, M19_PROPS, M19_SLOTS, M19_STAGES, N_FARE, N_HOP, N_NEXT, N_PLATFORM, N_STOPS, N_TYPE, N_WHERE, PLATFORM_TILES,
  RIDE_COMPLETE, SAID, STOP_TILES, TICKET_TYPES, Y_SINGLE, Y_STOP, Y_THANKS, Y_TICKET, Y_WHICH, rideState, rideTicket, routeStrip,
} from './practiceTransport.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, teachingEncounters, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 19 — Public Transport: CATCH YOUR TRAIN. The conversation is LOCKED. Four production tools
 * (one ticket to ___ · single · which platform · does this stop at ___), the staff's seven lines as
 * comprehension, and a travel ticket that fills only when a line has said it. No vocabulary deck.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 19): BootcampDayContent => missionContent(lang, n);
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
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const scene = (d: BootcampDayContent) => d.dialogues.transport!;
const boardOf = (tiles: { id: string }[]) => (s: BootcampStep): s is VM => s.kind === 'visualMatch' && s.tiles.some((t) => t.id === tiles[0]!.id);
const isType = boardOf(Object.values(TICKET_TYPES));
const isFare = boardOf(FARE_TILES);
const isPlatform = boardOf(PLATFORM_TILES);
const isStops = boardOf(STOP_TILES);
const isGetOff = boardOf(Object.values(GET_OFF_TILES));
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);

/** The conversation exactly as the brief froze it (pasted verbatim). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hello! Where are you headed?', 'YOU: One ticket to the centre, please.', 'NPC: Single or return?', 'YOU: Single, please.',
    "NPC: That's three euros. It leaves every ten minutes.", 'YOU: Which platform?', 'NPC: Platform two. Straight ahead.', 'YOU: Thank you!',
    "NPC: The train's right here. Hop on.", 'YOU: Does this stop at the museum?', "NPC: Yes — it's three stops. I'll tell you when.", 'YOU: Thank you!',
    'NPC: Here we are — your stop is next. Enjoy the museum!'],
  es: ['NPC: ¡Hola! ¿A dónde va?', 'YOU: Un billete para el centro, por favor.', 'NPC: ¿Solo ida o ida y vuelta?', 'YOU: Solo ida, por favor.',
    'NPC: Son tres euros. Sale cada diez minutos.', 'YOU: ¿Qué andén?', 'NPC: Andén número dos. Todo recto.', 'YOU: ¡Gracias!',
    'NPC: El tren está justo ahí. Suba.', 'YOU: ¿Para en el museo?', 'NPC: Sí — son tres paradas. Le aviso cuándo.', 'YOU: ¡Gracias!',
    'NPC: Ya llegamos — su parada es la siguiente. ¡Que disfrute del museo!'],
  fr: ['NPC: Bonjour ! Vous allez où ?', 'YOU: Un billet pour le centre, s’il vous plaît.', 'NPC: Aller simple ou aller-retour ?', 'YOU: Aller simple, s’il vous plaît.',
    'NPC: Ça fait trois euros. Ça part toutes les dix minutes.', 'YOU: Quel quai ?', 'NPC: Quai numéro deux. Tout droit.', 'YOU: Merci !',
    'NPC: Le train est juste là. Montez.', 'YOU: Ça s’arrête au musée ?', 'NPC: Oui — c’est à trois arrêts. Je vous dirai quand.', 'YOU: Merci !',
    'NPC: Nous voilà — votre arrêt est le prochain. Bonne visite du musée !'],
};
const YOU_LINES = [Y_TICKET, Y_SINGLE, Y_WHICH, Y_THANKS, Y_STOP, Y_THANKS];
const STAFF = [N_WHERE, N_TYPE, N_FARE, N_PLATFORM, N_HOP, N_STOPS, N_NEXT];
const TOOLS = ['phrase.trans.one-ticket', 'phrase.trans.single', 'phrase.trans.which-platform', 'phrase.trans.does-stop'];
const LEARNER = [...TOOLS, 'phrase.recovery.thank-you'];
/** Canonical transcript ([who, text], exact) — the same value before this pass (7a70c41) and after. */
const TRANSCRIPT_PRINT = { en: '6038193f', es: '0d01d452', fr: 'd9addf13' };
/** The dialogue TREE — changed on purpose: the "next one" and recovery branches out, every turn a real decision. */
const DIALOGUE_PRINT = { en: 'c6db9c1c', es: '32e747f5', fr: 'd1ecc119' };
/** Transport vocabulary the mission must NOT add (EN / FR / ES). */
const TRANSPORT_DECK = /\b(bus|tram|metro|métro|subway|underground|station|gare|estación|driver|conductor|conducteur|chauffeur|conductora?|timetable|schedule|horaire|horario|connection|correspondance|transbordo|transfer|delay(ed)?|retard|retraso|seat|siège|asiento|carriage|wagon|vagón|line \d|ligne|línea|day pass|weekly|zone|zona|round trip|one-way|ticket machine|distributeur|máquina)\b/i;
const MONEY_DRILL = /\b(?:how much|cash|card|change|receipt|combien|espèces|carte|monnaie|reçu|cuánto|efectivo|tarjeta|cambio|recibo)\b|כמה עולה|מזומן|אשראי|עודף|קבלה/i;

/* ── what each step shows ─────────────────────────────────────────────────────────────────────── */

const boardText = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** The first step whose board (label / intro / receipt) matches — from `from` on. */
const firstBoard = (d: BootcampDayContent, re: RegExp, from = 0): number => d.steps.findIndex((s, i) => i >= from && boardText(s).some((t) => re.test(t)));
/** Every text a step speaks or shows in the target language. */
function speakable(d: BootcampDayContent): string[] {
  const out = scene(d).nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]);
  for (const s of d.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(heardIn(d, r), ...r.options.map((o) => o.text ?? text(d, o.itemId)));
    if (s.kind === 'visualMatch') for (const r of s.rounds) out.push(r.audio.en);
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
  }
  return out.filter(Boolean);
}
/** All app-language copy of the mission (labels, intros, meanings, receipts, captions). */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    out.push(...boardText(s));
    if (s.kind === 'talk') for (const b of s.body) out.push(b.he ?? '', b.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.label ?? '', t.caption?.he ?? '', t.caption?.en ?? '');
  }
  return out.join(' | ');
}

describe('the conversation is locked, and Mission 19 is in its place', () => {
  it('1. the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (7a70c41) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
  });
  for (const lang of LANGS) it(`1. ${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision (a line from another moment, asked again slowly); the "next one" and recovery branches are gone', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        expect(LEARNER, `${lang} ${n.id}`).toContain(strip(wrong[0]!.itemId)); // a real line of this ride, never nonsense
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
        expect(again.en, `${lang} ${n.id}`).toBe(nodes.find((x) => x.next === n.id && !x.slow)!.en); // the same line, again
      }
      expect(JSON.stringify(nodes), lang).not.toMatch(/next-one|recovery\.(repeat|slowly)/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('Mission 19 is "Public Transport", nineteenth on the journey (registry key 18)', () => {
    expect(BOOTCAMP_PLAN[18]!.id).toBe('public-transport');
    expect(BOOTCAMP_PLAN[18]!.day).toBe(18);
    expect(missionNumber(18)).toBe(19);
    expect(BOOTCAMP_PLAN[18]!.video).toBeUndefined(); // a normal mission: the standard video resolver
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Public Transport');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(beforeMission16Artwork(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!))))]));
  it('Missions 01–18 are unchanged by this pass (normalizing only the later Mission 16 artwork) (the Mission 18 checkpoint included)', () => { expect(raw(0, 18)).toEqual({ en: '31ca8ea9', es: 'a73b81d5', fr: 'd029bf2e' }); });
  it('Missions 20–30 are unchanged by this pass (normalizing only the later Mission 16 artwork) — and the City checkpoint (Mission 24) reuses the four tools and its two transport lines, same id and wording', () => {
    expect(raw(19)).toEqual({ en: '7ebcbddb', es: '1dc1ec3a', fr: 'a7f0fbd8' });
    for (const lang of LANGS) for (const id of [...TOOLS, 'reply.trans.three-stops', 'reply.trans.wrong-way']) {
      const later = day(lang, 24).items.find((i) => strip(i.id) === id);
      expect(later?.text, `${lang} ${id}`).toBe(text(day(lang), `${lang}.${id}`));
    }
  });
  it('30. EN / ES / FR parity: the same journey, step for step, each in its own words — same rounds, same answers, same reveals', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.ordered ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      expect(interactions(d), lang).toBe(interactions(day('en')));
    }
  });
});

describe('PRIOR LEARNING — verified per language, not assumed (learnedBefore(lang, 19))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 19);
  const chunk = (id: string, lang: CoverageLang): string => M19_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
  it('33. prior knowledge is checked per language: "Thank you!", "Hello", "the centre", "Yes" — each in its own words', () => {
    for (const lang of LANGS) for (const id of ['thank-you', 'hello', 'centre', 'yes']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(true);
    // …and the languages really differ: French "prochain" (next) was never taught (Mission 06 says "suivant"); Spanish and English have it.
    expect(prior('fr').words.has('prochain')).toBe(false);
    expect(prior('es').words.has('siguiente')).toBe(true);
    expect(prior('en').words.has('next')).toBe(true);
  });
  it('34. NUMBER AUDIT — 2 / 3 / 10 are guaranteed prior in every language, each by a covered concept of an earlier mission (not assumed)', () => {
    const N: Record<CoverageLang, [string, string, string]> = { en: ['two', 'three', 'ten'], es: ['dos', 'tres', 'diez'], fr: ['deux', 'trois', 'dix'] };
    for (const lang of LANGS) {
      const p = prior(lang);
      for (const w of N[lang]) {
        expect(p.words.has(w), `${lang} ${w}`).toBe(true);
        expect(p.concepts.some((c) => hasChunk(c.chunk, w)), `${lang} ${w} comes from a covered concept`).toBe(true);
      }
      const from = (w: string): number[] => [...new Set(p.concepts.filter((c) => hasChunk(c.chunk, w)).map((c) => c.mission))];
      expect(from(N[lang][0]), `${lang} 2`).toContain(2); // Mission 02 — "two"
      expect(from(N[lang][1]), `${lang} 3`).toEqual([17]); // Mission 17 — "aisle three": the only guarantee of "three"
      expect(from(N[lang][2]), `${lang} 10`).toContain(8); // Mission 08 — "breakfast is from seven to ten"
    }
  });
  it('35. "Straight ahead" is genuinely prior (Mission 05) in every language — so it is never re-taught: no direction drill', () => {
    for (const lang of LANGS) {
      expect(prior(lang).knowsChunk(chunk('straight-ahead', lang)), lang).toBe(true);
      expect(prior(lang).concepts.find((c) => hasChunk(c.chunk, chunk('straight-ahead', lang)))!.mission, lang).toBe(5);
      expect(cardsOf(day(lang)).filter((w) => w.text === chunk('straight-ahead', lang)), lang).toHaveLength(0); // no card of its own
    }
  });
  it('NOT prior anywhere, so taught here on whole lines: ticket, platform, single, return, every, train, museum — and no destination to transfer to ("airport" is not prior)', () => {
    const NEW: Record<CoverageLang, string[]> = {
      en: ['ticket', 'platform', 'single', 'return', 'every', 'train', 'museum', 'airport'],
      es: ['billete', 'andén', 'ida', 'vuelta', 'cada', 'tren', 'museo', 'aeropuerto'],
      fr: ['billet', 'quai', 'simple', 'retour', 'toutes', 'train', 'musée', 'aéroport'],
    };
    for (const lang of LANGS) for (const w of NEW[lang]) expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(false);
    for (const lang of LANGS) expect(stepsOf(day(lang), 'swap'), lang).toHaveLength(0); // no transfer round: the canonical line is enough
  });
  it('36. "Thank you!" is prior and gets ZERO teaching: no card, no drill, never an answer outside the conversation — said twice there', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(w.text, lang).not.toBe(at(Y_THANKS, lang));
      expect(stepsOf(d, 'quickReply').flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.recovery.thank-you'), lang).toHaveLength(0);
      expect(cinematicTranscript(scene(d)).filter((l) => l.who === 'you' && l.en === at(Y_THANKS, lang)), lang).toHaveLength(2);
    }
  });
  it('37. optional and transfer-only earlier content never creates false prior: a skippable miss in this conversation, a transfer check in Mission 17', () => {
    for (const lang of LANGS) {
      // The slow re-asks of this conversation are skippable: cutting them changes nothing learned.
      const noMiss = (l: CoverageLang, n: number): BootcampDayContent => {
        const d = missionContent(l, n);
        if (n !== 19) return d;
        const t = d.dialogues.transport!;
        return { ...d, dialogues: { transport: { ...t, nodes: t.nodes.filter((x) => !/^m\d$/.test(x.id)).map((x) => ({ ...x, choices: x.choices?.filter((c) => c.correct) })) } } };
      };
      const a = learnedBefore(lang, 20);
      const b = learnedBefore(lang, 20, noMiss);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      // Mission 17's "Where is the bread?" was a transferOnly check — it is not a chunk the learner knows.
      expect(prior(lang).knowsChunk({ en: 'Where is the bread', fr: 'Où est le pain', es: '¿Dónde está el pan' }[lang]), lang).toBe(false);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M19_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`29. STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every new chunk taught before it is tested (wrong options included)`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a card fails the audit (the ticket, single, the fare, which platform, the platform, the museum question, three stops, next)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      const cases: [string, string][] = [['trans.line.ticket', 'one-ticket'], ['trans.line.single', 'single-please'], ['trans.line.fare', 'every-ten-minutes'], ['trans.line.which', 'which-platform'],
        ['trans.line.platform', 'platform-two'], ['trans.line.stop', 'does-this-stop'], ['trans.line.stops', 'three-stops']];
      for (const [key, id] of cases) expect(unprepared(without(key), lang).join(' '), `${lang} ${key}`).toMatch(new RegExp(id));
      // "Your stop is next" is first TESTED in the final, after the supported conversation has shown it with its
      // translation — so the walk is satisfied without its card; the card is what COVERS it (meaning shown outside the chat).
      expect(coverageOf(without('trans.line.next'), lang, M19_CONCEPTS).find((r) => r.id === 'stop-is-next')!.covered, lang).toBe(false);
    }
  });
});

describe('production — six locked learner turns, four tools, nothing invented', () => {
  it('2. exactly six canonical learner turns, all in the supported conversation — run ONCE, translations on', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cinematicTranscript(scene(d)).filter((l) => l.who === 'you').map((l) => l.en), lang).toEqual(YOU_LINES.map((y) => at(y, lang)));
      expect(stepsOf(d, 'dialogue'), lang).toHaveLength(1);
      expect(scene(d).cold, lang).toBeUndefined();
    }
  });
  it('4. each tool is taught WHOLE on a card (with its meaning) before it is first retrieved — and is then retrieved three times: teaching, no help, final', () => {
    const cardOf: Record<string, string> = { 'phrase.trans.one-ticket': 'trans.line.ticket', 'phrase.trans.single': 'trans.line.single', 'phrase.trans.which-platform': 'trans.line.which', 'phrase.trans.does-stop': 'trans.line.stop' };
    for (const lang of LANGS) {
      const d = day(lang);
      const rounds = d.steps.flatMap((s, i) => (s.kind === 'quickReply' ? s.rounds.map((r) => [i, accepted(r)] as const) : []));
      for (const id of TOOLS) {
        const first = rounds.find(([, a]) => a === id)![0];
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeGreaterThan(-1);
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeLessThan(first);
        expect(cardsOf(d).find((w) => w.key === cardOf[id])!.text, `${lang} ${id}`).toBe(SAID[id]![IX[lang]]);
        expect(rounds.filter(([, a]) => a === id), `${lang} ${id}`).toHaveLength(3);
      }
    }
  });
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : []));
  it('5, 22. no help: exactly the four tools — ticket · single · platform · does this stop — no meanings, no cards, no ticket board, no Thank you', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(TOOLS);
      expect(run.map((s) => s.kind), lang).toEqual(['receipt', 'quickReply', 'receipt']);
      for (const s of run) if (s.kind === 'quickReply') { expect(s.challenge).toBe(true); expect(s.label).toBeUndefined(); for (const r of s.rounds) expect(r.situation).toBeUndefined(); }
      expect(stepsOf({ ...d, steps: run }, 'quickReply')[0]!.rounds.map((r) => strip(r.promptItemId)), lang).toEqual(['reply.trans.where-headed', 'reply.trans.single-return', 'reply.trans.fare', 'reply.trans.hop-on']);
    }
  });
  it('6, 23. the final: buy → type → fare → platform → find it → destination check → track → get off — FOUR productions, four comprehension moments', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(videoAt(d) + 1).filter((s) => s.kind === 'quickReply' || s.kind === 'visualMatch');
      expect(run.map((s) => (s.kind === 'quickReply' ? accepted(s.rounds[0]!) : isFare(s) ? 'fare' : isPlatform(s) ? 'platform' : isStops(s) ? 'stops' : isGetOff(s) ? 'get-off' : '?')), lang)
        .toEqual(['phrase.trans.one-ticket', 'phrase.trans.single', 'fare', 'phrase.trans.which-platform', 'platform', 'phrase.trans.does-stop', 'stops', 'get-off']);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual(TOOLS);
      expect(JSON.stringify(d.steps.slice(videoAt(d) + 1)), lang).not.toContain('recovery.thank-you"'); // no Thank you in the final
      expect(d.steps.slice(videoAt(d) + 1).some((s) => s.kind === 'dialogue'), lang).toBe(false); // the dialogue is not re-run
    }
  });
  it('7. no line of the staff is ever an answer; 8. every option is one of the learner\'s own locked lines, said whole', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const offered = stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(d, o.itemId))));
      for (const st of STAFF) expect(offered, lang).not.toContain(at(st, lang));
      for (const o of offered) expect(YOU_LINES.map((y) => at(y, lang)), lang).toContain(o);
      for (const id of LEARNER) expect(SAID[id]![IX[lang]], lang).toBe(text(d, `${lang}.${id}`));
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(d)) expect(lines, `${lang} ${w.key}`).toContain(w.text); // every card is a whole line of this conversation
    }
  });
  it('sentences: four tools, "Thank you!", seven whole staff lines — "It\'s three stops." and "You\'re going the wrong way." kept untaught for the City checkpoint; four archived', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.recovery.thank-you', 'phrase.trans.does-stop', 'phrase.trans.one-ticket', 'phrase.trans.single', 'phrase.trans.which-platform',
        'reply.trans.fare', 'reply.trans.hop-on', 'reply.trans.platform-straight', 'reply.trans.single-return', 'reply.trans.stop-is-next', 'reply.trans.stops-tell',
        'reply.trans.three-stops', 'reply.trans.where-headed', 'reply.trans.wrong-way',
      ]);
      for (const id of ['reply.trans.three-stops', 'reply.trans.wrong-way']) expect(JSON.stringify([d.steps, d.dialogues]), `${lang} ${id}`).not.toContain(`${lang}.${id}"`);
      for (const r of STAFF) expect(d.items.map((i) => i.text), lang).toContain(at(r, lang));
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'public-transport').map((r) => strip(r.id)), lang).toEqual(['phrase.trans.next-one', 'reply.trans.platform-two', 'reply.trans.every-ten', 'reply.trans.stop-next']);
    }
  });
});

describe('the opening briefing — your own destination; nothing to discover is given away', () => {
  it('the brief\'s Hebrew, the only opening card: the centre and the museum, and none of the facts the station will tell you', () => {
    for (const lang of LANGS) {
      const b = day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      expect(b.body.map((x) => x.he).join('\n')).toBe('אתה נוסע למרכז ורוצה להגיע למוזיאון.\nקנה כרטיס, מצא את הרציף וודא שאתה יורד במקום הנכון.');
      expect(b.title.en).toBe('Mission 19: Public Transport');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      expect(JSON.stringify(b), lang).not.toMatch(/single|return|הלוך|€|euro|יורו|\b(3|10|2)\b|ten|three|two|עשר|שלוש|שתיים|platform 2|straight|ישר|stops|תחנות|next|הבאה/i);
    }
  });
});

describe('TICKET TYPE — single or return', () => {
  it('9. Single and Return have distinct semantics: one way vs there and back — on the tile by meaning, never by the target word', () => {
    expect(Object.keys(TICKET_TYPES)).toEqual(['single', 'return']); // 12. no other ticket type
    expect(TICKET_TYPES.single.emoji).not.toBe(TICKET_TYPES.return.emoji);
    expect(TICKET_TYPES.single.caption!.en).toBe('One way — there only');
    expect(TICKET_TYPES.return.caption!.en).toBe('There and back');
    for (const t of Object.values(TICKET_TYPES)) expect(`${t.caption!.en} ${t.caption!.he}`).not.toMatch(/single|return|simple|retour|ida|vuelta|הלוך/i);
  });
  it('10. Single is the learner\'s canonical choice: the ticket board, the conversation and every retrieval pick it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.filter(isType).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(Y_SINGLE, lang), 'single']]);
      expect(scene(d).nodes.find((n) => n.id === 'c2')!.choices!.find((c) => c.correct)!.en, lang).toBe(at(Y_SINGLE, lang));
      expect(stepsOf(d, 'quickReply').flatMap((s) => s.rounds).filter((r) => heardIn(d, r) === at(N_TYPE, lang)).every((r) => accepted(r) === 'phrase.trans.single'), lang).toBe(true);
    }
  });
  it('11. "return" is comprehension only: heard in the clerk\'s question, never said, never an answer', () => {
    const RETURN = { en: /\breturn\b/i, fr: /retour/i, es: /vuelta/i } as const;
    for (const lang of LANGS) {
      const d = day(lang);
      const said = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(d, o.itemId)))), ...scene(d).nodes.flatMap((n) => (n.choices ?? []).map((c) => c.en))];
      for (const t of said) expect(t, lang).not.toMatch(RETURN[lang]);
      expect(speakable(d).filter((t) => RETURN[lang].test(t)).every((t) => t === at(N_TYPE, lang)), lang).toBe(true);
    }
  });
  it('12. no extra ticket types — no day pass, zone, weekly or round-trip ticket anywhere', () => {
    for (const lang of LANGS) {
      for (const t of speakable(day(lang))) expect(t, lang).not.toMatch(TRANSPORT_DECK);
      expect(appCopy(day(lang)), lang).not.toMatch(/day pass|weekly|zone|round trip|one-way ticket|כרטיס יומי|חופשי|אזור/i);
    }
  });
});

describe('PRICE + FREQUENCY — one line, two facts, one check', () => {
  it('13–14. the price is exactly €3, the frequency exactly every 10 minutes: one combined tile, heard in one line', () => {
    expect(FARE_TILES.find((t) => t.id === 'f3-10')!.label).toBe('💶 €3 · 🕒 10\u00a0min'); // a no-break space: the number never wraps from its unit
    expect(rideState(2).priceKnown).toEqual({ euros: 3 });
    expect(rideState(2).frequencyKnown).toEqual({ everyMinutes: 10 });
    for (const lang of LANGS) {
      const fares = day(lang).steps.filter(isFare);
      expect(fares.flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_FARE, lang), 'f3-10'], [at(N_FARE, lang), 'f3-10']]); // teaching + final, ONE round each
    }
    // the distractors swap the same three known numbers (2 / 3 / 10) — a real listening check
    expect(FARE_TILES.map((t) => (t.label ?? '').replace(/\u00a0/g, ' '))).toEqual(['💶 €3 · 🕒 10 min', '💶 €10 · 🕒 3 min', '💶 €3 · 🕒 2 min', '💶 €2 · 🕒 10 min']);
  });
  it('16–17. no price lesson and no money drill: one card for the fare line, no cash / card / change / how much', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => /€/.test(w.meaning.en ?? '')).map((w) => w.key), lang).toEqual(['trans.line.fare']);
      for (const t of speakable(d)) expect(t, lang).not.toMatch(MONEY_DRILL);
      expect(appCopy(d), lang).not.toMatch(MONEY_DRILL);
    }
  });
});

describe('PLATFORM FINDER — platform 2, straight ahead', () => {
  it('18–19. the answer is platform TWO, STRAIGHT ahead — heard in one line, tapped on one board (teaching + final)', () => {
    expect(PLATFORM_TILES.find((t) => t.id === 'p2s')!.label).toBe('🚉 2 ⬆️');
    expect(rideState(3).platformKnown).toEqual({ platform: 2 });
    expect(rideState(3).directionKnown).toBe('straight');
    for (const lang of LANGS) expect(day(lang).steps.filter(isPlatform).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_PLATFORM, lang), 'p2s'], [at(N_PLATFORM, lang), 'p2s']]);
  });
  it('20–21. the exact data is deterministic UI: six ordered tiles (platforms 1–3 × straight / left), no picture — and no artwork carries a number or an arrow', () => {
    expect(PLATFORM_TILES.map((t) => [t.id, t.label])).toEqual([['p1s', '🚉 1 ⬆️'], ['p2s', '🚉 2 ⬆️'], ['p3s', '🚉 3 ⬆️'], ['p1l', '🚉 1 ⬅️'], ['p2l', '🚉 2 ⬅️'], ['p3l', '🚉 3 ⬅️']]);
    for (const t of [...PLATFORM_TILES, ...FARE_TILES, ...STOP_TILES]) { expect(t.image).toBeUndefined(); expect(t.emoji).toBeUndefined(); }
    for (const lang of LANGS) for (const s of day(lang).steps.filter((x) => isPlatform(x) || isStops(x))) expect(s.ordered, lang).toBe(true);
    expect(JSON.stringify([M19_SLOTS, M19_PROPS])).not.toMatch(/\d|⬆️|⬅️|➡️|€/);
  });
});

describe('ROUTE STRIP — three stops, then next', () => {
  it('22. the museum is stop 3 — three stops away (teaching + final)', () => {
    for (const lang of LANGS) expect(day(lang).steps.filter(isStops).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_STOPS, lang), 's3'], [at(N_STOPS, lang), 's3']]);
    expect(rideState(5).stopsRemaining).toBe(3);
    expect(rideState(6).stopsRemaining).toBe(1);
  });
  it('23. the route strip is deterministic UI the board draws: start → 1 → 2 → the museum, "●" where you are', () => {
    const at5 = splitTimeBoard(routeStrip(5)[1])!.route!;
    const at6 = splitTimeBoard(routeStrip(6)[1])!.route!;
    expect(at5).toEqual([{ text: '🚉 Start', now: true }, { text: '🛑 1', now: false }, { text: '🛑 2', now: false }, { text: '🏛️ 3 · Museum', now: false }]);
    expect(at6).toEqual([{ text: '🚉 Start', now: false }, { text: '🛑 1', now: false }, { text: '🛑 2', now: true }, { text: '🏛️ Next: Museum', now: false }]);
    expect(STOP_TILES.map((t) => [t.id, t.label])).toEqual([['s1', '🛑 1'], ['s2', '🛑 2'], ['s3', '🛑 3']]);
  });
  it('25. no invented stop names: the route is numbered — Start, 1, 2, Museum, nothing else', () => {
    for (const n of [5, 6] as const) for (const i of [0, 1] as const) expect(routeStrip(n)[i].replace(/🧭|🚉|🛑|🏛️|●|→|·|\d|Start|Museum|Next:|יציאה|מוזיאון|הבאה:/g, '').trim(), `${n} ${i}`).toBe('');
  });
  it('17–18. "next" is comprehension only: one board in the final — get off at the next stop, not "three more", not "missed"', () => {
    expect(Object.keys(GET_OFF_TILES)).toEqual(['next', 'three', 'missed']);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.filter(isGetOff).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_NEXT, lang), 'next']]);
      expect(d.steps.findIndex(isGetOff), lang).toBeGreaterThan(videoAt(d));
      expect(cardsOf(d).filter((w) => !w.line), lang).toHaveLength(0); // no "next" word card, no word cards at all
    }
  });
});

describe('🚆 YOUR RIDE — the travel ticket never shows the future (20)', () => {
  const REVEALS: [label: string, board: RegExp, card: string, firstCheck: (s: BootcampStep) => boolean][] = [
    ['ticket type', /Ticket: Single|סוג: הלוך/, 'trans.line.type', (s) => s.kind === 'quickReply' && s.rounds.some((r) => strip(r.promptItemId) === 'reply.trans.single-return')],
    ['price', /€3/, 'trans.line.fare', isFare],
    ['frequency', /10\s?min|כל 10/, 'trans.line.fare', isFare],
    ['platform 2', /Platform: 2|רציף: 2/, 'trans.line.platform', isPlatform],
    ['three stops', /3 stops|3 תחנות|🏛️ 3/, 'trans.line.stops', isStops],
    ['next stop', /Next stop|Next: Museum|בתחנה הבאה|הבאה: מוזיאון/, 'trans.line.next', (s) => s.kind === 'prime' && s.words.some((w) => w.key === 'trans.line.next')],
  ];
  for (const [label, board, card, check] of REVEALS) it(`${label}: never on the board before the line that says it — in teaching, and again in the final`, () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = primeAt(d, card);
      expect(said, `${lang} ${label}`).toBeGreaterThan(0);
      const first = firstBoard(d, board);
      expect(first, `${lang} ${label}`).toBeGreaterThan(said);
      expect(first, `${lang} ${label}`).toBeGreaterThan(d.steps.findIndex(check)); // after the moment the learner gets it
      // the final starts the ride again: the fact is back only after its own moment there
      const final = videoAt(d) + 1;
      const again = d.steps.findIndex((s, i) => i >= final && check(s));
      const shown = firstBoard(d, board, final);
      if (label !== 'next stop') expect(shown, `${lang} ${label} (final)`).toBeGreaterThan(again);
    }
  });
  it('no step before a line\'s card carries its fact anywhere — label, tile, caption or picture', () => {
    const FACTS: [string, RegExp][] = [['trans.line.type', /Single ➡️|הלוך ➡️|One way|There and back/], ['trans.line.fare', /€3|10\s?min|כל 10/], ['trans.line.platform', /🚉 2|Platform: 2|רציף: 2/],
      ['trans.line.stops', /3 stops|3 תחנות|🛑 3|🏛️ 3/], ['trans.line.next', /Next stop|Next: Museum|next stop|בתחנה הבאה|הבאה: מוזיאון/]];
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [card, fact] of FACTS) for (const s of d.steps.slice(0, primeAt(d, card))) expect(JSON.stringify(s), `${lang} ${card}`).not.toMatch(fact);
    }
  });
  it('the ticket fills stage by stage — "?" until known — and the board renders it as a two-column ticket', () => {
    const known = (n: 0 | 1 | 2 | 3 | 4 | 5 | 6) => splitTimeBoard(rideTicket(n)[1])!.plan!.flatMap((c) => c.rows.filter((r) => r.known).map((r) => r.text));
    expect(known(0)).toEqual(['Destination: Centre']);
    expect(known(1)).toEqual(['Destination: Centre', 'Ticket: Single ➡️']);
    expect(known(2)).toEqual(['Destination: Centre', 'Ticket: Single ➡️', 'Price: €3', 'Every: 10 min']);
    expect(known(3)).toContain('Platform: 2 ⬆️ straight');
    expect(known(5)).toContain('Museum: 3 stops');
    expect(known(6)).toContain('Get off: Next stop');
    expect(splitTimeBoard(rideTicket(4)[1])!.plan![1]!.day).toBe('🚆 On board');
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `🚆 Your ride ¦ ${routeStrip(5)[1]} ¦ ${rideTicket(5)[1]} ¦ Go` }));
    expect(html).toMatch(/plan-card/);
    expect(html).toMatch(/time-strip is-route/);
    expect(html.match(/data-known="false"/g)).toHaveLength(1); // only "Get off" is still unknown
  });
  it('19, 24. the ride\'s states: plan → ticket → fare → platform → on board → museum → next — and "next" only after the final line', () => {
    expect(M19_STAGES).toEqual(['plan', 'ticket', 'fare', 'platform', 'boarded', 'museum', 'next']);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(firstBoard(d, /Get off: Next stop/), lang).toBeGreaterThan(primeAt(d, 'trans.line.next'));
      expect(firstBoard(d, /On board/), lang).toBeGreaterThan(primeAt(d, 'trans.line.hop'));
    }
  });
});

describe('the result — 🚆 RIDE COMPLETE', () => {
  it('the whole ride, compact — no score, no streak, no XP', () => {
    expect(RIDE_COMPLETE[1]).toBe('🚆 RIDE COMPLETE ¦ 🎫 Ticket: Destination: Centre / Ticket: Single ➡️ / Price: €3 / Every: 10 min ‖ 🚆 On board: Platform: 2 ⬆️ straight / Museum: 3 stops / Got off: ✅ the right stop ¦ You bought the ticket, found the platform, checked the train and got off at the right stop.');
    expect(RIDE_COMPLETE.join(' ')).not.toMatch(/%|points|score|streak|\bXP\b|\d+\/\d+|ניקוד|נקודות|רצף/i);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('RIDE COMPLETE')).map(([, i]) => i)).toEqual([d.steps.length - 2]);
      expect(d.steps.at(-1)!.kind).toBe('summary');
    }
  });
});

describe('bloat guards — one train journey, not a transport encyclopedia', () => {
  it('INTERACTION BUDGET: 20 meaningful interactions (target 18–21, hard ceiling 21): 8 teaching · 4 no help · 8 final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(20);
      expect(interactions(d), lang).toBeLessThanOrEqual(21);
      expect(interactions({ ...d, steps: d.steps.slice(0, dialogueAt(d)) }), lang).toBe(8);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(4);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(8);
    }
  });
  it('PARETO: narrative glue is never drilled — "Hop on", "I\'ll tell you when", "Enjoy the museum" and "Here we are" are cards and conversation only', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      // the glue is never the answer, and "Hop on" is only ever the question before the museum check
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) if (heardIn(d, r) === at(N_HOP, lang)) expect(accepted(r), lang).toBe('phrase.trans.does-stop');
      expect(d.steps.filter((s) => s.kind === 'visualMatch' && s.rounds.some((r) => r.audio.en === at(N_HOP, lang))), lang).toHaveLength(0);
      expect(d.steps.filter(isGetOff).length, lang).toBe(1); // "your stop is next": one comprehension moment, in the final
    }
  });
  it('26–28. no transport vocabulary deck, no other transport mode, no schedule / connection / delay words — in any line or the copy', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const t of speakable(d)) expect(t, lang).not.toMatch(TRANSPORT_DECK);
      expect(appCopy(d), lang).not.toMatch(TRANSPORT_DECK);
      expect(appCopy(d), lang).not.toMatch(/אוטובוס|רכבת תחתית|מטרו|נהג|לוח זמנים|עיכוב|החלפה|קו \d/);
      expect(cardsOf(d).every((w) => w.line), lang).toBe(true); // every card is a whole line — no word deck
    }
  });
  it('29–32. no grammar lesson, no sentence builder, no separate Flex Round, no score / streak / timer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(appCopy(d), lang).not.toMatch(/grammar|tense|conjugat|infinitive|article|verb|noun|דקדוק|נטייה|פועל|יידוע/i);
      expect(stepsOf(d, 'sentenceBuilder').length + stepsOf(d, 'quiz').length + stepsOf(d, 'replies').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'ambush').length + stepsOf(d, 'miniMap').length + stepsOf(d, 'swap').length, lang).toBe(0);
      expect(d.steps.some((s) => 'transferOnly' in s && s.transferOnly), lang).toBe(false);
      expect(appCopy(d), lang).not.toMatch(/flex|גמיש|score|streak|\bXP\b|timer|seconds|ניקוד|רצף|טיימר|שניות/i);
    }
  });
});

describe('audio never blocks the answer (the approved conversation behaviour)', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('every answered line of the staff shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBe(12); // six lines + six slow re-asks
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
    const q = tts.speak(N_FARE[0], 'en');
    void tts.speak(Y_WHICH[0], 'en');
    expect(await q).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_WHICH[0]);
    tts.cancelSpeech();
  });
  it('a miss is asked again SLOWLY — the slow retry is a real beat of the conversation', () => {
    for (const lang of LANGS) expect(scene(day(lang)).nodes.filter((n) => n.slow).map((n) => n.id), lang).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6']);
  });
});

describe('serialisable state', () => {
  it('the ride state serialises, and restoring it never leaks the future', () => {
    for (let n = 0; n <= 6; n++) {
      const s = JSON.parse(JSON.stringify(rideState(n as 0))) as ReturnType<typeof rideState>;
      expect(s).toEqual(rideState(n as 0));
      expect([s.ticketType !== null, s.priceKnown !== null, s.frequencyKnown !== null, s.platformKnown !== null, s.directionKnown !== null, s.boarded, s.museumConfirmed, s.nextStopKnown])
        .toEqual([n >= 1, n >= 2, n >= 2, n >= 3, n >= 3, n >= 4, n >= 5, n >= 6]);
      expect(s.destination).toBe('centre');
    }
    expect(Object.keys(rideState(0)).sort()).toEqual(['boarded', 'destination', 'directionKnown', 'frequencyKnown', 'museumConfirmed', 'nextStopKnown', 'phase', 'platformKnown', 'priceKnown', 'stopsRemaining', 'ticketType']);
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for (28)', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M19_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M19_CONCEPTS.flatMap((c) => plain(quotes(c.chunk[lang])).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED here or VERIFIED PRIOR — the four tools and the staff's facts always covered`, () => {
    const prior = learnedBefore(lang, 19);
    const rows = coverageOf(day(lang), lang, M19_CONCEPTS);
    for (const row of rows) if (!prior.knowsChunk(M19_CONCEPTS.find((x) => x.id === row.id)!.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    for (const id of ['one-ticket', 'single-please', 'which-platform', 'does-this-stop', 'single-or-return', 'every-ten-minutes', 'platform-two', 'three-stops', 'stop-is-next']) expect(rows.find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
    // "Thank you!" is the one chunk that is NOT covered here — on purpose: it is prior, and never taught.
    expect(rows.filter((r) => !r.covered).map((r) => r.id)).toEqual(['thank-you']);
  });
  it('a card is a teaching encounter; a board or a quick reply never is', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const e of teachingEncounters(d)) expect(d.steps[e.step]!.kind, lang).toBe('prime');
    }
  });
});

describe('visuals, the companion and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'quickReply' || s.kind === 'visualMatch') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'quickReply', // buy the ticket
      'prime', 'visualMatch', 'quickReply', // single or return
      'prime', 'visualMatch', // €3 · every 10 min
      'prime', 'quickReply', // which platform?
      'prime', 'visualMatch', // platform 2, straight ahead
      'prime', 'quickReply', // hop on · does this stop at the museum?
      'prime', 'visualMatch', // three stops
      'prime', 'receipt', // your stop is next
      'dialogue', 'receipt',
      'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'quickReply', 'visualMatch', 'quickReply', 'visualMatch', 'quickReply', 'visualMatch', 'visualMatch', 'receipt', 'summary',
    ]);
  });
  it('34–35. visual slots: the desk, the tickets, the platform, the train, on board, the museum, one result prop — placeholders, listed in the asset manifest (VISUAL PRODUCTION REQUIRED)', () => {
    expect(Object.keys(M19_SLOTS)).toEqual(['desk', 'tickets', 'platform', 'train', 'onboard', 'museum']);
    expect(Object.keys(M19_PROPS)).toEqual(['ride-complete']);
    for (const s of [...Object.values(M19_SLOTS), ...Object.values(M19_PROPS)]) { expect(s.emoji).toBeTruthy(); if (s.image) expect(s.image).toMatch(/^images\/mission19\/[a-z-]+\.jpg$/); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION19_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED/);
    for (const key of [...Object.keys(M19_SLOTS), ...Object.keys(M19_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language', () => {
    const looks = new Set(Object.values(M19_SLOTS).map((s) => s.image ?? s.emoji));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
  });
  it('the companion introduces the first board as the ticket type — never "hear the price"', () => {
    const d = day('en');
    const coach = coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[18]!.id)!;
    expect(coach.line.en).toBe('Listen — and tap the ticket type.');
  });
  it('36–38. video: the standard resolver ({lang}_19.mp4) — no Mission 19 file in any language today, so the step is safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[18]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_19.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
