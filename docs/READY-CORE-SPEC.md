# READY CORE — Implementation Specification (v1.0)

**What this is.** The canonical reference implementation of the READY methodology: exactly
**100 words · 50 phrases · 10 conversations · 5 moments**, built for learning language
**English** with UI language **Hebrew** (en fallback). Every future language pack implements
this spec — CORE is the gold standard, not a course.

**What this is not.** Not an English curriculum, not a content dump, not a strategy document
(B-003 stands — this is the execution spec of the already-approved pilot, Bible §7.8, with
the pilot language amended it→en; logged as **B-004**).

**Why English (and the honest caveat).** The founder can personally verify every meaning,
translation, and flow — removing the native-reviewer bottleneck from the pilot loop. But
founder fluency means the *fear curve cannot be self-tested*: someone fluent cannot freeze.
Therefore validation is two-stage (§6): Stage A founder desk-validation proves the
methodology; Stage B — Hebrew speakers with self-rated weak English — proves the outcome.
he→en is also a genuine beachhead market (English is the lingua franca of travel), so CORE
graduates into a real product, not a throwaway.

**Global rules (apply to every layer):**
- Every item carries a `rolScore`, a `source`, and a scorecard row. Every *rejected*
  candidate is logged with its score — the methodology must be falsifiable.
- No orphans: every item must serve at least one Core conversation, the Recovery Kit,
  numbers, or signage.
- **Assumed-Known Filter (new, cohort-relative):** words the source-language speaker already
  knows (taxi, hotel, internet, OK, bus, credit card…) are excluded from the 100 and placed
  on an explicit `assumed-known` whitelist. Scripts may use whitelist words freely. Zero ROL
  is zero ROL — teaching "taxi" to a Hebrew speaker is theft of a learning minute.
  (Generalizes per (learningLang, uiLang) pair; for it-packs the cognate set differs.)
- Quality: CORE ships at `ai_reviewed` + `founderValidated: true`. `native_reviewed` (a native
  English pass) is still required before public activation — founder validation is a
  methodology gate, not a linguistic one.

---

## 1 · Core 100 — Words

**Learning objective.** L1 — recognize by eye AND ear at native speed. Exception: the
~15-word production subset (numbers 0–10, "where/when/how much", "help") targets L2.

**Inclusion rules (ALL must hold).**
1. Appears in ≥1 Core conversation, OR serves numbers/prices, signage, or the Recovery Kit.
2. `rolScore ≥ θ_core` — θ_core is the score of the 100th-ranked candidate (capacity-derived,
   never hand-picked).
3. Passes the comprehension-criticality test: *"if the traveler fails to understand this word
   inside a Core moment, does the moment break?"* — hear-channel words outrank say-channel.
4. Concept-unique (one sense per entry; `right.direction` ≠ `right.correct`).

