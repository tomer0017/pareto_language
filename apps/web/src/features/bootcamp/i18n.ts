import type { LocalizedText } from '@ready/content-schema';
import { L } from '../../shared/i18n/strings.js';
import type { DialogueChoice, DialogueNodeB } from './types.js';

/**
 * Language-agnostic dialogue resolution (the seam that makes the Bootcamp content-only per language).
 *
 * A dialogue line has two parts: the SPOKEN line in the learning language (`en` field — English in
 * the en pilot, French in a fr mission) and its TRANSLATION in the learner's app language. Non-
 * English missions carry the translation in `tr` ({en,he,…}); English missions omit it, so we fall
 * back to {en: line, he: legacy he} — which is exactly correct for an English mission (the English
 * gloss of an English line is the line itself). `L()` then picks the active app language.
 */

type Translatable = Pick<DialogueNodeB | DialogueChoice, 'en' | 'he' | 'tr'>;

/** The learner-language translation of a dialogue line, in the active app language. */
export function dialogueTr(line: Translatable): string {
  return L(line.tr ?? ({ en: line.en, he: line.he } as LocalizedText));
}
