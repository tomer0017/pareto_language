import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 16 — Hobbies & Free Time: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS conversation,
 * in each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the friend's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 *
 * A chunk is accounted for in one of three ways (mission16.test.ts):
 *   - VERIFIED PRIOR — Missions 01–15 really taught it (`learnedBefore(lang, 16)`): used, not re-taught
 *     ("Hi", "Yes", "No", "Great", "Nice");
 *   - COVERED here — the standard rule (`coverageOf`);
 *   - TRANSFER — `M16_TRANSFER`: "Do you like diving?" has no card of its own. It is built from two
 *     covered chunks — "Do you like" (the friend asked it three times) and "diving" (your want-to-try
 *     line) — and retrieved, never shown as a sentence to learn.
 */
export const M16_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hi', label: 'Hi', role: 'hear', chunk: { en: 'Hi', es: '¡Hola!', fr: 'Salut' } },
  { id: 'free-today', label: 'Are you free today?', role: 'hear', chunk: { en: 'Are you free today?', es: '¿Estás libre hoy?', fr: 'Tu es libre aujourd’hui ?' } },
  { id: 'yes', label: 'Yes', role: 'say', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'for-fun', label: 'What do you do for fun?', role: 'say', chunk: { en: 'What do you do for fun?', es: '¿Qué te gusta hacer?', fr: 'Qu’est-ce que tu aimes faire ?' } },
  { id: 'surf-a-lot', label: 'I surf a lot', role: 'hear', chunk: { en: 'I surf a lot', es: 'Hago mucho surf', fr: 'Je fais beaucoup de surf' } },
  { id: 'do-you-like', label: 'Do you like ___?', role: 'say', chunk: { en: 'Do you like', es: 'te gusta', fr: 'Tu aimes' } },
  { id: 'love-surfing', label: 'I love surfing', role: 'say', chunk: { en: 'I love surfing', es: 'Me encanta el surf', fr: 'J’adore le surf' } },
  { id: 'great', label: 'Great', role: 'hear', chunk: { en: 'Great', es: 'Genial', fr: 'Super' } },
  { id: 'what-else', label: 'And what else do you like?', role: 'hear', chunk: { en: 'And what else do you like?', es: '¿Y qué más te gusta?', fr: 'Et tu aimes quoi d’autre ?' } },
  { id: 'like-drawing', label: 'I like drawing', role: 'say', chunk: { en: 'I like drawing', es: 'Me gusta dibujar', fr: 'J’aime dessiner' } },
  { id: 'nice', label: 'Nice', role: 'hear', chunk: { en: 'Nice', es: 'Qué bien', fr: 'Sympa' } },
  { id: 'when-draw', label: 'When do you draw?', role: 'hear', chunk: { en: 'When do you draw?', es: '¿Cuándo dibujas?', fr: 'Tu dessines quand ?' } },
  { id: 'usually-evening', label: 'I usually draw in the evening', role: 'say', chunk: { en: 'I usually draw in the evening', es: 'Normalmente dibujo por la noche', fr: 'D’habitude, je dessine le soir' } },
  { id: 'evening-music', label: 'In the evening I like to listen to music', role: 'hear', chunk: { en: 'In the evening I like to listen to music', es: 'Por la noche me gusta escuchar música', fr: 'Le soir, j’aime écouter de la musique' } },
  { id: 'like-music-too', label: 'I like to listen to music too', role: 'say', chunk: { en: 'I like to listen to music too', es: 'a mí también me gusta escuchar música', fr: 'moi aussi j’aime écouter de la musique' } },
  { id: 'and-sport', label: 'And sport?', role: 'hear', chunk: { en: 'And sport?', es: '¿Y el deporte?', fr: 'Et le sport ?' } },
  { id: 'no', label: 'No', role: 'say', chunk: { en: 'No', es: 'No', fr: 'Non' } },
  { id: 'dont-like-running', label: 'I don’t like running', role: 'say', chunk: { en: "I don't like running", es: 'no me gusta correr', fr: 'je n’aime pas courir' } },
  { id: 'me-neither', label: 'Me neither', role: 'hear', chunk: { en: 'Me neither', es: '¡Yo tampoco!', fr: 'Moi non plus' } },
  { id: 'something-to-try', label: 'Is there something you want to try here?', role: 'hear', chunk: { en: 'Is there something you want to try here?', es: '¿Hay algo que quieras probar aquí?', fr: 'Il y a quelque chose que tu veux essayer ici ?' } },
  { id: 'want-to-try', label: 'I want to try diving', role: 'say', chunk: { en: 'I want to try diving', es: 'Quiero probar el buceo', fr: 'Je veux essayer la plongée' } },
  { id: 'good-idea', label: 'Good idea', role: 'hear', chunk: { en: 'Good idea', es: '¡Buena idea!', fr: 'Bonne idée' } },
  { id: 'diving-school', label: 'There’s a diving school near the beach', role: 'hear', chunk: { en: "There's a diving school near the beach", es: 'Hay una escuela de buceo cerca de la playa', fr: 'Il y a une école de plongée près de la plage' } },
  { id: 'diving', label: 'Diving', role: 'say', chunk: { en: 'diving', es: 'buceo', fr: 'plongée' } },
  { id: 'return-question', label: 'Do you like diving?', role: 'say', chunk: { en: 'Do you like diving?', es: '¿Te gusta el buceo?', fr: 'Tu aimes la plongée ?' } },
  { id: 'love-it', label: 'I love it', role: 'hear', chunk: { en: 'I love it', es: '¡Me encanta!', fr: 'J’adore' } },
  { id: 'go-together-tomorrow', label: 'Let’s go together tomorrow', role: 'hear', chunk: { en: "Let's go together tomorrow", es: 'Vamos juntos mañana', fr: 'On y va ensemble demain' } },
];

/** Built, never shown as a sentence to learn: "Do you like ___?" + "diving" (both covered here). */
export const M16_TRANSFER: Readonly<Record<string, readonly string[]>> = { 'return-question': ['do-you-like', 'diving'] };
