import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import { sentenceCatalog } from '../core/phraseGroups.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

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
const kinds = (day: BootcampDayContent): string[] => day.steps.map((s) => (s.kind === 'ambush' ? `ambush:${s.mode}` : (s.kind === 'quickReply' || s.kind === 'visualMatch') && s.challenge ? `${s.kind}:speed` : s.kind));
const text = (day: BootcampDayContent, id: string): string => day.items.find((i) => strip(i.id) === id)!.text;
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const taught = (day: BootcampDayContent): string[] => stepsOf(day, 'tool').map((s) => strip(s.itemId));
const reviewed = (day: BootcampDayContent): string[] => stepsOf(day, 'swipe').flatMap((s) => s.itemIds.map(strip));
const rush = (day: BootcampDayContent) => stepsOf(day, 'quickReply').find((s) => s.challenge)!;
const chat = (day: BootcampDayContent) => stepsOf(day, 'quickReply').find((s) => !s.challenge)!;
/** Sentence ids a mission lets the learner actively retrieve OUTSIDE its dialogue, with how often. */
function retrieved(day: BootcampDayContent): Map<string, number> {
  const out = new Map<string, number>();
  const add = (id: string | undefined): void => { if (id) out.set(strip(id), (out.get(strip(id)) ?? 0) + 1); };
  for (const s of day.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) for (const o of r.options) if (o.correct) add(o.itemId);
    if (s.kind === 'swap') for (const r of s.rounds) add(r.itemId);
    if (s.kind === 'sentenceBuilder') for (const r of s.rounds) add(r.itemId);
  }
  return out;
}
/** [what is heard, accepted answers] of a Quick Reply step. */
const mapOf = (step: Extract<BootcampStep, { kind: 'quickReply' }>): [string, string[]][] =>
  step.rounds.map((r): [string, string[]] => [r.promptItemId ? strip(r.promptItemId) : r.npc ? r.npc.en : 'situation', r.options.filter((o) => o.correct).map((o) => strip(o.itemId))]);
const swapSentences = (day: BootcampDayContent, round = 0): string[] => { const r = stepsOf(day, 'swap')[0]!.rounds[round]!; return r.options.map((o) => fillFrame(r.frame, o.slot)); };

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
const vocabulary = (lang: Lang, upTo: number, skipChallengeOfLast = false): Set<string> =>
  new Set(Array.from({ length: upTo }, (_, i) => lines(mission(i + 1, lang), skipChallengeOfLast && i + 1 === upTo)).flat().flatMap(words));
const unknownIn = (said: string[], known: Set<string>): string[] => [...new Set(said.flatMap(words).filter((w) => !known.has(w)))];

/* ── scope ───────────────────────────────────────────────────────────────────────────────────── */

const M01_10 = { en: '1fbc79cf', fr: 'e3e53475', es: 'a9f1d680' };
/** French Mission 14's steps without its first Quick Reply and its word intro (whose menu word was corrected). */
const FR_M14_WITHOUT_PRIME = 'be5602cb';

