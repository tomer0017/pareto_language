import type { AnswerContext } from './AnswerFeedback.js';

/**
 * Pure builders for the reusable answer-feedback context (Part C3). Kept side-effect-free and
 * React-free so every exercise builds the SAME learning hierarchy and the shape is unit-testable
 * without a DOM. Callers attach the audio callbacks; these functions only assemble the data.
 */

/** Comprehension drills (hear a line → pick its meaning): prompt = what you heard; expected = its meaning. */
export function buildComprehensionContext(a: {
  heard: string;
  onReplayHeard?: () => void;
  chosen?: string;
  meaning: string;
  why: string;
  shouldLabel: string;
}): AnswerContext {
  return {
    prompt: { text: a.heard, onReplay: a.onReplayHeard },
    selected: a.chosen ? { text: a.chosen } : undefined,
    expected: { text: a.meaning },
    why: a.why,
    labels: { should: a.shouldLabel },
  };
}

/** Respond-to-prompt drills (ambush / dialogue / picture): what you heard → your pick → what fit. */
export function buildRespondContext(a: {
  promptText?: string;
  promptTranslation?: string;
  onReplayPrompt?: () => void;
  chosen?: string;
  chosenTranslation?: string;
  expectedText: string;
  expectedTranslation?: string;
  onReplayExpected?: () => void;
  why: string;
  labels?: { heard?: string; your?: string; should?: string };
}): AnswerContext {
  return {
    prompt: a.promptText ? { text: a.promptText, translation: a.promptTranslation, onReplay: a.onReplayPrompt } : undefined,
    selected: a.chosen ? { text: a.chosen, translation: a.chosenTranslation } : undefined,
    expected: { text: a.expectedText, translation: a.expectedTranslation, onReplay: a.onReplayExpected },
    why: a.why,
    ...(a.labels ? { labels: a.labels } : {}),
  };
}
