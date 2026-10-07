import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { beforeCueFreeze } from './cueFreeze.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Practice depth — Missions 19–24 (City & Conversation). The point of the phase is to stop sounding
 * like a phrasebook: tell a small story, say what comes next, complain politely, give an opinion and
 * a reason. What each mission must now train is pinned; the checkpoint proves instead of teaching;
 * and everything this pass was NOT allowed to touch — Missions 01–18, Missions 25–30, the dialogues
 * of 19–23 — is fingerprinted.
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
const chats = (day: BootcampDayContent) => stepsOf(day, 'quickReply').filter((s) => !s.challenge);
function retrieved(day: BootcampDayContent): Map<string, number> {
  const out = new Map<string, number>();
  const add = (id: string | undefined): void => { if (id) out.set(strip(id), (out.get(strip(id)) ?? 0) + 1); };
  for (const s of day.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) for (const o of r.options) if (o.correct) add(o.itemId);
    if (s.kind === 'swap') for (const r of s.rounds) add(r.itemId);
    if (s.kind === 'sentenceBuilder') for (const r of s.rounds) add(r.itemId);
    if (s.kind === 'matchPairs') for (const p of s.pairs) add(p.answerItemId);
  }
  return out;
}
const mapOf = (step: Extract<BootcampStep, { kind: 'quickReply' }>): [string, string[]][] =>
  step.rounds.map((r): [string, string[]] => [r.promptItemId ? strip(r.promptItemId) : r.npc ? r.npc.en : 'situation', r.options.filter((o) => o.correct).map((o) => strip(o.itemId))]);
const swapAll = (day: BootcampDayContent): string[][] => stepsOf(day, 'swap').flatMap((s) => s.rounds.map((r) => r.options.map((o) => fillFrame(r.frame, o.slot))));

/* ── vocabulary: what a learner has met ──────────────────────────────────────────────────────── */

