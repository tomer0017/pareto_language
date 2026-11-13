/** Keep historical raw snapshots comparable across the Mission 16 artwork-only release.
 * Reconstruct only its former visual fields; every nonvisual byte remains fingerprinted.
 * Expected hashes in Missions 17–19 are deliberately unchanged.
 */
export function beforeMission16Artwork(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(beforeMission16Artwork);
  if (!value || typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  const emoji: Record<string, string> = { friends: '🙂', surfing: '🏄', drawing: '🎨', music: '🎵', running: '🏃', diving: '🤿', 'diving-school': '🏖️' };
  return Object.fromEntries(Object.entries(obj).flatMap(([key, v]) => {
    if ((key === 'image' || key === 'situationImage') && typeof v === 'string' && v.startsWith('images/mission16/')) {
      const slot = v.split('/').at(-1)!.replace('.jpg', '');
      return key === 'image' && typeof obj.key === 'string' ? [['emoji', emoji[slot]]] : [];
    }
    return [[key, beforeMission16Artwork(v)]];
  }));
}
