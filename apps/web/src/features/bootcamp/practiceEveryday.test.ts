import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, validatePracticeStep } from './practiceEngines.js';
import { beforeCueFreeze } from './cueFreeze.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import { sentenceCatalog } from '../core/phraseGroups.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/** Sentences the Mission 15 pass archived (it has its own test: mission15.test.ts). */
const M15_PASS_RETIRED = ['phrase.diet.is-spicy', 'reply.diet.let-me-check', 'reply.diet.make-without', 'reply.diet.contains-nuts', 'reply.diet.not-spicy', 'reply.diet.anything-else-allergic'];

/**
 * Practice depth — Missions 11–18 (Everyday Life). What each mission must now train is pinned,
 * stale drills stay gone, the checkpoint proves instead of teaching, and everything this pass was
 * NOT allowed to touch — Missions 01–10, Missions 19–30, the dialogues and sentences of 11–17 — is
 * fingerprinted.
 */
const LANGS = ['en', 'fr', 'es'] as const;
type Lang = (typeof LANGS)[number];
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const mission = (n: number, lang: Lang = 'en'): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const stepsOf = <K extends BootcampStep['kind']>(day: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] =>
  day.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (day: BootcampDayContent, id: string): string => day.items.find((i) => strip(i.id) === id)!.text;
const taught = (day: BootcampDayContent): string[] => stepsOf(day, 'tool').map((s) => strip(s.itemId));
const reviewed = (day: BootcampDayContent): string[] => stepsOf(day, 'swipe').flatMap((s) => s.itemIds.map(strip));
const rush = (day: BootcampDayContent) => stepsOf(day, 'quickReply').find((s) => s.challenge)!;

/* ── vocabulary: what a learner has met ──────────────────────────────────────────────────────── */

