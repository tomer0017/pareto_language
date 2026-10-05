# READY Bootcamp — Conversations & Content (all 30 missions)

> **Auto-generated** from the Bootcamp source data by `scripts/gen-conversations.ts`.
> Do not edit by hand — edit the mission files under `apps/web/src/features/bootcamp/`,
> then run `npm run gen:conversations`. This file is a human-review surface for the actual
> in-app content: phrases, expected replies, recovery tools, cold opens and dialogues.

**Legend:** 🧑 the other person (NPC) · 🫵 you (the learner) · ✅ best move · ⚠︎ less useful pick ·
↩︎ alternate valid line. Dialogues show the **happy path** (the ideal run) plus the important
**wrong / recovery branches** that teach why a pick is more or less useful.

Missions are dialogue trees; the happy path is the canonical conversation used by the in-app
transcript reader. Checkpoints (10, 18, 24, 30) and a few integration days reuse earlier items
and carry no new phrases — that is expected, not missing content.

---

## Mission 1 — Introduce Myself · להציג את עצמי

> Phase 1 · 🛟 Foundations

**Objective:** Name, origin, first time here — with confidence and a smile. · שם, מאיפה, פעם ראשונה כאן — בביטחון ובחיוך.

**Confidence gain:** First human connection. · חיבור אנושי ראשון.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_1.mp4` — played automatically when the file exists

### Core phrases (you say)
- **My name is Dan.** · קוראים לי דן. — _התבנית: My name is ___ — פשוט תחליף את השם._
- **Nice to meet you!** · נעים להכיר! — _התשובה החמה לכל היכרות. תמיד עובד._
- **I'm from Israel.** · אני מישראל. — _התבנית: I’m from ___ — התשובה ל-Where are you from._
- **It's my first time here.** · זו הפעם הראשונה שלי כאן. — _פותח שיחה ומזמין המלצות._

### Expected replies (you hear)
- **What's your name?** · איך קוראים לך?
- **Where are you from?** · מאיפה אתה?
- **Is this your first time here?** · זו הפעם הראשונה שלך כאן?
- **Enjoy your stay!** · תיהנה מהשהות!

_Reply-training drill:_ “What's your name?” · “Where are you from?” · “Is this your first time here?” · “Enjoy your stay!”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.`

### Cold open (ambush)
- 🧑 (fast) “And what do you do back home, if you don't mind me asking?” · ומה אתה עושה בחיים, אם מותר לשאול?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Nice to meet you!

### Dialogue: `meeting-host` — happy path
- **🧑 Them:** “Hi! Welcome. What's your name?” · היי! ברוך הבא. איך קוראים לך?
- **🫵 You:** “My name is Dan.” · קוראים לי דן.
- **🧑 Them:** “Nice to meet you, Dan! Where are you from?” · נעים להכיר, דן! מאיפה אתה?
- **🫵 You:** “I'm from Israel.” · אני מישראל.
- **🧑 Them:** “Israel, wonderful! Is this your first time here?” · ישראל, נהדר! זו הפעם הראשונה שלך כאן?
- **🫵 You:** “Yes, it's my first time here.” · כן, זו הפעם הראשונה שלי כאן.
- **🧑 Them:** “Enjoy your stay! Have a great day!” · תיהנה מהשהות! שיהיה יום נהדר!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Nice to meet you!” → 🧑 “Likewise! And where are you from?” · גם לי! ומאיפה אתה?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 2 — Numbers & Money · כסף ומספרים

> Phase 1 · 🛟 Foundations

**Objective:** Numbers by ear, prices, change — no more blind nodding. · מספרים בשמיעה, מחירים, עודף — בלי להנהן סתם.

**Confidence gain:** Money makes sense. Always. · הכסף מובן. תמיד.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_2.mp4` — played automatically when the file exists

### Core phrases (you say)
- **How much is it?** · כמה זה עולה? — _השאלה שפותחת כל עסקה. תלמד אותה עד הסוף._
- **By card, please.** · בכרטיס, בבקשה.
- **In cash.** · במזומן.
- **One box, please.** · קופסה אחת, בבקשה. — _One ___, please — מספר + הדבר. כך קונים כל דבר._
- **That's too expensive.** · זה יקר מדי. — _משפט מיקוח מנומס — ופתח למחיר טוב יותר._

### Expected replies (you hear)
- **That's five euros.** · זה חמישה יורו. — _five = 5. תתרגל לזהות מספרים במשפט._
- **That'll be ten euros.** · זה יעלה עשרה יורו.
- **Twenty euros, please.** · עשרים יורו, בבקשה.
- **Fifteen fifty.** · חמש עשרה וחצי (15.50).
- **Cash or card?** · מזומן או כרטיס?
- **Here's your change.** · הנה העודף שלך.
- **Sorry, I have no change.** · סליחה, אין לי עודף.

_Reply-training drill:_ “That's five euros.” · “That'll be ten euros.” · “Twenty euros, please.” · “Cash or card?”

### Recovery tools reused
`Please speak slowly.` · `One moment, please.`

### Dialogue: `market-stall` — happy path
- **🧑 Them:** “Fresh strawberries! Best in the market!” · תותים טריים! הכי טובים בשוק!
- **🫵 You:** “How much is it?” · כמה זה עולה?
- **🧑 Them:** “Five euros a box, or two for eight!” · חמישה יורו קופסה, או שתיים בשמונה!
- **🫵 You:** “Please speak slowly.” · דבר לאט, בבקשה. (מספרים מהירים? עצור אותו!)
- **🧑 Them:** “Five — euros — one box.” · חמישה — יורו — קופסה אחת.
- **🫵 You:** “One box, please.” · קופסה אחת, בבקשה.
- **🧑 Them:** “Perfect. That's five euros. Cash or card?” · מצוין. זה חמישה יורו. מזומן או כרטיס?
- **🫵 You:** “By card, please.” · בכרטיס, בבקשה.
- **🧑 Them:** “Thank you! Enjoy the strawberries!” · תודה! תיהנה מהתותים!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 3 — Coffee Shop · בית קפה

> Phase 1 · 🛟 Foundations

**Objective:** A complete breakfast order: drink, food, payment, receipt — end to end. · הזמנת בוקר שלמה: שתייה, אוכל, תשלום, קבלה — מקצה לקצה.

**Confidence gain:** First full transaction incl. every follow-up question. · העסקה המלאה הראשונה, כולל כל שאלות ההמשך.

**Estimated time:** ~22 min

**Video:** `videos/{language}/{language}_3.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I'd like an iced coffee, please.** · אני רוצה קפה קר, בבקשה. — _התבנית: I’d like ___, please — עובדת על הכל._
- **To go, please.** · לקחת, בבקשה.
- **Milk, no sugar.** · עם חלב, בלי סוכר. — _עם = with · בלי = no/without. שתי מילים ששולטות בכל הזמנה._
- **A croissant, please.** · קרואסון, בבקשה. — _“Croissant” — מאפה חמאה צרפתי. כך בדיוק זה כתוב בתפריט בחו״ל._
- **That's all, thanks.** · זה הכל, תודה. — _סוגר כל הזמנה בנימוס. עובד בכל מקום בעולם._
- **Card, please.** · בכרטיס, בבקשה.
- **Medium, please.** · בינוני, בבקשה.
- **Yes, please.** · כן, בבקשה.

### Expected replies (you hear)
- **What can I get you?** · מה להביא לך?
- **Hot or iced?** · חם או קר?
- **For here or to go?** · לשבת כאן או לקחת?
- **Medium or large?** · בינוני או גדול?
- **Milk and sugar?** · חלב וסוכר?
- **Anything to eat?** · משהו לאכול?
- **Would you like anything else?** · עוד משהו?
- **Cash or card?** · מזומן או כרטיס?
- **Would you like the receipt?** · רוצה את הקבלה?
- **Enjoy your day!** · שיהיה לך יום מעולה!

_Reply-training drill:_ “For here or to go?” · “Medium or large?” · “Milk and sugar?” · “Would you like anything else?”

### Recovery tools reused
`One moment, please.` · `Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Sorry, we are out of croissants — would a muffin be okay instead?” · סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Card, please.

### Dialogue: `breakfast-order` — happy path
- **🧑 Them:** “Good morning! What can I get you?” · בוקר טוב! מה להביא לך?
- **🫵 You:** “I'd like an iced coffee, please.” · אני רוצה קפה קר, בבקשה.
- **🧑 Them:** “Sure! Medium or large?” · סגור! בינוני או גדול?
- **🫵 You:** “Medium, please.” · בינוני, בבקשה.
- **🧑 Them:** “Milk and sugar?” · חלב וסוכר?
- **🫵 You:** “Milk, no sugar.” · עם חלב, בלי סוכר.
- **🧑 Them:** “Anything to eat?” · משהו לאכול?
- **🫵 You:** “A croissant, please.” · קרואסון, בבקשה.
- **🧑 Them:** “Great choice. Would you like anything else?” · בחירה מצוינת. עוד משהו?
- **🫵 You:** “That's all, thanks.” · זה הכל, תודה.
- **🧑 Them:** “That'll be six fifty. Cash or card?” · שש חמישים בבקשה. מזומן או כרטיס?
- **🫵 You:** “Card, please.” · בכרטיס, בבקשה.
- **🧑 Them:** “Would you like the receipt?” · רוצה את הקבלה?
- **🫵 You:** “No, thank you!” · לא, תודה!
- **🧑 Them:** “Here you go — enjoy your day!” · בבקשה — שיהיה יום מעולה!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Thank you!” → 🧑 “You're welcome! But — milk? sugar?” · בבקשה! אבל — חלב? סוכר?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 4 — Everyday Core: Want / Need / Have / Can · רוצה, צריך, יש לי, יכול

> Phase 1 · 🛟 Foundations

**Objective:** I want, I need, I have, I can, I know — and their questions. · אני רוצה, אני צריך, יש לי, אני יכול, אני יודע — והשאלות שלהם.

**Confidence gain:** Five words that build hundreds of sentences. · חמש מילים שבונות מאות משפטים.

**Estimated time:** ~22 min

**Video:** `videos/{language}/{language}_4.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I need a towel.** · אני צריך מגבת. — _I need ___ — לכל דבר שחסר לך._
- **Yes, I have my key.** · כן, יש לי את המפתח.
- **I don't have it.** · אין לי אותה. — _I don’t have ___ — ההפך מ-I have. מילה אחת משנה הכל._
- **Do you have a map?** · יש לך מפה? — _Do you have ___? — עובד בכל חנות, מלון ומסעדה._
- **Yes, I want a coffee.** · כן, אני רוצה קפה. — _התבנית: I want ___. מחליפים רק את המילה האחרונה._
- **I don't know.** · אני לא יודע. — _תשובה לגיטימית לגמרי. לא יודע — אומרים._
- **I can walk.** · אני יכול ללכת ברגל.
- **Sorry, I can't.** · סליחה, אני לא יכול.
- **Yes, I know.** · כן, אני יודע.
- **Can you help me?** · אתה יכול לעזור לי? — _Can you ___? — הדרך לבקש כל דבר._

### Expected replies (you hear)
- **Do you want a coffee?** · רוצה קפה?
- **Do you need anything?** · אתה צריך משהו?
- **Do you have your key?** · יש לך את המפתח?
- **Do you know how to get to the centre?** · אתה יודע איך להגיע למרכז?
- **Can you come?** · אתה יכול לבוא?
- **You can walk.** · אתה יכול ללכת ברגל.

_Reply-training drill:_ “Do you need anything?” · “Do you have your key?” · “Do you know how to get to the centre?” · “Can you come?”

### Recovery tools reused
`Can you show me?` · `Please speak slowly.`

### Cold open (ambush)
- 🧑 (fast) “Before you go out do you have your key with you or is it still in the room?” · לפני שאתה יוצא — המפתח עליך או שהוא עדיין בחדר?
  - ✅ best move: **Do you have your key?** · יש לך את המפתח?
  - ✗ distractor: Can you come?

### Dialogue: `hostel-desk` — happy path
- **🧑 Them:** “Hi! Do you need anything?” · שלום! אתה צריך משהו?
- **🫵 You:** “I need a towel.” · אני צריך מגבת.
- **🧑 Them:** “Sure. Do you have your key?” · בטח. יש לך את המפתח?
- **🫵 You:** “Yes, I have my key.” · כן, יש לי את המפתח.
- **🧑 Them:** “And the wifi password?” · והסיסמה של הוויי-פיי?
- **🫵 You:** “I don't have it.” · אין לי אותה.
- **🧑 Them:** “It's here.” · היא כאן.
- **🫵 You:** “Do you have a map?” · יש לך מפה?
- **🧑 Them:** “Yes.” · כן.
- **🫵 You:** “Can you show me?” · אתה יכול להראות לי?
- **🧑 Them:** “Of course.” · בטח.

### Dialogue: `coffee-with-a-friend` — happy path
- **🧑 Them:** “Do you want a coffee?” · רוצה קפה?
- **🫵 You:** “Yes, I want a coffee.” · כן, אני רוצה קפה.
- **🧑 Them:** “Do you know how to get to the centre?” · אתה יודע איך להגיע למרכז?
- **🫵 You:** “I don't know.” · אני לא יודע.
- **🧑 Them:** “You can walk. It's about twenty minutes.” · אתה יכול ללכת ברגל. זה בערך עשרים דקות.
- **🫵 You:** “I can walk.” · אני יכול ללכת ברגל.
- **🧑 Them:** “We're having dinner at seven. Can you come?” · אנחנו אוכלים ארוחת ערב בשבע. אתה יכול לבוא?
- **🫵 You:** “Sorry, I can't.” · סליחה, אני לא יכול.
- **🧑 Them:** “No problem.” · אין בעיה.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 5 — Directions · כיוונים

> Phase 1 · 🛟 Foundations

**Objective:** Ask — and truly understand the answer, landmarks included. · לשאול — ובעיקר להבין את התשובה, כולל ציוני דרך.

**Confidence gain:** Being lost stops being scary. · ללכת לאיבוד מפסיק להפחיד.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_5.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Excuse me!** · סליחה! — _פותח כל פנייה לזר ברחוב._
- **Where is the station?** · איפה התחנה? — _תבנית: Where is the ___? — התחנה, השירותים, המלון._
- **How do I get to the beach?** · איך מגיעים לחוף?
- **Is it far?** · זה רחוק? — _שלוש מילים שמחליטות: ללכת ברגל או לקחת מונית._
- **Can you show me on the map?** · אתה יכול להראות לי על המפה? — _כשמילים לא מספיקות — עוברים לעיניים._

### Expected replies (you hear)
- **It's on the left.** · זה בצד שמאל.
- **It's on the right.** · זה בצד ימין.
- **Go straight ahead.** · לך ישר.
- **Turn left at the corner.** · פנה שמאלה בפינה.
- **It's next to the bank.** · זה ליד הבנק.
- **It's about five minutes on foot.** · זה בערך חמש דקות ברגל.
- **You can't miss it.** · אי אפשר לפספס.

_Reply-training drill:_ “It's on the left.” · “It's on the right.” · “Go straight ahead.” · “It's next to the bank.”

### Recovery tools reused
`Can you repeat that?` · `Thank you!`

