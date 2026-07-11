/**
 * Pedagogical choice audit (learner's-eye view). For every 'you' choice node in every mission it
 * prints: the NPC prompt that precedes it, each option (✓ correct / ✗ wrong), and the NPC line the
 * option leads to — plus how quickly a wrong pick rejoins the happy path. This is the human-review
 * surface for believability, NOT a pass/fail gate.
 */
import type { BootcampDayContent, BootcampDialogue, DialogueNodeB } from '../apps/web/src/features/bootcamp/types.js';
import { DAY1 } from '../apps/web/src/features/bootcamp/day1.js';
import { DAY2 } from '../apps/web/src/features/bootcamp/day2.js';
import { DAY3 } from '../apps/web/src/features/bootcamp/day3.js';
import { DAY4 } from '../apps/web/src/features/bootcamp/day4.js';
import { DAY5 } from '../apps/web/src/features/bootcamp/day5.js';
import { DAY6 } from '../apps/web/src/features/bootcamp/day6.js';
import { DAY7 } from '../apps/web/src/features/bootcamp/day7.js';
import { DAY8 } from '../apps/web/src/features/bootcamp/day8.js';
import { DAY9 } from '../apps/web/src/features/bootcamp/day9.js';
import { DAY10 } from '../apps/web/src/features/bootcamp/day10.js';
import { DAY11 } from '../apps/web/src/features/bootcamp/day11.js';
import { DAY12 } from '../apps/web/src/features/bootcamp/day12.js';
import { DAY13 } from '../apps/web/src/features/bootcamp/day13.js';
import { DAY14 } from '../apps/web/src/features/bootcamp/day14.js';
import { DAY15 } from '../apps/web/src/features/bootcamp/day15.js';
import { DAY16 } from '../apps/web/src/features/bootcamp/day16.js';
import { DAY17 } from '../apps/web/src/features/bootcamp/day17.js';
import { DAY18 } from '../apps/web/src/features/bootcamp/day18.js';
import { DAY19 } from '../apps/web/src/features/bootcamp/day19.js';
import { DAY20 } from '../apps/web/src/features/bootcamp/day20.js';
import { DAY21 } from '../apps/web/src/features/bootcamp/day21.js';
import { DAY22 } from '../apps/web/src/features/bootcamp/day22.js';
import { DAY23 } from '../apps/web/src/features/bootcamp/day23.js';
import { DAY24 } from '../apps/web/src/features/bootcamp/day24.js';
import { DAY25 } from '../apps/web/src/features/bootcamp/day25.js';
import { DAY26 } from '../apps/web/src/features/bootcamp/day26.js';
import { DAY27 } from '../apps/web/src/features/bootcamp/day27.js';
import { DAY28 } from '../apps/web/src/features/bootcamp/day28.js';
import { DAY29 } from '../apps/web/src/features/bootcamp/day29.js';
import { DAY30 } from '../apps/web/src/features/bootcamp/day30.js';

const DAYS: BootcampDayContent[] = [
  DAY1, DAY2, DAY3, DAY4, DAY5, DAY6, DAY7, DAY8, DAY9, DAY10,
  DAY11, DAY12, DAY13, DAY14, DAY15, DAY16, DAY17, DAY18, DAY19, DAY20,
  DAY21, DAY22, DAY23, DAY24, DAY25, DAY26, DAY27, DAY28, DAY29, DAY30,
];

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
