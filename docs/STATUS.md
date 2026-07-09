# STATUS — READY build report

## 📚 Start here — required reading for every sprint

Before touching this codebase, read the living docs **in this order**:

1. **[READY_MASTER_OVERVIEW.md](./READY_MASTER_OVERVIEW.md)** — the single source of truth for
   understanding READY: what it is, why it exists, how it's built, the rules, and current status.
2. **[READY_PROJECT_STRUCTURE.md](./READY_PROJECT_STRUCTURE.md)** — product rules + app/architecture detail.
3. **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)** — every Bootcamp mission's content
   (phrases, expected replies, recovery tools, cold opens, dialogues), for content review. Read
   this before touching any Bootcamp content.

**Before development:** read (1); if touching Bootcamp content, also read (2).
**After development:** update (1) if architecture/product rules/navigation/data-model/learning
philosophy/pipeline/language support/Bootcamp behavior changed; regenerate (2) with
`npm run gen:conversations` if Bootcamp content changed.


Date: 2026-07-04 · All four milestones (M0–M4) complete and committed. Full verification
loop (typecheck → lint → tests → build → smoke) green at every milestone.

## What's done

### M0 — Foundation & Engine
- npm-workspaces monorepo, TS strict (project references), ESLint 9 + Prettier, Vitest.
- `packages/content-schema`: zod schemas for every content + user-state entity (PDF §12).
- `packages/engine` (pure, zero I/O): FSRS-inspired memory model `R(t)=exp(−t/S)` with
  per-mode evidence weighting (swipe = weak prior); deadline-aware greedy scheduler
  (`value × R-gain / seconds-cost` toward R at departure, long-horizon after the trip);
  plan engine (weighted tier selection ≤85% capacity, situation ordering, new-item taper,
  graceful re-plan); readiness rules (notStarted/inProgress/ready/fading, spaced verification,
  emergency L3 gate). Coverage ~98% statements / 91% branches (bar: 85%).
- **Simulated-learner proof**: virtual learners with configurable forgetting rates run a real
  7-day × 30-min plan; ≥80% of Tier-1 phrases reach L2+ at departure; the scheduler never
  exceeds the daily budget; holds across a 5-seed cohort.

### M1 — Content
- `content/it-IT/pack.yaml`: 182 Tier-0/1 items — 10 situations (core phrases, 4–6 likely
  replies each, recognition words, one branching dialogue, ≤3 culture tips), 14 politeness-glue
  phrases (fluent target), 26-number curriculum incl. prices/time stages. `it-IT v0.1.0`,
  `needsNativeReview: true`.
- Pipeline: YAML → zod validation → referential/tier/dialogue integrity → versioned JSON pack +
  manifest into `apps/web/public/content/`. `validate:content` is the CI gate (8 content tests).
- TTS integration point: asset-path convention + `AudioResolver`/`TtsProvider` interfaces; Web
  Speech API fallback in the app; real recordings swap in per-item with no client change.

### M2 — App (MVP)
- `packages/data`: `DataProvider` interface; `MockProvider`; `LocalProvider` = permanent
  IndexedDB offline layer (append-only event log, sync queue, pack cache, projection via the
  shared engine); `ApiProvider` (M3).
- React 18 PWA (feature-sliced, Zustand): onboarding (§10.1), Home/Mission Control, Session
  Player with one interaction shell and modes 1–6 (Swipe Triage, Flash Recall with latency
  fluency evidence, Echo, Understand-the-Answer with logged slow-replay, Number Sprint with
  personal best, Situation Simulator with branching dialogues), Warm-up→Learn→Integrate→Close
  with capability summary, 3-strike relearn loop, instant per-drill persistence
  (interruptible), Readiness Board (incl. Fading + projected recall), Phrasebook, Emergency
  Card (huge type, show-to-a-local, 112), Plan & Settings with honest re-planning.
- PWA: manifest + service worker; app shell and content pack precached; fully offline after
  first load. Calm two-accent design, thumb-zone actions, no gamification anywhere.

