import { useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { buildSentenceDeck, type FlashCard } from './flashcards.js';
import { canonicalSentenceId } from './phraseGroups.js';
import { pickReviewCards, practicedIds } from './review.js';
import { useReviewLog } from './useReviewLog.js';

/** How many sentences one Quick Review holds — short on purpose (a refresh, not a lesson). */
export const QUICK_REVIEW_SIZE = 5;

export interface SentenceProgress {
  /** Canonical core sentences in the active learning language (the one count every screen shows). */
  total: number;
  /** Sentences drilled at least once, or null until the review log has loaded. "Practiced" is all the
   *  log can honestly support — it is not "learned" or "mastered". */
  practiced: number | null;
  /** The few practiced sentences most worth a refresh (empty until something was practiced). */
  reviewCards: FlashCard[];
  /** False until the log has loaded. */
  ready: boolean;
}

/** Sentence-level progress for the ACTIVE learning language, from the canonical catalog + the real
 *  review log. Home, Travel Readiness and Quick Review all read this, so their numbers agree. */
export function useSentenceProgress(): SentenceProgress {
  const learningLang = useAppStore((s) => s.learningLang);
  const log = useReviewLog();
  return useMemo(() => {
    const deck = buildSentenceDeck(learningLang);
    const canonical = (id: string): string => canonicalSentenceId(learningLang, id);
    return {
      total: deck.length,
      practiced: log ? practicedIds(deck, log, canonical).size : null,
      reviewCards: log ? pickReviewCards(deck, log, QUICK_REVIEW_SIZE, canonical) : [],
      ready: log !== null,
    };
  }, [learningLang, log]);
}
