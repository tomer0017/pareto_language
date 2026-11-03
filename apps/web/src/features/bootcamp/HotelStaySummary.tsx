/** Present the existing progressively revealed stay string; never infer or add a fact. */
export function splitHotelStay(text: string): { before: string; facts: string[]; after: string } | null {
  const match = /🚪 (?:Room|חדר) [\s\S]+?🛗 (?:Elevator|מעלית) (?:\?|→ ✅)/u.exec(text);
  if (!match) return null;
  const facts = match[0].split(' · ');
  if (facts.length !== 4) return null;
  return { before: text.slice(0, match.index), facts, after: text.slice(match.index + match[0].length) };
}

/** The staged journeys — each stage ✅ or ⬜ — split the same way; never a new fact. Mission 09's
 *  shopping journey (five stages) and Mission 11's conversation flow (four). */
const JOURNEYS: readonly { re: RegExp; stages: number }[] = [
  { re: /👀 (?:Browse|מסתכלים) [\s\S]+?🛍️ (?:Buy|קונים) (?:✅|⬜)/u, stages: 5 },
  { re: /💬 (?:Connect|חיבור) [\s\S]+?👋 (?:Close|פרידה) (?:✅|⬜)/u, stages: 4 },
];
export function splitJourney(text: string): { before: string; facts: string[]; after: string } | null {
  for (const { re, stages } of JOURNEYS) {
    const match = re.exec(text);
    if (!match) continue;
    const facts = match[0].split(' · ');
    if (facts.length !== stages) return null;
    // The separators around the grid are the grid's own edges on screen: not shown as a stray "·".
    return { before: text.slice(0, match.index).replace(/\s*·\s*$/u, ''), facts, after: text.slice(match.index + match[0].length).replace(/^\s*·\s*/u, '') };
  }
  return null;
}

export function HotelStaySummary({ text }: { text: string }) {
  const journey = splitJourney(text);
  if (journey) return <span className="hotel-stay-summary">
    {journey.before && <span className="hotel-stay-note">{journey.before}</span>}
    <span className="hotel-stay-grid is-journey">{journey.facts.map((fact, i) => <span key={i} className="hotel-stay-fact" data-known={fact.endsWith('✅')}>{fact}</span>)}</span>
    {journey.after && <span className="hotel-stay-note">{journey.after}</span>}
  </span>;
  const stay = splitHotelStay(text);
  if (!stay) return <>{text}</>;
  return <span className="hotel-stay-summary">
    {stay.before && <span className="hotel-stay-note">{stay.before}</span>}
    <span className="hotel-stay-grid">{stay.facts.map((fact, i) => <span key={i} className="hotel-stay-fact" data-known={fact.endsWith('✅')}>{fact}</span>)}</span>
    {stay.after && <span className="hotel-stay-note">{stay.after}</span>}
  </span>;
}
