/**
 * Writes the four-language dialogue reference from the runtime mission content
 * (see apps/web/src/features/bootcamp/dialogueDoc.ts — the rendering is pure and test-bound).
 *
 * Run: npm run gen:dialogues-doc            → docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md
 *      npm run gen:dialogues-doc -- <path>  → elsewhere (e.g. a dated snapshot)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDialogueDoc } from '../apps/web/src/features/bootcamp/dialogueDoc.js';
import { BOOTCAMP_PLAN } from '../apps/web/src/features/bootcamp/plan.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, process.argv[2] ?? 'docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md');

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, renderDialogueDoc());
console.info(`[gen-dialogues-doc] ${BOOTCAMP_PLAN.length} missions → ${out}`);
