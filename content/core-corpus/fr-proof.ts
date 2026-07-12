import type { CorpusRow } from './types.js';

/**
 * French pilot — VALIDATED PROOF SLICE (foundation, not the production corpus).
 *
 * This is a small set of genuine, high-value French travel realizations that proves the Core
 * pipeline is content-only for French: the SAME pure functions the English builder uses
 * (`validateCorpus`, `buildPackWords`, `buildConcepts`) turn these rows into a valid `core-fr`
 * pack — see fr-proof.test.ts. It is deliberately kept OUT of the production `CORPUS` (which stays
 * English-complete) so declaring `fr` in `DECLARED_LANGS` and shipping French remains a separate,
 * gated step that only happens once ALL 500 concepts carry a reviewed `t.fr`.
 *
 * Honesty (docs/FRENCH-PILOT.md):
 *  - Every French surface form below is AI-drafted and RESEARCH-plausible, but NONE is
 *    native-reviewed. The pipeline stamps each realization `quality: 'ai_reviewed'` /
 *    `reviewNotes: 'pending native review'` — it must not ship as if a native reviewer signed off.
 *  - Register: neutral-polite traveler French (vous). See the tu/vous policy in the pilot doc.
 *  - Gender / article / plural notes are carried in `genderNote` for the review report; the
 *    canonical `Concept.realizations` schema does not yet have a grammatical-gender field — adding
 *    one is a required step before the full French Core 500 (tracked in FRENCH-PILOT.md).
 */

/** A proof row = a CorpusRow plus an out-of-band grammatical note for the native-review report. */
export interface FrProofRow extends CorpusRow {
  /** French grammatical metadata for the review report (gender / number / article behaviour). */
  genderNote?: string;
}

