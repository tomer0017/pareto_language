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
import { M21_CONCEPTS } from './mission21Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  FINAL_SAID, FRIEND_TILES, M21_PROPS, M21_SLOTS, M21_STAGES, MY_NEXT_TRIP, N_END, N_HOW_LONG, N_MISS, N_TOMORROW, N_WHERE, PLAN_PARTS, PLAN_TILES, SAID, TOOLS,
  Y_AFTER, Y_BACK, Y_BE_THERE, Y_GOING, Y_TOMORROW, Y_VISIT, anotherTrip, myNextTrip, nextTripState, type PlanStage,
} from './practiceFuture.js';
import { validatePracticeStep } from './practiceEngines.js';
import { WORD_SENSES, learnedBefore, missionContent, senseWords, teachingEncounters, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 21 — Future Travel & Plans: TALK ABOUT WHAT HAPPENS NEXT. The conversation is LOCKED. Four production
 * tools (I'm going to ___ · I'll be there for ___ · I want to ___ · Where are you going next?), the friend's
 * questions as comprehension (which part of your plan is asked about?), the learner's own MY NEXT TRIP plan shown
 * from the start, and a final that is ANOTHER TRIP — the same questions, a new verified-prior plan. No grammar.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 21): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const scene = (d: BootcampDayContent) => d.dialogues['where-next']!;
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type VM = Extract<BootcampStep, { kind: 'visualMatch' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, o: Round['options'][number]): string => o.text ?? text(d, o.itemId);
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const boardOf = (tiles: { id: string }[]) => (s: BootcampStep): s is VM => s.kind === 'visualMatch' && s.tiles.length === tiles.length && s.tiles.every((t, i) => t.id === tiles[i]!.id);
const isWhich = boardOf(PLAN_TILES);
const isFriend = boardOf(FRIEND_TILES);
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);
const quickRounds = (d: BootcampDayContent, from = 0, to = d.steps.length) => d.steps.slice(from, to).flatMap((s, i) => (s.kind === 'quickReply' ? s.rounds.map((r) => [from + i, r] as const) : []));
const phaseOf = (d: BootcampDayContent, i: number): 'teaching' | 'no help' | 'final' => (i < dialogueAt(d) ? 'teaching' : i < videoAt(d) ? 'no help' : 'final');

/** The conversation exactly as the brief froze it (pasted verbatim) — compared EXACTLY, no normalisation. */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: So, where are you going next?', "YOU: I'm going to Vietnam.", 'NPC: Wow! How long will you be there?', "YOU: I'll be there for two weeks.", 'NPC: What do you want to do there?', 'YOU: I want to visit Hanoi.',
    'NPC: Nice. Anything else?', 'YOU: I want to travel by motorbike.', 'NPC: Sounds amazing! Be careful. And after that?', "YOU: After that I'm going to Thailand.",
    'NPC: Great plan. And what are you doing tomorrow morning?', "YOU: Tomorrow morning I'm going to the airport.", "NPC: Already! We'll miss you.", 'YOU: And you? Where are you going next?',
    "NPC: Me? I'm going home. Have a great trip!"],
  es: ['NPC: Bueno, ¿a dónde vas después?', 'YOU: Voy a Vietnam.', 'NPC: ¡Guau! ¿Cuánto tiempo vas a estar allí?', 'YOU: Voy a estar allí dos semanas.', 'NPC: ¿Qué quieres hacer allí?', 'YOU: Quiero visitar Hanói.',
    'NPC: Qué bien. ¿Algo más?', 'YOU: Quiero viajar en moto.', 'NPC: ¡Suena increíble! Ten cuidado. ¿Y después de eso?', 'YOU: Después de eso voy a Tailandia.',
    'NPC: Buen plan. ¿Y qué haces mañana por la mañana?', 'YOU: Mañana por la mañana voy al aeropuerto.', 'NPC: ¡Ya! Te vamos a echar de menos.', 'YOU: ¿Y tú? ¿A dónde vas después?',
    'NPC: ¿Yo? Me voy a casa. ¡Buen viaje!'],
  fr: ['NPC: Alors, tu vas où après ?', 'YOU: Je vais au Vietnam.', 'NPC: Waouh ! Tu restes combien de temps ?', 'YOU: Je vais rester deux semaines.', 'NPC: Tu veux faire quoi là-bas ?', 'YOU: Je veux visiter Hanoï.',
    'NPC: Sympa. Autre chose ?', 'YOU: Je veux voyager à moto.', 'NPC: Ça a l’air génial ! Fais attention. Et après ça ?', 'YOU: Après ça, je vais en Thaïlande.',
    'NPC: Super programme. Et tu fais quoi demain matin ?', 'YOU: Demain matin, je vais à l’aéroport.', 'NPC: Déjà ! Tu vas nous manquer.', 'YOU: Et toi ? Tu vas où après ?',
    'NPC: Moi ? Je rentre chez moi. Bon voyage !'],
};
/** The brief's Hebrew support meaning, line by line. */
const HEBREW = ['אז לאן אתה נוסע אחרי זה?', 'אני נוסע לווייטנאם.', 'וואו! כמה זמן תהיה שם?', 'אני אהיה שם שבועיים.', 'מה אתה רוצה לעשות שם?', 'אני רוצה לבקר בהאנוי.', 'יפה. עוד משהו?',
  'אני רוצה לטייל באופנוע.', 'נשמע מדהים! תיזהר. ואחרי זה?', 'אחרי זה אני נוסע לתאילנד.', 'תוכנית מעולה. ומה אתה עושה מחר בבוקר?', 'מחר בבוקר אני נוסע לשדה התעופה.',
  'כבר! נתגעגע אליך.', 'ואתה? לאן אתה נוסע אחרי זה?', 'אני? אני חוזר הביתה. נסיעה טובה!'];
/** Canonical transcript ([who, text], exact) — the same value before this pass and after. */
const TRANSCRIPT_PRINT = { en: '1a709ca4', es: 'a3e1aa62', fr: 'eee7d4c7' };
/** The dialogue TREE — changed on purpose: one wrong line per turn, asked again slowly; no alternative answer, no recovery branch. */
const DIALOGUE_PRINT = { en: 'e52a4bd4', es: '825c0386', fr: '6f7cd3fd' };
const [GOING, BE_THERE, VISIT, BACK] = TOOLS;
const MOTO = 'phrase.future.by-motorbike';
const AFTER = 'phrase.future.after-that';
const TOMORROW = 'phrase.future.tomorrow-morning';
const LEARNER = [GOING, BE_THERE, VISIT, MOTO, AFTER, TOMORROW, BACK];
/** The fourth tool on its own — the reusable question, exactly (the brief's target-language forms). */
const STANDALONE: Record<CoverageLang, string> = { en: 'Where are you going next?', es: '¿A dónde vas después?', fr: 'Tu vas où après ?' };
const AND_YOU: Record<CoverageLang, string> = { en: 'And you?', es: '¿Y tú?', fr: 'Et toi ?' };
/** Grammar the mission must never show (EN / HE). */
const GRAMMAR = /grammar|tense|future simple|simple future|going[ -]to future|present continuous|will vs|vs\.? going to|\bwill\b \+|infinitive|conjugat|futur proche|ir \+ a|\bverbs?\b|participle|דקדוק|זמן עתיד|זמן הווה|פועל|פעלים|נטייה|הטיה/i;
const SCOREBOARD = /score|points|\bXP\b|streak|timer|seconds|%|\d+\s*\/\s*\d+|ניקוד|נקודות|רצף|טיימר|שניות/i;

