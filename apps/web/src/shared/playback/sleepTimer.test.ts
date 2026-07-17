import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSleepTimer } from './sleepTimer.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function make() {
  const onTick = vi.fn();
  const onExpire = vi.fn();
  const timer = createSleepTimer({ tickMs: 1000, onTick, onExpire });
  return { timer, onTick, onExpire };
}

describe('createSleepTimer', () => {
  it('counts down while running and reports each tick', () => {
    const { timer, onTick } = make();
    timer.arm(5000);
    expect(onTick).toHaveBeenLastCalledWith(5000);
    vi.advanceTimersByTime(2000);
    expect(timer.remaining()).toBe(3000);
    expect(onTick).toHaveBeenLastCalledWith(3000);
  });

  it('pauseTicking freezes the remainder; resume continues it (pauses with playback)', () => {
    const { timer } = make();
    timer.arm(5000);
    vi.advanceTimersByTime(2000); // → 3000
    timer.pauseTicking();
    vi.advanceTimersByTime(10_000); // no effect while paused
    expect(timer.remaining()).toBe(3000);
    timer.resume();
    vi.advanceTimersByTime(1000);
    expect(timer.remaining()).toBe(2000);
  });

  it('expires exactly once, clears the remainder and stops ticking', () => {
    const { timer, onExpire, onTick } = make();
    timer.arm(2000);
    vi.advanceTimersByTime(2000);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(timer.remaining()).toBeNull();
    expect(onTick).toHaveBeenLastCalledWith(null);
    expect(timer.isTicking()).toBe(false);
    vi.advanceTimersByTime(10_000);
    expect(onExpire).toHaveBeenCalledTimes(1); // never fires again
  });

  it('reset swaps the duration and keeps counting while running', () => {
    const { timer } = make();
    timer.arm(5000);
    vi.advanceTimersByTime(2000);
    timer.reset(60_000);
    expect(timer.remaining()).toBe(60_000);
    vi.advanceTimersByTime(1000);
    expect(timer.remaining()).toBe(59_000);
  });

  it('off cancels the countdown entirely', () => {
    const { timer, onExpire } = make();
    timer.arm(3000);
    timer.off();
    expect(timer.remaining()).toBeNull();
    vi.advanceTimersByTime(10_000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('dispose stops ticking on teardown without firing expiry', () => {
    const { timer, onExpire } = make();
    timer.arm(2000);
    timer.dispose();
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
    expect(timer.isTicking()).toBe(false);
  });
});