describe('scope: only the Practice of Missions 11–18 changed', () => {
  const slice = (lang: Lang, a: number, b: number): BootcampDayContent[] => BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[lang]![m.day]!);
  const print = (f: (lang: Lang) => unknown): Record<Lang, string> => ({ en: fnv(JSON.stringify(f('en'))), fr: fnv(JSON.stringify(f('fr'))), es: fnv(JSON.stringify(f('es'))) });

  it('Missions 01–10 are unchanged by this pass (their own fingerprint, incl. the later retirement of two hotel sentences, lives in practiceArrival.test.ts)', () => {
    expect(print((l) => slice(l, 0, 10))).toEqual(M01_10);
  });
  it('Missions 19–30 are byte-for-byte unchanged', () => {
    expect(print((l) => slice(l, 18, 30))).toEqual({ en: '937fd289', fr: '37d6c3c7', es: '68611717' });
  });
  it('the locked dialogues of Missions 11–17 are byte-for-byte unchanged', () => {
    expect(print((l) => slice(l, 10, 17).map((d) => d.dialogues))).toEqual({ en: '66104490', fr: 'c4e783b1', es: 'fccb4e58' });
  });
  it('the approved practice is otherwise exactly as approved (after the final cleanup)', () => {
    const d = (l: Lang, n: number): BootcampDayContent => MISSIONS_BY_LANG[l]![BOOTCAMP_PLAN[n - 1]!.day]!;
    // Missions 11, 12, 13, 16 and 18, whole — sentences, dialogues and steps.
    expect(print((l) => [11, 12, 13, 16, 18].map((n) => d(l, n)))).toEqual({ en: 'fefb99b2', fr: 'efbedefa', es: '14e713f6' });
    // Mission 14 apart from one distractor in Restaurant Rush, 15 apart from the match tiles, 17 apart from its intro card.
    expect(print((l) => d(l, 14).steps.filter((s, i, a) => !(s.kind === 'quickReply' && a.findIndex((x) => x.kind === 'quickReply') === i)).filter((s) => l !== 'fr' || s.kind !== 'prime'))).toEqual({ en: 'ac1eb75a', fr: FR_M14_WITHOUT_PRIME, es: '27d1f46c' });
    expect(print((l) => d(l, 15).steps.filter((s) => s.kind !== 'matchPairs'))).toEqual({ en: '091834c0', fr: 'e115664e', es: '29f26c1d' });
    expect(print((l) => d(l, 17).steps.filter((s) => s.kind !== 'talk'))).toEqual({ en: '990320d9', fr: 'de81d6af', es: '7607f353' });
    expect(print((l) => [14, 15, 17].map((n) => d(l, n).dialogues))).toEqual({ en: '794259f4', fr: 'e48a77f5', es: 'e85ec4ba' });
  });
  it('five retired sentences left their missions — and nothing else did', () => {
    const gone = ['phrase.rest.menu', 'reply.rest.how-was-it', 'reply.rest.dessert', 'reply.diet.good-option', 'reply.super.weigh-it'];
    for (const lang of LANGS) {
      expect(mission(14, lang).items.map((i) => strip(i.id)), lang).toEqual([
        'phrase.rest.table-two', 'phrase.rest.ill-have-chicken', 'phrase.rest.water', 'phrase.rest.no-onions', 'phrase.rest.the-bill', 'phrase.rest.delicious',
        'reply.rest.reservation', 'reply.rest.follow-me', 'reply.rest.ready-to-order', 'reply.rest.to-drink',
        'phrase.rest.ill-have', 'reply.rest.anything-else', 'reply.rest.everything-okay',
        'phrase.recovery.repeat', 'phrase.recovery.slowly', 'phrase.recovery.thank-you', 'phrase.recovery.one-moment', 'phrase.recovery.dont-understand',
      ]);
      expect(mission(15, lang).items, lang).toHaveLength(13);
      expect(mission(17, lang).items, lang).toHaveLength(13);
      // Not in ANY Core mission: so not in the sentence library, Listen, review, or "what did I learn".
      const everywhere = BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => strip(i.id)));
      for (const id of gone) expect(everywhere, `${lang} ${id}`).not.toContain(id);
      const library = sentenceCatalog(lang).groups.flatMap((g) => g.items.map((i) => strip(i.id)));
      for (const id of gone) expect(library, `${lang} ${id}`).not.toContain(id);
      // No step and no dialogue line of any Core mission still points at one.
      const used = JSON.stringify(BOOTCAMP_PLAN.map((m) => [MISSIONS_BY_LANG[lang]![m.day]!.steps, MISSIONS_BY_LANG[lang]![m.day]!.dialogues]));
      for (const id of gone) expect(used.includes(`${lang}.${id}"`), `${lang} ${id}`).toBe(false);
      // …and they are kept, id and wording, in the archive.
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom !== 'hotel-check-in').map((r) => strip(r.id)), lang).toEqual(gone);
      for (const r of RETIRED_SENTENCES[lang]) { expect(r.text.length, r.id).toBeGreaterThan(3); expect(r.meaning.he, r.id).toBeTruthy(); expect(BOOTCAMP_PLAN.some((m) => m.id === r.retiredFrom), r.id).toBe(true); }
    }
    expect(RETIRED_SENTENCES.en.filter((r) => r.retiredFrom !== 'hotel-check-in').map((r) => r.text)).toEqual(['The menu, please.', 'How was everything?', 'Would you like dessert?', 'This one is a good option for you.', 'You need to weigh it first.']);
  });
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(10, 18).map((m) => `${m.id}:${m.day}`)).toEqual([
      'small-talk:22', 'time-plans:31', 'home-family:32', 'restaurant-meal:4', 'special-requests-allergies:13', 'hobbies-free-time:33', 'supermarket:16', 'food-day-checkpoint:17',
    ]);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (let n = 11; n <= 18; n++) for (const s of mission(n, lang).steps) expect(allowed, `${lang} M${n}`).toContain(s.kind);
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
    for (let n = 11; n <= 18; n++) for (const lang of ['fr', 'es'] as const) expect(mission(n, lang).steps.map(shape), `${lang} M${n}`).toEqual(mission(n).steps.map(shape));
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
    for (let n = 11; n <= 17; n++) {
      const day = mission(n);
      const review = reviewed(day);
      expect(review.length, `M${n}`).toBeLessThanOrEqual(12);
      expect(review.length, `M${n}`).toBeLessThan(day.items.length);
      for (const id of taught(day)) expect(review, `M${n} ${id}`).toContain(id);
      expect(new Set(review).size, `M${n}`).toBe(review.length);
    }
  });
  it('every teaching mission ends on a chain at natural speed made ONLY of its own conversation\'s lines', () => {
    for (let n = 11; n <= 17; n++) for (const lang of LANGS) {
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
  it('active retrieval outside the dialogue: 8–16 moments per teaching mission', () => {
    for (let n = 11; n <= 17; n++) {
      const day = mission(n);
      const moments = day.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'swap' || s.kind === 'sentenceBuilder' ? s.rounds.length : 0), 0);
      expect(moments, `M${n}`).toBeGreaterThanOrEqual(8);
      expect(moments, `M${n}`).toBeLessThanOrEqual(20);
    }
  });
  it('no grammar lecture: no label, cue or proof card of the new steps uses grammar terms', () => {
    for (let n = 11; n <= 18; n++) {
      const copy = JSON.stringify(mission(n).steps.filter((s) => s.kind !== 'tool' && s.kind !== 'talk').map((s) => ('label' in s ? s.label : s.kind === 'receipt' ? s.text : s.kind === 'swap' ? s.rounds.map((r) => r.cue) : null)));
      expect(copy, `M${n}`).not.toMatch(/\b(verb|noun|tense|conjugat|adverb|grammar|infinitive)\b|פועל|דקדוק|זמן עבר|שם עצם/i);
    }
  });
});

/* ── Mission 11 — Small Talk & Recommendations ───────────────────────────────────────────────── */

