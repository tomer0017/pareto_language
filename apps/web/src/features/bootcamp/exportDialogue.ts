import type { BootcampDayContent, BootcampDialogue } from './types.js';
import type { TranscriptLine } from './transcript.js';
import { missionsFor } from './registry.js';
import { LEARNING_LANGUAGES } from '../../shared/i18n/languages.js';

/**
 * Dialogue Export — a permanent DEV tool (not learner-facing) that turns Bootcamp missions into
 * clean cinematic screenplays for AI video/voice (Veo, Kling, Runway, ElevenLabs…), subtitles, QA and
 * marketing. It exports ONLY the main successful conversation: the happy path from `dialogueTranscript`
 * (correct choices only) — no recovery beats, wrong answers, quizzes, ambushes, coaching, ids or
 * metadata. Fully language-agnostic: it reads the SAME registry + transcript + `tr` glosses the app
 * uses, so a new language exports automatically with zero tool changes.
 *
 * Per line it emits three registers: the learning language (spoken), then the English and Hebrew
 * glosses. Adding a future app-language gloss = extend `GLOSS_LANGS` (or the caller) — no redesign.
 */

/** App-language glosses to print under each spoken line, in order. Extend for future app languages. */
export const GLOSS_LANGS: readonly string[] = ['en', 'he'];

const SPEAKER: Record<TranscriptLine['who'], string> = { npc: '👤 NPC', you: '🧑 You' };

const isRecoveryChoice = (itemId?: string): boolean => !!itemId && itemId.includes('.phrase.recovery.');

/**
 * The CINEMATIC happy path — like `dialogueTranscript` but, at each decision, prefers the correct
 * DIRECT answer over a correct recovery tool (e.g. "please speak slowly"), so the script reads like a
 * real conversation with no recovery detours. Never enters wrong-answer branches. Cycle-guarded.
 */
export function cinematicTranscript(d: BootcampDialogue): TranscriptLine[] {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const lines: TranscriptLine[] = [];
  const visited = new Set<string>();
  let node = byId.get(d.start);
  while (node && !visited.has(node.id)) {
    visited.add(node.id);
    if (node.who === 'you' && node.choices?.length) {
      const correct = node.choices.filter((c) => c.correct);
      const choice = correct.find((c) => !isRecoveryChoice(c.itemId)) ?? correct[0] ?? node.choices[0]!;
      lines.push({ who: 'you', en: choice.en, he: choice.he, ...(choice.tr ? { tr: choice.tr } : {}) });
      node = byId.get(choice.next);
      continue;
    }
    if (node.en) lines.push({ who: node.who, en: node.en, he: node.he, ...(node.tr ? { tr: node.tr } : {}) });
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }
  return lines;
}

/** The gloss for a line in an app language: prefer `tr[lang]`, fall back to the legacy `he`/`en`. */
function gloss(line: TranscriptLine, lang: string): string {
  if (line.tr && line.tr[lang]) return line.tr[lang]!;
  if (lang === 'he') return line.he;
  if (lang === 'en') return line.en;
  return '';
}

/** Render one line as a screenplay block: speaker + spoken line + each distinct gloss. */
export function renderLine(line: TranscriptLine): string {
  const spoken = line.en.trim(); // the learning-language line (target)
  const parts = [spoken];
  for (const lang of GLOSS_LANGS) {
    const g = gloss(line, lang).trim();
    if (g && !parts.includes(g)) parts.push(g); // skip a gloss identical to the spoken line (en pilot)
  }
  return `${SPEAKER[line.who]}\n\n${parts.join('\n\n')}`;
}

/** The distinct dialogues a mission actually plays, in step order (deduped). */
export function missionDialogues(day: BootcampDayContent): BootcampDialogue[] {
  const ids: string[] = [];
  for (const step of day.steps) if (step.kind === 'dialogue' && !ids.includes(step.dialogueId)) ids.push(step.dialogueId);
  const chosen = ids.map((id) => day.dialogues[id]).filter((d): d is BootcampDialogue => !!d);
  return chosen.length ? chosen : Object.values(day.dialogues); // fallback: any dialogues present
}

/** Render one mission as a clean cinematic screenplay (Markdown, no tables/ids/metadata). */
export function renderMissionScript(day: BootcampDayContent): string {
  const number = String(day.day).padStart(2, '0');
  const title = day.title.en ?? day.title.he ?? `Mission ${day.day}`;
  let out = `# Mission ${number} — ${title}\n`;
  const dialogues = missionDialogues(day);
  if (dialogues.length === 0) {
    out += `\n## Scene\n\n_(No scripted dialogue — integration / checkpoint mission.)_\n`;
    return out;
  }
  for (const d of dialogues) {
    const blocks = cinematicTranscript(d).map(renderLine);
    out += `\n## Scene\n\n${blocks.join('\n\n---\n\n')}\n`;
  }
  return out;
}

export interface ExportedMission {
  day: number;
  filename: string; // mission-07.md
  title: string;
  content: string;
}

/**
 * All missions to export for a language, in day order, optionally filtered to one mission (by day
 * number). Empty when the language has no built missions — nothing language-specific here.
 */
export function exportMissions(lang: string, onlyDay?: number): ExportedMission[] {
  const missions = missionsFor(lang);
  return Object.keys(missions)
    .map(Number)
    .filter((d) => onlyDay === undefined || d === onlyDay)
    .sort((a, b) => a - b)
    .map((day) => {
      const content = missions[day]!;
      return {
        day,
        filename: `mission-${String(day).padStart(2, '0')}.md`,
        title: content.title.en ?? `Mission ${day}`,
        content: renderMissionScript(content),
      };
    });
}

/** Concatenate a language's missions into one ALL_DIALOGUES.md body. */
export function renderAll(missions: ExportedMission[]): string {
  return missions.map((m) => m.content).join('\n\n');
}

/** Learning languages that currently have at least one built mission (drives `--all`). */
export function exportableLanguages(): string[] {
  return LEARNING_LANGUAGES.map((l) => l.code).filter((code) => Object.keys(missionsFor(code)).length > 0);
}
