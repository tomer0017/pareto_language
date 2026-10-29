# Mission 08 — visual integration and release report

Date: 2026-10-29. Baseline: `68fa035`. Branch: `main`.

## Result

15 final semantic slots, 10 props, 34 meaningful interactions, identical EN/ES/FR artwork.
13 separately generated JPEGs (each 1672×941, quality 90, no resizing or cropping), two authored
1600×900 SVG teaching visuals, and two Mission 06 reuses. Runtime M08 art totals about 5.9 MiB.
[Canonical manifest](./MISSION08_ASSET_MANIFEST.md) · [source provenance](./mission08-artwork.json).

Generated files under `apps/web/public/images/mission08/`:

- `how-can-help.jpg`
- `reservation.jpg`
- `reservation-response.jpg`
- `breakfast.jpg`
- `passport-request.jpg`
- `passport-handoff.jpg`
- `room-floor-key.jpg`
- `key.jpg`
- `breakfast-question.jpg`
- `breakfast-hours.jpg`
- `elevator-right.jpg`
- `enjoy-stay.jpg`
- `lobby.jpg`

Reused: `images/mission06/passport.jpg` and `images/mission06/phone.jpg`.
Authored UI files: `room-204.svg`, `second-floor.svg`; no AI-rendered digits.

## Continuity and meaning

Guest: consistent curly brown hair, teal overshirt, cream shirt, mustard backpack and suitcase.
Receptionist: consistent black bob, burgundy blazer and ivory blouse. Key: sage card with brass
sun emblem in assignment, object and farewell images. Hotel: warm globe lights, walnut slats,
curved walnut/travertine desk, brass sun emblem, sage upholstery. Each final scene was inspected
individually. Request shows an empty receiving hand; handoff shows physical transfer; assignment
shows the same key. Booking and breakfast question contain no future stay data or readable hours.

Remaining visual limitation: generated images are not a geometrically locked 3D environment.
The neutral lobby's three equivalent arches and front-desk emblem differ from the answered scene's
wall emblem and elevator layout. Materials, objects and character identities remain coherent.
Phone-size rendering/gesture readability and a first-time viewer direction check still need the
owner's manual review. No automated test can certify image semantics or character identity.

## Deterministic UI and fairness

- Room: equal text choices 204 / 214 / 240; no generated room-choice images.
- Floor: equal circular numeric buttons 3 / 2 / 1, vertical physical order, CSS lift doors beside them.
  `MapCell.symbol` separates non-linguistic digits/arrows from target-language labels. Prior-learning
  logic is unchanged. Teaching-only `second-floor.svg` highlights 2 after its reveal.
- Hours: equal text ranges 7–10 / 7–9 / 8–10, one choice, no toggles.
- Direction: one neutral lobby and three equal 52px LEFT / RIGHT / AHEAD arrow controls. AHEAD is
  retained to preserve the approved choices. Correct answer reveals the elevator-right scene;
  wrong answers retain feedback/retry without revealing the scene. No preselected/bright correct side.
- Stay summary: four app-rendered cells in a 2×2 grid, 1rem text, existing unknown/partial/complete
  values only. Prefix/suffix copy remains intact. No new state or inferred facts.
- Every choice set uses a consistent representation. Passport/phone/booking are all final art;
  key/passport are both final art; floor, number and hour games are all deterministic UI.
- No M08 semantic emoji fallback remains. Existing stay-card UI icons are intentional and preserved.

## Validation

61 Mission 08 tests and **2,318 total tests across 86 files passed**. Full suite includes Mission
01–08, priorLearning, artwork contracts and renderer tests. Typecheck, lint, build, smoke, parity,
content validation and `git diff --check` passed. Practice audit regenerated; conversation generation
produced no dialogue changes. Tests prove locked dialogue tree and other missions byte-identical,
34 interactions, progressive reveal, coverage, teach-before-test, guest production, receptionist
comprehension, supported/no-help/final check-in and CHECK-IN COMPLETE unchanged.

Rendering tests verify four stay cells in every reveal state, neutral lobby only before selection,
three equal direction controls, and numeric floor rendering. They do not substitute for browser QA.
No new pedagogical weakness identified; no pedagogy edited. Existing native review limitations
for ES/FR remain outside this visual pass.

## Mobile QA

Owner explicitly chose **manual mobile QA** in this conversation on 2026-10-29. Agent browser
inspection at 360/390/430 in EN/ES/FR is waived. Computer Use remained pending Accessibility and
Screen Recording permissions; Playwright was not used. No viewport is falsely marked passed.

Owner checklist for each of the nine language/width combinations: briefing, reservation scene and
builder, passport request/handoff, room choice, floor panel, key handoff, breakfast question/hours,
elevator direction, initial/partial/complete stay card, supported and final check-in. In particular,
confirm four readable stay cells at 360px, intact gestures, and unambiguous left/right perspective.

## Videos

Public production HEAD verification: EN `/videos/en/en_8.mp4` = **200 video/mp4**;
ES `/videos/es/es_8.mp4` = **404**; FR `/videos/fr/fr_8.mp4` = **404**.
Runtime catalog exposes only EN; ES/FR safely skip video. No video or fallback behavior changed.

## Changed files

- `apps/web/public/images/mission08/`: 13 JPEGs and two SVGs.
- `practiceArrival.ts`: canonical M08 slots/props and presentation opt-ins.
- `types.ts`, `author.ts`: optional hotel presentation fields and typed numeric UI symbols.
- `PracticeSteps.tsx`: immersive lobby, numeric symbols and stay-summary rendering.
- `HotelStaySummary.tsx`, `Bootcamp.tsx`, `styles.css`: progressive 2×2 summary and scoped hotel styling.
- `mission08.test.ts`: artwork, regression and renderer tests.
- This report, manifest/provenance, generated practice audit, STATUS, architecture, master overview
  and project structure docs.

## Release

Commit/push/deploy and production asset verification are performed after the validation above.
Exact release IDs and verification results are recorded in the delivery message. Mobile interaction
and CHECK-IN COMPLETE in the live browser remain owner QA; automated data/renderer regressions pass.
