import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import type { CoreWord } from '../../shared/content/coreWords.js';
import type { BootcampDayContent } from '../bootcamp/types.js';
import { FOUNDATION_TAXONOMY } from './taxonomy.js';
import { buildCorpusIndex } from './corpusIndex.js';
import { EXAMPLE_LANGS, authoredExampleIds } from './foundationExamples.js';
import {
  matchesCategory,
  frequencyStars,
  relatedMissions,
  buildMissionIndex,
  buildFoundation,
  buildWord,
  buildExample,
  missionFoundationWords,
} from './foundationContent.js';

/** Load a real per-language Core pack from disk (node env — no fetch). */
function loadPack(lang: string): CoreWord[] {
  const url = new URL(`../../../public/content/core-${lang}.v1.json`, import.meta.url);
  const pack = JSON.parse(readFileSync(url, 'utf8')) as { words: CoreWord[] };
  return pack.words;
}

const word = (over: Partial<CoreWord>): CoreWord => ({
  id: 'en.word.x',
  conceptId: 'concept.word.x',
  word: 'x',
  meaning: { en: 'x', he: 'x' },
  category: 'actions',
  pos: 'verb',
  tier: 1,
  rank: 100,
  skill: 'recall',
  ...over,
});

describe('matchesCategory (data-driven selection on language-independent fields)', () => {
  const verbs = FOUNDATION_TAXONOMY.find((c) => c.id === 'verbs')!;
  const connectors = FOUNDATION_TAXONOMY.find((c) => c.id === 'connectors')!;
  const responses = FOUNDATION_TAXONOMY.find((c) => c.id === 'responses')!;
  const quantity = FOUNDATION_TAXONOMY.find((c) => c.id === 'quantity')!;

  it('matches by corpus category', () => {
    expect(matchesCategory(word({ category: 'actions', pos: 'verb' }), verbs)).toBe(true);
    expect(matchesCategory(word({ category: 'colors', pos: 'adj' }), verbs)).toBe(false);
  });

  it('honours the pos restriction (a non-verb action is not an Essential Verb)', () => {
    expect(matchesCategory(word({ category: 'actions', pos: 'noun' }), verbs)).toBe(false);
  });

  it('partitions glue by pos so a word is Connector XOR Quick Response', () => {
    const withPrep = word({ category: 'glue', pos: 'prep', word: 'with' });
    const yes = word({ category: 'glue', pos: 'interj', word: 'yes' });
    expect(matchesCategory(withPrep, connectors)).toBe(true);
    expect(matchesCategory(withPrep, responses)).toBe(false);
    expect(matchesCategory(yes, connectors)).toBe(false);
    expect(matchesCategory(yes, responses)).toBe(true);
  });

  it('matches explicit conceptIds regardless of corpus category', () => {
    const more = word({ conceptId: 'concept.word.more', category: 'descriptions', pos: 'adv' });
    expect(matchesCategory(more, quantity)).toBe(true);
    const other = word({ conceptId: 'concept.word.zzz', category: 'descriptions', pos: 'adv' });
    expect(matchesCategory(other, quantity)).toBe(false);
  });
});

describe('buildExample (learning-language line first, deduped gloss, honest for languages without examples)', () => {
  const ex = { en: 'We have time.', he: 'יש לנו זמן.' };
  it('puts the learning-language sentence first and the app-language gloss under it', () => {
    expect(buildExample(ex, 'he', 'en')).toEqual({ target: 'We have time.', targetLang: 'en-US', gloss: 'יש לנו זמן.' });
  });
  it('omits the gloss when it would just repeat the target (same language)', () => {
    expect(buildExample(ex, 'en', 'en')).toEqual({ target: 'We have time.', targetLang: 'en-US', gloss: undefined });
  });
  it('for a learning language with NO example realization (fr), shows the app-language meaning only — never English as the target', () => {
    // The corpus example is en+he; there is no fr sentence, so no target line / no audio is offered.
    expect(buildExample(ex, 'he', 'fr')).toEqual({ gloss: 'יש לנו זמן.' });
    expect(buildExample(ex, 'en', 'fr')).toEqual({ gloss: 'We have time.' });
  });
});

