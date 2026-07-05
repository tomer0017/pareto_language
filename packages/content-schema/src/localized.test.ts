import { describe, expect, it } from 'vitest';
import { LocalizedTextSchema, localize, toLocalized } from './localized.js';

describe('LocalizedText (Bible §3.2)', () => {
  it('requires an English pivot', () => {
    expect(LocalizedTextSchema.safeParse({ en: 'exit' }).success).toBe(true);
    expect(LocalizedTextSchema.safeParse({ he: 'יציאה' }).success).toBe(false);
    expect(LocalizedTextSchema.safeParse({ en: '' }).success).toBe(false);
  });

  it('resolves the requested UI language when present (Hebrew)', () => {
    expect(localize({ en: 'exit', he: 'יציאה' }, 'he')).toBe('יציאה');
  });

  it('falls back to English when the UI language is missing', () => {
    expect(localize({ en: 'exit' }, 'he')).toBe('exit');
  });

  it('falls back to any value as last resort and tolerates legacy strings', () => {
    expect(localize({ fr: 'sortie' } as Record<string, string>, 'he')).toBe('sortie');
    expect(localize('legacy plain string', 'he')).toBe('legacy plain string');
    expect(localize(undefined, 'he')).toBe('');
  });

  it('toLocalized wraps strings and passes maps through', () => {
    expect(toLocalized('hello')).toEqual({ en: 'hello' });
    expect(toLocalized({ en: 'hello', he: 'שלום' })).toEqual({ en: 'hello', he: 'שלום' });
  });
});
