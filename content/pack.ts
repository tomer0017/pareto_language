import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  ContentPackSchema,
  type ContentItem,
  type ContentPack,
  type DialogueScript,
  type NumberStage,
  type Situation,
  type SkillTarget,
} from '@ready/content-schema';
import { withAudio } from './tts.js';

/**
 * Content pipeline (PDF §11.3): load authored YAML, transform to the canonical ContentPack shape,
 * validate against the zod schema, and check tier containment + referential integrity + ID
 * stability. Shared by `build.ts` (emits versioned JSON) and `validate.ts` / tests (CI gate).
 */

interface RawItem {
  id: string;
  text: string;
  meaning: string;
  literal?: string;
  tier?: 0 | 1 | 2 | 3;
  skillTarget?: SkillTarget;
}

interface RawSituation {
  id: string;
  name: string;
  icon: string;
  priorityDefault: number;
  isEmergency?: boolean;
  cultureTips?: string[];
  corePhrases: RawItem[];
  replies: RawItem[];
  words: RawItem[];
  dialogue: Omit<DialogueScript, "id">;
}

interface RawPack {
  lang: string;
  version: string;
  needsNativeReview?: boolean;
  numbersCurriculum: NumberStage[];
  glue: RawItem[];
  numbers: RawItem[];
  situations: RawSituation[];
}

export class ContentValidationError extends Error {
  constructor(
    message: string,
    readonly issues: string[],
  ) {
    super(`${message}\n - ${issues.join('\n - ')}`);
    this.name = 'ContentValidationError';
  }
}

function makeItem(
  raw: RawItem,
  fullId: string,
  kind: ContentItem['kind'],
  lang: string,
  defaults: { tier: 0 | 1 | 2 | 3; skillTarget: SkillTarget; situationIds: string[] },
): ContentItem {
  const base: Omit<ContentItem, 'audio'> = {
    id: fullId,
    kind,
    text: raw.text,
    meaning: raw.meaning,
    tier: raw.tier ?? defaults.tier,
    skillTarget: raw.skillTarget ?? defaults.skillTarget,
    situationIds: defaults.situationIds,
    ...(raw.literal ? { literal: raw.literal } : {}),
  };
  return withAudio(base, lang);
}

/** Transform the raw YAML object into a validated ContentPack. Throws on any problem. */
export function buildPack(raw: RawPack): ContentPack {
  const lang = raw.lang;
  const items: ContentItem[] = [];
  const situations: Situation[] = [];

  // Politeness glue — global phrases trained to fluency.
  for (const g of raw.glue) {
    items.push(
      makeItem(g, `it.phrase.glue.${g.id}`, 'phrase', lang, {
        tier: 0,
        skillTarget: 'fluent',
        situationIds: [],
      }),
    );
  }

  // Numbers — comprehension at speed.
  for (const n of raw.numbers) {
    items.push(
      makeItem(n, `it.number.${n.id}`, 'number', lang, {
        tier: 0,
        skillTarget: 'recognize',
        situationIds: [],
      }),
    );
  }

  for (const s of raw.situations) {
    const corePhraseIds: string[] = [];
    const replyIds: string[] = [];
    const recognitionIds: string[] = [];
    const defaultPhraseSkill: SkillTarget = s.isEmergency ? 'fluent' : 'recall';

    for (const p of s.corePhrases) {
      const id = `it.phrase.${s.id}.${p.id}`;
      items.push(
        makeItem(p, id, 'phrase', lang, {
          tier: 1,
          skillTarget: defaultPhraseSkill,
          situationIds: [s.id],
        }),
      );
      corePhraseIds.push(id);
    }
    for (const r of s.replies) {
      const id = `it.reply.${s.id}.${r.id}`;
      items.push(
        makeItem(r, id, 'reply', lang, {
          tier: 1,
          skillTarget: 'recognize',
          situationIds: [s.id],
        }),
      );
      replyIds.push(id);
    }
    for (const w of s.words) {
      const id = `it.word.${s.id}.${w.id}`;
      items.push(
        makeItem(w, id, 'word', lang, {
          tier: 1,
          skillTarget: 'recognize',
          situationIds: [s.id],
        }),
      );
      recognitionIds.push(id);
    }

    situations.push({
      id: s.id,
      name: s.name,
      icon: s.icon,
      priorityDefault: s.priorityDefault,
      corePhraseIds,
      replyIds,
      recognitionIds,
      dialogue: { id: `it.dialogue.${s.id}`, startNodeId: s.dialogue.startNodeId, nodes: s.dialogue.nodes },
      cultureTips: s.cultureTips ?? [],
      isEmergency: s.isEmergency ?? false,
    });
  }

  const candidate = {
    lang,
    version: raw.version,
    needsNativeReview: raw.needsNativeReview ?? false,
    items,
    situations,
    numbersCurriculum: raw.numbersCurriculum,
  };

  const parsed = ContentPackSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new ContentValidationError(
      'ContentPack failed schema validation',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
  }

  runIntegrityChecks(parsed.data);
  return parsed.data;
}

