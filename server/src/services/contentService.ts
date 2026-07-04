import type { ContentPack } from '@ready/content-schema';
import { packDal, phraseDal, situationDal, wordDal } from '../dal/contentDal.js';
import { AppError } from '../middleware/error.js';

/** The five supported learning languages — the DB and API carry all of them from day one. */
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
] as const;

export const LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code as string));

export function assertLanguage(code: string): void {
  if (!LANGUAGE_CODES.has(code)) throw new AppError(404, 'unknown_language', `Unsupported language "${code}"`);
}

export const contentService = {
  /** Languages + their pack status in one call (drives selectors and "coming soon"). */
  async languages() {
    const packs = await packDal.list();
    const byLang = new Map(packs.map((p) => [p.languageCode, p]));
    return LANGUAGES.map((l) => {
      const pack = byLang.get(l.code);
      return {
        ...l,
        status: pack?.status ?? 'draft',
        validated: pack?.validated ?? false,
        version: pack?.version ?? null,
        wordCount: pack?.wordCount ?? 0,
        phraseCount: pack?.phraseCount ?? 0,
        situationCount: pack?.situationCount ?? 0,
      };
    });
  },

  listPacks: () => packDal.list(),

  async packMeta(languageCode: string) {
    assertLanguage(languageCode);
    const pack = await packDal.byLanguage(languageCode);
    if (!pack) throw new AppError(404, 'pack_not_found', `No content pack row for "${languageCode}" — run npm run seed:content-packs`);
    return pack;
  },

  /** Canonical engine ContentPack payload — what the PWA consumes (active packs only). */
  async packPayload(languageCode: string): Promise<ContentPack> {
    assertLanguage(languageCode);
    const pack = await packDal.byLanguage(languageCode, true);
    if (!pack || pack.status !== 'active' || !pack.payload) {
      throw new AppError(404, 'pack_unavailable', `No active pack payload for "${languageCode}"`);
    }
    return pack.payload as ContentPack;
  },

  async words(languageCode: string) {
    assertLanguage(languageCode);
    return wordDal.list(languageCode);
  },
  async wordById(id: string) {
    const doc = await wordDal.byId(id);
    if (!doc) throw new AppError(404, 'word_not_found', `No word "${id}"`);
    return doc;
  },

  async phrases(languageCode: string, situationSlug?: string) {
    assertLanguage(languageCode);
    return phraseDal.list(languageCode, situationSlug);
  },
  async phraseById(id: string) {
    const doc = await phraseDal.byId(id);
    if (!doc) throw new AppError(404, 'phrase_not_found', `No phrase "${id}"`);
    return doc;
  },

  async situations(languageCode: string) {
    assertLanguage(languageCode);
    return situationDal.list(languageCode);
  },
  async situationBySlug(languageCode: string, slug: string) {
    assertLanguage(languageCode);
    const doc = await situationDal.bySlug(languageCode, slug);
    if (!doc) throw new AppError(404, 'situation_not_found', `No situation "${slug}" for "${languageCode}"`);
    return doc;
  },
};
