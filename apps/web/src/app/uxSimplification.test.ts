import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type * as AppModule from '../shared/stores/appStore.js';
import type * as StringsModule from '../shared/i18n/strings.js';
import type * as BootcampModule from '../features/bootcamp/bootcampStore.js';
import type * as PlanModule from '../features/bootcamp/plan.js';
import type * as HomeModule from '../features/home/Home.js';
import type * as LearnModule from '../features/bootcamp/Learn.js';
import type * as BasicsModule from '../features/basics/BasicWords.js';
import type * as ListenModule from '../features/listen/Listen.js';
import type * as PlaylistsModule from '../features/listen/playlists.js';
import type * as VideosModule from '../features/videos/Videos.js';
import type * as MissionVideoModule from '../features/videos/missionVideo.js';
import type * as BootcampScreenModule from '../features/bootcamp/Bootcamp.js';
import type * as FoundationStoreModule from '../features/foundation/foundationStore.js';
import type * as FreeModule from '../features/free/FreeLearning.js';
import type * as ChoiceCardModule from '../shared/ui/ChoiceCard.js';
import type * as PageHeaderModule from '../shared/ui/PageHeader.js';

/**
 * The global UX simplification pass — "where am I, and what can I do here?" in about two seconds.
 *
 *   Home        READY · the two languages · ONE progress · FOUR ways to learn (each opening an existing area)
 *   Situations  title · "learned X of 30" + one bar · one progress-aware buddy line · Situation 1 at once
 *   Basic words the fundamentals that used to stand in front of the situations, one tap from Home
 *   Listen      choose a mode → choose what to hear → the player (never all three at once)
 *
 * The screens are rendered for real (react-dom/server). To follow a tap, the shared ChoiceCard and
 * PageHeader are wrapped so each card's / back button's handler is recorded as the screen renders —
 * the real markup is unchanged — and then called, exactly as a tap would. (A server render reads a
 * zustand store's INITIAL state object, so `put` sets a state both live and there.)
 */
const tapped = vi.hoisted(() => ({ choices: new Map<string, () => void>(), back: null as null | (() => void) }));
vi.mock('../shared/ui/ChoiceCard.js', async (importOriginal) => {
  const real = await importOriginal<typeof ChoiceCardModule>();
  return {
    ChoiceCard: (p: Parameters<typeof real.ChoiceCard>[0]) => { tapped.choices.set(p.id, p.onSelect); return real.ChoiceCard(p); },
  };
});
vi.mock('../shared/ui/PageHeader.js', async (importOriginal) => {
  const real = await importOriginal<typeof PageHeaderModule>();
  return {
    ...real,
    PageHeader: (p: Parameters<typeof real.PageHeader>[0]) => { tapped.back = p.onBack ?? null; return real.PageHeader(p); },
  };
});

const src = (p: string): string => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const disk = new Map<string, string>();
/** Situations 1–3, completed — as the bootcamp store keeps them on disk (by stable mission id). */
const SAVED_PROGRESS = JSON.stringify({ completed: ['introduce-myself', 'numbers-money', 'coffee-shop'], receipts: [], stepIndex: { directions: 4 } });
const SAVED_FOUNDATION = JSON.stringify({ byLang: { es: { viewed: ['c.i', 'c.you'], dismissed: [] } } });
const SAVED_ZERO = JSON.stringify({ byLang: { es: { done: ['m1:0', 'm1:1'] } }, name: 'Dana' });

let app: typeof AppModule;
let strings: typeof StringsModule;
let bootcamp: typeof BootcampModule;
let plan: typeof PlanModule;
let home: typeof HomeModule;
let learn: typeof LearnModule;
let basics: typeof BasicsModule;
let listen: typeof ListenModule;
let playlists: typeof PlaylistsModule;
let videos: typeof VideosModule;
let missionVideo: typeof MissionVideoModule;
let bootcampScreen: typeof BootcampScreenModule;
let foundation: typeof FoundationStoreModule;
let free: typeof FreeModule;

