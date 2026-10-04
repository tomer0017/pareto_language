import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep } from './types.js';
import type * as PlayerSteps from './PracticeSteps.js';

/**
 * Practice depth — Missions 06–10 (the Arrival phase). What each mission must now train is pinned,
 * what was removed stays removed, the checkpoint proves instead of teaching, and everything this
 * pass was NOT allowed to touch — Missions 01–05, Missions 11–30, the locked dialogues of 06–09 —
 * is fingerprinted.
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
/** [what is heard, the accepted answers] of every Quick Reply round of a mission (not the speed challenge). */
const replyMap = (day: BootcampDayContent, challenge = false): [string, string[]][] =>
  stepsOf(day, 'quickReply').filter((s) => Boolean(s.challenge) === challenge).flatMap((s) => s.rounds.map((r): [string, string[]] =>
    [r.promptItemId ? strip(r.promptItemId) : r.npc ? r.npc.en : 'situation', r.options.filter((o) => o.correct).map((o) => strip(o.itemId))]));

/* ── vocabulary: what a learner has met ──────────────────────────────────────────────────────── */

const PROPER = new Set(['cohen']);
const words = (s: string): string[] => s.toLowerCase().replace(/[’`]/g, "'").split(/[^\p{L}']+/u).map((w) => w.replace(/^'+|'+$/g, '')).filter((w) => w && !PROPER.has(w));
/** Every target-language line a mission puts in front of the learner. `skipChallenge` leaves out the
 *  final speed challenge (so it can be checked against the rest); a recovery ambush is left out
 *  always — it is meant to be beyond the learner. */
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

/* ── what this pass was not allowed to touch ─────────────────────────────────────────────────── */

describe('scope: only the Practice of Missions 06–10 changed', () => {
  const slice = (lang: Lang, a: number, b: number): BootcampDayContent[] => BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[lang]![m.day]!);
  const print = (f: (lang: Lang) => unknown): Record<Lang, string> => ({ en: fnv(JSON.stringify(f('en'))), fr: fnv(JSON.stringify(f('fr'))), es: fnv(JSON.stringify(f('es'))) });

  it('Missions 01–05 are byte-for-byte unchanged', () => {
    expect(print((l) => slice(l, 0, 5))).toEqual({ en: 'a991afd3', fr: '2d391b07', es: '423b53a8' });
  });
  it('Missions 19–30 are byte-for-byte unchanged (11–18 have their own pass — practiceEveryday.test.ts)', () => {
    expect(print((l) => slice(l, 18, 30))).toEqual({ en: '937fd289', fr: '37d6c3c7', es: '68611717' });
  });
  it('the locked dialogues of Missions 06, 07 and 09 are byte-for-byte unchanged', () => {
    const three = (l: Lang): BootcampDayContent[] => [slice(l, 5, 6)[0]!, slice(l, 6, 7)[0]!, slice(l, 8, 9)[0]!];
    expect(print((l) => three(l).map((d) => d.dialogues))).toEqual({ en: '2680b5d1', fr: '0d0e06f6', es: '4c53e21b' });
  });
  it('Mission 08\'s dialogue lost exactly one thing — the wifi option and its reply; every other line is as it was', () => {
    for (const lang of LANGS) {
      const scene = mission(8, lang).dialogues['hotel-checkin']!;
      expect(scene.nodes.map((n) => n.id), lang).toEqual(['n1', 'c1', 'r1', 'c1b', 'n2', 'c2', 'n3', 'c3', 'n4', 'n5']);
      expect(scene.nodes.find((n) => n.id === 'c3')!.choices!.map((c) => strip(c.itemId)), lang).toEqual(['phrase.hotel.breakfast']);
      expect(JSON.stringify(scene).toLowerCase(), lang).not.toContain('wifi');
    }
    const en = mission(8).dialogues['hotel-checkin']!.nodes;
    expect(en.filter((n) => n.who === 'npc').map((n) => n.en)).toEqual([
      'Good evening! How can I help you?', 'How — can — I — help you?', 'Welcome, Mr. Cohen. Your passport, please.',
      "Thank you. You're in room two-oh-four, on the second floor. Here is your key.", 'Yes! Breakfast is from seven to ten. The elevator is on your right.', 'Enjoy your stay!',
    ]);
  });
  it('the approved pass is otherwise exactly as approved: Missions 06, 07 and 10 whole, Mission 09 apart from the size wording', () => {
    const pick = (l: Lang, i: number): BootcampDayContent => MISSIONS_BY_LANG[l]![BOOTCAMP_PLAN[i]!.day]!;
    expect(print((l) => [5, 6, 9].map((i) => pick(l, i).steps))).toEqual({ en: '68395559', fr: '6aeb68e7', es: '8543c7fe' });
    expect(print((l) => pick(l, 9))).toEqual({ en: '60b489f1', fr: '5d4d6a20', es: 'a4ff1fc6' });
    expect(print((l) => pick(l, 8).steps.filter((s) => s.kind !== 'swap'))).toEqual({ en: '033e2741', fr: '1be8e9bb', es: '45d575fc' });
  });
  it('no sentence of Missions 06–09 was deleted, renamed or reworded — including the two M08 no longer teaches', () => {
    expect(print((l) => slice(l, 5, 9).map((d) => d.items))).toEqual({ en: '45d1c8e1', fr: '37806145', es: 'd0170065' });
    for (const lang of LANGS) {
      const ids = mission(8, lang).items.map((i) => strip(i.id));
      expect(ids, lang).toContain('phrase.hotel.two-nights');
      expect(ids, lang).toContain('phrase.hotel.wifi');
    }
  });
  it('their intro cards, titles and videos are unchanged', () => {
    expect(print((l) => slice(l, 5, 9).map((d) => [d.day, d.title, d.introVideo, d.steps[0]]))).toEqual({ en: 'c25a2848', fr: 'e83a143f', es: 'f4c8b176' });
  });
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(5, 10).map((m) => `${m.id}:${m.day}`)).toEqual(['airport-border:10', 'taxi:6', 'hotel-check-in:7', 'shopping:8', 'arrival-day-checkpoint:9']);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (let n = 6; n <= 10; n++) for (const s of mission(n, lang).steps) expect(allowed, `${lang} M${n}`).toContain(s.kind);
  });
});

describe('all three languages get the same practice, each in its own words', () => {
  it('every step of Missions 06–10 validates in English, French and Spanish', () => {
    for (const lang of LANGS) for (let n = 6; n <= 10; n++) {
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
      if (s.kind === 'ambush') return [s.kind, s.mode, strip(s.correctItemId), strip(s.wrongItemId)];
      if (s.kind === 'tool') return [s.kind, strip(s.itemId), s.label];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'quiz') return [s.kind, strip(s.itemId), s.wrongIds.map(strip)];
      if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
      if (s.kind === 'receipt') return [s.kind, s.text];
      return s.kind;
    };
    for (let n = 6; n <= 10; n++) for (const lang of ['fr', 'es'] as const) expect(mission(n, lang).steps.map(shape), `${lang} M${n}`).toEqual(mission(n).steps.map(shape));
  });
  it('no line of a new step is English left in French or Spanish', () => {
    for (let n = 6; n <= 9; n++) for (const lang of ['fr', 'es'] as const) {
      const en = mission(n).steps;
      mission(n, lang).steps.forEach((s, i) => {
        const ref = en[i]!;
        if (s.kind === 'quickReply' && ref.kind === 'quickReply') s.rounds.forEach((r, k) => { if (r.npc) expect(r.npc.en, `${lang} M${n}`).not.toBe(ref.rounds[k]!.npc!.en); });
        if (s.kind === 'visualMatch' && ref.kind === 'visualMatch') s.rounds.forEach((r, k) => expect(r.audio.en, `${lang} M${n}`).not.toBe(ref.rounds[k]!.audio.en));
        if (s.kind === 'swap' && ref.kind === 'swap') s.rounds.forEach((r, k) => r.options.forEach((o, j) => expect(fillFrame(r.frame, o.slot), `${lang} M${n}`).not.toBe(fillFrame(ref.rounds[k]!.frame, ref.rounds[k]!.options[j]!.slot))));
      });
    }
  });
  it('service register: nobody is addressed as tu / tú at a border, in a taxi, a hotel or a shop', () => {
    for (let n = 6; n <= 10; n++) {
      // Word-level check (accent-aware), so "tú" is caught and "été" / "está" are not mistaken for it.
      const informal = (lang: Lang, banned: string[]): string[] => lines(mission(n, lang)).flatMap(words).filter((w) => banned.includes(w));
      expect(informal('fr', ['tu', 'toi', 'ton', 'ta', 'tes', "t'as", "t'es"]), `fr M${n}`).toEqual([]);
      expect(informal('es', ['tú', 'tu', 'tus', 'te', 'contigo', 'tienes', 'quieres', 'puedes', 'estás']), `es M${n}`).toEqual([]);
    }
  });
  it('the closing review is selective: the high-value lines, not every sentence', () => {
    for (let n = 6; n <= 9; n++) {
      const day = mission(n);
      const review = reviewed(day);
      expect(review.length, `M${n}`).toBeLessThan(day.items.length);
      expect(review.length, `M${n}`).toBeLessThanOrEqual(12);
      for (const id of taught(day)) expect(review, `M${n} ${id}`).toContain(id); // everything taught is reviewed
      expect(new Set(review).size).toBe(review.length);
    }
  });
});

/* ── Mission 06 — Airport & Border ───────────────────────────────────────────────────────────── */

describe('Mission 06 — Airport & Border', () => {
  const day = mission(6);
  it('flow: learn → recognize the questions → answer them → change the duration → conversation → Border Rush', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quickReply', 'swap', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('the redundant meaning quizzes are gone; the listening drill still covers the four questions', () => {
    for (const lang of LANGS) expect(stepsOf(mission(6, lang), 'quiz'), lang).toHaveLength(0);
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip)).toEqual(['reply.border.purpose', 'reply.border.how-long', 'reply.border.where-staying', 'reply.border.anything-declare']);
  });
  it('all five learner lines are taught — "Nothing to declare." no longer lives only in the dialogue', () => {
    expect(taught(day)).toEqual(['phrase.border.passport-here', 'phrase.border.on-holiday', 'phrase.border.two-weeks', 'phrase.border.staying-hotel', 'phrase.border.nothing-declare']);
    expect(text(day, 'phrase.border.nothing-declare')).toBe('Nothing to declare.');
    const retrieved = [...replyMap(day), ...replyMap(day, true)].filter(([, ok]) => ok.includes('phrase.border.nothing-declare'));
    expect(retrieved.length).toBe(2); // actively retrieved twice, outside the dialogue
  });
  it('Border Quick Reply holds the four question → answer mappings', () => {
    expect(replyMap(day)).toEqual([
      ['reply.border.purpose', ['phrase.border.on-holiday']],
      ['reply.border.how-long', ['phrase.border.two-weeks']],
      ['reply.border.where-staying', ['phrase.border.staying-hotel']],
      ['reply.border.anything-declare', ['phrase.border.nothing-declare']],
    ]);
    expect([text(day, 'reply.border.purpose'), text(day, 'phrase.border.on-holiday')]).toEqual(["What's the purpose of your visit?", "I'm here on holiday."]);
    // The wrong options are real border answers to another question — never nonsense, never a tool.
    for (const r of stepsOf(day, 'quickReply')[0]!.rounds) {
      expect(r.options).toHaveLength(3);
      for (const o of r.options) expect(strip(o.itemId)).toMatch(/^phrase\.border\./);
    }
  });
  it('duration flexibility: "For ___" with three lengths of stay, authored per language', () => {
    const sentences = (lang: Lang): string[] => stepsOf(mission(6, lang), 'swap')[0]!.rounds[0]!.options.map((o) => fillFrame(stepsOf(mission(6, lang), 'swap')[0]!.rounds[0]!.frame, o.slot));
    expect(sentences('en')).toEqual(['For three days.', 'For a week.', 'For two weeks.']);
    expect(sentences('fr')).toEqual(['Pour trois jours.', 'Pour une semaine.', 'Pour deux semaines.']);
    expect(sentences('es')).toEqual(['Tres días.', 'Una semana.', 'Dos semanas.']); // Spanish answers with the bare duration
    for (const lang of LANGS) {
      const swap = stepsOf(mission(6, lang), 'swap')[0]!;
      expect(swap.rounds, lang).toHaveLength(3);
      expect(swap.rounds.map((r) => r.options.findIndex((o) => o.correct)), lang).toEqual([0, 1, 2]); // each length is the answer once
      // the taught sentence is one of the frame's own outcomes — the frame is not an invention
      expect(sentences(lang), lang).toContain(text(mission(6, lang), 'phrase.border.two-weeks'));
    }
  });
  it('Border Rush is the officer\'s own chain at speed — not one word the learner has not met', () => {
    for (const lang of LANGS) {
      const d = mission(6, lang);
      const rush = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
      expect(rush.rounds, lang).toHaveLength(4);
      expect(rush.label, lang).toBeUndefined(); // no internal name on screen: it is announced as a speed moment
      const spoken = rush.rounds.map((r) => r.npc!.en);
      expect(unknownIn(spoken, vocabulary(lang, 6, true)), lang).toEqual([]);
      const officer = Object.values(d.dialogues)[0]!.nodes.filter((n) => n.who === 'npc').map((n) => n.en);
      for (const line of spoken) expect(officer, `${lang} “${line}”`).toContain(line); // verbatim from the conversation
    }
    expect(replyMap(day, true).map(([, ok]) => ok)).toEqual([['phrase.border.on-holiday'], ['phrase.border.two-weeks'], ['phrase.border.staying-hotel'], ['phrase.border.nothing-declare']]);
  });
  it('recovery stays where it helps (three offers in the conversation) and is never forced in the drills', () => {
    const offered = Object.values(day.dialogues)[0]!.nodes.flatMap((n) => n.choices ?? []).filter((c) => isHelpToolId(c.itemId)).map((c) => strip(c.itemId));
    expect(offered).toEqual(['phrase.recovery.one-moment', 'phrase.recovery.repeat', 'phrase.recovery.slowly']);
    for (const s of stepsOf(day, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(isHelpToolId(o.itemId)).toBe(false);
    expect(stepsOf(day, 'ambush')).toHaveLength(0); // the old cold open (untaught "return ticket" line) is gone
  });
});

/* ── Mission 07 — Taxi / Uber ────────────────────────────────────────────────────────────────── */

describe('Mission 07 — Taxi / Uber', () => {
  const day = mission(7);
  it('flow: learn → recognize the driver → price by ear → Taxi Rush → conversation → the ride at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'prime', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'visualMatch', 'quickReply', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('the same price is no longer tested three times: the meaning quiz is gone', () => {
    for (const lang of LANGS) expect(stepsOf(mission(7, lang), 'quiz'), lang).toHaveLength(0);
  });
  it('price listening in context: a fare board with numbers already taught, 15 next to 50', () => {
    const board = stepsOf(day, 'visualMatch')[0]!;
    expect(board.tiles.map((t) => t.label)).toEqual(['€5', '€8', '€10', '€15', '€20', '€50']);
    expect(board.rounds.map((r) => [r.audio.en, r.correct])).toEqual([["It's about fifteen euros.", 'e15'], ['About twenty euros.', 'e20'], ["It's about ten euros.", 'e10']]);
    expect(new Set(board.rounds.map((r) => r.correct)).size).toBe(3); // three DIFFERENT prices, not one repeated
    // Every number on the board was taught by Mission 02 — the taxi adds only its own "about".
    for (const lang of LANGS) {
      const fares = stepsOf(mission(7, lang), 'visualMatch')[0]!.rounds.map((r) => r.audio.en);
      const fresh = unknownIn(fares, vocabulary(lang, 6));
      expect(fresh.length, `${lang} ${fresh.join(',')}`).toBeLessThanOrEqual(1);
      expect(unknownIn(fares, new Set([...vocabulary(lang, 6), ...mission(7, lang).items.flatMap((i) => words(i.text))])), lang).toEqual([]);
    }
  });
  it('Taxi Rush: destination, price, the fast fare, the stop, the change', () => {
    expect(replyMap(day)).toEqual([
      ['reply.taxi.where-to', ['phrase.taxi.to-address']],
      ['situation', ['phrase.taxi.how-much']],
      ["It's about fifteen euros. There's a lot of traffic right now.", ['phrase.recovery.slowly', 'phrase.recovery.thank-you']],
      ['reply.taxi.here-good', ['phrase.taxi.stop-here']],
      ['situation', ['phrase.taxi.keep-change']],
    ]);
  });
  it('"Please speak slowly." is used where it is useful — on the fast fare line — and counts as success', () => {
    for (const lang of LANGS) {
      const d = mission(7, lang);
      const fast = stepsOf(d, 'quickReply')[0]!.rounds[2]!;
      const slowly = fast.options.find((o) => strip(o.itemId) === 'phrase.recovery.slowly')!;
      expect(slowly.correct, lang).toBe(true);
      expect(isHelpToolId(slowly.itemId), lang).toBe(true);
      // …and in the conversation the driver then really does repeat it slowly.
      const scene = Object.values(d.dialogues)[0]!;
      const tool = scene.nodes.flatMap((n) => n.choices ?? []).find((c) => strip(c.itemId) === 'phrase.recovery.slowly')!;
      expect(scene.nodes.find((n) => n.id === tool.next)!.slow, lang).toBe(true);
    }
  });
  it('"Keep the change." and "To the airport" are no longer review-only', () => {
    expect(replyMap(day).some(([, ok]) => ok.includes('phrase.taxi.keep-change'))).toBe(true);
  });
  it('the final speed challenge is the driver\'s own lines — learned language only, no tool, no new word', () => {
    for (const lang of LANGS) {
      const d = mission(7, lang);
      const rush = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
      const spoken = rush.rounds.map((r) => r.npc!.en);
      expect(unknownIn(spoken, vocabulary(lang, 7, true)), lang).toEqual([]);
      const driver = Object.values(d.dialogues)[0]!.nodes.filter((n) => n.who === 'npc').map((n) => n.en);
      for (const line of spoken) expect(driver, `${lang} “${line}”`).toContain(line);
      for (const r of rush.rounds) for (const o of r.options) expect(isHelpToolId(o.itemId), lang).toBe(false);
    }
    expect(replyMap(day, true).map(([, ok]) => ok)).toEqual([['phrase.taxi.to-address'], ['phrase.recovery.thank-you'], ['phrase.taxi.stop-here']]);
    expect(stepsOf(day, 'ambush')).toHaveLength(0); // the old cold open ("road ahead is closed…") is gone
  });
});

/* ── Mission 08 — Hotel Check-in ─────────────────────────────────────────────────────────────── */

describe('Mission 08 — Hotel Check-in', () => {
  const day = mission(8);
  it('flow: learn → recognize → Hotel Match → room number by ear → front desk → conversation → fast info', () => {
    expect(kinds(day)).toEqual(['talk', 'prime', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'matchPairs', 'visualMatch', 'quickReply', 'dialogue', 'receipt', 'swipe', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('"For two nights." and the wifi password are not taught, drilled, reviewed or offered anywhere in the mission', () => {
    for (const lang of LANGS) {
      const d = mission(8, lang);
      const active = JSON.stringify([d.steps, d.dialogues]);
      expect(active, lang).not.toMatch(/hotel\.two-nights|hotel\.wifi/);
      expect(active.toLowerCase(), lang).not.toMatch(/wifi|wi-fi/);
      for (const id of ['phrase.hotel.two-nights', 'phrase.hotel.wifi']) expect(active, `${lang} ${id}`).not.toContain(text(d, id));
    }
    // …but nothing was deleted: both sentence ids still exist (history, the Extended material).
    expect(text(day, 'phrase.hotel.two-nights')).toBe('For two nights.');
    expect(text(day, 'phrase.hotel.wifi')).toBe("What's the wifi password?");
  });
  it('the word intro holds only words the mission still uses — "night" is gone', () => {
    for (const lang of LANGS) {
      const d = mission(8, lang);
      const prime = stepsOf(d, 'prime')[0]!;
      expect(prime.words, lang).toHaveLength(4);
      expect(prime.words.map((w) => w.meaning.en), lang).toEqual(['reservation', 'name', 'breakfast', 'passport']);
      // Every word appears in a sentence that is still taught as a key sentence or drilled as a reply.
      const live = [...taught(d), ...stepsOf(d, 'replies')[0]!.replyIds.map(strip)].map((id) => text(d, id).toLowerCase()).join(' ');
      for (const w of prime.words) expect(live.includes(w.text.toLowerCase()), `${lang} “${w.text}”`).toBe(true);
    }
  });
  it('the check-in core is taught: reservation, the name, handing over the passport, breakfast', () => {
    expect(taught(day)).toEqual(['phrase.hotel.reservation', 'phrase.hotel.under-name', 'phrase.hotel.here-you-go', 'phrase.hotel.breakfast']);
    expect(replyMap(day)).toEqual([
      ['Good evening. Do you have a reservation?', ['phrase.hotel.reservation']],
      ['situation', ['phrase.hotel.under-name']],
      ['reply.hotel.passport', ['phrase.hotel.here-you-go', 'phrase.recovery.one-moment']],
      ['situation', ['phrase.hotel.breakfast']],
    ]);
  });
  it('Hotel Match connects what the receptionist says to what it means — numbers and icons, no translation', () => {
    for (const lang of LANGS) {
      const d = mission(8, lang);
      const match = stepsOf(d, 'matchPairs')[0]!;
      expect(match.pairs.map((p) => [strip(p.promptItemId), p.answerLabel]), lang).toEqual([
        ['reply.hotel.room-number', '🚪 204'], ['reply.hotel.second-floor', '🏢 2'], ['reply.hotel.breakfast-time', '🍳 7–10'], ['reply.hotel.elevator', '🛗 ➡️'],
      ]);
      for (const p of match.pairs) { expect(p.answerLabel, lang).not.toMatch(/[֐-׿]/); expect(p.answerLabel, lang).not.toMatch(/[A-Za-z]/); }
    }
  });
  it('the room number is caught by ear — two rounds, not a numbers lesson', () => {
    const board = stepsOf(day, 'visualMatch')[0]!;
    expect(board.rounds.map((r) => r.correct)).toEqual(['r204', 'r402']);
    expect(board.tiles.map((t) => t.label)).toEqual(['104', '204', '214', '240', '402', '420']);
    // French re-uses exactly the number words of the taught sentence, in another order.
    expect(stepsOf(mission(8, 'fr'), 'visualMatch')[0]!.rounds.map((r) => r.audio.en)).toEqual(['Vous êtes dans la chambre deux cent quatre.', 'Vous êtes dans la chambre quatre cent deux.']);
  });
  it('one fast-information moment where "Can you repeat that?" is the smart answer — and only the tool is marked as one', () => {
    const [ambush] = stepsOf(day, 'ambush');
    expect(ambush!.mode).toBe('recovery');
    expect(strip(ambush!.correctItemId)).toBe('phrase.recovery.repeat');
    expect(isHelpToolId(ambush!.wrongItemId)).toBe(false);
    const offered = Object.values(day.dialogues)[0]!.nodes.flatMap((n) => n.choices ?? []).filter((c) => isHelpToolId(c.itemId)).map((c) => strip(c.itemId));
    expect(offered).toEqual(['phrase.recovery.repeat', 'phrase.recovery.one-moment']);
  });
});

/* ── Mission 09 — Shopping ───────────────────────────────────────────────────────────────────── */

describe('Mission 09 — Shopping', () => {
  const day = mission(9);
  it('flow: learn → recognize → out-of-stock by ear → Shop Rush → size → conversation → fast seller', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quiz', 'quickReply', 'swap', 'dialogue', 'receipt', 'swipe', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('Shop Rush: four moments with a seller, each answered with a taught line', () => {
    expect(replyMap(day)).toEqual([
      ['reply.shop.can-i-help', ['phrase.shop.just-looking']],
      ['situation', ['phrase.shop.try-on']],
      ['reply.shop.on-sale', ['phrase.shop.take-it']],
      ['situation', ['phrase.shop.too-expensive']],
    ]);
  });
  it('size flexibility is said the way each language says it', () => {
    const sizes = (lang: Lang): string[] => { const r = stepsOf(mission(9, lang), 'swap')[0]!.rounds[0]!; return r.options.map((o) => fillFrame(r.frame, o.slot)); };
    expect(sizes('en')).toEqual(['Do you have a bigger size?', 'Do you have a smaller size?']);
    expect(sizes('fr')).toEqual(['Vous avez une taille plus grande ?', 'Vous avez une taille plus petite ?']);
    expect(sizes('es')).toEqual(['¿Tiene una talla más grande?', '¿Tiene una talla más pequeña?']);
    for (const lang of LANGS) {
      const swap = stepsOf(mission(9, lang), 'swap')[0]!;
      expect(swap.rounds, lang).toHaveLength(2);
      // The adjective agrees with "size" (taille / talla — feminine), not with the garment: one wording fits any item.
      if (lang !== 'en') expect(sizes(lang).join(' '), lang).toMatch(/(taille|talla) (plus grande|más grande).*(taille|talla) (plus petite|más pequeña)/);
      // English and Spanish: the taught sentence IS the frame's first outcome. French teaches the shop
      // idiom "une taille au-dessus" as its key sentence and practises the plain "plus grande / plus petite".
      if (lang !== 'fr') expect(sizes(lang)[0], lang).toBe(text(mission(9, lang), 'phrase.shop.bigger'));
    }
  });
  it('"out of stock" stays something to UNDERSTAND: heard and tested by ear, never a learner answer', () => {
    expect(strip(stepsOf(day, 'quiz')[0]!.itemId)).toBe('reply.shop.out-of-stock');
    expect(reviewed(day)).toContain('reply.shop.out-of-stock');
    for (const s of stepsOf(day, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(strip(o.itemId)).not.toBe('reply.shop.out-of-stock');
  });
  it('it was not bloated: no new sentences, one quiz, at most four rounds per game', () => {
    expect(day.items).toHaveLength(15);
    expect(stepsOf(day, 'quiz')).toHaveLength(1);
    for (const s of [...stepsOf(day, 'quickReply'), ...stepsOf(day, 'swap')]) expect(s.rounds.length).toBeLessThanOrEqual(4);
    expect(stepsOf(day, 'ambush')[0]!.mode).toBe('recovery');
  });
});

/* ── Mission 10 — the checkpoint ─────────────────────────────────────────────────────────────── */

describe('Mission 10 — CHECKPOINT: Arrival Day', () => {
  const day = mission(10);
  const screens = (d: BootcampDayContent) => Object.values(d.dialogues).flatMap((dl) => dl.nodes.filter((n) => n.choices?.length).map((n) => ({ scene: dl.id, node: n })));

  it('it proves, it does not teach: no key sentence, no word intro, no listening drill, no quiz, no review', () => {
    expect(kinds(day)).toEqual(['talk', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'ambush:speed', 'receipt', 'receipt', 'summary']);
    for (const lang of LANGS) for (const s of mission(10, lang).steps) expect(['tool', 'prime', 'replies', 'quiz', 'swipe'], lang).not.toContain(s.kind);
  });
  it('three cold scenes — border, taxi, hotel — with no translation before the learner answers', () => {
    for (const lang of LANGS) {
      const d = mission(10, lang);
      expect(Object.keys(d.dialogues), lang).toEqual(['cold-border', 'cold-taxi', 'cold-hotel']);
      for (const dl of Object.values(d.dialogues)) { expect(dl.cold, `${lang} ${dl.id}`).toBe(true); expect(dl.nodes[0]!.who, `${lang} ${dl.id}`).toBe('npc'); }
    }
    // Only the reworked checkpoints are cold: no teaching mission hides the translation.
    for (const m of BOOTCAMP_PLAN) if (!['arrival-day-checkpoint', 'food-day-checkpoint'].includes(m.id)) for (const dl of Object.values(MISSIONS_BY_LANG.en![m.day]!.dialogues)) expect(dl.cold, m.id).toBeUndefined();
  });
  it('real decisions: eleven screens offer the line that fits AND a line from another moment', () => {
    for (const lang of LANGS) {
      const all = screens(mission(10, lang));
      const real = all.filter(({ node }) => node.choices!.some((c) => c.correct) && node.choices!.some((c) => !c.correct));
      expect(real.length, lang).toBe(11);
      expect(all.filter(({ node }) => node.choices!.length === 1), lang).toHaveLength(0); // not one one-button screen
      for (const { node } of real) {
        expect(node.choices!.length, lang).toBeGreaterThanOrEqual(2);
        expect(node.choices!.length, lang).toBeLessThanOrEqual(3);
      }
    }
    // The wrong options are real sentences of Missions 06–08 that fit somewhere else — never nonsense.
    const earlier = new Set([6, 7, 8, 9].flatMap((n) => mission(n).items.map((i) => i.text)));
    for (const { node } of screens(day)) for (const c of node.choices!.filter((x) => !x.correct)) expect(earlier.has(c.en), c.en).toBe(true);
  });
  it('a miss is never passed over: the question is asked again, slowly, and the same decision comes back', () => {
    for (const lang of LANGS) for (const dl of Object.values(mission(10, lang).dialogues)) {
      const byId = new Map(dl.nodes.map((n) => [n.id, n]));
      for (const n of dl.nodes) for (const c of n.choices ?? []) {
        if (c.correct) continue;
        const beat = byId.get(c.next)!;
        expect(beat.who, `${lang} ${dl.id}/${n.id}`).toBe('npc');
        expect(beat.slow, `${lang} ${dl.id}/${n.id}`).toBe(true);
        expect(beat.next, `${lang} ${dl.id}/${n.id}`).toBe(n.id); // …back to the same choice, not to a single button
        const asked = dl.nodes.find((x) => x.next === n.id && x.id !== beat.id && !x.slow)!;
        expect(beat.en, `${lang} ${dl.id}/${n.id}`).toBe(asked.en); // the same question — no new language in a correction
      }
    }
  });
  it('recovery is success: three moments accept a conversation-help tool, and the speaker then says it again in known words', () => {
    for (const lang of LANGS) {
      const d = mission(10, lang);
      const tools = screens(d).flatMap(({ scene, node }) => node.choices!.filter((c) => isHelpToolId(c.itemId)).map((c) => ({ scene, node, c })));
      expect(tools.map((x) => `${x.scene}:${strip(x.c.itemId)}`), lang).toEqual(['cold-border:phrase.recovery.repeat', 'cold-taxi:phrase.recovery.slowly', 'cold-hotel:phrase.recovery.repeat']);
      for (const { scene, node, c } of tools) {
        expect(c.correct, lang).toBe(true);
        const dl = d.dialogues[scene]!;
        const again = dl.nodes.find((n) => n.id === c.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${scene}`).toEqual(['npc', true, node.id]);
      }
      // The fast lines are where a tool is offered.
      for (const scene of ['cold-taxi', 'cold-hotel']) {
        const dl = d.dialogues[scene]!;
        const withTool = dl.nodes.find((n) => n.choices?.some((c) => isHelpToolId(c.itemId)))!;
        expect(dl.nodes.find((n) => n.next === withTool.id && !n.slow)!.fast, `${lang} ${scene}`).toBe(true);
      }
    }
  });
  it('STRICT — zero new target-language vocabulary: every word of the checkpoint was met in Missions 01–09', () => {
    for (const lang of LANGS) {
      const known = vocabulary(lang, 9);
      expect(unknownIn(lines(mission(10, lang)), known), lang).toEqual([]);
    }
    // The words the old cold opens smuggled in are gone.
    expect(lines(day).join(' ')).not.toMatch(/prefer|main entrance|downstairs|key card|wifi/i);
  });
  it('every learner line is a sentence an earlier mission taught, with the same id and the same wording', () => {
    for (const lang of LANGS) {
      const d = mission(10, lang);
      const before = new Map([1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((n) => mission(n, lang).items.map((i): [string, string] => [i.id, i.text])));
      for (const i of d.items) expect(before.get(i.id), `${lang} ${i.id}`).toBe(i.text);
    }
  });
  it('one speed-listening moment, honestly labelled: known language, no "use a tool" badge anywhere', () => {
    for (const lang of LANGS) {
      const ambushes = stepsOf(mission(10, lang), 'ambush');
      expect(ambushes, lang).toHaveLength(1);
      expect(ambushes[0]!.mode, lang).toBe('speed');
      expect(isHelpToolId(ambushes[0]!.correctItemId) || isHelpToolId(ambushes[0]!.wrongItemId), lang).toBe(false);
    }
    expect(strip(stepsOf(day, 'ambush')[0]!.correctItemId)).toBe('reply.hotel.breakfast-time');
    const player = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toMatch(/step\.mode === 'speed' \? '' :/); // a speed challenge puts 🛟 on nothing
  });
  it('the three languages are the same checkpoint: same scenes, same turns, same decisions', () => {
    const shape = (d: BootcampDayContent) => Object.values(d.dialogues).map((dl) => [dl.id, dl.nodes.map((n) => [n.id, n.who, n.next ?? null, n.fast ?? false, n.slow ?? false, (n.choices ?? []).map((c) => [strip(c.itemId), c.correct, c.next])])]);
    for (const lang of ['fr', 'es'] as const) expect(shape(mission(10, lang)), lang).toEqual(shape(day));
  });
  it('the closing proof says what was done — and teaches nothing after it', () => {
    const last = day.steps.slice(-2);
    expect(last.map((s) => s.kind)).toEqual(['receipt', 'summary']);
    expect(last[0]!.kind === 'receipt' && last[0]!.text.en).toMatch(/cleared the border.*taxi.*fare.*checked in.*did not freeze/);
  });
});

