# Mission 19 — Public Transport (Catch Your Train): artwork manifest

**Status: PLACEHOLDERS — VISUAL PRODUCTION REQUIRED IN ASTRA PASS.** No image generation was available in
the build pass, and no stock photography is used. Every slot below is an emoji placeholder in code
(`M19_SLOTS` / `M19_PROPS` in `apps/web/src/features/bootcamp/practiceTransport.ts`) until its artwork
exists. To integrate a picture, set `image: 'images/mission19/<slot>.jpg'` on the slot. The line cards,
the briefing and the result all read from the slot.

Asset-light on purpose: six context pictures and one result picture. Seven files in all.

## One continuous world

- **the journey**: one ordinary city station and one train ride, the same day, the same light;
- **the traveller**: the same adult traveller as Missions 11–18;
- **the staff**: one ticket clerk at the desk, who is also the person on the train who says "I'll tell you
  when". The Hebrew copy is gender-neutral about them; draw any adult in a plain uniform (no logo).

Style: one consistent premium illustration style (polished 3D animated, warm, clean, bright: the
Missions 13–17 house style). Not photorealistic, no collages. **No text in any picture**: no platform
numbers, no signs, no departure boards, no prices, no clocks with a readable time, no line numbers, no
station or stop names, no brand or operator names. The same art serves EN / ES / FR.

## Context slots (16:9)

16:9, at least 1536 px wide. Mobile safe area: keep the subject in the central 70%. The card crops nothing
(`bigPictures`).

| Slot | Semantic purpose | Composition | Used in |
|---|---|---|---|
| `desk` | "Where are you headed?" / "One ticket to the centre, please." / "That's three euros…" | the ticket desk from the traveller's side: the clerk behind a glass window, a small card reader. **No price screen, no fare table, no timetable** | briefing; Buy, Fare cards |
| `tickets` | "Single or return?" / "Single, please." | the clerk holding up ONE paper ticket; nothing printed on it. Single vs return is shown by the deterministic ➡️ / ↔️ UI, never by the art | Single-or-return cards |
| `platform` | "Which platform?" / "Platform two. Straight ahead." | a station concourse: a corridor straight ahead toward the platforms. **No platform number, no arrow, no sign**: the number and the direction are UI | Which-platform, Platform cards |
| `train` | "The train's right here. Hop on." | a train at the platform, doors open, the traveller about to step in | Board-and-check card ("Hop on") |
| `onboard` | "Yes — it's three stops. I'll tell you when." | inside the carriage: the traveller seated, the clerk (or a conductor-like figure) nodding reassuringly. **No route map, no stop display, no count of stops** | Three-stops card |
| `museum` | "Does this stop at the museum?" / "Your stop is next. Enjoy the museum!" | a classical museum façade seen from a station exit. No name on the building, no stop sign | Museum-question card; Next-stop card |

## Props: result picture (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `ride-complete` | you made it | the traveller stepping off the train and walking toward the museum, with the train behind | the 🚆 RIDE COMPLETE receipt |

## What stays deterministic UI (never art)

- **🚆 Your ride**: the two-column travel ticket (Destination · Ticket · Price · Every ‖ Platform · Museum
  · Get off). Every row is "?" until a line of the conversation has said it;
- **Single / Return**: ➡️ "One way — there only" / ↔️ "There and back", captioned in the app language;
- **€3 · every 10 min**: four combined fare tiles (`💶 €3 · 🕒 10 min` (a no-break space keeps "10 min" together) and three distractors made of the same
  known numbers);
- **Platform Finder**: six ordered tiles, platforms 1–3 × ⬆️ straight / ⬅️ left;
- **Route strip**: 🚉 Start → 🛑 1 → 🛑 2 → 🏛️ 3 · Museum, with ● where you are; then "🏛️ Next: Museum";
- **Stops board**: three ordered tiles, 🛑 1 · 🛑 2 · 🛑 3;
- **Get off**: 🚪 next stop · 🛑 three more stops · ↩️ missed it, captioned in the app language.

## Spoiler rules (tested by step order: `mission19.test.ts`)

- The briefing (`desk`) shows the destination only: the centre and the museum. It shows no ticket type, no
  price, no time, no platform, no direction, no stop count.
- Before "Single or return?" nothing shows Single. Before the fare line nothing shows €3 or 10 minutes.
  Before "Platform two. Straight ahead." nothing shows platform 2. Before "it's three stops" nothing shows
  3 stops. Before "your stop is next" nothing shows Next.
- No picture is ever the only copy of an answer: the platform number, the price, the frequency, the stop
  count and "next" live in the UI only (a test pins that no slot contains a digit, an arrow or €).
- `onboard` shows no stop display and no route map: the route strip is the only place the stops appear.
