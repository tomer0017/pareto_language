import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRIMARY_TABS, navTabOf } from '../../app/nav.js';
import { featuredStory } from '../reading/readingCore.js';
import { storyImageUrl } from '../reading/storyImages.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { MISSIONS_BY_LANG } from '../bootcamp/registry.js';
import { primaryDialogue } from '../bootcamp/missionFlow.js';
import { dialogueTranscript } from '../bootcamp/transcript.js';
import { buildSentenceDeck } from '../core/flashcards.js';
import { buildPhraseGroups, isConversationHelp } from '../core/phraseGroups.js';
import { BEGINNER_STORIES } from '../reading/content/beginnerStories.js';
import { buildUtterancePlan } from '../../shared/playback/playbackPlan.js';
import { DEFAULT_SETTINGS } from '../../shared/playback/preferences.js';
import { buildDialoguePlaylist, buildPhrasePlaylist, buildStoryPlaylist, topicOfIndex, type ListenPlaylist } from './playlists.js';
import { DEFAULT_LISTEN_MODE, LISTEN_MODES, parseListenMode, speakOrderFor } from './listenMode.js';

/**
 * Listen owns no content: every playlist is assembled from what the missions and stories already
 * contain. These tests prove it (ids and text resolve to source data), that the queue segments the
 * playlist exactly, and that the conversation-help phrases never lead.
 */
const sound = (p: ListenPlaylist): void => {
  let cursor = 0;
  for (const topic of p.topics) {
    expect(topic.start).toBe(cursor);
    expect(topic.count).toBeGreaterThan(0);
    cursor += topic.count;
  }
  expect(cursor).toBe(p.items.length); // topics tile the playlist — no gaps, no overlap
  expect(new Set(p.items.map((i) => i.id)).size).toBe(p.items.length);
  expect(new Set(p.topics.map((t) => t.id)).size).toBe(p.topics.length);
};

