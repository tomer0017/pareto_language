import { mulberry32, shuffle } from '../../shared/util/shuffle.js';
import type { BootcampItem, BootcampStep, MapCell, MatchPair, QuickReplyRound, SpokenLine, SwapRound } from './types.js';

/**
 * Pure logic of the active-practice engines (Quick Reply · Visual Match · Swap It · Mini Map ·
 * Match Pairs · Sentence Builder).
 * Everything a test needs — what a round shows, which answers are accepted, whether an authored
 * step is well-formed — lives here, free of React, so the content can be validated without a browser.
 */

export const SLOT = '___';

/** The completed sentence of a Swap It option: the frame with its slot filled. Authored content is
 *  only slot values, so every sentence the learner can produce is derived — never typed twice. */
export const fillFrame = (frame: string, slot: string): string => frame.replace(SLOT, slot);

/** The frame split around its slot, for rendering the blank. */
export function frameParts(frame: string): [before: string, after: string] {
  const at = frame.indexOf(SLOT);
  return at === -1 ? [frame, ''] : [frame.slice(0, at), frame.slice(at + SLOT.length)];
}

export interface QuickReplyPrompt {
  /** The line that is spoken (absent for a situation round — nothing is played). */
  spoken?: SpokenLine;
  itemId?: string;
}

/** What a Quick Reply round plays: one of the mission's own heard sentences, or a line of its own. */
export function quickReplyPrompt(round: QuickReplyRound, itemsById: Map<string, BootcampItem>): QuickReplyPrompt {
  if (round.promptItemId) {
    const item = itemsById.get(round.promptItemId);
    if (item) return { spoken: { en: item.text, he: item.meaning.he ?? '', tr: item.meaning }, itemId: item.id };
  }
  return round.npc ? { spoken: round.npc } : {};
}

/** What a Quick Reply button says: the sentence itself, unless the round wraps it. */
export const quickReplyLabel = (option: QuickReplyRound['options'][number], itemsById: Map<string, BootcampItem>): string =>
  option.text ?? itemsById.get(option.itemId)?.text ?? '';

export const tappableCells = (cells: MapCell[]): MapCell[] => cells.filter((c) => c.tappable);

type StepOf<K extends BootcampStep['kind']> = Extract<BootcampStep, { kind: K }>;

/** The six conversation-help tools of the Recovery Toolkit (not the courtesies "Thank you!" / "Sorry!"). */
export const isHelpToolId = (id: string | undefined): boolean =>
  /\.phrase\.recovery\.(dont-understand|repeat|slowly|one-moment|show-me|what-mean)$/.test(id ?? '');

/* ── Match Pairs ───────────────────────────────────────────────────────────────────────────────── */

export type MatchSide = 'prompt' | 'answer';
export interface MatchState {
  /** Pair indexes already connected (locked). */
  matched: number[];
  /** The tile waiting for its partner. */
  picked: { side: MatchSide; pair: number } | null;
  misses: number;
}
export const newMatch = (): MatchState => ({ matched: [], picked: null, misses: 0 });

export interface MatchTap {
  state: MatchState;
  /** selected = waiting for the other side · matched = pair locked · missed = wrong partner · ignored = tile already locked */
  outcome: 'selected' | 'matched' | 'missed' | 'ignored';
  /** The pair whose prompt was being answered — what a hit or a miss is recorded against. */
  attempted?: number;
  complete: boolean;
}

/** One tap on the board. A tile is addressed by the pair it belongs to, whatever its position. */
export function matchTap(pairCount: number, state: MatchState, side: MatchSide, pair: number): MatchTap {
  const complete = (st: MatchState): boolean => st.matched.length >= pairCount;
  if (state.matched.includes(pair)) return { state, outcome: 'ignored', complete: complete(state) };
  // First tap, or a second tap on the same side: (re)select.
  if (!state.picked || state.picked.side === side) {
    const next = { ...state, picked: { side, pair } };
    return { state: next, outcome: 'selected', complete: false };
  }
  const attempted = side === 'prompt' ? pair : state.picked.pair;
  if (state.picked.pair === pair) {
    const next = { ...state, matched: [...state.matched, pair], picked: null };
    return { state: next, outcome: 'matched', attempted, complete: complete(next) };
  }
  return { state: { ...state, picked: null, misses: state.misses + 1 }, outcome: 'missed', attempted, complete: false };
}

/** What a tap is worth in the practice history: nothing for a selection, pass/fail for an attempt —
 *  recorded on the learner's ANSWER sentence of the pair whose question was being answered. */
export function matchRecord(pairs: MatchPair[], tap: MatchTap): { itemId: string; outcome: 'pass' | 'fail' } | null {
  if (tap.attempted === undefined || (tap.outcome !== 'matched' && tap.outcome !== 'missed')) return null;
  return { itemId: pairs[tap.attempted]!.answerItemId, outcome: tap.outcome === 'matched' ? 'pass' : 'fail' };
}

