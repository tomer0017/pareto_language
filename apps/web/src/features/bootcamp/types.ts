import type { LocalizedText } from '@ready/content-schema';

/**
 * Mission content model (Sprint 7 — Deep Moment System).
 * A mission is pure data; the MissionPlayer renders it. Dialogues are TREES rendered one
 * line at a time (visual-novel): the user never sees the conversation in advance, choices
 * branch (wrong picks can route through recovery beats), and expected replies are trained
 * as first-class comprehension steps.
 */

export interface BootcampItem {
  id: string;
  text: string;
  meaning: LocalizedText;
  tip?: LocalizedText;
}

export interface DialogueChoice {
  en: string;
  he: string;
  itemId?: string;      // the item this line trains (scoring)
  correct: boolean;
  next: string;         // branch target — wrong choices route to recovery beats, never dead-end
}

export interface DialogueNodeB {
  id: string;
  who: 'npc' | 'you';
  en: string;
  he: string;
  fast?: boolean;       // natural speed
  slow?: boolean;       // deliberately slowed (recovery beats)
  next?: string;        // linear advance (npc lines / scripted you-lines)
  choices?: DialogueChoice[];
  end?: boolean;
}

export interface BootcampDialogue {
  id: string;
  start: string;
  nodes: DialogueNodeB[];
}

export type BootcampStep =
  | { kind: 'talk'; icon: string; title: LocalizedText; body: LocalizedText[]; cta?: LocalizedText }
  | { kind: 'tool'; itemId: string; index: number; total: number; label?: LocalizedText }
  | { kind: 'quiz'; itemId: string; wrongIds: [string, string] }
  | { kind: 'replies'; saidItemId: string; replyIds: string[] }   // expected-reply training
  | { kind: 'swipe'; itemIds: string[] }
  | { kind: 'dialogue'; dialogueId: string }
  | { kind: 'ambush'; npc: { en: string; he: string }; correctItemId: string; wrongItemId: string }
  | { kind: 'receipt'; text: LocalizedText }
  | { kind: 'summary' };

export interface BootcampDayContent {
  day: number;
  title: LocalizedText;
  items: BootcampItem[];
  dialogues: Record<string, BootcampDialogue>;
  steps: BootcampStep[];
}
