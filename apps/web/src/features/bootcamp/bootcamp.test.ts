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
import { DAY11 } from './day11.js';
import { DAY12 } from './day12.js';
import { DAY13 } from './day13.js';
import { DAY14 } from './day14.js';
import { DAY15 } from './day15.js';
import { DAY16 } from './day16.js';
import { DAY17 } from './day17.js';
import { DAY18 } from './day18.js';
import { DAY19 } from './day19.js';
import { DAY20 } from './day20.js';
import { DAY21 } from './day21.js';
import { DAY22 } from './day22.js';
import { DAY23 } from './day23.js';
import { DAY24 } from './day24.js';
import { DAY25 } from './day25.js';
import { DAY26 } from './day26.js';
import { DAY27 } from './day27.js';
import { DAY28 } from './day28.js';
import { DAY29 } from './day29.js';
import { DAY30 } from './day30.js';

// Pure-data registry (avoids importing the store, which loads the app/zustand chain).
const DAYS: Record<number, BootcampDayContent> = {
  1: DAY1, 2: DAY2, 3: DAY3, 4: DAY4, 5: DAY5, 6: DAY6, 7: DAY7, 8: DAY8, 9: DAY9, 10: DAY10,
  11: DAY11, 12: DAY12, 13: DAY13, 14: DAY14, 15: DAY15, 16: DAY16, 17: DAY17, 18: DAY18, 19: DAY19, 20: DAY20,
  21: DAY21, 22: DAY22, 23: DAY23, 24: DAY24, 25: DAY25, 26: DAY26, 27: DAY27, 28: DAY28, 29: DAY29, 30: DAY30,
};
import type { BootcampDayContent, BootcampDialogue, BootcampStep } from './types.js';

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
  it('has all 30 missions built', () => {
    expect(Object.keys(DAYS).map(Number).sort((a, b) => a - b)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
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
  it('content missions train expected replies (comprehension-first)', () => {
    // Mission 1 is the recovery-tools primer; cold/checkpoint missions (plan concepts === 0)
    // introduce no new content, so they legitimately skip the replies drill.
    const coldDays = new Set(BOOTCAMP_PLAN.filter((m) => m.targets.concepts === 0).map((m) => m.day));
    for (const [num, day] of built) {
      const n = Number(num);
      if (n === 1 || coldDays.has(n)) continue;
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

  it('runs in coaching mode: survival framing up front and every less-useful pick teaches', () => {
    const scene = DAY1.dialogues['stuck-traveler']!;
    expect(scene.coaching).toBe(true);
    // An explanation screen precedes the first dialogue (survival, not correctness).
    const firstDialogue = DAY1.steps.findIndex((s) => s.kind === 'dialogue');
    const intro = DAY1.steps.slice(0, firstDialogue).filter((s) => s.kind === 'talk') as Extract<BootcampStep, { kind: 'talk' }>[];
    expect(intro.some((s) => /תשובה מושלמת|perfect answer/.test(`${s.title.he} ${s.title.en}`))).toBe(true);
    // Every "less useful" choice carries a coaching explanation (teach, not punish).
    for (const c of scene.nodes.flatMap((n) => n.choices ?? []).filter((c) => !c.correct)) {
      expect(c.coach?.he).toBeTruthy();
      expect(c.coach?.en).toBeTruthy();
    }
  });
});

describe('coaching mode is scoped to Mission 1 only (no regression to 2–30)', () => {
  it('no other built mission enables dialogue coaching', () => {
    for (const [num, day] of Object.entries(DAYS)) {
      if (Number(num) === 1) continue;
      for (const d of Object.values(day.dialogues)) expect(d.coaching ?? false).toBe(false);
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

describe('video-first Bootcamp (intro/review video)', () => {
  it('Mission 2 carries the intro video at the documented public path', () => {
    expect(DAY2.introVideo).toBeDefined();
    expect(DAY2.introVideo?.src).toBe('/videos/En_day2.mp4');
    expect(DAY2.introVideo?.language).toBe('en');
  });

  it('Mission 2 opens with a video-intro step and replays it before the summary', () => {
    const kinds = DAY2.steps.map((s) => s.kind);
    expect(kinds[0]).toBe('video'); // watch the full conversation first
    const videoSteps = DAY2.steps.filter((s) => s.kind === 'video') as Extract<BootcampStep, { kind: 'video' }>[];
    expect(videoSteps.map((s) => s.mode)).toEqual(['intro', 'again']);
    // "watch again" sits immediately before the final summary.
    expect(kinds[kinds.length - 2]).toBe('video');
    expect(kinds.at(-1)).toBe('summary');
  });

  it('Mission 3 ships a full-conversation video (hub / Videos experience), without injecting video steps', () => {
    expect(DAY3.introVideo).toBeDefined();
    expect(DAY3.introVideo?.src).toBe('/videos/En_day3.mp4');
    expect(DAY3.introVideo?.language).toBe('en');
    expect(DAY3.steps.some((s) => s.kind === 'video')).toBe(false);
  });

  it('videos are opt-in per mission; a video step never appears without a video', () => {
    const withVideo = new Set<number>();
    for (const [num, day] of Object.entries(DAYS)) {
      const hasVideoStep = day.steps.some((s) => s.kind === 'video');
      if (day.introVideo) withVideo.add(Number(num));
      else expect(hasVideoStep).toBe(false); // never a placeholder video step without a video
    }
    // Missions 2 and 3 ship the full-conversation video; only Mission 2 injects video steps.
    expect([...withVideo].sort((a, b) => a - b)).toEqual([2, 3]);
    expect(DAY2.steps.some((s) => s.kind === 'video')).toBe(true);
  });
});
