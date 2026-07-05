# READY — PRODUCT BIBLE (v1.0)

**Status: FROZEN.** Every future feature, collection, endpoint, screen, algorithm and content
item must be consistent with this document, or this document must be amended first (§14).

---

## 1 · North Star

READY is not a language-learning app. It is a **travel preparation system** — the operating
system for arriving in a foreign country able to communicate, after days of preparation, not
months.

**The one question.** Every feature, screen, entity, algorithm and content item must answer:

> *"Will this increase the user's confidence in a real conversation abroad?"*

If the answer is no, it does not ship.

**Return On Learning (ROL).** We never ask "how many words does this teach?" We ask:

> *"If a traveler spends one minute on this, how much real-world communication ability
> does that minute buy?"*

ROL is not a slogan — it is a computed number (§7.2) that drives content selection AND the
scheduler (the engine's `value × R-gain / seconds-cost` ranking *is* ROL under a deadline).

### Principles (binding)

| # | Principle |
|---|---|
| P1 | **Deadline first.** Everything is planned backwards from the departure date. |
| P2 | **Pareto, ruthlessly.** Smallest set, biggest real-world impact. ROL justifies every item. |
| P3 | **Honest knowledge.** Track what the user demonstrably does. Readiness decays and we say so. |
| P4 | **Two-way communication.** Understanding replies ≥ producing phrases. |
| P5 | **Training, not school.** Gym sessions, not lessons. No grammar curriculum. |
| P6 | **Motivation from meaning.** Countdown, receipts, real capability. No XP/coins/streaks/confetti — ever. |
| P7 | **Works on the plane.** Offline-first is architecture, not a feature. |
| P8 | **Confidence over coverage.** Predictability + recoverability + proof (§9) beat vocabulary size. |
| P9 | **Quality before scale.** The best 100 words beat 10,000 average items. Methodology is validated on pilots before any mass generation (§7.8). |

### Anti-features (permanently rejected)
XP, coins, levels, streaks, leaderboards, confetti; engagement-time metrics; grammar syllabus;
open-ended AI chat as a core loop (allowed later as a *gated practice mode*, §8); any progress
number derived from exposure instead of evidence.

---

## 2 · The Three Planes (the corrected hierarchy)

The proposed single ladder (Word→…→Travel Confidence) conflates three different kinds of
things. The architecture separates them; this is the load-bearing decision of the system.

```
CONTENT PLANE (authored, versioned, static)
  Word ──┐
  Phrase ─┼─→ Moment (owns its Dialogue script + variants) ─→ Situation ─→ Content Pack
  RecoveryMove, CultureTip, MiniFact (cross-cutting, attached to Situations/Moments)

ORCHESTRATION PLANE (computed per user, never authored)
  Trip Plan ─→ Daily Mission ─→ Practice Session ─→ Drill

EVIDENCE PLANE (derived from the append-only event log, never stored as truth)
  ReviewEvent ─→ MemoryState ─→ Moment Survival ─→ Situation Readiness ─→ Travel Confidence ─→ Receipts
```

Why this beats the single ladder:
- **Missions are not content.** They are computed by the plan engine from content + memory
  state + deadline. Authoring "missions" would kill Dynamic Pareto.
- **Confidence is not a level above situations.** It is a *measurement* projected from
  evidence. Storing it would violate P3; it must always be re-derivable from events.
- **Dialogue is demoted from standalone type to the script asset of a Moment.** A dialogue
  without a trigger-moment, variants and a recovery path is a school exercise. (Challenge
  accepted and resolved: Dialogue lives *inside* Moment.)

---

## 3 · Identity, Translation, Versioning (frozen conventions)

### 3.1 IDs — immutable, global convention
```
{learningLang}.{type}.{slug[.qualifier]}
it.word.uscita · it.phrase.restaurant.bill · it.reply.restaurant.cash-card
it.moment.restaurant.waiter-arrives · it.situation.restaurant · it.tip.restaurant.coperto
```
- IDs never change across versions (memory states reference them forever).
- Migration note: legacy `bank.{lang}.{slug}` word ids are migrated to `{lang}.word.{slug}`
  (one-time script; memory states for bank ids do not exist yet, so the window is now).
- Slugs are ASCII kebab-case of the English gloss; sense duplicates get a qualifier
  (`en.word.right.direction`, `en.word.right.correct`).

### 3.2 Translation strategy — LocalizedText everywhere
```ts
type LangCode = 'en' | 'es' | 'fr' | 'it' | 'ar' | 'he';   // extensible, never re-designed
type LocalizedText = Partial<Record<LangCode, string>>;     // meanings, titles, tips, glosses
```
- Every human-readable field of every content type is `LocalizedText`.
- **Fallback chain:** requested UI language → `en` → any. Missing translations are *reported*
  (import reports + a coverage metric per pack), never silently dropped.
- The learning-language text itself (`text`) is a plain string in the learning language.
- Adding UI language #7 = adding map entries. No schema change, by construction.

### 3.3 Versioning
- Content packs: semver per learning language (`it 1.4.0`). Items are add/soft-deprecate only;
  a published id is never reused with a different meaning.
- Every item carries `schemaVersion` (int) + `quality` (§11) + `source`.
- User state needs no migrations: `reviewEvents` is append-only truth; all projections
  (memory, readiness, receipts, confidence) are rebuildable by the shared engine. Algorithm
  upgrades = re-projection, not migration. **This property is inviolable.**

---

## 4 · Content Types (catalog)

Format per type: purpose · objective · relationships · schema · generation · validation ·
quality bar · extensibility. Shared fields on every type:

```ts
interface ContentBase {
  id: string;                // §3.1
  lang: LangCode;            // learning language
  schemaVersion: number;
  quality: QualityLevel;     // §11
  source: string;            // provenance: 'pilot-v1', 'native:marco', 'freq:opensubtitles'
  tags: string[];
  deprecated?: boolean;
}
```

### 4.1 Word
- **Purpose:** recognition fuel — menus, signs, replies. **Objective:** L1 (recognize by eye
  and ear at speed); production only for the small L2+ subset (numbers, question words).
- **Relationships:** referenced by Situations (recognition sets), Phrases (composition,
  informational), Practice (swipe/listening pools).
```ts
interface Word extends ContentBase {
  text: string;              // 'uscita'
  translations: LocalizedText;
  translit?: string;         // ar (romanization strategy), future scripts
  pos?: string; gender?: string;
  forms?: { form: string; label: string }[];
  example?: { text: string; translations: LocalizedText };
  tier: 0|1|2|3;
  skillTarget: 'recognize'|'recall'|'fluent';
  frequencyRank: number;     // from the scoring pipeline (§7.2)
  rolScore: number;          // stored so selection is auditable
  situationIds: string[];    // may be empty (global)
  audio: AudioRef;           // §4.9
}
```
- **Generation:** §7.2 scoring pipeline only — never "common word lists" as-is.
- **Validation:** unique (lang, concept); translations present for all active UI languages or
  reported; no orthographic variants counted twice.
- **Quality bar:** `ai_reviewed` may enter beta packs; `native_reviewed` required for active.

### 4.2 Phrase
- **Purpose:** the atomic unit of *production* — travelers speak in chunks. **Objective:**
  L2–L3 (produce from an English prompt, under time pressure for openers).
- Two sub-kinds, same schema: `role: 'say'` (user produces) and `role: 'hear'` (likely reply —
  comprehension only, never drilled for production). Replies are first-class and browsable.
```ts
interface Phrase extends ContentBase {
  text: string;
  role: 'say' | 'hear';
  translations: LocalizedText;
  literal?: LocalizedText;   // optional gloss
  tier: 0|1|2|3;
  skillTarget: 'recognize'|'recall'|'fluent';
  isOpener?: boolean;        // One Perfect Sentence: overtrained to performance level
  situationIds: string[];
  replyIds?: string[];       // say-phrases link to their likely replies
  rolScore: number;
  audio: AudioRef;           // natural + slow mandatory for 'hear'
}
```
- **Generation & validation:** §7.3. Quality bar: `native_reviewed` for anything `role:'say'`
  in an active pack — an unnatural produced phrase is the fastest way to lose all trust (R1).

### 4.3 RecoveryMove (the Recovery Kit)
- **Purpose:** unbreakability. The 5+2 universal moves trained to reflex on Day 1:
  *slower-please, once-more, I-don't-understand, do-you-speak-English, point/show,
  numbers-by-ear reflex, thank-and-exit.*
- **Objective:** L3 fluent, overlearned (same overtraining rule as Emergency).
- **Schema:** a Phrase with `tags:['recovery']`, `skillTarget:'fluent'`, `tier:0` + a pack-level
  ordered `recoveryKit: string[]` list. No new collection — a named, front-loaded module.
- **Rule:** every Moment's user turn must include a recovery option wired to these ids (§4.6).

### 4.4 CultureTip
- **Purpose:** delight + social competence at near-zero time cost. **Objective:** read once.
- **Schema:** `{ ...ContentBase, text: LocalizedText, situationId?: string }` — **written in
  the UI language** (the learner cannot read the target language; frozen rule).
- **Validation:** ≤ 200 chars, ≤ 3 per situation, must be actionable (a behavior, not trivia).

### 4.5 MiniFact
- **Purpose:** curiosity snacks between drills. **Capped by ROL guard:** max 1 per session,
  always skippable, never quizzed, never blocks anything. Schema = CultureTip with
  `kind:'fact'`. If telemetry shows skipping > 80%, the type is removed (pre-agreed).

### 4.6 Moment (the playable unit) — owns its Dialogue
- **Purpose:** a 10–90 second slice of real life that can be feared, rehearsed, and survived.
  **Objective:** L4 — produce + comprehend under context, cold.
```ts
interface Moment extends ContentBase {
  situationId: string;
  title: LocalizedText;              // "The waiter arrives"
  fearTag?: string;                  // matches onboarding fear-picker
  trigger: { text: string; translations: LocalizedText; audio: AudioRef }; // the opening NPC line
  script: DialogueNode[];            // 4–8 turns, branching (§7.4 rules)
  variants: MomentVariant[];         // ≥2 alternate NPC lines per NPC slot (§7.4)
  coldOpenEligible: boolean;         // can be fired unannounced
  requiredPhraseIds: string[];       // phrases that must be ≥L2 to unlock rehearsal
  recoveryPathIds: string[];         // RecoveryMove ids valid inside this moment
  difficulty: 1|2|3;                 // speed + variant breadth, not vocabulary
}
interface MomentVariant { slotNodeId: string; text: string; translations: LocalizedText; audio: AudioRef }
```
- **Success criteria (frozen semantics of "survived"):** the user completes the moment with
  correct choices/productions OR at most one *successful recovery* (recovery = deploying a
  RecoveryMove and then completing). **Failure:** freeze (timeout with no move) or 2+ misses
  without recovery. **Cold survival** = survived when opened unannounced at natural speed —
  the only thing that counts toward Travel Confidence's "moments survivable".
- **Validation:** every user turn has ≥1 recovery option; every NPC slot has ≥2 variants
  before `coldOpenEligible` may be true; dialogue graph acyclic-with-exit, all refs resolve.

### 4.7 Situation (chapter of moments)
- **Purpose:** the traveler-facing map of the trip; readiness is judged here.
```ts
interface Situation extends ContentBase {
  slug: string;
  title: LocalizedText;
  icon: string; accentColor?: string;
  priorityDefault: number;           // frequency × criticality
  isEmergency: boolean;
  momentIds: string[];               // 2–4 per situation
  corePhraseIds: string[]; replyIds: string[]; recognitionWordIds: string[];
  cultureTipIds: string[];
}
```
- **Completion/Readiness (unchanged, frozen):** notStarted → inProgress → **ready** (all core
  phrases spaced-verified L2+, replies ≥80% at speed, ≥1 moment survived; emergency requires
  timed L3) → **fading** (projected recall at departure below threshold). New addition:
  the *displayed* progress is moments survived + receipts, never a bare % (§9).
- **Dependencies:** none hard-locked except moment rehearsal needs its `requiredPhraseIds` at
  L2 (soft gate — the mission handles ordering; users are never told "locked").

### 4.8 Daily Mission & Trip Plan (orchestration — computed, never authored)
Inputs: pack + memory states + departure date + minutes/day + fear priorities. The plan engine
(tier fit ≤85% weighted capacity, fear-boosted value, new-item taper, graceful re-plan) and
the deadline scheduler (maximize Σ value·R(item, T_departure)) are **frozen as built**. The
week's narrative arc is fixed copy over computed contents: Day 1 *Armor* (Recovery Kit +
numbers) · Days 2–5 *Scenes* (moments, fear-first) · Day 6 *Dress Rehearsal* (continuous
multi-moment run) · Day 7 *Taper* ("You're ready. Stop studying.").

