import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSentenceDeck } from '../core/flashcards.js';
import { LEGACY_ALIASES, canonicalSentenceId, sentenceCatalog } from '../core/phraseGroups.js';
import { practicedIds } from '../core/review.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { beforeCueFreeze } from './cueFreeze.js';
import { cinematicTranscript } from './exportDialogue.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { BootcampDayContent, BootcampDialogue, BootcampStep, DialogueNodeB } from './types.js';
import type * as ConvoModule from './ConvoScene.js';

/**
 * Practice depth — Missions 25–30 (Mastery): prove the promise.
 *   25–27 still teach, with less scaffolding: one drill of each question, then answering in context.
 *   28–30 teach nothing: no key sentences, word intro, quiz, review or translation before the answer.
 *         28 is heard only; 29 is one evening; 30 is one whole day.
 * Difficulty comes from speed and recombination — never from a word the learner has not met (a guard
 * per language enforces it). Everything this pass was NOT allowed to touch — Missions 01–24 and the
 * conversations of 25–27 — is fingerprinted.
 */
const LANGS = ['en', 'fr', 'es'] as const;
type Lang = (typeof LANGS)[number];
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const mission = (n: number, lang: Lang = 'en'): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const stepsOf = <K extends BootcampStep['kind']>(day: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] =>
  day.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const kinds = (day: BootcampDayContent): string[] => day.steps.map((s) => (s.kind === 'ambush' ? `ambush:${s.mode}` : s.kind === 'quickReply' && s.challenge ? 'quickReply:speed' : s.kind));
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const rush = (day: BootcampDayContent) => stepsOf(day, 'quickReply').find((s) => s.challenge)!;
const chats = (day: BootcampDayContent) => stepsOf(day, 'quickReply').filter((s) => !s.challenge);
const mapOf = (step: Extract<BootcampStep, { kind: 'quickReply' }>): [string, string[]][] =>
  step.rounds.map((r): [string, string[]] => [r.promptItemId ? strip(r.promptItemId) : r.npc ? r.npc.en : 'situation', r.options.filter((o) => o.correct).map((o) => strip(o.itemId))]);
const reviewed = (day: BootcampDayContent): string[] => stepsOf(day, 'swipe').flatMap((s) => s.itemIds.map(strip));

/* ── conversations: decisions, recovery, pace ────────────────────────────────────────────────── */

const scenes = (day: BootcampDayContent): BootcampDialogue[] => stepsOf(day, 'dialogue').map((s) => day.dialogues[s.dialogueId]!);
const screens = (d: BootcampDialogue): DialogueNodeB[] => d.nodes.filter((n) => n.who === 'you' && (n.choices?.length ?? 0) > 0);
const isTool = (id: string | undefined): boolean => isHelpToolId(id);
/** A real decision: at least one option on the screen is wrong. */
const decisions = (day: BootcampDayContent): DialogueNodeB[] => scenes(day).flatMap(screens).filter((n) => n.choices!.some((c) => !c.correct));
const oneButton = (day: BootcampDayContent): DialogueNodeB[] => scenes(day).flatMap(screens).filter((n) => n.choices!.length === 1);
const withRecovery = (day: BootcampDayContent): string[] => scenes(day).flatMap((d) => screens(d).filter((n) => n.choices!.some((c) => isTool(c.itemId))).map((n) => `${d.id}:${strip(n.choices!.find((c) => isTool(c.itemId))!.itemId)}`));
const node = (d: BootcampDialogue, id: string): DialogueNodeB => d.nodes.find((n) => n.id === id)!;
/** What the learner reads or hears from the other speaker BEFORE answering, with text on screen. */
const writtenBeforeAnswer = (day: BootcampDayContent): number =>
  scenes(day).filter((d) => !d.audioOnly).reduce((n, d) => n + d.nodes.filter((x) => x.who === 'npc' && !x.end).length, 0) + stepsOf(day, 'ambush').length;
const translatedBeforeAnswer = (day: BootcampDayContent): number =>
  scenes(day).filter((d) => !d.cold).reduce((n, d) => n + d.nodes.filter((x) => x.who === 'npc' && !x.end).length, 0);

/* ── vocabulary: what a learner has met ──────────────────────────────────────────────────────── */

const PROPER = new Set(['cohen', 'mama', 'rosa', 'vietnam', 'hanoi', 'hanoï', 'hanói', 'thailand', 'thaïlande', 'tailandia', 'argentina', 'argentine', 'israel', 'israël']);
const words = (s: string): string[] => s.toLowerCase().replace(/[’`]/g, "'").split(/[^\p{L}']+/u).map((w) => w.replace(/^'+|'+$/g, '')).filter((w) => w && !PROPER.has(w));
/** Every target-language line a mission puts in front of the learner (a recovery challenge included:
 *  in this phase even the line that is "too fast" must be made of known words). */
function lines(day: BootcampDayContent, opts: { skipFinals?: boolean } = {}): string[] {
  const out: string[] = day.items.map((i) => i.text);
  for (const d of Object.values(day.dialogues)) for (const n of d.nodes) { if (n.en) out.push(n.en); for (const c of n.choices ?? []) out.push(c.en); }
  for (const s of day.steps) {
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
    if (s.kind === 'ambush' && !opts.skipFinals) out.push(s.npc.en);
    if (s.kind === 'quickReply' && !(opts.skipFinals && s.challenge)) for (const r of s.rounds) { if (r.npc) out.push(r.npc.en); for (const o of r.options) if (o.text) out.push(o.text); }
    if (s.kind === 'visualMatch' || s.kind === 'miniMap') out.push(...s.rounds.map((r) => r.audio.en));
    if (s.kind === 'swap') for (const r of s.rounds) for (const o of r.options) out.push(fillFrame(r.frame, o.slot));
    if (s.kind === 'matchPairs') for (const p of s.pairs) if (p.answerText) out.push(p.answerText);
    if (s.kind === 'sentenceBuilder') for (const r of s.rounds) out.push(r.chunks.join(' '));
  }
  return out;
}
/** Words met up to and including mission `upTo`. Missions 01–24 keep their own (earlier) guards, so
 *  their recovery challenges — which may be beyond the learner — are left out of what counts as known. */
const vocabulary = (lang: Lang, upTo: number, skipFinalsOfLast = false): Set<string> =>
  new Set(Array.from({ length: upTo }, (_, i) => {
    const day = mission(i + 1, lang);
    const all = lines(day, { skipFinals: skipFinalsOfLast && i + 1 === upTo });
    const beyond = i + 1 <= 24 ? new Set(stepsOf(day, 'ambush').filter((s) => s.mode !== 'speed').map((s) => s.npc.en)) : new Set<string>();
    return all.filter((l) => !beyond.has(l));
  }).flat().flatMap(words));
const unknownIn = (said: string[], known: Set<string>): string[] => [...new Set(said.flatMap(words).filter((w) => !known.has(w)))];
const allCopy = (day: BootcampDayContent): string => JSON.stringify(day);

/* ── scope ───────────────────────────────────────────────────────────────────────────────────── */

describe('scope: only Missions 25–30 changed', () => {
  // Scene transitions became non-spoken cues after these fingerprints were taken; `beforeCueFreeze`
  // puts the labels back, so the fingerprints still prove nothing else moved (see cueFreeze.ts).
  const slice = (lang: Lang, a: number, b: number): BootcampDayContent[] => BOOTCAMP_PLAN.slice(a, b).map((m) => beforeCueFreeze(MISSIONS_BY_LANG[lang]![m.day]!, lang));
  const print = (f: (lang: Lang) => unknown): Record<Lang, string> => ({ en: fnv(JSON.stringify(f('en'))), fr: fnv(JSON.stringify(f('fr'))), es: fnv(JSON.stringify(f('es'))) });

  it('Missions 01–24 are byte-for-byte unchanged, in every language', () => {
    expect(print((l) => slice(l, 0, 24))).toEqual({ en: 'a53ecac3', fr: '3e2b1e59', es: '7ecbc8ae' });
    expect(print((l) => slice(l, 0, 18))).toEqual({ en: '47987fe0', fr: 'c0290489', es: 'cc3b8d20' });
    expect(print((l) => slice(l, 18, 24))).toEqual({ en: 'b9c88064', fr: '74a92f15', es: 'cd856495' });
  });
  it('the conversations of Missions 25–27 are byte-for-byte unchanged', () => {
    expect(print((l) => slice(l, 24, 27).map((d) => d.dialogues))).toEqual({ en: '11c6f921', fr: 'e9d141b0', es: '8531d080' });
  });
  it('the sentences of Missions 25–27 are unchanged — one conversation-help phrase joined Mission 25 for its final challenge', () => {
    expect(print((l) => slice(l, 24, 27).map((d) => d.items.filter((i) => !(d.day === 37 && strip(i.id) === 'phrase.recovery.slowly'))))).toEqual({ en: 'f44df283', fr: '9732faed', es: '6f3cbe39' });
    for (const lang of LANGS) expect(mission(25, lang).items.map((i) => strip(i.id)).slice(-3), lang).toEqual(['phrase.recovery.thank-you', 'phrase.recovery.what-mean', 'phrase.recovery.slowly']);
  });
  it('mission order, ids and registry keys are unchanged', () => {
    expect(BOOTCAMP_PLAN.slice(24).map((m) => `${m.id}:${m.day}`)).toEqual(['lost-stolen-police:37', 'pharmacy-health:25', 'emergency:26', 'no-subtitles:27', 'dress-rehearsal:28', 'complete-day-abroad:29']);
    expect(BOOTCAMP_PLAN).toHaveLength(30);
    for (const lang of LANGS) expect(Object.keys(MISSIONS_BY_LANG[lang]!).map(Number).sort((a, b) => a - b), lang).toEqual(BOOTCAMP_PLAN.map((m) => m.day).sort((a, b) => a - b));
  });
  it('titles and opening cards of the teaching missions (25–27) are what they were', () => {
    expect([25, 26, 27].map((n) => mission(n).steps[0]).map((s) => (s!.kind === 'talk' ? s!.title.en : ''))).toEqual(['Mission 25: Lost / Stolen / Police', 'Mission 26: Pharmacy & Health', 'Mission 27: Emergency']);
    expect([28, 29, 30].map((n) => mission(n).title.en)).toEqual(['No Subtitles', 'Dress Rehearsal: Full Evening', 'A Complete Day Abroad Alone']);
  });
  it('no new game: only the existing step kinds are used', () => {
    const allowed = ['video', 'talk', 'prime', 'tool', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'];
    for (const lang of LANGS) for (let n = 25; n <= 30; n++) for (const s of mission(n, lang).steps) expect(allowed, `${lang} M${n}`).toContain(s.kind);
  });
  it('archived sentences stay archived: the archive still holds the same seven, none of them back in a mission', () => {
    for (const lang of LANGS) {
      expect(RETIRED_SENTENCES[lang], lang).toHaveLength(7);
      const live = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => i.id)));
      for (const r of RETIRED_SENTENCES[lang]) expect(live.has(r.id), r.id).toBe(false);
    }
  });
  it('the three Extended sentences the old Dress Rehearsal borrowed are out of the Core — items, conversations, practice', () => {
    const gone = ['phrase.rest.table-for-two', 'phrase.rest.bill-please', 'phrase.pay.by-card'];
    for (const lang of LANGS) {
      const core = JSON.stringify(BOOTCAMP_PLAN.map((m) => MISSIONS_BY_LANG[lang]![m.day]!));
      for (const id of gone) expect(core.includes(`${lang}.${id}"`), `${lang} ${id}`).toBe(false);
      // Practice already stored under the duplicate id still counts for the Core sentence.
      expect(canonicalSentenceId(lang, `${lang}.phrase.rest.table-for-two`)).toBe(`${lang}.phrase.rest.table-two`);
    }
    expect(JSON.stringify(mission(29))).not.toMatch(/Could we have the bill|I'll pay by card/);
  });
});

