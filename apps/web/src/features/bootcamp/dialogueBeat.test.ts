import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN } from './plan.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { answersFollow, runNpcBeat, type BeatDeps } from './dialogueBeat.js';
import { checkpointScreen, proceed, respond, revealOptions, startCheckpoint, type CheckpointPlan } from './checkpoint.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDialogue, BootcampStep, DialogueNodeB } from './types.js';

/**
 * Audio is instructional media, never a loading state: in a conversation, the learner's choices are
 * on screen the moment the other person's line is — with its audio playing alongside — and never wait
 * for the speech engine to report the end (which some desktop engines never do: the old flow then
 * sat on its length-based safety timer, 4 s or more, looking frozen).
 */
const LANGS = ['en', 'fr', 'es'] as const;
const read = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');

/** A beat run against a speech engine that NEVER finishes (simulated slow / stuck TTS). */
function beat(dialogue: Pick<BootcampDialogue, 'nodes'>, node: DialogueNodeB) {
  const calls: string[] = [];
  let finish: (r: SpeakResult) => void = () => undefined;
  const deps: BeatDeps = {
    speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); },
    go: (next, heard) => calls.push(`go:${next}<${heard}`),
    end: () => calls.push('end'),
    later: (fn) => { calls.push('later'); fn(); },
    cancelled: () => false,
  };
  runNpcBeat(dialogue, node, deps);
  return { calls, finish: async (r: SpeakResult) => { finish(r); await Promise.resolve(); await Promise.resolve(); } };
}

/** Every conversation of every mission, in every language. */
const ALL = LANGS.flatMap((lang) => BOOTCAMP_PLAN.flatMap((m) => Object.values(MISSIONS_BY_LANG[lang]![m.day]!.dialogues).map((d) => ({ lang, mission: m.id, d }))));

describe('answer choices never wait for the audio', () => {
  it('1. the choices come up with the line, before its audio ends — in every conversation', () => {
    let checked = 0;
    for (const { lang, mission, d } of ALL) for (const n of d.nodes) {
      if (!answersFollow(d, n)) continue;
      const { calls } = beat(d, n);
      expect(calls, `${lang} ${mission} ${d.id}/${n.id}`).toEqual(['speak', `go:${n.next}<${n.id}`]);
      checked++;
    }
    expect(checked).toBeGreaterThan(300);
  });
  it('2. no "ended" event is needed: a speech engine that never finishes still shows the choices', async () => {
    const d = MISSIONS_BY_LANG.en![BOOTCAMP_PLAN.find((m) => m.id === 'shopping')!.day]!.dialogues['shopping-trip'] ?? Object.values(MISSIONS_BY_LANG.en![BOOTCAMP_PLAN[8]!.day]!.dialogues)[0]!;
    const first = d.nodes[0]!;
    const run = beat(d, first);
    expect(run.calls).toContain(`go:${first.next}<${first.id}`);
    await run.finish('ended'); // the end, when it comes, changes nothing: no second advance
    expect(run.calls.filter((c) => c.startsWith('go:'))).toHaveLength(1);
  });
  it('lines with nothing to answer after them still wait for the audio (no talking over each other)', async () => {
    for (const { d } of ALL.slice(0, 60)) for (const n of d.nodes) {
      if (n.who !== 'npc' || answersFollow(d, n)) continue;
      const run = beat(d, n);
      expect(run.calls).toEqual(['speak']);
      await run.finish('ended');
      expect(run.calls.at(-1)).toBe(n.end ? 'end' : `go:${n.next}<${n.id}`);
      const cut = beat(d, n);
      await cut.finish('interrupted'); // interrupted audio never advances
      expect(cut.calls).toEqual(['speak']);
    }
  });
  it('3. the learner can answer while the audio plays: the buttons are never locked on audio', () => {
    const player = read('./Bootcamp.tsx');
    const step = player.slice(player.indexOf('function DialogueStep'), player.indexOf('function AmbushStep'));
    expect(step).toContain('runNpcBeat(dialogue, node,');
    expect(step).not.toMatch(/disabled=\{[^}]*(speak|audio|playing)/i);
    expect(step).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio/);
    // The NPC line that is still being heard stays on screen above the choices.
    expect(step).toContain("heard?.next === node.id ? heard");
  });
  it('the other practice games show their options at once too (no audio gate anywhere)', () => {
    const games = read('./PracticeSteps.tsx');
    expect(games).not.toMatch(/\.then\(\(r\)\s*=>[^)]*set(Show|Visible|Options|Ready)/);
    expect(games).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
});

/* A controllable speech engine, as in tts.test.ts. */
class FakeUtterance {
  text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) { this.text = text; }
}
class FakeSynth {
  speaking = false; pending = false; current: FakeUtterance | null = null; spoken: string[] = [];
  getVoices() { return [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }]; }
  addEventListener() {} removeEventListener() {} resume() {}
  cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }
  speak(u: FakeUtterance) { this.current = u; this.speaking = true; this.spoken.push(u.text); }
}

