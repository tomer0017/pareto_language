import { FRENCH_EXAMPLES } from './frenchExamples.js';

/**
 * Registry of authored Foundation example sentences, per learning language, keyed by the
 * language-INDEPENDENT concept id. This is the seam that keeps example content language-agnostic:
 * the product reads `authoredExample(conceptId, lang)` with NO per-language branch, and adding a new
 * language's examples is CONTENT ONLY — author `<lang>Examples.ts` and register its map here (the
 * same pattern as `MISSIONS_BY_LANG` for missions). English needs no entry: it already ships native
 * examples in the Core Corpus. Any language without a map falls back honestly (never English-as-target).
 */
const EXAMPLES_BY_LANG: Record<string, Record<string, string>> = {
  fr: FRENCH_EXAMPLES,
};

/** The authored target-language example for a concept, or undefined (→ honest app-language fallback). */
export function authoredExample(conceptId: string, learningLang: string): string | undefined {
  return EXAMPLES_BY_LANG[learningLang]?.[conceptId];
}

/** Concept ids with an authored example in a language (drives the per-language coverage validator). */
export function authoredExampleIds(learningLang: string): string[] {
  return Object.keys(EXAMPLES_BY_LANG[learningLang] ?? {});
}

/** Learning languages that ship authored Foundation examples (registry-driven; validated per language). */
export const EXAMPLE_LANGS: string[] = Object.keys(EXAMPLES_BY_LANG);
