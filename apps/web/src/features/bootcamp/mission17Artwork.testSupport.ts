/** Reconstruct only M17's former visual fields for historical raw snapshots in later missions.
 * Expected hashes and every nonvisual field stay unchanged. */
export function beforeMission17Artwork(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(beforeMission17Artwork);
  if (!value || typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  const emoji: Record<string, string> = { milk: '🥛', water: '💧', bread: '🍞', cheese: '🧀', eggs: '🥚', apples: '🍎', shop: '🛒', checkout: '🧾', bag: '🛍️' };
  return Object.fromEntries(Object.entries(obj).flatMap(([key, v]) => {
    if (key === 'image' && typeof v === 'string' && v.startsWith('images/mission17/')) {
      const slot = v.split('/').at(-1)!.replace('.jpg', '');
      return typeof obj.key === 'string' || typeof obj.id === 'string' ? [['emoji', emoji[slot]]] : [];
    }
    return [[key, beforeMission17Artwork(v)]];
  }));
}