describe('buildWord — tapped surface & French examples (the two reported bugs)', () => {
  const combien = word({ id: 'fr.phrase.how-many', conceptId: 'concept.phrase.how-many', word: 'Combien ?', category: 'questions', pos: 'phrase', example: { en: 'How many people?', he: 'כמה אנשים?' } });

  it('shows the EXACT tapped surface as the title, with the canonical as the base form (Bug 1)', () => {
    const w = buildWord(combien, {}, 'he', 'fr', 'combien'); // learner tapped lowercase "combien"
    expect(w.display.primaryText).toBe('combien'); // matches the lesson — never "Combien ?"
    expect(w.display.audioText).toBe('combien');   // audio matches the shown word
    expect(w.baseForm).toBe('Combien ?');          // canonical shown as secondary, not as the title
  });

  it('does not add a base form when the tapped surface already equals the canonical', () => {
    expect(buildWord(combien, {}, 'he', 'fr', 'Combien ?').baseForm).toBeUndefined();
    expect(buildWord(combien, {}, 'he', 'fr').baseForm).toBeUndefined(); // browse (no surface)
  });

  it('shows a FRENCH example first + the Hebrew underneath, never English, for a French learner (Bug 2)', () => {
    const help = word({ id: 'fr.word.help', conceptId: 'concept.word.help', word: 'aider', example: { en: 'Can you help me?', he: 'אתה יכול לעזור לי?' } });
    const ex = buildWord(help, {}, 'he', 'fr').example!;
    expect(ex.target).toBe('Pouvez-vous m’aider ?'); // authored French, spoken in fr
    expect(ex.targetLang).toBe('fr-FR');
    expect(ex.gloss).toBe('אתה יכול לעזור לי?');      // Hebrew underneath (from the corpus)
    expect(/[A-Za-z]/.test(ex.target!)).toBe(true);   // French (has letters) — sanity, not English content
  });

  it('leaves the English learner unchanged (native corpus example + audio)', () => {
    const help = word({ id: 'en.word.help', conceptId: 'concept.word.help', word: 'help', example: { en: 'Can you help me?', he: 'אתה יכול לעזור לי?' } });
    const ex = buildWord(help, {}, 'he', 'en').example!;
    expect(ex.target).toBe('Can you help me?');
    expect(ex.targetLang).toBe('en-US');
  });
});

describe('missionFoundationWords (the guided-session deck for a mission)', () => {
  it('returns only Foundation words, in order of first appearance, deduped', () => {
    const idx = buildCorpusIndex([
      word({ word: 'I', conceptId: 'concept.word.I', category: 'pronouns', pos: 'pron' }),
      word({ word: 'pay', conceptId: 'concept.word.pay', category: 'actions', pos: 'verb' }),
      word({ word: 'toilet', conceptId: 'concept.word.toilet', category: 'places', pos: 'noun' }), // not a Foundation category
    ]);
    const deck = missionFoundationWords(['I want to pay.', 'Where is the toilet? I pay.'], idx);
    expect(deck.map((w) => w.word)).toEqual(['I', 'pay']); // toilet excluded, I not repeated
  });
});

describe('frequencyStars', () => {
  it('tier 0 is always Essential (5)', () => {
    expect(frequencyStars({ tier: 0, rank: 500 })).toBe(5);
  });
  it('degrades by global rank for lower tiers', () => {
    expect(frequencyStars({ tier: 1, rank: 100 })).toBe(4);
    expect(frequencyStars({ tier: 1, rank: 250 })).toBe(3);
    expect(frequencyStars({ tier: 1, rank: 400 })).toBe(2);
    expect(frequencyStars({ tier: 1, rank: 500 })).toBe(1);
  });
});

