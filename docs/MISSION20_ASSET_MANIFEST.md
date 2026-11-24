# Mission 20 — Past & Recent Events: asset manifest

Status: PENDING — **VISUAL PRODUCTION REQUIRED IN ASTRA PASS**. No image was generated in the Mission 20 learning
pass (2026-11-24). Every slot below renders its semantic emoji today (`M20_SLOTS` / `M20_PROPS` in
`apps/web/src/features/bootcamp/practicePast.ts`); adding a file is setting the slot's `image`, with no lesson change.

## Rules for the artwork

- **The story's data is UI, never a picture.** The Yesterday Story (📍 went · 👀 saw · 🍽️ ate · ⭐ it was · 🛏️ stayed)
  is deterministic text. No picture may show the answer to a question before the learner has heard the line that
  says it: artwork counts as information (no old town before "I went to the old town", no market before "I saw the
  market", no fish before "I ate fish", no hostel before "I stayed in a hostel").
- **One friend, one city, one style** across the six slots; the same friend in `chat` and `friend-day`.
- No text, signs, numbers, flags or maps baked into any image; no grammar, no calendar, no country map.
- A card's picture sits beside a whole line the learner has just been given — never as an answer tile.

## Slots (cards)

| Slot | Shown on | Scene | Must not show |
| --- | --- | --- | --- |
| `chat` | "Where were you?" / "What did you see?" / "Did you like it?" / the ask-back | Two friends chatting at a café table, relaxed, daytime | Any place or food from the story |
| `old-town` | "I went to the old town." | A narrow old-town street, stone buildings | A market, food |
| `market` | "I saw the market." | An open-air market seen from the street | Fish (it is the next answer) |
| `meal` | "Did you eat there?" / "Yes, I ate fish." | A simple grilled-fish plate at a market stall | A menu with words or prices |
| `hostel` | "Where did you stay?" / "I stayed in a hostel." / "A hostel! Was it good?" | A friendly hostel dorm or lobby | A hotel reception (the final's detail), any country flag |
| `friend-day` | "Me? Nothing! I was tired. I slept all day." | The friend asleep on a sofa, daylight | Any activity |

## Prop (result only)

| Prop | Shown on | Scene |
| --- | --- | --- |
| `yesterday-story` | the 🗓️ YESTERDAY STORY receipt | A small collage feeling of a good day: a street, a market, a plate — no text |

## Reuse considered

Existing production art was reviewed for reuse before asking for new images: Mission 11 (a scenic viewpoint, not an old
town street), Mission 02 (a strawberry stall with prices — prices would be noise here), Mission 19 (`museum.jpg` — a
detail of the FINAL's other day, so it must not appear in teaching), Mission 06 (`hotel.jpg` — the final's place to
stay, same reason). None fits a slot without leaking a final detail or carrying unrelated data, so no file is reused.

## Video

Normal mission: the standard resolver `videos/{lang}/{lang}_20.mp4`. No Mission 20 video exists in EN, ES or FR today,
so the `video` step is skipped safely. No video was created.
