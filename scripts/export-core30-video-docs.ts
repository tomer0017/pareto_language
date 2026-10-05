/**
 * Core 30 — final dialogue master script + video action map (for video production).
 * The ONE way to regenerate these two documents and the dialogue hashes.
 *
 *   npm run export:video-docs
 *
 * Writes two report files into docs/ and changes nothing else:
 *   - CORE30_FINAL_DIALOGUES_EN_ES_FR_HE.md — the canonical (happy-path) conversation of every Core
 *     mission, in displayed order, in English / Spanish / French / Hebrew. Text is copied from the
 *     runtime mission content, never rewritten.
 *   - CORE30_FINAL_VIDEO_ACTION_MAP.md — which existing video still matches, which must be re-shot,
 *     which are missing, plus a per-mission × language dialogue hash to detect stale videos later.
 *
 * "What the video was made for" is the 29-mission runtime (commit 752463f), archived in
 * docs/archive/DIALOGUES_BY_MISSION_V1_29-mission-runtime.md. In that runtime a mission's displayed
 * number equalled its registry key, so `En_day6.mp4` is that document's Mission 06.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cinematicTranscript, missionDialogues } from '../apps/web/src/features/bootcamp/exportDialogue.js';
import { EXTENDED_MISSIONS } from '../apps/web/src/features/bootcamp/extended.js';
import { BOOTCAMP_PLAN } from '../apps/web/src/features/bootcamp/plan.js';
import { MISSIONS_BY_LANG } from '../apps/web/src/features/bootcamp/registry.js';
import type { BootcampDayContent, BootcampDialogue } from '../apps/web/src/features/bootcamp/types.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIDEO_DIR = resolve(ROOT, 'apps/web/public/videos');
const ARCHIVE = resolve(ROOT, 'docs/archive/DIALOGUES_BY_MISSION_V1_29-mission-runtime.md');
const OUT_SCRIPT = resolve(ROOT, 'docs/CORE30_FINAL_DIALOGUES_EN_ES_FR_HE.md');
const OUT_MAP = resolve(ROOT, 'docs/CORE30_FINAL_VIDEO_ACTION_MAP.md');

type Lang = 'en' | 'es' | 'fr';
const LANGS: readonly Lang[] = ['en', 'es', 'fr'];
const NAME: Record<Lang, string> = { en: 'English', es: 'Spanish', fr: 'French' };
const pad = (n: number): string => String(n).padStart(2, '0');
const content = (lang: Lang, day: number): BootcampDayContent => {
  const c = MISSIONS_BY_LANG[lang]?.[day];
  if (!c) throw new Error(`mission day ${day} is not built for ${lang}`);
  return c;
};

/* ── the canonical conversation ──────────────────────────────────────────────────────────────── */

interface Line { who: 'npc' | 'you'; text: string; he: string; cue?: { he: string; en: string } }
const stripAside = (he: string): string => he.replace(/\s*\([^)]*\)\s*$/u, '').trim();

/** Same walk as `cinematicTranscript` (the app's "full conversation"), keeping the non-spoken cue. */
function sceneLines(d: BootcampDialogue): Line[] {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const out: Line[] = [];
  const seen = new Set<string>();
  let node = byId.get(d.start);
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    if (node.who === 'you' && node.choices?.length) {
      const ok = node.choices.filter((c) => c.correct);
      const pick = ok.find((c) => !c.itemId?.includes('.phrase.recovery.')) ?? ok[0] ?? node.choices[0]!;
      out.push({ who: 'you', text: pick.en.trim(), he: stripAside(pick.tr?.he ?? pick.he) });
      node = byId.get(pick.next);
      continue;
    }
    if (node.en) out.push({ who: node.who, text: node.en.trim(), he: stripAside(node.tr?.he ?? node.he), ...(node.cue ? { cue: { he: node.cue.he ?? '', en: node.cue.en ?? '' } } : {}) });
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }
  // Guard: this must be exactly what the app plays as the full conversation.
  const app = cinematicTranscript(d).map((l) => `${l.who}:${l.en.trim()}`);
  if (JSON.stringify(app) !== JSON.stringify(out.map((l) => `${l.who}:${l.text}`))) throw new Error(`scene ${d.id}: export differs from the app's canonical transcript`);
  return out;
}
const scenesOf = (lang: Lang, day: number): Line[][] => missionDialogues(content(lang, day)).map(sceneLines);
const SPEAKER = { npc: 'NPC', you: 'YOU' } as const;
const spoken = (scenes: Line[][]): string => scenes.map((s) => s.map((l) => `${SPEAKER[l.who]}: ${l.text}`).join('\n')).join('\n\n');
const hash = (scenes: Line[][]): string => createHash('sha256').update(spoken(scenes).replace(/\r\n?/g, '\n'), 'utf8').digest('hex').slice(0, 16);

/* ── checks ──────────────────────────────────────────────────────────────────────────────────── */

