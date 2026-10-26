import { beforeAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { missionVideo } from '../videos/missionVideo.js';
import { afterWatching, missionJourney, missionPhases, practiceReplay, primaryDialogue } from './missionFlow.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type * as StoreModule from './bootcampStore.js';

/**
 * Replaying the mission's conversation video is allowed at ANY time once a video exists — before,
 * during and after the mission — and never moves progress: no step is completed, skipped or reset,
 * and closing it returns the learner to exactly where they were. Watching is UI state only; the
 * practice position lives in the store's progress (today on this device, later on an account), and
 * none of the rules below assume where that progress is kept.
 */
const disk = new Map<string, string>();
const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;
const WITH_VIDEO = dayOf('introduce-myself'); // en_1.mp4 exists
const NO_VIDEO = dayOf('everyday-core'); // Mission 04: no English video (Spanish / French only)
const SRC = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
const between = (from: string, to: string): string => SRC.slice(SRC.indexOf(from), SRC.indexOf(to, SRC.indexOf(from)));

describe('replaying the mission video during practice', () => {
  let store: typeof StoreModule;
  const progress = (): string => { const s = store.useBootcampStore.getState(); return JSON.stringify({ index: s.index, stepIndex: s.stepIndex, completedDays: s.completedDays, receipts: s.receipts }); };
  /** Put the learner mid-way through PRACTICE of `day` — a real resume point, in the store. */
  const midPractice = (day: number): number => {
    const at = missionPhases(MISSIONS_BY_LANG.en![day]!).practiceStart + 2;
    store.useBootcampStore.getState().startDay(day);
    store.useBootcampStore.getState().enterPractice(at);
    return at;
  };

  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    store = await import('./bootcampStore.js');
  });

  it('1 · the replay button is offered — and enabled — at every practice step of a mission with a video', () => {
    expect(missionVideo('en', WITH_VIDEO)).toBeTruthy();
    const day = MISSIONS_BY_LANG.en![WITH_VIDEO]!;
    const phases = missionPhases(day);
    for (let i = phases.practiceStart; i < day.steps.length; i++) {
      const kind = day.steps[i]!.kind;
      expect(practiceReplay({ hasVideo: true, hasConversation: true, stepKind: kind, index: i }), `step ${i} ${kind}`).toBe(kind === 'video' ? null : 'watch');
    }
    // the button the player draws for it: no `disabled`, nothing that gates it on progress
    const button = between("{replay === 'watch' && (", '</button>');
    expect(button).toContain("onClick={() => { cancelSpeech(); setShowVideo(true); }}");
    expect(button).not.toMatch(/disabled|aria-disabled/);
  });

  it('1 · the mission overview keeps Watch tappable while the mission is in progress (not only after completing it)', () => {
    const phases = missionPhases(MISSIONS_BY_LANG.en![WITH_VIDEO]!);
    const open = (o: { done?: boolean; saved?: number }) => Object.fromEntries(missionJourney({ phases, canWatch: true, done: o.done ?? false, saved: o.saved ?? 0, watched: false }).steps.map((s) => [s.id, s.open]));
    expect(open({})).toEqual({ watch: true, learn: false, practice: false });
    expect(open({ saved: phases.learnStart + 1 })).toEqual({ watch: true, learn: false, practice: false });
    expect(open({ saved: phases.practiceStart + 1 })).toEqual({ watch: true, learn: false, practice: false }); // mid-practice
    expect(open({ done: true })).toEqual({ watch: true, learn: true, practice: true, again: true });
    expect(SRC).toContain('onClick={step.open ? () => run(step.id) : undefined}');
  });

  it('2 · 3 · opening and closing the replay in practice is UI state only — the step the learner is on stays the step they come back to', () => {
    // the player: open = show the overlay, close = hide it; the store is never called
    expect(between('function MissionPlayer(', '  const pop = ')).toBeTruthy();
    expect(SRC).toContain('if (showVideo && video) return <VideoOverlay video={video} onClose={() => setShowVideo(false)} />;');
    const overlay = between('function VideoOverlay(', '\n}\n');
    expect(overlay).not.toMatch(/useBootcampStore|enterPractice|\.next\(|complete|stepIndex|restart/);
    // and the store, before and after: same index, same saved step
    const at = midPractice(WITH_VIDEO);
    expect(store.useBootcampStore.getState().index).toBe(at);
  });

  it('2 · 3 · 4 · replaying from the overview mid-mission, then "continue", resumes the EXACT step — unlimited times, with no progress change', () => {
    const at = midPractice(WITH_VIDEO);
    const before = progress();
    const phases = missionPhases(MISSIONS_BY_LANG.en![WITH_VIDEO]!);
    for (let i = 0; i < 3; i++) {
      store.useBootcampStore.getState().toHub();
      const s = store.useBootcampStore.getState();
      const journey = missionJourney({ phases, canWatch: true, done: false, saved: s.stepIndex[String(WITH_VIDEO)] ?? 0, watched: true });
      expect(afterWatching(journey, false, phases.learnStart)).toEqual({ kind: 'resume' }); // never "start of Learn"
      store.useBootcampStore.getState().enterPractice(); // what "continue" does for `resume`
      expect(store.useBootcampStore.getState().index).toBe(at);
      expect(progress()).toBe(before); // nothing completed, skipped or reset
    }
    // the hub wires "continue" through that rule
    expect(SRC).toContain("if (next.kind === 'resume') bc.enterPractice(); else bc.enterPractice(next.at);");
  });

  it('4 · afterWatching — completed → nothing to continue · in progress → resume exactly · first pass → the guided start', () => {
    const phases = missionPhases(MISSIONS_BY_LANG.en![WITH_VIDEO]!);
    const j = (o: { done?: boolean; saved?: number }) => missionJourney({ phases, canWatch: true, done: o.done ?? false, saved: o.saved ?? 0, watched: true });
    expect(afterWatching(j({ done: true }), true, phases.learnStart)).toEqual({ kind: 'none' });
    expect(afterWatching(j({ saved: phases.practiceStart + 1 }), false, phases.learnStart)).toEqual({ kind: 'resume' });
    expect(afterWatching(j({ saved: phases.learnStart + 1 }), false, phases.learnStart)).toEqual({ kind: 'resume' });
    expect(afterWatching(j({}), false, phases.learnStart)).toEqual({ kind: 'start', at: phases.learnStart });
  });

  it('5 · a mission with no video exposes no video replay in practice — never a broken player', () => {
    expect(missionVideo('en', NO_VIDEO)).toBeUndefined();
    const day = MISSIONS_BY_LANG.en![NO_VIDEO]!;
    const phases = missionPhases(day);
    for (let i = phases.practiceStart; i < day.steps.length; i++) {
      expect(practiceReplay({ hasVideo: false, hasConversation: Boolean(primaryDialogue(day)), stepKind: day.steps[i]!.kind, index: i }), `step ${i}`).toBeNull();
    }
    // before the first step, the conversation can still be heard read aloud (the transcript reader)
    expect(practiceReplay({ hasVideo: false, hasConversation: true, stepKind: day.steps[0]!.kind, index: 0 })).toBe('listen');
    // the overlay itself is only ever drawn for a video that exists
    expect(SRC).toContain('if (showVideo && video) return <VideoOverlay');
  });
});
