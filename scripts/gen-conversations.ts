/**
 * Generate docs/BOOTCAMP_CONVERSATIONS.md from the REAL Bootcamp source data.
 *
 * This is a documentation extractor, not app code: it imports the mission data files directly
 * (no store / no localStorage) and renders every mission's phrases, expected replies, recovery
 * tools, cold open, and dialogue (happy path + the important wrong/recovery branches) into one
 * human-reviewable Markdown file. Regenerate after any Bootcamp content change:
 *
 *     npm run gen:conversations
 *
 * It never invents content — everything below is read straight from the source.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN, PHASES } from '../apps/web/src/features/bootcamp/plan.js';
import { dialogueTranscript } from '../apps/web/src/features/bootcamp/transcript.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../apps/web/src/features/bootcamp/types.js';
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

const isRecovery = (id: string): boolean => id.startsWith('en.phrase.recovery.');
const isReply = (id: string): boolean => id.startsWith('en.reply.');
const isPhrase = (id: string): boolean => id.startsWith('en.phrase.') && !isRecovery(id);

const itemLine = (i: BootcampItem): string => {
  const tip = i.tip ? ` — _${i.tip.he}_` : '';
  return `- **${i.text}** · ${i.meaning.he}${tip}`;
};

/** The important wrong/recovery branches of one dialogue: each less-useful pick + its coaching
 *  (if any) + the recovery beat it routes into. */
function recoveryBranches(d: BootcampDialogue): string[] {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const out: string[] = [];
  for (const n of d.nodes) {
    for (const c of n.choices ?? []) {
      if (c.correct && !c.coach) continue; // only the teaching branches
      const target = byId.get(c.next);
      const label = c.correct ? '↩︎ alt' : '⚠︎ less useful';
      const coach = c.coach ? ` — coach: _${c.coach.he}_` : '';
      const beat = target && target.who === 'npc' && target.en ? ` → 🧑 “${target.en}” · ${target.he}` : '';
      out.push(`- ${label}: 🫵 “${c.en || c.he}”${coach}${beat}`);
    }
  }
  return out;
}

function renderMission(day: BootcampDayContent): string {
  const plan = BOOTCAMP_PLAN.find((m) => m.day === day.day);
  const phase = plan ? PHASES.find((p) => p.n === plan.phase) : undefined;
  const items = day.items;
  const phrases = items.filter((i) => isPhrase(i.id));
  const replies = items.filter((i) => isReply(i.id));
  const recovery = items.filter((i) => isRecovery(i.id));

  const repliesSteps = day.steps.filter((s): s is Extract<typeof s, { kind: 'replies' }> => s.kind === 'replies');
  const ambushSteps = day.steps.filter((s): s is Extract<typeof s, { kind: 'ambush' }> => s.kind === 'ambush');
  const itemById = new Map(items.map((i) => [i.id, i]));

  const lines: string[] = [];
  const checkpoint = plan?.checkpoint ? ' · 🏁 CHECKPOINT' : '';
  lines.push(`## Mission ${day.day} — ${day.title.en} · ${day.title.he}`);
  lines.push('');
  lines.push(`> Phase ${plan?.phase ?? '—'} · ${phase ? `${phase.icon} ${phase.title.en}` : '—'}${checkpoint}`);
  lines.push('');
  if (plan) {
    lines.push(`**Objective:** ${plan.objective.en} · ${plan.objective.he}`);
    lines.push('');
    lines.push(`**Confidence gain:** ${plan.confidenceGain.en} · ${plan.confidenceGain.he}`);
    lines.push('');
    lines.push(`**Estimated time:** ~${plan.minutes} min`);
    lines.push('');
  }
  const video = day.introVideo;
  lines.push(`**Video:** ${video ? `\`${video.src}\`` : '— (none yet)'}`);
  lines.push('');

  if (phrases.length) {
    lines.push('### Core phrases (you say)');
    for (const i of phrases) lines.push(itemLine(i));
    lines.push('');
  }
  if (replies.length) {
    lines.push('### Expected replies (you hear)');
    for (const i of replies) lines.push(itemLine(i));
    lines.push('');
  }
  if (repliesSteps.length) {
    const trained = repliesSteps.flatMap((s) => s.replyIds).map((id) => itemById.get(id)?.text).filter(Boolean);
    if (trained.length) {
      lines.push(`_Reply-training drill:_ ${trained.map((t) => `“${t}”`).join(' · ')}`);
      lines.push('');
    }
  }
  if (recovery.length) {
    lines.push('### Recovery tools reused');
    lines.push(recovery.map((i) => `\`${i.text}\``).join(' · '));
    lines.push('');
  }

  // Cold open(s)
  if (ambushSteps.length) {
    lines.push('### Cold open (ambush)');
    for (const a of ambushSteps) {
      const correct = itemById.get(a.correctItemId);
      const wrong = itemById.get(a.wrongItemId);
      lines.push(`- 🧑 (fast) “${a.npc.en}” · ${a.npc.he}`);
      lines.push(`  - ✅ best move: **${correct?.text ?? a.correctItemId}** · ${correct?.meaning.he ?? ''}`);
      lines.push(`  - ✗ distractor: ${wrong?.text ?? a.wrongItemId}`);
    }
    lines.push('');
  }

  // Dialogues
  for (const [id, d] of Object.entries(day.dialogues)) {
    lines.push(`### Dialogue: \`${id}\` — happy path`);
    for (const l of dialogueTranscript(d)) {
      const who = l.who === 'you' ? '🫵 You' : '🧑 Them';
      lines.push(`- **${who}:** “${l.en}” · ${l.he}`);
    }
    lines.push('');
    const branches = recoveryBranches(d);
    if (branches.length) {
      lines.push('#### Wrong / recovery branches');
      lines.push(...branches);
      lines.push('');
    }
  }

  // Review status
  const missingHe = items.some((i) => !i.meaning.he?.trim());
  lines.push('### Review status');
  lines.push(`- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**`);
  lines.push(`- ${missingHe ? '⚠️ missing Hebrew translation on at least one item' : '✅ all items have Hebrew'}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

const header = `# READY Bootcamp — Conversations & Content (all 30 missions)

> **Auto-generated** from the Bootcamp source data by \`scripts/gen-conversations.ts\`.
> Do not edit by hand — edit the mission files under \`apps/web/src/features/bootcamp/\`,
> then run \`npm run gen:conversations\`. This file is a human-review surface for the actual
> in-app content: phrases, expected replies, recovery tools, cold opens and dialogues.

**Legend:** 🧑 the other person (NPC) · 🫵 you (the learner) · ✅ best move · ⚠︎ less useful pick ·
↩︎ alternate valid line. Dialogues show the **happy path** (the ideal run) plus the important
**wrong / recovery branches** that teach why a pick is more or less useful.

Missions are dialogue trees; the happy path is the canonical conversation used by the in-app
transcript reader. Checkpoints (10, 18, 24, 30) and a few integration days reuse earlier items
and carry no new phrases — that is expected, not missing content.

---

`;

const body = DAYS.map(renderMission).join('\n');
const out = fileURLToPath(new URL('../docs/BOOTCAMP_CONVERSATIONS.md', import.meta.url));
writeFileSync(out, header + body, 'utf8');
console.info(`✓ wrote ${out} (${DAYS.length} missions)`);
