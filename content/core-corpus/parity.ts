import type { CorpusRow } from './types.js';
import { CORPUS } from './data/index.js';

/**
 * Cross-language CORPUS parity (Phase 7). Because a language's realizations are merged onto the SAME
 * concept rows by slug, concept id / category / layer / scores / metadata / relationships are
 * IDENTICAL across languages BY CONSTRUCTION — only the surface form differs. So parity reduces to
 * two checks: every concept has a realization in the language (no `missing`), and the language adds
 * no realization for a concept that does not exist (no `orphans`). A language is at full parity only
 * when both are empty.
 */
export interface CorpusParityReport {
  lang: string;
  total: number;
  covered: number;
  /** Concept slugs English has but the language does not realize (the work remaining). */
  missing: string[];
  /** Realization keys that match no concept (orphan/typo content — must be empty). */
  orphans: string[];
  complete: boolean;
}

export function corpusParity(
  lang: string,
  realizations: Record<string, unknown>,
  rows: CorpusRow[] = CORPUS,
): CorpusParityReport {
  const slugs = new Set(rows.map((r) => r.slug));
  const missing = rows.filter((r) => !(r.slug in realizations)).map((r) => r.slug);
  const orphans = Object.keys(realizations).filter((k) => !slugs.has(k));
  return {
    lang,
    total: rows.length,
    covered: rows.length - missing.length,
    missing,
    orphans,
    complete: missing.length === 0 && orphans.length === 0,
  };
}

/** Fail loudly (Phase 7) — for a language DECLARED complete/available, any gap must break the build. */
export function assertCorpusParity(report: CorpusParityReport): void {
  if (report.complete) return;
  const errs: string[] = [];
  if (report.orphans.length) errs.push(`orphan realizations (no such concept): ${report.orphans.join(', ')}`);
  if (report.missing.length) errs.push(`${report.missing.length}/${report.total} concepts missing a "${report.lang}" realization`);
  throw new Error(`Corpus parity FAILED for "${report.lang}" (${errs.length}):\n - ${errs.join('\n - ')}`);
}
