import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { MISSIONS_BY_LANG } from '../bootcamp/registry.js';
import { ART_POSES, COMPANION_ART, artPath, artUrl, preloadStageArt, stageArtUrls } from './companionAssets.js';
import { GAME_INTRO, MISSION_INTRO, coachFor } from './companionCoach.js';
import { COPY, STAGE_COPY } from './companionCopy.js';
import { BASE_MOODS, MOOD_ANIMATION, MOOD_POSE, PARROT_MOODS, resolveMood } from './companionMood.js';
import { presenceFor } from './companionCoach.js';
import { setUiLangDict } from '../../shared/i18n/strings.js';
import { learnedMaterial } from './companionLearned.js';
import {
  GROWTH_POINTS, LAST_STAGE, STAGES, STAGE_THRESHOLDS, acknowledge, animationsFor, applyEvents, companionLine, deriveFromHistory,
  evolutionTimeline, missionEvents, motionFamily, newCompanion, pendingEvolution, resolveAnimation, sanitize, speechAbility, stageForPoints,
  stageProgress, type CompanionEvent, type LanguageCompanion,
} from './companionModel.js';
import { existsSync, readFileSync } from 'node:fs';
import { L } from '../../shared/i18n/strings.js';
import { fileURLToPath } from 'node:url';
import type * as StoreModule from './companionStore.js';
import type * as BootcampModule from '../bootcamp/bootcampStore.js';
import type * as AppModule from '../../shared/stores/appStore.js';
import type * as UiModule from './Companion.js';

/**
 * The Language Companion: a per-language, cumulative, monotonic progression that is NOT Trip
 * Readiness. Pure rules first, then the real store (persistence, migration, language switching,
 * the evolution firing once), then the rendered Path card.
 */
const isCheckpoint = (id: string): boolean => BOOTCAMP_PLAN.some((m) => m.id === id && m.checkpoint);
const mission = (id: string): CompanionEvent => ({ kind: 'missionCompleted', key: `mission:${id}` });
const missions = (n: number): CompanionEvent[] => Array.from({ length: n }, (_, i) => mission(`m${i}`));

describe('stage thresholds — capability milestones, not equal slices', () => {
  it('six stages, strictly rising thresholds that start at zero', () => {
    expect(STAGES).toEqual([1, 2, 3, 4, 5, 6]);
    expect(STAGE_THRESHOLDS).toHaveLength(6);
    expect(STAGE_THRESHOLDS[0]).toBe(0);
    STAGE_THRESHOLDS.forEach((t, i) => { if (i > 0) expect(t).toBeGreaterThan(STAGE_THRESHOLDS[i - 1]!); });
    const gaps = STAGE_THRESHOLDS.slice(1).map((t, i) => t - STAGE_THRESHOLDS[i]!);
    expect(new Set(gaps).size).toBe(gaps.length); // not a mechanical 1/6 each
  });

  it('points map to stages at the boundaries', () => {
    expect(stageForPoints(0)).toBe(1);
    expect(stageForPoints(19)).toBe(1);
    expect(stageForPoints(20)).toBe(2);
    expect(stageForPoints(69)).toBe(2);
    expect(stageForPoints(70)).toBe(3);
    expect(stageForPoints(150)).toBe(4);
    expect(stageForPoints(300)).toBe(5);
    expect(stageForPoints(599)).toBe(5);
    expect(stageForPoints(600)).toBe(6);
    expect(stageForPoints(99999)).toBe(6);
  });

  it('finishing the whole current Core is a major transformation — but not the Chatterbox', () => {
    const core = deriveFromHistory(missionEvents(BOOTCAMP_PLAN.map((m) => m.id), isCheckpoint));
    expect(core.points).toBe(BOOTCAMP_PLAN.reduce((n, m) => n + (m.checkpoint ? GROWTH_POINTS.checkpointCompleted : GROWTH_POINTS.missionCompleted), 0));
    expect(core.stage).toBe(5);
    expect(core.stage).toBeLessThan(LAST_STAGE);
    expect(stageProgress(core).pointsToNext).toBeGreaterThan(100); // the last stage needs real continued use
    // Two missions already calm the fish; a new learner is a scared fish.
    expect(deriveFromHistory(missions(2)).stage).toBe(2);
    expect(deriveFromHistory([]).stage).toBe(1);
  });
});

describe('progression is cumulative, idempotent and monotonic', () => {
  it('an event counts once, however often it is reported', () => {
    const once = applyEvents(newCompanion(), [mission('taxi')]);
    const twice = applyEvents(once, [mission('taxi'), mission('taxi')]);
    expect(once.points).toBe(10);
    expect(twice).toBe(once); // unchanged — same object
  });

  it('the stage never decreases as events arrive', () => {
    let state = newCompanion();
    let last = state.stage;
    for (let i = 0; i < 80; i++) {
      state = applyEvents(state, [mission(`x${i}`)]);
      expect(state.stage).toBeGreaterThanOrEqual(last);
      last = state.stage;
    }
    expect(last).toBe(6);
  });

  it('adding content or re-tuning thresholds can never move a learner back', () => {
    const reached = applyEvents(newCompanion(), missions(16)); // 160 points → stage 4
    expect(reached.stage).toBe(4);
    // The course triples and every threshold is raised: the stored stage stands.
    const harder = [0, 200, 700, 1500, 3000, 6000];
    expect(stageForPoints(reached.points, harder)).toBe(1);
    const after = applyEvents(reached, [mission('brand-new')], harder);
    expect(after.stage).toBe(4);
    expect(sanitize({ ...reached })!.stage).toBe(4);
    // The stage does not depend on how many missions exist — there is no denominator anywhere.
    expect(JSON.stringify(reached)).not.toMatch(/total|percent|pct/);
  });

  it('future growth sources are just event kinds', () => {
    const state = applyEvents(newCompanion(), [
      { kind: 'storyCompleted', key: 'story:1' }, { kind: 'reviewMastered', key: 'review:a' },
      { kind: 'listeningMastered', key: 'listen:a' }, { kind: 'conversationCompleted', key: 'chat:1' },
    ]);
    expect(state.points).toBe(GROWTH_POINTS.storyCompleted + GROWTH_POINTS.reviewMastered + GROWTH_POINTS.listeningMastered + GROWTH_POINTS.conversationCompleted);
  });

  it('progress toward the next stage is a share of that stage only', () => {
    expect(stageProgress(newCompanion())).toMatchObject({ stage: 1, next: 2, pct: 0, pointsToNext: 20 });
    expect(stageProgress(applyEvents(newCompanion(), missions(1)))).toMatchObject({ pct: 50, pointsToNext: 10 });
    expect(stageProgress({ points: 700, counted: [], stage: 6, seenStage: 6 })).toMatchObject({ next: null, pct: 100 });
  });
});

