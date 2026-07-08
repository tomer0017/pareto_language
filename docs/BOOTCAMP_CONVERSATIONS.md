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

## Mission 1 — I Can Survive · אני יכול לשרוד.

> Phase 1 · 🛟 Foundations

**Objective:** The 7 survival tools — you can never be stuck again. · שבעת כלי ההישרדות — אי אפשר יותר להיתקע.

**Confidence gain:** The fear of freezing dies first. · הפחד מלקפוא מת ראשון.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Recovery tools reused
`Sorry, I don't understand.` · `Can you repeat that?` · `Please speak slowly.` · `Can you show me?` · `One moment, please.` · `Thank you!` · `Sorry!`

### Cold open (ambush)
- 🧑 (fast) “Would you like the receipt with that or is email okay for you?” · רוצה קבלה מודפסת או שאימייל בסדר?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Thank you!

### Dialogue: `stuck-traveler` — happy path
- **🧑 Them:** “Hi there! What can I get you today — we've got a special on the flat white!” · היי! מה להביא לך היום — יש מבצע על flat white (אספרסו עם חלב מוקצף)!
- **🫵 You:** “Sorry, I don't understand.” · סליחה, אני לא מבין.
- **🧑 Them:** “No problem! Coffee? Tea?” · אין בעיה! קפה? תה?
- **🫵 You:** “One moment, please.” · רגע אחד, בבקשה.
- **🧑 Them:** “Sure, take your time.” · בטח, קח את הזמן.
- **🫵 You:** “Coffee, please.” · קפה, בבקשה.
- **🧑 Them:** “Here you go!” · בבקשה, הנה!
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Enjoy!” · תהנה!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Goodbye!” — coach: _לצאת עכשיו זה לוותר על הקפה. כלי הישרדות היה משאיר אותך בפנים — בלי לחץ._ → 🧑 “Oh — wait, don't go! I can help. Coffee?” · רגע — אל תלך! אני אעזור. קפה?
- ⚠︎ less useful: 🫵 “My name is Dan.” — coach: _הצגת את עצמך — אבל הוא שאל מה תרצה. פה כלי הישרדות עוזר לך יותר._ → 🧑 “Ha! Nice to meet you, Dan. So… coffee, or tea?” · נעים מאוד, דן! אז… קפה או תה?
- ⚠︎ less useful: 🫵 “Please speak slowly.” — coach: _"דבר לאט" הוא כלי מעולה — אבל הוא רק אמר "בבקשה, הנה". פה תודה מתאימה יותר._ → 🧑 “Ha — I only said: HERE — YOU — GO!” · הא — רק אמרתי: בבקשה, הנה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 2 — Introduce Myself · להציג את עצמי

> Phase 1 · 🛟 Foundations

**Objective:** Name, origin, purpose — with confidence and a smile. · שם, מאיפה, למה — בביטחון ובחיוך.

**Confidence gain:** First human connection. · חיבור אנושי ראשון.

**Estimated time:** ~20 min

**Video:** `/videos/En_day2.mp4`

### Core phrases (you say)
- **My name is Dan.** · קוראים לי דן. — _התבנית: My name is ___ — פשוט תחליף את השם._
- **Nice to meet you!** · נעים להכיר! — _התשובה החמה לכל היכרות. תמיד עובד._
- **I'm from Israel.** · אני מישראל. — _התבנית: I’m from ___ — התשובה ל-Where are you from._
- **I'm here on holiday.** · אני כאן בחופשה. — _מטרת הביקור, בגרסה ידידותית._
- **It's my first time here.** · זו הפעם הראשונה שלי כאן. — _פותח שיחה ומזמין המלצות._

### Expected replies (you hear)
- **What's your name?** · איך קוראים לך?
- **Where are you from?** · מאיפה אתה?
- **Is this your first time here?** · זו הפעם הראשונה שלך כאן?
- **How long are you staying?** · לכמה זמן אתה כאן?
- **Enjoy your stay!** · תיהנה מהשהות!

_Reply-training drill:_ “Where are you from?” · “Is this your first time here?” · “How long are you staying?” · “Enjoy your stay!”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “So what brings you all the way out here anyway?” · אז מה בכלל הביא אותך עד לכאן?
  - ✅ best move: **I'm here on holiday.** · אני כאן בחופשה.
  - ✗ distractor: My name is Dan.

### Dialogue: `meeting-host` — happy path
- **🧑 Them:** “Hi! Welcome. What's your name?” · היי! ברוך הבא. איך קוראים לך?
- **🫵 You:** “My name is Dan.” · קוראים לי דן.
- **🧑 Them:** “Nice to meet you, Dan! Where are you from?” · נעים להכיר, דן! מאיפה אתה?
- **🫵 You:** “I'm from Israel.” · אני מישראל.
- **🧑 Them:** “Israel, wonderful! Is this your first time here?” · ישראל, נהדר! זו הפעם הראשונה שלך כאן?
- **🫵 You:** “Yes, it's my first time here.” · כן, זו הפעם הראשונה שלי כאן.
- **🧑 Them:** “Well, enjoy your stay! Let me know if you need anything.” · אז תיהנה מהשהות! תגיד לי אם אתה צריך משהו.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Nice to meet you!” → 🧑 “Likewise! And where are you from?” · גם לי! ומאיפה אתה?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 3 — Numbers & Money · כסף ומספרים

> Phase 1 · 🛟 Foundations

**Objective:** Numbers by ear, prices, change — no more blind nodding. · מספרים בשמיעה, מחירים, עודף — בלי להנהן סתם.

**Confidence gain:** Money makes sense. Always. · הכסף מובן. תמיד.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **How much is it?** · כמה זה עולה? — _השאלה שפותחת כל עסקה. תלמד אותה עד הסוף._
- **By card, please.** · בכרטיס, בבקשה.
- **In cash.** · במזומן.
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
`Please speak slowly.` · `Can you repeat that?` · `Thank you!` · `One moment, please.`

### Cold open (ambush)
- 🧑 (fast) “That comes to fifteen fifty altogether is that alright?” · זה יוצא חמש עשרה וחצי בסך הכל, זה בסדר?
  - ✅ best move: **Fifteen fifty.** · חמש עשרה וחצי (15.50).
  - ✗ distractor: That's five euros.

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

## Mission 4 — Coffee Shop · בית קפה

> Phase 1 · 🛟 Foundations

**Objective:** A complete breakfast order: drink, food, payment, receipt — end to end. · הזמנת בוקר שלמה: שתייה, אוכל, תשלום, קבלה — מקצה לקצה.

**Confidence gain:** First full transaction incl. every follow-up question. · העסקה המלאה הראשונה, כולל כל שאלות ההמשך.

**Estimated time:** ~22 min

**Video:** — (none yet)

### Core phrases (you say)
- **I'd like an iced coffee, please.** · אני רוצה קפה קר, בבקשה. — _התבנית: I’d like ___, please — עובדת על הכל._
- **To go, please.** · לקחת, בבקשה.
- **Milk, no sugar.** · עם חלב, בלי סוכר. — _עם = with · בלי = no/without. שתי מילים ששולטות בכל הזמנה._
- **A croissant, please.** · קרואסון, בבקשה. — _“Croissant” — מאפה חמאה צרפתי. כך בדיוק זה כתוב בתפריט בחו״ל._
- **That's all, thanks.** · זה הכל, תודה. — _סוגר כל הזמנה בנימוס. עובד בכל מקום בעולם._
- **Card, please.** · בכרטיס, בבקשה.

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
`Can you repeat that?` · `Please speak slowly.` · `One moment, please.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Sorry we are out of croissants would a muffin be okay instead?” · סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?
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

## Mission 5 — Restaurant Basics · מסעדה — בסיס

> Phase 1 · 🛟 Foundations

**Objective:** Ear day: everything learned so far at full speed, no slow button. · יום אוזניים: כל מה שנלמד — במהירות מלאה, בלי כפתור האטה.

**Confidence gain:** Native speed starts sounding like words. · מהירות טבעית מתחילה להישמע כמו מילים.

**Estimated time:** ~18 min

**Video:** — (none yet)

### Core phrases (you say)
- **A table for two, please.** · שולחן לשניים, בבקשה. — _הפתיח למסעדה. תבנית: a table for ___._
- **The menu, please.** · התפריט, בבקשה.
- **I'll have the chicken.** · אני אקח את העוף. — _תבנית ההזמנה: I’ll have the ___._
- **A bottle of water, please.** · בקבוק מים, בבקשה.
- **No onions, please.** · בלי בצל, בבקשה. — _תבנית: No ___, please — לכל מה שאתה לא רוצה בצלחת._
- **The bill, please.** · החשבון, בבקשה.
- **That was delicious!** · זה היה טעים מאוד! — _מחמאה קטנה שקונה חיוך גדול._

### Expected replies (you hear)
- **Do you have a reservation?** · יש לכם הזמנה?
- **Follow me, please.** · בואו אחריי, בבקשה.
- **Are you ready to order?** · מוכנים להזמין?
- **Anything to drink?** · משהו לשתות?
- **How was everything?** · איך היה הכל?
- **Would you like dessert?** · רוצים קינוח?

_Reply-training drill:_ “Anything to drink?” · “Are you ready to order?” · “How was everything?” · “Would you like dessert?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!` · `One moment, please.` · `Sorry, I don't understand.`

