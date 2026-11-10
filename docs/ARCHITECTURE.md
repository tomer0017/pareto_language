# Architecture

## Mission 11 final artwork (2026-11-03)

The 11 shared semantic slots and 2 result props now use individual final JPEGs.
Approved EN/ES/FR content and all 32 interactions remain unchanged. Exact tip data
and choices remain application UI. See [visual production report](./MISSION11_VISUAL_REPORT.md)
and [asset manifest](./MISSION11_ASSET_MANIFEST.md) for provenance, QA and limitations.
A follow-up CSS correction keeps wide teaching images above their text on desktop;
no learning or architecture change was required.


READY is an npm-workspaces monorepo. The design follows the PDF §11: a pure isomorphic engine,
content separated from user state, and a `DataProvider` interface the UI depends on.

```
packages/content-schema/  zod schemas — the single source of truth for all data shapes
packages/engine/          pure TS: memory model, scheduler, planner, readiness (ZERO I/O deps)
packages/data/            DataProvider interface + Mock / Local(IndexedDB) / Api implementations
apps/web/                 React 18 + Vite PWA (feature-sliced)
server/                   Express + Mongoose API (user state only)
content/                  YAML sources + build/validate pipeline → versioned JSON packs
docs/                     this folder
```

## Key decisions (see DECISIONS.md for the full log)

1. **The engine is pure and isomorphic** (PDF §11.2 D1). It has no import from React, Express, or
   any storage. The same code projects memory state on the client (offline) and the server
   (analytics / restore), and is validated by simulated-learner tests before any UI exists.

2. **Content ≠ user state** (PDF §11.2 D2). Content is static, versioned JSON built by a pipeline
   and served statically (precached offline). User state lives in IndexedDB (offline) and MongoDB.

3. **`ReviewEvent` is the append-only source of truth** (PDF §11.4). `MemoryState`,
   `ReadinessSnapshot`, etc. are deterministic projections rebuildable by `packages/engine`. Sync
   is "replay events in timestamp order"; idempotent by client-generated UUID.

4. **`DataProvider` interface from day one** (PDF §11.2 D3): `MockProvider` → `LocalProvider`
   (IndexedDB, the permanent offline layer) → `ApiProvider` (wraps Local, background sync).

## Build & module strategy

- TypeScript **project references** (`tsc -b`) build packages in dependency order and typecheck
  cross-package via emitted declarations.
- Cross-package imports at **test/app** time resolve to source via Vite/Vitest aliases (no build
  step needed to run tests). At runtime, the server consumes built `dist` via workspace symlinks.
- The engine is the product; it targets ≥85% coverage (currently ~98% statements).

## The learning engine (packages/engine)

| Module | Responsibility | PDF |
| --- | --- | --- |
| `params.ts` | Tunable FSRS-inspired constants + evidence weights | §8.2, §16 R2 |
| `memory.ts` | Stability/retrievability/difficulty model, `R(t)=exp(-t/S)`, event projection | §8.2, §11.4 |
| `modemixer.ts` | Which drill trains an item given its ladder level | §9.1 |
| `scheduler.ts` | Deadline-aware greedy: `value × R-gain / seconds-cost` toward `R(T_departure)` | §8.3 |
| `planner.ts` | Tier selection, situation ordering, new-item taper, graceful re-plan | §8.1 |
| `readiness.ts` | Honest badges: notStarted / inProgress / ready / fading | §10.4 |

## Randomization (apps/web/src/shared/util/shuffle.ts)

One tested utility for all controlled randomness — uniform Fisher–Yates with an injectable RNG
(`shuffle`, `seededShuffle`, `sample`, `pickOne`, `mulberry32`, `sessionSeed`). Replaces the biased
`.sort(() => Math.random() - 0.5)` idiom app-wide (quiz/replies/ambush options, Picture Quiz rounds,
Listen & NumberSprint distractors, session builder, Videos). Seeds make it deterministic in tests and
stable across re-renders. **Narrative dialogue order is never shuffled** — only options / review order.

## Product IA & responsive shell

- **Destinations** — `app/nav.ts` is the single navigation model: `PRIMARY_TABS` = Home · Path
  (`bootcamp` view; labelled "מסלול" / "Path") · Listen · Profile; `navTabOf(view)` maps every secondary screen to the
  destination that stays highlighted (readiness/review → Home, core/zerostart → Learn,
  reading/videos → Listen, languages → Profile); `shouldShowNav` decides the phone/tablet bottom
  bar (hidden in focused flows); `hasAppShell` decides whether the shell + desktop rail exist.
  `shared/ui/AppNav` renders it once — CSS alone turns the bar into a rail at ≥ 1100px.
- **Layout tokens (`app/styles.css`)** — `--page-max` (browse pages, `.screen.screen-wide`),
  `--focus-max` (focused flows, plain `.screen`; also the width of the fixed `.action-zone`,
  readers and transports), `--rail-w` and `--gutter`, each stepped at 768px and 1100px.
  `.app-shell.has-rail` reserves the rail and exposes `--shell-start` so fixed bars centre over the
  content. Logical properties throughout (RTL/LTR mirror without per-direction rules).
- **Shared primitives (`shared/ui`)** — `Icon` (inline SVG set; `flip` = direction-aware),
  `AppNav`, `PageHeader` + `BackButton`, `ProgressRing`, plus CSS building blocks (`.icon-tile`,
  `.link-row`, `.tabs`, `.stat-row`, `.mcard`, `.jstep`). Arrows are icons owned by components —
  never glyphs inside translated strings.
- **Travel Readiness** — `features/bootcamp/readiness.ts` (pure) → `useTravelReadiness()`; every
  screen that shows progress reads it, so the numbers always agree. Denominator = `BOOTCAMP_PLAN.length`.
- **Mission journey** — `features/bootcamp/missionFlow.ts` (pure): `missionPhases` splits the
  unchanged step list into Learn / Practice; `bootcampStore.enterPractice(at?)` enters the flow at a
  chosen step and makes it the resume point. No pedagogy-engine change.
