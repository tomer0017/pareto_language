import { languageTtsTag } from '../i18n/languages.js';
import type { SpeechLanguageProfile } from './voiceResolver.js';

/**
 * Speech profiles are DERIVED from the language registry — the locale always comes from
 * `languageTtsTag(lang)` (single source of truth), never a second competing table. This map only
 * adds speech-quality hints (ordered fallbacks, known good voice names) and a natural test phrase
 * per language. Adding a language = add its realizations to the registry; add an entry here only to
 * tune voice preferences / the Test-Voice phrase (optional — a language with no entry still resolves
 * by locale).
 */
interface ProfileExtras {
  fallbackLocales?: string[];
  preferredVoiceNames?: string[];
  testPhrase: string;
  defaultRate?: number;
}

/**
 * `fallbackLocales` are ONLY genuinely accent-acceptable alternates, EXPLICITLY approved. A regional
 * variant (en-GB, fr-CA, es-MX, pt-BR…) is NOT listed — it is not equivalent to the course accent and
 * the resolver reports it as `same-language-different-region` (degraded, last resort), never a native
 * match. We approve only the bare, region-neutral language subtag (e.g. a voice tagged just 'en'),
 * which is not a wrong region. Add a specific regional fallback here only if that accent is a
 * deliberate product decision for the course.
 */
const EXTRAS: Record<string, ProfileExtras> = {
  en: {
    fallbackLocales: ['en'], // region-neutral 'en' only; en-GB / en-AU are NOT approved
    // Apple 'Samantha', Chrome 'Google US English', Edge/Windows Aria/Jenny/Zira.
    preferredVoiceNames: ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Alex'],
    testPhrase: 'Hello! I’d like a coffee, please.',
  },
  fr: {
    fallbackLocales: ['fr'], // region-neutral 'fr' only; fr-CA is NOT approved
    // Apple 'Thomas'/'Amelie'/'Audrey', Chrome 'Google français', Edge 'Denise'/'Henri'.
    preferredVoiceNames: ['Thomas', 'Amélie', 'Amelie', 'Audrey', 'Google français', 'Microsoft Denise', 'Microsoft Henri'],
    testPhrase: 'Bonjour ! Je voudrais un café, s’il vous plaît.',
  },
  it: {
    fallbackLocales: ['it'],
    preferredVoiceNames: ['Alice', 'Google italiano', 'Microsoft Elsa'],
    testPhrase: 'Buongiorno! Vorrei un caffè, per favore.',
  },
  es: {
    fallbackLocales: ['es'], // region-neutral 'es' only; es-MX / es-419 are NOT approved for es-ES
    preferredVoiceNames: ['Mónica', 'Monica', 'Google español', 'Microsoft Elvira', 'Paulina'],
    testPhrase: 'Hola. Quiero un café, por favor.',
  },
  ar: {
    fallbackLocales: ['ar'],
    preferredVoiceNames: ['Maged', 'Google العربية', 'Microsoft Hamed', 'Microsoft Salma'],
    testPhrase: 'مرحبا! أريد قهوة من فضلك.',
  },
};

/** The speech profile for a learning language — locale from the registry + tuning from EXTRAS. */
export function speechProfile(lang: string): SpeechLanguageProfile {
  const x = EXTRAS[lang];
  return {
    locale: languageTtsTag(lang), // registry is the single source of truth for the locale
    fallbackLocales: x?.fallbackLocales ?? [],
    preferredVoiceNames: x?.preferredVoiceNames ?? [],
    testPhrase: x?.testPhrase ?? 'Hello.',
    ...(x?.defaultRate !== undefined ? { defaultRate: x.defaultRate } : {}),
  };
}