describe('phrase playlist — the core sentences, reused', () => {
  for (const lang of ['en', 'fr', 'es']) {
    it(`${lang}: is exactly the sentence deck (same ids, same order), with nothing invented`, () => {
      const playlist = buildPhrasePlaylist(lang, 'he');
      sound(playlist);
      expect(playlist.items.map((i) => i.id)).toEqual(buildSentenceDeck(lang).map((c) => c.id));
      // First occurrence in journey order wins (an id reused by a later mission keeps its first wording).
      const source = new Map<string, { text: string; meaning: Record<string, string> }>();
      for (const m of BOOTCAMP_PLAN) for (const i of MISSIONS_BY_LANG[lang]![m.day]!.items) if (!source.has(i.id)) source.set(i.id, i as never);
      for (const item of playlist.items) {
        expect(item.target).toBe(source.get(item.id)!.text);
        expect(item.targetLang).toBe(lang);
        expect(item.translation).toBe(source.get(item.id)!.meaning.he);
        expect(item.translationLang).toBe('he');
      }
    });
  }

  it('opens with Mission 1 (Introduce Myself); conversation-help is one topic, and it is LAST', () => {
    const playlist = buildPhrasePlaylist('en', 'en');
    expect(playlist.topics[0]!.id).toBe('introduce-myself');
    expect(playlist.topics[0]!.title).toBe('Introduce Myself');
    expect(isConversationHelp(playlist.items[0]!.id)).toBe(false);
    const help = playlist.topics.at(-1)!;
    expect(help.id).toBe('conversation-help');
    expect(help.title).toBeNull(); // labelled by the UI ("Conversation help"), not as a mission
    expect(playlist.topics.filter((t) => t.id === 'conversation-help')).toHaveLength(1);
    playlist.items.forEach((item, i) => expect(isConversationHelp(item.id)).toBe(i >= help.start));
  });

  it('follows the app language for titles and translations', () => {
    expect(buildPhrasePlaylist('en', 'he').topics[0]!.title).toBe('להציג את עצמי');
    expect(buildPhrasePlaylist('fr', 'en').items[0]!.translation).toBe('My name is Dan.');
  });

  it('mission topics follow journey order', () => {
    const order = BOOTCAMP_PLAN.map((m) => m.id);
    const ids = buildPhrasePlaylist('en', 'en').topics.map((t) => t.id).filter((id) => id !== 'conversation-help');
    expect(ids).toEqual([...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  });

  it('a language with no missions yields an empty playlist (honest empty state, no English fallback)', () => {
    expect(buildPhrasePlaylist('it', 'en')).toEqual({ topics: [], items: [] });
  });
});

describe('phrase groups — the shared grouping behind the library, Listen and review', () => {
  it('conversation-help phrases are grouped once, at the end, in every language', () => {
    for (const lang of ['en', 'fr', 'es']) {
      const groups = buildPhraseGroups(lang);
      expect(groups[0]!.kind, lang).toBe('mission');
      expect(groups[0]!.mission!.id, lang).toBe('introduce-myself');
      expect(groups.at(-1)!.kind, lang).toBe('help');
      expect(groups.filter((g) => g.kind === 'help'), lang).toHaveLength(1);
      for (const g of groups.slice(0, -1)) expect(g.items.some((i) => isConversationHelp(i.id)), lang).toBe(false);
      expect(groups.at(-1)!.items.every((i) => isConversationHelp(i.id)), lang).toBe(true);
    }
  });
});

describe('dialogue playlist — each mission\'s canonical conversation', () => {
  it('has one topic per mission, whose lines are the transcript reader\'s happy path', () => {
    const playlist = buildDialoguePlaylist('en', 'he');
    sound(playlist);
    expect(playlist.topics.map((t) => t.id)).toEqual(BOOTCAMP_PLAN.map((m) => m.id));
    for (const m of BOOTCAMP_PLAN) {
      const topic = playlist.topics.find((t) => t.id === m.id)!;
      const lines = dialogueTranscript(primaryDialogue(MISSIONS_BY_LANG.en![m.day]!)!);
      expect(playlist.items.slice(topic.start, topic.start + topic.count).map((i) => i.target)).toEqual(lines.map((l) => l.en));
    }
  });

  it('French lines are French with an app-language translation (no English leak as the spoken line)', () => {
    const playlist = buildDialoguePlaylist('fr', 'en');
    sound(playlist);
    for (const item of playlist.items) {
      expect(item.targetLang).toBe('fr');
      expect(item.translation).toBeTruthy();
      expect(item.target).not.toBe(item.translation);
    }
  });
});

describe('story playlist — the reading collection, heard', () => {
  it('is one topic per story, sentence for sentence', () => {
    const stories = BEGINNER_STORIES.stories;
    const playlist = buildStoryPlaylist(stories, 'en', 'he');
    sound(playlist);
    expect(playlist.topics.map((t) => t.id)).toEqual(stories.map((s) => s.id));
    expect(playlist.items).toHaveLength(stories.reduce((n, s) => n + s.sentences.length, 0));
    expect(playlist.items[0]!.target).toBe(stories[0]!.sentences[0]!.target.en);
    expect(buildStoryPlaylist(stories, 'fr', 'en').items[0]!.target).toBe(stories[0]!.sentences[0]!.target.fr);
    expect(buildStoryPlaylist([], 'en', 'he')).toEqual({ topics: [], items: [] });
  });
});

describe('topicOfIndex — which queue row is playing', () => {
  it('maps every playlist index to the topic that owns it', () => {
    const playlist = buildPhrasePlaylist('en', 'en');
    expect(topicOfIndex(playlist, 0)!.id).toBe('introduce-myself');
    const second = playlist.topics[1]!;
    expect(topicOfIndex(playlist, second.start - 1)!.id).toBe('introduce-myself');
    expect(topicOfIndex(playlist, second.start)!.id).toBe(second.id);
    expect(topicOfIndex(playlist, playlist.items.length - 1)!.id).toBe('conversation-help');
    expect(topicOfIndex(playlist, playlist.items.length)).toBeUndefined();
    expect(topicOfIndex({ topics: [], items: [] }, 0)).toBeUndefined();
  });
});

describe('listening modes — strategies over the same sentence, never new content', () => {
  const item = buildPhrasePlaylist('en', 'he').items[0]!;
  const spoken = (mode: Parameters<typeof speakOrderFor>[0], repeat: 1 | 2 | 3 = 1) =>
    buildUtterancePlan(item, { ...DEFAULT_SETTINGS, repeat }, speakOrderFor(mode)).filter((s) => s.kind === 'speak');

  it('Hebrew → English speaks the translation first, each in its own voice', () => {
    expect(spoken('tr-first').map((s) => [s.role, s.lang])).toEqual([['translation', 'he'], ['target', 'en']]);
  });
  it('English only speaks just the sentence', () => {
    expect(spoken('target-only').map((s) => s.role)).toEqual(['target']);
  });
  it('English → Hebrew speaks the sentence first', () => {
    expect(spoken('target-first').map((s) => s.role)).toEqual(['target', 'translation']);
  });
  it('"repeats" means how many times a sentence is said — a spoken step has no rate at all', () => {
    const once = spoken('target-only', 1);
    const thrice = spoken('target-only', 3);
    expect(once).toHaveLength(1);
    expect(thrice).toHaveLength(3);
    for (const s of thrice) expect('rate' in s).toBe(false);
  });
  it('parses stored modes safely', () => {
    for (const m of LISTEN_MODES) expect(parseListenMode(m)).toBe(m);
    expect(parseListenMode('nonsense')).toBe(DEFAULT_LISTEN_MODE);
    expect(parseListenMode(null)).toBe(DEFAULT_LISTEN_MODE);
  });
});

describe('Stories are discoverable from Listen (and stay under it)', () => {
  const stories = BEGINNER_STORIES.stories;
  const read = (p: string): string => readFileSync(new URL(p, import.meta.url), 'utf8');

  it('features a real story: the first one for a new reader', () => {
    const pick = featuredStory(stories, {})!;
    expect(pick.story).toBe(stories[0]);
    expect(pick).toMatchObject({ inProgress: false, allDone: false });
    expect(storyImageUrl(pick.story)).toContain(encodeURIComponent(pick.story.title.target.en)); // its own cover
  });

  it('prefers the story being read, then the first unfinished — from stored progress only', () => {
    const a = stories[0]!.id, b = stories[1]!.id, c = stories[2]!.id;
    expect(featuredStory(stories, { [a]: { pos: 5, done: true } })!.story.id).toBe(b);
    const mid = featuredStory(stories, { [a]: { pos: 5, done: true }, [c]: { pos: 3, done: false } })!;
    expect(mid.story.id).toBe(c);
    expect(mid.inProgress).toBe(true);
  });

  it('when every story is finished it offers the first again, and says so', () => {
    const all = Object.fromEntries(stories.map((s) => [s.id, { pos: 9, done: true }]));
    expect(featuredStory(stories, all)).toMatchObject({ story: stories[0], inProgress: false, allDone: true });
    expect(featuredStory([], {})).toBeNull();
  });

  it('Listen shows the story card and opens the reader on that story; there is still no Stories tab', () => {
    const listen = read('./Listen.tsx');
    expect(listen).toContain('<StoryCard');
    expect(listen).toContain("open('reading', id)");
    expect(listen).toContain('storyImageUrl(story)');
    expect(PRIMARY_TABS).toEqual(['home', 'bootcamp', 'listen', 'profile']);
    expect(navTabOf('reading')).toBe('listen');
  });
});
