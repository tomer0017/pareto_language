import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { missionIcon, missionJourney, missionPhases, phaseOfIndex, primaryDialogue } from './missionFlow.js';

/**
 * The guided journey (Watch → Learn → Practice → Watch again) is a VIEW over the unchanged step list.
 * These tests bind it to the real missions in every language: Learn really teaches, Practice really
 * starts where the learner first responds, and missions without a video or without new content
 * still get a sound journey.
 */
const RESPONDING = new Set(['quiz', 'dialogue', 'swipe', 'ambush', 'quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder']);
const TEACHING = new Set(['prime', 'tool', 'replies']);

describe('missionPhases — where learning ends and practice begins', () => {
  for (const [lang, set] of Object.entries(MISSIONS_BY_LANG)) {
    it(`${lang}: every mission splits into a valid Learn / Practice journey`, () => {
      for (const mission of BOOTCAMP_PLAN) {
        const day = set[mission.day]!;
        const p = missionPhases(day);
        const at = `${lang} ${mission.id}`;
        expect(day.steps[p.learnStart]!.kind, at).not.toBe('video'); // the overview's Watch replaces it
        expect(p.practiceStart, at).toBeGreaterThanOrEqual(p.learnStart);
        expect(p.practiceStart, at).toBeLessThan(day.steps.length - 1); // practice exists before the summary
        if (p.hasLearn) {
          // Learn contains real teaching and no responding step; Practice opens on a responding step.
          const learn = day.steps.slice(p.learnStart, p.practiceStart);
          expect(learn.some((s) => TEACHING.has(s.kind)), at).toBe(true);
          expect(learn.some((s) => RESPONDING.has(s.kind)), at).toBe(false);
          expect(RESPONDING.has(day.steps[p.practiceStart]!.kind), at).toBe(true);
        } else {
          expect(p.practiceStart, at).toBe(p.learnStart); // no separate Learn entry
        }
        // Every mission still reaches a dialogue during practice.
        expect(day.steps.slice(p.practiceStart).some((s) => s.kind === 'dialogue'), at).toBe(true);
      }
    });
  }

  it('content missions have a Learn section; cold checkpoints go straight to Practice', () => {
    const en = MISSIONS_BY_LANG.en!;
    for (const m of BOOTCAMP_PLAN) {
      expect(missionPhases(en[m.day]!).hasLearn, m.id).toBe(m.targets.concepts > 0);
    }
  });

  it('Mission 1 skips its in-flow video step (Watch is the overview\'s first entry)', () => {
    const day = MISSIONS_BY_LANG.en![1]!;
    expect(day.steps[0]!.kind).toBe('video');
    const p = missionPhases(day);
    expect(p.learnStart).toBe(1);
    expect(day.steps[p.practiceStart]!.kind).toBe('matchPairs'); // Practice V1.1: practice opens on the Match Pairs board
  });

  it('phaseOfIndex labels each step of the flow', () => {
    const p = missionPhases(MISSIONS_BY_LANG.en![1]!);
    expect(phaseOfIndex(p, p.learnStart)).toBe('learn');
    expect(phaseOfIndex(p, p.practiceStart - 1)).toBe('learn');
    expect(phaseOfIndex(p, p.practiceStart)).toBe('practice');
    const cold = missionPhases(MISSIONS_BY_LANG.en![9]!); // Arrival Day Checkpoint
    expect(phaseOfIndex(cold, cold.learnStart)).toBe('practice');
  });

  it('handles degenerate step lists without throwing', () => {
    expect(missionPhases({ steps: [] })).toEqual({ learnStart: 0, practiceStart: 0, hasLearn: false });
    expect(missionPhases({ steps: [{ kind: 'summary' }] })).toEqual({ learnStart: 0, practiceStart: 0, hasLearn: false });
  });
});

describe('mission overview data — always available, video or not', () => {
  it('every mission has a conversation to watch or listen to, in every language', () => {
    for (const [lang, set] of Object.entries(MISSIONS_BY_LANG)) {
      for (const m of BOOTCAMP_PLAN) {
        const day = set[m.day]!;
        expect(primaryDialogue(day), `${lang} ${m.id}`).not.toBeNull(); // the no-video fallback for "Watch"
      }
    }
  });

  it('missions without a video (Spanish has none) still offer Listen + Learn + Practice', () => {
    const es = MISSIONS_BY_LANG.es!;
    for (const m of BOOTCAMP_PLAN) {
      const day = es[m.day]!;
      expect(day.introVideo).toBeUndefined();
      expect(primaryDialogue(day)!.nodes.length).toBeGreaterThan(0);
    }
  });

  it('missionIcon reads the mission\'s own icon and falls back safely', () => {
    expect(missionIcon(MISSIONS_BY_LANG.en![1])).toBe('👋');
    expect(missionIcon(MISSIONS_BY_LANG.en![3])).toBe('☕');
    expect(missionIcon(undefined)).toBe('🎯');
    for (const m of BOOTCAMP_PLAN) expect(missionIcon(MISSIONS_BY_LANG.en![m.day]).length).toBeGreaterThan(0);
  });
});

