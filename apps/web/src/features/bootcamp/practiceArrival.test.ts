import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { beforeCueFreeze, type FrozenDay } from './cueFreeze.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import { sentenceCatalog } from '../core/phraseGroups.js';
import { learnedMaterial } from '../companion/companionLearned.js';
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

/** Sentence list of Mission 09 (Mission 08's is pinned id by id below; Missions 06 and 07 have their own passes). */
const ITEMS_09 = { en: 'fd369a59', fr: '0e91151b', es: 'bcd7147c' };

describe('scope: only the Practice of Missions 06–10 changed', () => {
  // Scene transitions became non-spoken cues after these fingerprints were taken; `beforeCueFreeze`
  // puts the labels back, so the fingerprints still prove nothing else moved (see cueFreeze.ts).
  const slice = (lang: Lang, a: number, b: number): FrozenDay[] => BOOTCAMP_PLAN.slice(a, b).map((m) => beforeCueFreeze(MISSIONS_BY_LANG[lang]![m.day]!, lang));
  const print = (f: (lang: Lang) => unknown): Record<Lang, string> => ({ en: fnv(JSON.stringify(f('en'))), fr: fnv(JSON.stringify(f('fr'))), es: fnv(JSON.stringify(f('es'))) });

  it('Missions 01–08 are pinned by their own passes (mission01.test.ts … mission08.test.ts)', async () => {
    const { existsSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) expect(existsSync(fileURLToPath(new URL(`./mission0${n}.test.ts`, import.meta.url))), `mission0${n}.test.ts`).toBe(true);
  });
  it('the locked dialogue of Mission 09 is byte-for-byte unchanged (Missions 06 and 07: their own tests)', () => {
    const one = (l: Lang): BootcampDayContent[] => [slice(l, 8, 9)[0]!];
    expect(print((l) => one(l).map((d) => d.dialogues))).toEqual({ en: 'd465f995', fr: '652f21b9', es: 'a509ca20' });
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
  it('the approved pass is otherwise exactly as approved: Mission 10 whole, Mission 09 apart from the size wording', () => {
    const pick = (l: Lang, i: number): BootcampDayContent => MISSIONS_BY_LANG[l]![BOOTCAMP_PLAN[i]!.day]!;
    expect(print((l) => [9].map((i) => pick(l, i).steps))).toEqual({ en: '0a890235', fr: '67adb51c', es: '36c79f0a' });
    expect(print((l) => pick(l, 9))).toEqual({ en: '60b489f1', fr: '5d4d6a20', es: 'a4ff1fc6' });
    expect(print((l) => pick(l, 8).steps.filter((s) => s.kind !== 'swap'))).toEqual({ en: '033e2741', fr: '1be8e9bb', es: '45d575fc' });
  });
  it('Missions 09–18 are exactly as approved (Missions 01–08 have their own passes)', () => {
    expect(print((l) => slice(l, 8, 18))).toEqual({ en: '844c2294', fr: '818e8b10', es: '27fffd97' });
  });
  it('"For two nights." and the wifi password are retired (and, since the Mission 08 pass, "Sign here" and "It\'s on the second floor"): archived with their ids and wording, and shown nowhere', () => {
    const gone = ['phrase.hotel.two-nights', 'phrase.hotel.wifi', 'reply.hotel.sign-here', 'reply.hotel.second-floor'];
    for (const lang of LANGS) {
      // the sentences the Arrival checkpoint (Mission 10) reuses are still Mission 08's, same id and wording
      for (const id of ['phrase.hotel.reservation', 'phrase.hotel.breakfast', 'phrase.hotel.here-you-go', 'reply.hotel.room-number', 'reply.hotel.breakfast-time']) expect(mission(8, lang).items.map((i) => strip(i.id)), lang).toContain(id);
      const archived = RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'hotel-check-in');
      expect(archived.map((r) => strip(r.id)), lang).toEqual(gone);
      // In no Core mission at all — sentence list, step or dialogue line…
      const everywhere = JSON.stringify(BOOTCAMP_PLAN.map((m) => MISSIONS_BY_LANG[lang]![m.day]!));
      for (const r of archived) { expect(everywhere.includes(`"${r.id}"`), `${lang} ${r.id}`).toBe(false); expect(everywhere.includes(JSON.stringify(r.text)), `${lang} ${r.text}`).toBe(false); }
      // …so not in the sentence library (which Core, Listen and the review / flashcards are built from)…
      const library = sentenceCatalog(lang).groups.flatMap((g) => g.items);
      for (const r of archived) { expect(library.some((i) => i.id === r.id || i.text === r.text), `${lang} library ${r.id}`).toBe(false); }
      // …not in a mission's "what did I learn" list (its sentence list), and not in what the companion may say.
      const allDays = BOOTCAMP_PLAN.map((m) => m.day);
      const companion = learnedMaterial(lang, allDays);
      for (const r of archived) expect(companion.sentences, `${lang} companion ${r.id}`).not.toContain(r.text);
    }
    expect(RETIRED_SENTENCES.en.filter((r) => r.retiredFrom === 'hotel-check-in').map((r) => r.text)).toEqual(['For two nights.', "What's the wifi password?", 'Sign here, please.', "It's on the second floor."]);
    expect(RETIRED_SENTENCES.fr.filter((r) => r.retiredFrom === 'hotel-check-in').map((r) => r.text)).toEqual(['Pour deux nuits.', 'C’est quoi le mot de passe du wifi ?', 'Signez ici, s’il vous plaît.', 'C’est au deuxième étage.']);
    expect(RETIRED_SENTENCES.es.filter((r) => r.retiredFrom === 'hotel-check-in').map((r) => r.text)).toEqual(['Para dos noches.', '¿Cuál es la contraseña del wifi?', 'Firme aquí, por favor.', 'Está en el segundo piso.']);
  });
  it('no other sentence of Mission 09 was deleted, renamed or reworded', () => {
    expect(print((l) => [slice(l, 8, 9)[0]!].map((d) => d.items))).toEqual(ITEMS_09);
  });
  it('their intro cards, titles and videos are unchanged (Mission 09)', () => {
    expect(print((l) => slice(l, 8, 9).map((d) => [d.day, d.title, d.introVideo, d.steps[0]]))).toEqual({ en: '6a9b281d', fr: 'd9cb5c43', es: '7f5bb487' });
  });
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(5, 10).map((m) => `${m.id}:${m.day}`)).toEqual(['airport-border:10', 'taxi:6', 'hotel-check-in:7', 'shopping:8', 'arrival-day-checkpoint:9']);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (let n = 9; n <= 10; n++) for (const s of mission(n, lang).steps) expect(allowed, `${lang} M${n}`).toContain(s.kind);
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

/* Mission 06 — Airport & Border has its own pass: see mission06.test.ts. */

/* Mission 07 — Taxi / Uber has its own pass: see mission07.test.ts. */

/* Mission 08 — Hotel Check-in has its own pass: see mission08.test.ts. */

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
    // Only the missions that prove instead of teach are cold: no teaching mission hides the translation.
    for (const m of BOOTCAMP_PLAN) if (!['arrival-day-checkpoint', 'food-day-checkpoint', 'city-day-checkpoint', 'no-subtitles', 'dress-rehearsal', 'complete-day-abroad'].includes(m.id)) for (const dl of Object.values(MISSIONS_BY_LANG.en![m.day]!.dialogues)) expect(dl.cold, m.id).toBeUndefined();
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
  it('a cold scene gives no translation before the answer; an ordinary scene still does', () => {
    const player = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toContain('gloss={dialogue.cold ? undefined : dialogueTr(displayNpc)}');
  });
});
