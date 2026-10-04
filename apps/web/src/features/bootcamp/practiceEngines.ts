import type { BootcampItem, BootcampStep, MapCell, QuickReplyRound, SpokenLine, SwapRound } from './types.js';

/**
 * Pure logic of the four active-practice engines (Quick Reply · Visual Match · Swap It · Mini Map).
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

/** Authoring mistakes in one practice step (empty = sound). `itemIds` are the mission's sentences. */
export function validatePracticeStep(step: BootcampStep, itemIds: ReadonlySet<string>): string[] {
  const issues: string[] = [];
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
  return [];
}

export type { StepOf };
