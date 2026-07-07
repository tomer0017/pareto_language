import type { BootcampDialogue } from './types.js';

/**
 * Dialogue transcript (Sprint 9 — Full Dialogue Experience).
 *
 * Missions store dialogues as branching trees rendered one line at a time (no spoilers).
 * The end-of-mission study sheet and the "listen to the full conversation" shortcut both
 * need the ONE canonical conversation — the ideal run, as it would happen in real life.
 * This walks the happy path: follow `next`, and at every choice take the first `correct`
 * option (never a recovery detour), collecting the spoken line at each step until an end.
 *
 * Pure + type-only imports so it is unit-testable without the React/store/localStorage chain.
 */

export interface TranscriptLine {
  who: 'npc' | 'you';
  en: string;
  he: string;
}

export function dialogueTranscript(d: BootcampDialogue): TranscriptLine[] {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const lines: TranscriptLine[] = [];
  const visited = new Set<string>(); // cycle guard — happy path is acyclic, but never hang
  let node = byId.get(d.start);

  while (node && !visited.has(node.id)) {
    visited.add(node.id);

    if (node.who === 'you' && node.choices?.length) {
      // Take the ideal line: the correct choice (fall back to the first if none is flagged).
      const choice = node.choices.find((c) => c.correct) ?? node.choices[0]!;
      lines.push({ who: 'you', en: choice.en, he: choice.he });
      node = byId.get(choice.next);
      continue;
    }

    // npc line or scripted you-line — emit its text when present, then advance linearly.
    if (node.en) lines.push({ who: node.who, en: node.en, he: node.he });
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }

  return lines;
}