- **Listen** — `features/listen/`: `playlists.ts` (pure; sentences via `core/phraseGroups.ts`,
  dialogues via `transcript.ts`, stories via `reading/readingCore.ts`), `listenMode.ts` (modes →
  the engine's speak-order override), `Listen.tsx` (queue + now playing + the story card). Playback
  is the shared `useParrotPlayback` in the `listen` scope. Quick Listen = the engine's sleep timer
  (10 min), cleared when it ends or the screen is left.
- **Sentence catalog** — `features/core/phraseGroups.ts` `sentenceCatalog(lang)` is the one source
  for the sentence library, the flashcard deck, Listen and every "N core sentences" count. One id
  never means two sentences (`sentenceIdConflicts` must be empty — tested); one wording is one
  canonical sentence, and later ids that re-declare the same wording are ALIASES, so a drill logged
  under any of them counts once (`canonicalSentenceId`). Counts today: EN 319 · FR 318 · ES 316.
- **Developer diagnostics** — `shared/ui/devOverlay.ts`: rendered only when the build is a dev
  build AND `?debug=1` was requested (remembered until `?debug=0`). Never in production.
- **Quick Review** — `features/core/review.ts` (pure) picks sentences from the real review-event
  log (`provider.getReviewEvents`); `QuickReview.tsx` reuses `SentenceFlashcards` with that subset.

## Bootcamp curriculum: identity, order, persistence

- **One source of truth** — `features/bootcamp/plan.ts` `BOOTCAMP_PLAN` (30 entries — the Core 30). Its length is the
  mission count and its array order is the journey; UI progress (`Home`, the map header, Victory) and
  tests read it — no other constant holds "30".
- **Three separate concepts per mission:** `id` (stable semantic slug, e.g. `introduce-myself` — what
  persisted progress is keyed by), display number (`missionNumber(day)` = 1-based plan position), and
  `day` (the numeric content-registry key shared by `DAYS` / `DAYS_FR` / `DAYS_ES` and the in-memory
  store handle). `nextMission()` walks plan order, never `day` arithmetic. Since the Core 30
  restructure `day` and number genuinely differ (Taxi: `day` 6, Mission 7; Everyday Core: `day` 30,
  Mission 4) — nothing may order or number missions by `day`.
- **Authoring** — `author.ts` (pure): a `MissionSpec` holds every line as `[en, fr, es, he]`;
  `buildMission(spec, lang)` emits the ordinary `BootcampDayContent` (items, dialogue tree with
  conversation-help branches, the standard step sequence). `core/index.ts` lists the spec missions
  and `specMissions(lang)` feeds each language's registry — a spec mission cannot exist in one
  language only. Checkpoint specs reuse earlier sentences by id (`fromItems` / `itemOf`), never retype them.
- **Outside the Core** — `plan.ts` `EXTENDED_POOL` (kept for a 31+ track) and `MERGED_MISSIONS`
  (merged into another mission); their content lives in `extended.ts`, is tested, and never reaches
  the journey, Listen, the sentence library or Videos.
- **Active-practice steps (Practice V1)** — four generic step kinds beside the original ones:
  `quickReply`, `visualMatch`, `swap`, `miniMap`. Content is data (`types.ts`); what a round shows and
  whether a step is well-formed is pure (`practiceEngines.ts`, `validatePracticeStep`); the screens are
  `PracticeSteps.tsx`. Multilingual authoring goes through `author.ts` (`buildPractice`), used both by
  spec missions and by `practiceV1.ts`, which holds the step lists of the hand-written Missions 01, 02,
  03 and 05 once for all languages. `ambush.mode` (`recovery` / `speed`) states what a final challenge
  tests. `PrimeWord.key` lets tests compare word-intro content across languages by concept.
  Practice V1.1 added `matchPairs` and `sentenceBuilder` the same way (pure rules `matchTap`,
  `matchRecord`, `builderPool`, `builderSolved`, `builderHint`); builder chunks are authored per
  language and validated to spell the taught sentence exactly.
  The Mission 03 pass added `customize` (hear an order → set each add-in ✓ / ✕ → check; nothing is
  pre-set, so "no sugar" is a choice of its own; pure rule `customizeResult`; counted as listening by
  the coverage audit). Board tiles may carry `scale` (emoji size), so a large cup reads larger.
  The Mission 03 real-device pass added: `VisualMatchRound.show` (a round shows only its own tiles — the
  meaning and its contrast; ONE tile = a teaching round that cannot be missed; 2 / 4 tiles lay out as
  a 2-column board), `PrimeWord.image` (an approved picture on a building-block row) and
  `PrimeWord.line` (a whole conversation line taught with its picture — left out of the new-vs-review
  vocabulary tracking), and an image `base` for `customize`.
  The Mission 04 pass added `MatchTile.caption` (a few app-language words under a tile — what it
  means) and `MissionSpec.steps` (a spec mission may hand-build its journey per language; its
  sentences and scenes still come from the spec — used by Everyday Core, `practiceV1.ts` `m04Steps`).
  Mission audits: each mission's conversation chunks live in `missionNNCoverage.ts` (`coverageOf` in
  `mission01Coverage.ts` is the rule). `priorLearning.ts` is the shared teach-before-test kit:
  `teachingEncounters(day)` (lines shown WITH their meaning — cards, key sentences, review cards,
  listening drills, meaning matches, one-tile rounds; never the conversation, a distractor or a test),
  `learnedBefore(lang, n)` (VERIFIED prior learning for mission n: covered concepts + taught words of
  Missions 1…n-1 — seen ≠ learned), and `missionWalk` / `unpreparedWords` / `unpreparedChunks` (the
  strict in-order audit). A new mission's test calls these instead of rebuilding prior knowledge; a
  new mission's coverage file is registered in `MISSION_CONCEPTS`.
