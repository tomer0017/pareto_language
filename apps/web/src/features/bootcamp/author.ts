import type { LocalizedText } from '@ready/content-schema';
import { missionNumber } from './plan.js';
import { RECOVERY_ITEMS } from './recovery.js';
import { RECOVERY_ITEMS_FR } from './fr/recovery.js';
import { RECOVERY_ITEMS_ES } from './es/recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem, BootcampStep, DialogueChoice, DialogueNodeB, MapCell, MatchTile, SpokenLine } from './types.js';

/**
 * Multilingual mission authoring (Core 30). A mission is written ONCE as a `MissionSpec` — every
 * line carries its English, French, Spanish and Hebrew wording side by side — and `buildMission`
 * turns it into the ordinary `BootcampDayContent` each language registers. Because all languages are
 * generated from the same list of turns, a language can never silently lose a line: the turn
 * structure is identical by construction, not by review.
 *
 * PURE data + pure functions (no store, no React). The output is the same content model every
 * hand-written mission uses, so the player, transcript, Listen and the sentence catalog are unaware
 * of how a mission was authored.
 */

export const MISSION_LANGS = ['en', 'fr', 'es'] as const;
export type MissionLang = (typeof MISSION_LANGS)[number];
const LANG_INDEX: Record<MissionLang, 0 | 1 | 2> = { en: 0, fr: 1, es: 2 };

/** One line in every language: [English, French, Spanish, Hebrew]. */
export type L4 = readonly [en: string, fr: string, es: string, he: string];
/** Interface copy (never spoken): [Hebrew, English]. */
export type Copy = readonly [he: string, en: string];

export type RecoveryTool = 'dont-understand' | 'repeat' | 'slowly' | 'show-me' | 'one-moment' | 'what-mean' | 'thank-you';

/** A sentence the mission trains. `id` has no language prefix (`phrase.core.i-need`). */
export interface SpecItem {
  id: string;
  t: L4;
  tip?: Copy;
}

export interface NpcLine {
  who: 'npc';
  t: L4;
  fast?: boolean;
  slow?: boolean;
}

export interface YouLine {
  who: 'you';
  /** The sentence this turn trains. */
  item: SpecItem;
  /** What is actually said, when the turn wraps the sentence ("Yes! What time?"). */
  say?: L4;
  /** Other equally good answers (same reaction from the NPC). */
  alts?: SpecItem[];
  /** A conversation-help tool offered at this turn: the NPC repeats slowly, then the turn is asked again. */
  rec?: { tool: RecoveryTool; npc: L4 };
  /** Checkpoints: plausible lines that do NOT fit here (they belong to another moment). Picking one
   *  is a miss; the other speaker asks again and the same decision is offered again. */
  wrong?: SpecItem[];
}

export type SpecLine = NpcLine | YouLine;

/** Target-language text only: [English, French, Spanish]. */
export type L3 = readonly [en: string, fr: string, es: string];

export interface AmbushSpec {
  /** What the challenge tests — see the `ambush` step. Absent = the original behaviour. */
  mode?: 'recovery' | 'speed';
  npc: L4;
  /** Ids of two trained "you will hear" items: the one that matches, and a distractor. */
  correct: string;
  wrong: string;
  receipt: Copy;
}

export interface SceneSpec {
  id: string;
  /** No translation of the other speaker's lines before the learner answers. */
  cold?: boolean;
  lines: SpecLine[];
  receipt: Copy;
  /** Checkpoints only: a cold ambush right after this scene. */
  ambush?: AmbushSpec;
}

export interface PrimeSpec {
  intro: Copy;
  words: { key?: string; t: L3; meaning: Copy; emoji?: string; review?: boolean }[];
  /** The sentence the words assemble into — only when they genuinely build one. */
  build?: string;
}

