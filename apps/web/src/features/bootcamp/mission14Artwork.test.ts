import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M14_SLOTS, M14_PROPS, restaurantTicket } from './practiceRestaurant.js';
import { missionContent } from './priorLearning.js';
import { HotelStaySummary } from './HotelStaySummary.js';

const langs = ['en', 'es', 'fr'] as const;
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission14-artwork.json', import.meta.url), 'utf8')) as { name: string; sha256: string; width: number; height: number; review: { waiter: string; traveler: string; companion: string; restaurant: string; table: string; menus: string; meal: string; text: boolean; food: boolean; water: boolean; bill: boolean } }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission14\/[a-z-]+\.jpg/g) ?? [];
const baseline = {
  en: '768bc393aa8778c24e2e7748a329f0e6925e23d8b414b0fdd624a5f3944c7761',
  es: '130a06cb6deca6c6e39ee88fb9b335b07d6bd9d3f27413c8393e78cfc5eadbbd',
  fr: 'f1178550560f330e0052b35ad4accfd9d4a0c830d796443b3fd7a4afbc5e26e9',
};

describe('Mission 14 final artwork', () => {
  // Human visual inspection establishes identity and meaning. Hashes bind that review to shipped
  // pixels; neither metadata nor filenames constitute automated face/ingredient recognition.
  for (const [slot, asset] of Object.entries({ ...M14_SLOTS, ...M14_PROPS })) it(`${slot}: reviewed full-size canonical JPEG without semantic emoji`, () => {
    expect(Object.keys(asset)).toEqual(['image']);
    expect(asset.image).toMatch(/^images\/mission14\/[a-z-]+\.jpg$/);
    const data = readFileSync(new URL(`../../../public/${asset.image}`, import.meta.url));
    expect(data.subarray(0, 2).toString('hex')).toBe('ffd8');
    let width = 0; let height = 0;
    for (let i = 2; i < data.length - 9;) {
      if ([0xc0, 0xc1, 0xc2].includes(data[i + 1]!)) { height = data.readUInt16BE(i + 5); width = data.readUInt16BE(i + 7); break; }
      i += 2 + data.readUInt16BE(i + 2);
    }
    expect(width).toBeGreaterThanOrEqual(1536);
    expect(width / height).toBeGreaterThanOrEqual(1.7);
    expect(width / height).toBeLessThanOrEqual(1.8);
    const record = records.find((r) => asset.image.endsWith(`/${r.name}.jpg`))!;
    expect([width, height]).toEqual([record.width, record.height]);
    expect(createHash('sha256').update(data).digest('hex')).toBe(record.sha256);
    expect(record.review.text).toBe(false);
  });
  it('ten slots and one result use all nine independent final assets, with deliberate whole-image reuse', () => {
    expect(Object.keys(M14_SLOTS)).toHaveLength(10);
    expect(Object.keys(M14_PROPS)).toHaveLength(1);
    expect(records).toHaveLength(9);
    expect(new Set(paths(missionContent('en', 14)))).toEqual(new Set(records.map((r) => `images/mission14/${r.name}.jpg`)));
    expect(new Set(records.map((r) => r.sha256)).size).toBe(9);
    expect(M14_SLOTS['ready-to-order']).toEqual(M14_SLOTS['order-chicken']);
    expect(M14_SLOTS['meal-check']).toEqual(M14_SLOTS['delicious-bill']);
  });
  it('pixel-bound manual review records continuity of waiter, traveler, companion, restaurant, table, menus and meal', () => {
    for (const field of ['waiter', 'traveler', 'companion', 'restaurant', 'table', 'menus', 'meal'] as const) {
      expect(new Set(records.map((r) => r.review[field])).size).toBe(1);
      expect(records[0]!.review[field].length).toBeGreaterThan(20);
    }
  });
  for (const lang of langs) {
    it(`${lang}: all nonvisual data matches approved e5a546e, including recovery, locked dialogue, 26 interactions, silent cue and Flex`, () => {
      const json = JSON.stringify(missionContent(lang, 14), (key, value) => key === 'image' || key === 'emoji' ? undefined : value);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: shared artwork sequence, briefing, earned result and no semantic card fallback`, () => {
      const steps = missionContent(lang, 14).steps;
      expect(steps.map(paths)).toEqual(missionContent('en', 14).steps.map(paths));
      expect(steps[0]).toMatchObject({ image: M14_SLOTS['restaurant-entrance'].image });
      expect(paths(steps.slice(0, -2))).not.toContain(M14_PROPS['meal-complete'].image);
      expect(steps.at(-2)).toMatchObject({ image: M14_PROPS['meal-complete'].image });
      for (const s of steps) if (s.kind === 'prime') for (const w of s.words) {
        expect(w.image).toMatch(/^images\/mission14\//);
        expect(w.emoji).toBeUndefined();
      }
    });
    it(`${lang}: reviewed food/water/bill pixels appear only at the appropriate teaching beat`, () => {
      const steps = missionContent(lang, 14).steps;
      const later = steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'rest.line.okay'));
      const early = paths(steps.slice(0, later));
      for (const record of records.filter((r) => r.review.food || r.review.water || r.review.bill)) expect(early).not.toContain(`images/mission14/${record.name}.jpg`);
      const cards = steps.flatMap((s) => s.kind === 'prime' ? s.words : []);
      const billLine = cards.findIndex((w) => w.key === 'rest.line.bill');
      expect(cards.slice(0, billLine + 1).map((w) => w.image)).not.toContain(M14_SLOTS.goodbye.image);
      expect(cards[billLine + 1]).toMatchObject({ key: 'rest.line.bye', image: M14_SLOTS.goodbye.image });
      expect(records.find((r) => r.name === 'drink-order')!.review.water).toBe(false);
    });
    it(`${lang}: Waiter Signals and listening-only transfer Flex retain equally presented UI tiles`, () => {
      const boards = missionContent(lang, 14).steps.filter((s) => s.kind === 'visualMatch');
      expect(boards).toHaveLength(2);
      expect(boards[0]!.rounds.map((r) => r.correct)).toEqual(['drink', 'table', 'check', 'food', 'more']);
      expect(boards[1]).toMatchObject({ transferOnly: true, rounds: [{ correct: 'four' }] });
      expect(boards[1]!.tiles.map((t) => t.id)).toEqual(['two', 'four']);
      for (const board of boards) {
        expect(paths(board)).toEqual([]);
        for (const tile of board.tiles) { expect(tile.image).toBeUndefined(); expect(tile.emoji).toBeTruthy(); expect(tile.caption).toBeDefined(); }
      }
    });
  }
  it('Ticket facts remain deterministic text and reveal at established stages, without prices or payment methods', () => {
    for (let n = 0; n <= 6; n++) {
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: restaurantTicket(n as 0)[1] }));
      expect(html).not.toContain('<img');
      expect(html.match(/class="plan-day-row"/g)).toHaveLength(6);
      for (const [fact, stage] of [['Table: 2', 1], ['Main: Chicken', 2], ['Change: No onions', 2], ['Drink: Water', 3], ['Order: Closed', 4], ['Bill: Requested', 6]] as const) expect(html.includes(fact), fact).toBe(n >= stage);
      expect(html).not.toMatch(/€|\$|£|\d+[.,]\d\d|credit card|cash|tip|allerg/i);
    }
  });
  it('phone scene CSS preserves the complete frame without changing other missions', () => {
    const css = readFileSync(new URL('../../app/styles.css', import.meta.url), 'utf8');
    expect(css).toContain('.prime-img.is-scene[src*="/images/mission14/"] { flex-basis: 100%; width: 100%; height: auto; }');
    expect(css).toContain('.list-row:has(> .prime-img[src*="/images/mission14/"]) { flex-wrap: wrap; }');
  });
});