const problems: string[] = [];
const missingHebrew: string[] = [];
const hebrewDrift: string[] = [];
if (BOOTCAMP_PLAN.length !== 30) problems.push(`plan has ${BOOTCAMP_PLAN.length} missions, expected 30`);
const extendedKeys = new Set(Object.keys(EXTENDED_MISSIONS['en'] ?? {}).map(Number));
for (const m of BOOTCAMP_PLAN) if (extendedKeys.has(m.day)) problems.push(`Extended mission key ${m.day} is in the Core plan`);

const ALL = BOOTCAMP_PLAN.map((m, i) => {
  const n = i + 1;
  const by = Object.fromEntries(LANGS.map((l) => [l, scenesOf(l, m.day)])) as Record<Lang, Line[][]>;
  const shape = (s: Line[][]): string => s.map((sc) => sc.map((l) => l.who[0]).join('')).join('|');
  for (const l of LANGS) if (shape(by[l]) !== shape(by.en)) problems.push(`M${pad(n)}: ${NAME[l]} scene / speaker structure differs from English (${shape(by[l])} vs ${shape(by.en)})`);
  by.en.forEach((sc, k) => sc.forEach((line, j) => {
    if (!line.he) missingHebrew.push(`M${pad(n)} scene ${k + 1} line ${j + 1}: "${line.text}"`);
    for (const l of ['es', 'fr'] as const) {
      const other = by[l][k]?.[j]?.he;
      if (other !== undefined && other !== line.he) hebrewDrift.push(`M${pad(n)} scene ${k + 1} line ${j + 1} (${NAME[l]}): "${other}" vs English-track "${line.he}"`);
    }
  }));
  return { n, plan: m, by, sceneIds: missionDialogues(content('en', m.day)).map((d) => d.id) };
});

/* ── Deliverable 1: the master script ────────────────────────────────────────────────────────── */

function renderScenes(scenes: Line[][], hebrew: boolean): string {
  return scenes.map((sc, k) => {
    const lines = sc.flatMap((l) => [
      ...(l.cue ? [`[SCENE CUE — NOT SPOKEN: ${hebrew ? l.cue.he : l.cue.en}]`] : []),
      `${SPEAKER[l.who]}: ${hebrew ? (l.he || '[MISSING HEBREW]') : l.text}`,
    ]);
    return `### Scene ${k + 1}\n${lines.join('\n')}`;
  }).join('\n\n');
}
const script = ALL.map(({ n, plan, by }) => [
  `# Mission ${pad(n)} — ${plan.title.en}`,
  `## English\n\n${renderScenes(by.en, false)}`,
  `## Spanish\n\n${renderScenes(by.es, false)}`,
  `## French\n\n${renderScenes(by.fr, false)}`,
  `## Hebrew\n\n${renderScenes(by.en, true)}`,
].join('\n\n')).join('\n\n---\n\n');
writeFileSync(OUT_SCRIPT, `${script}\n`);

/* ── what each video was made for ────────────────────────────────────────────────────────────── */

/** The archived 29-mission runtime: old number (= registry key then) → language → spoken lines. */
function readArchive(): Map<number, Record<'en' | 'fr' | 'es', string[]>> {
  const out = new Map<number, Record<'en' | 'fr' | 'es', string[]>>();
  const label: Record<string, 'en' | 'fr' | 'es' | 'he'> = { 'english:': 'en', 'franch:': 'fr', 'spanish:': 'es', 'עברית:': 'he' };
  for (const block of readFileSync(ARCHIVE, 'utf8').split(/^# Mission /m).slice(1)) {
    const number = Number(block.slice(0, 2));
    const rec: Record<'en' | 'fr' | 'es', string[]> = { en: [], fr: [], es: [] };
    let cur: 'en' | 'fr' | 'es' | 'he' | undefined;
    for (const raw of block.split('\n')) {
      const line = raw.trim();
      if (label[line]) { cur = label[line]; continue; }
      const hit = /^\*\*(NPC|You):\*\*\s*(.*)$/.exec(line);
      if (hit && cur && cur !== 'he') rec[cur].push(`${hit[1] === 'NPC' ? 'NPC' : 'YOU'}: ${hit[2]!.trim()}`);
    }
    out.set(number, rec);
  }
  return out;
}
const archive = readArchive();
const archiveTitle = new Map(readFileSync(ARCHIVE, 'utf8').split('\n').filter((l) => l.startsWith('# Mission ')).map((l) => [Number(l.slice(10, 12)), l.slice(15).trim()]));

/** Lines only in `a` (old) and only in `b` (current), in order — a plain LCS diff. */
function diff(a: string[], b: string[]): { old: string[]; now: string[] } {
  const t: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) t[i]![j] = a[i] === b[j] ? t[i + 1]![j + 1]! + 1 : Math.max(t[i + 1]![j]!, t[i]![j + 1]!);
  const old: string[] = []; const now: string[] = [];
  let i = 0; let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; } else if (t[i + 1]![j]! >= t[i]![j + 1]!) old.push(a[i++]!); else now.push(b[j++]!);
  }
  old.push(...a.slice(i)); now.push(...b.slice(j));
  return { old, now };
}