describe('production freeze: a time or place jump is a cue — shown, never spoken', () => {
  /** "…label…" — a jump in time or place written between dots (not a mere pause such as "Straight… then… left…"). */
  const LABEL = /…\s*(Later|At the checkout|Plus tard|À la caisse|Más tarde|En la caja|אחר כך|בקופה)\s*…/u;
  /** Everything the app hands to text-to-speech for a mission. */
  const speech = (day: BootcampDayContent): string[] => [
    ...Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])),
    ...day.steps.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.flatMap((r) => [r.npc?.en ?? '', ...r.options.map((o) => o.text ?? '')]) : s.kind === 'ambush' ? [s.npc.en] : s.kind === 'visualMatch' || s.kind === 'miniMap' ? s.rounds.map((r) => r.audio.en) : [])),
    ...day.items.map((i) => i.text),
  ].filter(Boolean);

  it('the eight cues of the Core, exactly where the conversation jumps', () => {
    const cues = (lang: Lang): string[] => BOOTCAMP_PLAN.flatMap((m, i) => stepsOf(MISSIONS_BY_LANG[lang]![m.day]!, 'dialogue').flatMap((s, k) =>
      MISSIONS_BY_LANG[lang]![m.day]!.dialogues[s.dialogueId]!.nodes.filter((n) => n.cue).map((n) => `M${i + 1} scene ${k + 1} ${n.id}: [${n.cue!.en}] ${n.en}`)));
    expect(cues('en')).toEqual([
      'M14 scene 1 n5b: [Later…] Is everything okay?',
      'M17 scene 1 n3: [At the checkout…] Hi! Is that everything?',
      'M18 scene 3 n5: [At the checkout…] Hi! Is that everything?',
      'M18 scene 4 n7: [Later…] Is everything okay?',
      "M22 scene 1 n5b: [Later…] Here's your bill.",
      'M28 scene 2 n7: [Later…] Is everything okay?',
      'M29 scene 4 n1: [Later…] Is everything okay?',
      'M30 scene 3 n11: [Later…] Is everything okay?',
    ]);
    // Same places in French and Spanish, each with its own words; the cue itself is app-language copy.
    const where = (l: Lang): string[] => cues(l).map((c) => c.slice(0, c.indexOf(']') + 1));
    expect(where('fr')).toEqual(where('en'));
    expect(where('es')).toEqual(where('en'));
    for (const lang of LANGS) for (const m of BOOTCAMP_PLAN) for (const d of Object.values(MISSIONS_BY_LANG[lang]![m.day]!.dialogues)) for (const n of d.nodes.filter((x) => x.cue)) {
      expect([n.who, (n.cue!.he ?? '').trim() !== '', (n.cue!.en ?? '').trim() !== ''], `${lang} ${m.id} ${n.id}`).toEqual(['npc', true, true]);
    }
  });
  it('no transition label is left inside anything that is spoken — any mission, any language, any branch, practice included', () => {
    for (const lang of LANGS) for (const m of BOOTCAMP_PLAN) for (const line of speech(MISSIONS_BY_LANG[lang]![m.day]!)) {
      expect(line, `${lang} ${m.id}`).not.toMatch(LABEL);
    }
    // …nor in the translation shown with the line.
    for (const m of BOOTCAMP_PLAN) for (const d of Object.values(MISSIONS_BY_LANG.en![m.day]!.dialogues)) for (const n of d.nodes) expect(`${n.he} ${n.tr?.he ?? ''} ${n.tr?.en ?? ''}`, `${m.id} ${n.id}`).not.toMatch(LABEL);
  });
  it('every spoken word around the jump is kept, and a pause is still a pause', () => {
    // Mission 22: one line became two beats of the same speaker — same words, the label between them is now the cue.
    for (const [lang, a, b] of [['en', "Of course — I'll bring the right one right away.", "Here's your bill."], ['fr', 'Bien sûr — je vous apporte le bon tout de suite.', 'Voici l’addition.'], ['es', 'Claro — le traigo el correcto enseguida.', 'Aquí tiene la cuenta.']] as const) {
      const d = mission(22, lang).dialogues['fixing-problems']!;
      const first = node(d, 'n5'); const second = node(d, 'n5b');
      expect([first.who, first.en, first.next, first.cue], lang).toEqual(['npc', a, 'n5b', undefined]);
      expect([second.who, second.en, second.next, second.cue?.en], lang).toEqual(['npc', b, 'c6', 'Later…']);
    }
    // The other conversations: the line is what it was, minus the label.
    expect(node(mission(14).dialogues['sit-down-meal']!, 'n5b').en).toBe('Is everything okay?');
    expect(node(mission(17).dialogues['supermarket']!, 'n3').en).toBe('Hi! Is that everything?');
    expect(node(mission(17, 'fr').dialogues['supermarket']!, 'n3').en).toBe('Bonjour ! Ce sera tout ?');
    expect(node(mission(17, 'es').dialogues['supermarket']!, 'n3').en).toBe('¡Hola! ¿Eso es todo?');
    // A line that merely opens with a pause is ordinary speech and stays spoken.
    for (const n of [7, 10, 29, 30]) expect(speech(mission(n)).filter((l) => l.startsWith('…')), `M${n}`).toContain('…We are almost there. Is here okay?');
  });
  it('scene count and the learner\'s turns did not move: only Mission 22 gained a beat, by the same speaker', () => {
    const turns = (n: number, lang: Lang): string => scenes(mission(n, lang)).map((d) => cinematicTranscript(d).map((l) => l.who[0]).join('')).join('|');
    for (const lang of LANGS) {
      expect(BOOTCAMP_PLAN.reduce((k, _m, i) => k + scenes(mission(i + 1, lang)).length, 0), lang).toBe(50);
      for (let n = 1; n <= 30; n++) expect(turns(n, lang), `${lang} M${n}`).toBe(turns(n, 'en'));
    }
    expect(turns(22, 'en')).toBe('nynynnynynyn|nynynynynyn');
    expect(turns(14, 'en')).toBe('nynnynynynnyn');
  });
  it('the practice that quotes those lines quotes them without the label too', () => {
    for (const lang of LANGS) for (const n of [14, 17]) {
      const d = mission(n, lang);
      const said = new Set(Object.values(d.dialogues).flatMap((x) => x.nodes.filter((y) => y.who === 'npc').map((y) => y.en)));
      for (const r of rush(d).rounds) if (r.npc) expect(said.has(r.npc.en), `${lang} M${n}: ${r.npc.en}`).toBe(true);
    }
  });
});