### M3 — Backend, Sync & Google Auth
- Express `/api/v1` (PDF §13): content manifest, anonymous users (adopt client id), plan CRUD,
  idempotent `POST /me/review-events:batch`, memory-state restore, session logs, readiness.
  zod validation everywhere, typed `AppError` middleware, async-safe handlers.
- MongoDB (Mongoose) per §12.3 with indexes; `reviewEvents` append-only; `memoryStates`
  re-projected by the same engine code the client runs.
- Google Sign-In: GIS button (client) → ID-token verification (`google-auth-library`) → JWT
  httpOnly cookie → anonymous→Google identity merge (events moved, state re-projected, plan
  kept). `.env.example` + RUNBOOK document the console steps.
- 10 Supertest API tests against mongodb-memory-server.

### M4 — Hardening & verification
- Error handling: AppError middleware, per-feature ErrorBoundaries, audio fallbacks that never
  dead-end a drill, sync retry with exponential backoff + online-event trigger, user-facing
  retry states in onboarding/init/plan.
- `npm run smoke`: scripted plan → session → events persisted → readiness updates → offline
  reload over the real built pack — 15/15 checks pass.
- Fixed during hardening: planner tier selection now uses weighted item costs (recognition =
  0.35× production per §6.3), so the flagship 7-day × 30-min user correctly gets Tier 1; tier
  selection also caps at the pack's deepest authored tier. Regression-tested.
- Final: 74 tests green, typecheck/lint clean, production builds of web + server.

## Known gaps (honest list)

1. **Content needs native review** — `needsNativeReview: true`; a native Italian speaker must
   sign off per R1. Culture tips are written in Italian; consider English for MVP users.
2. **Audio is Web Speech API TTS** until real recordings (or neural TTS files) are dropped into
   `apps/web/public/audio/it/` — the swap path is built and tested.
3. **Echo mode has no mic record-and-compare** (D017) — v1.1 addition.
4. **Google Sign-In needs your Google Cloud client id** (RUNBOOK steps); until then the app
   runs anonymous + fully offline.
5. **Dev-tooling npm audit findings** (vitest/vite dev-server advisories) require major-version
   bumps of the test/build toolchain; they do not affect production artifacts. Tracked, not
   fixed, to avoid destabilizing the verified toolchain (D026).
6. **In-Trip Mode, Sign Scan, Panic Mode, more languages** — per PDF roadmap (v1.1+), not MVP.

## Decision log

See `docs/DECISIONS.md` (D001–D026) — one line of reasoning each, keyed to PDF sections.

## Verification snapshot

```
typecheck  ✓ tsc -b (schema, engine, data, server) + content + web
lint       ✓ eslint (0 problems)
tests      ✓ 74 passed / 74 (engine 41 · content 10 · data 13 · api 10)
coverage   ✓ engine ~98% stmts / 91% branches (bar 85%)
build      ✓ packages + content pack + PWA (precache 13 entries) + server dist
smoke      ✓ 15/15 checks (plan → session → persistence → readiness → offline reload)
```

---

## M5 — UX overhaul (2026-07-05)

Rebuilt the presentation layer as a complete ecosystem per the founder's UI/UX refinement brief.
The engine, data providers, server and tests are untouched and still green.

- **Multi-language platform**: language registry (🇺🇸 🇪🇸 🇫🇷 🇮🇹 🇸🇦) with per-language accent
  themes, native names and RTL; dynamic UI language (en + he shipped) — adding a language is a
  dictionary + a content pack, zero screen changes. Italian is the first shipped pack (R1);
  the founder's fr/es/en/he vocabulary bank seeds the next packs.
- **Mission-first**: Today's Mission card previews the scheduler's real output with estimated
  minutes and a single Start button; the whole app funnels into it.
- **Equal content surfaces**: bottom nav — Mission · Words · Phrases · Situations · Practice.
- **Travel Confidence**: per-situation rings + the four honest badges; detail view with
  projected recall at departure.
- **Practice hub**: six mini-games (Swipe, Recall, Listening, Speed Challenge, Simulator, Echo)
  reusing the session runtime and the honest evidence model.
