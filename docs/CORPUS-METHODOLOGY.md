# READY Corpus Methodology v2 — language-independent

Supersedes the formula sections of CORE-EN-METHODOLOGY.md (which remains as the en-pilot
application). This document is the company's primary IP: not the word lists — the machine
that produces them, and the data flywheel that improves them.

**The governing tiebreak (frozen):** when two candidates tie on Return On Learning, the one
that reduces *freeze probability* (hear-channel, recovery, trigger comprehension) beats the
one that adds *expressive range*. Confidence over knowledge, always. Knowledge is what you
have; confidence is what survives contact with a fast-talking waiter.

---

## 1 · The two-sided score: ROL × RoF

v1 buried failure cost inside "urgency". v2 makes it first-class:

```
Impact  = 0.35·travel + 0.30·coverage + 0.20·freq + 0.10·reuse + 0.05·learnability
RoF     = Return on Failure ∈ {1,2,3}   # what breaks if the traveler DOESN'T know it?
          3 = safety/health/legal breaks (allergic, help, stop)
          2 = the transaction breaks (cash-or-card, bill, gate)
          1 = only nuance breaks (nice-to-have)
ROL     = (Impact × RoF) / minutes-to-target-level
```

RoF is the confidence principle made arithmetic: a word you *hear* at a moment's trigger has
higher RoF than a word you might say, because failing to understand is what causes freezes.
Hence the standing bias: **hear-channel ≥ say-channel at equal Impact.**

**Opportunity cost, operationalized.** Every accepted item's opportunity cost is θ — the
score of the best *rejected* candidate at the layer boundary. The candidates ledger (scores
incl. all rejections) IS the opportunity-cost ledger; no per-item essays, just an auditable
ranking where every inclusion visibly displaced something.