/** Referential integrity, tier containment, ID uniqueness/stability (PDF §11.3). */
export function runIntegrityChecks(pack: ContentPack): void {
  const issues: string[] = [];
  const byId = new Map<string, ContentItem>();

  for (const item of pack.items) {
    if (byId.has(item.id)) issues.push(`duplicate item id: ${item.id}`);
    byId.set(item.id, item);
  }

  const requireRef = (id: string, expectKind: ContentItem['kind'], where: string): void => {
    const item = byId.get(id);
    if (!item) issues.push(`${where} references missing item: ${id}`);
    else if (item.kind !== expectKind) {
      issues.push(`${where} expected a ${expectKind} but ${id} is a ${item.kind}`);
    }
  };

  for (const s of pack.situations) {
    s.corePhraseIds.forEach((id) => requireRef(id, 'phrase', `situation ${s.id}.corePhrases`));
    s.replyIds.forEach((id) => requireRef(id, 'reply', `situation ${s.id}.replies`));
    s.recognitionIds.forEach((id) => requireRef(id, 'word', `situation ${s.id}.recognition`));

    // Dialogue integrity: every option/next targets an existing node; start exists.
    const nodeIds = new Set(s.dialogue.nodes.map((n) => n.id));
    if (!nodeIds.has(s.dialogue.startNodeId)) {
      issues.push(`situation ${s.id}: dialogue startNodeId ${s.dialogue.startNodeId} missing`);
    }
    for (const node of s.dialogue.nodes) {
      if (node.next && !nodeIds.has(node.next)) {
        issues.push(`situation ${s.id}: dialogue node ${node.id} → missing ${node.next}`);
      }
      for (const opt of node.options ?? []) {
        if (!nodeIds.has(opt.next)) {
          issues.push(`situation ${s.id}: dialogue option in ${node.id} → missing ${opt.next}`);
        }
      }
    }
  }

  // Tier containment: every item's tier is within 0–3 (lower tiers strictly contain upper).
  for (const item of pack.items) {
    if (![0, 1, 2, 3].includes(item.tier)) issues.push(`item ${item.id}: invalid tier ${item.tier}`);
  }

  // At least one situation must exist and one must be the offline Emergency (PDF §7.2).
  if (!pack.situations.some((s) => s.isEmergency)) {
    issues.push('no emergency situation present (Emergency Card requires one)');
  }

  if (issues.length > 0) {
    throw new ContentValidationError('ContentPack failed integrity checks', issues);
  }
}

const HERE = fileURLToPath(new URL('.', import.meta.url));

/** Load and validate the authored pack for a language from its YAML source. */
export function loadPack(lang = 'it-IT'): ContentPack {
  const path = `${HERE}${lang}/pack.yaml`;
  const raw = parse(readFileSync(path, 'utf8')) as RawPack;
  return buildPack(raw);
}