### 4.9 Audio (frozen strategy)
```ts
interface AudioRef { natural: string; slow?: string; source: 'tts' | 'human' }
```
- Moments, phrases and replies: **pre-generated neural TTS files at pack build** (two speeds
  for 'hear' items), replaceable per-item by human recordings with zero schema/client change.
- Recognition words: runtime device TTS until the word is promoted into an active pack, then
  pre-generated. Latency budget in-drill: <100 ms start (preloaded).

---

## 5 · Database Architecture (frozen)

### 5.1 Collections
| Collection | Plane | Notes |
|---|---|---|
| `words`, `phrases`, `situations`, `moments`, `cultureTips` | content | mirror of authored packs; DAL-only access |
| `contentPacks` | content | one row per lang: status (`active/coming_soon/draft`), version, counts, `validated`, quality histogram, `payload` (canonical engine pack for active) |
| `users` | identity | `_id` string; `identities[]` (anonymous now; google implemented; `provider` enum extensible to apple/email-otp — **add enum value, never new collection**) |
| `reviewEvents` | evidence | **append-only source of truth.** `_id` = client UUID (idempotent). Indexes `(userId, at)`, `(userId, itemId, at)` |
| `memoryStates` | projection | rebuildable cache, unique `(userId, itemId)` |
| `practiceSessions`, `sessionLogs` | telemetry | mission + mini-game runs |
| `tripPlans` | orchestration | one active per user |
| `receipts` *(new, projection)* | evidence | denormalized proof feed; rebuildable from events |

