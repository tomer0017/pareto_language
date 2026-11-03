import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { M11_SLOTS, M11_PROPS, conversationFlow, localTip } from './practiceSmallTalk.js';
import { missionContent } from './priorLearning.js';
import { HotelStaySummary } from './HotelStaySummary.js';

const langs = ['en', 'es', 'fr'] as const;
const assets = { ...M11_SLOTS, ...M11_PROPS };
const records = JSON.parse(readFileSync(new URL('../../../../../docs/mission11-artwork.json', import.meta.url), 'utf8')) as { name: string; sha256: string; width: number; height: number }[];
const paths = (x: unknown): string[] => JSON.stringify(x).match(/images\/mission11\/[a-z-]+\.jpg/g) ?? [];

describe('Mission 11 reviewed artwork', () => {
  // Visual review establishes identity, gestures and absence of baked text. Checksums bind that
  // review to actual shipped pixels; dimensions or filenames alone cannot prove image semantics.
  for (const [name, asset] of Object.entries(assets)) it(`${name}: canonical separate high-resolution reviewed JPEG`, () => {
    expect(asset).toEqual({ image: `images/mission11/${name}.jpg` });
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
    const record = records.find((r) => r.name === name)!;
    expect([width, height]).toEqual([record.width, record.height]);
    expect(createHash('sha256').update(data).digest('hex')).toBe(record.sha256);
  });
  it('all 13 files are distinct and all slots are actually consumed', () => {
    expect(records).toHaveLength(13);
    expect(new Set(records.map((r) => r.sha256)).size).toBe(13);
    const used = new Set(paths(missionContent('en', 11)));
    expect(used).toEqual(new Set(Object.values(assets).map((a) => a.image)));
  });
  it('all three languages use identical visual sequencing', () => {
    const expected = missionContent('en', 11).steps.map(paths);
    for (const lang of langs) expect(missionContent(lang, 11).steps.map(paths)).toEqual(expected);
  });
  const baseline = {
    en: 'b24f04a9dc41a75f191fab7b917206e4aa0c77b4452c7d49e6866864856ffe28',
    es: 'd4faba8e4fa452d876fed250c47e64a6c7ee0c5484f94f3c9a4f7232cb4cac62',
    fr: '7e01f724b314376450bad410f86bc6e9b7d85b71af9f18c96cb173357bc75622',
  };
  for (const lang of langs) {
    it(`${lang}: every nonvisual mission field is identical to approved 1eeaa80`, () => {
      const json = JSON.stringify(missionContent(lang, 11), (key, value) => key === 'image' || key === 'emoji' ? undefined : value);
      expect(createHash('sha256').update(json).digest('hex')).toBe(baseline[lang]);
    });
    it(`${lang}: recommendation and local identity artwork cannot appear early`, () => {
      const steps = missionContent(lang, 11).steps;
      const tipAt = steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'talk.line.tip'));
      const localAt = steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'talk.line.from-here'));
      expect(paths(steps.slice(0, tipAt))).not.toContain(M11_SLOTS['local-recommends'].image);
      expect(paths(steps.slice(0, tipAt + 2))).not.toContain(M11_PROPS['mama-rosa'].image);
      expect(paths(steps.slice(0, localAt))).not.toContain(M11_SLOTS['first-time'].image);
      expect(paths(steps.slice(0, -2))).not.toContain(M11_PROPS['small-talk-complete'].image);
      expect(steps[0]).toMatchObject({ kind: 'talk', image: M11_SLOTS['scenic-viewpoint'].image });
      expect(steps.at(-2)).toMatchObject({ kind: 'receipt', image: M11_PROPS['small-talk-complete'].image });
    });
    it(`${lang}: every choice stays deterministic and every teaching image has no emoji fallback`, () => {
      for (const s of missionContent(lang, 11).steps) {
        if (s.kind === 'prime') for (const w of s.words) { expect(w.image).toMatch(/^images\/mission11\//); expect(w.emoji).toBeUndefined(); }
        if (s.kind === 'visualMatch') for (const t of s.tiles) { expect(t.label).toBeTruthy(); expect(t.image).toBeUndefined(); expect(t.emoji).toBeUndefined(); expect(t.current).toBeUndefined(); }
      }
    });
  }
  it('Conversation Flow and exact Local Tip remain text UI with no image dependency', () => {
    for (let done = 0; done <= 4; done++) for (const found of [false, true]) {
      const text = `${conversationFlow(done)[1]} · ${localTip(found)[1]}`;
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text }));
      expect(html.match(/class="hotel-stay-fact"/g)).toHaveLength(4);
      expect(html).not.toContain('<img');
      if (found) { expect(html).toContain('Mama Rosa'); expect(html).toContain('Old Town'); }
      else { expect(html).toContain('Local tip: ?'); expect(html).not.toContain('Mama Rosa'); expect(html).not.toContain('Old Town'); }
    }
  });
});
