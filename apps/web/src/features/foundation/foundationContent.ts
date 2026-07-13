import { localize, type LocalizedText } from '@ready/content-schema';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { resolveLearningItem, type LearningDisplayModel } from '../../shared/i18n/display.js';
import { languageTtsTag } from '../../shared/i18n/languages.js';
import type { BootcampDayContent } from '../bootcamp/types.js';
import { BOOTCAMP_PLAN, missionNumber } from '../bootcamp/plan.js';
import { FOUNDATION_TAXONOMY, type FoundationCategory } from './taxonomy.js';
import { buildCorpusIndex, segmentText, type CorpusIndex } from './corpusIndex.js';
import { authoredExample } from './frenchExamples.js';

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

/**
 * An example sentence. The corpus stores examples per CONCEPT in en+he only (no per-language
 * realization), so a `target` (learning-language) line + audio is shown ONLY when the learning
 * language genuinely has that sentence (English today). For a language without an example
 * realization (e.g. French) we NEVER show the English sentence dressed up as the target — we show
 * the example in the learner's own app language as a meaning hint (no wrong-voice audio). This keeps
 * French honest until real French examples are authored in the corpus (see the audit).
 */
export interface FoundationExample {
  /** The sentence in the learning language (spoken) — present only when a realization exists. */
  target?: string;
  /** TTS locale for the target line (present with `target`). */
  targetLang?: string;
  /** The sentence in the app language — the meaning hint (omitted only when it repeats the target). */
  gloss?: string;
}

/** One Foundation word, fully resolved for display. */
export interface FoundationWord {
  /** Language-independent concept id (`concept.word.*`) — the identity used for progress/viewed. */
  conceptId: string;
  /** Canonical display model (target word + app-gloss + audio locale + directions + id). */
  display: LearningDisplayModel;
  /** The concept's dictionary/base form, shown as secondary info ONLY when it differs from the shown
   *  (tapped) surface — so tapping "combien" shows "combien" with "Combien ?" as the base form,
   *  never replacing the word the learner actually tapped. */
  baseForm?: string;
  /** 1–5 "essential-ness", derived from the corpus rank/tier (5 = Essential). */
  stars: number;
  /** Example sentence — learning-language line first, then app-language gloss (undefined when the
   *  corpus has none). */
  example?: FoundationExample;
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
  /** The exact surface the learner tapped inline (Universal Tap), e.g. "combien" vs canonical "Combien ?". */
  surface?: string,
): FoundationWord {
  return buildWordWithIndex(word, buildMissionIndex(missions), appLang, learningLang, surface);
}

/** The example a Foundation word page shows: an authored target-language sentence (French today)
 *  when one exists, else the honest fallback (never English-as-target for a non-English learner). */
function buildFoundationExample(word: CoreWord, appLang: string, learningLang: string): FoundationExample | undefined {
  if (!word.example) return undefined;
  const authored = authoredExample(word.conceptId, learningLang);
  if (authored) {
    const gloss = localize(word.example, appLang);
    return { target: authored, targetLang: languageTtsTag(learningLang), gloss: gloss || undefined };
  }
  return buildExample(word.example, appLang, learningLang);
}

/** Resolve an example to the LEARNING-language line + app-language gloss (deduped). Consistent
 *  ordering everywhere: the target sentence is always primary; the gloss only when it differs. */
export function buildExample(example: LocalizedText, appLang: string, learningLang: string): FoundationExample {
  const target = example[learningLang]; // a genuine learning-language realization, or undefined
  const gloss = localize(example, appLang); // the sentence in the app language
  if (target) {
    return { target, targetLang: languageTtsTag(learningLang), gloss: gloss && gloss !== target ? gloss : undefined };
  }
  // No learning-language example (e.g. French) — show the app-language meaning only, never English-as-target.
  return { gloss };
}

function buildWordWithIndex(
  word: CoreWord,
  index: { day: number; text: string }[],
  appLang: string,
  learningLang: string,
  surface?: string,
): FoundationWord {
  const cat = foundationCategoryOf(word);
  // Preserve the learner's mental model: show the exact tapped surface, keep the canonical as base form.
  const shown = surface && surface !== word.word ? surface : undefined;
  return {
    conceptId: word.conceptId,
    display: resolveLearningItem({ id: word.id, target: shown ?? word.word, meaning: word.meaning, emoji: word.emoji }, appLang, learningLang),
    baseForm: shown ? word.word : undefined,
    stars: frequencyStars(word),
    example: buildFoundationExample(word, appLang, learningLang),
    relatedMissions: relatedMissions(word.word, index, appLang),
    category: cat ? { id: cat.id, icon: cat.icon, titleKey: cat.titleKey } : null,
    corpusCategory: word.category,
  };
}

/**
 * The Foundation building-block words that appear in a set of learning-language lines (a mission's
 * items), in order of first appearance, deduped by concept. Powers the guided "Learn now" session
 * and Smart Detection so both traverse EXACTLY the words relevant to the current mission — never the
 * whole Foundation database.
 */
export function missionFoundationWords(targets: string[], index: CorpusIndex): CoreWord[] {
  const out: CoreWord[] = [];
  const seen = new Set<string>();
  for (const line of targets) {
    for (const seg of segmentText(line, index)) {
      const w = seg.word;
      if (!w || seen.has(w.conceptId)) continue;
      seen.add(w.conceptId);
      if (isFoundationWord(w)) out.push(w);
    }
  }
  return out;
}

/** Convenience: build the mission-word index straight from a pack (used by Smart Detection / session). */
export function missionFoundationWordsFromPack(targets: string[], words: CoreWord[]): CoreWord[] {
  return missionFoundationWords(targets, buildCorpusIndex(words));
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
