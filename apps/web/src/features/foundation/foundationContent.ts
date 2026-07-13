import { localize } from '@ready/content-schema';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { resolveLearningItem, type LearningDisplayModel } from '../../shared/i18n/display.js';
import type { BootcampDayContent } from '../bootcamp/types.js';
import { BOOTCAMP_PLAN, missionNumber } from '../bootcamp/plan.js';
import { FOUNDATION_TAXONOMY, type FoundationCategory } from './taxonomy.js';

/**
 * Foundation model — PURE (no React, no store, no I/O). Turns the Core Corpus (per-language pack
 * words) + the taxonomy + the active language's Bootcamp missions into the exact view the sheet
 * renders. Everything is DERIVED: category membership from the taxonomy selectors, frequency from
 * the corpus rank/tier, "related missions" from scanning real mission text. So the surface scales
 * from hundreds to thousands of words with zero UI/architecture change, and works for any language
 * whose pack + missions exist (en, fr today).
 */

/** A mission this word actually appears in (derived), for the word page's "Appears in" chips. */
export interface RelatedMission {
  day: number;
  /** Learner-facing mission number (null for special/unnumbered missions). */
  number: number | null;
  /** Mission title, resolved to the app language. */
  title: string;
}

/** The Foundation category a word belongs to (icon + i18n title), or null for a non-Foundation Core word. */
export type FoundationWordCategory = { id: string; icon: string; titleKey: FoundationCategory['titleKey'] } | null;

/** One Foundation word, fully resolved for display. */
export interface FoundationWord {
  /** Language-independent concept id (`concept.word.*`) — the identity used for progress/viewed. */
  conceptId: string;
  /** Canonical display model (target word + app-gloss + audio locale + directions + id). */
  display: LearningDisplayModel;
  /** 1–5 "essential-ness", derived from the corpus rank/tier (5 = Essential). */
  stars: number;
  /** Example sentence, resolved to the app language (undefined when the corpus has none). */
  example?: string;
  /** Missions that use this word (derived from real mission text). */
  relatedMissions: RelatedMission[];
  /** The Foundation category this word belongs to, or null when it is a Core word outside the
   *  Foundation taxonomy (still openable via Universal Tap). */
  category: FoundationWordCategory;
  /** The raw Core Corpus category (always present) — the word page's fallback label for a word that
   *  is tapped from a sentence but sits outside the ten Foundation categories. */
  corpusCategory: string;
}

/** One Foundation category with its resolved words (only non-empty categories are returned). */
export interface FoundationCategoryModel {
  id: string;
  icon: string;
  titleKey: FoundationCategory['titleKey'];
  words: FoundationWord[];
}

/**
 * Does a corpus word belong to a Foundation category? Selection is on the language-INDEPENDENT
 * fields (`category`, `pos`, `conceptId`) so the same taxonomy works for every language pack.
 */
export function matchesCategory(word: CoreWord, cat: FoundationCategory): boolean {
  if (cat.excludeConceptIds?.includes(word.conceptId)) return false;
  const byCategory = cat.corpusCategories?.includes(word.category) ?? false;
  const byConcept = cat.conceptIds?.includes(word.conceptId) ?? false;
  if (!byCategory && !byConcept) return false;
  if (cat.pos && cat.pos.length > 0 && !cat.pos.includes(word.pos)) return false;
  return true;
}

/**
 * 1–5 frequency stars from the corpus ranking. Tier 0 (the survival core) is always Essential (5);
 * lower tiers degrade by global rank. Pure and deterministic (pinned by tests).
 */
export function frequencyStars(word: Pick<CoreWord, 'tier' | 'rank'>): number {
  if (word.tier === 0) return 5;
  if (word.rank <= 150) return 4;
  if (word.rank <= 300) return 3;
  if (word.rank <= 430) return 2;
  return 1;
}

/** Unicode-aware whole-word matcher: matches `word` as a standalone token, case-insensitively. */
function wordMatcher(word: string): RegExp {
  const escaped = word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu');
}

