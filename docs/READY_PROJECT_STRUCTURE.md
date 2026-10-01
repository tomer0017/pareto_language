# READY — Project Structure & Product Rules

> **Read this file before starting any development on READY.** It is the permanent source of
> truth for *how the app is built and why*. If a change would improve engineering but hurt
> learner confidence, confidence wins. After a sprint, update this file (see §10).

---

## 1. Product vision

READY is **not** a generic language app. READY helps a **complete beginner** prepare for
**real travel communication** in **minimum time**. The unit of success is not vocabulary learned —
it is a real situation survived.

## 2. Core principle — Pareto 20/80

Every screen and every decision follows the 20/80 rule: **minimum learning time, maximum
real-world confidence**. Every screen must answer: *"What is the fastest way to help this
traveler communicate tomorrow?"* If something exists only because other language apps do it, it
does not belong here.

## 3. Main user goal

A user with **zero English** should be able to study **~20 minutes a day** and feel **confident
handling common travel situations abroad** — ordering, arriving, asking, recovering, connecting.

## 4. Product philosophy

- **Confidence over knowledge.** READY sells the feeling "I can handle this," not a word count.
- **Sentences before isolated words.** The learning unit is a usable line, not a flashcard.
- **Dialogue before vocabulary.** Learners meet phrases inside a live scene, then drill them.
- **Recovery tools are valid answers.** "Sorry, I don't understand / Can you repeat that?" are
  winning moves, not failures. The point is to **never freeze**.
- **Understanding replies > speaking perfectly.** Comprehension of what you'll *hear* is trained
  as a first-class skill (expected-reply drills).
- **Mission completion = surviving a real-life situation**, taken end to end (depth before breadth).
- **Nothing is ever locked.** Completed missions stay replayable forever (watch / read / practice).

## 5. Current app structure (screens)

Primary navigation — **Home · Path · Listen · Profile** (בית · מסלול · להאזין · פרופיל; exactly four
destinations — Stories live inside Listen, words and the sentence library under the Path). ONE model
(`app/nav.ts`) and ONE component (`shared/ui/AppNav`) for every screen size: a floating bottom bar
on phones/tablets, a side rail on desktop (on the inline-start edge — right in Hebrew, left in
English). The bottom bar hides inside a focused flow (an active mission, a game); the desktop rail
stays as a calm way out. READY is used in two modes over the SAME content: **active learning**
(the Path) and **passive listening** (Listen).

- **Home** — the coach, not a menu. It answers "what is the single best thing to do now?" with
  exactly four surfaces: **Travel Readiness** (ring + "X of 29 situations ready", plus "X of Y core
  sentences practiced" read from the real review log; Y is the canonical sentence count — one per
  distinct wording — from `sentenceCatalog`, the same number every screen shows), **Your next step** (the mission to continue
  or start — icon, objective, "Situation N of 29", estimated minutes, one primary button), **Quick
  review** (up to 5 sentences from the learner's own practice log; **hidden** until something was
  practiced — no empty disabled card) and **Quick listen** (10 hands-free minutes). No settings, libraries or
  tools on Home — they live in Learn / Listen / Profile. A brand-new learner additionally sees one
  quiet text link to the zero-beginner path.
- **Travel Readiness (מוכנות לטיול)** — the one progress model: completed missions ÷ the plan's
  length (`features/bootcamp/readiness.ts`, pure). Never "% of a language", never a hard-coded
  number. The detail screen (`readiness` view, opened from Home's ring or Learn's summary) lists
  every situation as ready / in progress / not started. Capability is the motivation — there are
  no points, streaks, hearts or invented achievement badges.
- **Path (מסלול)** — the structured path through the 29 real situations and the ONE route to them
  (labelled "מסלול" / "Path" because everything in READY is learning; internally still the `bootcamp` view):
  a small readiness summary, the plan's phases as groups, compact mission cards (number, the
  mission's own icon, title, objective, status), and exactly ONE card highlighted as "your next
  step". One column on phones, two on tablets, three on desktop. Below the curriculum, a quiet
  **More practice** row: the zero-beginner path, the Foundation building blocks, words, and the
  sentence library — ordinary rows, nothing floating over the mission list.
