import { describe, expect, it } from 'vitest';
import { buildPackWords, mergePilotRealizations, validatePilotPack } from './corpus.js';
import { CORPUS } from './data/index.js';
import { ES_PILOT } from './data/es-pilot.js';
import { FR_PILOT } from './data/fr-pilot.js';
import { corpusParity } from './parity.js';

/**
 * Spanish Core pack — the COMPLETE Spanish Core corpus (500/500). Proves the pack builds from
 * `es-pilot.ts` merged onto the corpus, is consistent, speaks Spanish, and preserves concept
 * identity — all through the SAME pure functions the English/French packs use, with Spanish NEVER
 * joining DECLARED_LANGS (so the English 500 stays untouched).
 */
const ES = Object.fromEntries(Object.entries(ES_PILOT).map(([slug, e]) => [slug, e.w]));

describe('Spanish pilot Core pack', () => {
  const rows = mergePilotRealizations('es', ES);
  const pack = buildPackWords('es', rows);

  it('realizes the COMPLETE corpus (500/500) and passes the pilot gate', () => {
    expect(pack.length).toBe(CORPUS.length);
    expect(() => validatePilotPack('es', pack)).not.toThrow();
  });

  it('covers exactly the same concept slugs as the French pilot (no missing / orphan concepts)', () => {
    expect(Object.keys(ES_PILOT).sort()).toEqual(Object.keys(FR_PILOT).sort());
    expect(corpusParity('es', ES_PILOT, CORPUS).orphans).toEqual([]);
    expect(corpusParity('es', ES_PILOT, CORPUS).complete).toBe(true);
  });

  it('carries genuine Spanish surface forms with stable es.* ids', () => {
    const byConcept = new Map(pack.map((w) => [w.conceptId, w.word]));
    expect(byConcept.get('concept.word.water')).toBe('agua');
    expect(byConcept.get('concept.word.hotel')).toBe('hotel');
    expect(byConcept.get('concept.reply.help.call')).toBe('¡Socorro!');
    expect(pack.every((w) => w.id.startsWith('es.'))).toBe(true);
  });

  it('keeps meanings (glosses) from the concept — never re-entered per language', () => {
    const water = pack.find((w) => w.conceptId === 'concept.word.water');
    expect(water?.meaning.en).toBe('water');
    expect(water?.meaning.he).toBe('מים');
  });

  it('has no empty Spanish surface forms and no stray French markers', () => {
    const frMarker = /(s['’]il vous plaît|bonjour|au revoir|é\b.*français)/i;
    for (const w of pack) {
      expect(w.word.trim().length).toBeGreaterThan(0);
      expect(frMarker.test(w.word)).toBe(false);
    }
  });

  it('provides enough unique-emoji words for the picture/recall games', () => {
    const visual = pack.filter((w) => w.emoji);
    expect(visual.length).toBeGreaterThanOrEqual(40);
    expect(new Set(visual.map((w) => w.emoji)).size).toBe(visual.length);
  });

  it('rejects a broken pilot (a concept whose Spanish realization is blank)', () => {
    const broken = pack.map((w, i) => (i === 0 ? { ...w, word: '  ' } : w));
    expect(() => validatePilotPack('es', broken)).toThrow(/empty "es" realization/);
  });
});