type Status = 'KEEP' | 'MOVE / RELABEL' | 'REPLACE' | 'NEW VIDEO' | 'CHECK MANUALLY';
interface Cell { status: Status; file?: string; why: string; old: string[]; now: string[]; variant?: boolean }

/** Evidence the repository cannot settle: carried over from the previous action map. */
const MANUAL: Record<string, string> = {
  'Fr_day3.mp4': 'The runtime dialogue is unchanged since the video was added, but the reference Markdown that existed when it was produced was missing two spoken lines ("Moyen ou grand ?" and "Lait et sucre ?"). If the video followed that file it lacks them. Watch it once: if both lines are spoken, treat as KEEP.',
};

/**
 * Production decisions: a difference that was reviewed and accepted, so the video is NOT re-shot.
 * It applies only while the difference is exactly the one that was accepted — any other changed
 * line turns the file back into REPLACE.
 */
const ACCEPTED: Record<string, { old: string[]; now: string[]; note: string }> = {
  'En_day10.mp4': {
    old: ['NPC: Lovely. How long are you staying?', 'YOU: At a hotel in the city center.'],
    now: ['NPC: All right. How long are you staying?', 'YOU: At a hotel in the city centre.'],
    note: 'ACCEPTABLE MINOR SPOKEN VARIANT — the only audible difference is one word: the video says "Lovely. How long are you staying?", the app now says "All right. How long are you staying?". ("center" → "centre" is spelling only.) Accepted for production; the runtime dialogue was not changed to match the video.',
  },
};

const files = existsSync(VIDEO_DIR) ? readdirSync(VIDEO_DIR).filter((f) => /\.(mp4|webm|mov)$/i.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })) : [];
const referenced = new Map<string, { lang: Lang; n: number }>();
const cells = new Map<string, Cell>();
for (const { n, plan, by } of ALL) for (const lang of LANGS) {
  const src = content(lang, plan.day).introVideo?.src;
  const file = src ? src.split('/').pop()! : undefined;
  const key = `${n}:${lang}`;
  if (!file) { cells.set(key, { status: 'NEW VIDEO', why: 'No video exists for this mission in this language.', old: [], now: [] }); continue; }
  if (!files.includes(file)) { problems.push(`M${pad(n)} ${NAME[lang]}: runtime points at ${file}, which is not in the video folder`); cells.set(key, { status: 'NEW VIDEO', file, why: `The runtime points at \`${file}\`, but the file is missing.`, old: [], now: [] }); continue; }
  referenced.set(file, { lang, n });
  const oldNumber = plan.day; // 29-mission runtime: displayed number = registry key
  const before = archive.get(oldNumber)?.[lang];
  const now = spoken(by[lang]).split('\n').filter(Boolean);
  if (!before?.length) { cells.set(key, { status: 'CHECK MANUALLY', file, why: 'No archived dialogue to compare with.', old: [], now: [] }); continue; }
  const d = diff(before, now);
  const accepted = ACCEPTED[file];
  if (accepted && JSON.stringify([d.old, d.now]) === JSON.stringify([accepted.old, accepted.now])) cells.set(key, { status: 'MOVE / RELABEL', file, why: `${accepted.note} The mission moved from position ${pad(oldNumber)} to ${pad(n)}.`, variant: true, ...d });
  else if (d.old.length || d.now.length) cells.set(key, { status: 'REPLACE', file, why: `${Math.max(d.old.length, d.now.length)} spoken line(s) differ from the dialogue the video was made for.`, ...d });
  else if (MANUAL[file]) cells.set(key, { status: 'CHECK MANUALLY', file, why: MANUAL[file]!, old: [], now: [] });
  else if (oldNumber !== n) cells.set(key, { status: 'MOVE / RELABEL', file, why: `Spoken dialogue is line-for-line identical. The mission moved from position ${pad(oldNumber)} to ${pad(n)}.`, old: [], now: [] });
  else cells.set(key, { status: 'KEEP', file, why: 'Spoken dialogue is line-for-line identical, and the mission kept its position.', old: [], now: [] });
}
const orphans = files.filter((f) => !referenced.has(f));
for (const f of orphans) problems.push(`video file ${f} is not referenced by any Core mission`);
const cell = (n: number, lang: Lang): Cell => cells.get(`${n}:${lang}`)!;
const count = (s: Status, onlyExisting = false): number => [...cells.values()].filter((c) => c.status === s && (!onlyExisting || c.file)).length;

/* ── hand-written context (history a diff cannot tell) ───────────────────────────────────────── */

