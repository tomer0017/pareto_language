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
  /** The spoken line in the LEARNING language (English in the en pilot, French in a fr mission). */
  en: string;
  /** Legacy Hebrew translation. Prefer `tr` (app-language-aware). Kept for the English missions. */
  he: string;
  /** Translation in the learner's APP language ({en,he,…}). Set by non-English missions so an
   *  English-UI learner reads an English gloss, a Hebrew-UI learner a Hebrew one. When absent, the
   *  engine falls back to {en: this.en, he: this.he} — which is exactly right for English missions. */
  tr?: LocalizedText;
  itemId?: string;      // the item this line trains (scoring)
  correct: boolean;
  next: string;         // branch target — wrong choices route to recovery beats, never dead-end
  coach?: LocalizedText; // coaching-mode only: why this pick is more/less useful (never "wrong")
}

export interface DialogueNodeB {
  id: string;
  who: 'npc' | 'you';
  /** The spoken line in the LEARNING language (English in the en pilot, French in a fr mission). */
  en: string;
  /** Legacy Hebrew translation. Prefer `tr` (app-language-aware); kept for the English missions. */
  he: string;
  /** Translation in the learner's APP language ({en,he,…}) — see DialogueChoice.tr. */
  tr?: LocalizedText;
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

/**
 * One building-block word for a `prime` step — a short, high-value particle/word taught IN THE
 * LEARNING LANGUAGE so a near-beginner recognizes the pieces before meeting a longer sentence.
 * These are deliberately NEW small atoms (e.g. "I", "milk", "avec"), not duplicated full sentences:
 * the assembled sentence itself references a canonical mission item via `prime.buildFromItemId`.
 */
export interface PrimeWord {
  text: string;               // the word/particle in the learning language ("milk", "avec")
  meaning: LocalizedText;     // gloss ({en, he, …})
  emoji?: string;             // optional picture (adds a visual hook; degrades gracefully)
  /** `true` = a QUICK REVIEW of a word introduced in an earlier mission (shown with a ♻️ hint),
   *  not brand-new vocabulary. Keeps later missions from re-teaching the same word as if unseen.
   *  Enforced by `prime.test.ts`: a review word must actually have appeared earlier. */
  review?: boolean;
}

export type BootcampStep =
  | { kind: 'talk'; icon: string; title: LocalizedText; body: LocalizedText[]; cta?: LocalizedText }
  | { kind: 'tool'; itemId: string; index: number; total: number; label?: LocalizedText }
  // Vocabulary priming (Part 5): 3–6 essential building-block words shown BEFORE a longer sentence,
  // to cut cognitive overload. Optionally reveals how they combine into a canonical mission sentence
  // (`buildFromItemId`). Sentences stay the learning unit; words are preparation, not the destination.
  | { kind: 'prime'; label?: LocalizedText; intro?: LocalizedText; words: PrimeWord[]; buildFromItemId?: string }
  | { kind: 'quiz'; itemId: string; wrongIds: [string, string] }
  | { kind: 'replies'; saidItemId: string; replyIds: string[] }   // expected-reply training
  | { kind: 'swipe'; itemIds: string[] }
  | { kind: 'dialogue'; dialogueId: string }
  | { kind: 'ambush'; npc: { en: string; he: string; tr?: LocalizedText }; correctItemId: string; wrongItemId: string }
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