const PROPER = new Set(['cohen', 'mama', 'rosa', 'vietnam', 'hanoi', 'hanoï', 'hanói', 'thailand', 'thaïlande', 'tailandia', 'argentina', 'argentine', 'israel', 'israël']);
const words = (s: string): string[] => s.toLowerCase().replace(/[’`]/g, "'").split(/[^\p{L}']+/u).map((w) => w.replace(/^'+|'+$/g, '')).filter((w) => w && !PROPER.has(w));
/** Every target-language line a mission puts in front of the learner. A recovery challenge is left
 *  out by default (it may be beyond the learner); `withRecovery` includes it, `skipChallenge` leaves
 *  out the speed chain and the recovery challenge so they can be checked against the rest. */
function lines(day: BootcampDayContent, opts: { skipFinals?: boolean } = {}): string[] {
  const out: string[] = day.items.map((i) => i.text);
  for (const d of Object.values(day.dialogues)) for (const n of d.nodes) { if (n.en) out.push(n.en); for (const c of n.choices ?? []) out.push(c.en); }
  for (const s of day.steps) {
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
    if (s.kind === 'ambush' && s.mode !== 'recovery') out.push(s.npc.en);
    if (s.kind === 'quickReply' && !(opts.skipFinals && s.challenge)) for (const r of s.rounds) { if (r.npc) out.push(r.npc.en); for (const o of r.options) if (o.text) out.push(o.text); }
    if (s.kind === 'visualMatch' || s.kind === 'miniMap') out.push(...s.rounds.map((r) => r.audio.en));
    if (s.kind === 'swap') for (const r of s.rounds) for (const o of r.options) out.push(fillFrame(r.frame, o.slot));
    if (s.kind === 'matchPairs') for (const p of s.pairs) if (p.answerText) out.push(p.answerText);
    if (s.kind === 'sentenceBuilder') for (const r of s.rounds) out.push(r.chunks.join(' '));
  }
  return out;
}
const vocabulary = (lang: Lang, upTo: number, skipFinalsOfLast = false): Set<string> =>
  new Set(Array.from({ length: upTo }, (_, i) => lines(mission(i + 1, lang), { skipFinals: skipFinalsOfLast && i + 1 === upTo })).flat().flatMap(words));
const unknownIn = (said: string[], known: Set<string>): string[] => [...new Set(said.flatMap(words).filter((w) => !known.has(w)))];

/* ── scope ───────────────────────────────────────────────────────────────────────────────────── */

describe('scope: only the Practice of Missions 19–24 changed', () => {
  // Scene transitions became non-spoken cues after these fingerprints were taken; `beforeCueFreeze`
  // puts the labels back, so the fingerprints still prove nothing else moved (see cueFreeze.ts).
  const slice = (lang: Lang, a: number, b: number): BootcampDayContent[] => BOOTCAMP_PLAN.slice(a, b).map((m) => beforeCueFreeze(MISSIONS_BY_LANG[lang]![m.day]!, lang));
  const print = (f: (lang: Lang) => unknown): Record<Lang, string> => ({ en: fnv(JSON.stringify(f('en'))), fr: fnv(JSON.stringify(f('fr'))), es: fnv(JSON.stringify(f('es'))) });

  it('Missions 02–18 are byte-for-byte unchanged (Mission 01 has its own pass — mission01.test.ts)', () => {
    expect(print((l) => slice(l, 1, 18))).toEqual({ en: '0a882011', fr: 'd4a6a68e', es: 'fcbddaf5' });
  });
  it('the locked dialogues of Missions 19–23 are byte-for-byte unchanged', () => {
    expect(print((l) => slice(l, 18, 23).map((d) => d.dialogues))).toEqual({ en: '594ead2b', fr: '63803269', es: '55c7bd8f' });
  });
  it('the intro cards and titles of Missions 20–23 are unchanged (Mission 19\'s intro was corrected — see its own test)', () => {
    expect(print((l) => slice(l, 19, 23).map((d) => [d.day, d.title, d.steps[0]]))).toEqual({ en: 'b59d67b6', fr: 'b59d67b6', es: 'b59d67b6' });
  });
  it('after the final micro-pass the approved practice is otherwise exactly as approved', () => {
    const d = (l: Lang, n: number): BootcampDayContent => beforeCueFreeze(MISSIONS_BY_LANG[l]![BOOTCAMP_PLAN[n - 1]!.day]!, l);
    // Missions 20, 21, 23 and 24, whole.
    expect(print((l) => [20, 21, 23, 24].map((n) => d(l, n)))).toEqual({ en: '369ee46b', fr: 'd43599e4', es: '723bbe78' });
    // Mission 19 apart from its intro card; Mission 22 apart from the removed builder and the shortened speed chain.
    expect(print((l) => [d(l, 19).items, d(l, 19).dialogues, d(l, 19).steps.filter((s) => s.kind !== 'talk')])).toEqual({ en: 'f31e051c', fr: '4daed3c6', es: 'b9009e74' });
    // Mission 22: with the proof card after the speed chain put back to its approved wording (it was
    // reworded to match the four decisions), everything else hashes to the approved build.
    const approvedCard = { he: 'מנה שגויה, חיוב כפול, מזגן, חדר רועש — אמרת מה הבעיה, ביקשת פתרון, וקיבלת אותו. בנימוס.', en: 'A wrong dish, a double charge, the AC, a noisy room — you said what was wrong, asked for a fix, and got one. Politely.' };
    const m22 = (l: Lang): unknown => {
      const day = d(l, 22);
      const at = day.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
      const steps = day.steps.map((s, i) => (i === at + 1 ? { kind: 'receipt', text: approvedCard } : s)).filter((s) => s.kind !== 'sentenceBuilder' && !(s.kind === 'quickReply' && 'challenge' in s && s.challenge));
      return [day.items, day.dialogues, steps];
    };
    expect(print(m22)).toEqual({ en: '0f2900a2', fr: 'b026802a', es: 'c2c94737' });
  });
  it('sentences: nothing was deleted or reworded; exactly ONE id was added — the answer to "Single or return?"', () => {
    // Without the new sentence, the sentence lists of 19–23 hash to what they were.
    expect(print((l) => slice(l, 18, 23).map((d) => d.items.filter((i) => strip(i.id) !== 'phrase.trans.single')))).toEqual({ en: '14b156dc', fr: '7b380b48', es: '6ff0d873' });
    for (const lang of LANGS) {
      const d = mission(19, lang);
      const said = Object.values(d.dialogues)[0]!.nodes.find((n) => n.id === 'c2')!.choices![0]!.en;
      expect(text(d, 'phrase.trans.single'), lang).toBe(said); // it IS the line the conversation already uses
    }
    expect(text(mission(19), 'phrase.trans.single')).toBe('Single, please.');
  });
  it('nothing was retired in this pass: the archive still holds the same seven sentences', () => {
    for (const lang of LANGS) expect(RETIRED_SENTENCES[lang], lang).toHaveLength(7);
    expect(RETIRED_SENTENCES.en.some((r) => /trans\.|past\.|future\.|fix\.|opin\./.test(r.id))).toBe(false);
  });
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(18, 24).map((m) => `${m.id}:${m.day}`)).toEqual(['public-transport:18', 'past-events:34', 'future-plans:35', 'fixing-problems:24', 'opinions-reactions:36', 'city-day-checkpoint:23']);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (let n = 19; n <= 24; n++) for (const s of mission(n, lang).steps) expect(allowed, `${lang} M${n}`).toContain(s.kind);
  });
});

describe('all three languages get the same practice, each in its own words', () => {
  it('every step of Missions 19–24 validates in English, French and Spanish', () => {
    for (const lang of LANGS) for (let n = 19; n <= 24; n++) {
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
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'ambush') return [s.kind, s.mode, strip(s.correctItemId), strip(s.wrongItemId)];
      if (s.kind === 'tool') return [s.kind, strip(s.itemId), s.label];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'quiz') return [s.kind, strip(s.itemId), s.wrongIds.map(strip)];
      if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
      if (s.kind === 'receipt') return [s.kind, s.text];
      return s.kind;
    };
    for (let n = 19; n <= 24; n++) for (const lang of ['fr', 'es'] as const) expect(mission(n, lang).steps.map(shape), `${lang} M${n}`).toEqual(mission(n).steps.map(shape));
  });
  it('sentence-builder chunks are each language\'s own and spell the taught sentence exactly', () => {
    for (let n = 19; n <= 23; n++) for (const lang of LANGS) {
      const day = mission(n, lang);
      for (const s of stepsOf(day, 'sentenceBuilder')) for (const r of s.rounds) expect(r.chunks.join(' '), `${lang} M${n}`).toBe(text(day, strip(r.itemId)));
    }
    // French and Spanish are not cut where English is cut: "What did you do yesterday?"
    expect(stepsOf(mission(20), 'sentenceBuilder')[0]!.rounds[1]!.chunks).toEqual(['What', 'did you do', 'yesterday?']);
    expect(stepsOf(mission(20, 'fr'), 'sentenceBuilder')[0]!.rounds[1]!.chunks).toEqual(['Tu as fait', 'quoi', 'hier ?']);
    expect(stepsOf(mission(20, 'es'), 'sentenceBuilder')[0]!.rounds[1]!.chunks).toEqual(['¿Qué', 'hiciste', 'ayer?']);
  });
  it('register: transport and staff are vous / usted; travelers and friends keep the approved tu / tú', () => {
    const said = (n: number, lang: Lang): string[] => {
      const d = mission(n, lang);
      return [
        ...Object.values(d.dialogues).flatMap((dl) => dl.nodes.filter((x) => x.who === 'npc').map((x) => x.en)),
        ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => (r.npc ? [r.npc.en] : []))),
        ...stepsOf(d, 'ambush').map((s) => s.npc.en),
      ].flatMap(words);
    };
    for (const n of [19, 22]) {
      expect(said(n, 'fr').filter((w) => ['tu', 'toi', 'ton', 'ta', 'tes'].includes(w)), `fr M${n}`).toEqual([]);
      expect(said(n, 'es').filter((w) => ['tú', 'tu', 'tus', 'te', 'tienes', 'quieres', 'vas'].includes(w)), `es M${n}`).toEqual([]);
    }
    for (const n of [20, 21, 23]) {
      expect(said(n, 'fr').filter((w) => w === 'tu').length, `fr M${n}`).toBeGreaterThan(0);
      expect(said(n, 'fr').filter((w) => ['vous', 'votre', 'vos'].includes(w)), `fr M${n}`).toEqual([]);
      expect(said(n, 'es').filter((w) => ['usted'].includes(w)), `es M${n}`).toEqual([]);
    }
  });
  it('the closing review is selective: at most 12 cards, everything taught is in it, nothing twice', () => {
    for (let n = 19; n <= 23; n++) {
      const day = mission(n);
      const review = reviewed(day);
      expect(review.length, `M${n}`).toBeLessThanOrEqual(12);
      expect(review.length, `M${n}`).toBeLessThan(day.items.length);
      for (const id of taught(day)) expect(review, `M${n} ${id}`).toContain(id);
      expect(new Set(review).size, `M${n}`).toBe(review.length);
    }
  });
  it('no meaning quiz is left: every line that was tested twice is now drilled once and then USED', () => {
    for (let n = 19; n <= 23; n++) for (const lang of LANGS) expect(stepsOf(mission(n, lang), 'quiz'), `${lang} M${n}`).toHaveLength(0);
    // The lines that used to be re-tested are now prompts the learner answers.
    const prompts = (n: number): string[] => stepsOf(mission(n), 'quickReply').flatMap((s) => s.rounds.map((r) => strip(r.promptItemId) || r.npc?.en || ''));
    expect(prompts(19)).toContain('reply.trans.single-return');
    expect(prompts(20)).toContain('reply.past.where-did-you-stay');
    expect(prompts(21)).toContain('reply.future.how-long');
    expect(prompts(22)).toContain('reply.fix.refund-now');
    expect(prompts(23)).toContain('reply.opin.why');
    // …and each is in the listening drill exactly once.
    for (const [n, id] of [[19, 'reply.trans.single-return'], [20, 'reply.past.where-did-you-stay'], [21, 'reply.future.how-long'], [22, 'reply.fix.refund-now'], [23, 'reply.opin.why']] as const) {
      expect(stepsOf(mission(n), 'replies')[0]!.replyIds.map(strip).filter((x) => x === id), `M${n}`).toHaveLength(1);
    }
  });
  it('every teaching mission ends on a chain at natural speed made ONLY of its own conversation\'s lines', () => {
    for (let n = 19; n <= 23; n++) for (const lang of LANGS) {
      const day = mission(n, lang);
      const speed = rush(day);
      expect(speed.label, `${lang} M${n}`).toBeUndefined();
      const said = speed.rounds.map((r) => r.npc!.en);
      const spoken = Object.values(day.dialogues).flatMap((d) => d.nodes.filter((x) => x.who === 'npc').map((x) => x.en));
      for (const line of said) expect(spoken, `${lang} M${n} “${line}”`).toContain(line);
      expect(unknownIn(said, vocabulary(lang, n, true)), `${lang} M${n}`).toEqual([]);
      expect(speed.rounds.length, `${lang} M${n}`).toBeGreaterThanOrEqual(4);
    }
  });
  it('no grammar lecture: nothing the new steps show names a tense, a verb or a part of speech', () => {
    for (let n = 19; n <= 24; n++) {
      const copy = JSON.stringify(mission(n).steps.filter((s) => s.kind !== 'tool' && s.kind !== 'talk').map((s) => ('label' in s ? s.label : s.kind === 'receipt' ? s.text : s.kind === 'swap' ? s.rounds.map((r) => r.cue) : s.kind === 'quickReply' ? s.rounds.map((r) => r.situation) : null)));
      expect(copy, `M${n}`).not.toMatch(/\b(verb|noun|tense|past simple|future tense|conjugat|adjective|adverb|grammar)\b|פועל|דקדוק|זמן עבר|זמן עתיד|שם תואר/i);
    }
  });
});

/* ── Mission 19 — Public Transport ───────────────────────────────────────────────────────────── */

describe('Mission 19 — Public Transport', () => {
  const day = mission(19);
  it('flow: learn → recognize → station board → at the station → any destination → conversation → at speed → the fast correction', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'visualMatch', 'quickReply', 'swap', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('the intro promises what the mission trains — numbers by ear and one fast correction, not announcements', () => {
    const intro = day.steps[0]!;
    const said = intro.kind === 'talk' ? intro.body.map((b) => `${b.en} ${b.he}`).join(' ') : '';
    expect(said).toMatch(/Ticket, platform, direction, the right stop/);
    expect(said).toMatch(/the platform number, how many stops, how often it leaves — and one fast correction at the end/);
    expect(said).not.toMatch(/announcement|הכרז/i);
    for (const lang of ['fr', 'es'] as const) expect(mission(19, lang).steps[0], lang).toEqual(intro); // app-language copy, same in every language
    // No proof card claims an announcement either.
    expect(JSON.stringify(stepsOf(day, 'receipt'))).not.toMatch(/announcement|הכרז|הודעת/i);
  });
  it('station listening: platform, stops, frequency — by ear, with numbers already known', () => {
    const board = stepsOf(day, 'visualMatch')[0]!;
    expect(board.tiles.map((t) => `${t.emoji}${t.label}`)).toEqual(['🚉2', '🚉3', '🛑2', '🛑3', '⏱️5', '⏱️10']);
    expect(board.rounds.map((r) => [r.audio.en, r.correct])).toEqual([['Platform two.', 'p2'], ["It's three stops.", 's3'], ['Every ten minutes.', 'm10'], ['Platform three.', 'p3']]);
    for (const lang of LANGS) expect(unknownIn(stepsOf(mission(19, lang), 'visualMatch')[0]!.rounds.map((r) => r.audio.en), new Set([...vocabulary(lang, 18), ...mission(19, lang).items.flatMap((i) => words(i.text))])), lang).toEqual([]);
  });
  it('ticket → single → platform → stop → the next one are all retrieved; "Single, please." finally can be', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['Hello! Where are you headed?', ['phrase.trans.one-ticket']],
      ['reply.trans.single-return', ['phrase.trans.single']],
      ["That's three euros. It leaves every ten minutes.", ['phrase.trans.which-platform', 'phrase.recovery.thank-you']],
      ["The train's right here. Hop on.", ['phrase.trans.does-stop', 'phrase.trans.next-one']],
      ['situation', ['phrase.trans.next-one']],
      ['reply.trans.wrong-way', ['phrase.trans.which-platform', 'phrase.recovery.repeat']],
    ]);
    const r = retrieved(day);
    for (const id of ['phrase.trans.one-ticket', 'phrase.trans.single', 'phrase.trans.which-platform', 'phrase.trans.does-stop', 'phrase.trans.next-one']) expect(r.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
  });
  it('route flexibility: one ticket to three places the learner already has words for', () => {
    expect(swapAll(day)[0]).toEqual(['One ticket to the centre, please.', 'One ticket to the museum, please.', 'One ticket to the airport, please.']);
    expect(swapAll(mission(19, 'fr'))[0]).toEqual(['Un billet pour le centre, s’il vous plaît.', 'Un billet pour le musée, s’il vous plaît.', 'Un billet pour l’aéroport, s’il vous plaît.']);
    expect(swapAll(mission(19, 'es'))[0]).toEqual(['Un billete para el centro, por favor.', 'Un billete para el museo, por favor.', 'Un billete para el aeropuerto, por favor.']);
    for (const lang of LANGS) {
      expect(swapAll(mission(19, lang))[0]![0], lang).toBe(text(mission(19, lang), 'phrase.trans.one-ticket'));
      // The destinations are words from earlier missions or from this mission's own sentences and conversation.
      const d = mission(19, lang);
      const known = new Set([...vocabulary(lang, 18), ...d.items.flatMap((i) => words(i.text)), ...Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((x) => words(x.en)))]);
      expect(unknownIn(swapAll(d).flat(), known), lang).toEqual([]);
    }
  });
  it('es-ES: the ticket is a "billete" everywhere — there is no "boleto" in the Spanish runtime', () => {
    const all = BOOTCAMP_PLAN.map((m) => JSON.stringify(MISSIONS_BY_LANG.es![m.day])).join(' ');
    expect(all).not.toMatch(/boleto/i);
    expect(JSON.stringify(mission(19, 'es'))).toMatch(/billete/);
    expect([text(mission(19, 'es'), 'phrase.trans.which-platform'), text(mission(19, 'es'), 'reply.trans.three-stops')]).toEqual(['¿Qué andén?', 'Son tres paradas.']);
  });
  it('recovery: the final correction is fast and dense but made ONLY of known words — and asking again is the answer', () => {
    for (const lang of LANGS) {
      const d = mission(19, lang);
      const [ambush] = stepsOf(d, 'ambush');
      expect([ambush!.mode, strip(ambush!.correctItemId)], lang).toEqual(['recovery', 'phrase.recovery.repeat']);
      expect(unknownIn([ambush!.npc.en], vocabulary(lang, 19)), lang).toEqual([]); // difficulty = pace, not vocabulary
      expect(words(ambush!.npc.en).length, lang).toBeGreaterThanOrEqual(18);
    }
    expect(JSON.stringify(day.steps)).not.toMatch(/delayed|replacement bus|stand C/); // the old untaught disruption is gone
    // Recovery also counts inside the practice: being told you are going the wrong way.
    expect(chats(day)[0]!.rounds[5]!.options.find((o) => isHelpToolId(o.itemId))!.correct).toBe(true);
  });
  it('final challenge: ticket → single → platform → stop', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.trans.one-ticket'], ['phrase.trans.single'], ['phrase.trans.which-platform'], ['phrase.trans.does-stop']]);
  });
});

/* ── Mission 20 — Past & Recent Events ───────────────────────────────────────────────────────── */

describe('Mission 20 — Past & Recent Events', () => {
  const day = mission(20);
  it('flow: learn → recognize → answering about yesterday → variations → build → conversation → the story at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quickReply', 'swap', 'sentenceBuilder', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('went / saw / ate / stayed / how it was are each actively retrieved, more than once', () => {
    const r = retrieved(day);
    for (const id of ['phrase.past.i-went', 'phrase.past.i-saw', 'phrase.past.i-ate', 'phrase.past.i-stayed', 'phrase.past.it-was-great']) expect(r.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
    expect(r.get('phrase.past.it-was-bad')).toBe(1); // it had no retrieval at all before
  });
  it('the Quick Reply uses the friend\'s own questions', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['reply.past.what-did-you-see', ['phrase.past.i-saw']],
      ['reply.past.did-you-eat', ['phrase.past.i-ate']],
      ['reply.past.did-you-like', ['phrase.past.it-was-great', 'phrase.past.it-was-good']],
      ['reply.past.where-did-you-stay', ['phrase.past.i-stayed']],
      ['reply.past.was-it-good', ['phrase.past.what-did-you-do']],
      ['situation', ['phrase.past.what-did-you-do']],
    ]);
  });
  it('the ask-back — "What did you do yesterday?" — is retrieved four ways: wrapped, alone, built, at speed', () => {
    expect(retrieved(day).get('phrase.past.what-did-you-do')).toBe(4);
    expect(chats(day)[0]!.rounds[4]!.options.find((o) => o.correct)!.text).toBe('It was good. And you? What did you do yesterday?');
  });
  it('story variation is authored per language — a place, a bed, a verdict — with words already met', () => {
    expect(swapAll(day)).toEqual([
      ['I went to the old town.', 'I went to the market.', 'I went to the beach.'],
      ['I went to the old town.', 'I went to the market.', 'I went to the beach.'],
      ['I stayed in a hostel.', 'I stayed in a hotel.'],
      ['It was great.', 'It was good.', 'It was bad.'],
      ['It was great.', 'It was good.', 'It was bad.'],
    ]);
    expect(swapAll(mission(20, 'fr'))[0]).toEqual(['Je suis allé dans la vieille ville.', 'Je suis allé au marché.', 'Je suis allé à la plage.']); // dans / au / à — not one preposition
    expect(swapAll(mission(20, 'es'))[0]).toEqual(['Fui al casco antiguo.', 'Fui al mercado.', 'Fui a la playa.']);
    expect(swapAll(mission(20, 'fr'))[2]).toEqual(['J’ai logé dans une auberge.', 'J’ai logé dans un hôtel.']);
    expect(swapAll(mission(20, 'es'))[3]).toEqual(['Estuvo genial.', 'Estuvo bien.', 'Estuvo mal.']);
    for (const lang of LANGS) {
      const d = mission(20, lang);
      expect(swapAll(d)[0]![0], lang).toBe(text(d, 'phrase.past.i-went'));
      expect(swapAll(d)[2]![0], lang).toBe(text(d, 'phrase.past.i-stayed'));
      expect([swapAll(d)[3]![1], swapAll(d)[3]![2]], lang).toEqual([text(d, 'phrase.past.it-was-good'), text(d, 'phrase.past.it-was-bad')]);
      expect(unknownIn(swapAll(d).flat(), new Set([...vocabulary(lang, 19), ...d.items.flatMap((i) => words(i.text)), ...Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((x) => words(x.en)))])), lang).toEqual([]);
    }
    // Five rounds, not a table of forms.
    expect(stepsOf(day, 'swap')[0]!.rounds).toHaveLength(5);
  });
  it('final story chain: went → saw → ate → liked it → stayed → asks back', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.past.i-went'], ['phrase.past.i-saw'], ['phrase.past.i-ate'], ['phrase.past.it-was-great'], ['phrase.past.i-stayed'], ['phrase.past.what-did-you-do']]);
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
  });
});

/* ── Mission 21 — Future Travel & Plans ──────────────────────────────────────────────────────── */

describe('Mission 21 — Future Travel & Plans', () => {
  const day = mission(21);
  it('flow: learn → recognize → answering about your plans → variations → build → conversation → the itinerary at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quickReply', 'swap', 'sentenceBuilder', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('destination → duration → intention → after that → tomorrow → ask back', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['So, where are you going next?', ['phrase.future.going-to-vietnam']],
      ['reply.future.how-long', ['phrase.future.ill-be-there']],
      ['reply.future.what-do-there', ['phrase.future.want-to-visit', 'phrase.future.want-to-try-food']],
      ['reply.future.and-after', ['phrase.future.after-that']],
      ['reply.future.tomorrow-morning-q', ['phrase.future.tomorrow-morning']],
      ['situation', ['phrase.future.where-next']],
    ]);
    const r = retrieved(day);
    for (const id of ['phrase.future.going-to-vietnam', 'phrase.future.ill-be-there', 'phrase.future.want-to-visit', 'phrase.future.after-that']) expect(r.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
    expect(r.get('phrase.future.where-next')).toBe(3); // alone, built, at speed
  });
  it('duration is REUSED from Mission 06, not retaught: three days / a week / two weeks, in each language\'s own frame', () => {
    expect(swapAll(day)[0]).toEqual(["I'll be there for three days.", "I'll be there for a week.", "I'll be there for two weeks."]);
    expect(swapAll(mission(21, 'fr'))[0]).toEqual(['Je vais rester trois jours.', 'Je vais rester une semaine.', 'Je vais rester deux semaines.']);
    expect(swapAll(mission(21, 'es'))[0]).toEqual(['Voy a estar allí tres días.', 'Voy a estar allí una semana.', 'Voy a estar allí dos semanas.']);
    for (const lang of LANGS) {
      const d = mission(21, lang);
      expect(swapAll(d)[0]![2], lang).toBe(text(d, 'phrase.future.ill-be-there'));
      // Exactly the three lengths of stay Mission 06 practised.
      const m06 = stepsOf(mission(6, lang), 'swap')[0]!.rounds[0]!.options.map((o) => o.slot.toLowerCase());
      expect(stepsOf(d, 'swap')[0]!.rounds[0]!.options.map((o) => o.slot.toLowerCase()), lang).toEqual(m06);
    }
  });
  it('destinations stay the two the mission already has — no geography lesson', () => {
    expect(swapAll(day)[3]).toEqual(["I'm going to Vietnam.", "I'm going to Thailand."]);
    expect(swapAll(mission(21, 'fr'))[3]).toEqual(['Je vais au Vietnam.', 'Je vais en Thaïlande.']); // au / en
    expect(swapAll(mission(21, 'es'))[3]).toEqual(['Voy a Vietnam.', 'Voy a Tailandia.']);
    expect(stepsOf(day, 'swap')[0]!.rounds).toHaveLength(5);
  });
  it('"How long will you be there?" is drilled once and then answered — not re-tested', () => {
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip).filter((x) => x === 'reply.future.how-long')).toHaveLength(1);
  });
  it('final itinerary chat: where next → how long → what will you do → after that → asks back', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.future.going-to-vietnam'], ['phrase.future.ill-be-there'], ['phrase.future.want-to-visit'], ['phrase.future.after-that'], ['phrase.future.where-next']]);
  });
});

/* ── Mission 22 — Fixing Problems ────────────────────────────────────────────────────────────── */

describe('Mission 22 — Fixing Problems', () => {
  const day = mission(22);
  it('flow: learn → recognize → which problem → at the table → at the desk → the opener → two conversations → things go wrong at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'matchPairs', 'quickReply', 'quickReply', 'swap', 'dialogue', 'receipt', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('all four problem types are actively retrieved — wrong dish, double charge, broken AC, noisy room', () => {
    const r = retrieved(day);
    for (const id of ['phrase.fix.not-ordered', 'phrase.fix.charged-twice', 'phrase.hotelreq.ac-not-working', 'phrase.hotelreq.room-noisy']) expect(r.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
  });
  it('problem identification: each line is matched to its situation — written out, not an icon alone', () => {
    for (const lang of LANGS) {
      const match = stepsOf(mission(22, lang), 'matchPairs')[0]!;
      expect(match.pairs.map((p) => strip(p.promptItemId)), lang).toEqual(['phrase.fix.not-ordered', 'phrase.fix.charged-twice', 'phrase.hotelreq.ac-not-working', 'phrase.hotelreq.room-noisy']);
      for (const p of match.pairs) {
        expect((p.answerGloss?.en ?? '').split(' ').length, lang).toBeGreaterThanOrEqual(4);
        expect(p.answerGloss?.he, lang).toMatch(/[֐-׿]/);
      }
    }
    // The situation never gives the English sentence away word for word.
    for (const p of stepsOf(day, 'matchPairs')[0]!.pairs) {
      const sentence = new Set(words(text(day, strip(p.promptItemId))).filter((w) => w.length > 3));
      const shared = words(p.answerGloss!.en!).filter((w) => sentence.has(w));
      expect(shared.length, p.answerGloss!.en).toBeLessThanOrEqual(1);
    }
  });
  it('both domains stay: a restaurant chain and a hotel chain', () => {
    const [table, desk] = chats(day);
    expect(mapOf(table!)).toEqual([
      ["Here's your meal — one steak!", ['phrase.fix.not-ordered']],
      ["Oh no, I'm so sorry! What did you order?", ['phrase.fix.i-ordered']],
      ['situation', ['phrase.fix.theres-mistake']],
      ["Let me check the bill. What's the problem?", ['phrase.fix.charged-twice']],
      ['reply.fix.refund-now', ['phrase.fix.no-problem-thanks']],
    ]);
    expect(mapOf(desk!)).toEqual([
      ['Good evening! How can I help you?', ['phrase.fix.theres-problem']],
      ["I'm sorry to hear that. What's the problem?", ['phrase.hotelreq.ac-not-working']],
      ['reply.fix.so-sorry', ['phrase.fix.can-you-fix']],
      ["Yes, I'll send someone right away. Is everything else okay?", ['phrase.hotelreq.room-noisy', 'phrase.recovery.slowly']],
      ['I understand. We have a quieter room.', ['phrase.fix.change-rooms']],
    ]);
    expect(Object.keys(day.dialogues)).toEqual(['fixing-problems', 'room-problem']);
  });
  it('"Can you fix it?" is retrieved twice — answered at the desk and again at speed; the room change once, where it belongs', () => {
    expect(retrieved(day).get('phrase.fix.can-you-fix')).toBe(2);
    expect(retrieved(day).get('phrase.fix.change-rooms')).toBe(1);
    expect(retrieved(day).get('phrase.hotelreq.room-noisy')).toBe(2); // identified, then said at the desk
  });
  it('trimmed, not thinned: no sentence builder, a four-decision speed chain, about twenty retrieval moments', () => {
    for (const lang of LANGS) expect(stepsOf(mission(22, lang), 'sentenceBuilder'), lang).toHaveLength(0);
    expect(rush(day).rounds).toHaveLength(4);
    const moments = day.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'swap' ? s.rounds.length : s.kind === 'matchPairs' ? s.pairs.length : 0), 0);
    expect(moments).toBe(20); // 4 identified + 5 at the table + 5 at the desk + 2 openers + 4 at speed (was 24)
    // Nothing lost: every learner sentence of the mission is still retrievable somewhere outside the review.
    const anywhere = new Set([...retrieved(day).keys(), ...Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => (n.choices ?? []).map((c) => strip(c.itemId))))]);
    for (const i of day.items.filter((x) => /\.phrase\.(fix|hotelreq|core)\./.test(x.id))) expect(anywhere.has(strip(i.id)), i.id).toBe(true);
  });
  it('one opener for any complaint: "There\'s a problem with ___" — the room or the bill', () => {
    expect(swapAll(day)[0]).toEqual(["There's a problem with my room.", "There's a problem with the bill."]);
    expect(swapAll(mission(22, 'fr'))[0]).toEqual(['Il y a un problème avec ma chambre.', 'Il y a un problème avec l’addition.']);
    expect(swapAll(mission(22, 'es'))[0]).toEqual(['Hay un problema con mi habitación.', 'Hay un problema con la cuenta.']);
    for (const lang of LANGS) expect(swapAll(mission(22, lang))[0]![0], lang).toBe(text(mission(22, lang), 'phrase.fix.theres-problem'));
    expect(stepsOf(day, 'swap')[0]!.rounds).toHaveLength(2); // not a customer-service vocabulary list
  });
  it('response comprehension: apology, "what\'s the problem?", the right dish, the refund, anything else — each heard once', () => {
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip)).toEqual(['reply.fix.so-sorry', 'reply.fix.whats-problem', 'reply.fix.bring-right', 'reply.fix.refund-now', 'reply.fix.anything-else']);
    expect(stepsOf(day, 'ambush')).toHaveLength(0); // the refund is no longer re-tested as recognition
  });
  it('recovery counts as problem-solving: on the fast line, asking them to slow down is accepted', () => {
    const fast = chats(day)[1]!.rounds[3]!;
    expect(fast.options.find((o) => isHelpToolId(o.itemId))!.correct).toBe(true);
    const offered = Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => n.choices ?? [])).filter((c) => isHelpToolId(c.itemId));
    expect(offered.length).toBeGreaterThanOrEqual(1);
    expect(reviewed(day)).toContain('phrase.recovery.slowly');
  });
  it('the review is trimmed from 19 cards to 12', () => {
    expect(day.items).toHaveLength(19);
    expect(reviewed(day)).toHaveLength(12);
  });
  it('final challenge, four decisions: the dish, the bill, the room, the fix', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.fix.not-ordered'], ['phrase.fix.charged-twice'], ['phrase.hotelreq.ac-not-working'], ['phrase.fix.can-you-fix']]);
  });
});

/* ── Mission 23 — Opinions, Feelings & Reactions ─────────────────────────────────────────────── */

describe('Mission 23 — Opinions, Feelings & Reactions', () => {
  const day = mission(23);
  it('flow: learn → recognize → saying what you think → reacting → "I think it\'s…" → opinion + reason → conversation → at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quickReply', 'quickReply', 'swap', 'sentenceBuilder', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('I think / I don\'t think so / because / I\'m not sure are each actively retrieved, more than once', () => {
    const r = retrieved(day);
    for (const id of ['phrase.opin.i-think-expensive', 'phrase.opin.dont-think-so', 'phrase.opin.because', 'phrase.opin.not-sure']) expect(r.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
    // The two sentences that were taught but never retrievable now are.
    expect(r.get('phrase.opin.of-course') ?? 0).toBeGreaterThanOrEqual(2);
    expect(r.get('phrase.opin.dont-like-it')).toBe(1);
  });
  it('"Because…" is retrieved as a continuation — the answer to "Why?" — never as a word on its own', () => {
    const rounds = [...chats(day), rush(day)].flatMap((s) => s.rounds).filter((r) => r.options.some((o) => o.correct && strip(o.itemId) === 'phrase.opin.because'));
    expect(rounds.map((r) => strip(r.promptItemId) || r.npc?.en)).toEqual(['reply.opin.why', 'Why?']);
    expect(text(day, 'phrase.opin.because')).toBe("Because it's only one hour."); // always a whole reason
    // "Why?" itself is heard once in the drill and then only ever answered.
    expect(stepsOf(day, 'replies')[0]!.replyIds.map(strip).filter((x) => x === 'reply.opin.why')).toHaveLength(1);
  });
  it('the opinion chat: opinion → disagreement → reason → like it? → coming? → decision', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['reply.opin.what-do-you-think', ['phrase.opin.i-think-expensive']],
      ['situation', ['phrase.opin.dont-think-so']],
      ['reply.opin.why', ['phrase.opin.because']],
      ['reply.opin.do-you-like-it', ['phrase.opin.i-like-it', 'phrase.opin.dont-like-it']],
      ['reply.opin.are-you-coming', ['phrase.opin.not-sure', 'phrase.opin.of-course']],
      ['situation', ['phrase.opin.lets-do-it']],
    ]);
  });
  it('short reactions get their own conversational practice: Really? · That\'s strange. · That\'s true. · Of course!', () => {
    expect(mapOf(chats(day)[1]!)).toEqual([
      ["It's free. But it starts at six in the morning.", ['reply.opin.really', 'phrase.opin.thats-strange']],
      ["Come on — it's only two hours, and it's free.", ['reply.opin.thats-true', 'phrase.opin.lets-do-it']],
      ['Great! See you at six!', ['phrase.opin.of-course']],
    ]);
    for (const lang of LANGS) for (const r of chats(mission(23, lang))[1]!.rounds) for (const o of r.options.filter((x) => x.correct)) expect(words(o.text ?? text(mission(23, lang), strip(o.itemId))).length, lang).toBeLessThanOrEqual(5);
  });
  it('"I think it\'s ___": three verdicts the conversation already uses', () => {
    expect(swapAll(day)[0]).toEqual(["I think it's too expensive.", "I think it's a good price.", "I think it's strange."]);
    expect(swapAll(mission(23, 'fr'))[0]).toEqual(['Je pense que c’est trop cher.', 'Je pense que c’est un bon prix.', 'Je pense que c’est bizarre.']);
    expect(swapAll(mission(23, 'es'))[0]).toEqual(['Creo que es demasiado caro.', 'Creo que es un buen precio.', 'Creo que es raro.']);
    for (const lang of LANGS) {
      const d = mission(23, lang);
      expect(swapAll(d)[0]![0], lang).toBe(text(d, 'phrase.opin.i-think-expensive'));
      expect(unknownIn(swapAll(d)[0]!, new Set([...d.items.flatMap((i) => words(i.text)), ...Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((x) => words(x.en)))])), lang).toEqual([]); // no new adjective
    }
  });
  it('opinion + reason are built as two halves of one thought', () => {
    expect(stepsOf(day, 'sentenceBuilder')[0]!.rounds.map((r) => r.chunks.join(' '))).toEqual(["I think it's too expensive.", "Because it's only one hour."]);
    expect(stepsOf(mission(23, 'fr'), 'sentenceBuilder')[0]!.rounds[0]!.chunks).toEqual(['Je pense', 'que c’est', 'trop cher.']);
  });
  it('final conversation: gives an opinion → disagrees → explains → likes → hesitates → decides', () => {
    expect(mapOf(rush(day)).map(([, ok]) => ok)).toEqual([['phrase.opin.i-think-expensive'], ['phrase.opin.dont-think-so'], ['phrase.opin.because'], ['phrase.opin.i-like-it'], ['phrase.opin.not-sure'], ['phrase.opin.lets-do-it']]);
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
  });
});

/* ── Mission 24 — the checkpoint ─────────────────────────────────────────────────────────────── */

describe('Mission 24 — CHECKPOINT: City & Conversation', () => {
  const day = mission(24);
  const screens = (d: BootcampDayContent) => Object.values(d.dialogues).flatMap((dl) => dl.nodes.filter((n) => n.choices?.length).map((n) => ({ scene: dl.id, node: n })));

  it('it proves, it does not teach: no key sentence, no word intro, no listening drill, no quiz, no review', () => {
    expect(kinds(day)).toEqual(['talk', 'dialogue', 'receipt', 'ambush:speed', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'receipt', 'summary']);
    for (const lang of LANGS) for (const s of mission(24, lang).steps) expect(['tool', 'prime', 'replies', 'quiz', 'swipe'], lang).not.toContain(s.kind);
  });
  it('one day in a city, four cold scenes — station, a local, a meal that goes wrong, a traveler — with no translation before answering', () => {
    for (const lang of LANGS) {
      const d = mission(24, lang);
      expect(Object.keys(d.dialogues), lang).toEqual(['cold-transport', 'cold-chat', 'cold-problem', 'cold-hostel']);
      for (const dl of Object.values(d.dialogues)) { expect(dl.cold, `${lang} ${dl.id}`).toBe(true); expect(dl.nodes[0]!.who, `${lang} ${dl.id}`).toBe('npc'); }
    }
  });
  it('real decisions: sixteen screens, each with the line that fits and a real line from another moment — and no one-button screen', () => {
    for (const lang of LANGS) {
      const all = screens(mission(24, lang));
      expect(all, lang).toHaveLength(16);
      for (const { node } of all) {
        expect(node.choices!.some((c) => c.correct) && node.choices!.some((c) => !c.correct), `${lang} ${node.id}`).toBe(true);
        expect(node.choices!.length, lang).toBeLessThanOrEqual(3);
      }
    }
    const earlier = new Set(Array.from({ length: 23 }, (_, i) => mission(i + 1).items.map((x) => x.text)).flat());
    for (const { node } of screens(day)) for (const c of node.choices!.filter((x) => !x.correct)) expect(earlier.has(c.en), c.en).toBe(true); // never nonsense
  });
  it('past, future and opinion are really integrated — and the wrong option is often the same idea in the wrong time', () => {
    const said = new Set(screens(day).flatMap(({ node }) => node.choices!.filter((c) => c.correct).map((c) => strip(c.itemId))));
    for (const id of ['phrase.past.i-went', 'phrase.past.it-was-great', 'phrase.future.going-to-vietnam', 'phrase.future.ill-be-there', 'phrase.future.where-next', 'phrase.opin.i-think-expensive', 'phrase.opin.not-sure']) expect(said.has(id), id).toBe(true);
    const hostel = day.dialogues['cold-hostel']!.nodes.filter((n) => n.choices?.length);
    const pick = (i: number): string[] => hostel[i]!.choices!.map((c) => `${c.correct ? '✓' : '✗'} ${strip(c.itemId)}`);
    expect(pick(0).slice(0, 2)).toEqual(['✓ phrase.past.i-went', '✗ phrase.future.going-to-vietnam']); // "where were you?" ≠ "where are you going?"
    expect(pick(2)).toEqual(['✓ phrase.future.going-to-vietnam', '✗ phrase.past.i-went']);
  });
  it('"You should take the boat tour." recombines a structure Mission 11 already taught — it is not new language', () => {
    // Mission 11 drills "You should try the old town." by ear and answers it in its chat. The
    // checkpoint keeps the same opening — You should / Vous devriez / Debería + a verb the learner
    // already has — with a different, known ending. Composing known pieces is the point of a checkpoint.
    const opening: Record<Lang, RegExp> = { en: /^You should \w+/, fr: /^Vous devriez \w+/, es: /^Debería \w+/ };
    for (const lang of LANGS) {
      const taughtLine = text(mission(11, lang), 'reply.talk.you-should-try');
      expect(taughtLine, lang).toMatch(opening[lang]);
      expect(stepsOf(mission(11, lang), 'replies')[0]!.replyIds.map(strip), lang).toContain('reply.talk.you-should-try'); // drilled
      expect(stepsOf(mission(11, lang), 'quickReply').some((s) => s.rounds.some((r) => strip(r.promptItemId) === 'reply.talk.you-should-try')), lang).toBe(true); // and answered
      const local = mission(24, lang).dialogues['cold-chat']!.nodes.filter((n) => n.who === 'npc' && !n.slow).map((n) => n.en);
      const line = local.find((l) => opening[lang].test(l))!;
      expect(line, lang).toBeDefined();
      // Every word of it was met before Mission 24 — including the verb after "should".
      expect(unknownIn([line], vocabulary(lang, 23)), `${lang} “${line}”`).toEqual([]);
    }
    expect(mission(24).dialogues['cold-chat']!.nodes.find((n) => /^You should take/.test(n.en))!.en).toBe("You should take the boat tour. It's fifty euros.");
  });
  it('Mission 22 is in the day: the wrong dish arrives and is sorted out', () => {
    expect(day.dialogues['cold-problem']!.nodes.filter((n) => n.choices?.length).map((n) => strip(n.choices!.find((c) => c.correct)!.itemId))).toEqual(['phrase.fix.not-ordered', 'phrase.fix.i-ordered', 'phrase.fix.no-problem-thanks']);
  });
  it('a miss is never passed over: the question is asked again, slowly, and the same decision comes back', () => {
    for (const lang of LANGS) for (const dl of Object.values(mission(24, lang).dialogues)) {
      const byId = new Map(dl.nodes.map((n) => [n.id, n]));
      for (const n of dl.nodes) for (const c of n.choices ?? []) {
        if (c.correct) continue;
        const beat = byId.get(c.next)!;
        expect([beat.who, beat.slow, beat.next], `${lang} ${dl.id}/${n.id}`).toEqual(['npc', true, n.id]);
      }
    }
  });
  it('recovery is success — three offers, on fast lines; the speaker then says it again in known words', () => {
    for (const lang of LANGS) {
      const d = mission(24, lang);
      const tools = screens(d).flatMap(({ scene, node }) => node.choices!.filter((c) => isHelpToolId(c.itemId)).map((c) => ({ scene, node, c })));
      expect(tools.map((x) => `${x.scene}:${strip(x.c.itemId)}`), lang).toEqual(['cold-transport:phrase.recovery.slowly', 'cold-problem:phrase.recovery.repeat', 'cold-hostel:phrase.recovery.slowly']);
      for (const { scene, node, c } of tools) {
        expect(c.correct, lang).toBe(true);
        const again = d.dialogues[scene]!.nodes.find((n) => n.id === c.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${scene}`).toEqual(['npc', true, node.id]);
        expect(d.dialogues[scene]!.nodes.find((n) => n.next === node.id && !n.slow)!.fast, `${lang} ${scene}`).toBe(true);
      }
    }
  });
  it('STRICT — zero new target-language vocabulary: every word of the checkpoint was met in Missions 01–23', () => {
    for (const lang of LANGS) expect(unknownIn(lines(mission(24, lang)), vocabulary(lang, 23)), lang).toEqual([]);
  });
  it('every learner line is a sentence an earlier mission taught, with the same id and the same wording', () => {
    for (const lang of LANGS) {
      const before = new Map(Array.from({ length: 23 }, (_, i) => mission(i + 1, lang).items.map((x): [string, string] => [x.id, x.text])).flat());
      for (const i of mission(24, lang).items) expect(before.get(i.id), `${lang} ${i.id}`).toBe(i.text);
    }
  });
  it('one speed-listening moment — a correction on the platform — honestly labelled, with no tool badge', () => {
    for (const lang of LANGS) {
      const ambushes = stepsOf(mission(24, lang), 'ambush');
      expect(ambushes, lang).toHaveLength(1);
      expect(ambushes[0]!.mode, lang).toBe('speed');
      expect(isHelpToolId(ambushes[0]!.correctItemId) || isHelpToolId(ambushes[0]!.wrongItemId), lang).toBe(false);
    }
    expect(strip(stepsOf(day, 'ambush')[0]!.correctItemId)).toBe('reply.trans.wrong-way');
  });
  it('the three languages are the same checkpoint: same scenes, same turns, same decisions', () => {
    const shape = (d: BootcampDayContent) => Object.values(d.dialogues).map((dl) => [dl.id, dl.nodes.map((n) => [n.id, n.who, n.next ?? null, n.fast ?? false, n.slow ?? false, (n.choices ?? []).map((c) => [strip(c.itemId), c.correct, c.next])])]);
    for (const lang of ['fr', 'es'] as const) expect(shape(mission(24, lang)), lang).toEqual(shape(day));
  });
  it('the closing proof says what was done — and teaches nothing after it', () => {
    const last = day.steps.slice(-2);
    expect(last.map((s) => s.kind)).toEqual(['receipt', 'summary']);
    expect(last[0]!.kind === 'receipt' && last[0]!.text.en).toMatch(/station.*local.*problem solved.*what you did.*where you go next.*did not freeze/);
  });
});