### Dialogue: `lost-in-town` — happy path
- **🫵 You:** “Excuse me! Where is the station?” · סליחה! איפה התחנה?
- **🧑 Them:** “The station? Go straight ahead, then turn left at the corner.” · התחנה? לך ישר, ואז פנה שמאלה בפינה.
- **🫵 You:** “Can you repeat that?” · אפשר לחזור על זה? (הרבה כיוונים ברצף — עצור אותו!)
- **🧑 Them:** “Straight… then… left… at the corner.” · ישר… ואז… שמאלה… בפינה.
- **🫵 You:** “Is it far?” · זה רחוק?
- **🧑 Them:** “No, it's about five minutes on foot. It's next to the bank.” · לא, זה בערך חמש דקות ברגל. זה ליד הבנק.
- **🫵 You:** “Can you show me on the map?” · אתה יכול להראות לי על המפה?
- **🧑 Them:** “Of course — here, we are here, and the station is right there.” · כמובן — הנה, אנחנו כאן, והתחנה בדיוק שם.
- **🧑 Them:** “You can't miss it. Have a good day!” · אי אפשר לפספס. שיהיה יום טוב!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 6 — Airport & Border · שדה תעופה וגבול

> Phase 2 · 🛬 Arrival

**Objective:** Counter, gate, and the border questions — calm. · דלפק, שער, ושאלות הגבול — רגוע.

**Confidence gain:** Authority stops being frightening. · סמכות מפסיקה להפחיד.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_6.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Here is my passport.** · הנה הדרכון שלי. — _מגישים ואומרים. שלוש מילים שפותחות כל גבול._
- **I'm here on holiday.** · אני כאן בחופשה. — _התשובה ל-"מטרת הביקור?". ידידותית ובטוחה._
- **For two weeks.** · לשבועיים. — _התבנית: For + משך זמן. For three days / For a week._
- **At a hotel in the city centre.** · במלון במרכז העיר. — _התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק._
- **Nothing to declare.** · אין לי מה להצהיר. — _המשפט הקבוע במכס. אומרים אותו רגוע._

### Expected replies (you hear)
- **Passport, please.** · דרכון, בבקשה.
- **What's the purpose of your visit?** · מה מטרת הביקור?
- **How long are you staying?** · לכמה זמן אתה נשאר?
- **Where are you staying?** · איפה אתה מתאכסן?
- **Anything to declare?** · יש לך מה להצהיר?
- **Enjoy your stay!** · תיהנה מהשהות!

_Reply-training drill:_ “What's the purpose of your visit?” · “How long are you staying?” · “Where are you staying?” · “Anything to declare?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `One moment, please.` · `Thank you!`

### Dialogue: `border-control` — happy path
- **🧑 Them:** “Next, please. Passport?” · הבא בתור, בבקשה. דרכון?
- **🫵 You:** “Here is my passport.” · הנה הדרכון שלי.
- **🧑 Them:** “Thank you. What's the purpose of your visit?” · תודה. מה מטרת הביקור?
- **🫵 You:** “I'm here on holiday.” · אני כאן בחופשה.
- **🧑 Them:** “All right. How long are you staying?” · בסדר. לכמה זמן אתה נשאר?
- **🫵 You:** “For two weeks.” · לשבועיים.
- **🧑 Them:** “And where are you staying?” · ואיפה אתה מתאכסן?
- **🫵 You:** “At a hotel in the city centre.” · במלון במרכז העיר.
- **🧑 Them:** “Almost done. Anything to declare?” · כמעט סיימנו. יש לך מה להצהיר?
- **🫵 You:** “Nothing to declare.” · אין לי מה להצהיר.
- **🧑 Them:** “Welcome, and enjoy your stay!” · ברוך הבא, ותיהנה מהשהות!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Here is my passport.” → 🧑 “I have your passport — I asked how long you’re staying.” · הדרכון אצלי — שאלתי לכמה זמן אתה נשאר.
- ⚠︎ less useful: 🫵 “Thank you!” → 🧑 “Ha — so, anything to declare? Any goods?” · הא — אז, יש מה להצהיר? סחורה כלשהי?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 7 — Taxi / Uber · מונית

> Phase 2 · 🛬 Arrival

**Objective:** Destination, price, stop — incl. the address-show move. · יעד, מחיר, עצירה — כולל מהלך הצגת הכתובת.

**Confidence gain:** Every city is reachable. · כל עיר נגישה.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_7.mp4` — played automatically when the file exists

### Core phrases (you say)
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **To the airport, please.** · לשדה התעופה, בבקשה.
- **How much to the centre?** · כמה עד המרכז? — _לשאול מחיר לפני שנוסעים — חוסך הפתעות._
- **Stop here, please.** · עצור כאן, בבקשה. — _העיתוי חשוב — תגיד את זה קצת לפני היעד._
- **Keep the change.** · תשאיר את העודף.

### Expected replies (you hear)
- **Where to?** · לאן?
- **It's about fifteen euros.** · זה בערך חמישה עשר יורו.
- **There's a lot of traffic right now.** · יש הרבה פקקים עכשיו.
- **Is here okay?** · כאן זה בסדר?
- **First time in the city?** · פעם ראשונה בעיר?

_Reply-training drill:_ “Where to?” · “It's about fifteen euros.” · “Is here okay?” · “First time in the city?”

### Recovery tools reused
`Please speak slowly.` · `Can you show me?` · `Thank you!`

### Dialogue: `taxi-ride` — happy path
- **🧑 Them:** “Hello! Where to?” · שלום! לאן?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “Got it. No problem — off we go!” · הבנתי. אין בעיה — יוצאים!
- **🫵 You:** “How much to the centre?” · כמה עד המרכז?
- **🧑 Them:** “It's about fifteen euros. There's a lot of traffic right now.” · זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.
- **🫵 You:** “Sorry, please speak slowly.” · סליחה, דבר לאט, בבקשה.
- **🧑 Them:** “Sure. About fifteen euros. There's a lot of traffic.” · בטח. בערך חמישה עשר יורו. יש הרבה פקקים.
- **🫵 You:** “Okay, thank you.” · בסדר, תודה.
- **🧑 Them:** “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?
- **🫵 You:** “Stop here, please. Keep the change.” · עצור כאן, בבקשה. תשאיר את העודף.
- **🧑 Them:** “Thank you very much! Enjoy your trip!” · תודה רבה! תיהנה מהטיול!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 8 — Hotel Check-in · צ'ק-אין במלון

> Phase 2 · 🛬 Arrival

**Objective:** Reservation → name → key → floor → breakfast. · הזמנה ← שם ← מפתח ← קומה ← ארוחת בוקר.

**Confidence gain:** Home base secured. · בסיס הבית מובטח.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_8.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I have a reservation.** · יש לי הזמנה. — _הפתיח לדלפק המלון. תבנית: I have a ___._
- **Under the name Cohen.** · על השם כהן.
- **Is breakfast included?** · ארוחת הבוקר כלולה?
- **Here you go.** · בבקשה, הנה.

### Expected replies (you hear)
- **Your passport, please.** · הדרכון שלך, בבקשה.
- **Sign here, please.** · תחתום כאן, בבקשה.
- **You're in room two-oh-four.** · אתה בחדר 204.
- **It's on the second floor.** · זה בקומה השנייה.
- **Breakfast is from seven to ten.** · ארוחת בוקר משבע עד עשר.
- **The elevator is on your right.** · המעלית מימינך.

_Reply-training drill:_ “Your passport, please.” · “You're in room two-oh-four.” · “It's on the second floor.” · “Breakfast is from seven to ten.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!` · `One moment, please.`

### Cold open (ambush)
- 🧑 (fast) “Just so you know breakfast is served in the room on the lower level next to the pool.” · רק שתדע, ארוחת הבוקר מוגשת בחדר בקומה התחתונה ליד הבריכה.
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Here you go.

### Dialogue: `hotel-checkin` — happy path
- **🧑 Them:** “Good evening! How can I help you?” · ערב טוב! איך אפשר לעזור?
- **🫵 You:** “I have a reservation, under the name Cohen.” · יש לי הזמנה, על השם כהן.
- **🧑 Them:** “Welcome, Mr. Cohen. Your passport, please.” · ברוך הבא, מר כהן. הדרכון שלך, בבקשה.
- **🫵 You:** “Here you go.” · בבקשה, הנה.
- **🧑 Them:** “Thank you. You're in room two-oh-four, on the second floor. Here is your key.” · תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.
- **🫵 You:** “Is breakfast included?” · ארוחת הבוקר כלולה?
- **🧑 Them:** “Yes! Breakfast is from seven to ten. The elevator is on your right.” · כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.
- **🧑 Them:** “Enjoy your stay!” · תיהנה מהשהות!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 9 — Shopping · קניות

> Phase 2 · 🛬 Arrival

**Objective:** Browse, try on, ask a size, decide, pay. · להסתכל, למדוד, לבקש מידה, להחליט, לשלם.

**Confidence gain:** Shops are friendly territory. · חנויות הן טריטוריה ידידותית.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_9.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I'm just looking, thanks.** · אני רק מסתכל, תודה. — _משפט שקונה לך מרחב בלי לחץ מוכר._
- **Can I try this on?** · אפשר למדוד את זה?
- **Do you have a bigger size?** · יש מידה גדולה יותר? — _תבנית: Do you have a ___ size? (bigger/smaller)._
- **I'll take it.** · אני אקח את זה. — _החלטת? שתי מילים סוגרות עסקה._
- **It's a bit expensive.** · זה קצת יקר. — _פתח מנומס להנחה או לחלופה זולה יותר._

### Expected replies (you hear)
- **Can I help you find anything?** · אפשר לעזור לך למצוא משהו?
- **What size are you?** · איזו מידה אתה?
- **The fitting room is over there.** · חדר ההלבשה שם.
- **Sorry, that's out of stock.** · סליחה, זה אזל מהמלאי.
- **It's on sale — twenty percent off.** · זה במבצע — עשרים אחוז הנחה.
- **Anything else for you today?** · עוד משהו היום?

_Reply-training drill:_ “What size are you?” · “The fitting room is over there.” · “It's on sale — twenty percent off.” · “Anything else for you today?”

### Recovery tools reused
`Please speak slowly.` · `Can you repeat that?` · `Thank you!` · `Can you show me?`

### Cold open (ambush)
- 🧑 (fast) “That one is actually the last piece we have in that colour would you like me to hold it?” · זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: I'll take it.

### Dialogue: `clothing-shop` — happy path
- **🧑 Them:** “Hi there! Can I help you find anything?” · היי! אפשר לעזור לך למצוא משהו?
- **🫵 You:** “I'm just looking, thanks.” · אני רק מסתכל, תודה.
- **🧑 Them:** “Of course, take your time. Let me know if you need a hand.” · כמובן, קח את הזמן. תגיד אם אתה צריך עזרה.
- **🫵 You:** “Can I try this on?” · אפשר למדוד את זה?
- **🧑 Them:** “Sure! What size are you? The fitting room is over there.” · בטח! איזו מידה אתה? חדר ההלבשה שם.
- **🫵 You:** “Do you have a bigger size?” · יש מידה גדולה יותר?
- **🧑 Them:** “Here you go, one size up. And good news — it’s on sale, twenty percent off!” · הנה, מידה אחת גדולה יותר. ובשורה טובה — זה במבצע, עשרים אחוז הנחה!
- **🫵 You:** “Great, I'll take it.” · מעולה, אני אקח את זה.
- **🧑 Them:** “Wonderful — I’ll ring you up at the till. Thank you!” · נהדר — אחייב אותך בקופה. תודה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 10 — CHECKPOINT: Arrival Day · נקודת ביקורת: יום הגעה

> Phase 2 · 🛬 Arrival · 🏁 CHECKPOINT

**Objective:** Cold chain: taxi → hotel. Only what you already know, unannounced. · שרשור קר: מונית ← מלון. רק מה שכבר למדת, בלי הכנה.

**Confidence gain:** Proof: a full arrival day, survivable. · הוכחה: יום הגעה שלם — שריד.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_10.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Here you go.** · בבקשה, הנה.
- **I'm here on holiday.** · אני כאן בחופשה. — _התשובה ל-"מטרת הביקור?". ידידותית ובטוחה._
- **For two weeks.** · לשבועיים. — _התבנית: For + משך זמן. For three days / For a week._
- **At a hotel in the city centre.** · במלון במרכז העיר. — _התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק._
- **Nothing to declare.** · אין לי מה להצהיר. — _המשפט הקבוע במכס. אומרים אותו רגוע._
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **Stop here, please.** · עצור כאן, בבקשה. — _העיתוי חשוב — תגיד את זה קצת לפני היעד._
- **How much to the centre?** · כמה עד המרכז? — _לשאול מחיר לפני שנוסעים — חוסך הפתעות._
- **I have a reservation.** · יש לי הזמנה. — _הפתיח לדלפק המלון. תבנית: I have a ___._
- **Is breakfast included?** · ארוחת הבוקר כלולה?

### Expected replies (you hear)
- **Breakfast is from seven to ten.** · ארוחת בוקר משבע עד עשר.
- **You're in room two-oh-four.** · אתה בחדר 204.

### Recovery tools reused
`Thank you!` · `Can you repeat that?` · `Please speak slowly.`

### Cold open (ambush)
- 🧑 (fast) “The elevator is on your right. Breakfast is from seven to ten. Enjoy your stay!” · המעלית מימינך. ארוחת בוקר משבע עד עשר. תיהנה מהשהות!
  - ✅ best move: **Breakfast is from seven to ten.** · ארוחת בוקר משבע עד עשר.
  - ✗ distractor: You're in room two-oh-four.

### Dialogue: `cold-border` — happy path
- **🧑 Them:** “Passport, please.” · דרכון, בבקשה.
- **🫵 You:** “Here you go.” · בבקשה, הנה.
- **🧑 Them:** “What's the purpose of your visit?” · מה מטרת הביקור?
- **🫵 You:** “I'm here on holiday.” · אני כאן בחופשה.
- **🧑 Them:** “How long are you staying?” · לכמה זמן אתה נשאר?
- **🫵 You:** “For two weeks.” · לשבועיים.
- **🧑 Them:** “Where are you staying?” · איפה אתה מתאכסן?
- **🫵 You:** “At a hotel in the city centre.” · במלון במרכז העיר.
- **🧑 Them:** “Anything to declare?” · יש לך מה להצהיר?
- **🫵 You:** “Nothing to declare.” · אין לי מה להצהיר.
- **🧑 Them:** “Welcome, and enjoy your stay!” · ברוך הבא, ותיהנה מהשהות!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I'm here on holiday.” → 🧑 “Passport, please.” · דרכון, בבקשה.
- ⚠︎ less useful: 🫵 “For two weeks.” → 🧑 “What's the purpose of your visit?” · מה מטרת הביקור?
- ⚠︎ less useful: 🫵 “At a hotel in the city centre.” → 🧑 “How long are you staying?” · לכמה זמן אתה נשאר?
- ⚠︎ less useful: 🫵 “Nothing to declare.” → 🧑 “Where are you staying?” · איפה אתה מתאכסן?
- ⚠︎ less useful: 🫵 “I'm here on holiday.” → 🧑 “Anything to declare?” · יש לך מה להצהיר?