describe('legacy history: what a learner practised in the old Mission 29 still counts', () => {
  const OLD = ['phrase.rest.table-for-two', 'phrase.rest.bill-please', 'phrase.pay.by-card'];
  const at = '2026-01-01T10:00:00Z';

  it('the three old ids map to exactly the Core sentences the mission now says at those turns', () => {
    expect(LEGACY_ALIASES).toEqual({
      'phrase.rest.table-for-two': 'phrase.rest.table-two',
      'phrase.rest.bill-please': 'phrase.rest.the-bill',
      'phrase.pay.by-card': 'phrase.money.by-card',
    });
    for (const lang of LANGS) for (const [old, now] of Object.entries(LEGACY_ALIASES)) expect(canonicalSentenceId(lang, `${lang}.${old}`), `${lang} ${old}`).toBe(`${lang}.${now}`);
    // The same request, by its Core sentence: table → the table line, bill → the bill line, card → the card line.
    const said = (scene: string, k: number): string => strip(screens(mission(29).dialogues[scene]!)[k]!.choices!.find((c) => c.correct && !isTool(c.itemId))!.itemId);
    expect([said('dr-order', 0), said('dr-pay', 0), said('dr-pay', 1)]).toEqual(['phrase.rest.table-two', 'phrase.rest.the-bill', 'phrase.money.by-card']);
    expect(mission(29).items.filter((i) => ['phrase.rest.table-two', 'phrase.rest.the-bill', 'phrase.money.by-card'].includes(strip(i.id))).map((i) => i.text)).toEqual(['A table for two, please.', 'The bill, please.', 'By card, please.']);
  });
  it('every target is a canonical sentence of the Core, in every language', () => {
    for (const lang of LANGS) {
      const canonical = new Set(sentenceCatalog(lang).groups.flatMap((g) => g.items.map((i) => i.id)));
      for (const now of Object.values(LEGACY_ALIASES)) expect(canonical.has(`${lang}.${now}`), `${lang} ${now}`).toBe(true);
    }
  });
  it('practice stored under an old id counts for its Core sentence — and without the mapping it would be lost', () => {
    for (const lang of LANGS) {
      const deck = buildSentenceDeck(lang);
      const log = OLD.map((id) => ({ itemId: `${lang}.${id}`, outcome: 'pass', at }));
      expect(practicedIds(deck, log).size, lang).toBe(0);
      expect(practicedIds(deck, log, (id) => canonicalSentenceId(lang, id)), lang).toEqual(new Set(Object.values(LEGACY_ALIASES).map((id) => `${lang}.${id}`)));
      // Old and new id for the same sentence are ONE practised sentence, not two.
      const both = [...log, ...Object.values(LEGACY_ALIASES).map((id) => ({ itemId: `${lang}.${id}`, outcome: 'pass', at }))];
      expect(practicedIds(deck, both, (id) => canonicalSentenceId(lang, id)).size, lang).toBe(3);
    }
  });
  it('the old ids are not active Core sentences again: not in a mission, the library, the deck or the derived aliases', () => {
    for (const lang of LANGS) {
      const catalog = sentenceCatalog(lang);
      const live = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => i.id)));
      const listed = new Set(catalog.groups.flatMap((g) => g.items.map((i) => i.id)));
      const deck = new Set(buildSentenceDeck(lang).map((c) => c.id));
      for (const id of OLD.map((x) => `${lang}.${x}`)) {
        expect([live.has(id), listed.has(id), deck.has(id), catalog.aliases.has(id)], id).toEqual([false, false, false, false]);
      }
      expect(RETIRED_SENTENCES[lang].some((r) => OLD.includes(strip(r.id))), lang).toBe(false); // history is solved by the alias, not by archiving
    }
    expect(canonicalSentenceId('en', 'en.phrase.not.a-sentence')).toBe('en.phrase.not.a-sentence');
  });
});

describe('all three languages get the same practice, each in its own words', () => {
  it('every step of Missions 25–30 validates in English, French and Spanish', () => {
    for (const lang of LANGS) for (let n = 25; n <= 30; n++) {
      const day = mission(n, lang);
      const ids = new Set(day.items.map((i) => i.id));
      for (const s of day.steps) {
        expect(validatePracticeStep(s, ids, (id) => day.items.find((i) => i.id === id)?.text), `${lang} M${n} ${s.kind}`).toEqual([]);
        if (s.kind === 'tool') expect(ids.has(s.itemId), `${lang} M${n}`).toBe(true);
        if (s.kind === 'replies') for (const id of [s.saidItemId, ...s.replyIds]) expect(ids.has(id), `${lang} M${n} ${id}`).toBe(true);
        if (s.kind === 'swipe') for (const id of s.itemIds) expect(ids.has(id), `${lang} M${n} ${id}`).toBe(true);
        if (s.kind === 'ambush') for (const id of [s.correctItemId, s.wrongItemId]) expect(ids.has(id), `${lang} M${n} ${id}`).toBe(true);
      }
      for (const d of Object.values(day.dialogues)) for (const nd of d.nodes) for (const c of nd.choices ?? []) expect(ids.has(c.itemId!), `${lang} M${n} ${c.itemId}`).toBe(true);
    }
  });
  it('same steps, scenes, decisions and accepted answers in every language', () => {
    const shape = (day: BootcampDayContent): unknown => [
      day.steps.map((s) => {
        if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
        if (s.kind === 'swap') return [s.kind, s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning.he])])];
        if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss])];
        if (s.kind === 'ambush') return [s.kind, s.mode, strip(s.correctItemId), strip(s.wrongItemId)];
        if (s.kind === 'tool') return [s.kind, strip(s.itemId)];
        if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
        if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
        if (s.kind === 'dialogue') return [s.kind, s.dialogueId];
        return s;
      }),
      Object.values(day.dialogues).map((d) => [d.id, d.cold ?? false, d.audioOnly ?? false, d.nodes.map((n) => [n.id, n.who, n.next, n.fast ?? false, n.slow ?? false, n.end ?? false, (n.choices ?? []).map((c) => [strip(c.itemId), c.correct, c.next])])]),
    ];
    for (let n = 25; n <= 30; n++) for (const lang of ['fr', 'es'] as const) expect(shape(mission(n, lang)), `${lang} M${n}`).toEqual(shape(mission(n)));
  });
  it('French and Spanish lines are not left in English', () => {
    for (let n = 25; n <= 30; n++) {
      const en = Object.values(mission(n).dialogues).flatMap((d) => d.nodes.filter((x) => x.who === 'npc').map((x) => x.en));
      for (const lang of ['fr', 'es'] as const) {
        const other = Object.values(mission(n, lang).dialogues).flatMap((d) => d.nodes.filter((x) => x.who === 'npc').map((x) => x.en));
        other.forEach((line, i) => expect(line, `${lang} M${n}`).not.toBe(en[i]));
      }
    }
  });
});

