# READY — Language Companion System

Source of truth for the mascot: what it means, how it grows, where it may appear, and how it is built.
Code: `apps/web/src/features/companion/`. Art: `apps/web/public/companion/`.

> **PRODUCT RULE — the evolution is a discovery (2026-10-04).** The learner has ONE living buddy.
> They are never told it has stages, how many, what they are called, what it will become, or when.
> No screen shows a stage name, "X of 6", a threshold, a progress bar toward the next form, or the
> artwork / silhouette of a form not yet reached. On screen the character is only "החבר שלך" /
> "your buddy" (+ the language). Its state is SHOWN (pose, motion), never labelled. The six stages,
> their names and the thresholds below are **internal** — for this document, the model and tests.
> A test (`companion.test.ts`, "PRODUCT RULE") renders every surface at every stage in both app
> languages and fails if any of this leaks.

## 1. The metaphor

A fish cannot speak. A beginner cannot speak the new language. As the learner understands and
communicates more, the fish becomes a parrot — and eventually a chatterbox.

The companion is not decoration. It shows **how alive this language is inside the learner**.

It is a separate idea from Trip Readiness and the two are never merged:

| | Question it answers | How it is computed |
|---|---|---|
| Trip Readiness | "How prepared am I for my trip?" | completed missions ÷ missions in the plan |
| Companion | "How far has this language come alive for me?" | cumulative growth points; never a share of a course |

## 2. The six stages

| # | Name | Hebrew | The learner's state | What the companion can say itself |
|---|---|---|---|---|
| 1 | Scared Fish | דג מבוהל | "I don't understand anything yet." | Nothing — bubbles, `? ? ?` |
| 2 | Focused Fish | דג מרוכז | "I'm starting to recognize what I hear." | Nothing — it listens (`👂 …`) |
| 3 | Parrotfish | דג תוכי | "Sounds are becoming words." | Babble (`b… b…`) or ONE learned word |
| 4 | Young Parrot | תוכי צעיר | "I can form useful language." | A very short learned phrase |
| 5 | Talking Parrot | תוכי מדבר | "I can handle conversations." | A short learned sentence |
| 6 | Chatterbox | פטפטן | "Language is happening around me and I can handle it." | Free, expressive speech |

The Parrotfish is the deliberate bridge: a real parrotfish, with a beak. The Chatterbox is
deliberately over the top — phone, headphones, TV, popcorn. It is the reward to look forward to.

Visual DNA kept across all six: the eyes, the blue-and-yellow tropical palette, the expressive
mouth/beak, and a silhouette that changes gradually.

## 3. Personality

A travel buddy learning the language alongside you: warm, clever, curious, playful, slightly
mischievous, supportive, confident without arrogance.

It is **not** a teacher, a baby mascot, a nagging streak character or a punishment mechanism.
It never cries, looks disappointed, shames the learner or loses progress. A wrong answer gets a
thinking face and encouragement. Using a conversation-help tool ("Can you repeat that?") is
celebrated — in READY recovery is a win.

## 4. Progression

Per **learning language**. English, Spanish and French each have their own companion.

- **Cumulative.** Meaningful events add growth points. Each event has a unique key and counts once.
- **Monotonic.** The stage is the highest ever reached and is stored. Re-tuning the rules or adding
  content cannot lower it.
- **No denominator.** Nothing divides by the number of missions, so adding missions cannot move anyone back.

Events and points (`GROWTH_POINTS`):

| Event | Points | Produced today |
|---|---|---|
| `missionCompleted` | 10 | yes |
| `checkpointCompleted` | 20 | yes |
| `storyCompleted` | 8 | not yet |
| `listeningMastered` | 6 | not yet |
| `reviewMastered` | 6 | not yet |
| `conversationCompleted` | 12 | not yet |

Points needed to reach each stage (`STAGE_THRESHOLDS`): **0 · 20 · 70 · 150 · 300 · 600**.

In terms of today's Core (26 missions + 4 checkpoints = 340 points):

