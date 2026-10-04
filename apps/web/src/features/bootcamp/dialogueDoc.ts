import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { TranscriptLine } from './transcript.js';

/**
 * The human-readable, four-language dialogue reference (`docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md`),
 * rendered FROM THE RUNTIME mission content — never the other way round. Missions are listed in
 * journey order under the number the learner sees; each language shows the cinematic happy path
 * (the conversation the transcript reader plays). The Hebrew section is the Hebrew gloss of that
 * same conversation. A mission with several scenes shows each under a `_Scene N_` line, so a new
 * scene never reads as a continuation of the previous one. PURE, so a test can prove the checked-in
 * document is not stale.
 *
 * The section labels are a compatibility format consumed outside the repo — `franch:` is
 * intentional; do not "fix" the spelling.
 */
export const DOC_SECTIONS: readonly { label: string; lang: string; hebrew?: boolean }[] = [
  { label: 'english:', lang: 'en' },
  { label: 'franch:', lang: 'fr' },
  { label: 'spanish:', lang: 'es' },
  { label: 'עברית:', lang: 'en', hebrew: true },
];

/** Hebrew glosses sometimes carry a coaching aside in parentheses — not part of the conversation. */
const stripAside = (he: string): string => he.replace(/\s*\([^)]*\)\s*$/u, '').trim();

/** One mission in one language, scene by scene (a scene = one runtime dialogue, in step order). */
export function missionScenes(lang: string, day: number): TranscriptLine[][] {
  const content = MISSIONS_BY_LANG[lang]?.[day];
  if (!content) throw new Error(`mission day ${day} is not built for "${lang}"`);
  return missionDialogues(content).map((d) => cinematicTranscript(d));
}

/** The whole conversation of one mission in one language: its scenes, in order, as one flat list. */
export function missionConversation(lang: string, day: number): TranscriptLine[] {
  return missionScenes(lang, day).flat();
}

/** How a scene boundary is written in the document — only for missions with more than one scene. */
export const sceneHeading = (n: number): string => `_Scene ${n}_`;

export function renderDialogueDoc(): string {
  const blocks = BOOTCAMP_PLAN.map((m, i) => {
    const number = String(i + 1).padStart(2, '0');
    const sections = DOC_SECTIONS.map(({ label, lang, hebrew }) => {
      const scenes = missionScenes(lang, m.day);
      const body = scenes
        .map((scene, k) => {
          const turns = scene.map((l) => `**${l.who === 'npc' ? 'NPC' : 'You'}:** ${hebrew ? stripAside(l.he) : l.en.trim()}`).join('\n');
          return scenes.length > 1 ? `${sceneHeading(k + 1)}\n${turns}` : turns;
        })
        .join('\n\n');
      return `${label}\n${body}`;
    });
    return `# Mission ${number} — ${m.title.en}\n\n${sections.join('\n\n')}`;
  });
  return `${blocks.join('\n\n---\n\n')}\n`;
}
