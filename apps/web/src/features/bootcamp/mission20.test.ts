import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitTimeBoard } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { coachFor } from '../companion/companionCoach.js';
import { answersFollow, runNpcBeat } from './dialogueBeat.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M20_CONCEPTS } from './mission20Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  FINAL_SAID, FRIEND_TILES, HOW_TILES, M20_PROPS, M20_SLOTS, M20_STAGES, N_END, N_GOOD, N_GOOD_FINAL, N_STAY, N_WHERE, SAID, STORY_TILES, TOOLS, TRANSFER,
  YESTERDAY_STORY, Y_BACK, Y_GREAT, Y_STAYED, anotherDayStory, yesterdayState, yesterdayStory, type StoryStage,
} from './practicePast.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, teachingEncounters, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 20 — Past & Recent Events: TELL YOUR YESTERDAY. The conversation is LOCKED. Four production tools
 * (I went to ___ · I saw ___ · I ate ___ · What did you do yesterday?), the friend's questions as comprehension
 * (which part of your story is asked about?), a Yesterday Story that fills only once a line has said it, and a
 * final that is ANOTHER day — the same questions with new, verified-prior details. No grammar, ever.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 20): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const scene = (d: BootcampDayContent) => d.dialogues['what-did-you-do']!;
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
const isWhich = boardOf(STORY_TILES);
const isHow = boardOf(HOW_TILES);
const isFriend = boardOf(FRIEND_TILES);
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);
const quickRounds = (d: BootcampDayContent, from = 0, to = d.steps.length) => d.steps.slice(from, to).flatMap((s, i) => (s.kind === 'quickReply' ? s.rounds.map((r) => [from + i, r] as const) : []));

/** The conversation exactly as the brief froze it (pasted verbatim) — compared EXACTLY, no normalisation. */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hey! Where were you yesterday?', 'YOU: I went to the old town.', 'NPC: Nice! What did you see?', 'YOU: I saw the market.', 'NPC: Did you eat there?', 'YOU: Yes, I ate fish.',
    'NPC: Did you like it?', 'YOU: Yes, it was great!', 'NPC: You were in Argentina last month, right? Where did you stay?', 'YOU: I stayed in a hostel.',
    'NPC: A hostel! Was it good?', 'YOU: It was good. And you? What did you do yesterday?', 'NPC: Me? Nothing! I was tired. I slept all day.'],
  es: ['NPC: ¡Hola! ¿Dónde estuviste ayer?', 'YOU: Fui al casco antiguo.', 'NPC: ¡Qué bien! ¿Qué viste?', 'YOU: Vi el mercado.', 'NPC: ¿Comiste allí?', 'YOU: Sí, comí pescado.',
    'NPC: ¿Te gustó?', 'YOU: ¡Sí, estuvo genial!', 'NPC: Estuviste en Argentina el mes pasado, ¿no? ¿Dónde te quedaste?', 'YOU: Me quedé en un hostal.',
    'NPC: ¡Un hostal! ¿Estuvo bien?', 'YOU: Estuvo bien. ¿Y tú? ¿Qué hiciste ayer?', 'NPC: ¿Yo? ¡Nada! Estaba cansado. Dormí todo el día.'],
  fr: ['NPC: Salut ! Tu étais où hier ?', 'YOU: Je suis allé dans la vieille ville.', 'NPC: Sympa ! Tu as vu quoi ?', 'YOU: J’ai vu le marché.', 'NPC: Tu as mangé là-bas ?', 'YOU: Oui, j’ai mangé du poisson.',
    'NPC: Tu as aimé ?', 'YOU: Oui, c’était super !', 'NPC: Tu étais en Argentine le mois dernier, non ? Tu as logé où ?', 'YOU: J’ai logé dans une auberge.',
    'NPC: Une auberge ! C’était bien ?', 'YOU: C’était bien. Et toi ? Tu as fait quoi hier ?', 'NPC: Moi ? Rien ! J’étais fatigué. J’ai dormi toute la journée.'],
};
/** The brief's Hebrew support meaning, line by line. */
const HEBREW = ['היי! איפה היית אתמול?', 'הלכתי לעיר העתיקה.', 'יפה! מה ראית?', 'ראיתי את השוק.', 'אכלת שם?', 'כן, אכלתי דג.', 'אהבת?', 'כן, היה מעולה!',
  'היית בארגנטינה בחודש שעבר, נכון? איפה התארחת?', 'התארחתי בהוסטל.', 'הוסטל! היה טוב?', 'היה טוב. ואתה? מה עשית אתמול?', 'אני? כלום! הייתי עייף. ישנתי כל היום.'];
/** Canonical transcript ([who, text], exact) — the same value before this pass and after. */
const TRANSCRIPT_PRINT = { en: 'bec6b3d7', es: '47fcff12', fr: '743dd1f1' };
/** The dialogue TREE — changed on purpose: one wrong line per turn, asked again slowly; no alternative answer, no recovery branch. */
const DIALOGUE_PRINT = { en: '8e00afc9', es: '5c790f54', fr: 'a0a99108' };
const [WENT, SAW, ATE, BACK] = TOOLS;
const GREAT = 'phrase.past.it-was-great';
const STAYED = 'phrase.past.i-stayed';
const LEARNER = [WENT, SAW, ATE, GREAT, STAYED, BACK];
/** The fourth tool on its own — the reusable question, exactly (the brief's target-language forms). */
const STANDALONE: Record<CoverageLang, string> = { en: 'What did you do yesterday?', es: '¿Qué hiciste ayer?', fr: 'Tu as fait quoi hier ?' };
/** The locked line's lead-in — part of the conversation, never required on its own outside it. */
const LEAD_IN: Record<CoverageLang, string[]> = { en: ['It was good', 'And you?'], es: ['Estuvo bien', '¿Y tú?'], fr: ['C’était bien', 'Et toi ?'] };
/** Grammar the mission must never show (EN / HE): tense names, verb lists, "did", was / were tables, conjugation. */
const GRAMMAR = /grammar|tense|past simple|simple past|conjugat|infinitive|irregular|regular verb|\bverbs?\b|participle|\bdid\b \+|go → went|see → saw|eat → ate|stay → stayed|was \/ were|דקדוק|זמן עבר|פועל|פעלים|נטייה|הטיה/i;
const SCOREBOARD = /score|points|\bXP\b|streak|timer|seconds|%|\d+\s*\/\s*\d+|ניקוד|נקודות|רצף|טיימר|שניות/i;

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
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(heardIn(d, r), ...r.options.map((o) => said(d, o)));
    if (s.kind === 'visualMatch') for (const r of s.rounds) out.push(r.audio.en);
    if (s.kind === 'swap') for (const r of s.rounds) out.push(...r.options.map((o) => r.frame.replace('___', o.slot)));
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
  }
  return out.filter(Boolean);
}
/** All app-language copy of the mission (labels, intros, meanings, receipts, captions, cues). */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    out.push(...boardText(s));
    if (s.kind === 'talk') for (const b of [s.title, ...s.body, s.cta]) out.push(b?.he ?? '', b?.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.label ?? '', t.caption?.he ?? '', t.caption?.en ?? '');
    if (s.kind === 'swap') for (const r of s.rounds) out.push(r.cue.text.he ?? '', r.cue.text.en ?? '', ...r.options.map((o) => `${o.meaning.he} ${o.meaning.en}`));
  }
  return out.join(' | ');
}

