/**
 * Who the learner is talking to. Language comes from PEOPLE, so every conversation screen gives the
 * other speaker a visual presence. Today that is a glyph per mission; when illustrations exist, add
 * `art` (a public path) to an entry and `NpcFigure` shows it instead — no screen changes.
 */
export interface NpcLook {
  /** Stand-in until there is artwork. */
  glyph: string;
  /** Public path of an illustration, when one exists. */
  art?: string;
}

const DEFAULT_NPC: NpcLook = { glyph: '🧑' };

/** Keyed by the stable mission id. Missions not listed get the default person. */
const NPC_BY_MISSION: Record<string, NpcLook> = {
  'numbers-money': { glyph: '🧑‍🌾' },
  'coffee-shop': { glyph: '🧑‍🍳' },
  'airport-border': { glyph: '👮' },
  'taxi': { glyph: '🧑‍✈️' },
  'hotel-check-in': { glyph: '🧑‍💼' },
  'shopping': { glyph: '🧑‍💼' },
  'restaurant-meal': { glyph: '🧑‍🍳' },
  'special-requests-allergies': { glyph: '🧑‍🍳' },
  'supermarket': { glyph: '🧑‍💼' },
  'public-transport': { glyph: '🧑‍✈️' },
  'lost-stolen-police': { glyph: '👮' },
  'pharmacy-health': { glyph: '🧑‍⚕️' },
  'emergency': { glyph: '🧑‍⚕️' },
};

export const npcFor = (missionId: string | undefined): NpcLook => (missionId && NPC_BY_MISSION[missionId]) || DEFAULT_NPC;
