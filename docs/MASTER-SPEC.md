# READY — PRODUCT MASTER SPECIFICATION (v1.0)

**Role of this document.** The company's operating manual for the next decade. It *extends*
the Product Bible (docs/PRODUCT-BIBLE.md), which remains the frozen constitution; where the
Bible already rules, this spec points to it instead of duplicating it — two copies of one
truth always drift. Amendments to either happen only via `B-###` entries in DECISIONS.md.

---

## §0 · CTO MEMO — read before everything else

Two truths, stated bluntly because you asked for a CTO, not a cheerleader.

**Truth 1 — We are in a documentation loop, and it is now our biggest process risk.**
In the last four working sessions we have produced: a UX overhaul, a designer's re-vision, an
architecture freeze review, a Product Bible, and now this Master Spec — each opened with
"challenge everything, forget previous work." Meanwhile the single highest-risk assumption in
the entire company — *that seven days of READY makes a real traveler confident abroad* — has
been tested by **zero human beings**. Every additional strategy document now has near-zero
marginal value compared to one real user completing one real week and ordering one real
coffee in Rome. This spec therefore ends with a **document freeze**: after v1.0, strategy
writing stops until the Italian pilot (Bible §7.8) produces evidence. Frozen means frozen —
including from the founder, including from me.

**Truth 2 — Our existential competitor is not Duolingo. It is the live-translate button.**
Real-time translation (phone, earbuds, soon glasses) is free, improving monthly, and answers
the *functional* need completely. If READY's promise is "communicate abroad," we lose to a
button. READY survives only if the promise is what a translator can never deliver: **the
human moment** — eye contact, warmth, speed, dignity; being the traveler who *tried*, in a
10-second exchange where pulling out a phone kills the interaction. Confidence is the
product; language is the ingredient. Consequence (formal amendment B-001 below): we stop
pretending translators don't exist and **teach graceful translator use as the final Recovery
Move**. "Use every tool without shame, never depend on any" is a stronger confidence story
than purity — and it converts our biggest threat into our safety net.

Everything below is designed under those two truths.

---

# EPIC 1 — PRODUCT PHILOSOPHY

## 1.1 The category
READY does not compete in "language learning." It creates **trip preparation**: a system with
a start (booking), a deadline (departure), a finish line (first real interaction abroad), and
a measurable outcome (confidence under real conditions). Nobody owns this category.

## 1.2 Why READY and not…
| Competitor | Their optimization | Why the 7-day traveler loses there | READY's counter |
|---|---|---|---|
| Duolingo | years of daily engagement | curriculum order ≠ travel utility; streaks reward time-in-app | deadline plan; capability receipts; we *want* you done in a week |
| Babbel/Busuu | months of curriculum | no deadline concept; lesson 1 pacing | Dynamic Pareto tiering to your actual runway |
| Rosetta | slow immersion | precisely wrong for 3.5 total hours | ruthless ROL selection |
| Memrise/Anki-likes | vocabulary retention | retention at t→∞, not at T-departure; words ≠ moments | R(T_departure) objective; moments as the unit |
| AI tutor apps | open conversation practice | unstructured chat ≠ the 12 predictable scripts of travel; no honesty model | scripted moments with variants; evidence-based readiness |
| **Live translation** | replace the skill | kills the human moment; latency; battery; dignity; fails eyes-busy/hands-busy moments | confidence + speed for the top-30 moments; translator absorbed as Recovery Move #8 |

## 1.3 Principles that must never be violated
The Bible's P1–P9 stand. Three additions, elevated to the same rank:
- **P10 · The human moment is sacred.** Any feature that puts a screen between two people
  during a live interaction must justify itself as *recovery*, never as the plan.
- **P11 · Evidence over opinion — including ours.** No strategy re-litigation without user
  data. Documents freeze; telemetry decides.
- **P12 · The product wants to be finished.** Success is the user leaving prepared and
  returning for the *next* trip — never daily dependence. Any metric that rewards dependence
  is forbidden (see EPIC 8 guardrails).

---

# EPIC 2 — LEARNING SCIENCE (the practical methodology)

## 2.1 The Capability Stack
Real-world travel capability is four skills stacked in dependency order. Training must
respect the stack; testing must climb it.