describe('the conversation is locked, and Mission 20 is in its place', () => {
  for (const lang of LANGS) it(`${lang === 'en' ? 1 : lang === 'es' ? 2 : 3}. ${lang}: the brief's canonical dialogue, word for word — EXACT (no normalisation)`, () => {
    expect(script(lang)).toEqual(LOCKED[lang]);
  });
  it('the canonical transcript is byte-identical to the pre-pass one (target text unchanged) — and the Hebrew support is the brief\'s', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
    for (const lang of LANGS) expect(cinematicTranscript(scene(day(lang))).map((l) => l.he), lang).toEqual(HEBREW);
  });
  it('4. all six canonical learner turns remain exact — and they are the only lines the learner says in the conversation', () => {
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
      expect(JSON.stringify(nodes), lang).not.toMatch(/recovery\.|it-was-bad/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('5. Mission 20 is "Past & Recent Events", twentieth on the journey (registry key 34) — a normal mission', () => {
    expect(BOOTCAMP_PLAN[19]!.id).toBe('past-events');
    expect(BOOTCAMP_PLAN[19]!.day).toBe(34);
    expect(missionNumber(34)).toBe(20);
    expect(BOOTCAMP_PLAN[19]!.video).toBeUndefined(); // the standard video resolver
    expect(BOOTCAMP_PLAN[19]!.checkpoint).toBeUndefined();
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Past & Recent Events');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('40. Missions 01–19 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 19)).toEqual({ en: '0d9746e5', es: '81799872', fr: '6a27eb52' }); });
  it('Missions 23–30 are byte-for-byte unchanged (Missions 21 and 22 have their own passes since: mission21.test.ts, mission22.test.ts) — Mission 24 included: the four sentences later missions reuse keep their id and wording (all four languages)', () => {
    expect(raw(22)).toEqual({ en: 'c136fa2c', es: '1abda9c1', fr: '9332620b' });
    for (const lang of LANGS) for (const [n, id] of [[24, 'phrase.past.i-went'], [24, 'phrase.past.it-was-great'], [24, 'phrase.past.i-stayed'], [24, 'phrase.past.it-was-good'], [30, 'phrase.past.it-was-good']] as const) {
      const later = day(lang, n).items.find((i) => strip(i.id) === id)!;
      const here = day(lang).items.find((i) => strip(i.id) === id)!;
      expect(later, `${lang} M${n} ${id}`).toEqual(here);
    }
  });
  it('32. EN / ES / FR parity: the same journey, step for step, each in its own words — same rounds, same answers, same reveals', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.ordered ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'swap') return [s.kind, s.label, s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning])])];
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

