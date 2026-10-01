import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { MISSIONS_BY_LANG } from '../bootcamp/registry.js';
import { RECOVERY_ITEMS } from '../bootcamp/recovery.js';
import { buildDialoguePlaylist, buildPhrasePlaylist } from '../listen/playlists.js';
import { buildSentenceDeck } from './flashcards.js';
import { buildPhraseGroups, canonicalSentenceId, isConversationHelp, sentenceCatalog, sentenceIdConflicts } from './phraseGroups.js';
import { pickReviewCards, practicedIds } from './review.js';

/**
 * Sentence identity — the foundation the review log (and, later, cloud progress) stands on:
 *   1. one id never means two different sentences;
 *   2. one wording is one canonical sentence, however many missions re-declare it;
 *   3. the canonical count comes from the catalog, and every surface reads that same count.
 */
const LANGS = ['en', 'fr', 'es'] as const;
const wording = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, ' ');

describe('one id = one sentence', () => {
  for (const lang of LANGS) {
    it(`${lang}: no sentence id carries two different wordings`, () => {
      expect(sentenceIdConflicts(lang)).toEqual([]);
    });
  }

  it('the detector really catches a conflict (it is not vacuously empty)', () => {
    // The bug this replaced: Restaurant Meal said "the chicken", Restaurant Basics "the pasta" — same id.
    const meal = MISSIONS_BY_LANG.en![4]!.items.find((i) => i.id === 'en.phrase.rest.ill-have-chicken')!;
    const basics = MISSIONS_BY_LANG.en![12]!.items.find((i) => i.id === 'en.phrase.rest.ill-have')!;
    expect(meal.text).toBe("I'll have the chicken.");
    expect(basics.text).toBe("I'll have the pasta, please.");
    expect(meal.id).not.toBe(basics.id);
  });

  it('the two "I\'ll have…" sentences are distinct ids in every language, and both are listed', () => {
    for (const lang of LANGS) {
      const ids = new Set(buildSentenceDeck(lang).map((c) => c.id));
      expect(ids.has(`${lang}.phrase.rest.ill-have-chicken`), lang).toBe(true);
      expect(ids.has(`${lang}.phrase.rest.ill-have`), lang).toBe(true);
      // Every mission that references either id carries the matching item.
      for (const m of BOOTCAMP_PLAN) {
        const day = MISSIONS_BY_LANG[lang]![m.day]!;
        const own = new Set(day.items.map((i) => i.id));
        const used = [
          ...day.steps.flatMap((s) => (s.kind === 'tool' || s.kind === 'quiz' ? [s.itemId] : s.kind === 'replies' ? [s.saidItemId] : [])),
          ...Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => (n.choices ?? []).map((c) => c.itemId ?? ''))),
        ].filter((id) => id.includes('.rest.ill-have'));
        for (const id of used) expect(own.has(id), `${lang} ${m.id} → ${id}`).toBe(true);
      }
    }
  });
});

describe('one wording = one canonical sentence', () => {
  for (const lang of LANGS) {
    it(`${lang}: the catalog lists every distinct wording exactly once`, () => {
      const catalog = sentenceCatalog(lang);
      const listed = catalog.groups.flatMap((g) => g.items);
      expect(new Set(listed.map((i) => i.id)).size).toBe(listed.length);
      expect(new Set(listed.map((i) => wording(i.text))).size).toBe(listed.length);

      // Independent count straight from the mission registry — the source of truth.
      const all = BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items);
      const distinctWordings = new Set(all.map((i) => wording(i.text))).size;
      const distinctIds = new Set(all.map((i) => i.id)).size;
      expect(catalog.count).toBe(distinctWordings);
      expect(catalog.count + catalog.aliases.size).toBe(distinctIds); // nothing dropped: every id is canonical or an alias
    });

    it(`${lang}: every alias points at a canonical sentence with the SAME wording`, () => {
      const catalog = sentenceCatalog(lang);
      const text = new Map(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items).map((i) => [i.id, i.text]));
      const canonicalIds = new Set(catalog.groups.flatMap((g) => g.items.map((i) => i.id)));
      for (const [alias, canonical] of catalog.aliases) {
        expect(canonicalIds.has(canonical), alias).toBe(true);
        expect(canonicalIds.has(alias), alias).toBe(false);
        expect(wording(text.get(alias)!), alias).toBe(wording(text.get(canonical)!));
        expect(canonicalSentenceId(lang, alias)).toBe(canonical);
      }
      expect(canonicalSentenceId(lang, 'not-an-id')).toBe('not-an-id');
    });
  }

  it('"How much is it?" is one sentence, first taught in Numbers & Money, though three missions declare it', () => {
    const catalog = sentenceCatalog('en');
    const hits = catalog.groups.flatMap((g) => g.items).filter((i) => i.text === 'How much is it?');
    expect(hits.map((i) => i.id)).toEqual(['en.phrase.money.how-much']);
    expect(catalog.aliases.get('en.phrase.street.how-much')).toBe('en.phrase.money.how-much');
    expect(catalog.aliases.get('en.phrase.sim.how-much')).toBe('en.phrase.money.how-much');
  });
});