### 5.2 Sync & offline (frozen as built)
Local-first always: IndexedDB event log + sync queue → idempotent batch upload → server
re-projects with the same pure engine. Conflict resolution = replay events in timestamp
order. `restore()` pulls the merged log on init when API configured. Content: API-first pack
payload, cached to IndexedDB, static pack fallback, service-worker precache (P7).

### 5.3 Migration strategy
- Content: additive fields with defaults; `schemaVersion` bump + one-shot transform scripts in
  `server/src/seed/migrations/`; deprecation over deletion.
- Evidence: never migrated — re-projected. If an event field is added, old events remain valid
  (all event fields beyond the core are optional by rule).
- The **one pending migration** (pre-import, blocking): `meaning: string` →
  `translations: LocalizedText` across content-schema, pipeline, packs, and Mongo mirrors;
  plus bank id namespace unification (§3.1).

---

## 6 · Multi-Language Strategy
- Learning languages day one: en, es, fr, it, ar. UI languages: he, en, es, fr, it, ar.
- One pack per learning language; all UI-facing strings in packs are LocalizedText; the app's
  chrome strings are per-UI-language dictionaries. RTL (ar learning, he/ar UI) is first-class.
- A language activates only when its pack passes: pipeline validation + quality gate
  (§11: 100% of say-phrases `native_reviewed`) + device TTS/audio check + RTL/typography pass
  (ar). Until then: honest `coming_soon` with visible counts. **Never redesign to add a
  language** — if adding one requires a schema change, the schema was wrong and this document
  must be amended.

