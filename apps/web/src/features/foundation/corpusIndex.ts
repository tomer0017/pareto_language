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
 *
 * HOMOGRAPHS. Since the corpus allows two concepts to share one written surface across parts of
 * speech (e.g. `book` noun/verb, `orange` fruit/colour — surface-uniqueness is pos-scoped, see
 * corpus.ts), a surface can map to MORE THAN ONE sense. This tokenizer is surface-only: it cannot do
 * in-context POS disambiguation (that needs sentence grammar, out of scope). Instead of an
 * arbitrary iteration-order "first match", selection is now DETERMINISTIC and every sense is kept:
 *  - `sensesBySurface` holds all senses for a surface, ordered by communicative value (rank asc,
 *    conceptId tiebreak) — stable regardless of the input word order.
 *  - `bySurface` (the primary) = the first (highest-value) sense.
 *  - `segmentText` attaches `senses` on a matched span when it is a homograph, so the word sheet can
 *    offer the other meaning(s) — making both senses reachable without guessing context.
 */

export interface CorpusIndex {
  /** normalized surface → the primary (highest-value) Core word sense. */
  bySurface: Map<string, CoreWord>;
  /** normalized surface → ALL senses, ordered by value (rank asc). Length > 1 = homograph. */
  sensesBySurface: Map<string, CoreWord[]>;
  /** Longest surface length in word-tokens (bounds the greedy lookahead). */
  maxTokens: number;
}

export interface TextSegment {
  text: string;
  /** Present when this span is a Core Corpus word — render it tappable. The primary sense. */
  word?: CoreWord;
  /** All senses of this surface (primary first), present only when it is a homograph (> 1 sense). */
  senses?: CoreWord[];
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

/** Order two senses of one surface: highest communicative value first (rank asc), conceptId as a
 *  stable tiebreak. Pure comparator ⇒ selection is independent of the caller's word ordering. */
function bySenseValue(a: CoreWord, b: CoreWord): number {
  return a.rank - b.rank || (a.conceptId < b.conceptId ? -1 : a.conceptId > b.conceptId ? 1 : 0);
}

/** The senses of a homograph OTHER than the one currently shown — what the sheet offers as chips so
 *  the learner can reach the meaning they intended (e.g. from the verb "book" to the noun "book"). */
export function alternateSenses(current: CoreWord, senses: CoreWord[] | null | undefined): CoreWord[] {
  return senses ? senses.filter((s) => s.conceptId !== current.conceptId) : [];
}

/** The label a disambiguation chip shows: the sense's own MEANING in the UI language (e.g. "ספר",
 *  "להזמין") — never a generic "other meaning" — so the learner sees which sense they are choosing
 *  before tapping. Falls back to the English gloss, then the surface, if a gloss is missing. */
export function senseLabel(sense: CoreWord, uiLang: string): string {
  const m = sense.meaning as Record<string, string | undefined>;
  return m[uiLang] || m.en || sense.word;
}

/**
 * Build the surface index for a language's Core words. Collects EVERY sense per surface, then orders
 * each surface's senses deterministically (see {@link bySenseValue}) so the primary is the
 * highest-value sense regardless of input order — no arbitrary first-match. Homographs keep all
 * senses in `sensesBySurface` for the sheet to disambiguate.
 */
export function buildCorpusIndex(words: CoreWord[]): CorpusIndex {
  const sensesBySurface = new Map<string, CoreWord[]>();
  let maxTokens = 1;
  for (const w of words) {
    const key = normalizeKey(w.word);
    if (!key) continue;
    const list = sensesBySurface.get(key);
    if (list) list.push(w);
    else {
      sensesBySurface.set(key, [w]);
      maxTokens = Math.max(maxTokens, key.split(' ').length);
    }
  }
  const bySurface = new Map<string, CoreWord>();
  for (const [key, senses] of sensesBySurface) {
    senses.sort(bySenseValue);
    bySurface.set(key, senses[0]!); // each surface list is created non-empty
  }
  return { bySurface, sensesBySurface, maxTokens: Math.min(maxTokens, 6) };
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
      const key = normalizeKey(tokens.join(' '));
      const hit = index.bySurface.get(key);
      if (hit) {
        flush();
        const senses = index.sensesBySurface.get(key);
        const seg: TextSegment = { text: parts.slice(p, lastWordIdx + 1).join(''), word: hit };
        if (senses && senses.length > 1) seg.senses = senses;
        segments.push(seg);
        p = lastWordIdx + 1; // resume at the separator immediately after the matched run
        matched = k;
      }
    }
    if (matched === 0) { plain += tok; p++; }
  }
  flush();
  return segments;
}
