# Mission 09 — final visual integration report

2026-11-02. Baseline: `57e4ec4`. Production release details are reported with the delivery message.

## Inventory and continuity

13 semantic slots + 2 canonical props + 2 supplemental scenes = **17 separately generated JPEGs**, each 1672 × 941, JPEG quality 90 without cropping or resizing. Canonical directory: `apps/web/public/images/mission09/`. Provenance, prompts, dimensions and SHA-256 checksums: `mission09-artwork.json`.

- `store-browse.jpg`
- `salesperson-offers-help.jpg`
- `just-looking.jpg`
- `take-your-time.jpg`
- `selected-item.jpg`
- `try-this-on.jpg`
- `fitting-room.jpg`
- `too-small.jpg`
- `ask-bigger-size.jpg`
- `one-size-up.jpg`
- `sale-reveal.jpg`
- `take-it.jpg`
- `till.jpg`
- `purchase-complete.jpg`
- `store-layout.jpg`
- `racks.jpg`
- `entrance.jpg`

The shopper retains her dark bob, cream knit top, charcoal trousers and white sneakers. The female salesperson retains short dark curls, navy polo and beige trousers. Oak fixtures, dark metal racks, cream walls and sage fitting curtains connect the store scenes. The item remains a rust-orange stand-collar zip garment with two diagonal welt pockets; no clothing-category vocabulary was added. The M fit problem precedes the same item's L handoff. Visual continuity was reviewed directly; checksum tests bind that review to the shipped files, rather than claiming that code can infer pixel semantics.

## Integration and fairness

One `store-layout.jpg` contains racks, sage-curtained fitting booths with mirrors, checkout with register/payment terminal, and the entrance. Four equally styled, equally sized semantic hit areas overlay the scene. Both navigation tasks retain existing feedback and semantic answer IDs. Tests reorder cells and change grid positions to confirm correctness is not derived from array position. The scene's destinations remain geographically consistent, as in a real store.

S/M/L/XL remain four ordered, equal text cells, with M marked as current and L the answer. Discount choices remain equal text tiles, shuffled as before, with 20% correct. No data selection uses generated artwork. Shopping Journey remains application UI: two columns at narrow widths, final stage spanning the row, revealed only after the fitting-room stage. All canonical semantic emoji fallbacks are removed; interface/status/role icons remain. No choice set mixes semantic emoji with final art.

Opening art shows browsing only: no sale tags, percentage, replacement size, purchased bag or completed payment. Sale artwork is introduced at the approved salesperson reveal; its tag is blank. Sizes and exact percentages are never baked into images. The purchase-decision scene precedes checkout; the completion bag appears only at the final receipt. EN/ES/FR share identical paths and timing.

## Verification

- Mission 09: **81 passing tests** (53 pedagogy regression + 28 artwork/renderer contracts).
- Full suite: **2,439 tests / 88 files passed**, including prior learning and Missions 01–09 regression.
- Typecheck, production build, smoke, language parity and content validation passed.
- Lint: zero errors; two existing Mission 08 consistent-type-import warnings.
- Locked dialogue, 33 interactions, four learner production lines, no NPC production, M→L, 20%, supported/no-help/final runs, learnedBefore and coverage preserved.
- Browser QA used real Bootcamp components in 360/390/430 CSS-pixel viewports. EN/ES/FR briefing, help, try-on, bigger-size, sale, size/discount controls, navigation, supported/no-help/final layouts and completion were inspected. Multi-card content scrolls; images preserve their full aspect ratio. English fitting-room, checkout, L and 20% selections were exercised at all three widths. Temporary QA entry points were removed before release.

## Scope and limitations

Changed implementation: `practiceArrival.ts`, `types.ts`, `author.ts`, `Bootcamp.tsx`, `PracticeSteps.tsx`, `styles.css`; tests: `mission09.test.ts` and new `mission09Artwork.test.ts`; 17 images; asset manifest/provenance/report; four living docs and regenerated practice audit. Other mission data and video-safe behavior are unchanged.

Remaining visual limitation: subtle fabric texture and lighting vary between generated camera views; item color, garment design, character outfits and identities remain recognizable. Mobile QA was desktop Chrome at phone viewport widths, not physical iOS/Android testing. No new pedagogical weakness was identified; this pass did not redesign or independently reassess the approved pedagogy.

EN and FR Mission 09 videos exist locally. ES is missing as expected; no dummy was created and the existing audio/missing-video fallback remains intact. Exact production URL results are checked after deployment.
