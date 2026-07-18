import { describe, expect, it } from 'vitest';
import { resolveVoice, scoreVoice, prepareTextForSpeech, type VoiceLike, type SpeechLanguageProfile } from './voiceResolver.js';
import { speechProfile } from './voiceProfiles.js';

const V = (name: string, lang: string, extra: Partial<VoiceLike> = {}): VoiceLike => ({ name, lang, ...extra });
const EN = speechProfile('en'); // locale en-US, approved fallbacks: ['en'] (region-neutral only)
const FR = speechProfile('fr'); // locale fr-FR, approved fallbacks: ['fr']
const ES = speechProfile('es'); // locale es-ES; LatAm-preferred fallbacks ['es-419','es-MX','es-US','es-CO','es']

describe('VoiceResolver — locale scoring', () => {
  it('prefers exact en-US over en-GB', () => {
    const best = resolveVoice([V('British', 'en-GB'), V('American', 'en-US')], EN);
    expect(best?.voice.name).toBe('American');
  });

  it('prefers exact fr-FR over fr-CA', () => {
    const best = resolveVoice([V('Canadian', 'fr-CA'), V('Parisian', 'fr-FR')], FR);
    expect(best?.voice.name).toBe('Parisian');
  });

  it('disqualifies a wrong-language voice even if it is the engine default', () => {
    // Only a Hebrew default voice + a correct French voice → French must win, Hebrew is ineligible.
    const best = resolveVoice([V('Carmit', 'he-IL', { default: true }), V('Thomas', 'fr-FR')], FR);
    expect(best?.voice.name).toBe('Thomas');
  });

  it('returns null when NO correct-language voice exists (controlled failure, never wrong language)', () => {
    expect(resolveVoice([V('Carmit', 'he-IL'), V('Kyoko', 'ja-JP')], FR)).toBeNull();
  });

  it('a preferred name gives a bonus but never overrides the wrong locale', () => {
    // 'Daniel' is a preferred-ish en-GB name; exact en-US must still win.
    const prof: SpeechLanguageProfile = { ...EN, preferredVoiceNames: ['Daniel'] };
    const best = resolveVoice([V('Daniel', 'en-GB'), V('Samantha', 'en-US')], prof);
    expect(best?.voice.lang).toBe('en-US');
  });

  it('uses the preferred name only as a tie-breaker within the same locale tier', () => {
    const best = resolveVoice([V('Nondescript', 'en-US'), V('Samantha', 'en-US')], EN);
    expect(best?.voice.name).toBe('Samantha'); // preferred-name bonus
  });

  it('prefers a local (offline) voice over a remote one at the same locale', () => {
    const best = resolveVoice([V('Remote', 'en-US', { localService: false }), V('Local', 'en-US', { localService: true })], EN);
    expect(best?.voice.name).toBe('Local');
  });

  it('ranks an approved region-neutral fallback ahead of an unapproved regional voice', () => {
    // No fr-FR; a bare-'fr' voice is an approved fallback, fr-CA is an unapproved region → 'fr' wins.
    const best = resolveVoice([V('Canadian', 'fr-CA'), V('Neutral', 'fr')], FR);
    expect(best?.voice.name).toBe('Neutral');
    expect(best?.quality).toBe('approved-fallback');
  });
});

