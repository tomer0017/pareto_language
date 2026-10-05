# READY — Master Overview

> **This is the most important document in the repository.** Every new developer, AI agent, or
> contributor must read it before making any change. It explains what READY is, why it exists,
> how it is built, what principles cannot be broken, and where the project stands today. Someone
> who has never seen the project should understand ~90% of it from this file alone.
>
> It is a **living document** (see §12): update it in the same sprint that changes the product
> philosophy, architecture, navigation, learning flow, or status.

---

## 1. Project summary

**The problem.** A traveler with little or no ability in the local language freezes in ordinary
moments — ordering a coffee, clearing passport control, asking for directions, fixing a wrong
bill. The fear of that freeze is what actually ruins the experience, not the missing vocabulary.

**The target user.** A near-beginner with a real, near-term trip. The pilot persona is a Hebrew
speaker heading abroad who needs **survival English** fast — concretely, "a 60-year-old traveler,
zero English, first time using the app." They have minutes a day, not months, and a deadline.

**Why traditional language learning fails travelers.** Classic apps optimize for the wrong thing:
breadth over depth (thousands of words, none deep enough to use), isolated words instead of usable
sentences, speaking drills that create anxiety before comprehension exists, streak-based
gamification that rewards showing up rather than becoming capable, and no awareness of a trip
deadline. You can "complete" a course and still freeze at the counter.

**Why READY exists.** To make a beginner **demonstrably capable** of surviving the ~10 situations
every trip runs on — in the smallest possible time. Success is a real moment handled, not a lesson
finished.

**The philosophy, in one line.**
> **READY does not teach languages. READY teaches travel confidence.**

## 2. Product goal

**The promise.** A complete beginner studies **~20 minutes a day for ~30 days** (the 30 Bootcamp
missions) and arrives abroad **feeling capable of handling common situations alone**.

**The success metric is not vocabulary.** We do not count words learned. The metric is a feeling
backed by evidence:

> *"I felt confident speaking. I didn't freeze."*

In-app, that feeling is earned through **receipts** — each mission ends by proving a real
situation was survived. Capability, demonstrated, is the product.

## 3. The READY philosophy

Each principle exists to protect the promise in §2.

- **Pareto 20/80.** Teach the 20% of language that covers 80% of real travel moments. Every screen
  must answer: *"What is the fastest way to help this traveler communicate tomorrow?"* If something
  exists only because other apps do it, it is removed.
- **Confidence before knowledge.** We sell the feeling "I can handle this," not a word count. A
  learner who feels safe keeps going; a learner drowning in vocabulary quits.
- **Dialogues before vocabulary.** Phrases are met **inside a live scene** (a café, a border desk),
  so they arrive with context and emotional stakes — the way real language is encountered.
- **Sentences before words.** The unit of learning is a **usable line** ("A table for two,
  please."), not a flashcard. Words are support; sentences are what you actually say.
- **Listening before speaking.** Understanding what you'll *hear* is trained first (expected-reply
  drills). Comprehension lowers fear; forced production raises it.
- **Recovery tools are superpowers.** "Sorry, I don't understand / Can you repeat that? / Please
  speak slowly." are **winning moves**, not failures. They mean you can never truly get stuck.
  They are not a lesson of their own: the tools are reused **inside** the missions' dialogues.
- **Understanding replies > perfect grammar.** Recognizing the barista's follow-up question matters
  more than a flawless sentence. Real conversations are survived by comprehension + recovery.
- **Every learning minute must justify itself.** No filler, no vanity metrics, no busywork. If a
  screen doesn't move the learner toward handling a real moment, it is cut.

## 4. Learning architecture (the flow)

```
ACTIVE   Home (next step) → Learn (30 missions) → Mission: Watch → Learn → Practice → Watch again → Victory → Next mission
PASSIVE  Listen: core sentences · dialogues · stories — the same content, hands-free
```

- **Home** — the coach. One glance answers "what is the single best thing to do now?": Travel
  Readiness, the next mission, a quick review and a quick listen. Nothing else.