describe('PRIOR LEARNING — verified per language, not assumed (learnedBefore(lang, 20))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 20);
  /** The brief's audit list — a chunk per language, and what it really is before Mission 20. */
  const AUDIT: Record<CoverageLang, Record<string, string>> = {
    en: { yesterday: 'yesterday', 'old town': 'the old town', market: 'the market', fish: 'fish', great: 'great', Argentina: 'argentina', 'last month': 'last month', hostel: 'hostel', good: 'good', tired: 'tired', 'all day': 'all day', beach: 'the beach', museum: 'the museum', hotel: 'a hotel', chicken: 'chicken', nothing: 'nothing' },
    es: { yesterday: 'ayer', 'old town': 'casco antiguo', market: 'mercado', fish: 'pescado', great: 'genial', Argentina: 'argentina', 'last month': 'el mes pasado', hostel: 'hostal', good: 'bien', tired: 'cansado', 'all day': 'todo el día', beach: 'la playa', museum: 'el museo', hotel: 'un hotel', chicken: 'pollo', nothing: 'nada' },
    fr: { yesterday: 'hier', 'old town': 'la vieille ville', market: 'marché', fish: 'poisson', great: 'super', Argentina: 'argentine', 'last month': 'le mois dernier', hostel: 'auberge', good: 'bien', tired: 'fatigué', 'all day': 'toute la journée', beach: 'la plage', museum: 'musée', hotel: 'un hôtel', chicken: 'poulet', nothing: 'rien' },
  };
  const VERIFIED: Record<CoverageLang, string[]> = {
    en: ['old town', 'market', 'great', 'good', 'tired', 'beach', 'museum', 'hotel', 'chicken', 'nothing'],
    es: ['old town', 'market', 'great', 'good', 'tired', 'beach', 'museum', 'hotel', 'chicken', 'nothing'],
    fr: ['old town', 'market', 'great', 'good', 'tired', 'beach', 'museum', 'hotel', 'chicken', 'nothing'],
  };
  const known = (lang: CoverageLang, chunk: string): boolean => (chunk.includes(' ') ? prior(lang).knowsChunk(chunk) : prior(lang).words.has(chunk));
  for (const [n, lang] of [[25, 'en'], [26, 'es'], [27, 'fr']] as const) it(`${n}. ${lang}: every audited item classified — VERIFIED GUARANTEED PRIOR, or NEW (taught here)`, () => {
    const verified = Object.entries(AUDIT[lang]).filter(([, c]) => known(lang, c)).map(([k]) => k);
    expect(verified).toEqual(VERIFIED[lang]);
    const isNew = Object.keys(AUDIT[lang]).filter((k) => !verified.includes(k));
    // Everything new is met on a card before anything tests it (the strict audit below), and none of it is a deck.
    for (const k of isNew) expect(cardsOf(day(lang)).some((w) => hasChunk(w.text, AUDIT[lang][k]!)), `${lang} ${k}`).toBe(true);
    // "all day" is NOT prior as a chunk in any language (Spanish "todo" and "día" are known words, never together) — taught here.
  });
  it('NEW everywhere: yesterday, fish, Argentina, last month, hostel — and every past form — so they are taught here, on whole lines', () => {
    const NEW: Record<CoverageLang, string[]> = {
      en: ['yesterday', 'fish', 'argentina', 'last', 'month', 'hostel', 'went', 'saw', 'ate', 'stayed', 'slept', 'did', 'hey'],
      es: ['ayer', 'pescado', 'argentina', 'mes', 'pasado', 'hostal', 'fui', 'vi', 'comí', 'quedé', 'dormí', 'estuviste', 'hiciste', 'tú'],
      fr: ['hier', 'poisson', 'argentine', 'mois', 'dernier', 'auberge', 'allé', 'toute'],
    };
    for (const lang of LANGS) for (const w of NEW[lang]) expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(false);
  });
  it('23. the final\'s new details are VERIFIED PRIOR in every language — each from a covered concept of an earlier mission (centre · museum · chicken · hotel)', () => {
    const DETAIL: Record<CoverageLang, [string, string, string, string]> = { en: ['centre', 'museum', 'chicken', 'hotel'], es: ['centro', 'museo', 'pollo', 'hotel'], fr: ['centre', 'musée', 'poulet', 'hôtel'] };
    const SOURCE = [[4, 6, 7, 12, 19], [19], [14], [6]];
    for (const lang of LANGS) DETAIL[lang].forEach((w, i) => {
      const p = prior(lang);
      expect(p.words.has(w), `${lang} ${w}`).toBe(true);
      const from = [...new Set(p.concepts.filter((c) => hasChunk(c.chunk, w)).map((c) => c.mission))];
      expect(from.length, `${lang} ${w} comes from a covered concept`).toBeGreaterThan(0);
      for (const m of from) expect(SOURCE[i], `${lang} ${w} from M${m}`).toContain(m);
    });
    // …and so are the teaching transfers' details: the beach (Missions 12, 16), chicken, a hotel.
    for (const lang of LANGS) for (const t of [TRANSFER.went, TRANSFER.ate, TRANSFER.stayed]) {
      const slot = t.other[IX[lang]];
      for (const w of plain(slot).trim().split(' ')) expect(prior(lang).words.has(w), `${lang} ${w} in "${slot}"`).toBe(true);
    }
  });
  it('28. optional and transfer-only content never creates false prior: a skippable miss of this conversation, a transfer of this mission, Mission 17\'s check', () => {
    for (const lang of LANGS) {
      // The slow re-asks and the wrong choices of this conversation are skippable: cutting them changes nothing learned.
      const noMiss = (l: CoverageLang, n: number): BootcampDayContent => {
        const d = missionContent(l, n);
        if (n !== 20) return d;
        const t = scene(d);
        return { ...d, dialogues: { 'what-did-you-do': { ...t, nodes: t.nodes.filter((x) => !/^m\d+$/.test(x.id)).map((x) => ({ ...x, choices: x.choices?.filter((c) => c.correct) })) } } };
      };
      const a = learnedBefore(lang, 21);
      const b = learnedBefore(lang, 21, noMiss);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      // A transfer (a swap, the final) is a test, never teaching: "I went to the beach" is not a chunk anyone has learned.
      for (const t of [`${TRANSFER.went.frame[IX[lang]].replace('___', TRANSFER.went.other[IX[lang]])}`, FINAL_SAID[WENT as keyof typeof FINAL_SAID][IX[lang]]]) expect(a.knowsChunk(t), `${lang} ${t}`).toBe(false);
      expect(prior(lang).knowsChunk({ en: 'Where is the bread', fr: 'Où est le pain', es: '¿Dónde está el pan' }[lang]), lang).toBe(false);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M20_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`31. STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every new chunk taught before it is tested (wrong options included)`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a card fails the audit (where · went · see · saw · eat · ate · the stay · the ask-back · the friend\'s day)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      const cases: [string, string][] = [['past.line.where', 'where-were-you'], ['past.line.went', 'went-to'], ['past.line.see', 'what-did-you-see'], ['past.line.saw', 'saw'],
        ['past.line.eat', 'did-you-eat-there'], ['past.line.ate', 'ate'], ['past.line.stay', 'where-did-you-stay'], ['past.line.back', 'what-did-you-do'], ['past.line.end', 'slept-all-day']];
      for (const [key, id] of cases) expect(unprepared(without(key), lang).join(' '), `${lang} ${key}`).toMatch(new RegExp(id));
    }
  });
});

