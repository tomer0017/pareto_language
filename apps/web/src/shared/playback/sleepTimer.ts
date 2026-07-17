/**
 * Sleep timer — a tiny framework-free countdown the Parrot engine drives (Task 2). Extracted from the
 * React hook so its pause/resume/reset/expire behaviour is unit-testable with fake timers (no DOM).
 *
 * It counts ACTIVE playback time only: the engine calls `pauseTicking()` when playback pauses and
 * `resume()` when it continues, so the remaining time is preserved across pauses. `reset` swaps in a
 * new duration (keeping the countdown live only if it was already running); `off` cancels it; and
 * `dispose` stops ticking on unmount WITHOUT firing expiry.
 */
export interface SleepTimer {
  /** Set a fresh duration (ms) and start ticking immediately. */
  arm(ms: number): void;
  /** Continue ticking the preserved remainder (no-op if already ticking or nothing armed). */
  resume(): void;
  /** Stop ticking but keep the remaining time (a playback pause). */
  pauseTicking(): void;
  /** Replace the duration; keeps ticking only if it already was (changing while playing resets it). */
  reset(ms: number): void;
  /** Cancel entirely — remaining becomes null. */
  off(): void;
  /** Stop ticking on teardown; never fires expiry. */
  dispose(): void;
  isTicking(): boolean;
  remaining(): number | null;
}

export function createSleepTimer(opts: {
  tickMs?: number;
  onTick: (remaining: number | null) => void;
  onExpire: () => void;
}): SleepTimer {
  const tickMs = opts.tickMs ?? 1000;
  let remaining: number | null = null;
  let handle: ReturnType<typeof setInterval> | null = null;

  const stopTicking = (): void => {
    if (handle !== null) { clearInterval(handle); handle = null; }
  };

  const startTicking = (): void => {
    if (handle !== null || remaining == null || remaining <= 0) return;
    handle = setInterval(() => {
      if (remaining == null) { stopTicking(); return; }
      const next = remaining - tickMs;
      if (next <= 0) {
        remaining = null;
        stopTicking();
        opts.onTick(null);
        opts.onExpire();
      } else {
        remaining = next;
        opts.onTick(remaining);
      }
    }, tickMs);
  };

  return {
    arm(ms: number) { remaining = Math.max(0, ms); opts.onTick(remaining); stopTicking(); startTicking(); },
    resume() { startTicking(); },
    pauseTicking() { stopTicking(); },
    reset(ms: number) { const wasTicking = handle !== null; remaining = Math.max(0, ms); opts.onTick(remaining); if (wasTicking) { stopTicking(); startTicking(); } },
    off() { remaining = null; stopTicking(); opts.onTick(null); },
    dispose() { stopTicking(); },
    isTicking() { return handle !== null; },
    remaining() { return remaining; },
  };
}