- **Zero Start ("מתחילים מאפס")** — an **optional, strongly-recommended pre-Bootcamp bridge** for a
  learner who knows *zero* words and can't yet follow the first realistic mission. A short guided
  Pre-A1 path (8 modules, cumulative "one new brick at a time") that ends by **graduating the learner
  into the first real Bootcamp mission** (it never auto-completes the Bootcamp). Experienced learners
  skip it; it is recommended, never forced.
- **Learn** — the heart: the **Core 30** — 30 real-world missions across 5 phases (Foundations → Arrival →
  Everyday Life → City & Conversation → Mastery). Depth before breadth — one situation, taken all the way, per mission.
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
- **Video** — watch the full conversation **before** learning and understand almost nothing. This
  sets up the emotional payoff. (EN Missions 1–3, 6–9, 14 and FR Missions 1–3, 5, 6, 9, 14 ship a video; others
  show "Coming soon.")
- **Practice** — the actual learning: watch/listen → understand → repeat (tools) → recognize
  (expected replies) → answer (quizzes/dialogue) → recover (recovery tools) → a cold-open ambush.
- **Transcript** — the full conversation as a premium bilingual reader with per-line replay: the
  study sheet for quiet review.
- **Victory Screen** — completion **celebrates** (confetti + "20 minutes ago you didn't understand
  this — now watch it again"). The **reward is re-watching** the conversation you now understand;
  the next mission is a quiet ghost action. **Confidence before progress.**
- **Next Mission** — only after the learner has felt the win. The loop repeats, confidence compounding.

Why this order: **Watch (feel lost) → Learn → Watch again (feel progress)** is a far stronger
emotional loop than "learn → get told you're done."

## 5. Application structure (screens)

Primary navigation — **Home · Path · Listen · Profile** (בית · מסלול · להאזין · פרופיל; exactly four
destinations — Stories live inside Listen, words and the sentence library under the Path). ONE model
(`app/nav.ts`) and ONE component (`shared/ui/AppNav`) for every screen size: a floating bottom bar
on phones/tablets, a side rail on desktop (on the inline-start edge — right in Hebrew, left in
English). The bottom bar hides inside a focused flow (an active mission, a game); the desktop rail
stays as a calm way out. READY is used in two modes over the SAME content: **active learning**
(the Path) and **passive listening** (Listen).

- **Home** — the coach, not a menu. It answers "what is the single best thing to do now?" with
  exactly four surfaces: **Travel Readiness** (ring + "X of 30 situations ready", plus "X of Y core
  sentences practiced" read from the real review log; Y is the canonical sentence count — one per
  distinct wording — from `sentenceCatalog`, the same number every screen shows), **Your next step** (the mission to continue
  or start — icon, objective, "Situation N of 30", estimated minutes, one primary button), **Quick
  review** (up to 5 sentences from the learner's own practice log; **hidden** until something was
  practiced — no empty disabled card) and **Quick listen** (10 hands-free minutes). No settings, libraries or
  tools on Home — they live in Learn / Listen / Profile. A brand-new learner additionally sees one
  quiet text link to the zero-beginner path.
- **Travel Readiness (מוכנות לטיול)** — the one progress model: completed missions ÷ the plan's
  length (`features/bootcamp/readiness.ts`, pure). Never "% of a language", never a hard-coded
  number. The detail screen (`readiness` view, opened from Home's ring or Learn's summary) lists
  every situation as ready / in progress / not started. Capability is the motivation — there are
  no points, streaks, hearts or invented achievement badges.
- **Path (מסלול)** — the structured path through the 30 real situations and the ONE route to them
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
- **Videos** — an experience, not a list: a random mission video plays, then a "did you understand
  everything?" popup either loads another random video or opens the exact Mission Hub that owns it.
- **Reading (📖)** — a reusable reading surface (a supporting screen, reached from Listen): browse collections →
  story → full-screen reader. First collection **Beginner Stories** (15 A1–A2 stories in EN/FR/ES +
  Hebrew gloss). Three persisted modes (Original / Bilingual / Tap-to-reveal), sentence-by-sentence
  with **Universal Tap** on every Core word and whole-story/per-sentence audio via the shared
  `shared/playback` engine, then a short comprehension quiz. Collection-agnostic + code-split
  (`features/reading/`): future collections (Easy Conversations, News, Recipes, …) are data-only.
- **Zero Start ("מתחילים מאפס", 🌱)** — the guided zero-beginner path, reached from Learn's **More
  practice** row and, for a genuinely new learner in a supported language, from one quiet link under
  Home's next step. **Navigation:** it is the `zerostart` view — NOT a
  bottom-nav tab, so the permanent nav auto-hides during lessons (a focused flow with its own back/exit,
  like an active mission). Flow: hub (module list + overall progress + resume) → lesson steps → module
  "I can now…" outcome → graduation screen with a CTA into the first real Bootcamp mission. **Teaching
  model:** 8 cumulative modules (First contact → Me & my identity → Wants & needs → Finding things →
  Buying & paying → Understanding & repair → Essential questions → Readiness checkpoint), each brick
  moving through introduce → recognize → build → recall → mini-dialogue, with rotating exercise types
  (listening recognition, picture recognition, missing-word/cloze, sentence builder) and a badged
  end-of-module mastery stretch; every target-language item has a small per-item replay speaker. The
  checkpoint reuses only material already taught. **Architecture (`features/zerostart/`):** fully data-driven — content
  (`content.ts`: a shared chunk library + modules), pure progress/validation (`zeroStartProgress.ts`),
  persistence (`zeroStartStore.ts`), and the renderer (`ZeroStart.tsx`); audio via the shared
  `shared/audio/tts` engine; personalization via a saved learner name (`{name}` substituted at render,
  no PII in static data). **Persistence:** per-language completed-step ids + completion date + name in
  `localStorage` (`ready.zerostart.v1`); progress is completed-step based (never "screens visited") and
  resumes from the first incomplete step. **Foundation sync:** learning a chunk marks its Foundation
  concept `viewed` (idempotent, deduped — no double-count), so Zero Start and the Foundation library
  share one progress signal rather than competing.
- **Bootcamp** — the **Core 30**: a 30-mission journey in 5 phases (Foundations → Arrival → Everyday
  Life → City & Conversation → Mastery). **Pareto-first:** the smallest amount of language that gives
  the largest amount of real communication — reusable sentence frames (want / need / have / can,
  I'm going to, I think, because) before nouns. A learner who finishes Mission 30 can survive travel
  AND hold a simple human conversation: plans, home and family, hobbies, yesterday, tomorrow, opinions.
  **Mission 1 is Introduce Myself**, Mission 4 is Everyday Core, Mission 30 is A Complete Day Abroad
  Alone. Checkpoints (cold integration days — they test, they never teach) sit at **10 / 18 / 24 / 30**.
  The last three missions teach nothing: 28 (No Subtitles) is heard only — no transcript and no
  translation before the answer; 29 is one evening; 30 is one whole day of real decisions.
  Eight missions are new (4, 12, 13, 16, 20, 21, 23, 25); Restaurant Basics, Hotel Requests and Paying
  Anywhere were merged away; Street Food, Tickets, Wifi/SIM and Souvenirs moved to the **Extended
  Mission Pool** (`plan.ts` `EXTENDED_POOL`, content in `extended.ts`) for a later 31+ track. See
  **[CORE_30_FINAL_CURRICULUM_REPORT.md](./CORE_30_FINAL_CURRICULUM_REPORT.md)** (Curriculum V1.0 —
  locked; AI linguistic review completed, native review still recommended). The **Recovery Toolkit** is
  **not a mission** ("ערכת חילוץ" was removed from the curriculum): it is not a mission,
  a special card, a checkpoint, or part of the count/progress. Only the shared recovery phrases
  survive (`recovery.ts` per language), because other missions reuse them inside their dialogues.
  `plan.ts` (`BOOTCAMP_PLAN`) is the one source of truth for mission count and order.
- **Language buddy (החבר שלך)** — one living character per learning language that is with the learner
  on Home, on the Route, inside missions and when they finish one. It reacts to what they do and,
  over time, changes. The change is a DISCOVERY: the app never names a stage, counts stages or shows
  what it will become. Internally it is a six-stage, cumulative, monotonic progression that is
  deliberately NOT Trip Readiness. It never shows target-language text the learner has not learned
  and never awards growth for an answer.
  See **[COMPANION_SYSTEM.md](./COMPANION_SYSTEM.md)**.
- **Foundation** — reached from a row in the Path's "More practice" section (it is no longer a
  floating button over the mission list), opening a bottom sheet of "building block" categories (People, Question Words,
  Connectors, Position, Essential Verbs, Colors, Numbers, Time, Quantity, Quick Responses) → word
  list → word page (translation · native audio · frequency stars · example · "Appears in" missions).
  Pareto "grab the missing brick and keep going": no progression, no gating. It is a **data-driven
  VIEW over the Core Corpus** (categories declared as data in `features/foundation/taxonomy.ts`; no
  new content), so it scales to thousands of words and lights up per language (EN + FR) with no code.
  Three capabilities extend it, all reusing that ONE word sheet: **Universal Tap** (every Core word
  across dialogue, flashcards, Core Words/Phrases and mission drills is tappable → the sheet),
  **Smart Detection** (a non-blocking "🛟 Missing Foundation Brick" nudge for the first unviewed
  building block in a mission — Learn now / Dismiss, never gates; once every brick is learned it stays
  as an always-available **Review** action that reopens the guided session in review mode without
  resetting progress), and **Progress** (motivational
  per-category + overall bars from the words you've viewed; persisted, never gates).
- **Library (formerly the "Core" tab)** — no longer a destination of its own: its content powers
  Learn, Listen and Quick Review, and it stays reachable as a secondary screen (words + sentence
  library) from Learn and Listen. In the sentence library the shared conversation-help phrases
  ("Can you repeat that?") are the LAST group, named **עזרה בשיחה / Conversation help** — never the
  learner's first or default encounter. Inside it: **Core Phrases** is live (every sentence READY teaches, grouped by mission,
  tap to hear) with **🎴 Sentence Flashcards** review (flip/hear/shuffle over the canonical mission
  sentences) and a shared **🎧 Listen Mode** (Parrot Mode), and **Core Words** is live — the **Core
  Corpus (Core 633)** with Browse · **🎧 Listen Mode** · Picture Quiz · Swipe Recall, backed by the real concept pipeline (see CORE-CORPUS.md): 633 language-independent
  concepts (grew from 500 → 511 when the high-reuse connectors/sizes `with/without/and/or/here/there/can/
  more/less/medium/large` were promoted to global Core, then 511 → 532 with the **Core World
  Vocabulary Phase 1**, then 532 → 633 with the **Core World Audit** — everyday world nouns/verbs +
  story animals/objects that recur in beginner stories; see CORE-WORLD-AUDIT.md), 305 game-eligible
  with unique emoji, one offline pack per language. Core Patterns · Common Questions · Emergency · Favorites remain honest
  "coming soon".
- **Mission vocabulary priming** — a "Before we speak" step primes 3–8 building-block words before a
  longer sentence (the foundation missions — registry keys 1–7 and Everyday Core — all languages in parity), with new-vs-review tracking; every mission's
  priming decision is audited in `vocabAudit.ts`. French 70/80/90 number patterns are tested in
  `fr/frenchNumbers.ts`. See VOCABULARY-AUDIT.md.
- **Profile / Settings** — the one home for everything configurable: trip language (opens the
  language screen), app language (English/Hebrew), the single global **speech-speed** control
  (80–105%, default 95%) with Test Voice, appearance (light/dark), and honest "coming soon" rows
  (Google sign-in, statistics, notifications). Nothing configurable lives on Home.
- **Mission overview** — the guided journey Watch → Learn → Practice → Watch again (see §4).
- **Video** — full-conversation player: manual play (no autoplay with sound), inline on iOS,
  replayable, fullscreen; degrades gracefully if the file is missing.
- **Transcript** — bilingual reader: every line, both languages, per-line replay, current line
  highlighted + auto-scrolled; playback driven by the shared **Parrot Mode** engine
  (`shared/playback`) so it also offers repeat, sequential/random and translation on/off.
- **Practice** — the Bootcamp step-flow (talk → tools → expected-reply drills → quizzes → dialogue →
  sentence review → cold open → victory). Unlimited repeats; never "finished."
- **Victory Screen** — the celebratory completion screen (Pareto): confetti + "{Mission}
  completed!" + large action cards (Watch Conversation · Transcript · Practice Again); evidence is
  collapsed behind a tiny "What did I learn?" toggle. Minimal reading, maximum celebration.
- **Feedback system** — one reusable success/error system (burst + glow/shake + synthesized
  chime/tone + haptic) fired by every drill, dialogue pick, quiz and game; wrong answers get a
  redesigned view (your answer · right answer · one-line Why? · Try Again / Continue).
- **Navigation** — `AppNav`: Home / Learn / Listen / Profile; a bottom bar on phones/tablets and a
  side rail on desktop, from one model (`app/nav.ts`).
- **Responsive shell** — READY has exactly two column widths, set as tokens: **`--page-max`** for
  browse pages (480 → 760 → 1160px) and **`--focus-max`** for focused flows (480 → 640 → 780px), so
  a lesson stays one narrow, centred column even on a wide monitor. Breakpoints: phone < 768,
  tablet 768–1099, desktop ≥ 1100 (where the rail appears).
- **Legacy content-pack screens** — the pre-Bootcamp trip-plan product (daily Mission, Words,
  Phrases, Situations, Practice, Session, Emergency, Plan) is retired from the journey: no shipped
  learning language has a content pack and nothing links to these views. They remain only so the
  content-pack systems keep compiling; reached without a pack they show an honest notice and a way
  back to Learn.

## 6. Technical architecture

Each layer has one responsibility.

- **React (`apps/web`)** — the UI. Vite + React 18, mobile-first, RTL-aware, PWA. Screens under
  `src/features/*`; shared UI/audio/i18n/stores under `src/shared/*`; app shell in `src/app/`.
- **TypeScript** — strict, end to end (project references across packages). The content model and
  every entity are typed and shared.
- **Zustand (state)** — `shared/stores/appStore.ts` (routing/`view`, user, content pack, `theme`,
  `uiLang`, `learningLang`), `features/bootcamp/bootcampStore.ts` (active mission, hub/play `stage`,
  progress + receipts in **localStorage**, keyed by stable mission id — `ready.bootcamp.v2.<lang>`), `shared/stores/sessionStore.ts`. Single sources of
  truth — no duplicated navigation, settings, or state.
- **Content Schema (`packages/content-schema`)** — zod-typed `ContentPack` / `ContentItem` /
  `Situation` / memory + review types, shared by web, server, engine, and the pipeline.
- **Concept Layer + Pipeline (`content/`)** — the corpus → concepts → phrases → validated-pack
  toolchain (`content/pipeline`, `content/build.ts`, `content/concepts`, `content/core-corpus`).
  It builds the **Core 633 packs** (`core-{lang}.v1.json`) and the **Italian `it-IT` pack** into
  `apps/web/public/content/`. **Important
  nuance:** the Bootcamp (the actual pilot) is *decoupled* from this — Bootcamp missions are pure
  TypeScript data files, not pipeline output. The pipeline feeds the content-pack app
  (Words/Phrases/Situations), which is currently gated in the English pilot.
- **MongoDB (`server/`)** — the API + seeders (`contentApi`, `seeders`). **Optional** for the pilot:
  the web app is local-first and the Bootcamp needs no server. `ApiProvider` is used only when
  `VITE_API_BASE` is set (server pack → IDB cache → static fallback + background sync).
- **Offline / PWA** — `vite-plugin-pwa` precaches the app shell + content JSON; `LocalProvider`
  (IndexedDB, via `@ready/data`) stores users/plans/events/packs and projects memory state offline.
  Videos are **runtime-cached** (not precached — too large) so first load never waits on them.
- **Videos** — `apps/web/public/videos/{language}/{language}_{displayedMissionNumber}.mp4`:
  the language being learned and the mission number the learner sees (`videos/es/es_4.mp4`). The build
  scans the folders; nothing lists videos by hand. To add one, drop the file in, commit, push, deploy —
  no mission file or code changes. (The file number follows the displayed number, so reordering the
  journey means renaming the affected video files.)
  The Core 30 restructure changed some dialogues that already have a video (see the video migration map in
  CORE_30_RESTRUCTURE_REPORT.md): those videos still play, but await the video audit. Shipped for EN
  missions 1–4, 6–8, 10 and FR missions 1–5, 8, 10; only Mission 1 (EN & FR) injects intro/again
  video steps, the rest surface it in the hub / Videos.
- **Audio preference ownership** — a playback option never affects a screen where the learner
  cannot see or change it. **Global:** speech speed (Profile; `ready.speechRate`), applied to every
  spoken line by the TTS layer — there is no second speed anywhere. **Listen:** repeats, continuous
  play, shuffle, the quick-listen timer (`ready.playback.listen`) and its listening mode
  (`ready.listen.mode`). **Story:** reading mode + voice order (`ready.reading.v1`); it owns no
  engine option, so every sentence is spoken once. **Transcript / word listening:** their own
  controls panels (`ready.playback.transcript`, `ready.playback.words`).
- **Developer diagnostics** — the audio / data badges are not product UI: they render only in a
  development build AND when explicitly requested with `?debug=1` (never in production).
- **Parrot Mode (`shared/playback`)** — ONE content-agnostic listening engine + controls reused by Core Words, Core Sentences and the Dialogue Transcript. A surface supplies a list of items; the engine owns play/pause/resume, sequential/random, repeat ×1–3, translation on/off, continuous loop, playback speed (0.5/0.75/1/1.25×), pause durations, a sleep timer, per-surface listening bookmarks and Screen Wake Lock. Preferences persist; "currently playing" never does (no auto-start on refresh). Pure planning/persistence/sleep are unit-tested; see ARCHITECTURE.md.
- **TTS / audio (`shared/audio/tts.ts`)** — Web Speech with a Chrome keep-alive + visibility resume
  (the "works then stops" fix), a first-gesture unlock, and the **single global speech-rate**
  multiplier applied to every `speak()`. Asset-first playback, TTS fallback.
- **Localization (`shared/i18n`)** — a small dictionary system (English + Hebrew shipped), full
  **RTL** support, and per-language theming. Adding a UI language is one dictionary, zero screens.

## 7. Content system (how the pieces connect)

- **Concepts** — atomic meanings/skills in the corpus (pipeline side); the backbone of the
  content-pack app. Not used directly by the Bootcamp.
- **Words** — vocabulary items; *support*, never the main unit. Surfaced (future) via Core review.
- **Phrases** — usable sentences (`en.phrase.<situation>.<slug>`), the primary "you say" unit.
- **Expected Replies** — what the learner will *hear* (`en.reply.<situation>.<slug>`), trained as a
  first-class comprehension skill before the live dialogue.
- **Recovery Tools** — the shared 8-phrase conversation-help kit (six help tools — don’t understand / say that again /
  speak slowly / one moment / show me / **what does that mean?** — plus "Thank you!" and "Sorry!") (`en.phrase.recovery.*`, in `recovery.ts`),
  reused inside every mission so the safety net stays warm in context.
- **Dialogues** — branching trees (visual-novel, one line at a time). The **happy path** is the
  canonical conversation; wrong picks route to **recovery beats** and rejoin — never a dead end.
- **Moments** — a full situation taken end to end (greeting → order → follow-ups → pay → goodbye).
  A mission is one moment, deep.
- **Cold Opens (ambush)** — a fast, off-script sentence that trains "don't freeze, use a tool."
- **Missions** — pure data combining items + dialogues + a step sequence, registered in `registry.ts`.
  Two authoring forms, one content model: hand-written `dayN.ts` files (per language), and missions
  **authored once for every language** as a `MissionSpec` in `bootcamp/core/*.ts` and built by
  `author.ts` (`buildMission`) — every line carries its English / French / Spanish / Hebrew wording
  side by side, so a language can never lose a turn. `plan.ts` holds the 30-mission metadata — each
  entry has a stable semantic `id` (e.g. `introduce-myself`), a `day` (the stable content-registry
  key — NOT its position; Taxi is still `day: 6` though it is Mission 7), and a display number derived
  from plan order (`missionNumber()`); `transcript.ts` linearizes a tree into its happy path; `types.ts`
  is the model.
- **Core 1500** — the practical-vocabulary surface: an aggregated, audio-enabled view of every
  phrase the missions teach (the "vocabulary engine"), with spaced review planned.

Human-review surface for all of the above: **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)**,
auto-generated from source by `npm run gen:conversations`. The four-language dialogue reference
(**[ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md](./ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md)** — English / French /
Spanish / Hebrew, mission by mission) is generated by `npm run gen:dialogues-doc`; a test fails if it is stale.

