import { ConceptSchema, type Concept, type PartOfSpeech } from '@ready/content-schema';
import { CATEGORIES, CORPUS_SIZE, DECLARED_LANGS, type Category, type CorpusRow } from './types.js';
import { CORPUS } from './data/index.js';

/**
 * Core Corpus transforms — PURE (no file I/O): authored rows → canonical Concepts + per-language
 * offline packs. The builder CLI and the tests both import from here without side effects.
 *
 * Language independence: nothing in here is English-specific except the convention that `en`
 * realizes from the row's `en` field. `buildPack(lang)` works for ANY language present in the
 * realizations — proven by the fake-language test in core-corpus.test.ts.
 */

/** Category → language-independent situation links (keeps every concept schedulable). */
export const SITUATIONS: Record<Category, string[]> = {
  glue: ['smalltalk'],
  questions: ['directions'],
  pronouns: ['smalltalk'],
  numbers: ['shopping'],
  time: ['transport'],
  colors: ['shopping'],
  people: ['social'],
  body: ['health'],
  food: ['restaurant'],
  places: ['directions'],
  transport: ['transport'],
  directions: ['directions'],
  money: ['shopping'],
  objects: ['shopping'],
  clothing: ['shopping'],
  home: ['accommodation'],
  technology: ['accommodation'],
  health: ['emergency'],
  emergency: ['emergency'],
  weather: ['smalltalk'],
  nature: ['sightseeing'],
  animals: ['sightseeing'],
  activities: ['activities'],
  actions: ['smalltalk'],
  descriptions: ['shopping'],
};

/** Reuse component by part of speech (function classes recombine; nouns mostly stand alone). */
const REUSE: Record<PartOfSpeech, number> = {
  verb: 0.8, adj: 0.7, adv: 0.7, pron: 0.9, det: 0.9, prep: 0.9, conj: 0.9, num: 0.8,
  interj: 0.5, phrase: 0.4, noun: 0.3,
};

/** Learnability heuristic 0–1 (length proxy; per-language multipliers come later — §5). */
function learnability(text: string): number {
  return Math.max(0.2, Math.min(1, 1 - (text.length - 3) / 15));
}

/** Impact per Corpus Methodology v2 §1, then ROL = Impact × (RoF/3), scaled 0–100. */
export function rolScore(row: CorpusRow): number {
  const [freq, , , coverage, travel] = row.s;
  const impact =
    0.35 * (travel / 5) + 0.3 * (coverage / 5) + 0.2 * (freq / 5) +
    0.1 * REUSE[row.pos] + 0.05 * learnability(row.en);
  return Math.round(impact * (row.rof / 3) * 100);
}

/** Every language a row realizes: 'en' from `en`, others from `t`. */
function realizationText(row: CorpusRow, lang: string): string | undefined {
  return lang === 'en' ? row.en : row.t?.[lang];
}

const CONCRETE_CATS = new Set<Category>([
  'people', 'body', 'food', 'places', 'transport', 'money', 'objects', 'clothing', 'home',
  'technology', 'weather', 'nature', 'animals', 'colors',
]);

/**
 * Corpus invariants — throws with ALL violations so nothing inconsistent ships, seeds or builds.
 * (Sprint: duplicates, missing translations/metadata, broken references, invalid categories/
 * tiers, emoji conflicts, language completeness.)
 */
