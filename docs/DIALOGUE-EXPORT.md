# READY — Dialogue Export Tool (dev)

A permanent **developer** tool that exports every Bootcamp mission's main conversation as a clean
cinematic screenplay — for AI video/voice (Veo, Kling, Runway, ElevenLabs…), subtitles, QA and
marketing. **Not** part of the learner experience. It exports only the successful conversation: no
recovery detours, wrong answers, quizzes, ambushes, coaching, ids or metadata.

## Where it lives

- **Pure logic (typechecked + tested):** `apps/web/src/features/bootcamp/exportDialogue.ts`
  (`cinematicTranscript`, `renderLine`, `renderMissionScript`, `exportMissions`, `renderAll`,
  `exportableLanguages`). Tests: `exportDialogue.test.ts`.
- **CLI wrapper (fs + args):** `scripts/export-dialogues.ts` → `npm run export:dialogues`.

It reuses the existing multilingual seams — the language-aware mission registry (`missionsFor`), the
`tr:{en,he,…}` glosses, and a cinematic variant of the happy-path linearizer — so it is fully
language-agnostic.

## How to run

```bash
npm run export:dialogues                       # every language that has built missions
npm run export:dialogues -- --all              # (same as no args)
npm run export:dialogues -- --lang=fr          # only French
npm run export:dialogues -- --lang=en --mission=5   # English, mission (day) 5 only
```

| Flag | Meaning |
|---|---|
| _(none)_ / `--all` | Export every language with ≥1 built mission. |
| `--lang=<code>` | Only that learning language (`en`, `fr`, `es`, `ar`, …). |
| `--mission=<n>` | Only mission **day number** `n` (writes that file; `ALL_DIALOGUES.md` still holds every mission). |

## Output structure

```
exports/dialogues/<lang>/mission-NN.md   # one per built mission (day number, zero-padded)
exports/dialogues/<lang>/ALL_DIALOGUES.md # every mission concatenated (always the full set)
```

`exports/` is git-ignored (generated; regenerate any time). Each `mission-NN.md`:

```
# Mission 03 — Numbers & Money

## Scene

👤 NPC

Cinq euros la barquette, ou deux pour huit !

Five euros a punnet, or two for eight!

חמישה יורו קופסה, או שתיים בשמונה!

---

🧑 You

Une barquette, s’il vous plaît.

One punnet, please.

קופסה אחת, בבקשה.
```

Per line: the **learning language** (spoken), then the **English** and **Hebrew** glosses. When the
learning language IS English, the identical English gloss is de-duplicated (spoken line + Hebrew only).

## What's exported vs excluded

- **Exported:** the cinematic happy path — NPC ↔ You, taking the **direct** correct answer at each
  turn (a correct *recovery tool* like "please speak slowly" is skipped in favor of the direct reply).
- **Excluded:** wrong answers, recovery/retry beats, coaching, quizzes, ambushes, hints, ids, scores,
  review/game metadata. No tables, no JSON.

## Future-proofing / extension rules

- **New learning language:** appears automatically once it has built missions — **no tool change**.
- **New app-language gloss** (e.g. Spanish UI): add its code to `GLOSS_LANGS` in `exportDialogue.ts`
  (it already resolves from the same `tr` map) — no redesign.
- Speaker names are generic (`👤 NPC` / `🧑 You`) because the dialogue model stores `who`, not a
  character name. If named speakers are ever needed, add an optional name to the dialogue node — the
  renderer is the only place to touch.

## Validation

`exportDialogue.test.ts` asserts: every built mission exports; the cinematic path takes direct answers
and contains no recovery/wrong-answer lines; no ids/metadata/tables; French spoken lines are French
(no English leak as the primary line); English glosses aren't duplicated. Run `npm run test`.