describe('ONE canonical count, read by every surface', () => {
  for (const lang of LANGS) {
    it(`${lang}: library = flashcard deck = Listen playlist = the catalog count`, () => {
      const count = sentenceCatalog(lang).count;
      expect(buildPhraseGroups(lang).reduce((n, g) => n + g.items.length, 0)).toBe(count);
      expect(buildSentenceDeck(lang)).toHaveLength(count);
      expect(buildPhrasePlaylist(lang, 'he').items).toHaveLength(count);
      expect(buildPhrasePlaylist(lang, 'he').items.map((i) => i.id)).toEqual(buildSentenceDeck(lang).map((c) => c.id));
    });
  }

  it('the count is whatever the content says — it is not pinned to a remembered number', () => {
    const counts = Object.fromEntries(LANGS.map((l) => [l, sentenceCatalog(l).count]));
    for (const lang of LANGS) {
      expect(counts[lang]).toBeGreaterThan(200);
      expect(counts[lang]).toBeLessThan(262); // 262 ids, minus the wordings declared more than once
    }
  });

  it('dialogues are untouched by sentence canonicalisation (still one conversation per mission)', () => {
    expect(buildDialoguePlaylist('en', 'he').topics).toHaveLength(BOOTCAMP_PLAN.length);
  });
});

describe('practice counts once per sentence, under any of its ids', () => {
  const deck = buildSentenceDeck('en');
  const canonical = (id: string): string => canonicalSentenceId('en', id);
  const at = '2026-01-01T10:00:00Z';

  it('a drill logged under an alias id counts for the canonical sentence', () => {
    const log = [{ itemId: 'en.phrase.street.how-much', outcome: 'pass', at }];
    expect(practicedIds(deck, log).size).toBe(0); // without canonicalisation the drill would be lost
    expect(practicedIds(deck, log, canonical)).toEqual(new Set(['en.phrase.money.how-much']));
  });

  it('drilling the same wording under three ids is ONE practiced sentence, not three', () => {
    const log = ['en.phrase.money.how-much', 'en.phrase.street.how-much', 'en.phrase.sim.how-much'].map((itemId) => ({ itemId, outcome: 'pass', at }));
    expect(practicedIds(deck, log, canonical).size).toBe(1);
    expect(pickReviewCards(deck, log, 5, canonical).map((c) => c.id)).toEqual(['en.phrase.money.how-much']);
  });

  it('practiced can never exceed the canonical total', () => {
    const everyId = BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG.en![m.day]!.items.map((i) => ({ itemId: i.id, outcome: 'pass', at })));
    expect(practicedIds(deck, everyId, canonical).size).toBe(deck.length);
  });
});

describe('conversation help — six phrases, last, never first', () => {
  it('the help group is exactly the kit phrases that missions actually use', () => {
    for (const lang of LANGS) {
      const groups = buildPhraseGroups(lang);
      const help = groups.at(-1)!;
      expect(help.kind, lang).toBe('help');
      expect(help.items, lang).toHaveLength(6);
      expect(groups[0]!.kind, lang).toBe('mission');
      expect(groups.slice(0, -1).some((g) => g.items.some((i) => isConversationHelp(i.id))), lang).toBe(false);
    }
  });

  it('the seventh kit phrase ("Sorry!") is defined but used by no mission — so it is not listed', () => {
    const used = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG.en![m.day]!.items.map((i) => i.id)));
    const unused = RECOVERY_ITEMS.filter((i) => !used.has(i.id));
    expect(RECOVERY_ITEMS).toHaveLength(7);
    expect(unused.map((i) => i.text)).toEqual(['Sorry!']);
    expect(buildSentenceDeck('en').some((c) => c.id === unused[0]!.id)).toBe(false);
  });
});
