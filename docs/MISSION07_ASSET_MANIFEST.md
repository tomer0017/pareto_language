# Mission 07 — Taxi / Uber: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Mission 07 ships with emoji placeholders in every
slot (`M07_SLOTS` / `M07_PROPS` in `apps/web/src/features/bootcamp/practiceArrival.ts`, `image` unset).
To integrate an asset: put the file at `apps/web/public/images/mission07/<filename>` and set that
slot's `image: 'images/mission07/<filename>'`. One file per asset — never a collage, storyboard or
contact sheet that is cropped later.

## One continuous world

Every image belongs to ONE ride. Keep identical across all assets:

- **the traveller** — the same adult tourist (as in Missions 05–06: straw hat, backpack), in the back seat;
- **the driver** — one taxi driver, same face, hair, clothes, in every scene;
- **the taxi** — one car: same colour and livery, same interior, same **meter** (shows a fare in figures
  only) and dashboard;
- **the route** — one European city: a road into the centre, then a street with the traveller's address.

Style: premium polished 3D animated illustration, cinematic, warm, high detail, clean. Not
photorealistic, not emoji art. **No text in the picture** (no signs, no words; figures on the meter and on
money are allowed: €15, €20, €5). The same art serves EN / ES / FR.

Format: wide, ~2:1 (or 16:9), ≥ 1200 px wide, JPEG (full quality). The cards draw them full width at
their own shape (`widePictures`) — nothing is cropped. Map tiles and board tiles use the same files.

## Fairness rule (tested)

Assets that appear in the same game must arrive TOGETHER and at the same quality — a test refuses a
round that shows artwork beside emoji (the answer would show by its quality alone). The groups that
must ship together are marked **[game: …]**.

## Group 1 — the ride's objects

| File | Slot | Meaning | Composition | Used in |
|---|---|---|---|---|
| `address.jpg` | `address` | the address, on the traveller's phone | the traveller's hand holding a phone up toward the driver; the screen shows a map pin (no readable text) | Step 0 "address"; **[game: hand-off]** with `suitcase`, `map` |
| `centre.jpg` | `centre` | the city centre | the city centre seen ahead through the windscreen: squares, old buildings | Step 0 (none yet — reserved); the road map's "centre" tile |
| `fifteen-euros.jpg` | `fifteen-euros` | about €15 | close-up of the taxi meter showing **€15** | Step 0 "fifteen euros"; the fare card |
| `traffic.jpg` | `traffic` | a lot of traffic | the road ahead jammed: many cars, brake lights, the taxi barely moving | Step 0 "traffic"; the traffic card; **[game: road]** with `clear-road`, `side-street` (map) and `clear-road` (boards) |
| `speak-slowly.jpg` | `speak-slowly` | slowly | reserved for the idea "slowly" (e.g. the traveller's hand gesturing "slow down", calm) — not yet placed on a card | (reserved) |
| `stop-here.jpg` | `stop-here` | here — your stop | the taxi pulling up at the traveller's address (a doorway / building front, no house number text) | Step 0 "stop"; **[game: street]** with `stop-too-early`, `stop-too-late`, `taxi` |
| `change.jpg` | `change` | change (money back) | a €5 note and a few coins in the driver's open hand | Step 0 "change" |

## Group 2 — the taxi scenes

| File | Slot | Meaning | Composition | Used in |
|---|---|---|---|---|
| `where-to.jpg` | `where-to` | "Hello! Where to?" | the driver turning to the traveller who just got in, friendly, asking | destination card |
| `give-address.jpg` | `give-address` | "To this address, please." | the traveller showing the phone to the driver and speaking | destination card |
| `off-we-go.jpg` | `off-we-go` | "Got it. No problem — off we go!" | the driver nods, hands on the wheel, the taxi pulls away | "off we go" card |
| `fare-question.jpg` | `fare-question` | "How much to the centre?" | the traveller leaning forward, asking; the meter visible but not yet showing a fare | fare card |
| `driver-fast-fare-traffic.jpg` | `driver-fast-fare-traffic` | the driver's answer, FAST | the driver talking quickly (motion lines / animated mouth), gesturing at the meter (€15) and the jam ahead; the traveller visibly lost | recovery card |
| `recovery-request.jpg` | `recovery-request` | "Sorry, please speak slowly." | the traveller, hand raised politely, asking him to slow down | recovery card |
| `driver-slow-repeat.jpg` | `driver-slow-repeat` | the same answer, SLOWLY | the driver calm, pointing at the meter (€15), then the traffic — the traveller understanding (relief) | recovery card |
| `okay-thanks.jpg` | `okay-thanks` | "Okay, thank you." | the traveller smiling, thumbs up / nodding | recovery card |

## Group 3 — arrival and payment

| File | Slot | Meaning | Composition | Used in |
|---|---|---|---|---|
| `almost-there.jpg` | `almost-there` | "…We are almost there." | the taxi turning into the traveller's street; the address building ahead | arrival card |
| `here-okay.jpg` | `here-okay` | "Is here okay?" | the driver slowing, looking back, gesturing at the kerb by the address | arrival card |
| `stop-scene.jpg` | `stop-scene` | "Stop here, please." | the traveller pointing at the address, the taxi stopping | arrival card |
| `keep-change.jpg` | `keep-change` | "Keep the change." | the traveller waving off the €5 the driver offers back — he keeps it, pleased | payment card; **[game: payment]** with `change-back` |
| `goodbye.jpg` | `goodbye` | "Thank you very much! Enjoy your trip!" | the traveller on the pavement with the bag, the driver waving from the window | payment card |

## Props — picture-only, never named in the learning language

| File | Prop | Composition | Ships with |
|---|---|---|---|
| `suitcase.jpg` | `suitcase` | the traveller's suitcase on the back seat | **[game: hand-off]** |
| `map.jpg` | `map` | a folded paper city map | **[game: hand-off]** |
| `clear-road.jpg` | `clear-road` | a different road, empty and green | **[game: road]** |
| `side-street.jpg` | `side-street` | a quiet residential side street | **[game: road]** |
| `stop-too-early.jpg` | `stop-too-early` | a shop front just before the address | **[game: street]** |
| `stop-too-late.jpg` | `stop-too-late` | an office building past the address | **[game: street]** |
| `change-back.jpg` | `change-back` | the driver handing €5 back into the traveller's hand | **[game: payment]** |
| `taxi.jpg` | `taxi` | the taxi seen from above (map marker) | **[game: road]**, **[game: street]** (not tappable) |

The fare board (€5 · €15 · €50) stays as figures — no artwork needed.
