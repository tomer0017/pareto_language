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
  Mission 1 is built entirely around this idea.
- **Understanding replies > perfect grammar.** Recognizing the barista's follow-up question matters
  more than a flawless sentence. Real conversations are survived by comprehension + recovery.
- **Every learning minute must justify itself.** No filler, no vanity metrics, no busywork. If a
  screen doesn't move the learner toward handling a real moment, it is cut.

## 4. Learning architecture (the flow)

```
Home → Bootcamp (30 missions) → Mission Hub → Video → Practice → Transcript → Victory → Next Mission
```

- **Home** — orientation. One glance answers "where am I, what's the one thing to do next?" A single
  Continue action removes decision friction (20/80).
- **Bootcamp** — the heart: 30 real-world missions across 5 phases (Foundations → Arrival → Food →
  City Life → Mastery). Depth before breadth — one situation, taken all the way, per mission.
- **Mission Hub** — the home of each mission. Exactly three always-available modes: **Practice**,
  **Transcript**, **Video**. Completing a mission never removes access; it becomes "Practice again."
- **Video** — watch the full conversation **before** learning and understand almost nothing. This
  sets up the emotional payoff. (Only Mission 2 has a video today; others show "Coming soon.")
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

Permanent bottom navigation (English pilot): **Home · Bootcamp · Core · Profile**. The nav is
hidden only inside an active mission — a focused, full-screen flow with its own controls.

- **Home** — mission overview: a Continue hero (resume → next → replay), a progress bar, and a path
  to the full mission map. No dashboards.
- **Bootcamp** — a 29-mission numbered journey in 5 phases (beginning with Introduce Myself);
  checkpoints are cold integration days. The **Recovery Toolkit** (the 7 survival tools, formerly
  "Mission 1") is now an optional, unnumbered **special mission** at the end of the map — content
  unchanged, placement/presentation only (pilot testers skipped it as a "broken" first mission
  because its answers are escape tools, not answers to the conversation).
- **Core (a.k.a. "Core 1500")** — the practical communication engine, presented as a tabbed
  **knowledge center**: **Core Phrases** is live (every sentence READY teaches, grouped by mission,
  tap to hear); Core Words · Core Patterns · Common Questions · Emergency · Favorites are honest
  "coming soon" scaffolding. *Not* "1500 words" — the real phrases a traveler says and hears.
  Spaced/weak-word review is planned (currently a browsable, audio-enabled deck).
- **Profile / Settings** — everything personal in one place: **Learning Preferences** (the single
  global **speech-speed** control, 80–105%, default 95%, with Test Voice), language (trip = English
  pilot; app = English/Hebrew), appearance (light/dark), audio (enable/test sound), and honest
  disabled "coming soon" rows (Google sign-in, statistics, notifications).
- **Mission Hub** — three always-available modes for a mission (Practice / Transcript / Video).
- **Video** — full-conversation player: manual play (no autoplay with sound), inline on iOS,
  replayable, fullscreen; degrades gracefully if the file is missing.
- **Transcript** — bilingual reader: every line, both languages, per-line replay, play-all / pause /
  restart / prev / next, current line highlighted.
- **Practice** — the Bootcamp step-flow (talk → tools → expected-reply drills → quizzes → dialogue →
  sentence review → cold open → victory). Unlimited repeats; never "finished."
- **Victory Screen** — the celebratory completion screen; primary action is Watch Full Conversation.
- **Bottom Navigation** — the permanent, native, RTL-aware pill: Home / Bootcamp / Core / Profile.

## 6. Technical architecture

Each layer has one responsibility.

- **React (`apps/web`)** — the UI. Vite + React 18, mobile-first, RTL-aware, PWA. Screens under
  `src/features/*`; shared UI/audio/i18n/stores under `src/shared/*`; app shell in `src/app/`.
- **TypeScript** — strict, end to end (project references across packages). The content model and
  every entity are typed and shared.
- **Zustand (state)** — `shared/stores/appStore.ts` (routing/`view`, user, content pack, `theme`,
  `uiLang`, `learningLang`), `features/bootcamp/bootcampStore.ts` (active mission, hub/play `stage`,
  progress + receipts in **localStorage**), `shared/stores/sessionStore.ts`. Single sources of
  truth — no duplicated navigation, settings, or state.
