import type { View } from '../shared/stores/appStore.js';

/**
 * READY's navigation model — ONE source of truth, pure and React-free (nav.test.ts). The same four
 * destinations render as a bottom bar on phones/tablets and as a side rail on desktop; only the
 * presentation differs (see `AppNav` + styles), never the model.
 *
 *   Home    — what to do next (the coach), and the door to Free learning (every self-directed tool)
 *   Learn   — the real-world missions (active learning); internally the `bootcamp` view
 *   Listen  — passive listening over the same content
 *   Profile — language, voice, appearance
 */
export const PRIMARY_TABS: View[] = ['home', 'bootcamp', 'listen', 'profile'];

/** Secondary screens belong to a primary destination — it stays highlighted while they are open. */
const PARENT_TAB: Partial<Record<View, View>> = {
  readiness: 'home',
  free: 'home',
  review: 'home',
  core: 'bootcamp',
  zerostart: 'bootcamp',
  companion: 'bootcamp',
  reading: 'listen',
  videos: 'listen',
  languages: 'profile',
};

/** The primary destination a view belongs to (itself for a tab), or null outside the app shell. */
export function navTabOf(view: View): View | null {
  if (PRIMARY_TABS.includes(view)) return view;
  return PARENT_TAB[view] ?? null;
}

/** Views that keep the bottom bar on small screens: the four tabs plus the two browse-only
 *  secondary screens. Everything else is a focused flow with its own back control. */
const BAR_VIEWS: View[] = [...PRIMARY_TABS, 'core', 'readiness', 'companion', 'free'];

/**
 * Whether the BOTTOM BAR (phone/tablet presentation) is shown.
 *
 * The bar is fixed at the bottom above focused flows' fixed `.action-zone`, so wherever both are
 * visible the bar physically covers that primary control. An active mission and an active Core
 * learning-game session therefore hide it (the Part-F bug). Hidden ⇔ a focused flow is live.
 */
export function shouldShowNav(view: View, inMission: boolean, coreGameActive: boolean): boolean {
  return BAR_VIEWS.includes(view) && !(view === 'bootcamp' && inMission) && !coreGameActive;
}

/**
 * Whether the app shell (and with it the DESKTOP rail) exists at all. The rail sits beside the
 * content, never over it, so it stays put through focused flows as a calm way out. Only the
 * first-run welcome has no shell.
 */
export function hasAppShell(view: View): boolean {
  return view !== 'onboarding';
}