### Dialogue: `cold-taxi` — happy path
- **🧑 Them:** “Hello! Where to?” · שלום! לאן?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “It's about fifteen euros. There's a lot of traffic right now.” · זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.
- **🫵 You:** “Okay, thank you.” · בסדר, תודה.
- **🧑 Them:** “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?
- **🫵 You:** “Stop here, please. Keep the change.” · עצור כאן, בבקשה. תשאיר את העודף.
- **🧑 Them:** “Thank you very much! Enjoy your trip!” · תודה רבה! תיהנה מהטיול!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Stop here, please.” → 🧑 “Hello! Where to?” · שלום! לאן?
- ⚠︎ less useful: 🫵 “How much to the centre?” → 🧑 “It's about fifteen euros. There's a lot of traffic right now.” · זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.
- ⚠︎ less useful: 🫵 “To this address, please.” → 🧑 “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?

### Dialogue: `cold-hotel` — happy path
- **🧑 Them:** “Good evening! How can I help you?” · ערב טוב! איך אפשר לעזור?
- **🫵 You:** “I have a reservation, under the name Cohen.” · יש לי הזמנה, על השם כהן.
- **🧑 Them:** “Welcome, Mr. Cohen. Your passport, please.” · ברוך הבא, מר כהן. הדרכון שלך, בבקשה.
- **🫵 You:** “Here you go.” · בבקשה, הנה.
- **🧑 Them:** “Thank you. You're in room two-oh-four, on the second floor. Here is your key.” · תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.
- **🫵 You:** “Is breakfast included?” · ארוחת הבוקר כלולה?
- **🧑 Them:** “Yes, from seven to ten. Enjoy your stay.” · כן, משבע עד עשר. תיהנה מהשהות.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Is breakfast included?” → 🧑 “Good evening! How can I help you?” · ערב טוב! איך אפשר לעזור?
- ⚠︎ less useful: 🫵 “Nothing to declare.” → 🧑 “Welcome, Mr. Cohen. Your passport, please.” · ברוך הבא, מר כהן. הדרכון שלך, בבקשה.
- ⚠︎ less useful: 🫵 “I have a reservation.” → 🧑 “Thank you. You're in room two-oh-four, on the second floor. Here is your key.” · תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 11 — Small Talk & Recommendations · שיחת חולין והמלצות

> Phase 3 · 🏡 Everyday Life

**Objective:** Where from, first time here, what to try — three minutes with a stranger. · מאיפה אתה, פעם ראשונה כאן, מה מומלץ — שלוש דקות עם זר.

**Confidence gain:** Connection, not just transactions. · חיבור, לא רק עסקאות.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_11.mp4` — played automatically when the file exists

### Core phrases (you say)
- **This place is beautiful.** · המקום הזה יפהפה. — _מחמאה למקום פותחת כל שיחה._
- **How about you?** · ואתה? — _להחזיר את השאלה — וכבר יש שיחה._
- **It's my first time here.** · זו הפעם הראשונה שלי כאן. — _פותח שיחה ומזמין המלצות._
- **I like it a lot.** · אני מאוד אוהב.
- **I love the food here.** · אני אוהב את האוכל כאן.
- **Can you recommend a place?** · אתה יכול להמליץ על מקום? — _מקומיים יודעים הכי טוב. תשאל._
- **What do you recommend?** · מה אתה ממליץ? — _אם התפריט מבלבל — תן למלצר להחליט. תמיד עובד._
- **It was nice talking to you.** · היה נעים לדבר איתך.
- **I'm from Israel.** · אני מישראל. — _התבנית: I’m from ___ — התשובה ל-Where are you from._

### Expected replies (you hear)
- **Is this your first time here?** · זו הפעם הראשונה שלך כאן?
- **Where are you from?** · מאיפה אתה?
- **Do you like it here?** · אתה אוהב את המקום?
- **You should try the old town.** · כדאי לך לנסות את העיר העתיקה.
- **How long are you here for?** · לכמה זמן אתה כאן?
- **Enjoy the rest of your trip!** · תיהנה משאר הטיול!
- **Me too!** · גם אני!

_Reply-training drill:_ “Where are you from?” · “Is this your first time here?” · “Do you like it here?” · “You should try the old town.”

### Recovery tools reused
`Can you repeat that?`

### Dialogue: `small-talk` — happy path
- **🧑 Them:** “Hi! Beautiful view, isn't it?” · היי! נוף יפה, נכון?
- **🫵 You:** “This place is beautiful.” · המקום הזה יפהפה.
- **🧑 Them:** “It really is. Where are you from?” · באמת. מאיפה אתה?
- **🫵 You:** “I'm from Israel. How about you?” · אני מישראל. ואתה?
- **🧑 Them:** “I'm from here! Is this your first time here?” · אני מכאן! זו הפעם הראשונה שלך כאן?
- **🫵 You:** “Yes, it's my first time here.” · כן, זו הפעם הראשונה שלי כאן.
- **🧑 Them:** “Welcome! Do you like it here?” · ברוך הבא! אתה אוהב את המקום?
- **🫵 You:** “Yes, I like it a lot.” · כן, אני מאוד אוהב.
- **🧑 Them:** “Me too. And the food here is wonderful.” · גם אני. והאוכל כאן נהדר.
- **🫵 You:** “Can you recommend a place?” · אתה יכול להמליץ על מקום?
- **🧑 Them:** “Of course — try 'Mama Rosa', in the old town. It's very good.” · בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם.
- **🫵 You:** “Thank you! It was nice talking to you.” · תודה! היה נעים לדבר איתך.
- **🧑 Them:** “You too! Enjoy the rest of your trip!” · גם לי! תיהנה משאר הטיול!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 12 — Time & Plans · זמן ותוכניות

> Phase 3 · 🏡 Everyday Life

**Objective:** Today, tonight, tomorrow, later — decide what to do, and when. · היום, הערב, מחר, אחר כך — לקבוע מה עושים ומתי.

**Confidence gain:** I make plans with people. · אני קובע תוכניות עם אנשים.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_12.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Maybe later.** · אולי אחר כך. — _התשובה הכי שימושית כשלא החלטת._
- **I'm free tonight.** · אני פנוי הערב.
- **What time?** · באיזו שעה?
- **When?** · מתי?
- **No, that's not too late.** · לא, זה לא מאוחר מדי.
- **What are you doing tomorrow?** · מה אתה עושה מחר? — _מחליפים tomorrow ב-today / tonight ויש לך שלוש שאלות._
- **Yes, I'm free tomorrow.** · כן, אני פנוי מחר.
- **Let's meet here at seven.** · ניפגש כאן בשבע. — _Let’s meet ___ at ___ — מקום ושעה, וזהו._

### Expected replies (you hear)
- **What are you doing today?** · מה אתה עושה היום?
- **What are you doing tonight?** · מה אתה עושה הערב?
- **Do you want to come?** · רוצה לבוא?
- **At eight.** · בשמונה.
- **Is that too late for you?** · זה מאוחר מדי בשבילך?
- **Are you free tomorrow?** · אתה פנוי מחר?
- **We leave early.** · אנחנו יוצאים מוקדם.

_Reply-training drill:_ “At eight.” · “Is that too late for you?” · “We leave early.” · “Are you free tomorrow?”

### Recovery tools reused
`Can you repeat that?`

### Dialogue: `making-plans` — happy path
- **🧑 Them:** “Good morning! What are you doing today?” · בוקר טוב! מה אתה עושה היום?
- **🫵 You:** “Nothing this morning. Maybe later.” · כלום הבוקר. אולי אחר כך.
- **🧑 Them:** “And what are you doing tonight?” · ומה אתה עושה הערב?
- **🫵 You:** “I'm free tonight.” · אני פנוי הערב.
- **🧑 Them:** “We're going to eat in the centre. Do you want to come?” · אנחנו הולכים לאכול במרכז. רוצה לבוא?
- **🫵 You:** “Yes! What time?” · כן! באיזו שעה?
- **🧑 Them:** “At eight. Is that too late for you?” · בשמונה. זה מאוחר מדי בשבילך?
- **🫵 You:** “No, that's not too late.” · לא, זה לא מאוחר מדי.
- **🧑 Them:** “Great. It's very good there.” · מעולה. מאוד טוב שם.
- **🫵 You:** “What are you doing tomorrow?” · מה אתה עושה מחר?
- **🧑 Them:** “Tomorrow morning I'm going to the beach. Are you free tomorrow?” · מחר בבוקר אני הולך לים. אתה פנוי מחר?
- **🫵 You:** “Yes, I'm free tomorrow.” · כן, אני פנוי מחר.
- **🧑 Them:** “Then come with us! But we leave early.” · אז בוא איתנו! אבל אנחנו יוצאים מוקדם.
- **🫵 You:** “No problem. Let's meet here at seven.” · אין בעיה. ניפגש כאן בשבע.
- **🧑 Them:** “Perfect. I have to go now — see you tonight!” · מושלם. אני חייב ללכת עכשיו — נתראה הערב!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 13 — Home, Family & Daily Routine · בית, משפחה ושגרה

> Phase 3 · 🏡 Everyday Life

**Objective:** I am going home, to eat at my grandmother’s, to sleep — ordinary life. · אני הולך הביתה, לאכול אצל סבתא, לישון — חיים רגילים.

**Confidence gain:** I can talk about life, not only about the trip. · אני מדבר גם על החיים, לא רק על הטיול.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_13.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Your home is beautiful.** · הבית שלך יפהפה.
- **Is this sofa new?** · הספה הזאת חדשה? — _Is this ___ new? — מחליפים את החפץ._
- **Where is your family?** · איפה המשפחה שלך? — _Where is ___? — אותה שאלה מהכיוונים, עכשיו על אנשים._
- **Yes, I live with my family.** · כן, אני גר עם המשפחה שלי.
- **I'm going to eat at my grandmother's.** · אני הולך לאכול אצל סבתא שלי. — _I’m going to ___ — התבנית לכל מה שאתה עומד לעשות._
- **I'm tired.** · אני עייף.
- **I'm going home.** · אני הולך הביתה.
- **I'm going to sleep.** · אני הולך לישון.

### Expected replies (you hear)
- **Come in.** · תיכנס.
- **Let's sit in the living room.** · בוא נשב בסלון.
- **Do you live with your family?** · אתה גר עם המשפחה שלך?
- **Are you hungry?** · אתה רעב?
- **Do you want to eat with us?** · רוצה לאכול איתנו?

_Reply-training drill:_ “Come in.” · “Let's sit in the living room.” · “Are you hungry?” · “Do you live with your family?”

### Recovery tools reused
`Sorry, I don't understand.`

### Dialogue: `at-a-friends-home` — happy path
- **🧑 Them:** “Hi! Come in.” · היי! תיכנס.
- **🫵 You:** “Thanks. Your home is beautiful.” · תודה. הבית שלך יפהפה.
- **🧑 Them:** “Thank you. Let's sit in the living room.” · תודה. בוא נשב בסלון.
- **🫵 You:** “Is this sofa new?” · הספה הזאת חדשה?
- **🧑 Them:** “Yes, it's new.” · כן, היא חדשה.
- **🫵 You:** “Where is your family?” · איפה המשפחה שלך?
- **🧑 Them:** “My mother is in the kitchen. Do you live with your family?” · אמא שלי במטבח. אתה גר עם המשפחה שלך?
- **🫵 You:** “Yes, I live with my family.” · כן, אני גר עם המשפחה שלי.
- **🧑 Them:** “Nice. Are you hungry? Do you want to eat with us?” · יפה. אתה רעב? רוצה לאכול איתנו?
- **🫵 You:** “Thanks, but I'm going to eat at my grandmother's.” · תודה, אבל אני הולך לאכול אצל סבתא שלי.
- **🧑 Them:** “Lovely! You look tired. Are you okay?” · איזה יופי! אתה נראה עייף. הכל בסדר?
- **🫵 You:** “Yes, I'm just tired.” · כן, אני רק עייף.
- **🧑 Them:** “Then go home and rest!” · אז לך הביתה ותנוח!
- **🫵 You:** “Yes, I'm going home.” · כן, אני הולך הביתה.
- **🧑 Them:** “And after dinner at your grandmother's?” · ואחרי הארוחה אצל סבתא?
- **🫵 You:** “I'm going to sleep.” · אני הולך לישון.
- **🧑 Them:** “Ha! Good night. Say hi to your family!” · חה! לילה טוב. תמסור ד״ש למשפחה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 14 — Restaurant Meal · ארוחה במסעדה

> Phase 3 · 🏡 Everyday Life

**Objective:** A whole meal: table, menu, order, drink, no onions, everything okay?, bill. · ארוחה שלמה: שולחן, תפריט, הזמנה, שתייה, בלי בצל, הכל בסדר?, חשבון.

**Confidence gain:** The whole restaurant transaction — in my hands. · העסקה השלמה במסעדה — בידיים שלי.

**Estimated time:** ~22 min

**Video:** `videos/{language}/{language}_14.mp4` — played automatically when the file exists

### Core phrases (you say)
- **A table for two, please.** · שולחן לשניים, בבקשה. — _הפתיח למסעדה. תבנית: a table for ___._
- **I'll have the chicken.** · אני אקח את העוף. — _תבנית ההזמנה: I’ll have the ___._
- **A bottle of water, please.** · בקבוק מים, בבקשה.
- **No onions, please.** · בלי בצל, בבקשה. — _תבנית: No ___, please — לכל מה שאתה לא רוצה בצלחת._
- **The bill, please.** · החשבון, בבקשה.
- **That was delicious!** · זה היה טעים מאוד! — _מחמאה קטנה שקונה חיוך גדול._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._

### Expected replies (you hear)
- **Do you have a reservation?** · יש לכם הזמנה?
- **Follow me, please.** · בואו אחריי, בבקשה.
- **Are you ready to order?** · מוכנים להזמין?
- **Anything to drink?** · משהו לשתות?
- **Anything else?** · עוד משהו?
- **Is everything okay?** · הכל בסדר?

_Reply-training drill:_ “Do you have a reservation?” · “Are you ready to order?” · “Anything to drink?” · “Anything else?” · “Is everything okay?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!` · `One moment, please.` · `Sorry, I don't understand.`

### Dialogue: `sit-down-meal` — happy path
- **🧑 Them:** “Good evening! Do you have a reservation?” · ערב טוב! יש לכם הזמנה?
- **🫵 You:** “No — a table for two, please.” · לא — שולחן לשניים, בבקשה.
- **🧑 Them:** “Perfect, follow me. Here are your menus.” · מצוין, בואו אחריי. הנה התפריטים.
- **🧑 Them:** “Are you ready to order?” · מוכנים להזמין?
- **🫵 You:** “I'll have the chicken, without onions, please.” · אני אקח את העוף, בלי בצל, בבקשה.
- **🧑 Them:** “Of course. Anything to drink?” · כמובן. משהו לשתות?
- **🫵 You:** “A bottle of water, please.” · בקבוק מים, בבקשה.
- **🧑 Them:** “Anything else?” · עוד משהו?
- **🫵 You:** “That's all, thanks.” · זה הכל, תודה.
- **🧑 Them:** “Coming right up!” · מגיע עוד רגע!
- **🧑 Them:** “Is everything okay?” · הכל בסדר?
- **🫵 You:** “Yes, that was delicious! The bill, please.” · כן, היה טעים מאוד! החשבון, בבקשה.
- **🧑 Them:** “So glad you enjoyed it. Here you are — have a lovely evening!” · שמח שנהניתם. בבקשה — ערב נעים!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 15 — Food Preferences & Allergies · העדפות אוכל ואלרגיות