/* ── scaffolding decreases ───────────────────────────────────────────────────────────────────── */

describe('scaffolding decreases across the phase', () => {
  it('25–27 teach; 28–30 do not — no key sentences, word intro, expected replies, quiz, review or cold open', () => {
    for (const lang of LANGS) {
      for (const n of [25, 26, 27]) expect(stepsOf(mission(n, lang), 'tool').length, `${lang} M${n}`).toBeGreaterThan(0);
      for (const n of [28, 29, 30]) expect(new Set(mission(n, lang).steps.map((s) => s.kind)), `${lang} M${n}`).toEqual(new Set(['talk', 'dialogue', 'receipt', 'summary']));
    }
  });
  it('no mission of the phase has a meaning quiz, and the reviews are short (25–27) or gone (28–30)', () => {
    for (let n = 25; n <= 30; n++) expect(stepsOf(mission(n), 'quiz'), `M${n}`).toHaveLength(0);
    expect([25, 26, 27, 28, 29, 30].map((n) => reviewed(mission(n)).length)).toEqual([8, 8, 6, 0, 0, 0]);
  });
  it('translation before the answer: still there in 25–27, never in 28–30', () => {
    for (const n of [25, 26, 27]) expect(translatedBeforeAnswer(mission(n)), `M${n}`).toBeGreaterThan(0);
    for (const n of [28, 29, 30]) {
      expect(translatedBeforeAnswer(mission(n)), `M${n}`).toBe(0);
      for (const d of scenes(mission(n))) expect(d.cold, `M${n} ${d.id}`).toBe(true);
    }
  });
  it('no mission asks 40 questions', () => {
    const count = (day: BootcampDayContent): number =>
      stepsOf(day, 'replies').reduce((k, s) => k + s.replyIds.length, 0) + stepsOf(day, 'quickReply').reduce((k, s) => k + s.rounds.length, 0)
      + stepsOf(day, 'swap').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(day, 'matchPairs').reduce((k, s) => k + s.pairs.length, 0)
      + stepsOf(day, 'ambush').length + scenes(day).flatMap(screens).length;
    const totals = [25, 26, 27, 28, 29, 30].map((n) => count(mission(n)));
    expect(totals).toEqual([29, 26, 21, 12, 13, 22]);
    for (const t of totals) expect(t).toBeLessThan(40);
    expect(totals[2]!).toBeLessThan(Math.min(totals[0]!, totals[1]!)); // Emergency is the tight one
  });
  it('the difficulty is never an unknown word: every line of every mission is made of words already met', () => {
    for (const lang of LANGS) {
      // Teaching missions: their own sentences and conversation are the new material; the speed
      // chain and the fast final line may add nothing to it.
      for (const n of [25, 26, 27]) {
        const day = mission(n, lang);
        const finals = [...(rush(day)?.rounds ?? []).flatMap((r) => [r.npc?.en ?? '', ...r.options.map((o) => o.text ?? '')]), ...stepsOf(day, 'ambush').map((s) => s.npc.en)];
        expect(unknownIn(finals, vocabulary(lang, n, true)), `${lang} M${n}`).toEqual([]);
      }
      // 28–30: zero new language capability. Everything was met BEFORE the mission.
      for (const n of [28, 29, 30]) expect(unknownIn(lines(mission(n, lang)), vocabulary(lang, n - 1)), `${lang} M${n}`).toEqual([]);
    }
  });
  it('28–30 use only sentences an earlier mission taught, under the same id and wording', () => {
    for (const lang of LANGS) for (const n of [28, 29, 30]) {
      const earlier = new Map(BOOTCAMP_PLAN.slice(0, n - 1).flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items).map((i) => [i.id, i.text]));
      for (const it of mission(n, lang).items) expect(earlier.get(it.id), `${lang} M${n} ${it.id}`).toBe(it.text);
    }
  });
});

/* ── high stakes ─────────────────────────────────────────────────────────────────────────────── */

describe('high-stakes missions (25–27): language practice, not advice', () => {
  it('no guarantee, no claim that a medicine is right or safe, no promise that help arrives', () => {
    for (const lang of LANGS) for (const n of [25, 26, 27]) {
      const text = allCopy(mission(n, lang));
      expect(text, `${lang} M${n}`).not.toMatch(/guarantee|safe for you|is safe|will work|definitely|will cure|sans danger|es seguro|מובטח|בטוח לשימוש/i);
    }
    // The cards the learner reads after practising never say help WILL come or that anything was done "right".
    for (const n of [25, 26, 27]) for (const s of stepsOf(mission(n), 'receipt')) expect(s.text.en, `M${n}`).not.toMatch(/will (come|arrive|be there)|everything right|you are safe/i);
  });
  it('no country emergency number anywhere', () => {
    for (const lang of LANGS) for (const n of [25, 26, 27]) expect(allCopy(mission(n, lang)), `${lang} M${n}`).not.toMatch(/\b(911|112|999|100|101|102|103|15|17|18|061|091)\b/);
  });
  it('Recovery is the better move than guessing: each mission keeps it inside the conversation, and 25–26 end on it', () => {
    expect(withRecovery(mission(25))).toEqual(['police-station:phrase.recovery.what-mean']);
    expect(withRecovery(mission(26))).toEqual(['pharmacy:phrase.recovery.slowly', 'pharmacy:phrase.recovery.repeat']);
    expect(withRecovery(mission(27))).toEqual(['emergency:phrase.recovery.slowly']);
    for (const n of [25, 26]) {
      const last = stepsOf(mission(n), 'ambush');
      expect(last.map((s) => [s.mode, strip(s.correctItemId)]), `M${n}`).toEqual([['recovery', 'phrase.recovery.slowly']]);
    }
    expect(stepsOf(mission(27), 'ambush')).toHaveLength(0);
  });
});

/* ── Mission 25 ──────────────────────────────────────────────────────────────────────────────── */

