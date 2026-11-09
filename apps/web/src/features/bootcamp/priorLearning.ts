import { coverageOf, hasChunk, plain, type CoverageConcept, type CoverageLang } from './mission01Coverage.js';
import { M01_CONCEPTS } from './mission01Coverage.js';
import { M02_CONCEPTS } from './mission02Coverage.js';
import { M03_CONCEPTS } from './mission03Coverage.js';
import { M04_CONCEPTS } from './mission04Coverage.js';
import { M05_CONCEPTS } from './mission05Coverage.js';
import { M06_CONCEPTS } from './mission06Coverage.js';
import { M07_CONCEPTS } from './mission07Coverage.js';
import { M08_CONCEPTS } from './mission08Coverage.js';
import { M09_CONCEPTS } from './mission09Coverage.js';
import { M11_CONCEPTS } from './mission11Coverage.js';
import { M12_CONCEPTS } from './mission12Coverage.js';
import { M13_CONCEPTS } from './mission13Coverage.js';
import { M14_CONCEPTS } from './mission14Coverage.js';
import { M15_CONCEPTS } from './mission15Coverage.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent } from './types.js';

/**
 * VERIFIED PRIOR LEARNING — what a learner can be assumed to know when a mission starts.
 *
 * The permanent READY rule: SEEN BEFORE ≠ LEARNED BEFORE. A word or chunk counts as already learned
 * only if an earlier mission gave the learner a real chance to understand it — its meaning was SHOWN.
 * Merely appearing in the conversation, as a distractor or wrong option, inside a test, or on the map
 * does not count.
 *
 * Two levels, both built only from verified teaching:
 *   - concepts — the chunks of an earlier mission's conversation that pass its coverage rule
 *     (`coverageOf`: 3+ encounters, 2+ kinds, meaning shown at least once);
 *   - words — the words of every TEACHING encounter of an earlier mission (`teachingEncounters`) and
 *     of its covered concepts. A strict unknown-word audit checks tested text against these.
 *
 * PURE: data + functions over the mission content (no store, no DOM).
 */

/** How a line was taught — each one shows its meaning, and none of them asks the learner anything. */
export type TeachingHow = 'building block' | 'build sentence' | 'key sentence' | 'review card' | 'listening drill' | 'meaning match' | 'teaching round';
export interface TeachingEncounter { step: number; text: string; how: TeachingHow }

/**
 * Every line a mission TEACHES, in order. What is deliberately NOT here:
 *   - the conversation (dialogue lines and choices) — context, not teaching;
 *   - anything a test shows: board rounds with 2+ tiles, map rounds and labels, Quick Reply prompts
 *     and options, builders, swaps, question ↔ answer matches, quizzes, ambushes, customize rounds;
 *   - distractors and wrong options of any kind.
 */
export function teachingEncounters(day: BootcampDayContent): TeachingEncounter[] {
  const out: TeachingEncounter[] = [];
  const text = (id: string | undefined): string => day.items.find((i) => i.id === id)?.text ?? '';
  day.steps.forEach((s, at) => {
    const add = (t: string, how: TeachingHow): void => { if (t) out.push({ step: at, text: t, how }); };
    // A transfer check (Flex Round) is never teaching: nothing it puts together becomes "learned".
    if ('transferOnly' in s && s.transferOnly) return;
    if (s.kind === 'prime') { s.words.forEach((w) => add(w.text, 'building block')); if (s.buildFromItemId) add(text(s.buildFromItemId), 'build sentence'); }
    else if (s.kind === 'tool') add(text(s.itemId), 'key sentence');
    else if (s.kind === 'swipe') s.itemIds.forEach((id) => add(text(id), 'review card'));
    else if (s.kind === 'replies') s.replyIds.forEach((id) => add(text(id), 'listening drill')); // the answer card shows the meaning
    else if (s.kind === 'matchPairs') s.pairs.forEach((p) => { if (p.answerLabel) add(text(p.promptItemId), 'meaning match'); });
    else if (s.kind === 'visualMatch') s.rounds.forEach((r) => { if (r.show?.length === 1) add(r.audio.en, 'teaching round'); });
  });
  return out;
}

/** The coverage concepts of each mission that has its own coverage specification (by mission number). */
export const MISSION_CONCEPTS: Readonly<Record<number, readonly CoverageConcept[]>> = { 1: M01_CONCEPTS, 2: M02_CONCEPTS, 3: M03_CONCEPTS, 4: M04_CONCEPTS, 5: M05_CONCEPTS, 6: M06_CONCEPTS, 7: M07_CONCEPTS, 8: M08_CONCEPTS, 9: M09_CONCEPTS, 11: M11_CONCEPTS, 12: M12_CONCEPTS, 13: M13_CONCEPTS, 14: M14_CONCEPTS, 15: M15_CONCEPTS };

