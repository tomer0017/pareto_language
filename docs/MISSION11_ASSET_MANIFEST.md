# Mission 11 — Small Talk & Recommendations: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Mission 11 ships with emoji placeholders in every
slot (`M11_SLOTS` / `M11_PROPS` in `apps/web/src/features/bootcamp/practiceSmallTalk.ts`, `image` unset).
No image generation was available in the build session; no stock images were used. To integrate an
asset, put the file at `apps/web/public/images/mission11/<slot>.jpg` and set that slot's
`image: 'images/mission11/<slot>.jpg'`. One file per asset: never a collage, contact sheet, storyboard or
sprite sheet that gets cropped later. Then update the "PLACEHOLDERS" test in `mission11.test.ts`
(it pins that no slot has artwork yet) to pin the real files instead, as `mission09.test.ts` does.

## One continuous world

This is a PEOPLE / CONVERSATION mission: facial expression, body language and social context matter
more than objects. Every image belongs to ONE conversation. Keep these identical across all assets:

- **the traveller**: the same adult tourist as in earlier missions (straw hat, backpack, friendly);
- **the local**: one adult resident, with the same face, hair and clothes in every scene. The Hebrew copy
  addresses the local in the masculine ("ממנו"), so draw a man;
- **the place**: one scenic viewpoint/terrace above one European-style city, with the same railing,
  bench and view;
- **the light**: the same late-afternoon golden light in every image.

Style: premium polished 3D animated illustration, cinematic, warm, high detail, clean. Not
photorealistic, not emoji art. **No text in any picture**: no signs, menus, shop names or words. The app
renders "Mama Rosa" and "Old Town" itself, deterministically, in each language. The same art serves
EN / ES / FR.

Format: wide, about 2:1 (or 16:9), at least 1200 px wide, JPEG at full quality. The cards draw them full
width at their own shape (`widePictures`), so nothing is cropped.

## Spoilers to avoid (tested)

- **Before the recommendation line**, no picture may show a restaurant, a restaurant name, food on a
  plate, a street sign or an "old town" street. The order is: briefing → opening → where from →
  first time → like it → food comment → *recommendation*.
- `food-comment` may show the local talking warmly, perhaps miming "delicious", but **no specific
  restaurant**: the tip is not known yet.
- Nothing before `first-time` may make it obvious that the other person is local: no uniform, no keys
  to a front door, no "resident" cue. In `local-opens` they are just a friendly person next to the
  traveller at the viewpoint.

## Fairness

No Mission 11 image is ever an answer tile. The tip capture uses names, and the rest of the mission is
conversation. The pictures carry meaning on the teaching cards only. If a picture's meaning is
ambiguous at phone size (360 px wide), it still never becomes a test answer on its own.

## Slots: the conversation

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `scenic-viewpoint` | the beautiful place | the viewpoint over the city, golden light; the traveller arrives, the local stands at the railing nearby (a stranger, not yet talking) | the briefing (wired via `M11_BRIEFING_IMAGE`) |
| `local-opens` | "Hi! Beautiful view, isn't it?" | the local turns to the traveller with a friendly smile, an open hand toward the view | Connect card (the opening) |
| `traveler-reacts` | "This place is beautiful." | the traveller, delighted, gesturing at the view, speaking to the local | Connect card (your reaction) |
| `origin` | "Where are you from?" / "I'm from Israel." | the two facing each other, chatting; the traveller with a hand on their chest ("me…") | Share cards (where from · I'm from Israel ♻️) |
| `bounce-back` | "How about you?" | the traveller, open palm toward the local, a curious, inviting face: the question returned | Share card (How about you?) |
| `first-time` | "I'm from here! Is this your first time here?" / "Yes, it's my first time here." | the local, proud and warm, gestures to himself and the city ("I'm from here"); the traveller nods, the backpack visible (a first-time visitor) | First-time cards |
| `like-it` | "Do you like it here?" / "Yes, I like it a lot." | the local asks with raised eyebrows; the traveller beams and nods, maybe a thumbs-up | Opinion cards |
| `food-comment` | "Me too. And the food here is wonderful." | the local, enthusiastic, mimes "delicious" (fingertips kiss); **no restaurant, no plate, no sign** | Ask card (the food comment) |
| `ask-recommendation` | "Can you recommend a place?" | the traveller leans in, interested, asking; the local starts to think | Ask card (your request) |
| `local-recommends` | "Of course — try 'Mama Rosa', in the old town." | the local points toward the old part of the city below, explaining; a cluster of old roofs in the distance. **No readable name.** | The recommendation card (first reveal) |
| `friendly-closing` | "Thank you! It was nice talking to you." / "You too! Enjoy the rest of your trip!" | a warm goodbye: a handshake or wave, both smiling | Closing cards |

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `mama-rosa` | the tip, found | a small, welcoming family restaurant front on a cobbled old-town street, warm lights; **no sign text** (the app writes "Mama Rosa · Old Town") | the 📍 LOCAL TIP FOUND receipt (only after the capture) |
| `small-talk-complete` | the conversation done | the traveller walking off from the viewpoint toward the old town, the local waving behind | the 💬 SMALL TALK COMPLETE receipt |

## Where each picture is used (steps)

Connect (`local-opens`, `traveler-reacts`) → Share (`origin`, `bounce-back`) → First time (`first-time`) →
Opinion (`like-it`) → Ask (`food-comment`, `ask-recommendation`) → Recommendation (`local-recommends`) →
Local Tip found (`mama-rosa`) → Close (`friendly-closing`) → … → SMALL TALK COMPLETE (`small-talk-complete`).
