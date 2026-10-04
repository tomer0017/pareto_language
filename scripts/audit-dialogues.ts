/**
 * Dialogue Integrity Audit (Sprint: Pareto UX).
 *
 * The learning bug we are hunting: a learner picks a WRONG answer, yet the NPC continues the
 * conversation as if they had answered correctly. In tree terms that means a `correct: false`
 * choice whose `next` lands directly on the HAPPY PATH (the ideal run) — so the NPC never
 * acknowledges the wrong pick and the story silently proceeds.
 *
 * A well-formed wrong choice instead routes to a dedicated recovery beat (an NPC line that
 * reacts to what was actually said) and only then rejoins the happy path.
 *
 * This script imports the real mission data (no store/localStorage) and reports, per dialogue:
 *   [BLOCKER] wrong choice whose next ∈ happy-path nodes         → silent continuation
 *   [BLOCKER] wrong choice sharing its next with a correct sibling → identical NPC response
 *   [REVIEW ] every wrong branch + the NPC line it leads to        → human believability check
 *
 * Run: npx tsx scripts/audit-dialogues.ts
 */
import type { BootcampDayContent, BootcampDialogue } from '../apps/web/src/features/bootcamp/types.js';
import { BOOTCAMP_PLAN } from '../apps/web/src/features/bootcamp/plan.js';
import { DAYS as REGISTRY } from '../apps/web/src/features/bootcamp/registry.js';

/** Every Core mission, in journey order (plan.ts owns the order; the registry owns the content). */
const DAYS: BootcampDayContent[] = BOOTCAMP_PLAN.map((m) => REGISTRY[m.day]!);

/** The set of node ids visited on the ideal run (follow next; at a choice take the first correct). */
function happyPathNodes(d: BootcampDialogue): Set<string> {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  let node = byId.get(d.start);
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    if (node.who === 'you' && node.choices?.length) {
      const choice = node.choices.find((c) => c.correct) ?? node.choices[0]!;
      node = byId.get(choice.next);
      continue;
    }
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }
  return seen;
}

let blockers = 0;
let reviews = 0;

for (const day of DAYS) {
  for (const d of Object.values(day.dialogues)) {
    const byId = new Map(d.nodes.map((n) => [n.id, n]));
    const happy = happyPathNodes(d);
    for (const n of d.nodes) {
      if (!n.choices) continue;
      const correctTargets = new Set(n.choices.filter((c) => c.correct).map((c) => c.next));
      for (const c of n.choices) {
        if (c.correct) continue;
        const target = byId.get(c.next);
        const npcLine = target?.en ?? '(missing node)';
        // BLOCKER 1 — wrong pick lands on the happy path: NPC continues as if it were correct.
        if (happy.has(c.next)) {
          blockers++;
          console.info(`\n[BLOCKER] Day ${day.day} · ${d.id} · node ${n.id}`);
          console.info(`  wrong choice: "${c.en}"`);
          console.info(`  routes to happy-path node ${c.next} → NPC: "${npcLine}"`);
          console.info(`  → NPC never reacts to the wrong pick (silent continuation).`);
        } else if (correctTargets.has(c.next)) {
          // BLOCKER 2 — wrong pick shares its target with a correct sibling: identical response.
          blockers++;
          console.info(`\n[BLOCKER] Day ${day.day} · ${d.id} · node ${n.id}`);
          console.info(`  wrong choice: "${c.en}" shares next (${c.next}) with a CORRECT choice.`);
          console.info(`  → identical NPC response regardless of correctness.`);
        } else {
          reviews++;
          console.info(`\n[REVIEW ] Day ${day.day} · ${d.id} · node ${n.id}`);
          console.info(`  wrong choice: "${c.en}"`);
          console.info(`  → recovery beat ${c.next} (${target?.who}${target?.slow ? ', slow' : ''}) NPC: "${npcLine}"`);
        }
      }
    }
  }
}

console.info(`\n========================================`);
console.info(`Blockers (silent continuation): ${blockers}`);
console.info(`Wrong branches for human review : ${reviews}`);
console.info(`========================================`);
if (blockers > 0) process.exitCode = 1;