## 8. Current project status (honest)

**Done ✅**
- English Bootcamp pilot, live and validated on a real device.
- The **Core 30** (5 phases, checkpoints at 10/18/24/30), all structurally tested — including turn-for-turn
  parity of every mission across English / French / Spanish (`core30.test.ts`).
- Mission Hub (Practice / Transcript / Video), always replayable.
- Transcript reader (bilingual, per-line replay, play-all).
- Video system (EN 1–3, 6–9, 14 and FR 1–3, 5, 6, 9, 14 shipped; graceful fallback for the rest).
- Victory Screen (confetti, watch-first reward order).
- Product IA: Home (coach) · Learn (30 missions) · Listen (passive) · Profile (settings), with an
  intentional desktop layout (side rail, wide browse pages, narrow lesson column).
- Travel Readiness derived from real mission completion; Quick Review from the real review log.
- **Zero Start ("מתחילים מאפס")** guided zero-beginner path — built, routed, tested (validation +
  progress + store + Foundation-sync). User-facing for the active learning language; graduates into the
  first real Bootcamp mission.
- Offline/PWA (local-first, IndexedDB, runtime-cached video).
- Chrome + Safari speech stability (keep-alive + visibility resume + gesture unlock).
- Concept Layer, content Pipeline, and MongoDB server exist and are green.
- Smart translation rule (real-world names) documented and applied.
- Full docs set + auto-generated conversations file.

