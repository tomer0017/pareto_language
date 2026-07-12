import { describe, expect, it } from 'vitest';
import { assertPairsComplete, auditPair, resolveDisplay, type AnyConcept } from './display.js';

/**
 * ANY-TO-ANY architectural proof (non-production fixture). One language-independent concept set,
 * realized per language, drives every pair through the SAME resolver — demonstrating Arabic UI →
 * Spanish, Spanish UI → French, RTL target under LTR app, and future-language-by-data, with NO
 * English in the visible flow. This is architectural evidence, not a shipped language.
 */
const CONCEPTS: Record<string, AnyConcept> = {
  bathroom: { id: 'concept.place.bathroom', realizations: { en: 'bathroom', he: 'שירותים', fr: 'toilettes', es: 'baño', ar: 'دورة المياه' } },
  station: { id: 'concept.place.station', realizations: { en: 'station', he: 'תחנה', fr: 'gare', es: 'estación', ar: 'محطة' } },
  repeat: { id: 'concept.phrase.repeat', realizations: { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', fr: 'Vous pouvez répéter ?', es: '¿Puede repetirlo?', ar: 'هل يمكنك أن تكرر؟' } },
};
const ENGLISH_VALUES = new Set(Object.values(CONCEPTS).map((c) => c.realizations.en));

describe('Any-to-any: Arabic UI → Spanish learning', () => {
  const d = resolveDisplay(CONCEPTS.bathroom!, 'ar', 'es');
  it('shows the Spanish realization as primary, glossed in Arabic', () => {
    expect(d.primary).toBe('baño');
    expect(d.gloss).toBe('دورة المياه');
  });
  it('uses the Spanish TTS locale and independent directions (RTL app, LTR target)', () => {
    expect(d.ttsLocale).toBe('es-ES');
    expect(d.targetDir).toBe('ltr');
    expect(d.appDir).toBe('rtl');
  });
  it('review identity is concept + learning language (never display text)', () => {
    expect(d.reviewId).toBe('concept.place.bathroom@es');
  });
  it('has NO English in the visible flow and no leak', () => {
    expect(d.englishLeak).toBe(false);
    expect(ENGLISH_VALUES.has(d.primary)).toBe(false);
    expect(ENGLISH_VALUES.has(d.gloss)).toBe(false);
  });
});

describe('Any-to-any: Spanish UI → French learning', () => {
  const d = resolveDisplay(CONCEPTS.station!, 'es', 'fr');
  it('French primary, Spanish gloss, French audio, no English', () => {
    expect(d.primary).toBe('gare');
    expect(d.gloss).toBe('estación');
    expect(d.ttsLocale).toBe('fr-FR');
    expect(d.targetDir).toBe('ltr');
    expect(d.appDir).toBe('ltr');
    expect(d.englishLeak).toBe(false);
    expect(ENGLISH_VALUES.has(d.primary)).toBe(false);
  });
  it('phrases work the same way (concept-first, not English-bridged)', () => {
    const p = resolveDisplay(CONCEPTS.repeat!, 'ar', 'es');
    expect(p.primary).toBe('¿Puede repetirlo?');
    expect(p.gloss).toBe('هل يمكنك أن تكرر؟');
    expect(p.englishLeak).toBe(false);
  });
});

describe('Direction is per-language and independent of the app', () => {
  it('RTL target (Arabic) under an LTR app (English)', () => {
    const d = resolveDisplay(CONCEPTS.station!, 'en', 'ar');
    expect(d.primary).toBe('محطة');
    expect(d.targetDir).toBe('rtl');
    expect(d.appDir).toBe('ltr');
    expect(d.ttsLocale).toBe('ar-SA');
  });
});

describe('Existing pairs still resolve (regression)', () => {
  it('Hebrew UI → English learning', () => {
    const d = resolveDisplay(CONCEPTS.station!, 'he', 'en');
    expect(d.primary).toBe('station');
    expect(d.gloss).toBe('תחנה');
    expect(d.ttsLocale).toBe('en-US');
  });
  it('Hebrew UI → French learning', () => {
    const d = resolveDisplay(CONCEPTS.station!, 'he', 'fr');
    expect(d.primary).toBe('gare');
    expect(d.gloss).toBe('תחנה');
  });
});

describe('Review identity isolates progress by learning language', () => {
  it('the same concept has distinct review ids per learning language', () => {
    expect(resolveDisplay(CONCEPTS.bathroom!, 'ar', 'es').reviewId)
      .not.toBe(resolveDisplay(CONCEPTS.bathroom!, 'ar', 'fr').reviewId);
  });
});

describe('English fallback is detected as a leak (validator signal)', () => {
  it('flags englishLeak when the pair is not fully realized', () => {
    const partial: AnyConcept = { id: 'concept.place.exit', realizations: { en: 'exit', he: 'יציאה' } };
    const d = resolveDisplay(partial, 'ar', 'es'); // no es realization, no ar gloss
    expect(d.englishLeak).toBe(true);
    expect(d.primary).toBe('exit'); // safety fallback, but flagged
  });
});

describe('Future language is data, not code', () => {
  it('resolves a brand-new language (de) from realizations alone — zero engine change', () => {
    const c: AnyConcept = { id: 'concept.place.station', realizations: { en: 'station', de: 'Bahnhof' } };
    const d = resolveDisplay(c, 'en', 'de');
    expect(d.primary).toBe('Bahnhof');
    expect(d.ttsLocale).toBe('de-DE'); // generated fallback tag — plausible without registry edit
    expect(d.targetDir).toBe('ltr');
  });
});

describe('Any-to-any completeness validator (Phase 12)', () => {
  const concepts = Object.values(CONCEPTS);
  it('passes for pairs the proof set fully covers (es↔fr↔ar↔he↔en)', () => {
    expect(() => assertPairsComplete(concepts, ['ar', 'es', 'he', 'en', 'fr'], ['es', 'fr', 'en'])).not.toThrow();
    expect(auditPair(concepts, 'ar', 'es').complete).toBe(true);
  });
  it('fails loudly for an incomplete pair (a language missing realizations/glosses)', () => {
    const withGap = [...concepts, { id: 'concept.place.exit', realizations: { en: 'exit', he: 'יציאה', fr: 'sortie' } }];
    // es learning is incomplete (exit has no es) and ar app-gloss is incomplete (exit has no ar).
    expect(() => assertPairsComplete(withGap, ['ar'], ['es'])).toThrow(/Any-to-any parity FAILED/);
    const a = auditPair(withGap, 'ar', 'es');
    expect(a.missingRealizations).toContain('concept.place.exit');
    expect(a.missingGlosses).toContain('concept.place.exit');
  });
});
