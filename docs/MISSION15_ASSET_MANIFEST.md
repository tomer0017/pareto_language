# Mission 15 — Food Preferences & Allergies: artwork manifest

**Status: FINAL ARTWORK integrated.** Six independent JPEG files, five teaching slots and one
result prop. `kitchen-check-sent` reuses the whole `kitchen-check` image, freeing the sixth file for
an onion retrieval cue in the existing four-situation mini-game. No extra card or interaction.
Pixel-bound review: `mission15-artwork.json`; exact built-in imagegen prompts: `mission15-prompts.json`.

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
("What do you do?") gives each situation as app-language text with an equally sized 16:9 ingredient image; the legacy emoji prefix is hidden in rendering; the answers are the learner's
own sentences.

## Slots

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `waiter` | "Hi there! Are you ready to order?" / "Any other allergies or dietary restrictions?" | the waiter at the table, notepad ready, attentive; the traveller about to speak | Allergy and Anything-else cards |
| `nuts` | "I'm allergic to nuts." | recognisable mixed nuts in an ingredient bowl — no meal, symptoms or safety symbols | Allergy card |
| `vegetarian` | "I'm vegetarian." | a colourful vegetable-based plate idea (vegetables, herbs), generic vegetable concept — no meat/fish visible | Vegetarian card |
| `kitchen-check` | "I'll check with the kitchen about the nuts." / "I'll tell the kitchen about your allergy." / "I'll check with them and come right back." | the waiter turning toward the kitchen door, notepad in hand — going to ASK, no answer shown | Kitchen-check and Kitchen cards |
| `dairy` | "Does it have dairy?" / "Yes, it has some cream, but we can make it without." | milk glass and small cream jug, no meal; question card uses `waiter` until cream is mentioned | Dairy cards |

Reuse: `kitchen-check` serves three cards (one moment: the waiter going to the kitchen). Mission 14's
restaurant assets may inform the setting; never crop one asset into two.

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `kitchen-check-sent` | the needs are with the kitchen — the answer is still to come | whole `kitchen-check` image reused: traveller waiting, waiter walking toward the open kitchen; no food served, no thumbs-up | the 👨‍🍳 KITCHEN CHECK SENT receipt |

## Final files and mini-game mapping

All paths are `images/mission15/<name>.jpg`, shared by EN/ES/FR:
`waiter`, `nuts`, `vegetarian`, `dairy`, `onions`, `kitchen-check`.
The `onions` asset is a retrieval situation only, not a sixth teaching slot.
The mini-game uses dairy / nuts / onions / vegetarian in its unchanged order. All answer choices remain text.
The briefing uses `waiter`; early dairy-question teaching also uses `waiter` so cream is not pictured before
its NPC line. Kitchen imagery begins with the kitchen-check NPC line. Food Check stays deterministic UI.
Mission 14 supplies identity/world reference only; none of its two-diner files is reused directly.
