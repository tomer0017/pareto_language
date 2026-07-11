import { describe, expect, it } from 'vitest';
import { buildComprehensionContext, buildRespondContext } from './answerContext.js';
import { DAY3 } from '../../features/bootcamp/day3.js';
import { DAY2 } from '../../features/bootcamp/day2.js';

/**
 * Task D3 — the reusable wrong-answer context carries the FULL learning connection for every
 * exercise type: what you heard (+translation), what you chose, what you should answer
 * (+translation), and why. Uses the Money & Numbers ambush as the regression case.
 */
describe('answer context — full learning hierarchy', () => {
  it('comprehension drills (quiz / expected-reply): prompt=heard, expected=meaning', () => {
    const ctx = buildComprehensionContext({
      heard: 'Cash or card?', chosen: 'That is five euros.', meaning: 'מזומן או כרטיס?',
      why: '“Cash or card?” means “מזומן או כרטיס?”.', shouldLabel: 'What it means',
    });
    expect(ctx.prompt?.text).toBe('Cash or card?');   // what you heard
    expect(ctx.selected?.text).toBe('That is five euros.'); // your answer
    expect(ctx.expected.text).toBe('מזומן או כרטיס?');  // what it means
    expect(ctx.why).toBeTruthy();
    expect(ctx.labels?.should).toBe('What it means');
  });

  it('respond drills (ambush / dialogue): heard + translation → your pick → what fit + translation', () => {
    const ctx = buildRespondContext({
      promptText: 'A', promptTranslation: 'א', chosen: 'B', chosenTranslation: 'ב',
      expectedText: 'C', expectedTranslation: 'ג', why: 'because',
    });
    expect(ctx.prompt).toEqual(expect.objectContaining({ text: 'A', translation: 'א' }));
    expect(ctx.selected).toEqual(expect.objectContaining({ text: 'B', translation: 'ב' }));
    expect(ctx.expected).toEqual(expect.objectContaining({ text: 'C', translation: 'ג' }));
    expect(ctx.why).toBe('because');
  });

  it('MONEY REGRESSION — the ambush shows what you heard, not just the answer', () => {
    const step = DAY3.steps.find((s) => s.kind === 'ambush');
    if (!step || step.kind !== 'ambush') throw new Error('Mission 3 ambush missing');
    const byId = new Map(DAY3.items.map((i) => [i.id, i]));
    const correct = byId.get(step.correctItemId)!;
    const wrong = byId.get(step.wrongItemId)!;

    const ctx = buildRespondContext({
      promptText: step.npc.en, promptTranslation: step.npc.he,
      chosen: wrong.text, expectedText: correct.text, expectedTranslation: correct.meaning.he,
      why: 'The speaker gave the total price — repeat or identify the amount.',
    });

    // What you heard = the original NPC sentence + its Hebrew — the context that used to be lost.
    expect(ctx.prompt?.text).toContain('fifteen fifty');
    expect(ctx.prompt?.translation).toBeTruthy();
    // Your answer (the wrong pick) and what you should answer (the total) are both present + distinct.
    expect(ctx.selected?.text).toBe(wrong.text);
    expect(ctx.expected.text).toBe(correct.text);
    expect(ctx.expected.text).not.toBe(ctx.selected?.text);
    expect(ctx.expected.translation).toBeTruthy();
    expect((ctx.why ?? '').length).toBeGreaterThan(0);
  });

  it('DIALOGUE CHOICE — prompt is the NPC line, expected is the correct sibling', () => {
    const scene = DAY2.dialogues['meeting-host']!;
    const node = scene.nodes.find((n) => n.choices?.some((c) => !c.correct))!;
    const wrong = node.choices!.find((c) => !c.correct)!;
    const right = node.choices!.find((c) => c.correct)!;
    const promptNpc = scene.nodes.find((n) => n.next === node.id || n.choices?.some((c) => c.next === node.id))!;

    const ctx = buildRespondContext({
      promptText: promptNpc.en, promptTranslation: promptNpc.he,
      chosen: wrong.en, chosenTranslation: wrong.he,
      expectedText: right.en, expectedTranslation: right.he, why: 'That is not what they asked.',
    });
    expect(ctx.prompt?.text).toBe(promptNpc.en);
    expect(ctx.selected?.text).toBe(wrong.en);
    expect(ctx.expected.text).toBe(right.en);
  });
});