/* Active-practice steps, written once for every language (see the engines in practiceEngines.ts). */
export interface QuickReplySpec {
  label?: Copy;
  /** A final speed challenge: the lines are spoken fast. */
  challenge?: boolean;
  rounds: {
    /** id of a "you will hear" sentence of the mission, or… */
    prompt?: string;
    /** …a line of its own, or… */
    npc?: L4;
    /** …a situation described in the app language (nothing is played). */
    situation?: Copy;
    /** [sentence id, accepted?, what the button says when it wraps the sentence] */
    options: readonly (readonly [id: string, correct: boolean, text?: L3])[];
  }[];
}
export interface VisualMatchSpec {
  label?: Copy;
  challenge?: boolean;
  tiles: MatchTile[];
  rounds: { audio: L4; correct: string; itemId?: string }[];
}
export interface SwapSpec {
  label?: Copy;
  rounds: {
    frame: L3;
    itemId?: string;
    cue: { emoji?: string; text: Copy };
    /** [slot value, Hebrew gloss of the completed sentence, matches the cue?] */
    options: readonly (readonly [slot: L3, he: string, correct: boolean])[];
  }[];
}
export interface MiniMapSpec {
  label?: Copy;
  challenge?: boolean;
  rounds: { audio: L4; itemId?: string; correct: string; cells: (Omit<MapCell, 'label'> & { label?: L3 })[] }[];
}
export interface MatchPairsSpec {
  label?: Copy;
  /** [heard sentence id, answer sentence id, what the answer tile says when it wraps the sentence,
   *   a language-neutral answer tile (number / icon) instead of text] */
  pairs: readonly (readonly [prompt: string, answer: string, answerText?: L3, answerLabel?: string, answerGloss?: Copy])[];
}
export interface SentenceBuilderSpec {
  label?: Copy;
  /** Chunks are written out for EACH language, in that language's own order — never derived. */
  rounds: { itemId: string; chunks: readonly [en: readonly string[], fr: readonly string[], es: readonly string[]] }[];
}
export type PracticeSpec =
  | ({ kind: 'matchPairs' } & MatchPairsSpec)
  | ({ kind: 'sentenceBuilder' } & SentenceBuilderSpec)
  | ({ kind: 'quickReply' } & QuickReplySpec)
  | ({ kind: 'visualMatch' } & VisualMatchSpec)
  | ({ kind: 'swap' } & SwapSpec)
  | ({ kind: 'miniMap' } & MiniMapSpec);

/** The teaching section of a content mission. A checkpoint has none — it only proves. */
export interface TeachSpec {
  prime?: PrimeSpec;
  tools: { id: string; label: Copy }[];
  /** Expected-reply drill: after saying `said`, these are the answers the learner may hear. */
  said: string;
  replies: string[];
  repliesReceipt: Copy;
  /** A hear-and-pick-the-meaning question. Optional: leave it out where active practice covers it. */
  quiz?: readonly [answer: string, wrong1: string, wrong2: string];
  /** Active practice between the listening drill and the dialogue. */
  practice?: PracticeSpec[];
  /** Sentences shown in the closing review, in order. Default: every sentence of the mission. */
  review?: string[];
  /** The final challenge as a two-button cold open… */
  ambush?: AmbushSpec;
  /** …or as one or more practice steps (a speed chain), each followed by its proof card. When both
   *  are given the practice steps come first. */
  finale?: { practice: PracticeSpec; receipt: Copy }[];
}

export interface MissionSpec {
  day: number;
  title: Copy;
  icon: string;
  intro: Copy[];
  cta: Copy;
  scenes: SceneSpec[];
  /** Sentences the learner will HEAR (expected replies). */
  hear: SpecItem[];
  /** Trained sentences that are not a turn in a scene (swap-in variants). */
  extra?: SpecItem[];
  teach?: TeachSpec;
  /** Checkpoints: the closing proof. */
  closing?: Copy;
  /** Show "Mission N:" on the opening card. Default: only missions that teach (not checkpoints). */
  numbered?: boolean;
}

/* ── spec helpers ──────────────────────────────────────────────────────────────────────────────── */

export const item = (id: string, en: string, fr: string, es: string, he: string, tip?: Copy): SpecItem =>
  ({ id, t: [en, fr, es, he], ...(tip ? { tip } : {}) });

export const npc = (en: string, fr: string, es: string, he: string, pace?: 'fast' | 'slow'): NpcLine =>
  ({ who: 'npc', t: [en, fr, es, he], ...(pace === 'fast' ? { fast: true } : {}), ...(pace === 'slow' ? { slow: true } : {}) });

export const you = (it: SpecItem, opts: Omit<YouLine, 'who' | 'item'> = {}): YouLine => ({ who: 'you', item: it, ...opts });

const KITS = [RECOVERY_ITEMS, RECOVERY_ITEMS_FR, RECOVERY_ITEMS_ES] as const;

