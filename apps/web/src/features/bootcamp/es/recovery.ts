import type { LocalizedText } from '@ready/content-schema';
import type { BootcampItem } from '../types.js';

/**
 * The shared SPANISH Recovery Kit — the 7 survival tools, reused across Spanish missions (the parallel
 * of the English `recovery.ts` and French `fr/recovery.ts`). Ids are `es.phrase.recovery.*` so Spanish
 * review/progress stays isolated from English and French. Neutral-polite international Spanish (usted
 * for service interactions), AI-drafted, pending native review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });

export const RECOVERY_ITEMS_ES: BootcampItem[] = [
  { id: 'es.phrase.recovery.dont-understand', text: 'Perdón, no entiendo.', meaning: T('סליחה, אני לא מבין.', "Sorry, I don't understand.") },
  { id: 'es.phrase.recovery.repeat', text: '¿Puede repetir, por favor?', meaning: T('אפשר לחזור על זה?', 'Can you repeat that?') },
  { id: 'es.phrase.recovery.slowly', text: 'Más despacio, por favor.', meaning: T('דבר לאט, בבקשה.', 'Please speak slowly.') },
  { id: 'es.phrase.recovery.show-me', text: '¿Me lo puede mostrar?', meaning: T('אתה יכול להראות לי?', 'Can you show me?') },
  { id: 'es.phrase.recovery.one-moment', text: 'Un momento, por favor.', meaning: T('רגע אחד, בבקשה.', 'One moment, please.') },
  { id: 'es.phrase.recovery.thank-you', text: '¡Gracias!', meaning: T('תודה!', 'Thank you!') },
  { id: 'es.phrase.recovery.sorry', text: '¡Perdón!', meaning: T('סליחה!', 'Sorry! / Excuse me!') },
];

const byId = new Map(RECOVERY_ITEMS_ES.map((i) => [i.id, i]));
/** Pick a subset of Spanish recovery items to bundle into a mission's item list. */
export function recoveryEs(...ids: string[]): BootcampItem[] {
  return ids.map((id) => byId.get(id)).filter((i): i is BootcampItem => i !== undefined);
}
