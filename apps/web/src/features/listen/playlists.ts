import type { LocalizedText } from '@ready/content-schema';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionsFor } from '../bootcamp/registry.js';
import { missionIcon, primaryDialogue } from '../bootcamp/missionFlow.js';
import { dialogueTranscript } from '../bootcamp/transcript.js';
import { buildPhraseGroups } from '../core/phraseGroups.js';
import { buildStoryItems } from '../reading/readingCore.js';
import type { ReadingLang, Story } from '../reading/types.js';
import type { PlaybackItem } from '../../shared/playback/types.js';

/**
 * Listen playlists — passive listening built ENTIRELY from content READY already teaches. PURE.
 *
 * A playlist is one flat list of {@link PlaybackItem} for the shared playback engine, plus the
 * `topics` that segment it (a mission, a story). The "queue" the learner sees is just those topics:
 * playing through the flat list walks the queue in order, and tapping a topic jumps to its first
 * item. No sentence, dialogue line or story is copied or re-authored here — every item is read from
 * the mission registry / the reading collection at call time.
 */

const localize = (text: LocalizedText, lang: string): string => {
  const rec = text as Record<string, string | undefined>;
  return rec[lang] ?? rec.en ?? '';
};

export type ListenCategory = 'phrases' | 'dialogues' | 'stories';

export interface ListenTopic {
  id: string;
  /** Title in the app language (a mission / story title), or null for the shared-help group — the UI
   *  supplies that label from its string table. */
  title: string | null;
  icon: string;
  /** Index of this topic's first item in the playlist. */
  start: number;
  count: number;
}

export interface ListenPlaylist {
  topics: ListenTopic[];
  items: PlaybackItem[];
}

/** The topic that owns a playlist index (or undefined for an empty playlist). */
export function topicOfIndex(playlist: ListenPlaylist, index: number): ListenTopic | undefined {
  return playlist.topics.find((tp) => index >= tp.start && index < tp.start + tp.count);
}

/** Core sentences, mission by mission in journey order; shared conversation-help phrases last. */
export function buildPhrasePlaylist(learningLang: string, appLang: string): ListenPlaylist {
  const missions = missionsFor(learningLang);
  const topics: ListenTopic[] = [];
  const items: PlaybackItem[] = [];
  for (const group of buildPhraseGroups(learningLang)) {
    topics.push({
      id: group.mission ? group.mission.id : 'conversation-help',
      title: group.mission ? localize(group.mission.title, appLang) : null,
      icon: group.mission ? missionIcon(missions[group.mission.day]) : '💬',
      start: items.length,
      count: group.items.length,
    });
    for (const item of group.items) {
      items.push({ id: item.id, target: item.text, targetLang: learningLang, translation: localize(item.meaning, appLang), translationLang: appLang });
    }
  }
  return { topics, items };
}

/** Each mission's canonical conversation (the same happy path the transcript reader shows). */
export function buildDialoguePlaylist(learningLang: string, appLang: string): ListenPlaylist {
  const missions = missionsFor(learningLang);
  const topics: ListenTopic[] = [];
  const items: PlaybackItem[] = [];
  for (const mission of BOOTCAMP_PLAN) {
    const day = missions[mission.day];
    const dialogue = day ? primaryDialogue(day) : null;
    if (!day || !dialogue) continue;
    const lines = dialogueTranscript(dialogue);
    if (lines.length === 0) continue;
    topics.push({ id: mission.id, title: localize(mission.title, appLang), icon: missionIcon(day), start: items.length, count: lines.length });
    lines.forEach((line, i) => {
      // English missions carry {en: the line itself, he}; other languages carry an explicit `tr`.
      const tr = line.tr ?? ({ en: line.en, he: line.he } as LocalizedText);
      items.push({ id: `${mission.id}:${dialogue.id}:${i}`, target: line.en, targetLang: learningLang, translation: localize(tr, appLang), translationLang: appLang });
    });
  }
  return { topics, items };
}

/** Stories from an already-loaded reading collection, one topic per story. */
export function buildStoryPlaylist(stories: readonly Story[], learningLang: ReadingLang, appLang: string): ListenPlaylist {
  const topics: ListenTopic[] = [];
  const items: PlaybackItem[] = [];
  for (const story of stories) {
    const sentences = buildStoryItems(story, learningLang, appLang);
    if (sentences.length === 0) continue;
    topics.push({ id: story.id, title: localize(story.title.tr, appLang), icon: '📖', start: items.length, count: sentences.length });
    for (const sen of sentences) items.push({ ...sen, id: `${story.id}:${sen.id}` });
  }
  return { topics, items };
}
