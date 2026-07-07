import { describe, expect, it } from 'vitest';
import { dialogueTranscript } from './transcript.js';
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
import type { BootcampDayContent, BootcampDialogue } from './types.js';

const DAYS: BootcampDayContent[] = [
  DAY1, DAY2, DAY3, DAY4, DAY5, DAY6, DAY7, DAY8, DAY9, DAY10,
  DAY11, DAY12, DAY13, DAY14, DAY15, DAY16, DAY17, DAY18, DAY19, DAY20,
  DAY21, DAY22, DAY23, DAY24, DAY25, DAY26, DAY27, DAY28, DAY29, DAY30,
];

/**
 * The full-dialogue study sheet (Sprint 9). The reader depends on the tree collapsing to the
 * ONE ideal conversation: no recovery detours, no dead ends, no infinite loops, and every line
 * carries text in both languages so the sheet is complete.
 */
describe('dialogueTranscript — the canonical happy-path conversation', () => {
  const allDialogues: [string, BootcampDialogue][] = DAYS.flatMap((d) =>
    Object.values(d.dialogues).map((dl) => [`m${d.day}/${dl.id}`, dl] as [string, BootcampDialogue]),
  );

  for (const [name, dialogue] of allDialogues) {
    it(`${name}: linearizes to a non-empty, fully-bilingual transcript`, () => {
      const lines = dialogueTranscript(dialogue);
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) {
        expect(line.en.trim().length).toBeGreaterThan(0);
        expect(line.he.trim().length).toBeGreaterThan(0);
        expect(line.who === 'npc' || line.who === 'you').toBe(true);
      }
    });

    it(`${name}: starts with the opening node and never takes a wrong/recovery branch`, () => {
      const lines = dialogueTranscript(dialogue);
      const start = dialogue.nodes.find((n) => n.id === dialogue.start)!;
      // The first spoken line is the start node's line (start nodes are npc openers here).
      expect(lines[0]!.en).toBe(start.en);
      // Every "you" line in the transcript is a correct choice or a scripted line — never a wrong pick.
      const wrongChoiceTexts = new Set(
        dialogue.nodes.flatMap((n) => (n.choices ?? []).filter((c) => !c.correct).map((c) => c.en)),
      );
      const correctChoiceTexts = new Set(
        dialogue.nodes.flatMap((n) => (n.choices ?? []).filter((c) => c.correct).map((c) => c.en)),
      );
      for (const line of lines.filter((l) => l.who === 'you')) {
        if (wrongChoiceTexts.has(line.en) && !correctChoiceTexts.has(line.en)) {
          throw new Error(`transcript took a wrong branch: "${line.en}"`);
        }
      }
    });
  }

  it('collapses Mission 1 to the ideal barista run (no recovery beats, ends on "Enjoy!")', () => {
    const lines = dialogueTranscript(DAY1.dialogues['stuck-traveler']!);
    expect(lines.at(-1)!.en).toBe('Enjoy!');
    // Recovery-only nodes (r1/r2/r3) must not appear on the happy path.
    const texts = lines.map((l) => l.en);
    expect(texts).not.toContain("Oh — wait, don't go! I can help. Coffee?");
  });

  it('terminates even on a pathological self-referential loop', () => {
    const loop: BootcampDialogue = {
      id: 'loop',
      start: 'a',
      nodes: [
        { id: 'a', who: 'npc', en: 'A', he: 'א', next: 'b' },
        { id: 'b', who: 'npc', en: 'B', he: 'ב', next: 'a' }, // cycle
      ],
    };
    const lines = dialogueTranscript(loop);
    expect(lines.map((l) => l.en)).toEqual(['A', 'B']); // visited-guard stops the cycle
  });
});
