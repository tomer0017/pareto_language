# READY Database Reference (Sprint 4)

Production database architecture. Reference documentation — kept current with the code;
the models in `server/src/models/` are the source of truth for field-level detail.

## Collections & relationships

```
CORPUS PLANE                     CONTENT PLANE (per language)        EVIDENCE PLANE (per user)
concepts ──realizes──▶ words / phrases / situations          users
   │                        │            │                   reviewEvents  (append-only TRUTH)
   │ (conceptId backrefs)   └─ contentPacks.payload ─▶ PWA   memoryStates  (projection)
   └─ scorecards live here      (canonical engine pack)      practiceSessions · sessionLogs
                                                              tripPlans · receipts (projection)
```

| Collection | Plane | Key fields | Indexes |
|---|---|---|---|
| `concepts` | corpus | `_id` = concept id, gloss (LocalizedText), kind, layer, rof, skillTarget, realizations{lang}, rolScore, neverTeach, changelog | kind+layer, situationSlugs, neverTeach |
| `words` / `phrases` | content | `_id` = `{lang}.{kind}.{slug}`, text, translations (LocalizedText), tier, `conceptId?`, `quality`, `rolScore?`, source, changelog | languageCode+word/situationSlug, languageCode+tags, conceptId |
| `situations` | content | `_id`, slug, languageCode, title (LocalizedText), phraseIds | unique (languageCode, slug) |
| `contentPacks` | content | `_id`=lang, status (active/coming_soon/draft), version, counts, validated, `qualityHistogram`, `gateReport`, payload (active only) | unique languageCode |
| `users` | identity | identities[] (anonymous/google; enum-extensible — new provider = new enum value, never a new collection) | identities.provider+subject |
| `reviewEvents` | evidence | `_id` = client UUID (idempotent), mode, outcome, latency, cold? | (userId, at), (userId, itemId, at) |
| `memoryStates` | projection | engine-projected; rebuildable | unique (userId,itemId), (userId,lifecycle) |
| `practiceSessions`/`sessionLogs`/`tripPlans` | telemetry/orchestration | as built (M3/M6) | userId+startedAt |

## Localization & translation storage
One rule everywhere: human-readable = `LocalizedText` (lang→string map, `en` pivot required,
fallback uiLang→en→any). Meanings are stored **once, on the concept**; per-language item
`translations` are *derived* copies for query convenience and always regenerable. Adding a UI
language = adding map entries; adding a learning language = adding realizations. No schema
change in either direction — this is the acceptance criterion made structural.

## Audio strategy
`AudioRef { natural, slow?, source: 'tts' | 'human' }`, path convention
`audio/{lang}/{itemId}.mp3`. Moments/phrases/replies: pre-generated neural TTS at pack build
(two speeds for hear-items); recognition words: runtime TTS until promoted; human recordings
replace files per item with zero schema change.

## Examples
Word examples are quoted from Core scripts (`example: { text, translations }` on the item;
sourced, never invented in isolation). Phrase example-of-use lives in the concept notes; the
script IS the canonical example.

## Quality workflow & versioning
`quality: draft → ai_generated → ai_reviewed → native_reviewed → expert_approved → verified`
per item AND per realization. Gates: `say` phrases + moment scripts need `native_reviewed`
for active packs; `ai_reviewed` suffices for beta hear/words (banner). Every content write
appends to `changelog[] { at, actor, action, note }`. Two user flags auto-demote to
`ai_reviewed`. Pack semver: patch = fixes, minor = additions, major = deprecations; ids are
never reused. `contentPacks.qualityHistogram` + `gateReport` make activation eligibility a
computed fact, not an opinion (currently advisory for the legacy it pack; enforcing for new packs).

## Migration strategy
Content: additive fields with defaults + one-shot transforms under `server/src/seed/`
(seeds are idempotent upserts — reseeding IS the migration path, proven in M6/Epic 1).
Evidence: never migrated — re-projected by the shared engine. Concepts backfill: existing
items link via `conceptId` lazily; nothing breaks while unlinked (optional by design).

## Future extensibility
New language → concepts gain realizations, pipeline emits pack, contentPacks row flips.
New content type (Moment docs — Epic 1 T3, pending) → new collection + pack field, additive.
New auth provider → identity enum value. New engine → re-project. Nothing here requires
redesign for German/Japanese/Thai: script/translit already modeled, RTL proven, register
noted per realization.