**The seven quality gates** (mechanical form of the founder's gate list): encounter
likelihood (travel>0) · ability delta (Impact≥floor) · reuse · conversation unlock
(coverage>0 / orphan filter) · no higher-ROL substitute (rank order) · RoF recorded ·
Pareto fit (score ≥ θ). An item failing any gate ships only with a written exception in its
scorecard row — exceptions are rare and audited.

## 2 · Progressive layers (amendment B-005)

Cumulative layers, one ladder for words and phrases; each exists because it unlocks a
*distinct capability*, not because the number is round:

| Layer | Words | Phrases | Name | What it unlocks |
|---|---|---|---|---|
| L1 | 100 | 50 | **Survive** | Cannot be stranded: Recovery Kit, numbers, moment triggers, first 24h scripted. |
| L2 | 300 | 150 | **Transact** | Every standard travel transaction end-to-end; all ~30 moments warm-rehearsable. |
| L3 | 700 | 300 | **Adapt** | Deviations from script: problems, changes, complaints, comparisons; variant breadth for cold opens. |
| L4 | 1500 | 500 | **Connect** | Human connection + environment reading: smalltalk depth, menus/signage long tail (recognition-heavy). |

Engine mapping: L1→tier 0, L2→tier 1, L3→tier 2, L4→tier 3 (capacities updated from
60/180/500 to 100/300/700 at the pack level; the planner's weighted-capacity math is
unchanged). A traveler's runway buys the deepest layer that fits — same Dynamic Pareto.

## 3 · Known-By-Default: a measurement, not an assumption

Three signals, per (learningLang × sourceLang) pair, stored as data:

1. **Internationalism score** — transliteration-similarity between the target word and its
   source-language equivalent (hotel/הוטל? מלון is native — but "hotel" is universally
   *recognized* by Hebrew speakers; attested loanword lists refine pure string similarity).
2. **Curated loanword attestation** per source language (linguist-checked list).
3. **Cohort telemetry (the real arbiter):** any item with ≥90% first-exposure pass across a
   source-language cohort is auto-demoted for that pair.

Decision bands: **high** → whitelist (never consumes attention; scripts use freely);
**middle** → ships as a *probe*: placed first in Swipe Triage, one listening verification,
then auto-retired per user (the engine already does this — swipe prior + objective check);
**low** → normal candidate. So "some users know them, some don't" is solved per user in
seconds, and per cohort over weeks — never by our guesses.

## 4 · Never-Teach categories (first 1500, all languages)

1. **Compositional derivables** — 21–99, ordinal patterns, o'clock times: the Speed
   Challenge *generator* drills them; storing them wastes ids and minutes.
2. **Grammar infrastructure as cards** — articles, auxiliaries, conjugation tables: acquired
   inside chunks (Law: phrases carry grammar implicitly), never as items.
3. **Production slang/idiom** — embarrassment risk, register traps; hear-only, L3+.
4. **Synonym #2 of an owned function** — variety is the enemy of reflex.
5. **Translator-cheap rare nouns** — B-001 makes them free.
6. **Abstract/emotional vocabulary** — no moment service, zero RoF.
7. **Professional/domain vocab** — beyond symptom-and-safety basics.
8. **Written/formal register** — moreover, nevertheless; travelers speak.
9. **Culture terms with no traveler action** — trivia belongs in tips, capped.
10. **Politeness theater** beyond the glue set — one polite register, drilled to reflex.

Any exception must name the moment it serves and the RoF it carries.

## 5 · Language independence (the invariant)

**The methodology is fixed; only the measurement instruments are localized.**
- `learnability` uses the local framework where one exists (CEFR/JLPT/HSK/CU-TFL…), else a
  regularity+length heuristic — its weight (0.05) is deliberately too small to distort.
- `minutes-to-target` gains per-language multipliers: script distance for the *reading*
  channel (Thai/Japanese/Arabic vs a Hebrew or Latin-reading cohort), phonology distance for
  the *ear* channel. Romanization policy per Bible §4.1 (translit field).
- Register rule generalizes: one traveler-safe polite register per language (keigo-lite,
  Sie/vous/لطفاً-level), chosen with the native reviewer, applied uniformly.
- Gendered/inflected forms: teach the unmarked traveler-safe surface form; variants live in
  `forms[]`, never as separate items.
- Known-By-Default matrices are pair-specific data (he→en ≠ he→ja ≠ pt→es).
- Nothing in gates, filters, layers, or the formula references English.

## 6 · Validation as a living process

- **Two independent natives per batch**; agreement → `native_reviewed`. Disagreement → a
  third senior reviewer arbitrates; the ruling and reasoning are logged on the item forever.
- **Every item carries a changelog** (generated → edits → approvals → field flags) — content
  is versioned like code because it is code (Bible: content-is-code).
- **User flags:** 2 independent "locals say it differently" flags auto-demote to
  `ai_reviewed` and pull the item from cold opens pending re-review (already ruled; kept).
- **Freeze telemetry closes the loop:** items over-represented in freeze events get RoF
  re-scored and their moments get extra variants — the corpus learns from real failures.
  This flywheel (scores + rejections + pair matrices + freeze data) is the IP; a competitor
  copying our word list copies our past, not our engine.
- **Yearly re-certification** of a random 10% sample per active pack; semver: patch = fix
  translation/audio, minor = add items, major = deprecate (ids never reused).

## 7 · The final question

**If READY has exactly one competitive advantage, it is this: READY is the only product
that makes a traveler unbreakable — and can prove it.**

Not the biggest corpus, not the smartest AI, not the prettiest streak. Everyone else
optimizes what you *know*; the freeze happens in the gap between knowing and reacting.
READY owns that gap: it trains recovery as a first-class skill, rehearses the exact
10-second moments that scare people, measures freeze rate and cold survival instead of
vocabulary counts, and hands the traveler receipts that they cannot be stranded.

The corpus methodology *is* that advantage, materialized: RoF-weighted selection buys
un-freezability per minute; hear-channel priority attacks the actual cause of freezing;
function-uniqueness builds reflexes instead of choices; Never-Teach and Known-By-Default
guard the attention budget that recovery training is paid from; and the freeze-telemetry
flywheel means every user who freezes makes the next traveler harder to break.

A traveler who knows 150 things and cannot be broken beats a traveler who knows 5,000
things and freezes. We build for the first traveler. Always.