describe('evolution is owed once', () => {
  it('reaching a new stage owes an evolution until it is acknowledged', () => {
    const grown = applyEvents(newCompanion(), missions(2));
    expect(pendingEvolution(grown)).toEqual({ from: 1, to: 2 });
    const seen = acknowledge(grown);
    expect(pendingEvolution(seen)).toBeNull();
    expect(acknowledge(seen)).toBe(seen);
    // More growth inside the same stage owes nothing.
    expect(pendingEvolution(applyEvents(seen, [mission('more')]))).toBeNull();
  });

  it('several stages at once reveal the last one', () => {
    expect(pendingEvolution(applyEvents(newCompanion(), missions(16)))).toEqual({ from: 1, to: 4 });
  });

  it('migration: history is counted but never celebrated', () => {
    const existing = deriveFromHistory(missionEvents(['introduce-myself', 'numbers-money', 'coffee-shop', 'arrival-day-checkpoint'], isCheckpoint));
    expect(existing.points).toBe(10 + 10 + 10 + 20);
    expect(existing.stage).toBe(2);
    expect(pendingEvolution(existing)).toBeNull();
  });
});

describe('storage is tolerant', () => {
  it('sanitizes damaged data and never lowers a stage below what the points are worth', () => {
    expect(sanitize(null)).toBeNull();
    expect(sanitize('x')).toBeNull();
    expect(sanitize({})).toEqual({ points: 0, counted: [], stage: 1, seenStage: 1 });
    expect(sanitize({ points: 160, counted: ['a', 5], stage: 1, seenStage: 9 })).toEqual({ points: 160, counted: ['a'], stage: 4, seenStage: 4 });
    expect(sanitize({ points: -5, stage: 99 })!.stage).toBe(6);
  });
});

describe('animation system', () => {
  it('every stage has the base states; parrots gain speech, the Chatterbox gains its props', () => {
    for (const s of STAGES) for (const a of ['idle', 'listening', 'thinking', 'correct', 'encouraging', 'celebrate', 'missionComplete', 'levelUp', 'rest', 'attention'] as const) {
      expect(animationsFor(s)).toContain(a);
    }
    expect(animationsFor(2)).not.toContain('talking');
    expect(animationsFor(4)).toContain('talking');
    expect(animationsFor(5)).not.toContain('phone');
    expect(animationsFor(6)).toEqual(expect.arrayContaining(['phone', 'music', 'watchingTV', 'laughing']));
    expect(resolveAnimation(1, 'phone')).toBe('idle'); // a fish cannot use a phone
    expect(resolveAnimation(6, 'phone')).toBe('phone');
    expect([1, 2, 3, 4, 5, 6].map((s) => motionFamily(s as 1))).toEqual(['fish', 'fish', 'parrotfish', 'parrot', 'parrot', 'parrot']);
  });

  it('reduced motion: no evolution sequence — the new stage is simply shown', () => {
    expect(evolutionTimeline(true)).toEqual([{ phase: 'done', ms: 0 }]);
    const full = evolutionTimeline(false);
    expect(full.map((p) => p.phase)).toEqual(['anticipation', 'transform', 'reveal', 'done']);
    expect(full.reduce((n, p) => n + p.ms, 0)).toBeLessThanOrEqual(3000);
  });
});

describe('the companion never spoils new language', () => {
  const learned = { words: ['name', 'first time', 'coffee'], sentences: ['My name is Dan.', 'Nice to meet you!', "I'd like an iced coffee, please."] };

  it('speech ability grows with the stage', () => {
    expect(STAGES.map(speechAbility)).toEqual(['none', 'listening', 'babble', 'phrase', 'sentence', 'chatter']);
  });

  it('fish say nothing; a parrotfish repeats ONE learned word; parrots use learned sentences only', () => {
    expect(companionLine(1, learned)).toBeNull();
    expect(companionLine(2, learned)).toBeNull();
    expect(companionLine(3, learned)).toBe('Coffee?');
    expect(companionLine(4, learned)).toBe('Nice to meet you!');
    expect(learned.sentences).toContain(companionLine(5, learned));
    expect(learned.sentences).toContain(companionLine(6, learned));
  });

  it('with nothing learned it stays silent in the target language', () => {
    for (const s of STAGES) expect(companionLine(s, { words: [], sentences: [] })).toBeNull();
  });

  it('learned material comes only from COMPLETED missions of that language', () => {
    const day1 = BOOTCAMP_PLAN[0]!.day;
    expect(learnedMaterial('en', [])).toEqual({ words: [], sentences: [] });
    const en = learnedMaterial('en', [day1]);
    const fr = learnedMaterial('fr', [day1]);
    expect(en.sentences).toContain('My name is Dan.');
    expect(en.sentences.join(' ')).not.toMatch(/How much|coffee/i); // later missions are not exposed
    expect(fr.sentences).toContain('Je m’appelle Dan.');
    expect(fr.sentences).not.toContain('My name is Dan.');
    expect(en.sentences.some((s) => /repeat|slowly/i.test(s))).toBe(false); // toolkit phrases are not "its" lines
  });
});

