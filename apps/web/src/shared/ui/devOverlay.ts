import type { CSSProperties } from 'react';

/**
 * Developer diagnostics (the AudioDebug / DataDebug badges) are OFF unless a developer asks for them.
 *
 * They are not part of the product, so the default app — including normal local development — renders
 * exactly what a learner sees. They appear only when BOTH hold:
 *   1. the build is a development build (a production build can never render them), and
 *   2. diagnostics were explicitly enabled: open the app with `?debug=1` (remembered for the browser
 *      until `?debug=0`).
 */
const DEBUG_KEY = 'ready.debug';

export interface DebugEnv {
  /** `import.meta.env.DEV` */
  dev: boolean;
  /** `location.search` */
  search: string;
  /** The remembered flag (`localStorage['ready.debug']`), if any. */
  stored: string | null;
}

/** Pure decision: should the diagnostics render? Never in production; in dev only on request. */
export function debugOverlayEnabled(env: DebugEnv): boolean {
  if (!env.dev) return false;
  const param = new URLSearchParams(env.search).get('debug');
  if (param === '1') return true;
  if (param === '0') return false;
  return env.stored === '1';
}

/** Read (and remember / forget) the developer's choice for this browser. Dev builds only. */
export function resolveDebugOverlay(dev: boolean): boolean {
  if (!dev || typeof window === 'undefined') return false;
  try {
    const param = new URLSearchParams(window.location.search).get('debug');
    if (param === '1') localStorage.setItem(DEBUG_KEY, '1');
    if (param === '0') localStorage.removeItem(DEBUG_KEY);
    return debugOverlayEnabled({ dev, search: window.location.search, stored: localStorage.getItem(DEBUG_KEY) });
  } catch {
    return false;
  }
}

/** Shared anchor for the diagnostic badges: the bottom-inline-start corner, above the content. */
export const DEV_BADGE_ANCHOR = {
  position: 'fixed',
  insetInlineStart: 12,
  zIndex: 90,
  minHeight: 0,
} as const satisfies CSSProperties;
