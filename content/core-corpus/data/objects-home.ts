import type { CorpusRow } from '../types.js';

/**
 * Personal objects, the room/accommodation domain, and travel technology. The hotel-room
 * problem set ("the air conditioning doesn't work", "no toilet paper") plus the words modern
 * travel actually runs on (wifi, password, SIM card) — high coverage, zero glamour.
 */
export const OBJECTS_HOME: CorpusRow[] = [
  // ── Objects (15) ───────────────────────────────────────────────────────────
  { slug: 'towel', pos: 'noun', en: 'towel', he: 'מגבת', cat: 'objects', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 4], ex: 'We need more towels.', exHe: 'אנחנו צריכים עוד מגבות.' },
  { slug: 'soap', pos: 'noun', en: 'soap', he: 'סבון', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 1, 3], emoji: '🧼', vis: 0.85, ex: 'There is no soap.', exHe: 'אין סבון.' },
  { slug: 'toothbrush', pos: 'noun', en: 'toothbrush', he: 'מברשת שיניים', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 3, 2, 1, 3], emoji: '🪥', vis: 0.9, ex: 'I forgot my toothbrush.', exHe: 'שכחתי את מברשת השיניים.' },
  { slug: 'toothpaste', pos: 'noun', en: 'toothpaste', he: 'משחת שיניים', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 3, 2, 1, 3], ex: 'A small toothpaste.', exHe: 'משחת שיניים קטנה.' },
  { slug: 'shampoo', pos: 'noun', en: 'shampoo', he: 'שמפו', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 2], ex: 'Shampoo and soap.', exHe: 'שמפו וסבון.' },
  { slug: 'charger', pos: 'noun', en: 'charger', he: 'מטען', cat: 'objects', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 4], ex: 'I lost my charger.', exHe: 'איבדתי את המטען שלי.' },
  { slug: 'battery', pos: 'noun', en: 'battery', he: 'סוללה', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '🔋', vis: 0.9, ex: 'The battery is empty.', exHe: 'הסוללה ריקה.' },
  { slug: 'pen', pos: 'noun', en: 'pen', he: 'עט', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 2, 3], emoji: '🖊️', vis: 0.9, ex: 'A pen for the form.', exHe: 'עט לטופס.' },
  { slug: 'paper', pos: 'noun', en: 'paper', he: 'נייר', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 2], emoji: '📄', vis: 0.8, ex: 'A piece of paper.', exHe: 'פיסת נייר.' },
  { slug: 'adapter', pos: 'noun', en: 'adapter', he: 'מתאם (לשקע)', cat: 'objects', layer: 2, rof: 2, skill: 'recall', s: [2, 4, 2, 1, 4], ex: 'I need an adapter.', exHe: 'אני צריך מתאם.', rel: ['plug'] },
  { slug: 'scissors', pos: 'noun', en: 'scissors', he: 'מספריים', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 1], emoji: '✂️', vis: 0.95, ex: 'Do you have scissors?', exHe: 'יש לך מספריים?' },
  { slug: 'mirror', pos: 'noun', en: 'mirror', he: 'מראה', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 1], emoji: '🪞', vis: 0.85, ex: 'The mirror in the room.', exHe: 'המראה בחדר.' },
  { slug: 'comb', pos: 'noun', en: 'comb', he: 'מסרק', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [1, 2, 1, 1, 1], ex: 'A small comb.', exHe: 'מסרק קטן.' },
  { slug: 'razor', pos: 'noun', en: 'razor', he: 'סכין גילוח', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 2], emoji: '🪒', vis: 0.9, ex: 'A razor, please.', exHe: 'סכין גילוח, בבקשה.' },
  { slug: 'sunglasses', pos: 'noun', en: 'sunglasses', he: 'משקפי שמש', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 3], emoji: '🕶️', vis: 0.9, ex: 'New sunglasses.', exHe: 'משקפי שמש חדשים.' },

  // ── Home & room (25) ───────────────────────────────────────────────────────
  { slug: 'room', pos: 'noun', en: 'room', he: 'חדר', cat: 'home', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 4, 5], ex: 'A room for two nights.', exHe: 'חדר לשני לילות.' },
  { slug: 'bed', pos: 'noun', en: 'bed', he: 'מיטה', cat: 'home', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 2, 4], emoji: '🛏️', vis: 0.9, ex: 'A double bed.', exHe: 'מיטה זוגית.' },
  { slug: 'table', pos: 'noun', en: 'table', he: 'שולחן', cat: 'home', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 3, 5], ex: 'A table for two, please.', exHe: 'שולחן לשניים, בבקשה.' },
  { slug: 'chair', pos: 'noun', en: 'chair', he: 'כיסא', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 2], emoji: '🪑', vis: 0.9, ex: 'One more chair, please.', exHe: 'עוד כיסא, בבקשה.' },
  { slug: 'shower', pos: 'noun', en: 'shower', he: 'מקלחת', cat: 'home', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 3, 2, 4], emoji: '🚿', vis: 0.9, ex: 'The shower is cold.', exHe: 'המקלחת קרה.' },
  { slug: 'sink', pos: 'noun', en: 'sink', he: 'כיור', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 1, 2], ex: 'The sink is blocked.', exHe: 'הכיור סתום.' },
  { slug: 'kitchen', pos: 'noun', en: 'kitchen', he: 'מטבח', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 3], ex: 'Is there a kitchen?', exHe: 'יש מטבח?' },
  { slug: 'bathroom', pos: 'noun', en: 'bathroom', he: 'חדר אמבטיה', cat: 'home', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 2, 4], emoji: '🛁', vis: 0.85, ex: 'The bathroom is small.', exHe: 'חדר האמבטיה קטן.' },
  { slug: 'toilet-paper', pos: 'noun', en: 'toilet paper', he: 'נייר טואלט', cat: 'home', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 2, 1, 4], emoji: '🧻', vis: 0.9, ex: 'There is no toilet paper.', exHe: 'אין נייר טואלט.' },
  { slug: 'air-conditioning', pos: 'noun', en: 'air conditioning', he: 'מזגן', cat: 'home', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 4], ex: 'The air conditioning does not work.', exHe: 'המזגן לא עובד.', alias: ['AC'] },
  { slug: 'heating', pos: 'noun', en: 'heating', he: 'חימום', cat: 'home', layer: 2, rof: 2, skill: 'recall', s: [3, 3, 3, 1, 3], ex: 'The heating is off.', exHe: 'החימום כבוי.' },
  { slug: 'pillow', pos: 'noun', en: 'pillow', he: 'כרית', cat: 'home', layer: 2, rof: 1, skill: 'recall', s: [3, 3, 2, 1, 3], ex: 'Another pillow, please.', exHe: 'עוד כרית, בבקשה.' },
  { slug: 'blanket', pos: 'noun', en: 'blanket', he: 'שמיכה', cat: 'home', layer: 2, rof: 1, skill: 'recall', s: [3, 3, 2, 1, 3], ex: 'A warm blanket.', exHe: 'שמיכה חמה.' },
  { slug: 'sheets', pos: 'noun', en: 'sheets', he: 'סדינים', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [2, 3, 2, 1, 3], ex: 'Clean sheets, please.', exHe: 'סדינים נקיים, בבקשה.' },
  { slug: 'lamp', pos: 'noun', en: 'lamp', he: 'מנורה', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '💡', vis: 0.85, ex: 'The lamp is broken.', exHe: 'המנורה שבורה.' },
  { slug: 'sofa', pos: 'noun', en: 'sofa', he: 'ספה', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 1], emoji: '🛋️', vis: 0.9, ex: 'A sofa in the lobby.', exHe: 'ספה בלובי.', alias: ['couch'] },
  { slug: 'fridge', pos: 'noun', en: 'fridge', he: 'מקרר', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 1, 3], ex: 'Is there a fridge in the room?', exHe: 'יש מקרר בחדר?', alias: ['refrigerator'] },
  { slug: 'balcony', pos: 'noun', en: 'balcony', he: 'מרפסת', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 1, 3], ex: 'A room with a balcony.', exHe: 'חדר עם מרפסת.' },
  { slug: 'floor', pos: 'noun', en: 'floor', he: 'קומה', cat: 'home', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 2, 4], ex: 'The third floor.', exHe: 'קומה שלישית.' },
  { slug: 'wall', pos: 'noun', en: 'wall', he: 'קיר', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], ex: 'The picture on the wall.', exHe: 'התמונה על הקיר.' },
  { slug: 'trash', pos: 'noun', en: 'trash', he: 'פח אשפה', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 1, 2], emoji: '🗑️', vis: 0.85, ex: 'Where is the trash?', exHe: 'איפה פח האשפה?', alias: ['bin', 'garbage'] },
  { slug: 'laundry', pos: 'noun', en: 'laundry', he: 'כביסה', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [2, 3, 3, 1, 3], emoji: '🧺', vis: 0.8, ex: 'Is there a laundry service?', exHe: 'יש שירות כביסה?' },
  { slug: 'locker', pos: 'noun', en: 'locker', he: 'לוקר / תא אחסון', cat: 'home', layer: 2, rof: 2, skill: 'recognize', s: [2, 3, 3, 1, 4], ex: 'Lockers are at the station.', exHe: 'הלוקרים בתחנה.' },
  { slug: 'apartment', pos: 'noun', en: 'apartment', he: 'דירה', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 1, 3], ex: 'We rented an apartment.', exHe: 'שכרנו דירה.' },
  { slug: 'garden', pos: 'noun', en: 'garden', he: 'גינה', cat: 'home', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], ex: 'A table in the garden.', exHe: 'שולחן בגינה.' },

  // ── Technology (15) ────────────────────────────────────────────────────────
  { slug: 'wifi', pos: 'noun', en: 'wifi', he: 'וויי-פיי', cat: 'technology', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 4, 5], emoji: '📶', vis: 0.85, ex: 'What is the wifi password?', exHe: 'מה הסיסמה של הוויי-פיי?', rel: ['password', 'internet'] },
  { slug: 'internet', pos: 'noun', en: 'internet', he: 'אינטרנט', cat: 'technology', layer: 2, rof: 2, skill: 'recognize', s: [5, 4, 4, 3, 4], emoji: '🌐', vis: 0.8, ex: 'The internet is slow.', exHe: 'האינטרנט איטי.' },
  { slug: 'computer', pos: 'noun', en: 'computer', he: 'מחשב', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 2], emoji: '💻', vis: 0.9, ex: 'My computer is in the bag.', exHe: 'המחשב שלי בתיק.', alias: ['laptop'] },
  { slug: 'screen', pos: 'noun', en: 'screen', he: 'מסך', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 2], ex: 'Look at the screen.', exHe: 'תסתכל על המסך.' },
  { slug: 'cable', pos: 'noun', en: 'cable', he: 'כבל', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 1, 2], ex: 'A USB cable.', exHe: 'כבל יו-אס-בי.' },
  { slug: 'plug', pos: 'noun', en: 'plug', he: 'תקע / שקע', cat: 'technology', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 4], emoji: '🔌', vis: 0.85, ex: 'I need a plug adapter.', exHe: 'אני צריך מתאם לשקע.', alias: ['socket', 'outlet'] },
  { slug: 'sim-card', pos: 'noun', en: 'SIM card', he: 'כרטיס סים', cat: 'technology', layer: 2, rof: 2, skill: 'recall', s: [2, 4, 3, 2, 4], ex: 'A SIM card with data.', exHe: 'כרטיס סים עם גלישה.' },
  { slug: 'app', pos: 'noun', en: 'app', he: 'אפליקציה', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 3], ex: 'Use the metro app.', exHe: 'תשתמש באפליקציה של המטרו.' },
  { slug: 'email', pos: 'noun', en: 'email', he: 'אימייל', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 2, 3], emoji: '📧', vis: 0.85, ex: 'Send it by email.', exHe: 'תשלח את זה באימייל.' },
  { slug: 'password', pos: 'noun', en: 'password', he: 'סיסמה', cat: 'technology', layer: 1, rof: 2, skill: 'recall', s: [4, 4, 5, 2, 4], ex: 'The wifi password, please.', exHe: 'את סיסמת הוויי-פיי, בבקשה.', rel: ['wifi'] },
  { slug: 'photo', pos: 'noun', en: 'photo', he: 'תמונה', cat: 'technology', layer: 2, rof: 1, skill: 'recall', s: [4, 4, 4, 2, 4], emoji: '🖼️', vis: 0.85, ex: 'Can you take a photo of us?', exHe: 'אפשר לצלם אותנו?', alias: ['picture'] },
  { slug: 'video', pos: 'noun', en: 'video', he: 'סרטון', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 1, 2], emoji: '🎬', vis: 0.85, ex: 'A short video.', exHe: 'סרטון קצר.' },
  { slug: 'headphones', pos: 'noun', en: 'headphones', he: 'אוזניות', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 1, 2], emoji: '🎧', vis: 0.9, ex: 'I forgot my headphones.', exHe: 'שכחתי את האוזניות שלי.' },
  { slug: 'television', pos: 'noun', en: 'television', he: 'טלוויזיה', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 1], emoji: '📺', vis: 0.9, ex: 'The television does not work.', exHe: 'הטלוויזיה לא עובדת.', alias: ['TV'] },
  { slug: 'message', pos: 'noun', en: 'message', he: 'הודעה', cat: 'technology', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 2], emoji: '💬', vis: 0.8, ex: 'Send me a message.', exHe: 'תשלח לי הודעה.' },
];
