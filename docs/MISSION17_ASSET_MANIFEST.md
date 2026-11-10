# Mission 17 — Supermarket & Everyday Shopping: artwork manifest

**Status: PLACEHOLDERS — VISUAL PRODUCTION REQUIRED IN ASTRA PASS.** No image generation was available in
the build pass, and no stock photography is used. Every slot below is an emoji placeholder in code
(`M17_SLOTS` / `M17_PROPS` in `apps/web/src/features/bootcamp/practiceSupermarket.ts`) until its artwork
exists. To integrate a picture, set `image: 'images/mission17/<slot>.jpg'` on the slot. Cards, the Shelf
Scan tiles, the briefing and the result all read from the slot.

Asset-light on purpose: **six product pictures are the priority**, plus three context pictures and one
result picture. Ten files in all, never fifteen or more.

## One continuous world

- **the shop**: one bright, ordinary neighbourhood supermarket, one visit, the same light;
- **the traveller**: the same adult traveller as Missions 11–16;
- **the staff**: one shop assistant on the floor, one cashier at the checkout. The Hebrew copy is
  gender-neutral for both; draw any adult.

Style: one consistent premium illustration style (polished 3D animated, warm, clean, bright: the
Missions 13–16 house style). Not photorealistic, no collages. **No text in any picture**: no aisle
numbers, no signs, no labels on packages, no prices, no brand names. The same art serves EN / ES / FR.

## The six products: equal treatment

The six product pictures appear **as Shelf Scan tiles (the answers)** and as word cards. They must be
interchangeable in treatment:

- **1:1 square**, at least 1024 × 1024 px, JPEG at full quality; the product centred with ~12% margin
  (the tile crops nothing: `object-fit: contain`);
- the same neutral light background, the same camera angle (slight top-down three-quarter), the same
  scale on screen, one product per picture;
- readable at phone size: a tile is ~95 px wide at 360 px;
- no correct answer with rich art next to emoji distractors: integrate all six together, or none (a
  test pins that the six product slots have the same shape).

| Slot | Meaning | Composition |
|---|---|---|
| `milk` | milk | one carton (or bottle) of milk, unlabelled, white and blue |
| `water` | water | one clear plastic bottle of still water, unlabelled |
| `bread` | bread | familiar bread: a loaf, sliced packaged bread is fine. It means BREAD, never "sliced bread": no visual hint at a kind |
| `cheese` | cheese | one wedge of yellow cheese with holes |
| `eggs` | eggs | a small open carton with a few eggs |
| `apples` | apples | three red apples |

## Context slots (16:9)

16:9 at least 1536 px wide, with a mobile safe area: keep the subject in the central 70%.

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `shop` | "Can I help you find something?" / "The milk is in aisle three, on the left." | the shop floor from the entrance: aisles ahead, the assistant turning to help. **No aisle number, no arrow, no signage**: the exact place is deterministic UI | briefing; Find and Aisle cards |
| `checkout` | "Is that everything?" / "Just this, thanks." / the card | the checkout counter: the cashier, the traveller with ONE carton of milk, a card terminal on the counter (no screen text, no price) | Checkout and Pay cards |
| `bag` | "Do you need a bag?" / "Could I get a bag?" | the cashier holding up one ordinary shopping bag. No paper vs plastic choice, no price tag | Bag cards |

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `quick-shop-complete` | the trip done | the traveller leaving the shop with one bag (the milk inside), a small wave from the cashier | the 🛒 QUICK SHOP COMPLETE receipt |

## What stays deterministic UI (never art)

- **the aisle and the side**: the Aisle Finder's six tiles (1 ⬅️ · 2 ⬅️ · 3 ⬅️ / 1 ➡️ · 2 ➡️ · 3 ➡️);
- **the 🛒 Supermarket sprint** (🔎 Find → 📍 Locate → 🧾 Checkout → 🛍️ Bag → 💳 Pay); "📍 Aisle 3 ⬅️"
  appears only after the assistant has said it;
- **the cashier signals** (🧾 that's everything? · 🛍️ a bag? · 💳 card in — paid), captioned in the
  app language;
- **"At the checkout…"**: a silent scene cue in the conversation, never a picture with words.

## Spoiler rules (tested by step order)

- Before the assistant's line, nothing shows aisle 3 or the left side: not the briefing, the sprint,
  any label, or any picture.
- The briefing picture (`shop`) shows no product location and no checkout.
- The `checkout` picture shows one carton of milk only: the canonical purchase. No cart, no basket.
- Nothing shows a price, a total, cash or a receipt (Missions 02 and 09 own money and shopping).
