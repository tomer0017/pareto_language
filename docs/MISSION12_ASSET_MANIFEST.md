# Mission 12 — Time & Plans: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Mission 12 ships with emoji placeholders in every
slot (`M12_SLOTS` / `M12_PROPS` in `apps/web/src/features/bootcamp/practiceTimePlans.ts`, `image` unset).
No image generation was available in the build session; no stock images were used. To integrate an
asset, put the file at `apps/web/public/images/mission12/<slot>.jpg` and set that slot's
`image: 'images/mission12/<slot>.jpg'`. One file per asset: never a collage, contact sheet, storyboard or
sprite sheet that gets cropped later. Then update the "PLACEHOLDERS" test in `mission12.test.ts`
(it pins that no slot has artwork yet) to pin the real files instead, as `mission11Artwork.test.ts` does.

## One continuous world

This is ONE conversation between friends, on one morning. Keep these identical across all assets:

- **the traveller**: the same adult traveller as in Mission 11;
- **the friend**: one adult fellow traveller, with the same face, hair and clothes in every scene. The
  Hebrew copy addresses the friend in the masculine ("אני הולך לים"), so draw a man;
- **the place**: one morning meeting spot (a hostel/guesthouse entrance or courtyard). This is "here" in
  "Let's meet here at seven", so it must be recognisable as the same spot;
- **the light**: the same soft morning light in every conversation image.

The dinner and the beach are **plan-context** pictures (what the friend is describing), not the
traveller physically there during the conversation.

Style: premium polished 3D animated illustration, warm, clean. Not photorealistic, not emoji art.
**No text in any picture**, and **no clocks, watches or numbers anywhere**: every time (20:00, 07:00,
18:00, 22:00) is deterministic app UI, perfectly readable. The same art serves EN / ES / FR.

Format: about 16:9, at least 1536 px wide, JPEG at full quality.

## Spoilers to avoid (tested)

- **Before the invitation line**, no picture may show food, a restaurant, a table or a city centre.
- **Before the tomorrow-morning line**, no sand, sea, towels, swimsuits or beach bags.
- **Before "we leave early"**, no sunrise departure. `leave-early` itself shows *early* qualitatively
  (dawn light, a quiet street), **never an hour**.
- No picture anywhere shows 20:00 or 07:00.

## Fairness

No Mission 12 image is ever an answer tile. The time capture uses plain text (18:00 · 20:00 · 22:00),
the place capture uses app-language captions. Pictures carry meaning on the teaching cards only.

## Slots: the conversation

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `morning-meeting` | it is morning, no plans yet | the traveller and the friend meet at the morning spot, relaxed | the briefing (`M12_BRIEFING_IMAGE`) |
| `morning-question` | "Good morning! What are you doing today?" | the friend greets the traveller with a curious, open face | This-morning card; the pattern card |
| `open-morning` | "Nothing this morning. Maybe later." | the traveller, relaxed shrug, an open-handed "nothing planned" | This-morning cards |
| `tonight-question` | "And what are you doing tonight?" | the friend asks, a little hopeful (no hint of food) | Tonight card; the pattern card |
| `free-tonight` | "I'm free tonight." | the traveller, happy and available, open arms | Tonight card |
| `dinner-invitation` | "We're going to eat in the centre. Do you want to come?" | the friend gestures toward town and mimes eating; a warm plan-context inset of a lively centre at dinner | Invitation card; the time card |
| `ask-time` | "Yes! What time?" | the traveller, keen, eyebrows up: interested but asking when (no clock) | Invitation card |
| `not-too-late` | "No, that's not too late." | the traveller, an easy thumbs-up: it works | Time card |
| `very-good-there` | "Great. It's very good there." | the friend, enthusiastic, fingertips kiss | Tomorrow card |
| `ask-tomorrow` | "What are you doing tomorrow?" | the traveller takes the initiative and asks, leaning in | Tomorrow pattern card |
| `beach-plan` | "Tomorrow morning I'm going to the beach." | the friend describes it; a plan-context inset of a morning beach | Tomorrow-morning card |
| `leave-early` | "Then come with us! But we leave early." | the friend invites warmly; dawn-light context: *early*, no hour | Arrangement card |
| `meeting-plan` | "No problem. Let's meet here at seven." | the traveller points down at the spot ("here"), decisive and friendly; no clock | Arrangement card |
| `see-you-tonight` | "Perfect. I have to go now — see you tonight!" | the friend leaves now with a wave; the traveller waves back | Goodbye card |

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `plans-made` | both plans set | the traveller looking content at the meeting spot; dinner and beach as two small plan vignettes; no times drawn | the 📅 PLANS MADE receipt |
