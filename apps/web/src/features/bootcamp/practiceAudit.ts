import { videoPublicPath } from '../videos/videoConvention.js';
import { UI_DICTIONARIES } from '../../shared/i18n/strings.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { BOOTCAMP_PLAN, PHASES, type MissionPlan } from './plan.js';
import { fillFrame, quickReplyLabel, quickReplyPrompt, tappableCells } from './practiceEngines.js';
import { RECOVERY_ITEMS } from './recovery.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem, BootcampStep, DialogueNodeB } from './types.js';

/**
 * Practice audit export — a READ-ONLY rendering of everything the learner meets in the Core 30:
 * intro copy, the exact step sequence, every sentence, every question with its answer choices, the
 * full dialogue trees (all branches), cold opens, sentence review, plus mechanical auto-flags and
 * cross-mission matrices. It exists so the Practice can be audited by someone who cannot read the
 * source. PURE and deterministic (no dates, no randomness): `docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md`
 * must equal `renderPracticeAudit()`, and a test fails when it does not.
 *
 * Nothing here feeds the app. It only reads the registry, the plan and the UI dictionary.
 */

const LANGS = ['en', 'fr', 'es'] as const;
type Lang = (typeof LANGS)[number];
const LANG_NAME: Record<Lang, string> = { en: 'EN', fr: 'FR', es: 'ES' };

/** Where each mission's runtime content is written. Spec missions are authored once for all languages. */
export const SPEC_SOURCE: Record<number, string> = {
  9: 'core/checkpoints.ts (ARRIVAL_DAY)', 17: 'core/checkpoints.ts (EVERYDAY_DAY)', 23: 'core/checkpoints.ts (CITY_CONVERSATION)',
  27: 'core/checkpoints.ts (NO_SUBTITLES)', 28: 'core/checkpoints.ts (DRESS_REHEARSAL)', 29: 'core/checkpoints.ts (COMPLETE_DAY)',
  22: 'core/smallTalk.ts', 24: 'core/fixingProblems.ts', 26: 'core/emergency.ts',
  30: 'core/everydayCore.ts', 31: 'core/timePlans.ts', 32: 'core/homeFamily.ts', 33: 'core/hobbies.ts',
  34: 'core/pastEvents.ts', 35: 'core/futurePlans.ts', 36: 'core/opinions.ts', 37: 'core/lostStolen.ts',
};
const DIR = 'apps/web/src/features/bootcamp/';

const HELP_TOOLS = ['dont-understand', 'repeat', 'slowly', 'one-moment', 'show-me', 'what-mean'];
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const isKit = (suffix: string): boolean => suffix.startsWith('phrase.recovery.');
const isHelp = (suffix: string): boolean => HELP_TOOLS.some((t) => suffix === `phrase.recovery.${t}`);
const isProduction = (suffix: string): boolean => suffix.startsWith('phrase.') && !isKit(suffix);
const isReply = (suffix: string): boolean => suffix.startsWith('reply.');
const role = (suffix: string): string =>
  isHelp(suffix) ? 'conversation-help tool (global Recovery Toolkit)' : isKit(suffix) ? 'courtesy from the Recovery Toolkit' : isReply(suffix) ? 'receptive — an expected reply the learner hears' : 'learner production';
const norm = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
const words = (s: string): string[] => norm(s).split(' ').filter(Boolean);
const pad = (n: number): string => String(n).padStart(2, '0');
const ui = (key: string): string => `"${(UI_DICTIONARIES.en as Record<string, string>)[key] ?? key}" / "${(UI_DICTIONARIES.he as Record<string, string>)[key] ?? key}"`;
const q = (s: string | undefined): string => (s && s.trim() ? `"${s}"` : '—');

const content = (lang: Lang, day: number): BootcampDayContent => MISSIONS_BY_LANG[lang]![day]!;
const numberOf = (day: number): number => BOOTCAMP_PLAN.findIndex((m) => m.day === day) + 1;

/** One sentence in every language, keyed by its language-free id. */
interface Sentence { id: string; en: string; fr: string; es: string; he: string; tipHe?: string; tipEn?: string }

function sentencesOf(day: number): Sentence[] {
  const by = (lang: Lang): Map<string, BootcampItem> => new Map(content(lang, day).items.map((i) => [strip(i.id), i]));
  const fr = by('fr');
  const es = by('es');
  return content('en', day).items.map((i) => {
    const id = strip(i.id);
    return { id, en: i.text, fr: fr.get(id)?.text ?? '∅ MISSING', es: es.get(id)?.text ?? '∅ MISSING', he: i.meaning.he ?? '', ...(i.tip ? { tipHe: i.tip.he ?? '', tipEn: i.tip.en ?? '' } : {}) };
  });
}

/** Mission numbers (journey order) in which each sentence id is an item. */
function usage(): Map<string, number[]> {
  const map = new Map<string, number[]>();
  BOOTCAMP_PLAN.forEach((m, i) => {
    for (const it of content('en', m.day).items) map.set(strip(it.id), [...(map.get(strip(it.id)) ?? []), i + 1]);
  });
  return map;
}

/* ── questions ─────────────────────────────────────────────────────────────────────────────────── */

type QuestionKind = 'expected-reply' | 'meaning-quiz' | 'quick-reply' | 'visual-match' | 'swap-it' | 'mini-map' | 'match-pairs' | 'sentence-builder' | 'dialogue-choice' | 'cold-open';
const LISTEN_KINDS: readonly QuestionKind[] = ['expected-reply', 'meaning-quiz'];
const ACTIVE_KINDS: readonly QuestionKind[] = ['quick-reply', 'visual-match', 'swap-it', 'mini-map', 'match-pairs', 'sentence-builder'];
interface Choice { en: string; fr: string; es: string; he: string; itemId: string; correct: boolean; routesTo?: string }
interface Question {
  ref: string;            // M01-Q03
  kind: QuestionKind;
  step: number;           // 1-based step position
  where: string;          // scene / node, or sub-question index
  promptUi: string;       // the on-screen instruction
  audio: Record<Lang, string>;
  audioHe: string;
  choices: Choice[];
  choiceDisplay: string;  // what the buttons show
  tests: string;          // sentence id(s)
  explanation: string;
}

const nodeText = (day: number, sceneId: string, nodeId: string): Record<Lang, string> & { he: string } => {
  const at = (lang: Lang): string => content(lang, day).dialogues[sceneId]?.nodes.find((n) => n.id === nodeId)?.en ?? '∅ MISSING';
  return { en: at('en'), fr: at('fr'), es: at('es'), he: content('en', day).dialogues[sceneId]!.nodes.find((n) => n.id === nodeId)!.he };
};

/** The NPC line shown above a choice screen: the node that leads here (same rule as the player). */
function promptNodeFor(d: BootcampDialogue, node: DialogueNodeB): DialogueNodeB | undefined {
  return d.nodes.find((n) => n.next === node.id || n.choices?.some((c) => c.next === node.id));
}

