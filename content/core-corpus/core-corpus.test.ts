import { describe, expect, it } from 'vitest';
import { buildConcepts, buildPackWords, rankRows, rolScore, validateCorpus } from './corpus.js';
import { CORPUS } from './data/index.js';
import { CORPUS_SIZE, type CorpusRow } from './types.js';

/**
 * Core Corpus gates. The corpus itself must validate (the build refuses to emit otherwise),
 * derived concepts must satisfy the canonical schema, and — the sprint's success criterion —
 * a NEW language must be addable as pure content: proven below with a fake language.
 */

const row = (over: Partial<CorpusRow>): CorpusRow => ({
  slug: 'test-word', pos: 'noun', en: 'test', he: 'בדיקה', cat: 'objects', layer: 2, rof: 1,
  skill: 'recognize', s: [3, 3, 3, 3, 3], ex: 'A test.', exHe: 'בדיקה.', ...over,
});

describe('Core 500 — corpus invariants', () => {
  it(`holds exactly ${CORPUS_SIZE} concepts and passes every validation gate`, () => {
    expect(CORPUS.length).toBe(CORPUS_SIZE);
    expect(() => validateCorpus(CORPUS)).not.toThrow();
  });

  it('rejects duplicate slugs, duplicate emoji and duplicate surface forms', () => {
    const a = row({ slug: 'a', emoji: '🀄', vis: 0.9 });
    expect(() => validateCorpus([a, { ...a }], 2)).toThrow(/duplicate slug/);
    const b = row({ slug: 'b', en: 'other', emoji: '🀄', vis: 0.9 });
    expect(() => validateCorpus([a, b], 2)).toThrow(/duplicate emoji/);
    const c = row({ slug: 'c', en: 'test' });
    expect(() => validateCorpus([a, c], 2)).toThrow(/duplicate realization/);
  });

  it('rejects broken related/opposite references and undeclared languages', () => {
    expect(() => validateCorpus([row({ rel: ['ghost'] })], 1)).toThrow(/broken reference "ghost"/);
    expect(() => validateCorpus([row({ t: { fr: 'essai' } })], 1)).toThrow(/undeclared language "fr"/);
  });

  it('requires an emoji to carry a visual confidence', () => {
    expect(() => validateCorpus([row({ emoji: '🀄' })], 1)).toThrow(/visualConfidence/);
  });

  it('never shares an emoji between two concepts (quiz distractor invariant)', () => {
    const emojis = CORPUS.filter((r) => r.emoji).map((r) => r.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });
});

describe('Core 500 — derived concepts (canonical schema)', () => {
  const concepts = buildConcepts(CORPUS);

  it('parses all concepts through ConceptSchema with the full scorecard', () => {
    expect(concepts.length).toBe(CORPUS_SIZE);
    for (const c of concepts) {
      expect(c.rolComponents).toBeDefined();
      expect(c.commScore).toBeGreaterThan(0);
      expect(c.recogScore).toBeGreaterThan(0);
      expect(c.pos).toBeDefined();
      expect(c.example).toBeDefined();
      expect(c.realizations.en?.quality).toBe('ai_reviewed'); // honest: pending native review
    }
  });

  it('preserves the pilot concept ids (Mongo idempotency; no progress reset)', () => {
    const ids = new Set(concepts.map((c) => c.id));
    for (const slug of ['nose', 'water', 'hotel', 'passport', 'doctor', 'left']) {
      expect(ids.has(`concept.word.${slug}`)).toBe(true);
    }
    // graduated from samples.yaml — the corpus owns them canonically now
    const exit = concepts.find((c) => c.id === 'concept.word.exit');
    expect(exit?.gloss.he).toBe('יציאה');
    expect(ids.has('concept.word.where')).toBe(true);
  });

  it('ranks every concept uniquely, survival layers first', () => {
    const ranks = rankRows(CORPUS);
    expect(new Set(ranks.values()).size).toBe(CORPUS_SIZE);
    const byLayer = new Map(CORPUS.map((r) => [r.slug, r.layer]));
    const maxL1 = Math.max(...CORPUS.filter((r) => r.layer === 1).map((r) => ranks.get(r.slug)!));
    const minL2 = Math.min(...CORPUS.filter((r) => r.layer === 2).map((r) => ranks.get(r.slug)!));
    expect(maxL1).toBeLessThan(minL2);
    expect(byLayer.size).toBe(CORPUS_SIZE);
  });

  it('scores ROL inside 0–100 and weights RoF (safety beats nuance at equal impact)', () => {
    for (const r of CORPUS) {
      const rol = rolScore(r);
      expect(rol).toBeGreaterThanOrEqual(0);
      expect(rol).toBeLessThanOrEqual(100);
    }
    const nuance = row({ slug: 'n1', rof: 1 });
    const safety = row({ slug: 's3', rof: 3 });
    expect(rolScore(safety)).toBeGreaterThan(rolScore(nuance));
  });
});

describe('Core 500 — offline packs', () => {
  it('builds the English pack: 500 rows, rank-sorted, stable item ids', () => {
    const words = buildPackWords('en');
    expect(words.length).toBe(CORPUS_SIZE);
    expect(words.every((w, i) => i === 0 || words[i - 1]!.rank <= w.rank)).toBe(true);
    expect(words.find((w) => w.id === 'en.word.water')?.meaning.he).toBe('מים');
    expect(words.find((w) => w.id === 'en.reply.sounds-good')?.word).toBe('Sounds good.');
  });

  it('marks only icon-eligible words with emoji (games consume exactly that subset)', () => {
    const words = buildPackWords('en');
    const visual = words.filter((w) => w.emoji);
    expect(visual.length).toBeGreaterThanOrEqual(200); // rich enough for 4-option distractors
    expect(new Set(visual.map((w) => w.emoji)).size).toBe(visual.length);
    expect(words.find((w) => w.id === 'en.word.where')?.emoji).toBeUndefined();
  });
});

describe('Future language readiness (the sprint success criterion)', () => {
  it('realizes a brand-new language from row data alone — zero code changes', () => {
    // A future French pilot = every row gains t.fr + 'fr' joins DECLARED_LANGS. Simulated here
    // with a fake language through the SAME functions the real builder calls.
    const rows: CorpusRow[] = [
      row({ slug: 'water2', en: 'water2', he: 'מים', t: { xx: 'wasser' } }),
      row({ slug: 'exit2', en: 'exit2', he: 'יציאה', t: { xx: 'ausgang' } }),
    ];
    const pack = buildPackWords('xx', rows);
    expect(pack.length).toBe(2);
    expect(pack[0]!.id.startsWith('xx.word.')).toBe(true);
    expect(pack.map((w) => w.word).sort()).toEqual(['ausgang', 'wasser']);
    // meanings (glosses) come from the concept — stored once, never re-entered per language
    expect(pack.find((w) => w.id === 'xx.word.exit2')?.meaning.he).toBe('יציאה');
  });

  it('fails language completeness when a declared language misses a realization', () => {
    // 'en' is declared; a row without an en realization must fail the gate.
    expect(() => validateCorpus([row({ en: ' ' })], 1)).toThrow(/missing "en" realization|missing English/);
  });
});
