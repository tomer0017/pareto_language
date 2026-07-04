import type {
  ContentItem,
  ContentPack,
  DialogueScript,
  ItemKind,
  Situation,
  SkillTarget,
  Tier,
} from '@ready/content-schema';

/** Build a single ContentItem with sensible defaults for tests. */
export function makeItem(partial: Partial<ContentItem> & Pick<ContentItem, 'id'>): ContentItem {
  return {
    kind: 'phrase',
    text: partial.text ?? `text-${partial.id}`,
    meaning: partial.meaning ?? `meaning-${partial.id}`,
    audio: { natural: `audio/${partial.id}.mp3` },
    tier: 1,
    skillTarget: 'recall',
    situationIds: [],
    ...partial,
  };
}

function makeDialogue(id: string): DialogueScript {
  return {
    id: `${id}.dialogue`,
    startNodeId: 'n1',
    nodes: [
      { id: 'n1', speaker: 'npc', text: 'Buongiorno', meaning: 'Good morning', next: 'n2' },
      {
        id: 'n2',
        speaker: 'user',
        text: 'Buongiorno',
        meaning: 'Good morning',
        options: [
          { text: 'Buongiorno', meaning: 'Good morning', next: 'n3', correct: true },
          { text: '...', meaning: '(freeze)', next: 'n3', correct: false },
        ],
      },
      { id: 'n3', speaker: 'npc', text: 'Prego', meaning: "You're welcome", next: 'n1' },
    ],
  };
}

const defaultSkill: Record<ItemKind, SkillTarget> = {
  phrase: 'recall',
  reply: 'recognize',
  word: 'recognize',
  number: 'recognize',
};

export interface SyntheticPackOptions {
  situations?: number;
  corePhrasesPer?: number;
  repliesPer?: number;
  wordsPer?: number;
  /** Number of Tier-0 survival phrases (subset promoted to tier 0). */
  tier0Phrases?: number;
  lang?: string;
  version?: string;
}

/**
 * Generate a synthetic but structurally faithful content pack for engine tests: N situations, each
 * with core phrases (recall target), likely replies (recognize), recognition words, a dialogue,
 * plus a small numbers curriculum. A subset of phrases are marked Tier 0.
 */
export function makeSyntheticPack(opts: SyntheticPackOptions = {}): ContentPack {
  const situationsCount = opts.situations ?? 8;
  const corePer = opts.corePhrasesPer ?? 8;
  const repliesPer = opts.repliesPer ?? 4;
  const wordsPer = opts.wordsPer ?? 2;
  const tier0Phrases = opts.tier0Phrases ?? 12;

  const items: ContentItem[] = [];
  const situations: Situation[] = [];
  let promoted = 0;

  for (let s = 0; s < situationsCount; s++) {
    const sid = `sit${s}`;
    const isEmergency = s === situationsCount - 1;
    const corePhraseIds: string[] = [];
    const replyIds: string[] = [];
    const recognitionIds: string[] = [];

    for (let p = 0; p < corePer; p++) {
      const id = `${sid}.phrase.${p}`;
      const tier: Tier = promoted < tier0Phrases ? 0 : 1;
      if (tier === 0) promoted++;
      items.push(
        makeItem({
          id,
          kind: 'phrase',
          tier,
          skillTarget: isEmergency ? 'fluent' : 'recall',
          situationIds: [sid],
          frequencyRank: s * 100 + p,
        }),
      );
      corePhraseIds.push(id);
    }
    for (let r = 0; r < repliesPer; r++) {
      const id = `${sid}.reply.${r}`;
      items.push(
        makeItem({ id, kind: 'reply', tier: 1, skillTarget: 'recognize', situationIds: [sid] }),
      );
      replyIds.push(id);
    }
    for (let w = 0; w < wordsPer; w++) {
      const id = `${sid}.word.${w}`;
      items.push(
        makeItem({ id, kind: 'word', tier: 1, skillTarget: 'recognize', situationIds: [sid] }),
      );
      recognitionIds.push(id);
    }

    situations.push({
      id: sid,
      name: `Situation ${s}`,
      icon: 'circle',
      priorityDefault: situationsCount - s,
      corePhraseIds,
      replyIds,
      recognitionIds,
      dialogue: makeDialogue(sid),
      cultureTips: [],
      isEmergency,
    });
  }

  // A few standalone numbers (Tier 0), no situation.
  for (let n = 0; n <= 5; n++) {
    items.push(
      makeItem({
        id: `num.${n}`,
        kind: 'number',
        tier: 0,
        skillTarget: 'recognize',
        situationIds: [],
        text: String(n),
        meaning: String(n),
      }),
    );
  }

  void defaultSkill;

  return {
    lang: opts.lang ?? 'it',
    version: opts.version ?? '0.1.0',
    needsNativeReview: true,
    items,
    situations,
    numbersCurriculum: [
      { id: 'ns0', label: '0–20', kind: 'integer', min: 0, max: 20 },
      { id: 'ns1', label: 'tens', kind: 'integer', min: 20, max: 100 },
      { id: 'ns2', label: 'prices', kind: 'price', min: 1, max: 100 },
    ],
  };
}