---

## 7 · Content Generation Methodology (design first, generate later)

**The Prime Rule (P9):** no mass generation until the methodology survives the Pilot (§7.8).
Nothing enters the system "because it is common." Every item carries its computed `rolScore`
and its `source`, making every inclusion auditable forever.

### 7.1 Return On Learning — the formula
```
ROL(item) = (Impact × Coverage × Urgency) / LearningCost
  Impact    – how much a real interaction improves if this item is known (0–1, rubric below)
  Coverage  – expected encounters per trip-week (frequency in TRAVEL contexts, not general corpora)
  Urgency   – criticality when needed (emergency=3, transactional=2, social=1)
  LearningCost – estimated seconds to target level (recognition ≈ 0.35 × production; engine-calibrated)
```
The same quantity drives the scheduler at runtime; selection and scheduling optimize one number.

### 7.2 Words — the 1,500 ceiling (never a target)
Pipeline (fully documented, re-runnable):
1. **Corpus frequency** — blend subtitle/spoken corpora (proxy for real speech) with a
   travel-domain corpus (hotel/restaurant/transport reviews, menus, signage datasets).
   General-web frequency alone is disqualified (it ranks "government" over "receipt").
2. **Travel utility rubric (0–1):** does a traveler *hear* it (menus, prices, directions,
   replies), *say* it (requests, numbers), or *read* it (signs)? Scored per channel.
