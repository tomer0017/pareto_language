# Mission 15 — final minimal visual pass

Approved baseline: `be3cfe7`. Visual production and integration only.

## Artwork and integration

Five teaching slots, one result prop, **six independent final JPEGs**, all 1672 × 941:

| File under `apps/web/public/images/mission15/` | Treatment |
|---|---|
| `waiter.jpg` | Single traveler and attentive waiter, before kitchen discussion; briefing and early questions. |
| `nuts.jpg` | Prominent recognizable mixed nuts; allergy ingredient concept, never a served dish or safety assurance. |
| `vegetarian.jpg` | Vegetable-based plate, no obvious meat/fish; generic category, not the ordered risotto. |
| `dairy.jpg` | Milk glass and small cream jug; cream response and later retrieval. |
| `onions.jpg` | Whole onion, half and slices; existing removal-function retrieval only. |
| `kitchen-check.jpg` | Same traveler waiting, same waiter walking toward the open kitchen with notepad; no meal or approval. |

`kitchen-check-sent` reuses the whole kitchen-check image, keeping the six-file ceiling while giving all
four mini-game situations equal artwork. No additional teaching slot or interaction. Mission 14 supplied
character/world reference only: no two-diner asset was copied into this one-diner visit. Traveler retains
curly dark hair, teal overshirt, cream shirt and mustard backpack; waiter retains dark curly hair, white
rolled sleeves, charcoal waistcoat and green apron. Oak table, cream/walnut walls, amber lights and evening
window preserve restaurant continuity. No baked text, medical imagery, safety badge, thumbs-up or eating.

Built-in imagegen used, one whole image per generation. Exact prompts: `mission15-prompts.json`.
Pixel-bound manual semantic review and dimensions: `mission15-artwork.json`. Tests verify reviewed file
hashes; these are not automated face/ingredient recognition and never establish real food safety.

## Frozen behavior and safety

All nonvisual mission data in EN/ES/FR hashes identically to `be3cfe7`: locked dialogue, IDs, order,
20 meaningful interactions, five learner turns, four functions, supported/no-help/final and no Flex.
Optional exposure still does not become guaranteed learning. Mission 24's explicit `should` teaching and
regression remain intact. No curriculum files or other mission implementations changed.

Food Check remains deterministic UI. Personal needs appear from briefing; dish vegetarian and nuts checking
follow the risotto line; cream/removability follows the cream line; kitchen notification follows the tell line.
Nuts remain unknown/checking, never confirmed safe. Final receipt explicitly says to wait for the answer.
The dairy-question teaching card uses the waiter image, avoiding cream artwork before the NPC response.
Kitchen artwork first appears with the kitchen-check NPC line. UI checkmarks concern vegetarian status and
notification only, not nut safety. The unchanged comprehension board includes an incorrect “He said: no nuts”
choice; it is a distractor, not a status or assurance.

The mini-game now supports images through one optional `situationImage` field passed through authoring and
rendering. All four situations use the same image class, aspect ratio and presentation; answers remain text.
Legacy situation emoji prefixes are suppressed only when artwork is present, including feedback text.
Text-only rounds preserve their existing rendering. Final teaching slots have no emoji fallback. Functional
UI icons and the uniformly styled comprehension tiles remain. All three languages use the same six files.

## Validation

- Mission 15: **67 existing + 18 artwork tests = 85 passing**.
- Full suite: **3,157 passing, 100 files**, including prior learning, optional-content, semantic senses,
  coverage, Mission 24 and Missions 01–15 regression.
- Typecheck passed; lint passed with two pre-existing Mission 08 type-import warnings, no errors.
- Build passed; existing bundle-size warning remains. Final bundle: `index-BtgEU-8z.js`;
  stylesheet: `index-DHeZTycG.css`.
- Smoke passed. Language parity gate passed (FR/ES core and bootcamp complete; foundation examples remain
  partial as reported by the existing command). Content validation passed for its configured Italian pack,
  182 items / 10 situations. EN/ES/FR M15 parity is separately enforced by mission tests.
- Practice audit regenerated; only Mission 15 artwork descriptions changed.
- The final mobile-only CSS adjustment was rechecked in Safari and all 18 artwork tests rerun successfully.

## Mobile inspection

Real Safari rendering through a temporary local harness, using the actual Bootcamp component in 360, 390
and 430 CSS-pixel frames; EN/ES/FR learning languages, English interface. Reviewed briefing, allergy,
vegetarian, kitchen-check line, nuts comprehension board, dairy question/cream response, onion transfer,
kitchen notification/final waiter line, mini-game, supported conversation, no-help, final, pending receipt
and summary. Long French dairy and Spanish restriction lines wrap. Complete images remain visible without
cropping. Food Check distinguishes personal facts from restaurant results. No horizontal overflow observed.
Long cards require vertical scrolling. Found and fixed French mini-game caption obstruction by reserving
280px below M15 image situations only; confirmed caption clearance and decoded artwork at all three widths.

Real clicks were performed: English wrong answer → retry → correct answer → next, nuts answer and onion
round; French all four mini-game rounds completed into supported conversation, and a supported reply's
correct feedback inspected. This is sampled interaction QA, not every answer branch in every width.
Native automation briefly rejected an English onion click as offscreen; French completion subsequently
verified the same component's full progression. Missing-video step was observed automatically advancing to
the final in English; all three language missing-video paths are covered by existing tests.
The temporary harness was removed before commit and is not deployed.

Remaining visual limitation: long teaching cards need scrolling; general vegetable artwork does not prove
any particular dish's ingredients. Remaining pedagogical limitation: none introduced; native-language review
is still recommended by the frozen baseline. No out-of-scope optional-branch or hint issues were changed.

## Videos and release

EN 15 / ES 15 / FR 15 remain absent; no video fabricated. All **26 existing MP4s** match their pre-pass SHA-256,
including committed `en_1`, `en_2`, `en_3`, `en_6`, `en_7`, `fr_3`, `fr_5`, `fr_6`.
Release commit, push, deployment hash and production HTTP/hash results are recorded in the delivery message.
Production verification uses live artifact equality with this tested build, plus URL checks; local mobile
interaction inspection must not be represented as an exhaustive production click-through.
