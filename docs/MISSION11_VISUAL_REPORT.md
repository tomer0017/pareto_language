# Mission 11 visual production — 2026-11-03

Complete set: 11 semantic slots + 2 result props, 13 individually generated JPEGs, each 1672×941. Canonical files are under `apps/web/public/images/mission11/`:

- `scenic-viewpoint.jpg`
- `local-opens.jpg`
- `traveler-reacts.jpg`
- `origin.jpg`
- `bounce-back.jpg`
- `first-time.jpg`
- `like-it.jpg`
- `food-comment.jpg`
- `ask-recommendation.jpg`
- `local-recommends.jpg`
- `friendly-closing.jpg`
- `mama-rosa.jpg`
- `small-talk-complete.jpg`

## Production and continuity

No collage, crop-from-master, sprite sheet or prerequisite master was used. Each slot was generated separately using the written character bible. No files are shared between distinct slots; the same slot is deliberately reused for related teaching cards and across EN/ES/FR. Source prompts, paths, dimensions and final pixel hashes are recorded in `mission11-artwork.json`.

Traveler: fictional adult man in his early thirties, short dark wavy hair, teal overshirt, cream T-shirt, charcoal trousers, mustard backpack. Local: fictional adult man in his early thirties, auburn hair and beard, rust polo, beige trousers and brown belt. One warm riverside viewpoint, stone railing, wooden bench and European skyline throughout. Closing skyline and completion polo were corrected after visual review.

How-about-you uses an open hand returning conversational focus, with no arrows. The food comment uses ordinary enthusiastic gestures, with no food/restaurant hint. The request shows the traveler taking initiative. The local recommendation uses a directional gesture; its exact facts remain live application text. Closing uses small goodbye waves; completion shows the traveler departing. No baked dialogue, names, flags, labels or UI.

## Preserved learning contract

All nonvisual Mission 11 fields hash-identical to approved `1eeaa80` in EN/ES/FR. Locked dialogue, six learner lines, 32 interactions, order, prior-learning checks, bounce-back, initiative, supported/no-help/final stages and SMALL TALK COMPLETE unchanged. No `should` introduced. Existing regression checks preserve other missions.

Local Tip and Conversation Flow remain deterministic UI. Mama Rosa / Old Town choices have equal text-only treatment and no artwork clues. The scenic briefing and early images do not reveal a restaurant, name or final recommendation. Restaurant art first appears on the earned result after capture, and completion art only on the final receipt. All 13 semantic placeholder images are replaced; standard speaker, review, progress and navigation icons remain UI.

## Verification

- Mission 11: 91 tests (66 baseline + 25 artwork/integration).
- Full suite: 2,650 tests in 92 files passed.
- Typecheck, build, smoke, parity and content validation passed.
- Lint: zero errors; two existing consistent-type-import warnings in mission08.test.ts.
- Audit and conversation documents regenerated; conversation export unchanged.
- Native Chrome visual QA used real Bootcamp components in temporary 360/390/430 px frames with EN/ES/FR learning content and Hebrew interface. Reviewed briefing, teaching cards, long translated recommendation, origin/bounce-back, first-time, like-it, food/request, closing, Local Tip choices/result, Conversation Flow, supported/no-help/final screens and completion. Images remain contained, text wraps and lower cards are reachable by scroll. Correct/incorrect Local Tip feedback and correct bounce-back feedback were exercised. This is sampled screen/state QA, not nine complete manual mission playthroughs or device/browser coverage.
- Temporary QA entry points are removed and excluded from production.

## Video protection and remaining limitations

Mission 11 has no EN, ES or FR video in the current source manifest; standard missing-video behavior remains unchanged and is covered by video regressions. No video was fabricated.

All six pre-existing local video modifications are protected: en_1, en_2, en_3, en_6, en_7 and fr_3. None is changed, restored or committed. Deployment staging substitutes only committed copies into the deployment directory, leaving local files untouched. Local hashes are checked before staging. Live checks are recorded separately after deployment.

Visual limitations: separately generated images have minor fabric/pocket and background-detail variation. Identity, wardrobe colors and viewpoint remain coherent. Multi-card teaching screens require vertical scrolling on phones. Existing global speaker avatars and helper mascot are unchanged.

Pedagogical limitations: approved baseline remains frozen; native-speaker review of ES/FR is still advisable. The shared visual-match mascot uses a generic price-related Hebrew hint even on Local Tip capture. This pre-existing helper copy was observed and deliberately not changed in this artwork-only pass.

## Safety retry

Original failure: prerequisite BASE image, output-safety validation, request b618c3e0-a8a7-4896-97e7-08259e3c9387. The service did not identify a specific unsafe element. The simplified modular retry succeeded for all 13 assets; no slot remains blocked. No new slot was blocked, so independent continuation was not needed during this retry; generation was not gated on a master image. Release is permitted only for this complete, reviewed and fair set, never a partial emoji/art mix.

## Production follow-up (2026-11-04)

Initial release `9a55d98`, Pages `f7e6e52830adfdd708e86f4b853956f99dc2373e`, completed successfully. All 13 live JPEGs returned 200 with identical SHA256; six protected videos matched committed copies. EN/ES/FR Mission 11 video URLs returned 404 as expected. Browser initially retained an older bundle until hard reload. Production desktop QA then exposed a wide-card layout issue: the 600px image cap left room for text beside the image. The cap now follows the container width so image and text occupy separate rows at desktop widths as they already did on mobile. No mission content changed. A seventh unrelated video edit, fr_5.mp4, appeared during final verification and is also left untouched and excluded from deployment.