const HISTORY: Record<number, [status: string, history: string, watch?: string]> = {
  1: ['changed', 'Same conversation as the old Mission 01; the host\'s closing line was rewritten in the final curriculum audit.'],
  2: ['unchanged', 'Market-stall conversation, unchanged since the videos were made.'],
  3: ['unchanged', 'Coffee order, unchanged since the videos were made.', 'The French video was produced when the reference Markdown lacked two lines — see its detail block.'],
  4: ['new', 'New Core mission (want / need / have / can). No equivalent script existed in the old course.', 'Two scenes with different people and registers: a hostel desk (formal), then coffee with a friend (informal).'],
  5: ['unchanged', 'Asking the way to the station, unchanged since the French video was made. There has never been an English video.'],
  6: ['changed (EN, one audible word) / unchanged (FR)', 'Was Mission 10. Moved forward so the arrival story runs border → taxi → hotel.', 'English: the existing video says "Lovely." where the app now says "All right." — accepted as a minor spoken variant, so the file is kept.'],
  7: ['changed', 'Was Mission 06. The fare exchange and the slow-speech beat were rewritten.'],
  8: ['changed', 'Was Mission 07. One line changed: the receptionist\'s room line now ends "Here is your key." instead of asking about breakfast.'],
  9: ['unchanged', 'Was Mission 08. Clothing-shop conversation, unchanged.'],
  10: ['rebuilt', 'Checkpoint, was Mission 09. Rebuilt as three cold scenes (border, taxi, hotel).'],
  11: ['changed', 'Was Mission 22 ("Small Talk"). Largely rewritten (3 of the old 9 lines survive) and moved to open the Everyday phase.'],
  12: ['new', 'New Core mission. No equivalent script existed in the old course.', 'Informal register (tu / tú): two friends.'],
  13: ['new', 'New Core mission. No equivalent script existed in the old course.', 'Informal register (tu / tú): at a friend\'s home.'],
  14: ['changed', 'Was Mission 04. Absorbed the old Restaurant Basics (Mission 12): order, drink and closing lines changed.', 'One non-spoken cue ("Later…").'],
  15: ['changed', 'Was Mission 13 ("Special Requests & Allergies"). Largely rewritten (4 of the old 11 lines survive).'],
  16: ['new', 'New Core mission. No equivalent script existed in the old course.', 'Informal register (tu / tú).'],
  17: ['changed', 'Was Mission 16. One line differs from the old script.', 'One non-spoken cue ("At the checkout…").'],
  18: ['rebuilt', 'Checkpoint, was Mission 17 ("Food Day"). Rebuilt as one ordinary day in four cold scenes.', 'Scene 2 is informal (a friend); the other three are service register. Two non-spoken cues (scenes 3 and 4).'],
  19: ['changed', 'Was Mission 18. Four lines changed: the platform is no longer announced before the learner asks for it.'],
  20: ['new', 'New Core mission. No equivalent script existed in the old course.', 'Informal register (tu / tú).'],
  21: ['new', 'New Core mission. No equivalent script existed in the old course.', 'Informal register (tu / tú).'],
  22: ['rebuilt', 'Was Mission 24. Now two scenes: a restaurant problem, then a hotel-room problem (the latter absorbed the old Hotel Requests & Problems, Mission 11).', 'Scene 1 has a non-spoken cue ("Later…") between two consecutive waiter lines.'],
  23: ['new', 'New Core mission. No equivalent script existed in the old course.', 'Informal register (tu / tú).'],
  24: ['rebuilt', 'Checkpoint, was Mission 23 ("City Day"). Rebuilt as four cold scenes.', 'Scene 4 is informal (another traveler); scenes 1–3 are service register.'],
  25: ['new', 'New Core mission (the lost-passport line used to interrupt Emergency). Two scenes.'],
  26: ['changed', 'Was Mission 25. Two lines changed in the curriculum audit, so that nothing sounds like a medical guarantee.'],
  27: ['changed', 'Was Mission 26. Largely rewritten as one coherent call (4 of the old 11 lines survive); the lost-passport exchange moved to Mission 25.'],
  28: ['rebuilt', 'Was Mission 27. Rebuilt in the Mastery pass: three scenes, heard only in the app.', 'Scene 2 has a non-spoken cue ("Later…").'],
  29: ['rebuilt', 'Was Mission 28. Rebuilt in the Mastery pass as one evening in four scenes; now uses Core sentences only.', 'Scene 4 opens with a non-spoken cue ("Later…").'],
  30: ['rebuilt', 'The finale, was Mission 29. Rebuilt in the Mastery pass as one whole day in five scenes.', 'Scene 4 is informal (a traveler); scene 3 has a non-spoken cue ("Later…").'],
};

/** Who and where, scene by scene — only for missions whose script has more than one scene. */
const CONTINUITY: Record<number, string> = {
  4: 'Scene 1: hostel front desk (staff). Scene 2: coffee with a friend — different person, different place, informal.',
  10: 'Three places, three people, same day: border officer → taxi driver → hotel receptionist.',
  18: 'Four places, four people, one day: café barista (morning) → a friend (informal) → supermarket staff, then the checkout → restaurant waiter (evening).',
  22: 'Scene 1: restaurant waiter (wrong dish, then the bill, with a time jump inside the scene). Scene 2: hotel reception — different place and person.',
  24: 'Four places, four people, one day: station ticket desk → a local in the street → restaurant waiter → another traveler at the hostel (informal).',
  25: 'Scene 1: a passer-by in the street. Scene 2: a police officer at the station — location change, different person.',
  28: 'Three unrelated short scenes: station ticket desk → restaurant waiter (with a time jump before the last exchange) → a local.',
  29: 'One continuous evening. Scene 1: taxi driver. Scenes 2–4: the SAME restaurant and the same waiter — ordering, the wrong dish arriving, then (time jump) the bill.',
  30: 'One day, same traveler throughout. Scene 1: hotel desk, morning. Scene 2: taxi driver. Scene 3: restaurant waiter (time jump before the bill). Scene 4: another traveler (informal). Scene 5: the hotel desk again, evening — same hotel as scene 1.',
};
const multi = ALL.filter((m) => m.by.en.length > 1);
for (const m of multi) if (!CONTINUITY[m.n]) problems.push(`M${pad(m.n)} has ${m.by.en.length} scenes but no continuity note`);
for (const k of Object.keys(CONTINUITY).map(Number)) if (!multi.some((m) => m.n === k)) problems.push(`continuity note for M${pad(k)}, which has a single scene`);

