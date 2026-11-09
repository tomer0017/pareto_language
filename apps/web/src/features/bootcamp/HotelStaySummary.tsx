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

/**
 * The information boards (Missions 12–13), joined with " ¦ " to the label's own text:
 *   - the Time Strip — four time periods, the current one marked " ●" (Mission 12);
 *   - a route — "🧭 a → b → …", the current step marked " ●" (Mission 13's evening);
 *   - a two-column board — "<head>: row / row ‖ <head>: row / row / …", a row is "?" (or "—") until
 *     the conversation says it (Mission 12's planner, Mission 13's Home Visit board, Mission 14's
 *     Restaurant Ticket).
 * Only presentation: every value is already in the text; nothing is inferred or added.
 */
const STRIP = /^☀️ (?:Now|עכשיו) · .+ → .+ → .+ → 🌅 (?:Tomorrow morning|מחר בבוקר)(?: ●)?$/u;
const ROUTE = /^🧭 .+$/u;
const PLAN = /^(\S+ [^:‖]+): (.+?) ‖ (\S+ [^:‖]+): (.+)$/u;
export interface TimeBoard {
  strip: { text: string; now: boolean }[] | null;
  route: { text: string; now: boolean }[] | null;
  plan: { day: string; rows: { text: string; known: boolean }[] }[] | null;
  /** The label's own text: what comes before the board, and after it. */
  before: string[];
  after: string[];
}
export function splitTimeBoard(text: string): TimeBoard | null {
  const parts = text.split(' ¦ ');
  const strip = parts.find((p) => STRIP.test(p));
  const route = parts.find((p) => ROUTE.test(p));
  const plan = parts.map((p) => PLAN.exec(p)).find((m) => m !== null);
  if (!strip && !route && !plan) return null;
  // A row is unknown while it holds "?" — or "—" (nothing yet: Mission 14's bill) — or is still
  // pending ("…": Mission 15's kitchen check, which the conversation never resolves).
  const row = (t: string) => ({ text: t, known: !t.includes('?') && !t.endsWith(' —') && !t.endsWith('…') });
  const cells = (p: string) => p.split(' → ').map((c) => ({ text: c.replace(/ ●$/u, ''), now: c.endsWith(' ●') }));
  const isBoard = (p: string): boolean => STRIP.test(p) || ROUTE.test(p) || PLAN.test(p);
  const first = parts.findIndex(isBoard);
  return {
    strip: strip ? cells(strip) : null,
    route: route ? cells(route.slice('🧭 '.length)) : null,
    plan: plan ? [{ day: plan[1]!, rows: plan[2]!.split(' / ').map(row) }, { day: plan[3]!, rows: plan[4]!.split(' / ').map(row) }] : null,
    before: parts.slice(0, first),
    after: parts.slice(first).filter((p) => !isBoard(p)),
  };
}

export function HotelStaySummary({ text }: { text: string }) {
  const board = splitTimeBoard(text);
  if (board) return <span className="hotel-stay-summary time-board">
    {board.before.map((n, i) => <span key={`b${i}`} className="hotel-stay-note">{n}</span>)}
    {board.strip && <span className="time-strip" role="list">{board.strip.map((c, i) => <span key={i} role="listitem" className="time-strip-cell" data-now={c.now} aria-current={c.now ? 'time' : undefined}>{c.text}</span>)}</span>}
    {board.route && <span className="time-strip is-route" role="list" aria-label="🧭">{board.route.map((c, i) => <span key={i} role="listitem" className="time-strip-cell" data-now={c.now} aria-current={c.now ? 'step' : undefined}>{c.text}</span>)}</span>}
    {board.plan && <span className="plan-card">{board.plan.map((d) => <span key={d.day} className="plan-day"><span className="plan-day-head">{d.day}</span>{d.rows.map((r, i) => <span key={i} className="plan-day-row" data-known={r.known}>{r.text}</span>)}</span>)}</span>}
    {board.after.map((n, i) => <span key={`a${i}`} className="hotel-stay-note">{n}</span>)}
  </span>;
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