const render = (el: Parameters<typeof createElement>[0], props?: object): string => { tapped.choices.clear(); tapped.back = null; return renderToStaticMarkup(createElement(el as never, props as never)); };
const text = (html: string): string => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const choicesOf = (html: string): string[] => [...html.matchAll(/data-choice="([a-z]+)"/g)].map((m) => m[1]!);
const ui = (lang: 'he' | 'en'): void => { strings.setUiLangDict(lang); put(app.useAppStore, { uiLang: lang }); };
const tap = (id: string): void => { const go = tapped.choices.get(id); expect(go, `a card "${id}" was rendered`).toBeTypeOf('function'); go!(); };
const back = (): void => { expect(tapped.back, 'a back button was rendered').toBeTypeOf('function'); tapped.back!(); };
/** Set store state for the live store AND for what a static (server) render reads. */
function put<T extends object>(store: { setState: (patch: Partial<T>) => void; getInitialState: () => T }, patch: Partial<T>): void {
  store.setState(patch);
  Object.assign(store.getInitialState(), patch);
}

beforeAll(async () => {
  disk.set('ready.bootcamp.v2.es', SAVED_PROGRESS);
  disk.set('ready.foundation.v2', SAVED_FOUNDATION);
  disk.set('ready.zerostart.v1', SAVED_ZERO);
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
  plan = await import('../features/bootcamp/plan.js');
  home = await import('../features/home/Home.js');
  learn = await import('../features/bootcamp/Learn.js');
  basics = await import('../features/basics/BasicWords.js');
  listen = await import('../features/listen/Listen.js');
  playlists = await import('../features/listen/playlists.js');
  videos = await import('../features/videos/Videos.js');
  missionVideo = await import('../features/videos/missionVideo.js');
  bootcampScreen = await import('../features/bootcamp/Bootcamp.js');
  foundation = await import('../features/foundation/foundationStore.js');
  free = await import('../features/free/FreeLearning.js');
});
beforeEach(() => {
  put(app.useAppStore, { learningLang: 'es', view: 'home', listenPage: null, coreIntent: null, coreCategory: null, readingIntent: null });
  put(bootcamp.useBootcampStore, { activeDay: null });
  ui('he');
});

/* ── 1. Home ───────────────────────────────────────────────────────────────────────────────── */