const PROPER = new Set(['cohen', 'mama', 'rosa']);
const words = (s: string): string[] => s.toLowerCase().replace(/[’`]/g, "'").split(/[^\p{L}']+/u).map((w) => w.replace(/^'+|'+$/g, '')).filter((w) => w && !PROPER.has(w));
function lines(day: BootcampDayContent, skipChallenge = false): string[] {
  const out: string[] = day.items.map((i) => i.text);
  for (const d of Object.values(day.dialogues)) for (const n of d.nodes) { if (n.en) out.push(n.en); for (const c of n.choices ?? []) out.push(c.en); }
  for (const s of day.steps) {
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
    if (s.kind === 'ambush' && s.mode !== 'recovery') out.push(s.npc.en);
    if (s.kind === 'quickReply' && !(skipChallenge && s.challenge)) for (const r of s.rounds) { if (r.npc) out.push(r.npc.en); for (const o of r.options) if (o.text) out.push(o.text); }
    if (s.kind === 'visualMatch' || s.kind === 'miniMap') out.push(...s.rounds.map((r) => r.audio.en));
    if (s.kind === 'swap') for (const r of s.rounds) for (const o of r.options) out.push(fillFrame(r.frame, o.slot));
    if (s.kind === 'matchPairs') for (const p of s.pairs) if (p.answerText) out.push(p.answerText);
    if (s.kind === 'sentenceBuilder') for (const r of s.rounds) out.push(r.chunks.join(' '));
  }
  return out;
}
/** Every word met up to a mission — a French / Spanish elided form ("l’allée") also teaches the bare word ("allée"). */
const vocabulary = (lang: Lang, upTo: number, skipChallengeOfLast = false): Set<string> =>
  new Set(Array.from({ length: upTo }, (_, i) => lines(mission(i + 1, lang), skipChallengeOfLast && i + 1 === upTo)).flat().flatMap(words).flatMap((w) => [w, w.replace(/^(?:l|d|j|qu|n|s|c|m|t)'/u, '')]));
const unknownIn = (said: string[], known: Set<string>): string[] => [...new Set(said.flatMap(words).filter((w) => !known.has(w)))];

/* ── scope ───────────────────────────────────────────────────────────────────────────────────── */

// Missions 06–10 got their own pedagogical passes — pinned in mission06…10.test.ts.

describe('scope: only the Practice of Missions 11–18 changed', () => {
  // Scene transitions became non-spoken cues after these fingerprints were taken; `beforeCueFreeze`
  // puts the labels back, so the fingerprints still prove nothing else moved (see cueFreeze.ts).
  const slice = (lang: Lang, a: number, b: number): BootcampDayContent[] => BOOTCAMP_PLAN.slice(a, b).map((m) => beforeCueFreeze(MISSIONS_BY_LANG[lang]![m.day]!, lang));

  it('Missions 08–10 are not this pass\'s: each has its own (mission08.test.ts, mission09.test.ts, mission10.test.ts)', () => {
    for (const lang of LANGS) expect(slice(lang, 9, 10)[0]!.steps.some((s) => s.kind === 'checkpoint'), lang).toBe(true);
  });
  // (Missions 11–18: each has its own pass since — mission11.test.ts … mission18.test.ts.)
  it('five retired sentences left their missions — and nothing else did', () => {
    const gone = ['phrase.rest.menu', 'reply.rest.how-was-it', 'reply.rest.dessert', 'reply.diet.good-option', 'reply.super.weigh-it'];
    for (const lang of LANGS) {
      // (Mission 14's sentences: its own pass since — mission14.test.ts.)
      // (Mission 15's sentences: its own pass since — mission15.test.ts.)
      // (Mission 16's sentences: its own pass since — mission16.test.ts.)
      // (Mission 17's sentences: its own pass since — mission17.test.ts.)
      // Not in ANY Core mission: so not in the sentence library, Listen, review, or "what did I learn".
      const everywhere = BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => strip(i.id)));
      for (const id of gone) expect(everywhere, `${lang} ${id}`).not.toContain(id);
      const library = sentenceCatalog(lang).groups.flatMap((g) => g.items.map((i) => strip(i.id)));
      for (const id of gone) expect(library, `${lang} ${id}`).not.toContain(id);
      // No step and no dialogue line of any Core mission still points at one.
      const used = JSON.stringify(BOOTCAMP_PLAN.map((m) => [MISSIONS_BY_LANG[lang]![m.day]!.steps, MISSIONS_BY_LANG[lang]![m.day]!.dialogues]));
      for (const id of gone) expect(used.includes(`${lang}.${id}"`), `${lang} ${id}`).toBe(false);
      // …and they are kept, id and wording, in the archive.
      expect(RETIRED_SENTENCES[lang].filter((r) => !M15_PASS_RETIRED.includes(r.id.slice(3)) && r.retiredFrom !== 'hotel-check-in' && r.retiredFrom !== 'coffee-shop' && r.retiredFrom !== 'directions' && r.retiredFrom !== 'airport-border' && r.retiredFrom !== 'taxi' && r.retiredFrom !== 'public-transport' && r.retiredFrom !== 'shopping' && r.retiredFrom !== 'hobbies-free-time' && !['reply.super.over-there', 'reply.super.sold-out'].includes(r.id.slice(3))).map((r) => strip(r.id)), lang).toEqual(gone);
      for (const r of RETIRED_SENTENCES[lang]) { expect(r.text.length, r.id).toBeGreaterThan(3); expect(r.meaning.he, r.id).toBeTruthy(); expect(BOOTCAMP_PLAN.some((m) => m.id === r.retiredFrom), r.id).toBe(true); }
    }
    expect(RETIRED_SENTENCES.en.filter((r) => !M15_PASS_RETIRED.includes(r.id.slice(3)) && r.retiredFrom !== 'hotel-check-in' && r.retiredFrom !== 'coffee-shop' && r.retiredFrom !== 'directions' && r.retiredFrom !== 'airport-border' && r.retiredFrom !== 'taxi' && r.retiredFrom !== 'public-transport' && r.retiredFrom !== 'shopping' && r.retiredFrom !== 'hobbies-free-time' && !['reply.super.over-there', 'reply.super.sold-out'].includes(r.id.slice(3))).map((r) => r.text)).toEqual(['The menu, please.', 'How was everything?', 'Would you like dessert?', 'This one is a good option for you.', 'You need to weigh it first.']);
  });
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(10, 18).map((m) => `${m.id}:${m.day}`)).toEqual([
      'small-talk:22', 'time-plans:31', 'home-family:32', 'restaurant-meal:4', 'special-requests-allergies:13', 'hobbies-free-time:33', 'supermarket:16', 'food-day-checkpoint:17',
    ]);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (let n = 11; n <= 17; n++) for (const s of mission(n, lang).steps) expect(allowed, `${lang} M${n}`).toContain(s.kind); // Mission 18: the adaptive checkpoint (mission18.test.ts)
  });
});

