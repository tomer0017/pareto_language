import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 02 — the dialogue coverage specification, on the Mission 01 pattern (the counting and the
 * rule live in `mission01Coverage.ts`; this file only names the chunks of THIS conversation).
 *
 * hear = the vendor says it (comprehension first) · say = the learner says it (rapid recall).
 */
export const M02_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'fresh-strawberries', label: 'What is sold', role: 'hear', chunk: { en: 'Fresh strawberries', es: 'Fresas frescas', fr: 'Fraises fraîches' } },
  { id: 'best-market', label: 'The sales pitch', role: 'hear', chunk: { en: 'Best in the market', es: 'Las mejores del mercado', fr: 'Les meilleures du marché' } },
  { id: 'how-much', label: 'Price question', role: 'say', chunk: { en: 'How much is it?', es: '¿Cuánto es?', fr: 'C’est combien ?' } },
  { id: 'five-euros', label: 'The price: five euros', role: 'hear', chunk: { en: 'five euros', es: 'cinco euros', fr: 'cinq euros' } },
  { id: 'box', label: 'The unit: a box', role: 'hear', chunk: { en: 'box', es: 'caja', fr: 'barquette' } },
  { id: 'two', label: 'Two', role: 'hear', chunk: { en: 'two', es: 'dos', fr: 'deux' } },
  { id: 'two-for-eight', label: 'The offer: two for eight', role: 'hear', chunk: { en: 'two for eight', es: 'dos por ocho', fr: 'deux pour huit' } },
  { id: 'one-box', label: 'The order', role: 'say', chunk: { en: 'One box, please', es: 'Una caja, por favor', fr: 'Une barquette, s’il vous plaît' } },
  { id: 'perfect', label: 'Perfect', role: 'hear', chunk: { en: 'Perfect', es: 'Perfecto', fr: 'Parfait' } },
  { id: 'thats-five', label: 'The total', role: 'hear', chunk: { en: "That's five euros", es: 'Son cinco euros', fr: 'Ça fait cinq euros' } },
  { id: 'cash-or-card', label: 'Payment question', role: 'hear', chunk: { en: 'Cash or card?', es: '¿Efectivo o tarjeta?', fr: 'Espèces ou carte ?' } },
  { id: 'by-card', label: 'Payment answer', role: 'say', chunk: { en: 'By card, please', es: 'Con tarjeta, por favor', fr: 'Par carte, s’il vous plaît' } },
  { id: 'thank-you', label: 'Thanks', role: 'hear', chunk: { en: 'Thank you', es: 'Gracias', fr: 'Merci' } },
  { id: 'enjoy', label: 'The closing wish', role: 'hear', chunk: { en: 'Enjoy the strawberries', es: 'Que las disfrute', fr: 'Bonne dégustation' } },
];

/** The four numbers of the offer, as the learner must catch them by ear. */
export const M02_NUMBERS: Record<'en' | 'es' | 'fr', Record<1 | 2 | 5 | 8, string>> = {
  en: { 1: 'one', 2: 'two', 5: 'five', 8: 'eight' },
  es: { 1: 'una', 2: 'dos', 5: 'cinco', 8: 'ocho' },
  fr: { 1: 'une', 2: 'deux', 5: 'cinq', 8: 'huit' },
};