- **Listen (להאזין)** — passive mode: press Play and learn while driving or walking. Three
  categories — **Core sentences · Dialogues · Stories** — each a playlist built from content that
  already exists (`features/listen/playlists.ts`; nothing is duplicated). A **queue** of topics, a
  **now-playing** card (sentence in its own direction + translation), prev / play / next,
  **Repeats (חזרות)** 1× 2× 3× (how many times a sentence is said — NOT speed), a separate
  **Continuous play (ניגון רציף)** switch, three
  **listening modes** (app language → target · target only · target → app language) and a **Quick
  listen** (10 minutes, then it stops itself). Speech speed is NOT here: the one global speed lives
  in Profile. Desktop uses two columns (queue beside the player). **Stories are surfaced visually**:
  a card with one real story cover (the story being read, else the first unfinished one — from stored
  reading progress) opens the reader directly; "All stories" opens the list. The Videos experience
  and the sentence library are linked under "More ways to practice".
- **Videos** — an experience, not a list: plays a random available mission video, then asks "did
  you understand everything?" → load another random video, or drop into the exact Mission Hub that
  owns the video (Practice / Transcript / Video). Honest empty state. Videos ship for EN Missions
  1–4, 6–8, 10 and FR Missions 1–5, 8, 10 (each mission's optional `introVideo`, auto-discovered per
  learning language); missions without one show "Coming soon".
- **Bootcamp** — the heart of the product: a **29-mission journey** in 5 phases
  (Foundations → Arrival → Food → City Life → Mastery). **Mission 1 = Introduce Myself**, Mission 29 =
  A Complete Day Abroad Alone; checkpoints (cold integration days) at **9 / 17 / 23 / 29**. The former
  **Recovery Toolkit** mission is **removed** — no mission, special card, checkpoint or progress slot;
  the header reads "0 of 29 missions" for a new learner. The shared recovery phrases remain only as
  reusable lines inside other missions (`recovery.ts`, `fr/recovery.ts`, `es/recovery.ts`).
  Identity vs. order: each plan entry has a stable semantic `id` (`introduce-myself`, …) that
  persisted progress is keyed by; the display number is derived from plan order
  (`missionNumber()`); `day` is only the content-registry key. `BOOTCAMP_PLAN` is the single source
  of truth for count and order — nothing else hard-codes 29.
- **Foundation** — a row in the Path's "More practice" section (no longer a floating button; historically an action button on the Bootcamp map, hidden inside an active mission,
  via the pure `shouldShowFoundationFab`) opening a reusable bottom **Sheet**: 10 building-block
  categories → word list → word page (translation · audio · frequency · example · related missions).
  It is a **data-driven VIEW over the Core Corpus** — categories are declared as DATA in
  `features/foundation/taxonomy.ts` (selectors over the language-independent `category`/`pos`/
  `conceptId`), the model is pure (`foundationContent.ts`), and words come from
  `loadCoreWords(learningLang)`. So it never duplicates content, scales to thousands of words with no
  UI change, and works for EN + FR (and any future pack) through one code path. No progression/gating.
  It also powers **Universal Tap** (every Core word in dialogue/flashcards/Core/mission drills is
  tappable → the SAME sheet, via `TappableText`/`corpusIndex.ts` + `foundationStore.openWord`),
  **Smart Detection** (`FoundationHint` — a non-blocking nudge for the first unviewed brick in a
  mission; once all bricks are learned it stays as an always-available **Review** action that reopens
  the guided session in review mode, never resetting progress), and **Progress**
  (`foundationProgress.ts`, per-category + overall, persisted `viewed`/
  `dismissed`). One shared word sheet + one `SpeakerButton`; nothing duplicated.
- **Library (formerly the "Core" tab)** — a SECONDARY screen under Learn (words + sentence library),
  not a navigation destination; its content powers Learn, Listen and Quick Review. Conversation-help
  phrases are the last group ("עזרה בשיחה"), never first. Historical description of the surface: a grid of
  **category cards** (📖 Core Phrases · 📝 Core Words · ❓ Common Questions · 🚨 Emergency · 🧩 Core
  Patterns · ⭐ Favorites) → the existing tabbed page opened on the chosen category (top tabs +
  content), with a back button to the cards. **Core Phrases** is live (every sentence READY teaches,
  grouped by mission, tap to hear) and **Core Words** is now live too — the **Core 100** emoji pilot
  (`CoreWords.tsx`) with four modes on one screen: Browse · **🎧 Listen Mode** (Parrot Mode) · Picture
  Quiz · Swipe Recall (see **[CORE-100.md](./CORE-100.md)**). **Core Phrases** also hosts **🎧 Listen
  Mode**, **🎴 Sentence Flashcards**
  (`SentenceFlashcards.tsx` + pure `flashcards.ts`): flip / hear / next-prev / shuffle / direction
  toggle over the SAME canonical mission sentences (`buildSentenceDeck` reuses item ids — no
  duplication), per-language, shuffled per session. The rest stay honest "coming soon". The chosen
  category lives in `appStore.coreCategory`. Not "1500 words" yet — a validated 100-word pilot.