function questionsOf(day: number): Question[] {
  const n = numberOf(day);
  const en = content('en', day);
  const sent = new Map(sentencesOf(day).map((s) => [s.id, s]));
  const out: Question[] = [];
  const push = (x: Omit<Question, 'ref'>): void => { out.push({ ...x, ref: `M${pad(n)}-Q${pad(out.length + 1)}` }); };
  const asChoice = (id: string, correct: boolean): Choice => {
    const s = sent.get(id)!;
    return { en: s.en, fr: s.fr, es: s.es, he: s.he, itemId: id, correct };
  };
  en.steps.forEach((step, i) => {
    if (step.kind === 'replies') {
      const ids = step.replyIds.map(strip);
      ids.forEach((id, k) => {
        const s = sent.get(id)!;
        const wrong = ids.filter((x) => x !== id).slice(0, 2);
        push({
          kind: 'expected-reply', step: i + 1, where: `reply ${k + 1} of ${ids.length}`, promptUi: `${ui('whichReply')} (${k + 1}/${ids.length})`,
          audio: { en: s.en, fr: s.fr, es: s.es }, audioHe: s.he, choices: [asChoice(id, true), ...wrong.map((w) => asChoice(w, false))],
          choiceDisplay: 'MEANING in the app language (Hebrew or English UI) — not the target-language text',
          tests: id, explanation: s.tipHe ? `tip: ${s.tipHe} / ${s.tipEn}` : `generic: “${s.en}” means “${s.he}”.`,
        });
      });
    }
    if (step.kind === 'quiz') {
      const id = strip(step.itemId);
      const s = sent.get(id)!;
      push({
        kind: 'meaning-quiz', step: i + 1, where: 'single question', promptUi: ui('whatDidItMean'),
        audio: { en: s.en, fr: s.fr, es: s.es }, audioHe: s.he, choices: [asChoice(id, true), ...step.wrongIds.map((w) => asChoice(strip(w), false))],
        choiceDisplay: 'MEANING in the app language (Hebrew or English UI) — not the target-language text',
        tests: id, explanation: s.tipHe ? `tip: ${s.tipHe} / ${s.tipEn}` : `generic: “${s.en}” means “${s.he}”.`,
      });
    }
    if (step.kind === 'dialogue') {
      const d = en.dialogues[step.dialogueId]!;
      for (const node of d.nodes) {
        if (!node.choices?.length) continue;
        const prompt = promptNodeFor(d, node);
        const pt = prompt ? nodeText(day, d.id, prompt.id) : { en: '(no NPC line — the learner opens)', fr: '(no NPC line — the learner opens)', es: '(no NPC line — the learner opens)', he: '' };
        const choiceAt = (lang: Lang, k: number): string => content(lang, day).dialogues[d.id]?.nodes.find((x) => x.id === node.id)?.choices?.[k]?.en ?? '∅ MISSING';
        push({
          kind: 'dialogue-choice', step: i + 1, where: `scene "${d.id}" · node ${node.id}`, promptUi: ui('yourTurn'),
          audio: { en: pt.en, fr: pt.fr, es: pt.es }, audioHe: pt.he,
          choices: node.choices.map((c, k) => ({ en: c.en, fr: choiceAt('fr', k), es: choiceAt('es', k), he: c.he, itemId: strip(c.itemId), correct: c.correct, routesTo: c.next })),
          choiceDisplay: 'TARGET-LANGUAGE text only (no translation on the buttons); order is fixed as authored — NOT shuffled',
          tests: [...new Set(node.choices.map((c) => strip(c.itemId)).filter(Boolean))].join(', ') || '(no sentence id — not recorded)',
          explanation: 'none per choice; a wrong pick shows the generic line (see "Wrong answer branches")',
        });
      }
    }
    if (step.kind === 'quickReply') {
      step.rounds.forEach((round, k) => {
        const per = (lang: Lang) => {
          const c = content(lang, day);
          const s2 = c.steps[i];
          const r = s2?.kind === 'quickReply' ? s2.rounds[k] : undefined;
          const byId = new Map(c.items.map((x) => [x.id, x]));
          return { prompt: r ? quickReplyPrompt(r, byId).spoken?.en : undefined, labels: r ? r.options.map((o2) => quickReplyLabel(o2, byId)) : [] };
        };
        const [pe, pf, ps] = [per('en'), per('fr'), per('es')];
        const byIdEn = new Map(en.items.map((x) => [x.id, x]));
        const spokenHe = quickReplyPrompt(round, byIdEn).spoken?.he ?? '';
        const none = '(nothing is played — a situation is shown)';
        push({
          kind: 'quick-reply', step: i + 1, where: `round ${k + 1} of ${step.rounds.length}${step.challenge ? ' · SPEED CHALLENGE (spoken at rate 1.12)' : ''}`,
          promptUi: `${step.challenge ? `⚡ ${ui('speedHeadsUp')}` : step.label ? `${q(step.label.en)} / ${q(step.label.he)}` : ui(round.situation ? 'quickReplySituation' : 'quickReplyTitle')}${round.situation ? ` — situation shown: ${q(round.situation.en)} / ${q(round.situation.he)}` : ''}`,
          audio: { en: pe.prompt ?? none, fr: pf.prompt ?? none, es: ps.prompt ?? none }, audioHe: spokenHe,
          choices: round.options.map((o2, j) => ({ en: pe.labels[j] ?? '', fr: pf.labels[j] ?? '∅ MISSING', es: ps.labels[j] ?? '∅ MISSING', he: sent.get(strip(o2.itemId))?.he ?? '', itemId: strip(o2.itemId), correct: o2.correct })),
          choiceDisplay: 'TARGET-LANGUAGE learner responses only (no translation on the buttons); order shuffled',
          tests: [...new Set(round.options.filter((o2) => o2.correct).map((o2) => strip(o2.itemId)))].join(', '),
          explanation: 'tip of the accepted sentence, or the generic “X means Y” line',
        });
      });
    }
    if (step.kind === 'visualMatch') {
      step.rounds.forEach((round, k) => {
        const at = (lang: Lang): string => { const s2 = content(lang, day).steps[i]; return s2?.kind === 'visualMatch' ? s2.rounds[k]?.audio.en ?? '∅ MISSING' : '∅ MISSING'; };
        push({
          kind: 'visual-match', step: i + 1, where: `round ${k + 1} of ${step.rounds.length}${step.challenge ? ' · SPEED CHALLENGE (spoken at rate 1.12)' : ''}`,
          promptUi: step.challenge ? `⚡ ${ui('speedHeadsUp')}` : step.label ? `${q(step.label.en)} / ${q(step.label.he)}` : ui('visualMatchTitle'),
          audio: { en: at('en'), fr: at('fr'), es: at('es') }, audioHe: round.audio.he,
          choices: step.tiles.map((tile) => { const label = `${tile.emoji ?? ''}${tile.label ?? ''}`; return { en: label, fr: label, es: label, he: '', itemId: tile.id === round.correct ? strip(round.itemId) : '', correct: tile.id === round.correct }; }),
          choiceDisplay: `a 3×3 board of ${step.tiles.length} tiles (same in every language); positions shuffled once per step; the sentence and its translation appear only AFTER the tap`,
          tests: strip(round.itemId) || '(no sentence id — not recorded)',
          explanation: 'after the tap: the spoken line and its translation',
        });
      });
    }
    if (step.kind === 'swap') {
      step.rounds.forEach((round, k) => {
        const other = (lang: Lang) => { const s2 = content(lang, day).steps[i]; return s2?.kind === 'swap' ? s2.rounds[k] : undefined; };
        const frame = (lang: Lang): string => other(lang)?.frame ?? '∅ MISSING';
        push({
          kind: 'swap-it', step: i + 1, where: `round ${k + 1} of ${step.rounds.length}`,
          promptUi: `${step.label ? `${q(step.label.en)} / ${q(step.label.he)}` : ui('swapTitle')} — cue ${round.cue.emoji ?? ''} ${q(round.cue.text.en)} / ${q(round.cue.text.he)} — frame EN ${q(frame('en'))} · FR ${q(frame('fr'))} · ES ${q(frame('es'))}`,
          audio: { en: '(nothing before the tap; the completed sentence is spoken after it)', fr: '(same)', es: '(same)' }, audioHe: '',
          choices: round.options.map((o2, j) => ({
            en: `${o2.slot} → ${fillFrame(round.frame, o2.slot)}`,
            fr: other('fr')?.options[j] ? `${other('fr')!.options[j]!.slot} → ${fillFrame(frame('fr'), other('fr')!.options[j]!.slot)}` : '∅ MISSING',
            es: other('es')?.options[j] ? `${other('es')!.options[j]!.slot} → ${fillFrame(frame('es'), other('es')!.options[j]!.slot)}` : '∅ MISSING',
            he: o2.meaning.he ?? '', itemId: o2.correct ? strip(round.itemId) : '', correct: o2.correct,
          })),
          choiceDisplay: 'the SLOT VALUES in the target language (shown here as "value → completed sentence"); order shuffled; a "wrong" value still produces and speaks a real sentence, with its translation',
          tests: strip(round.itemId) || '(no sentence id — not recorded)',
          explanation: 'after the tap: the completed sentence, spoken, with its translation',
        });
      });
    }
    if (step.kind === 'miniMap') {
      step.rounds.forEach((round, k) => {
        const at = (lang: Lang): string => { const s2 = content(lang, day).steps[i]; return s2?.kind === 'miniMap' ? s2.rounds[k]?.audio.en ?? '∅ MISSING' : '∅ MISSING'; };
        const board = [0, 1, 2].map((row) => [0, 1, 2].map((col) => { const c = round.cells.find((x) => x.row === row && x.col === col); return c ? `${c.emoji ?? ''}${c.label ? ` ${c.label}` : ''}${c.tappable ? ` [tap:${c.id}]` : ''}` : '·'; }).join(' | ')).join(' // ');
        push({
          kind: 'mini-map', step: i + 1, where: `round ${k + 1} of ${step.rounds.length}${step.challenge ? ' · SPEED CHALLENGE (spoken at rate 1.12)' : ''}`,
          promptUi: `${step.challenge ? `⚡ ${ui('speedHeadsUp')}` : step.label ? `${q(step.label.en)} / ${q(step.label.he)}` : ui('miniMapTitle')} — board, row by row: ${board}`,
          audio: { en: at('en'), fr: at('fr'), es: at('es') }, audioHe: round.audio.he,
          choices: tappableCells(round.cells).map((c) => ({ en: `${c.emoji ?? ''} ${c.id}`, fr: `${c.emoji ?? ''} ${c.id}`, es: `${c.emoji ?? ''} ${c.id}`, he: '', itemId: c.id === round.correct ? strip(round.itemId) : '', correct: c.id === round.correct })),
          choiceDisplay: 'the tappable cells of a 3×3 schematic map (fixed positions, not shuffled); the sentence and its translation appear only AFTER the tap',
          tests: strip(round.itemId) || '(no sentence id — not recorded)',
          explanation: 'after the tap: the spoken line and its translation',
        });
      });
    }
    if (step.kind === 'matchPairs') {
      // What a tile shows in each language: the authored short answer, or the sentence itself.
      const tile = (lang: Lang, k: number, side: 'prompt' | 'answer'): string => {
        const c = content(lang, day);
        const s2 = c.steps[i];
        const p = s2?.kind === 'matchPairs' ? s2.pairs[k] : undefined;
        if (!p) return '∅ MISSING';
        if (side === 'answer' && p.answerLabel) return `${p.answerLabel}${p.answerGloss ? ` ${p.answerGloss.en} / ${p.answerGloss.he}` : ''}`;
        return side === 'answer' && p.answerText ? p.answerText : c.items.find((x) => x.id === (side === 'prompt' ? p.promptItemId : p.answerItemId))?.text ?? '∅ MISSING';
      };
      step.pairs.forEach((pair, k) => {
        push({
          kind: 'match-pairs', step: i + 1, where: `pair ${k + 1} of ${step.pairs.length} (all pairs are on one screen)`,
          promptUi: `${step.label ? `${q(step.label.en)} / ${q(step.label.he)}` : ui('matchTitle')} — tile to match (target language, no translation): EN ${q(tile('en', k, 'prompt'))} · FR ${q(tile('fr', k, 'prompt'))} · ES ${q(tile('es', k, 'prompt'))}`,
          audio: { en: tile('en', k, 'prompt'), fr: tile('fr', k, 'prompt'), es: tile('es', k, 'prompt') }, audioHe: sent.get(strip(pair.promptItemId))?.he ?? '',
          choices: step.pairs.map((p2, j) => ({ en: tile('en', j, 'answer'), fr: tile('fr', j, 'answer'), es: tile('es', j, 'answer'), he: sent.get(strip(p2.answerItemId))?.he ?? '', itemId: strip(p2.answerItemId), correct: j === k })),
          choiceDisplay: 'the ANSWER tiles, target language only; their order is shuffled; a matched pair locks and leaves the board, so later pairs have fewer live tiles',
          tests: strip(pair.answerItemId),
          explanation: 'none — a correct match locks both tiles under a shared number and speaks the answer; a miss shakes, shows ✕ and clears (no penalty)',
        });
      });
    }
    if (step.kind === 'sentenceBuilder') {
      step.rounds.forEach((round, k) => {
        const chunksAt = (lang: Lang): string => { const s2 = content(lang, day).steps[i]; const r = s2?.kind === 'sentenceBuilder' ? s2.rounds[k] : undefined; return r ? r.chunks.join('  |  ') : '∅ MISSING'; };
        const id = strip(round.itemId);
        const s = sent.get(id)!;
        push({
          kind: 'sentence-builder', step: i + 1, where: `round ${k + 1} of ${step.rounds.length}`,
          promptUi: `${step.label ? `${q(step.label.en)} / ${q(step.label.he)}` : ui('builderTitle')} — cue shown: the sentence's MEANING in the app language (${q(s.he)})`,
          audio: { en: '(nothing before Check; the built sentence is spoken once it is right)', fr: '(same)', es: '(same)' }, audioHe: '',
          choices: [{ en: chunksAt('en'), fr: chunksAt('fr'), es: chunksAt('es'), he: s.he, itemId: id, correct: true }],
          choiceDisplay: 'the authored CHUNKS of the sentence as tiles (listed here in the correct order, separated by "|"), shuffled; each language has its own chunks; Check unlocks when every tile is placed',
          tests: id,
          explanation: 'right: the sentence is spoken and its translation shown. Wrong: "not yet" — the tiles stay, the answer is NOT shown; after one miss a hint marks the start; after two misses the learner may reveal it',
        });
      });
    }
    if (step.kind === 'ambush') {
      const at = (lang: Lang): string => {
        const s2 = content(lang, day).steps[i];
        return s2?.kind === 'ambush' ? s2.npc.en : '∅ MISSING';
      };
      const correct = strip(step.correctItemId);
      const s = sent.get(correct)!;
      push({
        kind: 'cold-open', step: i + 1, where: `single prompt · mode: ${step.mode ?? 'not set (original behaviour)'}`, promptUi: ui(step.mode === 'speed' ? 'speedHeadsUp' : 'fastOneComing'),
        audio: { en: at('en'), fr: at('fr'), es: at('es') }, audioHe: step.npc.he,
        choices: [asChoice(correct, true), asChoice(strip(step.wrongItemId), false)],
        choiceDisplay: step.mode === 'speed' ? 'TARGET-LANGUAGE text of the two sentences, no badge; order shuffled'
          : step.mode === 'recovery' ? 'TARGET-LANGUAGE text of the two sentences; only the conversation-help tool carries 🛟; order shuffled'
            : 'TARGET-LANGUAGE text of the two sentences, each prefixed with 🛟; order shuffled',
        tests: correct, explanation: s.tipHe ? `tip of the correct sentence: ${s.tipHe} / ${s.tipEn}` : `generic: “${s.en}” means “${s.he}”.`,
      });
    }
  });
  return out;
}