/* ── what each step shows ─────────────────────────────────────────────────────────────────────── */

const boardText = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** Every text a step speaks or shows in the target language. */
function speakable(d: BootcampDayContent): string[] {
  const out = scene(d).nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]);
  for (const s of d.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(heardIn(d, r), ...r.options.map((o) => said(d, o)));
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
    if (s.kind === 'talk') for (const b of [s.title, ...s.body, s.cta]) out.push(b?.he ?? '', b?.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.label ?? '', t.caption?.he ?? '', t.caption?.en ?? '');
  }
  return out.join(' | ');
}

describe('the conversation is locked, and Mission 21 is in its place', () => {
  for (const lang of LANGS) it(`${lang === 'en' ? 1 : lang === 'es' ? 2 : 3}. ${lang}: the brief's canonical dialogue, word for word — EXACT (no normalisation)`, () => {
    expect(script(lang)).toEqual(LOCKED[lang]);
  });
  it('the canonical transcript is byte-identical to the pre-pass one (target text unchanged) — and the Hebrew support is the brief\'s', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
    for (const lang of LANGS) expect(cinematicTranscript(scene(day(lang))).map((l) => l.he), lang).toEqual(HEBREW);
  });
  it('4. all seven canonical learner turns remain exact — and they are the only lines the learner says in the conversation', () => {
    for (const lang of LANGS) {
      const turns = cinematicTranscript(scene(day(lang))).filter((l) => l.who === 'you').map((l) => l.en);
      expect(turns, lang).toEqual(LEARNER.map((id) => at(SAID[id]!, lang)));
      expect(turns, lang).toEqual(LOCKED[lang].filter((l) => l.startsWith('YOU: ')).map((l) => l.slice(5)));
    }
  });
  it('the dialogue tree is pinned: every turn a real decision — one wrong line of this conversation, asked again slowly, then the same choice', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        expect(LEARNER, `${lang} ${n.id}`).toContain(strip(wrong[0]!.itemId)); // a real line of this chat, never nonsense
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
        expect(again.en, `${lang} ${n.id}`).toBe(nodes.find((x) => x.next === n.id && !x.slow)!.en); // the same line, again — no lecture, no answer given
      }
      expect(JSON.stringify(nodes), lang).not.toMatch(/recovery\.|want-to-try-food|ride-horses/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('5. Mission 21 is "Future Travel & Plans", twenty-first on the journey (registry key 35) — a normal mission', () => {
    expect(BOOTCAMP_PLAN[20]!.id).toBe('future-plans');
    expect(BOOTCAMP_PLAN[20]!.day).toBe(35);
    expect(missionNumber(35)).toBe(21);
    expect(BOOTCAMP_PLAN[20]!.video).toBeUndefined(); // the standard video resolver
    expect(BOOTCAMP_PLAN[20]!.checkpoint).toBeUndefined();
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Future Travel & Plans');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('43. Missions 01–20 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 20)).toEqual({ en: 'b7b5ea7a', es: '8deff1ad', fr: '227325ca' }); });
  it('44. Missions 23–30 are byte-for-byte unchanged (Mission 22 has its own pass since: mission22.test.ts) — the five sentences Missions 24 and 30 reuse keep their id and wording (all four languages)', () => {
    expect(raw(22)).toEqual({ en: 'c136fa2c', es: '1abda9c1', fr: '9332620b' });
    for (const lang of LANGS) for (const n of [24, 30]) for (const id of [GOING, BE_THERE, AFTER, BACK, TOMORROW]) {
      const later = day(lang, n).items.find((i) => strip(i.id) === id);
      if (!later) continue;
      expect(later, `${lang} M${n} ${id}`).toEqual(day(lang).items.find((i) => strip(i.id) === id));
    }
    // (both checkpoints really do reuse them)
    for (const lang of LANGS) expect(day(lang, 24).items.filter((i) => ([GOING, BE_THERE, BACK] as string[]).includes(strip(i.id))).length, lang).toBe(3);
  });
  it('35. EN / ES / FR parity: the same journey, step for step, each in its own words — same rounds, same answers, same plan', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
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

describe('PRIOR LEARNING — verified per language, not assumed (learnedBefore(lang, 21))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 21);
  /** A chunk is known as a chunk; a word as a word; `form#sense` as that MEANING of the form. */
  const known = (lang: CoverageLang, c: string): boolean => (c.includes('#') ? prior(lang).words.has(c) : c.includes(' ') ? prior(lang).knowsChunk(c) : prior(lang).words.has(plain(c).trim()));
  /** The brief's audit list — a chunk per language, and what it really is before Mission 21. */
  const AUDIT: Record<CoverageLang, Record<string, string>> = {
    en: { next: 'next', Vietnam: 'vietnam', two: 'two', weeks: 'weeks', visit: 'visit', Hanoi: 'hanoi', motorbike: 'motorbike', 'after that': 'after that', Thailand: 'thailand', tomorrow: 'tomorrow', morning: 'morning', 'tomorrow morning': 'tomorrow morning', airport: 'airport', home: "I'm going home", 'great trip': 'have a great trip', 'be careful': 'be careful', 'miss you': 'miss#feel-absence', 'anything else': 'anything else', 'where are you going next': 'where are you going next', 'how long': 'how long', 'what do you want to do': 'what do you want to do', want: 'I want to', going: "I'm going to", hotel: 'hotel', museum: 'museum', train: 'train', beach: 'beach', centre: 'centre', three: 'three', week: 'week', 'three days': 'three days' },
    es: { next: 'después', Vietnam: 'vietnam', two: 'dos', weeks: 'semanas', visit: 'visitar', Hanoi: 'hanói', motorbike: 'moto', 'after that': 'después de eso', Thailand: 'tailandia', tomorrow: 'mañana', morning: 'por la mañana', 'tomorrow morning': 'mañana por la mañana', airport: 'aeropuerto', home: 'me voy a casa', 'great trip': '¡buen viaje!', 'be careful': 'ten cuidado', 'miss you': 'echar de menos', 'anything else': '¿algo más?', 'where are you going next': '¿a dónde vas después?', 'how long': 'cuánto tiempo', 'what do you want to do': '¿qué quieres hacer', want: 'quiero', going: 'voy a', hotel: 'hotel', museum: 'museo', train: 'tren', beach: 'playa', centre: 'centro', three: 'tres', week: 'semana', 'three days': 'tres días' },
    fr: { next: 'après', Vietnam: 'vietnam', two: 'deux', weeks: 'semaines', visit: 'visiter', Hanoi: 'hanoï', motorbike: 'moto', 'after that': 'après ça', Thailand: 'thaïlande', tomorrow: 'demain', morning: 'matin', 'tomorrow morning': 'demain matin', airport: 'aéroport', home: 'je rentre chez moi', 'great trip': 'bon voyage', 'be careful': 'fais attention', 'miss you': 'manquer#feel-absence', 'anything else': 'autre chose', 'where are you going next': 'tu vas où après', 'how long': 'combien de temps', 'what do you want to do': 'tu veux faire quoi', want: 'je veux', going: 'je vais', hotel: 'hôtel', museum: 'musée', train: 'train', beach: 'plage', centre: 'centre', three: 'trois', week: 'semaine', 'three days': 'trois jours' },
  };
  const COMMON = ['next', 'two', 'weeks', 'tomorrow', 'morning', 'tomorrow morning', 'home', 'anything else', 'how long', 'want', 'going', 'hotel', 'museum', 'beach', 'centre', 'three', 'week'];
  const VERIFIED: Record<CoverageLang, string[]> = {
    en: [...COMMON, 'visit'], // "visit" as in Mission 06's "the purpose of your visit"
    es: [...COMMON, 'great trip', 'train'], // "¡Buen viaje!" (Mission 07), "el tren" (Mission 19)
    fr: [...COMMON, 'great trip', 'train'], // "Bon voyage !" (Mission 07), "le train" (Mission 19)
  };
  for (const lang of LANGS) it(`${lang}: every audited item classified — VERIFIED GUARANTEED PRIOR, or NEW (taught here)`, () => {
    const verified = Object.entries(AUDIT[lang]).filter(([, c]) => known(lang, c)).map(([k]) => k).sort();
    expect(verified).toEqual([...VERIFIED[lang]].sort());
    // Everything new that the mission uses is met on a card before anything tests it (the strict audit below).
    for (const k of Object.keys(AUDIT[lang]).filter((x) => !verified.includes(x) && !['train', 'three days', 'hotel'].includes(x))) {
      const c = AUDIT[lang][k]!.split('#')[0]!.replace(/^¡|^¿/, '');
      expect(cardsOf(day(lang)).some((w) => hasChunk(w.text, c)), `${lang} ${k}`).toBe(true);
    }
  });
  it('SAME FORM ≠ SAME MEANING — "miss" / "manquer" were only "you can\'t miss it" (Mission 05): "we\'ll miss you" is NEW; "next" is prior in its own sense', () => {
    expect(WORD_SENSES.en!.miss!.map((s) => s.sense)).toEqual(['not-notice', 'feel-absence']);
    expect(WORD_SENSES.fr!.manquer!.map((s) => s.sense)).toEqual(['not-notice', 'feel-absence']);
    expect(prior('en').words.has('miss#not-notice')).toBe(true);
    expect(prior('en').words.has('miss#feel-absence')).toBe(false);
    expect(prior('fr').words.has('manquer#not-notice')).toBe(true);
    expect(prior('fr').words.has('manquer#feel-absence')).toBe(false);
    expect(senseWords("Already! We'll miss you.", 'en')).toContain('miss#feel-absence');
    // "next" (what comes after) is prior from Mission 06 "Next, please" and Mission 19 "your stop is next" — not only Mission 05's "next to".
    expect(['next, please', 'your stop is next'].every((c) => learnedBefore('en', 21).knowsChunk(c))).toBe(true);
    // ES "Bueno," (so / well) is not Mission 11's "bueno" (good) — the card teaches it; it is covered here, not assumed.
    expect(coverageOf(day('es'), 'es', M21_CONCEPTS).find((r) => r.id === 'so')!.covered).toBe(true);
  });
  it('NEW everywhere — Vietnam, Hanoi, the motorbike, Thailand, the airport, "after that", "be careful", "we\'ll miss you" — so they are taught here, on whole lines', () => {
    const NEW: Record<CoverageLang, string[]> = {
      en: ['vietnam', 'hanoi', 'motorbike', 'thailand', 'airport', 'careful', 'already', 'wow', 'sounds', 'amazing', 'plan'],
      es: ['vietnam', 'hanói', 'moto', 'tailandia', 'aeropuerto', 'cuidado', 'visitar', 'viajar', 'vas', 'estar', 'echar', 'menos', 'guau', 'suena', 'increíble', 'plan'],
      fr: ['vietnam', 'hanoï', 'moto', 'thaïlande', 'aéroport', 'attention', 'visiter', 'voyager', 'vas', 'rester', 'déjà', 'waouh', 'génial', 'programme'],
    };
    for (const lang of LANGS) for (const w of NEW[lang]) expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(false);
  });
  it('20. "I want to ___" is VERIFIED PRIOR (Mission 16: "I want to try diving") — shown as a known tool in a new place, not re-taught', () => {
    for (const lang of LANGS) {
      const want = M21_CONCEPTS.find((c) => c.id === 'want-to')!.chunk[lang];
      expect(prior(lang).knowsChunk(want), lang).toBe(true);
      expect(prior(lang).concepts.filter((c) => hasChunk(c.chunk, want)).map((c) => c.mission), lang).toContain(16);
      const card = cardsOf(day(lang)).find((w) => w.key === 'future.line.visit')!;
      expect(card.meaning.en, lang).toContain('you know it already: “I want to try diving”');
      expect(stepsOf(day(lang), 'prime').filter((p) => p.words.some((w) => /^(I want to|Quiero|Je veux)\b/.test(w.text))).length, lang).toBe(2); // the two lines of the conversation, no "want" lesson
    }
  });
  it('18. "I\'m going to ___" is VERIFIED PRIOR (Missions 12–13) — and the Vietnam line is on a card before it is first retrieved', () => {
    for (const lang of LANGS) {
      const going = M21_CONCEPTS.find((c) => c.id === 'going-to')!.chunk[lang];
      expect(prior(lang).knowsChunk(going), lang).toBe(true);
      expect([...new Set(prior(lang).concepts.filter((c) => hasChunk(c.chunk, going)).map((c) => c.mission))].sort((a, b) => a - b).slice(0, 2), lang).toEqual([12, 13]);
    }
  });
  it('30. ANOTHER TRIP — every changed detail is VERIFIED PRIOR in every language, taught in an earlier mission (Argentina · a week · the museum · diving · the beach · the station)', () => {
    const DETAIL: Record<CoverageLang, string[]> = { en: ['argentina', 'week', 'museum', 'diving', 'beach', 'station'], es: ['argentina', 'semana', 'museo', 'buceo', 'playa', 'estación'], fr: ['argentine', 'semaine', 'musée', 'plongée', 'plage', 'gare'] };
    const FROM = [20, 6, 19, 16, 12, 5];
    for (const lang of LANGS) DETAIL[lang].forEach((w, i) => {
      expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(true);
      const taughtIn = Array.from({ length: 20 }, (_, m) => m + 1).filter((m) => teachingEncounters(missionContent(lang, m)).some((e) => plain(e.text).split(' ').includes(w)));
      expect(taughtIn, `${lang} ${w}`).toContain(FROM[i]);
      // …and it is the one new detail of exactly one final answer
      expect(Object.values(FINAL_SAID).filter((line) => plain(line[IX[lang]]).split(' ').includes(w)), `${lang} ${w}`).toHaveLength(1);
    });
    // "a week" — "a" and Mission 06's "week" card; "the train" is NOT used: English met it only as "The train's right here".
    expect(prior('en').words.has('train')).toBe(false);
    for (const lang of LANGS) for (const line of Object.values(FINAL_SAID)) expect(plain(line[IX[lang]]), lang).not.toMatch(/\btrain\b|\btren\b/);
  });
  it('31. optional and transfer content never creates false prior: a skippable miss of this conversation, the final\'s other trip', () => {
    for (const lang of LANGS) {
      const noMiss = (l: CoverageLang, n: number): BootcampDayContent => {
        const d = missionContent(l, n);
        if (n !== 21) return d;
        const t = scene(d);
        return { ...d, dialogues: { 'where-next': { ...t, nodes: t.nodes.filter((x) => !/^m\d+$/.test(x.id)).map((x) => ({ ...x, choices: x.choices?.filter((c) => c.correct) })) } } };
      };
      const a = learnedBefore(lang, 22);
      const b = learnedBefore(lang, 22, noMiss);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      // The final is a test, never teaching: "I'm going to Argentina" is not a chunk anyone has learned.
      for (const id of [GOING, BE_THERE, AFTER, TOMORROW] as const) expect(a.knowsChunk(FINAL_SAID[id][IX[lang]]), `${lang} ${id}`).toBe(false);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M21_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`33. STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior (with its meaning); every new chunk taught before it is tested (wrong options included)`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a card fails the audit (where · how long · be there · what · visit · else · motorbike · after · tomorrow · miss · ask-back · the friend\'s plan)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      const cases: [string, string][] = [['future.line.where', 'where-going-next'], ['future.line.how-long', 'how-long'], ['future.line.be-there', 'be-there-for'], ['future.line.what-do', 'what-want-to-do'],
        ['future.line.visit', 'hanoi'], ['future.line.after', 'and-after-that'], ['future.line.after-that', 'thailand'], ['future.line.tomorrow', 'what-doing-tomorrow'], ['future.line.tomorrow-airport', 'airport'],
        ['future.line.miss', 'miss-you'], ...(lang === 'en' ? [['future.line.end', 'great-trip'] as [string, string]] : [])];
      for (const [key, id] of cases) expect(`${unprepared(without(key), lang).join(' ')} ${unpreparedWords(without(key), prior(lang).words, lang).join(' ')}`, `${lang} ${key}`).toMatch(new RegExp(`${id}|“`));
    }
    // The friend's ending is VERIFIED PRIOR whole in Spanish and French ("¿Yo? Me voy a casa. ¡Buen viaje!" — Missions 13, 07;
    // "Moi ? Je rentre chez moi. Bon voyage !" — Missions 13, 07): its card is context there, not a gap. English
    // "Have a great trip!" is new — the card teaches it.
    for (const lang of ['es', 'fr'] as const) for (const id of ['me', 'going-home', 'great-trip']) expect(prior(lang).knowsChunk(M21_CONCEPTS.find((c) => c.id === id)!.chunk[lang]), `${lang} ${id}`).toBe(true);
    expect(prior('en').knowsChunk(M21_CONCEPTS.find((c) => c.id === 'great-trip')!.chunk.en)).toBe(false);
  });
});