### Cold open (ambush)
- 🧑 (fast) “Would you like to see the dessert menu before I bring the check?” · רוצים לראות את תפריט הקינוחים לפני שאני מביא את החשבון?
  - ✅ best move: **Would you like dessert?** · רוצים קינוח?
  - ✗ distractor: Do you have a reservation?

### Dialogue: `sit-down-meal` — happy path
- **🧑 Them:** “Good evening! Do you have a reservation?” · ערב טוב! יש לכם הזמנה?
- **🫵 You:** “No — a table for two, please.” · לא — שולחן לשניים, בבקשה.
- **🧑 Them:** “Perfect, follow me. Here are your menus.” · מצוין, בואו אחריי. הנה התפריטים.
- **🧑 Them:** “Are you ready to order?” · מוכנים להזמין?
- **🫵 You:** “I'll have the chicken.” · אני אקח את העוף.
- **🧑 Them:** “Excellent choice. Anything to drink?” · בחירה מצוינת. משהו לשתות?
- **🫵 You:** “A bottle of water, please.” · בקבוק מים, בבקשה.
- **🧑 Them:** “Great — and would you like anything else with that?” · מצוין — ורוצים עוד משהו עם זה?
- **🫵 You:** “No onions, please.” · בלי בצל, בבקשה.
- **🧑 Them:** “Coming right up!” · מגיע עוד רגע!
- **🧑 Them:** “…Later… How was everything?” · …אחר כך… איך היה הכל?
- **🫵 You:** “That was delicious! The bill, please.” · זה היה טעים מאוד! החשבון, בבקשה.
- **🧑 Them:** “So glad you enjoyed it. Here you are — have a lovely evening!” · שמח שנהניתם. בבקשה — ערב נעים!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 6 — Directions · כיוונים

> Phase 1 · 🛟 Foundations

**Objective:** Ask — and truly understand the answer, landmarks included. · לשאול — ובעיקר להבין את התשובה, כולל ציוני דרך.

**Confidence gain:** Being lost stops being scary. · ללכת לאיבוד מפסיק להפחיד.

**Estimated time:** ~20 min

**Video:** — (none yet)

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
`Can you repeat that?` · `Please speak slowly.` · `Can you show me?` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Go past the church take the second right and it is just opposite the pharmacy.” · תעבור את הכנסייה, פנה ימינה בשנייה, וזה ממש מול בית המרקחת.
  - ✅ best move: **It's on the right.** · זה בצד ימין.
  - ✗ distractor: It's on the left.

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

## Mission 7 — Taxi / Uber · מונית

> Phase 2 · 🛬 Arrival

**Objective:** Destination, price, stop — incl. the address-show move. · יעד, מחיר, עצירה — כולל מהלך הצגת הכתובת.

**Confidence gain:** Every city is reachable. · כל עיר נגישה.

**Estimated time:** ~20 min

**Video:** — (none yet)

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

### Cold open (ambush)
- 🧑 (fast) “Sorry the road ahead is closed is it alright if I drop you around the corner?” · סליחה, הכביש קדימה חסום — בסדר שאוריד אותך מעבר לפינה?
  - ✅ best move: **Is here okay?** · כאן זה בסדר?
  - ✗ distractor: Where to?

### Dialogue: `taxi-ride` — happy path
- **🧑 Them:** “Hello! Where to?” · שלום! לאן?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “Got it. How much did you expect to pay?” · הבנתי. כמה חשבת לשלם?
- **🫵 You:** “How much to the centre?” · כמה עד המרכז?
- **🧑 Them:** “It's about fifteen euros — there's a lot of traffic right now.” · זה בערך חמישה עשר יורו — יש הרבה פקקים עכשיו.
- **🫵 You:** “Please speak slowly.” · דבר לאט, בבקשה.
- **🧑 Them:** “Fifteen — euros. Traffic.” · חמישה עשר — יורו. פקקים.
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

**Objective:** Reservation → name → key → floor → breakfast. · הזמנה → שם → מפתח → קומה → ארוחת בוקר.

**Confidence gain:** Home base secured. · בסיס הבית מובטח.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **I have a reservation.** · יש לי הזמנה. — _הפתיח לדלפק המלון. תבנית: I have a ___._
- **Under the name Cohen.** · על השם כהן.
- **For two nights.** · לשני לילות. — _תבנית: for ___ nights — משך השהות._
- **Is breakfast included?** · ארוחת הבוקר כלולה?
- **What's the wifi password?** · מה סיסמת הוויי-פיי?

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
  - ✗ distractor: Your passport, please.

### Dialogue: `hotel-checkin` — happy path
- **🧑 Them:** “Good evening! How can I help you?” · ערב טוב! איך אפשר לעזור?
- **🫵 You:** “I have a reservation, under the name Cohen.” · יש לי הזמנה, על השם כהן.
- **🧑 Them:** “Welcome, Mr. Cohen. Your passport, please.” · ברוך הבא, מר כהן. הדרכון שלך, בבקשה.
- **🫵 You:** “Here you go.” · בבקשה, הנה.
- **🧑 Them:** “Thank you. You're in room two-oh-four, on the second floor. Is breakfast included in your booking?” · תודה. אתה בחדר 204, בקומה השנייה. ארוחת בוקר כלולה בהזמנה שלך?
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

**Video:** — (none yet)

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
  - ✗ distractor: What size are you?

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

## Mission 10 — Arrival Day Checkpoint · נקודת ביקורת: יום הגעה

> Phase 2 · 🛬 Arrival · 🏁 CHECKPOINT

**Objective:** Cold chain: taxi → hotel. Unannounced, minimal subtitles. · שרשור קר: מונית → מלון. בלי הכנה, בלי כתוביות מלאות.

**Confidence gain:** Proof: a full arrival day, survivable. · הוכחה: יום הגעה שלם — שריד.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **Stop here, please.** · עצור כאן, בבקשה. — _העיתוי חשוב — תגיד את זה קצת לפני היעד._
- **I have a reservation.** · יש לי הזמנה. — _הפתיח לדלפק המלון. תבנית: I have a ___._
- **Is breakfast included?** · ארוחת הבוקר כלולה?

### Expected replies (you hear)
- **It's about fifteen euros.** · זה בערך חמישה עשר יורו.
- **Is here okay?** · כאן זה בסדר?
- **Your passport, please.** · הדרכון שלך, בבקשה.
- **It's on the second floor.** · זה בקומה השנייה.
- **Breakfast is from seven to ten.** · ארוחת בוקר משבע עד עשר.

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Is here alright or would you prefer the main entrance just up ahead?” · כאן בסדר או שאתה מעדיף את הכניסה הראשית קצת קדימה?
  - ✅ best move: **Is here okay?** · כאן זה בסדר?
  - ✗ distractor: It's about fifteen euros.
- 🧑 (fast) “Just so you have it breakfast is downstairs from seven and the wifi code is on your key card.” · רק שיהיה לך — ארוחת בוקר למטה משבע, וקוד הוויי-פיי על כרטיס המפתח.
  - ✅ best move: **Breakfast is from seven to ten.** · ארוחת בוקר משבע עד עשר.
  - ✗ distractor: Your passport, please.

### Dialogue: `cold-taxi` — happy path
- **🧑 Them:** “Evening! Where can I take you?” · ערב! לאן לקחת אותך?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “Sure — it'll be about fifteen euros with the traffic.” · בטח — זה יהיה בערך חמישה עשר יורו עם הפקקים.
- **🫵 You:** “Okay, thank you.” · בסדר, תודה.
- **🧑 Them:** “Here we are. Have a great night!” · הגענו. לילה נהדר!

### Dialogue: `cold-hotel` — happy path
- **🧑 Them:** “Welcome! Checking in tonight?” · ברוך הבא! עושה צ'ק-אין הערב?
- **🫵 You:** “I have a reservation.” · יש לי הזמנה.
- **🧑 Them:** “Great — room two-oh-four, second floor, breakfast is seven to ten.” · מצוין — חדר 204, קומה שנייה, ארוחת בוקר משבע עד עשר.
- **🫵 You:** “Is breakfast included?” · ארוחת הבוקר כלולה?
- **🧑 Them:** “Enjoy your stay!” · תיהנה מהשהות!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 11 — Airport & Border · שדה תעופה וגבול

> Phase 2 · 🛬 Arrival

**Objective:** Counter, gate, and the border questions — calm. · דלפק, שער, ושאלות הגבול — רגוע.

**Confidence gain:** Authority stops being frightening. · סמכות מפסיקה להפחיד.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **Here is my passport.** · הנה הדרכון שלי. — _מגישים ואומרים. שלוש מילים שפותחות כל גבול._
- **I'm here on holiday.** · אני כאן בחופשה. — _התשובה ל-"מטרת הביקור?". ידידותית ובטוחה._
- **For two weeks.** · לשבועיים. — _התבנית: For + משך זמן. For three days / For a week._
- **At a hotel in the city center.** · במלון במרכז העיר. — _התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק._
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

