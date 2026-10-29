# Mission 08 — Hotel Check-in: integrated visual manifest

15 semantic slots and 10 props. Shared unchanged across EN / ES / FR. Learning flow,
34 interactions, dialogue, answers and reveal timing are frozen. Owner performs manual mobile QA;
see [validation report](./MISSION08_VISUAL_REPORT.md).

## Canonical semantic slots

Paths are relative to `apps/web/public/`.

| Slot | Canonical path | Meaning |
|---|---|---|
| reservation | images/mission08/reservation.jpg | Booking confirmation object, bed/calendar/check pictograms, no stay data |
| passport | images/mission06/passport.jpg | Existing passport, reviewed from Mission 06 |
| breakfast | images/mission08/breakfast.jpg | Guest at hotel breakfast |
| how-can-help | images/mission08/how-can-help.jpg | Receptionist greeting guest |
| reservation-response | images/mission08/reservation-response.jpg | Guest presents booking |
| passport-request | images/mission08/passport-request.jpg | Empty requesting hand; passport still held by guest |
| passport-handoff | images/mission08/passport-handoff.jpg | Passport physically transferred across desk |
| room-floor-key | images/mission08/room-floor-key.jpg | Receptionist gives sage key; figures supplied separately |
| breakfast-question | images/mission08/breakfast-question.jpg | Guest asks, breakfast room cue, no hours |
| breakfast-hours | images/mission08/breakfast-hours.jpg | Receptionist answers with breakfast context; no numbers |
| elevator-right | images/mission08/elevator-right.jpg | Elevator on guest/screen right |
| enjoy-stay | images/mission08/enjoy-stay.jpg | Guest leaves with key, receptionist waves |
| room-204 | images/mission08/room-204.svg | Authored deterministic teaching illustration of 204 |
| second-floor | images/mission08/second-floor.svg | Authored deterministic teaching panel, 2 highlighted |
| key | images/mission08/key.jpg | Same sage key with brass emblem |

## Props

| Prop | Representation |
|---|---|
| phone | images/mission06/phone.jpg, reused |
| floor-1 / floor-2 / floor-3 | Typed numeric UI symbols 1 / 2 / 3, three props |
| elevator-panel | Deterministic CSS lift doors and ↕ symbol |
| corridor-left / corridor-right / corridor-ahead | images/mission08/lobby.jpg, one neutral scene with equal direction controls |
| guest | ↑ UI direction symbol; suppressed in immersive lobby rendering |
| desk | images/mission08/lobby.jpg, shared scene |

## Production rules and UI

13 separately generated JPEGs; no collage, contact sheet, or crops used to derive assets.
Every JPEG retains its 1672×941 source dimensions (quality 90 compression, no resizing).
Source paths and prompts: [provenance](./mission08-artwork.json). The two SVGs are authored
1600×900 product UI, not AI art. There are 17 distinct referenced files including two M06 reuses.

Room choices 204 / 214 / 240 and hours 7–10 / 7–9 / 8–10 remain text buttons of identical style.
The floor game uses equal circular controls vertically ordered 3 / 2 / 1, with lift doors beside them.
The direction game retains the original LEFT / RIGHT / AHEAD choices. One neutral lobby replaces
three repeated tiles; 52px arrows have equal treatment. Correct selection reveals the elevator-right
scene; no elevator is shown before selection. Wrong selection retains existing feedback/retry behavior.

Stay data is rendered as a two-column, four-cell grid using exactly the existing progressively
revealed string. Unknown facts remain ?. No semantic slot or game falls back to emoji.
Existing UI icons in the stay card remain intentional UI. No separate language artwork.
