import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ContentManifestSchema, ContentPackSchema, type ContentItem, type ContentManifest, type ContentPack } from '@ready/content-schema';
import { config } from '../config.js';
import { AppError } from '../middleware/error.js';

/**
 * Content service: the server never stores content in MongoDB (PDF §11.2 Decision 2). It reads
 * the pipeline-built packs to (a) serve the manifest and (b) know each item's skillTarget when
 * projecting memory states with the shared engine.
 */

let manifestCache: ContentManifest | null = null;
const packCache = new Map<string, ContentPack>();
const itemIndex = new Map<string, ContentItem>();

export function loadManifest(): ContentManifest {
  if (manifestCache) return manifestCache;
  try {
    const raw = readFileSync(path.join(config.contentDir, 'manifest.json'), 'utf8');
    manifestCache = ContentManifestSchema.parse(JSON.parse(raw));
    return manifestCache;
  } catch (err) {
    throw new AppError(503, 'content_unavailable', 'Content manifest not built — run npm run build:content', String(err));
  }
}

export function loadPack(lang: string): ContentPack {
  const cached = packCache.get(lang);
  if (cached) return cached;
  const manifest = loadManifest();
  const entry = manifest.languages.find((l) => l.lang === lang);
  if (!entry) throw new AppError(404, 'unknown_language', `No content pack for "${lang}"`);
  const fileName = path.basename(entry.packUrl);
  try {
    const raw = readFileSync(path.join(config.contentDir, fileName), 'utf8');
    const pack = ContentPackSchema.parse(JSON.parse(raw));
    packCache.set(lang, pack);
    for (const item of pack.items) itemIndex.set(item.id, item);
    return pack;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(503, 'content_unavailable', `Pack file missing for "${lang}"`, String(err));
  }
}

/** Item lookup across all loaded packs (loads every manifest language on first use). */
export function itemsById(): Map<string, ContentItem> {
  if (itemIndex.size === 0) {
    for (const l of loadManifest().languages) loadPack(l.lang);
  }
  return itemIndex;
}

/** Test hook: reset caches (content dir can change between test setups). */
export function resetContentCache(): void {
  manifestCache = null;
  packCache.clear();
  itemIndex.clear();
}
