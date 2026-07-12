/**
 * Dialogue Export CLI (permanent dev tool) — writes clean cinematic screenplays for AI video/voice,
 * subtitles, QA and marketing. Reads the SAME multilingual content the app uses; no learner data,
 * no ids, no metadata — only the main successful conversation.
 *
 *   npm run export:dialogues                     # every language with missions
 *   npm run export:dialogues -- --all            # (same as no args)
 *   npm run export:dialogues -- --lang=fr        # only French
 *   npm run export:dialogues -- --lang=en --mission=5   # English mission (day) 5 only
 *
 * Output:
 *   exports/dialogues/<lang>/mission-NN.md
 *   exports/dialogues/<lang>/ALL_DIALOGUES.md
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { exportMissions, renderAll, exportableLanguages } from '../apps/web/src/features/bootcamp/exportDialogue.js';

function arg(name: string): string | undefined {
  const hit = process.argv.slice(2).find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf('=');
  return eq >= 0 ? hit.slice(eq + 1) : '';
}

const OUT_ROOT = fileURLToPath(new URL('../exports/dialogues/', import.meta.url));

function main(): void {
  const langArg = arg('lang');
  const missionArg = arg('mission');
  const onlyDay = missionArg ? Number(missionArg) : undefined;
  const langs = langArg ? [langArg] : exportableLanguages();

  if (langs.length === 0) {
    console.info('No languages with built missions to export.');
    return;
  }

  let totalFiles = 0;
  for (const lang of langs) {
    const all = exportMissions(lang); // every built mission (for ALL_DIALOGUES.md)
    const selected = onlyDay === undefined ? all : all.filter((m) => m.day === onlyDay);
    if (all.length === 0) {
      console.info(`· ${lang}: no built missions — skipped`);
      continue;
    }
    if (selected.length === 0) {
      console.info(`· ${lang}: no mission for day ${onlyDay} — skipped`);
      continue;
    }
    const dir = `${OUT_ROOT}${lang}/`;
    mkdirSync(dir, { recursive: true });
    for (const m of selected) {
      writeFileSync(`${dir}${m.filename}`, m.content);
      totalFiles++;
    }
    // ALL_DIALOGUES.md ALWAYS contains every mission concatenated — never a filtered subset.
    writeFileSync(`${dir}ALL_DIALOGUES.md`, `# READY — ${lang.toUpperCase()} dialogues\n\n${renderAll(all)}`);
    console.info(`✓ ${lang}: wrote ${selected.length} mission file(s)${onlyDay ? ` (day ${onlyDay})` : ''} + ALL_DIALOGUES.md → exports/dialogues/${lang}/`);
  }
  console.info(`\nDone — ${totalFiles} mission file(s) across ${langs.length} language(s).`);
}

main();