**In progress / next 🚧**
- **Core Corpus (Core 633) shipped** ✅ — 633 concept-first entries (two-sided comm/recog scoring,
  RoF, layers, 25 categories) through the real pipeline (concepts → Mongo seed → per-language
  offline packs), powering live Core Words + Picture Quiz + Swipe Recall. **Adding a language is
  content-only** (proven by test). Next: native Hebrew review, per-word audio, French pilot
  realizations, and expansion 500 → 1500 (see CORE-CORPUS.md).
- **English Core content pack** (so Phrases/Situations light up instead of "coming soon").
- **Native (Hebrew) content review** — all mission content is AI-drafted, pending a native pass.
- **Zero Start content native review** — the EN/FR/ES Zero Start chunks/sentences are **AI-authored
  and user-facing, but NOT yet natively reviewed** (no native speaker has proofed the French or Spanish
  phrasing/politeness). Same status as the Bootcamp content: shipped as pilot/Early-Access quality,
  pending a native pass. Do not describe FR/ES Zero Start as native-reviewed.
- **Core review engine** — spaced/weak-word review over Bootcamp sentences (currently browsable only).
- **More mission videos** (EN 1–3, 6–9, 14 and FR 1–3, 5, 6, 9, 14 shipped; remaining missions pending).
- **Auth + sync** (Google sign-in) and per-user server-side settings/statistics.
- **Future languages** (Italian/Spanish/French/Arabic) — infrastructure exists; not user-facing yet.