/** A mission's runtime content, by its number on the journey (1-based). */
export const missionContent = (lang: CoverageLang, n: number): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;

/** The words of a text, as the audits compare them (case, punctuation and apostrophe style ignored). */
export const auditWords = (s: string): string[] => plain(s).trim().split(' ').filter(Boolean);

/* ── Word senses: SAME FORM ≠ SAME MEANING ───────────────────────────────────────────────────────── */

/**
 * A surface form that means different things in different lines. Each sense is recognised by the
 * context it appears in (a cue chunk of the same line), the way the learner tells them apart. A line
 * that matches no cue — or the cues of two senses — leaves the form UNRESOLVED (`#?`): it then never
 * counts as prior learning and is never satisfied by it.
 */
export interface WordSense { sense: string; cues: readonly string[] }
export type SenseRegistry = Readonly<Partial<Record<CoverageLang, Readonly<Record<string, readonly WordSense[]>>>>>;

/** The polysemous forms the curriculum actually uses, per language (checked against every mission's text by test). */
export const WORD_SENSES: SenseRegistry = {
  fr: {
    // Mission 11 "la cuisine ici est excellente" (food) ≠ Mission 13 "dans la cuisine" (the room).
    cuisine: [
      { sense: 'food', cues: ['la cuisine ici', 'essayer la cuisine'] },
      { sense: 'kitchen', cues: ['dans la cuisine', 'avec la cuisine', 'préviens la cuisine'] },
    ],
  },
};

/** The sense `word` has in `text` (a registered form only): its sense id, or `?` when the line does not decide it. */
export function senseOf(text: string, word: string, lang: CoverageLang, senses: SenseRegistry = WORD_SENSES): string | undefined {
  const known = senses[lang]?.[word];
  if (!known) return undefined;
  const hits = known.filter((k) => k.cues.some((c) => hasChunk(text, c)));
  return hits.length === 1 ? hits[0]!.sense : '?';
}

/**
 * The words of a text with their meaning: `auditWords`, except that a registered polysemous form
 * becomes `form#sense` (`cuisine#food`, `cuisine#kitchen`, `cuisine#?`). Without a language, forms stay
 * bare — and a bare form never matches the tagged prior words, so the audit stays strict.
 */
export function senseWords(text: string, lang?: CoverageLang, senses: SenseRegistry = WORD_SENSES): string[] {
  return auditWords(text).map((w) => { const s = lang ? senseOf(text, w, lang, senses) : undefined; return s ? `${w}#${s}` : w; });
}

/** Whether every registered form in `chunk` has, in `line`, the same RESOLVED sense. */
const sameSenses = (line: string, chunk: string, lang: CoverageLang, senses: SenseRegistry): boolean =>
  auditWords(chunk).every((w) => { const s = senseOf(chunk, w, lang, senses); return s === undefined || (s !== '?' && senseOf(line, w, lang, senses) === s); });

export interface PriorLearning {
  /** The missions this was built from (1 … n-1). */
  missions: number[];
  /** Covered concepts of earlier missions: `m01:hello`, … — with the chunk as worded in this language. */
  concepts: { id: string; mission: number; chunk: string }[];
  /** Every word met with its meaning in an earlier mission (polysemous forms as `form#sense`, see `senseWords`). */
  words: ReadonlySet<string>;
  /** Whether a chunk was taught (or is a covered concept) in an earlier mission — with the same meaning. */
  knowsChunk: (chunk: string) => boolean;
}

/**
 * What the learner verifiably learned BEFORE mission `n` (Missions 1 … n-1), in `lang`. A mission
 * without a coverage specification still contributes its teaching encounters (never its conversation).
 */
export function learnedBefore(lang: CoverageLang, n: number, content: (lang: CoverageLang, n: number) => BootcampDayContent = missionContent, senses: SenseRegistry = WORD_SENSES): PriorLearning {
  const missions = Array.from({ length: Math.max(0, n - 1) }, (_, i) => i + 1);
  const concepts: PriorLearning['concepts'] = [];
  const taughtLines: string[] = [];
  for (const m of missions) {
    const day = content(lang, m);
    taughtLines.push(...teachingEncounters(day).map((e) => e.text));
    const spec = MISSION_CONCEPTS[m];
    if (spec) for (const row of coverageOf(day, lang, spec)) if (row.covered) concepts.push({ id: `m${String(m).padStart(2, '0')}:${row.id}`, mission: m, chunk: spec.find((c) => c.id === row.id)!.chunk[lang] });
  }
  // An unresolved sense (`#?`) is never learned: the learner was not shown WHICH meaning it had.
  const words = new Set<string>([...taughtLines, ...concepts.map((c) => c.chunk)].flatMap((t) => senseWords(t, lang, senses)).filter((w) => !w.endsWith('#?')));
  const knows = (line: string, chunk: string): boolean => hasChunk(line, chunk) && sameSenses(line, chunk, lang, senses);
  return {
    missions,
    concepts,
    words,
    knowsChunk: (chunk) => concepts.some((c) => knows(c.chunk, chunk)) || taughtLines.some((t) => knows(t, chunk)),
  };
}