> Phase 3 · 🏡 Everyday Life

**Objective:** No onions, allergic to nuts, vegetarian — clear and safe. · בלי בצל, אלרגי לאגוזים, צמחוני — ברור ובטוח.

**Confidence gain:** I can say what I cannot eat — and make sure the kitchen knows. · אני יודע להגיד מה אסור לי — ולוודא שהמטבח יודע.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_15.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I'm allergic to nuts.** · אני אלרגי לאגוזים. — _התבנית שמצילה: I’m allergic to ___. אומרים ברור, פעם אחת, בלי היסוס._
- **Without onions, please.** · בלי בצל, בבקשה. — _התבנית: Without ___ — מסירה כל מרכיב שלא בא לך._
- **I'm vegetarian.** · אני צמחוני. — _שתי מילים שחוסכות עשר שאלות._
- **Does it have dairy?** · יש בזה מוצרי חלב? — _התבנית: Does this have ___? — בודקת כל מרכיב לפני שהוא מגיע אליך._
- **Is this spicy?** · זה חריף?

### Expected replies (you hear)
- **Let me check with the kitchen.** · אבדוק עם המטבח.
- **We can make it without.** · אפשר להכין בלי.
- **That one contains nuts.** · זה מכיל אגוזים.
- **No, it's not spicy.** · לא, זה לא חריף.
- **Any other allergies?** · יש עוד אלרגיות?

_Reply-training drill:_ “Let me check with the kitchen.” · “We can make it without.” · “That one contains nuts.” · “Any other allergies?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Just to be safe does your nut allergy mean we should avoid the shared fryer too?” · רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: I'm vegetarian.

### Dialogue: `allergy-order` — happy path
- **🧑 Them:** “Hi there! Are you ready to order?” · היי! מוכן להזמין?
- **🫵 You:** “I'm allergic to nuts.” · אני אלרגי לאגוזים. (אומרים קודם כל — לפני ההזמנה)
- **🧑 Them:** “Thank you for telling me. Any other allergies or dietary restrictions?” · תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?
- **🫵 You:** “I'm vegetarian.” · אני צמחוני.
- **🧑 Them:** “Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.” · הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.
- **🫵 You:** “Does it have dairy?” · יש בזה מוצרי חלב?
- **🧑 Them:** “Yes, it has some cream, but we can make it without.” · כן, יש בו קצת שמנת, אבל אפשר להכין בלי.
- **🫵 You:** “Great. Without onions, please.” · מעולה. בלי בצל, בבקשה.
- **🧑 Them:** “Of course. I'll tell the kitchen about your allergy.” · כמובן. אגיד למטבח על האלרגיה שלך.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “I'll check with them and come right back.” · אבדוק איתם ואחזור מיד.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Thank you!” → 🧑 “Of course — but is there anything else I should know?” · כמובן — אבל יש עוד משהו שכדאי שאדע?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 16 — Hobbies & Free Time · תחביבים וזמן פנוי

> Phase 3 · 🏡 Everyday Life

**Objective:** Like, don’t like, usually, want to try — and ask back. · אוהב, לא אוהב, בדרך כלל, רוצה לנסות — ולשאול בחזרה.

**Confidence gain:** I have something to talk about. · יש לי על מה לדבר.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_16.mp4` — played automatically when the file exists

### Core phrases (you say)
- **What do you do for fun?** · מה אתה אוהב לעשות בזמן הפנוי?
- **I love surfing!** · אני מאוד אוהב לגלוש!
- **I like drawing.** · אני אוהב לצייר. — _I like ___ — מחליפים את התחביב, המשפט נשאר._
- **I usually draw in the evening.** · בדרך כלל אני מצייר בערב.
- **I like to listen to music.** · אני אוהב לשמוע מוזיקה.
- **I don't like running.** · אני לא אוהב לרוץ.
- **I want to try diving.** · אני רוצה לנסות צלילה. — _I want to try ___ — לכל דבר חדש בטיול._
- **Do you like diving?** · אתה אוהב לצלול?

### Expected replies (you hear)
- **Do you like surfing?** · אתה אוהב לגלוש?
- **What else do you like?** · מה עוד אתה אוהב?
- **Do you like music?** · אתה אוהב מוזיקה?
- **Me neither!** · גם אני לא!
- **Is there something you want to try?** · יש משהו שאתה רוצה לנסות?
- **Let's go together.** · בוא נלך יחד.

_Reply-training drill:_ “What else do you like?” · “Do you like music?” · “Me neither!” · “Let's go together.”

### Recovery tools reused
`What does that mean?`

### Dialogue: `free-time-chat` — happy path
- **🧑 Them:** “Hi! Are you free today?” · היי! אתה פנוי היום?
- **🫵 You:** “Yes! What do you do for fun?” · כן! מה אתה אוהב לעשות בזמן הפנוי?
- **🧑 Them:** “I surf a lot. Do you like surfing?” · אני גולש הרבה. אתה אוהב לגלוש?
- **🫵 You:** “I love surfing!” · אני מאוד אוהב לגלוש!
- **🧑 Them:** “Great! And what else do you like?” · מעולה! ומה עוד אתה אוהב?
- **🫵 You:** “I like drawing.” · אני אוהב לצייר.
- **🧑 Them:** “Nice! When do you draw?” · יפה! מתי אתה מצייר?
- **🫵 You:** “I usually draw in the evening.” · בדרך כלל אני מצייר בערב.
- **🧑 Them:** “In the evening I like to listen to music. Do you like music?” · בערב אני אוהב לשמוע מוזיקה. אתה אוהב מוזיקה?
- **🫵 You:** “Yes, I like to listen to music too.” · כן, גם אני אוהב לשמוע מוזיקה.
- **🧑 Them:** “And sport? Do you like running?” · וספורט? אתה אוהב לרוץ?
- **🫵 You:** “No, I don't like running.” · לא, אני לא אוהב לרוץ.
- **🧑 Them:** “Me neither! Is there something you want to try here?” · גם אני לא! יש משהו שאתה רוצה לנסות כאן?
- **🫵 You:** “I want to try diving.” · אני רוצה לנסות צלילה.
- **🧑 Them:** “Good idea! There's a diving school near the beach.” · רעיון טוב! יש בית ספר לצלילה ליד החוף.
- **🫵 You:** “Do you like diving?” · אתה אוהב לצלול?
- **🧑 Them:** “I love it! Let's go together tomorrow.” · מאוד! בוא נלך יחד מחר.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 17 — Supermarket & Everyday Shopping · סופרמרקט וקניות יום-יום

> Phase 3 · 🏡 Everyday Life

**Objective:** Find the product, pay at the checkout, ask for a bag. · למצוא מוצר, לשלם בקופה, לבקש שקית.

**Confidence gain:** Basic groceries with zero dependence. · קניות בסיסיות בלי תלות באף אחד.

**Estimated time:** ~18 min

**Video:** `videos/{language}/{language}_17.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Where is the milk?** · איפה החלב? — _התבנית: Where is the ___? — מוצאת כל מוצר בכל חנות._
- **Do you have bread?** · יש לכם לחם? — _התבנית: Do you have ___? — בודקת אם קיים במלאי._
- **Just this, thanks.** · רק את זה, תודה.
- **Could I get a bag?** · אפשר שקית?

### Expected replies (you hear)
- **It's in aisle three.** · זה במעבר שלוש.
- **Over there, on the left.** · שם, משמאל.
- **Do you need a bag?** · צריך שקית?
- **Insert your card here.** · הכנס את הכרטיס כאן.
- **Sorry, we're sold out.** · סליחה, אזל המלאי.

_Reply-training drill:_ “It's in aisle three.” · “Over there, on the left.” · “Do you need a bag?” · “Insert your card here.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Can you show me?` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Unexpected item in the bagging area — please wait for assistance.” · פריט לא צפוי באזור האריזה — אנא המתן לסיוע.
  - ✅ best move: **Can you show me?** · אתה יכול להראות לי?
  - ✗ distractor: Just this, thanks.

### Dialogue: `supermarket` — happy path
- **🧑 Them:** “Hi there! Can I help you find something?” · היי! לעזור לך למצוא משהו?
- **🫵 You:** “Where is the milk?” · איפה החלב?
- **🧑 Them:** “The milk is in aisle three, on the left.” · החלב במעבר שלוש, משמאל.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Hi! Is that everything?” · היי! זה הכל?
- **🫵 You:** “Can you show me?” · אתה יכול להראות לי? (כלי — כשמילים לא מספיקות)
- **🧑 Them:** “Of course — put it here, press the picture, done.” · בטח — שים כאן, לחץ על התמונה, גמרנו.
- **🫵 You:** “Just this, thanks.” · רק את זה, תודה.
- **🧑 Them:** “Do you need a bag?” · צריך שקית?
- **🫵 You:** “Could I get a bag?” · אפשר שקית?
- **🧑 Them:** “Insert your card here… all done. Have a nice day!” · הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 18 — CHECKPOINT: Everyday Day · נקודת ביקורת: יום רגיל

> Phase 3 · 🏡 Everyday Life · 🏁 CHECKPOINT

**Objective:** Morning coffee, plans with a friend, a small purchase, dinner — cold. · קפה בבוקר, תוכניות עם חבר, קנייה קטנה, ארוחת ערב — קר.

**Confidence gain:** A whole ordinary day without the net. · יום רגיל שלם בלי רשת ביטחון.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_18.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I'd like an iced coffee, please.** · אני רוצה קפה קר, בבקשה. — _התבנית: I’d like ___, please — עובדת על הכל._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _הפתיח למסעדה. תבנית: a table for ___._
- **Maybe later.** · אולי אחר כך. — _התשובה הכי שימושית כשלא החלטת._
- **By card, please.** · בכרטיס, בבקשה.
- **To go, please.** · לקחת, בבקשה.
- **Yes, I'm free tomorrow.** · כן, אני פנוי מחר.
- **I'm free tonight.** · אני פנוי הערב.
- **I love surfing!** · אני מאוד אוהב לגלוש!
- **I usually draw in the evening.** · בדרך כלל אני מצייר בערב.
- **Let's meet here at seven.** · ניפגש כאן בשבע. — _Let’s meet ___ at ___ — מקום ושעה, וזהו._
- **No, that's not too late.** · לא, זה לא מאוחר מדי.
- **I'm going home.** · אני הולך הביתה.
- **Where is your family?** · איפה המשפחה שלך? — _Where is ___? — אותה שאלה מהכיוונים, עכשיו על אנשים._
- **Where is the milk?** · איפה החלב? — _התבנית: Where is the ___? — מוצאת כל מוצר בכל חנות._
- **Could I get a bag?** · אפשר שקית?
- **Just this, thanks.** · רק את זה, תודה.
- **Do you have bread?** · יש לכם לחם? — _התבנית: Do you have ___? — בודקת אם קיים במלאי._
- **The bill, please.** · החשבון, בבקשה.
- **I'll have the chicken.** · אני אקח את העוף. — _תבנית ההזמנה: I’ll have the ___._
- **A bottle of water, please.** · בקבוק מים, בבקשה.

### Expected replies (you hear)
- **Are you ready to order?** · מוכנים להזמין?
- **Anything to drink?** · משהו לשתות?

### Recovery tools reused
`Thank you!` · `Please speak slowly.` · `Can you repeat that?`

### Cold open (ambush)
- 🧑 (fast) “Perfect, follow me. Here are your menus. Are you ready to order?” · מצוין, בואו אחריי. הנה התפריטים. מוכנים להזמין?
  - ✅ best move: **Are you ready to order?** · מוכנים להזמין?
  - ✗ distractor: Anything to drink?

### Dialogue: `cold-morning` — happy path
- **🧑 Them:** “Good morning! What can I get you?” · בוקר טוב! מה להביא לך?
- **🫵 You:** “I'd like an iced coffee, please.” · אני רוצה קפה קר, בבקשה.
- **🧑 Them:** “Sure. Anything to eat?” · בטח. משהו לאכול?
- **🫵 You:** “Maybe later.” · אולי אחר כך.
- **🧑 Them:** “No problem. Cash or card?” · אין בעיה. מזומן או כרטיס?
- **🫵 You:** “By card, please.” · בכרטיס, בבקשה.
- **🧑 Them:** “Thank you! Have a nice day!” · תודה! שיהיה יום נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “A table for two, please.” → 🧑 “Good morning! What can I get you?” · בוקר טוב! מה להביא לך?
- ⚠︎ less useful: 🫵 “By card, please.” → 🧑 “Sure. Anything to eat?” · בטח. משהו לאכול?
- ⚠︎ less useful: 🫵 “To go, please.” → 🧑 “No problem. Cash or card?” · אין בעיה. מזומן או כרטיס?

### Dialogue: `cold-plans` — happy path
- **🧑 Them:** “Hi! Are you free tomorrow?” · היי! אתה פנוי מחר?
- **🫵 You:** “Yes, I'm free tomorrow.” · כן, אני פנוי מחר.
- **🧑 Them:** “I surf a lot. Do you like surfing?” · אני גולש הרבה. אתה אוהב לגלוש?
- **🫵 You:** “I love surfing!” · אני מאוד אוהב לגלוש!
- **🧑 Them:** “Then come with us! But we leave early.” · אז בוא איתנו! אבל אנחנו יוצאים מוקדם.
- **🫵 You:** “Let's meet here at seven.” · ניפגש כאן בשבע.
- **🧑 Them:** “Perfect. And what are you doing tonight?” · מושלם. ומה אתה עושה הערב?
- **🫵 You:** “I'm tired. I'm going home.” · אני עייף. אני הולך הביתה.
- **🧑 Them:** “Good night. See you tomorrow!” · לילה טוב. נתראה מחר!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I'm free tonight.” → 🧑 “Hi! Are you free tomorrow?” · היי! אתה פנוי מחר?
- ⚠︎ less useful: 🫵 “I usually draw in the evening.” → 🧑 “I surf a lot. Do you like surfing?” · אני גולש הרבה. אתה אוהב לגלוש?
- ⚠︎ less useful: 🫵 “No, that's not too late.” → 🧑 “Then come with us! But we leave early.” · אז בוא איתנו! אבל אנחנו יוצאים מוקדם.
- ⚠︎ less useful: 🫵 “Where is your family?” → 🧑 “Perfect. And what are you doing tonight?” · מושלם. ומה אתה עושה הערב?