### Cold open (ambush)
- 🧑 (fast) “And do you have a return ticket booked for your flight home at all?” · ויש לך בכלל כרטיס חזור מוזמן לטיסה הביתה?
  - ✅ best move: **One moment, please.** · רגע אחד, בבקשה.
  - ✗ distractor: For two weeks.

### Dialogue: `border-control` — happy path
- **🧑 Them:** “Next, please. Passport?” · הבא בתור, בבקשה. דרכון?
- **🫵 You:** “Here is my passport.” · הנה הדרכון שלי.
- **🧑 Them:** “Thank you. What's the purpose of your visit?” · תודה. מה מטרת הביקור?
- **🫵 You:** “I'm here on holiday.” · אני כאן בחופשה.
- **🧑 Them:** “Lovely. How long are you staying?” · נהדר. לכמה זמן אתה נשאר?
- **🫵 You:** “For two weeks.” · לשבועיים.
- **🧑 Them:** “And where are you staying?” · ואיפה אתה מתאכסן?
- **🫵 You:** “At a hotel in the city center.” · במלון במרכז העיר.
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

## Mission 12 — Hotel Requests & Problems · בקשות ובעיות במלון

> Phase 2 · 🛬 Arrival

**Objective:** Towels, AC, wifi, noisy room — ask and receive. · מגבות, מזגן, וויי-פיי, חדר רועש — לבקש ולקבל.

**Confidence gain:** I don't suffer quietly; I ask. · אני לא סובל בשקט; אני מבקש.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **Could I get some more towels?** · אפשר לקבל עוד מגבות? — _התבנית: Could I get ___? — הדרך המנומסת לבקש כל דבר._
- **What's the wifi password?** · מה הסיסמה של הוויי-פיי? — _הבקשה הכי שימושית של המאה. שווה לדעת בעל פה._
- **The air conditioning isn't working.** · המזגן לא עובד. — _התבנית: The ___ isn’t working. עובדת על כל דבר שהתקלקל._
- **My room is very noisy.** · החדר שלי מאוד רועש. — _לתאר בעיה זה לא להתלונן. זה לתת להם לתקן._
- **Could you help me with something?** · אפשר עזרה במשהו? — _פותח כל בקשה בנימוס. אף אחד לא מסרב לזה._

### Expected replies (you hear)
- **How can I help you?** · איך אפשר לעזור לך?
- **I'll send someone right away.** · אשלח מישהו מיד.
- **I'm so sorry about that.** · אני מצטער על זה מאוד.
- **The password is on your key card.** · הסיסמה על כרטיס המפתח.
- **Would you like to change rooms?** · תרצה להחליף חדר?
- **Anything else I can do?** · עוד משהו שאוכל לעשות?

_Reply-training drill:_ “I'll send someone right away.” · “I'm so sorry about that.” · “Would you like to change rooms?” · “Anything else I can do?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “By the way there's been a small mix-up with your booking — could you come down to the desk?” · אגב, הייתה אי-הבנה קטנה עם ההזמנה שלך — אפשר שתרד לקבלה?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: What's the wifi password?

### Dialogue: `hotel-desk` — happy path
- **🧑 Them:** “Good evening! How can I help you?” · ערב טוב! איך אפשר לעזור?
- **🫵 You:** “Could I get some more towels?” · אפשר לקבל עוד מגבות?
- **🧑 Them:** “Of course, I'll send some up right away. Anything else?” · בטח, אשלח מיד. עוד משהו?
- **🫵 You:** “What's the wifi password?” · מה הסיסמה של הוויי-פיי?
- **🧑 Them:** “The password is on your key card. Anything else?” · הסיסמה על כרטיס המפתח. עוד משהו?
- **🫵 You:** “The air conditioning isn't working.” · המזגן לא עובד.
- **🧑 Them:** “Oh, I'm so sorry about that. I'll have it fixed today. Is the room comfortable otherwise?” · אוי, אני מצטער מאוד. אדאג שיתקנו היום. החדר נוח חוץ מזה?
- **🫵 You:** “My room is very noisy.” · החדר שלי מאוד רועש.
- **🧑 Them:** “I understand. Would you like to change to a quieter room?” · אני מבין. תרצה לעבור לחדר שקט יותר?
- **🫵 You:** “Yes, thank you!” · כן, תודה!
- **🧑 Them:** “All sorted — room 305, and someone's on the way up. Have a lovely night!” · הכל מסודר — חדר 305, ומישהו כבר בדרך. לילה נעים!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Thank you!” → 🧑 “You're welcome! Is the room itself okay?” · בבקשה! והחדר עצמו בסדר?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 13 — Restaurant Basics · מסעדה — בסיס

> Phase 3 · 🍽️ Food

**Objective:** Table, menu, order, bill — the core loop. · שולחן, תפריט, הזמנה, חשבון — הליבה.

**Confidence gain:** The heart of travel — in my hands. · לב הטיול — בידיים שלי.

**Estimated time:** ~22 min

**Video:** — (none yet)

### Core phrases (you say)
- **A table for two, please.** · שולחן לשניים, בבקשה. — _התבנית: A table for ___ — פשוט מספר. for one / for four._
- **Could we see the menu?** · אפשר לראות את התפריט?
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **What do you recommend?** · מה אתה ממליץ? — _אם התפריט מבלבל — תן למלצר להחליט. תמיד עובד._
- **A bottle of water, please.** · בקבוק מים, בבקשה.
- **Could we have the bill, please?** · אפשר את החשבון, בבקשה? — _המשפט שסוגר כל ארוחה. באנגליה: bill · באמריקה: check._

### Expected replies (you hear)
- **How many people?** · כמה אנשים?
- **Something to drink?** · משהו לשתות?
- **Are you ready to order?** · מוכנים להזמין?
- **Anything else?** · עוד משהו?
- **Is everything okay?** · הכל בסדר?
- **Enjoy your meal!** · בתיאבון!

