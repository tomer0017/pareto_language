import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { ConceptSchema, conceptItemId, realizeConcept, type Concept } from './concept.js';
import { ContentItemSchema } from './content.js';

const samplesPath = fileURLToPath(new URL('../../../content/concepts/samples.yaml', import.meta.url));

function loadSamples(): Concept[] {
  const raw = parse(readFileSync(samplesPath, 'utf8')) as { concepts: unknown[] };
  return raw.concepts.map((c) => ConceptSchema.parse(c));
}

describe('Concept Layer (Sprint 3)', () => {
  it('sample concepts validate against the schema', () => {
    const concepts = loadSamples();
    expect(concepts.length).toBe(3); // recovery.dont-understand moved to production missions-core.yaml
    expect(concepts[0]!.gloss.he).toBe('יציאה');
  });

  it('enforces the concept id convention and en gloss pivot', () => {
    expect(ConceptSchema.safeParse({ id: 'word.exit' }).success).toBe(false);
    const bad = { id: 'concept.word.exit', kind: 'word', gloss: { he: 'יציאה' }, categories: ['signs'], rof: 2, layer: 1, skillTarget: 'recognize' };
    expect(ConceptSchema.safeParse(bad).success).toBe(false); // gloss missing en pivot
  });

  it('realizes to a valid per-language ContentItem with the frozen id convention', () => {
    const [exit] = loadSamples();
    const item = realizeConcept(exit!, 'it');
    expect(item).not.toBeNull();
    expect(item!.id).toBe('it.word.uscita'.replace('uscita', 'exit')); // {lang}.{kind}.{slug}
    expect(conceptItemId(exit!, 'fr')).toBe('fr.word.exit');
    expect(item!.text).toBe('uscita');
    expect(item!.meaning.he).toBe('יציאה'); // gloss flows through — stored once, used everywhere
    expect(item!.conceptId).toBe('concept.word.exit');
    expect(item!.tier).toBe(0); // layer 1 → tier 0
    expect(ContentItemSchema.safeParse(item).success).toBe(true); // runtime contract untouched
  });

  it('returns null for missing realizations and for neverTeach records', () => {
    const concepts = loadSamples();
    const where = concepts.find((c) => c.id === 'concept.word.where')!;
    expect(realizeConcept(where, 'ar')).toBeNull(); // no ar realization yet
    const carb = concepts.find((c) => c.id === 'concept.word.carburetor')!;
    expect(realizeConcept(carb, 'en')).toBeNull(); // rejected concepts never realize
  });

  it('sense-qualified slugs survive the round trip', () => {
    const c = ConceptSchema.parse({
      id: 'concept.word.right.direction', kind: 'word',
      gloss: { en: 'right (direction)', he: 'ימינה' },
      categories: ['directions'], rof: 2, layer: 1, skillTarget: 'recognize',
      realizations: { en: { text: 'right' } },
    });
    expect(conceptItemId(c, 'en')).toBe('en.word.right.direction');
  });
});