| Stage | Reached at about |
|---|---|
| 2 Focused Fish | 2 missions |
| 3 Parrotfish | 7 missions |
| 4 Young Parrot | Mission 14 |
| 5 Talking Parrot | Mission 27 |
| 6 Chatterbox | **not reachable from the Core alone** — 600 points |

The Chatterbox is intentionally beyond the current Core: it needs continued use once other growth
sources exist. Until one of them is connected, no learner can reach Stage 6. The thresholds are
tunable; because the stage is stored, tuning them never demotes anyone.

## 5. Speech — it learns to speak with the learner

The companion never introduces target-language material the curriculum has not taught. Its lines are either:

- **app language** (Hebrew / English) — guidance, captions, celebration; or
- **target language already learned** — taken only from missions the learner has *completed* in that
  language: primed words (Stage 3) and learner sentences (Stage 4+). Toolkit phrases are excluded.

If nothing suitable has been learned, it says nothing in the target language.
Target-language lines render left-to-right inside a Hebrew screen.

## 6. Where it appears

The same character — the active language's current one — everywhere. Never in a circle or a frame.

| Surface | Notes |
|---|---|
| Home | `CompanionPeek`: the buddy peeks over the "next step" card. No line, no card of its own. Opens its page. |
| Route (מסלול) | `CompanionPresence`: the character floating beside the path with ONE contextual line (new learner / mission in progress / next mission waiting / all done) and "your {language} buddy". No name, no number, no bar. Trip Readiness is unchanged. Opens its page. |
| Its own page | A character page: the character large, what it "says" (symbols, or a learned line), ONE line about how it behaves right now, the last missions you did together, and "the more you understand and speak, the more it changes". Close to a change it glows and says only "something is changing…". No track, no next form, no percentage. |
| Mission intro | `CompanionIntro`: on a mission's existing first intro screen — the goal in a bubble, a larger pose, and the mission's icon beside it as the thing it is looking at. Themed poses can replace the icon later. |
| First time a game appears | `CompanionCoach`: character + one instruction in a bubble. |
| Beside a game | `CompanionWatch`: it listens next to Quick Reply and the Mini Map (hidden when it is already explaining the game). |
| An answer | `CompanionReaction` on the answer card, beside the verdict: right → a short happy gesture with bubbles / a sparkle; not quite → a tilted head and "Hmm… one more go?"; a conversation-help tool as the winning move → a hop, a sparkle and "Exactly. That is the smart move". |
| Mission complete | The buddy, large, celebrating, with one line — it replaces the 🎉. |
| The change | Full screen, once: the character pauses, light gathers, a different creature is there. Text: "Wait… something changed!" / "Your buddy changed with you ✨". Nothing is named or numbered. Tap to skip the build-up. |

Bubbles: a creature that cannot talk yet (internal stages 1–3) THINKS an app-language line (thought
bubble); one that talks says it. App-language lines never contain target-language text.

Rules: it does not occupy the screen permanently; it never delays starting a mission; an ordinary
reaction lasts well under a second; it is never interactive on an answer screen (`pointer-events:
none`); it awards nothing and changes no state; if character and learning content compete, learning
content wins.

## 7. Moods and motion

Screens ask for a **mood** (`companionMood.ts`), never an animation: `idle` `resting` `attentive`
`listening` `curious` `thinking` `happy` `proud` `encouraging` `surprised` `celebrating` `recovery`
`missionComplete`, and for talking stages `talking` `laughing` `excited` `confident` (an earlier
stage shows the nearest quiet mood). There is no negative mood. A mood picks a pose (when the art
has one), a motion and a small effect — bubbles for a fish, a sparkle for a bird, always a sparkle
for a recovery win. The mood name is never written on screen.

Idle is calm and continuous (a fish drifts, a bird breathes); a reaction is one short gesture
(0.5–0.9s); only the change is long. Motion is CSS on still artwork — no drawn frames yet.
`prefers-reduced-motion` switches every animation and effect off, and the change simply shows the
new look.

## 8. Assets

