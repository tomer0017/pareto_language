# Mission 15 — Food Preferences & Allergies: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Mission 15 ships with emoji placeholders in every
slot (`M15_SLOTS` / `M15_PROPS` in `apps/web/src/features/bootcamp/practiceAllergies.ts`, `image` unset).
No image generation was available in the build session; no stock images were used. Emojis are NOT final.
To integrate an asset, put the file at `apps/web/public/images/mission15/<slot>.jpg` and set that slot's
`image: 'images/mission15/<slot>.jpg'`. One file per asset: never a collage or a sheet cropped later. Then
update the "visual slots" test in `mission15.test.ts` to pin the real files, as Missions 11–14 do.

This mission is deliberately SMALL: five semantic slots and one result picture — not a food gallery.

## One continuous world

- **the restaurant**: the same restaurant world as Mission 14 (same style, warm evening light) — but a
  different visit: ONE diner (the traveller alone — the waiter says "prêt" / "listo", singular), a quieter table;
- **the traveller**: the same adult traveller as Missions 11–14;
- **the waiter**: one adult waiter, the same in every scene. The Hebrew copy refers to the waiter in the
  masculine ("המלצר הלך לבדוק"), so draw a man. He may be Mission 14's waiter (same restaurant) if the
  style allows — reuse of the character is welcome, reuse of a two-diner picture is not.

Style: premium polished 3D animated illustration, warm, clean. Not photorealistic, not emoji art. **No text
in any picture** (no menu, no labels, no allergy cards with writing). The same art serves EN / ES / FR.
Format: about 16:9, at least 1536 px wide, JPEG at full quality.

## Safety — the rule above every picture

**No picture may suggest the food is safe.** No green check over a dish, no "nut-free" sign, no chef giving a
thumbs-up about nuts, no crossed-out nut icon on the plate. The conversation never confirms the nuts: the
waiter only says he will check. `kitchen-check` shows a waiter GOING to ask — a question, not an answer.

## Spoilers to avoid (tested by step order)

- The Food Check is UI, never art: the dish being vegetarian, the cream and "notified" appear only after the
  waiter says them.
- Before the risotto line, no picture shows the risotto, mushrooms or the kitchen.
- Before the cream line, no cream on screen.

## Fairness

No Mission 15 image is ever an answer tile. The one board ("What did the waiter say about the nuts?") uses
semantic tiles (`checking` / `no-nuts` / `has-nuts`) with app-language captions and equal treatment; the
correct answer comes from the id, never from a picture or a position (the board is shuffled). The mini-game
("What do you do?") gives each situation as app-language text with one emoji; the answers are the learner's
own sentences.

## Slots

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `waiter` | "Hi there! Are you ready to order?" / "Any other allergies or dietary restrictions?" | the waiter at the table, notepad ready, attentive; the traveller about to speak | Allergy and Anything-else cards |
| `nuts` | "I'm allergic to nuts." | a clear, recognisable handful of mixed nuts in the foreground, the traveller with a calm, serious "not for me" hand — no dish | Allergy card |
| `vegetarian` | "I'm vegetarian." | a colourful vegetable-based plate idea (vegetables, herbs), the traveller relaxed — no meat anywhere | Vegetarian card |
| `kitchen-check` | "I'll check with the kitchen about the nuts." / "I'll tell the kitchen about your allergy." / "I'll check with them and come right back." | the waiter turning toward the kitchen door, notepad in hand — going to ASK, no answer shown | Kitchen-check and Kitchen cards |
| `dairy` | "Does it have dairy?" / "Yes, it has some cream, but we can make it without." | a small jug of cream / a glass of milk beside a plain bowl, the waiter's open "we can leave it out" gesture | Dairy cards |

Reuse: `kitchen-check` serves three cards (one moment: the waiter going to the kitchen). Mission 14's
restaurant assets may inform the setting; never crop one asset into two.

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `kitchen-check-sent` | the needs are with the kitchen — the answer is still to come | the traveller waiting calmly at the table, the waiter seen through the kitchen door asking the cook; no food served, no thumbs-up | the 👨‍🍳 KITCHEN CHECK SENT receipt |
