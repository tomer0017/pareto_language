/**
 * Feedback sound cues (Pareto UX sprint — Global Success & Error Feedback).
 *
 * Short synthesized WebAudio tones — no asset files, so they work fully offline, add nothing to
 * the PWA precache, and never block a drill. One lazily-created AudioContext is shared; every call
 * silently no-ops where WebAudio is unavailable or blocked. These are deliberately subtle and
 * pleasant (never cartoonish) per the brief.
 */
type AC = typeof AudioContext;
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor: AC | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/* Interface sounds can be switched off (Profile → Sounds). Speech is a separate system and is not
   affected. The choice is stored, and read defensively so a missing storage never breaks a drill. */
const SFX_KEY = 'ready.sfx';
let enabled: boolean | null = null;
export function sfxEnabled(): boolean {
  if (enabled === null) {
    try { enabled = localStorage.getItem(SFX_KEY) !== 'off'; } catch { enabled = true; }
  }
  return enabled;
}
export function setSfxEnabled(on: boolean): void {
  enabled = on;
  try { localStorage.setItem(SFX_KEY, on ? 'on' : 'off'); } catch { /* storage unavailable — keep it for this session */ }
}

/** Play a short sequence of notes (Hz) as a gentle envelope-shaped blip chain. */
function tones(freqs: number[], opts: { type?: OscillatorType; gain?: number; dur?: number; gap?: number } = {}): void {
  if (!sfxEnabled()) return;
  const ac = audio();
  if (!ac) return;
  const { type = 'sine', gain = 0.09, dur = 0.15, gap = 0.1 } = opts;
  for (let i = 0; i < freqs.length; i++) {
    const t0 = ac.currentTime + i * gap;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freqs[i]!;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}

/** Bright, rising two-note success chime (D5 → A5). */
export function successChime(): void {
  tones([587.33, 880], { type: 'sine', gain: 0.1, dur: 0.16, gap: 0.1 });
}

/** Soft, low falling error tone (G3 → D#3) — clearly "not that", never harsh. */
export function errorBuzz(): void {
  tones([196, 155.56], { type: 'triangle', gain: 0.08, dur: 0.19, gap: 0.12 });
}

/* READY's own small vocabulary of game sounds — soft sine / triangle tones, never arcade-like. */

/** A tile or a word chunk dropping into place. */
export function placeTick(): void {
  tones([660], { type: 'triangle', gain: 0.045, dur: 0.07 });
}

/** A right answer inside a game, kept quieter than the answer-card chime because speech follows. */
export function softChime(): void {
  tones([659.25, 880], { type: 'sine', gain: 0.055, dur: 0.13, gap: 0.08 });
}

/** Two tiles locking together. */
export function matchChime(): void {
  tones([523.25, 783.99], { type: 'sine', gain: 0.07, dur: 0.14, gap: 0.07 });
}

/** A whole sentence, board or mission finished: three rising notes. */
export function completeChime(): void {
  tones([523.25, 659.25, 783.99], { type: 'sine', gain: 0.08, dur: 0.18, gap: 0.11 });
}

/** The buddy has changed: a slow, open rise — the one sound that is allowed to linger. */
export function evolveChime(): void {
  tones([392, 523.25, 659.25, 783.99, 1046.5], { type: 'sine', gain: 0.085, dur: 0.34, gap: 0.16 });
}
