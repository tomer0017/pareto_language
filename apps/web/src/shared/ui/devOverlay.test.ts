import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { DEV_BADGE_ANCHOR } from './devOverlay.js';

/**
 * Regression: the dev-only diagnostic badges (AudioDebug / DataDebug) must NEVER cover or intercept
 * the Foundation 🛟 FAB. The guard is a layout invariant — the badges anchor to the bottom-inline-
 * START corner, the FAB to the bottom-inline-END corner, so they sit on opposite sides in both LTR
 * and RTL and can never collide. These checks fail if someone moves a badge back to the end side.
 */
const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

describe('dev overlay never overlaps the Foundation FAB', () => {
  it('the shared badge anchor is on the inline-START side, not the FAB’s inline-END side', () => {
    expect(DEV_BADGE_ANCHOR.insetInlineStart).toBeDefined();
    expect(DEV_BADGE_ANCHOR).not.toHaveProperty('insetInlineEnd');
    expect(DEV_BADGE_ANCHOR.position).toBe('fixed');
  });

  it('the FAB is anchored to the inline-END corner (opposite the badges)', () => {
    const css = read('../../app/styles.css');
    const fab = css.slice(css.indexOf('.foundation-fab {'), css.indexOf('.foundation-fab:active'));
    expect(fab).toContain('inset-inline-end');
    expect(fab).not.toContain('inset-inline-start');
  });

  it('both dev badges use the shared start-anchored constant (no stray end-side literal)', () => {
    for (const f of ['./AudioDebug.tsx', './DataDebug.tsx']) {
      const src = read(f);
      expect(src, `${f} must consume the shared anchor`).toContain('DEV_BADGE_ANCHOR');
      // The collapsed badge (fixed button) must not re-introduce an inline-end anchor.
      expect(src, `${f} must not anchor a fixed badge to inline-end`).not.toMatch(/insetInlineEnd/);
    }
  });
});