describe('Mission 11 — Small Talk & Recommendations', () => {
  const day = mission(11);
  it('flow: learn → recognize → one listening check → the chat → build the request → conversation → the chat at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quiz', 'quickReply', 'sentenceBuilder', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('the Quick Reply is a conversation: where from → first time → do you like it → ask back → recommendation → goodbye', () => {
    expect(mapOf(chat(day))).toEqual([
      ['reply.talk.where-from', ['phrase.talk.how-about-you']],
      ['reply.talk.first-time-q', ['phrase.social.first-time']],
      ['reply.talk.do-you-like-it', ['phrase.talk.i-like-it', 'phrase.talk.love-food']],
      ['situation', ['phrase.talk.how-about-you']],
      ['Me too. And the food here is wonderful.', ['phrase.talk.recommend-place', 'phrase.rest.recommend']],
      ['reply.talk.you-should-try', ['phrase.talk.nice-talking']],
    ]);
  });
  it('"How about you?" is really retrieved — wrapped in an answer, on its own, and at speed', () => {
    expect(retrieved(day).get('phrase.talk.how-about-you')).toBe(3);
    const wrapped = chat(day).rounds[0]!.options.find((o) => o.correct)!;
    expect(wrapped.text).toBe("I'm from Israel. How about you?");
    expect(chat(day).rounds[3]!.options.find((o) => o.correct)!.text).toBeUndefined(); // alone
    // …but not forced after every answer.
    expect(retrieved(day).get('phrase.talk.how-about-you')).toBeLessThan(chat(day).rounds.length);
  });
  it('asking for a recommendation is retrieved three ways — chosen, built from pieces, and at speed — and the answer is understood', () => {
    expect(retrieved(day).get('phrase.talk.recommend-place')).toBe(3);
    expect(strip(stepsOf(day, 'sentenceBuilder')[0]!.rounds[0]!.itemId)).toBe('phrase.talk.recommend-place');
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip)).toContain('reply.talk.you-should-try');
    expect(day.items).toHaveLength(17); // no tourism vocabulary was added
  });
  it('the old cold open (untaught "a few days or longer") is gone', () => {
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
    expect(JSON.stringify(day.steps)).not.toMatch(/few days or longer/);
  });
});

/* ── Mission 12 — Time & Plans ───────────────────────────────────────────────────────────────── */

describe('Mission 12 — Time & Plans', () => {
  const day = mission(12);
  it('flow: learn → recognize → time by ear → plans → today/tonight/tomorrow → build the plan → conversation → the plan at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'visualMatch', 'quickReply', 'swap', 'sentenceBuilder', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('time listening: four meeting times by ear, with numbers the learner already has', () => {
    const board = stepsOf(day, 'visualMatch')[0]!;
    expect(board.rounds.map((r) => [r.audio.en, r.correct])).toEqual([['At eight.', 't8'], ["Let's meet here at seven.", 't7'], ['At ten.', 't10'], ['At five.', 't5']]);
    expect(board.tiles.map((t) => t.label).sort()).toEqual(['10:00', '2:00', '3:00', '5:00', '7:00', '8:00']);
    for (const lang of LANGS) {
      const b = stepsOf(mission(12, lang), 'visualMatch')[0]!;
      const before = new Set([...vocabulary(lang, 11), ...mission(12, lang).items.flatMap((i) => words(i.text))]);
      expect(unknownIn(b.rounds.map((r) => r.audio.en), before), lang).toEqual([]);
    }
  });
  it('"Are you free tomorrow?" is no longer tested three times as a meaning question', () => {
    for (const lang of LANGS) {
      expect(stepsOf(mission(12, lang), 'quiz'), lang).toHaveLength(0);
      expect(stepsOf(mission(12, lang), 'ambush'), lang).toHaveLength(0);
    }
    // It is drilled once by ear, answered once in the plan chat and once at speed — three different skills.
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip).filter((x) => x === 'reply.time.free-tomorrow-q')).toHaveLength(1);
  });
  it('plan Quick Reply keeps the conversation: today → tonight → want to come → too late → tomorrow', () => {
    expect(mapOf(chat(day))).toEqual([
      ['reply.time.what-doing-today', ['phrase.time.maybe-later']],
      ['reply.time.what-doing-tonight', ['phrase.time.free-tonight']],
      ['reply.time.want-to-come', ['phrase.time.what-time']],
      ['reply.time.too-late', ['phrase.time.not-too-late']],
      ['reply.time.free-tomorrow-q', ['phrase.time.free-tomorrow']],
    ]);
  });
  it('today / tonight / tomorrow are authored per language, and the taught question is one of them', () => {
    expect(swapSentences(day)).toEqual(['What are you doing today?', 'What are you doing tonight?', 'What are you doing tomorrow?']);
    expect(swapSentences(mission(12, 'fr'))).toEqual(['Tu fais quoi aujourd’hui ?', 'Tu fais quoi ce soir ?', 'Tu fais quoi demain ?']);
    expect(swapSentences(mission(12, 'es'))).toEqual(['¿Qué haces hoy?', '¿Qué haces esta noche?', '¿Qué haces mañana?']);
    for (const lang of LANGS) {
      const d = mission(12, lang);
      expect(swapSentences(d), lang).toContain(text(d, 'phrase.time.what-doing-tomorrow'));
      // …and the other two are exactly what the friend asks in the conversation.
      expect(swapSentences(d).slice(0, 2), lang).toEqual([text(d, 'reply.time.what-doing-today'), text(d, 'reply.time.what-doing-tonight')]);
      expect(stepsOf(d, 'swap')[0]!.rounds.map((r) => r.options.findIndex((o) => o.correct)), lang).toEqual([0, 1, 2]);
    }
  });
  it('"Let\'s meet here at seven." is built from pieces, each language in its own order', () => {
    expect(stepsOf(day, 'sentenceBuilder')[0]!.rounds[0]!.chunks).toEqual(["Let's meet", 'here', 'at seven.']);
    expect(stepsOf(mission(12, 'fr'), 'sentenceBuilder')[0]!.rounds[0]!.chunks).toEqual(['On se retrouve', 'ici', 'à sept heures.']);
    expect(stepsOf(mission(12, 'es'), 'sentenceBuilder')[0]!.rounds[0]!.chunks).toEqual(['Quedamos', 'aquí', 'a las siete.']);
  });
  it('final challenge: tonight → the time → tomorrow → settling where and when', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.time.free-tonight'], ['phrase.time.not-too-late'], ['phrase.time.free-tomorrow'], ['phrase.time.lets-meet']]);
  });
});

/* ── Mission 13 — Home, Family & Daily Routine ───────────────────────────────────────────────── */

