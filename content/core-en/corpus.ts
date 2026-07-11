import { ConceptSchema, type Concept } from '@ready/content-schema';
import { PILOT100, type PilotWord } from './pilot100.js';

/**
 * Core 100 corpus transforms — PURE (no file I/O), so both the builder CLI and the tests import
 * from here without side effects. One authored source (PILOT100) → canonical concepts + app pack.
 */

export const CORE_EN_VERSION = '1.0.0';

/** Category → language-independent situation links (keeps every concept non-orphan + schedulable). */
export const SITUATIONS: Record<string, string[]> = {
  body: ['health'],
  food: ['restaurant'],
  animals: ['sightseeing'],
  transport: ['transport'],
  places: ['directions'],
  objects: ['shopping'],
  clothing: ['shopping'],
  weather: ['smalltalk'],
  health: ['emergency'],
  nature: ['sightseeing'],
  activities: ['activities'],
  people: ['social'],
  directions: ['directions'],
};

export function toConcept(w: PilotWord, rank: number): Concept {
  return ConceptSchema.parse({
    id: `concept.word.${w.slug}`,
    kind: 'word',
    gloss: { en: w.en, he: w.he },
    categories: [w.cat],
    rof: w.rof,
    layer: w.tier === 0 ? 1 : 2, // pilot uses layers 1–2 (survive / transact)
    skillTarget: w.skill,
    situationSlugs: SITUATIONS[w.cat] ?? [],
    emoji: w.emoji,
    iconEligible: true,
    visualConfidence: w.vis,
    rank,
    example: { en: w.ex, he: w.exHe },
    realizations: { en: { text: w.en, quality: 'ai_reviewed', reviewNotes: 'pending native Hebrew review' } },
  });
}

/** The offline app-pack row — the exact shape the web app + games consume. */
export interface CorePackWord {
  id: string;
  conceptId: string;
  word: string;
  meaning: { en: string; he: string };
  emoji: string;
  category: string;
  tier: number;
  rank: number;
  skill: string;
  example: { en: string; he: string };
}

/** Task D1 — corpus invariants. Throws with ALL violations so nothing broken ships/builds. */
export function validatePilot(words: PilotWord[] = PILOT100): void {
  const errs: string[] = [];
  if (words.length !== 100) errs.push(`expected exactly 100 concepts, got ${words.length}`);
  const slugs = new Set<string>();
  const emojis = new Set<string>();
  for (const w of words) {
    if (slugs.has(w.slug)) errs.push(`duplicate slug: ${w.slug}`);
    slugs.add(w.slug);
    if (emojis.has(w.emoji)) errs.push(`duplicate emoji ${w.emoji} (breaks quiz distractors): ${w.slug}`);
    emojis.add(w.emoji);
    if (!/^[a-z0-9-]+$/.test(w.slug)) errs.push(`invalid slug id: ${w.slug}`);
    if (!w.en.trim()) errs.push(`${w.slug}: missing English realization`);
    if (!w.he.trim()) errs.push(`${w.slug}: missing Hebrew meaning`);
    if (!w.emoji.trim()) errs.push(`${w.slug}: missing emoji`);
    if (!w.cat.trim()) errs.push(`${w.slug}: empty category`);
    if (!(w.cat in SITUATIONS)) errs.push(`${w.slug}: category "${w.cat}" has no situation mapping`);
    if (!w.ex.trim() || !w.exHe.trim()) errs.push(`${w.slug}: missing example (en/he)`);
    if (w.vis < 0 || w.vis > 1) errs.push(`${w.slug}: visualConfidence out of range`);
    if (![1, 2, 3].includes(w.rof)) errs.push(`${w.slug}: invalid rof`);
  }
  if (errs.length) throw new Error(`Core 100 validation failed:\n - ${errs.join('\n - ')}`);
}

export function buildConcepts(words: PilotWord[] = PILOT100): Concept[] {
  return words.map((w, i) => toConcept(w, i + 1));
}

export function buildPackWords(words: PilotWord[] = PILOT100): CorePackWord[] {
  return words.map((w, i) => ({
    id: `en.word.${w.slug}`,
    conceptId: `concept.word.${w.slug}`,
    word: w.en,
    meaning: { en: w.en, he: w.he },
    emoji: w.emoji,
    category: w.cat,
    tier: w.tier,
    rank: i + 1,
    skill: w.skill,
    example: { en: w.ex, he: w.exHe },
  }));
}