describe('production — four tools, taught whole, then retrieved', () => {
  it('6. exactly four core production tools: I\'m going to ___ · I\'ll be there for ___ · I want to ___ · Where are you going next?', () => {
    expect([...TOOLS]).toEqual(['phrase.future.going-to-vietnam', 'phrase.future.ill-be-there', 'phrase.future.want-to-visit', 'phrase.future.where-next']);
    for (const lang of LANGS) {
      const d = day(lang);
      for (const id of TOOLS) expect(text(d, `${lang}.${id}`), `${lang} ${id}`).toBeTruthy();
      expect(text(d, `${lang}.${BACK}`), lang).toBe(STANDALONE[lang]);
      // No Help is exactly these four — nothing else is a "tool".
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d)).find((s) => s.kind === 'quickReply') as QR;
      expect(run.rounds.map(accepted), lang).toEqual([...TOOLS]);
    }
  });
  it('18–21. each tool is taught WHOLE on a card (with its meaning) before it is first retrieved — and retrieved in teaching and No Help', () => {
    const cardOf: Record<string, string> = { [GOING]: 'future.line.going', [BE_THERE]: 'future.line.be-there', [VISIT]: 'future.line.visit', [BACK]: 'future.line.back' };
    for (const lang of LANGS) {
      const d = day(lang);
      const rounds = quickRounds(d);
      for (const id of TOOLS) {
        const first = rounds.find(([, r]) => accepted(r) === id)![0];
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeGreaterThan(-1);
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeLessThan(first);
        expect(cardsOf(d).find((w) => w.key === cardOf[id])!.text, `${lang} ${id}`).toBe(SAID[id]![IX[lang]]);
        const where = new Set(rounds.filter(([, r]) => accepted(r) === id).map(([i]) => phaseOf(d, i)));
        expect(where.has('teaching') && where.has('no help'), `${lang} ${id}`).toBe(true);
      }
      // Every card is a whole line of this conversation — no word card, no deck.
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(d)) { expect(w.line, `${lang} ${w.key}`).toBe(true); expect(lines, `${lang} ${w.key}`).toContain(w.text); }
      expect(cardsOf(d), lang).toHaveLength(15); // the fifteen lines of the conversation, once each
    }
  });
  it('32. every option anywhere is one of the learner\'s own lines said whole — the fourth tool asked ALONE, or, in the final, the same line with the final\'s details; a friend\'s line is never an answer', () => {
    const FRIEND = LOCKED.en.filter((l) => l.startsWith('NPC: ')).map((l) => l.slice(5));
    for (const lang of LANGS) {
      const d = day(lang);
      const allowed = [...LEARNER.filter((id) => id !== BACK).map((id) => at(SAID[id]!, lang)), STANDALONE[lang], ...Object.values(FINAL_SAID).map((x) => x[IX[lang]])];
      for (const [, r] of quickRounds(d)) for (const o of r.options) expect(allowed, `${lang} ${said(d, o)}`).toContain(said(d, o));
      if (lang === 'en') for (const [, r] of quickRounds(d)) for (const o of r.options) expect(FRIEND).not.toContain(said(d, o));
      // the long ask-back line is never an option outside the conversation
      for (const [, r] of quickRounds(d)) for (const o of r.options) expect(said(d, o), lang).not.toBe(at(Y_BACK, lang));
    }
  });
  it('wrong options fit the conversation: plausible, already learned — and never a better answer than the right one', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [i, r] of quickRounds(d)) {
        const ok = accepted(r);
        const wrong = r.options.filter((o) => !o.correct).map((o) => strip(o.itemId));
        expect(wrong, `${lang} step ${i}`).not.toContain(ok); // never the same tool twice
        // Only the ask-back is a question — a wrong option is never a second way to turn the chat back.
        for (const o of r.options.filter((x) => !x.correct)) expect(said(d, o), `${lang} step ${i}`).not.toMatch(/\?\s*$/);
        // "And after that?" / "tomorrow morning?" / "how long?": exactly one option carries the asked-for part.
        const marker = ok === AFTER ? /after that|después de eso|après ça/i : ok === TOMORROW ? /tomorrow morning|mañana por la mañana|demain matin/i : ok === BE_THERE ? /be there for|estar allí|rester/i : null;
        if (marker) expect(r.options.filter((o) => marker.test(said(d, o))).length, `${lang} step ${i}`).toBe(1);
        // "Anything else?": the other "I want to" option is the one already said — "else" means not the same thing.
        if (ok === MOTO) expect(wrong, `${lang} step ${i}`).toContain(VISIT);
        // "What are you doing tomorrow morning?" is NOT "what do you want to do": the activity is a wrong option there.
        if (ok === TOMORROW) expect(wrong, `${lang} step ${i}`).toEqual(expect.arrayContaining([AFTER, VISIT]));
      }
    }
  });
  it('sentences: the seven learner lines and the friend\'s seven answered lines — the alternatives and the short questions archived, the help phrase no longer bundled', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.future.after-that', 'phrase.future.by-motorbike', 'phrase.future.going-to-vietnam', 'phrase.future.ill-be-there', 'phrase.future.tomorrow-morning', 'phrase.future.want-to-visit', 'phrase.future.where-next',
        'reply.future.after-that-q', 'reply.future.anything-else', 'reply.future.miss-you', 'reply.future.tomorrow-plan-q', 'reply.future.what-do-there', 'reply.future.where-next', 'reply.future.wow-how-long',
      ]);
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'future-plans').map((r) => strip(r.id)), lang).toEqual([
        'phrase.future.want-to-try-food', 'phrase.future.ride-horses', 'reply.future.how-long', 'reply.future.and-after', 'reply.future.tomorrow-morning-q', 'reply.future.be-careful', 'reply.future.great-trip',
      ]);
      const live = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => i.id)));
      for (const r of RETIRED_SENTENCES[lang].filter((x) => x.retiredFrom === 'future-plans')) expect(live.has(r.id), `${lang} ${r.id}`).toBe(false);
      // the friend's answered lines are the whole lines of the conversation
      for (const id of ['reply.future.where-next', 'reply.future.wow-how-long', 'reply.future.miss-you']) expect(LOCKED[lang].map((l) => l.slice(5)), `${lang} ${id}`).toContain(text(d, `${lang}.${id}`));
    }
  });
});