- **Mission vocabulary priming** — a `{ kind: 'prime' }` mission step ("Before we speak") teaches 3–8
  building-block words before a longer sentence, optionally assembling into a canonical mission
  sentence, with a ♻️ review hint for words seen earlier (`primeVocab.ts`). Primed: **Missions 1–7**
  (all languages in parity). Every mission's priming decision is recorded and test-bound in `vocabAudit.ts`
  (29 audited · 7 primed · 22 no-priming-needed). Essential connectors/sizes (`with/without/and/or/
  here/there/can/more/less/medium/large`) are now **global Core** concepts (corpus 633, incl. the
  Core World Vocabulary Phase 1 — everyday world nouns/verbs that recur in beginner stories). French
  numbers (70/80/90 vigesimal) live in `fr/frenchNumbers.ts`. See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.
- **Randomization** — one tested seeded shuffle (`shared/util/shuffle.ts`, Fisher–Yates + `mulberry32`)
  backs all answer-option / distractor / review ordering (games, quizzes, flashcards, session builder).
  Narrative dialogue order is never shuffled; only options and review order are.
- **Profile** — the one home for settings: trip language, app language, the single global
  **speech-speed** (80–105%, default 95%) + Test Voice, appearance (light/dark) and honest "coming
  soon" account rows. Theme and speed are no longer on Home.
- **Mission overview** — ONE guided path, with ONE primary button: **Watch** (the video; with no
  video, **Listen** to the conversation in the transcript reader) → **Learn** (the words, sentences
  and expected replies) → **Practice** (respond) → **Watch again** (the reward). The journey is
  shown as a short list, but a first-time learner never chooses between "Learn" and "Practice":
  the button always runs the next step ("start" / "continue learning" / "continue to practice"),
  and after the first viewing the video offers one way forward — never an "I understood
  everything" shortcut. Once the mission is COMPLETED the steps become shortcuts for revisiting.
  Learn and Practice are entries into the SAME unchanged step-flow (`missionFlow.ts`); cold
  checkpoints have no Learn step. "Watched" is not stored, so the Watch step is ticked only for a
  viewing in the current visit. The transcript stays one quiet tap away.
- **Practice** — the Bootcamp step-flow (talk → tools → expected-reply drills → quizzes →
  dialogue → sentence review → cold open → victory). Unlimited repeats; never "finished."
  Listening is **one screen** (play → transforms in place when audio ends → sentence + Continue,
  no "tap when ready" gate). A **started** mission asks *Continue vs Start over* before resuming.
  Every answer runs the **one global feedback system** (`shared/ui/feedbackCue` + `Feedback` +
  `.fx-*` motion + `shared/audio/sfx`): correct = chime/green glow, wrong = tone/shake + a
  redesigned **wrong-answer view** (your answer · right answer · one-line Why? · Try Again / Continue).
- **Transcript** — the full conversation as a premium bilingual reader with per-line replay and the
  current line highlighted + auto-scrolled. Its playback is driven by the shared **Parrot Mode**
  engine (`shared/playback`), so it gains repeat ×1–3, sequential/random and translation on/off
  alongside play / pause / resume / restart — the same controls Core Words & Core Sentences use.
- **Video** — the full-conversation video (manual play, inline, replayable). EN Missions 1–4, 6–8, 10
  and FR Missions 1–5, 8, 10 ship one (e.g. `/videos/En_day6.mp4` = Mission 6, Taxi); others show Coming Soon. Missing/broken
  video degrades gracefully.
- **Victory Screen** — completion **celebrates** with minimal reading (Pareto): confetti +
  "{Mission} completed!" + three **large action cards** (Watch Conversation · Open Transcript ·
  Practice Again). Evidence is not a wall — it is collapsed behind a tiny **"What did I learn?"**
  toggle (skill · mastered phrases · receipts). Next Mission stays a quiet ghost action.

## 6. Learning flow (intended order)

**Watch / listen → Understand → Practice → Reply → Recover → Review full conversation → Repeat.**

