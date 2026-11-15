# Mission 17 — visual production and integration report

Baseline: `0fa3c26cfb1cac84a5fc96d86d9a89a5e7bbf361` on current main; origin/main matched before release.

## Assets and art direction

Ten independent built-in imagegen generations, one meaning per file, no collages or stock photographs.
Six square product illustrations share warm ivory background, diffuse upper-left light, slight top-down
three-quarter framing, centered whole objects, equal tile treatment and quality-85 JPEG encoding.
Their different silhouettes naturally occupy different areas; no correct-answer-specific emphasis.
Scenes match Mission 16's curly-haired traveler, teal shirt, cream tee and mustard backpack. One dark-bob
cashier in a green apron is reused. Context and result stay 16:9; subjects and bag handles are intact.
All art was reviewed for absence of readable text, aisle/location cues and payment actions.

| Exact asset path | Pixels | Bytes | Design / meaning |
|---|---:|---:|---|
| `images/mission17/milk.jpg` | 1024×1024 | 134,909 | One white unlabelled carton with blue cap and lower band, entirely visible on ivory background. |
| `images/mission17/water.jpg` | 1024×1024 | 123,580 | One clear water bottle with pale blue cap, no soda branding or label, entirely visible. |
| `images/mission17/bread.jpg` | 1024×1024 | 234,551 | One short plump whole golden loaf, generic bread without baguette or sliced-bread cues. |
| `images/mission17/cheese.jpg` | 1024×1024 | 115,090 | One plain yellow wedge with round holes, no garnish or other food, entirely visible. |
| `images/mission17/eggs.jpg` | 1024×1024 | 198,458 | Six whole uncooked eggs in a small open cardboard tray, no cooked breakfast context. |
| `images/mission17/apples.jpg` | 1024×1024 | 257,126 | Three red apples grouped alone with stems, no mixed fruit or juice, entirely visible. |
| `images/mission17/shop.jpg` | 1672×941 | 597,021 | Consistent traveler and floor assistant inside generic supermarket; no aisle number, arrows, checkout or location cue. |
| `images/mission17/checkout.jpg` | 1672×941 | 466,587 | Consistent traveler and cashier with exactly one milk carton and inactive blank-screen terminal; no payment action, bag, price or receipt. |
| `images/mission17/bag.jpg` | 1672×941 | 460,979 | Same cashier holds one ordinary plain paper bag with intact handles; same traveler and supermarket background. |
| `images/mission17/quick-shop-complete.jpg` | 1672×941 | 508,850 | Same traveler leaves supermarket carrying one small plain bag; same cashier waves; no exact mission data or text. |

Source prompts: [MISSION17_IMAGE_PROMPTS.json](MISSION17_IMAGE_PROMPTS.json). Exact JPEG hashes and
manual semantic-review records: [mission17-artwork.json](mission17-artwork.json).

## Integration and frozen contract

All nine slots and the result have production paths. Six products switch together in word cards and
Shelf Scan; each of its **three** rounds retains **three** image choices, with targets **cheese, eggs,
apples**. No captions or visible product labels were added. Alt text remains for accessibility.

The aisle remains six ordered deterministic tiles in a **3-column × 2-row** grid, no image/emoji fields,
answer `a3l` (3 left). No shop scene contains aisle numbers or direction cues. Checkout and bag assets
appear only at their existing stages, and completion art only at the result. The silent checkout cue
remains UI-only. Payment still uses captioned CASHIER_SIGNALS; the contextual terminal does not depict
payment. Sprint progress remains existing built UI. Bread/cheese transfer stays two transfer-only rounds
using the existing emoji/text cue contract, which has no image hook.

Exactly **18 meaningful interactions: 10 teaching + 3 No Help + 5 Final**. All canonical EN/ES/FR
transcript and dialogue-tree fingerprints remain unchanged. New SHA-256 tests also pin every nonvisual
byte of all three mission objects against the baseline. No new words, exercises, Flex, prices, teaching,
coverage changes or audio changes. All three languages reuse exactly the same image mapping.

The only runtime rendering change is two Mission-17-specific CSS rules allowing shop/checkout/bag
cards to wrap and display wide scenes. Product cards/tiles keep existing square sizing. No shared
component logic changed. Historical raw snapshot tests in Missions 18/19 normalize only former M17
visual fields; their expected hashes are unchanged. The existing M16 normalizer remains intact.

