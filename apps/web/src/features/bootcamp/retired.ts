import { T } from './recovery.js';
import type { BootcampItem } from './types.js';

/**
 * Retired sentences — an ARCHIVE, not content. A sentence lands here when the mission it belonged
 * to stopped teaching it (the conversation changed, or the line no longer fits the product rules).
 *
 * Nothing registers this file: these sentences are in no mission, so they do not appear in the
 * sentence library (Core), in Listen, in review / flashcards, in a mission's "what did I learn"
 * list, or in what the companion may say. Their ids and wording are kept so that
 *   - practice history already stored under these ids still refers to something real, and
 *   - a later mission or the Extended material can bring a sentence back under its original id.
 * To bring one back, move it into that mission's sentence list — do not redefine the id.
 */
export interface RetiredSentence extends BootcampItem {
  /** The stable id of the mission that used to hold it. */
  retiredFrom: string;
  reason: string;
}

export const RETIRED_SENTENCES: Record<'en' | 'fr' | 'es', RetiredSentence[]> = {
  en: [
    { id: 'en.phrase.rest.menu', text: 'The menu, please.', meaning: T('התפריט, בבקשה.', 'The menu, please.'), retiredFrom: 'restaurant-meal', reason: "Not said in the current conversation and no longer practised." },
    { id: 'en.reply.rest.how-was-it', text: 'How was everything?', meaning: T('איך היה הכל?', 'How was everything?'), retiredFrom: 'restaurant-meal', reason: "The conversation now asks \"Is everything okay?\"." },
    { id: 'en.reply.rest.dessert', text: 'Would you like dessert?', meaning: T('רוצים קינוח?', 'Would you like dessert?'), retiredFrom: 'restaurant-meal', reason: "The conversation no longer offers dessert." },
    { id: 'en.reply.diet.good-option', text: 'This one is a good option for you.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.'), retiredFrom: 'special-requests-allergies', reason: "Removed with the allergy pass: nothing in the mission may read as a safety assurance." },
    { id: 'en.reply.super.weigh-it', text: 'You need to weigh it first.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.'), retiredFrom: 'supermarket', reason: "Weighing produce left the conversation." },
  ],
  fr: [
    { id: 'fr.phrase.rest.menu', text: 'La carte, s’il vous plaît.', meaning: T('התפריט, בבקשה.', 'The menu, please.'), retiredFrom: 'restaurant-meal', reason: "Not said in the current conversation and no longer practised." },
    { id: 'fr.reply.rest.how-was-it', text: 'Tout s’est bien passé ?', meaning: T('איך היה הכל?', 'How was everything?'), retiredFrom: 'restaurant-meal', reason: "The conversation now asks \"Is everything okay?\"." },
    { id: 'fr.reply.rest.dessert', text: 'Vous voulez un dessert ?', meaning: T('רוצים קינוח?', 'Would you like dessert?'), retiredFrom: 'restaurant-meal', reason: "The conversation no longer offers dessert." },
    { id: 'fr.reply.diet.good-option', text: 'Celui-ci est une bonne option pour vous.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.'), retiredFrom: 'special-requests-allergies', reason: "Removed with the allergy pass: nothing in the mission may read as a safety assurance." },
    { id: 'fr.reply.super.weigh-it', text: 'Vous devez d’abord le peser.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.'), retiredFrom: 'supermarket', reason: "Weighing produce left the conversation." },
  ],
  es: [
    { id: 'es.phrase.rest.menu', text: 'La carta, por favor.', meaning: T('התפריט, בבקשה.', 'The menu, please.'), retiredFrom: 'restaurant-meal', reason: "Not said in the current conversation and no longer practised." },
    { id: 'es.reply.rest.how-was-it', text: '¿Qué tal todo?', meaning: T('איך היה הכל?', 'How was everything?'), retiredFrom: 'restaurant-meal', reason: "The conversation now asks \"Is everything okay?\"." },
    { id: 'es.reply.rest.dessert', text: '¿Quieren postre?', meaning: T('רוצים קינוח?', 'Would you like dessert?'), retiredFrom: 'restaurant-meal', reason: "The conversation no longer offers dessert." },
    { id: 'es.reply.diet.good-option', text: 'Este es una buena opción para usted.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.'), retiredFrom: 'special-requests-allergies', reason: "Removed with the allergy pass: nothing in the mission may read as a safety assurance." },
    { id: 'es.reply.super.weigh-it', text: 'Primero tiene que pesarlo.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.'), retiredFrom: 'supermarket', reason: "Weighing produce left the conversation." },
  ],
};