_Reply-training drill:_ “Something to drink?” · “Are you ready to order?” · “Anything else?” · “Is everything okay?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `One moment, please.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “And how would you like that cooked — rare, medium, or well done?” · ואיך תרצה שיהיה מבושל — נא, בינוני, או עשוי היטב?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Could we have the bill, please?

### Dialogue: `restaurant-dinner` — happy path
- **🧑 Them:** “Good evening, welcome! How many people?” · ערב טוב, ברוכים הבאים! כמה אנשים?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Perfect, right this way. Here are your menus. Something to drink?” · מצוין, בבקשה אחריי. הנה התפריטים. משהו לשתות?
- **🫵 You:** “A bottle of water, please.” · בקבוק מים, בבקשה.
- **🧑 Them:** “Great. I'll give you a minute… Are you ready to order?” · יופי. אתן לכם רגע… מוכנים להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Excellent choice. Anything else?” · בחירה מצוינת. עוד משהו?
- **🫵 You:** “That's all, thanks.” · זה הכל, תודה.
- **🧑 Them:** “Here you are. Enjoy your meal!… Is everything okay?” · בבקשה. בתיאבון!… הכל בסדר?
- **🫵 You:** “Yes, thank you!” · כן, תודה!
- **🧑 Them:** “Wonderful. Let me know when you need anything.” · נהדר. תגידו לי כשתצטרכו משהו.
- **🫵 You:** “Could we have the bill, please?” · אפשר את החשבון, בבקשה?
- **🧑 Them:** “Here's the bill. Thank you, and have a lovely evening!” · הנה החשבון. תודה, וערב נפלא!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Could we see the menu?” → 🧑 “The menus are right there in front of you — anything to drink first?” · התפריטים ממש מולך — משהו לשתות קודם?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 14 — Special Requests & Allergies · בקשות מיוחדות ואלרגיות

> Phase 3 · 🍽️ Food

**Objective:** No onions, allergic to nuts, vegetarian — clear and safe. · בלי בצל, אלרגי לאגוזים, צמחוני — ברור ובטוח.

**Confidence gain:** Food is safe for me too. · האוכל בטוח גם בשבילי.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **I'm allergic to nuts.** · אני אלרגי לאגוזים. — _התבנית שמצילה: I’m allergic to ___. אומרים ברור, פעם אחת, בלי היסוס._
- **Without onions, please.** · בלי בצל, בבקשה. — _התבנית: Without ___ — מסירה כל מרכיב שלא בא לך._
- **I'm vegetarian.** · אני צמחוני. — _שתי מילים שחוסכות עשר שאלות._
- **Does this have dairy?** · יש בזה מוצרי חלב? — _התבנית: Does this have ___? — בודקת כל מרכיב לפני שהוא מגיע אליך._
- **Is this spicy?** · זה חריף?

### Expected replies (you hear)
- **Let me check with the kitchen.** · אבדוק עם המטבח.
- **We can make it without.** · אפשר להכין בלי.
- **That one contains nuts.** · זה מכיל אגוזים.
- **No, it's not spicy.** · לא, זה לא חריף.
- **This one is a good option for you.** · זו אפשרות טובה בשבילך.
- **Anything else you're allergic to?** · עוד משהו שאתה אלרגי אליו?

_Reply-training drill:_ “Let me check with the kitchen.” · “We can make it without.” · “That one contains nuts.” · “This one is a good option for you.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Just to be safe does your nut allergy mean we should avoid the shared fryer too?” · רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: I'm vegetarian.

### Dialogue: `allergy-order` — happy path
- **🧑 Them:** “Hi there! Are you ready to order?” · היי! מוכן להזמין?
- **🫵 You:** “I'm allergic to nuts.” · אני אלרגי לאגוזים. (אומרים קודם כל — לפני ההזמנה)
- **🧑 Them:** “Thank you for telling me — that's important. Anything else you're allergic to?” · תודה שאמרת — זה חשוב. עוד משהו שאתה אלרגי אליו?
- **🫵 You:** “I'm vegetarian.” · אני צמחוני.
- **🧑 Them:** “Got it — no nuts, vegetarian. The mushroom risotto is a good option for you.” · הבנתי — בלי אגוזים, צמחוני. ריזוטו הפטריות אפשרות טובה בשבילך.
- **🫵 You:** “Does this have dairy?” · יש בזה מוצרי חלב?
- **🧑 Them:** “Good question — it has a little cream, but we can make it without.” · שאלה טובה — יש בו קצת שמנת, אבל אפשר להכין בלי.
- **🫵 You:** “Without onions, please.” · בלי בצל, בבקשה.
- **🧑 Them:** “No onions, no problem — and I'll make sure the kitchen knows about the nuts.” · בלי בצל, אין בעיה — ואוודא שהמטבח יודע על האגוזים.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Perfect. Your food will be completely safe. Enjoy!” · מושלם. האוכל שלך יהיה בטוח לגמרי. בתיאבון!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Thank you!” → 🧑 “Of course — but is there anything else I should know?” · כמובן — אבל יש עוד משהו שכדאי שאדע?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 15 — Paying Anywhere · לשלם בכל מקום

> Phase 3 · 🍽️ Food

**Objective:** Cash/card/tip/receipt — every transaction closer. · מזומן/כרטיס/טיפ/קבלה — כל סוגר עסקה אפשרי.

**Confidence gain:** The awkward payment moment disappears. · הרגע המביך של התשלום נעלם.

**Estimated time:** ~18 min

**Video:** — (none yet)

### Core phrases (you say)
- **I'll pay by card.** · אני אשלם בכרטיס. — _התבנית: I’ll pay by ___ / in ___. by card · in cash._
- **I'll pay in cash.** · אני אשלם במזומן.
- **Keep the change.** · תשמור את העודף. — _הדרך החלקה לתת טיפ במזומן. שלוש מילים, חיוך גדול._
- **Could I have a receipt?** · אפשר קבלה?
- **All together, please.** · הכל ביחד, בבקשה. — _התשובה ל-"ביחד או בנפרד?" כשמשלמים על כולם._

### Expected replies (you hear)
- **That'll be twelve fifty.** · זה יוצא שתים-עשרה וחצי.
- **Cash or card?** · מזומן או כרטיס?
- **You can tap your card.** · אפשר להצמיד את הכרטיס.
- **Would you like a receipt?** · תרצה קבלה?
- **Together or separate?** · ביחד או בנפרד?
- **Here's your change.** · הנה העודף שלך.

_Reply-training drill:_ “Cash or card?” · “You can tap your card.” · “Would you like a receipt?” · “Together or separate?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Ah sorry the card machine is down right now do you have any cash on you?” · אה, סליחה, מכונת הכרטיסים מושבתת כרגע — יש עליך מזומן?
  - ✅ best move: **I'll pay in cash.** · אני אשלם במזומן.
  - ✗ distractor: Could I have a receipt?

### Dialogue: `pay-checkout` — happy path
- **🧑 Them:** “All done? That'll be twelve fifty.” · סיימנו? זה יוצא שתים-עשרה וחצי.
- **🫵 You:** “I'll pay by card.” · אני אשלם בכרטיס.
- **🧑 Them:** “Perfect — you can tap your card right here.” · מצוין — אפשר להצמיד את הכרטיס כאן.
- **🫵 You:** “Could I have a receipt?” · אפשר קבלה?
- **🧑 Them:** “That's very kind, thank you! Anything else?” · מאוד נחמד, תודה! עוד משהו?
- **🫵 You:** “That's all, thanks.” · זה הכל, תודה.
- **🧑 Them:** “Here's your receipt. Thank you — have a great day!” · הנה הקבלה שלך. תודה — שיהיה יום מעולה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 16 — Street Food & Markets · אוכל רחוב ושווקים

> Phase 3 · 🍽️ Food

**Objective:** Order at a stall, taste, light haggling. · להזמין בדוכן, לטעום, להתמקח קלות.

**Confidence gain:** The best food is outside — and I’m there. · האוכל הכי טוב — בחוץ, ואני שם.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **One of those, please.** · אחד מאלה, בבקשה. — _לא יודע את השם? מצביע ואומר One of those. עובד בכל דוכן בעולם._
- **How much is it?** · כמה זה עולה? — _השאלה שאסור לוותר עליה בשוק. תמיד שואלים לפני._
- **Two, please.** · שניים, בבקשה.
- **That's a bit much.** · זה קצת יקר. — _פתיח עדין להתמקחות. חיוך, לא ריב._
- **I'll take it.** · אני אקח. — _סוגר את העסקה. שתי מילים, וגמרנו._

### Expected replies (you hear)
- **What would you like?** · מה תרצה?
- **How many?** · כמה?
- **Five each.** · חמישה כל אחד.
- **For you — best price, eight.** · בשבילך — מחיר הכי טוב, שמונה.
- **It's fresh today!** · טרי היום!
- **Anything else, my friend?** · עוד משהו, חבר?

_Reply-training drill:_ “How many?” · “Five each.” · “For you — best price, eight.” · “Anything else, my friend?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Can you show me?` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “You want it with the hot sauce or no spice today boss?” · רוצה את זה עם הרוטב החריף או בלי חריף היום, בוס?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: I'll take it.

### Dialogue: `market-stall` — happy path
- **🧑 Them:** “Fresh today, fresh today! What would you like?” · טרי היום, טרי היום! מה תרצה?
- **🫵 You:** “One of those, please.” · אחד מאלה, בבקשה. (מצביע!)
- **🧑 Them:** “These? Great choice — how many?” · אלה? בחירה מעולה — כמה?
- **🫵 You:** “Two, please.” · שניים, בבקשה.
- **🧑 Them:** “Two — that's ten, my friend.” · שניים — זה עשרה, חבר.
- **🫵 You:** “That's a bit much.” · זה קצת יקר. (חיוך — מתמקחים)
- **🧑 Them:** “Ha! Okay, okay — for you, eight. Best price!” · הא! טוב, טוב — בשבילך, שמונה. מחיר הכי טוב!
- **🫵 You:** “I'll take it.” · אני אקח.
- **🧑 Them:** “Good choice, my friend! Here you go — enjoy!” · בחירה טובה, חבר! הנה לך — תיהנה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 17 — Supermarket · סופרמרקט

> Phase 3 · 🍽️ Food

**Objective:** Find, weigh, pay — self-checkout included. · למצוא, לשקול, לשלם — כולל קופה אוטומטית.

**Confidence gain:** Basic groceries with zero dependence. · קניות בסיסיות בלי תלות באף אחד.

**Estimated time:** ~18 min

**Video:** — (none yet)

### Core phrases (you say)
- **Where is the milk?** · איפה החלב? — _התבנית: Where is the ___? — מוצאת כל מוצר בכל חנות._
- **Do you have bread?** · יש לכם לחם? — _התבנית: Do you have ___? — בודקת אם קיים במלאי._
- **Just this, thanks.** · רק את זה, תודה.
- **Could I get a bag?** · אפשר שקית?

### Expected replies (you hear)
- **It's in aisle three.** · זה במעבר שלוש.
- **Over there, on the left.** · שם, משמאל.
- **You need to weigh it first.** · צריך לשקול קודם.
- **Do you need a bag?** · צריך שקית?
- **Insert your card here.** · הכנס את הכרטיס כאן.
- **Sorry, we're sold out.** · סליחה, אזל המלאי.

_Reply-training drill:_ “It's in aisle three.” · “Over there, on the left.” · “You need to weigh it first.” · “Do you need a bag?”

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
- **🧑 Them:** “At the checkout — just these? You'll need to weigh the fruit first.” · בקופה — רק אלה? צריך לשקול קודם את הפירות.
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

## Mission 18 — CHECKPOINT: Food Day · נקודת ביקורת: יום אוכל

> Phase 3 · 🍽️ Food · 🏁 CHECKPOINT

**Objective:** Coffee morning, market noon, restaurant night — cold. · קפה בבוקר, שוק בצהריים, מסעדה בערב — קר.

**Confidence gain:** A full food day without the net. · יום אוכל שלם בלי רשת ביטחון.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **I'd like an iced coffee, please.** · אני רוצה קפה קר, בבקשה. — _התבנית: I’d like ___, please — עובדת על הכל._
- **One of those, please.** · אחד מאלה, בבקשה. — _לא יודע את השם? מצביע ואומר One of those. עובד בכל דוכן בעולם._
- **How much is it?** · כמה זה עולה? — _השאלה שאסור לוותר עליה בשוק. תמיד שואלים לפני._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _התבנית: A table for ___ — פשוט מספר. for one / for four._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **Could we have the bill, please?** · אפשר את החשבון, בבקשה? — _המשפט שסוגר כל ארוחה. באנגליה: bill · באמריקה: check._

