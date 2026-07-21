import type { CorpusRow } from '../types.js';

/**
 * Body + health expansion, people & family, and the emergency kit. Highest RoF density in the
 * corpus: allergy, lost, stolen and "Help!" are exactly the words whose absence breaks safety,
 * not nuance (RoF 3). Family words power the smalltalk connection layer.
 */
export const HEALTH_PEOPLE: CorpusRow[] = [
  // ── Body (6) ───────────────────────────────────────────────────────────────
  { slug: 'head', pos: 'noun', en: 'head', he: 'ראש', cat: 'body', layer: 2, rof: 2, skill: 'recall', s: [4, 3, 3, 2, 3], ex: 'My head hurts.', exHe: 'הראש שלי כואב.' },
  { slug: 'hair', pos: 'noun', en: 'hair', he: 'שיער', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 1], ex: 'Short hair.', exHe: 'שיער קצר.' },
  { slug: 'face', pos: 'noun', en: 'face', he: 'פנים', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 1], ex: 'Wash your face.', exHe: 'שטוף את הפנים.' },
  { slug: 'heart', pos: 'noun', en: 'heart', he: 'לב', cat: 'body', layer: 2, rof: 3, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '❤️', vis: 0.9, ex: 'A heart problem.', exHe: 'בעיה בלב.' },
  { slug: 'stomach', pos: 'noun', en: 'stomach', he: 'בטן', cat: 'body', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 3], ex: 'My stomach hurts.', exHe: 'הבטן שלי כואבת.' },
  { slug: 'back', pos: 'noun', en: 'back', he: 'גב', cat: 'body', layer: 2, rof: 2, skill: 'recall', s: [4, 3, 3, 2, 3], ex: 'My back hurts.', exHe: 'הגב שלי כואב.' },

  // ── Health (9) ─────────────────────────────────────────────────────────────
  { slug: 'headache', pos: 'noun', en: 'headache', he: 'כאב ראש', cat: 'health', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 4], ex: 'Something for a headache.', exHe: 'משהו נגד כאב ראש.' },
  { slug: 'fever', pos: 'noun', en: 'fever', he: 'חום (גבוה)', cat: 'health', layer: 2, rof: 3, skill: 'recall', s: [3, 4, 3, 2, 4], emoji: '🌡️', vis: 0.8, ex: 'I have a fever.', exHe: 'יש לי חום.' },
  { slug: 'allergy', pos: 'noun', en: 'allergy', he: 'אלרגיה', cat: 'health', layer: 1, rof: 3, skill: 'fluent', s: [3, 5, 4, 3, 5], ex: 'I have a nut allergy.', exHe: 'יש לי אלרגיה לאגוזים.', rel: ['medicine', 'doctor'] },
  { slug: 'blood', pos: 'noun', en: 'blood', he: 'דם', cat: 'health', layer: 2, rof: 3, skill: 'recognize', s: [3, 3, 3, 1, 3], emoji: '🩸', vis: 0.9, ex: 'There is blood.', exHe: 'יש דם.' },
  { slug: 'dentist', pos: 'noun', en: 'dentist', he: 'רופא שיניים', cat: 'health', layer: 2, rof: 2, skill: 'recognize', s: [2, 3, 2, 1, 3], ex: 'I need a dentist.', exHe: 'אני צריך רופא שיניים.' },
  { slug: 'nurse', pos: 'noun', en: 'nurse', he: 'אח / אחות (רפואה)', cat: 'health', layer: 2, rof: 2, skill: 'recognize', s: [3, 2, 3, 1, 3], ex: 'The nurse will help you.', exHe: 'האחות תעזור לך.' },
  { slug: 'insurance', pos: 'noun', en: 'insurance', he: 'ביטוח', cat: 'health', layer: 2, rof: 2, skill: 'recognize', s: [3, 3, 4, 2, 4], ex: 'I have travel insurance.', exHe: 'יש לי ביטוח נסיעות.' },
  { slug: 'pill', pos: 'noun', en: 'pill', he: 'כדור (תרופה)', cat: 'health', layer: 2, rof: 2, skill: 'recognize', s: [3, 3, 3, 1, 3], ex: 'One pill a day.', exHe: 'כדור אחד ביום.' },
  { slug: 'cream', pos: 'noun', en: 'cream', he: 'משחה', cat: 'health', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 2], emoji: '🧴', vis: 0.7, ex: 'A cream for the sunburn.', exHe: 'משחה לכוויית השמש.' },

  // ── People & family (13) ───────────────────────────────────────────────────
  { slug: 'name', pos: 'noun', en: 'name', he: 'שם', cat: 'people', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 4], ex: 'My name is Dana.', exHe: 'קוראים לי דנה.' },
  { slug: 'mother', pos: 'noun', en: 'mother', he: 'אמא', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [5, 3, 3, 2, 2], ex: 'This is my mother.', exHe: 'זאת אמא שלי.', opp: ['father'], alias: ['mom'] },
  { slug: 'father', pos: 'noun', en: 'father', he: 'אבא', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [5, 3, 3, 2, 2], ex: 'My father loves to travel.', exHe: 'אבא שלי אוהב לטייל.', opp: ['mother'], alias: ['dad'] },
  { slug: 'grandmother', pos: 'noun', en: 'grandmother', he: 'סבתא', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [4, 2, 2, 1, 2], ex: 'My grandmother is kind.', exHe: 'סבתא שלי נחמדה.', opp: ['grandfather'], alias: ['grandma'] },
  { slug: 'grandfather', pos: 'noun', en: 'grandfather', he: 'סבא', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [4, 2, 2, 1, 2], ex: 'Grandfather has a farm.', exHe: 'לסבא יש חווה.', opp: ['grandmother'], alias: ['grandpa'] },
  { slug: 'people', pos: 'noun', en: 'people', he: 'אנשים', cat: 'people', layer: 2, rof: 2, skill: 'recognize', s: [5, 3, 4, 3, 3], ex: 'The market is full of people.', exHe: 'השוק מלא אנשים.' },
  { slug: 'brother', pos: 'noun', en: 'brother', he: 'אח', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 1, 2], ex: 'I travel with my brother.', exHe: 'אני מטייל עם אח שלי.', opp: ['sister'] },
  { slug: 'sister', pos: 'noun', en: 'sister', he: 'אחות', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 1, 2], ex: 'My sister lives here.', exHe: 'אחותי גרה כאן.', opp: ['brother'] },
  { slug: 'husband', pos: 'noun', en: 'husband', he: 'בעל', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [4, 3, 3, 1, 2], ex: 'This is my husband.', exHe: 'זה בעלי.', opp: ['wife'] },
  { slug: 'wife', pos: 'noun', en: 'wife', he: 'אישה (בת זוג)', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [4, 3, 3, 1, 2], ex: 'My wife and I.', exHe: 'אשתי ואני.', opp: ['husband'] },
  { slug: 'son', pos: 'noun', en: 'son', he: 'בן', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 1, 2], ex: 'Our son is ten.', exHe: 'הבן שלנו בן עשר.', opp: ['daughter'] },
  { slug: 'daughter', pos: 'noun', en: 'daughter', he: 'בת', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 1, 2], ex: 'My daughter is here.', exHe: 'הבת שלי כאן.', opp: ['son'] },
  { slug: 'boy', pos: 'noun', en: 'boy', he: 'ילד (בן)', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 1, 1], ex: 'The little boy.', exHe: 'הילד הקטן.', opp: ['girl'] },
  { slug: 'girl', pos: 'noun', en: 'girl', he: 'ילדה', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 1, 1], ex: 'The girl with the hat.', exHe: 'הילדה עם הכובע.', opp: ['boy'] },
  { slug: 'tourist', pos: 'noun', en: 'tourist', he: 'תייר', cat: 'people', layer: 2, rof: 1, skill: 'recall', s: [3, 4, 3, 2, 4], ex: 'We are tourists.', exHe: 'אנחנו תיירים.' },
  { slug: 'waiter', pos: 'noun', en: 'waiter', he: 'מלצר', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 1, 4], ex: 'Ask the waiter.', exHe: 'תשאל את המלצר.' },

  // ── Emergency (8) ──────────────────────────────────────────────────────────
  { slug: 'help.call', kind: 'reply', pos: 'interj', en: 'Help!', he: 'הצילו!', cat: 'emergency', layer: 1, rof: 3, skill: 'fluent', role: 'say', s: [2, 5, 4, 5, 5], emoji: '🆘', vis: 0.85, ex: 'Help! Call a doctor!', exHe: 'הצילו! תקראו לרופא!' },
  { slug: 'danger', pos: 'noun', en: 'danger', he: 'סכנה', cat: 'emergency', layer: 1, rof: 3, skill: 'recognize', s: [2, 2, 5, 3, 4], emoji: '⚠️', vis: 0.85, ex: 'Danger! Keep out.', exHe: 'סכנה! אין כניסה.' },
  { slug: 'careful', pos: 'interj', en: 'careful', he: 'זהירות', cat: 'emergency', layer: 1, rof: 3, skill: 'recognize', s: [3, 3, 5, 3, 4], ex: 'Careful, the floor is wet!', exHe: 'זהירות, הרצפה רטובה!' },
  { slug: 'lost', pos: 'adj', en: 'lost', he: 'אבוד', cat: 'emergency', layer: 1, rof: 3, skill: 'recall', s: [3, 5, 3, 4, 5], ex: 'I am lost.', exHe: 'הלכתי לאיבוד.' },
  { slug: 'stolen', pos: 'adj', en: 'stolen', he: 'גנוב', cat: 'emergency', layer: 2, rof: 3, skill: 'recall', s: [2, 4, 3, 3, 5], ex: 'My bag was stolen.', exHe: 'התיק שלי נגנב.' },
  { slug: 'embassy', pos: 'noun', en: 'embassy', he: 'שגרירות', cat: 'emergency', layer: 2, rof: 3, skill: 'recall', s: [2, 4, 3, 2, 5], ex: 'The Israeli embassy.', exHe: 'השגרירות הישראלית.' },
  { slug: 'accident', pos: 'noun', en: 'accident', he: 'תאונה', cat: 'emergency', layer: 2, rof: 3, skill: 'recognize', s: [2, 4, 4, 2, 4], ex: 'There was an accident.', exHe: 'הייתה תאונה.' },
  { slug: 'emergency', pos: 'noun', en: 'emergency', he: 'חירום', cat: 'emergency', layer: 1, rof: 3, skill: 'recognize', s: [2, 4, 5, 3, 5], ex: 'It is an emergency!', exHe: 'זה מקרה חירום!' },

  // ── Core World Audit: people & occupations (Tier B/C) ───────────────────────
  { slug: 'chef', pos: 'noun', en: 'chef', he: 'טבח', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 2, 1, 2], emoji: '🧑‍🍳', vis: 0.9, ex: 'The chef cooks well.', exHe: 'הטבח מבשל טוב.', rel: ['cook'] },
  { slug: 'student', pos: 'noun', en: 'student', he: 'סטודנט', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '🧑‍🎓', vis: 0.85, ex: 'She is a student.', exHe: 'היא סטודנטית.' },
  { slug: 'painter', pos: 'noun', en: 'painter', he: 'צייר', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🧑‍🎨', vis: 0.85, ex: 'The painter sells his art.', exHe: 'הצייר מוכר את האומנות שלו.', rel: ['drawing', 'art'] },
  { slug: 'singer', pos: 'noun', en: 'singer', he: 'זמר', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🧑‍🎤', vis: 0.85, ex: 'A famous singer.', exHe: 'זמר מפורסם.', rel: ['sing'] },
  { slug: 'musician', pos: 'noun', en: 'musician', he: 'מוזיקאי', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], ex: 'The musician plays guitar.', exHe: 'המוזיקאי מנגן בגיטרה.', rel: ['guitar'] },
  { slug: 'clown', pos: 'noun', en: 'clown', he: 'ליצן', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🤡', vis: 0.92, ex: 'The clown makes us laugh.', exHe: 'הליצן מצחיק אותנו.' },
  { slug: 'groom', pos: 'noun', en: 'groom', he: 'חתן', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🤵', vis: 0.85, ex: 'The groom is happy.', exHe: 'החתן שמח.', opp: ['bride'] },
  { slug: 'bride', pos: 'noun', en: 'bride', he: 'כלה', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '👰', vis: 0.85, ex: 'The bride wears white.', exHe: 'הכלה לובשת לבן.', opp: ['groom'] },
  { slug: 'winner', pos: 'noun', en: 'winner', he: 'מנצח', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🏆', vis: 0.8, ex: 'She is the winner.', exHe: 'היא המנצחת.', opp: ['loser'] },
  { slug: 'loser', pos: 'noun', en: 'loser', he: 'מפסיד', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], ex: 'No one likes to be the loser.', exHe: 'אף אחד לא אוהב להיות המפסיד.', opp: ['winner'] },

  // ── Core World Audit: body-care & health (Tier B/C) ─────────────────────────
  { slug: 'kiss', pos: 'noun', en: 'kiss', he: 'נשיקה', cat: 'people', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '💋', vis: 0.85, ex: 'A kiss on the cheek.', exHe: 'נשיקה על הלחי.' },
  { slug: 'pregnant', pos: 'adj', en: 'pregnant', he: 'בהיריון', cat: 'health', layer: 3, rof: 2, skill: 'recognize', s: [2, 2, 2, 1, 2], emoji: '🤰', vis: 0.85, ex: 'She is pregnant.', exHe: 'היא בהיריון.' },
  { slug: 'haircut', pos: 'noun', en: 'haircut', he: 'תספורת', cat: 'health', layer: 3, rof: 1, skill: 'recognize', s: [2, 2, 1, 1, 2], emoji: '💇', vis: 0.8, ex: 'I need a haircut.', exHe: 'אני צריך תספורת.' },
  { slug: 'nail-polish', pos: 'noun', en: 'nail polish', he: 'לק', cat: 'health', layer: 3, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '💅', vis: 0.85, ex: 'Red nail polish.', exHe: 'לק אדום.' },
  { slug: 'germ', pos: 'noun', en: 'germ', he: 'חיידק', cat: 'health', layer: 3, rof: 2, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🦠', vis: 0.8, ex: 'Wash your hands, germs!', exHe: 'תשטוף ידיים, חיידקים!' },
];
