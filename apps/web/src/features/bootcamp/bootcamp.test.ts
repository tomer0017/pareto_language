import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { DAY1 } from './day1.js';

describe('Bootcamp plan (Sprint 6 Part 1)', () => {
  it('has exactly 20 capability-named days with full metadata', () => {
    expect(BOOTCAMP_PLAN.length).toBe(20);
    for (const d of BOOTCAMP_PLAN) {
      expect(d.title.en!.startsWith('I can') || d.title.en!.startsWith("I ")).toBe(true);
      expect(d.title.he).toBeTruthy();
      expect(d.why.length).toBeGreaterThan(10);
      expect(d.preparesNext.length).toBeGreaterThan(10);
      expect(d.minutes).toBeGreaterThanOrEqual(20);
    }
    expect(BOOTCAMP_PLAN.map((d) => d.day)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });
});

describe('Day 1 content integrity (Sprint 6 Part 2)', () => {
  const ids = new Set(DAY1.items.map((i) => i.id));

  it('teaches exactly the 7 founder-specified survival tools with he meanings', () => {
    expect(DAY1.items.length).toBe(7);
    for (const item of DAY1.items) {
      expect(item.meaning.he).toBeTruthy();
      expect(item.id.startsWith('en.phrase.recovery.')).toBe(true); // frozen id convention
    }
  });

  it('every step reference resolves (no dead itemIds anywhere)', () => {
    for (const step of DAY1.steps) {
      if (step.kind === 'tool') expect(ids.has(step.itemId)).toBe(true);
      if (step.kind === 'quiz') {
        expect(ids.has(step.itemId)).toBe(true);
        for (const w of step.wrongIds) expect(ids.has(w)).toBe(true);
        expect(step.wrongIds).not.toContain(step.itemId);
      }
      if (step.kind === 'swipe') for (const id of step.itemIds) expect(ids.has(id)).toBe(true);
      if (step.kind === 'ambush') {
        expect(ids.has(step.correctItemId)).toBe(true);
        expect(ids.has(step.wrongItemId)).toBe(true);
      }
    }
    for (const line of DAY1.dialogue) {
      if (line.choice) expect(ids.has(line.choice.correctItemId)).toBe(true);
    }
  });

  it('is dialogue-first and listening-first: watch precedes every tool; tools precede quizzes; no recall production', () => {
    const kinds = DAY1.steps.map((s) => s.kind);
    const firstDialogue = kinds.indexOf('dialogue');
    const firstTool = kinds.indexOf('tool');
    const firstQuiz = kinds.indexOf('quiz');
    expect(firstDialogue).toBeGreaterThan(-1);
    expect(firstDialogue).toBeLessThan(firstTool); // words appear inside a dialogue first (Part 5)
    expect(firstTool).toBeLessThan(firstQuiz);     // hear+understand before being tested (Part 6)
    expect(kinds).not.toContain('recall');          // day 1 never demands cold production
  });

  it('every tool is introduced before it is quizzed or ambushed', () => {
    const introduced = new Set<string>();
    for (const step of DAY1.steps) {
      if (step.kind === 'tool') introduced.add(step.itemId);
      if (step.kind === 'quiz') expect(introduced.has(step.itemId)).toBe(true);
      if (step.kind === 'ambush') expect(introduced.has(step.correctItemId)).toBe(true);
    }
    expect(introduced.size).toBe(7); // all tools taught
  });

  it('ends with evidence: ≥3 receipts, summary last, ~20-minute step budget', () => {
    const kinds = DAY1.steps.map((s) => s.kind);
    expect(kinds.filter((k) => k === 'receipt').length).toBeGreaterThanOrEqual(3);
    expect(kinds.at(-1)).toBe('summary');
    // crude duration model (secs): talk 45, tool 40, quiz 25, swipe 60, dialogue 150, ambush 40, receipt 15, summary 45
    const cost: Record<string, number> = { talk: 45, tool: 40, quiz: 25, swipe: 60, dialogue: 150, ambush: 40, receipt: 15, summary: 45 };
    const total = DAY1.steps.reduce((a, s) => a + (cost[s.kind] ?? 0), 0);
    expect(total).toBeGreaterThan(14 * 60);
    expect(total).toBeLessThan(24 * 60);
  });
});
