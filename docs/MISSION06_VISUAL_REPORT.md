# Mission 06 artwork production report

Production: 2026-10-26. Validation status updated 2026-10-27.

23 standalone images generated with the built-in imagegen tool, one call per asset. No grids,
collages, panel extraction, upscaling, padding, stretching or cropping. Two initial object drafts
(phone and suitcase) were rejected because they retained the passport-booth composition; both
were regenerated with the object as the focal point. Every selected image was inspected separately
at generation time. Original PNGs remain at the source paths recorded in `mission06-artwork.json`.
That file also records the scene prompt set, sizes, byte counts and encoding settings.

## Asset inventory and exact registry mapping

Every runtime path is `images/mission06/<filename>`, stored under `apps/web/public/`.
Every file uses JPEG quality 90 via macOS sips, without changing pixel dimensions.

| Registry | Key | Filename | Original pixels | Runtime pixels | Bytes |
| --- | --- | --- | --- | --- | --- |
| M06_SLOTS | `passport` | `passport.jpg` | 1672×941 | 1672×941 | 332,647 |
| M06_SLOTS | `holiday` | `holiday.jpg` | 1672×941 | 1672×941 | 416,068 |
| M06_SLOTS | `week` | `week.jpg` | 1672×940 | 1672×940 | 314,974 |
| M06_SLOTS | `two-weeks` | `two-weeks.jpg` | 1672×941 | 1672×941 | 273,626 |
| M06_SLOTS | `hotel` | `hotel.jpg` | 1672×941 | 1672×941 | 581,609 |
| M06_SLOTS | `city-centre` | `city-centre.jpg` | 1672×941 | 1672×941 | 937,868 |
| M06_SLOTS | `hotel-city-centre` | `hotel-city-centre.jpg` | 1672×941 | 1672×941 | 771,385 |
| M06_SLOTS | `nothing-to-declare` | `nothing-to-declare.jpg` | 1672×941 | 1672×941 | 423,472 |
| M06_SLOTS | `passport-question` | `passport-question.jpg` | 1672×941 | 1672×941 | 379,025 |
| M06_SLOTS | `purpose-question` | `purpose-question.jpg` | 1672×941 | 1672×941 | 399,891 |
| M06_SLOTS | `duration-question` | `duration-question.jpg` | 1672×941 | 1672×941 | 409,348 |
| M06_SLOTS | `where-staying-question` | `where-staying-question.jpg` | 1672×941 | 1672×941 | 446,454 |
| M06_SLOTS | `anything-to-declare` | `anything-to-declare.jpg` | 1672×941 | 1672×941 | 397,969 |
| M06_SLOTS | `almost-done` | `almost-done.jpg` | 1672×941 | 1672×941 | 394,214 |
| M06_SLOTS | `welcome-enjoy-stay` | `welcome-enjoy-stay.jpg` | 1672×941 | 1672×941 | 392,369 |
| M06_PROPS | `phone` | `phone.jpg` | 1672×941 | 1672×941 | 273,763 |
| M06_PROPS | `suitcase` | `suitcase.jpg` | 1672×941 | 1672×941 | 380,221 |
| M06_PROPS | `work` | `work.jpg` | 1672×941 | 1672×941 | 397,936 |
| M06_PROPS | `study` | `study.jpg` | 1672×941 | 1672×941 | 415,495 |
| M06_PROPS | `red-channel` | `declare.jpg` | 1672×941 | 1672×941 | 408,885 |
| M06_PROPS | `house` | `house.jpg` | 1672×941 | 1672×941 | 686,047 |
| M06_PROPS | `airport` | `airport.jpg` | 1672×941 | 1672×941 | 564,773 |
| M06_PROPS | `hotel-outskirts` | `hotel-outskirts.jpg` | 1672×941 | 1672×941 | 736,810 |

## Integration and visual review

- All 15 slots and eight props use canonical images; EN / ES / FR share them.
- Passport / phone / suitcase, holiday / work / study, both customs lanes, and all four selectable
  accommodation cells use generated artwork. Matching answers and calendar options reuse the same assets.
- The traveler retains curly brown hair, teal shirt, cream undershirt and mustard backpack.
  The officer retains dark hair in a bun and a navy uniform. Airport scenes share teal glass,
  pale counters and warm lighting. The leisure scene uses shorts; the airport scenes use trousers.
- One week highlights seven cells; two weeks highlight fourteen cells in two consecutive rows.
  The duration question highlights no answer. Hotel imagery uses a bed symbol rather than words.
- Existing wide prime cards are preserved. Map cells gained optional image support; other missions
  do not opt into it. Calendar options gained optional image support, also only used by Mission 06.
- Non-selectable map scenery and interface symbols remain glyphs; no selectable picture answer
  or learning picture card is emoji-only.
- Remaining review: live mobile card readability, map thumbnail cues, overflow, audio usability,
  supported/no-help interviews, final gate, replay and production UI at 390 / 360 px.
  Computer Use could not run because Accessibility and Screen Recording permissions were not granted.
  On 2026-10-27 the owner explicitly waived agent mobile QA and will perform it manually.
  These runtime checks are NOT claimed passed; they no longer block the authorized release.

## Automated validation

- Mission 06: **58 / 58 passed**.
- Missions 01–06 regression: **314 / 314 passed**.
- Full suite: **2,124 / 2,124 passed**, 84 files, no skips in the successful run.
- Typecheck, lint, build, smoke, language parity and content validation passed.
- 37 interactions unchanged; dialogue tree fingerprints unchanged in EN / ES / FR.
- Traveler profile, answer keys, coverage, strict teach-before-test and replay contracts passed.
- Missions 01–05 and 07–30 retain their original runtime fingerprints.
- Generated practice audit was refreshed; conversation generation produced no content change.
- Initial sandbox runs could not open local sockets; the successful full run used the authorized
  execution permission required by the test database and tsx IPC.
- Existing build warning: a bundle exceeds the recommended 500 kB chunk size.

## Release status

Release to main and production authorized by the owner on 2026-10-27, with mobile QA assigned
to the owner. Automated checks passed as listed above. Release hashes and live HTTP verification
are reported in the delivery message after deployment. Browser interaction checks remain manual.

## Files changed

- `apps/web/public/images/mission06/`: the 23 JPEGs listed above.
- `practiceArrival.ts`: canonical mappings and their use in Mission 06 only.
- `types.ts`, `author.ts`, `PracticeSteps.tsx`: optional map/calendar image rendering.
- `mission06.test.ts`: exact mapping, file, resolution, uniqueness and fairness checks.
- `docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md`: generated runtime audit.
- `docs/STATUS.md`, `docs/ARCHITECTURE.md`: current integration and release status.
- `docs/mission06-artwork.json`, this report: provenance and validation evidence.