```
Layer 4  SURVIVAL UNDER STRESS   cold, unannounced, variant forms   ← confidence lives here
Layer 3  RECOVERY REFLEXES       the 8 moves, <3s, automatic
Layer 2  COMPREHENSION AT SPEED  replies, numbers, signs — native pace, degraded audio
Layer 1  PRODUCTION CHUNKS       formulaic phrases + prosody (One Perfect Sentence)
```

## 2.2 The Ten Laws (each maps to a mechanic — nothing academic survives without one)
1. **Retrieval beats review.** Every exposure ≤10s, then test. (All modes are tests.)
2. **Spacing beats massing; the deadline bends the spacing.** FSRS-style model with
   R(T_departure) objective — built, frozen.
3. **Sleep is a study session.** Missions in the evening; a 90-second *morning micro-review*
   of yesterday's weakest items completes the consolidation sandwich (amendment B-002).
4. **Never slow the world down — shrink it.** Audio stays native-speed from day 1; difficulty
   is controlled by scope (fewer items, predictable script), not by slowed speech. Slow
   replay exists but is logged and gates "at speed" credit. Ears trained on slow speech
   freeze on fast speech — the exact failure we exist to prevent.
5. **Prosody before precision.** Melody and confidence of delivery transfer more social value
   than accuracy. Openers are trained to *performance* level; everything else may stay rough.
6. **Stress must be inoculated, not avoided.** Graduated exposure: warm rehearsal → variant
   surprise → cold open → ambush (opt-in). Target success under stress: 80–85% — below 70%
   trains the freeze, above 95% trains nothing (the difficulty governor, EPIC 3).