describe('Mission 25 — Lost / Stolen / Police', () => {
  const day = mission(25);
  it('flow: key sentences → expected replies → situation match → the report → swap → two scenes → short review → speed chain → one fast follow-up', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'matchPairs', 'quickReply', 'swap', 'dialogue', 'receipt', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'ambush:recovery', 'receipt', 'summary']);
    expect(Object.keys(day.dialogues)).toEqual(['asking-for-help', 'police-station']);
  });
  it('"Where did it happen?" is drilled once, then only answered in context', () => {
    const drilled = stepsOf(day, 'replies').flatMap((s) => s.replyIds.map(strip)).filter((id) => id === 'reply.lost.where-happen');
    expect(drilled).toHaveLength(1);
    expect(stepsOf(day, 'quiz')).toHaveLength(0);
    for (const lang of LANGS) {
      const d = mission(25, lang);
      const q = d.items.find((i) => strip(i.id) === 'reply.lost.where-happen')!.text;
      for (const s of stepsOf(d, 'ambush')) expect(s.npc.en.includes(q.replace(/[¿?]/g, '').trim()), lang).toBe(false);
      for (const s of stepsOf(d, 'ambush')) expect([strip(s.correctItemId), strip(s.wrongItemId)]).not.toContain('reply.lost.where-happen');
      expect(rush(d).rounds.some((r) => r.npc?.en === q), lang).toBe(false);
    }
    // In context: the question is asked, and the learner answers with the place.
    expect(mapOf(chats(day)[0]!).find(([q]) => q === 'reply.lost.where-happen')![1]).toEqual(['phrase.lost.on-the-bus']);
  });
  it('situation → statement: can\'t find / stolen / lost, each with words beside the icon', () => {
    const match = stepsOf(day, 'matchPairs')[0]!;
    expect(match.pairs.map((p) => [strip(p.promptItemId), p.answerLabel, p.answerGloss?.en])).toEqual([
      ['phrase.lost.cant-find', '🔍', 'Looking — it is not there'],
      ['phrase.lost.phone-stolen', '🏃', 'Someone took the phone'],
      ['phrase.emerg.lost-passport', '🛂', 'The passport is lost'],
    ]);
    for (const p of match.pairs) { expect((p.answerGloss?.he ?? '').trim()).not.toBe(''); expect((p.answerGloss?.en ?? '').trim()).not.toBe(''); }
  });
  it('the report: what happened → stolen; where → the place; report it → yes; police → where is the station; passport → yes', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['Hello. How can I help you?', ['phrase.lost.phone-stolen']],
      ['reply.lost.where-happen', ['phrase.lost.on-the-bus']],
      ['reply.lost.want-to-report', ['phrase.lost.want-report']],
      ['reply.lost.go-to-police', ['phrase.lost.where-police']],
      ['reply.lost.have-passport-q', ['phrase.lost.have-passport']],
    ]);
    for (const r of chats(day)[0]!.rounds) expect(r.options).toHaveLength(3);
  });
  it('Swap It: "I can\'t find ___" and "I lost ___" with objects the learner knows', () => {
    const swap = stepsOf(day, 'swap')[0]!;
    expect(swap.rounds.map((r) => fillFrame(r.frame, r.options.find((o) => o.correct)!.slot))).toEqual(["I can't find my wallet.", 'I lost my passport.', 'I lost my phone.']);
    expect(fillFrame(swap.rounds[0]!.frame, swap.rounds[0]!.options.find((o) => o.correct)!.slot)).toBe(day.items.find((i) => strip(i.id) === 'phrase.lost.cant-find-wallet')!.text);
    for (const lang of LANGS) {
      const s = stepsOf(mission(25, lang), 'swap')[0]!;
      expect(fillFrame(s.rounds[1]!.frame, s.rounds[1]!.options.find((o) => o.correct)!.slot), lang).toBe(mission(25, lang).items.find((i) => strip(i.id) === 'phrase.emerg.lost-passport')!.text);
    }
  });
  it('the final challenge is lost/stolen → help → report, in the conversations\' own words', () => {
    for (const lang of LANGS) {
      const d = mission(25, lang);
      const said = new Set(Object.values(d.dialogues).flatMap((x) => x.nodes.filter((n) => n.who === 'npc').map((n) => n.en)));
      for (const r of rush(d).rounds) expect(said.has(r.npc!.en), `${lang}: ${r.npc!.en}`).toBe(true);
    }
    expect(mapOf(rush(day)).map(([, a]) => a[0])).toEqual(['phrase.lost.cant-find', 'phrase.lost.where-police', 'phrase.lost.phone-stolen', 'phrase.lost.want-report']);
  });
  it('one fast follow-up where asking for it slowly is what works — and answering blindly is the miss', () => {
    const last = stepsOf(day, 'ambush')[0]!;
    expect(last.npc.en).toBe('Okay. Was it here, near the station, or on the bus this morning? And do you have your passport?');
    expect([strip(last.correctItemId), strip(last.wrongItemId)]).toEqual(['phrase.recovery.slowly', 'phrase.lost.want-report']);
  });
  it('the review is trimmed to what the mission is about', () => {
    expect(reviewed(day)).toEqual(['phrase.lost.cant-find', 'phrase.lost.phone-stolen', 'phrase.emerg.lost-passport', 'phrase.lost.where-police', 'phrase.lost.on-the-bus', 'phrase.lost.want-report', 'reply.lost.where-happen', 'reply.lost.want-to-report']);
  });
});

/* ── Mission 26 ──────────────────────────────────────────────────────────────────────────────── */

describe('Mission 26 — Pharmacy & Health', () => {
  const day = mission(26);
  it('flow: key sentences → expected replies → symptom match → the counter → instruction match → the pharmacy → short review → chain → the instruction, fast', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'matchPairs', 'quickReply', 'matchPairs', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('"Any allergies?" and the dosage are each drilled once — no second test of the same line', () => {
    const replies = stepsOf(day, 'replies').flatMap((s) => s.replyIds.map(strip));
    expect(replies).toEqual(['reply.pharm.whats-matter', 'reply.pharm.any-allergies', 'reply.pharm.feel-better']);
    expect(stepsOf(day, 'quiz')).toHaveLength(0);
    const instructions = stepsOf(day, 'matchPairs')[1]!.pairs.map((p) => strip(p.promptItemId));
    expect(instructions).toEqual(['reply.pharm.take-twice', 'reply.pharm.after-meals', 'reply.pharm.see-doctor']);
    for (const id of instructions) expect(replies).not.toContain(id);
  });
  it('symptom / need match: four sentences, each with words beside the icon', () => {
    expect(stepsOf(day, 'matchPairs')[0]!.pairs.map((p) => [strip(p.promptItemId), p.answerLabel, p.answerGloss?.en])).toEqual([
      ['phrase.pharm.headache', '🤕', 'A headache'],
      ['phrase.pharm.stomach-ache', '🤢', 'A stomach ache'],
      ['phrase.pharm.hurts-here', '👉', 'It hurts here — you point'],
      ['phrase.pharm.something-for', '🤧', 'Something for a cold'],
    ]);
    for (const s of stepsOf(day, 'matchPairs')) for (const p of s.pairs) expect((p.answerGloss?.he ?? '').trim(), strip(p.promptItemId)).not.toBe('');
  });
  it('at the counter: what\'s the matter → symptom; allergies → the allergy; a remedy is offered → how often; a cold → something for it', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['reply.pharm.whats-matter', ['phrase.pharm.headache']],
      ['reply.pharm.any-allergies', ['phrase.pharm.allergic-penicillin']],
      ['Good to know. This may help.', ['phrase.pharm.how-often']],
      ['situation', ['phrase.pharm.something-for']],
    ]);
    // "What's the matter?" has three true answers in this mission — the other two are never offered as wrong.
    expect(chats(day)[0]!.rounds[0]!.options.map((o) => strip(o.itemId))).not.toContain('phrase.pharm.stomach-ache');
    expect(chats(day)[0]!.rounds[0]!.options.map((o) => strip(o.itemId))).not.toContain('phrase.pharm.hurts-here');
  });
  it('no dosage, duration or remedy is invented: every instruction the learner hears was already in the mission', () => {
    for (const lang of LANGS) {
      const d = mission(26, lang);
      const before = new Set([...d.items.map((i) => i.text), ...Object.values(d.dialogues).flatMap((x) => x.nodes.map((n) => n.en))].flatMap(words));
      const m15 = new Set(lines(mission(15, lang)).flatMap(words)); // "Any other allergies?"
      const fast = stepsOf(d, 'ambush')[0]!.npc.en;
      expect(words(fast).filter((w) => !before.has(w) && !m15.has(w)), lang).toEqual([]);
      expect(allCopy(d), lang).not.toMatch(/three days|trois jours|tres días|improve|s’améliore|mejora\b/i);
    }
    expect(stepsOf(day, 'ambush')[0]!.npc.en).toBe('Take this twice a day, after meals, and please follow the instructions on the label. Any other allergies?');
  });
  it('Recovery is a safety move: after a fast instruction, "thank you" is the miss and "slowly" is the answer', () => {
    const last = stepsOf(day, 'ambush')[0]!;
    expect([last.mode, strip(last.correctItemId), strip(last.wrongItemId)]).toEqual(['recovery', 'phrase.recovery.slowly', 'phrase.recovery.thank-you']);
    const card = day.steps[day.steps.indexOf(last) + 1]!;
    expect(card.kind === 'receipt' && card.text.en).toMatch(/understand first, and only then act/);
  });
  it('the final chain is symptom → allergy → the medicine question, then the instruction and the clarification', () => {
    expect(mapOf(rush(day))).toEqual([
      ["Hello! What's the matter?", ['phrase.pharm.headache']],
      ['I see. Before I give you anything — any allergies?', ['phrase.pharm.allergic-penicillin']],
      ['Good to know. This may help.', ['phrase.pharm.how-often']],
    ]);
    for (const lang of LANGS) {
      const d = mission(26, lang);
      const said = new Set(d.dialogues['pharmacy']!.nodes.filter((n) => n.who === 'npc').map((n) => n.en));
      for (const r of rush(d).rounds) expect(said.has(r.npc!.en), `${lang}: ${r.npc!.en}`).toBe(true);
    }
    expect(kinds(day).slice(-5)).toEqual(['quickReply:speed', 'receipt', 'ambush:recovery', 'receipt', 'summary']);
  });
  it('the review is trimmed: the six things you say, and the two instructions', () => {
    expect(reviewed(day)).toEqual(['phrase.pharm.headache', 'phrase.pharm.stomach-ache', 'phrase.pharm.hurts-here', 'phrase.pharm.something-for', 'phrase.pharm.allergic-penicillin', 'phrase.pharm.how-often', 'reply.pharm.take-twice', 'reply.pharm.after-meals']);
  });
  it('the practice is defined once for the three languages', () => {
    const src = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(src('./day25.ts')).toContain("...m26Flow('en')");
    expect(src('./fr/day25.ts')).toContain("...m26Flow('fr')");
    expect(src('./es/day25.ts')).toContain("...m26Flow('es')");
  });
});

