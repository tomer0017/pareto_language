import { describe, expect, it } from 'vitest';
import { shouldShowNav, shouldShowFoundationFab } from './nav.js';

/**
 * Part-F regression — the Picture Quiz "stuck on feedback" bug.
 *
 * Root cause: the feedback's fixed `.action-zone` (Continue, z-index 15) was covered by the
 * permanent bottom nav (z-index 20), which stays visible on the Core tab. The advance control was
 * physically unreachable, so the game looked frozen on the feedback screen. The fix hides the nav
 * while a Core learning-game session is active — the same focused-flow rule Bootcamp missions use.
 *
 * These cases fail against the pre-fix logic (which ignored an active game session) and pass now.
 */
describe('shouldShowNav (Part F — game feedback must be reachable)', () => {
  it('hides the nav during an active Core game session so Continue is not occluded', () => {
    expect(shouldShowNav('core', false, true)).toBe(false);
  });

  it('shows the nav on the Core menu (no active game)', () => {
    expect(shouldShowNav('core', false, false)).toBe(true);
  });

  it('still shows the nav on the other pilot tabs', () => {
    expect(shouldShowNav('home', false, false)).toBe(true);
    expect(shouldShowNav('bootcamp', false, false)).toBe(true);
    expect(shouldShowNav('profile', false, false)).toBe(true);
  });

  it('keeps hiding the nav inside an active Bootcamp mission (unchanged behavior)', () => {
    expect(shouldShowNav('bootcamp', true, false)).toBe(false);
  });

  it('never shows the nav on non-tab views', () => {
    expect(shouldShowNav('session', false, false)).toBe(false);
    expect(shouldShowNav('onboarding', false, false)).toBe(false);
  });
});

describe('shouldShowFoundationFab (🛟 lives on the Bootcamp map, not inside a mission)', () => {
  it('shows on the Bootcamp map', () => {
    expect(shouldShowFoundationFab('bootcamp', false)).toBe(true);
  });
  it('hides inside an active mission (focused full-screen flow)', () => {
    expect(shouldShowFoundationFab('bootcamp', true)).toBe(false);
  });
  it('is Bootcamp-only — not on the other tabs', () => {
    expect(shouldShowFoundationFab('home', false)).toBe(false);
    expect(shouldShowFoundationFab('core', false)).toBe(false);
    expect(shouldShowFoundationFab('profile', false)).toBe(false);
  });
});