/* Register per scene, read from the French and Spanish lines themselves. */
const FR_TU = /(^|[^\p{L}])(tu|toi|ton|ta|tes|te)([^\p{L}]|$)|(^|[^\p{L}])t’/iu;
const FR_VOUS = /(^|[^\p{L}])(vous|votre|vos)([^\p{L}]|$)/iu;
const ES_TU = /(^|[^\p{L}])(tú|tu|tus|ti|quieres|puedes|tienes|sabes|vives|haces|vas|estás|estuviste|hiciste|viste|comiste|vienes)([^\p{L}]|$)/iu;
const ES_USTED = /(^|[^\p{L}])(usted|su|sus|tiene|quiere|necesita|puede|disfrute|sígame|pare|llame|tómelo)([^\p{L}]|$)/iu;
const register = (lines: Line[], informal: RegExp, formal: RegExp): string => {
  const text = lines.map((l) => l.text).join(' ');
  const i = informal.test(text); const f = formal.test(text);
  return i && f ? 'mixed' : i ? 'informal' : f ? 'formal' : 'neutral';
};
const registers = ALL.map((m) => ({ n: m.n, scenes: m.by.fr.map((sc, k) => ({ fr: register(sc, FR_TU, FR_VOUS), es: register(m.by.es[k]!, ES_TU, ES_USTED) })) }));

/* Stage directions that sit INSIDE a spoken line (the app's speech reads them aloud). */
const EMBEDDED = /…\s*(Later|At the checkout|Plus tard|À la caisse|Más tarde|En la caja|אחר כך|בקופה)\s*…/u;
const embedded = ALL.flatMap((m) => LANGS.flatMap((lang) => m.by[lang].flatMap((sc, k) => sc.filter((l) => EMBEDDED.test(l.text) || EMBEDDED.test(l.he)).map((l) => `M${pad(m.n)} ${NAME[lang]} scene ${k + 1} — \`${SPEAKER[l.who]}: ${l.text}\``))));
for (const e of embedded) problems.push(`transition label inside a spoken line: ${e}`);
const cues = ALL.flatMap((m) => m.by.en.flatMap((sc, k) => sc.filter((l) => l.cue).map((l) => `M${pad(m.n)} scene ${k + 1}, before \`${SPEAKER[l.who]}: ${l.text}\` — cue "${l.cue!.en}" / "${l.cue!.he}"`)));

/* ── Deliverable 2: the action map ───────────────────────────────────────────────────────────── */

const o: string[] = [];
o.push('# Core 30 — Final Video Action Map', '');
o.push('_Generated from the runtime mission content by `scripts/export-core30-video-docs.ts` (`npm run export:video-docs`). Companion file: `CORE30_FINAL_DIALOGUES_EN_ES_FR_HE.md` (the scripts to shoot from). The dialogue hashes in section I identify the exact dialogue this map describes._', '');
o.push('**This is the canonical video action map.** Regenerate it with `npm run export:video-docs` (never edit by hand). The earlier map of 2026-10-04 is archived as `docs/archive/CORE_30_FINAL_VIDEO_ACTION_MAP_2026-10-04_superseded.md` and must not be used. No video file was created, edited, renamed, moved or deleted by this export.', '');
o.push('**Basis of every verdict.** The existing videos were added in July 2026 and renamed in commit `752463f` (the 29-mission runtime). For all 15 files, the NPC lines in the mission source at the commit the video was added are identical to those at `752463f`, so the dialogue each video was made for is the 29-mission runtime, archived in `docs/archive/DIALOGUES_BY_MISSION_V1_29-mission-runtime.md`. Each verdict is an exact line-by-line comparison of that archived conversation with today\'s canonical conversation. **Nobody watched the videos**: a verdict says what the script was, not what is audible in the file.', '');
o.push('Statuses: **KEEP** · **MOVE / RELABEL** (same dialogue, mission changed position) · **REPLACE** (a spoken line changed) · **NEW VIDEO** (none exists) · **CHECK MANUALLY** (history cannot prove it).', '');

