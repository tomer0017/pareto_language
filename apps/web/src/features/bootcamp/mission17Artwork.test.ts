import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M17_SLOTS, M17_PROPS, PRODUCTS, PRODUCT_TILES, AISLE_TILES } from './practiceSupermarket.js';
import { missionContent } from './priorLearning.js';
import { VisualMatchStep } from './PracticeSteps.js';
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission17-artwork.json', import.meta.url), 'utf8')) as { name: string; width: number; height: number; bytes: number; sha256: string; review: { meaning: string; text: boolean; locationCue: boolean; paymentAction: boolean } }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission17\/[a-z-]+\.jpg/g) ?? [];
const baseline = { en: '19ae5be37dc8e85dfef89b73f1939e54e8bfe0b29f22b317b150e09526b0dce7', es: '841e5169b8477f2bdff9770d0be2b5b71ac9ecfb12ad133a96223ad5fcd8b3e2', fr: '6a3893d8429a7293a932d52a42b41963a0704cb9b99b55c1dd547ad1447f4b63' };
describe('Mission 17 production artwork', () => {
  // Human semantic review bound to exact files, not automatic image recognition.
  for (const r of records) it(`${r.name}: optimized full-resolution JPEG matches reviewed pixels`, () => {
    const data = readFileSync(new URL(`../../../public/images/mission17/${r.name}.jpg`, import.meta.url));
    expect(data.subarray(0, 2).toString('hex')).toBe('ffd8');
    let width = 0; let height = 0;
    for (let i = 2; i < data.length - 9;) {
      if ([0xc0, 0xc1, 0xc2].includes(data[i + 1]!)) { height = data.readUInt16BE(i + 5); width = data.readUInt16BE(i + 7); break; }
      i += 2 + data.readUInt16BE(i + 2);
    }
    expect([width, height]).toEqual([r.width, r.height]);
    if (PRODUCTS.includes(r.name as typeof PRODUCTS[number])) expect([width, height]).toEqual([1024, 1024]);
    else { expect(width).toBeGreaterThanOrEqual(1536); expect(width / height).toBeCloseTo(16 / 9, 2); }
    expect(data.length).toBe(r.bytes);
    expect(data.length).toBeLessThan(600_000);
    expect(createHash('sha256').update(data).digest('hex')).toBe(r.sha256);
    expect(r.review).toMatchObject({ text: false, locationCue: false, paymentAction: false });
    expect(r.review.meaning.length).toBeGreaterThan(50);
  });
  it('exactly ten files and six equivalent image-only products; aisle stays deterministic', () => {
    expect(records).toHaveLength(10);
    expect(readdirSync(new URL('../../../public/images/mission17', import.meta.url)).sort()).toEqual(records.map(r => `${r.name}.jpg`).sort());
    for (const [name, slot] of Object.entries({ ...M17_SLOTS, ...M17_PROPS })) expect(slot.image).toBe(`images/mission17/${name}.jpg`);
    expect(PRODUCT_TILES).toHaveLength(6);
    for (const tile of PRODUCT_TILES) {
      expect(tile.image).toBe(`images/mission17/${tile.id}.jpg`);
      expect(tile.emoji).toBeUndefined(); expect(tile.label).toBeUndefined(); expect(tile.caption).toBeUndefined();
      expect(Object.keys(tile).sort()).toEqual(Object.keys(PRODUCT_TILES[0]!).sort());
    }
    expect(AISLE_TILES.map(t => t.id)).toEqual(['a1l', 'a2l', 'a3l', 'a1r', 'a2r', 'a3r']);
    for (const tile of AISLE_TILES) { expect(tile.image).toBeUndefined(); expect(tile.emoji).toBeUndefined(); }
    const css = readFileSync(new URL('../../app/styles.css', import.meta.url), 'utf8');
    expect(css).toContain('.pgrid.is-ordered:has(> .ptile:nth-child(6):last-child) { grid-template-columns: repeat(3, minmax(0, 1fr)); }');
  });
  for (const lang of ['en', 'es', 'fr'] as const) {
    it(`${lang}: every nonvisual byte matches main 0fa3c26`, () => {
      const json = JSON.stringify(missionContent(lang, 17), (k, v) => ['image', 'emoji', 'situationImage'].includes(k) ? undefined : v);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: identical mappings, reveal boundaries and three rendered image-choice rounds`, () => {
      const day = missionContent(lang, 17);
      expect(day.steps.map(paths)).toEqual(missionContent('en', 17).steps.map(paths));
      expect(paths(day.steps.slice(0, 8))).not.toContain(M17_SLOTS.checkout.image);
      expect(paths(day.steps.slice(0, 10))).not.toContain(M17_SLOTS.bag.image);
      expect(paths(day.steps.slice(0, 25))).not.toContain(M17_PROPS['quick-shop-complete'].image);
      expect(paths(day.steps[25])).toContain(M17_PROPS['quick-shop-complete'].image);
      const shelf = day.steps[2]!;
      if (shelf.kind !== 'visualMatch') throw new Error('Missing Shelf Scan');
      expect(shelf.rounds).toHaveLength(3);
      expect(shelf.rounds.map(r => r.correct)).toEqual(['cheese', 'eggs', 'apples']);
      for (const round of shelf.rounds) {
        const html = renderToStaticMarkup(createElement(VisualMatchStep, { step: { ...shelf, rounds: [round] }, onDone: () => {} }));
        expect(html.match(/class="ptile /g)).toHaveLength(3);
        expect(html.match(/class="ptile-img"/g)).toHaveLength(3);
        expect(html).not.toContain('ptile-caption');
      }
    });
  }
});
