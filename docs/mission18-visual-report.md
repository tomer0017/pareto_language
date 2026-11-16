# Mission 18 visual polish

Presentation-only checkpoint pass. Zero generated images, zero reused raster images, zero video. Existing coffee, friends, supermarket and restaurant art was inspected; small deterministic icons provide sufficient context without spoilers or heavy scene interruptions.

## Design

Quick Scan uses one central card, dominant concealed Try First panel, secondary Show options/Help and six neutral context icons. Help adds a calm hint panel. Diagnostic misses retain their existing behavior. Quick Fix is a small warm card with phrase, meaning, replay and one retry. Final repair uses the same compact system with a warm background.

One-Take has a compact responsive 2×2 four-scene journey: current emphasized, completed checked, upcoming subdued. Headers identify Morning, Plans, Supermarket and Dinner. Silent cues remain muted text. A turtle marks slow retry; a lightbulb replaces the red reveal icon. Location and payment captures remain deterministic existing UI.

Readiness has a large title, one supporting line and five consistent capability rows. READY is calm green, ALMOST amber, REVIEW muted rose. Outcomes use check/help/recovery/review symbols. Both full scene lists are omitted from the final report; no numeric score. Existing copy and report data remain intact.

## Validation

- Mission 18 frozen contract: 52 passing; added presentation tests: 4 passing.
- Full suite: 3,560 tests, 107 files passing, including checkpoint engine, M16/M17 artwork and priorLearning.
- Typecheck, build, smoke, parity and content validation pass.
- Lint: zero errors; two pre-existing Mission 08 dynamic-import warnings.
- Static browser render QA: all 18 requested states at 360/390/430 for EN with English UI, ES with English UI, FR with Hebrew RTL UI (162 viewport renders). Final measured renders have no horizontal overflow or controls below 44px. Early transient navigation measurements were repeated successfully.
- Screenshots reviewed across all 18 states; long French and Spanish lines wrap. The narrow four-column journey was changed to 2×2 after visual inspection.
- These are real-browser renders of reachable engine-driven fixtures, not full adaptive click-through. Local Help was additionally clicked and verified. Production click-through results are recorded separately below.

## Scope

Mission 18’s existing hub video-coming-soon placeholder is suppressed, with no video resolver changes.

Runtime files: `apps/web/src/features/bootcamp/Bootcamp.tsx`, `apps/web/src/app/styles.css`, `apps/web/src/features/bootcamp/CheckpointStep.tsx`.
Test files: `apps/web/src/features/bootcamp/mission18Visual.test.ts`, `apps/web/src/features/bootcamp/mission18Visual.testSupport.ts`.
Documentation: this report and production verification evidence.

Checkpoint engine, curriculum, fingerprints, language wording, serialization, readiness calculation, six probes, 17 One-Take moments, two silent cues, adaptive repairs and all media remain unchanged. Shared shown-answer replay receives the existing 44px class; other checkpoint presentations retain their prior appearance.

Remaining limits: emoji appearance varies across operating systems; screenshot QA uses desktop Safari at mobile CSS widths, not physical iOS/Android devices. Audio quality and hardware touch behavior were not evaluated. No new artwork was necessary.

## Production verification and release

Implementation commits: `2e5e01d` (UI/tests) and `356cfd1` (M18 hub placeholder). Both pushed to main. Final deploy: `cbfb872e9eb154d1d555934f3ea08b5c66af101a`; Pages workflow `43842884779` succeeded. Live JS `index-D5BkZO4L.js`, CSS `index-C1BKCCKw.css`, both byte-identical to the build. See `mission18-production-verification.json`.

Real production click-through in Safari:
- EN: all six clean probes skipped Quick Fix; all four scenes and both comprehension captures completed; READY with five Independent outcomes.
- ES: Help displayed the hint/options; three diagnostic misses produced targeted cards/retries; completed all four scenes and captures; ALMOST READY with three Recovered outcomes.
- FR: three diagnostic misses, unresolved repairs, first-miss slow retry, second-miss reveal and supported pick; all four scenes and captures; final repair capped at two; REVIEW NEEDED with Shopping and Restaurant marked Needs review.
- Concealed first attempts, options, checkout/Later cues and report content were observed during these flows. No duplicate scene lists or numeric scores in the checkpoint reports. No video step/player or final hub placeholder. The code/media contract confirms no M18 video; network request tracing was not performed.
- Live M16 friends artwork and M17 product artwork were visually inspected. All ten M17 images and M16 friends also returned HTTP 200 with exact build bytes. English language selection restored.

Native background Safari screenshots occasionally captured an unpainted animation frame despite an interactive accessibility tree. Raising the window produced a fully painted REVIEW report and M16/M17 screenshots. Readiness layout at all three levels was separately screenshot-reviewed in the local mobile harness; production interaction outcomes were verified through live controls/accessibility state.

Final hub-only adjustment: all 56 M18 contract/presentation tests passed again and the complete production build passed. The normal build wrapper hit a sandbox IPC restriction in tsx; equivalent content build commands ran through `node --import tsx`, then the standard web build succeeded.