o.push('## Totals', '');
o.push('| Status | All 90 mission × language cells | Of the existing video files |', '|---|---|---|');
for (const s of ['KEEP', 'MOVE / RELABEL', 'REPLACE', 'NEW VIDEO', 'CHECK MANUALLY'] as Status[]) o.push(`| ${s} | ${count(s)} | ${s === 'NEW VIDEO' ? '—' : count(s, true)} |`);
o.push(`| **Total** | **${cells.size}** | **${files.length}** |`, '');

o.push('## A. Current video inventory', '');
o.push(`Folder: \`apps/web/public/videos/\` — ${files.length} files. A video is attached to a mission by an explicit path in that mission's content (\`introVideo\`). The number in a file name is the mission's **registry key**, not its displayed number.`, '');
o.push('| File | Language | Size | Registry key | Position when made (29-mission course) | Current mission | Same dialogue as when made? |', '|---|---|---|---|---|---|---|');
for (const f of files) {
  const ref = referenced.get(f);
  const size = `${(statSync(resolve(VIDEO_DIR, f)).size / 1_048_576).toFixed(1)} MB`;
  if (!ref) { o.push(`| \`${f}\` | ? | ${size} | ? | ? | not referenced by the runtime | — |`); continue; }
  const m = ALL[ref.n - 1]!; const c = cell(ref.n, ref.lang);
  o.push(`| \`${f}\` | ${NAME[ref.lang]} | ${size} | ${m.plan.day} | ${pad(m.plan.day)} ${archiveTitle.get(m.plan.day) ?? ''} | **M${pad(ref.n)}** ${m.plan.title.en} | ${c.status === 'REPLACE' ? 'No' : c.status === 'CHECK MANUALLY' ? 'Script yes — video unverified' : 'Yes'} |`);
}
o.push('', `Spanish has no video files. ${orphans.length ? `Unreferenced files: ${orphans.map((f) => `\`${f}\``).join(', ')}.` : 'Every file in the folder is referenced by exactly one mission, and every path the runtime references exists.'}`, '');
o.push('Before the 29-mission refactor the same files were named one number higher (`En_day2.mp4` … `En_day11.mp4`), because a Recovery Toolkit mission then occupied position 1.', '');

o.push('## C. Master action table', '');
o.push('| Mission | Title | English | Spanish | French |', '|---|---|---|---|---|');
const shown = (c: Cell): string => (c.variant ? `${c.status} — ACCEPTABLE MINOR SPOKEN VARIANT` : c.status);
for (const m of ALL) o.push(`| ${pad(m.n)} | ${m.plan.title.en} | ${shown(cell(m.n, 'en'))} | ${shown(cell(m.n, 'es'))} | ${shown(cell(m.n, 'fr'))} |`);
o.push('');

o.push('## D. Existing video detail', '');
for (const f of files) {
  const ref = referenced.get(f); if (!ref) continue;
  const m = ALL[ref.n - 1]!; const c = cell(ref.n, ref.lang);
  o.push(`### \`${f}\``, '');
  o.push(`Current mission: M${pad(ref.n)} — ${m.plan.title.en} (${NAME[ref.lang]})`, '');
  o.push(`Status: **${c.status}${c.variant ? ' — ACCEPTABLE MINOR SPOKEN VARIANT' : ''}**`, '');
  o.push(`Why: ${c.why}`, '');
  if (c.status === 'REPLACE') {
    o.push('Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):', '');
    for (const l of c.old) o.push(`- OLD: \`${l}\``);
    for (const l of c.now) o.push(`- CURRENT: \`${l}\``);
    const share = Math.max(c.old.length, c.now.length);
    o.push('', `Production note: regenerate the full video from the Mission ${pad(ref.n)} ${NAME[ref.lang]} script (${share} line${share === 1 ? '' : 's'} affected). Keep the file name — the runtime already points at it.`, '');
  } else if (c.variant) {
    o.push('The accepted difference:', '');
    for (const l of c.old) o.push(`- VIDEO SAYS: \`${l}\``);
    for (const l of c.now) o.push(`- APP SAYS: \`${l}\``);
    o.push('', 'Production note: nothing to re-shoot. Do not rename the file. If this video is ever re-shot for another reason, use the current line.', '');
  } else if (c.status === 'MOVE / RELABEL') {
    o.push(`Production note: nothing to re-shoot. Old displayed position ${pad(m.plan.day)}, current displayed position ${pad(ref.n)}. Do not rename the file: the runtime references \`${f}\` by path. Only update any on-screen "Mission ${m.plan.day}" title card or caption inside the video, if it has one.`, '');
  } else if (c.status === 'KEEP') {
    o.push('Production note: nothing to do.', '');
  } else {
    o.push('Production note: watch the file once and compare it with the current script before deciding.', '');
  }
}

