import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 13 — Home, Family & Daily Routine: the dialogue coverage specification, on the Mission 01
 * pattern (the counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the friend's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 * The Flex Round (`transferOnly`) never counts here: coverage is the canonical conversation only.
 */
export const M13_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hi', label: 'Hi', role: 'hear', chunk: { en: 'Hi', es: '¡Hola!', fr: 'Salut' } },
  { id: 'come-in', label: 'Come in', role: 'hear', chunk: { en: 'Come in', es: 'Pasa', fr: 'Entre' } },
  { id: 'thanks', label: 'Thanks', role: 'say', chunk: { en: 'Thanks', es: 'Gracias', fr: 'Merci' } },
  { id: 'home-beautiful', label: 'Your home is beautiful', role: 'say', chunk: { en: 'Your home is beautiful', es: 'Tu casa es preciosa', fr: 'Ta maison est très belle' } },
  { id: 'thank-you', label: 'Thank you', role: 'hear', chunk: { en: 'Thank you', es: 'Gracias', fr: 'Merci' } },
  { id: 'sit-living-room', label: 'Let’s sit in the living room', role: 'hear', chunk: { en: "Let's sit in the living room", es: 'Vamos a sentarnos en el salón', fr: 'On s’assoit dans le salon' } },
  { id: 'sofa-new', label: 'Is this sofa new?', role: 'say', chunk: { en: 'Is this sofa new?', es: '¿Este sofá es nuevo?', fr: 'Ce canapé est nouveau ?' } },
  { id: 'yes-new', label: 'Yes, it’s new', role: 'hear', chunk: { en: "Yes, it's new", es: 'Sí, es nuevo', fr: 'Oui, il est nouveau' } },
  { id: 'where-family', label: 'Where is your family?', role: 'say', chunk: { en: 'Where is your family?', es: '¿Dónde está tu familia?', fr: 'Où est ta famille ?' } },
  { id: 'mother-kitchen', label: 'My mother is in the kitchen', role: 'hear', chunk: { en: 'My mother is in the kitchen', es: 'Mi madre está en la cocina', fr: 'Ma mère est dans la cuisine' } },
  { id: 'live-with-q', label: 'Do you live with your family?', role: 'hear', chunk: { en: 'Do you live with your family?', es: '¿Vives con tu familia?', fr: 'Tu habites avec ta famille ?' } },
  { id: 'live-with', label: 'Yes, I live with my family', role: 'say', chunk: { en: 'Yes, I live with my family', es: 'Sí, vivo con mi familia', fr: 'Oui, j’habite avec ma famille' } },
  { id: 'nice', label: 'Nice', role: 'hear', chunk: { en: 'Nice', es: 'Qué bien', fr: 'Super' } },
  { id: 'hungry', label: 'Are you hungry?', role: 'hear', chunk: { en: 'Are you hungry?', es: '¿Tienes hambre?', fr: 'Tu as faim ?' } },
  { id: 'eat-with-us', label: 'Do you want to eat with us?', role: 'hear', chunk: { en: 'Do you want to eat with us?', es: '¿Quieres comer con nosotros?', fr: 'Tu veux manger avec nous ?' } },
  { id: 'thanks-but', label: 'Thanks, but', role: 'say', chunk: { en: 'Thanks, but', es: 'Gracias, pero', fr: 'Merci, mais' } },
  { id: 'going-to-eat', label: 'I’m going to eat at my grandmother’s', role: 'say', chunk: { en: "I'm going to eat at my grandmother's", es: 'voy a comer en casa de mi abuela', fr: 'je vais manger chez ma grand-mère' } },
  { id: 'lovely', label: 'Lovely', role: 'hear', chunk: { en: 'Lovely', es: '¡Qué bien!', fr: 'C’est bien' } },
  { id: 'look-tired', label: 'You look tired', role: 'hear', chunk: { en: 'You look tired', es: 'Pareces cansado', fr: 'Tu as l’air fatigué' } },
  { id: 'are-you-okay', label: 'Are you okay?', role: 'hear', chunk: { en: 'Are you okay?', es: '¿Estás bien?', fr: 'Ça va ?' } },
  { id: 'just-tired', label: 'Yes, I’m just tired', role: 'say', chunk: { en: "Yes, I'm just tired", es: 'Sí, solo estoy cansado', fr: 'Oui, je suis juste fatigué' } },
  { id: 'go-home-rest', label: 'Then go home and rest', role: 'hear', chunk: { en: 'Then go home and rest', es: '¡Entonces vete a casa y descansa!', fr: 'Alors rentre chez toi et repose-toi' } },
  { id: 'going-home', label: 'Yes, I’m going home', role: 'say', chunk: { en: "Yes, I'm going home", es: 'Sí, me voy a casa', fr: 'Oui, je rentre chez moi' } },
  { id: 'after-dinner', label: 'And after dinner at your grandmother’s?', role: 'hear', chunk: { en: "And after dinner at your grandmother's?", es: '¿Y después de la cena en casa de tu abuela?', fr: 'Et après le dîner chez ta grand-mère ?' } },
  { id: 'going-to-sleep', label: 'I’m going to sleep', role: 'say', chunk: { en: "I'm going to sleep", es: 'Me voy a dormir', fr: 'Je vais dormir' } },
  { id: 'good-night', label: 'Ha! Good night', role: 'hear', chunk: { en: 'Ha! Good night', es: '¡Ja! Buenas noches', fr: 'Ha ! Bonne nuit' } },
  { id: 'say-hi', label: 'Say hi to your family', role: 'hear', chunk: { en: 'Say hi to your family', es: '¡Saluda a tu familia!', fr: 'Dis bonjour à ta famille' } },
];
