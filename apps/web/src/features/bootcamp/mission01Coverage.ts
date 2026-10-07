import { fillFrame } from './practiceEngines.js';
import type { BootcampDayContent } from './types.js';

/**
 * Mission 01 — the dialogue coverage specification (the prototype for auditing a mission).
 *
 * The conversation is LOCKED and is what the video shows. This file writes down every meaningful
 * chunk of it — the host's as much as the learner's — and `encounters()` counts, from the RUNTIME
 * steps, how many times and in which ways the learner meets each one before the mission ends. The
 * test (`mission01.test.ts`) refuses a build in which any chunk is left to the conversation alone:
 * no phrase may be "video-only".
 *
 * PURE: data + functions over the mission content. Nothing here is rendered.
 */
export type CoverageLang = 'en' | 'es' | 'fr';

export interface CoverageConcept {
  id: string;
  /** What it is, for the report. */
  label: string;
  /** hear = the host says it (comprehension first) · say = the learner says it (rapid recall). */
  role: 'hear' | 'say';
  /** The chunk as the conversation words it, per language. */
  chunk: Record<CoverageLang, string>;
}

export const M01_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hello', label: 'Greeting', role: 'hear', chunk: { en: 'Hi', es: 'Hola', fr: 'Bonjour' } },
  { id: 'welcome', label: 'Welcome', role: 'hear', chunk: { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue' } },
  { id: 'name-q', label: 'Name question', role: 'hear', chunk: { en: "What's your name?", es: '¿Cómo se llama?', fr: 'Comment vous appelez-vous ?' } },
  { id: 'name-a', label: 'Name answer', role: 'say', chunk: { en: 'My name is', es: 'Me llamo', fr: 'Je m’appelle' } },
  { id: 'nice-to-meet', label: 'Nice to meet you', role: 'hear', chunk: { en: 'Nice to meet you', es: 'Mucho gusto', fr: 'Enchanté' } },
  { id: 'from-q', label: 'Country question', role: 'hear', chunk: { en: 'Where are you from?', es: '¿De dónde es?', fr: 'D’où venez-vous ?' } },
  { id: 'from-a', label: 'Country answer', role: 'say', chunk: { en: "I'm from", es: 'Soy de', fr: 'Je viens d’' } },
  { id: 'israel', label: 'Israel', role: 'say', chunk: { en: 'Israel', es: 'Israel', fr: 'Israël' } },
  { id: 'wonderful', label: 'Positive reaction', role: 'hear', chunk: { en: 'wonderful', es: 'qué maravilla', fr: 'magnifique' } },
  { id: 'first-q', label: 'First-time question', role: 'hear', chunk: { en: 'Is this your first time here?', es: '¿Es su primera vez aquí?', fr: 'C’est votre première fois ici ?' } },
  { id: 'yes', label: 'Yes', role: 'say', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'first-a', label: 'First-time answer', role: 'say', chunk: { en: "it's my first time here", es: 'es mi primera vez aquí', fr: 'c’est ma première fois ici' } },
  { id: 'enjoy-stay', label: 'Enjoy your stay', role: 'hear', chunk: { en: 'Enjoy your stay', es: 'Que disfrute su estancia', fr: 'Bon séjour' } },
  { id: 'great-day', label: 'Have a great day', role: 'hear', chunk: { en: 'Have a great day', es: 'Que tenga un buen día', fr: 'Bonne journée' } },
];

/** The four different things a learner can do with a chunk. */
export type EncounterKind = 'meaning' | 'listening' | 'retrieval' | 'context';
export interface Encounter { kind: EncounterKind; step: number; how: string }

/** Compare as a learner hears it: case, punctuation and the two apostrophes do not matter. */
export const plain = (s: string): string => ` ${s.toLowerCase().replace(/[’`]/g, "'").replace(/[¿?¡!.,;:—–-]/g, ' ').replace(/\s+/g, ' ').trim()} `;
/** Whether `text` contains `chunk` starting at a word boundary (so "Yes" is not found in "eyes"). */
export function hasChunk(text: string, chunk: string): boolean {
  const core = plain(chunk).trim();
  // A chunk that ends on an elision ("Je viens d'") runs into the next word; any other ends a word.
  const tail = core.endsWith("'") ? core : `${core} `;
  // It starts a word — after a space, or right after an elision ("d'Israël" contains "Israël").
  const t = plain(text);
  return t.includes(` ${tail}`) || t.includes(`'${tail}`);
}

/**
 * Every encounter with `chunk` in the mission, read from its steps:
 *   meaning   — its meaning is shown: a building-block word, a key sentence, a review card, a
 *               meaning tile in a match game;
 *   listening — it is heard and its meaning chosen: the listening drills, the final check, a line
 *               that is played before the learner answers;
 *   retrieval — the learner produces or connects it: question ↔ answer match, sentence builder,
 *               picking it as the answer, choosing it in the conversation;
 *   context   — it is met inside the whole conversation (the dialogue, the speed round's full lines).
 */