The emotional loop of a mission: watch the conversation and understand almost nothing → practice
→ watch again and realize "now I understand it." The dialogue player still supports an opt-in
**coaching mode** (`dialogue.coaching`: picks reframed as *more or less useful*, never right/wrong),
but no current mission enables it — it belonged to the retired Recovery Toolkit mission.

## 7. Architecture overview

- **React app (`apps/web`)** — Vite + React 18, mobile-first, RTL-aware, PWA. Screens live under
  `src/features/*`; shared UI/audio/i18n/stores under `src/shared/*`; app shell in `src/app/`.
- **Zustand stores** — `shared/stores/appStore.ts` (routing/`view`, user, content pack, `theme`,
  `uiLang`, `learningLang`, `coreGameActive`), `features/bootcamp/bootcampStore.ts` (active mission,
  hub/play `stage`, progress + receipts in **localStorage** — `ready.bootcamp.v2.<lang>`, keyed by
  stable mission id via the pure `progress.ts`; v1 day-number data migrates once), `shared/stores/sessionStore.ts`. Single
  sources of truth — no duplicated navigation/settings/state. **Nav visibility** is a pure rule
  (`app/nav.ts`: `PRIMARY_TABS`, `navTabOf`, `shouldShowNav`, `hasAppShell`): the bottom bar hides inside any focused full-screen flow
  — an active Bootcamp mission **or** an active Core learning-game session (`coreGameActive`), so a
  game's fixed action zone (Continue) is never occluded by the higher-z nav.
- **Bootcamp data files** — `features/bootcamp/day1..29.ts` are **pure data** (no React, no store),
  registered in `registry.ts`'s `DAYS`. `plan.ts` = 29-mission metadata (stable ids + order); `types.ts` = the
  content model; `transcript.ts` = happy-path linearizer; `recovery.ts` = the shared survival kit.
  A mission is data; the generic MissionPlayer renders it.
- **Reusable UI/feedback (`shared/ui`, `shared/audio/sfx.ts`)** — `Modal` (confirm/choice dialogs),
  `Feedback` + `feedbackCue` + `sfx` (the single success/error system: burst + glow/shake + chime/
  tone + haptic, synthesized offline, wired through every drill). New patterns compose here first.
- **Learning games (`features/games/*`)** — content-agnostic games mounted in **Core Words** on the
  real **Core 100** (`shared/content/coreWords.ts` → precached `core-en.v1.json`); both scale to Core
  500/1000/1500 with no changes and record review events via `shared/review/recordReview`.
  **Picture Quiz** is a full session (pure `rounds.ts` `buildSession(size)` — randomized, no-repeat,
  configurable/clamped) → progress → shared feedback → Victory (Play Again / Back). **Swipe Recall**
  is a **Tinder-style** card (finger-following drag with live rotate + like/nope stamp, spring-back,
  fly-off; drag via direct GPU `translate3d` on a ref for 60 FPS) over a **pure, unit-tested re-queue
  engine** (unknown returns after ~10–15 — the SRS seam) with press-and-hold reveal. The card shows
  the **learner-language meaning below the icon before reveal** (pure `cardFace`) so an ambiguous
  emoji is never a guess; the target word waits for the hold. Both games take a `lang` prop and
  speak the active learning language (not hardcoded English). Both share the
  reusable **`AnswerFeedback`** + pure `answerContext.ts` builders (the full-context wrong-answer
  model, also used by every Bootcamp drill). The old `mockWords` remains for isolated tests only.
- **Core Corpus (`content/core-corpus/*`, `content/concepts/core-corpus.yaml`)** — the production
  **Core 633**: authored concept rows (`data/*.ts`, 25 categories, five-part scorecard
  freq/comm/recog/coverage/travel + RoF/layer/pos) → pure `corpus.ts` (validate · ROL · rank ·
  realize) → `build-core.ts` (`npm run build:core`) emits the canonical concepts YAML (seeded to
  Mongo via `seedConcepts`, idempotent) and **one offline pack per declared language**
  (`core-{lang}.v1.json`, PWA-precached). Concept-first: gloss stored once; adding a language =
  realizations + declaration, **zero code** (proven by test). The `Concept` schema carries additive
  corpus fields (`pos`, `commScore`, `recogScore`, `imageEligible`, `aliases`, `relatedConcepts`,
  `oppositeConcepts`). The Core 100 pilot migrated in with identical ids. See **CORE-CORPUS.md**.
- **Content schema (`packages/content-schema`)** — `ContentPack` / `ContentItem` / `Situation` /
  memory + review types shared across web, server, engine, and the pipeline.
