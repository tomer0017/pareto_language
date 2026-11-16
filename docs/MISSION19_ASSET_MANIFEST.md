# Mission 19 — Public Transport (Catch Your Train): artwork manifest

**Status: COMPLETED — seven generated production assets integrated.** Built-in imagegen was used, one call per asset, seven calls total. Full-resolution JPEG conversion only; no extra images or video. Runtime mappings are in `M19_SLOTS` / `M19_PROPS` in `practiceTransport.ts`.

Asset-light on purpose: six context pictures and one result picture. Seven files in all.

## One continuous world

- **the journey**: one ordinary city station and one train ride, the same day, the same light;
- **the traveller**: one consistent adult traveler throughout Mission 19: olive skin, wavy dark hair, teal overshirt, cream shirt and tan backpack;
- **the staff**: one ticket clerk at the desk, who is also the person on the train who says "I'll tell you
  when". The Hebrew copy is gender-neutral about them; draw any adult in a plain uniform (no logo).

Style: premium realistic-polished cinematic travel illustration, adult and friendly, warm daylight. User art direction supersedes the earlier placeholder brief. No answer-bearing text, platform numbers, arrows, prices, times, stop counts or route information. Same artwork for EN/ES/FR.

## Context slots (16:9)

16:9, at least 1536 px wide. Mobile safe area: keep the subject in the central 70%. The card crops nothing
(`bigPictures`).

| Slot | Semantic purpose | Composition | Used in |
|---|---|---|---|
| `desk` | "Where are you headed?" / "One ticket to the centre, please." / "That's three euros…" | the ticket desk from the traveller's side: the clerk behind a glass window, a small card reader. **No price screen, no fare table, no timetable** | briefing; Buy, Fare cards |
| `tickets` | "Single or return?" / "Single, please." | a physical ticket on the counter, with only an abstract train silhouette and no readable data. Single vs return is shown by the deterministic ➡️ / ↔️ UI, never by the art | Single-or-return cards |
| `platform` | "Which platform?" / "Platform two. Straight ahead." | a station concourse: a side-on platform environment with the traveler; no directional corridor. **No platform number, no arrow, no sign**: the number and the direction are UI | Which-platform, Platform cards |
| `train` | "The train's right here. Hop on." | a train at the platform, doors open, the traveller about to step in | Board-and-check card ("Hop on") |
| `onboard` | "Yes — it's three stops. I'll tell you when." | inside the carriage: the traveller seated, the clerk (or a conductor-like figure) nodding reassuringly. **No route map, no stop display, no count of stops** | Three-stops card |
| `museum` | "Does this stop at the museum?" / "Your stop is next. Enjoy the museum!" | a classical museum façade seen from a station exit. No name on the building, no stop sign | Museum-question card; Next-stop card |

## Props: result picture (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `ride-complete` | you made it | the traveler approaching the same museum, naturally satisfied | the 🚆 RIDE COMPLETE receipt |

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

## Production files and crop

All paths are under `apps/web/public/images/mission19/` (served as `images/mission19/`). All seven JPEGs are 1672×941. Context cards wrap above their text and retain the whole landscape; briefing/result use the existing full-width image treatment. No crop encodes route data.

| Filename | Meaning / usage | Crop | Spoiler constraints |
|---|---|---|---|
| desk.jpg | Counter / briefing, buy and fare cards | Full landscape | No fare, type, platform or destination answers |
| tickets.jpg | Physical ticket / type cards | Full landscape | No Single/Return distinction, text, price or arrows |
| platform.jpg | Platform setting / platform cards | Full landscape | No number, direction or arrows |
| train.jpg | Boarding / hop-on card | Full landscape | No destination or route information |
| onboard.jpg | Inside train / stops card | Full landscape | No museum, map or stop count |
| museum.jpg | Museum exterior / destination and next-stop cards | Full landscape | No stop count or Next indication |
| ride-complete.jpg | Arrival / final result only | Full landscape | No text, score, trophy or route data |

## Generation prompts and review

Shared prompt: one landscape 16:9 premium realistic-polished cinematic painted travel illustration; warm daylight; adult friendly natural anatomy; central mobile-safe composition; no readable signage, numbers, arrows, prices, times, stop counts, maps, logos or collage. Traveler: olive skin, dark wavy hair, light stubble, teal overshirt, cream shirt, tan backpack. Desk reference anchored traveler/clerk identity; platform anchored train style; museum anchored arrival architecture.

Per-asset prompt subjects: desk—traveler conversing with navy-uniformed clerk at modern ticket counter; tickets—blank physical ticket with abstract train silhouette; platform—side-on station setting without directional gesture; train—traveler stepping into open silver/blue train; onboard—traveler seated with same clerk reassuring nearby, only trees outside; museum—unlettered classical stone museum with sculpture; ride-complete—same traveler approaching same museum with natural satisfied smile.

All seven generated outputs visually reviewed. Desk has small decorative ticket markings, no legible journey data; tickets has a train silhouette only. No artwork reveals the frozen exact answers. SHA-256 and source filenames are recorded in `mission19-artwork.json`.

## QA and freeze verification

- All 66 Mission 19 contract tests and 4 artwork tests pass. Full suite: 3,564 tests / 108 files.
- Typecheck, lint, production build and smoke pass. Full-suite database tests require local port permission; they passed with that permission.
- Nonvisual SHA-256 snapshots match main `ad27f40` for EN/ES/FR, including all wording, 20 interactions, four production tools, route/ticket data and the unchanged video safe-skip step. No video file or resolver was modified.
- Static browser render QA: desk, tickets, ticket-type, fare, platform, train, onboard, museum, route and result at 360/390/430 in EN/ES/FR: 90 viewport renders. No horizontal overflow; measured controls >=44px. French/Spanish wrapping and full landscape crops reviewed. Long two-card screens scroll vertically as before. No ticket/route redesign.
- QA rendered existing production components in a temporary harness (removed before build), not a claim of complete adaptive click-through or physical-device testing. Initial incomplete frame measurements were repeated successfully.
- Contract-test maintenance only: strip the literal `images/mission19/` path prefix before checking for answer digits, and require completed manifest status. Dialogue hashes and interaction expectations unchanged. Generated practice audit updated for the visual references.