describe('Home — the languages, ONE progress, exactly four ways to learn', () => {
  it('reads top to bottom: READY · "I speak: Hebrew · I\'m learning: Spanish" · "10% למידה" · the four choices', () => {
    const page = render(home.Home);
    const words = text(page);
    expect(words.indexOf('READY')).toBe(0);
    expect(words).toContain('אני דובר: עברית');
    expect(words).toContain('אני לומד: 🇪🇸 ספרדית');
    expect(words).toContain('10% למידה'); // 3 of 30 situations completed, from the saved progress
    expect(page).toMatch(/role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"/);
    // The four choices come right after the progress, in this order, with the brief's copy.
    expect(choicesOf(page)).toEqual(['basics', 'situations', 'games', 'listen']);
    const order = ['אני דובר', '10%', 'מילים בסיסיות', 'סיטואציות', 'משחקים וסיפורים', 'האזנה מהירה'].map((w) => words.indexOf(w));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    for (const line of ['🔤', 'המילים והביטויים שחייבים לדעת', '🎬', 'לומדים דרך מצבים אמיתיים מהטיול', '🎮', 'תרגול חופשי ומהנה', '🎧', 'לומדים גם בלי להסתכל על המסך']) {
      expect(words, line).toContain(line);
    }
  });

  it('no clutter above (or below) the choices: no second metric, no next-step card, no promos, no paragraphs', () => {
    const words = text(render(home.Home));
    for (const gone of ['מוכנות לטיול', 'מצבים מוכנים', 'משפטי ליבה', 'תורגלו', 'השלב הבא שלך', 'למידה באופן חופשי', 'חזרה קצרה', '10 דקות של האזנה', 'התחל מאפס', 'מתכוננים לטיול']) {
      expect(words, gone).not.toContain(gone);
    }
    expect(words.match(/%/g)).toHaveLength(1); // ONE percentage on the whole screen
    expect(src('../features/home/Home.tsx')).not.toMatch(/ProgressRing|useSentenceProgress|next-card|quick-card|PageHeader/);
  });

  it('English: "I speak: English · I\'m learning: Spanish", "10% learned" and the same four choices', () => {
    ui('en');
    const words = text(render(home.Home));
    expect(words).toContain('I speak: English');
    expect(words).toContain('I’m learning: 🇪🇸 Spanish');
    expect(words).toContain('10% learned');
    for (const title of ['Basic words', 'Situations', 'Games & stories', 'Quick listening']) expect(words).toContain(title);
  });

  it('each choice opens its existing area — and its FIRST screen (never mid-mission, never inside a player)', () => {
    render(home.Home);
    tap('basics');
    expect(app.useAppStore.getState().view).toBe('basics');
    put(bootcamp.useBootcampStore, { activeDay: 5 }); // a mission left open earlier
    tap('situations');
    expect(app.useAppStore.getState().view).toBe('bootcamp');
    expect(bootcamp.useBootcampStore.getState().activeDay).toBeNull();
    tap('games');
    expect(app.useAppStore.getState().view).toBe('free');
    put(app.useAppStore, { listenPage: { mode: 'sentences', play: 'coffee-shop' } }); // a player left open earlier
    tap('listen');
    expect(app.useAppStore.getState()).toMatchObject({ view: 'listen', listenPage: null });
  });

  it('the buddy stays, small — a 52px figure inside the progress row, not half the screen', () => {
    const page = render(home.Home);
    expect(page).toMatch(/class="cmp-peek is-inline"/);
    expect(page).toMatch(/class="cmp-fig[^"]*" style="width:52px;height:52px"/);
    expect(page).not.toMatch(/cmp-bubble|cmp-presence/); // no speech bubble, no card of its own on Home
  });
});

/* ── 2. Situations ─────────────────────────────────────────────────────────────────────────── */

describe('Situations — "learned X of 30", one buddy line, then Situation 1', () => {
  it('the top is: title · progress line + ONE bar · buddy line — and the situations start right after', () => {
    const page = render(learn.Learn);
    const words = text(page);
    const at = (w: string): number => words.indexOf(w);
    expect(at('סיטואציות')).toBe(0);
    expect(words).toContain('למדת 3 סיטואציות מתוך 30');
    expect(page).toMatch(/role="progressbar" aria-valuenow="3" aria-valuemin="0" aria-valuemax="30"/);
    expect(words).toContain('התחלה מעולה — ממשיכים!'); // 3 of 30 = 10% → the 1–25% line
    expect(at('למדת 3')).toBeLessThan(at('התחלה מעולה'));
    expect(at('התחלה מעולה')).toBeLessThan(at('להציג את עצמי'));
    // Between the buddy and Situation 1: nothing.
    const top = words.slice(0, at('להציג את עצמי'));
    expect(top).not.toMatch(/יסודות|מוכנות|%|משפטים/);
    expect(page.match(/role="progressbar"/g)).toHaveLength(1); // one indicator
    expect(page).not.toMatch(/progress-ring|phase-title|page-sub/);
  });

  it('all 30 situations, in plan order, each a tappable card; the next one is marked', () => {
    const page = render(learn.Learn);
    expect(page.match(/class="mcard card-press/g)).toHaveLength(plan.BOOTCAMP_PLAN.length);
    expect(plan.BOOTCAMP_PLAN).toHaveLength(30);
    expect(page.match(/is-next/g)).toHaveLength(1);
    expect(text(page)).toContain('השלב הבא שלך'); // on the next situation's own card (the 4th: Directions, under way)
  });

  it('the buddy line follows progress — and "1" reads as one, not "1 situations"', () => {
    const at = (done: number): string => {
      put(bootcamp.useBootcampStore, { completedDays: plan.BOOTCAMP_PLAN.slice(0, done).map((m) => m.day) });
      return text(render(learn.Learn));
    };
    expect(at(0)).toContain('איזה כיף שמתחילים! בוא נלמד את הסיטואציה הראשונה שלך.');
    expect(at(1)).toContain('למדת סיטואציה אחת מתוך 30');
    expect(at(10)).toContain('כבר יש לך בסיס טוב.');
    expect(at(20)).toContain('אתה כבר מסתדר בהרבה סיטואציות.');
    expect(at(27)).toContain('כמעט מוכנים לטיול!');
    expect(at(30)).toContain('סיימת את כל 30 הסיטואציות!');
    ui('en');
    expect(at(0)).toContain('You’ve learned 0 of 30 situations');
    expect(at(0)).toContain('So glad you’re starting! Let’s learn your first situation.');
    put(bootcamp.useBootcampStore, { completedDays: plan.BOOTCAMP_PLAN.slice(0, 3).map((m) => m.day) });
  });

  it('the navigation names it too: סיטואציות / Situations (the route id stays `bootcamp`)', () => {
    expect(strings.t('bootcampTab')).toBe('סיטואציות');
    expect(src('./nav.ts')).toContain("export const PRIMARY_TABS: View[] = ['home', 'bootcamp', 'listen', 'profile'];");
  });
});

/* ── 3. Basic words ────────────────────────────────────────────────────────────────────────── */

describe('Basic words — the fundamentals, moved out of the way of the situations', () => {
  it('four existing ways in: the building blocks, the sentence library (by topic), the words, start from zero', () => {
    const page = render(basics.BasicWords);
    const words = text(page);
    expect(words.indexOf('מילים בסיסיות')).toBeGreaterThan(-1);
    expect(words).toContain('המילים והביטויים שחייבים לדעת');
    expect(choicesOf(page)).toEqual(['foundations', 'phrases', 'words', 'zerostart']);
    expect(words).toContain('יסודות בשפה');
    expect(words).toContain('אני, אתה, שאלות, צבעים, מספרים, זמן ועוד');
    expect(words).toContain('להציג את עצמי, כסף ומספרים, בית קפה ועוד'); // the topics, read from the plan
    expect(words).toContain('מתחילים מאפס');
  });

  it('each opens the SAME surface as before (the Foundation sheet, the library, Zero Start) — and Back comes here', () => {
    render(basics.BasicWords);
    foundation.useFoundationStore.getState().close();
    tap('foundations');
    expect(foundation.useFoundationStore.getState()).toMatchObject({ open: true, target: null, session: null });
    foundation.useFoundationStore.getState().close();
    tap('phrases');
    expect(app.useAppStore.getState()).toMatchObject({ view: 'core', coreCategory: 'phrases', coreIntent: { returnTo: 'basics' } });
    tap('words');
    expect(app.useAppStore.getState()).toMatchObject({ view: 'core', coreCategory: 'words', coreIntent: { returnTo: 'basics' } });
    tap('zerostart');
    expect(app.useAppStore.getState().view).toBe('zerostart');
    back();
    expect(app.useAppStore.getState().view).toBe('home');
    // The receiving screens send Back here (the library on its own menu when no tool was asked for).
    expect(src('../features/core/Core.tsx')).toContain("app.navigate(intent?.returnTo ?? 'basics')");
    expect(src('../features/zerostart/ZeroStart.tsx').match(/backTo="basics"/g)).toHaveLength(2);
  });

  it('it is a screen of its own under Home, with the bottom bar', () => {
    expect(src('./App.tsx')).toContain("basics: { feature: 'BasicWords', el: BasicWords }");
    expect(src('./nav.ts')).toContain("basics: 'home'");
  });
});

/* ── 4. Games & stories ────────────────────────────────────────────────────────────────────── */

describe('Games & stories (Free learning) — light touch only', () => {
  it('same seven tools, a title that matches its Home card, a way back, and its listening tools go through the hub', () => {
    const page = render(free.FreeLearning);
    expect(text(page)).toContain('משחקים וסיפורים');
    expect(page.match(/data-free="/g)).toHaveLength(7);
    back();
    expect(app.useAppStore.getState().view).toBe('home');
    expect(src('../features/free/FreeLearning.tsx')).toContain("app.setListenPage({ mode, play: null, returnTo: 'free' })");
  });
});

/* ── 5. The listening hub ──────────────────────────────────────────────────────────────────── */

describe('Listen — choose a mode, then what to hear, then listen', () => {
  it('the landing is exactly four modes — no player, no catalogue, no story list', () => {
    const page = render(listen.Listen);
    const words = text(page);
    expect(words.indexOf('האזנה')).toBe(0);
    expect(words).toContain('בחר איך תרצה להאזין');
    expect(choicesOf(page)).toEqual(['stories', 'situations', 'sentences', 'videos']);
    for (const line of ['האזנה לסיפורים', 'סיפורים קצרים בשפה שאתה לומד', 'האזנה לסיטואציות', 'האזן לדיאלוגים מתוך הסיטואציות',
      'האזנה למשפטים', 'משפטים וביטויים אחד אחרי השני', 'סרטוני סיטואציות ברצף', 'צפה בסרטוני הסיטואציות ברצף']) {
      expect(words, line).toContain(line);
    }
    expect(page).not.toMatch(/now-card|parrot-play|topic-row|story-row|<video|role="tablist"/);
  });

  it('choosing a mode opens ITS content: stories → the stories, situations / sentences → their lists, videos → the videos', () => {
    render(listen.Listen);
    tap('stories');
    expect(app.useAppStore.getState().listenPage).toEqual({ mode: 'stories', play: null });
    put(app.useAppStore, { listenPage: null });
    tap('situations');
    expect(app.useAppStore.getState().listenPage).toEqual({ mode: 'situations', play: null });
    put(app.useAppStore, { listenPage: null });
    tap('sentences');
    expect(app.useAppStore.getState().listenPage).toEqual({ mode: 'sentences', play: null });
    put(app.useAppStore, { listenPage: null });
    tap('videos');
    expect(app.useAppStore.getState().view).toBe('videos');
  });

  it('situations: a list of the situations\' dialogues (numbered like the journey) — and still no player', () => {
    put(app.useAppStore, { view: 'listen', listenPage: { mode: 'situations', play: null } });
    const page = render(listen.Listen);
    const words = text(page);
    expect(words.indexOf('האזנה לסיטואציות')).toBe(0);
    expect(words).toContain('בחר סיטואציה');
    const dialogues = playlists.buildDialoguePlaylist('es', 'he');
    expect(page.match(/class="link-row card-press topic-row"/g)).toHaveLength(dialogues.topics.length);
    expect(dialogues.topics.length).toBeGreaterThanOrEqual(25);
    expect(page).toMatch(/data-topic="introduce-myself"/);
    expect(words).toMatch(/1 👋 להציג את עצמי \d+ שורות/);
    expect(page).not.toMatch(/now-card|parrot-play/);
    back();
    expect(app.useAppStore.getState()).toMatchObject({ view: 'listen', listenPage: null }); // back to the four modes
  });

  it('sentences: the sentence groups (conversation help last) — tapping one starts the player there', () => {
    put(app.useAppStore, { listenPage: { mode: 'sentences', play: null } });
    const page = render(listen.Listen);
    const groups = playlists.buildPhrasePlaylist('es', 'he');
    expect(page.match(/topic-row/g)).toHaveLength(groups.topics.length);
    expect(text(page)).toContain('עזרה בשיחה');
    expect(text(page).indexOf('עזרה בשיחה')).toBeGreaterThan(text(page).indexOf('להציג את עצמי'));
    // A topic chosen → the player, which starts there at once (the jump runs on mount — see the pure
    // `startIndexFor` below — so a static render only shows that the player, not the list, is up).
    put(app.useAppStore, { listenPage: { mode: 'sentences', play: 'coffee-shop' } });
    const player = render(listen.Listen);
    expect(player).toMatch(/class="card now-card"/);
    expect(player).not.toMatch(/topic-row/);
    const hub = src('../features/listen/Listen.tsx');
    expect(hub).toContain('startIndex={startIndexFor(playlist, page.play, loadBookmark(bookmarkKey))}');
    expect(hub).toContain('useEffect(() => { pb.jumpTo(startIndex, { play: true }); }, []);');
    back(); // from the player: back to the list, not out of the mode
    expect(app.useAppStore.getState().listenPage).toEqual({ mode: 'sentences', play: null });
  });

  it('the player keeps every existing control: transport, repeats, continuous, shuffle, the three listening modes, quick listen', () => {
    put(app.useAppStore, { listenPage: { mode: 'situations', play: 'introduce-myself' } });
    const page = render(listen.Listen);
    const first = playlists.buildDialoguePlaylist('es', 'he').items[0]!;
    expect(page).toContain(first.target.replace(/'/g, '&#x27;'));
    expect(page).toContain((first.translation ?? '').replace(/'/g, '&#x27;'));
    expect(first.translation).toBeTruthy();
    for (const label of ['הקודם', 'נגן', 'הבא']) expect(page, label).toMatch(new RegExp(`aria-label="[^"]*${label}`));
    expect(page).toMatch(/class="parrot-play"/);
    expect(text(page)).toContain('חזרות');
    expect(page.match(/class="mode-card/g)).toHaveLength(3);
    expect(page).toMatch(/aria-pressed="(true|false)"[^>]*>.*ניגון רציף/);
    expect(text(page)).toContain('ערבב סדר');
    expect(text(page)).toContain('האזנה מהירה');
    expect(page).not.toMatch(/topic-row|story-row/); // the list is the previous page, not beside the player
    // When the app language IS the learning language there is no translation mode to offer.
    put(app.useAppStore, { learningLang: 'en', uiLang: 'en', listenPage: { mode: 'situations', play: 'introduce-myself' } });
    strings.setUiLangDict('en');
    expect(render(listen.Listen).match(/class="mode-card/g)).toBeNull();
  });

  it('back from a list opened by another screen returns to that screen (Games & stories, the library)', () => {
    put(app.useAppStore, { listenPage: { mode: 'situations', play: null, returnTo: 'free' } });
    render(listen.Listen);
    back();
    expect(app.useAppStore.getState()).toMatchObject({ view: 'free', listenPage: null });
  });

  it('a story chosen to be heard opens in the story reader, already reading aloud, and comes back to the list', () => {
    const hub = src('../features/listen/Listen.tsx');
    expect(hub).toContain("setReadingIntent({ story: story.id, returnTo: 'listen', play: true })");
    const reader = src('../features/reading/Reading.tsx');
    expect(reader).toContain('autoPlay={Boolean(requested?.play)}');
    expect(reader).toContain("const leaveStory = (): void => { if (requested?.story) useAppStore.getState().navigate(backTo); else setStory(null); };");
    // The stories page shows the stories as soon as they load (static render: the honest loading line).
    put(app.useAppStore, { listenPage: { mode: 'stories', play: null } });
    expect(text(render(listen.Listen))).toContain('האזנה לסיפורים');
  });

  it('a tap on the Listen tab always lands on the four modes', () => {
    expect(src('../shared/ui/AppNav.tsx')).toContain('setListenPage(null);');
  });

  it('pure helpers: the player starts where the learner left that topic, else at its first line', () => {
    const pl = playlists.buildPhrasePlaylist('es', 'he');
    const coffee = pl.topics.find((tp) => tp.id === 'coffee-shop')!;
    const inside = pl.items[coffee.start + 2]!.id;
    const last = pl.items[coffee.start + coffee.count - 1]!.id;
    expect(playlists.startIndexFor(pl, 'coffee-shop', null)).toBe(coffee.start);
    expect(playlists.startIndexFor(pl, 'coffee-shop', inside)).toBe(coffee.start + 2);   // resume inside it
    expect(playlists.startIndexFor(pl, 'coffee-shop', last)).toBe(coffee.start);         // finished it → from the top
    expect(playlists.startIndexFor(pl, 'introduce-myself', inside)).toBe(pl.topics[0]!.start); // another topic → its start
    expect(playlists.startIndexFor(pl, 'no-such-topic', inside)).toBe(0);
    expect(playlists.resumeTopicId(pl, inside)).toBe('coffee-shop');
    expect(playlists.resumeTopicId(pl, 'gone')).toBeNull();
    expect(playlists.resumeTopicId(pl, null)).toBeNull();
  });
});

/* ── 6. Situation videos in a row ──────────────────────────────────────────────────────────── */

describe('Situation videos in a row — only real videos, in journey order, one after another', () => {
  it('the run is exactly the manifest\'s videos for the learning language, in journey order', () => {
    const run = missionVideo.missionVideos('en');
    expect(run.length).toBeGreaterThan(0);
    const numbers = run.map((v) => v.missionNumber);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    for (const v of run) expect(v.video.src).toMatch(new RegExp(`/videos/en/en_${v.missionNumber}\\.mp4$`));
    // A situation with no file is simply not in the run (nothing probed, nothing invented).
    expect(numbers).not.toContain(10);
    expect(missionVideo.missionVideos('it')).toEqual([]);
  });

  it('opens on the first situation with a video, playing by itself, with its title and position', () => {
    const page = render(videos.Videos);
    const first = missionVideo.missionVideos('es')[0]!;
    expect(text(page)).toContain(`סיטואציה ${first.missionNumber} · להציג את עצמי`);
    expect(page).toMatch(/<video[^>]*autoPlay=""|<video[^>]*autoplay=""/i);
    expect(page).toContain(`es_${first.missionNumber}.mp4`);
    expect(text(page)).toContain(`1 מתוך ${missionVideo.missionVideos('es').length}`);
    expect(page).toMatch(/<button type="button" class="parrot-step" disabled=""[^>]*aria-label="הסרטון הקודם"/); // nothing before the first
  });

  it('safe-skip: a clip that fails is passed over; the end of the run is a calm screen, never a dead end', () => {
    const run = [{ day: 1, missionNumber: 1 }, { day: 2, missionNumber: 2 }, { day: 3, missionNumber: 3 }];
    expect(videos.stepVideo(run, 0, 1, new Set())).toBe(1);
    expect(videos.stepVideo(run, 0, 1, new Set([2]))).toBe(2);          // the failed clip is skipped
    expect(videos.stepVideo(run, 2, 1, new Set())).toBeNull();          // past the last → the end screen
    expect(videos.stepVideo(run, 2, -1, new Set([2, 1]))).toBeNull();   // nothing playable before
    expect(videos.stepVideo(run, -1, 1, new Set([1]))).toBe(1);         // restart skips a failed first clip
    const screen = src('../features/videos/Videos.tsx');
    expect(screen).toContain('onEnded={() => go(1)} onFailed={skip}');
    expect(screen).toContain("t('videosAllDoneTitle')");
    // A language with no videos at all says so honestly.
    put(app.useAppStore, { learningLang: 'it' });
    expect(text(render(videos.Videos))).toContain(strings.t('videosNoneTitle'));
  });

  it('the shared video player only autoplays where asked — missions are unchanged', () => {
    const video = missionVideo.missionVideos('es')[0]!.video;
    const asMission = renderToStaticMarkup(createElement(bootcampScreen.VideoPlayer, { video }));
    expect(asMission).not.toMatch(/autoplay/i);
    expect(renderToStaticMarkup(createElement(bootcampScreen.VideoPlayer, { video, autoPlay: true }))).toMatch(/autoplay/i);
  });

  it('the run\'s controls sit in the fixed action bar, so the floating Daily Goal never covers them', () => {
    const screen = src('../features/videos/Videos.tsx');
    expect(screen.indexOf('<div className="action-zone">\n        <div className="videos-controls"')).toBeGreaterThan(-1);
  });
});

/* ── 7. What did not change ────────────────────────────────────────────────────────────────── */

describe('nothing the learner owns moved: progress, preferences, the timer, the curriculum', () => {
  it('walking every new door writes nothing to the stored progress (situations, foundations, start-from-zero)', () => {
    const before = [disk.get('ready.bootcamp.v2.es'), disk.get('ready.foundation.v2'), disk.get('ready.zerostart.v1')];
    expect(before).toEqual([SAVED_PROGRESS, SAVED_FOUNDATION, SAVED_ZERO]);
    render(home.Home); for (const id of ['basics', 'situations', 'games', 'listen']) tap(id);
    render(basics.BasicWords); for (const id of ['phrases', 'words', 'zerostart']) tap(id);
    render(listen.Listen); for (const id of ['stories', 'situations', 'sentences']) { tap(id); put(app.useAppStore, { listenPage: null }); }
    render(learn.Learn);
    expect([disk.get('ready.bootcamp.v2.es'), disk.get('ready.foundation.v2'), disk.get('ready.zerostart.v1')]).toEqual(before);
    // …and the screens read that same progress (no second store anywhere).
    expect(bootcamp.useBootcampStore.getState().completedDays).toHaveLength(3);
    expect(src('../shared/stores/appStore.ts')).not.toMatch(/localStorage\.setItem\('ready\.(listen|core|reading)/);
  });

  it('the Daily Goal is still ONE global floating timer at the app shell — not a Home card', () => {
    const shell = src('./App.tsx');
    expect(shell.match(/<DailyGoalTimer \/>/g)).toHaveLength(1);
    expect(shell.indexOf('<DailyGoalTimer />')).toBeGreaterThan(shell.indexOf('</ErrorBoundary>'));
    for (const screen of ['../features/home/Home.tsx', '../features/bootcamp/Learn.tsx', '../features/listen/Listen.tsx', '../features/basics/BasicWords.tsx']) {
      expect(src(screen), screen).not.toMatch(/dailyGoal|DailyGoal/);
    }
  });

  it('the curriculum is untouched: the same 30 situations in the same order, five phases', () => {
    expect(plan.BOOTCAMP_PLAN.map((m) => m.id)).toEqual([
      'introduce-myself', 'numbers-money', 'coffee-shop', 'everyday-core', 'directions',
      'airport-border', 'taxi', 'hotel-check-in', 'shopping', 'arrival-day-checkpoint',
      'small-talk', 'time-plans', 'home-family', 'restaurant-meal', 'special-requests-allergies',
      'hobbies-free-time', 'supermarket', 'food-day-checkpoint', 'public-transport', 'past-events',
      'future-plans', 'fixing-problems', 'opinions-reactions', 'city-day-checkpoint', 'lost-stolen-police',
      'pharmacy-health', 'emergency', 'no-subtitles', 'dress-rehearsal', 'complete-day-abroad',
    ]);
    expect(plan.PHASES).toHaveLength(5);
    // This pass changed screens, not missions: no mission content file is part of it.
    for (const screen of ['../features/home/Home.tsx', '../features/bootcamp/Learn.tsx', '../features/basics/BasicWords.tsx', '../features/listen/Listen.tsx', '../features/videos/Videos.tsx']) {
      expect(src(screen), screen).not.toMatch(/from '\.\/day\d+|practice[A-Z]\w+\.js'|Coverage\.js'/);
    }
  });
});
