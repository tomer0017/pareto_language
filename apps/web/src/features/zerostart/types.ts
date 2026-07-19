import type { LocalizedText } from '@ready/content-schema';

/**
 * "מתחילים מאפס" (Zero-Beginner Path) — shared, framework-free data model.
 *
 * A single guided, cumulative sequence over the SAME survival concepts the Foundation library and
 * the Bootcamp already use — never a parallel content engine. Content is language-agnostic: every
 * chunk carries its own realization per learning language plus ONE app-language gloss, and the module
 * / step structure is identical across languages (parity by construction). Nothing here renders,
 * stores, or speaks; the renderer, the progress store and the audio engine are separate layers.
 */

/** Learning languages the path ships for (must match the available Core/Reading packs). */
export const ZERO_LANGS = ['en', 'fr', 'es'] as const;
export type ZeroLang = (typeof ZERO_LANGS)[number];

/**
 * One reusable teaching brick — a chunk, frame, question or survival word. `target` is its natural
 * realization in EACH learning language (never a word-for-word map of Hebrew); `tr` is the meaning in
 * the app languages (en + he). `conceptId` links to an existing Foundation concept so completing the
 * chunk marks that concept viewed — the ONE progress-sync seam (optional: many chunks are phrases the
 * corpus has no single concept for, e.g. "thank you"). `{name}` in a target/gloss is replaced with
 * the learner's saved name at render time (personalization never lives in static data).
 */
export interface ZeroChunk {
  id: string;
  conceptId?: string;
  target: Record<ZeroLang, string>;
  tr: LocalizedText;
  emoji?: string;
}

/**
 * One learning step. Each maps to a stage of the per-brick loop (Understand → Recognize → Build →
 * Recall → Use). A step is only ever COMPLETE after its required interaction succeeds (see the
 * store's `completeStep`): `introduce`/`recall` complete on an explicit continue; `recognize`,
 * `build` and `dialogue` complete only on a correct answer.
 */
export type ZeroStep =
  /** Stage A — show the chunk (target + gloss + audio), translation visible on first exposure. */
  | { kind: 'introduce'; chunk: string }
  /** Stage B — pick the correct meaning among glosses (`distractors` = other chunk ids). */
  | { kind: 'recognize'; chunk: string; distractors: string[] }
  /** Stage C — assemble the target sentence from its own (shuffled) words. */
  | { kind: 'build'; chunk: string }
  /** Stage D — meaning/audio shown, retrieve the target (reveal + replay allowed). */
  | { kind: 'recall'; chunk: string }
  /** Stage E — a tiny exchange: the NPC line (`npc` chunk) then pick the learner's reply. */
  | { kind: 'dialogue'; npc: string; answer: string; distractors: string[] };

/** One module: a titled cluster of steps ending in a concrete "I can now…" outcome. */
export interface ZeroModule {
  id: string;
  icon: string;
  title: LocalizedText;
  /** The practical result the learner unlocks — shown on completion ("I can now…"). */
  outcome: LocalizedText;
  steps: ZeroStep[];
}

/** The whole path: a shared chunk library + the ordered modules that reference it. */
export interface ZeroPath {
  chunks: Record<string, ZeroChunk>;
  modules: ZeroModule[];
}

/** A stable per-step identity (module id + step index) — the unit of progress persistence. */
export function stepId(moduleId: string, index: number): string {
  return `${moduleId}:${index}`;
}
