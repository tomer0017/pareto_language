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
  /** Coaching mode: label recovery lines as survival tools, and after each pick
   *  explain why it's more/less useful before continuing. Opt-in — no current mission enables it
   *  (it belonged to the retired Recovery Toolkit mission); every mission runs as-is. */
  coaching?: boolean;
  /** A checkpoint scene: the other speaker's line is NOT translated before the learner answers. */
  cold?: boolean;
}

/**
 * Optional intro/review video for a mission (Sprint: video-first). Lives in public/ and is
 * referenced by its public path (e.g. "/videos/En_day1.mp4"). Entirely optional — a mission
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
  /** Stable, language-independent concept this word realizes (`direction.left`). Languages are
   *  compared by KEY, never by array position — so "same word list" is a semantic claim a test can
   *  check. A key starting with a language code (`fr.seventy`) is deliberately language-specific. */
  key?: string;
  text: string;               // the word/particle in the learning language ("milk", "avec")
  meaning: LocalizedText;     // gloss ({en, he, …})
  emoji?: string;             // optional picture (adds a visual hook; degrades gracefully)
  /** `true` = a QUICK REVIEW of a word introduced in an earlier mission (shown with a ♻️ hint),
   *  not brand-new vocabulary. Keeps later missions from re-teaching the same word as if unseen.
   *  Enforced by `prime.test.ts`: a review word must actually have appeared earlier. */
  review?: boolean;
}

/** A line the app speaks: the learning-language text plus its glosses (same shape as a dialogue line). */
export interface SpokenLine {
  en: string;           // the spoken line in the LEARNING language
  he: string;
  tr?: LocalizedText;
}

/** Quick Reply — hear a question (or read a situation), tap the right RESPONSE. The buttons are
 *  learner sentences in the target language, never translations. */
export interface QuickReplyRound {
  /** The NPC line, as one of the mission's own "you will hear" sentences… */
  promptItemId?: string;
  /** …or a line written for this round… */
  npc?: SpokenLine;
  /** …or no audio at all: a situation described in the app language ("You are lost…"). */
  situation?: LocalizedText;
  options: { itemId: string; correct: boolean; /** what the button says, when it wraps the sentence */ text?: string }[];
}

/** Visual Match — hear something, tap the tile that shows it. Up to 9 tiles (3×3). */
export interface MatchTile {
  id: string;
  label?: string;       // "€15.50", a word, a number
  emoji?: string;
  image?: string;       // public path — image-ready, unused so far
}

/** Swap It — one sentence frame, several slot values: the sentence is an engine, not a fixed line. */
export interface SwapRound {
  frame: string;        // "I need ___."
  itemId?: string;      // the taught sentence this frame comes from (for practice history)
  cue: { emoji?: string; text: LocalizedText };   // what to say, as a picture + app-language hint
  /** Each value completes the frame (`fillFrame`); `meaning` glosses the COMPLETED sentence. */
  options: { slot: string; meaning: LocalizedText; correct: boolean }[];
}

/** Mini Map — hear a direction, act on it: tap the direction / spot on a 3×3 schematic. */
export interface MapCell {
  id: string;
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
  emoji?: string;
  label?: string;       // a landmark name in the learning language
  tappable?: boolean;
}
export interface MiniMapRound {
  audio: SpokenLine;
  itemId?: string;
  cells: MapCell[];
  correct: string;      // id of the tappable cell
}

/** Match Pairs — connect each heard line to the learner's own answer. Both sides are existing
 *  sentences of the mission; the engine shuffles one side. */
export interface MatchPair {
  /** The line the learner HEARS (an expected-reply sentence of the mission). */
  promptItemId: string;
  /** The line the learner SAYS in reply. */
  answerItemId: string;
  /** What the answer tile says, when it wraps the sentence ("Yes, it's my first time here."). */
  answerText?: string;
  /** A language-neutral answer tile — a number or an icon ("🚪 204") — for matching what was said to
   *  what it means without any translation. The pair may then name the same sentence on both sides. */
  answerLabel?: string;
  /** A few app-language words shown beside `answerLabel`, where the icon alone could be misread
   *  (safety-critical meaning). The board then tests meaning, so the app language is the point. */
  answerGloss?: LocalizedText;
}

/** Sentence Builder — rebuild a sentence the mission already taught from its chunks. The chunks are
 *  AUTHORED PER LANGUAGE, in the correct order; joined with spaces they are exactly the sentence. */
export interface BuilderRound {
  itemId: string;
  chunks: string[];
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
  // A fast, final challenge. `mode` says what is being tested (absent = the original behaviour):
  //  - 'recovery': the line is deliberately too hard; the winning move is a conversation-help tool.
  //  - 'speed':    the language is known; the challenge is catching it at speed. Never "use a tool".
  | { kind: 'ambush'; mode?: 'recovery' | 'speed'; npc: SpokenLine; correctItemId: string; wrongItemId: string }
  //  `challenge`: a final speed challenge — the same rounds, spoken fast (like the board and the map).
  | { kind: 'quickReply'; label?: LocalizedText; rounds: QuickReplyRound[]; challenge?: boolean }
  | { kind: 'visualMatch'; label?: LocalizedText; tiles: MatchTile[]; rounds: { audio: SpokenLine; correct: string; itemId?: string }[]; challenge?: boolean }
  | { kind: 'swap'; label?: LocalizedText; rounds: SwapRound[] }
  | { kind: 'miniMap'; label?: LocalizedText; rounds: MiniMapRound[]; challenge?: boolean }
  | { kind: 'matchPairs'; label?: LocalizedText; pairs: MatchPair[] }
  | { kind: 'sentenceBuilder'; label?: LocalizedText; rounds: BuilderRound[] }
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
