import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { BackButton } from '../../shared/ui/PageHeader.js';
import { SentenceFlashcards } from './SentenceFlashcards.js';
import { useSentenceProgress } from './useSentenceProgress.js';

/**
 * Quick Review — a short flashcard refresh of sentences the learner has actually practiced, chosen
 * from their real review log (`useSentenceProgress`). It reuses the sentence flashcards as-is; there
 * is no second review engine and no content of its own.
 */
export function QuickReview() {
  const navigate = useAppStore((s) => s.navigate);
  const { reviewCards, ready } = useSentenceProgress();
  const back = (): void => navigate('home');

  return (
    <div className="screen">
      {reviewCards.length === 0 ? (
        <>
          <div className="topbar"><BackButton onBack={back} /><span className="chip">{t('quickReviewTitle')}</span><span style={{ width: 44 }} /></div>
          {ready && (
            <div className="drill-card pop-in center">
              <p className="drill-meaning">{t('quickReviewEmpty')}</p>
            </div>
          )}
        </>
      ) : (
        <SentenceFlashcards cards={reviewCards} onBack={back} />
      )}
    </div>
  );
}