describe('audio while answering', () => {
  afterEach(() => vi.unstubAllGlobals());
  const install = async () => {
    const synth = new FakeSynth();
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    vi.resetModules();
    return { synth, tts: await import('../../shared/audio/tts.js') };
  };
  it('4. answering mid-line stops the old line: the answer replaces it, nothing overlaps', async () => {
    const { synth, tts } = await install();
    const question = tts.speak('Hi there! Can I help you find anything?', 'en');
    expect(synth.speaking).toBe(true);
    void tts.speak("I'm just looking, thanks.", 'en'); // the learner taps an answer while it plays
    expect(await question).toBe('interrupted');
    expect(synth.current?.text).toBe("I'm just looking, thanks.");
    tts.cancelSpeech(); // moving to the next step stops it
    expect(synth.current).toBeNull();
  });
  it('5. replay still works: the line can be heard again, at any time', async () => {
    const { synth, tts } = await install();
    void tts.speak('Sure! What size are you? The fitting room is over there.', 'en');
    void tts.speak('Sure! What size are you? The fitting room is over there.', 'en', 0.9); // 🔊 again
    expect(synth.spoken).toHaveLength(2);
    const player = read('./Bootcamp.tsx');
    expect(player).toContain("🔊 {t('replayQuestion')}");
    expect(player).toContain("🔊 {t('replayAudio')}");
  });
});

describe('intentional reveals are untouched', () => {
  const planOf = (lang: (typeof LANGS)[number]): CheckpointPlan => {
    const s = MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[9]!.day]!.steps.find((x): x is Extract<BootcampStep, { kind: 'checkpoint' }> => x.kind === 'checkpoint')!;
    return s.plan;
  };
  it('6. Mission 10 one-take: the learner\'s lines stay concealed until "show options"', () => {
    for (const lang of LANGS) {
      const plan = planOf(lang);
      let s = startCheckpoint(plan);
      while (s.phase !== 'one-take') {
        const sc = checkpointScreen(plan, s);
        s = sc.kind === 'say' ? respond(plan, s, { kind: 'say', conceptId: sc.turn.conceptId })
          : sc.kind === 'capture' ? respond(plan, s, { kind: 'capture', picks: Object.fromEntries(sc.groups.map((g) => [g.conceptId, g.correct])) })
            : proceed(plan, s);
      }
      s = proceed(plan, s);
      const hidden = checkpointScreen(plan, s);
      expect(hidden.kind === 'say' && [hidden.concealed, hidden.options.length], lang).toEqual([true, 0]);
      const shown = checkpointScreen(plan, revealOptions(plan, s));
      expect(shown.kind === 'say' && shown.options.length, lang).toBe(3);
    }
  });
  it('7. information gaps keep their timing: a fact is still only on screen once its line is said', () => {
    // The checkpoint's fare / room / hours stay behind their lines (pinned in mission10.test.ts);
    // a conversation shows a line only when its node is reached — the change moves no fact earlier.
    for (const { d } of ALL) for (const n of d.nodes) if (answersFollow(d, n)) {
      const next = d.nodes.find((x) => x.id === n.next)!;
      expect(next.who).toBe('you'); // only ever the learner's own answers come forward, never a later line
    }
    expect(read('./CheckpointStep.tsx')).toContain("t('checkpointShowOptions')");
  });
  it('8. EN / ES / FR behave identically: the same beats show their choices at once', () => {
    const shape = (lang: (typeof LANGS)[number]) => ALL.filter((x) => x.lang === lang).map(({ mission, d }) => [mission, d.id, d.nodes.filter((n) => answersFollow(d, n)).map((n) => n.id)]);
    expect(shape('fr')).toEqual(shape('en'));
    expect(shape('es')).toEqual(shape('en'));
  });
});