describe('VoiceResolver — regional accents are NOT equivalent (match quality)', () => {
  it('en-US does not treat en-GB as exact or approved — it is same-language-different-region', () => {
    const scored = scoreVoice(V('British', 'en-GB'), EN);
    expect(scored?.quality).toBe('same-language-different-region');
    expect(resolveVoice([V('British', 'en-GB')], EN)?.quality).toBe('same-language-different-region');
  });

  it('fr-FR does not treat fr-CA as equivalent', () => {
    expect(scoreVoice(V('Canadian', 'fr-CA'), FR)?.quality).toBe('same-language-different-region');
  });

  it('es (Neutral Latin American) approves LatAm regions in order; an unlisted region stays degraded', () => {
    // es-MX / es-US / es-CO are the taught accent → approved fallbacks (not degraded).
    expect(scoreVoice(V('Mexican', 'es-MX'), ES)?.quality).toBe('approved-fallback');
    expect(scoreVoice(V('Colombian', 'es-CO'), ES)?.quality).toBe('approved-fallback');
    // an unlisted region is still degraded (mechanism intact).
    expect(scoreVoice(V('EqGuinea', 'es-GQ'), ES)?.quality).toBe('same-language-different-region');
    // when no exact es-ES voice is installed (the common Latin-American device case), the ordered
    // ladder decides: es-MX (index 1) outranks es-CO (index 3).
    expect(resolveVoice([V('Colombian', 'es-CO'), V('Mexican', 'es-MX')], ES)?.voice.name).toBe('Mexican');
    // The registry primary is still es-ES, so an installed Castilian voice remains the exact match
    // (last-resort target). Truly demoting it below LatAm would require a registry locale change.
    const best = resolveVoice([V('Mexican', 'es-MX'), V('Castilian', 'es-ES')], ES);
    expect(best?.voice.name).toBe('Castilian');
    expect(best?.quality).toBe('exact-locale');
  });

  it('reports exact-locale quality for the course locale', () => {
    expect(scoreVoice(V('American', 'en-US'), EN)?.quality).toBe('exact-locale');
  });

  it('an exact locale ALWAYS wins over any regional fallback (score + selection)', () => {
    const best = resolveVoice(
      [V('British', 'en-GB', { localService: true, default: true }), V('American', 'en-US')],
      EN,
    );
    expect(best?.voice.name).toBe('American');
    expect(best?.quality).toBe('exact-locale');
  });

  it('a same-language-different-region voice is still selected as a LAST resort, flagged degraded', () => {
    const best = resolveVoice([V('British', 'en-GB')], EN); // no en-US available
    expect(best?.voice.name).toBe('British');
    expect(best?.quality).toBe('same-language-different-region'); // used, but never called native
  });
});

describe('VoiceResolver — tag normalization + robustness', () => {
  it('matches underscore and mixed-case tags (en_US, EN-us)', () => {
    expect(scoreVoice(V('x', 'en_US'), EN)).not.toBeNull();
    expect(resolveVoice([V('x', 'EN-us')], EN)?.voice.name).toBe('x');
  });
  it('handles an empty voice list', () => {
    expect(resolveVoice([], EN)).toBeNull();
  });
  it('is deterministic on duplicates (first wins on a tie)', () => {
    const best = resolveVoice([V('First', 'en-US'), V('Second', 'en-US')], EN);
    expect(best?.voice.name).toBe('First');
  });
});

describe('prepareTextForSpeech', () => {
  it('strips emoji without changing words', () => {
    expect(prepareTextForSpeech('Bonjour 👋 !')).toBe('Bonjour !');
    expect(prepareTextForSpeech('🚻 toilettes')).toBe('toilettes');
  });
  it('keeps contractions, apostrophes, numbers and currency intact', () => {
    expect(prepareTextForSpeech('C’est 5 €, s’il vous plaît.')).toBe('C’est 5 €, s’il vous plaît.');
    expect(prepareTextForSpeech("I'd like it.")).toBe("I'd like it.");
  });
  it('collapses whitespace and trims', () => {
    expect(prepareTextForSpeech('  hello   world  ')).toBe('hello world');
  });
  it('returns empty for an emoji-only string', () => {
    expect(prepareTextForSpeech('🎉🎉')).toBe('');
  });
});

describe('speechProfile — derived from the registry', () => {
  it('uses the registry locale (single source of truth) and a natural test phrase', () => {
    expect(speechProfile('en').locale).toBe('en-US');
    expect(speechProfile('fr').locale).toBe('fr-FR');
    expect(speechProfile('it').locale).toBe('it-IT');
    expect(speechProfile('es').locale).toBe('es-ES');
    expect(speechProfile('fr').testPhrase).toContain('café');
  });
});