One table names all artwork: `companionAssets.ts` (`COMPANION_ART`). The figure asks for a stage, a
variant (`full` / `compact`) and a **pose** (`idle` `happy` `thinking` `listening` `celebrate`
`encouraging` `talking`) — never for a file. A pose with no image of its own falls back to the
stage image, so poses can be added one at a time (`poses: { happy: { compact: '…' } }`).

- `public/companion/stage-<n>.png` — the full character.
- `public/companion/stage-6-avatar.png` — the compact Chatterbox.

**Current art is a stand-in:** square crops of the approved concept sheet. They include a little of
the sheet's scenery (bubbles, plants, fragments of arrows), softened by an edge mask. Replacing them
with clean transparent renders — or with sprite sheets / Lottie / Rive — means editing this table and,
for animated formats, `CompanionFigure`. No screen or logic changes. Because the stand-ins are not
transparent, the figure feathers their edges into the page; an entry marked `transparent: true` is
shown with no feathering. The crop style is not baked into any screen.

## 9. Persistence and migration

`localStorage`, key `ready.companion.v1`, one record per learning language:

```json
{ "en": { "points": 70, "counted": ["mission:taxi", "…"], "stage": 3, "seenStage": 2 }, "es": { "…": "…" } }
```

- `stage` — highest stage reached. `seenStage` — last stage whose evolution was shown.
  `stage > seenStage` means an evolution is owed; acknowledging it is saved, so a reload never replays it.
- Mission progress (`ready.bootcamp.v2.<lang>`) is read, never written.

**Migration rule.** The first time a language is seen, its record is derived from the missions already
completed in that language, and marked as already seen. An existing learner opens the app at the stage
their history earned, with no backlog of evolution screens. Only growth from then on is celebrated.

Damaged or old data is sanitised, never thrown on; a stage is never read as lower than its points are worth.

## 10. Architecture

| File | Role |
|---|---|
| `companionModel.ts` | Pure rules: stages, events, points, thresholds, monotonic `applyEvents`, migration, sanitising, animation states, evolution timeline, speech rules. |
| `companionStore.ts` | Zustand store + persistence. **Listens** to the Bootcamp store and the learning language; mission code never calls it. `record()` is the entry for other sources. |
| `companionLearned.ts` | Read-only: what completed missions taught (the only target language the companion may say). |
| `companionAssets.ts` | The artwork table. |
| `companionCopy.ts` | All app-language copy, inside the feature. |
| `companionMood.ts` | Moods → animation, pose, effect (pure). |
| `companionCoach.ts` | What the buddy says in the app language: mission intro lines, game instructions, its line on the Route (pure). |
| `Companion.tsx` | `CompanionFigure`, `CompanionReaction`, `CompanionWatch`, `CompanionCoach`, `CompanionIntro`, `CompanionPresence`, `CompanionPeek`, `CompanionPage`, `CompanionEvolution`, `CompanionHost` — each a pure view plus a thin connected wrapper. |
| `companion.css` | Self-contained styles and motion. |

Hooks into the rest of the app: a `companion` view (`appStore`, `nav.ts`, `App.tsx`), the host mounted
once in the shell, the presence in `Learn.tsx`, the peek in `Home.tsx`, and the intro / coach /
reactions in `Bootcamp.tsx` and `PracticeSteps.tsx`. Screens outside the feature never draw the
character themselves or choose a stage (tested).

## 11. Extending it

- **A new source of growth:** call `useCompanionStore.getState().record(lang, [{ kind, key }])` with a
  stable, unique key. Add a kind and its points in `companionModel.ts` if none fits.
- **A new surface:** render `<CompanionReaction kind="…" />`.
- **New art or real animation:** `companionAssets.ts` (and `CompanionFigure` for animated formats).
- **Anything new on screen:** it must pass the no-spoiler test — no stage name, count, threshold or future form.
- **Re-tuning:** change `GROWTH_POINTS` / `STAGE_THRESHOLDS`. Stored stages stand.
- **Sharing:** not built. The page is the natural place for it.