o.push('## E. What changed across the curriculum', '');
o.push('The old course had 29 missions; the final Core has 30.', '');
o.push('**Final displayed order** (registry key in brackets — the number used in video file names):', '');
o.push(ALL.map((m) => `${pad(m.n)} ${m.plan.title.en} [${m.plan.day}]`).join(' · '), '');
const moved = ALL.filter((m) => archive.has(m.plan.day) && m.plan.day !== m.n);
const stayed = ALL.filter((m) => archive.has(m.plan.day) && m.plan.day === m.n);
const fresh = ALL.filter((m) => !archive.has(m.plan.day));
const gone = [...archive.keys()].filter((k) => !ALL.some((m) => m.plan.day === k)).sort((a, b) => a - b);
o.push(`- **Kept their position (${stayed.length}):** ${stayed.map((m) => `${pad(m.n)} ${m.plan.title.en}`).join(', ')}.`);
o.push(`- **Moved (${moved.length}):** ${moved.map((m) => `${m.plan.title.en} ${pad(m.plan.day)} → ${pad(m.n)}`).join(', ')}.`);
o.push(`- **New Core missions (${fresh.length}):** ${fresh.map((m) => `${pad(m.n)} ${m.plan.title.en}`).join(', ')}.`);
o.push(`- **No longer standalone Core missions (${gone.length}):** ${gone.map((k) => `old ${pad(k)} ${archiveTitle.get(k)}`).join(', ')}. See section F for where each went.`);
o.push('- **Checkpoints / integrated missions rebuilt** (their old scripts are obsolete): 10 Arrival Day, 18 Everyday Day (was "Food Day"), 24 City & Conversation (was "City Day"), 28 No Subtitles, 29 Dress Rehearsal, 30 A Complete Day Abroad Alone.');
o.push('- **Final Mastery changes (Missions 25–30):** the conversations of 25, 26 and 27 were not touched by the last pass; 28, 29 and 30 were rebuilt. 28 is audio-only in the app and carries one non-spoken cue; 29 is one evening in four scenes; 30 is one whole day in five scenes.', '');

o.push('## F. New and merged Core missions', '');
o.push('**No equivalent standalone script existed in the old course** (verified: their registry keys 30–37 are absent from the 29-mission archive):', '');
for (const m of fresh) o.push(`- M${pad(m.n)} — ${m.plan.title.en}`);
o.push('', '**Old standalone topics and where they went** (verified against `plan.ts` / `extended.ts`):', '');
o.push('- Old 12 **Restaurant Basics** → merged into M14 Restaurant Meal.');
o.push('- Old 11 **Hotel Requests & Problems** → merged: the room problem is scene 2 of M22 Fixing Problems.');
o.push('- Old 14 **Paying Anywhere** → no standalone mission; paying recurs inside M02, M03, M14, M17, M18, M28, M29.');
o.push('- Old 15 **Street Food & Markets**, 19 **Tickets & Attractions**, 20 **Wifi, SIM & Practical**, 21 **Souvenirs & Gifts** → moved to the Extended pool. Not in the Core, not in these documents, no video needed now.');
o.push('- The lost-passport exchange that used to sit inside Emergency → M25 Lost / Stolen / Police.', '');

o.push('# Things to pay attention to before generating videos', '');
o.push('### 1. Displayed mission number vs file name', '');
o.push('File names carry the registry key. Only Missions 01, 02, 03 and 05 have a key equal to their number. Use this table, not the file name:', '');
o.push('| Mission | Key | File name a video for it uses |', '|---|---|---|');
for (const m of ALL) o.push(`| ${pad(m.n)} ${m.plan.title.en} | ${m.plan.day} | \`En_day${m.plan.day}.mp4\` · \`Es_day${m.plan.day}.mp4\` · \`Fr_day${m.plan.day}.mp4\` |`);
o.push('', 'A replacement for an existing file keeps its name and needs no code change. A video for a mission that has none is only picked up by the app after its path is added to that mission\'s content (`introVideo`) — a small code change per file, not done here.', '');
o.push('### 2. Multi-scene missions', '');
o.push(`${multi.length} missions have more than one scene: ${multi.map((m) => `M${pad(m.n)} (${m.by.en.length})`).join(', ')}. The other ${ALL.length - multi.length} are a single scene.`, '');
o.push('### 3. Spoken vs non-spoken cues', '');
o.push(`**Not spoken** (a real cue in the runtime — shown, never sent to speech; written as \`[SCENE CUE — NOT SPOKEN: …]\` in the script): ${cues.length ? '' : 'none.'}`, '');
for (const c of cues) o.push(`- ${c}`);
o.push('', `Treat each cue as a cut, a caption or a pause; no character says it. **Transition labels written inside a spoken line: ${embedded.length}.** (Until the production freeze there were seven; each is now one of the cues above.)`, '');
for (const e of embedded) o.push(`- ${e}`);
o.push('', 'Lines that merely begin with "…" as a pause (for example the taxi\'s "…We are almost there.") are ordinary speech.', '');
o.push('### 4. Formal vs informal register (French / Spanish)', '');
o.push('Read from the French and Spanish lines themselves, scene by scene. "formal" = vous / usted, "informal" = tu / tú, "neutral" = the scene has no marker either way. Service encounters are formal; friends and fellow travelers are informal.', '');
o.push('| Mission | Scene | French | Spanish |', '|---|---|---|---|');
for (const r of registers) r.scenes.forEach((s, k) => { if ([s.fr, s.es].some((x) => x === 'informal' || x === 'mixed')) o.push(`| ${pad(r.n)} ${ALL[r.n - 1]!.plan.title.en} | ${k + 1} | ${s.fr} | ${s.es} |`); });
o.push('', 'Every scene not listed is formal (vous / usted) or has no marker, in both languages. This table comes from a word-pattern check, not a linguist: a row where the two languages differ, or that says "mixed", deserves a human look before casting a voice.', '');
o.push('### 5. Character and location continuity', '');
for (const m of multi) o.push(`- **M${pad(m.n)} ${m.plan.title.en}** — ${CONTINUITY[m.n]}`);
o.push('', 'These notes are read from the dialogue and scene names only; the runtime does not define characters, costumes or sets.', '');
o.push('### 6. Native-language review warning', '');
o.push('French and Spanish have passed structural, parity and automated checks (same scenes, same speaker order, no line left in English). They have **not** received a full native-speaker sign-off. They are safe for internal generation and testing. A native review is recommended **before** spending significant money or time on final polished French or Spanish videos. Hebrew is the app\'s own gloss of each line, not a dubbing script.', '');