### Dialogue: `cold-shop` — happy path
- **🧑 Them:** “Hi there! Can I help you find something?” · היי! לעזור לך למצוא משהו?
- **🫵 You:** “Where is the milk?” · איפה החלב?
- **🧑 Them:** “The milk is in aisle three, on the left.” · החלב במעבר שלוש, משמאל.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Hi! Is that everything?” · היי! זה הכל?
- **🫵 You:** “Just this, thanks.” · רק את זה, תודה.
- **🧑 Them:** “Do you need a bag?” · צריך שקית?
- **🫵 You:** “Could I get a bag?” · אפשר שקית?
- **🧑 Them:** “Insert your card here… all done. Have a nice day!” · הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Could I get a bag?” → 🧑 “Hi there! Can I help you find something?” · היי! לעזור לך למצוא משהו?
- ⚠︎ less useful: 🫵 “Just this, thanks.” → 🧑 “The milk is in aisle three, on the left.” · החלב במעבר שלוש, משמאל.
- ⚠︎ less useful: 🫵 “Where is the milk?” → 🧑 “Hi! Is that everything?” · היי! זה הכל?
- ⚠︎ less useful: 🫵 “Do you have bread?” → 🧑 “Do you need a bag?” · צריך שקית?

### Dialogue: `cold-dinner` — happy path
- **🧑 Them:** “Good evening! Do you have a reservation?” · ערב טוב! יש לכם הזמנה?
- **🫵 You:** “No — a table for two, please.” · לא — שולחן לשניים, בבקשה.
- **🧑 Them:** “Are you ready to order?” · מוכנים להזמין?
- **🫵 You:** “I'll have the chicken, without onions, please.” · אני אקח את העוף, בלי בצל, בבקשה.
- **🧑 Them:** “Of course. Anything to drink?” · כמובן. משהו לשתות?
- **🫵 You:** “A bottle of water, please.” · בקבוק מים, בבקשה.
- **🧑 Them:** “Is everything okay?” · הכל בסדר?
- **🫵 You:** “Yes, that was delicious! The bill, please.” · כן, היה טעים מאוד! החשבון, בבקשה.
- **🧑 Them:** “So glad you enjoyed it. Here you are — have a lovely evening!” · שמח שנהניתם. בבקשה — ערב נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “The bill, please.” → 🧑 “Good evening! Do you have a reservation?” · ערב טוב! יש לכם הזמנה?
- ⚠︎ less useful: 🫵 “A bottle of water, please.” → 🧑 “Are you ready to order?” · מוכנים להזמין?
- ⚠︎ less useful: 🫵 “A table for two, please.” → 🧑 “Of course. Anything to drink?” · כמובן. משהו לשתות?
- ⚠︎ less useful: 🫵 “I'll have the chicken.” → 🧑 “Is everything okay?” · הכל בסדר?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 19 — Public Transport · תחבורה ציבורית

> Phase 4 · 🏙️ City & Conversation

**Objective:** Ticket, platform, direction, the right stop. · כרטיס, רציף, כיוון, ירידה נכונה.

**Confidence gain:** The city moves for me, cheaply. · העיר זזה בשבילי, בזול.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_19.mp4` — played automatically when the file exists

### Core phrases (you say)
- **One ticket to the centre, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **Which platform?** · איזה רציף? — _שתי מילים שמונעות עלייה לרכבת הלא נכונה._
- **Does this stop at the museum?** · זה עוצר במוזיאון? — _התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון._
- **When's the next one?** · מתי הבא?
- **Single, please.** · הלוך, בבקשה.

### Expected replies (you hear)
- **Single or return?** · הלוך או הלוך-חזור?
- **Platform two.** · רציף שתיים.
- **Every ten minutes.** · כל עשר דקות.
- **It's three stops.** · זה שלוש תחנות.
- **You're going the wrong way.** · אתה בכיוון הלא נכון.
- **Your stop is next.** · התחנה שלך הבאה.

_Reply-training drill:_ “Single or return?” · “Platform two.” · “Every ten minutes.” · “It's three stops.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “You're going the wrong way. Not this one — platform two. The next one is in ten minutes, and your stop is three stops.” · אתה בכיוון הלא נכון. לא זה — רציף שתיים. הבא בעוד עשר דקות, והתחנה שלך בעוד שלוש תחנות.
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Does this stop at the museum?

### Dialogue: `transport` — happy path
- **🧑 Them:** “Hello! Where are you headed?” · שלום! לאן אתה נוסע?
- **🫵 You:** “One ticket to the centre, please.” · כרטיס אחד למרכז, בבקשה.
- **🧑 Them:** “Single or return?” · הלוך או הלוך-חזור?
- **🫵 You:** “Single, please.” · הלוך, בבקשה.
- **🧑 Them:** “That's three euros. It leaves every ten minutes.” · זה שלושה יורו. יוצא כל עשר דקות.
- **🫵 You:** “Which platform?” · איזה רציף?
- **🧑 Them:** “Platform two. Straight ahead.” · רציף שתיים. ישר קדימה.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “The train's right here. Hop on.” · הרכבת ממש כאן. עלה.
- **🫵 You:** “Does this stop at the museum?” · זה עוצר במוזיאון?
- **🧑 Them:** “Yes — it's three stops. I'll tell you when.” · כן — זה שלוש תחנות. אני אגיד לך מתי.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Here we are — your stop is next. Enjoy the museum!” · הגענו — התחנה שלך הבאה. תיהנה במוזיאון!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 20 — Past & Recent Events · עבר: מה עשיתי

> Phase 4 · 🏙️ City & Conversation

**Objective:** I went, I saw, I ate, I stayed, it was good — say what you did. · הלכתי, ראיתי, אכלתי, ישנתי, היה טוב — לספר מה עשית.

**Confidence gain:** I can tell what happened. · אני יכול לספר מה קרה.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_20.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I went to the old town.** · הלכתי לעיר העתיקה. — _I went to ___ — התשובה ל"איפה היית?"_
- **I saw the market.** · ראיתי את השוק.
- **Yes, I ate fish.** · כן, אכלתי דג.
- **Yes, it was great!** · כן, היה מעולה!
- **It was good.** · היה טוב.
- **I stayed in a hostel.** · ישנתי בהוסטל. — _I stayed in ___ — hostel, hotel, apartment._
- **What did you do yesterday?** · מה עשית אתמול?
- **It was bad.** · היה רע.

### Expected replies (you hear)
- **Where were you yesterday?** · איפה היית אתמול?
- **What did you see?** · מה ראית?
- **Did you eat there?** · אכלת שם?
- **Did you like it?** · אהבת?
- **Where did you stay?** · איפה ישנת?
- **Was it good?** · היה טוב?

_Reply-training drill:_ “What did you see?” · “Did you eat there?” · “Did you like it?” · “Where did you stay?”

### Recovery tools reused
`Can you repeat that?`

### Dialogue: `what-did-you-do` — happy path
- **🧑 Them:** “Hey! Where were you yesterday?” · היי! איפה היית אתמול?
- **🫵 You:** “I went to the old town.” · הלכתי לעיר העתיקה.
- **🧑 Them:** “Nice! What did you see?” · יפה! מה ראית?
- **🫵 You:** “I saw the market.” · ראיתי את השוק.
- **🧑 Them:** “Did you eat there?” · אכלת שם?
- **🫵 You:** “Yes, I ate fish.” · כן, אכלתי דג.
- **🧑 Them:** “Did you like it?” · אהבת?
- **🫵 You:** “Yes, it was great!” · כן, היה מעולה!
- **🧑 Them:** “You were in Argentina last month, right? Where did you stay?” · היית בארגנטינה בחודש שעבר, נכון? איפה ישנת?
- **🫵 You:** “I stayed in a hostel.” · ישנתי בהוסטל.
- **🧑 Them:** “A hostel! Was it good?” · הוסטל! היה טוב?
- **🫵 You:** “It was good. And you? What did you do yesterday?” · היה טוב. ואתה? מה עשית אתמול?
- **🧑 Them:** “Me? Nothing! I was tired. I slept all day.” · אני? כלום! הייתי עייף. ישנתי כל היום.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 21 — Future Travel & Plans · לאן ממשיכים: תוכניות

> Phase 4 · 🏙️ City & Conversation

**Objective:** Where I am going, for how long, what I want to do, and what comes after. · לאן אני נוסע, לכמה זמן, מה אני רוצה לעשות, ומה אחרי זה.

**Confidence gain:** I can talk about my plans. · אני מספר על התוכניות שלי.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_21.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I'm going to Vietnam.** · אני נוסע לווייטנאם. — _I’m going to ___ — מדינה, עיר, או המקום הבא._
- **I'll be there for two weeks.** · אני אהיה שם שבועיים.
- **I want to visit Hanoi.** · אני רוצה לבקר בהאנוי.
- **I want to try the food.** · אני רוצה לנסות את האוכל.
- **I want to travel by motorbike.** · אני רוצה לטייל באופנוע.
- **I want to ride horses there.** · אני רוצה לרכוב שם על סוסים.
- **After that I'm going to Thailand.** · אחרי זה אני נוסע לתאילנד.
- **Tomorrow morning I'm going to the airport.** · מחר בבוקר אני נוסע לשדה התעופה.
- **Where are you going next?** · לאן אתה נוסע אחרי זה?

### Expected replies (you hear)
- **How long will you be there?** · כמה זמן תהיה שם?
- **What do you want to do there?** · מה אתה רוצה לעשות שם?
- **And after that?** · ואחרי זה?
- **What are you doing tomorrow morning?** · מה אתה עושה מחר בבוקר?
- **Be careful.** · תיזהר.
- **Have a great trip!** · נסיעה טובה!

_Reply-training drill:_ “How long will you be there?” · “What do you want to do there?” · “And after that?” · “Be careful.”

### Recovery tools reused
`Please speak slowly.`

### Dialogue: `where-next` — happy path
- **🧑 Them:** “So, where are you going next?” · אז לאן אתה נוסע אחרי זה?
- **🫵 You:** “I'm going to Vietnam.” · אני נוסע לווייטנאם.
- **🧑 Them:** “Wow! How long will you be there?” · וואו! כמה זמן תהיה שם?
- **🫵 You:** “I'll be there for two weeks.” · אני אהיה שם שבועיים.
- **🧑 Them:** “What do you want to do there?” · מה אתה רוצה לעשות שם?
- **🫵 You:** “I want to visit Hanoi.” · אני רוצה לבקר בהאנוי.
- **🧑 Them:** “Nice. Anything else?” · יפה. עוד משהו?
- **🫵 You:** “I want to travel by motorbike.” · אני רוצה לטייל באופנוע.
- **🧑 Them:** “Sounds amazing! Be careful. And after that?” · נשמע מדהים! תיזהר. ואחרי זה?
- **🫵 You:** “After that I'm going to Thailand.” · אחרי זה אני נוסע לתאילנד.
- **🧑 Them:** “Great plan. And what are you doing tomorrow morning?” · תוכנית מעולה. ומה אתה עושה מחר בבוקר?
- **🫵 You:** “Tomorrow morning I'm going to the airport.” · מחר בבוקר אני נוסע לשדה התעופה.
- **🧑 Them:** “Already! We'll miss you.” · כבר! נתגעגע אליך.
- **🫵 You:** “And you? Where are you going next?” · ואתה? לאן אתה נוסע אחרי זה?
- **🧑 Them:** “Me? I'm going home. Have a great trip!” · אני? אני חוזר הביתה. נסיעה טובה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 22 — Fixing Problems · לתקן בעיה

> Phase 4 · 🏙️ City & Conversation

**Objective:** Wrong order, double charge, broken AC, noisy room — fixed with grace. · הזמנה שגויה, חיוב כפול, מזגן שלא עובד, חדר רועש — נפתרים באלגנטיות.

**Confidence gain:** Friction is a script, not a crisis. · תקלה היא תסריט, לא משבר.

**Estimated time:** ~22 min

**Video:** `videos/{language}/{language}_22.mp4` — played automatically when the file exists

### Core phrases (you say)
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע וברור. לא צריך להתנצל._
- **I ordered the pasta.** · הזמנתי את הפסטה.
- **I think there's a mistake.** · אני חושב שיש טעות.
- **I was charged twice.** · חייבו אותי פעמיים.
- **No problem, thank you.** · אין בעיה, תודה.
- **There's a problem with my room.** · יש בעיה בחדר שלי. — _There’s a problem with ___ — פותח כל תלונה בנימוס._
- **Can you help me?** · אתה יכול לעזור לי? — _Can you ___? — הדרך לבקש כל דבר._
- **The air conditioning isn't working.** · המזגן לא עובד. — _התבנית: The ___ isn’t working. עובדת על כל דבר שהתקלקל._
- **Can you fix it?** · אפשר לתקן את זה?
- **My room is very noisy.** · החדר שלי מאוד רועש. — _לתאר בעיה זה לא להתלונן. זה לתת להם לתקן._
- **Can I change rooms?** · אפשר להחליף חדר?

### Expected replies (you hear)
- **I'm so sorry about that.** · אני מצטער על זה מאוד.
- **What's the problem?** · מה הבעיה?
- **I'll bring the right one.** · אביא את הנכון.
- **Let me check the bill.** · תן לי לבדוק את החשבון.
- **I'll refund it now.** · אחזיר לך את הכסף עכשיו.
- **It's on the house.** · זה על חשבון הבית.
- **Is there anything else?** · יש עוד משהו?

_Reply-training drill:_ “I'm so sorry about that.” · “What's the problem?” · “I'll bring the right one.” · “I'll refund it now.” · “Is there anything else?”

### Recovery tools reused
`Please speak slowly.`

### Dialogue: `fixing-problems` — happy path
- **🧑 Them:** “Here's your meal — one steak!” · הנה הארוחה שלך — סטייק אחד!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- **🫵 You:** “I ordered the pasta.” · הזמנתי את הפסטה.
- **🧑 Them:** “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.
- **🧑 Them:** “Here's your bill.” · הנה החשבון.
- **🫵 You:** “I think there's a mistake.” · אני חושב שיש טעות.
- **🧑 Them:** “Let me check the bill. What's the problem?” · תן לי לבדוק את החשבון. מה הבעיה?
- **🫵 You:** “I was charged twice.” · חייבו אותי פעמיים.
- **🧑 Them:** “You're right — my mistake. I'll refund it now.” · אתה צודק — הטעות שלי. אחזיר לך עכשיו.
- **🫵 You:** “No problem, thank you.” · אין בעיה, תודה.
- **🧑 Them:** “Thank you for your patience. Dessert is on the house!” · תודה על הסבלנות. הקינוח על חשבון הבית!

### Dialogue: `room-problem` — happy path
- **🧑 Them:** “Good evening! How can I help you?” · ערב טוב! איך אפשר לעזור?
- **🫵 You:** “There's a problem with my room.” · יש בעיה בחדר שלי.
- **🧑 Them:** “I'm sorry to hear that. What's the problem?” · אני מצטער לשמוע. מה הבעיה?
- **🫵 You:** “The air conditioning isn't working.” · המזגן לא עובד.
- **🧑 Them:** “I'm so sorry about that.” · אני מצטער על זה מאוד.
- **🫵 You:** “Can you fix it?” · אפשר לתקן את זה?
- **🧑 Them:** “Yes, I'll send someone right away. Is everything else okay?” · כן, אשלח מישהו מיד. כל השאר בסדר?
- **🫵 You:** “No. My room is very noisy.” · לא. החדר שלי מאוד רועש.
- **🧑 Them:** “I understand. We have a quieter room.” · אני מבין. יש לנו חדר שקט יותר.
- **🫵 You:** “Can I change rooms?” · אפשר להחליף חדר?
- **🧑 Them:** “Of course — room 305. Here is your new key. Good night!” · כמובן — חדר 305. הנה המפתח החדש. לילה טוב!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 23 — Opinions, Feelings & Reactions · דעות, רגשות ותגובות

> Phase 4 · 🏙️ City & Conversation

**Objective:** I think, why, because, but, maybe, really?, of course. · אני חושב, למה, כי, אבל, אולי, באמת?, ברור.

**Confidence gain:** I sound like a person, not a phrasebook. · אני נשמע כמו בן אדם, לא כמו שיחון.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_23.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I think it's too expensive.** · אני חושב שזה יקר מדי. — _I think ___ — כל דעה מתחילה ככה._
- **I don't think so.** · לא נראה לי.
- **Because it's only one hour.** · כי זה רק שעה אחת. — _Because ___ — התשובה לכל "למה?"_
- **Yes, I like it.** · כן, זה מוצא חן בעיניי.
- **That's strange.** · זה מוזר.
- **I'm not sure.** · אני לא בטוח. — _כשאתה לא יודע מה אתה חושב — זו תשובה שלמה._
- **Okay, let's do it.** · בסדר, הולכים על זה.
- **Of course!** · ברור!
- **I don't like it.** · זה לא מוצא חן בעיניי.

### Expected replies (you hear)
- **What do you think?** · מה אתה חושב?
- **Really?** · באמת?
- **Why?** · למה?
- **That's true.** · נכון.
- **Do you like it?** · מוצא חן בעיניך?
- **Are you coming?** · אתה בא?

_Reply-training drill:_ “Really?” · “Why?” · “That's true.” · “What do you think?”

### Recovery tools reused
`Can you repeat that?`

### Dialogue: `choosing-a-tour` — happy path
- **🧑 Them:** “Look — a boat tour, fifty euros. What do you think?” · תראה — סיור בסירה, חמישים יורו. מה אתה חושב?
- **🫵 You:** “I think it's too expensive.” · אני חושב שזה יקר מדי.
- **🧑 Them:** “Really? I think it's a good price.” · באמת? אני חושב שזה מחיר טוב.
- **🫵 You:** “I don't think so.” · לא נראה לי.
- **🧑 Them:** “Why?” · למה?
- **🫵 You:** “Because it's only one hour.” · כי זה רק שעה אחת.
- **🧑 Them:** “That's true. Look at this one — a walking tour. Do you like it?” · נכון. תראה את זה — סיור רגלי. מוצא חן בעיניך?
- **🫵 You:** “Yes, I like it.” · כן, זה מוצא חן בעיניי.
- **🧑 Them:** “It's free. But it starts at six in the morning.” · זה בחינם. אבל זה מתחיל בשש בבוקר.
- **🫵 You:** “At six? That's strange.” · בשש? זה מוזר.
- **🧑 Them:** “It's because of the heat. Are you coming?” · זה בגלל החום. אתה בא?
- **🫵 You:** “Maybe. I'm not sure — I'm tired.” · אולי. אני לא בטוח — אני עייף.
- **🧑 Them:** “Come on — it's only two hours, and it's free.” · נו — זה רק שעתיים, וזה בחינם.
- **🫵 You:** “Okay, let's do it.” · בסדר, הולכים על זה.
- **🧑 Them:** “Great! See you at six!” · מעולה! נתראה בשש!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 24 — CHECKPOINT: City & Conversation · נקודת ביקורת: עיר ושיחה

> Phase 4 · 🏙️ City & Conversation · 🏁 CHECKPOINT

**Objective:** Transport → a chat with a local → what I did and where I go next. Cold, chained. · תחבורה ← שיחה עם מקומי ← מה עשיתי ולאן אני ממשיך. קר, ברצף.

**Confidence gain:** A foreign city = home turf. · עיר זרה = מגרש ביתי.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_24.mp4` — played automatically when the file exists

