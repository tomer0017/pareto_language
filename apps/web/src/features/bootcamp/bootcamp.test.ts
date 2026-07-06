import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN, PHASES } from './plan.js';
import { DAY1 } from './day1.js';
import { DAY2 } from './day2.js';
import { DAY3 } from './day3.js';
import { DAY4 } from './day4.js';
import { DAY5 } from './day5.js';
import { DAY6 } from './day6.js';
import { DAY7 } from './day7.js';
import { DAY8 } from './day8.js';
import { DAY9 } from './day9.js';
import { DAY10 } from './day10.js';

// Pure-data registry (avoids importing the store, which loads the app/zustand chain).
const DAYS: Record<number, BootcampDayContent> = { 1: DAY1, 2: DAY2, 3: DAY3, 4: DAY4, 5: DAY5, 6: DAY6, 7: DAY7, 8: DAY8, 9: DAY9, 10: DAY10 };
import type { BootcampDayContent, BootcampDialogue } from './types.js';

/**
 * Mission data integrity (Sprint 7). The pedagogy is enforced by tests, not convention:
 * dialogue trees must be sound (no dead ends, wrong choices branch and return), every
 * reference must resolve, and depth/ordering rules hold per mission.
 */

/** Graph validator: every target resolves, an end exists and is reachable, choices are sane. */
function validateDialogue(d: BootcampDialogue): string[] {
  const issues: string[] = [];
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  if (!byId.has(d.start)) issues.push(`start ${d.start} missing`);
  let hasEnd = false;
  for (const n of d.nodes) {
    if (n.end) hasEnd = true;
    if (n.next && !byId.has(n.next)) issues.push(`${n.id} → missing ${n.next}`);
    if (n.who === 'you' && !n.next && !n.choices?.length && !n.end) issues.push(`${n.id}: you-node with no way forward`);
    for (const c of n.choices ?? []) {
      if (!byId.has(c.next)) issues.push(`${n.id} choice "${c.en}" → missing ${c.next}`);
    }
    if (n.choices && !n.choices.some((c) => c.correct)) issues.push(`${n.id}: no correct choice`);
  }
  if (!hasEnd) issues.push('no end node');
  // Reachability: BFS from start must reach an end node.
  const seen = new Set<string>();
  const queue = [d.start];
  let reachedEnd = false;
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const n = byId.get(id);
    if (!n) continue;
    if (n.end) reachedEnd = true;
    if (n.next) queue.push(n.next);
    for (const c of n.choices ?? []) queue.push(c.next);
  }
  if (!reachedEnd) issues.push('end unreachable from start');
  const unreachable = d.nodes.filter((n) => !seen.has(n.id));
  if (unreachable.length > 0) issues.push(`unreachable nodes: ${unreachable.map((n) => n.id).join(',')}`);
  return issues;
}

/** Every step/dialogue reference in a mission must resolve to a real item. */
function validateMission(day: BootcampDayContent): string[] {
  const issues: string[] = [];
  const ids = new Set(day.items.map((i) => i.id));
  for (const step of day.steps) {
    if (step.kind === 'tool' && !ids.has(step.itemId)) issues.push(`tool → ${step.itemId}`);
    if (step.kind === 'quiz') {
      if (!ids.has(step.itemId)) issues.push(`quiz → ${step.itemId}`);
      for (const w of step.wrongIds) if (!ids.has(w)) issues.push(`quiz wrong → ${w}`);
    }
    if (step.kind === 'replies') {
      if (!ids.has(step.saidItemId)) issues.push(`replies said → ${step.saidItemId}`);
      for (const r of step.replyIds) if (!ids.has(r)) issues.push(`replies → ${r}`);
    }
    if (step.kind === 'swipe') for (const id of step.itemIds) if (!ids.has(id)) issues.push(`swipe → ${id}`);
    if (step.kind === 'ambush') {
      if (!ids.has(step.correctItemId)) issues.push(`ambush correct → ${step.correctItemId}`);
      if (!ids.has(step.wrongItemId)) issues.push(`ambush wrong → ${step.wrongItemId}`);
    }
    if (step.kind === 'dialogue' && !day.dialogues[step.dialogueId]) issues.push(`dialogue → ${step.dialogueId}`);
  }
  for (const d of Object.values(day.dialogues)) {
    issues.push(...validateDialogue(d).map((x) => `${d.id}: ${x}`));
    for (const n of d.nodes) for (const c of n.choices ?? []) {
      if (c.itemId && !ids.has(c.itemId)) issues.push(`${d.id}/${n.id}: choice item → ${c.itemId}`);
    }
  }
  return issues;
}

