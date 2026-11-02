import type { CheckpointPlan } from './checkpoint.js';
import { auditWords, type PriorLearning } from './priorLearning.js';

/**
 * CHECKPOINT-ONLY TRANSPARENT RECOMBINATION — the narrow rule a checkpoint needs, and nothing more.
 *
 * A checkpoint retells earlier conversations in their own words, and the other person's lines are
 * sometimes worded a little differently from where they were taught ("Passport, please." where
 * Mission 06 said "Passport?" and Mission 08 "Your passport, please."). Such a line may be treated as
 * retrievable ONLY when it is a transparent recombination of what was verifiably learned before:
 *   - every meaningful chunk of it (each phrase between punctuation) is either a chunk an earlier
 *     mission taught, or made only of words an earlier mission taught with their meaning;
 *   - so no new lexical item, and no new concept, can enter.
 * The learner's own lines get NO such allowance: each must be a chunk an earlier mission taught, or
 * chunks an earlier mission taught said one after the other ("Stop here, please. Keep the change.").
 *
 * This lives here, beside the checkpoint, on purpose: `learnedBefore`, `unpreparedWords` and
 * `unpreparedChunks` are unchanged and stay as strict as they are for every mission.
 */

/** `taught` — the line itself was taught · `chunks` — each of its chunks was · `recombined` — some
 *  chunk is new as a chunk, but made only of taught words · `unknown` — a word nobody taught. */
export type TransferHow = 'taught' | 'chunks' | 'recombined' | 'unknown';
export interface TransferResult { text: string; how: TransferHow; unknown: string[] }

/** The meaningful chunks of a line: the phrases between its punctuation. */
export const lineChunks = (text: string): string[] => text.split(/[,.!?¿¡…;:—]+/u).map((c) => c.trim()).filter((c) => auditWords(c).length > 0);

/** Whether a line is retrievable from what was learned before — and how. */
export function checkpointTransfer(text: string, prior: PriorLearning): TransferResult {
  if (prior.knowsChunk(text)) return { text, how: 'taught', unknown: [] };
  const fresh = lineChunks(text).filter((c) => !prior.knowsChunk(c));
  if (fresh.length === 0) return { text, how: 'chunks', unknown: [] };
  const unknown = [...new Set(fresh.flatMap((c) => auditWords(c).filter((w) => !prior.words.has(w))))];
  return { text, how: unknown.length ? 'unknown' : 'recombined', unknown };
}

export interface CheckpointAuditRow { where: string; role: 'say' | 'hear'; result: TransferResult }

/** Every line of the checkpoint, judged. A row fails when a learner line was not taught as such, or
 *  when any line brings a word nobody taught. */
export function auditCheckpoint(plan: CheckpointPlan, prior: PriorLearning): { rows: CheckpointAuditRow[]; failures: string[] } {
  const rows: CheckpointAuditRow[] = [];
  const add = (where: string, role: 'say' | 'hear', text: string): void => { rows.push({ where, role, result: checkpointTransfer(text, prior) }); };
  for (const turn of plan.turns) {
    add(`${turn.id} cue`, 'hear', turn.cue.en);
    if (turn.kind === 'say') for (const o of [turn.answer, ...turn.wrong]) add(`${turn.id} option ${o.conceptId}`, 'say', o.text);
  }
  for (const s of plan.scenes) if (s.closing) add(`${s.id} closing`, 'hear', s.closing.en);
  const failures = rows.filter((r) => r.result.how === 'unknown' || (r.role === 'say' && r.result.how === 'recombined'))
    .map((r) => `${r.where}: “${r.result.text}” — ${r.result.how === 'unknown' ? `unknown ${r.result.unknown.join(', ')}` : 'a learner line must be made of taught chunks'}`);
  return { rows, failures };
}
