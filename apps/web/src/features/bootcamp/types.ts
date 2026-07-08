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
  coach?: LocalizedText; // coaching-mode only: why this pick is more/less useful (never "wrong")
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
  /** Coaching mode (Mission 1): label recovery lines as survival tools, and after each pick
   *  explain why it's more/less useful before continuing. Opt-in — other missions run as-is. */
  coaching?: boolean;
}

/**
 * Optional intro/review video for a mission (Sprint: video-first). Lives in public/ and is
 * referenced by its public path (e.g. "/videos/En_day2.mp4"). Entirely optional — a mission
 * without a video plays exactly as before, and a missing/failed file degrades gracefully.
 */
export interface BootcampVideo {
  src: string;                     // public path, resolved against the app's BASE_URL at render
  title?: LocalizedText | string;
  language?: string;
  type?: string;
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
  | { kind: 'video'; mode: 'intro' | 'again' }   // plays day.introVideo (intro = before, again = after)
  | { kind: 'summary' };

export interface BootcampDayContent {
  day: number;
  title: LocalizedText;
  items: BootcampItem[];
  dialogues: Record<string, BootcampDialogue>;
  steps: BootcampStep[];
  introVideo?: BootcampVideo;      // optional — only missions with a shot video set this
}
