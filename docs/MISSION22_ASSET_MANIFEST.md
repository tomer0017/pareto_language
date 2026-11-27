# Mission 22 — Fixing Problems: asset manifest

**Status: PENDING — VISUAL PRODUCTION REQUIRED IN ASTRA PASS.**

No artwork was generated in the Mission 22 pass. Every card uses a semantic emoji placeholder from `M22_SLOTS`
(`apps/web/src/features/bootcamp/practiceFix.ts`). To ship artwork, add an `image` path to the slot (e.g.
`images/mission22/<slot>.jpg`) — the cards pick it up; nothing else changes.

## The rule for every picture

The problems and their states are **data**, drawn as deterministic UI on the 🧰 FIX IT board (ordered vs got,
charged twice, not working, noisy; ⚠️ → 🗣️ → ✅). **No picture may encode them**, and no picture may show a staff
SOLUTION before it is spoken: the right meal, the refund, the free dessert, the technician, the quieter room, room 305,
the new key. No room numbers, amounts, receipts with figures, or readable text.

## Slots (`M22_SLOTS`)

| Slot | Used on | Picture (context only) | Must NOT show |
|---|---|---|---|
| `restaurant-problem` | "This isn't what I ordered." · "What did you order?" · "I ordered the pasta." | A diner raising a hand politely to a waiter at a table | The right dish arriving; any menu text |
| `wrong-meal` | "Here's your meal — one steak!" | A plate with a steak set in front of a diner who looks surprised | Pasta, a replacement plate |
| `bill-error` | the bill · the mistake · "What's the problem?" · "I was charged twice." | A diner looking at a bill, puzzled | Amounts, a refund, money changing hands |
| `hotel-problem` | "There's a problem with my room." · "What's the problem?" · the apology | A guest at a hotel desk at night, receptionist listening | Keys handed over, room numbers |
| `ac-not-working` | "The air conditioning isn't working." | A warm room, a silent air-conditioning unit on the wall | A technician |
| `noisy-room` | "No. My room is very noisy." · "We have a quieter room." · "Can I change rooms?" | A guest covering their ears in a hotel room, noise outside | Another room, a new key |
| `solution` | the staff's solutions (cards only, after the line is heard) · "Can you fix it?" | A generic "sorted" moment — a thumbs-up at a counter | Any specific solution (meal, money, technician, key, 305) |

## Props (`M22_PROPS`)

| Prop | Used on | Note |
|---|---|---|
| `fix-it` | the 🧰 FIX IT result | Emoji only; the result is the board itself (UI) |

## Reuse considered

- Mission 14's restaurant and Mission 08's hotel-desk art fit the settings but show a normal meal / a check-in;
  they would not carry "something went wrong". Reuse only as a fallback for `restaurant-problem` / `hotel-problem`.

## Video

The standard resolver: `videos/{lang}/{lang}_22.mp4`. None exists today (EN / ES / FR): the video step is safely
skipped and the hub's first step reads the conversations aloud. No video was created or modified.