/* ── flags ─────────────────────────────────────────────────────────────────────────────────────── */

/** Every English word a learner has met up to and including a mission (sentences + dialogue lines + primed words). */
function knownWords(upToNumber: number): Set<string> {
  const set = new Set<string>();
  for (const m of BOOTCAMP_PLAN.slice(0, upToNumber)) {
    const c = content('en', m.day);
    for (const it of c.items) words(it.text).forEach((w) => set.add(w));
    for (const d of Object.values(c.dialogues)) for (const node of d.nodes) {
      words(node.en).forEach((w) => set.add(w));
      for (const ch of node.choices ?? []) words(ch.en).forEach((w) => set.add(w));
    }
    for (const s of c.steps) if (s.kind === 'prime') for (const w of s.words) words(w.text).forEach((x) => set.add(x));
  }
  return set;
}

function happyNodes(d: BootcampDialogue): DialogueNodeB[] {
  const byId = new Map(d.nodes.map((x) => [x.id, x]));
  const seen: DialogueNodeB[] = [];
  let node = byId.get(d.start);
  const visited = new Set<string>();
  while (node && !visited.has(node.id)) {
    visited.add(node.id);
    seen.push(node);
    if (node.choices?.length) {
      const correct = node.choices.filter((c) => c.correct);
      const pick = correct.find((c) => !isKit(strip(c.itemId))) ?? correct[0] ?? node.choices[0]!;
      node = byId.get(pick.next);
      continue;
    }
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }
  return seen;
}

function flagsOf(day: number, plan: MissionPlan, questions: Question[], use: Map<string, number[]>): string[] {
  const n = numberOf(day);
  const en = content('en', day);
  const sent = sentencesOf(day);
  const flags: string[] = [];
  const dialogues = Object.values(en.dialogues);
  const npcLines = dialogues.flatMap((d) => d.nodes.filter((x) => x.who === 'npc').map((x) => norm(x.en)));
  const choices = dialogues.flatMap((d) => d.nodes.flatMap((x) => (x.choices ?? []).map((c) => ({ d: d.id, node: x.id, c }))));
  const cold = plan.targets.concepts === 0;

  // Questions: duplicate choices, repeated prompts.
  for (const qu of questions) {
    for (const key of ['en', 'he'] as const) {
      if (qu.choices.some((c) => !c[key])) continue; // boards have no gloss
      // Board tiles and icon answers are compared as written: "1 ⬅️" and "1 ➡️", or two different
      // icons, are different tiles even though they normalise to the same (or to no) text.
      const tiles = qu.kind === 'visual-match' || qu.kind === 'mini-map' || qu.kind === 'match-pairs';
      const labels = qu.choices.map((c) => (tiles ? c[key].trim() : norm(c[key]) || c[key].trim()));
      const dup = labels.find((l, i) => labels.indexOf(l) !== i);
      if (dup !== undefined) flags.push(`${qu.ref}: two answer choices are identical in ${key === 'en' ? 'English' : 'Hebrew'} (“${qu.choices[labels.indexOf(dup)]![key]}”).`);
    }
  }
  const tested = questions.filter((x) => LISTEN_KINDS.includes(x.kind));
  for (const id of new Set(tested.map((x) => x.tests))) {
    const hits = tested.filter((x) => x.tests === id);
    if (hits.length > 1) flags.push(`Same prompt tested repeatedly: “${sent.find((s) => s.id === id)?.en}” is the audio of ${hits.map((h) => h.ref).join(' and ')}.`);
  }

  // Dialogue NPC questions with no trained "you will hear" sentence.
  const replies = sent.filter((s) => isReply(s.id));
  for (const d of missionDialogues(en)) {
    for (const node of happyNodes(d)) {
      if (node.who !== 'npc' || !node.en.includes('?')) continue;
      const line = norm(node.en);
      const covered = replies.some((r) => line.includes(norm(r.en)) || norm(r.en).includes(line));
      if (!covered) flags.push(`NPC question never trained for comprehension (no expected-reply sentence matches it): scene "${d.id}" ${node.id} — “${node.en}”`);
    }
  }

  // Expected-reply sentences whose wording is not in this mission's dialogue.
  for (const r of replies) {
    if (!npcLines.some((l) => l.includes(norm(r.en)))) flags.push(`Practice item wording not in this mission's dialogue: \`${r.id}\` “${r.en}” (drilled as an expected reply / distractor, but no NPC line here says it).`);
  }

  // Learner sentences: selectable? scored as shown?
  const referenced = new Set<string>();
  for (const s of en.steps) {
    if (s.kind === 'tool') referenced.add(strip(s.itemId));
    if (s.kind === 'quiz') [s.itemId, ...s.wrongIds].forEach((x) => referenced.add(strip(x)));
    if (s.kind === 'replies') [s.saidItemId, ...s.replyIds].forEach((x) => referenced.add(strip(x)));
    if (s.kind === 'ambush') [s.correctItemId, s.wrongItemId].forEach((x) => referenced.add(strip(x)));
    if (s.kind === 'prime' && s.buildFromItemId) referenced.add(strip(s.buildFromItemId));
  }
  const selectable = new Set(choices.map((x) => strip(x.c.itemId)).filter(Boolean));
  // Quick Reply responses and Swap It frames are active retrieval too.
  for (const s of en.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) for (const o2 of r.options) selectable.add(strip(o2.itemId));
    if (s.kind === 'swap') for (const r of s.rounds) if (r.itemId) selectable.add(strip(r.itemId));
    if (s.kind === 'matchPairs') for (const p of s.pairs) selectable.add(strip(p.answerItemId));
    if (s.kind === 'sentenceBuilder') for (const r of s.rounds) selectable.add(strip(r.itemId));
  }
  const coldOptions = new Set(en.steps.flatMap((s) => (s.kind === 'ambush' ? [strip(s.correctItemId), strip(s.wrongItemId)] : [])));
  for (const s of sent) {
    if (isProduction(s.id) && !selectable.has(s.id) && !coldOptions.has(s.id)) {
      flags.push(`Learner sentence never actively retrieved in this mission (0 choice screens, 0 quick-reply / swap / match / builder rounds, 0 cold-open options): \`${s.id}\` “${s.en}”${referenced.has(s.id) ? ' — shown as a key sentence / in review only' : ' — appears in sentence review only (orphan in this mission)'}.`);
    }
    if (isKit(s.id) && !selectable.has(s.id) && !referenced.has(s.id)) flags.push(`Toolkit phrase listed in the mission but never offered in it: \`${s.id}\` “${s.en}” (sentence review only).`);
  }
  for (const { d, node, c } of choices) {
    const id = strip(c.itemId);
    if (!id) { flags.push(`Choice with no sentence id (not recorded, not scored): scene "${d}" ${node} — “${c.en}”`); continue; }
    const s = sent.find((x) => x.id === id);
    if (s && !norm(c.en).includes(norm(s.en))) flags.push(`Line shown differs from the sentence it is scored as: scene "${d}" ${node} — shown “${c.en}”, scored as \`${id}\` “${s.en}”.`);
  }
  const allCorrect = dialogues.flatMap((d) => d.nodes.filter((x) => x.choices?.length && x.choices.every((c) => c.correct)).map((x) => `${d.id}/${x.id}`));
  const screens = dialogues.reduce((k, d) => k + d.nodes.filter((x) => x.choices?.length).length, 0);
  if (allCorrect.length) flags.push(`${allCorrect.length} of ${screens} choice screens have NO wrong option (every button is accepted): ${allCorrect.join(', ')}.`);
  const single = dialogues.flatMap((d) => d.nodes.filter((x) => x.choices?.length === 1).map((x) => `${d.id}/${x.id}`));
  if (single.length) flags.push(`${single.length} choice screens offer exactly ONE button (no decision): ${single.join(', ')}.`);

  // Answers that belong to another mission (teaching missions only; checkpoints reuse by design).
  if (!cold) {
    for (const qu of questions.filter((x) => x.kind !== 'dialogue-choice')) {
      for (const c of qu.choices) {
        if (!c.itemId) continue;
        const first = use.get(c.itemId)?.[0];
        if (first !== undefined && first !== n && !isKit(c.itemId)) flags.push(`${qu.ref}: answer choice “${c.en}” (\`${c.itemId}\`) was first taught in Mission ${pad(first)}, not here.`);
      }
    }
  }

  // Cold open: words never met before.
  const known = knownWords(n);
  const modeOf = (qu: Question): 'recovery' | 'speed' | undefined => { const s = en.steps[qu.step - 1]; return s?.kind === 'ambush' ? s.mode : undefined; };
  const challenge = (qu: Question): boolean => { const s = en.steps[qu.step - 1]; return (s?.kind === 'visualMatch' || s?.kind === 'miniMap' || s?.kind === 'quickReply') && s.challenge === true; };
  for (const qu of questions.filter((x) => x.kind === 'cold-open' || challenge(x))) {
    const fresh = [...new Set(words(qu.audio.en).filter((w) => !known.has(w)))];
    // A recovery ambush is MEANT to be beyond the learner, so unfamiliar words are by design there.
    if (fresh.length && modeOf(qu) !== 'recovery') flags.push(`${qu.ref}: ${qu.kind === 'cold-open' ? 'cold-open' : 'speed-challenge'} line contains English words not met in any sentence or dialogue line up to this mission: ${fresh.join(', ')}.`);
    if (qu.kind !== 'cold-open') continue;
    const hasTool = qu.choices.some((c) => isHelp(c.itemId));
    if (modeOf(qu) === undefined && !hasTool) flags.push(`${qu.ref}: the screen says ${ui('fastOneComing')} and marks both buttons with 🛟, but neither option is a conversation-help tool.`);
    if (modeOf(qu) === 'recovery' && !qu.choices.some((c) => c.correct && isHelp(c.itemId))) flags.push(`${qu.ref}: recovery ambush whose accepted answer is not a conversation-help tool.`);
    if (modeOf(qu) === 'speed' && hasTool) flags.push(`${qu.ref}: speed challenge that offers a conversation-help tool as an answer.`);
  }

  // Gloss consistency.
  for (const it of en.items) {
    if (it.meaning.en !== undefined && norm(it.meaning.en) !== norm(it.text)) flags.push(`English gloss differs from the English sentence: \`${strip(it.id)}\` text “${it.text}” vs gloss “${it.meaning.en}”.`);
  }
  for (const lang of ['fr', 'es'] as const) {
    const enById = new Map(en.items.map((i) => [strip(i.id), i]));
    for (const it of content(lang, day).items) {
      const ref = enById.get(strip(it.id));
      if (!ref) continue;
      if (norm(it.meaning.en ?? '') !== norm(ref.text)) flags.push(`${LANG_NAME[lang]} English gloss differs from the English mission's sentence: \`${strip(it.id)}\` gloss “${it.meaning.en}” vs English “${ref.text}”.`);
      if ((it.meaning.he ?? '') !== (ref.meaning.he ?? '')) flags.push(`${LANG_NAME[lang]} Hebrew gloss differs from the English mission's Hebrew gloss: \`${strip(it.id)}\` “${it.meaning.he}” vs “${ref.meaning.he}”.`);
    }
  }
  return flags;
}