/** What a tap makes audible: a question is something you HEAR, so selecting it plays it; a locked
 *  pair plays the learner's answer. Selecting an answer, a miss or a dead tile plays nothing. */
export const matchSpeaks = (tap: MatchTap, side: MatchSide): MatchSide | null =>
  tap.outcome === 'matched' ? 'answer' : tap.outcome === 'selected' && side === 'prompt' ? 'prompt' : null;

/** The order the answer tiles are shown in (a permutation of pair indexes). */
export const matchAnswerOrder = (pairCount: number, seed: number): number[] => shuffle(Array.from({ length: pairCount }, (_, i) => i), mulberry32(seed));

/* ── Sentence Builder ──────────────────────────────────────────────────────────────────────────── */

/** The sentence a list of chunks spells: chunks joined by single spaces — nothing is generated. */
export const builderSentence = (chunks: readonly string[], order?: readonly number[]): string =>
  (order ? order.map((i) => chunks[i] ?? '') : chunks).join(' ');

/** The order the chunk tiles are offered in — shuffled, and never already solved when that is avoidable. */
export function builderPool(chunks: readonly string[], seed: number): number[] {
  const solved = builderSentence(chunks);
  let order = chunks.map((_, i) => i);
  for (let attempt = 0; attempt < 8; attempt++) {
    order = shuffle(chunks.map((_, i) => i), mulberry32(seed + attempt));
    if (builderSentence(chunks, order) !== solved) break;
  }
  return order;
}

/** All chunks placed, and they read as the sentence. Compared as TEXT, so two identical chunks may swap. */
export const builderSolved = (chunks: readonly string[], placed: readonly number[]): boolean =>
  placed.length === chunks.length && builderSentence(chunks, placed) === builderSentence(chunks);

/** A hint: keep what is already right from the start, and place the next chunk. */
export function builderHint(chunks: readonly string[], placed: readonly number[]): number[] {
  let k = 0;
  while (k < placed.length && k < chunks.length && chunks[placed[k]!] === chunks[k]) k++;
  return chunks.map((_, i) => i).slice(0, Math.min(chunks.length, k + 1));
}

/** Authoring mistakes in one practice step (empty = sound). `itemIds` are the mission's sentences;
 *  `textOf` (optional) gives a sentence's wording, for checks that need it. */