o.push('## H. Change summary per mission', '');
for (const m of ALL) {
  const [status, history, watch] = HISTORY[m.n]!;
  o.push(`### M${pad(m.n)} — ${m.plan.title.en}`, '');
  o.push(`Current dialogue status: ${status}`, '');
  o.push(`Important history: ${history}`, '');
  o.push(`Video impact: ${LANGS.map((l) => `${l.toUpperCase()} ${cell(m.n, l).status}${cell(m.n, l).file ? ` (\`${cell(m.n, l).file}\`)` : ''}`).join(' · ')}`, '');
  const notes = [watch, m.by.en.length > 1 ? `${m.by.en.length} scenes.` : undefined].filter(Boolean).join(' ');
  if (notes) o.push(`Watch for: ${notes}`, '');
}

o.push('## I. Dialogue hash / freeze marker', '');
o.push('One fingerprint per mission × language for the final canonical spoken dialogue. Recipe: every line as `NPC: text` or `YOU: text`, lines joined by a line feed, scenes separated by one empty line, UTF-8, SHA-256, first 16 hex characters. Nothing is stripped — punctuation and case count; non-spoken cues are not included. If a hash here no longer matches what this script prints, that mission\'s video is stale.', '');
o.push('| Mission | EN | ES | FR |', '|---|---|---|---|');
for (const m of ALL) o.push(`| ${pad(m.n)} ${m.plan.title.en} | \`${hash(m.by.en)}\` | \`${hash(m.by.es)}\` | \`${hash(m.by.fr)}\` |`);
o.push('');

o.push('## J. Validation of this export', '');
const lineCount = (l: Lang): number => ALL.reduce((k, m) => k + m.by[l].flat().length, 0);
o.push(`- Missions exported: ${ALL.length}, numbered 01–${pad(ALL.length)} in displayed order.`);
o.push(`- Scenes: ${ALL.reduce((k, m) => k + m.by.en.length, 0)} per language. Spoken lines: English ${lineCount('en')}, Spanish ${lineCount('es')}, French ${lineCount('fr')}, Hebrew ${lineCount('en') - missingHebrew.length}.`);
o.push(`- Scene count and speaker order are identical in English, Spanish and French for every mission: ${problems.some((p) => p.includes('structure differs')) ? '**NO — see below**' : 'yes'}.`);
o.push(`- Every exported line equals the app's own canonical transcript (the export aborts otherwise): yes.`);
o.push(`- Extended missions in the export: none.`);
o.push(`- Lines with no Hebrew: ${missingHebrew.length}.${missingHebrew.length ? ` ${missingHebrew.join('; ')}` : ''}`);
o.push(`- Hebrew attached to the Spanish / French line differing from the Hebrew of the English line: ${hebrewDrift.length}.${hebrewDrift.length ? ' The master script uses the English-track Hebrew. Differences:' : ''}`);
for (const d of hebrewDrift) o.push(`  - ${d}`);
o.push(`- Video inventory: ${files.length} files, ${referenced.size} referenced, ${orphans.length} unreferenced. Action cells filled: ${cells.size} of 90.`);
o.push(`- Problems found: ${problems.length ? '' : 'none.'}`);
for (const p of problems) o.push(`  - ${p}`);
o.push('');
writeFileSync(OUT_MAP, `${o.join('\n')}`);

console.info(JSON.stringify({
  missions: ALL.length, scenes: ALL.reduce((k, m) => k + m.by.en.length, 0),
  lines: { en: lineCount('en'), es: lineCount('es'), fr: lineCount('fr') },
  videos: files.length, missingHebrew: missingHebrew.length, hebrewDrift: hebrewDrift.length,
  status: Object.fromEntries((['KEEP', 'MOVE / RELABEL', 'REPLACE', 'NEW VIDEO', 'CHECK MANUALLY'] as Status[]).map((s) => [s, count(s)])),
  cues: cues.length, embedded: embedded.length, problems,
}, null, 2));
