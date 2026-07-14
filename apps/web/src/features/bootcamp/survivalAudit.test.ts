import { describe, expect, it } from 'vitest';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent } from './types.js';

/**
 * Survival Quiz data audit (Sprint item 7). Audits EVERY interactive answer surface across ALL
 * languages so the question↔answer mapping is always sound and no learner can be told a natural,
 * correct reply is "wrong":
 *  - dialogue choice nodes: at least one `correct` choice, every `itemId` resolves to a real trained
 *    item, and every `next` points at a real node (no dead branch / broken survival route);
 *  - quiz steps: the correct itemId + all wrongIds resolve and are distinct from the answer;
 *  - ambush steps: correct and wrong item ids resolve and differ.
 * Pure data check — runs over the shipped mission content, no UI.
 */

type Issue = string;

function auditDay(lang: string, day: BootcampDayContent): Issue[] {
  const issues: Issue[] = [];
  const itemIds = new Set(day.items.map((i) => i.id));
  const at = (msg: string) => `[${lang} day ${day.day}] ${msg}`;

  // Quiz + ambush steps reference items by id — every reference must resolve, answers must be distinct.
  for (const step of day.steps) {
    if (step.kind === 'quiz') {
      if (!itemIds.has(step.itemId)) issues.push(at(`quiz answer "${step.itemId}" is not a trained item`));
      for (const w of step.wrongIds) {
        if (!itemIds.has(w)) issues.push(at(`quiz distractor "${w}" is not a trained item`));
        if (w === step.itemId) issues.push(at(`quiz distractor equals the correct answer "${w}"`));
      }
      if (new Set(step.wrongIds).size !== step.wrongIds.length) issues.push(at(`quiz "${step.itemId}" has duplicate distractors`));
    }
    if (step.kind === 'ambush') {
      if (!itemIds.has(step.correctItemId)) issues.push(at(`ambush correct "${step.correctItemId}" is not a trained item`));
      if (!itemIds.has(step.wrongItemId)) issues.push(at(`ambush wrong "${step.wrongItemId}" is not a trained item`));
      if (step.correctItemId === step.wrongItemId) issues.push(at(`ambush correct === wrong ("${step.correctItemId}")`));
    }
  }

  // Dialogue choice nodes: sound question↔answer mapping + resolvable survival routes.
  for (const dlg of Object.values(day.dialogues)) {
    const nodeIds = new Set(dlg.nodes.map((n) => n.id));
    for (const node of dlg.nodes) {
      if (!node.choices || node.choices.length === 0) continue;
      const correct = node.choices.filter((c) => c.correct);
      if (correct.length === 0) issues.push(at(`dialogue "${dlg.id}" node "${node.id}" has NO correct choice`));
      for (const c of node.choices) {
        if (c.itemId && !itemIds.has(c.itemId)) issues.push(at(`dialogue "${dlg.id}" node "${node.id}" choice itemId "${c.itemId}" is not a trained item`));
        if (!nodeIds.has(c.next)) issues.push(at(`dialogue "${dlg.id}" node "${node.id}" choice → "${c.next}" is a broken branch`));
      }
    }
  }
  return issues;
}

describe('Survival Quiz data audit (all languages)', () => {
  for (const [lang, missions] of Object.entries(MISSIONS_BY_LANG)) {
    it(`${lang}: every question↔answer mapping is sound (natural answer correct, references resolve)`, () => {
      const issues = Object.values(missions).flatMap((d) => auditDay(lang, d));
      expect(issues, `\n${issues.join('\n')}`).toEqual([]);
    });
  }
});
