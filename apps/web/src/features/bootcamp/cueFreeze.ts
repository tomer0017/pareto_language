import type { BootcampDayContent, SpokenLine } from './types.js';

/**
 * TEST SUPPORT — the production freeze of scene transitions (2026-10-05).
 *
 * Seven lines of the Core used to carry a time / place jump INSIDE the spoken text
 * ("…Later… Is everything okay?", "…At the checkout… Hi!", "… Later … Here's your bill."), so
 * text-to-speech read the label aloud. The label is now a `cue` on the line: shown in the app
 * language, never spoken. Nothing else about those conversations changed.
 *
 * The earlier practice passes pinned Missions 01–24 with byte-for-byte fingerprints taken BEFORE the
 * freeze. `beforeCueFreeze` puts the labels back exactly where they were, so those fingerprints can
 * keep proving that — apart from the labels — not one character of Missions 01–24 has moved.
 */
type L = 'en' | 'fr' | 'es';
const LABEL: Record<string, Record<L | 'he', string>> = {
  'Later…': { en: 'Later', fr: 'Plus tard', es: 'Más tarde', he: 'אחר כך' },
  'At the checkout…': { en: 'At the checkout', fr: 'À la caisse', es: 'En la caja', he: 'בקופה' },
};
/** Registry keys of the Missions 01–24 whose conversation carried a label (14, 17, 18, 22). */
const FROZEN_DAYS = new Set([4, 16, 17, 24]);

function relabel(line: SpokenLine, cueEn: string, lang: L, join: (label: string, text: string) => string): void {
  const label = LABEL[cueEn];
  if (!label) throw new Error(`[cueFreeze] unknown cue "${cueEn}"`);
  line.en = join(label[lang], line.en);
  line.he = join(label.he, line.he);
  if (line.tr) { line.tr.en = join(label.en, line.tr.en ?? ''); line.tr.he = join(label.he, line.tr.he ?? ''); }
}

export function beforeCueFreeze(day: BootcampDayContent, lang: string): BootcampDayContent {
  if (!FROZEN_DAYS.has(day.day)) return day;
  const copy = JSON.parse(JSON.stringify(day)) as BootcampDayContent; // JSON round-trip keeps key order
  const l = lang as L;
  const lead = (label: string, text: string): string => `…${label}… ${text}`;
  const wasSpoken = new Map<string, string>(); // current text → the cue it carried
  for (const d of Object.values(copy.dialogues)) {
    for (const node of [...d.nodes]) {
      if (!node.cue) continue;
      const cueEn = node.cue.en ?? '';
      // Only Mission 22 (key 24) had the label in the MIDDLE of a line.
      const before = copy.day === 24 ? d.nodes.find((n) => n.who === 'npc' && n.next === node.id && node.id === `${n.id}b`) : undefined;
      if (before) {
        // A second beat ("… Later … Here's your bill.") goes back into the line it was cut from.
        const label = LABEL[cueEn]!;
        before.en = `${before.en} … ${label[l]} … ${node.en}`;
        before.he = `${before.he} … ${label.he} … ${node.he}`;
        if (before.tr && node.tr) { before.tr.en = `${before.tr.en} … ${label.en} … ${node.tr.en}`; before.tr.he = `${before.tr.he} … ${label.he} … ${node.tr.he}`; }
        if (node.next) before.next = node.next; else { delete before.next; before.end = true; }
        d.nodes.splice(d.nodes.indexOf(node), 1);
        continue;
      }
      wasSpoken.set(node.en, cueEn);
      // A checkpoint's slow re-ask repeats the line it follows — label included, back then.
      for (const again of d.nodes) if (again !== node && again.who === 'npc' && again.slow && again.en === node.en) relabel(again, cueEn, l, lead);
      relabel(node, cueEn, l, lead);
      delete node.cue;
    }
  }
  // A speed chain quotes the conversation's own lines: it carried the same label.
  for (const s of copy.steps) if (s.kind === 'quickReply' && s.challenge) for (const r of s.rounds) if (r.npc && wasSpoken.has(r.npc.en)) relabel(r.npc, wasSpoken.get(r.npc.en)!, l, lead);
  return copy;
}