3. **Situation coverage:** +boost per situation the word serves; words serving ≥3 situations
   (numbers, "where", "closed") float to Tier 0/1.
4. **Comprehension criticality:** words whose misunderstanding is costly (allergen names,
   "closed", "cash only", platform/track) get Urgency ≥2 regardless of frequency.
5. **CEFR as sanity band only** — never a selector. If our top-500 contains many C1 words or
   misses many A1 words, we audit the pipeline; CEFR never adds/removes an item by itself.
6. **Concept dedup:** dedupe by concept+sense, not string (right/direction ≠ right/correct);
   morphological variants collapse to the traveler-useful surface form.
7. **Category quotas** keep the set balanced (numbers/time, food, transport, lodging, health,
   money, social glue, signs, descriptors) — quotas cap, never fill: an under-ROL word is
   excluded even if its category is "short".
8. **Tiering:** rank by ROL → Tier 0 (top ~60), 1 (~180), 2 (~500), 3 (≤1500).
   `skillTarget`: recognize by default; recall only where production materially helps
   (numbers, question words, key requests).
9. **Translation validation:** every translation back-translated by an independent model pass;
   mismatches flagged to human review; per-UI-language coverage report gates the pack.

### 7.3 Phrases — the 400–500 ceiling
Split by role (challenge to the flat count, accepted): ~250 `say` + ~150–250 `hear`.
Selection criteria, in priority order:
1. **Script position** — phrases are chosen because they slot into Moments (openers, requests,
   responses), not free-floating. A phrase no Moment needs must justify itself twice.
2. **Reuse potential** — templates with slots ("Vorrei ___, per favore") outrank one-offs;
   we teach the chunk and 3–5 high-ROL slot fillers, never grammar.
3. **Conversation coverage** — for each Moment, the `say` set + `hear` set must cover ≥90% of
   its realistic exchanges (measured against variant scripts).
4. **Naturalness** — what natives actually say ("Il conto, per favore"), validated per §11;
   textbook forms are rejected at review, not fixed silently.
5. **Openers** — each situation gets 1–2 `isOpener` phrases trained to performance level
   (prosody, confidence) — the One Perfect Sentence doctrine.

### 7.4 Dialogues (Moment scripts)
- **Length:** 4–8 turns (10–90 seconds). Longer = a second Moment.
- **Branching:** every user turn: 2 content options + 1 recovery option. Branches reconverge
  within 2 turns (authoring cost control; realism preserved by variants, not deep trees).