describe('assets and copy are complete for every stage', () => {
  it('each stage has an internal label, a behaviour line and artwork that exists on disk', () => {
    const publicDir = fileURLToPath(new URL('../../../public', import.meta.url));
    for (const s of STAGES) {
      for (const key of ['name', 'behaviour'] as const) {
        expect(STAGE_COPY[s][key].he, `stage ${s} ${key}`).toBeTruthy();
        expect(STAGE_COPY[s][key].en, `stage ${s} ${key}`).toBeTruthy();
      }
      for (const variant of ['full', 'compact'] as const) expect(existsSync(publicDir + COMPANION_ART[s][variant]), `stage ${s} ${variant}`).toBe(true);
    }
    expect(artUrl(3, 'compact', '/app/')).toBe('/app/companion/s3-idle.png');
  });

  it('every stage has its OWN eight poses from the expression sheets, on disk, isolated and equally sized', () => {
    const publicDir = fileURLToPath(new URL('../../../public', import.meta.url));
    expect(ART_POSES).toEqual(['idle', 'hello', 'winner', 'celebrate', 'learning', 'sad', 'crown', 'cheer']);
    const seen = new Set<string>();
    for (const s of STAGES) {
      expect(COMPANION_ART[s].transparent, `stage ${s}`).toBe(true);
      for (const pose of ART_POSES) {
        const path = artPath(s, 'compact', pose);
        expect(path, `stage ${s} ${pose}`).toBe(`/companion/s${s}-${pose}.png`); // stage n shows stage n's pose — never another stage's
        expect(artPath(s, 'full', pose)).toBe(path);
        expect(existsSync(publicDir + path), path).toBe(true);
        const png = readFileSync(publicDir + path);
        expect(png.readUInt32BE(16), path).toBe(320);  // width
        expect(png.readUInt32BE(20), path).toBe(320);  // height — square, so a pose change never resizes the character
        expect(png[25], path).toBe(6);                 // RGBA: a transparent, isolated render
        seen.add(path);
      }
    }
    expect(seen.size).toBe(48);
  });

  it('a pose a stage has no image for falls back to its neutral image', () => {
    const saved = COMPANION_ART[1].poses;
    COMPANION_ART[1].poses = { hello: { compact: '/companion/s1-hello.png' } };
    expect(artUrl(1, 'compact', '/', 'hello')).toBe('/companion/s1-hello.png');
    expect(artUrl(1, 'full', '/', 'hello')).toBe('/companion/s1-idle.png');
    expect(artUrl(1, 'compact', '/', 'crown')).toBe('/companion/s1-idle.png');
    COMPANION_ART[1].poses = saved;
  });

  it('only the reached stage\'s art is ever fetched: it is outside the precache and warmed per stage', () => {
    for (const s of STAGES) {
      const urls = stageArtUrls(s, '/');
      expect(urls).toHaveLength(8);
      for (const u of urls) expect(u.startsWith(`/companion/s${s}-`), u).toBe(true);
    }
    const config = readFileSync(fileURLToPath(new URL('../../../vite.config.ts', import.meta.url)), 'utf8');
    expect(config).toContain("globIgnores: ['**/companion/**']");
    expect(config).toMatch(/urlPattern: \/\\\/companion\\\/\.\*\\\.png\$\/,\s+handler: 'CacheFirst'/);
    const requested: string[] = [];
    vi.stubGlobal('Image', class { decoding = ''; set src(v: string) { requested.push(v); } });
    preloadStageArt(2);
    vi.unstubAllGlobals();
    expect(requested).toEqual(stageArtUrls(2));
    expect(requested.join(' ')).not.toMatch(/\/s[13456]-/);
  });
});

describe('moods — how the buddy feels, never written on screen', () => {
  const ALL = [...BASE_MOODS, ...PARROT_MOODS];
  it('covers every required emotional state', () => {
    for (const m of ['idle', 'attentive', 'listening', 'curious', 'thinking', 'happy', 'proud', 'encouraging', 'surprised', 'celebrating', 'recovery', 'missionComplete']) expect(BASE_MOODS).toContain(m);
    expect(PARROT_MOODS).toEqual(['talking', 'laughing', 'excited', 'confident']);
  });
  it('every mood resolves, for every stage, to an animation that stage has and a pose the art table knows', () => {
    for (const s of STAGES) for (const m of ALL) {
      const shown = resolveMood(s, m);
      expect(animationsFor(s), `stage ${s} ${m}`).toContain(resolveAnimation(s, MOOD_ANIMATION[shown]));
      expect(ART_POSES, `${m}`).toContain(MOOD_POSE[shown]);
    }
  });
  it('a creature that cannot talk yet shows a quiet version of a talking mood', () => {
    for (const s of [1, 2, 3] as const) for (const m of PARROT_MOODS) expect(PARROT_MOODS as readonly string[]).not.toContain(resolveMood(s, m));
    for (const s of [4, 5, 6] as const) for (const m of PARROT_MOODS) expect(resolveMood(s, m)).toBe(m);
  });
  it('there is no negative mood: nothing sad, ashamed or angry exists to show', () => {
    expect(ALL.join(' ')).not.toMatch(/sad|cry|asham|angry|fail|wrong|disappoint/i);
  });
  it('each moment shows the pose the expression sheets give it', () => {
    const pose = (m: Parameters<typeof resolveMood>[1], stage: (typeof STAGES)[number] = 1) => MOOD_POSE[resolveMood(stage, m)];
    expect(pose('greeting')).toBe('hello');                                             // A — hello / welcome back
    expect([pose('happy'), pose('surprised')]).toEqual(['winner', 'winner']);           // B — a right answer
    expect([pose('celebrating'), pose('missionComplete')]).toEqual(['celebrate', 'celebrate']); // C — a big win
    expect([pose('teaching'), pose('thinking')]).toEqual(['learning', 'learning']);     // D — explaining, hinting
    expect(pose('encouraging')).toBe('sad');                                            // E — not quite
    expect([pose('proud'), pose('recovery')]).toEqual(['crown', 'crown']);              // F — a proud moment
    expect(pose('cheering')).toBe('cheer');                                             // G — let's go
    for (const m of ['idle', 'resting', 'attentive', 'listening', 'curious'] as const) expect(pose(m)).toBe('idle');
    for (const s of STAGES) for (const m of ALL) expect(ART_POSES).toContain(pose(m, s));
  });
  it('on the Route it waves hello — to a new learner and to one coming back — and rests when all is done', () => {
    expect(presenceFor({ done: 0, resume: false, allDone: false })).toEqual({ line: COPY.presence.fresh, mood: 'greeting' });
    expect(presenceFor({ done: 0, resume: true, allDone: false })).toEqual({ line: COPY.presence.resume, mood: 'greeting' });
    expect(presenceFor({ done: 4, resume: false, allDone: false })).toEqual({ line: COPY.presence.next, mood: 'greeting' });
    expect(presenceFor({ done: 30, resume: false, allDone: true })).toEqual({ line: COPY.presence.allDone, mood: 'resting' });
  });
});