- **Companion inside a mission** — `companionCoach.ts` (`coachFor(steps, index, missionId)`) decides,
  purely, whether a step gets one app-language line (the mission goal on its intro card; how to play
  the first game of each kind; `MISSION_GAME_INTRO` overrides that line where a mission's first game of
  a kind is something else — the coffee shop's first board is the order, not a price). `Bootcamp.tsx` renders it with `CompanionCoach`; answer cards take a
  reaction through `AnswerFeedback`'s `aside` slot. None of it writes to any store.
- **Shared practice flows** — `practiceV1.ts` (Missions 01, 02, 03, 05) and `practiceArrival.ts`
  (Missions 06–09) define the step lists of hand-written missions once for all languages. Checkpoint
  scenes may be `cold` (no gloss before answering) and may offer `wrong` lines: a miss routes to its
  own slow re-ask beat and back to the same choice. A Quick Reply step may be a speed `challenge`; a
  Match Pairs answer tile may be a language-neutral `answerLabel`.
  `practiceMastery.ts` holds Mission 26. A scene may also be `audio` (dialogue `audioOnly`, always
  with `cold`): the other speaker's line is not written before the answer — `NpcSpeech` in
  `ConvoScene.tsx` renders a replay button in its place (Mission 28 only). A line may carry a `cue` — a scene
  transition in the app language, shown above the bubble and never spoken. No transition label may
  sit inside spoken text (tested for every mission and language). `scripts/export-core30-video-docs.ts`
  (`npm run export:video-docs`) is the one generator of the video master script and action map. Missions 28–30 are specs
  in `core/checkpoints.ts` with no teaching steps. `canonicalSentenceId` also resolves legacy ids the
  Core no longer declares (`LEGACY_ALIASES` in `core/phraseGroups.ts`), so stored practice keeps counting.
- **Practice presentation** — each engine renders on an open `.pcanvas[data-engine]`, not a shared
  card. `ConvoScene.tsx` is the conversation shell (`NpcLine`, `YouLine`, `AudioBubble`, `useNpc`)
  used by dialogues and Quick Reply; `npcCast.ts` maps a mission id to who is speaking (a glyph today,
  `art` when illustrations exist). Game sounds live in `shared/audio/sfx.ts` behind one on/off switch.
- **No-spoiler rule** — companion surfaces never show a stage name, count, threshold or unreached
  form; see `COMPANION_SYSTEM.md`. Stage data stays in `companionModel.ts` and is not rendered.
- **Turn parity gate** — `core30.test.ts` compares every Core dialogue tree across EN / FR / ES node
  by node, and proves `docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md` equals `renderDialogueDoc()`.
- **Persistence** — `progress.ts` (pure): in memory the store keeps `completedDays` / `receipts` /
  `stepIndex` by `day`; on disk (`ready.bootcamp.v2.<lang>`) the same data is keyed by mission `id`.
  `migrateV1` converts the old `ready.bootcamp.v1[.<lang>]` day-number data once (old 2 → Introduce
  Myself … old 30 → the finale; old day 1, the retired Recovery Toolkit, is dropped). v1 keys are
  left untouched on disk. The Core 30 restructure needed **no** migration: every surviving mission
  kept its id. Extended Pool ids still round-trip (kept on disk, not counted as readiness); ids of
  merged-away missions are ignored on read.
- **Videos** — found by ONE convention, never wired by hand: `apps/web/public/videos/{language}/{language}_{displayedMissionNumber}.mp4`
  (learning language + the mission number the learner sees, no zero padding — `videos/es/es_4.mp4`).
  `apps/web/videoManifest.ts` scans the folders at build time (a Vite plugin serving
  `virtual:ready-video-manifest`, also loaded by Vitest) and fails the build on a malformed name;
  `features/videos/videoConvention.ts` is the pure convention; `features/videos/missionVideo.ts` is
  the single resolver every video entry point asks. Mission content names no video. A mission with
  no file has no video UI (its video steps are skipped). MP4s are never precached.
- **Recovery phrases** — there is no recovery mission. `recovery.ts` / `fr/recovery.ts` /
  `es/recovery.ts` hold the shared 8 tools (six help tools + two courtesies) that other missions bundle into their item lists and
  dialogue choices. The dialogue player's opt-in `coaching` mode is dormant (no mission sets it).

## Vocabulary priming & sentence flashcards

- `{ kind: 'prime' }` — a mission step ("Before we speak") of 3–8 building-block words shown before a
  longer sentence, optionally assembling a canonical mission item (`buildFromItemId`). Renderer:
  `PrimeStep` in `Bootcamp.tsx`. Opt-in, language-agnostic. `PrimeWord.review` + `primeVocab.ts`
  (`priorPrimeVocabulary`) track prior knowledge so a reused word shows a ♻️ review hint instead of
  being re-taught. Every mission's decision is recorded in `vocabAudit.ts` (`MISSION_VOCAB_AUDIT`,
  all 30) and bound to the actual steps by tests. Currently primed: registry keys 1–7 + 30 (Everyday Core), all languages in parity.
- `fr/frenchNumbers.ts` — the tested source of truth for spoken `fr-FR` numbers (0–9999) incl. the
  vigesimal 70/80/90 rules; feeds the French-numbers priming step in Mission 2.
- `core/flashcards.ts` (pure) + `SentenceFlashcards.tsx` — flip-card review over the canonical mission
  sentences (`buildSentenceDeck` reuses item ids; no duplication), shuffled per session, both review
  directions. See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.

## Foundation (apps/web/src/features/foundation)

The 🛟 "building blocks" surface — a **data-driven VIEW over the Core Corpus**, never new content.

