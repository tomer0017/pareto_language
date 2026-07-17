/**
 * Screen Wake Lock — keep the screen awake while Parrot Mode plays (passive listening: walking,
 * driving, before sleep). Fully guarded: unsupported browsers (Safari < 16.4, SSR/test) are a silent
 * no-op, never a crash. Only one playback runs at a time, so a single module-level sentinel is enough.
 *
 * The OS auto-releases a wake lock when the tab is backgrounded; the engine re-acquires on return to
 * visibility while still playing (see useParrotPlayback), so this stays a thin, dumb wrapper.
 */

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  addEventListener?: (type: 'release', cb: () => void) => void;
}
interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

function wakeLockApi(): WakeLockLike | null {
  if (typeof navigator === 'undefined') return null;
  const wl = (navigator as unknown as { wakeLock?: WakeLockLike }).wakeLock;
  return wl ?? null;
}

let sentinel: WakeLockSentinelLike | null = null;
let requesting = false;

/** Acquire the screen wake lock (idempotent). Safe to call repeatedly; never throws. */
export async function acquireWakeLock(): Promise<void> {
  const api = wakeLockApi();
  if (!api || sentinel || requesting) return;
  requesting = true;
  try {
    const s = await api.request('screen');
    sentinel = s;
    // The system can release it on its own (backgrounding); reflect that so a later acquire re-requests.
    s.addEventListener?.('release', () => { if (sentinel === s) sentinel = null; });
  } catch {
    sentinel = null; // permission denied / not visible — playback continues without the lock
  } finally {
    requesting = false;
  }
}

/** Release the wake lock if held. Never throws. */
export function releaseWakeLock(): void {
  const s = sentinel;
  sentinel = null;
  try {
    void s?.release();
  } catch {
    /* already released */
  }
}
