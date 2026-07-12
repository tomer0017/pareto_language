# READY — Text-to-Speech: research, architecture & QA

> Runtime, free, cross-device speech for learning content. This documents what was researched, the
> chosen architecture, the voice-resolver rules, the fallback ladder, browser risks, and — honestly —
> what cannot be guaranteed because the voices belong to the browser/OS.

## 1. Options investigated & decision

| Option | Free? | Offline? | Verdict |
|---|---|---|---|
| **Web Speech API (`speechSynthesis`) + OS voices** | ✅ | ✅ (local voices) | **Chosen** — the only free, no-account, no-server, cross-device runtime TTS. |
| Cloud TTS (ElevenLabs / OpenAI / Azure / Google / Polly) | ❌ paid/metered, needs key+account | ❌ | Rejected — violates free/local-first, exposes keys, server dependency. |
| Pre-generated MP3 per sentence | one-time cost | ✅ | Rejected as primary — READY synthesizes dynamic text; bulk assets don't scale to any-language content. (Asset-first playback remains supported for special cases via `playItem`.) |
| WASM neural TTS (e.g. Piper) in-browser | ✅ | ✅ | Rejected for now — multi-MB model per language breaks the light PWA install; revisit if quality demands it. |

**Decision:** Web Speech API with a **scored voice resolver** over the OS's installed voices, driven
by the language **registry** locale, with a documented fallback ladder and graceful failure.

Primary sources: MDN `SpeechSynthesis` / `SpeechSynthesisUtterance` / `getVoices()` / `voiceschanged`;
WHATWG/W3C Web Speech API notes; Chromium autoplay & speech-watchdog behavior; WebKit (Safari/iOS)
gesture-unlock behavior.

## 2. Key findings & how we handle them

- **Voices load asynchronously.** `getVoices()` is often empty on first call; `voiceschanged` fires
  later (and is unreliable on some engines). → We load eagerly at startup + on the unlock gesture,
  and provide a **bounded** `ensureVoices()` (≤1.2s, `voiceschanged` + short poll, never infinite)
  for non-gesture paths (Test Voice). The speak path always sets `utterance.lang` so the **language**
  is correct even if no explicit voice object resolved yet.
- **Autoplay policy (Chrome).** Programmatic `speak()` is blocked until the engine is unlocked inside
  a real user gesture. → First pointer/key/touch primes a silent utterance (`unlockAudio`). Deferring
  the first speak out of the gesture (e.g. `await` before speak) **breaks iOS** — so the speak path
  never awaits before speaking.
- **Chrome "works then stops".** An internal ~15s watchdog and tab-background auto-pause kill audio
  with no error. → `resume()` keep-alive interval while an utterance is live + `resume()` on
  `visibilitychange→visible`. Safari/Firefox ignore `resume()` on a running engine (harmless no-op).
- **Names are not portable.** `Samantha`, `Google US English`, `Thomas`, `Microsoft Aria` exist only
  on some OSes and can change across updates. → Names are only a **bonus** in scoring, never required.
- **Wrong-region/wrong-language voices.** A naive "any en-*" or the engine default can be `en-GB` or
  even another language. → The resolver disqualifies wrong languages and ranks exact locale first.
- **`onend`/`onerror` reliability.** Some engines never fire `onend`. → A length-scaled safety timer
  resolves the promise; `interrupted`/`canceled` errors are treated as a *supersede*, not a failure.

## 3. Voice resolver rules (`shared/audio/voiceResolver.ts`)

`resolveVoice(voices, profile)` scores every candidate and reports an explicit **match quality**;
highest score wins; ties → first (deterministic):

| Signal | Score | Match quality |
|---|---|---|
| Exact locale (`en-US` == `en-US`, case/underscore-normalized) | **+1000** | `exact-locale` |
| **Explicitly approved** fallback locale (ordered) | +500 − 10·index | `approved-fallback` |
| Same base language, **different / unapproved region** | +200 | `same-language-different-region` |
| Preferred voice name (bonus) | +100 | (bonus only) |
| Local (offline) voice | +40 | (bonus only) |
| Engine default | +10 | (bonus only) |
| **Wrong base language (not in profile bases)** | **disqualified (null)** | — |

**Regional accents are NOT equivalent.** `en-US ≠ en-GB`, `fr-FR ≠ fr-CA`, `es-ES ≠ es-MX`,
`pt-PT ≠ pt-BR`. Only locales **explicitly listed** in a profile's `fallbackLocales` earn
`approved-fallback` (native-accent acceptable). Any other same-language region is
`same-language-different-region` — selectable only as a **last resort** and surfaced as **degraded
accent** (`isNativeAccent()` is false; Profile shows "different regional accent"). Today profiles list
**only the region-neutral base tag** (`en`, `fr`, `es`, …) as approved — no specific regional variant
is approved. A preferred name never overrides a wrong locale; no correct-language voice → `null` (the
caller speaks the locale tag only, never a wrong language). Unit-tested in `voiceResolver.test.ts`.

## 4. Language profiles (`shared/audio/voiceProfiles.ts`)

Derived from the registry — **locale = `languageTtsTag(lang)`** (single source of truth) — plus
speech-only hints:

