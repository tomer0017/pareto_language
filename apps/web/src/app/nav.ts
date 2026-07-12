import type { View } from '../shared/stores/appStore.js';

// The permanent English-pilot tabs. The bottom nav is shown on these — except inside a focused
// full-screen flow (an active Bootcamp mission, or an active Core learning-game session).
export const PILOT_TABS: View[] = ['home', 'bootcamp', 'core', 'profile'];

/**
 * Whether to show the permanent bottom nav. Pure + React-free so it is unit-testable (nav.test.ts).
 *
 * The nav is fixed at `bottom:0; z-index:20`. Focused flows render their primary control in a fixed
 * `.action-zone` at `bottom:0; z-index:15` — LOWER than the nav — so wherever both are visible the
 * nav physically covers that control. Bootcamp missions already hide the nav; a Core learning-game
 * session must too, otherwise the Picture Quiz "Continue" button sits behind the nav and the game
 * looks stuck on the feedback screen (the Part-F bug). Hidden ⇔ a focused flow is live.
 */
export function shouldShowNav(view: View, inMission: boolean, coreGameActive: boolean): boolean {
  return PILOT_TABS.includes(view) && !(view === 'bootcamp' && inMission) && !coreGameActive;
}