/* ── Mission 27 ──────────────────────────────────────────────────────────────────────────────── */

describe('Mission 27 — Emergency', () => {
  const day = mission(27);
  it('flow: key sentences → expected replies → the dispatcher\'s questions → which service → the call → short review → the whole call at speed', () => {
    expect(kinds(day)).toEqual(['talk', 'tool', 'tool', 'tool', 'tool', 'tool', 'replies', 'receipt', 'quickReply', 'quickReply', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'summary']);
  });
  it('"Where are you?" is drilled once; after that it is only answered', () => {
    expect(stepsOf(day, 'replies').flatMap((s) => s.replyIds.map(strip)).filter((id) => id === 'reply.emerg.where-you')).toHaveLength(1);
    expect(stepsOf(day, 'quiz')).toHaveLength(0);
    expect(stepsOf(day, 'ambush')).toHaveLength(0);
  });
  it('the critical responses: what\'s wrong → help; are you hurt → someone is; where are you → the place; stay there → I\'ll stay', () => {
    expect(mapOf(chats(day)[0]!)).toEqual([
      ['reply.emerg.whats-wrong', ['phrase.emerg.need-help']],
      ['reply.emerg.are-you-hurt', ['phrase.emerg.someone-hurt']],
      ['reply.emerg.where-you', ['phrase.emerg.im-at-station']],
      ['reply.emerg.stay-there', ['phrase.emerg.stay-here']],
    ]);
    // "Someone is hurt." also answers "What's wrong?" — so it is never offered there as a wrong option.
    expect(chats(day)[0]!.rounds[0]!.options.map((o) => strip(o.itemId))).not.toContain('phrase.emerg.someone-hurt');
  });
  it('"I\'m at the train station." is retrieved again and again: twice in practice, once in the call', () => {
    const inPractice = stepsOf(day, 'quickReply').flatMap((s) => s.rounds).filter((r) => r.options.some((o) => o.correct && strip(o.itemId) === 'phrase.emerg.im-at-station'));
    expect(inPractice).toHaveLength(2);
    expect(scenes(day).flatMap(screens).filter((n) => n.choices!.some((c) => c.correct && strip(c.itemId) === 'phrase.emerg.im-at-station')).length).toBeGreaterThanOrEqual(1);
  });
  it('service choice: an injury → an ambulance; danger or a crime → the police', () => {
    const service = chats(day)[1]!;
    expect(service.rounds.map((r) => [r.situation?.en, r.options.filter((o) => o.correct).map((o) => strip(o.itemId))])).toEqual([
      ['Someone is injured.', ['phrase.emerg.call-ambulance']],
      ['Someone is in danger, or there has been a crime.', ['phrase.emerg.call-police']],
    ]);
  });
  it('the final challenge is the complete call, in order, at natural speed — with not one new word', () => {
    for (const lang of LANGS) {
      const d = mission(27, lang);
      const call = d.dialogues['emergency']!.nodes.filter((n) => n.who === 'npc' && !n.slow && !n.end).map((n) => n.en);
      expect(rush(d).rounds.map((r) => r.npc!.en), lang).toEqual(call);
    }
    expect(mapOf(rush(day)).map(([, a]) => a[0])).toEqual(['phrase.emerg.need-help', 'phrase.emerg.someone-hurt', 'phrase.emerg.call-ambulance', 'phrase.emerg.im-at-station', 'phrase.emerg.stay-here']);
  });
  it('calm tone: the cards the learner reads do not shout and do not judge', () => {
    for (const s of stepsOf(day, 'receipt')) { expect(s.text.en).not.toMatch(/!|panic|hurry/i); expect(s.text.he).not.toMatch(/!/); }
  });
  it('the review is six sentences — the ones that must be automatic', () => {
    expect(reviewed(day)).toEqual(['phrase.emerg.need-help', 'phrase.emerg.someone-hurt', 'phrase.emerg.call-ambulance', 'phrase.emerg.call-police', 'phrase.emerg.im-at-station', 'phrase.emerg.stay-here']);
  });
});

/* ── Mission 28 ──────────────────────────────────────────────────────────────────────────────── */