- **Micro-interactions**: check-pop, haptics, staggered entrances, breathing CTA, animated
  rings/progress — no XP/coins/streaks/confetti anywhere (P6).

Verification after M5: 74/74 tests, typecheck + lint clean, PWA production build (13 precache
entries), engine untouched at ~98% coverage.

---

## M6 — Real MongoDB-backed data (2026-07-05)

- **Connected to the real cluster** via `MONGO_URI` in `server/.env` (never logged);
  `npm run seed:all` populated: it words 51 · it phrases 131 · it situations 10 · bank words
  3,000 (from the 1,000-row fr/es/en/he vocabulary bank, full import report printed) ·
  5 contentPacks rows. Re-run inserts 0 (idempotent).
- **Live API verified** against real Mongo: /health {mongo:"connected"}, /content/languages
  (5 languages with counts), /words?languageCode=fr → 1000, /content/packs/it/full → full
  engine payload (58 KB).
- **New API surface** (Routes → Controllers → Services → DAL): health, content/languages,
  content/packs(+/:lang, /:lang/full), words, phrases, situations, review-events,
  memory-states, practice-sessions(+end), readiness — all zod-validated, anonymous-friendly.
- **Frontend**: ApiProvider now fetches the pack API-first and caches it into IndexedDB;
  falls back to the static pack when the server is down (tested).
- **Languages**: it = active (pipeline-validated; native review still pending) · en/es/fr =
  coming_soon (bank words seeded; need travel phrases + situations) · ar = coming_soon
  (needs full pack + RTL review).
- **Google Auth**: implementation already present; still needs your `GOOGLE_CLIENT_ID`
  (+ VITE_ vars). GOOGLE_CLIENT_SECRET is NOT required for the ID-token button flow.
- Verification: 92/92 tests, typecheck/lint clean, prod builds, SMOKE PASS.

---

## Epic 1 — Schema Freeze executed (2026-07-05)

LocalizedText canonical schema live across content-schema → pipeline → packs (it 0.2.0) →
Mongo (reseeded in place, 0 new rows) → API → web UI (L() at every render site). Hebrew UI
now renders situation names + culture tips in Hebrew with English fallback elsewhere; culture
tips re-authored en+he. P0 fixes: zero-drill guidance state, per-game practice eligibility,
jargon-free copy, anonymous restore wired. Verification: 97 tests, typecheck/lint clean,
production build, SMOKE PASS, live API checks (he title + localized tip via /packs/it/full).
Remaining Epic 1 tasks (next): ID namespace unification (T2), Moment schema (T3), quality
field (T4).

---

## Sprint 6 — Bootcamp Foundation (vertical slice)