describe('missionJourney — one obvious primary action', () => {
  const phases = missionPhases(MISSIONS_BY_LANG.en![3]!); // Coffee Shop: a content mission
  const cold = missionPhases(MISSIONS_BY_LANG.en![9]!);   // Arrival Day Checkpoint: no Learn
  const base = { phases, canWatch: true, done: false, saved: 0, watched: false };
  const ids = (j: ReturnType<typeof missionJourney>): string[] => j.steps.map((s) => `${s.id}:${s.state}`);

  it('a first-time learner gets ONE primary action (watch), and no Learn / Practice shortcuts', () => {
    const j = missionJourney(base);
    expect(j.primary).toEqual({ step: 'watch', resume: false });
    expect(j.shortcuts).toBe(false);
    expect(ids(j)).toEqual(['watch:current', 'learn:upcoming', 'practice:upcoming']);
    expect(j.steps.filter((s) => s.state === 'current')).toHaveLength(1);
  });

  it('after watching, the path continues to Learn — still one primary action', () => {
    const j = missionJourney({ ...base, watched: true });
    expect(j.primary).toEqual({ step: 'learn', resume: false });
    expect(ids(j)).toEqual(['watch:done', 'learn:current', 'practice:upcoming']);
    expect(j.shortcuts).toBe(false);
  });

  it('a learner mid-way through Learn resumes exactly there', () => {
    const j = missionJourney({ ...base, saved: phases.learnStart + 2 });
    expect(j.primary).toEqual({ step: 'learn', resume: true });
    expect(ids(j)).toEqual(['watch:upcoming', 'learn:current', 'practice:upcoming']);
  });

  it('a learner mid-way through Practice resumes there, with Learn behind them', () => {
    const j = missionJourney({ ...base, saved: phases.practiceStart + 1 });
    expect(j.primary).toEqual({ step: 'practice', resume: true });
    expect(ids(j)).toEqual(['watch:upcoming', 'learn:done', 'practice:current']);
    expect(missionJourney({ ...base, saved: phases.practiceStart }).primary).toEqual({ step: 'practice', resume: true });
  });

  it('a completed mission: the reward (watch again) is primary and the steps become shortcuts', () => {
    const j = missionJourney({ ...base, done: true });
    expect(j.primary).toEqual({ step: 'again', resume: false });
    expect(j.shortcuts).toBe(true);
    expect(ids(j)).toEqual(['watch:upcoming', 'learn:done', 'practice:done', 'again:current']);
  });

  it('never claims the conversation was watched unless it was watched in this visit (no stored "watched" state)', () => {
    for (const saved of [0, phases.learnStart + 2, phases.practiceStart + 1]) {
      expect(missionJourney({ ...base, saved }).steps[0]).toMatchObject({ id: 'watch' });
      expect(missionJourney({ ...base, saved }).steps[0]!.state).not.toBe('done');
    }
    expect(missionJourney({ ...base, done: true }).steps[0]!.state).toBe('upcoming');
    expect(missionJourney({ ...base, watched: true }).steps[0]!.state).toBe('done');
  });

  it('a cold checkpoint has no Learn step: watch → practice', () => {
    expect(ids(missionJourney({ ...base, phases: cold }))).toEqual(['watch:current', 'practice:upcoming']);
    expect(missionJourney({ ...base, phases: cold, watched: true }).primary.step).toBe('practice');
  });

  it('exactly one step is current in every state, for every real mission', () => {
    for (const m of BOOTCAMP_PLAN) {
      const p = missionPhases(MISSIONS_BY_LANG.en![m.day]!);
      const last = MISSIONS_BY_LANG.en![m.day]!.steps.length - 1;
      for (const done of [false, true]) for (const watched of [false, true]) for (const saved of [0, p.learnStart + 1, p.practiceStart, last]) {
        const j = missionJourney({ phases: p, canWatch: true, done, saved: done ? 0 : saved, watched });
        expect(j.steps.filter((s) => s.state === 'current'), `${m.id} done=${done} saved=${saved}`).toHaveLength(1);
        expect(j.steps.find((s) => s.state === 'current')!.id).toBe(j.primary.step);
        expect(j.shortcuts).toBe(done);
      }
    }
  });
});
