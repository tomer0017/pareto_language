/**
 * Pedagogical choice audit (learner's-eye view). For every 'you' choice node in every mission it
 * prints: the NPC prompt that precedes it, each option (✓ correct / ✗ wrong), and the NPC line the
 * option leads to — plus how quickly a wrong pick rejoins the happy path. This is the human-review
 * surface for believability, NOT a pass/fail gate.
 */
import type { BootcampDayContent, BootcampDialogue, DialogueNodeB } from '../apps/web/src/features/bootcamp/types.js';
import { BOOTCAMP_PLAN } from '../apps/web/src/features/bootcamp/plan.js';
import { DAYS as REGISTRY } from '../apps/web/src/features/bootcamp/registry.js';

/** Every Core mission, in journey order (plan.ts owns the order; the registry owns the content). */
const DAYS: BootcampDayContent[] = BOOTCAMP_PLAN.map((m) => REGISTRY[m.day]!);

function precedingNpc(d: BootcampDialogue, nodeId: string): DialogueNodeB | undefined {
  return d.nodes.find((n) => n.next === nodeId || n.choices?.some((c) => c.next === nodeId));
}

/** How many NPC/you lines until a wrong pick's branch rejoins a happy-path node. */
function rejoinDepth(d: BootcampDialogue, startId: string, happy: Set<string>): number {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  let node = byId.get(startId);
  let depth = 0;
  const seen = new Set<string>();
  while (node && !seen.has(node.id) && depth < 20) {
    seen.add(node.id);
    if (happy.has(node.id)) return depth;
    if (node.choices?.length) { const c = node.choices.find((x) => x.correct) ?? node.choices[0]!; node = byId.get(c.next); }
    else if (node.next) node = byId.get(node.next);
    else break;
    depth++;
  }
  return depth;
}

function happyNodes(d: BootcampDialogue): Set<string> {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  let node = byId.get(d.start);
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    if (node.who === 'you' && node.choices?.length) { const c = node.choices.find((x) => x.correct) ?? node.choices[0]!; node = byId.get(c.next); continue; }
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }
  return seen;
}

for (const day of DAYS) {
  for (const d of Object.values(day.dialogues)) {
    const byId = new Map(d.nodes.map((n) => [n.id, n]));
    const happy = happyNodes(d);
    const choiceNodes = d.nodes.filter((n) => n.choices?.length);
    for (const n of choiceNodes) {
      const prompt = precedingNpc(d, n.id);
      const allCorrect = n.choices!.every((c) => c.correct);
      console.info(`\n■ Day ${day.day} · ${d.id} · ${n.id}${allCorrect ? '  [ALL-CORRECT: choice may feel inconsequential]' : ''}`);
      console.info(`  NPC asks: "${prompt?.en ?? '(scene start)'}"`);
      for (const c of n.choices!) {
        const react = byId.get(c.next);
        const depth = c.correct ? 0 : rejoinDepth(d, c.next, happy);
        const tag = c.correct ? '✓' : `✗ (rejoins in ${depth} line${depth === 1 ? '' : 's'})`;
        console.info(`    ${tag} "${c.en}"  →  NPC: "${react?.en ?? '(?)'}"`);
      }
    }
  }
}