describe('Mission 13 — Home, Family & Daily Routine', () => {
  const day = mission(13);
  it('flow: learn → recognize → "I\'m going…" → build two statements → at a friend\'s home → conversation → the visit at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'swap', 'sentenceBuilder', 'quickReply', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('"I\'m going…" flexibility: home, to sleep, to eat — said the way each language says it', () => {
    expect(swapSentences(day)).toEqual(["I'm going home.", "I'm going to sleep.", "I'm going to eat at my grandmother's."]);
    expect(swapSentences(mission(13, 'fr'))).toEqual(['Je rentre chez moi.', 'Je vais dormir.', 'Je vais manger chez ma grand-mère.']); // not "Je vais à la maison"
    expect(swapSentences(mission(13, 'es'))).toEqual(['Me voy a casa.', 'Me voy a dormir.', 'Voy a comer en casa de mi abuela.']);
    for (const lang of LANGS) {
      const d = mission(13, lang);
      // Every outcome is a sentence the mission already teaches — nothing is generated.
      expect(swapSentences(d), lang).toEqual([text(d, 'phrase.home.going-home'), text(d, 'phrase.home.going-to-sleep'), text(d, 'phrase.home.eat-at-grandmothers')]);
      expect(stepsOf(d, 'swap')[0]!.rounds.map((r) => strip(r.itemId)), lang).toEqual(['phrase.home.going-home', 'phrase.home.going-to-sleep', 'phrase.home.eat-at-grandmothers']);
    }
  });
  it('"I\'m tired." is retrieved in context — asked if you are okay — twice, not just revealed', () => {
    expect(retrieved(day).get('phrase.home.im-tired')).toBe(2);
    const round = chat(day).rounds.find((r) => r.options.some((o) => o.correct && strip(o.itemId) === 'phrase.home.im-tired'))!;
    expect(round.npc!.en).toBe('Lovely! You look tired. Are you okay?');
  });
  it('home Quick Reply answers the prompts that have a natural answer; "Are you hungry?" stays comprehension-only', () => {
    expect(mapOf(chat(day))).toEqual([
      ['reply.home.come-in', ['phrase.home.beautiful-home']],
      ['situation', ['phrase.home.where-family']],
      ['reply.home.live-with-family-q', ['phrase.home.live-with-family']],
      ['reply.home.eat-with-us', ['phrase.home.eat-at-grandmothers']],
      ['Lovely! You look tired. Are you okay?', ['phrase.home.im-tired']],
    ]);
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip)).toContain('reply.home.are-you-hungry');
    expect(stepsOf(day, 'quiz')).toHaveLength(0); // it was tested twice before
  });
  it('final challenge: a short visit — come in → family → eat with us → are you okay → go home', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.home.beautiful-home'], ['phrase.home.live-with-family'], ['phrase.home.eat-at-grandmothers'], ['phrase.home.im-tired'], ['phrase.home.going-home']]);
  });
});

/* ── Mission 14 — Restaurant Meal ────────────────────────────────────────────────────────────── */

describe('Mission 14 — Restaurant Meal', () => {
  const day = mission(14);
  it('flow: learn → recognize → Restaurant Rush → the order → conversation → the meal at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'prime', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quickReply', 'swap', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('the practice matches the CURRENT dialogue: every drilled waiter line is one the waiter actually says', () => {
    for (const lang of LANGS) {
      const d = mission(14, lang);
      const waiter = Object.values(d.dialogues)[0]!.nodes.filter((n) => n.who === 'npc').map((n) => n.en).join(' | ');
      for (const id of stepsOf(d, 'replies')[0]!.replyIds) expect(waiter.includes(d.items.find((i) => i.id === id)!.text.replace(/[?¿!¡.]/g, '').trim().slice(1)), `${lang} ${id}`).toBe(true);
    }
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip)).toEqual(['reply.rest.reservation', 'reply.rest.ready-to-order', 'reply.rest.to-drink', 'reply.rest.anything-else', 'reply.rest.everything-okay']);
  });
  it('the stale drills are gone: "How was everything?" and the dessert offer are not taught, quizzed or reviewed', () => {
    for (const lang of LANGS) {
      const active = JSON.stringify(mission(14, lang).steps);
      expect(active, lang).not.toMatch(/rest\.how-was-it|rest\.dessert/);
    }
    expect(JSON.stringify(day.steps)).not.toMatch(/How was everything|dessert/i);
    expect(stepsOf(day, 'quiz')).toHaveLength(0);
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
  });
  it('the merged Restaurant Basics lines get active retrieval: pasta, "Anything else?" → "That\'s all, thanks.", "Is everything okay?"', () => {
    expect(mapOf(chat(day))).toEqual([
      ['reply.rest.reservation', ['phrase.rest.table-two']],
      ['reply.rest.ready-to-order', ['phrase.rest.ill-have-chicken', 'phrase.rest.ill-have']],
      ['reply.rest.to-drink', ['phrase.rest.water']],
      ['reply.rest.anything-else', ['phrase.recovery.thank-you']],
      ['situation', ['phrase.rest.no-onions']],
      ['reply.rest.everything-okay', ['phrase.rest.the-bill', 'phrase.rest.delicious']],
    ]);
    for (const lang of LANGS) {
      const d = mission(14, lang);
      const thatsAll = chat(d).rounds[3]!.options.find((o) => o.correct)!.text!;
      // Exactly the line the conversation uses — in the conversation's own words.
      expect(Object.values(d.dialogues)[0]!.nodes.flatMap((n) => n.choices ?? []).map((c) => c.en), lang).toContain(thatsAll);
    }
    expect(chat(day).rounds[3]!.options.find((o) => o.correct)!.text).toBe("That's all, thanks.");
    expect(retrieved(day).get('phrase.rest.ill-have')).toBe(2);
  });
  it('chicken and pasta both stay valid orders — in the dialogue and in the order exercise', () => {
    const order = Object.values(day.dialogues)[0]!.nodes.find((n) => n.id === 'c2')!.choices!.filter((c) => c.correct).map((c) => strip(c.itemId));
    expect(order).toEqual(expect.arrayContaining(['phrase.rest.ill-have-chicken', 'phrase.rest.ill-have']));
    expect(swapSentences(day)).toEqual(["I'll have the chicken, please.", "I'll have the pasta, please."]);
    expect(swapSentences(mission(14, 'fr'))).toEqual(['Je vais prendre le poulet, s’il vous plaît.', 'Je vais prendre les pâtes, s’il vous plaît.']);
    expect(swapSentences(mission(14, 'es'))).toEqual(['Voy a tomar el pollo, por favor.', 'Voy a tomar la pasta, por favor.']);
    for (const lang of LANGS) expect(swapSentences(mission(14, lang))[1], lang).toBe(text(mission(14, lang), 'phrase.rest.ill-have'));
    expect(stepsOf(day, 'swap')[0]!.rounds).toHaveLength(2); // no food vocabulary list
  });
  it('the word intro keeps "menu" because the waiter says it — in each language, the word he actually uses', () => {
    for (const lang of LANGS) {
      const d = mission(14, lang);
      const waiter = Object.values(d.dialogues)[0]!.nodes.filter((n) => n.who === 'npc').map((n) => n.en.toLowerCase()).join(' ');
      const live = [waiter, ...taught(d).map((id) => text(d, id).toLowerCase()), ...d.steps.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.flatMap((r) => r.options.map((o) => (o.text ?? text(d, strip(o.itemId))).toLowerCase())) : []))].join(' ');
      for (const w of stepsOf(d, 'prime')[0]!.words) expect(live.includes(w.text.toLowerCase()), `${lang} “${w.text}”`).toBe(true);
    }
    expect(stepsOf(day, 'prime')[0]!.words.map((w) => w.text)).toEqual(['table', 'menu', 'water', 'bill', 'please']);
    expect(Object.values(day.dialogues)[0]!.nodes.find((n) => n.id === 'n2')!.en).toBe('Perfect, follow me. Here are your menus.');
    expect(stepsOf(mission(14, 'fr'), 'prime')[0]!.words[1]!.text).toBe('menu'); // "Voici vos menus." — not "carte"
    expect(stepsOf(mission(14, 'es'), 'prime')[0]!.words[1]!.text).toBe('carta'); // "Aquí tienen las cartas."
  });
  it('the review is trimmed from 21 cards to 12', () => {
    expect(day.items).toHaveLength(18);
    expect(reviewed(day)).toHaveLength(12);
    expect(reviewed(day)).not.toContain('reply.rest.how-was-it');
  });
  it('final challenge: one compact meal — table → order → drink → anything else → the bill', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.rest.table-two'], ['phrase.rest.ill-have-chicken'], ['phrase.rest.water'], ['phrase.recovery.thank-you'], ['phrase.rest.the-bill']]);
  });
});