/* ── per-mission rendering ─────────────────────────────────────────────────────────────────────── */

const STEP_NAME: Record<BootcampStep['kind'], string> = {
  video: 'video', talk: 'intro screen', prime: 'before-we-speak (word intro)', tool: 'key sentence (listen → reveal → say aloud)',
  replies: 'expected replies (listening drill)', quiz: 'meaning quiz (listening)', dialogue: 'dialogue (choose your line)',
  quickReply: 'quick reply (hear → pick your response)', visualMatch: 'visual match (hear → tap the tile)', swap: 'swap it (one frame, several endings)', miniMap: 'mini map (hear → tap the direction / spot)',
  matchPairs: 'match pairs (connect each question to its answer)', sentenceBuilder: 'sentence builder (put the chunks in order)',
  swipe: 'sentence review', ambush: 'cold open (fast line)', receipt: 'receipt (proof card)', summary: 'victory screen',
};

interface MissionCounts {
  production: number; receptive: number; kit: number; replyItems: number; listening: number; meaning: number; dialogueChoices: number;
  activePractice: number; oneButton: number; activeRetrieval: number; unusedSentences: number;
  questions: number; answerChoices: number; wrongBranches: number; coldOpens: number; recovery: number; vocab: number; swaps: number; review: number; flags: number;
}