### Expected replies (you hear)
- **Milk and sugar?** · חלב וסוכר?
- **How many?** · כמה?

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Sorry — remind me, was that with milk and sugar or just milk?” · סליחה — תזכיר לי, זה היה עם חלב וסוכר או רק חלב?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Milk and sugar?
- 🧑 (fast) “Two for six or five for thirteen — which deal do you want boss?” · שניים בשישה או חמישה בשלוש-עשרה — איזו עסקה אתה רוצה, בוס?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: How many?

### Dialogue: `cold-coffee` — happy path
- **🧑 Them:** “Morning! What can I get you?” · בוקר! מה להביא לך?
- **🫵 You:** “I'd like an iced coffee, please.” · אני רוצה קפה קר, בבקשה.
- **🧑 Them:** “Sure — milk and sugar?” · בטח — חלב וסוכר?
- **🫵 You:** “Milk, no sugar.” · עם חלב, בלי סוכר.
- **🧑 Them:** “Coming right up. Have a great morning!” · תכף מוכן. בוקר נהדר!

### Dialogue: `cold-market` — happy path
- **🧑 Them:** “Fresh fruit, fresh fruit! What would you like?” · פירות טריים, פירות טריים! מה תרצה?
- **🫵 You:** “How much is it?” · כמה זה עולה?
- **🧑 Them:** “Best price for you — six! How many?” · מחיר הכי טוב בשבילך — שישה! כמה?
- **🫵 You:** “Two, please.” · שניים, בבקשה.
- **🧑 Them:** “Here you go — enjoy, my friend!” · הנה לך — תיהנה, חבר!

### Dialogue: `cold-restaurant` — happy path
- **🧑 Them:** “Good evening! How many people?” · ערב טוב! כמה אנשים?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Right this way. Are you ready to order?” · בבקשה אחריי. מוכנים להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Excellent. I'll bring it right out. Just wave when you'd like the bill.” · מצוין. אביא מיד. תסמן כשתרצה את החשבון.
- **🫵 You:** “Could we have the bill, please?” · אפשר את החשבון, בבקשה?
- **🧑 Them:** “Of course — here you go. Have a lovely evening!” · כמובן — בבקשה. ערב נפלא!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 19 — Public Transport · תחבורה ציבורית

> Phase 4 · 🏙️ City Life

**Objective:** Ticket, platform, direction, the right stop. · כרטיס, רציף, כיוון, ירידה נכונה.

**Confidence gain:** The city moves for me, cheaply. · העיר זזה בשבילי, בזול.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **One ticket to the center, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **Which platform?** · איזה רציף? — _שתי מילים שמונעות עלייה לרכבת הלא נכונה._
- **Does this stop at the museum?** · זה עוצר במוזיאון? — _התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון._
- **When's the next one?** · מתי הבא?

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
- 🧑 (fast) “This train's been delayed — you'll want the replacement bus from stand C instead.” · הרכבת הזאת מתעכבת — עדיף לך את האוטובוס החלופי מעמדה C.
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Which platform?

### Dialogue: `transport` — happy path
- **🧑 Them:** “Hello! Where are you headed?” · שלום! לאן אתה נוסע?
- **🫵 You:** “One ticket to the center, please.” · כרטיס אחד למרכז, בבקשה.
- **🧑 Them:** “Single or return?” · הלוך או הלוך-חזור?
- **🫵 You:** “Single, please.” · הלוך, בבקשה.
- **🧑 Them:** “That's three euros. Platform two, leaves every ten minutes.” · זה שלושה יורו. רציף שתיים, יוצא כל עשר דקות.
- **🫵 You:** “Which platform?” · איזה רציף?
- **🧑 Them:** “Platform — two. Straight ahead.” · רציף — שתיים. ישר קדימה.
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

## Mission 20 — Tickets & Attractions · כרטיסים ואטרקציות

> Phase 4 · 🏙️ City Life

**Objective:** Museum, tour, opening hours, discounts. · מוזיאון, סיור, שעות פתיחה, הנחות.

**Confidence gain:** Culture opens frictionlessly. · התרבות נפתחת בלי חיכוך.

**Estimated time:** ~18 min

**Video:** — (none yet)

### Core phrases (you say)
- **Two tickets, please.** · שני כרטיסים, בבקשה. — _התבנית: ___ tickets, please. שני מספרים וגמרנו._
- **What time do you open?** · באיזו שעה אתם פותחים? — _התבנית: What time do you ___? — פותחת כל שאלת שעה._
- **Is there a discount?** · יש הנחה? — _התבנית: Is there a ___? — בודקת אם קיים משהו. שאלה ששווה כסף._
- **Is there a guided tour?** · יש סיור מודרך?

### Expected replies (you hear)
- **How many tickets?** · כמה כרטיסים?
- **We open at nine.** · אנחנו פותחים בתשע.
- **Last entry is at five.** · כניסה אחרונה בחמש.
- **The tour starts at eleven.** · הסיור מתחיל באחת-עשרה.
- **Students get half price.** · סטודנטים משלמים חצי מחיר.
- **Today is sold out.** · היום אזל.

_Reply-training drill:_ “How many tickets?” · “We open at nine.” · “Students get half price.” · “The tour starts at eleven.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “The main exhibit's closed today but the rooftop terrace is open would you prefer that instead?” · התערוכה הראשית סגורה היום, אבל גג הצפייה פתוח — אתה מעדיף את זה במקום?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Two tickets, please.

### Dialogue: `ticket-desk` — happy path
- **🧑 Them:** “Hi! Welcome to the museum. How many tickets?” · היי! ברוך הבא למוזיאון. כמה כרטיסים?
- **🫵 You:** “Two tickets, please.” · שני כרטיסים, בבקשה.
- **🧑 Them:** “Two — that's twenty euros. Anything else?” · שניים — זה עשרים יורו. עוד משהו?
- **🫵 You:** “Is there a discount?” · יש הנחה?
- **🧑 Them:** “Students get half price — do you have a student card?” · סטודנטים חצי מחיר — יש לך כרטיס סטודנט?
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Here are your tickets. Anything else I can help with?” · הנה הכרטיסים. עוד משהו שאוכל לעזור?
- **🫵 You:** “Is there a guided tour?” · יש סיור מודרך?
- **🧑 Them:** “Yes — the tour starts at eleven, in the main hall.” · כן — הסיור מתחיל באחת-עשרה, באולם המרכזי.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Enjoy the museum — and the tour!” · תיהנה מהמוזיאון — ומהסיור!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 21 — Wifi, SIM & Practical · וויי-פיי, סים ופרקטיקה

> Phase 4 · 🏙️ City Life

**Objective:** SIM plan, wifi password, charger — 21st-century needs. · חבילת סים, סיסמת וויי-פיי, מטען — צרכי המאה ה-21.

**Confidence gain:** I stay connected in any country. · אני מחובר בכל מדינה.

**Estimated time:** ~18 min

**Video:** — (none yet)

### Core phrases (you say)
- **I need a SIM card.** · אני צריך כרטיס סים. — _התבנית: I need a ___ — מבקשת כל דבר בפשטות ובביטחון._
- **A data plan, please.** · חבילת גלישה, בבקשה.
- **How much is it?** · כמה זה עולה? — _לפני שמתחייבים לחבילה — תמיד שואלים מחיר._
- **Do you have a charger?** · יש לכם מטען?

### Expected replies (you hear)
- **How long are you staying?** · לכמה זמן אתה נשאר?
- **This one has ten gigs.** · לזה יש עשרה ג'יגה.
- **It's twenty euros.** · זה עשרים יורו.
- **I'll need your passport.** · אצטרך את הדרכון שלך.
- **I'll set it up now.** · אני אתקין עכשיו.
- **The wifi password is on your receipt.** · סיסמת הוויי-פיי על הקבלה.

_Reply-training drill:_ “How long are you staying?” · “This one has ten gigs.” · “It's twenty euros.” · “I'll need your passport.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Would you like the plan to auto-renew each month or just the one-time top-up for now?” · תרצה שהחבילה תתחדש אוטומטית כל חודש או רק טעינה חד-פעמית לעכשיו?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Do you have a charger?

### Dialogue: `sim-shop` — happy path
- **🧑 Them:** “Hi there! How can I help?” · היי! איך אפשר לעזור?
- **🫵 You:** “I need a SIM card.” · אני צריך כרטיס סים.
- **🧑 Them:** “Great — this tourist plan has ten gigs. How long are you staying?” · מעולה — לחבילה התיירותית הזאת יש עשרה ג'יגה. לכמה זמן אתה נשאר?
- **🫵 You:** “How much is it?” · כמה זה עולה?
- **🧑 Them:** “It's twenty euros, and I'll need your passport.” · זה עשרים יורו, ואצטרך את הדרכון שלך.
- **🫵 You:** “Do you have a charger?” · יש לכם מטען?
- **🧑 Them:** “A charger? Yes — right behind you. Anything else?” · מטען? כן — ממש מאחוריך. עוד משהו?
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “All set — I'll set it up now. The wifi password is on your receipt.” · הכל מוכן — אני אתקין עכשיו. סיסמת הוויי-פיי על הקבלה.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “You're connected! Enjoy your trip.” · אתה מחובר! תיהנה מהטיול.

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 22 — Souvenirs & Gifts · מזכרות ומתנות

