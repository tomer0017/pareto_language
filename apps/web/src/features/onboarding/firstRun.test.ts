import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LEARNING_LANGUAGES, isSelectableLanguage, languageBadge } from '../../shared/i18n/languages.js';
import { setUiLangDict } from '../../shared/i18n/strings.js';
import type * as AppModule from '../../shared/stores/appStore.js';
import type * as OnboardingModule from './Onboarding.js';
import type * as SelectModule from '../languages/LanguageSelect.js';

/**
 * Real-device QA, 2026-10-06: on first launch Spanish and French were marked READY but could not be
 * chosen (the welcome drew them as plain cards), while the in-app picker allowed them. One
 * readiness model now drives every picker; a READY language is selectable on the very first run.
 * Also here: the 9:16 mission video is never cropped, and the first-run classroom is shown whole.
 */
const src = (p: string): string => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const css = (): string => src('../../app/styles.css');

describe('one readiness model for every language picker', () => {
  it('English, Spanish and French are selectable; Italian and Arabic are coming soon', () => {
    expect(LEARNING_LANGUAGES.map((l) => [l.code, languageBadge(l.code), isSelectableLanguage(l.code)])).toEqual([
      ['en', 'ready', true], ['es', 'earlyAccess', true], ['fr', 'earlyAccess', true], ['it', 'comingSoon', false], ['ar', 'comingSoon', false],
    ]);
    expect(languageBadge('xx')).toBe('comingSoon');
  });
  it('the first-run welcome, the trip-plan picker and the in-app picker all read languageBadge / isSelectableLanguage — no private lists', () => {
    for (const f of ['./Onboarding.tsx', '../languages/LanguageSelect.tsx']) {
      const text = src(f);
      expect(text, f).toContain('languageBadge(');
      expect(text, f).toContain('isSelectableLanguage(');
      expect(text, f).not.toMatch(/l\.available\b/); // never the raw flag
      expect(text, f).not.toMatch(/PILOT_LANG/);
    }
    expect(src('../../shared/stores/appStore.ts')).toContain('if (!isSelectableLanguage(lang)) return;');
  });
});

describe('first run: a READY language can be chosen immediately', () => {
  const disk = new Map<string, string>();
  let app: typeof AppModule;
  let onboarding: typeof OnboardingModule;
  let select: typeof SelectModule;
  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    // Switching a language re-themes the document; give it one to theme.
    vi.stubGlobal('document', { documentElement: { style: { setProperty: () => undefined }, dataset: {}, dir: '', lang: '' } });
    disk.set('ready.uiLang', 'he'); // past the very first "which app language" screen
    app = await import('../../shared/stores/appStore.js');
    onboarding = await import('./Onboarding.js');
    select = await import('../languages/LanguageSelect.js');
    setUiLangDict('he');
    app.useAppStore.setState({ pack: null, learningLang: 'en', uiLang: 'he' });
  });
  const cards = (html: string): [code: string, enabled: boolean, checked: boolean, badge: string][] =>
    LEARNING_LANGUAGES.map((l) => {
      const at = html.indexOf(`<span class="lang-flag">${l.flag}</span>`);
      const open = html.lastIndexOf('<button', at);
      const tag = html.slice(open, at);
      const badge = html.slice(at, html.indexOf('</button>', at));
      return [l.code, !/\bdisabled=""/.test(tag), /aria-checked="true"/.test(tag), /badge-ready/.test(badge) ? 'ready' : /badge-notStarted/.test(badge) ? 'comingSoon' : 'none'];
    });

  it('fresh user: English, Spanish and French are real enabled buttons; Italian and Arabic are disabled and never show READY', () => {
    const html = renderToStaticMarkup(createElement(onboarding.Onboarding));
    expect(html).toContain('role="radiogroup"');
    expect(cards(html)).toEqual([['en', true, true, 'ready'], ['es', true, false, 'ready'], ['fr', true, false, 'ready'], ['it', false, false, 'comingSoon'], ['ar', false, false, 'comingSoon']]);
  });
  it('fresh user choosing Spanish: the learning language becomes Spanish, before anything else is entered', async () => {
    const store = app.useAppStore.getState();
    const init = vi.spyOn(store, 'init').mockResolvedValue(undefined);
    app.useAppStore.setState({ init: store.init });
    await app.useAppStore.getState().setLearningLang('es');
    expect(app.useAppStore.getState().learningLang).toBe('es');
    expect(disk.get('ready.lang')).toBe('es');
    expect(disk.get('ready.entered')).toBeUndefined(); // still the first run — no English detour
    // (A static render cannot observe a store change; the card's checked state is bound to the store.)
    expect(src('./Onboarding.tsx')).toContain('const selected = l.code === app.learningLang;');
    await app.useAppStore.getState().setLearningLang('fr');
    expect(app.useAppStore.getState().learningLang).toBe('fr');
    await app.useAppStore.getState().setLearningLang('it'); // coming soon: refused
    expect(app.useAppStore.getState().learningLang).toBe('fr');
    init.mockRestore();
    app.useAppStore.setState({ learningLang: 'en' });
  });
  it('the returning (in-app) picker shows the same five with the same states', () => {
    const html = renderToStaticMarkup(createElement(select.LanguageSelect));
    expect(cards(html).map(([c, enabled]) => [c, enabled])).toEqual([['en', true], ['es', true], ['fr', true], ['it', false], ['ar', false]]);
  });
});

