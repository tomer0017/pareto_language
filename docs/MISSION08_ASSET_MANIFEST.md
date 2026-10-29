# Mission 08 — Hotel Check-in: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Every slot is an emoji placeholder (`M08_SLOTS` /
`M08_PROPS` in `apps/web/src/features/bootcamp/practiceArrival.ts`, `image` unset). To integrate: put
the file at `apps/web/public/images/mission08/<filename>` and set the slot's `image`. One file per asset
— never a collage cut up later.

## One continuous world

The same **guest** (the traveller of Missions 05–07), the same **receptionist**, the same **front desk**,
the same **key card**, the same **lobby** and **elevator**. Premium polished 3D animated illustration,
warm evening light. **No text in the picture** — no room numbers, no signs (figures are shown by the app).
Wide, ~16:9, ≥ 1200 px, JPEG. Shared by EN / ES / FR.

**Fairness (tested):** a round never mixes artwork with emoji — assets marked **[game: …]** ship together.

## Group 1 — what the guest knows

| File | Slot | Meaning | Composition | Used in |
|---|---|---|---|---|
| `reservation.jpg` | `reservation` | the booking | the guest's booking confirmation (printout or phone screen, no readable text) | Step 0 "reservation"; **[game: hand-off]** |
| `passport.jpg` | `passport` | passport (review) | the guest's passport in hand — may reuse Mission 06's `passport.jpg` | Step 0; **[game: hand-off]**; the key round's second tile |
| `breakfast.jpg` | `breakfast` | breakfast | a hotel breakfast buffet | Step 0 "breakfast" |

## Group 2 — the reception scenes

| File | Slot | Meaning | Composition |
|---|---|---|---|
| `how-can-help.jpg` | `how-can-help` | "Good evening! How can I help you?" | receptionist smiling at the guest arriving with a suitcase |
| `reservation-response.jpg` | `reservation-response` | "I have a reservation, under the name Cohen." | the guest speaking, booking in hand (also Step 0 "name") |
| `passport-request.jpg` | `passport-request` | "Welcome, Mr. Cohen. Your passport, please." | receptionist holding out a hand |
| `passport-handoff.jpg` | `passport-handoff` | "Here you go." | the guest handing the passport across the desk |
| `room-floor-key.jpg` | `room-floor-key` | the room line (room · floor · key) | receptionist talking while sliding a key card across |
| `breakfast-question.jpg` | `breakfast-question` | "Is breakfast included?" | the guest asking, a breakfast-room doorway visible |
| `breakfast-hours.jpg` | `breakfast-hours` | "Yes! Breakfast is from seven to ten…" | receptionist answering, pointing at a (text-free) clock |
| `elevator-right.jpg` | `elevator-right` | "The elevator is on your right." | the guest's view facing the desk; the elevator clearly to the guest's RIGHT |
| `enjoy-stay.jpg` | `enjoy-stay` | "Enjoy your stay!" | the guest walking off, key in hand, receptionist waving |

## Group 3 — information objects

| File | Slot | Meaning | Composition |
|---|---|---|---|
| `room-204.jpg` | `room-204` | your room | a hotel room door (no number painted — the app shows 204) |
| `second-floor.jpg` | `second-floor` | the second floor | the elevator arriving at a floor; floor indicator without digits |
| `key.jpg` | `key` | your key | the same key card, close up — **[game: key]** with `passport` |

## Props — picture-only (ship with their games)

| File | Prop | Composition | Ships with |
|---|---|---|---|
| `phone.jpg` | `phone` | the guest's phone (may reuse Mission 06 `phone.jpg`) | **[game: hand-off]** |
| `floor-1.jpg` / `floor-2.jpg` / `floor-3.jpg` | `floor-1…3` | three identical elevator buttons — the app overlays nothing, so each button shows its own digit (1 / 2 / 3) | **[game: floor panel]** |
| `elevator-panel.jpg` | `elevator-panel` | the lift doors beside the panel (not tappable) | **[game: floor panel]** |
| `corridor.jpg` | `corridor-left` / `-right` / `-ahead` | ONE corridor picture used three times — the corridors must look identical, only their side differs | **[game: lobby]** |
| `guest-top.jpg` | `guest` | the guest seen from behind/above, facing the desk | **[game: lobby]** |
| `desk-top.jpg` | `desk` | the reception desk from the guest's side | **[game: lobby]** |

Room numbers (204 · 214 · 240) and breakfast hours (7–10 · 7–9 · 8–10) stay as figures — no artwork.