- **Concept Layer + Pipeline (`content/`)** — the corpus → concepts → phrases → validated pack
  toolchain (`content/pipeline`, `content/build.ts`, `content/concepts`, `content/core-en`). It
  currently builds the **Italian `it-IT` pack** into `apps/web/public/content/`. This is the
  content infrastructure — do **not** bypass it to hardcode content-pack material.
- **MongoDB (`server/`)** — the API + seeders (`contentApi`, `seeders`). Optional for the pilot:
  the web app is local-first and the Bootcamp needs no server. `ApiProvider` is used only when
  `VITE_API_BASE` is set (server pack → IDB cache → static fallback + background sync).
- **Offline / PWA** — `vite-plugin-pwa` precaches the app shell + content JSON; `LocalProvider`
  (IndexedDB, via `@ready/data`) holds users/plans/events/packs and projects memory state offline.
  Videos are **runtime-cached** (not precached — too large) so first load never waits on them.
- **TTS / audio (`shared/audio/tts.ts`)** — Web Speech with a Chrome keep-alive + visibility
  resume (the "works then stops" fix), a gesture unlock, and the **single global speech-rate**
  multiplier (`getSpeechRate`/`setSpeechRate`) applied to every `speak()`. Asset-first, TTS fallback.
- **Videos (`apps/web/public/videos`)** — referenced by a mission's optional `introVideo.src`
  (public path, resolved against `BASE_URL`). Shipped for EN days 2–5, 7–9, 11 and FR days 2–4.

## 8. Important constraints (rules for every future change)

**Before every future development, read this file.** Then:

- Do **not** break Bootcamp logic (missions, hub, player, victory, replay).
- Do **not** bypass the content pipeline; do not hardcode content-pack material.
- Do **not** hardcode language assumptions. Keep the **English pilot honest**: other languages are
  "coming soon" unless real content actually exists.
- Keep **offline** working. Keep **mobile-first**. Keep **RTL** working (en + he UI).
- No **fake native review** — Hebrew/target content is AI-drafted until a native reviewer signs off.
- No **meaningless gamification**. No **unnecessary architecture changes**.
- Prefer reusable components; avoid duplicated state, navigation, or settings.
- Do not change Mongo / Concept Layer / pipeline / review engine as a side effect of UX work.
- **Any-to-any rule (multilingual):** before every multilingual change, verify it works for an
  **arbitrary (app-language × learning-language) pair** and assumes neither English nor Hebrew.
  Content is **concept-first** — realizations per language, gloss = the same concept in the app
  language, never English-as-bridge. Use `shared/i18n/display.ts` (`resolveDisplay`) as the display
  rule and `assertPairsComplete` as the leak gate. Any language-capability change updates
  **[MULTILINGUAL-ARCHITECTURE.md](./MULTILINGUAL-ARCHITECTURE.md)** and `npm run parity`.

## 9. Current pilot state

- **English pilot is active.** English is the default and only selectable trip language.
- **Bootcamp is the main product** and the landing experience (via Home).
- **A full English content pack is not yet complete.** The Words / Phrases / Situations / daily
  Mission tabs are content-pack driven and are therefore gated to an honest "coming soon."
- **Italian / Spanish / French / Arabic are not active yet.** Only the Italian `it-IT` pack is
  actually built (used by the pipeline/server), and it is **not user-facing** in the pilot. A
  **French foundation** exists (validated 17-concept proof slice + partial-pack validator gate) but
  French stays `available: false` and out of `DECLARED_LANGS` until a reviewed Core 500 + Bootcamp
  ship — see **[FRENCH-PILOT.md](./FRENCH-PILOT.md)**. `validateCorpus(rows, size, declaredLangs)`
  proves no half-French pack can build.
- Existing **multilingual infrastructure exists** (language registry, per-language theming, RTL,
  the content-pack chain) but is intentionally not fully surfaced until real content ships.

## 10. Update rule

**After every future sprint, update this file** if any of these changed:

- app structure / screens
- navigation
- data model
- learning philosophy
- content pipeline
- language support
- Bootcamp behavior

And regenerate the content review surface when Bootcamp content changes:

```
npm run gen:conversations   # rewrites docs/BOOTCAMP_CONVERSATIONS.md from source
npm run export:dialogues     # cinematic screenplays per language → exports/ (dev tool, see DIALOGUE-EXPORT.md)
```

---

_Companion doc: **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)** — every mission's
phrases, expected replies, recovery tools, cold opens and dialogues, auto-generated from source
for human content review._