### Core phrases (you say)
- **One ticket to the centre, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **Does this stop at the museum?** · זה עוצר במוזיאון? — _התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון._
- **Single, please.** · הלוך, בבקשה.
- **Which platform?** · איזה רציף? — _שתי מילים שמונעות עלייה לרכבת הלא נכונה._
- **I like it a lot.** · אני מאוד אוהב.
- **It was nice talking to you.** · היה נעים לדבר איתך.
- **I think it's too expensive.** · אני חושב שזה יקר מדי. — _I think ___ — כל דעה מתחילה ככה._
- **Because it's only one hour.** · כי זה רק שעה אחת. — _Because ___ — התשובה לכל "למה?"_
- **Can you recommend a place?** · אתה יכול להמליץ על מקום? — _מקומיים יודעים הכי טוב. תשאל._
- **I don't think so.** · לא נראה לי.
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע וברור. לא צריך להתנצל._
- **No problem, thank you.** · אין בעיה, תודה.
- **I ordered the pasta.** · הזמנתי את הפסטה.
- **I was charged twice.** · חייבו אותי פעמיים.
- **Can you fix it?** · אפשר לתקן את זה?
- **I went to the old town.** · הלכתי לעיר העתיקה. — _I went to ___ — התשובה ל"איפה היית?"_
- **I'm going to Vietnam.** · אני נוסע לווייטנאם. — _I’m going to ___ — מדינה, עיר, או המקום הבא._
- **Yes, it was great!** · כן, היה מעולה!
- **I stayed in a hostel.** · ישנתי בהוסטל. — _I stayed in ___ — hostel, hotel, apartment._
- **I'll be there for two weeks.** · אני אהיה שם שבועיים.
- **After that I'm going to Thailand.** · אחרי זה אני נוסע לתאילנד.
- **Where are you going next?** · לאן אתה נוסע אחרי זה?
- **It was good.** · היה טוב.
- **I'm not sure.** · אני לא בטוח. — _כשאתה לא יודע מה אתה חושב — זו תשובה שלמה._

### Expected replies (you hear)
- **You're going the wrong way.** · אתה בכיוון הלא נכון.
- **It's three stops.** · זה שלוש תחנות.

### Recovery tools reused
`Please speak slowly.` · `Can you repeat that?`

### Cold open (ambush)
- 🧑 (fast) “You're going the wrong way. Platform two — it leaves every ten minutes.” · אתה בכיוון הלא נכון. רציף שתיים — יוצא כל עשר דקות.
  - ✅ best move: **You're going the wrong way.** · אתה בכיוון הלא נכון.
  - ✗ distractor: It's three stops.

### Dialogue: `cold-transport` — happy path
- **🧑 Them:** “Hello! Where are you headed?” · שלום! לאן אתה נוסע?
- **🫵 You:** “One ticket to the centre, please.” · כרטיס אחד למרכז, בבקשה.
- **🧑 Them:** “Single or return?” · הלוך או הלוך-חזור?
- **🫵 You:** “Single, please.” · הלוך, בבקשה.
- **🧑 Them:** “That's three euros. It leaves every ten minutes.” · זה שלושה יורו. יוצא כל עשר דקות.
- **🫵 You:** “Which platform?” · איזה רציף?
- **🧑 Them:** “Platform two. Straight ahead.” · רציף שתיים. ישר קדימה.
- **🫵 You:** “Does this stop at the museum?” · זה עוצר במוזיאון?
- **🧑 Them:** “Yes — it's three stops. I'll tell you when.” · כן — זה שלוש תחנות. אני אגיד לך מתי.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Does this stop at the museum?” → 🧑 “Hello! Where are you headed?” · שלום! לאן אתה נוסע?
- ⚠︎ less useful: 🫵 “Which platform?” → 🧑 “Single or return?” · הלוך או הלוך-חזור?
- ⚠︎ less useful: 🫵 “One ticket to the centre, please.” → 🧑 “That's three euros. It leaves every ten minutes.” · זה שלושה יורו. יוצא כל עשר דקות.
- ⚠︎ less useful: 🫵 “Single, please.” → 🧑 “Platform two. Straight ahead.” · רציף שתיים. ישר קדימה.

### Dialogue: `cold-chat` — happy path
- **🧑 Them:** “Welcome! Do you like it here?” · ברוך הבא! אתה אוהב את המקום?
- **🫵 You:** “Yes, I like it a lot.” · כן, אני מאוד אוהב.
- **🧑 Them:** “You should take the boat tour. It's fifty euros.” · כדאי לך לעשות את הסיור בסירה. זה חמישים יורו.
- **🫵 You:** “I think it's too expensive.” · אני חושב שזה יקר מדי.
- **🧑 Them:** “Really? Then you should try the old town. It's free.” · באמת? אז כדאי לך לנסות את העיר העתיקה. זה בחינם.
- **🫵 You:** “Can you recommend a place?” · אתה יכול להמליץ על מקום?
- **🧑 Them:** “Of course — try 'Mama Rosa', in the old town. It's very good.” · בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “It was nice talking to you.” → 🧑 “Welcome! Do you like it here?” · ברוך הבא! אתה אוהב את המקום?
- ⚠︎ less useful: 🫵 “Because it's only one hour.” → 🧑 “You should take the boat tour. It's fifty euros.” · כדאי לך לעשות את הסיור בסירה. זה חמישים יורו.
- ⚠︎ less useful: 🫵 “I don't think so.” → 🧑 “Really? Then you should try the old town. It's free.” · באמת? אז כדאי לך לנסות את העיר העתיקה. זה בחינם.

### Dialogue: `cold-problem` — happy path
- **🧑 Them:** “Here's your meal — one steak!” · הנה הארוחה שלך — סטייק אחד!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- **🫵 You:** “I ordered the pasta.” · הזמנתי את הפסטה.
- **🧑 Them:** “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.
- **🫵 You:** “No problem, thank you.” · אין בעיה, תודה.
- **🧑 Them:** “Thank you for your patience. Dessert is on the house!” · תודה על הסבלנות. הקינוח על חשבון הבית!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “No problem, thank you.” → 🧑 “Here's your meal — one steak!” · הנה הארוחה שלך — סטייק אחד!
- ⚠︎ less useful: 🫵 “I was charged twice.” → 🧑 “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- ⚠︎ less useful: 🫵 “Can you fix it?” → 🧑 “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.

### Dialogue: `cold-hostel` — happy path
- **🧑 Them:** “Hey! Where were you yesterday?” · היי! איפה היית אתמול?
- **🫵 You:** “I went to the old town.” · הלכתי לעיר העתיקה.
- **🧑 Them:** “Did you like it?” · אהבת?
- **🫵 You:** “Yes, it was great!” · כן, היה מעולה!
- **🧑 Them:** “So, where are you going next?” · אז לאן אתה נוסע אחרי זה?
- **🫵 You:** “I'm going to Vietnam.” · אני נוסע לווייטנאם.
- **🧑 Them:** “Wow! How long will you be there?” · וואו! כמה זמן תהיה שם?
- **🫵 You:** “I'll be there for two weeks.” · אני אהיה שם שבועיים.
- **🧑 Them:** “Already! We'll miss you.” · כבר! נתגעגע אליך.
- **🫵 You:** “And you? Where are you going next?” · ואתה? לאן אתה נוסע אחרי זה?
- **🧑 Them:** “Me? I'm going home. Are you coming?” · אני? אני חוזר הביתה. אתה בא?
- **🫵 You:** “Maybe. I'm not sure — I'm tired.” · אולי. אני לא בטוח — אני עייף.
- **🧑 Them:** “Great! See you at six!” · מעולה! נתראה בשש!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I'm going to Vietnam.” → 🧑 “Hey! Where were you yesterday?” · היי! איפה היית אתמול?
- ⚠︎ less useful: 🫵 “I stayed in a hostel.” → 🧑 “Did you like it?” · אהבת?
- ⚠︎ less useful: 🫵 “I went to the old town.” → 🧑 “So, where are you going next?” · אז לאן אתה נוסע אחרי זה?
- ⚠︎ less useful: 🫵 “After that I'm going to Thailand.” → 🧑 “Wow! How long will you be there?” · וואו! כמה זמן תהיה שם?
- ⚠︎ less useful: 🫵 “It was good.” → 🧑 “Already! We'll miss you.” · כבר! נתגעגע אליך.
- ⚠︎ less useful: 🫵 “Because it's only one hour.” → 🧑 “Me? I'm going home. Are you coming?” · אני? אני חוזר הביתה. אתה בא?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 25 — Lost / Stolen / Police · אבד, נגנב, משטרה

> Phase 5 · 🎖️ Mastery

**Objective:** I lost, I can’t find, it was stolen, where the police are, I want to report it. · איבדתי, לא מוצא, נגנב, איפה המשטרה, אני רוצה לדווח.

**Confidence gain:** Even when something disappears — I have a script. · גם כשמשהו נעלם — יש לי תסריט.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_25.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I can't find my phone.** · אני לא מוצא את הטלפון שלי. — _I can’t find ___ — לפני שקובעים שזה אבד._
- **I think it was stolen.** · אני חושב שגנבו לי אותו.
- **Where is the police station?** · איפה תחנת המשטרה?
- **My phone was stolen.** · גנבו לי את הטלפון. — _My ___ was stolen — phone, wallet, bag._
- **On the bus this morning.** · באוטובוס, הבוקר.
- **Yes, I want to report it.** · כן, אני רוצה לדווח על זה.
- **Yes, I have my passport.** · כן, יש לי את הדרכון.
- **I lost my passport.** · איבדתי את הדרכון. — _I lost my ___ — passport, phone, wallet._
- **I can't find my wallet.** · אני לא מוצא את הארנק שלי.

### Expected replies (you hear)
- **Did you lose it?** · איבדת אותו?
- **You should go to the police.** · כדאי לך ללכת למשטרה.
- **Where did it happen?** · איפה זה קרה?
- **Do you want to report it?** · אתה רוצה לדווח על זה?
- **Do you have your passport?** · יש לך את הדרכון?

_Reply-training drill:_ “Where did it happen?” · “Do you want to report it?” · “Do you have your passport?” · “You should go to the police.”

### Recovery tools reused
`Thank you!` · `What does that mean?` · `Please speak slowly.`

### Cold open (ambush)
- 🧑 (fast) “Okay. Was it here, near the station, or on the bus this morning? And do you have your passport?” · בסדר. זה היה כאן, ליד התחנה, או באוטובוס הבוקר? ויש לך את הדרכון?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Yes, I want to report it.

### Dialogue: `asking-for-help` — happy path
- **🧑 Them:** “Are you okay?” · הכל בסדר?
- **🫵 You:** “No. I can't find my phone.” · לא. אני לא מוצא את הטלפון שלי.
- **🧑 Them:** “Did you lose it?” · איבדת אותו?
- **🫵 You:** “I don't know. I think it was stolen.” · אני לא יודע. אני חושב שגנבו לי אותו.
- **🧑 Them:** “You should go to the police.” · כדאי לך ללכת למשטרה.
- **🫵 You:** “Where is the police station?” · איפה תחנת המשטרה?
- **🧑 Them:** “It's near here, on the left.” · זה קרוב, משמאל.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Good luck!” · בהצלחה!

