import { describe, expect, it } from 'vitest';
import { setUiLangDict } from '../../shared/i18n/strings.js';
import { dialogueTr } from './i18n.js';
import { dialogueTranscript } from './transcript.js';
import { DAY1_FR } from './fr/day1.js';

/**
 * Language-agnostic Bootcamp seam (the refactor that makes a mission content-only per language).
 * `dialogueTr` resolves a dialogue line's translation in the ACTIVE app language, falling back to
 * {en,he} for legacy English missions — so English is byte-identical and French missions display
 * correctly in either UI. Proven end-to-end on the real French Mission 1.
 */
describe('dialogueTr — app-language dialogue translation', () => {
  it('uses tr in the active app language when present (a French line)', () => {
    const line = { en: 'Bonjour !', he: 'שלום!', tr: { en: 'Hello!', he: 'שלום!' } };
    setUiLangDict('en');
    expect(dialogueTr(line)).toBe('Hello!');
    setUiLangDict('he');
    expect(dialogueTr(line)).toBe('שלום!');
  });

  it('falls back to {en,he} for a legacy English mission line (no tr) — no Hebrew shown to en-UI', () => {
    const line = { en: 'Here you go!', he: 'בבקשה, הנה!' };
    setUiLangDict('en');
    expect(dialogueTr(line)).toBe('Here you go!'); // en-UI reads the English line, not Hebrew
    setUiLangDict('he');
    expect(dialogueTr(line)).toBe('בבקשה, הנה!');
  });
});

describe('French Mission 1 through the shared engine (parity proof)', () => {
  it('renders a fully bilingual transcript — every spoken line has both en and he (zero English leak)', () => {
    const lines = dialogueTranscript(DAY1_FR.dialogues['stuck-traveler']!);
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) {
      expect(l.en.trim().length).toBeGreaterThan(0);   // French spoken line
      expect(l.tr?.en?.trim().length).toBeGreaterThan(0); // English gloss present
      expect(l.tr?.he?.trim().length).toBeGreaterThan(0); // Hebrew gloss present
    }
  });

  it('scopes French progress/review under fr.* ids (never mixed with English)', () => {
    expect(DAY1_FR.items.every((i) => i.id.startsWith('fr.'))).toBe(true);
    expect(DAY1_FR.items[0]!.text).toBe('Désolé, je ne comprends pas.'); // French target surface
  });
});
