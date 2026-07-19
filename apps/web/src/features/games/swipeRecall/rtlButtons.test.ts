import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applySwipe } from './engine.js';

/**
 * Part 1 — RTL answer-button placement. The two answer buttons map to PHYSICAL swipe directions
 * (left card = "didn't know", right card = "knew it"), which are layout-independent. The env here is
 * headless node (no DOM/CSS layout), so we assert the two guarantees at the source level: (1) the row
 * is pinned LTR so the positive action is physically on the RIGHT and the negative on the LEFT in RTL
 * *and* LTR alike, with the arrows pointing outward; (2) the swipe SEMANTICS are untouched.
 */

const read = (rel: string): string => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

describe('SwipeRecall — RTL answer-button placement', () => {
  const src = read('./SwipeRecall.tsx');
  // Isolate the answer-button row.
  const row = src.slice(src.indexOf('recall-actions'), src.indexOf('</div>', src.indexOf('recall-actions')));

  // The full <button …>text</button> element that contains `marker` (search back to its own tag).
  const button = (marker: string): string => {
    const at = src.indexOf(marker);
    return src.slice(src.lastIndexOf('<button', at), src.indexOf('</button>', at));
  };

  it('renders "didn’t know" (physical left) with a LEFT arrow, committing left', () => {
    const neg = button("commit('left')");
    expect(neg).toContain('←');
    expect(neg).toContain("t('didntKnow')");
    expect(neg).not.toContain('→');
  });

  it('renders "knew it" (physical right) with a RIGHT arrow, committing right', () => {
    const pos = button("commit('right')");
    expect(pos).toContain('→');
    expect(pos).toContain("t('knewIt')");
    expect(pos).not.toContain('←');
  });

  it('the negative button appears before the positive one in DOM order', () => {
    expect(row.indexOf("didntKnow")).toBeLessThan(row.indexOf("knewIt"));
  });

  it('pins the row LTR so physical placement is constant across UI direction', () => {
    const css = read('../../../app/styles.css');
    expect(css).toMatch(/\.recall-actions\s*\{[^}]*direction:\s*ltr/);
  });

  it('leaves the swipe semantics unchanged: right = known (leaves round), left = unknown (returns)', () => {
    // A known card leaves the queue; an unknown card is re-queued further back (pure engine).
    const q = ['a', 'b', 'c'];
    expect(applySwipe(q, 'known')).not.toContain('a');
    expect(applySwipe(q, 'unknown')).toContain('a');
  });

  it('keyboard agrees with the buttons and swipe: ArrowRight = right/known, ArrowLeft = left/unknown', () => {
    const gc = read('../../../shared/ui/GestureCard.tsx');
    expect(gc).toMatch(/ArrowRight[^\n]*commit\('right'\)/);
    expect(gc).toMatch(/ArrowLeft[^\n]*commit\('left'\)/);
    // …and the buttons map the same physical directions (right → known-primary, left → unknown-secondary).
    expect(button("commit('right')")).toContain('btn-primary');
    expect(button("commit('left')")).toContain('btn-secondary');
  });
});
