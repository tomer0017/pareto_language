import { describe, it, expect, vi, afterEach } from 'vitest';
import { acquireWakeLock, releaseWakeLock } from './wakeLock.js';

afterEach(() => {
  releaseWakeLock();
  vi.unstubAllGlobals();
});

function mockWakeLock() {
  const release = vi.fn().mockResolvedValue(undefined);
  let releaseCb: (() => void) | undefined;
  const sentinel = { release, addEventListener: (_t: 'release', cb: () => void) => { releaseCb = cb; } };
  const request = vi.fn().mockResolvedValue(sentinel);
  vi.stubGlobal('navigator', { wakeLock: { request } });
  return { request, release, fireSystemRelease: () => releaseCb?.() };
}

describe('wakeLock', () => {
  it('unsupported browser: never throws, no-ops', async () => {
    vi.stubGlobal('navigator', {}); // no wakeLock member
    await expect(acquireWakeLock()).resolves.toBeUndefined();
    expect(() => releaseWakeLock()).not.toThrow();
  });

  it('acquires once (idempotent) and releases', async () => {
    const { request, release } = mockWakeLock();
    await acquireWakeLock();
    await acquireWakeLock(); // idempotent while held
    expect(request).toHaveBeenCalledTimes(1);
    releaseWakeLock();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('re-requests after a release (resume lifecycle)', async () => {
    const { request } = mockWakeLock();
    await acquireWakeLock();
    releaseWakeLock();
    await acquireWakeLock();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('a system auto-release (tab hidden) lets the next acquire re-request', async () => {
    const { request, fireSystemRelease } = mockWakeLock();
    await acquireWakeLock();
    fireSystemRelease(); // OS released it when the tab was backgrounded
    await acquireWakeLock(); // visibility recovery
    expect(request).toHaveBeenCalledTimes(2);
  });
});