**Active trip languages**
- **English** (full pilot), **French** (Early Access, AI-drafted) and **Spanish** (`es-ES`, full 30/30
  Bootcamp + Core 633 + Foundation examples, Early Access / AI-drafted, pending native review) are all
  selectable and fully usable. Italian/Arabic and the rest remain honest "coming soon" until their
  reviewed content ships. Adding a learning language stays content-only (registry + mission set + a
  Core pilot pack) — proven again by the Spanish integration.
- **Zero Start availability:** the path ships content for **EN / FR / ES** and is user-facing whenever
  one of those is the active language (parity verified by test: every chunk realizes in all three, and
  every referenced Foundation concept id exists in all three packs). That content is **AI-authored and
  not yet natively reviewed** — it inherits each language's status (EN pilot; FR/ES Early Access), and
  FR/ES Zero Start must not be described as shipped-native or review-complete.

## 9. Development rules (never break)

- **Never bypass the pipeline / hardcode content-pack material.** Content packs come from `content/`.
- **Never duplicate business meaning.** One source of truth per concept (navigation, speed, theme,
  progress). No parallel copies of the same state or setting.
- **Never hardcode language assumptions.** Default/trip language flows from the language registry;
  keep the **English pilot honest** (others "coming soon" unless real content exists).
- **Keep offline working.** Local-first; never make first load depend on the network or a video.
- **Keep mobile-first** and **keep RTL working** (English + Hebrew, mirrored correctly).
- **Never fake native review.** Target-language/Hebrew content is AI-drafted until a native signs off.
- **Never optimize for features over learning.** If a change helps engineering but hurts confidence,
  confidence wins. No meaningless gamification.
