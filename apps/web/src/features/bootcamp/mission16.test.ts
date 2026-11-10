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
import { M16_CONCEPTS, M16_TRANSFER } from './mission16Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  CATEGORY_TILES, FREE_TIME_MATCH, HOBBIES_IN_ORDER, HOBBY_PREFERENCE, LEARNER_IDS, M16_PROPS, M16_SLOTS, N_ELSE, N_FREE, N_MUSIC, N_SCHOOL,
  N_SPORT, N_SURF, N_TOMORROW, N_TRY, N_WHEN, PLAN_TILES, PREFERENCES, SAID, SORT_LINE, TIME_TILES, Y_ASK, Y_DONT, Y_FUN, Y_LIKE, Y_LOVE, Y_TOO,
  Y_TRY, Y_USUALLY, freeTimePlan, freeTimeProfile, freeTimeState, type M16Hobby, type M16Reveal,
} from './practiceHobbies.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 16 — Hobbies & Free Time: SHORT, VISUAL, TRANSFER-DRIVEN. The conversation is LOCKED. The
 * learner leaves with a preference system — love / like / don't like / usually / want to try, and
 * asking back — not a hobby word list. "Do you like diving?" is produced by transfer: no card teaches it.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 16): BootcampDayContent => missionContent(lang, n);
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
const scene = (d: BootcampDayContent) => d.dialogues['free-time-chat']!;
/** The sorting moments: one-round boards over the four category tiles. */
const sorts = (d: BootcampDayContent): VM[] => stepsOf(d, 'visualMatch').filter((s) => s.tiles.every((t) => (PREFERENCES as readonly string[]).includes(t.id)));
const sortAt = (d: BootcampDayContent, h: M16Hobby): number => d.steps.findIndex((s) => s.kind === 'visualMatch' && s.rounds[0]!.picture?.emoji === M16_SLOTS[h].emoji);
const timeAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'visualMatch' && s.tiles === TIME_TILES || (s.kind === 'visualMatch' && s.tiles.some((t) => t.id === 'evening')));
const returnAt = (d: BootcampDayContent): number => d.steps.findIndex((s, i) => i < dialogueAt(d) && s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === 'phrase.hobby.do-you-like'));
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);

/** The conversation exactly as the brief froze it (pasted verbatim). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hi! Are you free today?', 'YOU: Yes! What do you do for fun?', 'NPC: I surf a lot. Do you like surfing?', 'YOU: I love surfing!', 'NPC: Great! And what else do you like?', 'YOU: I like drawing.',
    'NPC: Nice! When do you draw?', 'YOU: I usually draw in the evening.', 'NPC: In the evening I like to listen to music. Do you like music?', 'YOU: Yes, I like to listen to music too.',
    'NPC: And sport? Do you like running?', 'YOU: No, I don\'t like running.', 'NPC: Me neither! Is there something you want to try here?', 'YOU: I want to try diving.',
    'NPC: Good idea! There\'s a diving school near the beach.', 'YOU: Do you like diving?', 'NPC: I love it! Let\'s go together tomorrow.'],
  es: ['NPC: ¡Hola! ¿Estás libre hoy?', 'YOU: ¡Sí! ¿Qué te gusta hacer?', 'NPC: Hago mucho surf. ¿Te gusta el surf?', 'YOU: ¡Me encanta el surf!', 'NPC: ¡Genial! ¿Y qué más te gusta?', 'YOU: Me gusta dibujar.',
    'NPC: ¡Qué bien! ¿Cuándo dibujas?', 'YOU: Normalmente dibujo por la noche.', 'NPC: Por la noche me gusta escuchar música. ¿Te gusta la música?', 'YOU: Sí, a mí también me gusta escuchar música.',
    'NPC: ¿Y el deporte? ¿Te gusta correr?', 'YOU: No, no me gusta correr.', 'NPC: ¡Yo tampoco! ¿Hay algo que quieras probar aquí?', 'YOU: Quiero probar el buceo.',
    'NPC: ¡Buena idea! Hay una escuela de buceo cerca de la playa.', 'YOU: ¿Te gusta el buceo?', 'NPC: ¡Me encanta! Vamos juntos mañana.'],
  fr: ['NPC: Salut ! Tu es libre aujourd’hui ?', 'YOU: Oui ! Qu’est-ce que tu aimes faire ?', 'NPC: Je fais beaucoup de surf. Tu aimes le surf ?', 'YOU: J’adore le surf !', 'NPC: Super ! Et tu aimes quoi d’autre ?', 'YOU: J’aime dessiner.',
    'NPC: Sympa ! Tu dessines quand ?', 'YOU: D’habitude, je dessine le soir.', 'NPC: Le soir, j’aime écouter de la musique. Tu aimes la musique ?', 'YOU: Oui, moi aussi j’aime écouter de la musique.',
    'NPC: Et le sport ? Tu aimes courir ?', 'YOU: Non, je n’aime pas courir.', 'NPC: Moi non plus ! Il y a quelque chose que tu veux essayer ici ?', 'YOU: Je veux essayer la plongée.',
    'NPC: Bonne idée ! Il y a une école de plongée près de la plage.', 'YOU: Tu aimes la plongée ?', 'NPC: J’adore ! On y va ensemble demain.'],
};
const YOU_LINES = [Y_FUN, Y_LOVE, Y_LIKE, Y_USUALLY, Y_TOO, Y_DONT, Y_TRY, Y_ASK];
const FRIEND = [N_FREE, N_SURF, N_ELSE, N_WHEN, N_MUSIC, N_SPORT, N_TRY, N_SCHOOL, N_TOMORROW];
const [FUN, LOVE, LIKE, USUALLY, , DONT, TRY, ASK] = LEARNER_IDS; // "too" is retrieved in teaching and the conversation — not in the shortened runs
/** Canonical transcript ([who, text], exact) — the same value before this pass (1e5bee7) and after. */
const TRANSCRIPT_PRINT = { en: 'd6dd8f03', es: '7b24d5c7', fr: 'ec44d15a' };
/** The dialogue TREE — changed on purpose: the recovery-tool branch out, every turn a real decision. */
const DIALOGUE_PRINT = { en: '9ab2299e', es: '45c5f527', fr: 'b03a28d5' };
const EXTRA_HOBBIES = /swim|football|soccer|read|gaming|video game|cook|photo|paint|ski|tennis|yoga|hik|natation|nager|foot\b|lire|lecture|jeux|cuisiner|peindre|peinture|randonn|nadar|natación|fútbol|leer|lectura|cocinar|fotograf|pintar|esquí|senderismo/i;