7. **Recovery is a skill with its own curriculum.** Deliberately inject misses ("you didn't
   catch that — act") so the fumble is rehearsed before it happens for real.
8. **Interleave situations after introduction.** Blocked learning feels better and transfers
   worse; the scheduler interleaves by design.
9. **Proof compounds.** Each verified success is written as a receipt; humans update
   self-belief on evidence about themselves, not on progress bars.
10. **Motivation is borrowed from the trip, not generated by the app.** Countdown, fears
    crossed off, "what you can now do" — never points.

## 2.3 Skill-specific development
- **Listening:** closed-set → open-set within the moment's variant pool; two-speaker audio
  variety per line (when human audio lands); background-noise variants at difficulty 3.
- **Speaking:** echo (prosody) → recall (retrieval) → timed recall (<3s = fluent) → in-moment
  production. No speech *scoring* until it's reliable enough not to punish good attempts.
- **Confidence:** predictability (watch the movie first) + recoverability (the kit) + proof
  (receipts) — the three sources, engineered in that order across the week.
- **Fear:** named at onboarding, attacked by name ("Tuesday we take down 'the waiter
  arrives'"), retired by cold survival ×2. Fear list → proof list is the week's plot.

---

# EPIC 3 — INTELLIGENCE LAYER (the adaptive brain)

## 3.1 Design stance — honesty first
Personalization is **earned by data, never assumed**. A wrong adaptation is worse than none:
it teaches the wrong thing *and* erodes trust. Therefore the layer ships in stages, each
gated on beating the non-adaptive baseline on cold-survival — not on engagement.

## 3.2 What is collected (all already flowing through the append-only event log)
Per drill: itemId, mode, outcome, latency, slow-audio use, cold flag, timestamp.
Per session: start/end, quit point, preset used, local hour. Per user: fears picked,
first-24h check-in. **Nothing new is stored as truth — every inference below is a projection
and can be recomputed when models improve (the event-sourcing dividend).**

## 3.3 What is inferred (per user)
| Inference | Signal | Used for |
|---|---|---|
| Personal forgetting multiplier | observed lapse timing vs predicted R(t) | per-user stability scaling |
| Acquisition rate | new items reaching L2 per active minute | tier fit + daily new-item quota |
| Fatigue curve | within-session accuracy/latency decay | session length + "stop now" call |
| Mode efficacy vector | retention delta per mode, per user | mode mix |
| Fear map | freeze events by moment/situation | plan value boost; targeted inoculation |
| Recovery competence | recovery success rate + latency | cold-open eligibility pacing |
| Chronotype window | performance by local hour | notification timing only |
| "Never again" set | items stable ≥ horizon × margin at trip context | removed from review — earned, reversible |

## 3.4 Decisions the engine may make automatically (with the transparency rule)
Every automated decision carries a **user-visible reason in plain language** and is bounded.
- Shorten/lengthen today's mission (±30% of chosen budget, never more) — "your accuracy drops
  after minute 14 — today is 12 minutes on purpose."
- Reorder modes; swap a drill type; inject a recovery rehearsal after 2 freezes.
- End the session: "You're past your peak. Stopping now protects tonight's consolidation."
- Promote to never-review; demote to weak; trigger a fading refresh.
- It may **never**: silently change the departure plan's scope, hide content, extend session
  length beyond the user's budget, or optimize for time-in-app (P12).

## 3.5 Anti-bad-personalization guardrails (frozen)
1. **Minimum evidence thresholds** before deviating from cohort defaults (e.g., ≥30 events
   for forgetting multiplier; ≥5 sessions for fatigue curve).
2. **Bounded deviation**: every personalized parameter clamps to ±30% of the default until
   the user has a full week of data; ±60% forever after. No runaway spirals.
3. **The kill rule**: each adaptive feature A/B'd at cohort level; if it doesn't beat the
   default on cold-survival within a release cycle, it reverts. Engagement wins count as
   losses.
4. **Inspectable**: a "Why this mission?" sheet lists every active adaptation in one screen.
5. **Erasable**: one tap resets personalization (recompute projections from scratch —
   architecturally free).
6. **Private by design**: inference on-device where possible; server aggregates are cohort
   anonymized; voice audio (future) never leaves the device without separate consent; full
   export/delete trivially satisfiable because events are the only truth.

## 3.6 Staging
- **v0 (now):** global defaults + the two cheapest wins: fatigue stop-rule, fear boost.
- **v1 (post-pilot, ≥100 users):** per-user forgetting multiplier + acquisition rate (these
  two carry ~80% of personalization value — Pareto applies to the brain too).
- **v2 (≥10k users):** mode efficacy, chronotype, cohort priors per language pair.

---

# EPIC 4 — CONTENT ARCHITECTURE (verdict on the hierarchy)

**Ruling: the Bible's three-plane architecture stands** (content / orchestration / evidence —
Bible §2). Re-challenged here from scratch; it survives every attack we could mount:
- Making Missions authorable → kills Dynamic Pareto. Rejected again.
- Making Confidence a stored level → violates P3 (it must always be re-derivable). Rejected.
- Restoring Dialogue as a standalone type → recreates "school exercises." Rejected.
- Flattening Moments into Situations → loses the fearable/rehearsable/cold-openable unit that
  the entire confidence loop runs on. Rejected.

Two amendments emerge from this spec (formalized in DECISIONS.md):
- **B-001 — Recovery Move #8: "The Graceful Translator."** A trained, rehearsed, dignified
  hand-over to the phone translator (one phrase: *"un attimo — guardi"* + the gesture),
  positioned explicitly as the *last* move. Converts the existential competitor into our
  safety net and makes "you cannot be stranded" literally true.
- **B-002 — Morning Micro-Review.** A 90-second, notification-launched review of yesterday's
  3 weakest items (opt-in). It is a *session preset* in the orchestration plane — no new
  content type, no schema change. Sleep-sandwich consolidation (Law 3).

Receipts, Travel Plans, Missions, Replies (`role:'hear'` phrases), Recovery Kit: all governed
by Bible §4 unchanged.

---

# EPIC 5 — CONTENT METHODOLOGY (reproducible; zero intuition)

Governed by Bible §7 (formula, pipelines, quotas, pilot gate). This epic adds what the Bible
lacks for true reproducibility: the worked example, the inclusion decision tree, and the
operator checklist that lets an engineer who has never met us generate language #6.

## 5.1 The inclusion decision tree (every candidate item, any type)
```
candidate
 ├─ Does it serve one of the 30 moments, the Recovery Kit, numbers, or signage? ── no → REJECT (no orphan content)
 ├─ ROL = (Impact × Coverage × Urgency) / LearningCost  ≥  θ_tier?  ── no → REJECT (record score anyway)
 ├─ Concept-duplicate of an accepted item? ── yes → merge senses or REJECT
 ├─ Producible register? (slang → hear-only; vulgar → REJECT; formal-safe default)
 ├─ Translatable into all active UI languages? ── no → hold in draft, report gap
 └─ ACCEPT at tier by ROL rank → quality workflow (Bible §11)
```
θ_tier is not hand-tuned: it is set by capacity — θ is the ROL of the marginal item that fits
the tier's weighted budget (60 / 180 / 500 / 1500-equivalents). Content selection and trip
planning therefore share one economics.

## 5.2 Worked example (the auditability standard every item must meet)
*Candidate: it. "scontrino" (receipt).* Impact 0.55 (transactional comprehension; shops ask
"vuole lo scontrino?"); Coverage ≈ 6 encounters/week (every purchase); Urgency 2 (mild legal
relevance in Italy). LearningCost: recognize-only ≈ 25s to L1. ROL = (0.55×6×2)/25 ≈ 0.26.
*Candidate: it. "cioè" (filler "I mean").* Impact 0.1 (comprehension nicety), Coverage 8,
Urgency 1, cost 25s → 0.032. **scontrino ships Tier 1; cioè is rejected and the rejection is
recorded with its score** — that record is what makes the methodology falsifiable later.

## 5.3 How we know a word should NEVER be taught
Hard exclusions, mechanical: fails the orphan rule; production-register risk (slang/vulgar);
concept duplicate; cost-dominated (compound numbers derivable from parts); *translator-cheap*
— a word whose need is rare AND perfectly served by Recovery Move #8 (e.g., "carburetor")
scores Impact ≈ 0 by definition. The translator move is thus also a *content filter*: we
never again argue about rare nouns.

## 5.4 Reproducibility checklist (language #N operator manual)
1. Run corpus pipeline (§Bible 7.2) → scored word candidates with provenance.
2. Enumerate the 30 moments from the fixed moment taxonomy; localize triggers/scripts with
   native writer (not translator — scripts are *re-authored*, not translated).
3. Generate phrases from moment scripts (say/hear split), score, dedupe.
4. Recovery Kit: fixed 8 concepts, re-authored natively.
5. Tips: behavior-changing only, UI-language, ≤3/situation.
6. Quality workflow to `native_reviewed` for all say/scripts (Bible §11).
7. Pilot gate §7.8 with 3–5 real-trip users. Only then scale tiers 2–3.
8. Every item ships with `rolScore` + `source`; every rejection logged. If a step required
   intuition, file an amendment — the method is broken, not bent.

---

# EPIC 6 — PARETO ENGINE (the mathematics)

## 6.1 The objective (frozen, running in production)
Maximize Σᵢ value(i) · R(i, T_departure) subject to Σ time ≤ budget — greedy by
`value × ΔR / seconds`, which is exactly **marginal ROL under a deadline**.

## 6.2 The value function, personalized
```
value(i, u) = tierWeight(i) × (1 + situationPriority(i, u)) × urgency(i)
              × fearBoost(i, u)        // 1.5 if item serves a named fear
              × emergencyMultiplier(i) // 2.5, frozen
```
Personal Pareto = same machine, user-shaped inputs: fears reorder situations; the acquisition
rate reshapes tier fit; freeze telemetry boosts the moments that actually scare *this* user.

## 6.3 Stopping rules (knowing what NOT to teach — the heart of Pareto)
- **Item level:** teach nothing whose marginal ROL < θ (the capacity-derived threshold). The
  1,500-word list is a ceiling precisely because θ rises as runway shrinks.
- **Review level:** an item leaves rotation when predicted R(T_departure) ≥ 0.95 with margin
  ("never again" set — earned, reversible on spot-check failure).
- **Session level:** the fatigue governor ends sessions past the personal peak; minutes after
  the peak have measured negative ROL (they cost tomorrow's consolidation).
- **Difficulty governor:** keep rolling success in [0.70, 0.90]; outside the band, scope —
  never speech speed — adjusts.

---

# EPIC 7 — USER PSYCHOLOGY (the emotional journey)

| Stage | User feels | READY must do | Failure mode to prevent |
|---|---|---|---|
| Minute 1 | curious, skeptical | first spoken sentence < 3 min; "you just said something real" | forms, theory, delay |
| Day 1 end | "can I actually do this?" | Armor complete: "you are now unbreakable"; first receipts | zero-progress dashboard (audit C1 — fixed by design) |
| Day 3 | novelty gone, trip abstract | fear #1 scheduled by name; cold-open first survival | grind feeling; silent difficulty spikes |
| T-1 week | rising anxiety | plan visibly on track; fading repaired in 5-min bites | guilt mechanics; cram encouragement |
| Airport | nervous, idle time | Panic/warmup preset; Emergency Card check; "you're ready — stop studying" | new content (violates taper) |
| First moment abroad | fear peak | pre-moment 90s warmup; First Move script | app-in-hand during the human moment (P10) |
| Success | pride spike | check-in → real receipt; "that happened." | confetti; XP; anything cheap |
| Failure/freeze abroad | shame risk | recovery reframe: "you used move #2 — that IS the skill"; 2-min repair | silence; letting shame define the trip |
| Return home | warm memories | trip summary: moments survived for real; dormant mode, zero nagging | retention spam (P12) |

**Confidence creators:** predictability, recoverability, proof, named fears retired, prosody
compliments from locals. **Confidence destroyers:** inflated progress that reality contradicts
(the deadliest), slowed audio meeting fast reality, unexplained difficulty spikes, streak
guilt, translation dependence framed as failure.

---

# EPIC 8 — METRICS (the measurement system)

## 8.1 North Star
**CFIR — Confident First Interaction Rate:** % of departing users with an active plan who
complete ≥1 real interaction within 24h of landing and mark "I did it" (validated by the
post-trip survey). Everything else is a tributary.

## 8.2 The metric tree
```
CFIR
├─ Preparation quality
│   ├─ Moments Survivable at T-0 (cold, per user; target ≥ 60% of top-3 fears)
│   ├─ Readiness-at-Departure (top-3 situations Ready; PDF metric, kept)
│   ├─ Freeze Rate (cold opens frozen / attempted; target < 15% by day 6)
│   └─ Recovery Rate (breakdowns recovered / breakdowns; target > 80% — the antifragility number)
├─ Activation
│   ├─ Time-To-First-Sentence (< 3 min, sacred)
│   └─ D1→D3 mission completion (the motivation cliff detector)
├─ Honesty health
│   ├─ Refresh responsiveness (fading repaired < 48h)
│   └─ Reality gap: in-app readiness vs post-trip "used it often" (if Ready users report
│      failure abroad, our model lies — the metric that audits US)
└─ Business
    ├─ Trip-cycle retention (returns before next trip — never DAU)
    ├─ Referral (trip-companion invites per traveler)
    └─ Native-review cost per activated language
```
## 8.3 Guardrail metrics (things that must NOT grow)
Average session length (growth = we're becoming Duolingo — investigate, don't celebrate);
notification opt-out rate; slow-replay dependence; content flags per 1,000 items; cold-open
freeze rate *increase* after any personalization release (kill rule trigger).
All computable from the existing event log + two additions: `tripCheckIn` events and the
`cold` flag (both already specified in the Bible).

---

# EPIC 9 — FUTURE (realistic five-year evolution, each stage gated)

| Stage | What | Entry criteria (not dates) |
|---|---|---|
| F1 | Eyes-free commute mode + watch surface (countdown, warmup nudge, morning micro-review) | pilot passed; PWA stable |
| F2 | Panic Mode productized (install-at-airport crash plan) — acquisition story | Tier-0 content verified per language |
| F3 | On-device generation of NPC line variants (small local model, constrained decoding — determinism preserved, offline preserved) | variant hunger proven by telemetry; model fits mobile |
| F4 | Speech-attempt feedback (prosody-level, encouraging, on-device) | accuracy high enough to never punish a good attempt |
| F5 | AI Conversation mode inside moment frames | Bible gate: offline story + cost + safety |
| F6 | Live listening assist ("gist bar": keywords it heard, for *your* recovery) — assistive, never a translator UI | P10 review; opt-in; abroad-mode only |
| F7 | AR/glasses signage reading = our recognition-word layer projected on the world | hardware install-base, not before |
| F8 | B2B distribution: airlines/booking/TMC/insurance bundle "arrive ready" | CFIR proven; per-trip pricing |
| F9 | Adjacent moments packs: business travel, medical travel, relocation | core CFIR ≥ target for 3 languages |

**What we will NOT become:** a trip planner, a booking tool, a general translator, a social
network. "Travel OS" expansion happens along the *moments* axis only — more feared moments
mastered, never more app surfaces. Scope discipline is a five-year moat.

---

# EPIC 10 — PRODUCT RISKS (the pre-mortem: assume READY failed — why?)

Ranked by (likelihood × impact). Mitigations are commitments, not hopes.

| # | Failure story | L×I | Mitigation |
|---|---|---|---|
| R1 | **"Why learn? I have live translate."** Category evaporates for functional users | 🔴 | Position on the human moment (P10); B-001 translator-as-recovery; market CFIR stories, not vocabulary; speed: our top-30 moments beat any translator on latency+dignity |
| R2 | **Episodic usage kills the business.** 1–2 trips/year, CAC unpayable, subscription mismatch | 🔴 | Trip-pass pricing; near-zero dormant cost (PWA); cross-trip memory as switching cost; B2B channels (F8) where episodic is a feature, not a bug; referral via trip companions |
| R3 | **The 7-day promise fails publicly.** A "Ready" user freezes in Rome and says so | 🟠 | Reality-gap metric audits us; recovery-first training makes failure survivable by design; copy never promises fluency — promises unbreakability |
| R4 | **Native-review bottleneck.** Quality bar makes languages cost months each | 🟠 | Reviewer marketplace + per-item checklist tooling (Epic 6 ops); one language superb before five adequate (constitutional); `verified` flywheel reduces re-review |
| R5 | **Day-3 motivation cliff.** Trip still abstract, novelty dead | 🟠 | Fear-by-name scheduling, receipts, arc naming; D1→D3 metric watched weekly |
| R6 | **TTS credibility.** Robotic audio trains a false ear in some languages | 🟠 | Human audio for moments/openers first (highest exposure); per-item swap path exists; beta natives audit audio explicitly |
| R7 | **Founder bandwidth.** The spec outruns the team | 🟠 | Roadmap strictly cuttable bottom-up; pilot before scale; document freeze (this memo) |
| R8 | **Doc-driven development.** We architect instead of validating (meta-risk — this very session) | 🟠 | P11 + document freeze + pilot gate; next strategy doc requires pilot data attached |
| R9 | **Over-personalization backfires** before data justifies it | 🟡 | Intelligence staging + kill rule (Epic 3.5) |
| R10 | **iOS PWA friction** (notifications, install, audio autoplay) | 🟡 | Capacitor wrapper when needed — engine/data port intact by design |
| R11 | **Arabic underestimated** (RTL, romanization, register variation) | 🟡 | ar ships last, own sprint, native co-design; romanization strategy decided before authoring |
| R12 | **Privacy/regulatory** (voice, minors, GDPR) | 🟡 | event-sourced export/delete; voice on-device (F4); no ads, no data sale — policy, in writing |

---

# FINAL SECTION — THE FROZEN STATE

1. **Final architecture:** Bible §2 three planes + Intelligence Layer as a *fourth, purely
   derived* layer (projections over the event log; never a source of truth). No changes.
2. **Frozen product principles:** P1–P9 (Bible) + P10 human moment, P11 evidence over
   opinion, P12 the product wants to be finished.
3. **Frozen content methodology:** Bible §7 + this spec's decision tree, worked-example
   auditability standard, θ-threshold economics, reproducibility checklist. Amendments B-001/B-002.
4. **Frozen learning methodology:** the Capability Stack + Ten Laws (Epic 2); native-speed
   audio non-negotiable; difficulty via scope; success band 0.70–0.90.
5. **Frozen intelligence layer:** signals/inferences/decisions/guardrails of Epic 3; staged
   v0→v2; kill rule on cold-survival.
6. **Frozen roadmap:** Bible §12 epics unchanged; insert B-002 into Epic 3 scope and B-001
   into the Recovery Kit content task; Future stages F1–F9 gated as tabled.
7. **Open questions (the only ones):** (a) pricing: trip-pass vs freemium Tier-0 — decide
   after pilot willingness-to-pay interviews; (b) first beachhead market/channel for the
   Italian pilot cohort; (c) native reviewer sourcing model (marketplace vs contract);
   (d) speech feedback appetite post-F4 accuracy test.
8. **Recommendations before writing more code — in order:**
   1. **Recruit the native Italian reviewer today.** Longest external lead time; gates everything.
   2. Implement Epic 1 (schema freeze: LocalizedText, IDs, Moment schema, quality field) —
      the only code the Bible authorizes next.
   3. Apply the four P0 audit fixes and put the current app in 3–5 real travelers' hands
      **before** the full Moments experience — imperfect evidence now beats perfect evidence
      in two months.
   4. **Declare the document freeze.** No further strategy documents until pilot telemetry
      exists. This spec is the last one. (P11 applies to us.)