describe('production — four tools, taught whole, then retrieved', () => {
  it('6. the four core production tools are defined: I went to ___ · I saw ___ · I ate ___ · What did you do yesterday?', () => {
    expect([...TOOLS]).toEqual(['phrase.past.i-went', 'phrase.past.i-saw', 'phrase.past.i-ate', 'phrase.past.what-did-you-do']);
    for (const lang of LANGS) {
      const d = day(lang);
      for (const id of TOOLS) expect(text(d, `${lang}.${id}`), `${lang} ${id}`).toBeTruthy();
      expect(text(d, `${lang}.${BACK}`), lang).toBe({ en: 'What did you do yesterday?', es: '¿Qué hiciste ayer?', fr: 'Tu as fait quoi hier ?' }[lang]);
    }
  });
  it('12–15. each tool is taught WHOLE on a card (with its meaning) before it is first retrieved — and retrieved in teaching, no help and the final', () => {
    const cardOf: Record<string, string> = { [WENT]: 'past.line.went', [SAW]: 'past.line.saw', [ATE]: 'past.line.ate', [BACK]: 'past.line.back' };
    for (const lang of LANGS) {
      const d = day(lang);
      const rounds = quickRounds(d);
      for (const id of TOOLS) {
        const first = rounds.find(([, r]) => accepted(r) === id)![0];
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeGreaterThan(-1);
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeLessThan(first);
        expect(cardsOf(d).find((w) => w.key === cardOf[id])!.text, `${lang} ${id}`).toBe(SAID[id]![IX[lang]]);
        const where = rounds.filter(([, r]) => accepted(r) === id).map(([i]) => (i < dialogueAt(d) ? 'teaching' : i < videoAt(d) ? 'no help' : 'final'));
        expect([...new Set(where)], `${lang} ${id}`).toEqual(['teaching', 'no help', 'final']);
      }
      // Every card is a whole line of this conversation — no word card, no deck.
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(d)) { expect(w.line, `${lang} ${w.key}`).toBe(true); expect(lines, `${lang} ${w.key}`).toContain(w.text); }
    }
  });
  it('the small transfers: ONE each for "I went to ___" (the beach), "I ate ___" (chicken), "I stayed in ___" (a hotel) — the canonical line and the new one, nothing else', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const swaps = stepsOf(d, 'swap').flatMap((s) => s.rounds.map((r) => [strip(r.itemId), r.options.map((o) => [r.frame.replace('___', o.slot), o.correct])]));
      expect(swaps.map(([id]) => id), lang).toEqual([WENT, ATE, STAYED]);
      expect(swaps.map(([, opts]) => opts), lang).toEqual([TRANSFER.went, TRANSFER.ate, TRANSFER.stayed].map((t) => [[t.frame[IX[lang]].replace('___', t.canon[IX[lang]]), false], [t.frame[IX[lang]].replace('___', t.other[IX[lang]]), true]]));
      // the canonical option IS the learner's own line
      expect(swaps.map(([, opts]) => (opts as [string, boolean][])[0]![0]), lang).toEqual([at(SAID[WENT]!, lang), at(SAID[ATE]!, lang), at(SAID[STAYED]!, lang)]);
      for (const s of stepsOf(d, 'swap')) expect(s.transferOnly, lang).toBeUndefined(); // a part of the mission, not a separate Flex Round
    }
  });
  it('29. every option anywhere is one of the learner\'s own locked lines said whole — or the fourth tool asked ALONE, or, in the final, the same line with the final\'s details; a friend\'s line is never an answer', () => {
    const FRIEND = LOCKED.en.filter((l) => l.startsWith('NPC: ')).map((l) => l.slice(5));
    for (const lang of LANGS) {
      const d = day(lang);
      const allowed = [...LEARNER.map((id) => at(SAID[id]!, lang)), STANDALONE[lang], ...Object.values(FINAL_SAID).map((x) => x[IX[lang]])];
      for (const [, r] of quickRounds(d)) for (const o of r.options) expect(allowed, `${lang} ${said(d, o)}`).toContain(said(d, o));
      if (lang === 'en') for (const [, r] of quickRounds(d)) for (const o of r.options) expect(FRIEND).not.toContain(said(d, o));
      for (const id of LEARNER) expect(SAID[id]![IX[lang]], lang).toBe(id === STAYED || id === BACK ? SAID[id]![IX[lang]] : text(d, `${lang}.${id}`));
    }
  });
  it('sentences: the six learner lines, "It was good.", six of the friend\'s questions — "It was bad." archived, the help phrase no longer bundled', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.past.i-ate', 'phrase.past.i-saw', 'phrase.past.i-stayed', 'phrase.past.i-went', 'phrase.past.it-was-good', 'phrase.past.it-was-great', 'phrase.past.what-did-you-do',
        'reply.past.did-you-eat', 'reply.past.did-you-like', 'reply.past.was-it-good', 'reply.past.what-did-you-see', 'reply.past.where-did-you-stay', 'reply.past.where-were-you',
      ]);
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'past-events').map((r) => strip(r.id)), lang).toEqual(['phrase.past.it-was-bad']);
      const live = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => i.id)));
      expect(live.has(`${lang}.phrase.past.it-was-bad`), lang).toBe(false);
      expect(d.items.find((i) => strip(i.id) === 'reply.past.where-did-you-stay')!.meaning.he, lang).toBe('איפה התארחת?'); // the brief's Hebrew support
    }
  });
});

describe('the opening — the brief\'s two lines, nothing to discover given away', () => {
  it('"אתמול טיילת בעיר. ספר לחבר מה עשית." — no tense, no answers, no story facts', () => {
    for (const lang of LANGS) {
      const b = day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      expect(b.kind).toBe('talk');
      expect(b.body.map((x) => x.he).join('\n')).toBe('אתמול טיילת בעיר.\nספר לחבר מה עשית.');
      expect(b.title.en).toBe('Mission 20: Past & Recent Events');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      expect(JSON.stringify(b), lang).not.toMatch(/old town|market|fish|great|hostel|argentina|last month|went|saw|ate|stayed|העתיקה|שוק|דג|מעולה|הוסטל|ארגנטינה|חודש שעבר|past tense|זמן עבר/i);
    }
  });
});

describe('THE FRIEND\'S QUESTIONS — which part of your story? (11)', () => {
  it('11. a question is played and the learner taps the part of the story it asks about — "Where were you yesterday?" → 📍 the place, "Where did you stay?" → 🛏️ (two "where"s)', () => {
    expect(STORY_TILES.map((t) => [t.id, t.emoji, t.caption!.en])).toEqual([['went', '📍', 'Where you went'], ['saw', '👀', 'What you saw'], ['ate', '🍽️', 'What you ate'], ['how', '⭐', 'How it was'], ['stayed', '🛏️', 'Where you stayed']]);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.filter(isWhich).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_WHERE, lang), 'went'], [at(N_STAY, lang), 'stayed']]);
      for (const s of d.steps.filter(isWhich)) { expect(s.ordered, lang).toBeUndefined(); expect(s.quiet, lang).toBe(true); } // a set of meanings, shuffled, in the page's direction — not a left-to-right scale
    }
    // The tiles name the KIND of answer (app language) — never a target-language word, never an answer.
    for (const t of STORY_TILES) expect(`${t.caption!.en} ${t.caption!.he}`).not.toMatch(/old town|market|fish|great|hostel|העתיקה|שוק|דג|מעולה|הוסטל/i);
  });
  it('the other questions are understood by answering them: "What did you see?" / "Did you eat there?" / "Was it good?" each pick the right part', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const teach = quickRounds(d, 0, dialogueAt(d)).map(([, r]) => [strip(r.promptItemId), accepted(r)]);
      expect(teach, lang).toEqual([['reply.past.where-were-you', WENT], ['reply.past.what-did-you-see', SAW], ['reply.past.did-you-eat', ATE], ['reply.past.was-it-good', BACK]]);
    }
  });
  it('the companion introduces the first board as the story — never "say the past"', () => {
    const d = day('en');
    expect(coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[19]!.id)!.line.en).toBe('Listen — and tap which part of your story they ask about.');
  });
});

