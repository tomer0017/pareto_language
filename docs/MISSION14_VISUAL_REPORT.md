# Mission 14 visual production report

Approved baseline: `e5a546e`. Final manual walkthrough handed to the user at their explicit request to release promptly. Production interaction QA must not be inferred from automated tests or HTTP verification.

1. Final slots: 10.
2. Final result props: 1.
3. Final files: `restaurant-entrance.jpg`, `table-for-two.jpg`, `follow-to-table.jpg`, `ready-to-order.jpg`, `drink-order.jpg`, `coming-right-up.jpg`, `meal-check.jpg`, `goodbye.jpg`, `meal-complete.jpg`, in `apps/web/public/images/mission14/`. Each is 1672 × 941, JPEG quality 95, without cropping or upscaling. Built-in imagegen; prompts and hash-bound visual review in `mission14-artwork.json`.
4. Whole-image reuse: ready-to-order → order-chicken; meal-check → delicious-bill. Nine final files, separately produced; no collage.
5. Waiter: consistent black curls, white shirt, charcoal waistcoat, green apron.
6. Traveler: established dark wavy hair, teal overshirt, cream tee, mustard backpack. Companion: auburn beard, rust polo.
7. Restaurant: cream plaster, walnut panels, amber globe lights, black-framed evening window.
8. Table: square oak, green chairs, same seating positions.
9. Menus: dark green with thin gold borders; collected after ordering.
10. Arrival: waiter welcomes diners at host lectern; no meal or bill.
11. Table request: natural two-finger request; exact state remains UI.
12. Follow/menu: waiter hands menus to seated diners.
13. Ready: attentive waiter with blank notepad.
14. Main order: traveler indicates menu, no premature dish.
15. No onions: deterministic Ticket and existing language only; artwork does not prove ingredient absence.
16. Drink: service exchange with no bottle before selection; bottle appears only after Later.
17. Anything else/close: original UI retained, waiter departure supports completed ordering.
18. Coming right up: collected menus and departing waiter, no meal yet.
19. Later: existing cue followed by mostly finished plates at same table.
20. Later is never spoken: frozen data and existing dialogue-beat tests preserved.
21. Meal check: returned waiter, satisfied attentive diners and finished plates. Initial reclining pose rejected and refined.
22. Bill request: positive service exchange; exact request in text/Ticket.
23. Result: satisfied diners leaving, same waiter waving. Closed bill folder appears only on the goodbye teaching line after the bill-request line.
24. Ticket: deterministic, six facts, unchanged reveal stages.
25. Waiter Signals: existing equal semantic tiles, no AI answer images.
26. Flex: existing equal two/four tiles, no contextual people image to reveal answer.
27. Flex remains listening-only and transferOnly.
28. Flex still uses four.
29. Spoiler audit: no food/water/bill pixels in early scenes; finished meal only after Later; result only earned receipt. Teaching cards remain grouped as approved; goodbye is below bill-request within that group, not a new interaction gate.
30. Fairness: no AI images used in any answer set.
31. Semantic placeholders removed from all finalized slots and prop. Existing functional UI icons remain.
32. Identical art paths and sequences in EN/ES/FR.
33. 26 meaningful interactions and five learner lines unchanged.
34. Mission 14 tests: 98 (71 original + 27 artwork tests).
35. Full suite: 3,043 passing across 98 files. Typecheck/build/smoke/parity/content validation pass. Lint: zero errors, two existing Mission 08 warnings. Content validation reports the configured Italian pack (182 items, 10 situations); EN/ES/FR are covered by mission/parity tests. Initial sandbox Mongo port failures resolved by rerunning with local-server permission; generated audit updated only for M14 visual references.
36. Mobile: real Safari app harness at 360/390/430 CSS pixels. EN/ES reviewed briefing, all art groups, builder, Signals, Flex, supported/no-help/final opening screens, completion and summary. FR reviewed briefing, arrival, menu/order, builder and drink cards; late FR captures were incomplete. Remaining manual visual QA explicitly handed to user. No exhaustive nine-combination playthrough claim.
37. Actual answered states inspected: EN builder success → Chicken/No onions reveal; EN Signals wrong → retry → correct; EN/ES Flex four correct; FR builder correct. Other screenshots were opening states. Harness supported real clicks and was removed before release.
38. EN video: expected available; verify HTTP 200 during release.
39. ES video: expected absent; verify HTTP 404 during release. Existing safe skip/replay preservation covered by regression tests.
40. FR video: expected available; verify HTTP 200 during release.
41. Visual limitations: service-context art intentionally needs dialogue to distinguish drink/main/bill intent; tiny food detail is not semantic evidence. Small decorative texture variations remain. At 360px Ticket values can wrap; content remains readable. Late French and production walkthrough remain user manual checks.
42. Existing pedagogical limitations: no redesign or new teaching. Prerequisite nudge can appear in isolated harness. Shared summary still uses Watch wording in Spanish despite missing video; unchanged. Native language review still recommended in baseline.
43. Optional recovery branch unchanged, protected by full nonvisual-data hashes and original tests; no visual promotion.
44. Mission 13 unchanged. Shared CSS additions scoped to Mission 14 image URLs only; other mission files unchanged.
45. All unrelated local videos preserved byte-for-byte. Deployment staged separately with committed video bytes, never local modified versions. Explicit commit paths used. Temporary harness excluded.

Release verification records commit/deploy IDs and HTTP results in the delivery message. Live bundle: `index-C2EYngAv.js`. Manual production interaction checks are delegated to the user, not reported as passed.