> Phase 4 · 🏙️ City Life

**Objective:** Choose gifts, ask about wrapping, pay. · לבחור מתנות, לשאול על אריזה, לשלם.

**Confidence gain:** Shops are friendly territory. · חנויות הן טריטוריה ידידותית.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **I'm just looking, thanks.** · אני רק מסתכל, תודה. — _מוריד את כל הלחץ. אתה מסתכל בשקט, בלי התחייבות._
- **How much is this one?** · כמה זה עולה?
- **Do you have another color?** · יש בצבע אחר? — _התבנית: Do you have another ___? — מבקשת גרסה אחרת של כל דבר._
- **Could you gift-wrap it?** · אפשר לעטוף למתנה?
- **I'll take this one.** · אני אקח את זה. — _סוגר את הקנייה. בחירה, וגמרנו._

### Expected replies (you hear)
- **Can I help you find anything?** · לעזור לך למצוא משהו?
- **These are handmade.** · אלה בעבודת יד.
- **Which color would you like?** · איזה צבע תרצה?
- **Of course — is it a gift?** · בטח — זה מתנה?
- **This is the last one.** · זה האחרון.
- **That'll be fifteen.** · זה יוצא חמש-עשרה.

_Reply-training drill:_ “Can I help you find anything?” · “These are handmade.” · “Which color would you like?” · “Of course — is it a gift?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “We've got a buy-two-get-one-free deal on today would you like to add a second one?” · יש לנו היום מבצע קנה-שניים-קבל-אחד-חינם — תרצה להוסיף עוד אחד?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Could you gift-wrap it?

### Dialogue: `souvenir-shop` — happy path
- **🧑 Them:** “Hello! Can I help you find anything?” · שלום! לעזור לך למצוא משהו?
- **🫵 You:** “I'm just looking, thanks.” · אני רק מסתכל, תודה.
- **🧑 Them:** “Of course — these little bowls are handmade, very popular.” · כמובן — הקערות הקטנות האלה בעבודת יד, מאוד פופולריות.
- **🫵 You:** “How much is this one?” · כמה זה עולה?
- **🧑 Them:** “That one's fifteen. Would you like it?” · זה עולה חמש-עשרה. תרצה אותו?
- **🫵 You:** “I'll take this one.” · אני אקח את זה.
- **🧑 Them:** “Lovely choice — is it a gift?” · בחירה נהדרת — זה מתנה?
- **🫵 You:** “Could you gift-wrap it?” · אפשר לעטוף למתנה?
- **🧑 Them:** “All wrapped up — here you go. Enjoy, and safe travels!” · הכל עטוף — בבקשה. תיהנה, ונסיעה טובה!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 23 — Small Talk · שיחת חולין

> Phase 4 · 🏙️ City Life

**Objective:** Three warm minutes with a stranger. · שלוש דקות שיחה חמה עם זר.

**Confidence gain:** Connection, not just transactions. · חיבור, לא רק עסקאות.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **This place is beautiful.** · המקום הזה יפהפה. — _מחמאה קטנה פותחת חום מיידי. תמיד עובדת._
- **How about you?** · ואתה? — _שלוש מילים שמחזירות את הכדור וממשיכות כל שיחה._
- **Can you recommend a place?** · אתה יכול להמליץ על מקום?
- **It was nice talking to you.** · היה נעים לדבר איתך. — _הדרך החמה לסיים שיחה. משאירה חיוך._
- **I love the food here.** · אני אוהב את האוכל כאן.

### Expected replies (you hear)
- **Is this your first time here?** · זו הפעם הראשונה שלך כאן?
- **Where are you from?** · מאיפה אתה?
- **You should try the old town.** · כדאי לך לנסות את העיר העתיקה.
- **How long are you here for?** · לכמה זמן אתה כאן?
- **Enjoy the rest of your trip!** · תיהנה משאר הטיול!
- **Me too!** · גם אני!

_Reply-training drill:_ “Is this your first time here?” · “Where are you from?” · “You should try the old town.” · “How long are you here for?”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “So honestly what's been your favorite thing about the trip so far?” · אז בכנות — מה הדבר האהוב עליך בטיול עד עכשיו?
  - ✅ best move: **I love the food here.** · אני אוהב את האוכל כאן.
  - ✗ distractor: Can you recommend a place?

### Dialogue: `small-talk` — happy path
- **🧑 Them:** “Beautiful view, isn't it? Where are you from?” · נוף יפה, נכון? מאיפה אתה?
- **🫵 You:** “This place is beautiful.” · המקום הזה יפהפה.
- **🧑 Them:** “It really is. Is this your first time here?” · באמת. זו הפעם הראשונה שלך כאן?
- **🫵 You:** “I love the food here.” · אני אוהב את האוכל כאן.
- **🧑 Them:** “The food is the best part! You should try the old town — wonderful little restaurants.” · האוכל זה הכי טוב! כדאי לך לנסות את העיר העתיקה — מסעדות קטנות נפלאות.
- **🫵 You:** “Can you recommend a place?” · אתה יכול להמליץ על מקום?
- **🧑 Them:** “Of course — 'Mama Rosa'. Ask for the owner and tell her I sent you!” · בטח — 'מאמא רוזה'. תבקש את הבעלים ותגיד שאני שלחתי!
- **🫵 You:** “It was nice talking to you.” · היה נעים לדבר איתך.
- **🧑 Them:** “You too! Enjoy the rest of your trip!” · גם לי! תיהנה משאר הטיול!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 24 — CHECKPOINT: City Day · נקודת ביקורת: יום עיר

> Phase 4 · 🏙️ City Life · 🏁 CHECKPOINT

**Objective:** Transport → attraction → shopping → chat. Cold, chained. · תחבורה → אטרקציה → קניות → שיחה. קר, ברצף.

**Confidence gain:** A foreign city = home turf. · עיר זרה = מגרש ביתי.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **One ticket to the center, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **Does this stop at the museum?** · זה עוצר במוזיאון? — _התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון._
- **Two tickets, please.** · שני כרטיסים, בבקשה. — _התבנית: ___ tickets, please. שני מספרים וגמרנו._
- **Is there a discount?** · יש הנחה? — _התבנית: Is there a ___? — בודקת אם קיים משהו. שאלה ששווה כסף._
- **This place is beautiful.** · המקום הזה יפהפה. — _מחמאה קטנה פותחת חום מיידי. תמיד עובדת._
- **Can you recommend a place?** · אתה יכול להמליץ על מקום?

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Change of plan that platform's now platform four — better hurry along!” · שינוי — הרציף עכשיו רציף ארבע — כדאי שתמהר!
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Does this stop at the museum?
- 🧑 (fast) “The English guided tour actually starts in two minutes would you like to join it?” · הסיור המודרך באנגלית מתחיל בעצם בעוד שתי דקות — תרצה להצטרף?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: Is there a discount?

### Dialogue: `cold-transport` — happy path
- **🧑 Them:** “Where are you headed?” · לאן אתה נוסע?
- **🫵 You:** “One ticket to the center, please.” · כרטיס אחד למרכז, בבקשה.
- **🧑 Them:** “Platform two, leaves in five minutes.” · רציף שתיים, יוצא בעוד חמש דקות.
- **🫵 You:** “Does this stop at the museum?” · זה עוצר במוזיאון?
- **🧑 Them:** “Yep — three stops. Enjoy!” · כן — שלוש תחנות. תיהנה!

### Dialogue: `cold-attraction` — happy path
- **🧑 Them:** “Welcome! How many tickets?” · ברוך הבא! כמה כרטיסים?
- **🫵 You:** “Two tickets, please.” · שני כרטיסים, בבקשה.
- **🧑 Them:** “Twenty euros. We open at nine, last entry at five.” · עשרים יורו. פותחים בתשע, כניסה אחרונה בחמש.
- **🫵 You:** “Is there a discount?” · יש הנחה?
- **🧑 Them:** “Students get half price. Enjoy the museum!” · סטודנטים חצי מחיר. תיהנה במוזיאון!

### Dialogue: `cold-chat` — happy path
- **🧑 Them:** “Beautiful day! Where are you from?” · יום יפה! מאיפה אתה?
- **🫵 You:** “This place is beautiful.” · המקום הזה יפהפה.
- **🧑 Them:** “First time here? You should try the old town.” · פעם ראשונה כאן? כדאי לך לנסות את העיר העתיקה.
- **🫵 You:** “Can you recommend a place?” · אתה יכול להמליץ על מקום?
- **🧑 Them:** “'Mama Rosa' — tell her I sent you. Enjoy your trip!” · 'מאמא רוזה' — תגיד שאני שלחתי. תיהנה מהטיול!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 25 — Fixing Problems · לתקן בעיה

> Phase 5 · 🎖️ Mastery

**Objective:** Wrong order, double charge, noisy room — fixed with grace. · הזמנה שגויה, חיוב כפול, חדר רועש — נפתרים באלגנטיות.

**Confidence gain:** Friction is a script, not a crisis. · תקלה היא תסריט, לא משבר.

**Estimated time:** ~22 min

