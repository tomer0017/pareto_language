import type { LocalizedText } from '@ready/content-schema';
import type { BootcampItem } from '../types.js';

/**
 * The shared FRENCH Recovery Kit — the 7 survival tools, reused across French missions (the parallel
 * of the English `recovery.ts`). Ids are `fr.phrase.recovery.*` so French review/progress stays
 * isolated from English. Neutral-polite (vous), AI-drafted, pending native review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });

export const RECOVERY_ITEMS_FR: BootcampItem[] = [
  { id: 'fr.phrase.recovery.dont-understand', text: 'Désolé, je ne comprends pas.', meaning: T('סליחה, אני לא מבין.', "Sorry, I don't understand.") },
  { id: 'fr.phrase.recovery.repeat', text: 'Vous pouvez répéter ?', meaning: T('אפשר לחזור על זה?', 'Can you repeat that?') },
  { id: 'fr.phrase.recovery.slowly', text: 'Parlez lentement, s’il vous plaît.', meaning: T('דבר לאט, בבקשה.', 'Please speak slowly.') },
  { id: 'fr.phrase.recovery.show-me', text: 'Vous pouvez me montrer ?', meaning: T('אתה יכול להראות לי?', 'Can you show me?') },
  { id: 'fr.phrase.recovery.one-moment', text: 'Un instant, s’il vous plaît.', meaning: T('רגע אחד, בבקשה.', 'One moment, please.') },
  { id: 'fr.phrase.recovery.thank-you', text: 'Merci !', meaning: T('תודה!', 'Thank you!') },
  { id: 'fr.phrase.recovery.sorry', text: 'Pardon !', meaning: T('סליחה!', 'Sorry! / Excuse me!') },
];

const byId = new Map(RECOVERY_ITEMS_FR.map((i) => [i.id, i]));
/** Pick a subset of French recovery items to bundle into a mission's item list. */
export function recoveryFr(...ids: string[]): BootcampItem[] {
  return ids.map((id) => byId.get(id)).filter((i): i is BootcampItem => i !== undefined);
}