/* ── the screens ─────────────────────────────────────────────────────────────────────────────── */

describe('what the screens show', () => {
  let ui: typeof PlayerSteps;
  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    ui = await import('./PracticeSteps.js');
    (await import('../../shared/i18n/strings.js')).setUiLangDict('he');
  });
  const render = (n: number, step: BootcampStep, Step: unknown): string => {
    const day = mission(n);
    const itemsById = new Map(day.items.map((i) => [i.id, i]));
    return renderToStaticMarkup(createElement(Step as (p: { step: BootcampStep; itemsById: typeof itemsById; onDone: () => void }) => JSX.Element, { step, itemsById, onDone: () => undefined }));
  };

  it('Border Quick Reply: the question is heard, not written, and nothing on the answers is in Hebrew', () => {
    const html = render(6, stepsOf(mission(6), 'quickReply')[0]!, ui.QuickReplyStep);
    expect(html).toContain('class="audio-bubble"');
    expect(html).not.toContain('purpose of your visit');
    const answers = [...html.matchAll(/<button class="btn-secondary btn-reply">(.*?)<\/button>/g)].map((m) => m[1]!);
    expect(answers).toHaveLength(3);
    for (const a of answers) expect(a).not.toMatch(/[֐-׿]/);
  });
  it('Border Rush is announced as a speed moment — no internal name', () => {
    const html = render(6, stepsOf(mission(6), 'quickReply')[1]!, ui.QuickReplyStep);
    expect(html).toContain('⚡');
    expect(html.replace(/<[^>]+>/g, ' ')).not.toMatch(/Border Rush|Quick Reply|quickReply|challenge/i);
  });
  it('Hotel Match shows numbers and icons as answers; the board holds no Hebrew', () => {
    const html = render(8, stepsOf(mission(8), 'matchPairs')[0]!, ui.MatchPairsStep);
    const board = html.slice(html.indexOf('class="pmatch"'));
    for (const label of ['🚪 204', '🏢 2', '🍳 7–10', '🛗 ➡️']) expect(board).toContain(`<span dir="ltr">${label}</span>`);
    expect(board.slice(0, board.indexOf('</div>'))).not.toMatch(/[֐-׿]/);
    expect(board.match(/<button/g)).toHaveLength(8);
  });
  it('a cold scene gives no translation before the answer; an ordinary scene still does', () => {
    const player = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toContain('gloss={dialogue.cold ? undefined : dialogueTr(displayNpc)}');
  });
});