/* ── inside a mission ──────────────────────────────────────────────────────────────────────────── */

describe('the companion inside a mission — one short app-language line, only where it helps', () => {
  const steps = (id: string) => MISSIONS_BY_LANG.en![BOOTCAMP_PLAN.find((m) => m.id === id)!.day]!.steps;

  it('every Core mission has its own intro line, in Hebrew and English', () => {
    expect(Object.keys(MISSION_INTRO).sort()).toEqual(BOOTCAMP_PLAN.map((m) => m.id).sort());
    for (const m of BOOTCAMP_PLAN) {
      const line = MISSION_INTRO[m.id]!;
      expect(line.he!.length, m.id).toBeGreaterThan(5);
      expect(line.en!.length, m.id).toBeLessThanOrEqual(70); // one short line, not a lecture
    }
    expect(MISSION_INTRO['introduce-myself']!.en).toBe('Today we learn how to start a conversation.');
    expect(MISSION_INTRO['numbers-money']!.en).toBe('Let’s practise prices and numbers.');
  });

  it('the intro line rides on the mission\'s existing intro card — no extra screen', () => {
    for (const m of BOOTCAMP_PLAN) {
      const all = steps(m.id);
      const first = all.findIndex((x) => x.kind === 'talk');
      expect(first, m.id).toBeGreaterThanOrEqual(0);
      expect(coachFor(all, first, m.id), m.id).toEqual({ line: MISSION_INTRO[m.id], role: 'intro' });
      // later intro-style cards stay quiet
      all.forEach((x, i) => { if (x.kind === 'talk' && i !== first) expect(coachFor(all, i, m.id), m.id).toBeNull(); });
    }
  });

  it('a game is explained the first time it appears in a mission, and only then', () => {
    const m1 = steps('introduce-myself');
    const at = m1.findIndex((x) => x.kind === 'matchPairs');
    expect(coachFor(m1, at, 'introduce-myself')).toEqual({ line: GAME_INTRO.matchPairs, role: 'game' });
    expect(GAME_INTRO.matchPairs!.en).toBe('Match each question to its answer.');
    const m2 = steps('numbers-money');
    const boards = m2.map((x, i) => (x.kind === 'visualMatch' ? i : -1)).filter((i) => i >= 0);
    expect(boards.length).toBe(2);
    expect(coachFor(m2, boards[0]!, 'numbers-money')?.line.en).toBe('Hear the price and find it.');
    expect(coachFor(m2, boards[1]!, 'numbers-money')).toBeNull();
    expect(coachFor(steps('directions'), steps('directions').findIndex((x) => x.kind === 'miniMap'), 'directions')?.line.en).toBe('Listen to the direction and choose the way.');
    expect(coachFor(steps('coffee-shop'), steps('coffee-shop').findIndex((x) => x.kind === 'sentenceBuilder'), 'coffee-shop')?.line.en).toBe('Build the sentence.');
  });

  it('it stays out of the way everywhere else: sentences, quizzes, dialogues, receipts, the victory screen', () => {
    for (const m of BOOTCAMP_PLAN) {
      const all = steps(m.id);
      all.forEach((x, i) => {
        if (['tool', 'prime', 'replies', 'quiz', 'dialogue', 'swipe', 'ambush', 'receipt', 'summary', 'video'].includes(x.kind)) expect(coachFor(all, i, m.id), `${m.id} ${x.kind}`).toBeNull();
      });
      const lines = all.filter((_, i) => coachFor(all, i, m.id)).length;
      expect(lines, m.id).toBeLessThanOrEqual(1 + new Set(all.map((x) => x.kind).filter((k) => k in GAME_INTRO)).size);
    }
    expect(coachFor([], 0, 'x')).toBeNull();
  });

  it('never names an engine and never spoils the language: Hebrew lines hold no foreign words, and no line quotes a mission sentence', () => {
    const lines = [...Object.values(MISSION_INTRO), ...Object.values(GAME_INTRO)];
    for (const l of lines) {
      expect(l.he, l.en).not.toMatch(/[A-Za-zÀ-ÿ]/);
      expect(l.en, l.en).not.toMatch(/quick reply|visual match|mini ?map|swap it|match pairs|sentence builder|engine/i);
      expect(`${l.he} ${l.en}`).not.toMatch(/grammar|verb|noun|tense|דקדוק|פועל/i);
    }
    for (const m of BOOTCAMP_PLAN) for (const lang of ['en', 'fr', 'es'] as const) {
      const line = MISSION_INTRO[m.id]!;
      for (const it of MISSIONS_BY_LANG[lang]![m.day]!.items) {
        if (it.text.split(' ').length < 2) continue;
        expect(line.en!.toLowerCase().includes(it.text.toLowerCase()), `${m.id} ${lang} “${it.text}”`).toBe(false);
        expect(line.he!.includes(it.text), `${m.id} ${lang}`).toBe(false);
      }
    }
  });
});

/* ── the real store ────────────────────────────────────────────────────────────────────────────── */