describe('the secondary lines — minimal, valid (16–18)', () => {
  it('17. "It was great": one card, one GOOD → GREAT tap, the conversation, one final answer — never No Help, no opinion lesson, no new adjective', () => {
    expect(HOW_TILES.map((t) => [t.id, t.caption!.en])).toEqual([['good', 'Good'], ['great', 'Great']]);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => w.text === at(Y_GREAT, lang)).map((w) => w.key), lang).toEqual(['past.line.great']);
      expect(d.steps.filter(isHow).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(Y_GREAT, lang), 'great']]);
      expect(quickRounds(d).filter(([, r]) => accepted(r) === GREAT).map(([i]) => i > videoAt(d)), lang).toEqual([true]); // the final only
      expect(stepsOf(d, 'swap').some((s) => s.rounds.some((r) => strip(r.itemId) === GREAT)), lang).toBe(false);
    }
  });
  it('16. "I stayed in ___": one card, the question understood (🛏️ not 📍), one transfer (a hotel), the conversation, one final answer — never No Help, no accommodation deck', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => w.text === at(Y_STAYED, lang)).map((w) => w.key), lang).toEqual(['past.line.stayed']);
      expect(stepsOf(d, 'swap').filter((s) => s.rounds.some((r) => strip(r.itemId) === STAYED)), lang).toHaveLength(1);
      expect(quickRounds(d).filter(([, r]) => accepted(r) === STAYED).map(([i]) => i > videoAt(d)), lang).toEqual([true]);
      for (const t of speakable(d)) expect(t, lang).not.toMatch(/apartment|campsite|guesthouse|b&b|appartement|camping|apartamento|pensión|cabin/i);
    }
  });
  it('18. the friend\'s day ("Me? Nothing! I was tired. I slept all day.") is comprehension ONLY: one card, one board, the conversation — never said, never a prompt', () => {
    expect(FRIEND_TILES.map((t) => [t.id, t.emoji])).toEqual([['slept', '😴'], ['market', '🧺'], ['fish', '🐟']]);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => w.text === at(N_END, lang)).map((w) => w.key), lang).toEqual(['past.line.end']);
      expect(d.steps.filter(isFriend).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_END, lang), 'slept']]);
      for (const [, r] of quickRounds(d)) { expect(heardIn(d, r), lang).not.toBe(at(N_END, lang)); for (const o of r.options) expect(said(d, o), lang).not.toBe(at(N_END, lang)); }
      expect(cardsOf(d).filter((w) => /tired|slept|cansado|dormí|fatigué|dormi/i.test(w.text)).length, lang).toBe(1); // no deck: one line, once
    }
  });
});