| Module | Responsibility |
| --- | --- |
| `taxonomy.ts` | The ONLY place categories are declared — `FoundationCategory[]` as DATA. Each is a *selector* over the language-independent corpus fields (`category` / `pos` / `conceptId`), so adding a language is zero code and adding a category is one entry. |
| `foundationContent.ts` (pure, tested) | `buildFoundation(words, missions, appLang, learningLang)` → categories → words; `frequencyStars` (tier/rank → 1–5); `relatedMissions` (whole-word scan of real `missionsFor(lang)` text). Reuses `resolveLearningItem` (the any-to-any display model). |
| `FoundationFab.tsx` / `FoundationSheet.tsx` / `foundationStore.ts` | The FAB (shell-mounted, gated by `shouldShowFoundationFab`), one component rendering every level (categories → word list → word page) from the model, and the shared store (open/close + Universal-Tap `openWord` + persisted `viewed`/`dismissed`). |
| `corpusIndex.ts` (pure) + `TappableText.tsx` | **Universal Tap**: `buildCorpusIndex` + `segmentText` (whole-word, greedy longest-match, lossless) mark every Core word in a sentence; `TappableText` / `TappableWord` render them tappable and open the shared sheet via `openWord`. `useCoreWords(lang)` loads the pack + index once per language. |
| `FoundationHint.tsx` | **Smart Detection**: the non-blocking "Missing Foundation Brick" nudge for the first unviewed building block in the current mission text (Learn now / Dismiss). |
| `foundationProgress.ts` (pure, tested) | Per-category + overall completion from the viewed set — motivational only, never gates. |
| `missionFoundationWords` + store `session` | The mission "Learn now" **guided session** (Word X of N, progress, Prev/Next/Back to Mission) over exactly the mission's Foundation words. |
| `FoundationOnboarding.tsx` / `TapCoachmark.tsx` / `foundationCoach.ts` | One-time discovery: first-arrival intro dialog (+ FAB pulse) and the first tappable-word tooltip, each shown once and persisted. |

Reusable primitives: `shared/ui/Sheet.tsx` (bottom sheet) and `shared/ui/SpeakerButton.tsx` (one
tap-to-hear button). There is exactly ONE word sheet and ONE tap entry point app-wide — dialogue,
flashcards, Core Words/Phrases and mission drills all reuse them. Words come from
`loadCoreWords(learningLang)`, so English + French (and any future pack) work through one code path.

## Zero-Beginner Path — "מתחילים מאפס" (apps/web/src/features/zerostart)

A guided, cumulative Pre-A1 bridge for a learner who knows zero words — a fixed sequence OVER the
same survival concepts, never a parallel engine. Data-driven and split into layers:

| File | Role |
| --- | --- |
| `types.ts` | `ZeroChunk` (per-language `target` + one he/en `tr` + optional Foundation `conceptId`), the `ZeroStep` union (introduce / recognize / picture / listen / cloze / build / recall / dialogue), `ZeroModule` (+ `masteryStart`), `ZeroPath`. |
| `content.ts` (data) | The ONE authored source: a shared chunk library + 8 modules (First contact → Readiness checkpoint), natural EN/FR/ES phrasing. `{name}` is substituted at render time (no PII in static data). |
| `zeroStartProgress.ts` (pure, tested) | Completed-step progress, `resumePosition` (first incomplete step), and `validatePath` (references, EN/FR/ES + he/en parity, checkpoint-reuse rule). |
| `zeroStartStore.ts` | Per-language persisted progress (`ready.zerostart.v1`) + saved learner name; "current step" is derived, never stored. |
| `ZeroStart.tsx` | The renderer (hub → lesson steps → module outcome → graduation). Audio via the shared `tts` engine; learning a chunk calls `foundationStore.markViewed(conceptId)` (idempotent progress sync). Graduates into the first real Bootcamp mission (never auto-completes it). |

Routed as the `zerostart` view (not a pilot tab, so the bottom nav auto-hides during lessons). Home
shows the entry card + a first-use recommendation for a new learner in a supported language.

## Audio preference ownership

RULE: a playback option must never affect a screen where the learner cannot see or change it, unless
it is explicitly global.

| Owner | What | Stored in |
| --- | --- | --- |
| **Global** | speech rate — the ONLY speed; applied by `tts.speak()` to every utterance | `ready.speechRate` (Profile) |
| **Listen** | repeats, continuous play, shuffle, quick-listen timer; listening mode | `ready.playback.listen`, `ready.listen.mode` |
| **Story** | reading mode, voice order (target / target→translation / translation→target) | `ready.reading.v1` |
| **Transcript** | its controls panel (repeats, translation, order, loop, pause, sleep timer) | `ready.playback.transcript` |
| **Word listening** | the same panel | `ready.playback.words` |

How it is enforced: `useParrotPlayback(items, { scope })` loads/persists settings per
`PlaybackScope`; `preferences.ts` `SCOPE_OWNS` lists the options each surface exposes, and
`scopedSettings` forces every other option to its default (the `story` scope owns none, so a story
is always one pass, once per sentence). The engine has NO speed: a speak step carries text + locale
only (`runUtterancePlan`), and the old shared record `ready.parrot.settings` is no longer read.
Locked by `shared/playback/ownership.test.ts`.

## Parrot Mode — Universal Listen (apps/web/src/shared/playback)

ONE content-agnostic listening system every learning surface reuses. A screen supplies a list of
`PlaybackItem` (`target` + `targetLang`, optional `translation` + `translationLang`); the engine owns
all playback. Nothing here imports Bootcamp/Core — a new surface reuses it with zero changes.

| Module | Responsibility |
| --- | --- |
| `types.ts` | The public contract: `PlaybackItem`, `PlaybackSettings` (repeat ×1–3 / order / translation), the per-surface `SpeakOrderOverride`, `PlaybackStatus`. |
| `playbackPlan.ts` (pure, tested) | The two testable decisions: `buildUtterancePlan(item, settings, order?)` → flat speak/pause steps (target→translation, or translation→target when a surface passes `order.translationFirst`, × repeat — each line in its own locale) and `buildOrder(count, order, seed)` → play order (sequential or a seeded shuffle, reusing `shuffle.ts`). Pause durations are exported constants — the tuning seam. |
| `useParrotPlayback.ts` | The engine hook: status, current item, the async play loop, wake lock, resume-from-exact-item, persisted settings. Run-token cancellation (same contract as the Transcript reader — a superseded/cancelled `speak()` never advances). Settings read via refs so changes apply at the next item boundary. |
| `wakeLock.ts` | Guarded Screen Wake Lock wrapper (module-level sentinel; re-acquired on visibility while playing; silent no-op where unsupported). |
| `sleepTimer.ts` (pure, tested) | Framework-free countdown controller (`arm/resume/pauseTicking/reset/off/dispose`) that counts only active playback time; the engine drives it so pause/resume preserve the remainder and expiry stops playback + releases the lock. |
| `preferences.ts` (pure, tested) | Persistence via the existing localStorage convention: `sanitizeSettings` (validate/fallback), load/persist, and per-surface listening bookmarks (`resolveBookmarkIndex` matches by stable content id, never array position). "Currently playing" is never stored. |
| `PlaybackControls.tsx` | The single controls component — Play/Pause, Repeat, Sequential/Random, Translation, prev/next — a pure view over the engine handle. |
| `ListenPanel.tsx` | Reusable "now playing" single-item screen (Core Words + Core Sentences share it). The Dialogue Transcript uses the engine directly for its full-list + highlight presentation. |