/** All searchable learning-language text for a mission (spoken lines + trained items). */
function missionText(day: BootcampDayContent): string {
  const parts: string[] = [];
  for (const item of day.items) parts.push(item.text);
  for (const dlg of Object.values(day.dialogues)) {
    for (const node of dlg.nodes) {
      parts.push(node.en); // `en` holds the LEARNING-language spoken line (see types.ts)
      for (const c of node.choices ?? []) parts.push(c.en);
    }
  }
  return parts.join(' • ');
}

/** Precomputed { day → searchable text } index for the active language's missions. */
export function buildMissionIndex(missions: Record<number, BootcampDayContent>): { day: number; text: string }[] {
  return Object.values(missions)
    .map((d) => ({ day: d.day, text: missionText(d) }))
    .sort((a, b) => a.day - b.day);
}

/** Missions whose real text contains this target word (derived), capped and resolved for display. */
export function relatedMissions(
  targetWord: string,
  index: { day: number; text: string }[],
  appLang: string,
  cap = 6,
): RelatedMission[] {
  const re = wordMatcher(targetWord);
  const out: RelatedMission[] = [];
  for (const entry of index) {
    if (out.length >= cap) break;
    if (!re.test(entry.text)) continue;
    const plan = BOOTCAMP_PLAN.find((m) => m.day === entry.day);
    out.push({
      day: entry.day,
      number: missionNumber(entry.day),
      title: plan ? localize(plan.title, appLang) : `#${entry.day}`,
    });
  }
  return out;
}

/** The Foundation category a Core word belongs to (the first match in declared order), or null. */
export function foundationCategoryOf(word: CoreWord): FoundationCategory | null {
  const ordered = [...FOUNDATION_TAXONOMY].sort((a, b) => a.order - b.order);
  return ordered.find((c) => matchesCategory(word, c)) ?? null;
}

/** Is this Core word one of the Foundation building blocks (in some Foundation category)? */
export function isFoundationWord(word: CoreWord): boolean {
  return foundationCategoryOf(word) !== null;
}

/**
 * Resolve ONE Core word into the full display model the word page renders — the single builder
 * reused by both `buildFoundation` (category browse) and Universal Tap (open any tapped word). A
 * word outside the Foundation taxonomy still resolves (its `category` is null) so any Core Corpus
 * word can be tapped, not just the ten Foundation categories.
 */
export function buildWord(
  word: CoreWord,
  missions: Record<number, BootcampDayContent>,
  appLang: string,
  learningLang: string,
): FoundationWord {
  return buildWordWithIndex(word, buildMissionIndex(missions), appLang, learningLang);
}

function buildWordWithIndex(
  word: CoreWord,
  index: { day: number; text: string }[],
  appLang: string,
  learningLang: string,
): FoundationWord {
  const cat = foundationCategoryOf(word);
  return {
    conceptId: word.conceptId,
    display: resolveLearningItem({ id: word.id, target: word.word, meaning: word.meaning, emoji: word.emoji }, appLang, learningLang),
    stars: frequencyStars(word),
    example: word.example ? localize(word.example, appLang) : undefined,
    relatedMissions: relatedMissions(word.word, index, appLang),
    category: cat ? { id: cat.id, icon: cat.icon, titleKey: cat.titleKey } : null,
    corpusCategory: word.category,
  };
}

/**
 * Build the full Foundation model for a language pair. `words` come from
 * `loadCoreWords(learningLang)`, `missions` from `missionsFor(learningLang)`. Categories keep their
 * declared order; empty categories are dropped so the sheet never shows a dead card.
 */
export function buildFoundation(
  words: CoreWord[],
  missions: Record<number, BootcampDayContent>,
  appLang: string,
  learningLang: string,
): FoundationCategoryModel[] {
  const index = buildMissionIndex(missions);
  const categories = [...FOUNDATION_TAXONOMY].sort((a, b) => a.order - b.order);
  const models: FoundationCategoryModel[] = [];
  for (const cat of categories) {
    const catWords = words
      .filter((w) => matchesCategory(w, cat))
      .map<FoundationWord>((w) => buildWordWithIndex(w, index, appLang, learningLang));
    if (catWords.length > 0) {
      models.push({ id: cat.id, icon: cat.icon, titleKey: cat.titleKey, words: catWords });
    }
  }
  return models;
}
