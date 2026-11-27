# Mission 21 — Future Travel & Plans: asset manifest

**Status: PENDING — VISUAL PRODUCTION REQUIRED IN ASTRA PASS.**

No artwork was generated in the Mission 21 pass. Every card uses a semantic emoji placeholder from
`M21_SLOTS` (`apps/web/src/features/bootcamp/practiceFuture.ts`). To ship artwork, add an `image` path to the
slot (e.g. `images/mission21/<slot>.jpg`) — the cards pick it up; nothing else changes.

## The rule for every picture

The plan's facts are **data**, drawn as deterministic UI on the ✈️ MY NEXT TRIP board: the country (Vietnam,
Thailand), the length of stay (two weeks), the order (after that), the time (tomorrow morning), the airport.
**No picture may encode them** — no flags, maps with names, calendars, clocks, signs or readable text. Artwork
supports the context only. The friend's own plan (going home) is information the learner must HEAR first: the
`friend-home` picture appears on the friend's card only, never earlier.

## Slots (`M21_SLOTS`)

| Slot | Used on | Picture (context only) | Must NOT show |
|---|---|---|---|
| `chat` | the friend's questions; the ask-back | Two travellers chatting in a hostel common room, relaxed, daytime | Any destination, map, ticket or calendar |
| `destination` | "I'm going to Vietnam." · "I'll be there for two weeks." · "After that I'm going to Thailand." | A backpacker looking ahead on a road, generic landscape | Flags, country names, maps, calendars, numbers |
| `hanoi` | "I want to visit Hanoi." | A busy old-quarter street scene, lanterns, no readable signs | Text, signs, the word "Hanoi" |
| `motorbike` | "I want to travel by motorbike." | A traveller on a small motorbike on a country road, helmet on | Plates or text |
| `airport` | "Tomorrow morning I'm going to the airport." | Optional — keep the 🛫 emoji unless a generic early-morning departure scene fits | Departure boards, times, airline names |
| `friend-home` | "Me? I'm going home. Have a great trip!" (the friend's card only) | The friend waving, a front door / home in the background | Anything that could appear before the friend says it |

## Props (`M21_PROPS`)

| Prop | Used on | Note |
|---|---|---|
| `next-trip` | the ✈️ MY NEXT TRIP result | Emoji only; the result is the plan board itself (UI) |

## Reuse considered

- Mission 20's `chat` (two friends at a café) is close but a different scene (yesterday, a café); a hostel
  common room keeps the "next trip" setting. Reuse it only if a single shared chat picture is preferred.
- Mission 06's calendar art (`week`, `two-weeks`) must **not** be reused: duration is plan data here.

## Video

The standard resolver: `videos/{lang}/{lang}_21.mp4`. None exists today (EN / ES / FR): the video step is
safely skipped and the hub's first step reads the conversation aloud. No video was created or modified.