**Exclusion rules.**
- Assumed-known (cognate/loanword for Hebrew speakers) → whitelist, not content.
- Translator-cheap (rare + perfectly served by Recovery Move #8) — B-001 filter.
- Compositionally derivable (twenty-one, seventy-five) — parts are taught, composites drilled
  in Speed Challenge, never stored as items.
- Function already owned by a Core phrase (we do not teach "please" as a word AND a phrase).

**Ranking methodology.** Candidate pool ≈ 300 (travel-domain frequency blend, Bible §7.2)
→ score with `ROL = (Impact × Coverage × Urgency) / LearningCost` → apply exclusions → take
top 100 by score → category sanity check (numbers/time, food, transport, lodging, money,
directions, health/safety, signs, descriptors, social) where quotas *cap only, never fill*.

**Pareto score & travel value.** `CoreScore = 100 × rolScore / max(rolScore)` recorded per
item; each item tags its channels (hear/say/read) and lists the situations it serves.
Report-card requirement: median CoreScore ≥ 40; no included item below 20.

**Review strategy.** Swipe (introduce/claim) → Listening verification within 2 sessions;
numbers additionally enter Speed Challenge. Cost model: recognize = 0.35 × production.
Budget check: 100 words ≈ 50 weighted minutes total — must fit Days 1–3 alongside phrases.

**Quality requirements.** Hebrew translation founder-verified; example line quoted *from a
Core script* (never invented in isolation); pre-generated TTS audio (en voices are strong);
signage words get a read-channel rendering (uppercase sign form: "EXIT", "GATE").

---

## 2 · Core 50 — Phrases

**Composition (fixed).** 8 Recovery Moves + ~24 `say` phrases + ~18 `hear` replies.
Five carry `isOpener: true` — one per moment, trained to performance level.

**Learning objective.** `say` → L2 (produce from Hebrew prompt), openers → L3 timed (<3s);
`hear` → L1 at native speed without slow-replay; Recovery Moves → L3 overlearned, <3s reflex.

**Inclusion rules.**
1. **Script position:** every phrase occupies a turn in ≥1 Core conversation. No free-floating
   phrases — if no script needs it, the trip doesn't either.
2. **Coverage duty:** the 50 together must cover **≥90% of all turns** across the 10 scripts
   (computed, not asserted — the coverage report is a build artifact).
3. **Reuse:** slot templates ("Can I have ___, please?") count once and ship with 3–5
   high-ROL fillers from the Core 100.
4. **Function-unique:** exactly one way to perform each communicative function (one bill-ask,
   one where-is, one repeat-request). Variety is the enemy of reflex.

**Exclusion rules.** Anything needing grammar explanation; >8 words (working-memory cap);
slang/idiom production; politeness theater beyond the glue set; any second phrasing of an
already-owned function.

**Ranking methodology.** Function criticality first (does a moment break without this
function?), then ROL within function candidates; the natural-sounding candidate wins ties —
scripts are authored *from* the winning phrases, keeping selection and dialogue consistent.

**Review strategy.** Echo → Recall ×2 same session → spaced recall; openers add timed-prosody
reps daily; `hear` replies drill via Listening with same-situation distractors; Recovery
Moves drill Day 1 and refresh daily (cheap, 8 items, non-negotiable).

**Quality requirements.** Natural register (contractions: "Can I get…", not "May I obtain…");
Hebrew meanings founder-verified; natural + slow audio for every `hear` item; table-read test:
each phrase read aloud in context must sound like a person, not a textbook.

---

## 3 · Core 10 — Conversations (dialogue scripts)

**Learning objective.** L4 integration warm-up: produce + comprehend in sequence, with the
script's shape becoming *predictable* (confidence source #1).

**The ten (fixed for CORE).**
5 moment scripts (§4): waiter-arrives · taxi-asks-destination · security-asks-passport ·
hotel-asks-reservation · someone-introduces-themselves.
5 companion scripts: ordering-food · paying-the-bill · buying-a-ticket · asking-directions ·
**something-went-wrong** (a designed breakdown resolved purely with Recovery Moves — the
methodology's showcase script).

**Inclusion rules.** 4–8 turns, ≤90 seconds; every user turn producible from the Core 50
(validator-enforced); every NPC turn understandable from Core 50 hear + Core 100 + whitelist;
2 content options + 1 recovery option per user turn; branches reconverge within 2 turns;
≥1 designed recovery insertion point per script.

**Exclusion rules.** No exposition/lecture turns; no vocabulary smuggling (a new word may not
debut inside a script); no turns whose only purpose is charm.

**Ranking methodology.** Scripts exist to serve moments; the 5 companions are chosen by the
same fear × frequency × consequence score over the situation's remaining beats.

**Review strategy.** Listening mode (NPC lines as drills) precedes rehearsal; Simulator warm
run unlocks when the script's `say` phrases reach L2; passing = completing with ≤1 recovery.

**Quality requirements.** Founder table-read in real time ≤90s; every line traceable to a
Core phrase id or whitelist; he meanings on every line.

---

## 4 · Core 5 — Moments (full treatment)

**Learning objective.** Cold survival — the only input to "moments survivable", the pilot's
primary outcome metric.

**Inclusion rules.** Top-5 by fear × frequency × consequence; each targets a *distinct fear
class*: service (waiter), transport (taxi), authority (passport), lodging (reservation),
social (introduction); each plausible within the first 24 hours abroad.

**Exclusion rules.** No moment whose realistic resolution requires content beyond CORE; no
authority moment where a wrong answer has legal stakes beyond our scope (keep passport-check
routine).

**Structure requirements.** Trigger line + ≥2 surface variants per NPC slot (cold
prerequisite); recovery path wired to specific Recovery Moves; difficulty ramp: warm (seen
script) → varied (surprise variant) → cold (unannounced, natural speed).

**Success / failure semantics (frozen, Bible §4.6).** Survived = completed with ≤1 successful
recovery; froze = timeout with no move, or 2+ unrecovered misses. Cold survival ×2 retires
the fear.

**Review strategy.** Warm rehearsal ≥1 before any cold open; cold opens capped at 1/day;
post-freeze always schedules a recovery drill + a warm re-run before the next cold attempt
(success band 0.70–0.90 governs).

**Quality requirements.** Variant lines are *re-authored realizations*, not paraphrases of
one sentence; audio natural speed mandatory; each moment names the fear it retires, in
Hebrew, on its card.

---

## 5 · Data & build artifacts (when generation is approved)

1. `content/core-en/candidates.csv` — full scored pool incl. rejections (the audit trail).
2. `content/core-en/assumed-known.yaml` — the he→en whitelist.
3. `content/core-en/pack.yaml` — authored per existing pipeline (LocalizedText: en text,
   he+en meanings), emitting `en 0.1.0` with `needsNativeReview: true`.
4. `coverage-report.json` — turn coverage, reply coverage, budget check (must all pass in CI).
5. contentPacks.en remains **draft** until Stage B passes (pilot cohort gets it via dev flag);
   `coming_soon` stays honest for the public.

## 6 · Validation protocol (gates before scaling to 1500/500)

**Stage A — Founder desk validation (methodology gate).**
Checklist, all mechanical: every item has a scorecard row; zero orphans; coverage ≥90%;
budget fits Days 1–3; function-uniqueness holds; table-reads ≤90s; he renders correctly in
RTL on all flows (Mission → drill modes → Situations → Emergency). Founder walks the full
7-day plan in the he UI. Output: `founderValidated: true` per item + a signed checklist in
`docs/pilots/core-en-stage-a.md`.

**Stage B — Cohort validation (outcome gate).**
3–5 Hebrew speakers, self-rated weak English (CEFR ≤ A2 self-report), a real or dated
simulated trip, 7 days. Pass requires ALL:
- Time-To-First-Sentence < 3 minutes (every participant).
- D1→D3 mission completion ≥ 60% of participants.
- By day 7: ≥60% of participants survive ≥2 of their top-3 feared Core moments **cold**.
- Freeze rate on cold opens < 25% across the cohort on days 6–7 (looser than the long-term
  15% target — first cohort).
- Post-week confidence self-report improves ≥2 points on a 1–10 scale.
- If the trip is real: ≥1 "I did it" first-interaction check-in per participant.

**Stage C — Scale authorization.**
Only if A and B pass. Scaling = the SAME pipeline with a bigger candidate pool: 100→Tier-1
words (≈180-equivalent weighted), 50→~250 say + replies, 10→full situation coverage, 5→~30
moments. Any Stage-B failure triggers: diagnose → amend methodology (B-###) → regenerate
CORE → re-run Stage B. **Scaling around a failed gate is prohibited.** Italian and every
subsequent language then *implements this spec* — same artifacts, same gates, plus native
review replacing founder validation for languages the founder cannot read.