export function validateCorpus(
  rows: CorpusRow[] = CORPUS,
  size: number = CORPUS_SIZE,
  // The languages this pack claims to ship. Defaults to the production set; injectable so a future
  // pack (e.g. French) can be validated for completeness BEFORE it joins DECLARED_LANGS — this is
  // the seam that lets us prove "a partial French pack is rejected" without declaring fr globally.
  declaredLangs: readonly string[] = DECLARED_LANGS,
): void {
  const errs: string[] = [];
  if (rows.length !== size) errs.push(`expected exactly ${size} concepts, got ${rows.length}`);
  const slugs = new Set(rows.map((r) => r.slug));
  const seenSlug = new Set<string>();
  const emojis = new Map<string, string>();
  const surface = new Map<string, string>();
  const declared = new Set<string>(declaredLangs);
  for (const r of rows) {
    const at = r.slug || '(missing slug)';
    if (seenSlug.has(r.slug)) errs.push(`duplicate slug: ${at}`);
    seenSlug.add(r.slug);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)?$/.test(r.slug)) errs.push(`invalid slug: ${at}`);
    if (!r.en.trim()) errs.push(`${at}: missing English realization`);
    if (!r.he.trim()) errs.push(`${at}: missing Hebrew gloss`);
    if (!r.ex.trim() || !r.exHe.trim()) errs.push(`${at}: missing example (en/he)`);
    if (!CATEGORIES.includes(r.cat)) errs.push(`${at}: invalid category "${r.cat}"`);
    if (![1, 2, 3, 4].includes(r.layer)) errs.push(`${at}: invalid layer`);
    if (![1, 2, 3].includes(r.rof)) errs.push(`${at}: invalid rof`);
    if (r.s.length !== 5 || r.s.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) {
      errs.push(`${at}: scores must be five integers 1–5`);
    }
    // Duplicate surface forms within a kind confuse games + reviews — senses must differ in text.
    const kind = r.kind ?? 'word';
    const surfaceKey = `${kind}:${r.en.toLowerCase()}`;
    const prev = surface.get(surfaceKey);
    if (prev) errs.push(`duplicate realization "${r.en}" (${kind}): ${prev} and ${at}`);
    surface.set(surfaceKey, at);
    if (r.emoji) {
      const owner = emojis.get(r.emoji);
      if (owner) errs.push(`duplicate emoji ${r.emoji} (breaks quiz distractors): ${owner} and ${at}`);
      emojis.set(r.emoji, at);
      if (r.vis === undefined || r.vis < 0 || r.vis > 1) errs.push(`${at}: emoji requires visualConfidence 0–1`);
    }
    for (const ref of [...(r.rel ?? []), ...(r.opp ?? [])]) {
      if (!slugs.has(ref)) errs.push(`${at}: broken reference "${ref}"`);
    }
    for (const lang of Object.keys(r.t ?? {})) {
      if (!declared.has(lang)) errs.push(`${at}: realization for undeclared language "${lang}" — add it to DECLARED_LANGS`);
    }
    for (const lang of declaredLangs) {
      if (!realizationText(r, lang)?.trim()) errs.push(`${at}: missing "${lang}" realization (language completeness)`);
    }
  }
  if (errs.length) throw new Error(`Core Corpus validation failed (${errs.length}):\n - ${errs.join('\n - ')}`);
}

/** Global rank: layer first (survival before connection), ROL second, authored order last. */
export function rankRows(rows: CorpusRow[] = CORPUS): Map<string, number> {
  const order = rows
    .map((r, i) => ({ slug: r.slug, layer: r.layer, rol: rolScore(r), i }))
    .sort((a, b) => a.layer - b.layer || b.rol - a.rol || a.i - b.i);
  return new Map(order.map((r, idx) => [r.slug, idx + 1]));
}

function conceptId(r: CorpusRow): string {
  return `concept.${r.kind ?? 'word'}.${r.slug}`;
}

export function toConcept(r: CorpusRow, rank: number): Concept {
  const kind = r.kind ?? 'word';
  const [freq, comm, recog, coverage, travel] = r.s;
  const bySlug = (refs?: string[]): string[] | undefined =>
    refs?.length ? refs.map((slug) => `concept.word.${slug}`) : undefined;
  return ConceptSchema.parse({
    id: conceptId(r),
    kind,
    gloss: { en: r.en, he: r.he },
    categories: [r.cat],
    rof: r.rof,
    layer: r.layer,
    skillTarget: r.skill,
    ...(r.role ? { role: r.role } : {}),
    situationSlugs: SITUATIONS[r.cat],
    rolComponents: {
      travel: travel / 5, coverage: coverage / 5, freq: freq / 5,
      reuse: REUSE[r.pos], learnability: learnability(r.en),
    },
    rolScore: rolScore(r),
    pos: r.pos,
    commScore: comm / 5,
    recogScore: recog / 5,
    ...(r.emoji ? { emoji: r.emoji, iconEligible: true, visualConfidence: r.vis } : {}),
    imageEligible: !!r.emoji || CONCRETE_CATS.has(r.cat),
    rank,
    example: { en: r.ex, he: r.exHe },
    ...(r.alias?.length ? { aliases: r.alias } : {}),
    ...(bySlug(r.rel) ? { relatedConcepts: bySlug(r.rel) } : {}),
    ...(bySlug(r.opp) ? { oppositeConcepts: bySlug(r.opp) } : {}),
    realizations: Object.fromEntries(
      DECLARED_LANGS.filter((lang) => realizationText(r, lang)).map((lang) => [
        lang,
        { text: realizationText(r, lang)!, quality: 'ai_reviewed', reviewNotes: 'pending native review' },
      ]),
    ),
  });
}

