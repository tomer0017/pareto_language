# READY — Multilingual Architecture (any-to-any)

> **Mandatory dev rule.** Before every multilingual change, verify the implementation works for an
> **arbitrary (app-language × learning-language) pair** and assumes neither English nor Hebrew.
> **After-sprint rule.** Any architectural or language-capability change must update this document
> and the parity status (`docs/FRENCH-PILOT.md`, `npm run parity`).

This document reflects the **actual implementation**, not an intended future design. Honest
subsystem status is in §11.

---

## 1. App language vs learning language (independent)

- **App language** (`appStore.uiLang`) — the language of the UI chrome, buttons, feedback and the
  learner-facing **gloss** (meaning). Shipped UI dictionaries: **en, he** (`shared/i18n/strings.ts`).
- **Learning language** (`appStore.learningLang`) — the target the learner studies. Shipped: **en**
  (full), **fr** (early access). `es/it/ar` are declared but not production.

They are stored and switched independently. Switching the **app** language never changes progress;
switching the **learning** language swaps to that language's isolated progress (§5).

## 2. Concept-first content (no language is the source of truth)

Identity is **language-independent**; each language has an independent **realization**. English is
**not** a translation bridge.

- **Words:** `concept.{kind}.{slug}` → `realizations: Record<lang, {text, quality, …}>`
  (`packages/content-schema`, `content/core-corpus`). Gloss/example are `LocalizedText`
  (`Record<string,string>`, open — adding a language never changes the schema).
- **Phrases / dialogue lines:** identity is the item/node id (`{lang}.{kind}.{slug}`), the spoken
  line is the realization, and the learner gloss is app-language-aware (`tr: LocalizedText` on
  dialogue nodes, `meaning: LocalizedText` on items). Bootcamp missions are per learning language
  (`missionsFor(lang)`), so a French dialogue is French — not an English sentence translated at
  runtime.

## 3. The any-to-any display rule (`shared/i18n/display.ts`)

`resolveDisplay(concept, appLang, learningLang)` is the single rule every surface follows:

```
primary  = realization[learningLang]                       (target content)
gloss    = gloss?[appLang] ?? realization[appLang]          (meaning = SAME concept in the app language)
audio    = TTS locale of the learning language              (languageTtsTag)
dir      = languageDirection(learningLang) / (appLang)      (resolved independently)
reviewId = concept id + learning language                   (identity ≠ display text)
```

Because the gloss is *the same concept realized in the app language*, **English is never a bridge**:
Arabic→Spanish shows the Spanish realization + the Arabic realization, and English is absent from the
visible flow. `englishLeak` is `true` iff a value had to fall back to English — the validator (§9)
fails on that for any pair a language claims ready.

Proven end-to-end in `shared/i18n/display.test.ts`: Arabic UI→Spanish, Spanish UI→French, RTL target
under LTR app, review isolation, leak detection, and "future language = data" (a `de` realization
resolves with zero engine change).

### 3a. The canonical component resolver (`resolveLearningItem`)

The app's content is already **target-resolved per language** (per-language Core packs + per-language
Bootcamp missions), so real components consume `resolveLearningItem(item, appLang, learningLang)` →
`LearningDisplayModel`:

```
{ contentId, primaryText, secondaryText, audioText, audioLang, ttsLocale,
  primaryDirection, secondaryDirection, reviewId, emoji }
```

A component never re-selects target text / gloss / TTS locale / direction / review id — it renders
the model and speaks `audioText` in `audioLang`. **Permanent rule:** *No learning-UI component may
independently select a target-language realization, app-language gloss, TTS locale or review-language
identity when the canonical resolver can provide it.*

**Adopted by** (real app, verified): Core Words (browse), Core Phrases. **Consume the primitives
directly** (learning-language `speak` + `L(meaning)` + item id as review id — equivalent policy,
migration to the model is cosmetic follow-up): Picture Quiz, Swipe Recall, and the Bootcamp drills
(`speakL`/`dialogueTr` already centralize learning-language audio + app-language gloss). **UI chrome
strings** (`Continue`, buttons) stay in the string dictionary — never the content resolver.

## 4. Language registry & capability model (`shared/i18n/languages.ts`)

One registry; product surfaces read **capabilities**, not scattered `available` checks:

