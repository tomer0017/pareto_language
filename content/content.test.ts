import { describe, expect, it } from 'vitest';
import { loadPack, runIntegrityChecks } from './pack.js';

/**
 * Content CI gate (PDF §11.3, mission M1). Loads the authored Italian pack, asserting it passes
 * schema + integrity validation and meets the Tier 0/1 structural bar from PDF §7.
 */
describe('it-IT content pack', () => {
  const pack = loadPack('it-IT');

  it('loads and passes integrity checks', () => {
    expect(() => runIntegrityChecks(pack)).not.toThrow();
    expect(pack.lang).toBe('it');
    expect(pack.version).toBe('0.1.0');
    expect(pack.needsNativeReview).toBe(true);
  });

  it('covers 10 prioritized situations incl. an offline Emergency', () => {
    expect(pack.situations.length).toBe(10);
    expect(pack.situations.filter((s) => s.isEmergency).length).toBe(1);
  });

  it('has a substantial Tier 0/1 item set (~180)', () => {
    expect(pack.items.length).toBeGreaterThanOrEqual(150);
    expect(pack.items.every((i) => i.tier <= 1)).toBe(true);
  });

  it('every situation ships core phrases, likely replies and a branching dialogue (§7.3)', () => {
    for (const s of pack.situations) {
      expect(s.corePhraseIds.length).toBeGreaterThanOrEqual(6);
      expect(s.replyIds.length).toBeGreaterThanOrEqual(4);
      expect(s.dialogue.nodes.length).toBeGreaterThanOrEqual(2);
      const hasBranch = s.dialogue.nodes.some((n) => (n.options?.length ?? 0) >= 2);
      expect(hasBranch).toBe(true);
    }
  });

  it('phrases target production; replies/words target recognition (asymmetric §6.3)', () => {
    const emergency = pack.situations.find((s) => s.isEmergency)!;
    const nonEmergencyPhrases = pack.items.filter(
      (i) => i.kind === 'phrase' && i.situationIds.length > 0 && !emergency.corePhraseIds.includes(i.id),
    );
    expect(nonEmergencyPhrases.every((p) => p.skillTarget === 'recall')).toBe(true);
    const replies = pack.items.filter((i) => i.kind === 'reply');
    expect(replies.every((r) => r.skillTarget === 'recognize')).toBe(true);
  });

  it('emergency phrases target fluency (§7.2 overlearning)', () => {
    const emergency = pack.situations.find((s) => s.isEmergency)!;
    const emItems = pack.items.filter((i) => emergency.corePhraseIds.includes(i.id));
    expect(emItems.every((i) => i.skillTarget === 'fluent')).toBe(true);
  });

  it('every item has an audio asset path (audio-first §11.3)', () => {
    expect(pack.items.every((i) => i.audio.natural.endsWith('.mp3'))).toBe(true);
  });

  it('includes a numbers curriculum with prices and time (§7)', () => {
    const kinds = new Set(pack.numbersCurriculum.map((n) => n.kind));
    expect(kinds.has('price')).toBe(true);
    expect(kinds.has('time')).toBe(true);
  });
});
