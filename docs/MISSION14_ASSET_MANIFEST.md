# Mission 14 — Restaurant Meal: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Mission 14 ships with emoji placeholders in every
slot (`M14_SLOTS` / `M14_PROPS` in `apps/web/src/features/bootcamp/practiceRestaurant.ts`, `image` unset).
No image generation was available in the build session; no stock images were used. Emojis are NOT final.
To integrate an asset, put the file at `apps/web/public/images/mission14/<slot>.jpg` and set that slot's
`image: 'images/mission14/<slot>.jpg'`. One file per asset: never a collage, contact sheet, storyboard or
sprite sheet that gets cropped later. Then update the "visual slots" test in `mission14.test.ts` to pin the
real files, as Missions 11–13 do.

## One continuous world

ONE restaurant, ONE evening, ONE table. Keep these identical across all assets:

- **the traveller**: the same adult traveller as in Missions 11–13, with ONE companion (a table for two);
- **the waiter**: one adult waiter, the same face, hair and uniform in every scene. The Hebrew copy refers
  to the waiter in the masculine ("הוא מוביל אתכם"), so draw a man;
- **the restaurant**: one warm, mid-range restaurant — the same entrance, the same dining room, the same
  table by the same window;
- **the light**: the same evening interior light; after "Later…" the same room, a little later (plates
  finished), never a new place.

Style: premium polished 3D animated illustration, warm, clean. Not photorealistic, not emoji art. **No text
in any picture** (no readable menu, no prices, no bill amount). The same art serves EN / ES / FR.
Format: about 16:9, at least 1536 px wide, JPEG at full quality (the cards draw them as scenes).

## Spoilers to avoid (tested by step order)

- **The Restaurant Ticket is UI, never art.** No picture shows "2", chicken without onions, water, a closed
  order or a bill before the learner has said it; the deterministic ticket carries those facts.
- **Before the order line**, no picture shows the chicken dish. The briefing may name the learner's own
  wish (chicken, no onions, water) in text; pictures stay at the door / the table.
- **Before "Coming right up!"**, no food on the table.
- **Before "Later…"**, no finished plates; **before the bill line**, no bill folder on the table.

## Fairness

No Mission 14 image is ever an answer tile. The Waiter Signals board and the Flex party-size board use
semantic tiles (`table` / `food` / `drink` / `more` / `check`; `two` / `four`) with app-language captions and
equal treatment; correctness comes from the id, never from a picture or a position (boards are shuffled).
If a picture is ambiguous at phone size (360 px wide), it still never becomes an answer.

## Slots: the meal

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `restaurant-entrance` | "Good evening! Do you have a reservation?" | the waiter greets the two at the entrance, a reservation book on the stand (no text) | briefing icon; At-the-door card |
| `table-for-two` | "No — a table for two, please." | the traveller, a small "no" head-shake and two fingers up; the companion beside them | At-the-door card |
| `follow-to-table` | "Perfect, follow me. Here are your menus." | the waiter leads them to the window table, handing over two closed menus | At-the-table card |
| `ready-to-order` | "Are you ready to order?" | the waiter at the table, notepad ready; the two look up from the menus | At-the-table card |
| `order-chicken` | "I'll have the chicken, without onions, please." | the traveller points at the menu, a small "no thanks" gesture for one ingredient (no onion drawn on a plate) | At-the-table card |
| `drink-order` | "Of course. Anything to drink?" / "A bottle of water, please." | the waiter asks; the traveller answers — a water bottle hinted only on the waiter's tray, not yet served | Drink cards |
| `coming-right-up` | "Coming right up!" | the waiter turning away briskly with the order, a friendly nod | Order-closed card |
| `meal-check` | "Is everything okay?" | later: plates mostly finished, the waiter checking in with a smile | After-the-meal card |
| `delicious-bill` | "Yes, that was delicious! The bill, please." | the traveller, a happy "delicious" gesture, then a small "the bill, please" sign in the air (no bill shown) | After-the-meal card |
| `goodbye` | "So glad you enjoyed it. Here you are — have a lovely evening!" | the waiter places a closed bill folder on the table, smiling goodbye | After-the-meal card |

Reuse opportunities: `ready-to-order` and `order-chicken` may share one whole asset (same moment); `meal-check`
and `delicious-bill` may share one whole asset. Never crop one asset into two.

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `meal-complete` | the meal done | the two leaving the restaurant into the evening, the waiter waving from the door | the 🍽️ MEAL COMPLETE receipt |