export function validatePracticeStep(step: BootcampStep, itemIds: ReadonlySet<string>, textOf?: (id: string) => string | undefined): string[] {
  const issues: string[] = [];
  if (step.kind === 'matchPairs') {
    if (step.pairs.length < 2 || step.pairs.length > 4) issues.push('matchPairs: needs 2–4 pairs');
    step.pairs.forEach((p, i) => {
      if (!itemIds.has(p.promptItemId)) issues.push(`matchPairs pair ${i + 1}: prompt → ${p.promptItemId}`);
      if (!itemIds.has(p.answerItemId)) issues.push(`matchPairs pair ${i + 1}: answer → ${p.answerItemId}`);
    });
    step.pairs.forEach((p, i) => {
      if (p.answerLabel !== undefined && !p.answerLabel.trim()) issues.push(`matchPairs pair ${i + 1}: empty answer label`);
      // The same sentence on both sides only makes sense when the answer tile is a number / icon.
      if (p.promptItemId === p.answerItemId && !p.answerLabel) issues.push(`matchPairs pair ${i + 1}: a sentence is paired with itself`);
    });
    const shown = step.pairs.map((p) => p.answerLabel ?? p.answerText).filter((x): x is string => x !== undefined);
    if (new Set(shown).size !== shown.length) issues.push('matchPairs: two answer tiles look the same');
    if (new Set(step.pairs.map((p) => p.promptItemId)).size !== step.pairs.length) issues.push('matchPairs: a prompt appears twice');
    if (new Set(step.pairs.map((p) => p.answerItemId)).size !== step.pairs.length) issues.push('matchPairs: an answer appears twice');
  }
  if (step.kind === 'sentenceBuilder') {
    step.rounds.forEach((r, i) => {
      const at = `sentenceBuilder round ${i + 1}`;
      if (!itemIds.has(r.itemId)) issues.push(`${at}: item → ${r.itemId}`);
      if (r.chunks.length < 3 || r.chunks.length > 6) issues.push(`${at}: needs 3–6 chunks`);
      if (r.chunks.some((c) => !c.trim() || c !== c.trim())) issues.push(`${at}: empty or padded chunk`);
      const text = textOf?.(r.itemId);
      if (text !== undefined && builderSentence(r.chunks) !== text) issues.push(`${at}: chunks spell “${builderSentence(r.chunks)}”, the sentence is “${text}”`);
    });
  }
  if (step.kind === 'quickReply') {
    step.rounds.forEach((r, i) => {
      const at = `quickReply round ${i + 1}`;
      const sources = [r.promptItemId, r.npc, r.situation].filter((x) => x !== undefined).length;
      if (sources !== 1) issues.push(`${at}: needs exactly one of promptItemId / npc / situation`);
      if (r.promptItemId && !itemIds.has(r.promptItemId)) issues.push(`${at}: prompt → ${r.promptItemId}`);
      if (r.options.length < 2 || r.options.length > 3) issues.push(`${at}: needs 2–3 responses`);
      if (!r.options.some((o) => o.correct)) issues.push(`${at}: no accepted response`);
      if (r.options.every((o) => o.correct)) issues.push(`${at}: every response is accepted`);
      if (new Set(r.options.map((o) => o.itemId)).size !== r.options.length) issues.push(`${at}: duplicate response`);
      for (const o of r.options) if (!itemIds.has(o.itemId)) issues.push(`${at}: response → ${o.itemId}`);
    });
  }
  if (step.kind === 'visualMatch') {
    const ids = step.tiles.map((x) => x.id);
    if (step.tiles.length < 2 || step.tiles.length > 9) issues.push('visualMatch: needs 2–9 tiles');
    if (new Set(ids).size !== ids.length) issues.push('visualMatch: duplicate tile id');
    if (new Set(step.tiles.map((x) => `${x.emoji ?? ''}${x.label ?? ''}${x.image ?? ''}`)).size !== ids.length) issues.push('visualMatch: two tiles look the same');
    for (const x of step.tiles) if (!x.label && !x.emoji && !x.image) issues.push(`visualMatch: tile ${x.id} shows nothing`);
    step.rounds.forEach((r, i) => {
      if (!ids.includes(r.correct)) issues.push(`visualMatch round ${i + 1}: correct tile → ${r.correct}`);
      if (r.itemId && !itemIds.has(r.itemId)) issues.push(`visualMatch round ${i + 1}: item → ${r.itemId}`);
      if (!r.audio.en.trim()) issues.push(`visualMatch round ${i + 1}: nothing to hear`);
    });
  }
  if (step.kind === 'swap') {
    step.rounds.forEach((r, i) => {
      const at = `swap round ${i + 1}`;
      if (r.frame.split(SLOT).length !== 2) issues.push(`${at}: the frame needs exactly one ${SLOT}`);
      if (r.itemId && !itemIds.has(r.itemId)) issues.push(`${at}: item → ${r.itemId}`);
      if (r.options.length < 2 || r.options.length > 3) issues.push(`${at}: needs 2–3 slot values`);
      if (r.options.filter((o) => o.correct).length !== 1) issues.push(`${at}: needs exactly one value that matches the cue`);
      if (new Set(r.options.map((o) => o.slot)).size !== r.options.length) issues.push(`${at}: duplicate slot value`);
      for (const o of r.options) if (!o.slot.trim() || !o.meaning.he || !o.meaning.en) issues.push(`${at}: incomplete value "${o.slot}"`);
    });
  }
  if (step.kind === 'miniMap') {
    step.rounds.forEach((r, i) => {
      const at = `miniMap round ${i + 1}`;
      const taps = tappableCells(r.cells);
      if (taps.length < 2) issues.push(`${at}: needs at least two tappable cells`);
      if (!taps.some((c) => c.id === r.correct)) issues.push(`${at}: correct cell → ${r.correct}`);
      if (new Set(r.cells.map((c) => `${c.row},${c.col}`)).size !== r.cells.length) issues.push(`${at}: two cells share a position`);
      if (new Set(r.cells.map((c) => c.id)).size !== r.cells.length) issues.push(`${at}: duplicate cell id`);
      if (r.itemId && !itemIds.has(r.itemId)) issues.push(`${at}: item → ${r.itemId}`);
    });
  }
  return issues;
}

/** Rows of a swap round as the learner can build them: every slot value, as a full sentence. */
export const swapSentences = (round: SwapRound): string[] => round.options.map((o) => fillFrame(round.frame, o.slot));

/** Sentence ids a practice step lets the learner actively retrieve (pick as their own line). */
export function retrievedItemIds(step: BootcampStep): string[] {
  if (step.kind === 'quickReply') return step.rounds.flatMap((r) => r.options.map((o) => o.itemId));
  if (step.kind === 'swap') return step.rounds.flatMap((r) => (r.itemId ? [r.itemId] : []));
  if (step.kind === 'matchPairs') return step.pairs.map((p) => p.answerItemId);
  if (step.kind === 'sentenceBuilder') return step.rounds.map((r) => r.itemId);
  return [];
}

export type { StepOf };