Consumers: **Core Words** (`CoreWords.tsx` `listen` mode) and **Core Sentences** (`Core.tsx` phrases
`listen` view) mount `ListenPanel`; the **Dialogue Transcript** (`DialogueReader` in `Bootcamp.tsx`)
drives its existing scroll/highlight sheet from the same hook + `PlaybackControls`. Future knobs
(loop-forever, pause length, voice, bookmark) land in `playbackPlan.ts` / `PlaybackControls`
once and appear everywhere — no playback logic is duplicated.

Sprint-3 capabilities — continuous **Loop** (`planNextCycle`, anti-boundary-repeat), a **sleep
timer**, **pause durations** (`PAUSE_PRESETS`), persisted **preferences**
and per-surface **listening bookmarks** — are all engine-level, so every current and future
surface gets them for free. Voice selection / background playback / lock-screen controls remain
out of scope (browser TTS + Wake Lock cannot guarantee them once the OS suspends the page).

## Audio / TTS (apps/web/src/shared/audio)

Runtime, free, cross-device speech via the Web Speech API — no cloud, no keys, no server, offline-capable.

| Module | Responsibility |
| --- | --- |
| `tts.ts` | Central `speak(text, lang, rate) → Promise<SpeakResult>`; Chrome unlock + keep-alive + visibility-resume; global speech rate; diagnostics; asset-first `playItem`. |
| `voiceResolver.ts` | Pure, scored voice selection with explicit **match quality** (`exact-locale` ≫ `approved-fallback` ≫ `same-language-different-region`; wrong language disqualified). Regional accents are NOT equivalent (en-US ≠ en-GB); a different region is degraded, never a native match. + `prepareTextForSpeech`. |
| `voiceProfiles.ts` | Per-language speech profile derived from the registry locale (`languageTtsTag`) + fallbacks / preferred names / test phrase. |

The **learning language** (not the UI/OS language) selects the voice. `SpeakResult`
(`ended|interrupted|error|unavailable`) lets chained actions (dialogue advance, Play-All) proceed only
on a natural finish. Full research, resolver rules, fallback ladder and honest limits:
**[TTS_RESEARCH.md](./TTS_RESEARCH.md)**.

### Mission 06 image support (2026-10-27)

`M06_SLOTS` and `M06_PROPS` own the 23 canonical public image paths, shared by EN/ES/FR.
`MapCell.image` and `CustomizeOption.image` are optional additions to existing engines; only
Mission 06 opts into them. Map artwork uses contain sizing; calendar rows retain their existing
labels and controls. The existing `MatchPair.answerImage` and wide prime cards are reused.
See `MISSION06_VISUAL_REPORT.md` for validation and owner-assigned manual mobile QA.


### Mission 08 hotel presentation (2026-10-29)

`M08_SLOTS` owns 15 semantic paths; `M08_PROPS` owns 10 image/UI props. `MiniMapSpec.presentation`
opts into hotel-floor or hotel-lobby rendering only for M08. Optional `scene`/`revealImage` select
neutral versus correctly answered lobby art. `MapCell.symbol` is restricted to numeric figures and
arrows, distinct from target-language `label`; prior-learning auditing is unchanged.
`HotelStaySummary` displays the existing four stay facts in a 2×2 grid and passes other text through.
No facts or reveal states are inferred. See `MISSION08_VISUAL_REPORT.md` for QA and release status.

## Mission 09 final visual integration — 2026-11-02

Mission 09 now uses 13 canonical semantic images, 2 prop images and 2 supplemental scenes, shared across EN/ES/FR. One continuous store environment replaces the cell-map presentation; four equivalent hit areas retain semantic answer IDs. The ordered S/M/L/XL ladder marks M as current, discounts remain equal text tiles, and Shopping Journey retains its compact grid and reveal timing. Approved dialogue and all 33 interactions are unchanged. Optional talk/receipt images and the opt-in `shopping-store` presentation leave other missions unchanged. See [the visual report](MISSION09_VISUAL_REPORT.md) for validation and asset inventory.

## Mission 10 — Arrival Day, adaptive checkpoint — 2026-11-02

Mission 10 (CHECKPOINT: Arrival Day) is now an ADAPTIVE checkpoint: retrieve first → repair only what
fails → retrieve again in context. One new step kind, `checkpoint`, runs a pure, data-driven state
machine (`features/bootcamp/checkpoint.ts`): DIAGNOSTIC (the whole day: 🛂 border → 🚕 taxi → 🏨 hotel,
14 interactions, nothing taught first; a miss gets one quiet beat — line, meaning, audio — and is
recorded by CONCEPT) → QUICK FIX (only the missed concepts; one supported retry; skipped entirely on
zero misses) → ONE-TAKE (the whole day, no help) → FINAL REPAIR (a card + one retrieval per one-take
miss, until the queue is empty) → 🌍 ARRIVAL DAY COMPLETE. 16 concepts (11 production, 5 comprehension
captures: fare €15 + traffic, room 204 + floor 2, breakfast 7–10, never on screen before their line).
Mastery = every concept answered right at least once with its answer not on screen — no score.
State is plain JSON, saved per mission by the store (`ready.bootcamp.checkpoint.v1.<lang>`), so the
video overlay, leaving and reloading resume exactly; restart / a fresh entry / completion clear it.
Content: `core/arrivalDay.ts` (locked EN/ES/FR dialogue; learner lines are Missions 06–08's sentences,
same id and wording; recovery beats and the elevator ambush removed). Checkpoint-only transparent
recombination: `checkpointAudit.ts` (`learnedBefore` / `unprepared*` unchanged). No new artwork:
M07's road pictures, M08's elevator panel, figures as UI. Strong learner: 28 interactions; gaps add
only their repairs. Tests: `mission10.test.ts` (71); Missions 01–09 and 11–30 byte-for-byte unchanged.

