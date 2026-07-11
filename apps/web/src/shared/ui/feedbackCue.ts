import { successChime, errorBuzz } from '../audio/sfx.js';
import { success as hapticSuccess, error as hapticError } from './haptics.js';

/**
 * ONE reusable feedback system for the whole app (Pareto UX sprint). Every drill, dialogue pick,
 * game and quiz calls the same two functions so success/failure always feels identical:
 *   correct → pleasant chime + light haptic (pair with the .fx-correct card motion + green glow)
 *   wrong   → soft error tone + stronger haptic (pair with the .fx-wrong shake + red flash)
 * The visual burst is <Feedback> in Feedback.tsx; the card motion/glow is in styles.css.
 */
export function feedbackCorrect(): void {
  hapticSuccess();
  successChime();
}

export function feedbackWrong(): void {
  hapticError();
  errorBuzz();
}

/** Convenience: fire the right cue from a boolean. */
export function feedback(ok: boolean): void {
  if (ok) feedbackCorrect();
  else feedbackWrong();
}
