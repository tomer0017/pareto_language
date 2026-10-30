import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 09 — Shopping: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words).
 *
 * say = the shopper's own lines · hear = the salesperson's lines (comprehension first — never asked
 * for as something to say). Every word of every line belongs to one of these chunks (a test proves it).
 */
export const M09_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hi-there', label: 'Hi there', role: 'hear', chunk: { en: 'Hi there', es: '¡Hola!', fr: 'Bonjour' } },
  { id: 'help-find', label: 'Can I help you find anything?', role: 'hear', chunk: { en: 'Can I help you find anything?', es: '¿Le ayudo a encontrar algo?', fr: 'Je peux vous aider à trouver quelque chose ?' } },
  { id: 'just-looking', label: 'I’m just looking', role: 'say', chunk: { en: "I'm just looking", es: 'Solo estoy mirando', fr: 'Je regarde seulement' } },
  { id: 'thanks', label: 'thanks', role: 'say', chunk: { en: 'thanks', es: 'gracias', fr: 'merci' } },
  { id: 'take-your-time', label: 'Of course, take your time', role: 'hear', chunk: { en: 'Of course, take your time', es: 'Claro, tómese su tiempo', fr: 'Bien sûr, prenez votre temps' } },
  { id: 'need-a-hand', label: 'Let me know if you need a hand', role: 'hear', chunk: { en: 'Let me know if you need a hand', es: 'Avíseme si necesita ayuda', fr: 'Dites-moi si vous avez besoin d’aide' } },
  { id: 'try-this-on', label: 'Can I try this on?', role: 'say', chunk: { en: 'Can I try this on?', es: '¿Puedo probarme esto?', fr: 'Je peux essayer ça ?' } },
  { id: 'sure', label: 'Sure', role: 'hear', chunk: { en: 'Sure', es: '¡Claro!', fr: 'Bien sûr !' } },
  { id: 'what-size', label: 'What size are you?', role: 'hear', chunk: { en: 'What size are you?', es: '¿Qué talla usa?', fr: 'Vous faites quelle taille ?' } },
  { id: 'fitting-room', label: 'The fitting room', role: 'hear', chunk: { en: 'The fitting room', es: 'El probador', fr: 'La cabine d’essayage' } },
  { id: 'over-there', label: 'is over there', role: 'hear', chunk: { en: 'is over there', es: 'está allí', fr: 'est là-bas' } },
  { id: 'bigger-size', label: 'Do you have a bigger size?', role: 'say', chunk: { en: 'Do you have a bigger size?', es: '¿Tiene una talla más grande?', fr: 'Vous avez une taille au-dessus ?' } },
  { id: 'here-you-go', label: 'Here you go', role: 'hear', chunk: { en: 'Here you go', es: 'Aquí tiene', fr: 'Voilà' } },
  { id: 'one-size-up', label: 'one size up', role: 'hear', chunk: { en: 'one size up', es: 'una talla más', fr: 'une taille au-dessus' } },
  { id: 'good-news', label: 'And good news', role: 'hear', chunk: { en: 'And good news', es: 'Y buena noticia', fr: 'Et bonne nouvelle' } },
  { id: 'on-sale', label: 'it’s on sale', role: 'hear', chunk: { en: 'it’s on sale', es: 'está rebajado', fr: 'c’est en solde' } },
  { id: 'twenty-percent-off', label: 'twenty percent off', role: 'hear', chunk: { en: 'twenty percent off', es: 'un veinte por ciento de descuento', fr: 'vingt pour cent de réduction' } },
  { id: 'great', label: 'Great', role: 'say', chunk: { en: 'Great', es: 'Genial', fr: 'Super' } },
  { id: 'take-it', label: 'I’ll take it', role: 'say', chunk: { en: "I'll take it", es: 'me lo llevo', fr: 'je le prends' } },
  { id: 'wonderful', label: 'Wonderful', role: 'hear', chunk: { en: 'Wonderful', es: 'Perfecto', fr: 'Parfait' } },
  { id: 'ring-you-up', label: 'I’ll ring you up', role: 'hear', chunk: { en: 'I’ll ring you up', es: 'le cobro', fr: 'je vous encaisse' } },
  { id: 'till', label: 'at the till', role: 'hear', chunk: { en: 'at the till', es: 'en la caja', fr: 'à la caisse' } },
  { id: 'thank-you', label: 'Thank you', role: 'hear', chunk: { en: 'Thank you', es: 'Gracias', fr: 'Merci' } },
];
