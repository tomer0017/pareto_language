import { describe, expect, it } from 'vitest';
import { buildSentenceDeck } from './flashcards.js';
import { pickReviewCards, practicedIds, type ReviewLogEntry } from './review.js';

/**
 * Quick Review and the "core sentences practiced" count come ONLY from the learner's real review
 * log. No log → nothing practiced, nothing to review (the UI shows a neutral state, never a number).
 */
const deck = buildSentenceDeck('en');
const ev = (itemId: string, outcome: string, at: string): ReviewLogEntry => ({ itemId, outcome, at });
const [a, b, c, d] = deck.map((card) => card.id);

describe('practicedIds — "practiced" means actually drilled', () => {
  it('is empty for a new learner', () => {
    expect(practicedIds(deck, []).size).toBe(0);
  });
  it('counts each drilled sentence once, however often it was answered', () => {
    const log = [ev(a!, 'pass', '2026-01-01T10:00:00Z'), ev(a!, 'fail', '2026-01-02T10:00:00Z'), ev(b!, 'pass', '2026-01-02T11:00:00Z')];
    expect(practicedIds(deck, log)).toEqual(new Set([a, b]));
  });
  it('ignores events for items that are not sentences of this language', () => {
    expect(practicedIds(deck, [ev('fr.phrase.social.my-name', 'pass', '2026-01-01T10:00:00Z'), ev('word.en.coffee', 'pass', '2026-01-01T10:00:00Z')]).size).toBe(0);
  });
});

describe('pickReviewCards — the few sentences worth a refresh', () => {
  it('offers nothing when nothing was practiced', () => {
    expect(pickReviewCards(deck, [], 5)).toEqual([]);
  });
  it('only ever offers practiced sentences, at most n', () => {
    const log = deck.slice(0, 9).map((card, i) => ev(card.id, 'pass', `2026-01-0${i + 1}T10:00:00Z`));
    const picked = pickReviewCards(deck, log, 5);
    expect(picked).toHaveLength(5);
    const practiced = practicedIds(deck, log);
    for (const card of picked) expect(practiced.has(card.id)).toBe(true);
    expect(pickReviewCards(deck, log.slice(0, 2), 5)).toHaveLength(2);
    expect(pickReviewCards(deck, log, 0)).toEqual([]);
  });
  it('puts a sentence whose LATEST answer was a miss first; then the least recently practiced', () => {
    const log = [
      ev(a!, 'pass', '2026-01-01T10:00:00Z'),
      ev(b!, 'pass', '2026-01-05T10:00:00Z'),
      ev(c!, 'fail', '2026-01-03T10:00:00Z'),
      ev(d!, 'fail', '2026-01-02T10:00:00Z'),
      ev(d!, 'pass', '2026-01-06T10:00:00Z'), // d recovered: its latest answer is a pass
    ];
    expect(pickReviewCards(deck, log, 5).map((card) => card.id)).toEqual([c, a, b, d]);
  });
  it('returns the canonical cards themselves (no copies of content)', () => {
    const picked = pickReviewCards(deck, [ev(a!, 'partial', '2026-01-01T10:00:00Z')], 5);
    expect(picked[0]).toBe(deck[0]);
  });
});

describe('Home does not show an empty Quick Review', () => {
  it('with nothing practiced there is nothing to review — and Home renders no review card', async () => {
    const { readFileSync } = await import('node:fs');
    expect(pickReviewCards(deck, [], 5)).toEqual([]);
    const home = readFileSync(new URL('../home/Home.tsx', import.meta.url), 'utf8');
    const review = home.slice(home.indexOf('Quick review:'), home.indexOf('Quick listen */'));
    expect(review).toContain('{reviewCount > 0 && (');
    expect(review).not.toContain('disabled=');
    expect(home).not.toContain("t('quickReviewEmpty')"); // no placeholder card on Home either
  });
});