### Dialogue: `police-station` — happy path
- **🧑 Them:** “Hello. How can I help you?” · שלום. איך אפשר לעזור?
- **🫵 You:** “My phone was stolen.” · גנבו לי את הטלפון.
- **🧑 Them:** “Where did it happen?” · איפה זה קרה?
- **🫵 You:** “On the bus this morning.” · באוטובוס, הבוקר.
- **🧑 Them:** “Do you want to report it?” · אתה רוצה לדווח על זה?
- **🫵 You:** “Yes, I want to report it.” · כן, אני רוצה לדווח על זה.
- **🧑 Them:** “Do you have your passport?” · יש לך את הדרכון?
- **🫵 You:** “Yes, I have my passport.” · כן, יש לי את הדרכון.
- **🧑 Them:** “Okay. Let's start the report.” · בסדר. בוא נתחיל את הדיווח.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 26 — Pharmacy & Health · בית מרקחת ובריאות

> Phase 5 · 🎖️ Mastery

**Objective:** What hurts, allergies, how often — explain and understand. · מה כואב, אלרגיות, כל כמה זמן — להסביר ולהבין.

**Confidence gain:** My body is cared for in any language. · הגוף שלי מטופל בכל שפה.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_26.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I have a headache.** · יש לי כאב ראש. — _התבנית: I have a ___ — מתארת כל תסמין. headache / cough / fever._
- **Do you have something for a cold?** · יש לכם משהו לצינון? — _התבנית: something for ___ — מבקשת תרופה בלי לדעת את השם שלה._
- **How often do I take it?** · כל כמה זמן לוקחים? — _השאלה שאסור לוותר עליה עם תרופה. תמיד מוודאים מינון._
- **I'm allergic to penicillin.** · אני אלרגי לפניצילין.
- **I have a stomach ache.** · יש לי כאב בטן.
- **It hurts here.** · כואב לי כאן. — _מצביעים על המקום ואומרים את זה. לא צריך לדעת איך קוראים לו._

### Expected replies (you hear)
- **What's the matter?** · מה קרה?
- **Take this twice a day.** · קח את זה פעמיים ביום.
- **After meals.** · אחרי הארוחות.
- **Any allergies?** · יש אלרגיות?
- **You should see a doctor.** · כדאי לך לראות רופא.
- **Feel better soon!** · תרגיש טוב יותר!

_Reply-training drill:_ “What's the matter?” · “Any allergies?” · “Feel better soon!”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Take this twice a day, after meals, and please follow the instructions on the label. Any other allergies?” · קח את זה פעמיים ביום, אחרי הארוחות, ותפעל לפי ההוראות בעלון. יש עוד אלרגיות?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Thank you!

### Dialogue: `pharmacy` — happy path
- **🧑 Them:** “Hello! What's the matter?” · שלום! מה קרה?
- **🫵 You:** “I have a headache.” · יש לי כאב ראש.
- **🧑 Them:** “I see. Before I give you anything — any allergies?” · הבנתי. לפני שאתן לך משהו — יש אלרגיות?
- **🫵 You:** “I'm allergic to penicillin.” · אני אלרגי לפניצילין.
- **🧑 Them:** “Good to know. This may help.” · טוב לדעת. זה יכול לעזור.
- **🫵 You:** “How often do I take it?” · כל כמה זמן לוקחים?
- **🧑 Them:** “Twice a day, after meals. Please follow the instructions on the label.” · פעמיים ביום, אחרי הארוחות. תפעל לפי ההוראות בעלון.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Is there anything else you need?” · עוד משהו שאתה צריך?
- **🫵 You:** “Do you have something for a cold?” · יש לכם משהו לצינון?
- **🧑 Them:** “Here you go. Feel better soon!” · הנה לך. תרגיש טוב יותר!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I have a stomach ache.” → 🧑 “I'll note that — but first, any allergies to medicine?” · ארשום את זה — אבל קודם, יש אלרגיה לתרופות?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 27 — Emergency · חירום

> Phase 5 · 🎖️ Mastery

**Objective:** Help, ambulance, where I am — one emergency call, automatic under stress. · עזרה, אמבולנס, איפה אני — שיחת חירום אחת, אוטומטית תחת לחץ.

**Confidence gain:** The worst case has a script. · לתרחיש הגרוע ביותר יש תסריט.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_27.mp4` — played automatically when the file exists

### Core phrases (you say)
- **I need help.** · אני צריך עזרה. — _שלוש מילים. קודם כל אומרים את זה._
- **Someone is hurt.** · מישהו נפצע.
- **Please call an ambulance.** · תזמינו אמבולנס, בבקשה.
- **Please call a doctor.** · תקראו לרופא, בבקשה.
- **I'm at the train station.** · אני בתחנת הרכבת. — _I’m at ___ — המקום הוא המידע הכי חשוב._
- **Okay, I'll stay here.** · בסדר, אני נשאר כאן.
- **Call the police!** · תקראו למשטרה!
- **Where is the hospital?** · איפה בית החולים?

### Expected replies (you hear)
- **What's wrong?** · מה קרה?
- **Stay calm, help is coming.** · תישאר רגוע, עזרה בדרך.
- **Where are you?** · איפה אתה?
- **Are you hurt?** · אתה פצוע?
- **An ambulance is on the way.** · אמבולנס בדרך.
- **Stay there.** · תישאר שם.

_Reply-training drill:_ “What's wrong?” · “Are you hurt?” · “Where are you?” · “Stay there.”

### Recovery tools reused
`Please speak slowly.`

### Dialogue: `emergency` — happy path
- **🧑 Them:** “Emergency services — what's wrong?” · שירותי חירום — מה קרה?
- **🫵 You:** “I need help.” · אני צריך עזרה.
- **🧑 Them:** “Okay, stay calm. Are you hurt?” · טוב, תישאר רגוע. אתה פצוע?
- **🫵 You:** “No, but someone is hurt.” · לא, אבל מישהו נפצע.
- **🧑 Them:** “Do you need an ambulance or the police?” · אתה צריך אמבולנס או משטרה?
- **🫵 You:** “Please call an ambulance.” · תזמינו אמבולנס, בבקשה.
- **🧑 Them:** “An ambulance is on the way. Where are you?” · אמבולנס בדרך. איפה אתה?
- **🫵 You:** “I'm at the train station.” · אני בתחנת הרכבת.
- **🧑 Them:** “Good. Stay there, and stay with the person.” · טוב. תישאר שם, ותישאר עם האדם.
- **🫵 You:** “Okay, I'll stay here.” · בסדר, אני נשאר כאן.
- **🧑 Them:** “Help is on the way. You're doing everything right.” · העזרה בדרך. אתה עושה הכל נכון.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 28 — No Subtitles · בלי כתוביות

> Phase 5 · 🎖️ Mastery

**Objective:** Every dialogue — no text, surprise variants. · כל הדיאלוגים — בלי טקסט, עם וריאציות הפתעה.

**Confidence gain:** My ears stand alone. · האוזניים עומדות לבד.

**Estimated time:** ~20 min

**Video:** `videos/{language}/{language}_28.mp4` — played automatically when the file exists

### Core phrases (you say)
- **One ticket to the centre, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **Single, please.** · הלוך, בבקשה.
- **In cash.** · במזומן.
- **By card, please.** · בכרטיס, בבקשה.
- **Does this stop at the museum?** · זה עוצר במוזיאון? — _התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון._
- **Which platform?** · איזה רציף? — _שתי מילים שמונעות עלייה לרכבת הלא נכונה._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _הפתיח למסעדה. תבנית: a table for ___._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **A bottle of water, please.** · בקבוק מים, בבקשה.
- **The bill, please.** · החשבון, בבקשה.
- **That was delicious!** · זה היה טעים מאוד! — _מחמאה קטנה שקונה חיוך גדול._
- **No onions, please.** · בלי בצל, בבקשה. — _תבנית: No ___, please — לכל מה שאתה לא רוצה בצלחת._
- **This place is beautiful.** · המקום הזה יפהפה. — _מחמאה למקום פותחת כל שיחה._
- **I'm from Israel.** · אני מישראל. — _התבנית: I’m from ___ — התשובה ל-Where are you from._
- **It's my first time here.** · זו הפעם הראשונה שלי כאן. — _פותח שיחה ומזמין המלצות._
- **I like it a lot.** · אני מאוד אוהב.
- **Can you recommend a place?** · אתה יכול להמליץ על מקום? — _מקומיים יודעים הכי טוב. תשאל._
- **It was nice talking to you.** · היה נעים לדבר איתך.
- **How about you?** · ואתה? — _להחזיר את השאלה — וכבר יש שיחה._

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.`

### Dialogue: `ns-transit` — happy path
- **🧑 Them:** “Hello! Where to?” · שלום! לאן?
- **🫵 You:** “One ticket to the centre, please.” · כרטיס אחד למרכז, בבקשה.
- **🧑 Them:** “Single or return?” · הלוך או הלוך-חזור?
- **🫵 You:** “Single, please.” · הלוך, בבקשה.
- **🧑 Them:** “That's three euros. Cash or card?” · זה שלושה יורו. מזומן או כרטיס?
- **🫵 You:** “By card, please.” · בכרטיס, בבקשה.
- **🧑 Them:** “Platform two. It leaves every ten minutes.” · רציף שתיים. יוצא כל עשר דקות.
- **🫵 You:** “Does this stop at the museum?” · זה עוצר במוזיאון?
- **🧑 Them:** “Yes — it's three stops. I'll tell you when.” · כן — זה שלוש תחנות. אני אגיד לך מתי.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “To this address, please.” → 🧑 “Hello! Where to?” · שלום! לאן?
- ⚠︎ less useful: 🫵 “In cash.” → 🧑 “Single or return?” · הלוך או הלוך-חזור?
- ⚠︎ less useful: 🫵 “Single, please.” → 🧑 “That's three euros. Cash or card?” · זה שלושה יורו. מזומן או כרטיס?
- ⚠︎ less useful: 🫵 “Which platform?” → 🧑 “Platform two. It leaves every ten minutes.” · רציף שתיים. יוצא כל עשר דקות.

### Dialogue: `ns-diner` — happy path
- **🧑 Them:** “Good evening! A table for how many people?” · ערב טוב! שולחן לכמה אנשים?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Perfect, follow me. Here are your menus. Anything to drink?” · מצוין, בואו אחריי. הנה התפריטים. משהו לשתות?
- **🫵 You:** “A bottle of water, please.” · בקבוק מים, בבקשה.
- **🧑 Them:** “Are you ready to order?” · מוכנים להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Is everything okay?” · הכל בסדר?
- **🫵 You:** “Yes, that was delicious! The bill, please.” · כן, היה טעים מאוד! החשבון, בבקשה.
- **🧑 Them:** “So glad you enjoyed it. Here you are — have a lovely evening!” · שמח שנהניתם. בבקשה — ערב נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I'll have the pasta, please.” → 🧑 “Good evening! A table for how many people?” · ערב טוב! שולחן לכמה אנשים?
- ⚠︎ less useful: 🫵 “The bill, please.” → 🧑 “Perfect, follow me. Here are your menus. Anything to drink?” · מצוין, בואו אחריי. הנה התפריטים. משהו לשתות?
- ⚠︎ less useful: 🫵 “That was delicious!” → 🧑 “Are you ready to order?” · מוכנים להזמין?
- ⚠︎ less useful: 🫵 “No onions, please.” → 🧑 “Is everything okay?” · הכל בסדר?

### Dialogue: `ns-local` — happy path
- **🧑 Them:** “Hi! Beautiful view, isn't it?” · היי! נוף יפה, נכון?
- **🫵 You:** “This place is beautiful.” · המקום הזה יפהפה.
- **🧑 Them:** “It really is. Is this your first time here?” · באמת. זו הפעם הראשונה שלך כאן?
- **🫵 You:** “Yes, it's my first time here.” · כן, זו הפעם הראשונה שלי כאן.
- **🧑 Them:** “Welcome! You should try the old town.” · ברוך הבא! כדאי לך לנסות את העיר העתיקה.
- **🫵 You:** “Can you recommend a place?” · אתה יכול להמליץ על מקום?
- **🧑 Them:** “Of course — try 'Mama Rosa', in the old town. It's very good.” · בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם.
- **🫵 You:** “Thank you! It was nice talking to you.” · תודה! היה נעים לדבר איתך.
- **🧑 Them:** “You too! Enjoy the rest of your trip!” · גם אתה! תיהנה מהמשך הטיול!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I'm from Israel.” → 🧑 “Hi! Beautiful view, isn't it?” · היי! נוף יפה, נכון?
- ⚠︎ less useful: 🫵 “I like it a lot.” → 🧑 “It really is. Is this your first time here?” · באמת. זו הפעם הראשונה שלך כאן?
- ⚠︎ less useful: 🫵 “It was nice talking to you.” → 🧑 “Welcome! You should try the old town.” · ברוך הבא! כדאי לך לנסות את העיר העתיקה.
- ⚠︎ less useful: 🫵 “How about you?” → 🧑 “Of course — try 'Mama Rosa', in the old town. It's very good.” · בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 29 — Dress Rehearsal: Full Evening · חזרה גנרלית: ערב שלם

> Phase 5 · 🎖️ Mastery

**Objective:** Taxi → restaurant → problem → payment. One take. · מונית ← מסעדה ← תקלה ← תשלום. טייק אחד.

**Confidence gain:** Chained moments feel like one flow. · רצף רגעים = זרימה אחת.

**Estimated time:** ~22 min

**Video:** `videos/{language}/{language}_29.mp4` — played automatically when the file exists