## Verification

- Mission 17 contract: **63 tests passed**; artwork: **17 passed**.
- Mission 17/18/19 targeted run: **181 passed** before adding the 17 artwork tests.
- Full suite: **3,556 tests / 106 files passed**, including M16 artwork, priorLearning, optional content,
  transferOnly, semantic-sense, M18 checkpoint, M19 and video resolver coverage.
- Typecheck passed. Lint: zero errors, two pre-existing type-import warnings in mission08.test.ts.
- Production build passed (existing large-bundle advisory). Smoke passed.
- Language parity gate passed: core corpus/Bootcamp 100%; existing foundation examples 199/435.
- Configured content validator passed (Italian 182 items / 10 situations; not a native-language review).
- SHA-256 comparison: **227 existing image/video files unchanged**, including every Mission 16 asset.
  No Mission 17 video was created; resolver code unchanged.

## Mobile QA — distinguish the evidence

Local Safari QA uses the actual Bootcamp component at 360/390/430px in isolated iframes. Animations are
disabled only in the temporary harness to prevent background iframe animation stalls. The harness is
removed before commit and is not included in production.

**Real click-through:** EN at 360px from Shelf Scan through all three rounds, milk question, bread and
cheese transfers, aisle, checkout, bag, payment, supported conversation, three No Help rounds, video
safe skip, five Final stages and Quick Shop Complete. All correct answers accepted, progress advances.
The supported conversation's checkout scene cue was visible without becoming a spoken line.

**Screenshot inspection:** product tile recognition at 360/390/430, all product silhouettes intact;
EN progression and completion at 360; FR checkout cards in Hebrew UI at all widths (including scrolled
second card); ES bag cards in English UI at all widths; Hebrew aisle board at all widths. All are
readable, controls reachable, context art contained; long cards need normal vertical scrolling.

**Render measurements:** all 27 step entry points × EN/ES/FR × English/Hebrew UI ×
360/390/430px = **486 rendered viewports passed**: expected frame URL, images decoded, no horizontal overflow.
Video step auto-skips as designed. This measures each step entry, not every internal round; all three
Shelf Scan rounds were separately clicked in EN and rendered in automated EN/ES/FR tests.
Measurements establish image decoding and no horizontal overflow, not a manual click-through of every
language/width combination. Initial premature measurements without loaded frames were retried after
waiting for the expected page and all three frame titles.

Remaining limitations: human aesthetic QA is sampled, not a pixel-by-pixel review of every permutation;
no real iOS/Android hardware test. The existing foundation-brick banner can add vertical height.
There is no claim of native linguistic review or exhaustive unrelated production interaction testing.

## Release

Release commit, push, deploy, live bundle, HTTP checks and production UI results are appended after release.

## Exact implementation files changed

- `apps/web/src/app/styles.css`
- `apps/web/src/features/bootcamp/practiceSupermarket.ts`
- `apps/web/src/features/bootcamp/mission17.test.ts`
- `apps/web/src/features/bootcamp/mission17Artwork.test.ts`
- `apps/web/src/features/bootcamp/mission17Artwork.testSupport.ts`
- `apps/web/src/features/bootcamp/mission18.test.ts`
- `apps/web/src/features/bootcamp/mission19.test.ts`
- `docs/MISSION17_ASSET_MANIFEST.md`
- `docs/MISSION17_IMAGE_PROMPTS.json`
- `docs/mission17-artwork.json`
- `docs/MISSION17_VISUAL_REPORT.md`
- `docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md`
- `apps/web/public/images/mission17/apples.jpg`
- `apps/web/public/images/mission17/bag.jpg`
- `apps/web/public/images/mission17/bread.jpg`
- `apps/web/public/images/mission17/checkout.jpg`
- `apps/web/public/images/mission17/cheese.jpg`
- `apps/web/public/images/mission17/eggs.jpg`
- `apps/web/public/images/mission17/milk.jpg`
- `apps/web/public/images/mission17/quick-shop-complete.jpg`
- `apps/web/public/images/mission17/shop.jpg`
- `apps/web/public/images/mission17/water.jpg`