## Mission 11 — Small Talk & Recommendations, full learning flow — 2026-11-03

Mission 11 is rebuilt around its LOCKED EN/ES/FR conversation (unchanged wording) as conversational
RHYTHM: Connect → Share (answer + bounce the question back) → Ask (the learner's own initiative after
"the food here is wonderful") → Close. Journey: `practiceSmallTalk.ts` (`m11Steps`), wired through the
spec (`core/smallTalk.ts`, new optional `facts` / `image` on `MissionSpec`). Briefing = the brief's
Hebrew line + traveller card (🇮🇱 Israel · 🧳 First visit) — nothing about the local, the food or the tip.
Each beat: whole-line cards with their meaning → answered. Partial prior learning: "I'm from Israel." and
"Yes, it's my first time here." (Mission 01, verified by `learnedBefore(lang, 11)`) are ♻️ review cards;
"How about you?" gets its own card; the request builder keeps the prior "Can you" apart from the new
"recommend a place". Mama Rosa / the Old Town first appear on the recommendation card; the Local Tip
("📍 Local tip: ?") fills only after the capture (place, then area; later one combined tap). Then the
local's goodbye by ear → supported
conversation (flow stages + tip card on screen) → the conversation (each turn a real decision; a miss is
re-asked slowly) → no help (natural speed) → video (none recorded yet: safely skipped) → final →
💬 SMALL TALK COMPLETE · 📍 LOCAL TIP FOUND: Mama Rosa · Old Town. 32 interactions. Removed: the
"repeat" recovery tool, the alternative answers, the quiz/tools/review/speed-chain shape and the
unrelated "How long are you here for?". Coverage: `mission11Coverage.ts` (24 chunks, all covered), now
also feeding `learnedBefore` for later missions. Artwork: 11 slots + 2 result props, emoji
PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION11_ASSET_MANIFEST.md`. Tests:
`mission11.test.ts` (61); Missions 01–10 and 12–30 byte-for-byte unchanged (the old "11–30" pins now
pin 12–30).

### Mission 11 cleanup — invented line removed — 2026-11-03

"You should try the old town." (`reply.talk.you-should-try`) was not part of the locked conversation; it
had been kept only so that Mission 24's "You should take the boat tour." would count as recombination.
Removed from Mission 11 entirely (items, the by-ear drill, generated docs). The by-ear drill is now one
listening check on the local's goodbye (its other meanings are the local's own lines): 32 interactions.
Rule: a later mission's need never justifies inserting language into an earlier one. Mission 24 is
unchanged; "should" (devriez / debería) is not verified prior learning before it in any language, and its
strict vocabulary test now records that gap explicitly (FR devriez, ES debería; EN "should" is met only
in Mission 15's dialogue, which does not count as teaching) until Mission 24's design pass teaches it.
`mission11.test.ts`: 66 tests (incl. the canonical transcript, byte-identical to before the rebuild).

## Mission 12 — Time & Plans, full learning flow — 2026-11-05

Mission 12 is rebuilt around its LOCKED EN/ES/FR conversation (transcript byte-identical to before) as
MAKING PLANS, not clock vocabulary: "We made plans for tonight and tomorrow." Journey:
`practiceTimePlans.ts` (`m12Steps`), wired through the spec (`core/timePlans.ts`). Briefing = the brief's
Hebrew line + the traveller's own availability (☀️ this morning open · 🌙 tonight free · 🌅 tomorrow free)
— nothing the friend will propose. New deterministic UI, rendered by `HotelStaySummary.tsx`
(`splitTimeBoard`): the **Time Strip** (Now · this morning → later → tonight → tomorrow morning; the
current period highlighted; never a fact) and the **live planner** (Tonight: Plan ? / Time ? ‖ Tomorrow:
Plan ? / Meet ?), filled only after the line that reveals each fact: dinner · centre after the
invitation, 20:00 after "At eight" (captured as plain 18:00 / 20:00 / 22:00, no clock), the beach after
the tomorrow-morning line, "leaving early" (no hour) after "we leave early", and "Meet here · 07:00" only
after the LEARNER says "Let's meet here at seven" (their plan, not news). Prime intros now go through
`HotelStaySummary` too (plain text renders exactly as before). Teach once, then transfer: "I'm free
tonight." has a card; "Yes, I'm free tomorrow." has none — it is retrieved against "I'm free tonight";
"What are you doing tomorrow?" is shown beside the friend's own today / tonight questions, then one
swap. One builder: "No problem. / Let's meet / here / at seven." in each language's own chunks (new item
`phrase.time.no-problem-meet` = the locked line). Then the supported conversation (strip + planner) →
the conversation (each turn a real decision; a miss is re-asked slowly) → no help → video (none
recorded: safely skipped) → final ("close your plans") → 📅 PLANS MADE. 32 interactions. Removed: the
"repeat" recovery tool, the alternative "When?", the old review/speed shape and the invented "At ten" /
"At five" times. Prior learning (`learnedBefore(lang, 12)`): numbers, here, centre, eat, come, do you
want, great, perfect; "No problem" (EN/FR only) and "It's very good" (EN/FR) are partial prior. Sentence
ids reused by the Everyday checkpoint are unchanged. Coverage: `mission12Coverage.ts` (26 chunks, all
covered), feeding `learnedBefore` for later missions. Artwork: 14 slots + 1 result prop, emoji
PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION12_ASSET_MANIFEST.md`. Tests:
`mission12.test.ts` (72); Missions 01–11 and 13–30 byte-for-byte unchanged (the old "12–30" pins now pin
13–30).

## Mission 13 — Home, Family & Daily Routine, full learning flow — 2026-11-06

