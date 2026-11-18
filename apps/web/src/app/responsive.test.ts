import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type * as AppModule from '../shared/stores/appStore.js';
import type * as StringsModule from '../shared/i18n/strings.js';
import type * as BootcampModule from '../features/bootcamp/bootcampStore.js';
import type * as HomeModule from '../features/home/Home.js';
import type * as BasicsModule from '../features/basics/BasicWords.js';
import type * as ListenModule from '../features/listen/Listen.js';
import type * as VideosModule from '../features/videos/Videos.js';
import type * as FreeModule from '../features/free/FreeLearning.js';
import type * as LearnModule from '../features/bootcamp/Learn.js';

/**
 * The responsive pass — tablets and desktops, presentation only (app/responsive.css).
 *
 *   1. It cannot reach a phone: every rule sits inside a min-width ≥ 768px media query, and it is loaded
 *      after styles.css. Logical properties only (it mirrors in Hebrew); no generated text, no Daily Goal
 *      or Mission 18 rules, nothing hidden.
 *   2. The DOM it lays out is the DOM the screens really render (its `:has()` / child selectors depend on
 *      it) — rendered here with react-dom/server, so a markup change that would silently drop a layout
 *      fails a test instead.
 *   3. The layout decisions themselves: two-up tiles, the Situations / listening grids, a whole story
 *      cover, the centred dialog, the clip beside its controls.
 */
const src = (p: string): string => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const strip = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');
const responsive = strip(src('./responsive.css'));
const styles = src('./styles.css');

/** The top-level blocks of a stylesheet: `{ prelude, body }` (comments already stripped). */
function topLevel(css: string): { prelude: string; body: string }[] {
  const out: { prelude: string; body: string }[] = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) { expect(css.slice(i).trim(), 'nothing outside a block').toBe(''); break; }
    let depth = 1;
    let j = open + 1;
    for (; j < css.length && depth > 0; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; }
    out.push({ prelude: css.slice(i, open).trim(), body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}

/** A tiny element tree of a static render — enough to ask "is X a direct child of Y?". */
interface El { tag: string; cls: string[]; parent: El | null; children: El[] }
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function tree(html: string): El[] {
  const root: El = { tag: '#root', cls: [], parent: null, children: [] };
  const all: El[] = [];
  let at = root;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    const [, close, tag, attrs, self] = m;
    if (close) { if (at.parent) at = at.parent; continue; }
    const cls = /\sclass="([^"]*)"/.exec(attrs!)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
    const el: El = { tag: tag!.toLowerCase(), cls, parent: at, children: [] };
    at.children.push(el);
    all.push(el);
    if (!self && !VOID.has(el.tag)) at = el;
  }
  return all;
}
const is = (el: El | null, ...cls: string[]): boolean => !!el && cls.every((c) => el.cls.includes(c));
const find = (els: El[], ...cls: string[]): El[] => els.filter((e) => is(e, ...cls));

const disk = new Map<string, string>();
let app: typeof AppModule;
let strings: typeof StringsModule;
let bootcamp: typeof BootcampModule;
let home: typeof HomeModule;
let basics: typeof BasicsModule;
let listen: typeof ListenModule;
let videos: typeof VideosModule;
let free: typeof FreeModule;
let learn: typeof LearnModule;
const render = (el: Parameters<typeof createElement>[0]): El[] => tree(renderToStaticMarkup(createElement(el as never)));
function put<T extends object>(store: { setState: (patch: Partial<T>) => void; getInitialState: () => T }, patch: Partial<T>): void {
  store.setState(patch);
  Object.assign(store.getInitialState(), patch);
}

beforeAll(async () => {
  disk.set('ready.lang', 'es');
  disk.set('ready.uiLang', 'he');
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => disk.get(k) ?? null,
    setItem: (k: string, v: string) => void disk.set(k, v),
    removeItem: (k: string) => void disk.delete(k),
    key: (i: number) => [...disk.keys()][i] ?? null,
    get length() { return disk.size; },
  });
  app = await import('../shared/stores/appStore.js');
  strings = await import('../shared/i18n/strings.js');
  bootcamp = await import('../features/bootcamp/bootcampStore.js');
  home = await import('../features/home/Home.js');
  basics = await import('../features/basics/BasicWords.js');
  listen = await import('../features/listen/Listen.js');
  videos = await import('../features/videos/Videos.js');
  free = await import('../features/free/FreeLearning.js');
  learn = await import('../features/bootcamp/Learn.js');
});
beforeEach(() => {
  strings.setUiLangDict('he');
  put(app.useAppStore, { uiLang: 'he', learningLang: 'es', view: 'home', listenPage: null, coreIntent: null, coreCategory: null, readingIntent: null });
  put(bootcamp.useBootcampStore, { activeDay: null });
});

/* ── 1. It cannot reach a phone ─────────────────────────────────────────────────────────────── */

