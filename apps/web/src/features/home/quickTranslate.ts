import type { LocalizedText } from '@ready/content-schema';

/**
 * Quick Translator lookup — a PURE, offline dictionary over the vocabulary READY already knows
 * (Core Corpus words + the mission sentences), so the Home translator never needs a network call or
 * an external API (offline-first stays intact). Source = the UI language (what the learner types),
 * target = the learning language (what they get back). Language-agnostic: it resolves the gloss in
 * whatever UI language is active and maps it to the learning-language realization.
 */

export interface TranslatableItem {
  /** The learning-language realization (what we translate INTO + speak). */
  text: string;
  /** The gloss, keyed by language (en + he shipped) — the source side of the lookup. */
  meaning: LocalizedText | Record<string, string>;
}

export interface TranslationEntry {
  /** Normalized source key (UI-language gloss) used for exact lookup. */
  source: string;
  /** The original gloss text (for display). */
  sourceLabel: string;
  /** The learning-language translation. */
  target: string;
}

/** Normalize a query/gloss for matching: strip Hebrew niqqud, punctuation, case and extra spaces. */
export function normalizeQuery(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[֑-ׇ]/g, '') // Hebrew niqqud / cantillation marks
    .toLowerCase()
    .replace(/[.,!?;:¿¡؟।、。！？"'“”«»()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function glossFor(meaning: TranslatableItem['meaning'], uiLang: string): string {
  if (typeof meaning === 'string') return meaning;
  return meaning[uiLang] ?? meaning.en ?? Object.values(meaning)[0] ?? '';
}

/**
 * Build the lookup index from known items. The first item to claim a gloss wins, so pass
 * higher-priority sources (e.g. Core words by rank) before lower-priority ones (mission sentences).
 */
export function buildTranslationIndex(items: TranslatableItem[], uiLang: string): Map<string, TranslationEntry> {
  const index = new Map<string, TranslationEntry>();
  for (const it of items) {
    const label = glossFor(it.meaning, uiLang);
    const key = normalizeQuery(label);
    if (!key || !it.text) continue;
    if (!index.has(key)) index.set(key, { source: key, sourceLabel: label, target: it.text });
  }
  return index;
}

/** Exact (normalized) lookup. Returns null when the phrase isn't in the known vocabulary. */
export function lookupTranslation(query: string, index: Map<string, TranslationEntry>): TranslationEntry | null {
  const key = normalizeQuery(query);
  if (!key) return null;
  return index.get(key) ?? null;
}
