import { describe, it, expect } from 'vitest';
import { buildTranslationIndex, lookupTranslation, normalizeQuery } from './quickTranslate.js';

describe('quickTranslate', () => {
  it('normalizes case, punctuation and whitespace', () => {
    expect(normalizeQuery('  Hello, world!  ')).toBe('hello world');
    expect(normalizeQuery('Thank you.')).toBe('thank you');
  });

  it('strips Hebrew niqqud so vowelized and plain queries match', () => {
    expect(normalizeQuery('שָׁלוֹם')).toBe(normalizeQuery('שלום'));
  });

  it('translates a UI-language gloss to the learning-language realization', () => {
    const index = buildTranslationIndex(
      [{ text: 'merci', meaning: { en: 'thank you', he: 'תודה' } }],
      'en',
    );
    expect(lookupTranslation('Thank you!', index)?.target).toBe('merci');
    expect(lookupTranslation('thank you', index)?.sourceLabel).toBe('thank you');
  });

  it('resolves the gloss in the active UI language (any-to-any, no English bridge)', () => {
    const index = buildTranslationIndex(
      [{ text: 'merci', meaning: { en: 'thank you', he: 'תודה' } }],
      'he',
    );
    expect(lookupTranslation('תודה', index)?.target).toBe('merci');
  });

  it('returns null for unknown input and empty queries', () => {
    const index = buildTranslationIndex([{ text: 'merci', meaning: { en: 'thank you', he: 'תודה' } }], 'en');
    expect(lookupTranslation('platypus', index)).toBeNull();
    expect(lookupTranslation('   ', index)).toBeNull();
  });

  it('keeps the first item to claim a gloss (priority ordering)', () => {
    const index = buildTranslationIndex(
      [
        { text: 'bonjour', meaning: { en: 'hello' } },
        { text: 'salut', meaning: { en: 'hello' } },
      ],
      'en',
    );
    expect(lookupTranslation('hello', index)?.target).toBe('bonjour');
  });
});