describe('the opening — the brief\'s two lines, then the learner\'s own plan (12)', () => {
  it('"יש לך תוכנית להמשך הטיול. ספר עליה לחבר." — no tense, no grammar, nothing the friend will say', () => {
    for (const lang of LANGS) {
      const b = day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      expect(b.kind).toBe('talk');
      expect(b.body.map((x) => x.he).join('\n')).toBe('יש לך תוכנית להמשך הטיול.\nספר עליה לחבר.');
      expect(b.title.en).toBe('Mission 21: Future Travel & Plans');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      expect(JSON.stringify(b), lang).not.toMatch(/\bhome\b|casa|chez moi|הביתה|miss you|great trip|future tense|זמן עתיד|grammar/i);
    }
  });
  it('11–12. MY NEXT TRIP is the learner\'s own plan — all six parts, shown from the opening (that is not an information gap)', () => {
    expect(splitTimeBoard(myNextTrip(0)[1])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['📍 Next → Vietnam', '⏳ For → Two weeks', '🎯 Want to → Visit Hanoi', '🏍️ Also → Travel by motorbike', '➡️ After → Thailand', '🌅 Tomorrow morning → Airport']);
    expect(splitTimeBoard(myNextTrip(0)[1])!.plan!.map((c) => c.day)).toEqual(['✈️ My next trip', '🗓️ When']);
    expect(splitTimeBoard(myNextTrip(0)[0])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['📍 הבא → וייטנאם', '⏳ לכמה זמן → שבועיים', '🎯 רוצה → לבקר בהאנוי', '🏍️ וגם → לטייל באופנוע', '➡️ אחרי זה → תאילנד', '🌅 מחר בבוקר → שדה התעופה']);
    for (const lang of LANGS) {
      const d = day(lang);
      const first = d.steps[1] as Extract<BootcampStep, { kind: 'prime' }>;
      expect(first.kind, lang).toBe('prime');
      expect(first.intro!.en, lang).toContain(myNextTrip(0)[1]);
      expect(first.intro!.he, lang).toContain(myNextTrip(0)[0]);
      // every row is known (no "?"): the plan is the learner's, not a reveal
      expect(splitTimeBoard(first.intro!.en!)!.plan!.flatMap((c) => c.rows).every((r) => r.known), lang).toBe(true);
    }
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${myNextTrip(0)[1]} ¦ Go` }));
    expect(html).toMatch(/plan-card/);
    expect(html.match(/data-known="true"/g)).toHaveLength(6);
  });
  it('the plan is ticked ✓ part by part, only after the learner has said it — never un-ticked', () => {
    const ticked = (n: PlanStage) => splitTimeBoard(myNextTrip(n)[1])!.plan!.flatMap((c) => c.rows).filter((r) => r.text.endsWith(' ✓')).length;
    expect(PLAN_PARTS.map((_, i) => ticked((i + 1) as PlanStage))).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ticked(0)).toBe(0);
    expect(M21_STAGES).toEqual(['nothing', 'next', 'for', 'want', 'also', 'after', 'tomorrow']);
    for (const lang of LANGS) {
      const d = day(lang);
      const seen = d.steps.map((s) => boardText(s)[1] ?? '').map((t) => (t.includes('✈️ My next trip:') ? (t.match(/ ✓/g) ?? []).length : null)).filter((n): n is number => n !== null);
      expect(seen, lang).toEqual([...seen].sort((a, b) => a - b));
      expect(seen[0], lang).toBe(0);
      // the tick for "next" and "for" comes only after the two are answered
      const answered = d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => strip(r.promptItemId) === 'reply.future.wow-how-long'));
      for (const s of d.steps.slice(0, answered + 1)) expect(boardText(s)[1] ?? '', lang).not.toMatch(/ ✓/);
    }
  });
  it('13. the FRIEND\'s plan is never shown before it is heard — no "home", no "we\'ll miss you", no "have a great trip" before its card (artwork counts as information)', () => {
    const FACTS: [string, RegExp][] = [
      ['future.line.end', /home|🏠|casa|chez moi|הביתה|בית|going home/i],
      ['future.line.end', /great trip|buen viaje|bon voyage|נסיעה טובה/i],
      ['future.line.miss', /miss you|echar de menos|nous manquer|נתגעגע|Already!|Déjà !|¡Ya!|כבר!/],
    ];
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [card, fact] of FACTS) for (const s of d.steps.slice(0, primeAt(d, card))) expect(JSON.stringify(s), `${lang} ${card}`).not.toMatch(fact);
      // the friend's tiles are on one board only, after the friend's card
      expect(d.steps.findIndex(isFriend), lang).toBeGreaterThan(primeAt(d, 'future.line.end'));
      expect(d.steps.filter(isFriend), lang).toHaveLength(1);
    }
  });
});

describe('THE FRIEND\'S QUESTIONS — which part of your plan? (14–17)', () => {
  it('14 · 17. a question is played and the learner taps the part of the plan it asks about — "Where are you going next?" → 📍, "What are you doing tomorrow morning?" → 🌅 (not 🎯)', () => {
    expect(PLAN_TILES.map((t) => [t.id, t.emoji, t.caption!.en])).toEqual([['next', '📍', 'Where you are going'], ['for', '⏳', 'How long'], ['want', '🎯', 'What you want to do'], ['after', '➡️', 'What comes after'], ['tomorrow', '🌅', 'Tomorrow morning']]);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.filter(isWhich).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_WHERE, lang), 'next'], [at(N_TOMORROW, lang), 'tomorrow']]);
      for (const s of d.steps.filter(isWhich)) { expect(s.ordered, lang).toBeUndefined(); expect(s.quiet, lang).toBe(true); }
    }
    // The tiles name the KIND of information (app language) — never a target-language answer.
    for (const t of PLAN_TILES) expect(`${t.caption!.en} ${t.caption!.he}`).not.toMatch(/vietnam|hanoi|motorbike|thailand|airport|two weeks|וייטנאם|האנוי|אופנוע|תאילנד|שדה התעופה|שבועיים/i);
  });
  it('15 · 16 · 17. the other questions are understood by answering them: how long → the duration, what do you want to do → the activity, tomorrow morning → the plan for then', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const teach = quickRounds(d, 0, dialogueAt(d)).map(([, r]) => [strip(r.promptItemId), accepted(r)]);
      expect(teach, lang).toEqual([['reply.future.where-next', GOING], ['reply.future.wow-how-long', BE_THERE], ['reply.future.what-do-there', VISIT], ['reply.future.anything-else', MOTO],
        ['reply.future.after-that-q', AFTER], ['reply.future.tomorrow-plan-q', TOMORROW], ['reply.future.miss-you', BACK]]);
      // the duration question is answered against the destination; the activity against the duration and destination
      const round = (id: string) => quickRounds(d, 0, dialogueAt(d)).find(([, r]) => strip(r.promptItemId) === id)![1];
      expect(round('reply.future.wow-how-long').options.filter((o) => !o.correct).map((o) => strip(o.itemId)), lang).toEqual([GOING]);
      expect(round('reply.future.what-do-there').options.filter((o) => !o.correct).map((o) => strip(o.itemId)), lang).toEqual([BE_THERE, GOING]);
      expect(heardIn(d, round('reply.future.wow-how-long')), lang).toBe(at(N_HOW_LONG, lang));
    }
  });
  it('the companion introduces the first board as the plan — never "the future"', () => {
    const d = day('en');
    expect(coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[20]!.id)!.line.en).toBe('Listen — and tap which part of your plan they ask about.');
  });
});

describe('the reuse lines — the same tools, never tools of their own (24–26)', () => {
  it('24. "After that" is a sequencing cue on ONE card — "after that + I\'m going to ___" — never a lesson, never in No Help', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => w.text === at(Y_AFTER, lang)).map((w) => w.key), lang).toEqual(['future.line.after-that']);
      expect(cardsOf(d).find((w) => w.key === 'future.line.after-that')!.meaning.en).toContain('(after that + I’m going to ___)');
      expect(quickRounds(d).filter(([, r]) => accepted(r) === AFTER).map(([i]) => phaseOf(d, i)), lang).toEqual(['teaching', 'final']);
      expect(hasChunk(at(Y_AFTER, lang), M21_CONCEPTS.find((c) => c.id === 'going-to')!.chunk[lang]), lang).toBe(true); // the destination tool, reused
    }
  });
  it('25. "Tomorrow morning" reuses the destination tool — "tomorrow morning + I\'m going to ___" (Mission 12\'s own frame) — no time or calendar lesson', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const going = M21_CONCEPTS.find((c) => c.id === 'going-to')!.chunk[lang];
      // EN / FR say the tool word for word; Spanish contracts it before "el" (voy al aeropuerto · voy a la estación)
      expect(plain(at(Y_TOMORROW, lang)), lang).toMatch(new RegExp(`${plain(going).trim().split(' ')[0]}`));
      expect(plain(FINAL_SAID[TOMORROW][IX[lang]]), lang).toMatch(new RegExp(plain(going).trim()));
      expect(cardsOf(d).find((w) => w.key === 'future.line.tomorrow-airport')!.meaning.en).toContain('(tomorrow morning + I’m going to ___)');
      expect(learnedBefore(lang, 21).knowsChunk(M21_CONCEPTS.find((c) => c.id === 'tomorrow-morning')!.chunk[lang]), lang).toBe(true);
      for (const t of speakable(d)) expect(t, lang).not.toMatch(/monday|tuesday|weekend|afternoon|evening|tonight|next week|next month|lundi|après-midi|ce soir|lunes|tarde|esta noche/i);
    }
  });
  it('"I want to travel by motorbike" is the "I want to" tool again ("Anything else?") — one card, one answer, never No Help', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(quickRounds(d).filter(([, r]) => accepted(r) === MOTO).map(([i]) => phaseOf(d, i)), lang).toEqual(['teaching', 'final']);
      expect(cardsOf(d).find((w) => w.key === 'future.line.motorbike')!.meaning.en).toContain('the same “I want to ___” — another plan');
    }
  });
  it('26. the friend\'s ending ("Me? I\'m going home. Have a great trip!") is comprehension ONLY: one card, one board, the conversation — never said, never a prompt', () => {
    expect(FRIEND_TILES.map((t) => [t.id, t.emoji])).toEqual([['home', '🏠'], ['thailand', '🏝️'], ['airport', '🛫']]);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => w.text === at(N_END, lang)).map((w) => w.key), lang).toEqual(['future.line.end']);
      expect(d.steps.filter(isFriend).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_END, lang), 'home']]);
      for (const [, r] of quickRounds(d)) { expect(heardIn(d, r), lang).not.toBe(at(N_END, lang)); for (const o of r.options) expect(said(d, o), lang).not.toBe(at(N_END, lang)); }
      expect(d.items.some((i) => hasChunk(i.text, M21_CONCEPTS.find((c) => c.id === 'going-home')!.chunk[lang])), lang).toBe(false); // not a sentence to learn
    }
  });
  it('comprehension-only lines get context, never a drill: "Sounds amazing!", "Be careful.", "Already!", "We\'ll miss you.", "Have a great trip!", "Anything else?"', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const id of ['sounds-amazing', 'be-careful', 'already', 'miss-you', 'great-trip', 'anything-else']) {
        const c = M21_CONCEPTS.find((x) => x.id === id)!;
        expect(c.role, id).toBe('hear');
        for (const [, r] of quickRounds(d)) for (const o of r.options) expect(hasChunk(said(d, o), c.chunk[lang]), `${lang} ${id}`).toBe(false);
        expect(cardsOf(d).filter((w) => hasChunk(w.text, c.chunk[lang])).length, `${lang} ${id}`).toBe(1); // inside one whole line, never a word card
      }
    }
  });
});

describe('THE FOURTH TOOL — "Where are you going next?", owned ALONE (the conversation keeps "And you? …") (21–23)', () => {
  const askRounds = (d: BootcampDayContent) => quickRounds(d).filter(([, r]) => accepted(r) === BACK).map(([i, r]) => [phaseOf(d, i), r] as const);
  it('22. the canonical conversation still says "And you? Where are you going next?", exactly — and only there', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const full = LOCKED[lang][13]!.slice(5);
      expect(at(Y_BACK, lang), lang).toBe(full);
      expect(full.startsWith(AND_YOU[lang]), lang).toBe(true);
      const turns = scene(d).nodes.flatMap((n) => (n.choices ?? []).filter((c) => c.correct && c.itemId === `${lang}.${BACK}`));
      expect(turns.length, lang).toBeGreaterThan(0);
      for (const c of turns) expect(c.en, lang).toBe(full);
      const card = cardsOf(d).find((w) => w.key === 'future.line.back')!;
      expect(card.text, lang).toBe(full);
      expect(card.meaning.en, lang).toContain('“Where are you going next?” works with anyone');
      expect(card.meaning.he, lang).toContain('„לאן אתה נוסע אחרי זה?”');
    }
  });
  it('21. the standalone question is taught before it is retrieved — the friend asks it first (the opening card), the ask-back card names it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const first = askRounds(d)[0]!;
      const firstAt = quickRounds(d).find(([, r]) => r === first[1])![0];
      expect(primeAt(d, 'future.line.where'), lang).toBeLessThan(firstAt);
      expect(primeAt(d, 'future.line.back'), lang).toBeLessThan(firstAt);
      expect(hasChunk(at(N_WHERE, lang), STANDALONE[lang]), lang).toBe(true);
    }
  });
  it('23. teaching retrieval and No Help ask for the standalone question — the button says it alone, "And you?" is never required', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(askRounds(d).map(([where]) => where), lang).toEqual(['teaching', 'no help']);
      for (const [where, r] of askRounds(d)) {
        const ok = r.options.find((o) => o.correct)!;
        expect(ok.text, `${lang} ${where}`).toBeUndefined(); // no wrapping line: the sentence itself
        expect(said(d, ok), `${lang} ${where}`).toBe(STANDALONE[lang]);
        expect(said(d, ok), `${lang} ${where}`).not.toContain(AND_YOU[lang]);
        expect(heardIn(d, r), `${lang} ${where}`).toBe(at(N_MISS, lang)); // "Already! We'll miss you." — the moment to ask back
      }
    }
    expect(M21_CONCEPTS.find((c) => c.id === 'and-you')!.role).toBe('hear');
    expect(M21_CONCEPTS.find((c) => c.id === 'where-going-next')!.role).toBe('say');
  });
  it('the teaching round names the move (you told your plan — now ask about theirs)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const [i] = quickRounds(d).find(([, r]) => accepted(r) === BACK)!;
      const [he, en] = boardText(d.steps[i]!);
      expect(en, lang).toContain('You told your plan — now your turn: ask about theirs.');
      expect(he, lang).toContain('סיפרת את התוכנית שלך — עכשיו תורך: שאל על שלו.');
    }
  });
});

describe('NO HELP — exactly the four tools (27)', () => {
  it('27. between the conversation and the video: one speed run of four — where → Vietnam · how long → two weeks · what → Hanoi · ask back; no meaning, no card, no plan', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect(run.map((s) => s.kind), lang).toEqual(['receipt', 'quickReply', 'receipt']);
      const qr = run[1] as QR;
      expect(qr.challenge, lang).toBe(true);
      expect(qr.label, lang).toBeUndefined();
      for (const r of qr.rounds) { expect(r.situation, lang).toBeUndefined(); expect(r.npc, lang).toBeUndefined(); }
      expect(qr.rounds.map((r) => [strip(r.promptItemId), accepted(r)]), lang).toEqual([['reply.future.where-next', GOING], ['reply.future.wow-how-long', BE_THERE], ['reply.future.what-do-there', VISIT], ['reply.future.miss-you', BACK]]);
      for (const r of qr.rounds) for (const o of r.options) expect([...LEARNER.filter((id) => id !== BACK).map((id) => at(SAID[id]!, lang)), STANDALONE[lang]], lang).toContain(said(d, o)); // the canonical lines — no final details
      // "After that …" and "Tomorrow morning …" are not tools: never an answer here
      expect(qr.rounds.map(accepted), lang).not.toContain(AFTER);
      expect(qr.rounds.map(accepted), lang).not.toContain(TOMORROW);
    }
  });
});

describe('THE FINAL — ANOTHER TRIP: the same questions, a new plan (28–30)', () => {
  it('28. after the video: ONE quick reply of six — not the conversation again, and not its lines', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const after = d.steps.slice(videoAt(d) + 1);
      expect(after.map((s) => s.kind), lang).toEqual(['quickReply', 'receipt', 'summary']);
      const qr = after[0] as QR;
      expect(qr.challenge, lang).toBeUndefined();
      expect(qr.rounds.map(accepted), lang).toEqual([GOING, BE_THERE, VISIT, MOTO, AFTER, TOMORROW]);
      expect(qr.rounds.map((r) => strip(r.promptItemId)), lang).toEqual(['reply.future.where-next', 'reply.future.wow-how-long', 'reply.future.what-do-there', 'reply.future.anything-else', 'reply.future.after-that-q', 'reply.future.tomorrow-plan-q']);
      // Not a replay: no option of the final is a line of the conversation.
      for (const r of qr.rounds) for (const o of r.options) expect(LOCKED[lang].map((l) => l.slice(5)), lang).not.toContain(said(d, o));
    }
  });
  it('29. every one of the six answers carries a CHANGED detail: Argentina · a week · the museum · diving · the beach · the station', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const qr = d.steps[videoAt(d) + 1] as QR;
      const changed = qr.rounds.map((r) => r.options.find((o) => o.correct)!).filter((o) => o.text && o.text !== text(d, o.itemId));
      expect(changed.map((o) => o.text), lang).toEqual([GOING, BE_THERE, VISIT, MOTO, AFTER, TOMORROW].map((id) => FINAL_SAID[id as keyof typeof FINAL_SAID][IX[lang]]));
      expect(changed.length, lang).toBeGreaterThanOrEqual(3);
    }
    expect(Object.values(FINAL_SAID).map((x) => x[0])).toEqual(["I'm going to Argentina.", "I'll be there for a week.", 'I want to visit the museum.', 'I want to try diving.', "After that I'm going to the beach.", "Tomorrow morning I'm going to the station."]);
  });
  it('the final\'s trip is the learner\'s own plan, shown whole as UI (deterministic, app language, icons) — the job is to SAY it', () => {
    expect(splitTimeBoard(anotherTrip[1])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['📍 Next → 🌎 Argentina', '⏳ For → A week', '🎯 Want to → 🏛️ Visit the museum', '🤿 Also → Try diving', '➡️ After → 🏖️ The beach', '🌅 Tomorrow morning → 🚉 The station']);
    for (const lang of LANGS) {
      const qr = day(lang).steps[videoAt(day(lang)) + 1] as QR;
      expect(qr.label!.en, lang).toContain(anotherTrip[1]);
      expect(qr.label!.he, lang).toContain(anotherTrip[0]);
    }
  });
  it('no untaught final vocabulary: every word of every final option and line is taught in this mission or verified prior', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(unpreparedWords(d, learnedBefore(lang, 21).words, lang).filter((u) => u.includes(`step ${videoAt(d) + 2} `)), lang).toEqual([]);
    }
  });
});

describe('bloat guards — one conversation, not a grammar class (7–10, 36–39)', () => {
  it('10. INTERACTION BUDGET: 20 meaningful interactions (target 18–20, hard ceiling 20): 10 teaching / comprehension · 4 no help · 6 final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(20);
      expect(interactions(d), lang).toBeLessThanOrEqual(20);
      expect(interactions({ ...d, steps: d.steps.slice(0, dialogueAt(d)) }), lang).toBe(10);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(4);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(6);
    }
  });
  it('7. no grammar lesson: no tense, no "will" vs "going to", no conjugation, no verb word — anywhere the learner reads', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(appCopy(d), lang).not.toMatch(GRAMMAR);
      expect(stepsOf(d, 'tool').length + stepsOf(d, 'replies').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swipe').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'ambush').length + stepsOf(d, 'miniMap').length, lang).toBe(0);
    }
  });
  it('8. no sentence builder', () => {
    for (const lang of LANGS) expect(stepsOf(day(lang), 'sentenceBuilder'), lang).toHaveLength(0);
  });
  it('9. no separate Flex Round (no transfer-only step, no "flex" copy) — and no swap: the reuse lines and the final are the transfer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.some((s) => 'transferOnly' in s && s.transferOnly), lang).toBe(false);
      expect(appCopy(d), lang).not.toMatch(/flex|גמיש|🔁/i);
      expect(stepsOf(d, 'swap'), lang).toHaveLength(0);
    }
  });
  it('36–39. no score, no XP, no streak, no timer — in any label, receipt or the result', () => {
    for (const lang of LANGS) {
      expect(appCopy(day(lang)), lang).not.toMatch(SCOREBOARD);
      expect(appCopy(day(lang)), lang).not.toMatch(/\bXP\b/);
      expect(appCopy(day(lang)), lang).not.toMatch(/streak|רצף/i);
      expect(appCopy(day(lang)), lang).not.toMatch(/timer|seconds|טיימר|שניות/i);
    }
    expect(MY_NEXT_TRIP.join(' ')).not.toMatch(SCOREBOARD);
  });
  it('no vocabulary bloat: no country list, no transport deck, no activity list, no calendar, no extra future forms', () => {
    for (const lang of LANGS) for (const t of speakable(day(lang))) {
      expect(t, lang).not.toMatch(/japan|china|india|laos|cambodia|france|spain|italy|mexico|japón|camboya|españa|italie|italia|méxico|japon|cambodge/i);
      expect(t, lang).not.toMatch(/\bbus\b|taxi|plane|bicycle|\bbike\b|\bcar\b|boat|ferry|avión|avion|bateau|vélo|coche|voiture|barco|autobús|\btren\b|\btrain\b/i);
      expect(t, lang).not.toMatch(/\bwill (go|visit|travel|stay)\b|going to (go|visit|travel|stay)\b|\b(iré|visitaré|viajaré|estaré)\b|\b(irai|visiterai|voyagerai|resterai)\b/i);
      expect(t, lang).not.toMatch(/horses|caballo|cheval|try the food|probar la comida|essayer la cuisine/i);
    }
  });
});

describe('the result — ✈️ MY NEXT TRIP', () => {
  it('the whole plan, told — with the other trip and the friend\'s plan — no score', () => {
    expect(MY_NEXT_TRIP[1]).toBe('✈️ MY NEXT TRIP ¦ ✈️ My next trip: 📍 Next → Vietnam ✓ / ⏳ For → Two weeks ✓ / 🎯 Want to → Visit Hanoi ✓ / 🏍️ Also → Travel by motorbike ✓ ‖ 🗓️ When: ➡️ After → Thailand ✓ / 🌅 Tomorrow morning → Airport ✓ ¦ You told your plan — and another trip — and asked back. 🏠 Your friend? Going home.');
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('MY NEXT TRIP')).map(([, i]) => i), lang).toEqual([d.steps.length - 2]);
      expect(d.steps.at(-1)!.kind, lang).toBe('summary');
    }
  });
});

describe('the supported conversation — once (40), audio never blocks (41)', () => {
  it('40. the conversation runs ONCE, supported (not cold): translations on, every line glossed in Hebrew — after everything is taught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'dialogue'), lang).toHaveLength(1);
      expect(scene(d).cold, lang).toBeUndefined();
      for (const l of cinematicTranscript(scene(d))) { expect(l.he, lang).toBeTruthy(); if (lang !== 'en') expect(l.tr?.en, lang).toBeTruthy(); }
      expect(dialogueAt(d), lang).toBeGreaterThan(primeAt(d, 'future.line.end'));
    }
  });
  afterEach(() => vi.unstubAllGlobals());
  it('41. every answered line of the friend shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBe(14); // seven lines + seven slow re-asks
      for (const n of answered) {
        const calls: string[] = [];
        let finish: (r: SpeakResult) => void = () => undefined;
        runNpcBeat(d, n, { speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); }, go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false });
        expect(calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]);
        finish('ended'); await Promise.resolve();
      }
    }
  });
  it('41. answering mid-line stops the friend\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const q = tts.speak(N_HOW_LONG[0], 'en');
    void tts.speak(Y_BE_THERE[0], 'en');
    expect(await q).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_BE_THERE[0]);
    tts.cancelSpeech();
  });
  it('the miss is asked again SLOWLY — a real beat of the conversation (first wrong answer → the friend repeats slowly)', () => {
    for (const lang of LANGS) expect(scene(day(lang)).nodes.filter((n) => n.slow).map((n) => n.id), lang).toEqual(['m2', 'm4', 'm6', 'm8', 'm10', 'm12', 'm14']);
  });
});

describe('serialisable state (42)', () => {
  it('the plan state serialises, and restoring it never un-ticks a part', () => {
    for (let n = 0; n <= 6; n++) {
      const s = JSON.parse(JSON.stringify(nextTripState(n as PlanStage))) as ReturnType<typeof nextTripState>;
      expect(s).toEqual(nextTripState(n as PlanStage));
      expect(PLAN_PARTS.map((p) => s.told[p])).toEqual(PLAN_PARTS.map((_, i) => i < n));
    }
    expect(nextTripState(6)).toEqual({ phase: 'tomorrow', plan: { next: 'vietnam', for: 'two-weeks', want: 'visit-hanoi', also: 'travel-by-motorbike', after: 'thailand', tomorrow: 'airport' }, told: { next: true, for: true, want: true, also: true, after: true, tomorrow: true } });
    expect(JSON.stringify(nextTripState(6))).not.toMatch(/home/); // the friend's plan is not the learner's state
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for (34)', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M21_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M21_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`34. ${lang}: EVERY chunk is covered here — the prior ones too (used, never re-taught as a lesson)`, () => {
    const rows = coverageOf(day(lang), lang, M21_CONCEPTS);
    for (const row of rows) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    for (const id of ['where-going-next', 'going-to', 'be-there-for', 'want-to', 'vietnam', 'hanoi', 'after-that', 'tomorrow-morning']) expect(M21_CONCEPTS.find((c) => c.id === id)!.role, id).toBe('say');
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
      'prime', 'visualMatch', // where are you going next? → 📍
      'prime', 'quickReply', // how long? · answer both
      'prime', 'quickReply', // what do you want to do there?
      'prime', 'quickReply', // anything else? — the same tool, another plan
      'prime', 'quickReply', // and after that?
      'prime', 'visualMatch', 'quickReply', // what are you doing tomorrow morning? → 🌅
      'prime', 'quickReply', // already! — ask back
      'prime', 'visualMatch', 'receipt', // the friend's plan
      'dialogue', 'receipt',
      'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'receipt', 'summary',
    ]);
  });
  it('visual slots: artwork pending (Astra pass) — semantic emoji only, and the plan stays deterministic UI', () => {
    expect(Object.keys(M21_SLOTS)).toEqual(['chat', 'destination', 'hanoi', 'motorbike', 'airport', 'friend-home']);
    expect(Object.keys(M21_PROPS)).toEqual(['next-trip']);
    for (const slot of [...Object.values(M21_SLOTS), ...Object.values(M21_PROPS)]) { expect(slot.emoji).toBeTruthy(); expect(slot.image).toBeUndefined(); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION21_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED IN ASTRA PASS/);
    for (const key of [...Object.keys(M21_SLOTS), ...Object.keys(M21_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language — the friend\'s home only on the friend\'s card', () => {
    const looks = new Set(Object.values(M21_SLOTS).map((s) => s.image ?? s.emoji));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    expect(pics('en').filter(([, p]) => p === M21_SLOTS['friend-home'].emoji).map(([k]) => k)).toEqual(['future.line.end']);
  });
  it('video: the standard resolver ({lang}_21.mp4) — no Mission 21 file in any language today, so the step is safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[20]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_21.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});

describe('the semantic models stay consistent', () => {
  it('Y_GOING and Y_VISIT are the canonical answers to the first two of the friend\'s questions', () => {
    for (const lang of LANGS) {
      expect(LOCKED[lang][1]!.slice(5), lang).toBe(at(Y_GOING, lang));
      expect(LOCKED[lang][5]!.slice(5), lang).toBe(at(Y_VISIT, lang));
    }
  });
});
