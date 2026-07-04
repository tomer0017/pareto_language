import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ContentManifest } from '@ready/content-schema';
import { loadPack } from './pack.js';

/**
 * Content build (PDF §11.3): validate the authored YAML and emit a versioned JSON pack plus a
 * manifest into the web app's static content dir (precached offline). Audio assets are resolved
 * by path convention (see tts.ts); real recordings replace TTS without any client change.
 */

const LANGS = ['it-IT'] as const;
const OUT_DIR = fileURLToPath(new URL('../apps/web/public/content/', import.meta.url));

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest: ContentManifest = { languages: [] };

  for (const lang of LANGS) {
    const pack = loadPack(lang);
    const fileName = `${lang}.v${pack.version}.json`;
    writeFileSync(`${OUT_DIR}${fileName}`, JSON.stringify(pack, null, 2));
    console.info(
      `✓ ${fileName}: ${pack.items.length} items, ${pack.situations.length} situations` +
        `${pack.needsNativeReview ? ' (needsNativeReview)' : ''}`,
    );
    manifest.languages.push({
      lang: pack.lang,
      name: 'Italian',
      latestVersion: pack.version,
      packUrl: `/content/${fileName}`,
    });
  }

  writeFileSync(`${OUT_DIR}manifest.json`, JSON.stringify(manifest, null, 2));
  console.info(`✓ manifest.json (${manifest.languages.length} language(s))`);
}

main();