describe('relatedMissions (derived from real mission text, whole-word)', () => {
  const missions: Record<number, BootcampDayContent> = {
    1: {
      day: 1,
      title: { en: 'Introduce Myself', he: '' },
      items: [{ id: 'i1', text: 'I want coffee', meaning: { en: '', he: '' } }],
      dialogues: {},
      steps: [],
    },
    2: {
      day: 2,
      title: { en: 'Order Coffee', he: '' },
      items: [],
      dialogues: {
        d: { id: 'd', start: 's', nodes: [{ id: 's', who: 'you', en: 'Can I pay by card?', he: '' }] },
      },
      steps: [],
    },
  };
  const index = buildMissionIndex(missions);

  it('finds the word as a whole token in items and dialogue', () => {
    expect(relatedMissions('want', index, 'en').map((m) => m.day)).toEqual([1]);
    expect(relatedMissions('pay', index, 'en').map((m) => m.day)).toEqual([2]);
  });

  it('does not match substrings (card ≠ car)', () => {
    expect(relatedMissions('car', index, 'en')).toEqual([]);
  });

  it('caps the result set', () => {
    const many: Record<number, BootcampDayContent> = {};
    for (let d = 1; d <= 10; d++) many[d] = { day: d, title: { en: `M${d}`, he: '' }, items: [{ id: `i${d}`, text: 'yes please', meaning: { en: '', he: '' } }], dialogues: {}, steps: [] };
    expect(relatedMissions('yes', buildMissionIndex(many), 'en', 3)).toHaveLength(3);
  });
});

describe('buildFoundation over the REAL packs (data-driven coverage gate)', () => {
  for (const lang of ['en', 'fr']) {
    it(`every taxonomy category resolves to ≥1 word in core-${lang}`, () => {
      const model = buildFoundation(loadPack(lang), {}, 'en', lang);
      const ids = model.map((c) => c.id);
      for (const cat of FOUNDATION_TAXONOMY) {
        expect(ids, `${cat.id} empty in ${lang}`).toContain(cat.id);
      }
    });
  }

  it('shows the target word as primary and the app-language gloss as secondary (no leak)', () => {
    const fr = buildFoundation(loadPack('fr'), {}, 'en', 'fr');
    const people = fr.find((c) => c.id === 'people')!;
    // French realization is primary; the English gloss is the secondary meaning — English is never
    // the primary for a French learner (the any-to-any rule).
    for (const w of people.words) {
      expect(w.display.audioLang).toBe('fr');
      expect(w.display.primaryText).toBeTruthy();
    }
  });

  it('carries the concept id + category on every built word (for tap/progress)', () => {
    const en = buildFoundation(loadPack('en'), {}, 'en', 'en');
    const verbs = en.find((c) => c.id === 'verbs')!;
    for (const w of verbs.words) {
      expect(w.conceptId).toMatch(/^concept\./);
      expect(w.category?.id).toBe('verbs');
      expect(w.corpusCategory).toBe('actions');
    }
  });

  it('keeps every concept in exactly one Foundation category (enough is Quantity, not a Response)', () => {
    const en = buildFoundation(loadPack('en'), {}, 'en', 'en');
    const responses = en.find((c) => c.id === 'responses')!;
    const quantity = en.find((c) => c.id === 'quantity')!;
    expect(responses.words.some((w) => w.conceptId === 'concept.word.enough')).toBe(false);
    expect(quantity.words.some((w) => w.conceptId === 'concept.word.enough')).toBe(true);
  });

  // Registry-driven: EVERY installed example language is validated automatically — adding a language
  // to `EXAMPLES_BY_LANG` auto-extends this coverage gate, no test edit needed (scalability guard).
  for (const lang of EXAMPLE_LANGS) {
    it(`every ${lang} Foundation word has an authored ${lang} example (coverage — no English fallback)`, () => {
      const ids = new Set(authoredExampleIds(lang));
      const missing = loadPack(lang)
        .filter((w) => FOUNDATION_TAXONOMY.some((c) => matchesCategory(w, c)))
        .filter((w) => !ids.has(w.conceptId))
        .map((w) => `${w.conceptId} (${w.word})`);
      expect(missing, `${lang} Foundation words missing an example:\n${missing.join('\n')}`).toEqual([]);
    });
  }

  it('keeps categories in declared order and drops none of the ten', () => {
    const model = buildFoundation(loadPack('en'), {}, 'en', 'en');
    expect(model).toHaveLength(FOUNDATION_TAXONOMY.length);
    expect(model.map((c) => c.id)).toEqual([...FOUNDATION_TAXONOMY].sort((a, b) => a.order - b.order).map((c) => c.id));
  });
});