describe('the 9:16 mission video is shown whole', () => {
  it('the frame is a portrait 9:16 box sized to the phone, the clip is contained — never cropped', () => {
    const c = css();
    const frame = c.slice(c.indexOf('.video-frame {'), c.indexOf('}', c.indexOf('.video-frame {')));
    expect(frame).toContain('aspect-ratio: 9 / 16;');
    expect(frame).toContain('width: min(100%, calc((100dvh - var(--video-chrome)) * 9 / 16));'); // never taller than what is left under the heading and above the CTA
    expect(frame).toContain('max-height: calc(100dvh - var(--video-chrome));');
    const player = c.slice(c.indexOf('.video-player {'), c.indexOf('}', c.indexOf('.video-player {')));
    expect(player).toContain('object-fit: contain;');
    expect(player).not.toContain('cover');
    expect(player).toContain('width: 100%;');
    expect(player).toContain('height: 100%;');
    expect(c).toContain('@supports not (height: 100dvh)'); // older Safari
    // The Continue button stays in its fixed action zone (not over the clip): the frame leaves room for it.
    expect(frame).toMatch(/--video-chrome: 2\d\dpx/);
    expect(c).toMatch(/\.action-zone \{\n {2}position: fixed; bottom: 0;/);
    // The same player serves the mission step, the overlay and the Videos screen.
    const player_tsx = src('../bootcamp/Bootcamp.tsx');
    expect(player_tsx.match(/<VideoPlayer /g)!.length).toBeGreaterThanOrEqual(2); // the step and the overlay (Videos.tsx is the third)
    expect(player_tsx).not.toMatch(/objectFit|object-fit/);
  });
});

describe('the first-run classroom is shown whole', () => {
  it('the hero is a box of the image\'s own ratio (851×968) with the picture contained, and the sheet barely overlaps it', () => {
    const c = css();
    expect(c).toContain('.entry-hero { flex: none; width: 100%; aspect-ratio: 851 / 968; max-height: 56vh; overflow: hidden;');
    expect(c).toContain('.entry-hero img { width: 100%; height: 100%; object-fit: contain; object-position: 50% 50%;');
    expect(c).toMatch(/\.entry-sheet \{\n[^}]*margin: -14px auto 0;/);
    expect(src('./Onboarding.tsx')).toContain('/onboarding/classroom.jpg');
  });
});
