import { BOOTCAMP_PLAN, type MissionPlan } from '../bootcamp/plan.js';
import { missionsFor } from '../bootcamp/registry.js';
import type { BootcampItem } from '../bootcamp/types.js';

/**
 * The canonical catalog of every sentence READY teaches in a learning language — the ONE source of
 * truth for the sentence library, Listen, review and every "N core sentences" count. PURE (registry
 * only, no store).
 *
 * Identity. A sentence is canonical once per learning language:
 *   - one id never means two sentences — if two missions gave the same id different wording the
 *     catalog would have to drop one silently, so `sentenceIdConflicts` reports it and a test keeps
 *     that list empty;
 *   - one wording is counted and listed once — missions sometimes re-declare an identical sentence
 *     under a context-specific id ("How much is it?" in Money, Street Food…). The first id in journey
 *     order is the canonical one; the later ids are ALIASES of it (`aliases`), so practice logged
 *     under any of them still counts for the sentence, and nobody hears it three times in Listen.
 *
 * Order is a product decision: missions first, in journey order, each with the sentences it
 * introduces. The shared conversation-help phrases ("Can you repeat that?") come LAST — they are
 * contextual support inside dialogues, never the learner's first encounter with the language.
 */

export const isConversationHelp = (id: string): boolean => id.includes('.phrase.recovery.');

export interface PhraseGroup {
  /** `mission` groups carry their plan entry; the single `help` group holds the shared phrases. */
  kind: 'mission' | 'help';
  mission?: MissionPlan;
  items: BootcampItem[];
}

export interface SentenceCatalog {
  groups: PhraseGroup[];
  /** Canonical sentence count — what every screen shows as "N core sentences". */
  count: number;
  /** alias id → canonical id, for ids whose wording duplicates an earlier sentence. */
  aliases: Map<string, string>;
  /** The mission (plan `day`) where each canonical sentence first appears. */
  firstDay: Map<string, number>;
}

const wordingKey = (text: string): string => text.trim().toLowerCase().replace(/\s+/g, ' ');

const cache = new Map<string, SentenceCatalog>();

export function sentenceCatalog(lang: string): SentenceCatalog {
  const hit = cache.get(lang);
  if (hit) return hit;
  const missions = missionsFor(lang);
  const seenIds = new Set<string>();
  const byWording = new Map<string, string>();
  const aliases = new Map<string, string>();
  const firstDay = new Map<string, number>();
  const help: BootcampItem[] = [];
  const groups: PhraseGroup[] = [];
  for (const mission of BOOTCAMP_PLAN) {
    const day = missions[mission.day];
    if (!day) continue;
    const own: BootcampItem[] = [];
    for (const item of day.items) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      const key = wordingKey(item.text);
      const canonical = byWording.get(key);
      if (canonical !== undefined) { aliases.set(item.id, canonical); continue; }
      byWording.set(key, item.id);
      firstDay.set(item.id, mission.day);
      (isConversationHelp(item.id) ? help : own).push(item);
    }
    if (own.length) groups.push({ kind: 'mission', mission, items: own });
  }
  if (help.length) groups.push({ kind: 'help', items: help });
  const catalog: SentenceCatalog = { groups, count: groups.reduce((n, g) => n + g.items.length, 0), aliases, firstDay };
  cache.set(lang, catalog);
  return catalog;
}

/** The catalog's groups (library / Listen order). */
export function buildPhraseGroups(lang: string): PhraseGroup[] {
  return sentenceCatalog(lang).groups;
}

/**
 * Ids the Core used to practise and no longer declares. They are in no mission any more, so the
 * catalog cannot derive them; practice already stored under one must keep counting for the Core
 * sentence that took its place. (Suffixes — the language prefix is added per language.)
 *
 * All three were borrowed by the old Dress Rehearsal (Mission 29) from the Extended material; the
 * mission now says the Core sentence at the same turn:
 *   - `phrase.rest.table-for-two` → `phrase.rest.table-two`  ("A table for two, please." — same wording)
 *   - `phrase.rest.bill-please`   → `phrase.rest.the-bill`   ("Could we have the bill, please?" → "The bill, please.")
 *   - `phrase.pay.by-card`        → `phrase.money.by-card`   ("I'll pay by card." → "By card, please.")
 * A target must be a sentence the Core declares (a test enforces it in every language).
 */
export const LEGACY_ALIASES: Readonly<Record<string, string>> = {
  'phrase.rest.table-for-two': 'phrase.rest.table-two',
  'phrase.rest.bill-please': 'phrase.rest.the-bill',
  'phrase.pay.by-card': 'phrase.money.by-card',
};

/** The canonical id for any sentence id (itself, unless it is an alias of an earlier sentence). */
export function canonicalSentenceId(lang: string, id: string): string {
  const hit = sentenceCatalog(lang).aliases.get(id);
  if (hit) return hit;
  const legacy = id.startsWith(`${lang}.`) ? LEGACY_ALIASES[id.slice(lang.length + 1)] : undefined;
  // The target may itself be a later id of an earlier wording — resolve it to the canonical one.
  return legacy ? (sentenceCatalog(lang).aliases.get(`${lang}.${legacy}`) ?? `${lang}.${legacy}`) : id;
}

export interface IdConflict {
  id: string;
  /** The different wordings found under this one id, with the mission (day) of each. */
  wordings: { day: number; text: string }[];
}

/** Ids that carry more than one wording across a language's missions. Must always be empty. */
export function sentenceIdConflicts(lang: string): IdConflict[] {
  const missions = missionsFor(lang);
  const seen = new Map<string, { day: number; text: string }[]>();
  for (const mission of BOOTCAMP_PLAN) {
    for (const item of missions[mission.day]?.items ?? []) {
      const uses = seen.get(item.id) ?? [];
      if (!uses.some((u) => wordingKey(u.text) === wordingKey(item.text))) uses.push({ day: mission.day, text: item.text });
      seen.set(item.id, uses);
    }
  }
  return [...seen].filter(([, wordings]) => wordings.length > 1).map(([id, wordings]) => ({ id, wordings }));
}
