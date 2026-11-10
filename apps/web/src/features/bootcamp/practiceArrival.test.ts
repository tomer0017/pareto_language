import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, validatePracticeStep } from './practiceEngines.js';
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
const taught = (day: BootcampDayContent): string[] => stepsOf(day, 'tool').map((s) => strip(s.itemId));
const reviewed = (day: BootcampDayContent): string[] => stepsOf(day, 'swipe').flatMap((s) => s.itemIds.map(strip));

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

/* ── what this pass was not allowed to touch ─────────────────────────────────────────────────── */

describe('scope: only the Practice of Missions 06–10 changed', () => {

  it('Missions 01–09 are pinned by their own passes (mission01.test.ts … mission09.test.ts)', async () => {
    const { existsSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) expect(existsSync(fileURLToPath(new URL(`./mission0${n}.test.ts`, import.meta.url))), `mission0${n}.test.ts`).toBe(true);
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
  it('Mission 10 has its own pass since: mission10.test.ts (the adaptive checkpoint)', async () => {
    const { existsSync } = await import('node:fs');
    expect(existsSync(fileURLToPath(new URL('./mission10.test.ts', import.meta.url)))).toBe(true);
  });
  it('Missions 11–18 have their own passes since (mission11.test.ts … mission18.test.ts)', async () => {
    const { existsSync } = await import('node:fs');
    expect(existsSync(fileURLToPath(new URL('./mission18.test.ts', import.meta.url)))).toBe(true);
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
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(5, 10).map((m) => `${m.id}:${m.day}`)).toEqual(['airport-border:10', 'taxi:6', 'hotel-check-in:7', 'shopping:8', 'arrival-day-checkpoint:9']);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (const s of mission(9, lang).steps) expect(allowed, `${lang} M9`).toContain(s.kind);
    // Mission 10's one new kind is its adaptive checkpoint (its own pass: mission10.test.ts).
    for (const lang of LANGS) expect(mission(10, lang).steps.map((s) => s.kind), lang).toEqual(['talk', 'checkpoint', 'summary']);
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

/* Mission 09 — Shopping has its own pass: see mission09.test.ts. */

/* Mission 10 — CHECKPOINT: Arrival Day has its own pass: see mission10.test.ts. */

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
