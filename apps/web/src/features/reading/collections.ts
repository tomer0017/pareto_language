import type { CollectionMeta } from './types.js';
import { T } from './authoring.js';

/**
 * The reading-collection registry — the ONLY place collections are declared. Each entry carries cheap
 * browse metadata and a `load()` that DYNAMIC-imports the story bodies, so a collection's text is
 * code-split (lazy-loaded on open, then PWA-runtime-cached) and never weighs down the initial bundle.
 *
 * Adding a future collection (Easy Conversations, Travel Articles, News, Recipes, Emails, Children's
 * Stories, …) = author one data file + add one entry here. No engine, UI, store or test rewrite.
 */
export const READING_COLLECTIONS: CollectionMeta[] = [
  {
    id: 'beginner-stories',
    title: T('Beginner Stories', 'סיפורים למתחילים'),
    description: T('Short A1–A2 stories that recycle everyday words in context.', 'סיפורים קצרים ברמת A1–A2 שחוזרים על מילים יומיומיות בהקשר.'),
    emoji: '📖',
    count: 15,
    load: () => import('./content/beginnerStories.js').then((m) => m.BEGINNER_STORIES),
  },
];

export function collectionMeta(id: string): CollectionMeta | undefined {
  return READING_COLLECTIONS.find((c) => c.id === id);
}