/* ── the My Free Time reveal checker ───────────────────────────────────────────────────────────── */

const boardParts = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''].flatMap((x) => x.split(' ¦ ')).filter((p) => p.includes('‖') || p.startsWith('🧭')) : [];
};
/** A profile fact, how it reads on the board, and the line that makes it known — said / placed by YOU, or said by the friend. */
const FACTS: [fact: string, shown: RegExp, line: L4, by: 'you' | 'friend'][] = [
  ['surfing → love', /Love: Surfing|אוהב מאוד: גלישה/, Y_LOVE, 'you'],
  ['friend surfs a lot', /Surfing: a lot|גלישה: הרבה/, N_SURF, 'friend'],
  ['drawing → like', /Like: Drawing|אוהב: ציור/, Y_LIKE, 'you'],
  ['drawing → evening', /Drawing → Evening|ציור → ערב/, Y_USUALLY, 'you'],
  ['music → like', /Drawing · Music|ציור · מוזיקה/, Y_TOO, 'you'],
  ['friend: music in the evening', /Music: in the evening|מוזיקה: בערב/, N_MUSIC, 'friend'],
  ['running → don\'t like', /Don’t like: Running|לא אוהב: ריצה/, Y_DONT, 'you'],
  ['diving → want to try', /Want to try: Diving|רוצה לנסות: צלילה/, Y_TRY, 'you'],
  ['friend: no running either', /Running: doesn’t like it either|ריצה: גם הוא לא אוהב/, N_TRY, 'friend'],
  ['the diving school, near the beach', /Diving school · near the beach|בית ספר לצלילה · ליד החוף/, N_SCHOOL, 'friend'],
  ['friend loves diving', /Diving: loves it|צלילה: אוהב מאוד/, N_TOMORROW, 'friend'],
  ['the plan: tomorrow', /Tomorrow · together|מחר · יחד/, N_TOMORROW, 'friend'],
];
const shownFacts = (s: BootcampStep): string[] => FACTS.filter(([, re]) => boardParts(s).some((p) => re.test(p))).map(([f]) => f);
/** What a step makes known for the NEXT steps. YOUR facts: only once you place or say them — a card
 *  that shows your line is not yet the profile. The friend's: once heard. */
function revealed(d: BootcampDayContent, s: BootcampStep, lang: CoverageLang): string[] {
  const placed: string[] = [];
  const heard: string[] = [];
  if (s.kind === 'prime') heard.push(...s.words.map((w) => w.text));
  if (s.kind === 'visualMatch') for (const r of s.rounds) { heard.push(r.audio.en); placed.push(r.audio.en); }
  if (s.kind === 'quickReply') for (const r of s.rounds) { if (!r.situation) heard.push(heardIn(d, r)); placed.push(said(d, r)); }
  if (s.kind === 'dialogue') { heard.push(...cinematicTranscript(scene(d)).map((x) => x.en)); placed.push(...cinematicTranscript(scene(d)).map((x) => x.en)); }
  return FACTS.filter(([, , line, by]) => (by === 'you' ? placed : heard).includes(at(line, lang))).map(([f]) => f);
}
function revealViolations(d: BootcampDayContent, lang: CoverageLang, steps: readonly BootcampStep[] = d.steps): string[] {
  const known = new Set<string>();
  const bad: string[] = [];
  steps.forEach((s, i) => {
    for (const f of shownFacts(s)) if (!known.has(f)) bad.push(`step ${i + 1} ${s.kind} shows "${f}" before it is revealed`);
    for (const f of revealed(d, s, lang)) known.add(f);
  });
  return bad;
}
/** All app-language copy of the mission (labels, intros, meanings, receipts, situations, captions) — never target text. */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
    if (t) out.push(t.he ?? '', t.en ?? '');
    if (s.kind === 'talk') for (const b of s.body) out.push(b.he ?? '', b.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'quickReply') for (const r of s.rounds) if (r.situation) out.push(r.situation.he ?? '', r.situation.en ?? '');
    if (s.kind === 'visualMatch') for (const t2 of s.tiles) out.push(t2.caption?.he ?? '', t2.caption?.en ?? '');
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

