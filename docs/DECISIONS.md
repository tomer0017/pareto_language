# Decision Log

Every non-obvious technical decision, with one line of reasoning. Referenced by principle
(P1–P7) from the PDF where relevant.

## M0 — Foundation & Engine

- **D001 — npm workspaces over pnpm.** Zero extra install step for the reviewer; Node 20 ships
  npm 10 with stable workspace support. Fewer moving parts serves P5 (ship, don't ceremony).
- **D002 — TS path aliases resolve to package `src`, not built `dist`.** Vitest and Vite resolve
  cross-package imports from source, so the engine can be tested with zero build step. `dist` is
  still emitted for consumers that need declarations.
- **D003 — `strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`.** Maximum type safety;
  the engine is the product (per PDF final word), so its types must be airtight. No `any` outside
  third-party boundaries (quality bar).
- **D004 — ESLint 9 flat config with `typescript-eslint`.** Current standard; `no-explicit-any` is
  an error to enforce the quality bar.
- **D005 — Memory model is FSRS-inspired but hand-rolled, not the `ts-fsrs` npm package.** The PDF
  wants a deadline-aware *wrapper* around a two-component (stability/retrievability) model. Rolling
  a small, fully-owned model keeps the package dependency-free (Decision 1: pure, isomorphic) and
  lets us tune evidence weighting per PDF §8.2 exactly. `R(t) = exp(-t/S)` is used verbatim.
- **D006 — Knowledge ladder level is derived from evidence history, not stored independently.**
  Level (L0–L4) is computed from stability, successful-recall count, spacing gaps and simulator
  completion so it can never drift from the event log (P3: honest knowledge). MemoryState caches it.
- **D007 — Scheduler is greedy (`value × R-gain / seconds-cost`) per PDF §8.3.** Simple enough for
  MVP, principled enough to be right. No LP solver; the objective is evaluated per-item per-tick.

## M1 — Content

- **D008 — Content authored in YAML, built to versioned JSON.** Reviewable in Git (PDF §11.3);
  the build step validates against zod and emits `it-IT.v0.1.0.json`.
- **D009 — TTS via a `TtsProvider` interface with a Web Speech API fallback.** No cloud key needed
  to use the app today; audio asset paths resolve through the interface so real recordings swap in
  later without client changes (PDF §7.4, §11.3).

## M2 — App

- **D010 — DataProvider composition: ApiProvider *wraps* LocalProvider.** Local-first writes always
  hit IndexedDB first (PDF §11.4); the API layer syncs the append-only event queue in the
  background. LocalProvider is permanent production code, not scaffolding (PDF §11.2 note).

## M3 — Backend

- **D011 — Memory state is a rebuildable projection; `reviewEvents` is the source of truth.** Same
  `packages/engine` code projects state on client and server (Decision 1), so re-computation after
  an algorithm change needs no migration (PDF §11.4).

## Notes added during M1

- **D012 — Simulated-learner assertion interprets "Tier-1 items reach L2+" as core *phrases*.**
  Asymmetric skill targeting (PDF §6.3) means recognition items (replies/words) only aim for L1,
  so the ≥80% L2+ bar applies to production (phrase) items; recognition items are asserted at L1+.
  Both bars are enforced in `simulated-learner.test.ts`.
- **D013 — Dialogue `id` is synthesized by the pipeline (`it.dialogue.<situation>`).** Authors
  write only `startNodeId` + `nodes` in YAML; the build assigns a stable id, one less thing to
  keep consistent by hand.
- **D014 — Emitted JSON packs are build artifacts (gitignored); YAML is the source of truth.**
  `npm run build:content` regenerates `apps/web/public/content/*.json` + `manifest.json`.
- **D015 — Repo path contains Hebrew; a homoglyph twin dir (Arabic reh vs Hebrew resh) was
  created and removed.** All shell commands `cd "$(ls -d /Users/.../*/parto_language | head -1)"`
  to bind to the real (git) directory unambiguously.

## M2 — App

- **D016 — View routing via Zustand state, not react-router.** Six flat views, no deep links
  needed in MVP; one less dependency and zero router/PWA-offline interplay to debug.
- **D017 — Echo mode ships without microphone recording.** Record-and-compare adds a permission
  prompt and MediaRecorder complexity for zero knowledge-model signal (echo is exposure, weight
  0.3). Play → repeat aloud → continue. Mic compare is a clean v1.1 addition.
- **D018 — Simulator completion = L4 evidence on the core phrases the user actually produced.**
  `simulatorDone` for readiness is derived (any core phrase at L4) instead of a separate stored
  flag — keeps the event log the single source of truth (P3, §11.4).
- **D019 — Number Sprint drills the authored number items only.** Composite numbers (e.g. 34)
  would have no itemId to log honest evidence against; the authored set (0–20, tens, 100, 1000)
  covers the curriculum stages while keeping tracking honest.
- **D020 — PWA icons are generated placeholder PNGs.** Solid-accent squares emitted by a
  dependency-free script; real brand icons are a design task, not an engineering one.

## M3 — Backend, Sync & Google Auth (implementation notes)

- **D021 — Anonymous server users adopt the client-generated id.** POST /users/anonymous accepts
  `clientUserId` so the device's local user and the server user are the same id — event logs
  merge without any id-mapping table.
- **D022 — /me/identities and /auth/google share one handler.** Both verify the Google ID token
  server-side (`google-auth-library`) and run the identity merge; merge = move append-only
  events + logs to the Google user, re-project via the shared engine (no bespoke conflict code).
- **D023 — API tests run against mongodb-memory-server.** Real Mongoose queries + indexes under
  test with zero local MongoDB requirement; the binary downloads once on first test run.
- **D024 — memoryStates projection is recomputed per batch upload.** Per-user event logs are
  small (≤ a few thousand); correctness over premature optimization, and the projection stays
  rebuildable at any time (PDF §12.3).
- **D025 — Async Express handlers are wrapped (`ah`) so rejections hit the error middleware.**
  Express 4 does not forward async rejections; without this, thrown AppErrors crash the process.

## M4 — Hardening

- **D026 — npm audit criticals are dev-tooling only; accepted, not force-fixed.** vitest/vite
  dev-server advisories need major bumps (vitest 4 / vite 8) that risk the verified toolchain;
  production artifacts are unaffected. Revisit on the next toolchain upgrade.
- **D027 — Planner uses weighted item costs (recognize = 0.35 × production).** Without this the
  182-item Tier 1 could never fit the flagship 7-day × 30-min persona (§7.1 says it must);
  §8.1's "blended across skill targets" and §6.3's "fraction of production cost" bless the
  weighting. Regression-tested against the real it-IT pack.
- **D028 — selectTier caps at the pack's deepest authored tier.** A Tier-0/1-only pack must
  report Tier 1, not a vacuous Tier 3.

## M5 — UX overhaul: multi-language platform + mission-first game feel

- **D029 — The app is designed around a language registry, not a language.** Five learning
  languages (en/es/fr/it/ar) each carry flag, native name, accent color and script direction;
  selecting one re-themes the whole UI via CSS custom properties. RTL (Arabic learning, Hebrew
  UI) is first-class: `document.dir` switches and layout mirrors.
- **D030 — Only shipped packs are selectable; the rest show "coming soon".** PDF R1 verbatim:
  "start with 1 language done superbly, not 5 done adequately." Italian is that language; the
  platform (registry, selector, pipeline, packs-by-lang) is multi-language from day one, and the
  user's multilingual vocabulary bank (fr/es/en/he) seeds the next packs' recognition words.
- **D031 — UI strings behind a t() dictionary (en + he shipped).** Adding an interface language
  is one dictionary file, zero screen changes — proving the "no redesign per language" bar.
- **D032 — Today's Mission is the product surface; all tabs support it.** The Mission card
  previews the exact scheduler output (review/new/phrases/sprint/scenario + honest estimated
  minutes) so the user never decides what to study; one breathing Start button carries the whole
  loop. Bottom nav gives Words/Phrases/Situations/Practice equal, one-tap standing.
- **D033 — Practice = six single-skill mini-games reusing the session runtime.** Focused
  sessions (swipe deck, recall run, listening round, 60s sprint, simulator replay, echo) — same
  event log, same honest evidence weights; practice sessions don't trigger re-planning.
- **D034 — Game feel without gamification.** Micro-interactions only: check-pop on pass, gentle
  haptics, staggered card entrances, breathing CTA, animated confidence rings. Still zero XP,
  coins, streaks, or confetti (P6); `prefers-reduced-motion` collapses all motion.
- **D035 — Travel Confidence % is derived from readiness detail** (55% solid phrases, 30%
  replies understood, 15% scenario done) — a visual read of demonstrated evidence, never
  exposure counts (P3). Badges keep the four honest states on top of the ring.

## M6 — Real MongoDB-backed data

- **D036 — MongoDB is the authoritative content store for the API; static packs stay as the
  offline fallback.** One authoring source (YAML + vocabulary bank) feeds both: seeds upsert
  words/phrases/situations/contentPacks into Mongo, and the active pack's canonical engine
  payload is stored on its contentPacks row and served at /content/packs/:lang/full. Not a
  parallel system — one source, two delivery paths (API online, static/IDB offline, P7).
- **D037 — MONGO_URI (server/.env) is canonical; MONGODB_URI kept as alias.** Config loads
  server/.env then root .env explicitly (CWD-independent). The URI is never logged.
- **D038 — The simplified practice API is a facade over the engine, not a second SRS.** POST
  /review-events maps result/sourceGame onto engine ReviewEvents (append-only log unchanged);
  GET /memory-states derives status (new/learning/known/weak/mastered) and nextReviewAt
  (t where R(t)=0.9) from the FSRS-style state. The requested fixed intervals (24h/72h/7d) are
  superseded by the engine's adaptive spacing, which already satisfies their intent: failures
  come back within hours, mastered items return rarely, nothing is ever hidden forever.
- **D039 — Anonymous, no-login progress via resolveActor.** JWT if present, else a
  client-format anonymousId (anon-<uuid>) creates/reuses the same user id the PWA generates
  locally — no id-mapping, no login wall.
- **D040 — Bank rows generate one Word doc per learning language present (fr/es/en).**
  translations carry the other columns (incl. he); it/ar are absent from the bank and are
  reported by the importer rather than silently ignored. Bank words alone do NOT activate a
  pack — phrases/replies/situations are still required (packs stay coming_soon).
- **D041 — Seed idempotency = upsert by stable _id.** Re-running inserts 0; "updated" counts
  reflect $set touching timestamps, not duplicates.

## Product Bible

- **D042 — docs/PRODUCT-BIBLE.md v1.0 is the frozen product constitution.** Three-plane
  architecture (content / orchestration / evidence), LocalizedText translation strategy, ID
  convention, Moment model with survived-semantics, ROL methodology with the §7.8 pilot gate,
  quality workflow, and the epic roadmap. All future work must be consistent with it or amend
  it first (B-### entries).

## Master Specification & amendments

- **D043 — docs/MASTER-SPEC.md v1.0** extends the Bible with learning science (Capability
  Stack + Ten Laws), the staged Intelligence Layer, Pareto mathematics (θ-threshold
  economics), psychology journey, the CFIR metric tree, gated future stages, and the ranked
  pre-mortem. Bible remains the constitution; where both speak, Bible governs structure and
  the Master Spec governs method.
- **B-001 — Recovery Move #8: The Graceful Translator.** Trained, dignified hand-over to the
  phone translator as the explicit last move. Converts the existential competitor into the
  safety net; also acts as a content filter (rare nouns score Impact≈0). Kit stays ≤8 moves.
- **B-002 — Morning Micro-Review.** Opt-in 90-second next-morning review of yesterday's 3
  weakest items (sleep-sandwich consolidation). Orchestration-plane session preset; no new
  content type; no schema change.
- **B-003 — Document freeze.** After MASTER-SPEC v1.0, no further strategy documents until
  the Italian pilot (Bible §7.8) produces user telemetry. Amendments only via B-###.

## Epic 1 — Schema Freeze (execution)

- **D044 — LocalizedText is live end-to-end.** ContentItem.meaning/literal, Situation.name,
  cultureTips, dialogue meanings and NumberStage.label are language→string maps (en pivot
  required by zod). `localize()` implements the frozen fallback chain uiLang → en → any and
  tolerates legacy plain strings so stale offline caches can never crash a render. Pack bumped
  to it 0.2.0; the Mongo migration was a reseed (idempotent upserts; 0 inserts, in-place update).
- **D045 — YAML authoring accepts string or map.** Plain strings mean {en}; tips and situation
  names now author as en+he maps. Culture tips are written in UI languages (frozen rule) —
  the Italian-only tips bug is gone at the schema level, not just the data level.
- **D046 — P0 pilot fixes shipped with the migration:** zero-drill sessions render a guidance
  state (never "Session complete"); practice games disable with a reason when they would be
  empty; Tier/plan-version/pack-id jargon removed from user-facing copy; ApiProvider.restore()
  wired into init for API-configured builds.

- **B-004 — Pilot language amended it→en: READY CORE.** The Bible §7.8 pilot is implemented
  as READY CORE (100/50/10/5, learning=en, UI=he) per docs/READY-CORE-SPEC.md. Rationale:
  founder can desk-validate every item (removes the native-reviewer bottleneck from the pilot
  loop); he→en is a real beachhead market. Caveat encoded in the spec: founder fluency cannot
  test the fear curve — outcome validation requires the Stage-B weak-English cohort. New
  methodology rule introduced: the Assumed-Known (cognate) Filter, cohort-relative per
  (learningLang, uiLang) pair. Italian remains the shipped demo pack; en public status stays
  honest (draft/coming_soon) until Stage B passes.

- **D047 — Corpus Methodology v1 + Core-EN drafts.** docs/CORE-EN-METHODOLOGY.md defines the
  signal set, ROL formula and exclusion filters; content/core-en/ holds assumed-known.yaml,
  core100.draft.yaml (exactly 100; 'why' cut by θ at score 26) and core50.draft.yaml
  (8 recovery + 24 say + 18 hear, 5 openers). v1 scores are rubric-estimated and auditable
  per row (honesty declaration §6); Arabic translations are MSA and universally
  review-flagged. Drafts are NOT wired to pipeline or seeds — Stage A founder validation
  gates promotion.

- **B-005 — Progressive corpus layers replace raw tier sizes.** Survive 100/50 → Transact
  300/150 → Adapt 700/300 → Connect 1500/500 (words/phrases, cumulative), mapped to engine
  tiers 0–3; capacities update at pack level, planner math unchanged. Each layer is defined
  by the capability it unlocks, per docs/CORPUS-METHODOLOGY.md §2.
- **B-006 — Confidence-over-knowledge codified in selection.** RoF (Return on Failure) is a
  first-class score factor; hear-channel ≥ say-channel at equal impact; freeze-reducing
  candidates win all ties. Known-By-Default becomes a measured, pair-specific system
  (internationalism score + attested loanwords + ≥90% first-pass cohort demotion) with a
  probe mechanism through Swipe Triage. Ten Never-Teach categories adopted.

## Sprint 6 — Bootcamp Foundation

- **D048 — Bootcamp = data-driven days over one generic player.** A day is a content file
  (items + dialogue + typed steps); the DayPlayer renders any day. Days 2–20 = new data files
  + one registry line, zero code. 20-day capability plan lives as data (plan.ts) and renders
  on the landing map.
- **D049 — Bootcamp drills emit real ReviewEvents** (echo/listen/swipe/simulator) with frozen
  en-pack ids; projection ignores unknown ids today and will count this history retroactively
  when the en pack ships (event-sourcing dividend). Progress/receipts persist in localStorage —
  offline-first, engine-independent.
- **D050 — Day 1 kit follows the founder's 7 tools** (slowly/repeat/don't-understand/show-me/
  one-moment/thank-you/sorry); CORE-spec moves my-english/need-help/graceful-exit are deferred
  to Days 2 and 17. Dialogue-first + listening-first enforced by data-integrity tests, not
  convention (watch precedes tools precedes quizzes; no recall production on Day 1).

## Sprint 7 — READY Missions

- **D051 — Chrome audio root cause: cancel()/speak() same-tick race.** Chrome processes
  speechSynthesis.cancel() asynchronously; speaking in the same tick silently drops the
  utterance (Safari tolerates it). Fix: defer speak ~90ms when the engine is speaking/pending,
  hold a module ref to the active utterance (Chrome GCs unreferenced utterances mid-speech),
  and prime getVoices() eagerly + on voiceschanged. Root-cause handling, no hacks.
- **D052 — Bootcamp → 30 READY Missions in 5 phases** (Foundations/Arrival/Food/City/Mastery)
  with cold checkpoints at 10/18/24 and the finale at 30. Redesigned, not stretched: street
  food, supermarket, hotel-problems, wifi/SIM and tickets missions added; checkpoints carry
  zero new content by rule (tested).
- **D053 — Dialogues are trees rendered one line at a time** (visual novel): the user never
  sees the conversation in advance; wrong choices branch through recovery beats (the world
  responds) and reconverge — a scene can be survived with style but never failed. Using a
  recovery tool is ALWAYS a valid move (tested invariant).
- **D054 — Expected Replies are a first-class step**: "you said X — here is what they might
  answer", trained by ear before the live scene. Mission 4 (Coffee Shop) is the Deep Moment
  exemplar: the full barista chain (here/to-go, size, milk/sugar, food, anything-else,
  cash/card, receipt, goodbye) as 10 hear-items, replies-first, then the branching scene,
  then an off-script ambush.
- **D055 — The one-more-mission loop**: the Mission Complete screen's primary CTA starts the
  next built mission directly (breathing button); the map shows phases + honest progress
  (n/30) and confidence-gain per mission instead of metrics.
- **D056 — Chrome audio real root cause: autoplay/gesture-unlock policy** (supersedes the D051
  theory). The cancel/speak race was NOT why Chrome stayed silent — Chrome blocks
  `speechSynthesis.speak()` until the engine is unlocked by a speak() that runs INSIDE a real
  user gesture. Our drill/dialogue audio fires from effects and promise chains, so every
  utterance was refused; Safari has no such policy, so it always worked. The D051 `setTimeout`
  defer made it strictly worse (moved the first speak further from any gesture). Fix: prime the
  engine on the first pointer/key/touch gesture (silent volume-0 utterance) + an explicit
  unlock on Start; then programmatic speak works for the session. Backed by a dev-only
  diagnostics panel (browser/voices/selected voice/lang/last request/last error/unlocked) and a
  Test Audio button + always-visible "enable sound" card on the mission map. Never-silent
  fallbacks: missing voice → browser default, TTS unavailable/throws → drill continues text-only
  with a logged reason.
- **D057 — Missions 2–10 are pure data, one player.** Introduce Myself, Numbers & Money,
  Restaurant, Directions, Taxi, Hotel Check-in, Shopping and the Arrival-Day checkpoint were
  authored as `BootcampDayContent` files against the Mission-1/4 pattern — no new player code.
  Each carries listening-first tools, an Expected-Replies comprehension step (except the
  tools-only survival mission and the cold checkpoint), a branching dialogue tree with recovery
  beats, an off-script cold open, and ≥2 evidence receipts. Dialogue-graph + reference
  validators run over all ten in the test suite.
- **D058 — Mission phrases/replies seeded as Concepts with honest draft multilingual.** The
  survival recovery kit plus the core say-phrases and expected replies became 32 canonical
  Concepts in `content/concepts/missions-core.yaml` (idempotent seed by id via the existing
  pipeline). English is playable (`ai_reviewed`); es/fr/it/ar are machine-assisted `draft`
  realizations, each with a `reviewNotes` flag — no fabricated `native_reviewed`. The one
  shipped-lineage Italian recovery phrase moved out of the non-production samples file into this
  production set.
