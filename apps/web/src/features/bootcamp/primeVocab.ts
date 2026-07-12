import { BOOTCAMP_PLAN } from './plan.js';
import { missionsFor } from './registry.js';
import type { PrimeWord } from './types.js';

/**
 * Prior-knowledge tracking for mission priming (Part 3). Lets later missions mark a word as a QUICK
 * REVIEW (`review: true`) instead of re-teaching it as brand-new — and lets tests PROVE the flags are
 * honest (a review word really did appear earlier; a "new" word really is new). Pure + language-aware.
 */

/** Normalized key for a prime word: lowercased first token (so "no / without" ≈ "no", "s’il vous
 *  plaît" ≈ "s’il"). Deliberately coarse — it tracks the pedagogical unit, not exact orthography. */
export function primeKey(w: PrimeWord | string): string {
  const text = typeof w === 'string' ? w : w.text;
  return text.toLowerCase().split(/[\s/]+/).filter(Boolean)[0] ?? text.toLowerCase();
}

/** The set of prime-word keys INTRODUCED as new (not review) in missions strictly before `day`,
 *  walked in plan (ascending day) order for the given learning language. */
export function priorPrimeVocabulary(lang: string, day: number): Set<string> {
  const missions = missionsFor(lang);
  const seen = new Set<string>();
  for (const plan of BOOTCAMP_PLAN) {
    if (plan.day >= day) break;
    const d = missions[plan.day];
    if (!d) continue;
    for (const step of d.steps) {
      if (step.kind !== 'prime') continue;
      for (const w of step.words) if (!w.review) seen.add(primeKey(w));
    }
  }
  return seen;
}
