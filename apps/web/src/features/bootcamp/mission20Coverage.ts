import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 20 — Past & Recent Events: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS conversation, in
 * each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the friend's lines (comprehension — never asked for as something to
 * say). Every word of every line belongs to one of these chunks (a test proves it). The four production tools
 * are FRAMES — "I went to", "I saw", "I ate", "What did you do yesterday?" — so a line that uses a frame with
 * another (verified-prior) detail practises the same chunk. "a hostel" is a detail the friend echoes ("A
 * hostel!"), never drilled — there is no hostel vocabulary lesson — so it is a `hear` chunk.
 *
 * A chunk is accounted for in one of two ways (mission20.test.ts):
 *   - VERIFIED PRIOR — Missions 01–19 really taught it (`learnedBefore(lang, 20)`): used, not re-taught;
 *   - COVERED here — the standard rule (`coverageOf`).
 */
export const M20_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hey', label: 'Hey', role: 'hear', chunk: { en: 'Hey', es: '¡Hola!', fr: 'Salut' } },
  { id: 'where-were-you', label: 'Where were you yesterday?', role: 'hear', chunk: { en: 'Where were you yesterday?', es: '¿Dónde estuviste ayer?', fr: 'Tu étais où hier ?' } },
  { id: 'went-to', label: 'I went to ___', role: 'say', chunk: { en: 'I went to', es: 'Fui al', fr: 'Je suis allé' } },
  { id: 'old-town', label: 'The old town', role: 'say', chunk: { en: 'the old town', es: 'casco antiguo', fr: 'dans la vieille ville' } },
  { id: 'nice', label: 'Nice!', role: 'hear', chunk: { en: 'Nice!', es: '¡Qué bien!', fr: 'Sympa' } },
  { id: 'what-did-you-see', label: 'What did you see?', role: 'hear', chunk: { en: 'What did you see?', es: '¿Qué viste?', fr: 'Tu as vu quoi ?' } },
  { id: 'saw', label: 'I saw ___', role: 'say', chunk: { en: 'I saw', es: 'Vi', fr: 'J’ai vu' } },
  { id: 'market', label: 'The market', role: 'say', chunk: { en: 'the market', es: 'el mercado', fr: 'le marché' } },
  { id: 'did-you-eat-there', label: 'Did you eat there?', role: 'hear', chunk: { en: 'Did you eat there?', es: '¿Comiste allí?', fr: 'Tu as mangé là-bas ?' } },
  { id: 'yes', label: 'Yes', role: 'say', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'ate', label: 'I ate ___', role: 'say', chunk: { en: 'I ate', es: 'comí', fr: 'j’ai mangé' } },
  { id: 'fish', label: 'Fish', role: 'say', chunk: { en: 'fish', es: 'pescado', fr: 'du poisson' } },
  { id: 'did-you-like-it', label: 'Did you like it?', role: 'hear', chunk: { en: 'Did you like it?', es: '¿Te gustó?', fr: 'Tu as aimé ?' } },
  { id: 'it-was-great', label: 'It was great', role: 'say', chunk: { en: 'it was great', es: 'estuvo genial', fr: 'c’était super' } },
  { id: 'argentina-last-month', label: 'You were in Argentina last month, right?', role: 'hear', chunk: { en: 'You were in Argentina last month, right?', es: 'Estuviste en Argentina el mes pasado, ¿no?', fr: 'Tu étais en Argentine le mois dernier, non ?' } },
  { id: 'where-did-you-stay', label: 'Where did you stay?', role: 'hear', chunk: { en: 'Where did you stay?', es: '¿Dónde te quedaste?', fr: 'Tu as logé où ?' } },
  { id: 'stayed-in', label: 'I stayed in ___', role: 'say', chunk: { en: 'I stayed in', es: 'Me quedé en', fr: 'J’ai logé dans' } },
  { id: 'hostel', label: 'A hostel', role: 'hear', chunk: { en: 'a hostel', es: 'un hostal', fr: 'une auberge' } },
  { id: 'was-it-good', label: 'Was it good?', role: 'hear', chunk: { en: 'Was it good?', es: '¿Estuvo bien?', fr: 'C’était bien ?' } },
  { id: 'it-was-good', label: 'It was good', role: 'say', chunk: { en: 'It was good', es: 'Estuvo bien', fr: 'C’était bien' } },
  { id: 'and-you', label: 'And you?', role: 'say', chunk: { en: 'And you?', es: '¿Y tú?', fr: 'Et toi ?' } },
  { id: 'what-did-you-do', label: 'What did you do yesterday?', role: 'say', chunk: { en: 'What did you do yesterday?', es: '¿Qué hiciste ayer?', fr: 'Tu as fait quoi hier ?' } },
  { id: 'me', label: 'Me?', role: 'hear', chunk: { en: 'Me?', es: '¿Yo?', fr: 'Moi ?' } },
  { id: 'nothing', label: 'Nothing!', role: 'hear', chunk: { en: 'Nothing!', es: '¡Nada!', fr: 'Rien !' } },
  { id: 'was-tired', label: 'I was tired', role: 'hear', chunk: { en: 'I was tired', es: 'Estaba cansado', fr: 'J’étais fatigué' } },
  { id: 'slept-all-day', label: 'I slept all day', role: 'hear', chunk: { en: 'I slept all day', es: 'Dormí todo el día', fr: 'J’ai dormi toute la journée' } },
];