function renderMission(plan: MissionPlan, index: number, use: Map<string, number[]>): { lines: string[]; counts: MissionCounts; questions: Question[]; flags: string[] } {
  const n = index + 1;
  const day = plan.day;
  const en = content('en', day);
  const sent = sentencesOf(day);
  const sentById = new Map(sent.map((s) => [s.id, s]));
  const questions = questionsOf(day);
  const flags = flagsOf(day, plan, questions, use);
  const o: string[] = [];
  const phase = PHASES.find((p) => p.n === plan.phase)!;
  const spec = SPEC_SOURCE[day];

  o.push(`# Mission ${pad(n)} — ${plan.title.en}`, '');
  o.push(`- Displayed number: ${pad(n)}`, `- Mission ID: \`${plan.id}\``, `- Registry key/day: ${day}`, `- Checkpoint: ${plan.checkpoint ? 'yes' : 'no'}`);
  o.push(`- Phase: ${phase.n} — ${phase.title.en} / ${phase.title.he} ${phase.icon}`);
  o.push(`- Source runtime file(s): ${spec ? `\`${DIR}${spec}\` — one multilingual spec, built per language by \`${DIR}author.ts\`` : LANGS.map((l) => `\`${DIR}${l === 'en' ? '' : `${l}/`}day${day}.ts\``).join(' · ')}`);
  o.push(`- Video: found by convention, never written into mission content — ${LANGS.map((l) => `${LANG_NAME[l]} \`${videoPublicPath(l, n)}\``).join(' · ')}. Played only where that file exists (inventory: \`docs/CORE30_FINAL_VIDEO_ACTION_MAP.md\`).`);
  o.push(`- Video steps inside the Practice flow: ${en.steps.some((s) => s.kind === 'video') ? 'yes (see flow)' : 'no'}`, '');

  // ── intro
  o.push('## Learning goal / intro screen', '');
  o.push('Mission card (plan metadata, shown on Home / Path / mission overview):', '');
  o.push(`- Title: ${q(plan.title.en)} / ${q(plan.title.he)}`, `- Objective: ${q(plan.objective.en)} / ${q(plan.objective.he)}`);
  o.push(`- Confidence gain: ${q(plan.confidenceGain.en)} / ${q(plan.confidenceGain.he)}`, `- Feeling: ${q(plan.feeling.en)} / ${q(plan.feeling.he)}`);
  o.push(`- Estimated minutes: ${plan.minutes}`, `- Situations: ${plan.situations.join(', ')}`, `- Declared targets: concepts ${plan.targets.concepts} · phrases ${plan.targets.phrases} · dialogues ${plan.targets.dialogues}`);
  o.push(`- Listening skill (internal note, English only): ${plan.listeningSkill}`, `- Speaking skill (internal note, English only): ${plan.speakingSkill}`);
  o.push(`- Why (internal note): ${plan.why}`, `- Prepares next (internal note): ${plan.preparesNext}`, '');
  const talks = en.steps.filter((s): s is Extract<BootcampStep, { kind: 'talk' }> => s.kind === 'talk');
  talks.forEach((tk, k) => {
    o.push(`Intro screen${talks.length > 1 ? ` ${k + 1}` : ''} (first Practice step; identical in the English, French and Spanish missions unless flagged):`, '');
    o.push(`- Icon: ${tk.icon}`, `- Title: ${q(tk.title.en)} / ${q(tk.title.he)}`);
    tk.body.forEach((b, j) => o.push(`- Text ${j + 1}: ${q(b.en)} / ${q(b.he)}`));
    o.push(`- Button: ${tk.cta ? `${q(tk.cta.en)} / ${q(tk.cta.he)}` : ui('continue')}`, '');
  });
  if (!talks.length) o.push('No intro screen.', '');

  // ── flow
  o.push('## Current Practice flow', '');
  en.steps.forEach((s, i) => {
    let detail = '';
    if (s.kind === 'tool') detail = ` — \`${strip(s.itemId)}\` “${sentById.get(strip(s.itemId))?.en}” · label ${s.label ? `${q(s.label.en)} / ${q(s.label.he)}` : ui('toolOf')} (${s.index}/${s.total})`;
    if (s.kind === 'prime') detail = ` — ${s.words.length} words → builds \`${strip(s.buildFromItemId)}\``;
    if (s.kind === 'replies') detail = ` — after \`${strip(s.saidItemId)}\`: ${s.replyIds.length} replies`;
    if (s.kind === 'quiz') detail = ` — hears \`${strip(s.itemId)}\``;
    if (s.kind === 'dialogue') detail = ` — scene \`${s.dialogueId}\``;
    if (s.kind === 'swipe') detail = ` — ${s.itemIds.length} sentences`;
    if (s.kind === 'quickReply' || s.kind === 'swap' || s.kind === 'miniMap' || s.kind === 'visualMatch') detail = ` — ${s.rounds.length} round(s)${(s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'quickReply') && s.challenge ? ' · speed challenge' : ''}`;
    if (s.kind === 'matchPairs') detail = ` — ${s.pairs.length} pairs on one screen`;
    if (s.kind === 'sentenceBuilder') detail = ` — ${s.rounds.length} round(s)`;
    if (s.kind === 'ambush') detail = ` — mode ${s.mode ?? 'not set'} · correct \`${strip(s.correctItemId)}\`, wrong \`${strip(s.wrongItemId)}\``;
    if (s.kind === 'receipt') detail = ` — ${q(s.text.en)} / ${q(s.text.he)}`;
    if (s.kind === 'video') detail = ` — mode ${s.mode}`;
    if (s.kind === 'talk') detail = ` — ${q(s.title.en)}`;
    o.push(`${i + 1}. \`${s.kind}\` — ${STEP_NAME[s.kind]}${detail}`);
  });
  const kinds = (lang: Lang): string => content(lang, day).steps.map((s) => s.kind).join(',');
  o.push('', `Step sequence identical in EN / FR / ES: ${kinds('fr') === kinds('en') && kinds('es') === kinds('en') ? 'yes' : 'NO — differs'}.`, '');

  // ── prime
  o.push('## Before we speak / word intro', '');
  const primes = en.steps.map((s, i) => ({ s, i })).filter((x): x is { s: Extract<BootcampStep, { kind: 'prime' }>; i: number } => x.s.kind === 'prime');
  if (!primes.length) o.push('No vocabulary pre-step.', '');
  for (const { s, i } of primes) {
    const other = (lang: Lang): Extract<BootcampStep, { kind: 'prime' }> | undefined => {
      const x = content(lang, day).steps[i];
      return x?.kind === 'prime' ? x : undefined;
    };
    o.push(`Step ${i + 1}. Label: ${s.label ? `${q(s.label.en)} / ${q(s.label.he)}` : ui('primeTitle')}. Intro: ${s.intro ? `${q(s.intro.en)} / ${q(s.intro.he)}` : '—'}.`);
    o.push('The learner READS each word with its meaning always visible and may TAP it to HEAR it (TTS). Nothing is selected or scored. No internal ids exist for these words.', '');
    const lists = LANGS.map((l) => (l === 'en' ? s : other(l))?.words ?? []);
    const keyed = lists.every((list) => list.every((w) => w.key));
    const line = (w: (typeof s.words)[number]): string => `${q(w.text)} — meaning ${q(w.meaning.he)} / ${q(w.meaning.en)} — icon ${w.emoji ?? 'none'} — ${w.review ? 'marked ♻️ review' : 'new'}`;
    if (keyed) {
      o.push('Words are paired across languages by their concept KEY (not by position).', '');
      const keys = [...new Set(lists.flatMap((list) => list.map((w) => w.key!)))];
      keys.forEach((key, k) => {
        const hit = (li: number) => lists[li]!.find((w) => w.key === key);
        const ref = hit(0) ?? hit(1) ?? hit(2)!;
        o.push(`${k + 1}. \`${key}\` — EN ${q(hit(0)?.text)} · FR ${q(hit(1)?.text)} · ES ${q(hit(2)?.text)} — meaning ${q(ref.meaning.he)} / ${q(ref.meaning.en)} — icon ${ref.emoji ?? 'none'} — ${ref.review ? 'marked ♻️ review' : 'new'}${/^(en|fr|es)\./.test(key) ? ' — language-specific on purpose' : ''}`);
      });
    } else {
      o.push('These words carry NO concept key, so the three languages are listed separately — do not read them as position-aligned translations of each other.', '');
      LANGS.forEach((l, li) => {
        o.push(`${LANG_NAME[l]}:`);
        lists[li]!.forEach((w, k) => o.push(`  ${k + 1}. ${line(w)}`));
      });
    }
    const builds = LANGS.map((l) => strip((l === 'en' ? s : other(l))?.buildFromItemId));
    if (new Set(builds).size > 1) o.push('', `The build sentence differs by language: EN \`${builds[0]}\` · FR \`${builds[1]}\` · ES \`${builds[2]}\`.`);
    const b = sentById.get(strip(s.buildFromItemId));
    o.push('', b ? `"${(UI_DICTIONARIES.en as Record<string, string>).primeBuilds}" card: \`${b.id}\` — EN ${q(b.en)} · FR ${q(b.fr)} · ES ${q(b.es)} · HE ${q(b.he)} (with its own play button).` : 'No build-sentence card.', '');
  }

  // ── sentences
  const exercises = (id: string): string[] => {
    const list: string[] = [];
    en.steps.forEach((s, i) => {
      if (s.kind === 'tool' && strip(s.itemId) === id) list.push(`key sentence (step ${i + 1})`);
      if (s.kind === 'prime' && strip(s.buildFromItemId) === id) list.push(`built by the word intro (step ${i + 1})`);
      if (s.kind === 'replies' && strip(s.saidItemId) === id) list.push(`"you said" lead-in of the expected-replies drill (step ${i + 1})`);
      if (s.kind === 'replies' && s.replyIds.map(strip).includes(id)) list.push(`expected-reply audio (step ${i + 1})`);
      if (s.kind === 'quiz' && strip(s.itemId) === id) list.push(`meaning-quiz audio (step ${i + 1})`);
      if (s.kind === 'quiz' && s.wrongIds.map(strip).includes(id)) list.push(`meaning-quiz distractor (step ${i + 1})`);
      if (s.kind === 'ambush' && strip(s.correctItemId) === id) list.push(`cold-open correct option (step ${i + 1})`);
      if (s.kind === 'ambush' && strip(s.wrongItemId) === id) list.push(`cold-open wrong option (step ${i + 1})`);
      if (s.kind === 'swipe' && s.itemIds.map(strip).includes(id)) list.push(`sentence review (step ${i + 1})`);
      if (s.kind === 'quickReply') s.rounds.forEach((r, k) => {
        if (strip(r.promptItemId) === id) list.push(`quick-reply prompt (step ${i + 1}, round ${k + 1})`);
        for (const o2 of r.options) if (strip(o2.itemId) === id) list.push(`quick-reply response (step ${i + 1}, round ${k + 1}, ${o2.correct ? 'accepted' : 'wrong option'})`);
      });
      if (s.kind === 'swap') s.rounds.forEach((r, k) => { if (strip(r.itemId) === id) list.push(`swap-it frame (step ${i + 1}, round ${k + 1})`); });
      if (s.kind === 'matchPairs') s.pairs.forEach((p, k) => {
        if (strip(p.promptItemId) === id) list.push(`match-pairs question tile (step ${i + 1}, pair ${k + 1})`);
        if (strip(p.answerItemId) === id) list.push(`match-pairs answer tile (step ${i + 1}, pair ${k + 1})`);
      });
      if (s.kind === 'sentenceBuilder') s.rounds.forEach((r, k) => { if (strip(r.itemId) === id) list.push(`sentence-builder target (step ${i + 1}, round ${k + 1})`); });
      if (s.kind === 'visualMatch' || s.kind === 'miniMap') s.rounds.forEach((r, k) => { if (strip(r.itemId) === id) list.push(`${s.kind === 'miniMap' ? 'mini-map' : 'visual-match'} audio (step ${i + 1}, round ${k + 1})`); });
    });
    for (const d of Object.values(en.dialogues)) for (const node of d.nodes) for (const c of node.choices ?? []) {
      if (strip(c.itemId) === id) list.push(`dialogue choice ${d.id}/${node.id} (${c.correct ? 'accepted' : 'WRONG option'})`);
    }
    return list;
  };
  o.push('## Every sentence in this mission', '');
  o.push('Audio for every sentence: asset-first, Web Speech TTS fallback (see "Audio / speech" at the top). No highlighted/tokenised words, pronunciation data or per-sentence variants are encoded; a tip, where present, is the only explanation.', '');
  for (const s of sent) {
    o.push(`### Sentence: \`${s.id}\``, '');
    o.push(`- EN: ${s.en}`, `- HE: ${s.he}`, `- FR: ${s.fr}`, `- ES: ${s.es}`, `- Role: ${role(s.id)}`);
    o.push(`- Tip / pattern note: ${s.tipHe ? `${q(s.tipEn)} / ${q(s.tipHe)}` : 'none'}`);
    o.push(`- Used in missions: ${(use.get(s.id) ?? []).map(pad).join(', ')}`);
    const ex = exercises(s.id);
    o.push(`- Exercised here as: ${ex.length ? ex.join('; ') : 'nothing (listed only)'}`, '');
  }

  // ── expected replies + quizzes + cold opens (full form)
  const fullQuestion = (qu: Question): void => {
    o.push(`### ${qu.ref} — ${qu.kind} (step ${qu.step}, ${qu.where})`, '');
    o.push(`- Prompt displayed: ${qu.promptUi}`);
    o.push(`- Audio played: EN ${q(qu.audio.en)} · FR ${q(qu.audio.fr)} · ES ${q(qu.audio.es)}`, `- Meaning of the audio (HE): ${q(qu.audioHe)}`);
    o.push(`- Buttons show: ${qu.choiceDisplay}`, '- Choices:');
    qu.choices.forEach((c, k) => {
      const label = LISTEN_KINDS.includes(qu.kind) ? `HE ${q(c.he)} / EN ${q(c.en)}`
        : qu.kind === 'visual-match' || qu.kind === 'mini-map' ? q(c.en)
          : `EN ${q(c.en)} · FR ${q(c.fr)} · ES ${q(c.es)} · (HE gloss ${q(c.he)})`;
      o.push(`  ${k + 1}. ${label}${c.itemId ? ` — \`${c.itemId}\`` : ' — no sentence id'} — ${c.correct ? '✅ accepted' : '❌ wrong'}${c.routesTo ? ` → ${c.routesTo}` : ''}`);
    });
    o.push(`- Tests: ${qu.tests}`, `- Explanation shown after answering: ${qu.explanation}`, '');
  };
  const byKind = (k: QuestionKind): Question[] => questions.filter((x) => x.kind === k);

  o.push('## Expected replies / listening items', '');
  const replySteps = en.steps.filter((s): s is Extract<BootcampStep, { kind: 'replies' }> => s.kind === 'replies');
  if (!replySteps.length) o.push('No expected-replies drill in this mission.', '');
  for (const rs of replySteps) {
    const said = sentById.get(strip(rs.saidItemId))!;
    o.push(`Lead-in screen: ${ui('youSaid')} — EN ${q(said.en)} · FR ${q(said.fr)} · ES ${q(said.es)} — then ${ui('expectedReplies')} — button 👂 ${ui('imReady')}.`);
    o.push(`Linked learner sentence: \`${said.id}\`. Each reply below is played once automatically; the learner picks its MEANING from three buttons. Distractors are always the first two OTHER replies of this same drill, in drill order (runtime rule), so the three choices are shuffled per session.`, '');
  }
  byKind('expected-reply').forEach(fullQuestion);

  o.push('## Quizzes', '');
  if (!byKind('meaning-quiz').length) o.push('No meaning quiz in this mission.', '');
  byKind('meaning-quiz').forEach(fullQuestion);

  o.push('## Active practice — Quick Reply · Visual Match · Swap It · Mini Map', '');
  const active = questions.filter((x) => ACTIVE_KINDS.includes(x.kind));
  if (!active.length) o.push('None in this mission.', '');
  active.forEach(fullQuestion);

  // ── dialogue trees
  o.push('## Dialogue — full tree', '');
  const scenes = missionDialogues(en);
  let wrongBranches = 0;
  let recovery = 0;
  let swaps = 0;
  const wrongLines: string[] = [];
  const recoveryLines: string[] = [];
  const swapLines: string[] = [];
  scenes.forEach((d, si) => {
    const happy = new Set(happyNodes(d).map((x) => x.id));
    const byId = new Map(d.nodes.map((x) => [x.id, x]));
    const rejoin = (from: string): string => {
      let node = byId.get(from);
      const seen = new Set<string>();
      const path: string[] = [];
      while (node && !seen.has(node.id)) {
        seen.add(node.id);
        if (happy.has(node.id)) return `${path.length ? `${path.join(' → ')} → ` : ''}rejoins the happy path at ${node.id}`;
        path.push(node.id);
        const nextId = node.choices?.length ? (node.choices.find((c) => c.correct) ?? node.choices[0]!).next : node.next;
        node = nextId ? byId.get(nextId) : undefined;
      }
      return `${path.join(' → ')} → (ends)`;
    };
    o.push(`### Scene ${si + 1} — \`${d.id}\` (start: ${d.start}; coaching mode: ${d.coaching ? 'on' : 'off'})`, '');
    for (const node of d.nodes) {
      const tx = nodeText(day, d.id, node.id);
      if (node.who === 'npc') {
        o.push(`- **${node.id}** · NPC${node.fast ? ' · fast (TTS rate 1.08)' : node.slow ? ' · slow (TTS rate 0.75)' : ' · normal (TTS rate 0.95)'}${happy.has(node.id) ? '' : ' · off the happy path'}${node.end ? ' · END of scene' : ` → ${node.next}`}`);
        o.push(`  - EN: ${tx.en}`, `  - FR: ${tx.fr}`, `  - ES: ${tx.es}`, `  - HE: ${tx.he}`);
      } else if (node.choices?.length) {
        o.push(`- **${node.id}** · LEARNER choice screen${happy.has(node.id) ? '' : ' · off the happy path'}`);
        node.choices.forEach((c, k) => {
          const at = (lang: Lang): string => content(lang, day).dialogues[d.id]?.nodes.find((x) => x.id === node.id)?.choices?.[k]?.en ?? '∅ MISSING';
          const id = strip(c.itemId);
          const kind = !c.correct ? '❌ WRONG' : isHelp(id) ? '🛟 accepted — conversation-help tool' : '✅ accepted';
          o.push(`  - choice ${k + 1} — ${kind} → ${c.next}${id ? ` — \`${id}\`` : ' — no sentence id'}`);
          o.push(`    - EN: ${c.en}`, `    - FR: ${at('fr')}`, `    - ES: ${at('es')}`, `    - HE: ${c.he}`);
          if (c.coach) o.push(`    - coach note: ${q(c.coach.en)} / ${q(c.coach.he)}`);
          const prompt = promptNodeFor(d, node);
          if (!c.correct) {
            wrongBranches++;
            const target = byId.get(c.next);
            wrongLines.push(`- Scene \`${d.id}\`, ${node.id} — after NPC ${q(prompt?.en)}`, `  - Wrong choice: ${q(c.en)} (${q(c.he)})${id ? ` — \`${id}\`` : ''}`,
              `  - Feedback card: ❌ header, what you heard, your answer, what you should answer (${q((node.choices!.find((x) => x.correct) ?? c).en)}), "Why": ${c.coach ? `${q(c.coach.en)} / ${q(c.coach.he)}` : ui('dialogueMisstep')}. Buttons: Try again (returns to this screen) · Continue (plays the branch).`,
              `  - NPC response (${c.next}): ${q(target?.en)} — HE ${q(target?.he)}`, `  - Then: ${rejoin(c.next)}. The line ${ui('niceRecovery')} is shown on the following choice screens.`);
          }
          if (c.correct && isHelp(id)) {
            recovery++;
            const target = byId.get(c.next);
            recoveryLines.push(`- Scene \`${d.id}\`, ${node.id} — \`${id}\` ${q(c.en)} (${q(c.he)}) — after NPC ${q(prompt?.en)} → ${c.next}: NPC ${q(target?.en)}${target?.slow ? ' (slow)' : ''} → ${rejoin(c.next)}. Counts as success (recorded as "pass"); no feedback card — the dialogue simply continues.`);
          }
        });
        const direct = node.choices.filter((c) => c.correct && !isKit(strip(c.itemId)));
        if (direct.length > 1) {
          swaps += direct.length - 1;
          swapLines.push(`- Scene \`${d.id}\`, ${node.id}: ${direct.map((c) => q(c.en)).join(' OR ')} — all accepted, same continuation unless the routes above differ.`);
        }
      } else {
        o.push(`- **${node.id}** · LEARNER scripted line (spoken by the app, no choice)${node.next ? ` → ${node.next}` : ''}`, `  - EN: ${tx.en}`, `  - FR: ${tx.fr}`, `  - ES: ${tx.es}`, `  - HE: ${tx.he}`);
      }
    }
    o.push('', `#### Canonical happy path — Scene ${si + 1}`, '');
    const paths = LANGS.map((l) => cinematicTranscript(content(l, day).dialogues[d.id]!));
    paths[0]!.forEach((line, k) => {
      o.push(`- **${line.who === 'npc' ? 'NPC' : 'You'}:** ${line.en}`, `  - FR: ${paths[1]![k]?.en ?? '∅'} · ES: ${paths[2]![k]?.en ?? '∅'} · HE: ${line.he}`);
    });
    o.push('');
  });
  o.push('Happy-path rule: at each choice screen the first accepted line that is not a toolkit phrase; if every accepted line is a toolkit phrase, the first one.', '');

  o.push('## Learner choice screens', '');
  if (!byKind('dialogue-choice').length) o.push('None.', '');
  byKind('dialogue-choice').forEach(fullQuestion);

  o.push('## Recovery tools in this mission', '');
  const kitHere = sent.filter((s) => isKit(s.id));
  o.push(kitHere.length ? `Toolkit phrases bundled into this mission's sentence list: ${kitHere.map((s) => `\`${s.id}\` ${q(s.en)}`).join(' · ')}.` : 'No toolkit phrase is bundled into this mission.', '');
  o.push(recoveryLines.length ? 'Where a conversation-help tool can be selected, and what happens:' : 'No conversation-help tool is selectable in this mission\'s dialogues.', '', ...recoveryLines, '');

  o.push('## Wrong answer branches', '');
  o.push(wrongLines.length ? `${wrongBranches} reachable wrong-answer branch(es):` : 'None — no choice in this mission is marked wrong.', '', ...wrongLines, '');

  // ── review
  o.push('## Sentence review', '');
  const swipes = en.steps.map((s, i) => ({ s, i })).filter((x): x is { s: Extract<BootcampStep, { kind: 'swipe' }>; i: number } => x.s.kind === 'swipe');
  if (!swipes.length) o.push('No sentence-review step in this mission.', '');
  for (const { s, i } of swipes) {
    o.push(`Step ${i + 1}. ${s.itemIds.length} sentences, in this fixed order. Each is played automatically (TTS), shown with its translation and tip; buttons: 🔊 ${ui('hearAgain')} and Next. No speaking prompt, no grading, no scoring; nothing is recorded.`, '');
    s.itemIds.forEach((id, k) => o.push(`${k + 1}. \`${strip(id)}\` — ${sentById.get(strip(id))?.en} — ${sentById.get(strip(id))?.he}`));
    o.push('');
  }

  // ── cold opens
  o.push('## Cold open / ambush', '');
  if (!byKind('cold-open').length) o.push('No cold open in this mission.', '');
  const known = knownWords(n);
  for (const qu of byKind('cold-open')) {
    fullQuestion(qu);
    const fresh = [...new Set(words(qu.audio.en).filter((w) => !known.has(w)))];
    const receipt = en.steps[qu.step];
    o.push(`- Flow: screen shows ⚡ and ${ui('fastOneComing')} with one button 👂 ${ui('imReady')}; on tap the line is spoken at TTS rate 1.12 and printed small; two shuffled buttons appear; 🔊 ${ui('hearAgain')} replays at 0.85.`);
    o.push('- Success criterion: picking the accepted sentence. A wrong pick shows the feedback card (what you heard + translation, your answer, the sentence that fit) with Try again / Continue; Continue proceeds either way. Response time is recorded.');
    o.push(`- Recovery options offered: ${qu.choices.some((c) => isHelp(c.itemId)) ? 'yes (see choices)' : 'none'}`);
    o.push(`- Receipt shown next: ${receipt?.kind === 'receipt' ? `${q(receipt.text.en)} / ${q(receipt.text.he)}` : '—'}`);
    o.push(`- Potential new-language exposure: ${fresh.length ? `YES — English words not met in any sentence or dialogue line of Missions 01–${pad(n)}: ${fresh.join(', ')}` : 'NO — every English word of the line appears in a sentence or dialogue line of Missions 01–' + pad(n)}`, '');
  }

  // ── swaps
  o.push('## Swap-in / variable content', '');
  o.push('The runtime has NO slot-substitution mechanism: no sentence is generated with a different word. "Variants" exist only as (a) alternative accepted lines on one choice screen and (b) extra sentences taught beside the dialogue. Templates are mentioned only in tips.', '');
  o.push(swapLines.length ? 'Alternative accepted lines:' : 'No choice screen offers two accepted non-toolkit lines.', '', ...swapLines, '');
  const selectable = new Set(Object.values(en.dialogues).flatMap((d) => d.nodes.flatMap((x) => (x.choices ?? []).map((c) => strip(c.itemId)))));
  const extras = sent.filter((s) => isProduction(s.id) && !selectable.has(s.id));
  o.push(extras.length ? 'Learner sentences taught beside the dialogue (not a line in any scene):' : 'Every learner sentence of this mission is a line in a scene.', '', ...extras.map((s) => `- \`${s.id}\` — ${s.en}`), '');

  // ── receipts
  o.push('## Receipts (proof cards)', '');
  en.steps.forEach((s, i) => { if (s.kind === 'receipt') o.push(`- Step ${i + 1}: ${q(s.text.en)} / ${q(s.text.he)}`); });
  o.push('');

  // ── metadata
  const counts: MissionCounts = {
    production: sent.filter((s) => isProduction(s.id)).length,
    receptive: sent.filter((s) => isReply(s.id)).length,
    kit: kitHere.length,
    replyItems: byKind('expected-reply').length,
    listening: byKind('expected-reply').length,
    activePractice: active.length,
    oneButton: Object.values(en.dialogues).reduce((k, d) => k + d.nodes.filter((x) => x.choices?.length === 1).length, 0),
    activeRetrieval: byKind('quick-reply').length + byKind('swap-it').length + byKind('match-pairs').length + byKind('sentence-builder').length + Object.values(en.dialogues).reduce((k, d) => k + d.nodes.filter((x) => (x.choices?.length ?? 0) > 1).length, 0),
    unusedSentences: flags.filter((f) => f.startsWith('Learner sentence never actively retrieved')).length,
    meaning: byKind('meaning-quiz').length,
    dialogueChoices: byKind('dialogue-choice').length,
    questions: questions.length,
    answerChoices: questions.reduce((k, x) => k + x.choices.length, 0),
    wrongBranches, coldOpens: byKind('cold-open').length, recovery,
    vocab: primes.reduce((k, p) => k + p.s.words.length, 0), swaps,
    review: swipes.reduce((k, p) => k + p.s.itemIds.length, 0), flags: flags.length,
  };
  const keySentences = en.steps.filter((s) => s.kind === 'tool').length;
  o.push('## Audit Metadata — DO NOT FIX YET', '');
  o.push(`- Learner-production sentences: ${counts.production}`, `- Receptive (expected-reply) sentences: ${counts.receptive}`, `- Toolkit phrases bundled: ${counts.kit}`);
  o.push(`- Key-sentence steps: ${keySentences}`, `- Expected-reply/listening items: ${counts.replyItems}`, `- Questions/quizzes (meaning quiz): ${counts.meaning}`);
  o.push(`- Active-practice questions (quick reply / visual match / swap it / mini map / match pairs / sentence builder): ${counts.activePractice}`);
  o.push(`- Active retrieval opportunities (quick-reply rounds + swap rounds + match pairs + sentence-builder rounds + dialogue screens with a real choice): ${counts.activeRetrieval}`);
  o.push(`- One-button dialogue screens: ${counts.oneButton}`, `- Learner sentences never actively retrieved: ${counts.unusedSentences}`);
  o.push(`- Dialogue learner choices (screens): ${counts.dialogueChoices}`, `- Wrong-answer branches: ${counts.wrongBranches}`, `- Cold-open prompts: ${counts.coldOpens}`);
  o.push(`- Recovery opportunities: ${counts.recovery}`, `- Vocabulary pre-items: ${counts.vocab}`, `- Swap variants (extra accepted lines): ${counts.swaps}`, `- Sentences in review: ${counts.review}`);
  o.push(`- Total interactive questions: ${counts.questions} (answer choices: ${counts.answerChoices})`);
  o.push(`- Approximate total learner interactions: ${counts.questions + keySentences + counts.review + (primes.length ? 1 : 0)} (questions + key sentences + review cards + word-intro screen)`, '');
  o.push(flags.length ? `### AUTO-FLAG — requires human review (${flags.length})` : '### AUTO-FLAG — requires human review (0)', '');
  o.push(...(flags.length ? flags.map((f) => `- AUTO-FLAG — ${f}`) : ['None raised by the mechanical checks.']), '');
  return { lines: o, counts, questions, flags };
}