describe('the conversation is locked, and Mission 16 is in its place', () => {
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (1e5bee7) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
  });
  for (const lang of LANGS) it(`${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision (one line from another moment, asked again slowly); the recovery-tool branch is gone', () => {
    for (const lang of LANGS) {
      const nodes = scene(day(lang)).nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
        expect(LEARNER_IDS as readonly string[], `${lang} ${n.id}`).toContain(strip(wrong[0]!.itemId));
      }
      expect(JSON.stringify(nodes), lang).not.toMatch(/recovery\./);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('Mission 16 is "Hobbies & Free Time", sixteenth on the journey (registry key 33)', () => {
    expect(BOOTCAMP_PLAN[15]!.id).toBe('hobbies-free-time');
    expect(BOOTCAMP_PLAN[15]!.day).toBe(33);
    expect(missionNumber(33)).toBe(16);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Hobbies & Free Time');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('Missions 01–15 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 15)).toEqual({ en: 'dd4a7cca', es: '6a50181c', fr: 'd49d989c' }); });
  it('Missions 17–30 are byte-for-byte unchanged by this pass', () => { expect(raw(16)).toEqual({ en: 'b01d6395', es: '01559b19', fr: '14432434' }); });
  it('the Everyday checkpoint still reuses the same two sentences, word for word', () => {
    for (const lang of LANGS) {
      expect(text(day(lang), `${lang}.phrase.hobby.i-love-surfing`)).toBe(at(Y_LOVE, lang));
      expect(text(day(lang), `${lang}.phrase.hobby.i-usually`)).toBe(at(Y_USUALLY, lang));
    }
  });
  it('EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.transferOnly ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.picture])];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const order = [N_FREE, Y_FUN, N_SURF, Y_LOVE, N_ELSE, Y_LIKE, N_WHEN, Y_USUALLY, N_MUSIC, Y_TOO, N_SPORT, Y_DONT, N_TRY, Y_TRY, N_SCHOOL, Y_ASK, N_TOMORROW];
      order.forEach((x, y) => expect(script(lang)[y]!.slice(5), lang).toBe(at(x, lang)));
    }
  });
});

describe('PRIOR LEARNING — verified, not assumed (learnedBefore(lang, 16))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 16);
  const chunk = (id: string, lang: CoverageLang): string => M16_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
  it('really prior: "Hi", "Yes", "No", "Great", "Nice" in every language; "Do you like" in English only — and none of them gets a card of its own', () => {
    for (const lang of LANGS) {
      for (const id of ['hi', 'yes', 'no', 'great', 'nice']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(true);
      for (const w of cardsOf(day(lang))) for (const id of ['hi', 'great', 'nice']) expect(plain(w.text).trim() === plain(chunk(id, lang)).trim(), `${lang} ${w.key}`).toBe(false);
    }
    expect(prior('en').knowsChunk('Do you like')).toBe(true);
    expect(prior('fr').knowsChunk('Tu aimes')).toBe(false);
    expect(prior('es').knowsChunk('te gusta')).toBe(false);
  });
  it('words that are prior are not re-taught as words: "free", "today", "evening", "tomorrow", "beach" — met only inside whole lines', () => {
    for (const w of ['free', 'today', 'evening', 'tomorrow', 'beach']) expect(prior('en').words.has(w), w).toBe(true);
    for (const lang of LANGS) for (const w of cardsOf(day(lang))) expect(w.line, `${lang} ${w.key}`).toBe(true);
  });
  it('NOT prior, and taught here: the hobbies, "love", "usually", "want to try" as a chunk, "Me neither", the diving school', () => {
    for (const w of ['surfing', 'love', 'drawing', 'usually', 'music', 'running', 'neither', 'diving', 'school', 'near', 'together']) expect(prior('en').words.has(w), w).toBe(false);
    for (const lang of LANGS) for (const id of ['love-surfing', 'usually-evening', 'want-to-try', 'me-neither', 'diving-school', 'like-music-too', 'dont-like-running']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(false);
  });
  it('dialogue-only or optional exposure never counts: a word planted only in an earlier conversation is not learned', () => {
    const planted = (l: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(l, n);
      if (n !== 15) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} Do you like surfing?` } : x)) } } };
    };
    expect(learnedBefore('en', 16, planted).words.has('surfing')).toBe(false);
  });
  it('this mission\'s own misses are optional too: cutting them out changes nothing anyone learns from Mission 16', () => {
    const noMiss = (l: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(l, n);
      if (n !== 16) return m;
      return { ...m, dialogues: { 'free-time-chat': { ...scene(m), nodes: scene(m).nodes.filter((x) => !/^m\d+$/.test(x.id)).map((x) => (x.choices ? { ...x, choices: x.choices.filter((c) => c.correct) } : x)) } } };
    };
    for (const lang of LANGS) {
      const a = learnedBefore(lang, 17);
      const b = learnedBefore(lang, 17, noMiss);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M16_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang]) && !(c.id in M16_TRANSFER)));
  for (const lang of LANGS) {
    it(`STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every new chunk taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a card fails the audit (love, like, usually, too, don\'t like, want to try, the diving school, the plan)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      expect(unprepared(without('hobby.line.love'), lang).join(' '), lang).toMatch(/love-surfing/);
      expect(unprepared(without('hobby.line.like'), lang).join(' '), lang).toMatch(/like-drawing/);
      expect(unprepared(without('hobby.line.usually'), lang).join(' '), lang).toMatch(/usually-evening/);
      expect(unprepared(without('hobby.line.too'), lang).join(' '), lang).toMatch(/like-music-too/);
      expect(unprepared(without('hobby.line.dont-like'), lang).join(' '), lang).toMatch(/dont-like-running/);
      expect(unprepared(without('hobby.line.want-to-try'), lang).join(' '), lang).toMatch(/want-to-try/);
      expect(unprepared(without('hobby.line.school'), lang).join(' '), lang).toMatch(/diving-school|good-idea/);
      expect(unprepared(without('hobby.line.tomorrow'), lang).join(' '), lang).toMatch(/go-together-tomorrow/);
    }
  });
});

describe('TRANSFER — a system, not a script', () => {
  it('1. "Do you like diving?" comes from the pattern: no card, no builder — its two parts ("Do you like ___?", "diving") are taught first', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(plain(w.text).includes(plain(at(Y_ASK, lang))), `${lang} ${w.key}`).toBe(false);
      expect(stepsOf(d, 'sentenceBuilder'), lang).toHaveLength(0);
      const first = returnAt(d);
      expect(first, lang).toBeGreaterThan(0);
      const chunkOf = (id: string): string => M16_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
      for (const part of M16_TRANSFER['return-question']!) {
        const taught = d.steps.slice(0, first).filter((s) => s.kind === 'prime' && s.words.some((w) => hasChunk(w.text, chunkOf(part))));
        expect(taught.length, `${lang} ${part}`).toBeGreaterThanOrEqual(1);
      }
      // the friend asked it three times — surfing, music, running — on the cards before you ask it
      const asked = cardsOf(d).filter((w) => [N_SURF, N_MUSIC, N_SPORT].some((x) => w.text === at(x, lang)));
      expect(asked.map((w) => w.key), lang).toEqual(['hobby.line.surf', 'hobby.line.music', 'hobby.line.sport']);
      // the moment itself: the friend's diving-school line → you ask back (an app-language prompt, never the sentence)
      const r = (d.steps[first] as QR).rounds[0]!;
      expect([heardIn(d, r), said(d, r)], lang).toEqual([at(N_SCHOOL, lang), at(Y_ASK, lang)]);
      expect(JSON.stringify((d.steps[first] as QR).label), lang).not.toContain(at(Y_ASK, lang));
    }
  });
  it('2. drawing uses the SAME preference system as surfing: the same board, the same four categories — a normal "yes" instead of the strongest', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const [surf, draw] = [d.steps[sortAt(d, 'surfing')] as VM, d.steps[sortAt(d, 'drawing')] as VM];
      expect(draw.tiles, lang).toEqual(surf.tiles);
      expect([surf.rounds[0]!.correct, draw.rounds[0]!.correct]).toEqual(['love', 'like']);
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.love')!.meaning.en).toMatch(/love — the strongest “yes”/);
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.like')!.meaning.en).toMatch(/like — a normal “yes”/);
    }
  });
  it('3. running uses the negative preference: "don\'t like" — its own category, its own card', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect((d.steps[sortAt(d, 'running')] as VM).rounds[0]!.correct).toBe('dislike');
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.dont-like')!.meaning.en).toMatch(/don't like — not for me/);
    }
  });
  it('4. want-to-try is distinct from like / love: its own category, its own row, its own meaning ("something new")', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect((d.steps[sortAt(d, 'diving')] as VM).rounds[0]!.correct).toBe('wantToTry');
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.want-to-try')!.meaning.en).toMatch(/want to try = something new I’d like to do/);
    }
    expect(new Set(CATEGORY_TILES.map((t) => t.id)).size).toBe(4);
    expect(freeTimeProfile(8)[1]).toMatch(/✨ Want to try: Diving/);
    expect(freeTimeProfile(8)[1]).not.toMatch(/Love: [^/]*Diving|Like: [^/]*Diving/);
  });
  it('5. no extra hobby vocabulary: every target-language word of the mission is a word of the locked conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const own = new Set(LOCKED[lang].flatMap((l) => plain(quotes(l.slice(5))).trim().split(' ')));
      for (const t of targetText(d)) for (const w of plain(quotes(t)).trim().split(' ')) expect(own.has(w), `${lang} “${w}” in “${t}”`).toBe(true);
      for (const t of targetText(d)) expect(t, lang).not.toMatch(EXTRA_HOBBIES);
      expect(appCopy(d), lang).not.toMatch(EXTRA_HOBBIES);
    }
  });
  it('6. no separate Flex Round: nothing in Mission 16 is transferOnly, and no step is labelled one', () => {
    for (const lang of LANGS) {
      expect(day(lang).steps.some((s) => 'transferOnly' in s && s.transferOnly), lang).toBe(false);
      expect(appCopy(day(lang)), lang).not.toMatch(/flex|גמיש/i);
    }
  });
});

describe('My Free Time — the profile', () => {
  it('7. it starts EMPTY by design (the briefing names your preferences in words; the profile fills as you place them): every row "?"', () => {
    expect(freeTimeProfile(0)[1]).toBe('🎯 My free time: 😍 Love: ? / 🙂 Like: ? / 🙅 Don’t like: ? / ✨ Want to try: ? / 🕒 When: ? ‖ 👋 My friend: ?');
    expect(freeTimeProfile(0)[0]).toBe('🎯 הזמן הפנוי שלי: 😍 אוהב מאוד: ? / 🙂 אוהב: ? / 🙅 לא אוהב: ? / ✨ רוצה לנסות: ? / 🕒 מתי: ? ‖ 👋 החבר: ?');
    expect(freeTimePlan(6)).toBeNull();
    for (const lang of LANGS) {
      const d = day(lang);
      expect(boardParts(d.steps[1]!), lang).toEqual(freeTimeProfile(0));
      expect(boardParts(d.steps[0]!), lang).toEqual([]); // the briefing shows no profile
    }
    const b = splitTimeBoard(freeTimeProfile(0)[1])!;
    expect(b.plan!.flatMap((c) => c.rows).every((r) => !r.known)).toBe(true);
  });
  it('8–12. surfing → LOVE · drawing → LIKE · music → LIKE · running → DON\'T LIKE · diving → WANT TO TRY', () => {
    expect(HOBBY_PREFERENCE).toEqual({ surfing: 'love', drawing: 'like', music: 'like', running: 'dislike', diving: 'wantToTry' });
    expect(freeTimeState(8).hobbyPreferences).toEqual(HOBBY_PREFERENCE);
    expect(freeTimeProfile(8)[1]).toBe('🎯 My free time: 😍 Love: Surfing / 🙂 Like: Drawing · Music / 🙅 Don’t like: Running / ✨ Want to try: Diving / 🕒 Drawing → Evening ‖ 👋 My friend: Surfing: a lot / Music: in the evening / Running: doesn’t like it either / Diving: loves it');
    for (const lang of LANGS) {
      const d = day(lang);
      for (const h of HOBBIES_IN_ORDER) expect((d.steps[sortAt(d, h)] as VM).rounds[0]!.correct, `${lang} ${h}`).toBe(HOBBY_PREFERENCE[h]);
    }
  });
  it('13. Drawing → Evening appears only after the timing line (the time choice), never before', () => {
    expect(freeTimeState(2).drawingTime).toBeNull();
    expect(freeTimeState(3).drawingTime).toBe('evening');
    for (const lang of LANGS) {
      const d = day(lang);
      const first = d.steps.findIndex((s) => boardParts(s).some((p) => /Drawing → Evening/.test(p)));
      expect(first, lang).toBeGreaterThan(timeAt(d));
      expect(first, lang).toBeGreaterThan(primeAt(d, 'hobby.line.usually'));
    }
  });
  it('14. no category is ever assigned incorrectly — at any stage, a hobby is unplaced or in its own category', () => {
    for (let n = 0; n <= 8; n++) {
      const s = freeTimeState(n as M16Reveal);
      for (const h of HOBBIES_IN_ORDER) expect([null, HOBBY_PREFERENCE[h]], `${n} ${h}`).toContain(s.hobbyPreferences[h]);
      for (const p of PREFERENCES) {
        const row = splitTimeBoard(freeTimeProfile(n as M16Reveal)[1])!.plan![0]!.rows.find((r) => r.text.includes(':') && r.text.split(':')[0]!.endsWith(p === 'love' ? 'Love' : p === 'like' ? 'Like' : p === 'dislike' ? 'Don’t like' : 'Want to try'))!;
        for (const h of HOBBIES_IN_ORDER) if (row.text.includes(h[0]!.toUpperCase() + h.slice(1))) expect(HOBBY_PREFERENCE[h], `${n} ${h}`).toBe(p);
      }
    }
  });
  it('every fact appears only after the line that reveals it — yours once you place or say it, your friend\'s once heard', () => {
    for (const lang of LANGS) expect(revealViolations(day(lang), lang), lang).toEqual([]);
  });
  it('negative mutations: the full profile shown on the first card, or a hobby placed before its sorting moment, is caught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const early = d.steps.map((s, i) => (i === 1 && s.kind === 'prime' ? { ...s, intro: { he: freeTimeProfile(8)[0], en: freeTimeProfile(8)[1] } } : s));
      expect(revealViolations(d, lang, early).length, lang).toBeGreaterThan(5);
      const sortSurf = sortAt(d, 'surfing');
      const leak = d.steps.map((s, i) => (i === sortSurf && s.kind === 'visualMatch' ? { ...s, label: { he: freeTimeProfile(1)[0], en: freeTimeProfile(1)[1] } } : s));
      expect(revealViolations(d, lang, leak).join(' '), lang).toMatch(/surfing → love/);
    }
  });
  it('the profile stays a small object: two columns, five rows of yours, at most four of your friend\'s, one plan — no score', () => {
    for (let n = 0; n <= 8; n++) {
      const b = splitTimeBoard(freeTimeProfile(n as M16Reveal)[1])!;
      expect(b.plan!).toHaveLength(2);
      expect(b.plan![0]!.rows).toHaveLength(5);
      expect(b.plan![1]!.rows.length).toBeLessThanOrEqual(4);
      expect(freeTimeProfile(n as M16Reveal).join(' ')).not.toMatch(/%|points|score|\d+\/\d+|נקודות/i);
    }
    const end = splitTimeBoard(FREE_TIME_MATCH[1])!;
    expect(end.route!.map((c) => c.text)).toEqual(['Diving school · near the beach', 'Tomorrow · together']);
    expect(end.plan!.flatMap((c) => c.rows).every((r) => r.known)).toBe(true);
    expect(renderToStaticMarkup(createElement(HotelStaySummary, { text: freeTimeProfile(3)[1] })).match(/data-known="false"/g)).toHaveLength(2); // after the time choice: don't like · want to try still "?" (the friend has said one thing: surfing)
  });
});

describe('SORT YOUR HOBBIES — the one game', () => {
  it('15. exactly five hobby concepts are classified — surfing, drawing, music, running, diving, once each', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const s = sorts(d);
      expect(s, lang).toHaveLength(5);
      expect(s.map((x) => x.rounds.length), lang).toEqual([1, 1, 1, 1, 1]);
      expect(s.map((x) => x.rounds[0]!.audio.en), lang).toEqual(HOBBIES_IN_ORDER.map((h) => at(SORT_LINE[h], lang)));
    }
  });
  it('16. every hobby gets equivalent presentation: the same label, the same tiles, the same quiet board, a picture from its slot in the same frame', () => {
    for (const lang of LANGS) {
      const s = sorts(day(lang));
      for (const x of s) {
        expect([x.label, x.tiles, x.quiet, x.challenge, x.ordered], lang).toEqual([x.label ? { ...x.label } : undefined, CATEGORY_TILES, true, undefined, undefined]);
        expect(x.label!.en!.split(' ¦ ').at(-1)).toBe('🎯 Sort your hobbies — listen, and tap where it goes.');
      }
      expect(s.map((x) => x.rounds[0]!.picture), lang).toEqual(HOBBIES_IN_ORDER.map((h) => ({ ...M16_SLOTS[h] })));
    }
    // the five hobby slots have the same shape: all placeholders now, or all pictures later — never a mix
    const shapes = HOBBIES_IN_ORDER.map((h) => Object.keys(M16_SLOTS[h]).sort().join());
    expect(new Set(shapes).size).toBe(1);
  });
  it('17. the categories are LOVE / LIKE / DON\'T LIKE / WANT TO TRY — the same four tiles as the profile\'s four rows', () => {
    expect(CATEGORY_TILES.map((t) => [t.id, t.caption!.en])).toEqual([['love', 'Love'], ['like', 'Like'], ['dislike', 'Don’t like'], ['wantToTry', 'Want to try']]);
    expect(CATEGORY_TILES.map((t) => t.caption!.he)).toEqual(['אוהב מאוד', 'אוהב', 'לא אוהב', 'רוצה לנסות']);
    const rows = splitTimeBoard(freeTimeProfile(0)[1])!.plan![0]!.rows.slice(0, 4).map((r) => r.text.replace(/: \?$/, ''));
    expect(rows).toEqual(CATEGORY_TILES.map((t) => `${t.emoji} ${t.caption!.en}`));
  });
  it('18. no score, no streak, no timer — no speed flag, no gamification copy', () => {
    for (const lang of LANGS) {
      for (const x of sorts(day(lang))) { expect(x.challenge).toBeUndefined(); expect(JSON.stringify(x)).not.toMatch(/score|points|streak|timer|second|⏱|נקודות|רצף|טיימר|שניות/i); }
      expect(appCopy(day(lang)), lang).not.toMatch(/score|streak|timer|⏱|נקודות|רצף|טיימר/i);
    }
  });
  it('19. no duplicate classification round: five distinct hobbies, five distinct lines, no second sorting pass', () => {
    for (const lang of LANGS) {
      const s = sorts(day(lang));
      expect(new Set(s.map((x) => x.rounds[0]!.picture!.emoji)).size).toBe(5);
      expect(new Set(s.map((x) => x.rounds[0]!.audio.en)).size).toBe(5);
      const allSortLines = stepsOf(day(lang), 'visualMatch').flatMap((x) => x.rounds.map((r) => r.audio.en)).filter((a) => HOBBIES_IN_ORDER.some((h) => at(SORT_LINE[h], lang) === a));
      expect(allSortLines, lang).toHaveLength(5);
    }
  });
  it('each sorting moment comes right after the hobby\'s own card — the answer moves the hobby into the profile', () => {
    const cardOf: Record<M16Hobby, string> = { surfing: 'hobby.line.love', drawing: 'hobby.line.like', music: 'hobby.line.too', running: 'hobby.line.dont-like', diving: 'hobby.line.want-to-try' };
    for (const lang of LANGS) {
      const d = day(lang);
      let last = 0;
      for (const h of HOBBIES_IN_ORDER) {
        expect(sortAt(d, h), `${lang} ${h}`).toBeGreaterThan(primeAt(d, cardOf[h]));
        expect(sortAt(d, h), `${lang} ${h}`).toBeGreaterThan(last);
        last = sortAt(d, h);
        const placedNext = boardParts(d.steps[sortAt(d, h) + 1]!).join(' ');
        expect(placedNext, `${lang} ${h}`).toContain(`${h[0]!.toUpperCase()}${h.slice(1)}`);
      }
    }
  });
});

describe('the time and the plan — deterministic UI, comprehension only', () => {
  it('when do you draw? Morning / Afternoon / Evening, in order — the line itself is heard, Evening is the answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const t = d.steps[timeAt(d)] as VM;
      expect([t.tiles.map((x) => x.id), t.ordered, t.rounds.map((r) => [r.audio.en, r.correct])]).toEqual([['morning', 'afternoon', 'evening'], true, [[at(Y_USUALLY, lang), 'evening']]]);
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.usually')!.meaning.en).toMatch(/usually = what I normally do/);
    }
    for (const x of TIME_TILES) { expect(x.image).toBeUndefined(); expect(x.caption!.he).toBeTruthy(); }
  });
  it('the diving school is comprehension only (one card, no quiz on school / near / beach); the plan is one check: tomorrow', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.school')!.meaning.en).toMatch(/diving school → near the beach/);
      expect(stepsOf(d, 'visualMatch').filter((s) => s.rounds.some((r) => r.audio.en === at(N_SCHOOL, lang)))).toHaveLength(0);
      const plan = stepsOf(d, 'visualMatch').filter((s) => s.tiles === PLAN_TILES || s.tiles.some((x) => x.id === 'tomorrow'));
      expect(plan.map((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[[at(N_TOMORROW, lang), 'tomorrow']]]);
      expect(cardsOf(d).find((w) => w.key === 'hobby.line.try-q')!.meaning.en).toMatch(/me neither = your friend doesn’t like it either/);
    }
  });
});

describe('production — eight locked learner lines, nothing invented', () => {
  const productions = (d: BootcampDayContent) => stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => ({ id: accepted(r), text: said(d, r) })));
  it('20–21. all eight canonical learner lines stay intact, and the full supported conversation has them all, in order — once', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cinematicTranscript(scene(d)).filter((l) => l.who === 'you').map((l) => l.en), lang).toEqual(YOU_LINES.map((y) => at(y, lang)));
      expect(stepsOf(d, 'dialogue'), lang).toHaveLength(1);
      expect(scene(d).cold, lang).toBeUndefined(); // supported: translations on
      for (const id of LEARNER_IDS) expect(SAID[id]![IX[lang]], `${lang} ${id}`).toBe(at(YOU_LINES[LEARNER_IDS.indexOf(id)]!, lang));
    }
  });
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : []));
  it('22. no help is SHORTENED to the core five: love · when · don\'t like · want to try · ask back — no meanings, no cards, no profile', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual([LOVE, USUALLY, DONT, TRY, ASK]);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect(run.some((s) => s.kind === 'prime')).toBe(false);
      for (const s of run) if (s.kind === 'quickReply') { expect(s.challenge).toBe(true); expect(s.label).toBeUndefined(); for (const r of s.rounds) { expect(r.situation).toBeUndefined(); expect(r.promptItemId ?? r.npc).toBeDefined(); } }
      for (const s of run) expect(boardParts(s), lang).toEqual([]);
    }
  });
  it('23. the final is SHORTENED and proves the system — ask · love · like · when · don\'t like · want to try · ask back (seven, one step, no profile on screen)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual([FUN, LOVE, LIKE, USUALLY, DONT, TRY, ASK]);
      const finals = d.steps.slice(videoAt(d) + 1).filter((s) => s.kind === 'quickReply');
      expect(finals, lang).toHaveLength(1);
      expect(boardParts(finals[0]!), lang).toEqual([]);
      // not the full dialogue again: music is not re-run, and three moves are said from the category alone
      expect((finals[0] as QR).rounds.filter((r) => r.situation).map((r) => r.situation!.en!.slice(0, 2)), lang).toEqual(['🏄', '🏃', '🤿']);
    }
  });
  it('24. no line of the friend is ever an answer', () => {
    for (const lang of LANGS) {
      const offered = stepsOf(day(lang), 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(day(lang), o.itemId))));
      for (const f of FRIEND) expect(offered, lang).not.toContain(at(f, lang));
      for (const c of scene(day(lang)).nodes.flatMap((n) => n.choices ?? [])) for (const f of FRIEND) expect(c.en, lang).not.toBe(at(f, lang));
    }
  });
  it('25. no invented learner sentence: every option is one of the eight lines, said whole; the mission has eight learner sentences and nine heard ones', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const allowed = YOU_LINES.map((y) => at(y, lang));
      for (const p of productions(d)) expect(allowed, lang).toContain(p.text);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) { expect(LEARNER_IDS as readonly string[], lang).toContain(strip(o.itemId)); expect(allowed, lang).toContain(o.text ?? text(d, o.itemId)); }
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.hobby.do-you-like', 'phrase.hobby.dont-like-running', 'phrase.hobby.i-like-drawing', 'phrase.hobby.i-love-surfing', 'phrase.hobby.i-usually', 'phrase.hobby.like-to-listen', 'phrase.hobby.want-to-try', 'phrase.hobby.what-for-fun',
        'reply.hobby.diving-school', 'reply.hobby.do-you-like-music', 'reply.hobby.do-you-like-surfing', 'reply.hobby.free-today', 'reply.hobby.go-together', 'reply.hobby.sport', 'reply.hobby.want-to-try-q', 'reply.hobby.what-else', 'reply.hobby.when-draw',
      ]);
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'hobbies-free-time').map((r) => strip(r.id)), lang).toEqual(['reply.hobby.me-neither']);
    }
  });
  it('every card is a whole line of this conversation — never a word card — and "Do you like diving?" is the one line with no card', () => {
    for (const lang of LANGS) {
      const lines = script(lang).map((l) => l.slice(5));
      for (const w of cardsOf(day(lang))) { expect(w.line, `${lang} ${w.key}`).toBe(true); expect(lines, `${lang} ${w.key}`).toContain(w.text); }
      expect(lines.filter((l) => !cardsOf(day(lang)).some((w) => w.text === l)), lang).toEqual([at(Y_ASK, lang)]);
    }
  });
});

describe('the opening briefing — your own preferences, nothing of the friend', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing is the brief\'s Hebrew, the only opening card, with no target-language line', () => {
    for (const lang of LANGS) {
      expect(briefing(lang).body.map((x) => x.he).join('\n')).toBe('אתה אוהב מאוד לגלוש, אוהב לצייר ולשמוע מוזיקה, לא אוהב לרוץ ורוצה לנסות צלילה.\nתנהל שיחה קצרה על זמן פנוי.');
      expect(briefing(lang).title.en).toBe('Mission 16: Hobbies & Free Time');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
      const b = JSON.stringify(briefing(lang));
      for (const l of LOCKED[lang]) expect(quotes(b), lang).not.toContain(quotes(l.slice(5)));
      expect(b, lang).not.toMatch(/school|beach|tomorrow|evening|בית ספר|חוף|מחר|ערב/i); // the friend's facts and the plan are not in your briefing
    }
  });
});

describe('bloat guards — light and fast', () => {
  it('22 meaningful interactions (target 22–25, preferred 22–23): 10 teaching · 5 no help · 7 final — and the conversation once', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(22);
      expect(interactions(d), lang).toBeLessThanOrEqual(25);
      expect(interactions({ ...d, steps: d.steps.slice(0, dialogueAt(d)) }), lang).toBe(10);
      expect(interactions({ ...d, steps: d.steps.slice(dialogueAt(d) + 1, videoAt(d)) }), lang).toBe(5);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(7);
      expect(scene(d).nodes.filter((n) => n.who === 'you' && !/^m/.test(n.id)), lang).toHaveLength(8);
    }
  });
  it('no builder, no swap, no quiz, no review deck, no tool cards, no ambush; low-value glue (Hi, Great, Nice, Me neither, Good idea) is never drilled', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'sentenceBuilder').length + stepsOf(d, 'quiz').length + stepsOf(d, 'replies').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'swap').length + stepsOf(d, 'ambush').length, lang).toBe(0);
      const audios = stepsOf(d, 'visualMatch').flatMap((s) => s.rounds.map((r) => r.audio.en));
      expect(audios, lang).toEqual([at(Y_LOVE, lang), at(Y_LIKE, lang), at(Y_USUALLY, lang), at(Y_TOO, lang), at(Y_DONT, lang), at(Y_TRY, lang), at(N_TOMORROW, lang)]);
    }
  });
  it('no grammar lesson anywhere in the copy', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(/grammar|tense|conjugat|infinitive|gerund|-ing\b|adverb|frequency|verb|word order|דקדוק|נטייה|פועל|תואר הפועל|זמן דקדוקי/i);
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
  it('every answered line of the friend shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = scene(day(lang));
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBe(16); // eight lines + eight slow re-asks
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
  it('answering mid-line stops the friend\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const q = tts.speak(N_SURF[0], 'en');
    void tts.speak(Y_LOVE[0], 'en');
    expect(await q).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_LOVE[0]);
    tts.cancelSpeech();
  });
  it('replay stays: nothing waits for "audio finished"', () => {
    const read = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(read('./Bootcamp.tsx')).toContain("🔊 {t('replayQuestion')}");
    expect(read('./PracticeSteps.tsx')).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
});

describe('serialisable state', () => {
  it('My Free Time serialises, and restoring it never leaks the future', () => {
    for (let n = 0; n <= 8; n++) {
      const s = JSON.parse(JSON.stringify(freeTimeState(n as M16Reveal))) as ReturnType<typeof freeTimeState>;
      expect(s).toEqual(freeTimeState(n as M16Reveal));
      expect(s.hobbyPreferences.surfing === null).toBe(n < 1);
      expect(s.hobbyPreferences.diving === null).toBe(n < 6);
      expect(s.drawingTime === null).toBe(n < 3);
      expect(s.divingSchoolKnown).toBe(n >= 7);
      expect(s.tomorrowPlan === null).toBe(n < 8);
    }
    expect(Object.keys(freeTimeState(0)).sort()).toEqual(['divingSchoolKnown', 'drawingTime', 'friend', 'hobbyPreferences', 'phase', 'tomorrowPlan']);
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M16_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M16_CONCEPTS.flatMap((c) => plain(quotes(c.chunk[lang])).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED here, VERIFIED PRIOR, or the one TRANSFER line (whose parts are covered)`, () => {
    const prior = learnedBefore(lang, 16);
    const rows = coverageOf(day(lang), lang, M16_CONCEPTS);
    for (const row of rows) {
      const c = M16_CONCEPTS.find((x) => x.id === row.id)!;
      if (row.id in M16_TRANSFER) {
        expect(row.byKind.meaning, row.id).toBe(0); // never shown as a sentence to learn
        expect(row.byKind.retrieval, row.id).toBeGreaterThanOrEqual(4);
        for (const part of M16_TRANSFER[row.id]!) expect(rows.find((r) => r.id === part)!.covered, `${lang} ${part}`).toBe(true);
        continue;
      }
      if (!prior.knowsChunk(c.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    }
    for (const id of ['for-fun', 'love-surfing', 'like-drawing', 'usually-evening', 'like-music-too', 'dont-like-running', 'want-to-try', 'do-you-like', 'diving']) expect(rows.find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
  });
  it('Mission 16\'s covered chunks feed prior learning for Mission 17 onward', () => {
    for (const lang of LANGS) {
      const ids = learnedBefore(lang, 17).concepts.filter((c) => c.mission === 16).map((c) => c.id.slice(4));
      expect(ids, lang).toContain('want-to-try');
      expect(ids, lang).not.toContain('return-question');
    }
  });
});

describe('visuals, the companion and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'quickReply' || s.kind === 'visualMatch') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'prime', 'quickReply', 'visualMatch', // free time · love → sort surfing
      'prime', 'visualMatch', // like → sort drawing
      'prime', 'visualMatch', // when → evening
      'prime', 'quickReply', 'visualMatch', // too → sort music
      'prime', 'visualMatch', // don't like → sort running
      'prime', 'visualMatch', // want to try → sort diving
      'prime', 'quickReply', // the diving school → you ask back
      'prime', 'visualMatch', 'receipt', // the plan → tomorrow
      'dialogue', 'receipt',
      'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'receipt', 'summary',
    ]);
  });
  it('visual slots: the two friends, five hobbies, the diving school, one result prop — placeholders, listed in the asset manifest (VISUAL PRODUCTION REQUIRED)', () => {
    expect(Object.keys(M16_SLOTS)).toEqual(['friends', 'surfing', 'drawing', 'music', 'running', 'diving', 'diving-school']);
    expect(Object.keys(M16_PROPS)).toEqual(['free-time-match']);
    for (const s of [...Object.values(M16_SLOTS), ...Object.values(M16_PROPS)]) { expect(s.emoji).toBeTruthy(); if (s.image) expect(s.image).toMatch(/^images\/mission16\/[a-z-]+\.jpg$/); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION16_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED/);
    for (const key of [...Object.keys(M16_SLOTS), ...Object.keys(M16_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language; tiles are captioned meanings, never pictures', () => {
    const looks = new Set(Object.values(M16_SLOTS).map((s) => s.image ?? s.emoji));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    for (const t of [...CATEGORY_TILES, ...TIME_TILES, ...PLAN_TILES]) { expect(t.caption!.he).toBeTruthy(); expect(t.image).toBeUndefined(); }
  });
  it('the companion introduces the first board as sorting a hobby — never "hear the price"', () => {
    const d = day('en');
    const coach = coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[15]!.id)!;
    expect(coach.line.en).toBe('Listen — and tap where the hobby goes.');
  });
  it('the round picture renders above the tiles — the placeholder now, the artwork once it exists — and never as a tile', async () => {
    const { VisualMatchStep } = await import('./PracticeSteps.js');
    const step = sorts(day('en'))[0]!;
    const html = renderToStaticMarkup(createElement(VisualMatchStep, { step, onDone: () => undefined }));
    expect(html).toContain('class="pmatch-picture"');
    expect(html).toContain('🏄');
    const withArt = { ...step, rounds: [{ ...step.rounds[0]!, picture: { emoji: '🏄', image: 'images/mission16/surfing.jpg' } }] };
    expect(renderToStaticMarkup(createElement(VisualMatchStep, { step: withArt, onDone: () => undefined }))).toMatch(/pmatch-picture[^]*images\/mission16\/surfing\.jpg/);
    expect((html.match(/class="ptile /g) ?? []).length).toBe(4);
  });
  it('video: no Mission 16 file in any language — the standard step is there and safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[15]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_16.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
