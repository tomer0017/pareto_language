import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN } from './plan.js';
import { npcFor } from './npcCast.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep } from './types.js';
import type * as StepsModule from './PracticeSteps.js';
import type * as ConvoModule from './ConvoScene.js';
import type * as PlayerModule from './Bootcamp.js';
import type * as AppModule from '../../shared/stores/appStore.js';
import type * as SfxModule from '../../shared/audio/sfx.js';
import type * as FeedbackModule from '../../shared/ui/AnswerFeedback.js';
import type * as OnboardingModule from '../onboarding/Onboarding.js';
import type * as StringsModule from '../../shared/i18n/strings.js';

/**
 * The experience redesign: practice that looks like what it is (a conversation, a board, a map, a
 * sentence being built) instead of one form; people who speak; sounds that can be switched off.
 * None of it changes what is asked or what is accepted — the content guards live in
 * practiceV1 / practiceV11 / core30 / practiceAudit and must stay green beside this file.
 */
const mission = (n: number, lang = 'en'): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const stepOf = <K extends BootcampStep['kind']>(day: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }> =>
  day.steps.find((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind)!;
const HEBREW = /[֐-׿]/;
const css = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
const rule = (sel: string): string => { const at = css.lastIndexOf(`\n${sel} {`); return css.slice(at, css.indexOf('}', at)); };

describe('the experience', () => {
  const disk = new Map<string, string>();
  let steps: typeof StepsModule;
  let convo: typeof ConvoModule;
  let player: typeof PlayerModule;
  let app: typeof AppModule;
  let sfx: typeof SfxModule;
  let feedback: typeof FeedbackModule;
  let onboarding: typeof OnboardingModule;
  let strings: typeof StringsModule;
  const html = (el: ReactElement): string => renderToStaticMarkup(el);
  const game = (n: number, kind: 'quickReply' | 'visualMatch' | 'swap' | 'miniMap' | 'matchPairs' | 'sentenceBuilder'): string => {
    const day = mission(n);
    const itemsById = new Map(day.items.map((i) => [i.id, i]));
    const Step = { quickReply: steps.QuickReplyStep, visualMatch: steps.VisualMatchStep, swap: steps.SwapStep, miniMap: steps.MiniMapStep, matchPairs: steps.MatchPairsStep, sentenceBuilder: steps.SentenceBuilderStep }[kind] as (p: { step: BootcampStep; itemsById: typeof itemsById; onDone: () => void }) => JSX.Element;
    return html(createElement(Step, { step: stepOf(day, kind), itemsById, onDone: () => undefined }));
  };

  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    app = await import('../../shared/stores/appStore.js');
    strings = await import('../../shared/i18n/strings.js');
    steps = await import('./PracticeSteps.js');
    convo = await import('./ConvoScene.js');
    player = await import('./Bootcamp.js');
    sfx = await import('../../shared/audio/sfx.js');
    feedback = await import('../../shared/ui/AnswerFeedback.js');
    onboarding = await import('../onboarding/Onboarding.js');
  });

  describe('practice screens are not one form', () => {
    it('every engine draws on its own open canvas — none uses the shared white card', () => {
      const where: [number, Parameters<typeof game>[1]][] = [[1, 'quickReply'], [2, 'visualMatch'], [4, 'swap'], [5, 'miniMap'], [1, 'matchPairs'], [2, 'sentenceBuilder']];
      for (const [n, kind] of where) {
        const out = game(n, kind);
        expect(out, kind).toContain(`class="pcanvas" data-engine="${kind}"`);
        expect(out, kind).not.toContain('drill-card');
      }
      expect(rule('.pcanvas')).not.toMatch(/background|box-shadow|border/);
    });

    it('Quick Reply is a conversation: someone speaks (heard, not written), you answer in a reply bubble, your buddy listens', () => {
      const day = mission(1);
      const out = game(1, 'quickReply');
      expect(out).toMatch(/<div class="convo-row npc" dir="ltr"><span class="npc-fig" aria-hidden="true">[^<]+<\/span><button class="audio-bubble"/);
      for (const r of stepOf(day, 'quickReply').rounds) {
        const heard = day.items.find((i) => i.id === r.promptItemId)!.text;
        expect(out.includes(heard.replace(/'/g, '&#x27;')), heard).toBe(false); // the question is not given away in writing
      }
      expect(out.match(/class="btn-secondary btn-reply"/g)!.length).toBeGreaterThanOrEqual(2);
      expect(out).toContain('class="cmp-watch"');
      expect(out).toContain('data-mood="listening"');
      expect(rule('.btn-reply')).toMatch(/direction: ltr; unicode-bidi: isolate/);
    });

    it('the board and the map put sound first: an audio bubble, then the picture; the map has the buddy beside it', () => {
      const board = game(2, 'visualMatch');
      expect(board).toContain('class="audio-bubble"');
      expect(board.indexOf('audio-bubble')).toBeLessThan(board.indexOf('class="pgrid"'));
      expect(board).not.toContain('action-zone'); // nothing under the board until a tile is tapped
      const map = game(5, 'miniMap');
      expect(map).toContain('class="pgrid pmap" dir="ltr"');
      expect(map).toContain('class="audio-bubble"');
      expect(map).toContain('class="cmp-watch"');
      expect(map).not.toContain('action-zone');
    });

    it('Swap It is a sentence with a gap and the pieces that fit it — not a column of answer buttons', () => {
      const out = game(4, 'swap');
      expect(out).toMatch(/<p class="pframe">[^<]*<span class="pslot ">/);
      const pieces = out.slice(out.indexOf('class="pswap-pieces"'), out.indexOf('</div>', out.indexOf('class="pswap-pieces"')));
      expect(pieces).toContain('dir="ltr"');
      expect(pieces.match(/<button class="pchip"/g)!.length).toBeGreaterThanOrEqual(2);
      expect(out).not.toContain('action-zone');
      expect(out).not.toContain('btn-secondary');
    });

    it('under a Hebrew app the conversation, the pieces and the map still read left-to-right, with no Hebrew inside them', () => {
      strings.setUiLangDict('he');
      const quick = game(1, 'quickReply');
      expect(HEBREW.test(quick)).toBe(true); // the instruction is in the app language
      for (const m of quick.matchAll(/<button class="btn-secondary btn-reply">(.*?)<\/button>/g)) expect(HEBREW.test(m[1]!)).toBe(false);
      const swap = game(4, 'swap');
      expect(HEBREW.test(swap.slice(swap.indexOf('class="pswap-pieces"'), swap.lastIndexOf('</div>')))).toBe(false);
      strings.setUiLangDict('en');
      for (const sel of ['.convo-row', '.pswap-pieces', '.btn-reply']) expect(rule(sel), sel).toMatch(/direction: ltr; unicode-bidi: isolate/);
    });

    it('the pieces move — and stop moving when the learner asks for reduced motion', () => {
      expect(css).toMatch(/\.pbuild-answer \.pchip \{ animation: piece-in/);
      expect(css).toMatch(/\.pmatch-tile\.is-matched \{ animation: pair-lock/);
      const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
      expect(reduced).toMatch(/\.audio-wave i, \.pmatch-tile\.is-matched, \.pbuild-answer \.pchip, \.pcanvas\[data-engine='swap'\] \.pslot\.is-filled \{ animation: none; \}/);
      expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\n {2}\*, \*::before, \*::after \{ animation-duration: 0\.001s !important;/); // and the global switch still stands
    });
  });

  describe('language comes from people', () => {
    it('every conversation has a person; the cast names only real missions and falls back to a default', () => {
      expect(npcFor(undefined).glyph).toBe('🧑');
      expect(npcFor('introduce-myself').glyph).toBe('🧑');
      expect(npcFor('coffee-shop').glyph).toBe('🧑‍🍳');
      expect(npcFor('airport-border').glyph).not.toBe(npcFor('coffee-shop').glyph); // no more barista at the border
      const cast = readFileSync(fileURLToPath(new URL('./npcCast.ts', import.meta.url)), 'utf8');
      const ids = [...cast.matchAll(/^ {2}'?([a-z-]+)'?: \{ glyph/gm)].map((m) => m[1]!);
      expect(ids.length).toBeGreaterThan(8);
      for (const id of ids) expect(BOOTCAMP_PLAN.some((m) => m.id === id), id).toBe(true);
    });

    it('the shell shows a glyph today and an illustration the moment one is supplied', () => {
      const line = (npc: { glyph: string; art?: string }): string => html(createElement(convo.NpcLine, { npc, gloss: 'מה שלומך?', children: 'How are you?' }));
      const glyph = line({ glyph: '🧑‍🍳' });
      expect(glyph).toContain('<span class="npc-fig" aria-hidden="true">🧑‍🍳</span>');
      expect(glyph).toMatch(/<div class="convo-row npc" dir="ltr">.*<div class="convo-bubble npc"><div class="convo-text">How are you\?<\/div><p class="convo-gloss" dir="auto">מה שלומך\?<\/p>/);
      const art = line({ glyph: '🧑‍🍳', art: '/npc/barista.png' });
      expect(art).toContain('<img class="npc-fig" src="/npc/barista.png"');
      expect(art).not.toContain('🧑‍🍳');
      expect(html(createElement(convo.YouLine, { children: 'Fine, thanks.' }))).toBe('<div class="convo-row you" dir="ltr"><div class="convo-bubble you">Fine, thanks.</div></div>');
    });
  });

  describe('feedback', () => {
    it('the buddy\'s reaction is decoration on an answer card: with or without it, the card says and offers exactly the same', () => {
      const ctx = { prompt: { text: 'Where are you from?', translation: 'מאיפה אתה?' }, selected: { text: 'Nice to meet you!' }, expected: { text: "I'm from Israel.", translation: 'אני מישראל.' }, why: 'x' };
      for (const ok of [true, false]) {
        const plain = html(createElement(feedback.AnswerFeedback, { ok, ctx, onRetry: () => undefined, onContinue: () => undefined }));
        const withBuddy = html(createElement(feedback.AnswerFeedback, { ok, ctx, onRetry: () => undefined, onContinue: () => undefined, aside: createElement('i', { id: 'buddy' }) }));
        expect(withBuddy).toContain('<div class="feedback-top"><i id="buddy"></i>');
        expect(withBuddy.replace('<i id="buddy"></i>', '')).toBe(plain);
        expect(plain.match(/<button class="btn-(primary|secondary)"/g)).toHaveLength(ok ? 1 : 2);
      }
      expect(html(createElement(feedback.AnswerFeedback, { ok: false, ctx, onContinue: () => undefined }))).not.toContain('❌'); // a miss is "not quite", not a red cross
    });

    it('interface sounds can be switched off, the choice is remembered, and speech is a separate system', () => {
      let tones = 0;
      const node = { connect: () => node, start: () => { tones++; }, stop: () => undefined, frequency: { value: 0 }, type: 'sine', gain: { setValueAtTime: () => undefined, linearRampToValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined } };
      vi.stubGlobal('window', { AudioContext: class { state = 'running'; currentTime = 0; destination = {}; createOscillator() { return node; } createGain() { return node; } } });
      expect(sfx.sfxEnabled()).toBe(true); // on unless the learner says otherwise
      for (const cue of [sfx.softChime, sfx.matchChime, sfx.placeTick, sfx.completeChime, sfx.evolveChime, sfx.successChime, sfx.errorBuzz]) cue();
      expect(tones).toBe(2 + 2 + 1 + 3 + 5 + 2 + 2);
      sfx.setSfxEnabled(false);
      tones = 0;
      for (const cue of [sfx.softChime, sfx.matchChime, sfx.placeTick, sfx.completeChime, sfx.evolveChime, sfx.successChime, sfx.errorBuzz]) cue();
      expect(tones).toBe(0);
      expect(disk.get('ready.sfx')).toBe('off');
      sfx.setSfxEnabled(true);
      expect(disk.get('ready.sfx')).toBe('on');
      vi.unstubAllGlobals();
      vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
      expect(readFileSync(fileURLToPath(new URL('../../shared/audio/tts.ts', import.meta.url)), 'utf8')).not.toMatch(/sfxEnabled|ready\.sfx/);
    });
  });

  describe('video and onboarding', () => {
    it('a video is never an empty rectangle: a READY poster stands in until the clip\'s own first frame is painted', () => {
      const out = html(createElement(player.VideoPlayer, { video: { src: '/videos/En_day1.mp4', title: { he: 'היכרות', en: 'Introductions' } }, icon: '👋' }));
      expect(out).toContain('class="video-frame is-loading"');
      expect(out).toContain('<span class="video-poster" aria-hidden="true"><span class="video-poster-icon">👋</span><span class="video-poster-title">Introductions</span></span>');
      expect(out).toMatch(/src="[^"]*\/videos\/En_day1\.mp4#t=0\.1"/);
      expect(out).toContain('video-play-overlay');
      expect(rule('.video-poster')).toMatch(/var\(--brand\)/); // READY's own colours, no invented artwork
    });

    it('before an app language is chosen the app starts in the device\'s language', () => {
      expect(app.deviceUiLang(['he-IL', 'en-US'])).toBe('he');
      expect(app.deviceUiLang(['iw'])).toBe('he');
      expect(app.deviceUiLang(['fr-FR', 'en-GB'])).toBe('en');
      expect(app.deviceUiLang(['fr-FR'])).toBe('en');
      expect(app.deviceUiLang([])).toBe('en');
    });

    it('the entry screen: the classroom, READY, a warm line, the language choice and one way forward — in the learner\'s language', () => {
      disk.delete('ready.uiLang');
      for (const lang of ['he', 'en'] as const) {
        strings.setUiLangDict(lang);
        app.useAppStore.setState({ uiLang: lang, pack: null });
        const out = html(createElement(onboarding.Onboarding));
        expect(out, lang).toMatch(/<div class="entry-hero" aria-hidden="true"><img src="[^"]*\/onboarding\/classroom\.jpg"/);
        expect(out.indexOf('entry-hero'), lang).toBeLessThan(out.indexOf('entry-sheet')); // the picture leads
        expect(out, lang).toContain('READY');
        expect(out, lang).toContain(`<h1>${strings.t('entryTitle')}</h1>`);
        expect(out, lang).toContain(strings.t('entrySub'));
        expect(out, lang).toContain(strings.t('entryChoose'));
        // both languages are offered, each in its own script; the current one is marked — not by colour alone
        expect(out, lang).toMatch(/role="radiogroup"/);
        for (const [code, name] of [['en', 'English'], ['he', 'עברית']] as const) {
          expect(out, `${lang} ${code}`).toContain(`<button role="radio" aria-checked="${code === lang}" class="entry-lang ${code === lang ? 'is-selected' : ''}">`);
          expect(out, `${lang} ${code}`).toMatch(new RegExp(`<span class="entry-lang-name" lang="${code}" dir="(ltr|rtl)">${name}</span>`));
        }
        expect(out.match(/<button class="btn-primary btn-icon">/g), lang).toHaveLength(1); // one clear way forward
        expect(out, lang).toContain(strings.t('continue'));
      }
      strings.setUiLangDict('he');
      const he = html(createElement(onboarding.Onboarding));
      expect(he).not.toMatch(/Choose your language|You can change this|Learn a language/); // no English sentences in a Hebrew screen
      expect(existsSync(fileURLToPath(new URL('../../../public/onboarding/classroom.jpg', import.meta.url)))).toBe(true);
      expect(rule('.entry-sheet')).toMatch(/env\(safe-area-inset-bottom\)/);
      strings.setUiLangDict('en');
      app.useAppStore.setState({ uiLang: 'en' });
    });

    it('after the choice, the buddy says hello before anything is asked', () => {
      disk.set('ready.uiLang', 'en');
      app.useAppStore.setState({ pack: null });
      const out = html(createElement(onboarding.Onboarding));
      disk.delete('ready.uiLang');
      expect(out).not.toContain('entry-hero');
      expect(out).toMatch(/<div class="cmp-intro"><span class="cmp-bubble" data-voice="thought">Hi! I’m your buddy for this journey\.<\/span><span class="cmp-fig[^>]*data-mood="greeting"[^>]*><img src="[^"]*\/companion\/s1-hello\.png"/);
      expect(out.indexOf('cmp-intro')).toBeLessThan(out.indexOf(strings.t('pilotWelcomeTitle')));
    });
  });
});