/** A sentence that already exists in hand-written missions — same id, same wording, in every
 *  language (so a checkpoint reuses a sentence instead of redefining it). */
export function fromItems(id: string, en: BootcampItem[], fr: BootcampItem[], es: BootcampItem[]): SpecItem {
  const find = (items: BootcampItem[], lang: MissionLang): BootcampItem => {
    const hit = items.find((i) => i.id === `${lang}.${id}`);
    if (!hit) throw new Error(`[author] no "${lang}.${id}" in the given items`);
    return hit;
  };
  const e = find(en, 'en');
  return { id, t: [e.text, find(fr, 'fr').text, find(es, 'es').text, e.meaning.he ?? ''], ...(e.tip ? { tip: [e.tip.he ?? '', e.tip.en ?? ''] as const } : {}) };
}

/** A conversation-help tool from the shared kit. */
export const tool = (name: RecoveryTool): SpecItem => fromItems(`phrase.recovery.${name}`, KITS[0], KITS[1], KITS[2]);

/** A sentence another spec already defines (cross-mission reuse without retyping). */
export function itemOf(spec: MissionSpec, id: string): SpecItem {
  const hit = specItems(spec).find((i) => i.id === id);
  if (!hit) throw new Error(`[author] "${id}" is not a sentence of mission day ${spec.day}`);
  return hit;
}

