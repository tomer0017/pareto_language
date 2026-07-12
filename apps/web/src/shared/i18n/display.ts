import { localize, type LocalizedText } from '@ready/content-schema';
import { languageDirection, languageTtsTag } from './languages.js';

/**
 * ANY-TO-ANY display resolution — the single rule every learning surface follows, for an ARBITRARY
 * (appLanguage, learningLanguage) pair, with no English/Hebrew assumption.
 *
 * A concept is language-INDEPENDENT identity + one realization per language. The learner-facing
 * gloss is NOT a hardcoded English→Hebrew field — it is the realization of the SAME concept in the
 * learner's app language (or an explicit `gloss` override where a phrase needs contextual wording).
 * So English is never a translation bridge: Arabic→Spanish reads the Spanish realization and the
 * Arabic realization of one concept, and English is not in the visible flow.
 *
 *   primary  = realization[learningLang]      (the target-language content)
 *   gloss    = gloss?[appLang] ?? realization[appLang]   (meaning in the app language)
 *   audio    = TTS locale of the learning language
 *   dir      = each side resolved independently (RTL app + LTR target, or the reverse)
 *   reviewId = concept id + learning language (identity never depends on display text)
 */
export interface AnyConcept {
  /** Language-independent identity — never changes with wording or language. */
  id: string;
  /** One natural realization per language code (learningLang → surface; also the app-lang gloss). */
  realizations: Record<string, string>;
  /** Optional explicit app-language meaning, when it must differ from the bare realization. */
  gloss?: LocalizedText;
}

export interface ResolvedDisplay {
  /** Target-language content shown as the primary line. */
  primary: string;
  /** Meaning in the active app language. */
  gloss: string;
  /** TTS locale for the primary line (learning language). */
  ttsLocale: string;
  /** Direction of the target content (independent of the app UI). */
  targetDir: 'ltr' | 'rtl';
  /** Direction of the app UI. */
  appDir: 'ltr' | 'rtl';
  /** Review identity: concept + learning language (not display text). */
  reviewId: string;
  /** True when the pair is NOT fully covered and a value fell back to English (a leak to prevent). */
  englishLeak: boolean;
}

export function resolveDisplay(c: AnyConcept, appLang: string, learningLang: string): ResolvedDisplay {
  const primary = c.realizations[learningLang];
  const gloss = c.gloss?.[appLang] ?? c.realizations[appLang];
  const englishLeak =
    (primary === undefined && learningLang !== 'en') || (gloss === undefined && appLang !== 'en');
  return {
    primary: primary ?? c.realizations.en ?? c.id,
    gloss: gloss ?? c.gloss?.en ?? c.realizations.en ?? c.id,
    ttsLocale: languageTtsTag(learningLang),
    targetDir: languageDirection(learningLang),
    appDir: languageDirection(appLang),
    reviewId: `${c.id}@${learningLang}`,
    englishLeak,
  };
}

/** Whether a concept can be displayed in `appLang` — i.e. has a gloss/realization for it (no leak). */
export function hasAppGloss(c: AnyConcept, appLang: string): boolean {
  return appLang === 'en' || c.gloss?.[appLang] !== undefined || c.realizations[appLang] !== undefined;
}

export interface PairAudit {
  learningLang: string;
  appLang: string;
  /** Concept ids with no realization in the learning language (would show English as primary). */
  missingRealizations: string[];
  /** Concept ids with no gloss in the app language (would show an English gloss). */
  missingGlosses: string[];
  complete: boolean;
}

/**
 * Any-to-any completeness (Phase 12). A pair (appLang × learningLang) is complete only when EVERY
 * concept has a target realization AND an app-language gloss — otherwise the pair would silently
 * fall back to English. `assertPairsComplete` fails the build loudly for pairs a language declares
 * ready; proof/early-access pairs are audited but need not be asserted.
 */
export function auditPair(concepts: AnyConcept[], appLang: string, learningLang: string): PairAudit {
  const missingRealizations = learningLang === 'en' ? [] : concepts.filter((c) => c.realizations[learningLang] === undefined).map((c) => c.id);
  const missingGlosses = concepts.filter((c) => !hasAppGloss(c, appLang)).map((c) => c.id);
  return { learningLang, appLang, missingRealizations, missingGlosses, complete: missingRealizations.length === 0 && missingGlosses.length === 0 };
}

/**
 * The CANONICAL learning-content display model every learning surface consumes (Part A). The app's
 * content is already target-resolved per language (per-language Core packs and Bootcamp missions),
 * so a component passes the resolved item and gets back ONE object with the primary (target) text,
 * the app-language gloss, the audio text + learning-language locale, both writing directions, and
 * the review identity. No component independently selects realization / gloss / TTS / direction /
 * review id again.
 */
export interface LearningItem {
  /** Stable content id — `{learningLang}.{kind}.{slug}`; carries concept + learning language. */
  id: string;
  /** Target-language surface (already the learning language, from the per-language pack/mission). */
  target: string;
  /** App-language meaning source (resolved to the active app language for the gloss). */
  meaning?: LocalizedText;
  emoji?: string;
}

export interface LearningDisplayModel {
  contentId: string;
  /** Target-language content shown as the primary line. */
  primaryText: string;
  /** Meaning in the active app language (undefined when the item carries no gloss). */
  secondaryText?: string;
  /** Exactly what to speak, and in which learning language (components never re-pick this). */
  audioText: string;
  audioLang: string;
  ttsLocale: string;
  primaryDirection: 'ltr' | 'rtl';
  secondaryDirection: 'ltr' | 'rtl';
  /** Review identity = content id (already concept + learning language). Never the display text. */
  reviewId: string;
  emoji?: string;
}

export function resolveLearningItem(item: LearningItem, appLang: string, learningLang: string): LearningDisplayModel {
  return {
    contentId: item.id,
    primaryText: item.target,
    secondaryText: item.meaning ? localize(item.meaning, appLang) : undefined,
    audioText: item.target,
    audioLang: learningLang,
    ttsLocale: languageTtsTag(learningLang),
    primaryDirection: languageDirection(learningLang),
    secondaryDirection: languageDirection(appLang),
    reviewId: item.id,
    emoji: item.emoji,
  };
}

export function assertPairsComplete(concepts: AnyConcept[], appLangs: string[], learningLangs: string[]): void {
  const errs: string[] = [];
  for (const learningLang of learningLangs) {
    for (const appLang of appLangs) {
      const a = auditPair(concepts, appLang, learningLang);
      if (a.missingRealizations.length) errs.push(`${learningLang} learning: ${a.missingRealizations.length} concept(s) missing a realization → would leak English (e.g. ${a.missingRealizations[0]})`);
      if (a.missingGlosses.length) errs.push(`${appLang} app-gloss for ${learningLang}: ${a.missingGlosses.length} concept(s) missing → would leak English (e.g. ${a.missingGlosses[0]})`);
    }
  }
  if (errs.length) throw new Error(`Any-to-any parity FAILED (${errs.length}):\n - ${[...new Set(errs)].join('\n - ')}`);
}
