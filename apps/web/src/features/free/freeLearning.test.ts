import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PRIMARY_TABS, hasAppShell, navTabOf, shouldShowNav } from '../../app/nav.js';
import { UI_DICTIONARIES, setUiLangDict, t } from '../../shared/i18n/strings.js';
import type * as AppModule from '../../shared/stores/appStore.js';
import type * as HomeModule from '../home/Home.js';
import type * as FreeModule from './FreeLearning.js';
import type * as CoreModule from '../core/Core.js';
import type * as CoreWordsModule from '../core/CoreWords.js';
import type * as FlashModule from '../core/SentenceFlashcards.js';
import type * as RecallModule from '../games/swipeRecall/SwipeRecall.js';
import type * as LearnModule from '../bootcamp/Learn.js';
import type * as OnboardModule from '../foundation/FoundationOnboarding.js';
import type * as CoachModule from '../foundation/foundationCoach.js';
import type * as FoundationStoreModule from '../foundation/foundationStore.js';
import type * as CompanionModule from '../companion/Companion.js';

/**
 * Free learning — the regression-recovery pass. Every self-directed tool already existed (the swipe
 * word cards, the sentence cards, both players, Stories, the dialogues, the Foundation sheet); what
 * was lost was a visible way in. These tests pin the way in: Home → "למידה באופן חופשי" → one card
 * per tool, each opening the EXISTING surface; the Journey's Foundations row; the one-time Foundation
 * introduction; and the mission intro's mascot pose.
 */
const src = (p: string): string => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const html = (el: Parameters<typeof renderToStaticMarkup>[0]): string => renderToStaticMarkup(el);
const HUB = ['כרטיסיות מילים', 'כרטיסיות משפטים', 'נגן מילים', 'נגן משפטים', 'סיפורים', 'דיאלוגים', 'יסודות'];

