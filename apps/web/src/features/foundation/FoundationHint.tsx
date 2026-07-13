import { useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { missionFoundationWords } from './foundationContent.js';
import { useCoreWords } from './useCoreWords.js';
import { useFoundationStore } from './foundationStore.js';

/**
 * Smart Foundation Detection. Given the learning-language text the learner is meeting right now
 * (`targets`), surface the FIRST Foundation building block they have never viewed — as a tiny,
 * non-blocking hint ("🛟 Missing Foundation Brick"). Learn now opens the shared word sheet; Dismiss
 * suppresses it forever. It NEVER blocks progression: when there is nothing new, it renders nothing.
 */
export function FoundationHint({ targets }: { targets: string[] }) {
  const learningLang = useAppStore((s) => s.learningLang);
  const { index } = useCoreWords(learningLang);
  const viewed = useFoundationStore((s) => s.viewed);
  const dismissed = useFoundationStore((s) => s.dismissed);
  const openSession = useFoundationStore((s) => s.openSession);
  const dismiss = useFoundationStore((s) => s.dismiss);

  // ALL Foundation building blocks in this mission (the guided session's deck), plus the first the
  // learner has not viewed/dismissed — the one the hint nudges and where "Learn now" starts.
  const { deck, startIndex, candidate } = useMemo(() => {
    if (!index) return { deck: [], startIndex: 0, candidate: null };
    const words = missionFoundationWords(targets, index);
    const i = words.findIndex((w) => !viewed.has(w.conceptId) && !dismissed.has(w.conceptId));
    return { deck: words, startIndex: Math.max(i, 0), candidate: i === -1 ? null : words[i] };
  }, [index, targets, viewed, dismissed]);

  if (!candidate) return null;
  return (
    <div className="foundation-hint fade-in" role="note">
      <div className="foundation-hint-body">
        <span className="foundation-hint-title">🛟 {t('foundationHintTitle')}</span>
        <span className="foundation-hint-word" dir="auto">
          {candidate.word} · {t('foundationHintLearn')}
        </span>
      </div>
      <div className="foundation-hint-actions">
        <button className="foundation-hint-dismiss" onClick={() => { tap(); dismiss(candidate.conceptId); }}>{t('foundationHintDismiss')}</button>
        <button className="foundation-hint-learn" onClick={() => { tap(); openSession(deck, startIndex); }}>{t('foundationHintCta')}</button>
      </div>
    </div>
  );
}
