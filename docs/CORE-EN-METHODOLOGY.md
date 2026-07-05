# READY Corpus Methodology v1 (+ Core-EN pilot application)

Practical, reproducible selection of travel-language content. Goal: **maximum real-world
communication ability per minute learned** — never "most common words."

## 1 · Sources and what each is allowed to influence

| Source | Signal it feeds | What it may NOT do |
|---|---|---|
| Spoken/subtitle frequency (SUBTLEX-class) | `freq` — is it real speech? | select an item by itself |
| CEFR / English Profile, Oxford 3000/5000-class lists | `cefr` sanity band + learning-cost prior | act as a syllabus |
| Travel phrasebooks (cross-section of 5+) | candidate pool recall — what do travelers repeatedly need? | define phrasing (often unnatural) |
| Canonical interaction scripts (airport, hotel, restaurant, taxi, emergency) | `coverage` — turns served per Core script | — |
| Common traveler questions (forums/support corpora) | `travel` utility rubric | — |
| Our own Core 10 scripts | the **position rule** — final arbiter of phrases | — |
| Recovery/emergency doctrine (Bible §4.3) | `urgency` multiplier | — |

## 2 · Signals (per candidate)

| Signal | Range | Definition |
|---|---|---|
| `freq` | 0–1 | normalized spoken frequency in travel-relevant registers |
| `travel` | 0–1 | rubric: heard (menus/replies/signs) ×, said (requests) ×, read (signage) — max of channels |
| `coverage` | 0–1 | share of Core scripts/situations the item serves (≥3 situations ⇒ ≥0.8) |
| `reuse` | 0–1 | phrase slot-template potential / word combinability |
| `cefr` | A1=1 … C1=0.2 | simplicity prior (sanity, small weight) |
| `urgency` | 1–3 | 3 = emergency/recovery; 2 = transactional breakdown cost; 1 = social |
| `cost` | seconds | estimated time to target level (recognize ≈ 0.35 × recall; phrase length adds cost) |

## 3 · The formula

```
Impact   = 0.35·travel + 0.30·coverage + 0.20·freq + 0.10·reuse + 0.05·cefr
ROL      = (Impact × urgency) / (cost / 60)          # ability bought per learning minute
CoreScore= 100 × ROL / ROL_max                        # normalized within the candidate pool
```
Selection = rank by CoreScore → apply exclusion filters → cut at capacity (θ = score of the
last item that fits the layer's weighted time budget). Category quotas **cap, never fill**.

## 4 · Exclusion filters (mechanical, ordered)
1. **Orphan filter** — serves no Core script, number system, sign, or Recovery move.
2. **Assumed-Known filter** (cohort he→en) — loanwords/universals identical in Hebrew
   (see `content/core-en/assumed-known.yaml`). Universal *basics* (yes/no, 1–10, hello)
   are NOT excluded: real proficiency varies, and Swipe Triage places them per-user in
   seconds — the engine, not the list, personalizes the floor.
3. **Compositional filter** — derivable items (twenty-one, seventy-five) are drilled by the
   Speed Challenge generator, never stored.
4. **Function-duplicate filter** (phrases) — one phrasing per communicative function.
5. **Translator-cheap filter** (B-001) — rare + perfectly served by the translator move.

## 5 · Worked example
`allergic`: travel 0.9 (life-critical restaurant channel), coverage 0.4 (restaurant+medical),
freq 0.2, reuse 0.6 ("I'm allergic to ___"), cefr A2=0.8 → Impact = 0.315+0.12+0.04+0.06+0.04
= 0.575; urgency 3; cost 40s (recall) → ROL = 1.725/(0.667) = 2.59 → near top of pool.
`interesting`: travel 0.15, coverage 0.1, freq 0.6, reuse 0.3, cefr 0.8 → Impact 0.2;
urgency 1; cost 40s → ROL 0.30 → **rejected, score recorded.**

## 6 · Honesty declaration (v1)
Signal values in this pilot are **rubric-estimated by the operator against the sources
above**, recorded per item, and individually challengeable — they are not yet
machine-computed. This is acceptable for a 100-item pilot whose entire purpose is Stage-A/B
validation; corpus automation (scripted frequency joins) is the scheduled upgrade before any
1,500-word scaling, using the *same* formula so scores stay comparable. Translation policy:
Hebrew is founder-verifiable; Spanish/French/Italian are high-confidence for this register;
**Arabic is always `review: [ar]`** (MSA given; dialect and register need native review).
No translation is presented as certain when it isn't.

## 7 · Layer budgets (capacity that sets θ)
Core 100 words ≈ 50 weighted minutes (recognize-heavy). Core 50 phrases ≈ 55 minutes
(8 recovery overtrained + 5 openers to performance). Both must fit Days 1–3 of a 7-day plan
alongside reviews — verified in the coverage report before Stage A sign-off.