describe('the responsive stylesheet: tablets and desktops only', () => {
  it('every rule sits inside a min-width ≥ 768px media query (keyframes aside), so no phone can change', () => {
    const blocks = topLevel(responsive);
    expect(blocks.length).toBeGreaterThan(10);
    for (const { prelude } of blocks) {
      if (prelude.startsWith('@keyframes')) continue;
      expect(prelude, prelude).toMatch(/^@media\b/);
      const min = /min-width:\s*(\d+)px/.exec(prelude);
      expect(min, `${prelude} has a min-width`).not.toBeNull();
      expect(Number(min![1]), prelude).toBeGreaterThanOrEqual(768);
      expect(prelude, prelude).not.toMatch(/max-width/);
    }
  });

  it('is loaded after styles.css, so it refines the phone layout instead of being overridden by it', () => {
    const main = src('../main.tsx');
    expect(main.indexOf("import './app/responsive.css';")).toBeGreaterThan(main.indexOf("import './app/styles.css';"));
    expect(main.indexOf("import './app/styles.css';")).toBeGreaterThan(-1);
  });

  it('uses logical properties only, so every rule mirrors in Hebrew', () => {
    expect(responsive).not.toMatch(/margin-left|margin-right|padding-left|padding-right|border-left|border-right|text-align:\s*(left|right)|[^-\w](left|right)\s*:/);
  });

  it('presentation only: no generated text, nothing hidden, no Daily Goal and no Mission 18 rules', () => {
    expect(responsive).not.toMatch(/(^|[^-\w])content\s*:/m);
    expect(responsive).not.toMatch(/display:\s*none|visibility:\s*hidden/);
    expect(responsive).not.toMatch(/\.dg-|daily/i);
    expect(responsive).not.toMatch(/data-checkpoint|everyday-day/);
    // The Mission 18 rule (every line after its marker is scoped) still holds in styles.css.
    const addition = styles.split('/* Mission 18: presentation only.')[1]!;
    for (const line of addition.split('\n').filter((l) => l.includes('{') && !l.startsWith('.checkpoint-content'))) expect(line).toContain('[data-checkpoint="everyday-day"]');
  });
});

/* ── 2. The DOM it lays out is the DOM the screens render ─────────────────────────────────────── */