describe('Free learning', () => {
  const disk = new Map<string, string>();
  let app: typeof AppModule;
  let home: typeof HomeModule;
  let free: typeof FreeModule;
  let core: typeof CoreModule;
  let coreWords: typeof CoreWordsModule;
  let flash: typeof FlashModule;
  let recall: typeof RecallModule;
  let learn: typeof LearnModule;
  let onboard: typeof OnboardModule;
  let coach: typeof CoachModule;
  let foundation: typeof FoundationStoreModule;
  let companion: typeof CompanionModule;

  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    app = await import('../../shared/stores/appStore.js');
    home = await import('../home/Home.js');
    free = await import('./FreeLearning.js');
    core = await import('../core/Core.js');
    coreWords = await import('../core/CoreWords.js');
    flash = await import('../core/SentenceFlashcards.js');
    recall = await import('../games/swipeRecall/SwipeRecall.js');
    learn = await import('../bootcamp/Learn.js');
    onboard = await import('../foundation/FoundationOnboarding.js');
    coach = await import('../foundation/foundationCoach.js');
    foundation = await import('../foundation/foundationStore.js');
    companion = await import('../companion/Companion.js');
    app.useAppStore.setState({ learningLang: 'en', uiLang: 'he' });
    setUiLangDict('he');
  });

  /* ── 1–2. Home → the hub ─────────────────────────────────────────────────────────────────── */

  it('Home shows "למידה באופן חופשי" as a real card — not a text link — that opens the hub', () => {
    const page = html(createElement(home.Home));
    expect(page).toContain('למידה באופן חופשי');
    expect(page).toMatch(/<button class="card card-press summary-card free-entry span-2"/); // a full card, large touch target
    expect(page).not.toMatch(/btn-link[^>]*>[^<]*למידה באופן חופשי/); // never a text link
    expect(src('../home/Home.tsx')).toContain("app.navigate('free')");
    // It is secondary: the next step (the Journey) still comes first on the page.
    expect(page.indexOf('home-next')).toBeLessThan(page.indexOf('free-entry'));
  });
  it('the hub is a screen of its own, under Home in the navigation, with the bottom bar kept', () => {
    expect(navTabOf('free')).toBe('home');
    expect(PRIMARY_TABS).not.toContain('free'); // no fifth tab
    expect(shouldShowNav('free', false, false)).toBe(true);
    expect(hasAppShell('free')).toBe(true);
    expect(src('../../app/App.tsx')).toContain("free: { feature: 'FreeLearning', el: FreeLearning }");
  });

  /* ── 3–4. the seven cards and where they go ───────────────────────────────────────────────── */

  it('the hub exposes exactly the seven tools, with their Hebrew labels, in order', () => {
    const page = html(createElement(free.FreeLearning));
    expect(page).toContain('למידה באופן חופשי');
    const labels = [...page.matchAll(/data-free="([a-zA-Z]+)"[^>]*>.*?<span class="action-title">([^<]+)<\/span>/g)].map((m) => [m[1], m[2]]);
    expect(labels).toEqual([
      ['wordCards', 'כרטיסיות מילים'], ['sentenceCards', 'כרטיסיות משפטים'], ['wordPlayer', 'נגן מילים'], ['sentencePlayer', 'נגן משפטים'],
      ['stories', 'סיפורים'], ['dialogues', 'דיאלוגים'], ['foundations', 'יסודות'],
    ]);
    for (const label of HUB) expect(page).toContain(label);
    // English interface, same seven tools.
    setUiLangDict('en');
    expect([...html(createElement(free.FreeLearning)).matchAll(/data-free="/g)]).toHaveLength(7);
    setUiLangDict('he');
    // The labels are copy, not code: both dictionaries define every one.
    for (const key of ['freeLearningTitle', 'freeWordCards', 'freeSentenceCards', 'freeWordPlayer', 'freeSentencePlayer', 'freeStories', 'freeDialogues'] as const) {
      expect(UI_DICTIONARIES.he![key], key).toBeTruthy();
      expect(UI_DICTIONARIES.en![key], key).toBeTruthy();
    }
    expect(t('foundationTitle')).toBe('יסודות');
  });
  it('each card hands an intent to an EXISTING surface — no new engine, no placeholder page', () => {
    const hub = src('./FreeLearning.tsx');
    expect(hub).toContain("go: () => core('words', 'wordCards')");       // Core Words → Swipe Recall
    expect(hub).toContain("go: () => core('phrases', 'sentenceCards')"); // Core Sentences → Sentence Flashcards
    expect(hub).toContain("go: () => core('words', 'wordPlayer')");      // Core Words → Listen panel
    expect(hub).toContain("go: () => listen('phrases')");                // Listen → sentence playlist
    expect(hub).toContain("go: () => app.navigate('reading')");          // Reading (Stories)
    expect(hub).toContain("go: () => listen('dialogues')");              // Listen → dialogue playlist
    expect(hub).toContain('go: () => openFoundation()');                 // the Foundation sheet
    expect(hub).not.toMatch(/ComingSoon|coming soon|TODO/i);
    // The receiving surfaces honour the intent.
    expect(src('../core/Core.tsx')).toContain("intent?.mode === 'sentenceCards' ? 'flashcards'");
    expect(src('../core/Core.tsx')).toContain("<CoreWords start={intent?.mode === 'wordCards' ? 'recall' : intent?.mode === 'wordPlayer' ? 'listen' : 'menu'} />");
    expect(src('../core/CoreWords.tsx')).toContain('useState<Mode>(start)');
    expect(src('../listen/Listen.tsx')).toContain("useState<ListenCategory>(intent === 'dialogues' ? 'dialogues' : 'phrases')");
  });
  it('the intents live in the one app store, next to the ones that already existed', () => {
    const s = app.useAppStore.getState();
    s.setCoreIntent({ mode: 'wordCards', returnTo: 'free' });
    expect(app.useAppStore.getState().coreIntent).toEqual({ mode: 'wordCards', returnTo: 'free' });
    s.setCoreIntent(null);
    expect(app.useAppStore.getState().coreIntent).toBeNull();
    s.setListenIntent('dialogues');
    expect(app.useAppStore.getState().listenIntent).toBe('dialogues');
    s.setListenIntent(null);
    expect(src('../../shared/stores/appStore.ts')).not.toMatch(/localStorage\.setItem\('ready\.(core|listen)Intent/); // never persisted
  });

  /* ── 5–8. the tools themselves still work, and open straight from the hub ────────────────── */

  it('word cards: the swipe deck renders one focused card with swipe / knew-it controls', () => {
    const words = [
      { id: 'w1', word: 'water', translation: { he: 'מים', en: 'water' }, emoji: '💧' },
      { id: 'w2', word: 'bread', translation: { he: 'לחם', en: 'bread' }, emoji: '🍞' },
    ];
    const page = html(createElement(recall.SwipeRecall, { words, lang: 'en' }));
    // A first visit opens the swipe tutorial (← / → ) over the deck; the deck itself is the shared GestureCard.
    expect(page).toContain('swipe-onboard');
    expect(page).toMatch(/water|bread|gesture-card/);
    const text = src('../games/swipeRecall/SwipeRecall.tsx');
    expect(text).toContain('GestureCard');
    expect(text).toMatch(/RIGHT = "I knew it"/);
  });
  it('sentence cards: the flashcard deck renders a card over the real sentence deck, with next / previous', () => {
    app.useAppStore.setState({ learningLang: 'en' });
    const page = html(createElement(flash.SentenceFlashcards, { onBack: () => undefined }));
    expect(page).toContain('gesture-card');
    expect(page).toMatch(/flash|card/);
  });
  it('from the hub, the Core library opens straight on the asked tool and its Back returns to the hub', () => {
    app.useAppStore.setState({ coreCategory: 'phrases', coreIntent: { mode: 'sentenceCards', returnTo: 'free' } });
    expect(html(createElement(core.Core))).toContain('gesture-card'); // flashcards at once, not the three-card entry
    app.useAppStore.setState({ coreCategory: 'phrases', coreIntent: null });
    expect(html(createElement(core.Core))).not.toContain('gesture-card'); // the ordinary entry
    expect(src('../core/Core.tsx')).toContain("app.navigate(intent?.returnTo ?? 'bootcamp')");
    // Core Words opens the player / the cards straight away when asked.
    expect(html(createElement(coreWords.CoreWords, { start: 'listen' }))).not.toContain('game-card'); // no menu first
    expect(html(createElement(coreWords.CoreWords, { start: 'recall' }))).not.toContain('game-card');
    app.useAppStore.setState({ coreIntent: null, coreCategory: null });
  });
  it('the sentence player and the dialogues are Listen\'s own playlists; Stories is the Reading screen', () => {
    expect(src('../listen/playlists.ts')).toMatch(/export function buildPhrasePlaylist/);
    expect(src('../listen/playlists.ts')).toMatch(/export function buildDialoguePlaylist/);
    expect(src('../../app/App.tsx')).toContain("reading: { feature: 'Reading', el: Reading }");
    expect(navTabOf('reading')).toBe('listen');
  });

  /* ── 9–12. Foundations ────────────────────────────────────────────────────────────────────── */

  it('Foundations opens from the hub AND from the Journey, through the same store action', () => {
    expect(src('./FreeLearning.tsx')).toContain('useFoundationStore((s) => s.openSheet)');
    const journey = src('../bootcamp/Learn.tsx');
    expect(journey).toContain('useFoundationStore((s) => s.openSheet)');
    expect(journey).toContain("t('foundationTitle')");
    expect(journey).toContain('openFoundation()');
    // The row is a real button that opens the sheet (not dead): the action is the store's.
    foundation.useFoundationStore.getState().close();
    foundation.useFoundationStore.getState().openSheet();
    expect(foundation.useFoundationStore.getState()).toMatchObject({ open: true, target: null, session: null });
    foundation.useFoundationStore.getState().close();
    expect(foundation.useFoundationStore.getState().open).toBe(false);
    // The sheet itself is mounted by the app shell on every screen, so both openers reach it.
    expect(src('../../app/App.tsx')).toContain('<FoundationSheet />');
    expect(html(createElement(learn.Learn))).toContain('יסודות');
  });
  it('the first-time Foundations introduction: shown once per language, dismissable, persisted, and never the only way in', () => {
    disk.delete('ready.foundation.onboarded.en');
    expect(coach.hasOnboardedFoundation('en')).toBe(false);
    // (Static rendering runs no effects: the component decides inside an effect, so it is checked
    //  through its bookkeeping and its source.)
    const text = src('../foundation/FoundationOnboarding.tsx');
    expect(text).toContain('setShow(!hasOnboardedFoundation(learningLang))');
    expect(text).toContain('markOnboardedFoundation(learningLang)');
    expect(text).toContain('if (open) openSheet();');
    expect(text).toContain("t('foundationOnboardLater')");
    coach.markOnboardedFoundation('en');
    expect(coach.hasOnboardedFoundation('en')).toBe(true); // dismissal persists…
    expect(disk.get('ready.foundation.onboarded.en')).toBe('1');
    expect(coach.hasOnboardedFoundation('fr')).toBe(false); // …per learning language
    expect(src('../bootcamp/Learn.tsx')).toContain('<FoundationOnboarding />'); // on the Journey, where the row is
    expect(html(createElement(onboard.FoundationOnboarding))).toBe(''); // renders nothing until its effect says so
  });

  /* ── 15–16. the mascot ────────────────────────────────────────────────────────────────────── */

  it('a mission introduction greets (hello) — never the cheerleader pom-poms; completion still celebrates', () => {
    for (const stage of [1, 2, 3, 4, 5, 6] as const) {
      const intro = html(createElement(companion.CompanionIntroView, { stage, line: 'x' }));
      expect(intro).toContain(`s${stage}-hello.png`);
      expect(intro).not.toContain('-cheer.png');
      expect(html(createElement(companion.CompanionReactionView, { kind: 'missionComplete', stage }))).toContain(`s${stage}-celebrate.png`);
      expect(html(createElement(companion.CompanionReactionView, { kind: 'correct', stage, text: false }))).toContain(`s${stage}-winner.png`);
    }
    // The mission player's intro card uses the default (greeting) — it does not override the mood.
    expect(src('../bootcamp/Bootcamp.tsx')).toContain('<CompanionIntro line={intro} />');
    expect(src('../bootcamp/Bootcamp.tsx')).not.toMatch(/CompanionIntro[^\n]*mood=["']cheering/);
  });

  /* ── 17. RTL ──────────────────────────────────────────────────────────────────────────────── */

  it('the hub and the Home card use direction-aware layout (no hard-coded left/right)', () => {
    for (const f of ['./FreeLearning.tsx', '../home/Home.tsx']) {
      const text = src(f);
      expect(text, f).not.toMatch(/marginLeft|marginRight|paddingLeft|paddingRight|textAlign: 'left'|textAlign: 'right'/);
    }
    const css = src('../../app/styles.css');
    const block = css.slice(css.indexOf('.free-grid'), css.indexOf('.ac-words .action-icon'));
    expect(block).not.toMatch(/margin-left|margin-right|padding-left|padding-right/);
    expect(block).toContain('margin-inline-start');
    // Target-language text inside the hub's destinations keeps its own direction (unchanged components).
    expect(src('../core/SentenceFlashcards.tsx')).toMatch(/dir=/);
  });
});
