/**
 * Randomization utility (Randomize-Everywhere sprint — Part 3).
 *
 * One tested shuffle instead of scattered `Math.random()` / `.sort(() => Math.random() - 0.5)`
 * calls across the app. The naive sort-based shuffle is BIASED (comparator isn't a valid ordering)
 * and was producing skewed answer positions; Fisher–Yates here is uniform. Everything takes an
 * optional RNG so tests can pass a deterministic seed and assert exact order.
 *
 *   shuffle(arr)                    // new array, uniform, non-mutating (default Math.random)
 *   shuffle(arr, mulberry32(seed))  // deterministic in tests
 *   seededShuffle(arr, seed)        // convenience for the above
 *   sample(arr, n)                  // n distinct items, shuffled
 *   pickOne(arr)                    // one item (replaces `arr[Math.floor(random*len)]`)
 */

/** A pseudo-random source returning a float in [0, 1) — `Math.random` conforms. */
export type RNG = () => number;

/** Small, fast, seedable PRNG (mulberry32). Same seed → same stream, everywhere, forever.
 *  For test determinism and stable-per-session ordering — NOT for cryptographic use. */
export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform Fisher–Yates shuffle. Returns a NEW array; never mutates the input. */
export function shuffle<T>(arr: readonly T[], rng: RNG = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/** Deterministic shuffle by integer seed (thin wrapper over `shuffle` + `mulberry32`). */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  return shuffle(arr, mulberry32(seed));
}

/** `n` distinct items in random order (clamped to the array length). */
export function sample<T>(arr: readonly T[], n: number, rng: RNG = Math.random): T[] {
  return shuffle(arr, rng).slice(0, Math.max(0, Math.min(n, arr.length)));
}

/** One random item (or `undefined` for an empty array). Replaces `arr[Math.floor(random*len)]`. */
export function pickOne<T>(arr: readonly T[], rng: RNG = Math.random): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(rng() * arr.length)];
}

/** A stable-per-call integer seed derived from the clock — for session-scoped orderings that must
 *  stay fixed across re-renders (capture once in `useState(() => sessionSeed())`). */
export function sessionSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
