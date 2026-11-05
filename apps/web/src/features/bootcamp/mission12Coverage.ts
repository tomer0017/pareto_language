import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 12 — Time & Plans: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — the boundaries are not forced to match across languages).
 *
 * say = the traveller's own lines · hear = the friend's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 *
 * "Yes, I'm free tomorrow." has no chunk of its own on purpose: it is a TRANSFER — `im-free` (taught
 * with tonight) + `tomorrow` (taught in the friend's questions and the learner's) — not a new lesson.
 */
export const M12_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'good-morning', label: 'Good morning', role: 'hear', chunk: { en: 'Good morning', es: '¡Buenos días!', fr: 'Bonjour' } },
  { id: 'what-doing-today', label: 'What are you doing today?', role: 'hear', chunk: { en: 'What are you doing today?', es: '¿Qué haces hoy?', fr: 'Tu fais quoi aujourd’hui ?' } },
  { id: 'nothing-this-morning', label: 'Nothing this morning', role: 'say', chunk: { en: 'Nothing this morning', es: 'Nada esta mañana', fr: 'Rien ce matin' } },
  { id: 'maybe-later', label: 'Maybe later', role: 'say', chunk: { en: 'Maybe later', es: 'Quizás más tarde', fr: 'Peut-être plus tard' } },
  { id: 'what-doing-tonight', label: 'And what are you doing tonight?', role: 'hear', chunk: { en: 'And what are you doing tonight?', es: '¿Y qué haces esta noche?', fr: 'Et tu fais quoi ce soir ?' } },
  { id: 'im-free', label: 'I’m free', role: 'say', chunk: { en: "I'm free", es: 'estoy libre', fr: 'je suis libre' } },
  { id: 'free-tonight', label: 'I’m free tonight', role: 'say', chunk: { en: "I'm free tonight", es: 'Estoy libre esta noche', fr: 'Je suis libre ce soir' } },
  { id: 'going-to-eat', label: 'We’re going to eat in the centre', role: 'hear', chunk: { en: "We're going to eat in the centre", es: 'Vamos a comer en el centro', fr: 'On va manger dans le centre' } },
  { id: 'want-to-come', label: 'Do you want to come?', role: 'hear', chunk: { en: 'Do you want to come?', es: '¿Quieres venir?', fr: 'Tu veux venir ?' } },
  { id: 'what-time', label: 'Yes! What time?', role: 'say', chunk: { en: 'Yes! What time?', es: '¡Sí! ¿A qué hora?', fr: 'Oui ! À quelle heure ?' } },
  { id: 'at-eight', label: 'At eight', role: 'hear', chunk: { en: 'At eight', es: 'A las ocho', fr: 'À huit heures' } },
  { id: 'too-late-q', label: 'Is that too late for you?', role: 'hear', chunk: { en: 'Is that too late for you?', es: '¿Es muy tarde para ti?', fr: 'C’est trop tard pour toi ?' } },
  { id: 'not-too-late', label: 'No, that’s not too late', role: 'say', chunk: { en: "No, that's not too late", es: 'No, no es muy tarde', fr: 'Non, ce n’est pas trop tard' } },
  { id: 'great', label: 'Great', role: 'hear', chunk: { en: 'Great', es: 'Genial', fr: 'Super' } },
  { id: 'very-good-there', label: 'It’s very good there', role: 'hear', chunk: { en: "It's very good there", es: 'Allí se come muy bien', fr: 'C’est très bon là-bas' } },
  { id: 'what-doing-tomorrow', label: 'What are you doing tomorrow?', role: 'say', chunk: { en: 'What are you doing tomorrow?', es: '¿Qué haces mañana?', fr: 'Tu fais quoi demain ?' } },
  { id: 'tomorrow-morning', label: 'Tomorrow morning', role: 'hear', chunk: { en: 'Tomorrow morning', es: 'Mañana por la mañana', fr: 'Demain matin' } },
  { id: 'going-to-beach', label: 'I’m going to the beach', role: 'hear', chunk: { en: "I'm going to the beach", es: 'voy a la playa', fr: 'je vais à la plage' } },
  { id: 'free-tomorrow-q', label: 'Are you free tomorrow?', role: 'hear', chunk: { en: 'Are you free tomorrow?', es: '¿Estás libre mañana?', fr: 'Tu es libre demain ?' } },
  { id: 'come-with-us', label: 'Then come with us', role: 'hear', chunk: { en: 'Then come with us', es: '¡Entonces ven con nosotros!', fr: 'Alors viens avec nous' } },
  { id: 'leave-early', label: 'But we leave early', role: 'hear', chunk: { en: 'But we leave early', es: 'Pero salimos temprano', fr: 'Mais on part tôt' } },
  { id: 'no-problem', label: 'No problem', role: 'say', chunk: { en: 'No problem', es: 'No hay problema', fr: 'Pas de problème' } },
  { id: 'lets-meet', label: 'Let’s meet here at seven', role: 'say', chunk: { en: "Let's meet here at seven", es: 'Quedamos aquí a las siete', fr: 'On se retrouve ici à sept heures' } },
  { id: 'perfect', label: 'Perfect', role: 'hear', chunk: { en: 'Perfect', es: 'Perfecto', fr: 'Parfait' } },
  { id: 'have-to-go', label: 'I have to go now', role: 'hear', chunk: { en: 'I have to go now', es: 'Me tengo que ir ahora', fr: 'Je dois y aller maintenant' } },
  { id: 'see-you-tonight', label: 'see you tonight', role: 'hear', chunk: { en: 'see you tonight', es: '¡nos vemos esta noche!', fr: 'à ce soir' } },
];
