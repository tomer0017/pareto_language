# READY Translation Rules

READY prepares people for the **real world**, not for a textbook. Translation choices are
judged by one question: *when the traveler is standing at the counter, does this help them
recognize and use what they actually see and hear?*

## Rule 1 — Real-world names stay in their real form (+ a short explanation)

If a word appears on menus / signs / packaging **as-is** abroad, do **not** transliterate it
phonetically into the native language. Keep the original wording so the learner recognizes it in
the wild, and add a short parenthetical explanation of what it is.

**Why:** a phonetic spelling (e.g. Hebrew "פלאט וייט") teaches a sound the learner will never
*see*. On the café board it will say **Flat White**. Recognition beats pronunciation.

### Do

| Real name (keep) | Explanation to add |
| --- | --- |
| Flat White | espresso with steamed milk |
| Croissant | French pastry |
| Espresso | strong black coffee |
| Latte | coffee with milk |
| Cappuccino | espresso with foamed milk |

Rendered to the learner:

```
Flat White  (espresso with steamed milk)
Croissant   (French pastry)
```

### Don't

- ❌ Phonetic transliteration of a menu name into the native script ("פלאט וייט").
- ❌ Translating a proper product/brand/dish name into a descriptive phrase that erases the word
  they'll see ("קפה בהיר עם חלב" instead of keeping **Flat White**).

### Applies to

Menu items, dish names, drink names, brand/product names, place/landmark names, and any fixed
sign wording (e.g. **Exit**, **Gate**, **Platform**) the traveler must match by sight.

### Where this lives in content

- Dialogue lines (`he` field) may embed the real term in Latin script inside the native sentence.
- Item `meaning` stays a natural native translation; put the real-world recognition note in `tip`.

_Established: pilot polish sprint, after a real-device test surfaced a phonetic "Flat White"._
