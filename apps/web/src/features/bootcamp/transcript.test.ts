import { describe, expect, it } from 'vitest';
import { dialogueTranscript } from './transcript.js';
import { DAY1 } from './day1.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { DAYS as REGISTRY } from './registry.js';
import type { BootcampDayContent, BootcampDialogue } from './types.js';

const DAYS: BootcampDayContent[] = BOOTCAMP_PLAN.map((m) => REGISTRY[m.day]!);

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

  it('collapses Mission 1 to the ideal introduction (no recovery beats, ends on the host\'s goodbye)', () => {
    const lines = dialogueTranscript(DAY1.dialogues['meeting-host']!);
    expect(lines.at(-1)!.en).toBe('Enjoy your stay! Have a great day!');
    // Recovery-only nodes (r1/r2) must not appear on the happy path.
    const texts = lines.map((l) => l.en);
    expect(texts).not.toContain('Of course — what — is — your — name?');
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