- `capabilities(code)` → `{ learnable, earlyAccess, coreAvailable, bootcamp, appUi, nativeReviewed, dir, ttsTag }`.
- `languageDirection(code)` — RTL/LTR for **any** code (RTL is not Hebrew-only; Arabic target is RTL
  even under an LTR app). `languageTtsTag(code)` — audio locale, with a generated fallback so a new
  language still speaks plausibly.

## 5. Progress & review isolation

- Bootcamp progress: `localStorage['ready.bootcamp.v1.{learningLang}']` (per learning language;
  legacy English migrated once). App-language switch does **not** touch it; learning-language switch
  reloads that language's slice and drops any active mission (`bootcampStore.ts`).
- Review identity: `ReviewEvent.itemId = {learningLang}.{kind}.{slug}` — carries the learning
  language explicitly in the id (concept id is language-independent; the item id scopes it). So
  French and Spanish progress for the same concept are distinct and never merge.

## 6. TTS

Audio always resolves from the **active learning language** (`speak(text, learningLang)` /
`languageTtsTag`). No component hardcodes a locale (verified: no `speak(…, 'en')` in app code except
the audio self-test chrome). Replay after correct AND wrong answers uses the learning language
(`shared/ui/AnswerFeedback`).

## 7. Offline packs & pipeline

- Core packs are `core-{lang}.v1.json`, loaded by `loadCoreWords(lang)` (no manual language list).
- French ships via a curated **pilot-pack** path; a full language joins `DECLARED_LANGS` only when
  complete. Mongo stores `realizations` as `Mixed` — it preserves any language's realizations
  (never strips unknown languages). Seed is idempotent.

## 8. RTL / LTR

`languageDirection` resolves each side independently, so all four combinations are supported:
LTR app + LTR target, RTL app + LTR target (Hebrew UI → French), LTR app + RTL target (English UI →
Arabic), RTL app + RTL target. Proven in the display tests.

## 9. Validation & quality gates

- `assertPairsComplete(concepts, appLangs, learningLangs)` (`display.ts`) — fails loudly when an
  enabled pair is missing a realization (English-as-primary leak) or an app gloss (English-gloss
  leak). Distinguish **error** from **early-access limitation** and **pending native review** — the
  last is a content status, never structural completeness.
- Corpus/Bootcamp parity: `npm run parity` (`content/core-corpus/parity.ts`,
  `features/bootcamp/parity.ts`).

## 10. How to add …

- **A new app (UI) language:** add a `strings.ts` dictionary + `UI_LANGUAGES` entry (with `dir`);
  ensure content glosses cover it (validator). No screen changes.
- **A new learning language:** add its realizations (→ `core-{lang}.v1.json` via the pilot-pack
  path) + a `fr/`-style mission set + one `MISSIONS_BY_LANG` line + registry capability flags. No
  engine change. Run `npm run parity` to complete it. Flip `available` only when it passes.
- **Translations / Bootcamp missions:** content only — realizations + `tr` glosses. Ids stay stable
  when wording changes.

## 11. Honest subsystem status

| Subsystem | Status |
|---|---|
| App vs learning language (independent) | ✅ Fully language-agnostic |
| Words — concept-first, keyed realizations | ✅ |
| Phrases / dialogue — id identity, `tr` gloss, per-language missions | ✅ |
| `LocalizedText` (open map) + `resolveDisplay` any-to-any | ✅ |
| TTS resolution | ✅ |
| Progress & review isolation (by learning language) | ✅ |
| Language registry & capabilities | ✅ |
| RTL/LTR (independent per side) | ✅ |
| Offline packs / loader / Mongo realizations | ✅ |
| Validators (any-to-any completeness) | ✅ |
| **App-language coverage** — only **en/he** UI dictionaries + glosses ship | ⚠️ Partially generalized (model is any-to-any; production app languages are en/he) |
| **`en` required as LocalizedText pivot** | ⚠️ Deliberate safety fallback (realizations are independent; a fully English-free deployment could relax the schema) |
| Arabic/Spanish as **production** learning/app languages | ❌ Proof-only (fixtures/tests) — not shipped content |

## 12. Limits (honest)

The **model** is any-to-any and proven by tests. **Production** app languages remain en/he (no
es/ar UI dictionary or full gloss coverage ships), and production learning languages remain en (full)
+ fr (early access). Arabic→Spanish / Spanish→French are demonstrated as **architectural evidence**,
not launched languages. Adding them is now a measurable **content** project, not an engineering
rewrite.