Mission 13 is rebuilt around its LOCKED EN/ES/FR conversation (transcript byte-identical to before) as ONE
home visit — no rooms or family list, no "going to" grammar. Journey: `practiceHomeFamily.ts` (`m13Steps`),
wired through the spec (`core/homeFamily.ts`). Briefing = the brief's Hebrew line only (no mother, kitchen,
grandmother, tiredness or sleep). The **Home Visit board** (Home: Room ? / Family ? ‖ My evening: Dinner ? /
Feeling ? / Next ?) fills only when the visit reveals it: the living room after the friend's line, mother →
kitchen after the friend says it (captured on semantic room tiles — ids `living-room` / `kitchen`, app-language
captions, shuffled), and dinner → grandmother's, tired, next → home → sleep only after the LEARNER says them.
The **evening route** (🧭 Now: Friend's home → Home · rest → Dinner at grandmother's → Sleep) appears once the
learner says they are going home. The board parser in `HotelStaySummary.tsx` now takes any number of rows per
column and a 🧭 route (Mission 12's planner parses exactly as before). Learner initiative: the sofa and family
questions follow statements, never questions. The one builder is the polite decline (Thanks, but / I'm going to
eat / at my grandmother's — each language's own chunks; new item `phrase.home.thanks-but-grandmothers` = the
locked line). A **Flex Round** (2 interactions: "My mother is in the living room." by ear; after dinner → "I'm
going to sleep.") recombines only words Mission 13 taught and is marked `transferOnly` (new optional step field):
`teachingEncounters` and coverage `encounters` skip it, so it never becomes prior learning, coverage or a course
sentence. Then the supported visit → the conversation (real decisions; a miss is re-asked slowly; the recovery
tool is gone) → no help → video (none recorded: safe skip) → final → 🏠 HOME VISIT COMPLETE. 34 interactions.
Prior learning (`learnedBefore(lang, 13)`): Thanks, "Where is", "I'm going" (EN) / je vais / voy a, eat, with us.
Sentence ids reused by the Everyday checkpoint are unchanged. Coverage: `mission13Coverage.ts` (27 chunks, all
covered, identical with or without the Flex Round). Artwork: 12 slots + 1 result prop, emoji PLACEHOLDERS —
VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION13_ASSET_MANIFEST.md`. Tests: `mission13.test.ts` (68);
Missions 01–12 and 14–30 byte-for-byte unchanged (the old "13–30" pins now pin 14–30).

**Word senses (2026-11-06 fix): same form ≠ same meaning.** Prior learning used to compare bare surface forms,
so French "cuisine" (food, Mission 11: "la cuisine ici est excellente") counted as prior for Mission 13's
"dans la cuisine" (the kitchen). `priorLearning.ts` now has a small sense registry (`WORD_SENSES`: form →
senses, each recognised by cue chunks of its line). A registered form is tracked as `form#sense`
(`cuisine#food`, `cuisine#kitchen`) by `senseWords`, `learnedBefore` (words and `knowsChunk`) and
`unpreparedWords(day, prior, lang)`; a line that decides no sense (`#?`) never counts as learned and is always
flagged. Same form + same meaning is still prior; same form + another meaning is NEW. French kitchen "cuisine"
is now taught by Mission 13's own mother → kitchen card; it is prior from Mission 14 on. Tests: Mission 13 76.

**Mission 14 — Restaurant Meal (registry key 4), 2026-11-09.** One ordinary sit-down meal, deliberately SHORT
(26 interactions: 5 teaching · 5 Waiter Signals · 1 Flex · 5 supported · 5 no help · 5 final). The locked
dialogue is unchanged word for word (transcript fingerprint identical); the tree changed on purpose: every turn
is a real decision (a miss is re-asked slowly), the pasta and "one moment" branches are gone, and the door keeps
its one recovery move ("I don't understand" → "A table? For how many people?" — the only Core turn where it is
met; Mission 28's word audit relies on it). Journey (`practiceRestaurant.ts`, shared by EN / ES / FR): briefing
(two of you, no reservation, chicken without onions, water) → door cards + "a table for two" → table cards ("Are
you ready to order?" = the waiter wants your food order) + the ONE builder (I'll have → the chicken, → without
onions, please.) → drink cards + water → "Anything else?" → "That's all, thanks." (Mission 03's own sentence
`phrase.coffee.thats-all`: used, never re-taught) → "Coming right up!" → ⏳ Later… → "Is everything okay?" →
"Yes, that was delicious! The bill, please." → WAITER SIGNALS (one fast board: what does the waiter want now?
table / food / drink / more / meal check) → FLEX (transferOnly, one round: "a table for four" by ear — "four"
is verified prior learning, "three" is not) → supported meal → conversation → no help → video (EN / FR exist, ES
safe skip) → final → 🍽️ MEAL COMPLETE. The **Restaurant Ticket** (Table / Main / Change ‖ Drink / Order / Bill)
fills only when the learner has said each fact; "Later…" is a scene cue only (app-language note + `mealPhase`
eating → bill), never spoken, never a sentence, never prior learning or coverage. Coverage:
`mission14Coverage.ts` (26 chunks: covered here, verified prior, or context-only waiter lines with nothing to
answer). New sentence `phrase.rest.chicken-no-onions` (the builder's exact line). The board parser treats a row
ending " —" as not yet known. The companion's first visual-board hint for this mission is the waiter's intent
(`MISSION_GAME_INTRO`), not "hear the price". Artwork: 10 slots + 1 prop, emoji PLACEHOLDERS — VISUAL
PRODUCTION REQUIRED (Astra pass): `MISSION14_ASSET_MANIFEST.md`. Tests: `mission14.test.ts` (71); Missions 01–13
and 15–30 byte-for-byte unchanged (the old "14–30" pins now pin 15–30).

**Mission 15 — Food Preferences & Allergies (registry key 13), 2026-11-09.** A deliberately SMALL survival mission
(20 interactions: 1 kitchen check · 4 "What do you do?" situations · 5 supported · 5 no help · 5 final; no Flex).
The locked dialogue is unchanged word for word (transcript fingerprint identical); the tree changed on purpose:
every turn is a real decision (a miss is re-asked slowly), the "Is this spicy?" branch and the repeat / slowly
recovery branches are gone, and a polite "Thank you!" to "Any other allergies…?" keeps its own follow-up ("…is
there anything else I should know?" — Mission 24's word audit relies on its "should"). Journey
(`practiceAllergies.ts`, shared by EN / ES / FR): briefing (the learner's own needs) → cards: "Are you ready to
order?" (Mission 14; in FR / ES the singular "prêt" / "listo" is new, so it is shown once as the allergy card's
context) + "I'm allergic to nuts." → "Any other allergies…?" + "I'm vegetarian." → the kitchen-check line, then
ONE comprehension board: what did the waiter say about the nuts? (not known yet — the kitchen will check) →
"Does it have dairy?" + the cream answer → "I'll tell the kitchen" / "I'll check with them and come right back"
→ WHAT DO YOU DO? (nuts → allergy, no meat → vegetarian, dairy → the question, onions → "Great. Without onions,
please.") → supported → conversation → no help → video (none recorded: safe skip) → final → 👨‍🍳 KITCHEN CHECK
SENT. "Without onions", "Great", please and "Thank you!" are verified prior: retrieved, never re-taught (no card,
no builder). **Safety:** the **Food Check** (My needs ‖ What the waiter said) fills only from the waiter's lines;
the nuts go from "?" to "Kitchen checking…" and STAY there — the state's nut status has no "safe" value, and no
copy, tile, receipt or result says safe. The board parser treats a row ending "…" as still pending. Six
off-scope sentences (is-spicy, not-spicy, contains-nuts, let-me-check, make-without, anything-else-allergic) are
archived in `retired.ts`; six whole waiter lines are new hear items. The companion's board hint is "Hear the waiter
— and tap what he really said." Coverage: `mission15Coverage.ts`. Artwork: 5 slots + 1 prop, emoji PLACEHOLDERS —
VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION15_ASSET_MANIFEST.md`. Tests: `mission15.test.ts` (61);
Missions 01–14 and 16–30 byte-for-byte unchanged (the old "15–30" pins now pin 16–30). The same release commits
the user's re-recorded videos en_1, en_2, en_3, en_6, en_7, fr_3, fr_5, fr_6 (verified H.264 / AAC, byte-exact).

**Optional exposure ≠ guaranteed learning (2026-11-09 fix).** Mission 15 keeps its optional branch (a polite
"Thank you!" → "…anything else I should know?"), but nothing the learner can skip counts any more: coverage
(`encounters`) counts only a conversation's guaranteed path (`cinematicTranscript`) — and only lines the learner
actually picks as retrieval — and the City-phase word audit (`practiceCity.test.ts`) counts only that path as
"met". `learnedBefore` already ignored conversations entirely, so "should" was never verified prior learning —
only that test-level "met" audit had leaned on the branch. "should" / "devriez" / "debería" is now NEW in Mission
24 (City & Conversation): one context card (`SceneSpec.prime`, a generic checkpoint option) shows "You should
take the boat tour." right before the chat that uses it — no grammar. Missions 01–23 and 25–30 byte-for-byte
unchanged; both locked dialogues unchanged. The same rule surfaced one recorded gap: French "celui(-là)" in
Mission 19's fast correction is met only in Mission 19's own optional branch (flagged in its test; the answer there
is "Can you repeat?").

**Mission 16 — Hobbies & Free Time (registry key 33), 2026-11-10.** SHORT, VISUAL, TRANSFER-DRIVEN: a reusable
preference system (ask what someone does for fun → love / like / don't like → usually + when → want to try → ask
back), not a hobby word list and no grammar (no like + -ing, want + infinitive or frequency adverbs). 22
interactions (10 teaching · 5 no help · 7 final) + the conversation, run ONCE (supported, translations on); no
Flex, no builder, no review deck. The locked dialogue is unchanged word for word (transcript fingerprint
identical); the tree changed on purpose: the "what-mean" recovery branch is gone and every turn is a real decision
(a miss is re-asked slowly). Journey (`practiceHobbies.ts`, shared by EN / ES / FR; the spec is still
`core/hobbies.ts`): briefing (the learner's own preferences, the brief's Hebrew) → whole-line cards for each
function → **SORT YOUR HOBBIES**, the one game: five moments, one per hobby, each identical (the hobby's picture
above four category tiles LOVE / LIKE / DON'T LIKE / WANT TO TRY; the learner HEARS their own line and places the
hobby) → a Morning / Afternoon / Evening time choice for "I usually draw in the evening" → one "too" reply → the
diving school (comprehension card) → **"Do you like diving?" with NO card** — built from the friend's "Do you
like ___?" (asked three times) and "diving" (coverage: `M16_TRANSFER`) → the plan (one check: tomorrow) → the
conversation → no help (love · when · don't like · want to try · ask back) → video (none recorded: safe skip) →
final (ask · love · like · when · don't like · want to try · ask back) → 🎯 FREE TIME MATCH. **My Free Time** (a
two-column board: yours ‖ your friend's, plus the plan route) starts empty and fills only as the mission
reveals it: your hobbies when YOU place them, Drawing → Evening after the time choice, the friend's facts when
the friend says them; serialisable state `freeTimeState` (hobbyPreferences love / like / dislike / wantToTry,
drawingTime, friend, divingSchoolKnown, tomorrowPlan). Verified prior (`learnedBefore(lang, 16)`): Hi, Yes, No,
Great, Nice, "I like", and "Do you like" in English. One generic addition: `VisualMatchRound.picture` (what a round
is about, drawn above the tiles, never an answer). Learner sentence ids unchanged (the Everyday checkpoint's two
reuses intact); the friend's lines are whole-line hear items (four ids kept with their whole line, four new);
"Me neither!" alone is archived in `retired.ts`. Coverage: `mission16Coverage.ts`. Artwork: 7 slots (friends,
five hobbies with equal treatment, the diving school) + 1 prop, emoji PLACEHOLDERS — VISUAL PRODUCTION REQUIRED
(Astra pass): `MISSION16_ASSET_MANIFEST.md`. Tests: `mission16.test.ts` (65); Missions 01–15 and 17–30
byte-for-byte unchanged (the old "16–30" pins now pin 17–30).
