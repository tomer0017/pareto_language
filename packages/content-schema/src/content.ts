import { z } from 'zod';
import { LocalizedTextSchema } from './localized.js';

/**
 * Content entities — the static, versioned language packs (PDF §12.1).
 * These schemas are the single source of truth for content shapes and are shared by the
 * content pipeline, the client, and the server.
 */

/** Knowledge-ladder target for an item (PDF §6.3). recognize=L1, recall=L2–3, fluent=L3. */
export const SkillTargetSchema = z.enum(['recognize', 'recall', 'fluent']);
export type SkillTarget = z.infer<typeof SkillTargetSchema>;

export const ItemKindSchema = z.enum(['phrase', 'word', 'reply', 'number']);
export type ItemKind = z.infer<typeof ItemKindSchema>;

export const TierSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export type Tier = z.infer<typeof TierSchema>;

/** Audio asset paths within a pack. `natural` is required; `slow` is an optional slow re-read. */
export const AudioRefSchema = z.object({
  natural: z.string().min(1),
  slow: z.string().min(1).optional(),
});
export type AudioRef = z.infer<typeof AudioRefSchema>;

export const ContentItemSchema = z.object({
  /** Stable across pack versions, e.g. "it.phrase.restaurant.bill". */
  id: z.string().min(1),
  kind: ItemKindSchema,
  /** Target-language text, e.g. "Il conto, per favore". */
  text: z.string().min(1),
  /** Meaning per UI language; en required as pivot (Bible §3.2). */
  meaning: LocalizedTextSchema,
  /** Optional literal gloss for curious learners (PDF §7.4). */
  literal: LocalizedTextSchema.optional(),
  /** Romanization for non-Latin scripts (v2). */
  romanization: z.string().optional(),
  audio: AudioRefSchema,
  tier: TierSchema,
  skillTarget: SkillTargetSchema,
  situationIds: z.array(z.string().min(1)),
  frequencyRank: z.number().int().positive().optional(),
  /** Phrases link to their likely replies (PDF §7.3). */
  replyIds: z.array(z.string().min(1)).optional(),
  /** Canonical meaning this item realizes (Concept Layer, Sprint 3). Optional by design. */
  conceptId: z.string().optional(),
});
export type ContentItem = z.infer<typeof ContentItemSchema>;

/** A single turn in a Situation Simulator dialogue (PDF §9, mode 6). */
export const DialogueNodeSchema = z.object({
  id: z.string().min(1),
  speaker: z.enum(['npc', 'user']),
  /** Target-language line. */
  text: z.string().min(1),
  meaning: LocalizedTextSchema,
  audio: z.string().optional(),
  /** For npc turns: the next node id (linear until a user choice). */
  next: z.string().optional(),
  /** For user turns: 2 branching options (PDF §9: "light branching, 2 options/turn"). */
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        meaning: LocalizedTextSchema,
        /** Node id this option leads to. */
        next: z.string().min(1),
        /** Optional link to the content item this line trains. */
        itemId: z.string().optional(),
        /** Whether this option is a communicatively successful choice. */
        correct: z.boolean().default(true),
      }),
    )
    .optional(),
});
export type DialogueNode = z.infer<typeof DialogueNodeSchema>;

export const DialogueScriptSchema = z.object({
  id: z.string().min(1),
  startNodeId: z.string().min(1),
  nodes: z.array(DialogueNodeSchema).min(2),
});
export type DialogueScript = z.infer<typeof DialogueScriptSchema>;

export const SituationSchema = z.object({
  id: z.string().min(1),
  name: LocalizedTextSchema,
  icon: z.string().min(1),
  /** frequency × criticality default ordering (PDF §7.2). Higher = earlier in plan. */
  priorityDefault: z.number(),
  corePhraseIds: z.array(z.string().min(1)),
  replyIds: z.array(z.string().min(1)),
  recognitionIds: z.array(z.string().min(1)),
  dialogue: DialogueScriptSchema,
  /** Written in UI languages — the learner cannot read the target language (frozen rule). */
  cultureTips: z.array(LocalizedTextSchema).max(3),
  /** Emergency situations are overlearned to L3 and always available offline (PDF §7.2). */
  isEmergency: z.boolean().default(false),
});
export type Situation = z.infer<typeof SituationSchema>;

/** One difficulty stage in the numbers curriculum (Number Sprint, PDF §9 mode 5). */
export const NumberStageSchema = z.object({
  id: z.string().min(1),
  label: LocalizedTextSchema,
  /** Kind of value learners must comprehend at speed. */
  kind: z.enum(['integer', 'price', 'time']),
  /** Inclusive numeric range for generated prompts (for integer/price kinds). */
  min: z.number(),
  max: z.number(),
});
export type NumberStage = z.infer<typeof NumberStageSchema>;

export const ContentPackSchema = z.object({
  lang: z.string().min(2),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver'),
  /** Metadata flag: content still needs native-speaker review (PDF §7.4, R1). */
  needsNativeReview: z.boolean().default(false),
  items: z.array(ContentItemSchema).min(1),
  situations: z.array(SituationSchema).min(1),
  numbersCurriculum: z.array(NumberStageSchema),
});
export type ContentPack = z.infer<typeof ContentPackSchema>;

/** Manifest served by GET /content/manifest (PDF §13). */
export const ContentManifestSchema = z.object({
  languages: z.array(
    z.object({
      lang: z.string().min(2),
      name: z.string().min(1),
      latestVersion: z.string(),
      packUrl: z.string(),
    }),
  ),
});
export type ContentManifest = z.infer<typeof ContentManifestSchema>;
