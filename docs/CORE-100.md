# READY Core 100 — the emoji-first vocabulary pilot (SUPERSEDED)

> **Superseded by the Core Corpus (Core 500)** — see **[CORE-CORPUS.md](./CORE-CORPUS.md)**. The
> 100 pilot concepts were migrated verbatim (same slugs, ids, emoji, examples) into
> `content/core-corpus/data/visual-pilot.ts`; the old `content/core-en` builder was retired.
> This document remains as the historical record of the pilot's methodology and validation.

> The first **real** slice of Core Words: 100 high-value, emoji-representable travel words used to
> validate the word-learning system (Core Words · Picture Quiz · Swipe Recall · audio · translations
> · review events) end to end. **Not** the full Core 1500 — a deliberately small, quality-first pilot.

## 1. Where it lives (concept-first, one source of truth)

```
content/core-en/pilot100.ts        ← AUTHORED source (100 words: en, he, emoji, category, tier,
                                       skill, rof, visual confidence, example)
        └─ corpus.ts (pure)        ← transforms + validation (validatePilot, buildConcepts, …)
        └─ build-core-en.ts        ← CLI: validates, then emits the two artifacts below
content/concepts/core-en.yaml      ← GENERATED canonical ConceptSchema concepts
   → pipeline (stageResearch/validation)   → seed (seedConcepts → Mongo, idempotent)
apps/web/public/content/core-en.v1.json ← GENERATED offline pack (PWA-precached)
   → Core Words list + Picture Quiz + Swipe Recall (shared/content/coreWords.ts)
```

One authored file → one canonical concept set → two consumers (Mongo seed + offline app pack). No
second vocabulary system; nothing is hand-authored in a React constant. Regenerate with
`npm run build:core-en` (also runs inside `npm run build:content`).

## 2. Selection methodology

Every concept must clear **both** bars:

1. **Communication value** — real travel/everyday utility (survival, transaction, health, orientation),
   consistent with the Pareto corpus methodology (`content/core-en/core100.draft.yaml` holds the wider
   function-word research set, e.g. *where/when/want/need* — high value but no picture).
2. **Visual clarity** — a single, unambiguous emoji, because this pilot exists to validate the emoji
   games. A word is not included *just* because it has an emoji; it must still earn its place on value.

`visualConfidence` (0–1) records how cleanly the emoji reads as that exact meaning, and feeds future
distractor-safety tuning. No two concepts share an emoji (enforced), so a quiz never shows a picture twice.

## 3. Category distribution (balanced for distractor testing)

| Category | n | | Category | n |
|---|---|---|---|---|
| Food & drink | 15 | | Weather | 6 |
| Objects | 12 | | People & family | 6 |
| Places | 11 | | Animals | 5 |
| Body | 8 | | Nature | 5 |
| Clothing | 8 | | Activities | 5 |
| Health & emergency | 8 | | Directions | 4 |
| Transport | 7 | | **Total** | **100** |

No category is so small that questions repeat options, nor so dominant that distractors are trivial.

## 4. Required data per concept

`conceptId` · English realization · Hebrew gloss · part-of-role (kind=word) · category · tier
(layer) · rank (1–100) · `emoji` · `iconEligible: true` · `visualConfidence` · example (en+he) ·
situation links · quality status. The `Concept` schema was extended (additively, all optional) with
`emoji`, `iconEligible`, `visualConfidence`, `rank`, `example`.

## 5. Translation quality (honest status)

Hebrew is **human-authored, natural** (no transliteration; sense-disambiguated, e.g. *card = כרטיס
אשראי* vs *ticket = כרטיס*). Every realization ships as `ai_reviewed` with `reviewNotes: "pending
native Hebrew review"` — **not** `native_reviewed`. No fabricated native review.

## 6. Game eligibility & emoji rules

- A concept is game-eligible when `iconEligible: true` and it has an `emoji`.
- Emoji must be unique across the set (validated) and depict the concept directly (arrows for
  directions, the object/animal/food itself otherwise).
- Picture Quiz builds each question from a target + three **other** words' emoji, deduped.

## 7. Validation gates (Task D1)

`validatePilot` throws (failing the build) on: not exactly 100 · duplicate slug/id · duplicate emoji
· missing en/he/emoji/category/example · unmapped category · out-of-range visualConfidence · bad rof.
Unit-tested in `content/core-en/core-en.test.ts`; seed idempotency proven in `server` tests.

## 8. Expanding 100 → 300 → 1500

1. Add rows to `pilot100.ts` (or a sibling `pilot300.ts`) with the same fields + a unique emoji.
2. Relax the exact-100 gate to the new target; keep every other invariant.
3. `npm run build:core-en` regenerates the canonical concepts + offline pack; `seedConcepts` upserts
   idempotently; the games and Core Words pick up the larger set with **zero component changes**.
4. Before scaling: commission the **native Hebrew review** (flip `ai_reviewed → native_reviewed`),
   and add real audio recordings under `apps/web/public/audio/en/` (TTS is the current fallback).

## 9. Known limitations

- Hebrew is AI-reviewed, pending native sign-off (Safety: no fake review).
- Audio is Web-Speech TTS; no per-word recordings yet (swap-in path exists).
- A handful of concepts have lower `visualConfidence` (e.g. *wind 💨*, *market 🏪*, *friend 👫*) — kept
  for value; candidates for an image (not emoji) in a later iteration.
- Other learning languages (es/fr/it/ar) are intentionally **not** realized for the pilot; the draft
  holds their meanings for future expansion.
