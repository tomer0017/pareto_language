# Mission 16 visual production report

Baseline: `0893606` on current `main`, including Missions 17–19. Release prepared 2026-11-13.

## Artwork and integration

Eight independent built-in imagegen generations; no collage, sprite sheet, stock substitution or
crop-derived asset. Prompts: `MISSION16_IMAGE_PROMPTS.json`. Pixel hashes and manual semantic review:
`mission16-artwork.json`. Every file is an optimized JPEG (quality 85), native 1672 × 941, approximately
16:9. All paths below are relative to `apps/web/public/`.

| File | Bytes | Meaning and spoiler boundary |
|---|---:|---|
| `images/mission16/friends.jpg` | 658403 | Two consistent young adult male travelers chatting at a sunny coastal cafe; no hobby gear, school or plan. |
| `images/mission16/surfing.jpg` | 739444 | Primary traveler actively riding a wave; full board visible, focused neutral expression, no preference symbols. |
| `images/mission16/drawing.jpg` | 654416 | Primary traveler drawing with pencil touching sketchbook in neutral daylight; no evening or preference cue. |
| `images/mission16/music.jpg` | 632454 | Primary traveler listening through visible over-ear headphones; no instrument, performance or preference symbols. |
| `images/mission16/running.jpg` | 683137 | Primary traveler jogging with whole body and both feet visible; neutral expression, no dislike or exhaustion cue. |
| `images/mission16/diving.jpg` | 696627 | Primary traveler underwater with mask, tank, regulator and fins; no school, friend or future-plan information. |
| `images/mission16/diving-school.jpg` | 852104 | Small coastal dive center beside sand and sea, tanks masks fins visible; no text, travelers or tomorrow plan. |
| `images/mission16/free-time-match.jpg` | 736835 | Same two friends holding scuba masks outside the same dive center; result-only shared activity reinforcement. |

The art uses a sunny coastal town, ivory stucco, blue trim, warm natural materials and adult cinematic
illustration. The primary traveler follows the Mission 15 reference: curly dark hair, light olive
skin, teal overshirt and cream tee; practical teal sports/scuba clothes for those activities. The
friend retains swept straight dark hair, medium brown skin, rust shirt and sand trousers. Both return
in the result. Facial identity is less visible behind the scuba mask, naturally.

All five hobbies have identical resolution, rendering classes, image placement and semantic treatment.
The runner has a neutral expression. Drawing uses daylight with no evening cue. Surfing has no love
symbol. The friends image has no equipment, school or plan. School art appears only at its existing
NPC card; shared diving context is reserved for the earned result. There is no generated text.

Seven `M16_SLOTS` and the one `M16_PROPS` image are connected through existing hooks. Prime images wrap
above their text at full card width. Sorting images use the existing complete-frame `object-fit:
contain` presentation ABOVE four category tiles; no image enters an answer tile. Category/time/plan
UI, shuffle behavior and answer order logic are unchanged. Semantic emoji remain slot fallback
metadata; real images are primary. No new failed-network fallback behavior was introduced.

Rendered Final showed duplicate hobby emoji beside its new art. The only shared renderer change adds
🏄 / 🏃 / 🤿 to the existing image-conditional prefix filter. Original situations remain byte-identical;
text-only rounds retain emoji. Mission 15 and legacy behavior are regression-tested. Mission 16-only
CSS also reserves clearance for three translated answer buttons.

## Frozen content and verification

The original transcript, dialogue-tree and interaction fingerprint expectations were NOT changed.
The 22 meaningful interactions remain 10 teaching + 5 No Help + 7 Final. IDs, wording, prior learning,
coverage, progressive reveal, sorting answers, profile, audio and later mission content are unchanged.
An added SHA-256 check compares all nonvisual Mission 16 data against the pre-edit baseline in EN/ES/FR.

Historical raw snapshots in Mission 17–19 include Mission 16 visual fields. A test-only helper
reconstructs just the former Mission 16 presentation for those snapshots, preserving every original
expected hash. It does not modify runtime data or omit nonvisual fields. The generated practice audit
was refreshed; only the Mission 16 icon metadata changed as images replaced emoji.

| Gate | Result |
|---|---|
| Mission 16 original contract/coverage | 65 passed |
| Mission 16 production artwork | 15 passed |
| Missions 17–19 targeted regression | 181 passed |
| Full suite, including Missions 01–19, prior learning, optional content and semantic sense | 105 files, 3,539 tests passed |
| Typecheck | passed |
| Lint | no errors; two pre-existing type-import warnings in mission08.test.ts |
| Production build | passed |
| Smoke | passed, including offline cache and progress persistence |
| Language parity | gate passed; core corpus and Bootcamp 100%; existing foundation example coverage remains 199/435 |
| Content validation | passed for configured Italian pack: 182 items, 10 situations |
| Existing image/video byte comparison | 219 files unchanged |