- **Content Schema (`packages/content-schema`)** — zod-typed `ContentPack` / `ContentItem` /
  `Situation` / memory + review types, shared by web, server, engine, and the pipeline.
- **Concept Layer + Pipeline (`content/`)** — the corpus → concepts → phrases → validated-pack
  toolchain (`content/pipeline`, `content/build.ts`, `content/concepts`, `content/core-en`).
  It currently builds the **Italian `it-IT` pack** into `apps/web/public/content/`. **Important
  nuance:** the Bootcamp (the actual pilot) is *decoupled* from this — Bootcamp missions are pure
  TypeScript data files, not pipeline output. The pipeline feeds the content-pack app
  (Words/Phrases/Situations), which is currently gated in the English pilot.
- **MongoDB (`server/`)** — the API + seeders (`contentApi`, `seeders`). **Optional** for the pilot:
  the web app is local-first and the Bootcamp needs no server. `ApiProvider` is used only when
  `VITE_API_BASE` is set (server pack → IDB cache → static fallback + background sync).
- **Offline / PWA** — `vite-plugin-pwa` precaches the app shell + content JSON; `LocalProvider`
  (IndexedDB, via `@ready/data`) stores users/plans/events/packs and projects memory state offline.
  Videos are **runtime-cached** (not precached — too large) so first load never waits on them.
- **Videos (`apps/web/public/videos`)** — referenced by a mission's optional `introVideo.src` (a
  public path resolved against `BASE_URL`). Only Mission 2 (`En_day2.mp4`) has one today.
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
- **Recovery Tools** — the shared 7-phrase survival kit (`en.phrase.recovery.*`, in `recovery.ts`),
  reused inside every mission so the safety net stays warm in context.
- **Dialogues** — branching trees (visual-novel, one line at a time). The **happy path** is the
  canonical conversation; wrong picks route to **recovery beats** and rejoin — never a dead end.
- **Moments** — a full situation taken end to end (greeting → order → follow-ups → pay → goodbye).
  A mission is one moment, deep.
- **Cold Opens (ambush)** — a fast, off-script sentence that trains "don't freeze, use a tool."
- **Missions** — pure-data files (`day1..30.ts`) combining items + dialogues + a step sequence,
  registered in `bootcampStore`. `plan.ts` holds the 30-mission metadata; `transcript.ts`
  linearizes a tree into its happy path; `types.ts` is the model.
- **Core 1500** — the practical-vocabulary surface: an aggregated, audio-enabled view of every
  phrase the missions teach (the "vocabulary engine"), with spaced review planned.

Human-review surface for all of the above: **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)**,
auto-generated from source by `npm run gen:conversations`.

## 8. Current project status (honest)

**Done ✅**
- English Bootcamp pilot, live and validated on a real device.
- 30 Bootcamp missions (5 phases, checkpoints at 10/18/24/30), all structurally tested.
- Mission Hub (Practice / Transcript / Video), always replayable.
- Transcript reader (bilingual, per-line replay, play-all).
- Video system (Mission 2 shipped; framework ready for the rest; graceful fallback).
- Victory Screen (confetti, watch-first reward order).
- Permanent bottom navigation; Home; Core phrase engine; Profile with global speech speed + dark mode.
- Offline/PWA (local-first, IndexedDB, runtime-cached video).
- Chrome + Safari speech stability (keep-alive + visibility resume + gesture unlock).
- Concept Layer, content Pipeline, and MongoDB server exist and are green.
- Smart translation rule (real-world names) documented and applied.
- Full docs set + auto-generated conversations file.

**In progress / next 🚧**
- **English Core content pack** (so Words/Phrases/Situations light up instead of "coming soon").
- **Native (Hebrew) content review** — all mission content is AI-drafted, pending a native pass.
- **Core review engine** — spaced/weak-word review over Bootcamp sentences (currently browsable only).
- **More mission videos** (only Mission 2 today).
- **Auth + sync** (Google sign-in) and per-user server-side settings/statistics.
- **Future languages** (Italian/Spanish/French/Arabic) — infrastructure exists; not user-facing yet.

**Explicitly not true yet ⚠️**
- Only the **Italian `it-IT`** content pack is actually built, and it is **not user-facing** in the
  pilot. English is the only active trip language. Other languages are honest "coming soon."

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
```
