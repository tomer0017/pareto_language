import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { M09_PROPS, M09_SCENES, M09_SHOP, M09_SLOTS } from './practiceArrival.js';
import { missionContent } from './priorLearning.js';
import type * as Renderers from './PracticeSteps.js';

const langs = ['en', 'es', 'fr'] as const;
const assets = { ...M09_SLOTS, ...M09_PROPS, 'store-layout': M09_SCENES.store, 'purchase-complete': M09_SCENES.complete };
const provenance = JSON.parse(readFileSync(new URL('../../../../../docs/mission09-artwork.json', import.meta.url), 'utf8')) as { name: string; sha256: string; originalWidth: number; originalHeight: number }[];
const css = readFileSync(new URL('../../app/styles.css', import.meta.url), 'utf8');
const images = (value: unknown): string[] => JSON.stringify(value).match(/images\/mission09\/[a-z-]+\.jpg/g) ?? [];

// Pixel semantics/identity are inspected visually. These hashes bind that review to the files
// actually shipped; metadata assertions alone cannot establish the content of an image.
describe('Mission 09 production artwork', () => {
  for (const [name, asset] of Object.entries(assets)) it(`${name}: separate canonical reviewed wide JPEG, physically present`, () => {
    expect(asset).toEqual({ image: `images/mission09/${name}.jpg` });
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
    const record = provenance.find((r) => r.name === name)!;
    expect([width, height]).toEqual([record.originalWidth, record.originalHeight]);
    expect(createHash('sha256').update(data).digest('hex')).toBe(record.sha256);
  });
  it('17 distinct source files, with no duplicate scene masquerading as another meaning', () => {
    expect(provenance).toHaveLength(17);
    expect(new Set(provenance.map((r) => r.sha256)).size).toBe(17);
  });
  it('EN, ES, FR consume the exact same artwork at the same points', () => {
    const expected = missionContent('en', 9).steps.map(images);
    for (const lang of langs) expect(missionContent(lang, 9).steps.map(images)).toEqual(expected);
    const used = new Set(expected.flat());
    for (const asset of Object.values(assets)) expect(used).toContain(asset.image);
  });
  for (const lang of langs) it(`${lang}: opening and try-on have no sale, replacement or completion artwork; later reveals stay ordered`, () => {
    const steps = missionContent(lang, 9).steps;
    const fitting = steps.findIndex((s) => s.kind === 'miniMap');
    const bigger = steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'shop.line.bigger'));
    const sale = steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'shop.line.size-up-sale'));
    expect(images(steps.slice(0, fitting))).not.toContain(M09_SLOTS['sale-reveal'].image);
    expect(images(steps.slice(0, sale))).not.toContain(M09_SLOTS['one-size-up'].image);
    expect(images(steps.slice(0, sale))).not.toContain(M09_SLOTS['sale-reveal'].image);
    expect(images(steps.slice(0, fitting + 1))).not.toContain(M09_SLOTS['too-small'].image);
    expect(images(steps.slice(0, bigger))).not.toContain(M09_SLOTS['ask-bigger-size'].image);
    expect(images(steps.slice(0, -2))).not.toContain(M09_SCENES.complete.image);
    expect(steps.at(-2)).toMatchObject({ kind: 'receipt', image: M09_SCENES.complete.image });
  });
  it('the same fixed product changes only M → L; data selections remain image-free', () => {
    expect(M09_SHOP).toEqual({ item: 'jacket', size: 'M', replacement: 'L', discount: 20, outcome: 'buy' });
    for (const lang of langs) for (const step of missionContent(lang, 9).steps) {
      if (step.kind !== 'visualMatch') continue;
      for (const tile of step.tiles) { expect(tile.image).toBeUndefined(); expect(tile.emoji).toBeUndefined(); }
      if (step.ordered) {
        expect(step.tiles.map((t) => t.label)).toEqual(['S', 'M', 'L', 'XL']);
        expect(step.tiles.filter((t) => t.current).map((t) => t.label)).toEqual(['M']);
        expect(step.rounds.every((r) => r.correct === 'size-L')).toBe(true);
      } else {
        expect(step.tiles.map((t) => t.label)).toEqual(['−10%', '−20%', '−50%']);
        expect(step.tiles.every((t) => !t.current)).toBe(true);
      }
    }
  });
});

describe('Mission 09 store renderer and mobile contracts', () => {
  let renderers: typeof Renderers;
  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined });
    renderers = await import('./PracticeSteps.js');
  });
  for (const lang of langs) it(`${lang}: all six map rounds use one environment and four equally treated semantic destinations`, () => {
    const maps = missionContent(lang, 9).steps.filter((s) => s.kind === 'miniMap');
    expect(maps).toHaveLength(6);
    for (const step of maps) {
      expect(step.presentation).toBe('shopping-store');
      expect(step.scene).toBe(M09_SCENES.store.image);
      expect(step.revealImage).toBeUndefined();
      for (const round of step.rounds) {
        expect(round.cells.find((c) => c.id === round.correct)?.zone).toBe(round.correct);
        expect(round.cells.every((c) => c.image && !c.emoji)).toBe(true);
      }
      const html = renderToStaticMarkup(createElement(renderers.MiniMapStep, { step, onDone: () => undefined }));
      expect(html.match(/src="[^" ]*images\/mission09\//g)).toHaveLength(1);
      expect(html).toContain('shopping-store-scene');
      expect(html).not.toContain('ptile-emoji');
      expect(html.match(/class="ptile has-image {2}"/g)).toHaveLength(4);
      expect(html).not.toContain('is-ok');
      expect(html).not.toContain('is-bad');
    }
  });
  it('semantic identity survives changed grid coordinates and array order', () => {
    const step = missionContent('en', 9).steps.find((s) => s.kind === 'miniMap')!;
    const moved = { ...step, rounds: step.rounds.map((r) => ({ ...r, cells: [...r.cells].reverse().map((c) => ({ ...c, row: (2 - c.row) as 0 | 1 | 2, col: (2 - c.col) as 0 | 1 | 2 })) })) };
    const html = renderToStaticMarkup(createElement(renderers.MiniMapStep, { step: moved, onDone: () => undefined }));
    for (const zone of ['fitting-room', 'till', 'racks', 'entrance']) expect(html).toContain(`data-zone="${zone}"`);
    // Coordinates place data in the old engine; visual placement and answering use semantic zones.
    expect(css).toContain('button[data-zone="fitting-room"]');
    expect(css).toContain('button[data-zone="till"]');
    expect(css).not.toMatch(/shopping-store[^}]*nth-child/);
  });
  it('one un-cropped store scene, 44px minimum tap areas, four ordered equal size cells', () => {
    expect(css).toMatch(/\.shopping-store-scene \{[^}]*width: 100%;[^}]*height: auto;/);
    expect(css).toMatch(/\.pmap\.shopping-store button\.ptile \{[^}]*min-height: 44px/);
    expect(css).toMatch(/\.pgrid\.is-ordered \{[^}]*repeat\(4, minmax\(0, 1fr\)\)/);
  });
});