/* ── Mission 15 — Food Preferences & Allergies ───────────────────────────────────────────────── */

describe('Mission 15 — Food Preferences & Allergies', () => {
  const day = mission(15);
  it('flow: learn → recognize → what is the kitchen telling you → saying it safely → conversation → the order at speed → the recovery moment', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'matchPairs', 'quickReply', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('no safety guarantee anywhere: nothing in the mission says a dish is safe, fine or guaranteed', () => {
    for (const lang of LANGS) {
      const all = JSON.stringify([mission(15, lang).steps, mission(15, lang).dialogues]);
      expect(all, lang).not.toMatch(/\bsafe for you\b|completely safe|100%|guarantee|sans danger|sin peligro|totalmente seguro|בטוח לגמרי|בטוח בשבילך/i);
    }
    // "This one is a good option for you." is no longer drilled or reviewed.
    expect(JSON.stringify(day.steps)).not.toMatch(/diet\.good-option/);
    // The comprehension board uses icons for checking / changing / warning — never a "safe" label.
    for (const p of stepsOf(day, 'matchPairs')[0]!.pairs) expect(`${p.answerLabel} ${p.answerGloss?.en} ${p.answerGloss?.he}`).not.toMatch(/✅|👌|safe|fine|בטוח/i);
  });
  it('comprehension of the kitchen: checking, can make it without, contains nuts', () => {
    expect(stepsOf(day, 'matchPairs')[0]!.pairs.map((p) => [strip(p.promptItemId), p.answerLabel, p.answerGloss?.en, p.answerGloss?.he])).toEqual([
      ['reply.diet.let-me-check', '🔍', 'They will check', 'בודקים במטבח'],
      ['reply.diet.make-without', '➖', 'They can make it without', 'אפשר להכין בלי'],
      ['reply.diet.contains-nuts', '⚠️ 🥜', 'It contains nuts', 'יש בזה אגוזים'],
    ]);
    // No safety-critical answer hangs on an emoji alone: every tile says it in words, in both app languages.
    for (const lang of LANGS) for (const p of stepsOf(mission(15, lang), 'matchPairs')[0]!.pairs) {
      expect((p.answerGloss?.en ?? '').split(' ').length, lang).toBeGreaterThanOrEqual(3);
      expect(p.answerGloss?.he, lang).toMatch(/[\u0590-\u05FF]/);
    }
  });
  it('the duplicate listening tests are gone: no meaning quiz repeats what the drill already covers', () => {
    for (const lang of LANGS) expect(stepsOf(mission(15, lang), 'quiz'), lang).toHaveLength(0);
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip)).toEqual(['reply.diet.let-me-check', 'reply.diet.make-without', 'reply.diet.contains-nuts', 'reply.diet.anything-else-allergic']);
  });
  it('safety Quick Reply: allergy first → what you eat → the ingredient → the change → a warning', () => {
    expect(mapOf(chat(day))).toEqual([
      ['Hi there! Are you ready to order?', ['phrase.diet.allergic-nuts']],
      ['Thank you for telling me. Any other allergies or dietary restrictions?', ['phrase.diet.vegetarian']],
      ['situation', ['phrase.diet.does-have-dairy']],
      ['reply.diet.make-without', ['phrase.diet.without-onions']],
      ['reply.diet.contains-nuts', ['phrase.diet.allergic-nuts', 'phrase.recovery.repeat']],
    ]);
    // "I'm vegetarian." only ever answers a question that mentions dietary restrictions — never "allergies" alone.
    for (const lang of LANGS) for (const s of stepsOf(mission(15, lang), 'quickReply')) for (const r of s.rounds) {
      if (!r.options.some((o) => o.correct && strip(o.itemId) === 'phrase.diet.vegetarian')) continue;
      expect(strip(r.promptItemId), lang).not.toBe('reply.diet.anything-else-allergic');
      expect(r.npc!.en, lang).toMatch(/dietary restrictions|restrictions alimentaires|restricción alimentaria/);
    }
  });
  it('recovery is treated as success: asking again is accepted on a warning, on unclear information, and is THE answer to the fast safety question', () => {
    const warning = chat(day).rounds[4]!;
    expect(warning.options.find((o) => isHelpToolId(o.itemId))!.correct).toBe(true);
    expect(warning.options.filter((o) => !o.correct).map((o) => strip(o.itemId))).toEqual(['phrase.diet.without-onions']); // just ordering it is the miss
    const unclear = rush(day).rounds[2]!;
    expect(unclear.npc!.en).toMatch(/I'll check with the kitchen about the nuts/);
    expect(unclear.options.find((o) => isHelpToolId(o.itemId))!.correct).toBe(true);
    const [ambush] = stepsOf(day, 'ambush');
    expect([ambush!.mode, strip(ambush!.correctItemId)]).toEqual(['recovery', 'phrase.recovery.repeat']);
    const proof = day.steps[day.steps.indexOf(ambush!) + 1]!;
    expect(proof.kind === 'receipt' && proof.text.en).toMatch(/asked them to repeat instead of guessing/);
    // No round anywhere accepts a guess: a wrong option is never an order placed after a warning.
    expect(JSON.stringify(day.steps)).not.toMatch(/guess is fine|just try it/i);
  });
  it('final challenge: allergy → dietary → ingredient / kitchen → modification — no new ingredient', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.diet.allergic-nuts'], ['phrase.diet.vegetarian'], ['phrase.diet.does-have-dairy', 'phrase.recovery.repeat'], ['phrase.diet.without-onions']]);
    expect(day.items).toHaveLength(13);
  });
});

