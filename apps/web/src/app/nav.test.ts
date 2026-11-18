import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PRIMARY_TABS, hasAppShell, navTabOf, shouldShowNav } from './nav.js';
import * as navModule from './nav.js';

/**
 * READY's navigation model: four primary destinations, one source of truth for both presentations
 * (bottom bar on phones/tablets, side rail on desktop).
 */
describe('primary navigation — Home · Situations · Listen · Profile', () => {
  it('has exactly the four destinations, in order (Situations is the `bootcamp` view)', () => {
    expect(PRIMARY_TABS).toEqual(['home', 'bootcamp', 'listen', 'profile']);
  });

  it('Core is no longer a destination of its own', () => {
    expect(PRIMARY_TABS).not.toContain('core');
  });

  it('every secondary screen belongs to one destination, which stays highlighted', () => {
    expect(navTabOf('home')).toBe('home');
    expect(navTabOf('readiness')).toBe('home');
    expect(navTabOf('review')).toBe('home');
    // Home's four ways in: Basic words, Games & stories and the fundamentals behind them stay under Home.
    expect(navTabOf('basics')).toBe('home');
    expect(navTabOf('free')).toBe('home');
    expect(navTabOf('core')).toBe('home');
    expect(navTabOf('zerostart')).toBe('home');
    expect(navTabOf('bootcamp')).toBe('bootcamp');
    expect(navTabOf('companion')).toBe('bootcamp');
    expect(navTabOf('listen')).toBe('listen');
    expect(navTabOf('reading')).toBe('listen');
    expect(navTabOf('videos')).toBe('listen');
    expect(navTabOf('profile')).toBe('profile');
    expect(navTabOf('languages')).toBe('profile');
    expect(navTabOf('onboarding')).toBeNull();
  });

  it('the app shell (and the desktop rail) exists everywhere except the first-run welcome', () => {
    expect(hasAppShell('onboarding')).toBe(false);
    for (const view of [...PRIMARY_TABS, 'basics', 'core', 'reading', 'readiness', 'languages'] as const) expect(hasAppShell(view)).toBe(true);
  });
});

/**
 * Part-F regression — the Picture Quiz "stuck on feedback" bug.
 *
 * Root cause: the feedback's fixed `.action-zone` (Continue, z-index 15) was covered by the bottom
 * bar (z-index 20). The advance control was physically unreachable, so the game looked frozen. The
 * fix hides the bar while a focused flow is live — an active mission or a Core game session.
 */
describe('shouldShowNav — the bottom bar never covers a focused flow', () => {
  it('shows the bar on all four destinations', () => {
    for (const tab of PRIMARY_TABS) expect(shouldShowNav(tab, false, false)).toBe(true);
  });

  it('hides the bar during an active Core game session so Continue is not occluded', () => {
    expect(shouldShowNav('core', false, true)).toBe(false);
  });

  it('shows the bar on the browse screens: the library (no active game), Basic words, Games & stories', () => {
    expect(shouldShowNav('core', false, false)).toBe(true);
    expect(shouldShowNav('readiness', false, false)).toBe(true);
    expect(shouldShowNav('basics', false, false)).toBe(true);
    expect(shouldShowNav('free', false, false)).toBe(true);
  });

  it('hides the bar inside an active mission', () => {
    expect(shouldShowNav('bootcamp', true, false)).toBe(false);
  });

  it('never shows the bar on focused secondary flows or outside the shell', () => {
    for (const view of ['session', 'onboarding', 'reading', 'videos', 'zerostart', 'review', 'languages'] as const) {
      expect(shouldShowNav(view, false, false)).toBe(false);
    }
  });
});

describe('primary navigation stays at four destinations', () => {
  it('has no fifth tab — Stories and the videos live inside Listen, the fundamentals under Basic words', () => {
    expect(PRIMARY_TABS).toHaveLength(4);
    for (const view of ['reading', 'videos', 'core', 'zerostart', 'readiness', 'review', 'basics', 'free'] as const) {
      expect(PRIMARY_TABS).not.toContain(view);
    }
    expect(navTabOf('reading')).toBe('listen');
  });
});

describe('the Foundation building blocks: never floating, never in front of the situations', () => {
  const read = (p: string): string => readFileSync(new URL(p, import.meta.url), 'utf8');

  it('there is no floating-button rule in the navigation model or the app shell', () => {
    expect(navModule).not.toHaveProperty('shouldShowFoundationFab');
    expect(read('./App.tsx')).not.toMatch(/FoundationFab/);
  });

  it('no fixed-position Foundation control exists in the styles', () => {
    expect(read('./styles.css')).not.toMatch(/foundation-fab/);
  });

  it('Foundation is ONE ordinary card under Basic words — and the Situations screen has no Foundations entry at all', () => {
    const basics = read('../features/basics/BasicWords.tsx');
    expect(basics.match(/openFoundation\(\)/g)).toHaveLength(1); // exactly one Basic words entry
    expect(basics).toContain("t('foundationEntryTitle')");
    const learn = read('../features/bootcamp/Learn.tsx');
    expect(learn).not.toMatch(/openFoundation|foundationEntryTitle|PHASES|morePractice/); // the list is the situations, only
  });
});