describe('Mission 28 — No Subtitles', () => {
  const day = mission(28);
  let convo: typeof ConvoModule;
  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    convo = await import('./ConvoScene.js');
  });

  it('three scenes — station, restaurant, a local — and nothing else: no teaching, no cold open', () => {
    expect(kinds(day)).toEqual(['talk', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'receipt', 'summary']);
    expect(Object.keys(day.dialogues)).toEqual(['ns-transit', 'ns-diner', 'ns-local']);
  });
  it('every scene is heard only: no transcript and no translation before the learner answers', () => {
    for (const lang of LANGS) for (const d of scenes(mission(28, lang))) {
      expect(d.audioOnly, `${lang} ${d.id}`).toBe(true);
      expect(d.cold, `${lang} ${d.id}`).toBe(true);
    }
    expect(writtenBeforeAnswer(day)).toBe(0);
    expect(translatedBeforeAnswer(day)).toBe(0);
    // No other mission hides the transcript.
    for (const m of BOOTCAMP_PLAN) if (m.id !== 'no-subtitles') for (const d of Object.values(MISSIONS_BY_LANG.en![m.day]!.dialogues)) expect(d.audioOnly, m.id).toBeUndefined();
  });
  it('the renderer really hides it: an audio-only line is a replay button, with no words in it', () => {
    const line = 'Platform two. It leaves every ten minutes.';
    const npc = { glyph: '🧑' };
    const bubble = (audioOnly: boolean): string =>
      renderToStaticMarkup(createElement(convo.NpcLine, { npc, gloss: undefined, children: createElement(convo.NpcSpeech, { audioOnly, onPlay: () => undefined, children: line }) }));
    expect(bubble(false)).toContain(line);
    expect(bubble(true)).not.toContain(line);
    expect(bubble(true)).not.toMatch(/Platform|minutes/);
    expect(bubble(true)).toContain('audio-bubble');
    expect(bubble(true)).not.toContain('convo-gloss');
    // The player wires the scene's flag to it, and gives a cold scene no translation.
    const player = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toContain('<NpcSpeech audioOnly={dialogue.audioOnly === true}');
    expect(player).toContain('gloss={dialogue.cold ? undefined : dialogueTr(displayNpc)}');
    // The line is written nowhere else on the screen before the answer.
    const turn = player.slice(player.indexOf('<div className="convo">'), player.indexOf('<div className="action-zone">', player.indexOf('<div className="convo">')));
    expect(turn.match(/displayNpc\.en/g)).toHaveLength(3); // the replay handler, the cold text, the tappable text — all inside NpcSpeech
  });
  it('twelve real decisions, four per scene — no screen with a single button', () => {
    expect(scenes(day).map((d) => screens(d).filter((n) => n.choices!.some((c) => !c.correct)).length)).toEqual([4, 4, 4]);
    expect(decisions(day)).toHaveLength(12);
    expect(oneButton(day)).toHaveLength(0);
    for (const n of scenes(day).flatMap(screens)) expect(n.choices!.filter((c) => c.correct && !isTool(c.itemId)), n.id).toHaveLength(1);
  });
  it('the wrong option is a real line from another moment, and a miss is asked again slowly — still without text', () => {
    for (const d of scenes(day)) for (const n of screens(d)) for (const c of n.choices!.filter((x) => !x.correct)) {
      const reask = node(d, c.next);
      expect([reask.who, reask.slow, reask.next], `${d.id} ${n.id}`).toEqual(['npc', true, n.id]);
    }
    const wrong = scenes(day).flatMap(screens).flatMap((n) => n.choices!.filter((c) => !c.correct).map((c) => strip(c.itemId)));
    expect(wrong).toEqual([
      'phrase.taxi.to-address', 'phrase.money.in-cash', 'phrase.trans.single', 'phrase.trans.which-platform',
      'phrase.rest.ill-have', 'phrase.rest.the-bill', 'phrase.rest.delicious', 'phrase.rest.no-onions',
      'phrase.social.from-israel', 'phrase.talk.i-like-it', 'phrase.talk.nice-talking', 'phrase.talk.how-about-you',
    ]);
  });
  it('Recovery is offered on the two densest lines only, and it changes what happens', () => {
    expect(withRecovery(day)).toEqual(['ns-transit:phrase.recovery.repeat', 'ns-diner:phrase.recovery.slowly']);
    for (const d of scenes(day)) for (const n of screens(d)) for (const c of n.choices!.filter((x) => isTool(x.itemId))) {
      expect(c.correct).toBe(true);
      const again = node(d, c.next);
      expect([again.slow, again.next]).toEqual([true, n.id]); // said again slowly, then the same decision
      expect(n.choices!.filter((x) => x.correct && !isTool(x.itemId)).every((x) => x.next !== c.next)).toBe(true);
    }
    expect(node(day.dialogues['ns-transit']!, 'r8').en).toBe('Platform — two. Every — ten — minutes.');
  });
  it('natural speed: every line the other speaker says is at the faster pace', () => {
    for (const d of scenes(day)) for (const n of d.nodes.filter((x) => x.who === 'npc' && !x.slow)) expect(n.fast, `${d.id} ${n.id}`).toBe(true);
  });
  it('the jump in time is a scene transition: shown in the app language, never spoken, never a listening item', () => {
    for (const lang of LANGS) {
      const d = mission(28, lang).dialogues['ns-diner']!;
      const later = d.nodes.filter((n) => n.cue);
      expect(later.map((n) => [n.id, n.cue]), lang).toEqual([['n7', { he: 'מאוחר יותר…', en: 'Later…' }]]);
      // Nothing of it is in what the text-to-speech is given, in any scene, on any branch.
      for (const sc of scenes(mission(28, lang))) for (const n of sc.nodes) expect(n.en, `${lang} ${sc.id} ${n.id}`).not.toMatch(/…|\bLater\b|Plus tard|Más tarde/);
      expect(later[0]!.en, lang).toBe(mission(28, lang).items.find((i) => strip(i.id) === 'reply.rest.everything-okay')?.text ?? mission(14, lang).items.find((i) => strip(i.id) === 'reply.rest.everything-okay')!.text);
    }
    // It is still one of the twelve decisions' prompts — the cue adds no screen and no question.
    expect(decisions(mission(28))).toHaveLength(12);
    const player = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toContain('{displayNpc.cue && <p className="faint small convo-cue" dir="auto">{L(displayNpc.cue)}</p>}');
    expect(player).not.toMatch(/speakL\([^)]*cue/); // the cue is never handed to speech
  });
  it('audio-only is opt-in: Mission 28 hides transcript and gloss; 29 and 30 show the transcript without a gloss; every other mission is unaffected', () => {
    const flags = (n: number): [boolean, boolean][] => scenes(mission(n)).map((d) => [d.cold === true, d.audioOnly === true]);
    expect(new Set(flags(28).map((f) => f.join()))).toEqual(new Set(['true,true']));
    for (const n of [29, 30]) expect(new Set(flags(n).map((f) => f.join())), `M${n}`).toEqual(new Set(['true,false']));
    expect(writtenBeforeAnswer(mission(28))).toBe(0);
    expect(writtenBeforeAnswer(mission(29))).toBeGreaterThan(0);
    expect(writtenBeforeAnswer(mission(30))).toBeGreaterThan(0);
    for (const lang of LANGS) for (let n = 1; n <= 30; n++) if (n !== 28) for (const d of Object.values(mission(n, lang).dialogues)) expect(d.audioOnly, `${lang} M${n} ${d.id}`).toBeUndefined();
    // Teaching missions keep the full line: written, tappable, and translated.
    for (let n = 1; n <= 27; n++) if (![10, 18, 24].includes(n)) for (const d of Object.values(mission(n).dialogues)) expect(d.cold, `M${n} ${d.id}`).toBeUndefined();
    // What the player draws for each kind of scene.
    const npc = { glyph: '🧑' };
    const draw = (audioOnly: boolean, gloss: string | undefined): string =>
      renderToStaticMarkup(createElement(convo.NpcLine, { npc, gloss, children: createElement(convo.NpcSpeech, { audioOnly, onPlay: () => undefined, children: 'Are you ready to order?' }) }));
    const m28 = draw(true, undefined), m29 = draw(false, undefined), teaching = draw(false, 'מוכנים להזמין?');
    expect([m28.includes('Are you ready to order?'), m28.includes('convo-gloss')]).toEqual([false, false]);
    expect([m29.includes('Are you ready to order?'), m29.includes('convo-gloss')]).toEqual([true, false]);
    expect([teaching.includes('Are you ready to order?'), teaching.includes('מוכנים להזמין?')]).toEqual([true, true]);
  });
  it('the untaught surprises are gone', () => {
    for (const lang of LANGS) expect(lines(mission(28, lang)).join('\n'), lang).not.toMatch(/changed|a changé|ha cambiado|about to close|va fermer|a punto de cerrar|heads up|sorry to rush|presser|prisas/i);
  });
  it('the opening card says what is different: you only hear it', () => {
    const talk = day.steps[0]!;
    expect(talk.kind === 'talk' && talk.body.map((b) => b.en).join(' ')).toMatch(/not written on the screen/);
  });
});

/* ── Mission 29 ──────────────────────────────────────────────────────────────────────────────── */

describe('Mission 29 — Dress Rehearsal', () => {
  const day = mission(29);
  it('one continuous evening: taxi → restaurant → the problem → payment, and nothing else', () => {
    expect(kinds(day)).toEqual(['talk', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'receipt', 'summary']);
    expect(Object.keys(day.dialogues)).toEqual(['dr-taxi', 'dr-order', 'dr-problem', 'dr-pay']);
  });
  it('no translation before the answer — but, unlike Mission 28, the line is written', () => {
    for (const d of scenes(day)) { expect(d.cold).toBe(true); expect(d.audioOnly).toBeUndefined(); }
    expect(translatedBeforeAnswer(day)).toBe(0);
  });
  it('thirteen real decisions with a plausible wrong line from elsewhere in the evening', () => {
    expect(scenes(day).map((d) => screens(d).length)).toEqual([3, 4, 3, 3]);
    expect(decisions(day)).toHaveLength(13);
    expect(oneButton(day)).toHaveLength(0);
    const wrong = scenes(day).flatMap(screens).flatMap((n) => n.choices!.filter((c) => !c.correct).map((c) => strip(c.itemId)));
    expect(wrong).toEqual([
      'phrase.rest.table-two', 'phrase.taxi.keep-change', 'phrase.taxi.to-address',
      'phrase.border.two-weeks', 'phrase.rest.delicious', 'phrase.rest.the-bill', 'phrase.rest.table-two',
      'phrase.rest.delicious', 'phrase.rest.ill-have', 'phrase.fix.can-you-fix',
      'phrase.rest.water', 'phrase.money.how-much', 'phrase.taxi.keep-change',
    ]);
  });
  it('a Recovery budget of two — not on every screen — and using it changes what happens', () => {
    expect(withRecovery(day)).toEqual(['dr-problem:phrase.recovery.repeat', 'dr-pay:phrase.recovery.slowly']);
    for (const d of scenes(day)) for (const n of screens(d)) for (const c of n.choices!.filter((x) => isTool(x.itemId))) {
      const again = node(d, c.next);
      expect([again.who, again.slow, again.next]).toEqual(['npc', true, n.id]);
      // Never the old behaviour: a help tool that leads to the same next line as the real answer.
      expect(n.choices!.filter((x) => !isTool(x.itemId)).every((x) => x.next !== c.next)).toBe(true);
    }
  });
  it('one disruption only — the wrong dish — and one faster moment — the bill', () => {
    const problems = scenes(day).flatMap(screens).filter((n) => n.choices!.some((c) => c.correct && /phrase\.fix\.(not-ordered|theres-mistake|theres-problem|charged-twice)/.test(c.itemId ?? '')));
    expect(problems).toHaveLength(1);
    expect(day.items.map((i) => strip(i.id))).not.toContain('phrase.fix.charged-twice');
    expect(JSON.stringify(day)).not.toMatch(/on the house|charged twice/i);
    const fast = scenes(day).flatMap((d) => d.nodes.filter((n) => n.who === 'npc' && n.fast).map((n) => `${d.id}:${n.en}`));
    expect(fast).toEqual(["dr-pay:Here's your bill. That's twenty euros. Cash or card?"]);
  });
  it('the tense trap: "What did you order?" is answered with what WAS ordered, not by ordering again', () => {
    const q = screens(day.dialogues['dr-problem']!)[1]!;
    expect(q.choices!.map((c) => [c.en, c.correct])).toEqual([['I ordered the pasta.', true], ["I'll have the pasta, please.", false]]);
  });
  it('it is written once for the three languages (no hand-written copy can drift)', () => {
    const src = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(src('./core/checkpoints.ts')).toContain('export const DRESS_REHEARSAL: MissionSpec');
    expect(src('./registry.ts')).not.toContain('DAY28');
    expect(src('./fr/index.ts')).not.toContain('DAY28');
    expect(src('./es/index.ts')).not.toContain('DAY28');
  });
});