| Lang | Locale | Fallbacks | Test phrase |
|---|---|---|---|
| en | `en-US` | en-GB, en-AU | "Hello! I'd like a coffee, please." |
| fr | `fr-FR` | fr-CA | "Bonjour ! Je voudrais un café, s'il vous plaît." |
| it | `it-IT` | — | "Buongiorno! Vorrei un caffè, per favore." |
| es | `es-ES` | es-MX, es-419, es-US | "Hola. Quiero un café, por favor." |
| ar | `ar-SA` | — | "مرحبا! أريد قهوة من فضلك." |

## 5. Fallback ladder (per request) — with explicit match quality

1. `exact-locale` — exact locale voice.
2. `approved-fallback` — a locale explicitly approved in the profile (native-accent acceptable).
3. `same-language-different-region` — same language, unapproved region: **degraded, last resort**;
   used (better than silence) but reported as a different accent, never a native match.
4. `browser-managed` — no specific voice chosen; `utterance.lang` = target locale, the engine picks a
   correct-language voice.
5. `unavailable` — no correct-language voice / no engine: speak is skipped, UI stays usable, text
   remains, retry works after `voiceschanged`.

**Never** French text with an English voice (wrong base language is disqualified at step 0).

## 6. Playback lifecycle & the outcome model

`speak()` returns `Promise<SpeakResult>` = `ended | interrupted | error | unavailable`. A new speak
cancels the in-flight one (which settles `interrupted`). Chained actions — dialogue auto-advance,
Transcript **Play-All**, scripted you-lines, listening reveal — proceed **only on `ended`**, so a
cancelled/superseded utterance never advances the UI or double-fires. `activeUtterance` identity +
`runToken` guard against stale callbacks and rapid taps; `cancelSpeech()` clears state on unmount/nav.

## 7. Global speech speed

One source of truth (`getSpeechRate`/`setSpeechRate`, 0.80–1.05, default 0.95, persisted). Effective
rate = per-call rate × profile.defaultRate × global, clamped to [0.5, 1.5]. No screen sets its own
speed; pitch is never altered to fake slowness; Test Voice uses the same rate as missions.

## 8. Browser-specific handling — implemented from documentation, NOT device-validated

> **Honesty:** the mitigations below are implemented in code **based on browser/OS documentation and
> known behavior**. They have **not** been validated on the physical platforms in this environment.
> "Implemented" ≠ "verified on device" — see the validation-status table in §10.

- **iOS Safari/Chrome (WebKit):** must speak inside a gesture; voices appear late; backgrounding can
  suspend audio. PWA standalone generally OK once unlocked. We handle unlock + keep-alive + resume.
- **Chrome (desktop/Android):** "Google" voices are **remote** (need network) and higher quality but
  fail offline; local voices are preferred for reliability. Watchdog/auto-pause handled via resume.
- **Edge/Windows:** high-quality "Microsoft …" neural voices, some **online**. Resolver picks by locale.
- **Firefox:** fewer voices; resolver degrades to base language or locale tag.

## 9. What CANNOT be guaranteed

The voices are the **browser/operating system's**, not READY's. We cannot guarantee an identical
voice across devices, that any specific named voice exists, that a device has *any* voice for a given
language, or that remote voices work offline. The honest promise is:
**"READY selects the best available native voice for the learning language on the current device."**

## 10. Validation status — code vs real device

| Area | Implemented (code) | Real-device validated |
|---|---|---|
| Voice resolver scoring + match quality | ✅ (unit-tested) | ✅ pure logic (no device needed) |
| `prepareTextForSpeech` | ✅ (unit-tested) | ✅ pure logic |
| `speak()` outcome contract (ended/interrupted/unavailable) | ✅ (mocked-engine tests) | ⚠️ mock only — not on real engines |
| Chrome unlock / keep-alive / visibility-resume | ✅ (from docs) | ❌ not device-validated |
| iOS/Safari gesture unlock + late voices + backgrounding | ✅ (from docs) | ❌ not device-validated |
| Locale → voice on Android/Windows/Edge/Mac | ✅ (from docs) | ❌ not device-validated |

**No physical device was tested in this environment.** The matrix below is the required manual QA to
run on real hardware before a release that leans on new locales/voices:

| Platform | Browser | Check | Status |
|---|---|---|---|
| iPhone | Safari | first-gesture unlock · voices load · replay · return from background | ❌ pending |
| iPhone | Chrome | locale selection · repeated playback | ❌ pending |
| iPad | Safari | Transcript Play-All · practice playback | ❌ pending |
| Android | Chrome | en-US & fr-FR locale selection (Google vs local) | ❌ pending |
| Mac | Safari | `voiceschanged` · stop/replay | ❌ pending |
| Mac | Chrome | long-session reliability (watchdog) | ❌ pending |
| Windows | Edge | Microsoft voice resolution | ❌ pending |
| Windows | Chrome | Google/system voice resolution | ❌ pending |

## 11. Adding a language

Add its realizations to the registry (locale via `ttsTag`). Optionally add a `voiceProfiles` entry to
tune fallbacks / preferred names / test phrase. No engine change — the resolver and `speak()` work by
locale. Debug a user's device with the dev Audio panel (`AudioDebug`) / Profile Test Voice, which show
the resolved voice, locale, score and exact/fallback state.
