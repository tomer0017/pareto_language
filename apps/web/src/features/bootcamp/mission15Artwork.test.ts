import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M15_SLOTS, M15_PROPS, M15_SITUATION_IMAGES, foodCheck } from './practiceAllergies.js';
import { missionContent } from './priorLearning.js';
import { HotelStaySummary } from './HotelStaySummary.js';
import { QuickReplyStep } from './PracticeSteps.js';
import { useAppStore } from '../../shared/stores/appStore.js';

const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission15-artwork.json', import.meta.url), 'utf8')) as { name: string; width: number; height: number; sha256: string; review: { meaning: string; text: boolean; safetyConfirmation: boolean } }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission15\/[a-z-]+\.jpg/g) ?? [];
const baseline = { en: 'ddeff1743bb0ed63fca3fa00527323531a16c8189459e660e2f6910426b4c5a1', es: 'b151b5021ed1371354755d96e7d88689fd1d2c6d545f38e645679a375072c2a9', fr: '674156f7ff02026dc38348f6879bc847609af270b0ce15e330cdbcca07a525bc' };

describe('Mission 15 final minimal artwork', () => {
  // Visual review establishes meaning; hashes bind reviewed pixels to files. This is not automated
  // ingredient/face recognition and cannot prove food safety (which the mission never asserts).
  for (const r of records) it(`${r.name}: canonical full-resolution JPEG matches the visual review`, () => {
    const data = readFileSync(new URL(`../../../public/images/mission15/${r.name}.jpg`, import.meta.url));
    expect(data.subarray(0, 2).toString('hex')).toBe('ffd8');
    let width = 0; let height = 0;
    for (let i = 2; i < data.length - 9;) {
      if ([0xc0, 0xc1, 0xc2].includes(data[i + 1]!)) { height = data.readUInt16BE(i + 5); width = data.readUInt16BE(i + 7); break; }
      i += 2 + data.readUInt16BE(i + 2);
    }
    expect(width).toBeGreaterThanOrEqual(1536);
    expect(width / height).toBeGreaterThan(1.7);
    expect(width / height).toBeLessThan(1.8);
    expect([width, height]).toEqual([r.width, r.height]);
    expect(createHash('sha256').update(data).digest('hex')).toBe(r.sha256);
    expect(r.review).toMatchObject({ text: false, safetyConfirmation: false });
    expect(r.review.meaning.length).toBeGreaterThan(50);
  });
  it('five teaching slots and one reused result stay within six files, with no semantic emoji fallback', () => {
    expect(Object.keys(M15_SLOTS)).toHaveLength(5);
    expect(Object.keys(M15_PROPS)).toHaveLength(1);
    expect(readdirSync(new URL('../../../public/images/mission15', import.meta.url)).sort()).toEqual(records.map((r) => `${r.name}.jpg`).sort());
    expect(records).toHaveLength(6);
    expect(new Set(paths(missionContent('en', 15)))).toEqual(new Set(records.map((r) => `images/mission15/${r.name}.jpg`)));
    for (const v of [...Object.values(M15_SLOTS), ...Object.values(M15_PROPS)]) expect(Object.keys(v)).toEqual(['image']);
    expect(M15_PROPS['kitchen-check-sent']).toEqual(M15_SLOTS['kitchen-check']);
  });
  for (const lang of ['en', 'es', 'fr'] as const) {
    it(`${lang}: all nonvisual data is identical to approved be3cfe7, including dialogue, ordering and pedagogy`, () => {
      const json = JSON.stringify(missionContent(lang, 15), (k, v) => ['image', 'emoji', 'situationImage'].includes(k) ? undefined : v);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: artwork parity, no early kitchen/cream and pending final receipt`, () => {
      const steps = missionContent(lang, 15).steps;
      expect(steps.map(paths)).toEqual(missionContent('en', 15).steps.map(paths));
      expect(steps[0]).toMatchObject({ image: M15_SLOTS.waiter.image });
      const cards = steps.flatMap((s) => s.kind === 'prime' ? s.words : []);
      const kitchen = cards.findIndex((w) => w.key === 'diet.line.risotto');
      const cream = cards.findIndex((w) => w.key === 'diet.line.cream');
      expect(kitchen).toBeGreaterThan(0); expect(cream).toBeGreaterThan(kitchen);
      expect(paths(cards.slice(0, kitchen))).not.toContain(M15_SLOTS['kitchen-check'].image);
      expect(paths(cards.slice(0, cream))).not.toContain(M15_SLOTS.dairy.image);
      for (const card of cards) { expect(card.image).toMatch(/^images\/mission15\/[a-z-]+\.jpg$/); expect(card.emoji).toBeUndefined(); }
      expect(steps.at(-2)).toMatchObject({ image: M15_PROPS['kitchen-check-sent'].image });
      expect(JSON.stringify(steps.at(-2))).toContain('wait for the answer about the nuts');
    });
    it(`${lang}: every situation has equal image treatment and all answers remain text`, () => {
      const mini = missionContent(lang, 15).steps.find((s) => s.kind === 'quickReply' && s.rounds[0]?.situation);
      expect(mini?.kind).toBe('quickReply');
      if (mini?.kind !== 'quickReply') return;
      expect(mini.rounds).toHaveLength(4);
      expect(mini.rounds.map((r) => r.situationImage)).toEqual(Object.values(M15_SITUATION_IMAGES));
      for (const round of mini.rounds) {
        expect(round.situationImage).toBe(M15_SITUATION_IMAGES[round.options.find((o) => o.correct)!.itemId.replace(/^(en|es|fr)\./, '')]);
        expect(paths(round.options)).toEqual([]);
      }
    });
  }
  it('the actual renderer shows a situation image, hides its old emoji, and preserves text-only legacy rounds', () => {
    useAppStore.setState({ uiLang: 'en', learningLang: 'en' });
    const day = missionContent('en', 15);
    const step = day.steps.find((s) => s.kind === 'quickReply' && s.rounds[0]?.situation)!;
    if (step.kind !== 'quickReply') throw new Error('Missing mini-game');
    const itemsById = new Map(day.items.map((x) => [x.id, x]));
    for (const round of step.rounds) {
      const html = renderToStaticMarkup(createElement(QuickReplyStep, { step: { ...step, rounds: [round] }, itemsById, onDone: () => {} }));
      expect(html).toContain(`src="/pareto_language/${round.situationImage}"`);
      expect(html).toContain('class="situation-image"');
      expect(html).not.toMatch(/[🥛🥜🧅🌱]/u);
      expect(html.match(/class="btn-secondary btn-reply"/g)).toHaveLength(3);
    }
    const round = { ...step.rounds[0]!, situationImage: undefined };
    const legacy = renderToStaticMarkup(createElement(QuickReplyStep, { step: { ...step, rounds: [round] }, itemsById, onDone: () => {} }));
    expect(legacy).not.toContain('class="situation-image"'); expect(legacy).toContain('🥛');
  });
  it('Food Check remains text UI with stage-controlled facts and never a safe result', () => {
    for (const n of [0, 1, 2, 3] as const) {
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: foodCheck(n)[1] }));
      expect(html).not.toContain('<img'); expect(html).not.toMatch(/safe|nut-free|all clear/i);
      for (const [fact, stage] of [['Dish: Vegetarian', 1], ['Nuts: Kitchen checking', 1], ['Dairy: Cream', 2], ['Kitchen: Allergy notified', 3]] as const) expect(html.includes(fact)).toBe(n >= stage);
      for (const fact of ['Allergy: Nuts', 'Diet: Vegetarian', 'Onions: Remove']) expect(html).toContain(fact);
    }
  });
});