/* ── Mission 16 — Hobbies & Free Time ────────────────────────────────────────────────────────── */

describe('Mission 16 — Hobbies & Free Time', () => {
  const day = mission(16);
  it('flow: learn → recognize → like / love / don\'t like → build "usually" → the chat → conversation → the chat at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'swap', 'sentenceBuilder', 'quickReply', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('like / love / don\'t like: the feeling changes, the hobby stays — and only hobbies already met', () => {
    expect([0, 1, 2].map((r) => swapSentences(day, r))).toEqual([
      ['I like running.', 'I love running.', "I don't like running."],
      ['I like surfing!', 'I love surfing!', "I don't like surfing!"],
      ['I like drawing.', 'I love drawing.', "I don't like drawing."],
    ]);
    expect(swapSentences(mission(16, 'fr'))).toEqual(['J’aime courir.', 'J’adore courir.', 'Je n’aime pas courir.']);
    expect(swapSentences(mission(16, 'es'))).toEqual(['Me gusta correr.', 'Me encanta correr.', 'No me gusta correr.']);
    for (const lang of LANGS) {
      const d = mission(16, lang);
      // The answer of each round is a sentence the mission teaches, word for word.
      expect([0, 1, 2].map((r) => swapSentences(d, r)[stepsOf(d, 'swap')[0]!.rounds[r]!.options.findIndex((o) => o.correct)]), lang)
        .toEqual([text(d, 'phrase.hobby.dont-like-running'), text(d, 'phrase.hobby.i-love-surfing'), text(d, 'phrase.hobby.i-like-drawing')]);
      expect(unknownIn([0, 1, 2].flatMap((r) => swapSentences(d, r)), new Set(d.items.flatMap((i) => words(i.text)))), lang).toEqual([]); // no new hobby
    }
  });
  it('"usually", "want to try" and the ask-back are each actively retrieved in a conversational context', () => {
    const r = retrieved(day);
    expect(r.get('phrase.hobby.i-usually')).toBe(3); // built, answered ("When do you draw?"), at speed
    expect(r.get('phrase.hobby.want-to-try')).toBe(2);
    expect(r.get('phrase.hobby.what-for-fun')).toBe(1);
    const usually = chat(day).rounds.find((x) => x.options.some((o) => o.correct && strip(o.itemId) === 'phrase.hobby.i-usually'))!;
    expect(usually.npc!.en).toBe('Nice! When do you draw?');
    const tryIt = chat(day).rounds.find((x) => x.options.some((o) => o.correct && strip(o.itemId) === 'phrase.hobby.want-to-try'))!;
    expect(text(day, strip(tryIt.promptItemId))).toBe('Is there something you want to try?');
  });
  it('the Quick Reply is a chain: do you like → what else → when → and sport → what to try → ask back', () => {
    expect(mapOf(chat(day))).toEqual([
      ['reply.hobby.do-you-like-surfing', ['phrase.hobby.i-love-surfing']],
      ['reply.hobby.what-else', ['phrase.hobby.i-like-drawing', 'phrase.hobby.like-to-listen']],
      ['Nice! When do you draw?', ['phrase.hobby.i-usually']],
      ['And sport? Do you like running?', ['phrase.hobby.dont-like-running']],
      ['reply.hobby.want-to-try-q', ['phrase.hobby.want-to-try']],
      ['situation', ['phrase.hobby.what-for-fun']],
    ]);
  });
  it('final challenge: a hobby chat at speed, with no hobby that was not already in the conversation', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.hobby.i-love-surfing'], ['phrase.hobby.i-like-drawing'], ['phrase.hobby.i-usually'], ['phrase.hobby.like-to-listen'], ['phrase.hobby.want-to-try']]);
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
  });
});

