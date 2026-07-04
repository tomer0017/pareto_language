import { fileURLToPath } from 'node:url';
import type { ContentPack } from '@ready/content-schema';
import { loadPack } from '../services/content.js';
import { packDal, phraseDal, situationDal, wordDal, type UpsertSummary } from '../dal/contentDal.js';
import type { ContentPackDoc, PhraseDoc, SituationDoc, WordDoc } from '../models/content.js';
import { bankToWords, parseBank, printBankReport } from './bank.js';

/**
 * Seed system — idempotent by design: every writer upserts by stable _id, so re-running any
 * seed is safe and reports updated/unchanged instead of duplicating.
 * Sources of truth: the validated Italian pack (pipeline-built JSON) + the vocabulary bank.
 */

const BANK_PATH = fileURLToPath(new URL('../../../content/vocab/bank.tsv', import.meta.url));

function log(label: string, s: UpsertSummary): void {
  console.info(`  ${label}: inserted ${s.inserted}, updated ${s.updated}, unchanged ${s.skipped}`);
}

/** Italian (validated pack) → words + phrases + situations collections. */
export async function seedItalianFromPack(): Promise<ContentPack> {
  const pack = loadPack('it');

  const words: WordDoc[] = pack.items
    .filter((i) => i.kind === 'word' || i.kind === 'number')
    .map((i) => ({
      _id: i.id,
      languageCode: 'it',
      word: i.text,
      translations: { en: i.meaning },
      tags: [i.kind, `tier${i.tier}`, ...i.situationIds],
      level: `tier${i.tier}`,
      source: `it-pack-v${pack.version}`,
    }));

  const phrases: PhraseDoc[] = pack.items
    .filter((i) => i.kind === 'phrase' || i.kind === 'reply')
    .map((i) => ({
      _id: i.id,
      languageCode: 'it',
      text: i.text,
      translations: { en: i.meaning },
      situationSlug: i.situationIds[0],
      level: `tier${i.tier}`,
      tags: [i.kind, i.skillTarget],
      source: `it-pack-v${pack.version}`,
    }));

  const situations: SituationDoc[] = pack.situations.map((s) => ({
    _id: `it.situation.${s.id}`,
    slug: s.id,
    languageCode: 'it',
    title: { en: s.name },
    icon: s.icon,
    phraseIds: [...s.corePhraseIds, ...s.replyIds],
    readinessCategory: s.isEmergency ? 'emergency' : s.id,
  }));

  log('it words', await wordDal.upsertMany(words));
  log('it phrases', await phraseDal.upsertMany(phrases));
  log('it situations', await situationDal.upsertMany(situations));
  return pack;
}

/** Vocabulary bank → recognition words for fr / es / en. */
export async function seedBankWords(): Promise<void> {
  const { rows, report } = parseBank(BANK_PATH);
  const words = bankToWords(rows);
  report.wordsGenerated = words.length;
  log('bank words', await wordDal.upsertMany(words));
  printBankReport(report);
}

/** Content pack registry — all five languages exist from day one; only Italian is active. */
export async function seedContentPacks(): Promise<void> {
  let itPack: ContentPack | null = null;
  try {
    itPack = loadPack('it');
  } catch {
    console.warn('  it pack JSON not built (npm run build:content) — Italian will be draft');
  }

  const counts = async (lang: string) => ({
    wordCount: await wordDal.count(lang),
    phraseCount: await phraseDal.count(lang),
    situationCount: await situationDal.count(lang),
  });

  const docs: ContentPackDoc[] = [];
  docs.push({
    _id: 'it',
    languageCode: 'it',
    status: itPack ? 'active' : 'draft',
    version: itPack?.version ?? '0.0.0',
    validated: itPack !== null, // validated by the pipeline's schema+integrity gate; native review pending
    notes: itPack
      ? 'Validated by pipeline (schema + integrity). needsNativeReview=true — human native sign-off pending (R1).'
      : 'Pack JSON missing — run npm run build:content, then reseed.',
    ...(itPack ? { payload: itPack } : {}),
    ...(await counts('it')),
  });
  for (const lang of ['en', 'es', 'fr', 'ar']) {
    docs.push({
      _id: lang,
      languageCode: lang,
      status: 'coming_soon',
      version: '0.0.0',
      validated: false,
      notes:
        lang === 'ar'
          ? 'No content yet: needs full pack (words, travel phrases, replies, situations) + RTL review.'
          : 'Recognition words seeded from the vocabulary bank; travel phrases, replies and situations still required to activate.',
      ...(await counts(lang)),
    });
  }
  for (const d of docs) await packDal.upsert(d);
  console.info(`  contentPacks: upserted ${docs.length} language rows (it=${docs[0]?.status})`);
}

export async function seedAll(): Promise<void> {
  await seedItalianFromPack();
  await seedBankWords();
  await seedContentPacks();
}