/* ── Mission 30 ──────────────────────────────────────────────────────────────────────────────── */

describe('Mission 30 — A Complete Day Abroad Alone', () => {
  const day = mission(30);
  it('one coherent day in five scenes — morning, getting around, a meal, a traveler, the evening — and nothing else', () => {
    expect(kinds(day)).toEqual(['talk', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'dialogue', 'receipt', 'receipt', 'summary']);
    expect(Object.keys(day.dialogues)).toEqual(['fin-morning', 'fin-taxi', 'fin-lunch', 'fin-chat', 'fin-evening']);
    for (const d of scenes(day)) expect(d.cold, d.id).toBe(true);
    expect(translatedBeforeAnswer(day)).toBe(0);
  });
  it('twenty-one real decisions; the single one-button screen is the goodnight', () => {
    expect(scenes(day).map((d) => screens(d).filter((n) => n.choices!.some((c) => !c.correct)).length)).toEqual([2, 4, 6, 7, 2]);
    expect(decisions(day)).toHaveLength(21);
    expect(oneButton(day).map((n) => n.choices![0]!.en)).toEqual(['Thank you. Good night!']);
  });
  it('a wrong answer gets a brief slow re-ask and rejoins the same decision', () => {
    for (const d of scenes(day)) for (const n of screens(d)) for (const c of n.choices!.filter((x) => !x.correct)) {
      const reask = node(d, c.next);
      expect([reask.who, reask.slow, reask.next], `${d.id} ${n.id}`).toEqual(['npc', true, n.id]);
    }
  });
  it('three Recovery moments, each on a fast or dense line', () => {
    expect(withRecovery(day)).toEqual(['fin-taxi:phrase.recovery.slowly', 'fin-lunch:phrase.recovery.repeat', 'fin-evening:phrase.recovery.slowly']);
    for (const d of scenes(day)) for (const n of screens(d).filter((x) => x.choices!.some((c) => isTool(c.itemId)))) {
      const asked = d.nodes.find((x) => x.who === 'npc' && x.next === n.id && !x.slow)!;
      expect(asked.fast, `${d.id} ${n.id}`).toBe(true);
    }
  });
  it('one real problem at the meal — and no police, medical or emergency incident is manufactured', () => {
    const problems = scenes(day).flatMap(screens).filter((n) => n.choices!.some((c) => c.correct && strip(c.itemId) === 'phrase.fix.not-ordered'));
    expect(problems).toHaveLength(1);
    for (const lang of LANGS) {
      expect(mission(30, lang).items.map((i) => strip(i.id)).filter((id) => /^(phrase|reply)\.(lost|pharm|emerg)\./.test(id)), lang).toEqual([]);
    }
    expect(JSON.stringify(Object.values(day.dialogues))).not.toMatch(/police|ambulance|doctor|stolen|allerg|hurt/i);
  });
  it('capability coverage: each thing the Core taught is demonstrated by a decision of the day', () => {
    const answers = new Map(scenes(day).flatMap((d) => screens(d).map((n): [string, string] => [`${d.id}:${strip(n.choices!.find((c) => c.correct && !isTool(c.itemId))!.itemId)}`, d.id])));
    const matrix: [capability: string, decision: string][] = [
      ['say what you have', 'fin-morning:phrase.core.i-have'],
      ['ask for what you need', 'fin-morning:phrase.core.do-you-have'],
      ['give a destination', 'fin-taxi:phrase.taxi.to-address'],
      ['say how long you are staying', 'fin-taxi:phrase.border.two-weeks'],
      ['understand a price said fast', 'fin-taxi:phrase.recovery.thank-you'],
      ['stop and pay the driver', 'fin-taxi:phrase.taxi.stop-here'],
      ['get a table', 'fin-lunch:phrase.rest.table-two'],
      ['order with a special request', 'fin-lunch:phrase.rest.ill-have-chicken'],
      ['say something is wrong', 'fin-lunch:phrase.fix.not-ordered'],
      ['say what you asked for', 'fin-lunch:phrase.rest.no-onions'],
      ['accept the fix politely', 'fin-lunch:phrase.fix.no-problem-thanks'],
      ['ask for the bill', 'fin-lunch:phrase.rest.the-bill'],
      ['say where you are from', 'fin-chat:phrase.social.from-israel'],
      ['talk about the past', 'fin-chat:phrase.past.i-went'],
      ['react to the past', 'fin-chat:phrase.past.it-was-great'],
      ['talk about the future', 'fin-chat:phrase.future.going-to-vietnam'],
      ['say for how long', 'fin-chat:phrase.future.ill-be-there'],
      ['give an opinion', 'fin-chat:phrase.opin.dont-think-so'],
      ['ask back', 'fin-chat:phrase.future.where-next'],
      ['answer a dense question', 'fin-evening:phrase.recovery.thank-you'],
      ['say how the day was', 'fin-evening:phrase.past.it-was-good'],
    ];
    for (const [capability, decision] of matrix) expect(answers.has(decision), `${capability} → ${decision}`).toBe(true);
    expect(new Set(matrix.map(([, d]) => d)).size).toBe(21); // every decision of the day demonstrates something
    expect(matrix).toHaveLength(decisions(day).length); // …all of them (the goodnight is pacing, not a decision)
    // Recovery is a capability too — demonstrated where the line is dense.
    expect(withRecovery(day)).toHaveLength(3);
  });
  it('the past/future pair is a real decision in both directions', () => {
    const chat = screens(day.dialogues['fin-chat']!);
    expect(chat[1]!.choices!.map((c) => [strip(c.itemId), c.correct])).toEqual([['phrase.past.i-went', true], ['phrase.future.going-to-vietnam', false]]);
    expect(chat[3]!.choices!.map((c) => [strip(c.itemId), c.correct])).toEqual([['phrase.future.going-to-vietnam', true], ['phrase.past.i-went', false]]);
  });
  it('the final card says what was demonstrated, keeps "You are ready. Actually ready." and does not claim fluency', () => {
    const cards = stepsOf(day, 'receipt');
    const last = cards[cards.length - 1]!.text;
    expect(last.en).toMatch(/You are ready\. Actually ready\.$/);
    expect(last.en).toMatch(/got what you needed.*fixed a problem.*what you did and where you are going.*opinion.*asked again/);
    expect(`${last.en} ${last.he}`).not.toMatch(/fluent|fluency|native|perfect|שוטף|מושלם/i);
    expect(day.steps[day.steps.length - 1]!.kind).toBe('summary');
  });
});