**Video:** — (none yet)

### Core phrases (you say)
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע ועובדתי — לא ריב. מתארים, לא מאשימים._
- **I think there's a mistake.** · אני חושב שיש טעות. — _הפתיח העדין לכל בעיה. פותח דלת במקום להרים קול._
- **I was charged twice.** · חייבו אותי פעמיים.
- **Can you fix it?** · אפשר לתקן את זה?
- **No problem, thank you.** · אין בעיה, תודה. — _סוגר תקלה בחן. השארת אותם עם חיוך, לא עם מתח._

### Expected replies (you hear)
- **I'm so sorry about that.** · אני מצטער על זה מאוד.
- **I'll bring the right one.** · אביא את הנכון.
- **Let me check the bill.** · תן לי לבדוק את החשבון.
- **I'll refund it now.** · אחזיר לך את הכסף עכשיו.
- **It's on the house.** · זה על חשבון הבית.
- **Is there anything else?** · יש עוד משהו?

_Reply-training drill:_ “I'm so sorry about that.” · “I'll bring the right one.” · “It's on the house.” · “I'll refund it now.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “The manager says we can only refund to the original card is that alright with you?” · המנהל אומר שאפשר להחזיר רק לכרטיס המקורי — זה בסדר מבחינתך?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: I was charged twice.

### Dialogue: `fixing-problems` — happy path
- **🧑 Them:** “Here's your meal — one steak!” · הנה הארוחה שלך — סטייק אחד!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh no, I'm so sorry! What did you order?” · אוי לא, אני מצטער מאוד! מה הזמנת?
- **🫵 You:** “Can you fix it?” · אפשר לתקן את זה?
- **🧑 Them:** “Of course — I'll bring the right one right away. And it's on the house.” · כמובן — אביא את הנכון מיד. וזה על חשבון הבית.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Here's your bill for this evening.” · הנה החשבון לערב.
- **🫵 You:** “I was charged twice.” · חייבו אותי פעמיים.
- **🧑 Them:** “You're right — my mistake. I'll refund it now.” · אתה צודק — הטעות שלי. אחזיר לך עכשיו.
- **🫵 You:** “No problem, thank you.” · אין בעיה, תודה.
- **🧑 Them:** “All fixed. Thank you for your patience — the evening's on us!” · הכל תוקן. תודה על הסבלנות — הערב עלינו!

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “No problem, thank you.” → 🧑 “Is everything alright with the bill?” · הכל בסדר עם החשבון?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 26 — Pharmacy & Health · בית מרקחת ובריאות

> Phase 5 · 🎖️ Mastery

**Objective:** Symptoms, dosage, allergies — clear and safe. · תסמינים, מינון, אלרגיות — ברור ובטוח.

**Confidence gain:** My body is cared for in any language. · הגוף שלי מטופל בכל שפה.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **I have a headache.** · יש לי כאב ראש. — _התבנית: I have a ___ — מתארת כל תסמין. headache / cough / fever._
- **Do you have something for a cold?** · יש לכם משהו לצינון? — _התבנית: something for ___ — מבקשת תרופה בלי לדעת את השם שלה._
- **How often do I take it?** · כל כמה זמן לוקחים? — _השאלה שאסור לוותר עליה עם תרופה. תמיד מוודאים מינון._
- **I'm allergic to penicillin.** · אני אלרגי לפניצילין.
- **I have a stomach ache.** · יש לי כאב בטן.

### Expected replies (you hear)
- **What's the matter?** · מה קרה?
- **Take this twice a day.** · קח את זה פעמיים ביום.
- **After meals.** · אחרי הארוחות.
- **Any allergies?** · יש אלרגיות?
- **You should see a doctor.** · כדאי לך לראות רופא.
- **Feel better soon!** · תרגיש טוב יותר!

_Reply-training drill:_ “What's the matter?” · “Any allergies?” · “Take this twice a day.” · “After meals.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “And if it doesn't improve in three days you'll really need to see a doctor okay?” · ואם זה לא משתפר תוך שלושה ימים, תצטרך באמת לראות רופא, בסדר?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: I have a headache.

### Dialogue: `pharmacy` — happy path
- **🧑 Them:** “Hello! What's the matter?” · שלום! מה קרה?
- **🫵 You:** “I have a headache.” · יש לי כאב ראש.
- **🧑 Them:** “I see. Before I give you anything — any allergies?” · הבנתי. לפני שאתן לך משהו — יש אלרגיות?
- **🫵 You:** “I'm allergic to penicillin.” · אני אלרגי לפניצילין.
- **🧑 Them:** “Good to know. This one is safe for you — take it twice a day.” · טוב לדעת. זה בטוח בשבילך — קח פעמיים ביום.
- **🫵 You:** “How often do I take it?” · כל כמה זמן לוקחים?
- **🧑 Them:** “Twice a day, after meals.” · פעמיים ביום, אחרי הארוחות.
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

**Objective:** Help, doctor, police, lost items — automatic under stress. · עזרה, רופא, משטרה, אבידות — אוטומטי תחת לחץ.

**Confidence gain:** The worst case has a script. · לתרחיש הגרוע ביותר יש תסריט.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **I need help.** · אני צריך עזרה. — _שתי מילים שמזמנות עזרה בכל מקום בעולם. תגיד בקול._
- **Please call a doctor.** · תקראו לרופא, בבקשה.
- **I lost my passport.** · איבדתי את הדרכון. — _התבנית: I lost my ___ — לדווח על כל אבידה. passport / bag / phone._
- **Call the police!** · תקראו למשטרה!
- **Where is the hospital?** · איפה בית החולים?

### Expected replies (you hear)
- **What's wrong?** · מה קרה?
- **Stay calm, help is coming.** · תישאר רגוע, עזרה בדרך.
- **Where are you?** · איפה אתה?
- **Are you hurt?** · אתה פצוע?
- **An ambulance is on the way.** · אמבולנס בדרך.
- **You can report it here.** · אפשר לדווח כאן.

_Reply-training drill:_ “What's wrong?” · “Are you hurt?” · “Where are you?” · “An ambulance is on the way.”

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Can you tell me exactly what the man looked like and which direction he ran off in?” · אתה יכול לומר לי בדיוק איך האיש נראה ולאיזה כיוון הוא ברח?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: I need help.

### Dialogue: `emergency` — happy path
- **🧑 Them:** “Emergency services — what's wrong?” · שירותי חירום — מה קרה?
- **🫵 You:** “I need help.” · אני צריך עזרה.
- **🧑 Them:** “Okay, stay calm. Are you hurt, or is someone in danger?” · טוב, תישאר רגוע. אתה פצוע, או שמישהו בסכנה?
- **🫵 You:** “Please call a doctor.” · תקראו לרופא, בבקשה.
- **🧑 Them:** “An ambulance is on the way. Where are you?” · אמבולנס בדרך. איפה אתה?
- **🫵 You:** “I'm at the train station.” · אני בתחנת הרכבת.
- **🧑 Them:** “Good. Stay there. You also said something was lost?” · טוב. תישאר שם. אמרת גם שמשהו אבד?
- **🫵 You:** “I lost my passport.” · איבדתי את הדרכון.
- **🧑 Them:** “You can report it here — I'll help you with the form.” · אפשר לדווח כאן — אני אעזור לך עם הטופס.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “You did everything right. Help is here now. You're safe.” · עשית הכל נכון. העזרה כאן עכשיו. אתה בטוח.

#### Wrong / recovery branches
- ⚠︎ less useful: 🫵 “Where is the hospital?” → 🧑 “We'll get you to a hospital — but you mentioned something was lost?” · נדאג להביא אותך לבית חולים — אבל אמרת שמשהו אבד?

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 28 — No Subtitles · בלי כתוביות

> Phase 5 · 🎖️ Mastery

**Objective:** Every dialogue — no text, surprise variants. · כל הדיאלוגים — בלי טקסט, עם וריאציות הפתעה.

**Confidence gain:** My ears stand alone. · האוזניים עומדות לבד.

**Estimated time:** ~20 min

**Video:** — (none yet)

### Core phrases (you say)
- **One ticket to the center, please.** · כרטיס אחד למרכז, בבקשה. — _התבנית: One ticket to ___ — קונה כרטיס לכל יעד._
- **Does this stop at the museum?** · זה עוצר במוזיאון? — _התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _התבנית: A table for ___ — פשוט מספר. for one / for four._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **This place is beautiful.** · המקום הזה יפהפה. — _מחמאה קטנה פותחת חום מיידי. תמיד עובדת._
- **Can you recommend a place?** · אתה יכול להמליץ על מקום?

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “That machine's cash only by the way — you got coins on you?” · המכונה הזאת מקבלת רק מזומן, דרך אגב — יש עליך מטבעות?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: Does this stop at the museum?
- 🧑 (fast) “We're actually all out of pasta tonight — the risotto instead maybe?” · בעצם נגמרה לנו הפסטה הערב — אולי ריזוטו במקום?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: A table for two, please.