- **Variants:** every NPC slot ships ≥2 surface realizations at launch, ≥4 when the language
  matures (breaks memorization-of-the-test; prerequisite for `coldOpenEligible`).
- **Listening vs speaking asymmetry:** NPC lines are authored at natural speed with slow
  alternates; user lines are always producible from already-taught phrases — a Moment may
  never require a phrase the plan hasn't introduced (validator-enforced).
- **Register:** polite-formal default; slang only as `hear` variants (understand it, don't
  teach travelers to produce slang — high embarrassment risk, negative ROL).

### 7.5 Moments — selection
Enumerate candidate moments per situation from the fear-picker taxonomy + support literature
(what actually happens in a trip week), score by `fear × frequency × consequence`, cap at 2–4
per situation, ~30 total per language. Each must name: trigger, success criteria, recovery
path, and the fear it removes. A moment that removes no fear is content, not product — cut.

### 7.6 Culture Tips & Mini Facts
Tips: only behavior-changing advice (what to do/say/expect), ≤3 per situation, written in UI
language. Facts: capped per §4.5. Both are seasoning; zero scheduling weight.

### 7.7 Recovery sentences
Fixed universal set (§4.3) + per-language naturalness pass. One addition rule: if beta
telemetry shows a recurring freeze pattern with no matching move, propose a new move via
amendment — the kit stays ≤ 8 items forever (reflexes don't scale).

### 7.8 The Pilot Gate (blocking)
Before scaling any language: build **the best 100 words, 50 phrases, 10 moment scripts, 5
moments cold-open-ready** for Italian via this methodology. Validation: (a) native review
sign-off, (b) 3–5 real beta users complete a 7-day run, (c) ≥60% of their top-3 feared
moments survived cold by day 7, (d) first-24h "did you do it?" ≥ 1 real interaction for
majority. Only then scale Italian to full Tier 1, then replicate per language. The pipeline
that produced the pilot is the pipeline that scales — no separate "bulk mode".

---

## 8 · Practice Engine (nine modes)

Shared contract: every drill emits `ReviewEvent { itemId, mode, outcome, latencyMs?,
usedSlowAudio?, cold? }` into the append-only log; the engine weighs it as evidence.

| Mode | Purpose | Inputs | Output/Scoring | Evidence weight → review effect |
|---|---|---|---|---|
| Swipe | triage/warm-up, self-report | seen items | know / don't | 0.2 (weak prior; never sole basis for anything) |
| Recall | L2 production | phrase, English prompt | self-grade vs reveal; latency captured | 1.0; <3s pass ⇒ fluency flag (L3) |
| Listening | replies at native speed | `hear` phrase audio + 3 meanings | correct/wrong; slow-replay logged | 0.9 for recognize-target; slow use blocks "at speed" credit |
| Speaking (Echo) | pronunciation intro | audio → repeat aloud | completion only | 0.3 (exposure; no fake scoring) |
| **Cold Open** | ambush comprehension→response | coldOpenEligible moment trigger, unannounced, natural speed, random variant | survived / recovered / froze | 1.0 + `cold` flag; the only source of "moments survivable" |
| **Recovery** | unbreakability reflex | simulated breakdown ("you didn't catch it — act") | correct move ≤3s | 1.0 on RecoveryMove items |
| Speed Challenge | number automaticity | 60s number/price/time audio → keypad | streak + personal best (real metric) | 0.9 per answer |
| Situation Simulator | full-moment rehearsal (warm) | moment script + variants | survived w/ ≤1 recovery | 0.95 ⇒ L4 on produced phrases |
| AI Conversation *(future, gated)* | free-form stress test | LLM-driven NPC within moment frame | qualitative + survived | ships only when: offline story, cost, and hallucination-safety are solved; never required for Ready |

Mode-mixing rules (frozen): new phrase = Echo → Recall ×2 same session; recognition word =
Swipe → Listening within 2 sessions; moment rehearsal requires its phrases ≥L2; cold opens
only after ≥1 warm survival; Recovery Kit trains before anything else (Day 1).

---

## 9 · Review Engine & Evidence (frozen physics)

- **Memory model:** two-component FSRS-style — stability S, retrievability `R(t)=exp(−t/S)`,
  difficulty D; evidence-weighted updates (table above); failure collapses S → same-session
  3-strike relearn loop.
- **Deadline adaptation:** objective = maximize Σ value·R(item, T_departure) within the daily
  budget; natural cramming compression near T; long-horizon objective after T.
- **Dynamic Pareto:** weighted tier fit ≤85% capacity (recognition ≈ 0.35×), fear-boosted
  value, missed days shrink scope core-first, taper protects the final 48h.
- **User-facing state vocabulary** (derived, never stored): new / learning / known (recalled,
  awaiting spaced verification) / weak (lapsed or failed-after-success — surfaced in the Weak
  list with one-tap repair) / mastered (consolidated; returns rarely, never hidden forever).
- **Fading** stays the honest face of decay at situation level.

## 10 · UX Doctrine

- **Navigation (4 tabs):** Mission · Moments · Practice · Library (words + phrases +
  Recovery Kit + tips). Mission is the center of gravity; Library is reference, not a destination.
- **Mission philosophy:** the app decides; the user presses Start. One breathing button.
  Estimated minutes always honest. Day-arc labels (Armor/Scenes/Rehearsal/Taper) frame short
  days as design.
- **Dashboard:** countdown · moments survivable (n/30) · fears remaining (n/3) · latest
  receipt. No percentages anywhere primary.
- **Receipts:** every meaningful first ("understood *Contanti o carta?* at full speed, cold")
  written in second person, timestamped, derived from events, rebuildable.
- **Travel Confidence:** the board of situations with honest badges + moments survived;
  detail shows what you'll say, what you'll hear, projected recall at departure.
- **First 24 Hours Abroad:** pre-flight First Move selection → in-trip mode (post-departure):
  pre-moment 90-second warmups, huge-type phrasebook, Emergency Card two taps from anywhere,
  one "Did you do it?" check-in that mints a *real* receipt.
- **Micro-interactions:** check-pop, gentle haptics, staggered entrances, ring/progress fills;
  `prefers-reduced-motion` collapses all motion; one quiet celebration per Ready — the ceiling.
- **Notifications (opt-in, ≤1/day):** mission nudge phrased as the trip ("6 days to Rome —
  11 minutes tonight"); in-trip contextual warmups; optional Cold-Open ambush (clearly opted).
- **Empty states:** every surface has a designed empty state that says what to do next;
  "Session complete" may never appear after zero drills.

## 11 · Content Quality Workflow

`draft → ai_generated → ai_reviewed → native_reviewed → expert_approved → verified`

| Level | Meaning | May ship in |
|---|---|---|
| draft | authored, unvalidated | nowhere |
| ai_generated | produced by pipeline w/ rolScore | internal builds |
| ai_reviewed | second independent model pass: naturalness, back-translation, safety | beta packs, `hear`/words only, with beta banner |
| native_reviewed | human native speaker sign-off (paid reviewer, per-item checklist) | **required for all `say` phrases + moment scripts in active packs** |
| expert_approved | linguist/teacher spot-audit of a sample per pack version | required to remove the beta banner |
| verified | survived ≥N real-user cold encounters without flags | badge of honor; feeds selection tuning |

In-app feedback ("locals say it differently") files an issue against the item id; two flags
auto-demote to `ai_reviewed` and pull it from cold opens until re-reviewed.

## 12 · Roadmap (Epics → Sprints → Tasks)

Complexity S/M/L; risk 🟢🟡🔴. Order is the recommended order.

### EPIC 1 — Schema Freeze & Migration *(blocks everything)*
**Sprint 1.1 — Canonical schema**
| Task | Goal / Acceptance | Deps | Cx | Risk |
|---|---|---|---|---|
| T1 LocalizedText migration | `meaning`→`translations` across content-schema, pipeline, packs, Mongo, UI; fallback chain he→en; coverage report in validator | — | L | 🟡 breaks everything if partial — one PR, full verify loop |
| T2 ID unification | `{lang}.{type}.{slug}`; migrate `bank.*` ids; collision check in CI | T1 | S | 🟢 |
| T3 Moment schema | Moment/variant/recovery types in content-schema + validators (recovery option per user turn, ≥2 variants for cold) | T1 | M | 🟢 |
| T4 Quality field | `quality`/`source`/`rolScore` on all types; pack gate = quality histogram | T1 | S | 🟢 |
**Sprint 1.2 — Pipeline & DB alignment:** seeders/pack-builder emit new schema (M); receipts
projection collection (S); audio pre-generation step w/ `source:'tts'` (M 🟡 cost/licensing).

### EPIC 2 — Methodology Pilot (Italian) *(the P9 gate)*
**Sprint 2.1 — Selection pipeline:** word-scoring pipeline w/ auditable rolScore (L 🟡 corpus
sourcing); phrase/moment selection per §7.3–7.5 (M); pilot set authored: 100/50/10/5 (M).
**Sprint 2.2 — Validation:** native reviewer engaged + checklist + sign-off (M 🔴 external
dependency — start recruiting immediately); 3–5 real-trip beta users; success = §7.8 criteria.

### EPIC 3 — Confidence Experience
**Sprint 3.1:** Moments UI (watch → be in it → cold) (L); Cold Open + Recovery practice modes
(M); Day-1 Armor mission + arc labels (S); audit P0 fixes folded in: planner interleave,
partial-credit display, practice empty states (S–M, 🟢 specs exist).
**Sprint 3.2:** Receipts ledger + dashboard v2 (moments survivable / fears remaining) (M);
fear-picker onboarding + fear-boosted value (S); Weak list + one-tap repair (S).

### EPIC 4 — First 24 Hours Abroad
First Move selection (S) · in-trip mode flip + contextual warmups (M) · "Did you do it?"
check-in → real receipt + truth-serum metric (S) · notification layer, opt-in (M 🟡 platform).

### EPIC 5 — Scale Italian, then languages
Italian Tier 1 full build via pipeline (L, gated on Epic 2) → es → fr → en (each: pack build,
native review, TTS check, activation flip — M each) → ar last (RTL + romanization strategy +
typography pass, L 🟡).

### EPIC 6 — Quality & Ops
Reviewer workflow tooling (M) · telemetry: freeze rate, cold-survival, refresh responsiveness,
first-24h yes-rate (M) · engine parameter tuning from cohort data via re-projection (M) ·
feedback-flag loop (S).

**Post-freeze immediate order:** E1S1 → E1S2 → E2S1 → (E3S1 ∥ E2S2) → E3S2 → E4 → E5 → E6.

## 13 · Assumptions Challenged (ruled)

1. **Single content ladder → three planes** (§2). Missions/confidence are computed, not authored.
2. **Dialogue as standalone type → demoted** to Moment's script asset.
3. **"1500 words" → ceiling with tiering + recognition-weighted cost**; the target is ROL, not count.
4. **Flat 400–500 phrases → split say/hear**; replies are first-class and browsable.
5. **Percent progress → evidence progress** (receipts, moments survivable, fears remaining).
6. **Equal-tab navigation → mission-first 4 tabs**; equal importance is a content truth, not a nav truth.
7. **Mini Facts admitted but capped with a pre-agreed removal trigger** (ROL guard).
8. **Slang: comprehension-only.** Teaching travelers to produce slang is negative ROL.
9. **AI conversation: future gated mode, never core** — determinism, offline and honesty first.

## 14 · Amendment Process

This document changes only by explicit amendment: a dated entry in `docs/DECISIONS.md`
(`B-###`) stating what changed, why, and the migration consequence. Code may never silently
diverge from the Bible; if implementation reveals the Bible is wrong, amend first, build second.