describe('the shapes the stylesheet lays out are the ones the screens render', () => {
  /** `.screen-wide > .screen-scroll > .choice-list` — what makes a page a "launch page". */
  const launchList = (els: El[]): El => {
    const lists = find(els, 'choice-list').filter((l) => is(l.parent, 'screen-scroll') && is(l.parent!.parent, 'screen', 'screen-wide'));
    expect(lists).toHaveLength(1);
    return lists[0]!;
  };

  it('Home, Basic words and the Listening hub are launch pages: a list of choice tiles, two-up', () => {
    const homeList = launchList(render(home.Home));
    expect(homeList.children.filter((c) => is(c, 'choice-card'))).toHaveLength(4);
    expect(is(homeList.parent!.parent, 'home-screen')).toBe(true);
    expect(launchList(render(basics.BasicWords)).children.filter((c) => is(c, 'choice-card'))).toHaveLength(4);
    const modes = launchList(render(listen.Listen));
    expect(is(modes, 'listen-modes')).toBe(true);
    expect(modes.children.filter((c) => is(c, 'choice-card'))).toHaveLength(4);
    // Each tile is the shared card: icon, body (title + line), chevron — the tile grid places those three.
    for (const card of modes.children) {
      expect(card.children.map((c) => c.cls[0])).toEqual(['choice-icon', 'choice-body', 'icon']);
    }
  });

  it('Situations is a browse page whose 30 cards are the grid\'s direct children; it is not a launch page', () => {
    const els = render(learn.Learn);
    const grid = find(els, 'mission-grid')[0]!;
    expect(grid.children.filter((c) => is(c, 'mcard'))).toHaveLength(30);
    expect(find(els, 'choice-list')).toHaveLength(0);
  });

  it('Games & stories: every card is a direct child of the grid (the balanced rows lay out its children)', () => {
    const els = render(free.FreeLearning);
    const grid = find(els, 'free-grid')[0]!;
    expect(grid.children.length).toBeGreaterThanOrEqual(7);
    expect(grid.children.every((c) => is(c, 'free-card'))).toBe(true);
  });

  it('the listening player page holds `.listen-player` inside the browse screen (it narrows to one column)', () => {
    put(app.useAppStore, { listenPage: { mode: 'situations', play: 'introduce-myself' } });
    const els = render(listen.Listen);
    const player = find(els, 'listen-player')[0]!;
    let up: El | null = player;
    while (up && !is(up, 'screen')) up = up.parent;
    expect(is(up, 'screen', 'screen-wide')).toBe(true);
    // A list page has no player, so it keeps the full browse width.
    put(app.useAppStore, { listenPage: { mode: 'situations', play: null } });
    expect(find(render(listen.Listen), 'listen-player')).toHaveLength(0);
  });

  it('situation videos: the stage (title + clip) and the action zone (controls) are children of the screen', () => {
    const els = render(videos.Videos);
    const stage = find(els, 'videos-stage')[0]!;
    expect(is(stage.parent, 'screen')).toBe(true);
    expect(stage.children.map((c) => c.cls[0])).toEqual(['videos-now', 'video-frame']);
    const zone = find(els, 'action-zone')[0]!;
    expect(zone.parent).toBe(stage.parent);
    expect(is(zone.children[0]!, 'videos-controls')).toBe(true);
  });

  it('the story reader\'s hero is the cover frame, then the title, the translation and the meta', () => {
    const reader = src('../features/reading/Reading.tsx');
    const hero = reader.slice(reader.indexOf('<div className="reader-hero fade-in">'), reader.indexOf('{story.sentences.map('));
    const order = ['reader-hero-frame', 'reader-hero-title', 'reader-hero-sub', 'reader-hero-meta'].map((c) => hero.indexOf(`className="${c}`));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

/* ── 3. The layout decisions ────────────────────────────────────────────────────────────────── */

/** The declarations for `selector` inside the media query whose min-width is `min`. */
function rule(min: number, selector: string): string {
  const block = topLevel(responsive).find((b) => new RegExp(`^@media \\(min-width: ${min}px\\)`).test(b.prelude) && b.body.includes(`${selector} {`));
  expect(block, `${selector} at ≥ ${min}px`).toBeTruthy();
  const body = block!.body;
  const at = body.indexOf(`${selector} {`);
  return body.slice(at, body.indexOf('}', at));
}

describe('the layout decisions', () => {
  it('Home, Basic words, Listen: tiles two-up from tablets, larger on desktops; the launch stage is centred', () => {
    expect(styles).toMatch(/@media \(min-width: 768px\) \{ \.choice-list \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(rule(768, '.choice-card')).toMatch(/min-height: clamp\(160px/);
    expect(rule(1100, '.choice-card')).toMatch(/min-height: clamp\(170px/);
    expect(rule(768, '.screen-wide:has(> .screen-scroll > .choice-list)')).toContain('max-width: var(--launch-max)');
    expect(responsive).toMatch(/--launch-max: 1040px/);
  });

  it('Situations: one column on phones, two on tablets, two or three by width on desktops — never a card under 360px', () => {
    expect(styles).toMatch(/\.mission-grid \{ display: grid; gap: 10px; grid-template-columns: minmax\(0, 1fr\); \}/);
    expect(styles).toMatch(/@media \(min-width: 768px\) \{ \.mission-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(rule(1100, '.mission-grid')).toContain('repeat(auto-fill, minmax(360px, 1fr))');
  });

  it('Games & stories: two-up on tablets, three-up on desktops, a short last row centred', () => {
    expect(rule(768, '.free-grid')).toMatch(/display: flex; flex-wrap: wrap; justify-content: center/);
    expect(rule(768, '.free-grid > .free-card')).toContain('calc((100% - var(--tile-gap)) / 2)');
    expect(rule(1100, '.free-grid > .free-card')).toContain('calc((100% - 2 * var(--tile-gap)) / 3)');
  });

  it('Listening: the lists two-up, the player one centred column with its title', () => {
    expect(rule(768, '.topic-list')).toContain('repeat(2, minmax(0, 1fr))');
    expect(rule(768, '.screen-wide:has(.listen-player)')).toContain('max-width: var(--focus-max)');
  });

  it('the story cover is shown whole — square, beside its title — never cropped into a strip', () => {
    expect(rule(768, '.reader-hero-img')).toMatch(/aspect-ratio: 1 \/ 1/);
    expect(rule(768, '.reader-hero')).toMatch(/display: grid/);
  });

  it('a landscape tablet or desktop shows a situation video beside its controls, the controls in the flow', () => {
    const block = topLevel(responsive).find((b) => b.prelude === '@media (min-width: 1000px) and (orientation: landscape)')!;
    expect(block.body).toMatch(/\.screen:has\(> \.videos-stage\) > \.action-zone \{[^}]*position: static/);
    // A static action zone is content to the Daily Goal: it keeps to its corner (it rises above FIXED bars only).
    expect(src('../features/dailyGoal/useDailyGoalTimer.ts')).toContain("getComputedStyle(bar).position !== 'fixed') return null");
  });

  it('the Foundation sheet opens as a centred dialog on tablets and desktops', () => {
    expect(rule(768, '.sheet-scrim')).toContain('align-items: center');
    expect(rule(768, '.sheet-panel')).toMatch(/max-width: 640px[^}]*border-radius: 24px/);
  });

  it('the story player\'s settings button sizes to its icon, so the quiz button stays on screen (every width)', () => {
    expect(styles).toMatch(/\.reading-gear \{ flex: 0 0 auto; width: auto;/);
  });
});
