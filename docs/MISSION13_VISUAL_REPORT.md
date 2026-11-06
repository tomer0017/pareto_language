# Mission 13 final visual production report

Approved baseline: `88906f3`. Built-in imagegen; prompts, source paths and reviewed pixel hashes are in `mission13-artwork.json`. Every nonvisual field of EN/ES/FR Mission 13 matches its baseline hash.

1. **Final slots:** 12.
2. **Final props:** 1 earned result.
3. **Files:** `at-the-door.jpg`, `home-compliment.jpg`, `living-room-sofa.jpg`, `ask-family.jpg`, `mother-kitchen.jpg`, `live-with-family.jpg`, `food-invitation.jpg`, `polite-decline.jpg`, `tired.jpg`, `going-home.jpg`, `after-dinner.jpg`, `goodbye.jpg`, `home-visit-complete.jpg`. All under `apps/web/public/images/mission13/`, independently generated, 1672 × 941 JPEG quality 95, no resizing or collage cropping.
4. **Reuse:** briefing/arrival use at-the-door; the three sofa lines reuse living-room-sofa; both tired lines reuse tired; go-home/rest lines and the later NPC after-dinner question reuse going-home. Only the learner sleep line receives after-dinner, avoiding an early sleep gesture. No unique art per repeated utterance.
5. **Traveler:** Mission 11–12 fictional adult, dark wavy hair, clean-shaven, teal overshirt, cream tee, charcoal trousers, mustard backpack.
6. **Host:** same auburn-haired, bearded adult man throughout; rust polo, beige trousers, brown belt.
7. **Home:** cream walls, honey oak floors, walnut entrance, warm shaded lamp, early-evening light.
8. **Living room:** consistent spatial arrangement, woven rug, round oak coffee table, sofa and kitchen doorway.
9. **Sofa:** consistent sage/olive square-arm sofa with two ivory cushions. Minor texture and perspective variation remains between generated images.
10. **Kitchen:** white cabinetry and oak worktop, doorway to the right of sofa. Out of view at entry/exit; empty before mother reveal.
11. **Entry:** host opens door, welcoming palm; traveler attentive. No family, tiredness or evening-plan clue.
12. **Compliment:** traveler admiring room, appreciative open palm.
13. **Sofa question:** traveler indicates the same sofa in a social scene, without arrows or product-shot framing.
14. **Family question:** seated curious conversation, kitchen empty.
15. **Mother → Kitchen:** host gestures to a distinct adult woman standing inside the established kitchen. Art appears only with the canonical mother line. Room capture stays semantic UI.
16. **Flex:** no mother/kitchen art is present in the Flex capture; identical semantic tiles accept Living room instead. The canonical fact is not carried into the Flex label.
17. **Food invitation:** host gestures toward simple food on the kitchen counter. No grandmother or departure clue.
18. **Polite decline:** thankful hand on chest and gentle raised palm; both remain in living room. Grandmother is spoken information, with the board revealing the dinner plan after the learner response.
19. **Tired:** mild lowered eyelids and relaxed posture, reassuring smile; host shows concern. No illness, sleep or collapse.
20. **Going home:** traveler rises and turns toward entrance, holding backpack strap.
21. **Sleep:** traveler mimes a future sleep plan at the same doorway, without a bedroom or teleportation. The NPC after-dinner question uses departure art instead.
22. **Goodbye:** small reciprocal waves at the established door; result shows traveler stepping away.
23. **Home Visit Board:** deterministic UI, all five initial unknowns and exact reveal order unchanged.
24. **Evening Route:** deterministic UI, existing two-column readable cells; stages and timing unchanged.
25. **Spoilers:** all generated images visually reviewed. No baked text, grandmother imagery, premature mother, tiredness, departure or sleep. Tests bind reviewed pixels to canonical paths and allowed moments, including within-card-group sleep sequencing. Identity and semantic image review are visual judgments, not machine-recognition assertions.
26. **Fairness:** no generated image is an answer tile. Canonical and Flex room choices retain equivalent icons/captions and semantic room IDs.
27. **Emoji:** removed from all finalized M13 scene slots and result prop. Functional room-tile icons, mission icon and shared companion/avatar remain intentionally.
28. **Parity:** identical artwork and visual sequence across EN/ES/FR.
29. **Interactions:** 34, unchanged; all 8 learner lines and NPC comprehension roles preserved.
30. **Mission 13 tests:** 76 dedicated + 30 visual/integration = 106 passing.
31. **Full suite:** 2,944 tests across 96 files pass. Includes prior learning, word senses, coverage, Flex/transferOnly and Missions 01–13 regression. Typecheck, build, smoke, parity and content validation pass. Lint: no errors, two pre-existing Mission 08 type-import warnings. Build retains existing chunk-size warning. Content validator currently reports the repository’s configured Italian pack (182 items, 10 situations).
32. **Mobile QA:** actual Bootcamp components rendered in Safari at exact 360/390/430 CSS-pixel iframe widths, EN/ES/FR. Inspected briefing, all teaching-card groups, canonical capture, decline builder, both Flex interactions, supported/no-help/final opening states, earned result and summary. Full-image layout preserves both speakers and room context. Board/Route labels wrap readably; long pages scroll vertically. Added Mission-13-only full-frame card CSS; existing Board/Route layout sufficed.
33. **Answered states truly inspected:** clicked wrong English canonical room, retried, selected Kitchen and verified Mother: Kitchen on next step; clicked English Flex Living room and inspected success; clicked French Kitchen and inspected success; built the complete French decline, checked correct feedback, continued and verified Dinner: Grandmother’s. Other matrix screens are opening-state inspections, not nine exhaustive manual playthroughs.
34. **EN 13 video:** missing; standard safe skip retained.
35. **ES 13 video:** missing; standard safe skip retained.
36. **FR 13 video:** missing; standard safe skip retained.
37. **Visual weaknesses:** subtle facial tiredness is less obvious at small size; dialogue supports its meaning. Minor fabric/cushion texture variation. Narrow French punctuation can wrap. Tall three-card groups require scrolling; no essential image content is cropped.
38. **Pedagogical weaknesses retained:** existing generic room-capture helper says “Hear the price and find it.” Existing prerequisite nudge can show a word such as Spanish `dormir` before the scene; it does not reveal the evening plan. Shared summary uses “Watch” wording even with missing mission video. Native French/Spanish review remains recommended by baseline. Frozen content and behavior were not redesigned.
39. **Semantic sense fix:** `WORD_SENSES`, prior-learning logic and French `cuisine#food` / `cuisine#kitchen` distinctions unchanged; dedicated and full-suite regression pass.
40. **Video safety:** all eight unrelated local video changes remain untouched and excluded from commit. Release staging replaces build-copied videos with committed Git bytes in a temporary directory, never in the local public directory. Local hashes and live deployed bytes are checked independently.

The temporary QA harness is not committed or deployed. Release identifiers and live verification are reported separately in the delivery message; local screen/interaction QA is distinct from production URL and bundle verification.
