import { describe, expect, it } from 'vitest';
import { buildPackWords, mergePilotRealizations, validatePilotPack } from './corpus.js';
import { CORPUS } from './data/index.js';
import { FR_PILOT } from './data/fr-pilot.js';

/**
 * French Core pack — the COMPLETE French Core corpus (500/500). Proves the pack builds from
 * `fr-pilot.ts` merged onto the corpus, is consistent, speaks French, and preserves concept
 * identity — all through the SAME pure functions the English pack uses, with French NEVER joining
 * DECLARED_LANGS (so the English 500 stays untouched).
 */
const FR = Object.fromEntries(Object.entries(FR_PILOT).map(([slug, e]) => [slug, e.w]));

describe('French pilot Core pack', () => {
  const rows = mergePilotRealizations('fr', FR);
  const pack = buildPackWords('fr', rows);

  it('realizes the COMPLETE corpus (500/500) and passes the pilot gate', () => {
    expect(pack.length).toBe(CORPUS.length);
    expect(() => validatePilotPack('fr', pack)).not.toThrow();
  });

  it('carries genuine French surface forms with stable fr.* ids', () => {
    const byConcept = new Map(pack.map((w) => [w.conceptId, w.word]));
    expect(byConcept.get('concept.word.water')).toBe('eau');
    expect(byConcept.get('concept.word.hotel')).toBe('hôtel');
    expect(byConcept.get('concept.reply.help.call')).toBe('Au secours !');
    expect(pack.every((w) => w.id.startsWith('fr.'))).toBe(true);
  });

  it('keeps meanings (glosses) from the concept — never re-entered per language', () => {
    const water = pack.find((w) => w.conceptId === 'concept.word.water');
    expect(water?.meaning.en).toBe('water');
    expect(water?.meaning.he).toBe('מים');
  });

  it('has no empty French surface forms (homographs across distinct concepts are allowed)', () => {
    for (const w of pack) expect(w.word.trim().length).toBeGreaterThan(0);
  });

  it('provides enough unique-emoji words for the picture/recall games', () => {
    const visual = pack.filter((w) => w.emoji);
    expect(visual.length).toBeGreaterThanOrEqual(40);
    expect(new Set(visual.map((w) => w.emoji)).size).toBe(visual.length);
  });

  it('rejects a broken pilot (a concept whose French realization is blank)', () => {
    const broken = pack.map((w, i) => (i === 0 ? { ...w, word: '  ' } : w));
    expect(() => validatePilotPack('fr', broken)).toThrow(/empty "fr" realization/);
  });
});