/** Every sentence a spec trains, deduped, in teaching order: said → variants → heard → tools. */
export function specItems(spec: MissionSpec): SpecItem[] {
  const said: SpecItem[] = [];
  const tools: SpecItem[] = [];
  for (const scene of spec.scenes) {
    for (const line of scene.lines) {
      if (line.who !== 'you') continue;
      said.push(line.item, ...(line.alts ?? []), ...(line.wrong ?? []));
      if (line.rec) tools.push(tool(line.rec.tool));
    }
  }
  const isTool = (i: SpecItem): boolean => i.id.startsWith('phrase.recovery.');
  const ordered = [...said.filter((i) => !isTool(i)), ...(spec.extra ?? []), ...spec.hear, ...said.filter(isTool), ...tools];
  const seen = new Set<string>();
  return ordered.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

/* ── build ─────────────────────────────────────────────────────────────────────────────────────── */

const T = (c: Copy): LocalizedText => ({ he: c[0], en: c[1] });

/** The spoken text + glosses of one line, as the dialogue model stores them. */
function spoken(t: L4, lang: MissionLang): { en: string; he: string; tr?: LocalizedText } {
  const text = t[LANG_INDEX[lang]];
  if (lang === 'en') return { en: text, he: t[3] };
  if (text === t[0]) throw new Error(`[author] ${lang} line equals its English gloss: "${text}"`);
  return { en: text, he: t[3], tr: { en: t[0], he: t[3] } };
}

function toItem(it: SpecItem, lang: MissionLang): BootcampItem {
  return {
    id: `${lang}.${it.id}`,
    text: it.t[LANG_INDEX[lang]],
    meaning: { he: it.t[3], en: it.t[0] },
    ...(it.tip ? { tip: T(it.tip) } : {}),
  };
}

function buildDialogue(scene: SceneSpec, lang: MissionLang): BootcampDialogue {
  const ids = scene.lines.map((l, i) => `${l.who === 'npc' ? 'n' : 'c'}${i + 1}`);
  const nodes: DialogueNodeB[] = [];
  scene.lines.forEach((line, i) => {
    const id = ids[i]!;
    const next = ids[i + 1];
    if (line.who === 'npc') {
      const pace = { ...(line.fast ? { fast: true } : {}), ...(line.slow ? { slow: true } : {}) };
      nodes.push(next ? { id, who: 'npc', next, ...pace, ...spoken(line.t, lang) } : { id, who: 'npc', end: true, ...pace, ...spoken(line.t, lang) });
      return;
    }
    if (!next) throw new Error(`[author] scene "${scene.id}" must end on an NPC line`);
    const choice = (t: L4, itemId: string, to: string, correct = true): DialogueChoice => ({ ...spoken(t, lang), itemId: `${lang}.${itemId}`, correct, next: to });
    const direct = [line.item, ...(line.alts ?? [])].map((it, k) => choice(k === 0 && line.say ? line.say : it.t, it.id, next));
    if (line.wrong?.length) {
      // A real decision. A miss gets its own beat — the other speaker asks again, slowly (never
      // carrying on as if the answer had fitted) — and then the SAME choice is offered again: no
      // dead-end screen with one button.
      const asked = scene.lines[i - 1];
      if (!asked || asked.who !== 'npc') throw new Error(`[author] scene "${scene.id}": a turn with wrong options must follow an NPC line`);
      const askAgain = `m${i + 1}`;
      const misses = line.wrong.map((it) => choice(it.t, it.id, askAgain, false));
      const reask: DialogueNodeB = { id: askAgain, who: 'npc', slow: true, next: id, ...spoken(asked.t, lang) };
      if (!line.rec) {
        nodes.push({ id, who: 'you', en: '', he: '', choices: [...direct, ...misses] }, reask);
        return;
      }
      const helpTool = tool(line.rec.tool);
      const again = `r${i + 1}`;
      nodes.push({ id, who: 'you', en: '', he: '', choices: [...direct, ...misses, choice(helpTool.t, helpTool.id, again)] }, reask);
      nodes.push({ id: again, who: 'npc', slow: true, next: id, ...spoken(line.rec.npc, lang) });
      return;
    }
    if (!line.rec) {
      nodes.push({ id, who: 'you', en: '', he: '', choices: direct });
      return;
    }
    const help = tool(line.rec.tool);
    const repeat = `r${i + 1}`;
    const again = `${id}b`;
    nodes.push({ id, who: 'you', en: '', he: '', choices: [...direct, choice(help.t, help.id, repeat)] });
    nodes.push({ id: repeat, who: 'npc', slow: true, next: again, ...spoken(line.rec.npc, lang) });
    nodes.push({ id: again, who: 'you', en: '', he: '', choices: direct });
  });
  return { id: scene.id, start: ids[0]!, ...(scene.cold ? { cold: true } : {}), nodes };
}

/** A line the app speaks, with its glosses. */
export const spokenLine = (t: L4, lang: MissionLang): SpokenLine => spoken(t, lang);

/** One active-practice step in one language. */
export function buildPractice(p: PracticeSpec, lang: MissionLang): BootcampStep {
  const ix = LANG_INDEX[lang];
  const id = (suffix: string): string => `${lang}.${suffix}`;
  const label = p.label ? { label: T(p.label) } : {};
  if (p.kind === 'matchPairs') {
    return { kind: 'matchPairs', ...label, pairs: p.pairs.map(([prompt, answer, text, icon, gloss]) => ({ promptItemId: id(prompt), answerItemId: id(answer), ...(text ? { answerText: text[ix] } : {}), ...(icon ? { answerLabel: icon } : {}), ...(gloss ? { answerGloss: T(gloss) } : {}) })) };
  }
  if (p.kind === 'sentenceBuilder') {
    return { kind: 'sentenceBuilder', ...label, rounds: p.rounds.map((r) => ({ itemId: id(r.itemId), chunks: [...r.chunks[ix]] })) };
  }
  if (p.kind === 'quickReply') {
    return {
      kind: 'quickReply', ...label, ...(p.challenge ? { challenge: true } : {}),
      rounds: p.rounds.map((r) => ({
        ...(r.prompt ? { promptItemId: id(r.prompt) } : {}),
        ...(r.npc ? { npc: spoken(r.npc, lang) } : {}),
        ...(r.situation ? { situation: T(r.situation) } : {}),
        options: r.options.map(([itemId, correct, text]) => ({ itemId: id(itemId), correct, ...(text ? { text: text[ix] } : {}) })),
      })),
    };
  }
  if (p.kind === 'visualMatch') {
    return {
      kind: 'visualMatch', ...label, ...(p.challenge ? { challenge: true } : {}), tiles: p.tiles,
      rounds: p.rounds.map((r) => ({ audio: spoken(r.audio, lang), correct: r.correct, ...(r.itemId ? { itemId: id(r.itemId) } : {}) })),
    };
  }
  if (p.kind === 'swap') {
    return {
      kind: 'swap', ...label,
      rounds: p.rounds.map((r) => ({
        frame: r.frame[ix], ...(r.itemId ? { itemId: id(r.itemId) } : {}),
        cue: { ...(r.cue.emoji ? { emoji: r.cue.emoji } : {}), text: T(r.cue.text) },
        options: r.options.map(([slot, he, correct]) => ({ slot: slot[ix], meaning: { he, en: r.frame[0].replace('___', slot[0]) }, correct })),
      })),
    };
  }
  return {
    kind: 'miniMap', ...label, ...(p.challenge ? { challenge: true } : {}),
    rounds: p.rounds.map((r) => ({
      audio: spoken(r.audio, lang), correct: r.correct, ...(r.itemId ? { itemId: id(r.itemId) } : {}),
      cells: r.cells.map(({ label: l, ...cell }) => ({ ...cell, ...(l ? { label: l[ix] } : {}) })),
    })),
  };
}

/** A "Before we speak" step in one language. */
export function buildPrime(prime: PrimeSpec, lang: MissionLang): BootcampStep {
  return {
    kind: 'prime',
    label: { he: 'לפני שנדבר', en: 'Before we speak' },
    intro: T(prime.intro),
    words: prime.words.map((w) => ({
      ...(w.key ? { key: w.key } : {}),
      text: w.t[LANG_INDEX[lang]],
      meaning: T(w.meaning),
      ...(w.emoji ? { emoji: w.emoji } : {}),
      ...(w.review ? { review: true } : {}),
    })),
    ...(prime.build ? { buildFromItemId: `${lang}.${prime.build}` } : {}),
  };
}

function ambushStep(a: AmbushSpec, lang: MissionLang): BootcampStep[] {
  return [
    { kind: 'ambush', ...(a.mode ? { mode: a.mode } : {}), npc: spoken(a.npc, lang), correctItemId: `${lang}.${a.correct}`, wrongItemId: `${lang}.${a.wrong}` },
    { kind: 'receipt', text: T(a.receipt) },
  ];
}

export function buildMission(spec: MissionSpec, lang: MissionLang): BootcampDayContent {
  const items = specItems(spec).map((i) => toItem(i, lang));
  const id = (suffix: string): string => `${lang}.${suffix}`;
  const number = missionNumber(spec.day);
  const numbered = (spec.numbered ?? spec.teach !== undefined) && number !== null;
  const talk: BootcampStep = {
    kind: 'talk',
    icon: spec.icon,
    title: numbered ? { he: `משימה ${number}: ${spec.title[0]}`, en: `Mission ${number}: ${spec.title[1]}` } : T(spec.title),
    body: spec.intro.map(T),
    cta: T(spec.cta),
  };

  const steps: BootcampStep[] = [talk];
  const teach = spec.teach;
  if (teach) {
    if (teach.prime) steps.push(buildPrime(teach.prime, lang));
    teach.tools.forEach((t, i) => steps.push({ kind: 'tool', itemId: id(t.id), index: i + 1, total: teach.tools.length, label: T(t.label) }));
    steps.push({ kind: 'replies', saidItemId: id(teach.said), replyIds: teach.replies.map(id) });
    steps.push({ kind: 'receipt', text: T(teach.repliesReceipt) });
    if (teach.quiz) steps.push({ kind: 'quiz', itemId: id(teach.quiz[0]), wrongIds: [id(teach.quiz[1]), id(teach.quiz[2])] });
    for (const p of teach.practice ?? []) steps.push(buildPractice(p, lang));
  }
  for (const scene of spec.scenes) {
    steps.push({ kind: 'dialogue', dialogueId: scene.id });
    steps.push({ kind: 'receipt', text: T(scene.receipt) });
    if (scene.ambush) steps.push(...ambushStep(scene.ambush, lang));
  }
  if (teach) {
    steps.push({ kind: 'swipe', itemIds: teach.review ? teach.review.map(id) : items.map((i) => i.id) });
    for (const f of teach.finale ?? []) steps.push(buildPractice(f.practice, lang), { kind: 'receipt', text: T(f.receipt) });
    if (teach.ambush) steps.push(...ambushStep(teach.ambush, lang));
  }
  if (spec.closing) steps.push({ kind: 'receipt', text: T(spec.closing) });
  steps.push({ kind: 'summary' });

  return {
    day: spec.day,
    title: T(spec.title),
    items,
    dialogues: Object.fromEntries(spec.scenes.map((s) => [s.id, buildDialogue(s, lang)])),
    steps,
  };
}