export function buildConcepts(rows: CorpusRow[] = CORPUS): Concept[] {
  const ranks = rankRows(rows);
  return rows.map((r) => toConcept(r, ranks.get(r.slug)!));
}

/** The offline app-pack row — the exact shape the web app + games consume (emoji optional). */
export interface CorePackWord {
  id: string;
  conceptId: string;
  word: string;
  meaning: { en: string; he: string };
  emoji?: string;
  category: string;
  pos: string;
  tier: number;
  rank: number;
  skill: string;
  example: { en: string; he: string };
}

/**
 * Per-language offline pack rows. Works for any declared language with complete realizations —
 * this is the seam that makes a French pilot content-only.
 */
/**
 * Merge a PILOT language's realizations (concept slug → surface form) onto the corpus rows as
 * `t[lang]`, non-destructively (returns new rows). A pilot language is a CURATED SUBSET: only the
 * slugs present in `realizations` gain a realization, so `buildPackWords(lang, …)` emits exactly
 * that subset. English data files are never touched, and `fr` never joins `DECLARED_LANGS` (so the
 * strict all-500 completeness gate stays for full languages).
 */
export function mergePilotRealizations(
  lang: string,
  realizations: Record<string, string>,
  rows: CorpusRow[] = CORPUS,
): CorpusRow[] {
  return rows.map((r) =>
    realizations[r.slug] ? { ...r, t: { ...(r.t ?? {}), [lang]: realizations[r.slug]! } } : r,
  );
}

/**
 * Validate an emitted pilot pack: enough concepts to be a real pilot, no empty realizations, and no
 * duplicate surface form within a kind (which would break quiz distractors / recall identity).
 * This is the "no partial-but-broken pilot ships" gate — the subset is intentionally partial, but
 * everything IN it must be complete and consistent.
 */
export function validatePilotPack(lang: string, words: CorePackWord[], min = 120): void {
  const errs: string[] = [];
  if (words.length < min) errs.push(`${lang} pilot has ${words.length} concepts, expected at least ${min}`);
  const seen = new Map<string, string>();
  for (const w of words) {
    if (!w.word.trim()) errs.push(`${w.conceptId}: empty "${lang}" realization`);
    const kind = w.id.split('.')[1] ?? 'word';
    const key = `${kind}:${w.word.toLowerCase()}`;
    const prev = seen.get(key);
    if (prev) errs.push(`duplicate "${lang}" surface "${w.word}" (${kind}): ${prev} and ${w.conceptId}`);
    seen.set(key, w.conceptId);
  }
  if (errs.length) throw new Error(`${lang} pilot pack invalid (${errs.length}):\n - ${errs.join('\n - ')}`);
}

export function buildPackWords(lang: string, rows: CorpusRow[] = CORPUS): CorePackWord[] {
  const ranks = rankRows(rows);
  return rows
    .map((r): CorePackWord | null => {
      const text = realizationText(r, lang);
      if (!text) return null;
      const kind = r.kind ?? 'word';
      return {
        id: `${lang}.${kind}.${r.slug}`,
        conceptId: conceptId(r),
        word: text,
        meaning: { en: r.en, he: r.he },
        ...(r.emoji ? { emoji: r.emoji } : {}),
        category: r.cat,
        pos: r.pos,
        tier: r.layer - 1,
        rank: ranks.get(r.slug)!,
        skill: r.skill,
        example: { en: r.ex, he: r.exHe },
      };
    })
    .filter((w): w is CorePackWord => w !== null)
    .sort((a, b) => a.rank - b.rank);
}