describe('30-mission roadmap (Sprint 7 Part 1)', () => {
  it('has 30 missions across 5 phases with full metadata', () => {
    expect(BOOTCAMP_PLAN.length).toBe(30);
    expect(BOOTCAMP_PLAN.map((m) => m.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(PHASES.length).toBe(5);
    for (const m of BOOTCAMP_PLAN) {
      expect(PHASES.some((p) => p.n === m.phase)).toBe(true);
      expect(m.title.he && m.title.en).toBeTruthy();
      expect(m.why.length).toBeGreaterThan(10);
      expect(m.preparesNext.length).toBeGreaterThan(10);
      expect(m.minutes).toBeGreaterThanOrEqual(18);
    }
  });

  it('checkpoints sit at 10, 18, 24 and the finale — cold integration, no new content', () => {
    const cps = BOOTCAMP_PLAN.filter((m) => m.checkpoint).map((m) => m.day);
    expect(cps).toEqual([10, 18, 24, 30]);
    for (const cp of BOOTCAMP_PLAN.filter((m) => m.checkpoint)) {
      expect(cp.targets.concepts).toBe(0);
      expect(cp.targets.phrases).toBe(0);
    }
  });
});

describe('all built missions are structurally sound', () => {
  const built = Object.entries(DAYS);
  it('has the Sprint-8 missions built (1-10)', () => {
    expect(Object.keys(DAYS).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  for (const [num, day] of built) {
    it(`mission ${num} passes reference + dialogue-graph validation`, () => {
      expect(validateMission(day)).toEqual([]);
    });
    it(`mission ${num} is dialogue-deep and ends with evidence + summary`, () => {
      const kinds = day.steps.map((s) => s.kind);
      expect(kinds).toContain('dialogue');
      expect(kinds.filter((k) => k === 'receipt').length).toBeGreaterThanOrEqual(2);
      expect(kinds.at(-1)).toBe('summary');
      // Every 'you' choice node offers at least one recovery-tool escape hatch OR a valid line.
      for (const d of Object.values(day.dialogues)) {
        for (const n of d.nodes) {
          if (n.choices) expect(n.choices.some((c) => c.correct)).toBe(true);
        }
      }
    });
  }
  it('non-checkpoint missions train expected replies (comprehension-first)', () => {
    for (const [num, day] of built) {
      const n = Number(num);
      if (n === 1 || n === 10) continue; // 1 = recovery-tools only; 10 = cold checkpoint
      expect(day.steps.some((s) => s.kind === 'replies')).toBe(true);
    }
  });
});

describe('Mission 1 — I Can Survive (interactive)', () => {
  it('is structurally sound (all references + dialogue graph)', () => {
    expect(validateMission(DAY1)).toEqual([]);
  });

  it('teaches the 7 tools with he meanings under the frozen id convention', () => {
    expect(DAY1.items.length).toBe(7);
    for (const i of DAY1.items) {
      expect(i.id.startsWith('en.phrase.recovery.')).toBe(true);
      expect(i.meaning.he).toBeTruthy();
    }
  });

  it('is dialogue-first and listening-first: scene before tools before quizzes; no cold production', () => {
    const kinds = DAY1.steps.map((s) => s.kind);
    expect(kinds.indexOf('dialogue')).toBeLessThan(kinds.indexOf('tool'));
    expect(kinds.indexOf('tool')).toBeLessThan(kinds.indexOf('quiz'));
    expect(kinds.filter((k) => k === 'dialogue').length).toBe(2); // guided run + confident rerun
    expect(kinds.filter((k) => k === 'receipt').length).toBeGreaterThanOrEqual(3);
    expect(kinds.at(-1)).toBe('summary');
  });

  it('wrong choices branch through recovery beats — never dead-end, never fail the scene', () => {
    const scene = DAY1.dialogues['stuck-traveler']!;
    const wrongs = scene.nodes.flatMap((n) => (n.choices ?? []).filter((c) => !c.correct));
    expect(wrongs.length).toBeGreaterThanOrEqual(2);
    const byId = new Map(scene.nodes.map((n) => [n.id, n]));
    for (const w of wrongs) {
      const target = byId.get(w.next)!;
      expect(target.who).toBe('npc'); // the world responds — conversation continues naturally
    }
  });
});

describe('Mission 4 — Coffee Shop (Deep Moment exemplar)', () => {
  it('is structurally sound (all references + dialogue graph)', () => {
    expect(validateMission(DAY4)).toEqual([]);
  });

  it('covers the full barista question-chain as expected replies', () => {
    const replyIds = DAY4.items.filter((i) => i.id.startsWith('en.reply.')).map((i) => i.id);
    for (const key of ['here-or-to-go', 'medium-or-large', 'milk-sugar', 'anything-to-eat', 'anything-else', 'cash-or-card', 'receipt', 'enjoy']) {
      expect(replyIds.some((id) => id.includes(key))).toBe(true);
    }
    expect(replyIds.length).toBeGreaterThanOrEqual(8); // depth before breadth
  });

  it('trains expected replies BEFORE the live dialogue, and includes an off-script cold open', () => {
    const kinds = DAY4.steps.map((s) => s.kind);
    expect(kinds.indexOf('replies')).toBeGreaterThan(-1);
    expect(kinds.indexOf('replies')).toBeLessThan(kinds.indexOf('dialogue'));
    expect(kinds).toContain('ambush');
    expect(kinds.at(-1)).toBe('summary');
  });

  it('reuses recovery tools inside the scene (spaced review in context)', () => {
    const scene = DAY4.dialogues['breakfast-order']!;
    const recoveryChoices = scene.nodes.flatMap((n) => (n.choices ?? []).filter((c) => c.itemId?.startsWith('en.phrase.recovery.')));
    expect(recoveryChoices.length).toBeGreaterThanOrEqual(3);
    expect(recoveryChoices.every((c) => c.correct)).toBe(true); // using a tool is ALWAYS a valid move
  });

  it('the breakfast scene walks the founder flow: order → size → milk/sugar → food → pay → receipt → goodbye', () => {
    const en = DAY4.dialogues['breakfast-order']!.nodes.map((n) => n.en).join(' ');
    for (const beat of ['What can I get you', 'Medium or large', 'Milk and sugar', 'Anything to eat', 'anything else', 'Cash or card', 'receipt', 'enjoy your day']) {
      expect(en.toLowerCase()).toContain(beat.toLowerCase());
    }
  });
});
