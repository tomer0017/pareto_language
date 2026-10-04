# READY — Language Companion System

Source of truth for the mascot: what it means, how it grows, where it may appear, and how it is built.
Code: `apps/web/src/features/companion/`. Art: `apps/web/public/companion/`.

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

| Surface | Status | Notes |
|---|---|---|
| Path (מסלול) | built | A card under Trip Readiness: avatar, stage name, thin bar. Opens the page. Readiness stays the authoritative number. |
| Companion page — "החבר שלי לשפה" | built | Large character, stage, what it means, what it can say, next-stage silhouette and progress, the six-stage track, why it changes. |
| Mission complete | built | One small celebrating reaction with one short line on the victory screen. |
| Evolution | built | Full screen, once per stage: old character → anticipation → transformation → reveal → what changed → Continue. Tap to skip the build-up. |
| Reusable reaction | built | `CompanionReaction` — `correct`, `encouraging`, `thinking`, `recovery`, `celebrate`, `missionComplete`. |
| Mission intro, correct / wrong answer, recovery success | **not placed yet** | The reaction component supports them; they are not inserted into Practice screens in V1. |

Rules: it does not occupy the screen permanently; it never delays starting a mission; no large
animation after every answer; if character and learning content compete, learning content wins.
The Chatterbox's full living-room scene is for the page, the reveal and celebrations — ordinary UI
uses the simplified head-and-phone avatar.

## 7. Animation

States (`CompanionAnimation`): `idle` `listening` `thinking` `correct` `encouraging` `celebrate`
`missionComplete` `levelUp` `rest` `attention`; Stages 4–5 add `talking` `laughing`; Stage 6 adds
`phone` `music` `watchingTV`. A state a stage does not have falls back to `idle`.

Motion vocabulary by family (`motionFamily`): fish drift; the parrotfish drifts with a beak; parrots
breathe, hop and chat. Animations last about 0.5–2 seconds; idle is barely visible.

V1 animates the still artwork with CSS transforms. There are no drawn frames yet (no fin, wing or
beak animation). `prefers-reduced-motion` turns every animation off, and the evolution skips its
sequence and simply shows the new stage.

## 8. Assets

One table names all artwork: `companionAssets.ts` (`COMPANION_ART`). Screens ask for a stage and a
variant (`full` / `compact`), never for a file.

- `public/companion/stage-<n>.png` — the full character.
- `public/companion/stage-6-avatar.png` — the compact Chatterbox.

**Current art is a stand-in:** square crops of the approved concept sheet. They include a little of
the sheet's scenery (bubbles, plants, fragments of arrows), softened by an edge mask. Replacing them
with clean transparent renders — or with sprite sheets / Lottie / Rive — means editing this table and,
for animated formats, `CompanionAvatar`. No screen or logic changes.

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
| `Companion.tsx` | `CompanionAvatar`, `CompanionReaction`, `CompanionCard`, `CompanionPage`, `CompanionEvolution`, `CompanionHost` — each a pure view plus a thin connected wrapper. |
| `companion.css` | Self-contained styles and motion. |

Hooks into the rest of the app: a `companion` view (`appStore`, `nav.ts`, `App.tsx`), the host mounted
once in the shell, one card in `Learn.tsx`, one line in the victory screen.

## 11. Extending it

- **A new source of growth:** call `useCompanionStore.getState().record(lang, [{ kind, key }])` with a
  stable, unique key. Add a kind and its points in `companionModel.ts` if none fits.
- **A new surface:** render `<CompanionReaction kind="…" />`.
- **New art or real animation:** `companionAssets.ts` (and `CompanionAvatar` for animated formats).
- **Re-tuning:** change `GROWTH_POINTS` / `STAGE_THRESHOLDS`. Stored stages stand.
- **Sharing:** not built. The page is the natural place for it.
