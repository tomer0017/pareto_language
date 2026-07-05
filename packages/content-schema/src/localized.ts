import { z } from 'zod';

/**
 * LocalizedText — the canonical translation strategy (Bible §3.2). Every human-readable
 * content field is a language→string map. English is the required pivot; the UI language
 * falls back uiLang → en → first available. Adding a UI language never changes the schema.
 */

export const LocalizedTextSchema = z
  .record(z.string(), z.string())
  .refine((t) => typeof t.en === 'string' && t.en.trim() !== '', {
    message: 'LocalizedText requires an English (en) value as the fallback pivot',
  });
export type LocalizedText = Record<string, string>;

/** Optional variant (e.g. `literal`) — same shape, en still required when present. */
export const LocalizedTextOptionalSchema = LocalizedTextSchema.optional();

/**
 * Resolve a LocalizedText for a UI language with the frozen fallback chain.
 * Defensive: legacy packs cached offline may still carry plain strings — never crash on them.
 */
export function localize(text: LocalizedText | string | undefined, uiLang: string): string {
  if (text === undefined) return '';
  if (typeof text === 'string') return text; // legacy cache tolerance
  return text[uiLang] ?? text.en ?? Object.values(text)[0] ?? '';
}

/** Author convenience: accept a plain string (→ {en}) or a full map. */
export function toLocalized(value: string | LocalizedText): LocalizedText {
  return typeof value === 'string' ? { en: value } : value;
}