### Dialogue: `ns-transit` — happy path
- **🧑 Them:** “Right — where to?” · טוב — לאן?
- **🫵 You:** “One ticket to the center, please.” · כרטיס אחד למרכז, בבקשה.
- **🧑 Them:** “Platform's changed — it's four now, quick!” · הרציף השתנה — עכשיו ארבע, מהר!
- **🫵 You:** “Does this stop at the museum?” · זה עוצר במוזיאון?
- **🧑 Them:** “Three stops — go, go!” · שלוש תחנות — קדימה, קדימה!

### Dialogue: `ns-diner` — happy path
- **🧑 Them:** “Evening — table for how many?” · ערב — שולחן לכמה?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Kitchen's about to close — ready to order?” · המטבח עומד להיסגר — מוכן להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Good call — last one in! Coming up.” · בחירה טובה — האחרון שנכנס! תכף מגיע.

### Dialogue: `ns-local` — happy path
- **🧑 Them:** “Gorgeous spot, right? First time here?” · מקום מהמם, נכון? פעם ראשונה כאן?
- **🫵 You:** “This place is beautiful.” · המקום הזה יפהפה.
- **🧑 Them:** “You've gotta see the old town — got a second?” · אתה חייב לראות את העיר העתיקה — יש לך רגע?
- **🫵 You:** “Can you recommend a place?” · אתה יכול להמליץ על מקום?
- **🧑 Them:** “Mama Rosa's — go now, tell 'em I sent you!” · 'מאמא רוזה' — לך עכשיו, תגיד שאני שלחתי!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 29 — Dress Rehearsal: Full Evening · חזרה גנרלית: ערב שלם

> Phase 5 · 🎖️ Mastery

**Objective:** Taxi → restaurant → problem → payment. One take. · מונית → מסעדה → תקלה → תשלום. טייק אחד.

**Confidence gain:** Chained moments feel like one flow. · רצף רגעים = זרימה אחת.

**Estimated time:** ~22 min

**Video:** — (none yet)

### Core phrases (you say)
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **Stop here, please.** · עצור כאן, בבקשה. — _העיתוי חשוב — תגיד את זה קצת לפני היעד._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _התבנית: A table for ___ — פשוט מספר. for one / for four._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **Could we have the bill, please?** · אפשר את החשבון, בבקשה? — _המשפט שסוגר כל ארוחה. באנגליה: bill · באמריקה: check._
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע ועובדתי — לא ריב. מתארים, לא מאשימים._
- **I was charged twice.** · חייבו אותי פעמיים.
- **I'll pay by card.** · אני אשלם בכרטיס. — _התבנית: I’ll pay by ___ / in ___. by card · in cash._

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “While we fix that can I bring you a drink on the house to make up for it?” · בזמן שאנחנו מתקנים — שאביא לך משקה על חשבון הבית כפיצוי?
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: I was charged twice.

### Dialogue: `dr-taxi` — happy path
- **🧑 Them:** “Evening! Where to?” · ערב! לאן?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “About fifteen with the traffic. Here okay?” · בערך חמש-עשרה עם הפקקים. כאן בסדר?
- **🫵 You:** “Stop here, please.” · עצור כאן, בבקשה.
- **🧑 Them:** “Here you are — have a good night!” · הגענו — לילה טוב!

### Dialogue: `dr-order` — happy path
- **🧑 Them:** “Welcome! How many people?” · ברוך הבא! כמה אנשים?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Right this way. Ready to order?” · בבקשה אחריי. מוכן להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Excellent — coming right up!” · מצוין — תכף מגיע!

### Dialogue: `dr-problem` — happy path
- **🧑 Them:** “Here's your meal — one steak!” · הנה הארוחה — סטייק אחד!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh no — so sorry! I'll bring the right one right away.” · אוי לא — מצטער מאוד! אביא את הנכון מיד.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “The right dish, and it's on the house. Enjoy!” · המנה הנכונה, ועל חשבון הבית. בתיאבון!

### Dialogue: `dr-pay` — happy path
- **🧑 Them:** “All done? Anything else for you tonight?” · סיימנו? עוד משהו הערב?
- **🫵 You:** “Could we have the bill, please?” · אפשר את החשבון, בבקשה?
- **🧑 Them:** “Here you go — that's thirty. Cash or card?” · בבקשה — זה שלושים. מזומן או כרטיס?
- **🫵 You:** “I'll pay by card.” · אני אשלם בכרטיס.
- **🧑 Them:** “Perfect — have a lovely evening!” · מושלם — ערב נפלא!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---

## Mission 30 — A Complete Day Abroad Alone · יום שלם לבד בחו״ל

> Phase 5 · 🎖️ Mastery · 🏁 CHECKPOINT

**Objective:** Morning to night: a cold moment chain. One take. A real verdict. · מבוקר עד לילה: שרשרת רגעים קרים. טייק אחד. פסק דין אמיתי.

**Confidence gain:** Independence — proven. · עצמאות — מוכחת.

**Estimated time:** ~25 min

**Video:** — (none yet)

### Core phrases (you say)
- **I'd like an iced coffee, please.** · אני רוצה קפה קר, בבקשה. — _התבנית: I’d like ___, please — עובדת על הכל._
- **To this address, please.** · לכתובת הזאת, בבקשה. — _הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון._
- **A table for two, please.** · שולחן לשניים, בבקשה. — _התבנית: A table for ___ — פשוט מספר. for one / for four._
- **I'll have the pasta, please.** · אני אקח את הפסטה, בבקשה. — _התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט._
- **This isn't what I ordered.** · זה לא מה שהזמנתי. — _רגוע ועובדתי — לא ריב. מתארים, לא מאשימים._
- **This place is beautiful.** · המקום הזה יפהפה. — _מחמאה קטנה פותחת חום מיידי. תמיד עובדת._
- **It was nice talking to you.** · היה נעים לדבר איתך. — _הדרך החמה לסיים שיחה. משאירה חיוך._

### Recovery tools reused
`Can you repeat that?` · `Please speak slowly.` · `Thank you!`

### Cold open (ambush)
- 🧑 (fast) “Mind if I take the scenic route it might add a few minutes but no extra charge?” · אכפת לך אם אקח את הדרך היפה? זה אולי יוסיף כמה דקות אבל בלי תוספת תשלום.
  - ✅ best move: **Can you repeat that?** · אפשר לחזור על זה?
  - ✗ distractor: To this address, please.
- 🧑 (fast) “And would you like me to box the wrong dish for you to take away as well no charge?” · ותרצה שאארוז לך גם את המנה השגויה לקחת, בלי תשלום?
  - ✅ best move: **Please speak slowly.** · דבר לאט, בבקשה.
  - ✗ distractor: This isn't what I ordered.

### Dialogue: `fin-morning` — happy path
- **🧑 Them:** “Morning! What can I get you?” · בוקר! מה להביא לך?
- **🫵 You:** “I'd like an iced coffee, please.” · אני רוצה קפה קר, בבקשה.
- **🧑 Them:** “Coming up — anything else this morning?” · תכף מוכן — עוד משהו הבוקר?
- **🫵 You:** “That's all, thanks.” · זה הכל, תודה.
- **🧑 Them:** “Have a wonderful day!” · שיהיה יום נפלא!

### Dialogue: `fin-taxi` — happy path
- **🧑 Them:** “Where can I take you?” · לאן לקחת אותך?
- **🫵 You:** “To this address, please.” · לכתובת הזאת, בבקשה.
- **🧑 Them:** “It'll be about ten. We're here.” · זה יהיה בערך עשרה. הגענו.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “Enjoy your day!” · תיהנה מהיום!

### Dialogue: `fin-lunch` — happy path
- **🧑 Them:** “Hello! How many people?” · שלום! כמה אנשים?
- **🫵 You:** “A table for two, please.” · שולחן לשניים, בבקשה.
- **🧑 Them:** “Wonderful. Ready to order?” · נהדר. מוכן להזמין?
- **🫵 You:** “I'll have the pasta, please.” · אני אקח את הפסטה, בבקשה.
- **🧑 Them:** “Great choice — coming right up!” · בחירה מעולה — תכף מגיע!

### Dialogue: `fin-twist` — happy path
- **🧑 Them:** “Here you are — the seafood risotto!” · בבקשה — ריזוטו פירות ים!
- **🫵 You:** “This isn't what I ordered.” · זה לא מה שהזמנתי.
- **🧑 Them:** “Oh — my apologies! The pasta, right? I'll fix it now.” · אוי — סליחה! הפסטה, נכון? אני מתקן עכשיו.
- **🫵 You:** “Thank you!” · תודה!
- **🧑 Them:** “The right dish, on the house. So sorry again!” · המנה הנכונה, על חשבון הבית. שוב סליחה!

### Dialogue: `fin-evening` — happy path
- **🧑 Them:** “What a sunset. You've picked a beautiful spot.” · איזו שקיעה. בחרת מקום יפהפה.
- **🫵 You:** “This place is beautiful.” · המקום הזה יפהפה.
- **🧑 Them:** “It really is. Well — safe travels, my friend.” · באמת. אז — נסיעה טובה, חבר.
- **🫵 You:** “It was nice talking to you.” · היה נעים לדבר איתך.
- **🧑 Them:** “Take care — and come back one day!” · שמור על עצמך — ותחזור יום אחד!

### Review status
- 🤖 AI-drafted (English + Hebrew) — **pending human / native-Hebrew review**
- ✅ all items have Hebrew

---