describe('🗓️ THE YESTERDAY STORY — fills progressively, never shows the future (19–20)', () => {
  const REVEALS: [label: string, board: RegExp, card: string, check: (s: BootcampStep) => boolean][] = [
    ['went → Old Town', /📍 Went → Old Town|📍 הלכתי → העיר העתיקה/, 'past.line.went', isWhich],
    ['saw → Market', /👀 Saw → Market|👀 ראיתי → השוק/, 'past.line.saw', (s) => s.kind === 'quickReply' && s.rounds.some((r) => strip(r.promptItemId) === 'reply.past.what-did-you-see')],
    ['ate → Fish', /🍽️ Ate → Fish|🍽️ אכלתי → דג/, 'past.line.ate', (s) => s.kind === 'quickReply' && s.rounds.some((r) => strip(r.promptItemId) === 'reply.past.did-you-eat')],
    ['it was → Great', /⭐ It was → Great|⭐ היה → מעולה/, 'past.line.great', isHow],
    ['stayed → Hostel', /🛏️ Stayed → Hostel|🛏️ התארחתי → הוסטל/, 'past.line.stayed', (s) => isWhich(s) && s.rounds.some((r) => r.correct === 'stayed')],
  ];
  for (const [label, board, card, check] of REVEALS) it(`20. ${label}: never on the story before the line that says it — and only after the learner has answered`, () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const told = primeAt(d, card);
      expect(told, `${lang} ${label}`).toBeGreaterThan(0);
      const first = firstBoard(d, board);
      expect(first, `${lang} ${label}`).toBeGreaterThan(told);
      expect(first, `${lang} ${label}`).toBeGreaterThan(d.steps.findIndex(check));
    }
  });
  it('20. no step before a line\'s card carries its fact anywhere — label, tile, caption, cue or picture (artwork counts as information)', () => {
    const FACTS: [string, RegExp][] = [['past.line.went', /Old Town|old town|העתיקה|vieille|casco/], ['past.line.saw', /Market|market|השוק|marché|mercado/], ['past.line.ate', /Fish|fish|\bדג\b|poisson|pescado|🐟/],
      ['past.line.great', /Great|great|מעולה|super|genial|🤩/], ['past.line.stayed', /Hostel|hostel|הוסטל|auberge|hostal/]];
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [card, fact] of FACTS) for (const s of d.steps.slice(0, primeAt(d, card))) expect(JSON.stringify(s), `${lang} ${card}`).not.toMatch(fact);
    }
    // Artwork stays on the existing line cards; the fact checks above also cover image paths.
  });
  it('19. the story fills part by part — "?" until known — and the board renders it as two columns (yesterday ‖ last month)', () => {
    const known = (n: StoryStage) => splitTimeBoard(yesterdayStory(n)[1])!.plan!.flatMap((c) => c.rows.filter((r) => r.known).map((r) => r.text));
    expect(known(0)).toEqual([]);
    expect(known(1)).toEqual(['📍 Went → Old Town']);
    expect(known(2)).toEqual(['📍 Went → Old Town', '👀 Saw → Market']);
    expect(known(3)).toEqual(['📍 Went → Old Town', '👀 Saw → Market', '🍽️ Ate → Fish']);
    expect(known(4)).toEqual(['📍 Went → Old Town', '👀 Saw → Market', '🍽️ Ate → Fish', '⭐ It was → Great']);
    expect(known(5)).toEqual(['📍 Went → Old Town', '👀 Saw → Market', '🍽️ Ate → Fish', '⭐ It was → Great', '🛏️ Stayed → Hostel']);
    expect(splitTimeBoard(yesterdayStory(0)[1])!.plan!.map((c) => c.day)).toEqual(['🗓️ Yesterday', '📅 Last month']);
    expect(splitTimeBoard(yesterdayStory(0)[0])!.plan!.map((c) => c.day)).toEqual(['🗓️ אתמול', '📅 חודש שעבר']);
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${yesterdayStory(2)[1]} ¦ Go` }));
    expect(html).toMatch(/plan-card/);
    expect(html.match(/data-known="false"/g)).toHaveLength(3); // ate, it was, stayed — still unknown
    expect(M20_STAGES).toEqual(['nothing', 'went', 'saw', 'ate', 'how', 'stayed']);
    // In the mission, each stage appears in order and never goes back.
    for (const lang of LANGS) {
      const stages = day(lang).steps.map((s) => boardText(s)[1] ?? '').map((t) => (splitTimeBoard(t)?.plan ? splitTimeBoard(t)!.plan!.flatMap((c) => c.rows).filter((r) => r.known).length : null)).filter((n): n is number => n !== null && n <= 5);
      const teaching = stages.slice(0, stages.lastIndexOf(5) + 1);
      expect(teaching, lang).toEqual([...teaching].sort((a, b) => a - b));
      expect(teaching[0], lang).toBe(0);
    }
  });
});

describe('NO HELP — exactly the four tools (21)', () => {
  it('21. between the conversation and the video: one speed run of four — where → went · see → saw · eat → ate · was it good → ask back; no meaning, no card, no story', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect(run.map((s) => s.kind), lang).toEqual(['receipt', 'quickReply', 'receipt']);
      const qr = run[1] as QR;
      expect(qr.challenge, lang).toBe(true);
      expect(qr.label, lang).toBeUndefined();
      for (const r of qr.rounds) { expect(r.situation, lang).toBeUndefined(); expect(r.npc, lang).toBeUndefined(); }
      expect(qr.rounds.map((r) => [strip(r.promptItemId), accepted(r)]), lang).toEqual([['reply.past.where-were-you', WENT], ['reply.past.what-did-you-see', SAW], ['reply.past.did-you-eat', ATE], ['reply.past.was-it-good', BACK]]);
      // the canonical lines — no final details — and the fourth tool asked alone
      for (const r of qr.rounds) for (const o of r.options) expect([...LEARNER.map((id) => at(SAID[id]!, lang)), STANDALONE[lang]], lang).toContain(said(d, o));
      // "Yes, it was great!" would answer "Was it good?" — so it is never a wrong option there.
      for (const r of qr.rounds) if (strip(r.promptItemId) === 'reply.past.was-it-good') expect(r.options.map((o) => strip(o.itemId)), lang).not.toContain(GREAT);
    }
  });
});

describe('THE FOURTH TOOL — "What did you do yesterday?", owned ALONE (the conversation keeps the whole locked line)', () => {
  /** The rounds whose accepted answer is the fourth tool, by phase. */
  const askRounds = (d: BootcampDayContent) => quickRounds(d).filter(([, r]) => accepted(r) === BACK)
    .map(([i, r]) => [i < dialogueAt(d) ? 'teaching' : i < videoAt(d) ? 'no help' : 'final', r] as const);
  it('1. the canonical conversation still says the full long line, exactly — and only there', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const full = LOCKED[lang][11]!.slice(5);
      expect(at(Y_BACK, lang), lang).toBe(full);
      expect(script(lang)[11], lang).toBe(`YOU: ${full}`);
      // the conversation's ask-back turn accepts the whole line (and its slow re-ask, the same line)
      const turns = scene(d).nodes.flatMap((n) => (n.choices ?? []).filter((c) => c.correct && c.itemId === `${lang}.${BACK}`));
      expect(turns.length, lang).toBeGreaterThan(0);
      for (const c of turns) expect(c.en, lang).toBe(full);
      // the card teaches the locked line whole, and points at the question on its own
      const card = cardsOf(d).find((w) => w.key === 'past.line.back')!;
      expect(card.text, lang).toBe(full);
      expect(card.meaning.en, lang).toContain('“What did you do yesterday?” works with anyone');
      expect(card.meaning.he, lang).toContain('„מה עשית אתמול?”');
    }
  });
  it('2. the fourth core tool IS the standalone question (EN / ES / FR exact)', () => {
    for (const lang of LANGS) expect(text(day(lang), `${lang}.${TOOLS[3]}`), lang).toBe(STANDALONE[lang]);
  });
  it('3–5. teaching retrieval, No Help and the final each ask for the standalone question — the button says it alone, nothing else to pass', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const rounds = askRounds(d);
      expect(rounds.map(([where]) => where), lang).toEqual(['teaching', 'no help', 'final']);
      for (const [where, r] of rounds) {
        const ok = r.options.find((o) => o.correct)!;
        expect(ok.text, `${lang} ${where}`).toBeUndefined(); // no wrapping line: the sentence itself
        expect(said(d, ok), `${lang} ${where}`).toBe(STANDALONE[lang]);
        for (const lead of LEAD_IN[lang]) expect(said(d, ok), `${lang} ${where}`).not.toContain(lead);
        expect(said(d, ok), `${lang} ${where}`).not.toBe(at(Y_BACK, lang));
        // the friend still asks "Was it good?" — the moment to ask back; the final's friend follows the hotel
        expect(heardIn(d, r), `${lang} ${where}`).toBe(where === 'final' ? at(N_GOOD_FINAL, lang) : text(d, `${lang}.reply.past.was-it-good`));
        // the right answer no longer answers "Was it good?" — so no wrong option starts with "Yes" (a trap)
        for (const o of r.options.filter((x) => !x.correct)) expect(said(d, o), `${lang} ${where}`).not.toMatch(/^(Yes|Sí|Oui)\b/);
      }
      // the long line is never an option outside the conversation
      for (const [, r] of quickRounds(d)) for (const o of r.options) expect(said(d, o), lang).not.toBe(at(Y_BACK, lang));
    }
  });
  it('the teaching round names the move (your turn — ask about their yesterday), without requiring the lead-in', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const [i] = quickRounds(d).find(([, r]) => accepted(r) === BACK)!;
      const [he, en] = boardText(d.steps[i]!);
      expect(en, lang).toContain('now your turn: ask your friend about their yesterday');
      expect(he, lang).toContain('עכשיו תורך: שאל את החבר על האתמול שלו');
    }
  });
  it('"It was good" and "And you?" stay understood (comprehension), never a production target', () => {
    for (const id of ['it-was-good', 'and-you']) expect(M20_CONCEPTS.find((c) => c.id === id)!.role, id).toBe('hear');
    expect(M20_CONCEPTS.find((c) => c.id === 'what-did-you-do')!.role).toBe('say');
    for (const lang of LANGS) {
      const rows = coverageOf(day(lang), lang, M20_CONCEPTS);
      for (const id of ['it-was-good', 'and-you', 'what-did-you-do']) expect(rows.find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
    }
  });
});

describe('THE FINAL — another day: the same function, new details (22–24)', () => {
  it('22. after the video: ONE quick reply of six — not the conversation again, and not its lines', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const after = d.steps.slice(videoAt(d) + 1);
      expect(after.map((s) => s.kind), lang).toEqual(['quickReply', 'receipt', 'summary']);
      expect(after.some((s) => s.kind === 'dialogue'), lang).toBe(false);
      const qr = after[0] as QR;
      expect(qr.challenge, lang).toBeUndefined();
      expect(qr.rounds.map(accepted), lang).toEqual([WENT, SAW, ATE, GREAT, STAYED, BACK]);
      // Not a replay: none of the four story answers is the canonical line.
      for (const r of qr.rounds) for (const o of r.options) if (o.correct && [WENT, SAW, ATE, STAYED].includes(strip(o.itemId))) expect(LOCKED[lang].map((l) => l.slice(5)), lang).not.toContain(said(d, o));
    }
  });
  it('23. at least three core productions carry CHANGED details: the centre · the museum · chicken · a hotel (four)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const qr = d.steps[videoAt(d) + 1] as QR;
      const changed = qr.rounds.map((r) => r.options.find((o) => o.correct)!).filter((o) => [WENT, SAW, ATE, STAYED].includes(strip(o.itemId)) && o.text && o.text !== text(d, o.itemId));
      expect(changed.map((o) => o.text), lang).toEqual([WENT, SAW, ATE, STAYED].map((id) => FINAL_SAID[id as keyof typeof FINAL_SAID][IX[lang]]));
      expect(changed.length, lang).toBeGreaterThanOrEqual(3);
      // the friend's line about the stay follows the new detail too
      expect(qr.rounds.at(-1)!.npc!.en, lang).toBe(at(N_GOOD_FINAL, lang));
      expect(qr.rounds.at(-1)!.npc!.en, lang).not.toBe(at(N_GOOD, lang));
    }
  });
  it('23. the final\'s day is the learner\'s own memory, shown whole as UI (deterministic, app language, icons) — the job is to SAY it', () => {
    expect(splitTimeBoard(anotherDayStory[1])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['📍 Went → 🏙️ Centre', '👀 Saw → 🏛️ Museum', '🍽️ Ate → 🍗 Chicken', '⭐ It was → Great', '🛏️ Stayed → 🏨 Hotel']);
    for (const lang of LANGS) {
      const qr = day(lang).steps[videoAt(day(lang)) + 1] as QR;
      expect(qr.label!.en, lang).toContain(anotherDayStory[1]);
      expect(qr.label!.he, lang).toContain(anotherDayStory[0]);
    }
  });
  it('24. no untaught final vocabulary: every word of every final option and line is taught in this mission or verified prior', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const final: BootcampDayContent = { ...d, steps: d.steps };
      expect(unpreparedWords(final, learnedBefore(lang, 20).words, lang).filter((u) => u.includes(`step ${videoAt(d) + 2} `)), lang).toEqual([]);
    }
  });
});

describe('bloat guards — one conversation, not a grammar class (7–10, 33–36)', () => {
  it('10. INTERACTION BUDGET: 21 meaningful interactions (target 19–21, hard ceiling 21): 8 teaching / comprehension · 3 transfer · 4 no help · 6 final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(21);
      expect(interactions(d), lang).toBeLessThanOrEqual(21);
      const teach = { ...d, steps: d.steps.slice(0, dialogueAt(d)) };
      expect(interactions(teach), lang).toBe(11);
      expect(interactions({ ...d, steps: stepsOf(teach, 'swap') }), lang).toBe(3);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(4);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(6);
    }
  });
  it('7. no grammar lesson: no tense, no verb, no "did", no went / saw / ate list, no was / were table — anywhere the learner reads', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(appCopy(d), lang).not.toMatch(GRAMMAR);
      expect(stepsOf(d, 'tool').length + stepsOf(d, 'replies').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swipe').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'ambush').length + stepsOf(d, 'miniMap').length, lang).toBe(0);
    }
  });
  it('8–9. no sentence builder, no separate Flex Round (no transfer-only step, no "flex" copy)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'sentenceBuilder'), lang).toHaveLength(0);
      expect(d.steps.some((s) => 'transferOnly' in s && s.transferOnly), lang).toBe(false);
      expect(appCopy(d), lang).not.toMatch(/flex|גמיש|🔁/i);
    }
  });
  it('33–36. no score, no XP, no streak, no timer — in any label, receipt or the result', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(SCOREBOARD);
    expect(YESTERDAY_STORY.join(' ')).not.toMatch(SCOREBOARD);
  });
  it('no vocabulary bloat: no days of the week, no calendar, no country list, no food / accommodation deck, no extra past forms', () => {
    for (const lang of LANGS) for (const t of speakable(day(lang))) {
      expect(t, lang).not.toMatch(/monday|tuesday|weekend|week\b|lundi|semaine|lunes|semana|calendar|calendrier|calendario|france|spain|italy|mexico|españa|italie|italia|méxico/i);
      expect(t, lang).not.toMatch(/pizza|rice|pasta|soup|salad|beef|pork|riz|pâtes|soupe|salade|arroz|sopa|ensalada|apartment|appartement|apartamento|camping/i);
      expect(t, lang).not.toMatch(/\b(drank|bought|visited|walked|swam|took|met|played|read)\b|j’ai bu|j’ai acheté|j’ai visité|bebí|compré|visité|caminé/i);
    }
  });
});

describe('the result — 🗓️ YESTERDAY STORY', () => {
  it('the whole story, compact — with the other day and the friend\'s answer — no score', () => {
    expect(YESTERDAY_STORY[1]).toBe('🗓️ YESTERDAY STORY ¦ 🗓️ Yesterday: 📍 Went → Old Town / 👀 Saw → Market / 🍽️ Ate → Fish / ⭐ It was → Great ‖ 📅 Last month: 🛏️ Stayed → Hostel ¦ You told your yesterday — and another day — and asked back. 😴 Your friend? Slept all day.');
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('YESTERDAY STORY')).map(([, i]) => i), lang).toEqual([d.steps.length - 2]);
      expect(d.steps.at(-1)!.kind, lang).toBe('summary');
    }
  });
});

describe('the supported conversation — once (37), audio never blocks (38)', () => {
  it('37. the conversation runs ONCE, supported (not cold): translations on, every line glossed in Hebrew', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'dialogue'), lang).toHaveLength(1);
      expect(scene(d).cold, lang).toBeUndefined();
      for (const l of cinematicTranscript(scene(d))) { expect(l.he, lang).toBeTruthy(); if (lang !== 'en') expect(l.tr?.en, lang).toBeTruthy(); }
      expect(dialogueAt(d), lang).toBeGreaterThan(primeAt(d, 'past.line.end')); // after everything is taught
    }
  });
  afterEach(() => vi.unstubAllGlobals());
  it('38. every answered line of the friend shows the choices AT ONCE, while its audio plays in parallel', async () => {
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
  it('38. answering mid-line stops the friend\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const q = tts.speak(N_STAY[0], 'en');
    void tts.speak(Y_STAYED[0], 'en');
    expect(await q).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_STAYED[0]);
    tts.cancelSpeech();
  });
  it('the miss is asked again SLOWLY — a real beat of the conversation (first wrong answer → the friend repeats slowly)', () => {
    for (const lang of LANGS) expect(scene(day(lang)).nodes.filter((n) => n.slow).map((n) => n.id), lang).toEqual(['m2', 'm4', 'm6', 'm8', 'm10', 'm12']);
  });
});

describe('serialisable state (39)', () => {
  it('the story state serialises, and restoring it never leaks the future', () => {
    for (let n = 0; n <= 5; n++) {
      const s = JSON.parse(JSON.stringify(yesterdayState(n as StoryStage))) as ReturnType<typeof yesterdayState>;
      expect(s).toEqual(yesterdayState(n as StoryStage));
      expect([s.went !== null, s.saw !== null, s.ate !== null, s.howItWas !== null, s.stayed !== null]).toEqual([n >= 1, n >= 2, n >= 3, n >= 4, n >= 5]);
    }
    expect(yesterdayState(5)).toEqual({ phase: 'stayed', went: 'old-town', saw: 'market', ate: 'fish', howItWas: 'great', stayed: 'hostel' });
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for (30)', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M20_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M20_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`30. ${lang}: every chunk is COVERED here or VERIFIED PRIOR — the four tools and the friend's questions always covered`, () => {
    const prior = learnedBefore(lang, 20);
    const rows = coverageOf(day(lang), lang, M20_CONCEPTS);
    for (const row of rows) if (!prior.knowsChunk(M20_CONCEPTS.find((x) => x.id === row.id)!.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    for (const id of ['went-to', 'saw', 'ate', 'what-did-you-do', 'where-were-you', 'what-did-you-see', 'did-you-eat-there', 'did-you-like-it', 'where-did-you-stay', 'was-it-good', 'it-was-great', 'stayed-in', 'was-tired', 'slept-all-day']) {
      expect(rows.find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
    }
  });
  it('a card is a teaching encounter; a board, a swap or a quick reply never is', () => {
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
      'prime', 'visualMatch', // where were you? → 📍
      'prime', 'quickReply', 'swap', // what did you see? · answer both · another place
      'prime', 'quickReply', 'swap', // did you eat there? · another food
      'prime', 'visualMatch', // did you like it? → great
      'prime', 'visualMatch', 'swap', // last month: where did you stay? → 🛏️ · another place to stay
      'prime', 'quickReply', // was it good? · ask back
      'prime', 'visualMatch', 'receipt', // the friend's day
      'dialogue', 'receipt',
      'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'receipt', 'summary',
    ]);
  });
  it('visual slots: six production images; Yesterday Story stays deterministic UI', () => {
    expect(Object.keys(M20_SLOTS)).toEqual(['chat', 'old-town', 'market', 'meal', 'hostel', 'friend-day']);
    expect(Object.keys(M20_PROPS)).toEqual(['yesterday-story']);
    for (const [key, slot] of Object.entries(M20_SLOTS)) {
      expect(slot.emoji).toBeTruthy();
      expect(slot.image).toBe(`images/mission20/${key}.jpg`);
      expect(existsSync(fileURLToPath(new URL(`../../../public/${slot.image}`, import.meta.url)))).toBe(true);
    }
    expect(M20_PROPS['yesterday-story'].image).toBeUndefined();
  });
  it('every card picture comes from a slot, the same in every language', () => {
    const looks = new Set(Object.values(M20_SLOTS).map((s) => s.image ?? s.emoji));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
  });
  it('video: the standard resolver ({lang}_20.mp4) — no Mission 20 file in any language today, so the step is safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[19]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_20.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
