import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { UI_DICTIONARIES } from '../../shared/i18n/strings.js';
import { adjacentStories } from '../reading/readingCore.js';
import { buildFoundation, matchesCategory } from './foundationContent.js';
import { COLOR_SWATCH, categoriesOf, swatchOf, tileOrder } from './foundationTiles.js';
import { FOUNDATION_TAXONOMY } from './taxonomy.js';
import { useFoundationStore } from './foundationStore.js';
import type { CoreWord } from '../../shared/content/coreWords.js';

/**
 * Foundations as a visual, tappable area: the world topics beside the building blocks, every word
 * in exactly one tile, colour tiles painted, a lively but stable order — and the Listen module and
 * the story player's arrows that shipped with it.
 */
const src = (p: string): string => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const PUBLIC = fileURLToPath(new URL('../../../public/content/', import.meta.url));
const pack = (lang: string): CoreWord[] => (JSON.parse(readFileSync(`${PUBLIC}core-${lang}.v1.json`, 'utf8')) as { words: CoreWord[] }).words;

describe('the world topics', () => {
  it('adds the beginner topics beside the building blocks, each in a group', () => {
    const world = FOUNDATION_TAXONOMY.filter((c) => c.group === 'world').map((c) => c.id);
    expect(world).toEqual(['colors', 'animals', 'fruitsVeg', 'food', 'home', 'nature', 'sports', 'transport', 'body', 'clothing', 'weather', 'places']);
    expect(FOUNDATION_TAXONOMY.filter((c) => c.group === 'blocks').map((c) => c.id)).toEqual(['people', 'questions', 'connectors', 'position', 'verbs', 'numbers', 'time', 'quantity', 'responses']);
    for (const c of FOUNDATION_TAXONOMY) for (const lang of ['en', 'he']) expect(UI_DICTIONARIES[lang]![c.titleKey], `${lang} ${c.titleKey}`).toBeTruthy();
  });
  for (const lang of ['en', 'fr', 'es']) {
    it(`${lang}: every world topic is rich (≥ 6 words), fruits & vegetables are carved out of food, and no word is in two topics`, () => {
      const words = pack(lang);
      const model = buildFoundation(words, {}, 'he', lang);
      const byId = new Map(model.map((c) => [c.id, c]));
      for (const c of FOUNDATION_TAXONOMY) expect(byId.get(c.id)?.words.length ?? 0, `${lang} ${c.id}`).toBeGreaterThanOrEqual(c.group === 'world' ? 6 : 4);
      expect(byId.get('animals')!.words.length).toBe(20);
      expect(byId.get('colors')!.words.length).toBe(10);
      const fv = new Set(byId.get('fruitsVeg')!.words.map((w) => w.conceptId));
      expect(fv.has('concept.word.apple') && fv.has('concept.word.carrot') && fv.has('concept.word.tomato')).toBe(true);
      for (const w of byId.get('food')!.words) expect(fv.has(w.conceptId), w.conceptId).toBe(false);
      for (const w of words) expect(FOUNDATION_TAXONOMY.filter((c) => matchesCategory(w, c)).length, `${lang} ${w.conceptId}`).toBeLessThanOrEqual(1);
    });
  }
  it('every colour of every pack has a swatch, and the swatch is by concept — identical across languages', () => {
    for (const lang of ['en', 'fr', 'es']) for (const w of pack(lang).filter((x) => x.category === 'colors')) expect(swatchOf(w.conceptId), `${lang} ${w.conceptId}`).toBeDefined();
    expect(swatchOf('concept.word.red')).toEqual({ bg: '#e5484d', ink: '#fff' });
    expect(swatchOf('concept.word.dog')).toBeUndefined();
    for (const s of Object.values(COLOR_SWATCH)) expect(s.bg).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('the tiles', () => {
  const words = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ conceptId: `concept.word.${id}` }));
  it('order is the category\'s own order and NOTHING moves it — not a tap, not hearing a word, not marking it seen', () => {
    const before = tileOrder(words).map((w) => w.conceptId);
    expect(before).toEqual(words.map((w) => w.conceptId)); // corpus order, no shuffle
    // Tapping tile 3 = speak + markViewed; the order the next render lays out is identical.
    const store = useFoundationStore.getState();
    store.markViewed('concept.word.c');
    store.markViewed('concept.word.a');
    expect(tileOrder(words).map((w) => w.conceptId)).toEqual(before);
    expect(tileOrder(words)).not.toBe(words); // a copy — the model is never mutated
    // Nothing in the sheet reorders on state: no seed, no shuffle, no viewed-dependent sort.
    const sheet = src('./FoundationSheet.tsx');
    expect(sheet).toContain('tileOrder(browse.cat.words).map((w) => {');
    expect(sheet).not.toMatch(/sessionSeed|shuffle\(/);
    expect(src('./foundationTiles.ts')).not.toMatch(/import [^\n]*shuffle|viewed\.has|sort\(/);
  });
  it('the sheet lays categories out as a 3-up tile grid in two groups, and words as 3-up tiles that play on tap', () => {
    const sheet = src('./FoundationSheet.tsx');
    expect(sheet).toContain("(['world', 'blocks'] as const).map((group) =>");
    expect(sheet).toContain('categoriesOf(model, FOUNDATION_TAXONOMY, group)');
    expect(sheet).toContain('tileOrder(browse.cat.words)');
    expect(sheet).toContain('onClick={() => hear(w)}'); // the whole tile hears the word
    expect(sheet).toContain('void speak(w.display.audioText, w.display.audioLang)');
    expect(sheet).toContain('markViewed(w.conceptId);'); // hearing counts as seen
    expect(sheet).toContain('className="foundation-tile-info"'); // ⓘ → the word page (details, examples)
    expect(sheet).toContain('style={swatch ? { background: swatch.bg, color: swatch.ink } : undefined}');
    const css = src('../../app/styles.css');
    expect(css).toMatch(/\.foundation-cats \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    expect(css).toMatch(/\.foundation-tiles \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    expect(css).toContain('.foundation-tile-hear {'); // min 108px tall tap target
    expect(css).toMatch(/\.foundation-tile-hear \{[^}]*min-height: 108px/);
    expect(css).toContain('.foundation-tiles-fade'); // "there is more below"
    expect(css).not.toMatch(/\.foundation-(tile|cat)[^{]*\{[^}]*(margin|padding)-(left|right)/); // RTL-safe
  });
  it('the grouping helper keeps declared order and drops empty categories', () => {
    const model = [{ id: 'animals', icon: '', titleKey: 'foundationCatAnimals' as const, words: [] }, { id: 'people', icon: '', titleKey: 'foundationCatPeople' as const, words: [] }];
    expect(categoriesOf(model, FOUNDATION_TAXONOMY, 'world').map((c) => c.id)).toEqual(['animals']);
    expect(categoriesOf(model, FOUNDATION_TAXONOMY, 'blocks').map((c) => c.id)).toEqual(['people']);
  });
});

describe('Listen: tabs and content are one module', () => {
  it('the tabs are the header of the same card whose panel they switch; the story card lives in the Stories tab', () => {
    const listen = src('../listen/Listen.tsx');
    const module = listen.slice(listen.indexOf('<section className="card listen-module"'), listen.indexOf('</section>', listen.indexOf('listen-module')));
    expect(module).toContain('className="tabs listen-tabs" role="tablist"');
    expect(module).toContain('aria-controls="listen-panel"');
    expect(module).toContain('id="listen-panel" role="tabpanel"');
    expect(module).toContain("category === 'stories' && stories && stories.length > 0 && <StoryCard");
    expect(module).toContain('<ListenPlayer');
    const css = src('../../app/styles.css');
    expect(css).toContain('.listen-tabs { margin: 0 0 10px; box-shadow: none;');
    expect(css).toContain('.listen-panel .listen-layout > .card { box-shadow: none; border: 1px solid var(--line)');
  });
});

describe('Reading: the player belongs to the story, and stories have previous / next', () => {
  it('adjacentStories: previous and next within the collection, null at the ends', () => {
    const s = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(adjacentStories(s, 'a')).toEqual({ prev: null, next: { id: 'b' }, index: 0 });
    expect(adjacentStories(s, 'b')).toEqual({ prev: { id: 'a' }, next: { id: 'c' }, index: 1 });
    expect(adjacentStories(s, 'c')).toEqual({ prev: { id: 'b' }, next: null, index: 2 });
    expect(adjacentStories(s, 'zz')).toEqual({ prev: null, next: null, index: -1 });
  });
  it('the reader shows the story on its player and arrows to the neighbouring stories (cover and player)', () => {
    const reading = src('../reading/Reading.tsx');
    expect(reading).toContain('siblings={collection?.stories ?? [story]}');
    expect(reading).toContain('const nav = adjacentStories(siblings, story.id);');
    expect(reading.match(/aria-label=\{t\('readingPrevStory'\)\}/g)).toHaveLength(2);
    expect(reading.match(/aria-label=\{t\('readingNextStory'\)\}/g)).toHaveLength(2);
    expect(reading).toContain('className="reader-now"'); // the player names the story it plays
    expect(reading).toContain('className="reader-controls"'); // one row of controls, never a stack
    const css = src('../../app/styles.css');
    expect(css).toContain('.reader-controls { display: flex; align-items: center; gap: 10px; }');
    expect(css).toMatch(/\.reader-transport \{[^}]*background: var\(--card\); border-radius: 24px 24px 0 0;/);
    for (const key of ['readingPrevStory', 'readingNextStory', 'readingStoryOf']) for (const lang of ['en', 'he']) expect(UI_DICTIONARIES[lang]![key as 'readingPrevStory'], `${lang} ${key}`).toBeTruthy();
  });
});
