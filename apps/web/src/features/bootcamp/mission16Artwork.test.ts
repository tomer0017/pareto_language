import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M16_SLOTS, M16_PROPS, HOBBIES_IN_ORDER, CATEGORY_TILES, TIME_TILES, PLAN_TILES } from './practiceHobbies.js';
import { missionContent } from './priorLearning.js';
import { QuickReplyStep, VisualMatchStep } from './PracticeSteps.js';
import { useAppStore } from '../../shared/stores/appStore.js';
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission16-artwork.json', import.meta.url), 'utf8')) as { name: string; width: number; height: number; sha256: string; review: { meaning: string; text: boolean; preferenceCue: boolean } }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission16\/[a-z-]+\.jpg/g) ?? [];
const baseline = { en: '1012bf14340ec0317df75f73c8f9d73fd67d335c0240f4c560362abd8dc16fc9', es: 'c69d6b61611e02f78f2f917f385f3299fd963fe85447ec2ffa57460f79c6b33e', fr: '74a1d00b2305a155a954908cca8d4b114742b1993be6e2ddc948b957743d6476' };
describe('Mission 16 production artwork', () => {
  // Manual semantic review, bound to exact pixels by hashes; not automated image recognition.
  for (const r of records) it(`${r.name}: canonical full-resolution JPEG matches the visual review`, () => {
    const data = readFileSync(new URL(`../../../public/images/mission16/${r.name}.jpg`, import.meta.url));
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
    expect(r.review).toMatchObject({ text: false, preferenceCue: false });
    expect(r.review.meaning.length).toBeGreaterThan(50);
  });
  it('exactly eight canonical files, equal hobby dimensions, deterministic tiles', () => {
    expect(records).toHaveLength(8);
    expect(readdirSync(new URL('../../../public/images/mission16', import.meta.url)).sort()).toEqual(records.map(r => `${r.name}.jpg`).sort());
    for (const [name, slot] of Object.entries({ ...M16_SLOTS, ...M16_PROPS })) expect(slot.image).toBe(`images/mission16/${name}.jpg`);
    expect(new Set(records.filter(r => HOBBIES_IN_ORDER.includes(r.name as typeof HOBBIES_IN_ORDER[number])).map(r => `${r.width}x${r.height}`)).size).toBe(1);
    for (const tile of [...CATEGORY_TILES, ...TIME_TILES, ...PLAN_TILES]) expect(tile.image).toBeUndefined();
  });
  for (const lang of ['en', 'es', 'fr'] as const) {
    it(`${lang}: all nonvisual data matches current main 0893606`, () => {
      const json = JSON.stringify(missionContent(lang, 16), (k, v) => ['image', 'emoji', 'situationImage'].includes(k) ? undefined : v);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: parity, reveal boundaries and all five actual sorting renders`, () => {
      const day = missionContent(lang, 16);
      expect(day.steps.map(paths)).toEqual(missionContent('en', 16).steps.map(paths));
      expect(paths(day.steps.slice(0, 16))).not.toContain(M16_SLOTS['diving-school'].image);
      expect(paths(day.steps.slice(0, 27))).not.toContain(M16_PROPS['free-time-match'].image);
      expect(paths(day.steps.at(-2))).toContain(M16_PROPS['free-time-match'].image);
      const sorts = day.steps.filter(s => s.kind === 'visualMatch' && s.rounds[0]?.picture);
      expect(sorts).toHaveLength(5);
      for (const [i, step] of sorts.entries()) {
        if (step.kind !== 'visualMatch') throw new Error('Missing sorting round');
        const html = renderToStaticMarkup(createElement(VisualMatchStep, { step, onDone: () => {} }));
        const path = M16_SLOTS[HOBBIES_IN_ORDER[i]!].image!;
        expect(html).toContain(path);
        expect(html.indexOf(path)).toBeLessThan(html.indexOf('class="ptile '));
        expect(html.match(/class="ptile /g)).toHaveLength(4);
        expect(html.slice(html.indexOf('class="ptile '))).not.toContain('<img');
        expect(html).not.toContain('pmatch-picture-emoji');
      }
      useAppStore.setState({ uiLang: 'en', learningLang: lang });
      const final = day.steps.at(-3)!;
      if (final.kind !== 'quickReply') throw new Error('Missing Final');
      const itemsById = new Map(day.items.map(x => [x.id, x]));
      const artRounds = final.rounds.filter(r => r.situationImage);
      expect(artRounds).toHaveLength(3);
      for (const round of artRounds) {
        const render = (image: string | undefined) => renderToStaticMarkup(createElement(QuickReplyStep, { step: { ...final, rounds: [{ ...round, situationImage: image }] }, itemsById, onDone: () => {} }));
        const html = render(round.situationImage);
        expect(html).toContain(round.situationImage!);
        expect(html).not.toMatch(/[🏄🏃🤿]/u);
        expect(render(undefined)).toMatch(/[🏄🏃🤿]/u);
      }
    });
  }
});
