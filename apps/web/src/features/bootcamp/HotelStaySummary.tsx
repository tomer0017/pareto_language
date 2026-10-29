/** Present the existing progressively revealed stay string; never infer or add a fact. */
export function splitHotelStay(text: string): { before: string; facts: string[]; after: string } | null {
  const match = /🚪 (?:Room|חדר) [\s\S]+?🛗 (?:Elevator|מעלית) (?:\?|→ ✅)/u.exec(text);
  if (!match) return null;
  const facts = match[0].split(' · ');
  if (facts.length !== 4) return null;
  return { before: text.slice(0, match.index), facts, after: text.slice(match.index + match[0].length) };
}

export function HotelStaySummary({ text }: { text: string }) {
  const stay = splitHotelStay(text);
  if (!stay) return <>{text}</>;
  return <span className="hotel-stay-summary">
    {stay.before && <span className="hotel-stay-note">{stay.before}</span>}
    <span className="hotel-stay-grid">{stay.facts.map((fact, i) => <span key={i} className="hotel-stay-fact" data-known={fact.endsWith('✅')}>{fact}</span>)}</span>
    {stay.after && <span className="hotel-stay-note">{stay.after}</span>}
  </span>;
}