/* ── The strict in-order audit (reusable by every mission's test) ───────────────────────────────── */

export interface AuditEvent { at: number; text: string; where: string }

/**
 * Walk a mission in order. TAUGHT = met with its meaning: the teaching encounters above, plus — inside
 * the mission itself — its own conversation, which is shown with its translation. TESTED = everything
 * that asks: picture / map boards with 2+ choices and every map label, question ↔ answer matches,
 * builders, swaps (every ending offered), Quick Reply prompts AND options, quizzes, ambushes, customize
 * rounds. A test prepares nothing.
 */
export function missionWalk(day: BootcampDayContent): { taught: AuditEvent[]; tested: AuditEvent[] } {
  const text = (id: string | undefined): string => day.items.find((i) => i.id === id)?.text ?? '';
  const taught: AuditEvent[] = teachingEncounters(day).map((e) => ({ at: e.step, text: e.text, where: `step ${e.step + 1} ${day.steps[e.step]!.kind}` }));
  const tested: AuditEvent[] = [];
  day.steps.forEach((s, at) => {
    const where = `step ${at + 1} ${s.kind}`;
    const teach = (t: string): void => { if (t) taught.push({ at, text: t, where }); };
    const test = (t: string): void => { if (t) tested.push({ at, text: t, where }); };
    if (s.kind === 'dialogue') day.dialogues[s.dialogueId]!.nodes.forEach((n) => { teach(n.en); n.choices?.forEach((c) => teach(c.en)); });
    else if (s.kind === 'matchPairs') s.pairs.forEach((p) => { if (!p.answerLabel) { test(text(p.promptItemId)); test(p.answerText ?? text(p.answerItemId)); } });
    else if (s.kind === 'visualMatch') s.rounds.forEach((r) => { if (r.show?.length !== 1) test(r.audio.en); });
    else if (s.kind === 'miniMap') s.rounds.forEach((r) => { test(r.audio.en); r.cells.forEach((c) => test(c.label ?? '')); });
    else if (s.kind === 'customize') s.rounds.forEach((r) => test(r.audio.en));
    else if (s.kind === 'sentenceBuilder') s.rounds.forEach((r) => test(r.chunks.join(' ')));
    else if (s.kind === 'swap') s.rounds.forEach((r) => r.options.forEach((o) => test(fillFrame(r.frame, o.slot))));
    else if (s.kind === 'quickReply') s.rounds.forEach((r) => { test(r.npc?.en ?? text(r.promptItemId)); r.options.forEach((o) => test(o.text ?? text(o.itemId))); });
    else if (s.kind === 'quiz') test(text(s.itemId));
    else if (s.kind === 'ambush') test(s.npc.en);
  });
  taught.sort((a, b) => a.at - b.at);
  return { taught, tested };
}

/**
 * Tested words that were neither taught earlier in this mission nor verifiably learned before it. With
 * `lang`, a polysemous form must also MEAN the same: "cuisine" (kitchen) is not prepared by "cuisine"
 * (food). Reported as “form” or, for a polysemous form, “form (sense)”.
 */
export function unpreparedWords(day: BootcampDayContent, prior: ReadonlySet<string>, lang?: CoverageLang, senses: SenseRegistry = WORD_SENSES): string[] {
  const { taught, tested } = missionWalk(day);
  const show = (w: string): string => (w.includes('#') ? `“${w.split('#')[0]!}” (${w.split('#')[1] === '?' ? 'unresolved sense' : w.split('#')[1]!})` : `“${w}”`);
  return tested.flatMap((t) => senseWords(t.text, lang, senses).filter((w) => !w.endsWith('#?') ? !prior.has(w) && !taught.some((e) => e.at < t.at && senseWords(e.text, lang, senses).includes(w)) : true).map((w) => `${t.where}: ${show(w)} in “${t.text}”`));
}

/** Tested lines carrying a chunk of THIS mission's conversation that the mission had not taught first. */
export function unpreparedChunks(day: BootcampDayContent, lang: CoverageLang, concepts: readonly CoverageConcept[]): string[] {
  const { taught, tested } = missionWalk(day);
  return tested.flatMap((t) => concepts.filter((c) => hasChunk(t.text, c.chunk[lang]) && !taught.some((e) => e.at < t.at && hasChunk(e.text, c.chunk[lang]))).map((c) => `${t.where}: ${c.id} in “${t.text}”`));
}
