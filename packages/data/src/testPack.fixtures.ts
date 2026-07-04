import type { ContentItem, ContentPack } from '@ready/content-schema';

export function item(
  id: string,
  kind: ContentItem['kind'] = 'phrase',
  skillTarget: ContentItem['skillTarget'] = 'recall',
): ContentItem {
  return {
    id,
    kind,
    text: id,
    meaning: id,
    audio: { natural: `${id}.mp3` },
    tier: 1,
    skillTarget,
    situationIds: [],
  };
}

export const testPack: ContentPack = {
  lang: 'it',
  version: '0.1.0',
  needsNativeReview: false,
  items: [item('it.phrase.a'), item('it.phrase.b'), item('it.reply.c', 'reply', 'recognize')],
  situations: [],
  numbersCurriculum: [],
};
