import type { PlaybackItem } from '../../shared/playback/index.js';
import type { QuizQuestion, QuizResponse, ReadingCollection, ReadingLang, Story } from './types.js';
import { READING_LANGS } from './types.js';

/**
 * Reading — PURE, framework-free core (unit-tested without a DOM). Everything here is a deterministic
 * transform of story data: estimated time, playback items, quiz scoring, and language-parity checks.
 * Nothing renders; nothing touches storage. Adding a collection reuses all of it unchanged.
 */

/** Words in a target string (whitespace-split; good enough for a beginner reading-time estimate). */
function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Estimated reading minutes for a story in one target language — a slow beginner pace (~70 wpm),
 * floored at 1 minute so nothing shows "0 min".
 */
export function readingTimeMin(story: Story, lang: ReadingLang): number {
  const words = story.sentences.reduce((n, sen) => n + wordCount(sen.target[lang]), 0);
  return Math.max(1, Math.round(words / 70));
}

/**
 * Build the shared-playback item list for a story in the active learning + app language. One item per
 * sentence: target (learning language) + translation (app language). Stable ids = the sentence index,
 * so the engine's per-surface bookmark and resume-by-id work exactly as on every other surface.
 */
export function buildStoryItems(story: Story, learningLang: ReadingLang, appLang: string): PlaybackItem[] {
  return story.sentences.map((sen, i) => {
    const tr = sen.tr as Record<string, string>;
    return {
      id: String(i),
      target: sen.target[learningLang],
      targetLang: learningLang,
      translation: tr[appLang] ?? tr.en ?? '',
      translationLang: appLang,
    };
  });
}

export interface QuizScore {
  correct: number;
  total: number;
  /** 0–100, rounded. */
  pct: number;
  passed: boolean;
}

/** Is one response correct for its question? */
export function isCorrect(question: QuizQuestion, response: QuizResponse): boolean {
  switch (question.kind) {
    case 'mc':
      return response === question.answer;
    case 'tf':
      return response === question.answer;
    case 'order':
      return Array.isArray(response)
        && response.length === question.correct.length
        && response.every((v, i) => v === question.correct[i]);
  }
}

/** Score a whole quiz. `responses` aligns by index with `quiz`; missing/`null` answers count wrong. */
export function scoreQuiz(quiz: QuizQuestion[], responses: QuizResponse[]): QuizScore {
  const total = quiz.length;
  const correct = quiz.reduce((n, q, i) => n + (isCorrect(q, responses[i] ?? null) ? 1 : 0), 0);
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, pct, passed: pct >= 60 };
}

/**
 * Language-parity issues for one story: every sentence + the title must carry a non-empty realization
 * in EVERY learning language (en/fr/es) and a non-empty en & he meaning. Empty string = a gap.
 */
export function storyParityIssues(story: Story): string[] {
  const problems: string[] = [];
  const checkTargets = (targets: Record<ReadingLang, string>, where: string): void => {
    for (const lang of READING_LANGS) {
      if (!targets[lang]?.trim()) problems.push(`${where}: missing ${lang} target`);
    }
  };
  const checkTr = (tr: { en?: string; he?: string }, where: string): void => {
    if (!tr.en?.trim()) problems.push(`${where}: missing en meaning`);
    if (!tr.he?.trim()) problems.push(`${where}: missing he meaning`);
  };
  checkTargets(story.title.target, `${story.id} title`);
  checkTr(story.title.tr, `${story.id} title`);
  story.sentences.forEach((sen, i) => {
    checkTargets(sen.target, `${story.id} sentence ${i}`);
    checkTr(sen.tr, `${story.id} sentence ${i}`);
  });
  if (story.quiz.length < 3) problems.push(`${story.id}: quiz has ${story.quiz.length} questions (min 3)`);
  return problems;
}

export interface CollectionParity {
  collectionId: string;
  total: number;
  ok: number;
  issues: Record<string, string[]>;
  complete: boolean;
}

/** Parity for a whole collection — every story must be complete in en/fr/es. */
export function collectionParity(collection: ReadingCollection): CollectionParity {
  const issues: Record<string, string[]> = {};
  for (const story of collection.stories) {
    const p = storyParityIssues(story);
    if (p.length) issues[story.id] = p;
  }
  const bad = Object.keys(issues).length;
  return {
    collectionId: collection.id,
    total: collection.stories.length,
    ok: collection.stories.length - bad,
    issues,
    complete: bad === 0,
  };
}