- **Do not redesign** Bootcamp pedagogy, the learning engine, the content model, Mongo, the Concept
  Layer, the pipeline, or the review engine as a side effect of UX work.
- **Verify every change:** `typecheck → lint → test → build → smoke` must stay green.

## 10. Project roadmap

**Short term** — native Hebrew review of all mission content; ship the English Core content pack to
un-gate Words/Phrases/Situations; add the Core spaced-review engine; more mission videos.

**Medium term** — Google auth + cross-device sync; per-user settings/statistics server-side; a
lightweight content editor so non-engineers can review/approve missions; richer wrong-answer
explanations; system-preference dark mode.

**Long term** — additional trip languages (turn on the existing multilingual infrastructure once
real, reviewed content exists per language); expanded situation coverage beyond the core 10;
adaptive scheduling tuned to the individual learner and trip date.

## 11. Quick start for new developers

Read, in this order, then start coding:

1. **READY_MASTER_OVERVIEW.md** (this file) — the whole picture.
2. **[READY_PROJECT_STRUCTURE.md](./READY_PROJECT_STRUCTURE.md)** — product rules + app/architecture detail.
3. **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)** — the actual mission content (auto-generated).
4. **[DATABASE.md](./DATABASE.md)** — data + persistence model.
5. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — engineering deep-dive.
6. **[STATUS.md](./STATUS.md)** — build report + what's done.

Verify locally with `npm run verify` (typecheck → lint → test → build), plus `npm run smoke`.

## 12. Living document

This document is the single source of truth for **understanding** READY. Whenever the product
philosophy, architecture, navigation, learning flow, or project status changes, **update this file
in the same sprint.** When Bootcamp content changes, also regenerate the conversations doc:

```
npm run gen:conversations
npm run gen:dialogues-doc
```
