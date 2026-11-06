import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M13_SLOTS, M13_PROPS, homeBoard, eveningRoute } from './practiceHomeFamily.js';
import { missionContent } from './priorLearning.js';
import { HotelStaySummary } from './HotelStaySummary.js';

const langs = ['en', 'es', 'fr'] as const;
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission13-artwork.json', import.meta.url), 'utf8')) as { name: string; sha256: string; width: number; height: number; review: { traveler: string; host: string; home: string; sofa: string; kitchen: string; text: boolean } }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission13\/[a-z-]+\.jpg/g) ?? [];
const baseline = {
  en: 'c244ba24cf23fb75454158a70ee3b03c5e81a813860ae7cbfdbec4b1181a5559',
  es: 'ad837afa936ec88e9474d2ee55d6f3e8abcae8834d9e659ba8d35c9f3c43c77e',
  fr: 'bbdbf008d65d5d047c51c8bdbd0593c802ac07fb4c41a460073a9c9ca48ab722',
};

describe('Mission 13 final artwork', () => {
  // Visual review establishes identity and absence of baked text. Hashes bind that review to pixels;
  // these tests do not pretend to infer faces, rooms or semantics from filenames or metadata.
  for (const [slot, asset] of Object.entries({ ...M13_SLOTS, ...M13_PROPS })) it(`${slot}: reviewed canonical full-size JPEG, no semantic emoji`, () => {
    expect(Object.keys(asset)).toEqual(['image']);
    expect(asset.image).toMatch(/^images\/mission13\/[a-z-]+\.jpg$/);
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
  it('covers 12 semantic slots and one earned result, using all generated assets', () => {
    expect(Object.keys(M13_SLOTS)).toHaveLength(12);
    expect(Object.keys(M13_PROPS)).toHaveLength(1);
    expect(new Set(paths(missionContent('en', 13)))).toEqual(new Set(records.map((r) => `images/mission13/${r.name}.jpg`)));
    expect(new Set(records.map((r) => r.sha256)).size).toBe(records.length);
  });
  it('binds reviewed character, home, sofa and kitchen continuity to the shipped assets', () => {
    for (const field of ['traveler', 'host', 'home', 'sofa', 'kitchen'] as const) {
      expect(new Set(records.map((r) => r.review[field])).size).toBe(1);
      expect(records[0]!.review[field].length).toBeGreaterThan(20);
    }
  });
  for (const lang of langs) {
    it(`${lang}: every nonvisual field matches approved 88906f3 including dialogue, 34 interactions, Flex and reveal order`, () => {
      const json = JSON.stringify(missionContent(lang, 13), (key, value) => key === 'image' || key === 'emoji' ? undefined : value);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: same artwork sequence and no semantic card fallback`, () => {
      const steps = missionContent(lang, 13).steps;
      expect(steps.map(paths)).toEqual(missionContent('en', 13).steps.map(paths));
      for (const s of steps) if (s.kind === 'prime') for (const w of s.words) {
        expect(w.image).toMatch(/^images\/mission13\//);
        expect(w.emoji).toBeUndefined();
      }
    });
    it(`${lang}: spoiler images are gated to their teaching moment and result is earned`, () => {
      const steps = missionContent(lang, 13).steps;
      const before = (key: string) => paths(steps.slice(0, steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key))));
      for (const [key, slot] of [['mother', 'mother-kitchen'], ['decline', 'polite-decline'], ['tired-q', 'tired'], ['rest', 'going-home'], ['sleep', 'after-dinner']] as const) {
        expect(before(`home.line.${key}`)).not.toContain(M13_SLOTS[slot].image);
      }
      expect(paths(steps.slice(0, -2))).not.toContain(M13_PROPS['home-visit-complete'].image);
      expect(steps[0]).toMatchObject({ image: M13_SLOTS['at-the-door'].image });
      expect(steps.at(-2)).toMatchObject({ image: M13_PROPS['home-visit-complete'].image });
    });
    it(`${lang}: canonical and Flex captures are equivalent semantic UI without fixed mother/kitchen art`, () => {
      const captures = missionContent(lang, 13).steps.filter((s) => s.kind === 'visualMatch');
      expect(captures).toHaveLength(3);
      expect(captures.map((s) => s.rounds[0]!.correct)).toEqual(['kitchen', 'living-room', 'kitchen']);
      for (const s of captures) {
        expect(paths(s)).toEqual([]);
        expect(s.tiles.map((t) => t.id)).toEqual(['living-room', 'kitchen']);
        for (const tile of s.tiles) { expect(tile.image).toBeUndefined(); expect(tile.caption).toBeDefined(); expect(tile.emoji).toBeTruthy(); }
      }
      expect(captures[1]).toMatchObject({ transferOnly: true });
      expect(captures[1]!.label?.en).not.toContain('Mother: Kitchen');
    });
  }
  it('the after-dinner question does not preview the sleep gesture within its card group', () => {
    for (const lang of langs) {
      const cards = missionContent(lang, 13).steps.flatMap((s) => s.kind === 'prime' ? s.words : []);
      expect(cards.find((w) => w.key === 'home.line.after')!.image).toBe(M13_SLOTS['going-home'].image);
      expect(cards.find((w) => w.key === 'home.line.sleep')!.image).toBe(M13_SLOTS['after-dinner'].image);
      expect(cards.slice(0, cards.findIndex((w) => w.key === 'home.line.sleep')).map((w) => w.image)).not.toContain(M13_SLOTS['after-dinner'].image);
    }
  });
  it('Board and Evening Route render deterministic text only at their established stages', () => {
    for (let n = 0; n <= 6; n++) {
      const route = eveningRoute(n as 0);
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${route ? route[1] + ' ¦ ' : ''}${homeBoard(n as 0)[1]}` }));
      expect(html).not.toContain('<img');
      expect(html.match(/class="plan-day-row"/g)).toHaveLength(5);
      expect(html.includes('Mother: Kitchen')).toBe(n >= 2);
      expect(html.includes('Grandmother')).toBe(n >= 3);
      expect(html.includes('Feeling: Tired')).toBe(n >= 4);
      expect(html.includes('Next: Home')).toBe(n >= 5);
      expect(html.includes('Sleep')).toBe(n >= 6);
      expect(html.match(/class="time-strip-cell"/g)?.length ?? 0).toBe(n >= 6 ? 4 : n >= 5 ? 2 : 0);
    }
  });
  it('phone artwork keeps both speakers and room context in the full image frame', () => {
    const css = readFileSync(new URL('../../app/styles.css', import.meta.url), 'utf8');
    expect(css).toContain('.prime-img.is-scene[src*="/images/mission13/"] { flex-basis: 100%; width: 100%; height: auto; }');
    expect(css).toContain('.list-row:has(> .prime-img[src*="/images/mission13/"]) { flex-wrap: wrap; }');
    expect(css).toContain('.pc-head-text:has(.time-board) { flex: 1 0 100%; }');
    expect(css).toContain('.time-strip.is-route { grid-template-columns: repeat(2, minmax(0, 1fr)); }');
  });
});