20-day capability plan (data + landing map: Day 1 "I can survive" → Day 20 "a whole day
abroad alone") with per-day objective/confidence gain/targets/skills/feeling/why/prepares-next.
Day 1 fully playable in Hebrew UI (~20 min): welcome → briefing → stuck-traveler dialogue
(watch) → 7 survival tools listening-first (hear→meaning→say) → listening quizzes → swipe
game → dialogue (play, choice points) → fast-sentence confidence ambush → evidence receipts →
day summary + capability card. Real events into the log; resume + replay; walkthrough fixes
(speech-complete advancing, StrictMode-safe transcript, clear ambush CTA). 113 tests green.

---

## Sprint 7 — READY Missions (2026-07-06)

Chrome audio fixed at the root (cancel/speak race + utterance GC + voice priming — D051).
Bootcamp redesigned into 30 missions / 5 phases with cold checkpoints (plan data + map UI).
Deep Moment architecture: dialogue TREES rendered one line at a time with branching recovery
beats; Expected Replies as a first-class comprehension step. Mission 1 rebuilt interactive;
Mission 4 "Coffee Shop" built as the depth exemplar (full barista question-chain). Mission
Complete screen drives the one-more-mission loop. 121 tests green incl. dialogue-graph
validators; typecheck/lint/build/smoke pass.

---

## Sprint 8 — Production Content Acceleration (2026-07-07)

Chrome audio fixed at the TRUE root (D056): the blocker was Chrome's autoplay/gesture-unlock
policy, not the Sprint-7 cancel/speak race — the prior setTimeout defer had made it worse.
Engine now primed inside the first user gesture + explicit unlock on Start, with a dev-only
audio diagnostics panel, a Test Audio button, an always-visible "enable sound" card on the
mission map, and never-silent fallbacks. Missions 2–10 built as pure data on the single Mission
player (Introduce Myself, Numbers & Money, Restaurant, Directions, Taxi, Hotel Check-in,
Shopping, Arrival-Day checkpoint): listening-first tools, Expected-Replies comprehension,
branching recovery-beat dialogue trees, off-script cold opens, evidence receipts. 32 mission
concepts (recovery kit + core say-phrases + expected replies) seeded idempotently through the
pipeline into Mongo (35 total incl. samples) with English playable and es/fr/it/ar honest
DRAFT realizations flagged for native review. Typecheck 0 / lint clean / 143 tests / build /
smoke all green; seed reruns idempotent (0 inserted, 35 updated).

---

## Sprint — Pilot UX Improvements (real pilot feedback, 2026-07-09)

UX-only sprint driven entirely by real pilot testers. No engine/schema/pipeline/pedagogy changes;
Bootcamp content (phrases, replies, dialogues) is untouched — only placement, presentation and
navigation improved.

- **Removed the redundant "I said it" screen** in the Practice tool step. The flow was
  Learn → Hear → "I said it" (which just repeated the same sentence and made testers think the app
  had frozen) → Next. It is now Learn → Practice (say it aloud) → Next, on one screen. The echo
  evidence event is still recorded.
- **Transcript navigation**: the tiny back arrow is now a large, rounded, mobile-friendly icon
  button (52px target), and a **✓ Finish** button returns to the Mission Hub — navigation only, no
  progress reset.
- **First-launch App Language step**: on the very first open the app asks for the app language
  (עברית / English) *before* anything else, instead of assuming English.
- **Language names shown in the app language** (Task 4): a Hebrew UI now shows אנגלית / ספרדית /
  איטלקית / צרפתית / ערבית; an English UI shows English / Spanish / Italian / French / Arabic
  (`languages.ts` `names` + `languageName()`), everywhere trip languages are listed.
- **Core is now a knowledge-center shell** with tabs — Core Phrases (live) · Core Words · Core
  Patterns · Common Questions · Emergency · Favorites (all honest "coming soon"). Structure only,
  no faked content.
- **Survival Toolkit relocated** (biggest reported problem): ex-Mission 1 confused almost every
  tester because its answers are escape tools, not answers to the conversation. It is renamed
  **Recovery Toolkit**, marked **special/optional** (no number), and placed at the end of the
  Bootcamp map. The numbered journey now begins with **Introduce Myself** (#1) and runs 29 missions
  (1–29). The mission's content is unchanged; `day`/DAYS keys and persistence ids are unchanged —
  display numbering is purely presentational (`missionNumber()` / `CORE_MISSIONS`).
- **Mission mapping bug fixed + fully validated** (Task 7): Mission 5's card said "Fast Replies I"
  but opened the Restaurant sit-down-meal content (day5) — the ear-only "Fast Replies" slot never
  had content. The card is corrected to **Restaurant Meal** (distinct from Mission 13's "Restaurant
  Basics" to avoid two identical cards). A script now verifies all 30: every card's title == its
  hub == its content, with a victory summary and a transcript dialogue present. Missions 2 & 3 card
  wording was harmonized to their content ("Introduce Myself", "Numbers & Money").

Verification: typecheck 0 · lint clean · **281 tests** · production build (13 precache entries) ·
SMOKE PASS · `gen:conversations` regenerated. Known follow-ups: the internal "Mission N:" headline
on each mission's first practice screen still carries its original day number (cosmetic, off by one
vs the new display number for missions 2–30); and day5/day13 are two similar restaurant lessons —
next sprint could differentiate or merge them, and add the real "Fast Replies" speed mission.
