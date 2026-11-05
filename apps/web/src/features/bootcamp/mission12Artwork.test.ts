import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M12_SLOTS, M12_PROPS, timeStrip, planner } from './practiceTimePlans.js';
import { missionContent } from './priorLearning.js';
import { HotelStaySummary } from './HotelStaySummary.js';

const langs = ['en', 'es', 'fr'] as const;
const assets = { ...M12_SLOTS, ...M12_PROPS };
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission12-artwork.json', import.meta.url), 'utf8')) as { name: string; sha256: string; width: number; height: number; review: { traveler: string; friend: string; world: string; text: boolean; clock: boolean; exactTime: boolean } }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission12\/[a-z-]+\.jpg/g) ?? [];

describe('Mission 12 reviewed artwork', () => {
  // Human visual inspection establishes identity, setting, and no baked text or clock.
  // These hashes bind that review to shipped pixels; metadata alone cannot prove semantics.
  for (const [slot, asset] of Object.entries(assets)) it(`${slot}: resolves to a reviewed full-size canonical JPEG without emoji fallback`, () => {
    expect(Object.keys(asset)).toEqual(['image']);
    expect(asset.image).toMatch(/^images\/mission12\/[a-z-]+\.jpg$/);
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
    expect(record.review).toMatchObject({ text: false, clock: false, exactTime: false });
  });
  it('ten separately generated assets cover all fourteen slots and the result prop', () => {
    expect(Object.keys(M12_SLOTS)).toHaveLength(14);
    expect(Object.keys(M12_PROPS)).toHaveLength(1);
    expect(records).toHaveLength(10);
    expect(new Set(records.map((r) => r.sha256)).size).toBe(10);
    expect(new Set(paths(missionContent('en', 12)))).toEqual(new Set(records.map((r) => `images/mission12/${r.name}.jpg`)));
  });
  it('reviewed traveler, friend and courtyard continuity is bound to every shipped asset', () => {
    for (const field of ['traveler', 'friend', 'world'] as const) {
      expect(new Set(records.map((r) => r.review[field])).size).toBe(1);
      expect(records[0]!.review[field].length).toBeGreaterThan(20);
    }
  });
  it('related functions reuse complete images; there is no time-word artwork', () => {
    expect(M12_SLOTS['open-morning']).toEqual(M12_SLOTS['free-tonight']);
    expect(M12_SLOTS['ask-tomorrow']).toEqual(M12_SLOTS['ask-time']);
    expect(M12_SLOTS['tonight-question']).toEqual(M12_SLOTS['morning-question']);
    expect(records.map((r) => r.name).join(' ')).not.toMatch(/clock|20-00|07-00/);
  });
  const baseline = {
    en: '24401f87dca3320f1555e4ae4a3e39dcc90edbaa56136c48ab1ae7965ba586b2',
    es: '0c80212fcdc0b1eadcc351d17e41b22710a9d6cfe393c931645039fbb5118602',
    fr: 'db952eeefb11bda25994f88db7a092630b39fd688520be5395c23aedac016925',
  };
  for (const lang of langs) {
    it(`${lang}: all nonvisual fields match approved 3ce3fbb, including locked dialogue and reveal order`, () => {
      const json = JSON.stringify(missionContent(lang, 12), (key, value) => key === 'image' || key === 'emoji' ? undefined : value);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: artwork has identical sequencing and no semantic emoji fallback`, () => {
      const steps = missionContent(lang, 12).steps;
      expect(steps.map(paths)).toEqual(missionContent('en', 12).steps.map(paths));
      for (const s of steps) if (s.kind === 'prime') for (const w of s.words) {
        expect(w.image).toMatch(/^images\/mission12\//);
        expect(w.emoji).toBeUndefined();
      }
    });
    it(`${lang}: no dinner/centre, beach, departure or result artwork before its reveal`, () => {
      const steps = missionContent(lang, 12).steps;
      const before = (key: string) => paths(steps.slice(0, steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key))));
      expect(before('time.line.invite')).not.toContain(M12_SLOTS['dinner-invitation'].image);
      expect(before('time.line.beach')).not.toContain(M12_SLOTS['beach-plan'].image);
      expect(before('time.line.early')).not.toContain(M12_SLOTS['leave-early'].image);
      expect(paths(steps.slice(0, -2))).not.toContain(M12_PROPS['plans-made'].image);
      expect(steps[0]).toMatchObject({ image: M12_SLOTS['morning-meeting'].image });
      expect(steps.at(-2)).toMatchObject({ image: M12_PROPS['plans-made'].image });
    });
    it(`${lang}: every choice set remains uniformly deterministic; exact hours are text`, () => {
      for (const s of missionContent(lang, 12).steps) if (s.kind === 'visualMatch') {
        for (const t of s.tiles) expect(t.image).toBeUndefined();
        expect(new Set(s.tiles.map((t) => Boolean(t.emoji))).size).toBe(1);
        if (s.tiles.some((t) => t.id === '20:00')) {
          expect(s.tiles.map((t) => t.label)).toEqual(['18:00', '20:00', '22:00']);
          for (const t of s.tiles) expect(t.emoji).toBeUndefined();
        }
      }
    });
  }
  it('Time Strip and Planner render only deterministic text at every reveal stage', () => {
    for (let n = 0; n <= 6; n++) {
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${timeStrip('tonight')[1]} ¦ ${planner(n as 0)[1]}` }));
      expect(html.match(/class="time-strip-cell"/g)).toHaveLength(4);
      expect(html.match(/class="plan-day-row"/g)).toHaveLength(4);
      expect(html).not.toContain('<img');
      expect(html.includes('20:00')).toBe(n >= 2);
      expect(html.includes('07:00')).toBe(n >= 5);
      expect(html.includes('Beach')).toBe(n >= 3);
      expect(html.includes('Dinner · Centre')).toBe(n >= 1);
    }
  });
  it('mobile layout keeps full-frame art and puts readable time cells on their own row', () => {
    const css = readFileSync(new URL('../../app/styles.css', import.meta.url), 'utf8');
    expect(css).toContain('.pc-head-text:has(.time-board) { flex: 1 0 100%; }');
    expect(css).toMatch(/@media \(max-width: 430px\) \{\s*\.time-strip \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(css).toContain('.time-strip-cell { font-size: 0.85rem; line-height: 1.4;');
    expect(css).toContain('.prime-img.is-scene[src*="/images/mission12/"] { flex-basis: 100%; width: 100%; height: auto; }');
  });
});