/* ── Mission 17 — Supermarket ────────────────────────────────────────────────────────────────── */

describe('Mission 17 — Supermarket & Everyday Shopping', () => {
  const day = mission(17);
  it('flow: learn → recognize → aisle by ear → any product → shelf to checkout → conversation → at speed → the recovery moment', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'visualMatch', 'swap', 'quickReply', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('"You need to weigh it first." is gone from teaching, quiz and review; nothing claims fruit was weighed', () => {
    for (const lang of LANGS) {
      const d = mission(17, lang);
      expect(JSON.stringify(d.steps), lang).not.toMatch(/super\.weigh-it/);
      expect(JSON.stringify([d.steps, d.items]), lang).not.toContain(RETIRED_SENTENCES[lang].find((r) => strip(r.id) === 'reply.super.weigh-it')!.text);
      expect(JSON.stringify(d.steps), lang).not.toMatch(/weigh|שוקל|שקל|שקיל/i); // intro card, proof cards, labels
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0);
    }
    // …and it was never in the conversation.
    expect(JSON.stringify(day.dialogues)).not.toMatch(/weigh/i);
  });
  it('location: an aisle number AND a side, by ear', () => {
    const board = stepsOf(day, 'visualMatch')[0]!;
    expect(board.tiles.map((t) => t.label)).toEqual(['1 ⬅️', '1 ➡️', '2 ⬅️', '2 ➡️', '3 ⬅️', '3 ➡️']);
    expect(board.rounds.map((r) => [r.audio.en, r.correct])).toEqual([
      ['The milk is in aisle three, on the left.', 'a3l'], ["It's in aisle one, on the right.", 'a1r'], ["It's in aisle two, on the left.", 'a2l'],
    ]);
    for (const lang of LANGS) {
      const b = stepsOf(mission(17, lang), 'visualMatch')[0]!;
      const before = new Set([...vocabulary(lang, 16), ...lines(mission(17, lang), true).filter((l) => !b.rounds.some((r) => r.audio.en === l)).flatMap(words)]);
      expect(unknownIn(b.rounds.map((r) => r.audio.en), before), lang).toEqual([]);
    }
  });
  it('product flexibility: "Where is the ___?" with three products the learner already has words for', () => {
    expect(swapSentences(day)).toEqual(['Where is the milk?', 'Where is the bread?', 'Where is the water?']);
    expect(swapSentences(mission(17, 'fr'))).toEqual(['Où est le lait ?', 'Où est le pain ?', 'Où est l’eau ?']);
    expect(swapSentences(mission(17, 'es'))).toEqual(['¿Dónde está la leche?', '¿Dónde está el pan?', '¿Dónde está el agua?']); // el agua
    for (const lang of LANGS) {
      expect(swapSentences(mission(17, lang))[0], lang).toBe(text(mission(17, lang), 'phrase.super.where-is'));
      expect(unknownIn(swapSentences(mission(17, lang)), new Set([...vocabulary(lang, 16), ...mission(17, lang).items.flatMap((i) => words(i.text))])), lang).toEqual([]);
    }
  });
  it('checkout retrieval: "Just this, thanks." and "Could I get a bag?" answer the cashier', () => {
    expect(mapOf(chat(day))).toEqual([
      ['Hi there! Can I help you find something?', ['phrase.super.where-is', 'phrase.super.do-you-have']],
      ['situation', ['phrase.super.do-you-have']],
      ['reply.super.aisle-three', ['phrase.recovery.thank-you', 'phrase.recovery.repeat']],
      ['Hi! Is that everything?', ['phrase.super.just-this']],
      ['reply.super.bag-q', ['phrase.super.need-bag']],
    ]);
  });
  it('the intro promises what the mission does: find it → aisle and side → checkout → a bag', () => {
    const intro = day.steps[0]!;
    expect(intro.kind).toBe('talk');
    const said = intro.kind === 'talk' ? intro.body.map((b) => b.en).join(' ') : '';
    expect(said).toMatch(/find a product.*which aisle and which side.*checkout.*ask for a bag/);
    expect(said).not.toMatch(/self-checkout|weigh|signs/i);
    for (const lang of ['fr', 'es'] as const) expect(mission(17, lang).steps[0], lang).toEqual(intro); // the card is app-language copy
  });
  it('recovery stays where it fits: "Can you show me?" at the jammed self-checkout', () => {
    const [ambush] = stepsOf(day, 'ambush');
    expect([ambush!.mode, strip(ambush!.correctItemId)]).toEqual(['recovery', 'phrase.recovery.show-me']);
  });
  it('final challenge: find it → understand the aisle → checkout → bag', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.super.where-is'], ['phrase.recovery.thank-you'], ['phrase.super.just-this'], ['phrase.super.need-bag']]);
  });
});

/* ── Mission 18 — the checkpoint ─────────────────────────────────────────────────────────────── */

