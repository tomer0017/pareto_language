import type { CSSProperties } from 'react';

/**
 * Shared anchor for the dev-only diagnostic badges (AudioDebug / DataDebug).
 *
 * They live in the bottom-**inline-start** corner so they can NEVER cover or intercept the
 * Foundation 🛟 FAB, which is anchored bottom-**inline-end** (`.foundation-fab` in styles.css).
 * Opposite inline sides means the two never collide in either LTR or RTL — in RTL both flip
 * together, so they stay on opposite corners. Dev-only; no effect on production (these badges
 * render only under `import.meta.env.DEV`). Keep `insetInlineStart` here and `inset-inline-end`
 * on the FAB — the invariant is locked by `devOverlay.test.ts`.
 */
export const DEV_BADGE_ANCHOR = {
  position: 'fixed',
  insetInlineStart: 12,
  zIndex: 90,
  minHeight: 0,
} as const satisfies CSSProperties;