### Core phrases (you say)
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _הפתיח למסעדה. תבנית: a table for ___._
- **It's my first time here.** · זו הפעם הראשונה שלי כאן. — _פותח שיחה ומזמין המלצות._
- **Keep the change.** · תשאיר את העודף.
- **Stop here, please.** · עצור כאן, בבקשה. — _העיתוי חשוב — תגיד את זה קצת לפני היעד._
- **For two weeks.** · לשבועיים. — _התבנית: For + משך זמן. For three days / For a week._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **That was delicious!** · זה היה טעים מאוד! — _מחמאה קטנה שקונה חיוך גדול._
- **A bottle of water, please.** · בקבוק מים, בבקשה.
- **The bill, please.** · החשבון, בבקשה.
- **That's all, thanks.** · זה הכל, תודה. — _סוגר כל הזמנה בנימוס. עובד בכל מקום בעולם._
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע וברור. לא צריך להתנצל._
- **I ordered the pasta.** · הזמנתי את הפסטה.
- **No problem, thank you.** · אין בעיה, תודה.
- **Can you fix it?** · אפשר לתקן את זה?
- **By card, please.** · בכרטיס, בבקשה.
- **How much is it?** · כמה זה עולה? — _השאלה שפותחת כל עסקה. תלמד אותה עד הסוף._
- **Yes, please.** · כן, בבקשה.

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.`

### Dialogue: `dr-taxi` — happy path
- **🧑 Them:** “Good evening! Where to?” · ערב טוב! לאן?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “No problem. First time in the city?” · אין בעיה. פעם ראשונה בעיר?
- **🫵 You:** “Yes, it's my first time here.” · כן, זו הפעם הראשונה שלי כאן.
- **🧑 Them:** “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?
- **🫵 You:** “Stop here, please. Keep the change.” · עצור כאן, בבקשה. תשאיר את העודף.
- **🧑 Them:** “Thank you very much! Have a lovely evening!” · תודה רבה! ערב נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “A table for two, please.” → 🧑 “Good evening! Where to?” · ערב טוב! לאן?
- ⚠︎ less useful: 🫵 “Keep the change.” → 🧑 “No problem. First time in the city?” · אין בעיה. פעם ראשונה בעיר?
- ⚠︎ less useful: 🫵 “To this address, please.” → 🧑 “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?

### Dialogue: `dr-order` — happy path
- **🧑 Them:** “Welcome! A table for how many people?” · ברוך הבא! שולחן לכמה אנשים?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Perfect, follow me. Are you ready to order?” · מצוין, בואו אחריי. מוכנים להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Of course. Anything to drink?” · כמובן. משהו לשתות?
- **🫵 You:** “A bottle of water, please.” · בקבוק מים, בבקשה.
- **🧑 Them:** “Anything else?” · עוד משהו?
- **🫵 You:** “That's all, thanks.” · זה הכל, תודה.
- **🧑 Them:** “Coming right up!” · תכף מגיע!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “For two weeks.” → 🧑 “Welcome! A table for how many people?” · ברוך הבא! שולחן לכמה אנשים?
- ⚠︎ less useful: 🫵 “That was delicious!” → 🧑 “Perfect, follow me. Are you ready to order?” · מצוין, בואו אחריי. מוכנים להזמין?
- ⚠︎ less useful: 🫵 “The bill, please.” → 🧑 “Of course. Anything to drink?” · כמובן. משהו לשתות?
- ⚠︎ less useful: 🫵 “A table for two, please.” → 🧑 “Anything else?” · עוד משהו?

### Dialogue: `dr-problem` — happy path
- **🧑 Them:** “Here's your meal — one steak!” · הנה הארוחה שלך — סטייק אחד!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- **🫵 You:** “I ordered the pasta.” · הזמנתי את הפסטה.
- **🧑 Them:** “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.
- **🫵 You:** “No problem, thank you.” · אין בעיה, תודה.
- **🧑 Them:** “Thank you for your patience. Here's your pasta.” · תודה על הסבלנות. הנה הפסטה שלך.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “That was delicious!” → 🧑 “Here's your meal — one steak!” · הנה הארוחה שלך — סטייק אחד!
- ⚠︎ less useful: 🫵 “I'll have the pasta, please.” → 🧑 “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- ⚠︎ less useful: 🫵 “Can you fix it?” → 🧑 “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.

### Dialogue: `dr-pay` — happy path
- **🧑 Them:** “Is everything okay?” · הכל בסדר?
- **🫵 You:** “Yes, that was delicious! The bill, please.” · כן, היה טעים מאוד! החשבון, בבקשה.
- **🧑 Them:** “Here's your bill. That's twenty euros. Cash or card?” · הנה החשבון. זה עשרים יורו. מזומן או כרטיס?
- **🫵 You:** “By card, please.” · בכרטיס, בבקשה.
- **🧑 Them:** “Insert your card here… all done. Would you like the receipt?” · הכנס את הכרטיס כאן… הכל מוכן. רוצה קבלה?
- **🫵 You:** “Yes, please.” · כן, בבקשה.
- **🧑 Them:** “Here you go. Have a lovely evening!” · בבקשה. ערב נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “A bottle of water, please.” → 🧑 “Is everything okay?” · הכל בסדר?
- ⚠︎ less useful: 🫵 “How much is it?” → 🧑 “Here's your bill. That's twenty euros. Cash or card?” · הנה החשבון. זה עשרים יורו. מזומן או כרטיס?
- ⚠︎ less useful: 🫵 “Keep the change.” → 🧑 “Insert your card here… all done. Would you like the receipt?” · הכנס את הכרטיס כאן… הכל מוכן. רוצה קבלה?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 30 — A Complete Day Abroad Alone · יום שלם לבד בחו״ל

> Phase 5 · 🎖️ Mastery · 🏁 CHECKPOINT

**Objective:** Morning to night: what I need, a taxi, a meal that goes wrong, a chat with a traveler, and a moment I did not catch. · מבוקר עד לילה: מה שאני צריך, מונית, ארוחה שמשתבשת, שיחה עם מטייל, ורגע שלא הבנתי.

**Confidence gain:** Independence — proven. · עצמאות — מוכחת.

**Estimated time:** ~25 min

**Video:** `videos/{language}/{language}_30.mp4` — played automatically when the file exists

### Core phrases (you say)
- **Yes, I have my key.** · כן, יש לי את המפתח.
- **I have a reservation.** · יש לי הזמנה. — _הפתיח לדלפק המלון. תבנית: I have a ___._
- **Do you have a map?** · יש לך מפה? — _Do you have ___? — עובד בכל חנות, מלון ומסעדה._
- **Yes, I know.** · כן, אני יודע.
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **One ticket to the centre, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **For two weeks.** · לשבועיים. — _התבנית: For + משך זמן. For three days / For a week._
- **At a hotel in the city centre.** · במלון במרכז העיר. — _התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק._
- **How much to the centre?** · כמה עד המרכז? — _לשאול מחיר לפני שנוסעים — חוסך הפתעות._
- **Stop here, please.** · עצור כאן, בבקשה. — _העיתוי חשוב — תגיד את זה קצת לפני היעד._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _הפתיח למסעדה. תבנית: a table for ___._
- **The bill, please.** · החשבון, בבקשה.
- **I'll have the chicken.** · אני אקח את העוף. — _תבנית ההזמנה: I’ll have the ___._
- **That was delicious!** · זה היה טעים מאוד! — _מחמאה קטנה שקונה חיוך גדול._
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע וברור. לא צריך להתנצל._
- **No onions, please.** · בלי בצל, בבקשה. — _תבנית: No ___, please — לכל מה שאתה לא רוצה בצלחת._
- **I ordered the pasta.** · הזמנתי את הפסטה.
- **No problem, thank you.** · אין בעיה, תודה.
- **I was charged twice.** · חייבו אותי פעמיים.
- **A bottle of water, please.** · בקבוק מים, בבקשה.
- **I'm from Israel.** · אני מישראל. — _התבנית: I’m from ___ — התשובה ל-Where are you from._
- **It's my first time here.** · זו הפעם הראשונה שלי כאן. — _פותח שיחה ומזמין המלצות._
- **I went to the old town.** · הלכתי לעיר העתיקה. — _I went to ___ — התשובה ל"איפה היית?"_
- **I'm going to Vietnam.** · אני נוסע לווייטנאם. — _I’m going to ___ — מדינה, עיר, או המקום הבא._
- **Yes, it was great!** · כן, היה מעולה!
- **I stayed in a hostel.** · ישנתי בהוסטל. — _I stayed in ___ — hostel, hotel, apartment._
- **I'll be there for two weeks.** · אני אהיה שם שבועיים.
- **After that I'm going to Thailand.** · אחרי זה אני נוסע לתאילנד.
- **I don't think so.** · לא נראה לי.
- **I don't like it.** · זה לא מוצא חן בעיניי.
- **Where are you going next?** · לאן אתה נוסע אחרי זה?
- **Of course!** · ברור!
- **Is breakfast included?** · ארוחת הבוקר כלולה?
- **It was good.** · היה טוב.
- **Tomorrow morning I'm going to the airport.** · מחר בבוקר אני נוסע לשדה התעופה.

### Recovery tools reused
`Thank you!` · `Please speak slowly.` · `Can you repeat that?`

### Dialogue: `fin-morning` — happy path
- **🧑 Them:** “Good morning! Do you have your key?” · בוקר טוב! יש לך את המפתח?
- **🫵 You:** “Yes, I have my key.” · כן, יש לי את המפתח.
- **🧑 Them:** “Good. Do you need anything?” · יופי. אתה צריך משהו?
- **🫵 You:** “Do you have a map?” · יש לך מפה?
- **🧑 Them:** “Here you go. Have a great day!” · בבקשה. שיהיה יום מעולה!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “I have a reservation.” → 🧑 “Good morning! Do you have your key?” · בוקר טוב! יש לך את המפתח?
- ⚠︎ less useful: 🫵 “Yes, I know.” → 🧑 “Good. Do you need anything?” · יופי. אתה צריך משהו?

### Dialogue: `fin-taxi` — happy path
- **🧑 Them:** “Hello! Where to?” · שלום! לאן?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “How long are you here for?” · לכמה זמן אתה כאן?
- **🫵 You:** “For two weeks.” · לשבועיים.
- **🧑 Them:** “It's about fifteen euros. There's a lot of traffic right now.” · זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.
- **🫵 You:** “Okay, thank you.” · בסדר, תודה.
- **🧑 Them:** “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?
- **🫵 You:** “Stop here, please. Keep the change.” · עצור כאן, בבקשה. תשאיר את העודף.
- **🧑 Them:** “Thank you very much! Enjoy your day!” · תודה רבה! שיהיה יום נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “One ticket to the centre, please.” → 🧑 “Hello! Where to?” · שלום! לאן?
- ⚠︎ less useful: 🫵 “At a hotel in the city centre.” → 🧑 “How long are you here for?” · לכמה זמן אתה כאן?
- ⚠︎ less useful: 🫵 “How much to the centre?” → 🧑 “It's about fifteen euros. There's a lot of traffic right now.” · זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.
- ⚠︎ less useful: 🫵 “To this address, please.” → 🧑 “…We are almost there. Is here okay?” · …כמעט הגענו. כאן זה בסדר?

### Dialogue: `fin-lunch` — happy path
- **🧑 Them:** “Hello! Do you have a reservation?” · שלום! יש לכם הזמנה?
- **🫵 You:** “No — a table for two, please.” · לא — שולחן לשניים, בבקשה.
- **🧑 Them:** “Are you ready to order?” · מוכנים להזמין?
- **🫵 You:** “I'll have the chicken, without onions, please.” · אני אקח את העוף, בלי בצל, בבקשה.
- **🧑 Them:** “Here's your chicken — with onions!” · הנה העוף שלך — עם בצל!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- **🫵 You:** “The chicken. No onions, please.” · את העוף. בלי בצל, בבקשה.
- **🧑 Them:** “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.
- **🫵 You:** “No problem, thank you.” · אין בעיה, תודה.
- **🧑 Them:** “Is everything okay?” · הכל בסדר?
- **🫵 You:** “Yes, that was delicious! The bill, please.” · כן, היה טעים מאוד! החשבון, בבקשה.
- **🧑 Them:** “So glad you enjoyed it. Here you are. Thank you!” · שמח שנהניתם. בבקשה. תודה!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “The bill, please.” → 🧑 “Hello! Do you have a reservation?” · שלום! יש לכם הזמנה?
- ⚠︎ less useful: 🫵 “That was delicious!” → 🧑 “Are you ready to order?” · מוכנים להזמין?
- ⚠︎ less useful: 🫵 “That was delicious!” → 🧑 “Here's your chicken — with onions!” · הנה העוף שלך — עם בצל!
- ⚠︎ less useful: 🫵 “I ordered the pasta.” → 🧑 “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- ⚠︎ less useful: 🫵 “I was charged twice.” → 🧑 “Of course — I'll bring the right one right away.” · כמובן — אביא את הנכון מיד.
- ⚠︎ less useful: 🫵 “A bottle of water, please.” → 🧑 “Is everything okay?” · הכל בסדר?

### Dialogue: `fin-chat` — happy path
- **🧑 Them:** “Hi! I'm from here. And you?” · היי! אני מכאן. ואתה?
- **🫵 You:** “I'm from Israel.” · אני מישראל.
- **🧑 Them:** “Nice! What did you do today?” · יפה! מה עשית היום?
- **🫵 You:** “I went to the old town.” · הלכתי לעיר העתיקה.
- **🧑 Them:** “Did you like it?” · אהבת?
- **🫵 You:** “Yes, it was great!” · כן, היה מעולה!
- **🧑 Them:** “So, where are you going next?” · אז לאן אתה נוסע אחרי זה?
- **🫵 You:** “I'm going to Vietnam.” · אני נוסע לווייטנאם.
- **🧑 Them:** “Wow! How long will you be there?” · וואו! כמה זמן תהיה שם?
- **🫵 You:** “I'll be there for two weeks.” · אני אהיה שם שבועיים.
- **🧑 Them:** “Really? I think Vietnam is too far.” · באמת? אני חושב שווייטנאם רחוקה מדי.
- **🫵 You:** “I don't think so.” · לא נראה לי.
- **🧑 Them:** “Ha! That's true.” · חה! זה נכון.
- **🫵 You:** “And you? Where are you going next?” · ואתה? לאן אתה נוסע אחרי זה?
- **🧑 Them:** “Me? I'm going home. Have a great trip!” · אני? אני חוזר הביתה. נסיעה טובה!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “It's my first time here.” → 🧑 “Hi! I'm from here. And you?” · היי! אני מכאן. ואתה?
- ⚠︎ less useful: 🫵 “I'm going to Vietnam.” → 🧑 “Nice! What did you do today?” · יפה! מה עשית היום?
- ⚠︎ less useful: 🫵 “I stayed in a hostel.” → 🧑 “Did you like it?” · אהבת?
- ⚠︎ less useful: 🫵 “I went to the old town.” → 🧑 “So, where are you going next?” · אז לאן אתה נוסע אחרי זה?
- ⚠︎ less useful: 🫵 “After that I'm going to Thailand.” → 🧑 “Wow! How long will you be there?” · וואו! כמה זמן תהיה שם?
- ⚠︎ less useful: 🫵 “I don't like it.” → 🧑 “Really? I think Vietnam is too far.” · באמת? אני חושב שווייטנאם רחוקה מדי.
- ⚠︎ less useful: 🫵 “Of course!” → 🧑 “Ha! That's true.” · חה! זה נכון.

### Dialogue: `fin-evening` — happy path
- **🧑 Them:** “Good evening! Is everything okay with your room? And breakfast tomorrow — is seven okay for you?” · ערב טוב! הכל בסדר עם החדר? וארוחת הבוקר מחר — שבע מתאים לך?
- **🫵 You:** “Yes, thank you.” · כן, תודה.
- **🧑 Them:** “Perfect. And how was your day?” · מצוין. ואיך היה היום שלך?
- **🫵 You:** “It was good.” · היה טוב.
- **🧑 Them:** “So glad! Good night.” · שמח לשמוע! לילה טוב.
- **🫵 You:** “Thank you. Good night!” · תודה. לילה טוב!
- **🧑 Them:** “See you tomorrow!” · נתראה מחר!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Is breakfast included?” → 🧑 “Good evening! Is everything okay with your room? And breakfast tomorrow — is seven okay for you?” · ערב טוב! הכל בסדר עם החדר? וארוחת הבוקר מחר — שבע מתאים לך?
- ⚠︎ less useful: 🫵 “Tomorrow morning I'm going to the airport.” → 🧑 “Perfect. And how was your day?” · מצוין. ואיך היה היום שלך?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---