/* ── document ──────────────────────────────────────────────────────────────────────────────────── */

export interface PracticeAuditStats {
  missions: number; canonicalProduction: number; canonicalReceptive: number; sentenceListings: number;
  expectedReplyItems: number; meaningQuizzes: number; activePractice: number; dialogueChoiceScreens: number; coldOpens: number;
  questions: number; answerChoices: number; wrongBranches: number; recoveryOpportunities: number; autoFlags: number; zeroRetrieval: number;
}

function build(): { text: string; stats: PracticeAuditStats } {
  const use = usage();
  const missions = BOOTCAMP_PLAN.map((m, i) => ({ plan: m, ...renderMission(m, i, use) }));
  const o: string[] = [];

  o.push('# READY Core 30 — Complete Practice Audit Source', '');
  o.push('> **Generated from the runtime** by `npm run gen:practice-audit` (`scripts/generate-practice-audit.ts` → `apps/web/src/features/bootcamp/practiceAudit.ts`). Do not edit by hand: a test fails if this file differs from what the runtime renders.', '>');
  o.push('> This is an inspection document. It records what the app currently contains; it does not recommend or change anything. Lines marked **AUTO-FLAG** are mechanical observations for a human reviewer, not verdicts.', '');
  o.push('## How to read this document', '');
  o.push('- "Sentence id" is written without its language prefix. In the app each language has its own copy (`en.…`, `fr.…`, `es.…`), so practice history is separate per learning language.');
  o.push('- EN / FR / ES are the three learning languages. HE is the Hebrew gloss shown to a Hebrew-interface learner; an English-interface learner sees the English gloss instead.');
  o.push('- Interface strings are quoted as "English" / "Hebrew".');
  o.push('- "Accepted" means the app treats the choice as correct. "Happy path" is the canonical conversation used by the transcript, Listen and the dialogue document.');
  o.push('- Question references (`M07-Q03`) number every interactive question of a mission in the order the learner meets it; the same references are used in the Question Bank at the end.', '');

  o.push('## What the auto-flags can and cannot see', '');
  o.push('Checked mechanically: identical answer choices; one sentence used as the audio of several questions; NPC questions on the happy path with no matching expected-reply sentence; expected-reply sentences whose wording no NPC line in the mission says; learner sentences that are never a selectable line or cold-open option; a line shown that differs from the sentence it is scored as; choice screens with no wrong option or a single button; answer choices first taught in another mission (teaching missions only); cold-open lines containing English words not met before; cold opens labelled "use a tool" without a tool among the options; gloss inconsistencies between languages.');
  o.push('NOT checked (needs a human): whether distractors are plausible, whether two differently worded choices mean the same, whether a translation is right, whether a dialogue feels natural. Word-level checks use English only.', '');

  o.push('## Practice mechanics shared by every mission', '');
  o.push('Read from the mission player (`Bootcamp.tsx`). Per-mission sections list only content; behaviour is as described here unless a mission section says otherwise.', '');
  o.push('| Step type | What the learner sees and does | Answer order | Feedback | Recorded |', '|---|---|---|---|---|');
  o.push('| `talk` — intro screen | Icon, title, text lines, one button. Reading only. A mission\'s FIRST intro screen is introduced by the learner\'s buddy: one app-language line in a bubble above the character. | — | — | nothing |');
  o.push(`| \`prime\` — word intro | One screen: label ${ui('primeTitle')} (or the step's own label), each word with its meaning visible, tap to hear; optional card ${ui('primeBuilds')} with the full sentence. Button Continue. | — | — | nothing |`);
  o.push(`| \`tool\` — key sentence | Sentence is played automatically while the screen shows only ▶︎ and ${ui('listenFirst')}. When audio ends the same screen reveals the sentence, its translation, its tip, and 🗣️ ${ui('sayItAloud')}. Buttons: 🔊 replay (rate 0.85 after reveal), Continue. Speaking is requested but NOT captured or checked. | — | — | "echo / pass" on Continue |`);
  o.push(`| \`replies\` — expected replies | Lead-in: ${ui('youSaid')} + the learner sentence + ${ui('expectedReplies')}. Then one question per reply: 👂, ${ui('whichReply')} (i/n), audio auto-plays, three buttons showing MEANINGS in the app language, plus 🔊 ${ui('hearAgain')}. | shuffled per session (seeded) | Correct: ✓ card with what was heard. Wrong: ❌ card — what you heard (replayable), your answer, ${ui('theMeaning')}, "Why" = the sentence's tip or the generic ${ui('meansMapping')}; buttons Try again (re-ask) / Continue. | "listen" pass/fail per pick |`);
  o.push(`| \`quiz\` — meaning quiz | 👂, ${ui('whatDidItMean')}, audio auto-plays, three buttons showing MEANINGS in the app language, plus 🔊 ${ui('hearAgain')}. | shuffled per session | same card as above | "listen" pass/fail |`);
  o.push(`| \`dialogue\` — choose your line | (In a checkpoint's cold scene the NPC line is shown WITHOUT its translation, and a wrong pick leads to a slow re-ask and the same choice again.) (In an audio-only scene — Mission 28 — the NPC line is not WRITTEN either before the answer: the bubble holds only a replay button; the text and its translation appear on the feedback card after the pick. A scene transition there — "Later…" — is a cue: shown in the app language above the bubble, never spoken.) One exchange on screen, laid out as a conversation: the NPC line (target language + translation) in a speech bubble beside the other speaker, spoken by TTS; then ${ui('yourTurn')} with buttons showing TARGET-LANGUAGE lines only; 🔊 ${ui('replayQuestion')}. | fixed, as authored — never shuffled | Accepted natural line: ✓ card (question + your answer, replayable) then Next. Accepted toolkit phrase: no card, the scene continues. Wrong line: ❌ card with "Why" = ${ui('dialogueMisstep')} (no per-choice explanation is authored), Try again / Continue; Continue plays the NPC's reaction and shows ${ui('niceRecovery')}. | "simulator" pass (accepted) / partial (wrong), only if the choice has a sentence id |`);
  o.push(`| \`quickReply\` — quick reply | ${ui('quickReplyTitle')} (or, for a situation round, the situation text and ${ui('quickReplySituation')}); the NPC line auto-plays; 2–3 buttons showing the learner's possible RESPONSES in the target language, drawn as reply bubbles; the other speaker is shown beside an audio bubble that replays the line when tapped (the line is heard, not written). Several rounds in one step, counted "i of n". | shuffled per session | ✓/❌ card: what you heard + translation, your answer, the response that fit (replayable), "Why" = tip or generic line; Try again / Continue. An accepted pick is spoken. | "simulator" pass/fail + response time, on the accepted sentence |`);
  o.push(`| \`visualMatch\` — visual match | ${ui('visualMatchTitle')} (or the step's label); the line auto-plays; a 3×3 board of up to 9 tiles; tap the tile that shows what was said. An audio bubble at the top replays the line. | tiles shuffled once per step | Inline: correct tile turns green, a wrong pick red; the spoken line and its translation appear only now; Try again / Next. | "numberSprint" pass/fail + response time, when the round names a sentence |`);
  o.push(`| \`swap\` — swap it | ${ui('swapTitle')}: a cue (emoji + short app-language hint), the sentence frame with a blank, and 2–3 slot values as tappable pieces under the sentence. | shuffled per session | Inline: the blank is filled, the completed sentence is SPOKEN and translated — also for a non-matching value, which is still a real sentence; Try again / Next. | "flashRecall" pass/fail + response time on the frame's sentence |`);
  o.push(`| \`miniMap\` — mini map | ${ui('miniMapTitle')}: the instruction auto-plays; a 3×3 schematic (landmarks, "you", tappable arrows or pins); tap where the instruction leads. An audio bubble at the top replays it. No translation before the tap. | fixed (it is a map) | Inline, as visual match. | "listen" pass/fail + response time, when the round names a sentence |`);
  o.push(`| \`matchPairs\` — match pairs | ${ui('matchTitle')}: one screen, two groups of tiles in the target language — the questions, then the answers. Tap one tile, then its partner (either side first). Tapping a question plays it. An answer tile may be a number or an icon instead of a sentence (matching what was said to what it means); where an icon alone could be misread it carries a few app-language words. No translation anywhere before a match. | answers shuffled per session | A right pair locks, turns green, gets a shared number and the answer is spoken. A wrong pair shakes, shows ✕ and clears — nothing locks, nothing is lost. Continue appears when every pair is locked. | "simulator" pass/fail on the pair's answer sentence |`);
  o.push(`| \`sentenceBuilder\` — sentence builder | ${ui('builderTitle')}: the sentence's meaning in the app language, an empty answer line, and 3–6 tiles (authored chunks of the sentence, per language). Tap a tile to place it, tap a placed tile to take it back. ${ui('builderCheck')} unlocks when every tile is used. | tiles shuffled per session, never already in order | Right: the sentence is spoken and translated; Next. Wrong: ${ui('builderNotYet')} — the answer is not shown; after one miss ${ui('builderHint')} marks how it starts; after two, the learner may reveal it. | "flashRecall" pass/fail + response time on the sentence |`);
  o.push(`| \`swipe\` — sentence review | Each sentence in turn: auto-played, shown with translation and tip; 🔊 ${ui('hearAgain')}, Next. | fixed | none | nothing |`);
  o.push(`| \`ambush\` with a mode — final challenge | Same screen as the cold open below, with an explicit purpose. **recovery**: ${ui('fastOneComing')}; the line is meant to be too hard, the accepted answer is a conversation-help tool, and only that button carries 🛟. **speed**: ${ui('speedHeadsUp')}; known language at speed, no 🛟 anywhere. A quick-reply, visual-match or mini-map step marked "speed challenge" plays the same role with its own screen instead of two buttons (line spoken at 1.12, replay at 0.85). | shuffled | as below | as below |`);
  o.push(`| \`ambush\` — cold open | ⚡ ${ui('fastOneComing')}, button 👂 ${ui('imReady')}; the line is spoken fast (1.12) and printed small; two buttons, each "🛟 + a target-language sentence". | shuffled | ❌/✓ card: what you heard + translation, your answer, the sentence that fit; Try again / Continue | "listen" pass/fail + response time |`);
  o.push('| `receipt` — proof card | 🧾 and one sentence; button Continue. The text is saved to the learner\'s receipts. | — | — | receipt text |');
  o.push('| `video` | Plays the mission video (intro / again). Only Mission 01 has video steps inside the flow. A READY poster (mission icon + title) is shown until the clip\'s first frame is ready. | — | — | nothing |');
  o.push('| `summary` — victory | Confetti, "completed", actions: watch conversation, transcript, practice again; collapsed "What did I learn?". Marks the mission completed. | — | — | completion |', '');
  o.push('Progression: no step blocks. A wrong answer never prevents continuing ("Continue" is always available next to "Try again"). There is no pass mark, no score threshold and no retry limit. Every step is required only in the sense that the flow is linear.', '');
  o.push(`Not present in the runtime (so not exported): free sentence construction, typing, speech recognition, image questions, hints separate from tips, per-distractor explanations, per-choice feedback text. A dialogue screen with exactly one line is headed ${ui('yourTurnSay')} instead of the choice heading.`, '');

  o.push('## Audio / speech', '');
  o.push('- All mission audio goes through one function (`shared/audio/tts.ts`): asset-first playback with Web Speech (browser TTS) fallback. No prerecorded sentence assets are referenced by mission content, so in practice every line is browser TTS in the learning language\'s voice.');
  o.push('- One global speech-speed setting (Profile, 80–105 %, default 95 %) multiplies every utterance. On top of it the player uses fixed relative rates: NPC line 0.95 · NPC "fast" 1.08 · NPC "slow" 0.75 · the learner\'s chosen line 0.92 · cold open 1.12 (replay 0.85) · key-sentence replay after reveal 0.85.');
  o.push('- Every question screen has a replay button. Dialogue NPC lines advance automatically when the audio ends.');
  o.push('- Exceptions: none encoded per sentence. Mission videos are separate files (see each mission header).', '');

  o.push('## Global Recovery Toolkit', '');
  o.push('Not a mission. Eight phrases shared by all missions; a mission bundles the ones it uses. Selecting one in a dialogue is always accepted.', '');
  for (const it of RECOVERY_ITEMS) {
    const id = strip(it.id);
    const kit = (lang: Lang): string => {
      for (const m of BOOTCAMP_PLAN) { const hit = content(lang, m.day).items.find((i) => strip(i.id) === id); if (hit) return hit.text; }
      return '(not used by any Core mission)';
    };
    const usedIn = use.get(id) ?? [];
    o.push(`- \`${id}\` — EN ${q(it.text)} · FR ${q(kit('fr'))} · ES ${q(kit('es'))} · HE ${q(it.meaning.he)} — ${isHelp(id) ? 'help tool' : 'courtesy'} — bundled in missions: ${usedIn.length ? usedIn.map(pad).join(', ') : 'none'}`);
  }
  o.push('', 'Trigger: none. A tool is available only where a mission\'s author placed it as a button on a choice screen. Typical behaviour: the NPC repeats more slowly or more simply, then the same question is asked again without the tool button.', '', '---', '');

  for (const m of missions) o.push(...m.lines, '---', '');

  // ── matrices
  o.push('# Cross-Mission Practice Matrix', '');
  o.push('| Mission | Sentences (prod / heard / kit) | Expected replies | Listening questions | Meaning questions | Active-practice questions | Dialogue-choice questions | One-button screens | Recovery moments | Cold open | Vocabulary pre-step | Swap variants | Total interactive questions | Auto-flags |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  missions.forEach((m, i) => {
    const c = m.counts;
    o.push(`| ${pad(i + 1)} ${m.plan.title.en} | ${c.production + c.receptive + c.kit} (${c.production} / ${c.receptive} / ${c.kit}) | ${c.replyItems} | ${c.listening + c.meaning} | ${c.meaning} | ${c.activePractice} | ${c.dialogueChoices} | ${c.oneButton} | ${c.recovery} | ${c.coldOpens} | ${c.vocab ? `${c.vocab} words` : 'no'} | ${c.swaps} | ${c.questions} | ${c.flags} |`);
  });
  o.push('', '"Listening questions" = expected-reply questions + meaning quizzes (both are hear-and-pick-the-meaning). "Meaning questions" = the meaning quizzes alone.', '');

  // sentence coverage
  const allQuestions = missions.flatMap((m) => m.questions);
  const firstEn = new Map<string, string>();
  for (const m of BOOTCAMP_PLAN) for (const it of content('en', m.day).items) if (!firstEn.has(strip(it.id))) firstEn.set(strip(it.id), it.text);
  const count = (_id: string, pred: (s: BootcampStep) => boolean): number => BOOTCAMP_PLAN.reduce((k, m) => k + content('en', m.day).steps.filter(pred).length, 0);
  const choiceUses = (id: string): { accepted: number; wrong: number } => {
    let accepted = 0, wrong = 0;
    for (const m of BOOTCAMP_PLAN) for (const d of Object.values(content('en', m.day).dialogues)) for (const node of d.nodes) for (const c of node.choices ?? []) {
      if (strip(c.itemId) === id) { if (c.correct) accepted++; else wrong++; }
    }
    return { accepted, wrong };
  };
  const checkpointDays = new Set(BOOTCAMP_PLAN.filter((m) => m.checkpoint).map((m) => m.day));
  const inCheckpoint = (id: string): boolean => [...checkpointDays].some((d) => content('en', d).items.some((i) => strip(i.id) === id));
  o.push('# Sentence Coverage Matrix', '');
  o.push('Every learner-production sentence id of the Core, in order of first appearance. "Select" = times it is a button on a dialogue choice screen (accepted / offered as a wrong option). "Key" = key-sentence steps (listen, reveal, "say it aloud" — not checked). The runtime never requires typed or spoken production, so "must produce/repeat" is always "prompted only, not verified".', '');
  o.push('| Sentence id | English | First | Reused in | Key | Select (ok / wrong) | Quick reply / swap rounds | Cold-open option | Review cards | In a checkpoint | Listening-only | Flag |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
  let zeroRetrieval = 0;
  const production = [...firstEn.keys()].filter(isProduction);
  for (const id of production) {
    const ms = use.get(id) ?? [];
    const key = count(id, (s) => s.kind === 'tool' && strip(s.itemId) === id);
    const sel = choiceUses(id);
    const coldOpt = count(id, (s) => s.kind === 'ambush' && (strip(s.correctItemId) === id || strip(s.wrongItemId) === id));
    const review = count(id, (s) => s.kind === 'swipe' && s.itemIds.map(strip).includes(id));
    const heard = count(id, (s) => (s.kind === 'quiz' && strip(s.itemId) === id) || (s.kind === 'replies' && s.replyIds.map(strip).includes(id)));
    const engines = BOOTCAMP_PLAN.reduce((k, m) => k + content('en', m.day).steps.reduce((n2, st) => n2
      + (st.kind === 'quickReply' ? st.rounds.filter((r) => r.options.some((o2) => strip(o2.itemId) === id)).length : 0)
      + (st.kind === 'swap' ? st.rounds.filter((r) => strip(r.itemId) === id).length : 0)
      + (st.kind === 'matchPairs' ? st.pairs.filter((p) => strip(p.answerItemId) === id).length : 0)
      + (st.kind === 'sentenceBuilder' ? st.rounds.filter((r) => strip(r.itemId) === id).length : 0), 0), 0);
    const active = sel.accepted + sel.wrong + coldOpt + engines;
    if (active === 0) zeroRetrieval++;
    o.push(`| \`${id}\` | ${firstEn.get(id)} | ${pad(ms[0] ?? 0)} | ${ms.slice(1).map(pad).join(', ') || '—'} | ${key} | ${sel.accepted} / ${sel.wrong} | ${engines} | ${coldOpt} | ${review} | ${inCheckpoint(id) ? 'yes' : 'no'} | ${active === 0 && key === 0 && heard > 0 ? 'yes' : 'no'} | ${active === 0 ? '**0 active retrieval opportunities**' : ''} |`);
  }
  o.push('', `Learner-production sentence ids: ${production.length}. With 0 active retrieval opportunities: ${zeroRetrieval}.`, '');

  // NPC coverage
  o.push('# NPC Comprehension Coverage', '');
  o.push('## Trained "you will hear" sentences', '');
  o.push('Every expected-reply sentence id. "Quick response" does not exist as an exercise type in the runtime. "Said in a dialogue" = some NPC line in a mission that lists the sentence contains its wording.', '');
  o.push('| Sentence id | English | First | Repeated in | Listening drill | Meaning quiz (audio / distractor) | Cold open (correct / wrong) | Checkpoint exposure | Said in a dialogue |', '|---|---|---|---|---|---|---|---|---|');
  const receptive = [...firstEn.keys()].filter(isReply);
  for (const id of receptive) {
    const ms = use.get(id) ?? [];
    const drill = count(id, (s) => s.kind === 'replies' && s.replyIds.map(strip).includes(id));
    const quizA = count(id, (s) => s.kind === 'quiz' && strip(s.itemId) === id);
    const quizD = count(id, (s) => s.kind === 'quiz' && s.wrongIds.map(strip).includes(id));
    const coldC = count(id, (s) => s.kind === 'ambush' && strip(s.correctItemId) === id);
    const coldW = count(id, (s) => s.kind === 'ambush' && strip(s.wrongItemId) === id);
    const text = norm(firstEn.get(id)!);
    const said = ms.some((num) => Object.values(content('en', BOOTCAMP_PLAN[num - 1]!.day).dialogues).some((d) => d.nodes.some((x) => x.who === 'npc' && norm(x.en).includes(text))));
    o.push(`| \`${id}\` | ${firstEn.get(id)} | ${pad(ms[0] ?? 0)} | ${ms.slice(1).map(pad).join(', ') || '—'} | ${drill ? `yes (${drill})` : 'no'} | ${quizA} / ${quizD} | ${coldC} / ${coldW} | ${inCheckpoint(id) ? 'yes' : 'no'} | ${said ? 'yes' : '**no**'} |`);
  }
  o.push('', '## NPC questions the learner must understand that are never explicitly trained', '');
  o.push('Happy-path NPC lines containing a question, for which the mission has no expected-reply sentence with matching wording.', '');
  o.push('| Mission | Scene / node | NPC line |', '|---|---|---|');
  let untrained = 0;
  missions.forEach((m, i) => {
    for (const f of m.flags) {
      const hit = /^NPC question never trained.*: scene "([^"]+)" (\S+) — “(.*)”$/.exec(f);
      if (hit) { untrained++; o.push(`| ${pad(i + 1)} | ${hit[1]} / ${hit[2]} | ${hit[3]} |`); }
    }
  });
  o.push('', `Total: ${untrained}.`, '');

  // question bank
  o.push('# Complete Existing Question Bank', '');
  o.push('Every encoded question, compact. Listening questions (expected-reply, meaning-quiz) show MEANINGS on the buttons; quick-reply, dialogue-choice and cold-open show target-language lines; visual-match shows tiles; swap-it shows slot values; mini-map shows tappable map cells; match-pairs shows the answer tiles; sentence-builder shows the chunks in their correct order. ✅ marks every accepted choice; a dialogue screen can have several.', '');
  missions.forEach((m, i) => {
    o.push(`## Mission ${pad(i + 1)} — ${m.plan.title.en}`, '');
    if (!m.questions.length) o.push('No questions.', '');
    for (const qu of m.questions) {
      o.push(`**${qu.ref}** — ${qu.kind}`, `- Prompt: ${qu.promptUi}`, `- Audio: ${qu.audio.en} — (${qu.audioHe})`);
      qu.choices.forEach((c, k) => o.push(`- ${String.fromCharCode(65 + k)}: ${LISTEN_KINDS.includes(qu.kind) ? `${c.he} / ${c.en}` : c.en}${c.correct ? ' ✅' : ''}`));
      o.push(`- Correct: ${qu.choices.filter((c) => c.correct).map((c) => c.en).join(' | ')}`, `- Tests: ${qu.tests}`, '');
    }
  });

  const stats: PracticeAuditStats = {
    missions: missions.length,
    canonicalProduction: production.length,
    canonicalReceptive: receptive.length,
    sentenceListings: missions.reduce((k, m) => k + m.counts.production + m.counts.receptive + m.counts.kit, 0),
    expectedReplyItems: missions.reduce((k, m) => k + m.counts.replyItems, 0),
    meaningQuizzes: missions.reduce((k, m) => k + m.counts.meaning, 0),
    activePractice: missions.reduce((k, m) => k + m.counts.activePractice, 0),
    dialogueChoiceScreens: missions.reduce((k, m) => k + m.counts.dialogueChoices, 0),
    coldOpens: missions.reduce((k, m) => k + m.counts.coldOpens, 0),
    questions: allQuestions.length,
    answerChoices: allQuestions.reduce((k, x) => k + x.choices.length, 0),
    wrongBranches: missions.reduce((k, m) => k + m.counts.wrongBranches, 0),
    recoveryOpportunities: missions.reduce((k, m) => k + m.counts.recovery, 0),
    autoFlags: missions.reduce((k, m) => k + m.counts.flags, 0),
    zeroRetrieval,
  };
  o.push('# Totals', '');
  o.push(`- Missions exported: ${stats.missions}`, `- Learner-production sentence ids: ${stats.canonicalProduction}`, `- Expected-reply (receptive) sentence ids: ${stats.canonicalReceptive}`, `- Sentence listings across missions (with reuse): ${stats.sentenceListings}`);
  o.push(`- Expected-reply questions: ${stats.expectedReplyItems}`, `- Meaning quizzes: ${stats.meaningQuizzes}`, `- Active-practice questions: ${stats.activePractice}`, `- Dialogue choice screens: ${stats.dialogueChoiceScreens}`, `- Cold opens: ${stats.coldOpens}`);
  o.push(`- Total interactive questions: ${stats.questions}`, `- Total answer choices: ${stats.answerChoices}`, `- Wrong-answer branches: ${stats.wrongBranches}`, `- Recovery opportunities: ${stats.recoveryOpportunities}`);
  o.push(`- Learner sentences with 0 active retrieval opportunities: ${stats.zeroRetrieval}`, `- Auto-flags: ${stats.autoFlags}`, '');
  return { text: `${o.join('\n')}`, stats };
}

export function renderPracticeAudit(): string {
  return build().text;
}

export function practiceAuditStats(): PracticeAuditStats {
  return build().stats;
}

/** Every question of every Core mission (for the export's completeness test). */
export function allAuditQuestions(): { day: number; kind: QuestionKind; step: number; choices: number }[] {
  return BOOTCAMP_PLAN.flatMap((m) => questionsOf(m.day).map((x) => ({ day: m.day, kind: x.kind, step: x.step, choices: x.choices.length })));
}