describe('all three languages get the same practice, each in its own words', () => {
  it('every step of Missions 11–18 validates in English, French and Spanish', () => {
    for (const lang of LANGS) for (let n = 11; n <= 18; n++) {
      const day = mission(n, lang);
      const ids = new Set(day.items.map((i) => i.id));
      for (const s of day.steps) expect(validatePracticeStep(s, ids, (id) => day.items.find((i) => i.id === id)?.text), `${lang} M${n} ${s.kind}`).toEqual([]);
    }
  });
  it('same steps, rounds and accepted answers in every language', () => {
    const shape = (s: BootcampStep): unknown => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId)])];
      if (s.kind === 'swap') return [s.kind, s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning])])];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'ambush') return [s.kind, s.mode, strip(s.correctItemId), strip(s.wrongItemId)];
      if (s.kind === 'tool') return [s.kind, strip(s.itemId), s.label];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'quiz') return [s.kind, strip(s.itemId), s.wrongIds.map(strip)];
      if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
      if (s.kind === 'receipt') return [s.kind, s.text];
      return s.kind;
    };
    // (Missions 11–13 have their own passes since — their parity, tile ids included, is proved in mission11/12/13.test.ts.)
    for (let n = 16; n <= 18; n++) for (const lang of ['fr', 'es'] as const) expect(mission(n, lang).steps.map(shape), `${lang} M${n}`).toEqual(mission(n).steps.map(shape));
  });
  it('sentence-builder chunks are each language\'s own and spell the taught sentence exactly', () => {
    for (let n = 11; n <= 17; n++) for (const lang of LANGS) {
      const day = mission(n, lang);
      for (const s of stepsOf(day, 'sentenceBuilder')) for (const r of s.rounds) {
        expect(r.chunks.join(' '), `${lang} M${n}`).toBe(text(day, strip(r.itemId)));
        expect(r.chunks.length, `${lang} M${n}`).toBeGreaterThanOrEqual(3);
      }
    }
    const fr = stepsOf(mission(13, 'fr'), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
    const en = stepsOf(mission(13), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
    for (const c of fr) expect(en).not.toContain(c);
  });
  it('register: strangers and staff are vous / usted; friends keep the approved tu / tú', () => {
    const informal = (n: number, lang: Lang, banned: string[]): string[] => lines(mission(n, lang)).flatMap(words).filter((w) => banned.includes(w));
    for (const n of [11, 14, 15, 17]) {
      expect(informal(n, 'fr', ['tu', 'toi', 'ton', 'ta', 'tes']), `fr M${n}`).toEqual([]);
      expect(informal(n, 'es', ['tú', 'tu', 'tus', 'te', 'contigo', 'tienes', 'quieres', 'puedes', 'estás']), `es M${n}`).toEqual([]);
    }
    // Friends: the informal register the dialogues already use is kept, not "corrected" — in what
    // the friend says in the conversation AND in every new practice line. (The shared conversation-
    // help phrases stay as they are everywhere.)
    const friendSays = (n: number, lang: Lang): string[] => {
      const d = mission(n, lang);
      return [
        ...Object.values(d.dialogues).flatMap((dl) => dl.nodes.filter((x) => x.who === 'npc').map((x) => x.en)),
        ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => (r.npc ? [r.npc.en] : []))),
        ...stepsOf(d, 'swap').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => fillFrame(r.frame, o.slot)))),
      ].flatMap(words);
    };
    for (const n of [12, 13, 16]) {
      expect(friendSays(n, 'fr').filter((w) => w === 'tu').length, `fr M${n}`).toBeGreaterThan(0);
      expect(friendSays(n, 'fr').filter((w) => ['vous', 'votre', 'vos'].includes(w)), `fr M${n}`).toEqual([]);
      expect(friendSays(n, 'es').filter((w) => ['usted', 'su', 'sus'].includes(w)), `es M${n}`).toEqual([]);
    }
  });
  it('the closing review is selective: at most 12 cards, everything taught is in it, nothing twice', () => {
    for (const n of [11, 12, 13]) { // Missions 14–17 have no closing review since their own passes (mission14 … mission17.test.ts)
      const day = mission(n);
      const review = reviewed(day);
      expect(review.length, `M${n}`).toBeLessThanOrEqual(12);
      expect(review.length, `M${n}`).toBeLessThan(day.items.length);
      for (const id of taught(day)) expect(review, `M${n} ${id}`).toContain(id);
      expect(new Set(review).size, `M${n}`).toBe(review.length);
    }
  });
  it('every teaching mission ends on a chain at natural speed made ONLY of its own conversation\'s lines', () => {
    for (const n of [11, 12, 13]) for (const lang of LANGS) { // Missions 14–17: their own no-help runs (mission14 … mission17.test.ts)
      const day = mission(n, lang);
      const speed = rush(day);
      expect(speed, `${lang} M${n}`).toBeDefined();
      expect(speed.label, `${lang} M${n}`).toBeUndefined(); // announced as a speed moment — no internal name
      const said = speed.rounds.map((r) => r.npc!.en);
      const spoken = Object.values(day.dialogues).flatMap((d) => d.nodes.filter((x) => x.who === 'npc').map((x) => x.en));
      for (const line of said) expect(spoken, `${lang} M${n} “${line}”`).toContain(line);
      expect(unknownIn(said, vocabulary(lang, n, true)), `${lang} M${n}`).toEqual([]); // not one new word
      expect(speed.rounds.length, `${lang} M${n}`).toBeGreaterThanOrEqual(4);
      for (const r of speed.rounds) expect(r.options.some((o) => o.correct) && r.options.some((o) => !o.correct), `${lang} M${n}`).toBe(true);
    }
  });
  // (Active retrieval: Missions 11–17 count their interactions in their own tests — mission11 … mission17.test.ts.)
  it('no grammar lecture: no label, cue or proof card of the new steps uses grammar terms', () => {
    for (let n = 11; n <= 18; n++) {
      const copy = JSON.stringify(mission(n).steps.filter((s) => s.kind !== 'tool' && s.kind !== 'talk').map((s) => ('label' in s ? s.label : s.kind === 'receipt' ? s.text : s.kind === 'swap' ? s.rounds.map((r) => r.cue) : null)));
      expect(copy, `M${n}`).not.toMatch(/\b(verb|noun|tense|conjugat|adverb|grammar|infinitive)\b|פועל|דקדוק|זמן עבר|שם עצם/i);
    }
  });
});

/* ── Mission 11 — Small Talk & Recommendations: its own pass since — mission11.test.ts ──────────── */

/* ── Mission 12 — Time & Plans: its own pass since — mission12.test.ts ─────────────────────────── */

/* ── Mission 13 — Home, Family & Daily Routine: its own pass since — mission13.test.ts ──────────── */

/* ── Mission 14 — Restaurant Meal: its own pass since — mission14.test.ts ──────────────────────── */

/* ── Mission 15 — Food Preferences & Allergies: its own pass since — mission15.test.ts ─────────── */

/* ── Mission 16 — Hobbies & Free Time: its own pass since — mission16.test.ts ──────────────────── */

/* ── Mission 17 — Supermarket & Everyday Shopping: its own pass since — mission17.test.ts ────────── */

/* ── Mission 18 — CHECKPOINT: Everyday Day: its own pass since — mission18.test.ts ─────────────── */
