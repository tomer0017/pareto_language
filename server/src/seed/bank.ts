import { readFileSync } from 'node:fs';
import type { WordDoc } from '../models/content.js';

/**
 * Vocabulary-bank importer (content/vocab/bank.tsv — fr / es / en / he columns).
 * The bank seeds recognition words for the fr, es and en packs (languageCode = the learning
 * language; translations carry the other columns). It is deliberately NOT enough to activate
 * those packs — travel phrases, replies and situations are still required per language.
 * Broken rows are never imported silently: everything suspicious lands in the report.
 */

export interface BankReport {
  totalRows: number;
  importable: number;
  invalidRows: { line: number; reason: string; raw: string }[];
  duplicateEnglish: { word: string; lines: number[] }[];
  missingTranslations: { line: number; en: string; missing: string[] }[];
  suspicious: { line: number; en: string; reason: string }[];
  wordsGenerated: number;
}

interface BankRow {
  line: number;
  fr: string;
  es: string;
  en: string;
  he: string;
}

const HEBREW_RE = /[֐-׿]/;
const LATIN_RE = /[A-Za-zÀ-ÿœŒ']/;

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseBank(path: string): { rows: BankRow[]; report: BankReport } {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim() !== '');
  const report: BankReport = {
    totalRows: lines.length,
    importable: 0,
    invalidRows: [],
    duplicateEnglish: [],
    missingTranslations: [],
    suspicious: [],
    wordsGenerated: 0,
  };

  const rows: BankRow[] = [];
  const byEnglish = new Map<string, number[]>();

  lines.forEach((lineRaw, i) => {
    const line = i + 1;
    const cols = lineRaw.split('\t').map((c) => c.trim());
    if (cols.length < 3) {
      report.invalidRows.push({ line, reason: 'fewer than 3 columns', raw: lineRaw.slice(0, 60) });
      return;
    }
    const [fr = '', es = '', en = '', he = ''] = cols;
    if (!en || !LATIN_RE.test(en)) {
      report.invalidRows.push({ line, reason: 'missing/invalid English key', raw: lineRaw.slice(0, 60) });
      return;
    }
    if (!fr && !es) {
      report.invalidRows.push({ line, reason: 'no learning-language value (fr/es empty)', raw: lineRaw.slice(0, 60) });
      return;
    }
    // Suspicious-shape checks: Hebrew leaking into Latin columns or vice versa.
    if (HEBREW_RE.test(fr) || HEBREW_RE.test(es) || HEBREW_RE.test(en)) {
      report.suspicious.push({ line, en, reason: 'Hebrew characters in a Latin column (shifted row?)' });
    }
    if (he && LATIN_RE.test(he) && !HEBREW_RE.test(he)) {
      report.suspicious.push({ line, en, reason: 'Latin text in the Hebrew column' });
    }
    const missing: string[] = [];
    if (!fr) missing.push('fr');
    if (!es) missing.push('es');
    if (!he) missing.push('he');
    missing.push('it', 'ar'); // not present in this bank at all — reported, not ignored
    if (missing.length > 2) report.missingTranslations.push({ line, en, missing: missing.filter((m) => m !== 'it' && m !== 'ar') .concat(['it', 'ar']) });

    const key = en.toLowerCase();
    const seen = byEnglish.get(key);
    if (seen) seen.push(line);
    else byEnglish.set(key, [line]);

    rows.push({ line, fr, es, en, he });
  });

  for (const [word, lns] of byEnglish) {
    if (lns.length > 1) report.duplicateEnglish.push({ word, lines: lns });
  }
  report.importable = rows.length;
  return { rows, report };
}

/** Map bank rows into Word documents for each learning language that has a value. */
export function bankToWords(rows: BankRow[]): WordDoc[] {
  const words: WordDoc[] = [];
  const seenIds = new Set<string>();
  for (const r of rows) {
    const base = slug(r.en);
    if (!base) continue;
    const translations: Record<string, string> = { en: r.en };
    if (r.he) translations.he = r.he;
    if (r.fr) translations.fr = r.fr;
    if (r.es) translations.es = r.es;

    const variants: { lang: 'fr' | 'es' | 'en'; word: string }[] = [];
    if (r.fr) variants.push({ lang: 'fr', word: r.fr });
    if (r.es) variants.push({ lang: 'es', word: r.es });
    variants.push({ lang: 'en', word: r.en });

    for (const v of variants) {
      let id = `bank.${v.lang}.${base}`;
      if (seenIds.has(id)) {
        // Duplicate English key (e.g. two senses) — keep both, disambiguate by line.
        id = `${id}.${r.line}`;
      }
      seenIds.add(id);
      words.push({
        _id: id,
        languageCode: v.lang,
        word: v.word,
        translations: Object.fromEntries(Object.entries(translations).filter(([k]) => k !== v.lang)),
        tags: ['bank', 'recognition'],
        source: 'vocab-bank-v1',
      });
    }
  }
  return words;
}

export function printBankReport(report: BankReport): void {
  console.info('── Vocabulary bank import report ─────────────────────');
  console.info(`rows in file:          ${report.totalRows}`);
  console.info(`importable rows:       ${report.importable}`);
  console.info(`word docs generated:   ${report.wordsGenerated}`);
  console.info(`invalid rows:          ${report.invalidRows.length}`);
  for (const r of report.invalidRows.slice(0, 10)) console.info(`   line ${r.line}: ${r.reason} — "${r.raw}"`);
  console.info(`duplicate English:     ${report.duplicateEnglish.length}`);
  for (const d of report.duplicateEnglish.slice(0, 10)) console.info(`   "${d.word}" on lines ${d.lines.join(', ')}`);
  console.info(`suspicious rows:       ${report.suspicious.length}`);
  for (const s of report.suspicious.slice(0, 10)) console.info(`   line ${s.line} (${s.en}): ${s.reason}`);
  console.info(`rows missing translations (beyond it/ar): ${report.missingTranslations.filter((m) => m.missing.some((x) => x !== 'it' && x !== 'ar')).length}`);
  console.info('note: it + ar translations are absent from this bank by design — tracked, not silently dropped.');
  console.info('───────────────────────────────────────────────────────');
}
