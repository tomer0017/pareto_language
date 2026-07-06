import type { LocalizedText } from '@ready/content-schema';
import type { BootcampItem } from './types.js';

/** The shared Recovery Kit — reused across every mission so the 7 tools stay warm in context. */
export const T = (he: string, en: string): LocalizedText => ({ he, en });

export const RECOVERY_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.recovery.dont-understand', text: "Sorry, I don't understand.", meaning: T('סליחה, אני לא מבין.', "Sorry, I don't understand.") },
  { id: 'en.phrase.recovery.repeat', text: 'Can you repeat that?', meaning: T('אפשר לחזור על זה?', 'Can you repeat that?') },
  { id: 'en.phrase.recovery.slowly', text: 'Please speak slowly.', meaning: T('דבר לאט, בבקשה.', 'Please speak slowly.') },
  { id: 'en.phrase.recovery.show-me', text: 'Can you show me?', meaning: T('אתה יכול להראות לי?', 'Can you show me?') },
  { id: 'en.phrase.recovery.one-moment', text: 'One moment, please.', meaning: T('רגע אחד, בבקשה.', 'One moment, please.') },
  { id: 'en.phrase.recovery.thank-you', text: 'Thank you!', meaning: T('תודה!', 'Thank you!') },
  { id: 'en.phrase.recovery.sorry', text: 'Sorry!', meaning: T('סליחה!', 'Sorry!') },
];

const byId = new Map(RECOVERY_ITEMS.map((i) => [i.id, i]));
/** Pick a subset of recovery items to bundle into a mission's item list. */
export function recovery(...ids: string[]): BootcampItem[] {
  return ids.map((id) => byId.get(id)).filter((i): i is BootcampItem => i !== undefined);
}