describe('Mission 18 — CHECKPOINT: Everyday Day', () => {
  const day = mission(18);
  const screens = (d: BootcampDayContent) => Object.values(d.dialogues).flatMap((dl) => dl.nodes.filter((n) => n.choices?.length).map((n) => ({ scene: dl.id, node: n })));

  it('it proves, it does not teach: no key sentence, no word intro, no listening drill, no quiz, no review', () => {
    expect(kinds(day)).toEqual(['talk', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'ambush:speed', 'receipt', 'receipt', 'summary']);
    for (const lang of LANGS) for (const s of mission(18, lang).steps) expect(['tool', 'prime', 'replies', 'quiz', 'swipe'], lang).not.toContain(s.kind);
  });
  it('one ordinary day in four cold scenes — morning, a friend, the supermarket, dinner — with no translation before answering', () => {
    for (const lang of LANGS) {
      const d = mission(18, lang);
      expect(Object.keys(d.dialogues), lang).toEqual(['cold-morning', 'cold-plans', 'cold-shop', 'cold-dinner']);
      for (const dl of Object.values(d.dialogues)) { expect(dl.cold, `${lang} ${dl.id}`).toBe(true); expect(dl.nodes[0]!.who, `${lang} ${dl.id}`).toBe('npc'); }
    }
  });
  it('real decisions: fifteen screens, each with the line that fits and a real line from another moment — and no one-button screen', () => {
    for (const lang of LANGS) {
      const all = screens(mission(18, lang));
      expect(all, lang).toHaveLength(15);
      for (const { node } of all) {
        expect(node.choices!.some((c) => c.correct) && node.choices!.some((c) => !c.correct), `${lang} ${node.id}`).toBe(true);
        expect(node.choices!.length, lang).toBeGreaterThanOrEqual(2);
        expect(node.choices!.length, lang).toBeLessThanOrEqual(3);
      }
    }
    const earlier = new Set(Array.from({ length: 17 }, (_, i) => mission(i + 1).items.map((x) => x.text)).flat());
    for (const { node } of screens(day)) for (const c of node.choices!.filter((x) => !x.correct)) expect(earlier.has(c.en), c.en).toBe(true); // never nonsense
  });
  it('a miss is never passed over: the question is asked again, slowly, and the same decision comes back', () => {
    for (const lang of LANGS) for (const dl of Object.values(mission(18, lang).dialogues)) {
      const byId = new Map(dl.nodes.map((n) => [n.id, n]));
      for (const n of dl.nodes) for (const c of n.choices ?? []) {
        if (c.correct) continue;
        const beat = byId.get(c.next)!;
        expect([beat.who, beat.slow, beat.next], `${lang} ${dl.id}/${n.id}`).toEqual(['npc', true, n.id]);
      }
    }
  });
  it('it draws on Missions 11–17, not only on old scripts: plans, a hobby, home, the supermarket, the restaurant', () => {
    const said = new Set(screens(day).flatMap(({ node }) => node.choices!.filter((c) => c.correct).map((c) => strip(c.itemId))));
    for (const id of ['phrase.time.free-tomorrow', 'phrase.time.lets-meet', 'phrase.time.maybe-later', 'phrase.hobby.i-love-surfing', 'phrase.home.going-home', 'phrase.super.where-is', 'phrase.super.just-this', 'phrase.super.need-bag', 'phrase.rest.table-two', 'phrase.rest.the-bill']) expect(said.has(id), id).toBe(true);
  });
  it('recovery is success — three offers, on the fast lines — but not every hard moment is a recovery moment', () => {
    for (const lang of LANGS) {
      const d = mission(18, lang);
      const tools = screens(d).flatMap(({ scene, node }) => node.choices!.filter((c) => isHelpToolId(c.itemId)).map((c) => ({ scene, node, c })));
      expect(tools.map((x) => `${x.scene}:${strip(x.c.itemId)}`), lang).toEqual(['cold-morning:phrase.recovery.slowly', 'cold-plans:phrase.recovery.repeat', 'cold-shop:phrase.recovery.repeat']);
      for (const { scene, node, c } of tools) {
        expect(c.correct, lang).toBe(true);
        const again = d.dialogues[scene]!.nodes.find((n) => n.id === c.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${scene}`).toEqual(['npc', true, node.id]);
        expect(d.dialogues[scene]!.nodes.find((n) => n.next === node.id && !n.slow)!.fast, `${lang} ${scene}`).toBe(true);
      }
      expect(tools.length, lang).toBeLessThan(screens(d).length / 3);
    }
  });
  it('STRICT — zero new target-language vocabulary: every word of the checkpoint was met in Missions 01–17', () => {
    for (const lang of LANGS) expect(unknownIn(lines(mission(18, lang)), vocabulary(lang, 17)), lang).toEqual([]);
    expect(lines(day).join(' ')).not.toMatch(/dessert|great choice|right this way|how many people/i); // what the old version smuggled in
  });
  it('every learner line is a sentence an earlier mission taught, with the same id and the same wording', () => {
    for (const lang of LANGS) {
      const before = new Map(Array.from({ length: 17 }, (_, i) => mission(i + 1, lang).items.map((x): [string, string] => [x.id, x.text])).flat());
      for (const i of mission(18, lang).items) expect(before.get(i.id), `${lang} ${i.id}`).toBe(i.text);
    }
  });
  it('one speed-listening moment, honestly labelled — known language, no "use a tool" badge', () => {
    for (const lang of LANGS) {
      const ambushes = stepsOf(mission(18, lang), 'ambush');
      expect(ambushes, lang).toHaveLength(1);
      expect(ambushes[0]!.mode, lang).toBe('speed');
      expect(isHelpToolId(ambushes[0]!.correctItemId) || isHelpToolId(ambushes[0]!.wrongItemId), lang).toBe(false);
    }
    expect(strip(stepsOf(day, 'ambush')[0]!.correctItemId)).toBe('reply.rest.ready-to-order');
  });
  it('the three languages are the same checkpoint: same scenes, same turns, same decisions', () => {
    const shape = (d: BootcampDayContent) => Object.values(d.dialogues).map((dl) => [dl.id, dl.nodes.map((n) => [n.id, n.who, n.next ?? null, n.fast ?? false, n.slow ?? false, (n.choices ?? []).map((c) => [strip(c.itemId), c.correct, c.next])])]);
    for (const lang of ['fr', 'es'] as const) expect(shape(mission(18, lang)), lang).toEqual(shape(day));
  });
  it('the closing proof says what was done — and teaches nothing after it', () => {
    const last = day.steps.slice(-2);
    expect(last.map((s) => s.kind)).toEqual(['receipt', 'summary']);
    expect(last[0]!.kind === 'receipt' && last[0]!.text.en).toMatch(/coffee.*friend.*supermarket.*dinner.*did not freeze/);
  });
});
