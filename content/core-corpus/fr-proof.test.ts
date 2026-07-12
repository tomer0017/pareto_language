import { describe, expect, it } from 'vitest';
import { buildPackWords, validateCorpus } from './corpus.js';
import { FR_PROOF_ROWS } from './fr-proof.js';

/**
 * French foundation gates (Part B/G, honest slice). These prove French is genuinely content-only —
 * the SAME pure builder functions the English pack uses produce a valid `core-fr` pack from row
 * data — AND that the validator refuses anything less than a COMPLETE French pack, so a half-French
 * pack can never ship. The production Core 500 stays English-only until every row carries `t.fr`.
 */
const FR = ['en', 'fr'] as const;

describe('French proof slice — validated, content-only', () => {
  it('passes every corpus gate when validated as an en+fr pack', () => {
    expect(() => validateCorpus(FR_PROOF_ROWS, FR_PROOF_ROWS.length, FR)).not.toThrow();
  });

  it('builds a real core-fr pack with French surface forms and stable fr.* ids', () => {
    const pack = buildPackWords('fr', FR_PROOF_ROWS);
    expect(pack.length).toBe(FR_PROOF_ROWS.length);
    // Real French realizations flow through to the app/game-facing pack…
    const byConcept = new Map(pack.map((w) => [w.conceptId, w.word]));
    expect(byConcept.get('concept.word.fr-water')).toBe('eau');
    expect(byConcept.get('concept.reply.fr-thanks')).toBe('merci');
    expect(byConcept.get('concept.word.fr-toilet')).toBe('toilettes');
    // …ids are language-scoped and stable, meanings (glosses) come from the concept (stored once).
    expect(pack.every((w) => w.id.startsWith('fr.'))).toBe(true);
    expect(pack.find((w) => w.conceptId === 'concept.word.fr-water')?.meaning.he).toBe('מים');
    // rank-sorted, survival layer first (glue/emergency before transact).
    expect(pack.every((w, i) => i === 0 || pack[i - 1]!.rank <= w.rank)).toBe(true);
  });

  it('feeds the games a unique-emoji visual subset (no duplicate distractors)', () => {
    const visual = buildPackWords('fr', FR_PROOF_ROWS).filter((w) => w.emoji);
    expect(visual.length).toBeGreaterThan(0);
    expect(new Set(visual.map((w) => w.emoji)).size).toBe(visual.length);
  });
});

describe('French validator gate — no partial pack can ship (Part G)', () => {
  it('REJECTS a partial French pack (one concept missing its fr realization)', () => {
    const partial = FR_PROOF_ROWS.map((r, i) => (i === 0 ? { ...r, t: {} } : r));
    expect(() => validateCorpus(partial, partial.length, FR)).toThrow(/missing "fr" realization/);
  });

  it('REJECTS French realizations unless fr is a declared language of the pack', () => {
    // Validated as en-only, the fr realizations are undeclared — you cannot sneak French in.
    expect(() => validateCorpus(FR_PROOF_ROWS, FR_PROOF_ROWS.length, ['en'])).toThrow(
      /undeclared language "fr"/,
    );
  });
});
