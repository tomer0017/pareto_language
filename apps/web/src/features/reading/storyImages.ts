import type { Story } from './types.js';

/**
 * Reading illustrations — presentation only (no story data, no business logic). Every beginner story
 * ships a hand-drawn illustration in `public/images/stories/`, named EXACTLY after the story's English
 * title (the canonical source string), e.g. `The Red Balloon.png`. We derive the public URL from that
 * title so adding a story + dropping its PNG in the folder is all it takes — no map to maintain here.
 *
 * The image is part of the teaching: a beginner should recognise what a story is about from its
 * picture BEFORE reading a single foreign word, which lowers cognitive load and anxiety.
 */

const BASE = '/images/stories/';

/** Public URL for a story's illustration (encodes spaces/punctuation so the path stays valid). */
export function storyImageUrl(story: Story): string {
  return `${BASE}${encodeURIComponent(story.title.target.en)}.png`;
}

/** Hero-card presentation for a collection: a decorative collage + a friendly reading-time estimate. */
interface CollectionHero {
  /** English titles of the illustrations to show in the hero collage (order = grid order). */
  images: string[];
  /** Rough minutes to read the whole collection — a warm, approximate number, not a precise total. */
  minutes: number;
}

/**
 * Hero presentation per collection, keyed by collection id. Purely decorative — the collage images are
 * picked to feel warm and inviting (a red balloon, a farm, a garden, the seasons).
 */
export const COLLECTION_HERO: Record<string, CollectionHero> = {
  'beginner-stories': {
    images: ['The Red Balloon', 'The Farm', 'The Rabbit in the Garden', 'The Seasons'],
    minutes: 15,
  },
};

/** Public URLs for a collection's hero collage (empty if the collection has none). */
export function collectionHeroUrls(collectionId: string): string[] {
  return (COLLECTION_HERO[collectionId]?.images ?? []).map((name) => `${BASE}${encodeURIComponent(name)}.png`);
}
