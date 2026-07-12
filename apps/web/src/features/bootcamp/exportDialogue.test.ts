import { describe, expect, it } from 'vitest';
import { exportMissions, exportableLanguages, renderMissionScript, renderLine, cinematicTranscript } from './exportDialogue.js';
import { missionsFor } from './registry.js';

/**
 * Dialogue-export validation — the screenplay is the MAIN successful conversation only, in every
 * language, with no ids/metadata/recovery/wrong-answers, and no English leak into a French export.
 */
describe('Dialogue export — cinematic screenplay', () => {
  it('exports a mission per built mission for each language (no tool language logic)', () => {
    expect(exportableLanguages()).toContain('en');
    expect(exportableLanguages()).toContain('fr');
    expect(exportMissions('en').length).toBe(Object.keys(missionsFor('en')).length);
    expect(exportMissions('fr').length).toBe(Object.keys(missionsFor('fr')).length);
  });

  it('filters to a single mission by day number', () => {
    const one = exportMissions('fr', 3);
    expect(one.length).toBe(1);
    expect(one[0]!.filename).toBe('mission-03.md');
  });

  it('renders a clean French screenplay: French spoken + English + Hebrew, alternating speakers', () => {
    const script = renderMissionScript(missionsFor('fr')[3]!); // Numbers & Money
    expect(script).toContain('# Mission 03 — Numbers & Money');
    expect(script).toContain('## Scene');
    expect(script).toContain('👤 NPC');
    expect(script).toContain('🧑 You');
    expect(script).toContain('C’est combien ?'); // French spoken line
    expect(script).toContain('How much is it?'); // English gloss
    expect(script).toContain('כמה זה עולה?'); // Hebrew gloss
  });

  it('contains NO ids / metadata / markdown tables / JSON', () => {
    for (const lang of ['en', 'fr']) {
      for (const m of exportMissions(lang)) {
        expect(m.content).not.toMatch(/\.(phrase|reply|word)\./); // no item ids
        expect(m.content).not.toMatch(/itemId|dialogueId|correct:|"kind"|wrongIds/);
        expect(m.content).not.toContain('|---|'); // no tables
      }
    }
  });

  it('exports the CINEMATIC happy path — direct answers, no recovery detours or wrong answers', () => {
    const script = renderMissionScript(missionsFor('fr')[3]!);
    const path = cinematicTranscript(missionsFor('fr')[3]!.dialogues['market-stall']!).map((l) => l.en);
    expect(path).toContain('Une barquette, s’il vous plaît.'); // the DIRECT correct answer is taken
    // The "speak slowly" recovery tool + its slow-repeat beat are NOT in the cinematic path:
    expect(path).not.toContain('Parlez lentement, s’il vous plaît.');
    expect(path).not.toContain('Cinq — euros — une barquette.');
    expect(script).not.toContain('Cinq — euros — une barquette.');
  });

  it('has NO English leak as the SPOKEN line in a French export (target is French)', () => {
    const lines = cinematicTranscript(missionsFor('fr')[3]!.dialogues['market-stall']!);
    for (const l of lines) {
      // The spoken (target) line must differ from its English gloss — i.e. it is French, not English.
      if (l.tr?.en) expect(l.en).not.toBe(l.tr.en);
    }
  });

  it('an English mission does not duplicate the English gloss under the spoken line', () => {
    const line = { who: 'npc' as const, en: 'Here you go!', he: 'בבקשה, הנה!' };
    const block = renderLine(line);
    // English spoken line appears once; Hebrew gloss follows. (No second identical English line.)
    expect(block.split('Here you go!').length - 1).toBe(1);
    expect(block).toContain('בבקשה, הנה!');
  });
});