export function encounters(day: BootcampDayContent, chunk: string): Encounter[] {
  const out: Encounter[] = [];
  const text = (id: string | undefined): string => day.items.find((i) => i.id === id)?.text ?? '';
  const hit = (s: string | undefined): boolean => !!s && hasChunk(s, chunk);
  day.steps.forEach((s, at) => {
    const add = (kind: EncounterKind, how: string): void => { out.push({ kind, step: at + 1, how }); };
    if (s.kind === 'prime') { if (s.words.some((w) => hit(w.text))) add('meaning', 'building block'); }
    else if (s.kind === 'tool') { if (hit(text(s.itemId))) add('meaning', 'key sentence'); }
    else if (s.kind === 'swipe') { if (s.itemIds.some((id) => hit(text(id)))) add('meaning', 'review card'); }
    else if (s.kind === 'replies') { if (s.replyIds.some((id) => hit(text(id)))) add('listening', 'listening drill'); }
    else if (s.kind === 'quiz') { if (hit(text(s.itemId))) add('listening', 'comprehension check'); }
    else if (s.kind === 'matchPairs') {
      for (const p of s.pairs) {
        if (p.answerLabel) { if (hit(text(p.promptItemId))) add('meaning', 'meaning match'); }
        else if (hit(text(p.promptItemId)) || hit(p.answerText ?? text(p.answerItemId))) add('retrieval', 'question ↔ answer match');
      }
    } else if (s.kind === 'sentenceBuilder') { for (const r of s.rounds) if (hit(r.chunks.join(' '))) add('retrieval', 'sentence builder'); }
    else if (s.kind === 'swap') { for (const r of s.rounds) if (r.options.some((o) => o.correct && hit(fillFrame(r.frame, o.slot)))) add('retrieval', 'swap'); }
    else if (s.kind === 'quickReply') {
      for (const r of s.rounds) {
        const heard = r.npc?.en ?? text(r.promptItemId);
        if (hit(heard)) add(r.npc ? 'context' : 'listening', s.challenge ? 'speed round (heard)' : 'quick reply (heard)');
        if (r.options.some((o) => o.correct && hit(o.text ?? text(o.itemId)))) add('retrieval', s.challenge ? 'speed round (answered)' : 'quick reply (answered)');
      }
    } else if (s.kind === 'dialogue') {
      const d = day.dialogues[s.dialogueId];
      if (d?.nodes.some((n) => hit(n.en) || n.choices?.some((c) => c.correct && hit(c.en)))) add('context', 'the conversation');
      if (d?.nodes.some((n) => n.choices?.some((c) => c.correct && hit(c.en)))) add('retrieval', 'chosen in the conversation');
    }
  });
  return out;
}

export interface ConceptCoverage { id: string; role: 'hear' | 'say'; total: number; byKind: Record<EncounterKind, number>; covered: boolean; why: string }

/**
 * The rule. A chunk is COVERED when the learner meets it at least three times, in at least two
 * different ways, at least once OUTSIDE the conversation with its meaning shown, and:
 *   - a host line (`hear`) is at least once heard-and-understood (a listening exercise);
 *   - a learner line (`say`) is at least once retrieved, and met five times or more.
 */
export function coverageOf(day: BootcampDayContent, lang: CoverageLang): ConceptCoverage[] {
  return M01_CONCEPTS.map((c) => {
    const list = encounters(day, c.chunk[lang]);
    const byKind: Record<EncounterKind, number> = { meaning: 0, listening: 0, retrieval: 0, context: 0 };
    for (const e of list) byKind[e.kind]++;
    const kinds = (Object.keys(byKind) as EncounterKind[]).filter((k) => byKind[k] > 0).length;
    const problems = [
      list.length >= 3 ? '' : `only ${list.length} encounter(s)`,
      kinds >= 2 ? '' : 'only one kind of encounter',
      byKind.meaning >= 1 ? '' : 'its meaning is never shown',
      byKind.meaning + byKind.listening + byKind.retrieval >= 1 ? '' : 'met only inside the conversation',
      c.role === 'hear' && byKind.listening + byKind.retrieval < 1 ? 'never heard-and-understood outside the conversation' : '',
      c.role === 'say' && byKind.retrieval < 1 ? 'never retrieved' : '',
      c.role === 'say' && list.length < 5 ? `a learner line needs 5+ encounters, has ${list.length}` : '',
    ].filter(Boolean);
    return { id: c.id, role: c.role, total: list.length, byKind, covered: problems.length === 0, why: problems.join('; ') };
  });
}
