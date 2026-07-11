# READY Core Corpus — the production multilingual corpus (Core 500)

> The first production-ready slice of READY's vocabulary: **500 language-independent concepts**,
> selected by communication coverage (not raw frequency), realized per learning language, and
> consumed by Core Words, Picture Quiz, Swipe Recall and the review engine. Built so that adding
> **French (or any language) requires content only — never code.**

## 1. Philosophy

READY is not a dictionary and not Duolingo. The corpus teaches the smallest amount of language
that produces the largest increase in real communication (Pareto). Every concept must justify its
slot; every inclusion visibly displaced a rejected candidate (docs/CORPUS-METHODOLOGY.md is the
governing spec — this file is its Core-500 application).

The two-sided rule added in this sprint: every concept is scored on **both channels** —
**Communication** (value when the traveler says it) and **Recognition** (value when someone else
says it). Many winners are recognition-heavy (*Here you go / platform / departures*): failing to
decode them is what causes freezes, so hear-channel ≥ say-channel at equal impact.

## 2. Where it lives (one source of truth)

```
content/core-corpus/
  types.ts               ← CorpusRow model, CATEGORIES taxonomy, DECLARED_LANGS, CORPUS_SIZE
  data/*.ts              ← AUTHORED rows, grouped by domain (visual-pilot, glue, numbers-time,
                            actions, descriptions, food-places, transport-money, health-people,
                            objects-home) — concat in data/index.ts
  corpus.ts              ← PURE transforms: validateCorpus · rolScore · rankRows · buildConcepts
                            · buildPackWords(lang) — no file I/O, fully unit-tested
  build-core.ts          ← CLI (npm run build:core): validates, then emits the two artifacts
  core-corpus.test.ts    ← gates + the future-language proof
content/concepts/core-corpus.yaml          ← GENERATED canonical ConceptSchema concepts
   → pipeline (stageResearch) → seed (seedConcepts → Mongo, idempotent upsert by id)
apps/web/public/content/core-{lang}.v1.json ← GENERATED offline pack PER LANGUAGE (PWA-precached)
   → Core Words + Picture Quiz + Swipe Recall (shared/content/coreWords.ts, lang-parameterized)
```

No second vocabulary system exists. The Core 100 emoji pilot (`content/core-en/`) was migrated
into `data/visual-pilot.ts` **with identical slugs, ids, emoji and examples** — Mongo upserts stay
idempotent, review events keep their item ids, no user progress was reset.

## 3. Selection methodology

Candidates were drawn from the intersection of published high-frequency lists — spoken-corpus
rankings (SUBTLEX/COCA-style spoken frequency), Oxford 3000 / CEFR A1–A2 inventories — and READY's
travel-moment coverage grid (the ~10 core situations), then filtered through the methodology
gates (encounter likelihood, ability delta, reuse, conversation unlock, no higher-ROL substitute,
RoF recorded, Pareto fit). Scores are **expert-calibrated estimates informed by those sources**,
not machine-extracted counts — the cohort-telemetry flywheel (§6 of the methodology) is the
designed replacement. Never-Teach rules were applied strictly: no 21–99 numbers (generator-drilled),
no grammar-infrastructure cards, no production idioms, no synonym #2 (*that works / not a problem*
were rejected as near-dups of owned functions — see docs/EXPRESSION-RESEARCH.md).

**Frozen no-duplicate rule:** meanings already owned by the Bootcamp concept set
(`missions-core.yaml`: thank-you, sorry, I-don't-understand, repeat, slowly, one-moment, how-much)
are NOT re-created in the corpus. One meaning = one concept, everywhere.

## 4. Per-concept metadata (the scorecard)

Authored per row: `slug` (stable id) · kind · **pos** · gloss (en+he) · category · layer (1–4:
Survive/Transact/Adapt/Connect) · **RoF** 1–3 · skill target · role (say/hear/recovery) ·
`s: [freq, comm, recog, coverage, travel]` (1–5) · emoji + visual confidence (icon-eligible only)
· example (en+he) · aliases · related/opposite slugs · `t.{lang}` extra realizations.

Derived at build time: `rolComponents` (+ reuse by pos-class, learnability heuristic) · `rolScore`
= Impact × RoF (methodology formula) · `commScore`/`recogScore` (0–1) · `imageEligible` · global
`rank` (layer first, ROL second) · per-language realizations tagged **`ai_reviewed` — honestly
pending native review** (never fabricated). Tier = layer − 1 (engine mapping unchanged).

## 5. Category taxonomy (25, future-proof)

glue · questions · pronouns · numbers · time · colors · people · body · food · places · transport
· directions · money · objects · clothing · home · technology · health · emergency · weather ·
nature · animals · activities · actions · descriptions. Categories drive situation links, browse
grouping and distractor pools — never game logic. Current distribution: actions 61 · descriptions
50 · food 45 · glue 40 · places 31 · time 29 · objects 27 · home 25 · transport 22 … (500 total,
218 icon-eligible with a **unique** emoji each).

## 6. Translation strategy (concept-first)

English is **not** the source of truth — the concept is. The gloss (meaning) is stored once in UI
languages (en + he); each learning language contributes only a realization (surface form). Hebrew
in this corpus is the learner's UI gloss, human-authored and natural, shipped as `ai_reviewed`
with review notes — no fake native review. Homograph senses get sense-suffixed slugs
(`help.call`); the validator refuses two concepts with the same surface form per kind, because two
identical words with different pictures would corrupt quiz distractors.

## 7. How to add a language (e.g. the French pilot)

1. Add `'fr'` to `DECLARED_LANGS` in `content/core-corpus/types.ts` (a content declaration).
2. Give every row `t: { fr: '…' }` — the validator FAILS the build listing any missing row
   (language completeness), so partial packs cannot ship silently.
3. `npm run build:core` → `core-fr.v1.json` + fr realizations in the canonical YAML → seed.
4. The web app already loads `core-{learningLang}.v1.json` and speaks in `learningLang`.

**Zero code changes** — proven by `core-corpus.test.ts` ("Future language readiness"), which
builds a pack for a fake language through the exact production functions.

## 8. How to add concepts

Add rows to the matching `data/*.ts` file, bump `CORPUS_SIZE`, run `npm run build:core`. The
validator throws (failing build, pipeline and CI) on: wrong total · duplicate slug/surface/emoji ·
missing gloss/example/scores · invalid category/layer/RoF · broken related/opposite references ·
emoji without visual confidence · undeclared or incomplete languages · concept-id duplicates
across ANY `content/concepts/*.yaml` (seed integrity). Ids are permanent: never reuse or rename a
slug; deprecate instead (methodology semver).

## 9. Games & performance

Games consume only the 218 icon-eligible words via `toGameWords` (emoji uniqueness = distractor
safety); non-visual words appear in Browse with a neutral bullet and await text-first games.
The en pack is ~205 KB pretty-printed (precached once, then offline). The same structure holds to
3000 concepts; if packs grow past ~1 MB, split per tier at the builder (no consumer changes —
the loader seam already isolates fetching).

## 10. Honest status & next steps

- Hebrew glosses + examples: human-authored, natural, **pending native review** (flip realization
  quality to `native_reviewed` only after two independent natives agree — methodology §6).
- Audio: Web-Speech TTS fallback; per-word recordings drop into `audio/{lang}/{itemId}.mp3`.
- Scores: expert estimates awaiting the telemetry flywheel; re-score from freeze/review events.
- French: architecture ready (§7); content authoring is the entire remaining cost.
