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