describe('companion store — per language, persisted, evolution fires once', () => {
  const disk = new Map<string, string>();
  let companion: typeof StoreModule;
  let bootcamp: typeof BootcampModule;
  let app: typeof AppModule;
  let ui: typeof UiModule;
  const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;
  const saved = (): Record<string, LanguageCompanion> => JSON.parse(disk.get('ready.companion.v1') ?? '{}') as Record<string, LanguageCompanion>;
  /** The active language's companion, exactly as the screens read it. */
  const active = () => companion.activeCompanion(companion.useCompanionStore.getState().byLang, app.useAppStore.getState().learningLang);
  /** The buddy on the Route, exactly as the Route renders it. */
  const card = (): string => {
    const a = active();
    const presence = presenceFor({ done: bootcamp.useBootcampStore.getState().completedDays.length, resume: false, allDone: false });
    return renderToStaticMarkup(createElement(ui.CompanionPresenceView, { stage: a.stage, language: ui.languageLabel(a.lang), line: presence.line.en!, mood: presence.mood }));
  };
  /** What the app-shell host shows: the evolution, if one is owed for the active language. */
  const host = (): string => { const a = active(); return a.evolution ? renderToStaticMarkup(createElement(ui.CompanionEvolution, { lang: a.lang, from: a.evolution.from, to: a.evolution.to, onDone: () => undefined })) : ''; };
  const complete = (...ids: string[]): void => {
    for (const id of ids) {
      bootcamp.useBootcampStore.getState().startDay(dayOf(id));
      bootcamp.useBootcampStore.getState().completeDay();
    }
  };

  beforeAll(async () => {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => disk.get(k) ?? null,
      setItem: (k: string, v: string) => void disk.set(k, v),
      removeItem: (k: string) => void disk.delete(k),
    });
    // An existing English learner: three missions done BEFORE the companion existed.
    disk.set('ready.bootcamp.v2.en', JSON.stringify({ completed: ['introduce-myself', 'numbers-money', 'coffee-shop'], receipts: [], stepIndex: {} }));
    app = await import('../../shared/stores/appStore.js');
    bootcamp = await import('../bootcamp/bootcampStore.js');
    companion = await import('./companionStore.js');
    ui = await import('./Companion.js');
  });

  it('migration: an existing learner starts at the stage their history earned, with nothing to replay', () => {
    const en = companion.useCompanionStore.getState().byLang.en!;
    expect(en).toMatchObject({ points: 30, stage: 2, seenStage: 2 });
    expect(saved().en).toMatchObject({ points: 30, stage: 2, seenStage: 2 }); // persisted at once
    expect(disk.get('ready.bootcamp.v2.en')).toContain('coffee-shop'); // mission progress untouched
  });

  it('the Path card renders the current companion, its stage and its language', () => {
    const html = card();
    expect(html).toContain('/companion/s2-');
    expect(html).toContain('Your English buddy');
    expect(html).not.toContain(STAGE_COPY[2].name.en); // it has no name on screen
    expect(html).not.toMatch(/of 6|Stage|%|cmp-bar/); // …and no number, no bar
    expect(html).toMatch(/English/);
    expect(html).toContain('data-mood="greeting"'); // it waves: welcome back
    expect(html).toContain('s2-hello.png');
    expect(host()).toBe(''); // nothing owed → no overlay
  });

  it('completing missions grows the companion; a new stage owes exactly one evolution', () => {
    complete('everyday-core', 'directions', 'airport-border'); // 60 points — still stage 2
    expect(companion.useCompanionStore.getState().byLang.en).toMatchObject({ points: 60, stage: 2, seenStage: 2 });
    complete('taxi'); // 70 points → Parrotfish
    const en = companion.useCompanionStore.getState().byLang.en!;
    expect(en).toMatchObject({ points: 70, stage: 3, seenStage: 2 });
    const overlay = host();
    expect(overlay).toContain('role="dialog"');
    expect(overlay).toContain('/companion/s2-');
    expect(overlay).toContain('/companion/s3-');
    expect(overlay).toContain(COPY.changedTitle.en);
    expect(overlay).toContain(COPY.changedLine.en);
    for (const s of STAGES) expect(overlay).not.toContain(STAGE_COPY[s].name.en); // the change is shown, never named
    expect(overlay).not.toMatch(/Stage|Level|of 6/);
  });

  it('replaying a completed mission adds nothing', () => {
    complete('taxi', 'introduce-myself');
    expect(companion.useCompanionStore.getState().byLang.en!.points).toBe(70);
  });

  it('once seen, the evolution is gone — and a reload does not bring it back', async () => {
    companion.useCompanionStore.getState().acknowledge('en');
    expect(host()).toBe('');
    expect(saved().en).toMatchObject({ stage: 3, seenStage: 3 });
    // "Reload": a fresh copy of the modules reads the same disk.
    vi.resetModules();
    const fresh = await import('./companionStore.js');
    expect(fresh.useCompanionStore.getState().byLang.en).toMatchObject({ points: 70, stage: 3, seenStage: 3 });
    expect(fresh.activeCompanion(fresh.useCompanionStore.getState().byLang, 'en').evolution).toBeNull();
  });

  it('an evolution owed before a reload is still shown after it — once', async () => {
    disk.set('ready.companion.v1', JSON.stringify({ en: { points: 150, counted: [], stage: 4, seenStage: 3 } }));
    vi.resetModules();
    const fresh = await import('./companionStore.js');
    const owed = (): unknown => fresh.activeCompanion(fresh.useCompanionStore.getState().byLang, 'en').evolution;
    expect(owed()).toEqual({ from: 3, to: 4 });
    fresh.useCompanionStore.getState().acknowledge('en');
    expect(owed()).toBeNull();
    expect((JSON.parse(disk.get('ready.companion.v1')!) as Record<string, LanguageCompanion>).en).toMatchObject({ stage: 4, seenStage: 4 });
    // Put the session's own state back for the tests below.
    disk.set('ready.companion.v1', JSON.stringify(companion.useCompanionStore.getState().byLang));
  });

  it('each language has its own companion: switching shows the right one and never leaks progress', () => {
    app.useAppStore.setState({ learningLang: 'es' });
    const state = companion.useCompanionStore.getState().byLang;
    expect(state.es).toMatchObject({ points: 0, stage: 1, seenStage: 1 }); // a scared fish
    expect(state.en!.stage).toBe(3);
    const html = card();
    expect(html).toContain('/companion/s1-');
    expect(html).not.toContain('/companion/s3-');
    expect(html).toMatch(/Spanish/);

    complete('introduce-myself', 'numbers-money');
    expect(companion.useCompanionStore.getState().byLang.es).toMatchObject({ points: 20, stage: 2, seenStage: 1 });
    expect(companion.useCompanionStore.getState().byLang.en!.points).toBe(70); // English untouched

    app.useAppStore.setState({ learningLang: 'en' });
    expect(card()).toContain('/companion/s3-');
    expect(host()).toBe(''); // the Spanish evolution waits for Spanish
    app.useAppStore.setState({ learningLang: 'es' });
    expect(host()).toContain('/companion/s2-');
  });

  it('an evolution never disturbs the mission flow: acknowledging it changes no mission state', () => {
    // Spanish owes the Focused Fish evolution (previous test). Open a mission and sit on its victory.
    const before = bootcamp.useBootcampStore.getState();
    bootcamp.useBootcampStore.getState().startDay(dayOf('coffee-shop'));
    bootcamp.useBootcampStore.getState().completeDay();
    const mid = bootcamp.useBootcampStore.getState();
    const snapshot = { activeDay: mid.activeDay, index: mid.index, stage: mid.stage, completed: [...mid.completedDays], steps: { ...mid.stepIndex } };
    expect(host()).not.toBe(''); // the evolution is owed while the victory screen is up
    companion.useCompanionStore.getState().acknowledge('es');
    const after = bootcamp.useBootcampStore.getState();
    expect({ activeDay: after.activeDay, index: after.index, stage: after.stage, completed: [...after.completedDays], steps: { ...after.stepIndex } }).toEqual(snapshot);
    expect(after.completedDays).toContain(dayOf('coffee-shop')); // normal progress was written
    expect(after.completedDays.length).toBe(before.completedDays.length + 1);
    expect(companion.useCompanionStore.getState().byLang.es).toMatchObject({ points: 30, stage: 2, seenStage: 2 }); // counted once
    expect(JSON.parse(disk.get('ready.bootcamp.v2.es')!).completed).toContain('coffee-shop');
    bootcamp.useBootcampStore.getState().exit();
  });

  it('other growth sources can be recorded directly, per language', () => {
    companion.useCompanionStore.getState().record('fr', [{ kind: 'storyCompleted', key: 'story:beach' }]);
    companion.useCompanionStore.getState().record('fr', [{ kind: 'storyCompleted', key: 'story:beach' }]);
    expect(companion.useCompanionStore.getState().byLang.fr!.points).toBe(GROWTH_POINTS.storyCompleted);
    expect(Object.keys(saved()).sort()).toEqual(['en', 'es', 'fr']);
  });

  it('the reusable reaction and the page render for any stage, with target-language lines kept LTR', () => {
    app.useAppStore.setState({ learningLang: 'en' });
    const a = active();
    const reaction = renderToStaticMarkup(createElement(ui.CompanionReactionView, { kind: 'missionComplete', stage: a.stage }));
    expect(reaction).toContain('data-anim="missionComplete"');
    expect(reaction).toContain('/companion/s3-');
    // What it SAYS on a miss is supportive (the pose is its own drawn sad face — checked in the reactions test).
    expect(renderToStaticMarkup(createElement(ui.CompanionReactionView, { kind: 'encouraging', stage: a.stage })).replace(/<[^>]+>/g, ' ')).not.toMatch(/wrong|fail|sad/i);
    const speech = ui.companionSpeech(a.stage, a.lang, bootcamp.useBootcampStore.getState().completedDays);
    const milestones = ui.recentMilestones(bootcamp.useBootcampStore.getState().completedDays);
    const page = renderToStaticMarkup(createElement(ui.CompanionPageView, { lang: a.lang, language: ui.languageLabel(a.lang), stage: a.stage, speech, milestones }));
    expect(page).toContain(STAGE_COPY[3].behaviour.en!.replace(/'/g, '&#x27;')); // who it is right now
    expect(page).toContain('Your English buddy');
    expect(milestones.length).toBe(3);
    for (const title of milestones) expect(page).toContain(title.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')); // what you did together
    expect(page.match(/<img /g)).toHaveLength(1); // one character: the current one — no track, no silhouette
    expect(page).not.toMatch(/is-silhouette|cmp-track|cmp-bar|progressbar/);
    expect(page).toMatch(/<span dir="ltr" lang="en">[^<]+\?<\/span>/); // a parrotfish repeats one learned word
  });
  it('in a mission a creature that cannot talk yet THINKS the coach line; one that talks says it — never in the target language', () => {
    const line = MISSION_INTRO['introduce-myself']!.he!;
    for (const stage of STAGES) {
      const html = renderToStaticMarkup(createElement(ui.CompanionCoachView, { stage, line }));
      expect(html, `stage ${stage}`).toContain(`data-stage="${stage}"`);
      expect(html, `stage ${stage}`).toContain(line);
      expect(html, `stage ${stage}`).not.toMatch(/lang="(en|fr|es)"/); // no target-language speech in the coach row
      expect(html, `stage ${stage}`).toContain(`data-voice="${stage <= 3 ? 'thought' : 'speech'}"`);
      expect(html, `stage ${stage}`).toMatch(/width:76px/); // present, but never bigger than the content
      expect(html, `stage ${stage}`).toContain(`s${stage}-learning.png`); // explaining = its studying pose
    }
  });

  it('reactions: the winner for a right answer, a sad face WITH support for a wrong one, the crown for a recovery tool', () => {
    const view = (kind: UiModule.ReactionKind, text?: string | false, stage: (typeof STAGES)[number] = 1): string => renderToStaticMarkup(createElement(ui.CompanionReactionView, { kind, stage, text, size: 40 }));
    const said = (html: string): string => html.replace(/<[^>]+>/g, ' ');
    const correct = view('correct', false);
    expect(correct).toContain('data-kind="correct"');
    expect(correct).toContain('s1-winner.png');
    expect(correct).not.toContain('cmp-bubble'); // the pose says it — no words crowd the answer card
    const wrong = view('encouraging');
    expect(wrong).toContain('s1-sad.png');
    expect(said(wrong)).toContain('So close. I’m with you — one more go?'); // on your side…
    expect(said(wrong)).not.toMatch(/wrong|fail|bad|mistake|טעות|לא נכון/i); // …never punishing
    const recovery = view('recovery');
    expect(recovery).toContain('data-kind="recovery"');
    expect(recovery).toContain('s1-crown.png'); // more than a plain right answer: it is the smart move
    expect(recovery).toContain('cmp-bubble');
    expect(view('proud', false)).toContain('s1-crown.png');
    expect(view('celebrate', false)).toContain('s1-celebrate.png');
    expect(view('missionComplete')).toContain('s1-celebrate.png');
    // every stage reacts with ITS OWN drawing of the pose
    for (const stage of STAGES) for (const [kind, pose] of [['correct', 'winner'], ['encouraging', 'sad'], ['recovery', 'crown'], ['missionComplete', 'celebrate']] as const) {
      expect(view(kind, false, stage), `stage ${stage} ${kind}`).toContain(`/companion/s${stage}-${pose}.png`);
    }
    for (const html of [correct, wrong, recovery]) expect(html).not.toMatch(/lang="(en|fr|es)"/);
  });

  it('it greets, cheers and teaches in the right places', () => {
    for (const stage of STAGES) {
      expect(renderToStaticMarkup(createElement(ui.CompanionPresenceView, { stage, language: 'x', line: 'x' })), 'route').toContain(`s${stage}-hello.png`);
      expect(renderToStaticMarkup(createElement(ui.CompanionIntroView, { stage, line: 'x' })), 'mission intro').toContain(`s${stage}-hello.png`); // greets — never the pom-poms
      expect(renderToStaticMarkup(createElement(ui.CompanionPeekView, { stage })), 'home, beside the start button').toContain(`s${stage}-cheer.png`);
      expect(renderToStaticMarkup(createElement(ui.CompanionCoachView, { stage, line: 'x' })), 'explaining').toContain(`s${stage}-learning.png`);
      expect(renderToStaticMarkup(createElement(ui.CompanionPresenceView, { stage, language: 'x', line: 'x', mood: 'resting' })), 'all done').toContain(`s${stage}-idle.png`);
    }
    const intro = renderToStaticMarkup(createElement(ui.CompanionIntroView, { stage: 1, line: 'x' }));
    expect(intro.match(/<img /g)).toHaveLength(1);
    expect(intro).not.toMatch(/cmp-prop|👋/); // only its own artwork — nothing pasted beside it
  });

  it('showing reactions and answering practice questions changes neither the mission nor the companion', () => {
    app.useAppStore.setState({ learningLang: 'en' });
    const bc = bootcamp.useBootcampStore.getState();
    bc.startDay(dayOf('hotel-check-in'));
    const flow = () => { const x = bootcamp.useBootcampStore.getState(); return { activeDay: x.activeDay, index: x.index, stage: x.stage, completed: [...x.completedDays] }; };
    const before = { mission: flow(), companion: JSON.stringify(companion.useCompanionStore.getState().byLang), disk: disk.get('ready.companion.v1') };
    for (const kind of ['correct', 'encouraging', 'thinking', 'recovery', 'celebrate'] as const) renderToStaticMarkup(createElement(ui.CompanionReaction, { kind }));
    renderToStaticMarkup(createElement(ui.CompanionCoach, { line: 'x' }));
    // Thirty answers — right, wrong, recovered — across every practice mode the games record.
    for (let i = 0; i < 30; i++) {
      bootcamp.useBootcampStore.getState().recordDrill('en.phrase.social.my-name', i % 2 ? 'simulator' : 'flashRecall', i % 3 ? 'pass' : 'fail', 900);
      bootcamp.useBootcampStore.getState().recordDrill('en.phrase.recovery.slowly', 'listen', 'pass');
    }
    expect(flow()).toEqual(before.mission);
    expect(JSON.stringify(companion.useCompanionStore.getState().byLang)).toBe(before.companion); // answers award no growth
    expect(disk.get('ready.companion.v1')).toBe(before.disk);
    // Finishing the mission is what counts — once.
    const points = companion.useCompanionStore.getState().byLang.en!.points;
    bootcamp.useBootcampStore.getState().completeDay();
    expect(companion.useCompanionStore.getState().byLang.en!.points).toBe(points + GROWTH_POINTS.missionCompleted);
    bootcamp.useBootcampStore.getState().completeDay();
    complete('hotel-check-in');
    expect(companion.useCompanionStore.getState().byLang.en!.points).toBe(points + GROWTH_POINTS.missionCompleted);
    bootcamp.useBootcampStore.getState().exit();
  });

  it('progression is untouched by this work: same thresholds, same points, the Chatterbox still out of reach of the current Core alone', () => {
    expect(STAGE_THRESHOLDS).toEqual([0, 20, 70, 150, 300, 600]);
    const all = deriveFromHistory(missionEvents(BOOTCAMP_PLAN.map((m) => m.id), isCheckpoint));
    expect(all.stage).toBeLessThan(LAST_STAGE);
    expect(Object.keys(GROWTH_POINTS).some((k) => /answer|drill|practice|question/i.test(k))).toBe(false);
  });

  it('reduced motion: the in-mission companion is still, like every other companion animation', () => {
    const css = readFileSync(fileURLToPath(new URL('./companion.css', import.meta.url)), 'utf8');
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toMatch(/\.cmp-fig img, \.cmp-fig, \.cmp-hero::before, \.cmp-evo \*, \.cmp-evo \{ animation: none !important; transition: none !important; \}/);
    // Every animated companion selector is one the reduced-motion block switches off.
    const animated = [...css.slice(0, css.indexOf('@media (prefers-reduced-motion: reduce)')).matchAll(/^(\.[^{\n]+)\{[^}]*animation:/gm)].map((m) => m[1]!);
    expect(animated.length).toBeGreaterThan(10);
    for (const sel of animated) expect(/\.cmp-fig|\.cmp-hero|\.cmp-evo/.test(sel), sel).toBe(true);
    expect(css).toMatch(/\.cmp-reaction \{[^}]*pointer-events: none;/); // can never swallow a tap meant for an answer
    expect(css).toMatch(/\.cmp-watch \{[^}]*pointer-events: none;/);
    expect(css).not.toMatch(/\.cmp-fig \{[^}]*(border-radius|overflow: hidden|background)/); // a character, not an avatar in a circle
  });

  it('PRODUCT RULE — no surface names a stage, counts stages, shows a threshold or shows a form not yet reached', () => {
    const names = STAGES.flatMap((n) => [STAGE_COPY[n].name.he!, STAGE_COPY[n].name.en!]);
    const speech = { text: '? ? ?', target: false };
    /** What a person can perceive: visible text, screen-reader labels, and which pictures are shown. */
    const perceived = (html: string) => ({
      text: `${html.replace(/<[^>]+>/g, ' ')} ${[...html.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(' ')}`,
      art: [...html.matchAll(/<img[^>]* src="([^"]+)"/g)].map((m) => m[1]!),
    });
    for (const uiLang of ['en', 'he']) {
      setUiLangDict(uiLang);
      for (const stage of STAGES) {
        const own = new Set(stageArtUrls(stage));
        const surfaces: Record<string, string> = {
          route: renderToStaticMarkup(createElement(ui.CompanionPresenceView, { stage, language: ui.languageLabel('es'), line: 'x' })),
          home: renderToStaticMarkup(createElement(ui.CompanionPeekView, { stage })),
          page: renderToStaticMarkup(createElement(ui.CompanionPageView, { lang: 'es', language: ui.languageLabel('es'), stage, speech, stirring: true, milestones: [] })),
          intro: renderToStaticMarkup(createElement(ui.CompanionIntroView, { stage, line: 'x' })),
          coach: renderToStaticMarkup(createElement(ui.CompanionCoachView, { stage, line: 'x' })),
          ...Object.fromEntries((['correct', 'encouraging', 'thinking', 'recovery', 'celebrate', 'missionComplete'] as const).map((kind) => [kind, renderToStaticMarkup(createElement(ui.CompanionReactionView, { kind, stage }))])),
        };
        for (const [where, html] of Object.entries(surfaces)) {
          const { text, art } = perceived(html);
          const at = `${uiLang} stage ${stage} ${where}`;
          for (const name of names) expect(text.includes(name), `${at} names “${name}”`).toBe(false);
          expect(text, at).not.toMatch(/\d\s*(of|\/|מתוך)\s*6|stage|level|שלב|רמה|%/i);
          expect(text, at).not.toMatch(/\b(20|70|150|300|600)\b/);
          expect(text, at).not.toMatch(/parrot|chatterbox|תוכי|פטפטן|next form|הצורה הבאה/i); // what it will become is never said
          expect(art.length, at).toBeGreaterThan(0);
          for (const src of art) expect(own.has(src), `${at} shows ${src}`).toBe(true); // only the character as it is NOW
          expect(html, at).not.toMatch(/silhouette|cmp-track|cmp-next|cmp-bar/);
        }
        // The change itself: the old look and the new one — which the learner is seeing this second — and nothing beyond.
        if (stage > 1) {
          const from = (stage - 1) as (typeof STAGES)[number];
          const { text, art } = perceived(renderToStaticMarkup(createElement(ui.CompanionEvolution, { lang: 'es', from, to: stage, onDone: () => undefined })));
          for (const name of names) expect(text.includes(name), `${uiLang} change to ${stage} names “${name}”`).toBe(false);
          expect(text).not.toMatch(/\d\s*(of|\/|מתוך)\s*6|stage|level|שלב|רמה|%|parrot|chatterbox|תוכי|פטפטן/i);
          expect(art).toHaveLength(2);
          expect(stageArtUrls(from)).toContain(art[0]);
          expect(stageArtUrls(stage)).toContain(art[1]);
          expect(text).toContain(L(COPY.changedTitle));
        }
      }
    }
    setUiLangDict('en');
    // The copy that reaches the screen holds no name either (the internal labels live only in STAGE_COPY.name).
    const screenCopy = JSON.stringify([COPY, STAGES.map((n) => STAGE_COPY[n].behaviour), MISSION_INTRO, GAME_INTRO]);
    for (const name of names) expect(screenCopy.includes(name), name).toBe(false);
    expect(screenCopy).not.toMatch(/Stage \d|שלב \d|of 6|מתוך 6/);
  });

  it('Home, the Route, a mission and its end all show the SAME current character — per language', () => {
    // Every surface draws the character the same way, from the same stage…
    const everywhere = (stage: (typeof STAGES)[number]): string[] => [
      renderToStaticMarkup(createElement(ui.CompanionPeekView, { stage })),                                  // Home
      renderToStaticMarkup(createElement(ui.CompanionPresenceView, { stage, language: 'x', line: 'x' })),    // Route
      renderToStaticMarkup(createElement(ui.CompanionIntroView, { stage, line: 'x' })),           // mission intro
      renderToStaticMarkup(createElement(ui.CompanionCoachView, { stage, line: 'x' })),                      // a game's instruction
      renderToStaticMarkup(createElement(ui.CompanionReactionView, { kind: 'correct', stage })),             // an answer
      renderToStaticMarkup(createElement(ui.CompanionReactionView, { kind: 'missionComplete', stage })),     // mission complete
    ];
    const stages: number[] = [];
    for (const lang of ['en', 'es', 'fr']) {
      app.useAppStore.setState({ learningLang: lang });
      const stage = active().stage;
      stages.push(stage);
      const shown = everywhere(stage).map((html) => /<img[^>]* src="([^"]+)"/.exec(html)?.[1]);
      for (const src of shown) expect(stageArtUrls(stage), `${lang} ${src}`).toContain(src);
    }
    expect(new Set(stages).size).toBeGreaterThan(1); // the languages really are at different points
    app.useAppStore.setState({ learningLang: 'en' });
    // …and every connected surface gets that stage from the one place: the active language's companion.
    const source = readFileSync(fileURLToPath(new URL('./Companion.tsx', import.meta.url)), 'utf8');
    for (const name of ['CompanionReaction', 'CompanionWatch', 'CompanionCoach', 'CompanionIntro', 'CompanionPresence', 'CompanionPeek', 'CompanionPage', 'CompanionHost']) {
      const at = source.indexOf(`export function ${name}(`);
      expect(at, name).toBeGreaterThan(-1);
      expect(source.slice(at, source.indexOf('\n}\n', at)), name).toContain('useCompanion()');
    }
    // No screen outside the feature draws the character itself or picks a stage for it.
    for (const file of ['../bootcamp/Bootcamp.tsx', '../bootcamp/PracticeSteps.tsx', '../bootcamp/Learn.tsx', '../home/Home.tsx']) {
      const code = readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');
      expect(code, file).toMatch(/from '\.\.\/companion\/Companion\.js'/);
      expect(code, file).not.toMatch(/CompanionFigure|View\b.*stage=|companionAssets/);
    }
  });

  it('the page only hints that something is stirring — close to a change, and never at the last form', () => {
    const page = (stirring: boolean): string => renderToStaticMarkup(createElement(ui.CompanionPageView, { lang: 'en', language: 'English', stage: 2, speech: { text: '👂 …', target: false }, stirring }));
    expect(page(true)).toContain(COPY.stirring.en);
    expect(page(true)).toContain('is-stirring');
    expect(page(false)).not.toContain(COPY.stirring.en);
    expect(page(false)).toContain(COPY.changes.en); // "the more you understand and speak, the more it changes" — how, and when, is not said
  });
});
