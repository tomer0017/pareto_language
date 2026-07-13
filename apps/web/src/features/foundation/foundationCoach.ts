/**
 * One-time coach-mark bookkeeping for Foundation onboarding + the tappable-word tooltip.
 * Persisted to localStorage so each hint is shown exactly once. Onboarding is per learning language
 * (each new trip language re-introduces its Foundation surface); the tap tooltip is global.
 */
const ONBOARD_KEY = (lang: string) => `ready.foundation.onboarded.${lang}`;
const TAPHINT_KEY = 'ready.foundation.taphint';

function read(key: string): boolean {
  try { return localStorage.getItem(key) === '1'; } catch { return true; /* storage disabled → never nag */ }
}
function write(key: string): void {
  try { localStorage.setItem(key, '1'); } catch { /* non-fatal */ }
}

export function hasOnboardedFoundation(lang: string): boolean { return read(ONBOARD_KEY(lang)); }
export function markOnboardedFoundation(lang: string): void { write(ONBOARD_KEY(lang)); }

// The tap tooltip may only be claimed by ONE tappable word per page; a module flag guards the race
// between the many `TappableText` instances that mount together (a phrase list, a dialogue, …).
let tapHintClaimed = false;
export function canShowTapHint(): boolean { return !tapHintClaimed && !read(TAPHINT_KEY); }
export function claimTapHint(): void { tapHintClaimed = true; write(TAPHINT_KEY); }
