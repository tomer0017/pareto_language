import { z } from 'zod';
import { LocalizedTextSchema, type LocalizedText } from './localized.js';
import { SkillTargetSchema, type AudioRef, type ContentItem, type Tier } from './content.js';

/**
 * Concept Layer (Sprint 3) — one canonical representation of meaning.
 *
 * A Concept is a language-INDEPENDENT travel meaning ("the way out", "ask to pay by card"),
 * carrying everything that is true regardless of language: gloss (once, in UI languages),
 * categories, RoF, layer, skill target, situation links, and the corpus scorecard.
 * Each learning language adds a REALIZATION (its surface form). Packs are derived:
 * concept + realization → ContentItem at build time. The runtime contract (ContentPack)
 * is untouched — the Concept Layer lives entirely in the corpus plane.
 *
 * Concepts are communicative meanings, not lexemes: a concept may realize as a word in one
 * language and a phrase in another. Language-specific content with no cross-language meaning
 * (local dishes, culture tips) simply has no concept — conceptId stays optional everywhere.
 */

export const ConceptKindSchema = z.enum(['word', 'phrase', 'number', 'reply']);
export type ConceptKind = z.infer<typeof ConceptKindSchema>;

export const QualityLevelSchema = z.enum([
  'draft',
  'ai_generated',
  'ai_reviewed',
  'native_reviewed',
  'expert_approved',
  'verified',
]);
export type QualityLevel = z.infer<typeof QualityLevelSchema>;

/** One language's surface form of a concept. */
export const ConceptRealizationSchema = z.object({
  text: z.string().min(1),
  translit: z.string().optional(),
  /** Traveler-safe register note when it deviates from the language default. */
  register: z.string().optional(),
  forms: z.array(z.object({ form: z.string(), label: z.string() })).optional(),
  quality: QualityLevelSchema.default('draft'),
  /** Realization-level review flags (e.g. dialect question). */
  reviewNotes: z.string().optional(),
});
export type ConceptRealization = z.infer<typeof ConceptRealizationSchema>;

export const RolComponentsSchema = z.object({
  travel: z.number().min(0).max(1),
  coverage: z.number().min(0).max(1),
  freq: z.number().min(0).max(1),
  reuse: z.number().min(0).max(1),
  learnability: z.number().min(0).max(1),
});

/** Traveler-relevant part of speech (coarse — drives reuse heuristics + future grammar hints). */
export const PartOfSpeechSchema = z.enum([
  'noun', 'verb', 'adj', 'adv', 'pron', 'det', 'prep', 'conj', 'num', 'interj', 'phrase',
]);
export type PartOfSpeech = z.infer<typeof PartOfSpeechSchema>;

export const ConceptSchema = z.object({
  /** concept.{kind}.{slug}[.{sense}] — e.g. concept.word.exit, concept.word.right.direction */
  id: z.string().regex(/^concept\.(word|phrase|number|reply)\.[a-z0-9-]+(\.[a-z0-9-]+)?$/),
  kind: ConceptKindSchema,
  /** The meaning, stored ONCE, in UI languages (en pivot required). */
  gloss: LocalizedTextSchema,
  categories: z.array(z.string()).min(1),
  /** Return on Failure — what breaks without it (Corpus Methodology v2 §1). */
  rof: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** Progressive layer (B-005): 1 Survive · 2 Transact · 3 Adapt · 4 Connect. */
  layer: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  skillTarget: SkillTargetSchema,
  /** Phrase concepts: communicative role. */
  role: z.enum(['say', 'hear', 'recovery']).optional(),
  isOpener: z.boolean().default(false),
  /** Language-independent situation links (slugs are shared across packs). */
  situationSlugs: z.array(z.string()).default([]),
  /** Corpus scorecard — selection stays auditable at the concept level. */
  rolComponents: RolComponentsSchema.optional(),
  rolScore: z.number().min(0).max(100).optional(),
  /** Scored-and-rejected concepts remain as records (opportunity-cost ledger). */
  neverTeach: z.boolean().default(false),
  realizations: z.record(z.string(), ConceptRealizationSchema).default({}),
  notes: z.string().optional(),

  /* ── Visual metadata for emoji/icon-based games (Core 100 pilot; optional & additive) ── */
  /** A single emoji (or short icon token) that depicts the concept for Picture Quiz / Swipe Recall. */
  emoji: z.string().min(1).optional(),
  /** True when the concept can be represented by a clear, unambiguous picture. */
  iconEligible: z.boolean().default(false),
  /** How confidently the emoji reads as this exact meaning (0–1) — distractor-safety input. */
  visualConfidence: z.number().min(0).max(1).optional(),
  /** Rank within a curated pilot set (e.g. Core 100) — ordering + validation, not a global rank. */
  rank: z.number().int().positive().optional(),
  /** Example sentence (en pivot) + its learner-language translation, for review + UI context. */
  example: LocalizedTextSchema.optional(),

  /* ── Core Corpus metadata (Core 500; optional & additive — corpus methodology two-sided score) ── */
  /** Coarse part of speech (language-independent communicative class). */
  pos: PartOfSpeechSchema.optional(),
  /** Communication score 0–1 — value when the traveler needs to SAY it (say-channel). */
  commScore: z.number().min(0).max(1).optional(),
  /** Recognition score 0–1 — value when someone ELSE says it (hear-channel; freeze prevention). */
  recogScore: z.number().min(0).max(1).optional(),
  /** True when a real photo/illustration could represent it (wider than emoji `iconEligible`). */
  imageEligible: z.boolean().optional(),
  /** Alternate surface forms a traveler may hear for the same meaning ("restroom" for toilet). */
  aliases: z.array(z.string()).optional(),
  /** Concept ids semantically linked to this one (same cluster / commonly co-taught). */
  relatedConcepts: z.array(z.string()).optional(),
  /** Concept ids that are antonyms (open/closed, cheap/expensive) — future drill pairing. */
  oppositeConcepts: z.array(z.string()).optional(),
});
export type Concept = z.infer<typeof ConceptSchema>;

const LAYER_TO_TIER: Record<1 | 2 | 3 | 4, Tier> = { 1: 0, 2: 1, 3: 2, 4: 3 };

/** Slug part of a concept id (after `concept.{kind}.`). */
export function conceptSlug(concept: Pick<Concept, 'id' | 'kind'>): string {
  return concept.id.slice(`concept.${concept.kind}.`.length);
}

/** The frozen per-language item id this concept realizes to: `{lang}.{kind}.{slug}`. */
export function conceptItemId(concept: Pick<Concept, 'id' | 'kind'>, lang: string): string {
  return `${lang}.${concept.kind}.${conceptSlug(concept)}`;
}

/**
 * Derive a per-language ContentItem from a concept + its realization (pack build step).
 * Meaning is the concept gloss — stored once, never re-entered per language.
 */
export function realizeConcept(
  concept: Concept,
  lang: string,
  audio?: AudioRef,
): ContentItem | null {
  const realization = concept.realizations[lang];
  if (!realization || concept.neverTeach) return null;
  const id = conceptItemId(concept, lang);
  return {
    id,
    kind: concept.kind,
    text: realization.text,
    meaning: concept.gloss as LocalizedText,
    ...(realization.translit ? { romanization: realization.translit } : {}),
    audio: audio ?? { natural: `audio/${lang}/${id}.mp3` },
    tier: LAYER_TO_TIER[concept.layer],
    skillTarget: concept.skillTarget,
    situationIds: concept.situationSlugs,
    conceptId: concept.id,
  };
}