export const FR_PROOF_ROWS: FrProofRow[] = [
  // ── Never-freeze glue (Layer 1) ─────────────────────────────────────────────
  { slug: 'fr-hello', kind: 'reply', role: 'say', pos: 'interj', en: 'hello', he: 'שלום', t: { fr: 'bonjour' },
    cat: 'glue', layer: 1, rof: 2, skill: 'fluent', s: [5, 5, 5, 5, 5], ex: 'Hello!', exHe: 'שלום!' },
  { slug: 'fr-thanks', kind: 'reply', role: 'say', pos: 'interj', en: 'thank you', he: 'תודה', t: { fr: 'merci' },
    cat: 'glue', layer: 1, rof: 2, skill: 'fluent', s: [5, 5, 5, 5, 5], ex: 'Thank you!', exHe: 'תודה!' },
  { slug: 'fr-please', kind: 'reply', role: 'say', pos: 'interj', en: 'please', he: 'בבקשה', t: { fr: 's’il vous plaît' },
    cat: 'glue', layer: 1, rof: 2, skill: 'fluent', s: [5, 4, 4, 5, 5], ex: 'A coffee, please.', exHe: 'קפה, בבקשה.',
    genderNote: 'Fixed polite formula (vous). Informal “s’il te plaît” exists but the pilot teaches the vous default.' },
  { slug: 'fr-yes', kind: 'reply', role: 'say', pos: 'interj', en: 'yes', he: 'כן', t: { fr: 'oui' },
    cat: 'glue', layer: 1, rof: 2, skill: 'fluent', s: [5, 5, 5, 5, 4], ex: 'Yes.', exHe: 'כן.' },
  { slug: 'fr-no', kind: 'reply', role: 'say', pos: 'interj', en: 'no', he: 'לא', t: { fr: 'non' },
    cat: 'glue', layer: 1, rof: 3, skill: 'fluent', s: [5, 5, 5, 5, 4], ex: 'No, thank you.', exHe: 'לא, תודה.' },

  // ── Questions / numbers glue ────────────────────────────────────────────────
  { slug: 'fr-how-much', kind: 'phrase', role: 'say', pos: 'adv', en: 'how much', he: 'כמה', t: { fr: 'combien' },
    cat: 'questions', layer: 2, rof: 2, skill: 'recall', s: [5, 5, 4, 4, 5], ex: 'How much is it?', exHe: 'כמה זה עולה?' },

  // ── Directions (visual) ─────────────────────────────────────────────────────
  { slug: 'fr-left', pos: 'noun', en: 'left', he: 'שמאל', t: { fr: 'gauche' }, emoji: '⬅️', vis: 0.9,
    cat: 'directions', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 5, 4, 5], ex: 'Turn left.', exHe: 'פנה שמאלה.',
    genderNote: 'f. « la gauche » but travel usage is adverbial « à gauche ».' },
  { slug: 'fr-right', pos: 'noun', en: 'right', he: 'ימין', t: { fr: 'droite' }, emoji: '➡️', vis: 0.9,
    cat: 'directions', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 5, 4, 5], ex: 'Turn right.', exHe: 'פנה ימינה.',
    genderNote: 'f. « la droite »; travel usage « à droite ».' },

  // ── Places / transport (visual) ─────────────────────────────────────────────
  { slug: 'fr-hotel', pos: 'noun', en: 'hotel', he: 'מלון', t: { fr: 'hôtel' }, emoji: '🏨', vis: 0.95,
    cat: 'places', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 4, 5], ex: 'Where is the hotel?', exHe: 'איפה המלון?',
    genderNote: 'm. « un hôtel » — elides: « l’hôtel ».' },
  { slug: 'fr-exit', pos: 'noun', en: 'exit', he: 'יציאה', t: { fr: 'sortie' }, emoji: '🚪', vis: 0.85,
    cat: 'places', layer: 2, rof: 3, skill: 'recognize', s: [4, 3, 5, 4, 5], ex: 'Where is the exit?', exHe: 'איפה היציאה?',
    genderNote: 'f. « la sortie ».' },
  { slug: 'fr-toilet', pos: 'noun', en: 'toilet', he: 'שירותים', t: { fr: 'toilettes' }, emoji: '🚻', vis: 0.9,
    cat: 'places', layer: 1, rof: 3, skill: 'recall', s: [5, 4, 4, 4, 5], ex: 'Where are the toilets?', exHe: 'איפה השירותים?',
    alias: ['restroom', 'WC'], genderNote: 'f. PLURAL « les toilettes » — almost always plural in French.' },
  { slug: 'fr-train', pos: 'noun', en: 'train', he: 'רכבת', t: { fr: 'train' }, emoji: '🚆', vis: 0.95,
    cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 4, 5], ex: 'The train is late.', exHe: 'הרכבת מאחרת.',
    genderNote: 'm. « le train ».' },
  { slug: 'fr-ticket', pos: 'noun', en: 'ticket', he: 'כרטיס', t: { fr: 'billet' }, emoji: '🎫', vis: 0.9,
    cat: 'transport', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 4, 5], ex: 'One ticket, please.', exHe: 'כרטיס אחד, בבקשה.',
    alias: ['fare'], genderNote: 'm. « un billet ». « ticket » exists for metro/bus but « billet » is the broad default.' },

  // ── Consumables (visual) ────────────────────────────────────────────────────
  { slug: 'fr-water', pos: 'noun', en: 'water', he: 'מים', t: { fr: 'eau' }, emoji: '💧', vis: 0.95,
    cat: 'food', layer: 1, rof: 3, skill: 'recall', s: [5, 5, 4, 4, 5], ex: 'A glass of water.', exHe: 'כוס מים.',
    genderNote: 'f. « l’eau » (elided); « de l’eau » when ordering.' },

  // ── Health / emergency (safety-critical) ────────────────────────────────────
  { slug: 'fr-doctor', pos: 'noun', en: 'doctor', he: 'רופא', t: { fr: 'médecin' }, emoji: '🩺', vis: 0.85,
    cat: 'people', layer: 2, rof: 3, skill: 'recall', s: [3, 4, 4, 3, 5], ex: 'I need a doctor.', exHe: 'אני צריך רופא.',
    genderNote: 'm. « un médecin » even for a woman doctor (« docteur » is the address form).' },
  { slug: 'fr-help', kind: 'phrase', role: 'recovery', pos: 'interj', en: 'help', he: 'הצילו', t: { fr: 'au secours' },
    cat: 'emergency', layer: 1, rof: 3, skill: 'fluent', s: [3, 5, 4, 3, 5], ex: 'Help!', exHe: 'הצילו!',
    alias: ["à l'aide"], genderNote: 'Fixed emergency cry « au secours ». « À l’aide » is a softer variant.' },
];
