import type { CoreWord } from '../../shared/content/coreWords.js';

/**
 * Universal Tap tokenizer — PURE. Turns a target-language sentence into a run of segments, marking
 * every span that is a Core Corpus word/phrase so a component can render just those as tappable
 * (opening the shared Foundation word sheet) while leaving the rest as plain text. One matcher, used
 * by `TappableText` everywhere (dialogue, flashcards, phrases, …) — no per-surface duplication.
 *
 * Matching is on the language-independent surface (the pack's realized word), whole-token and
 * case-insensitive, greedy longest-first so multi-word entries ("avoir besoin", "how many") win over
 * their parts. Works for any language pack because it only reads `word` / `conceptId`.
 */

export interface CorpusIndex {
  /** normalized surface → the Core word. */
  bySurface: Map<string, CoreWord>;
  /** Longest surface length in word-tokens (bounds the greedy lookahead). */
  maxTokens: number;
}

export interface TextSegment {
  text: string;
  /** Present when this span is a Core Corpus word — render it tappable. */
  word?: CoreWord;
}

/** Split into alternating word / separator tokens, keeping separators so text rebuilds exactly. */
const SPLIT = /([^\p{L}\p{N}'’-]+)/u;

/** Word tokens of a string, lowercased and joined by single spaces — the canonical lookup key. */
export function normalizeKey(text: string): string {
  return text
    .split(SPLIT)
    .filter((_, i) => i % 2 === 0)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/’/g, "'");
}

/** Build the surface index for a language's Core words (later ranks never overwrite earlier ones). */
export function buildCorpusIndex(words: CoreWord[]): CorpusIndex {
  const bySurface = new Map<string, CoreWord>();
  let maxTokens = 1;
  for (const w of words) {
    const key = normalizeKey(w.word);
    if (!key || bySurface.has(key)) continue;
    bySurface.set(key, w);
    maxTokens = Math.max(maxTokens, key.split(' ').length);
  }
  return { bySurface, maxTokens: Math.min(maxTokens, 6) };
}

/**
 * Segment `text` against the index. Consecutive Core words each become their own `word` segment;
 * everything else is plain text. Original spacing/punctuation is preserved exactly.
 */
export function segmentText(text: string, index: CorpusIndex): TextSegment[] {
  const parts = text.split(SPLIT); // even indices = words, odd = separators
  const segments: TextSegment[] = [];
  let plain = '';
  const flush = () => { if (plain) { segments.push({ text: plain }); plain = ''; } };

  let p = 0;
  while (p < parts.length) {
    const tok = parts[p];
    // Odd indices are separators, and empty word tokens carry no letters — plain text either way.
    if (p % 2 === 1 || !tok) { plain += tok ?? ''; p++; continue; }

    let matched = 0;
    for (let k = index.maxTokens; k >= 1 && matched === 0; k--) {
      const lastWordIdx = p + 2 * (k - 1);
      if (lastWordIdx >= parts.length) continue;
      let ok = true;
      const tokens: string[] = [];
      for (let j = 0; j < k; j++) {
        const wt = parts[p + 2 * j];
        if (!wt) { ok = false; break; }
        tokens.push(wt);
        // Multi-token matches require the separators between the words to be whitespace-only.
        if (j < k - 1 && /\S/.test(parts[p + 2 * j + 1] ?? 'x')) { ok = false; break; }
      }
      if (!ok) continue;
      const hit = index.bySurface.get(normalizeKey(tokens.join(' ')));
      if (hit) {
        flush();
        segments.push({ text: parts.slice(p, lastWordIdx + 1).join(''), word: hit });
        p = lastWordIdx + 1; // resume at the separator immediately after the matched run
        matched = k;
      }
    }
    if (matched === 0) { plain += tok; p++; }
  }
  flush();
  return segments;
}