No M16 video was created. Existing safe-skip behavior remains covered by the contract tests.

## Mobile QA: scope and evidence

Local Safari harness used actual Bootcamp components at 360, 390 and 430 CSS pixels, for EN/ES/FR
learning languages with both English and Hebrew interface languages. It mounted existing states
without modifying curriculum. Entry animations were disabled only in this temporary harness to
avoid Safari background-frame animation stalls. The harness is excluded from the release.

State-render checks visited briefing, friends, all hobby cards and sorting rounds, time choice,
diving-school, return question, plan card/choice, supported conversation, No Help and result in all
six language/interface combinations. Separate actual Quick Reply renders inspected Final surfing,
running and diving. Screenshot review sampled these states across the matrix; this is NOT a claim
that every state/language combination received a screenshot or that every path was clicked through.
Early harness measurement labels sometimes lagged navigation, so a complete automated zero-overflow
matrix is NOT claimed.

Visual samples confirmed full surfboard, drawing hand/paper, headphones, running feet and scuba gear
remain visible. Text wraps in French/Spanish and RTL interfaces. Category buttons remain separated
and large. The profile stays readable at 360px, though full prime cards require vertical scrolling.
The result keeps one picture above deterministic information. No new visual information appears in
early profile states.

Real local click-through: Final opening answer → feedback → surfing situation. Remaining checks
above are state rendering and automated regression, not an end-to-end learner completion claim.
Production verification is recorded separately below when complete.

## Changed files

- `apps/web/public/images/mission16/`: eight JPEGs listed above.
- `apps/web/src/features/bootcamp/practiceHobbies.ts`: image mappings and status comment only.
- `apps/web/src/features/bootcamp/PracticeSteps.tsx`: three image-conditional emoji prefixes.
- `apps/web/src/app/styles.css`: Mission 16 image framing and answer clearance.
- `mission16.test.ts`, `mission16Artwork.test.ts`, `mission16Artwork.testSupport.ts` in the same bootcamp directory.
- `mission17.test.ts`, `mission18.test.ts`, `mission19.test.ts`: historical visual normalization only.
- `docs/MISSION16_ASSET_MANIFEST.md`, `MISSION16_IMAGE_PROMPTS.json`, `mission16-artwork.json`, this report.
- `docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md`: regenerated Mission 16 icon metadata.

No other mission artwork, curriculum or video changed. Remaining visual limitation: the school gear
is smaller than the activity subjects at 360px, but tanks and beach remain readable. Static QA does
not certify every device or browser.

## Release and live verification — 2026-11-13

- Implementation commit: `8afbb723885be0f23c82e90eb461da34133690bc`; pushed successfully to `origin/main`.
- gh-pages commit: `f8fb81c43be1a20407b0d4c428dfca6108be37cb`.
- GitHub Pages deployment [43439501206](https://github.com/tomer0017/pareto_language/actions/runs/43439501206): completed successfully.
- Live site: https://tomer0017.github.io/pareto_language/
- Live JS: `assets/index-C83QJjAH.js`; live CSS: `assets/index-Dh2Cgk3T.css`.
- All eight images and both bundles returned HTTP 200 and matched the tested build byte-for-byte.
  Exact responses/hashes are recorded in `mission16-production-verification.json`.
- Real production click-through, English: all five hobby sorting rounds; evening choice; return
  question; tomorrow choice; complete supported dialogue; all five No Help rounds; all seven Final
  rounds; FREE TIME MATCH and summary. Progressive profile state and final shared plan were observed.
- Real production Spanish and French: mission loads, transcript/briefing, image cards, opening reply,
  surfing sorting and earned profile update. Full translated journeys were covered by local state
  rendering and regression, not full production click-through.
- No-video flow visibly skipped from the No Help receipt directly to Final. No network trace was
  captured; absence of an M16 video request is established by the unchanged resolver and tests,
  rather than a claimed browser network recording.
- An initially open Safari tab still had the previous cached application. Reloading after successful
  deployment loaded the new artwork and approved current-main Mission 16 flow; no cache configuration
  change was needed.
- Working tree was clean after the implementation commit. This documentation-only follow-up records
  the production evidence; final cleanliness is checked after its commit/push.
