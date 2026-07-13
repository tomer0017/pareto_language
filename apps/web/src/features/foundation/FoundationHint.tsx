import { useMemo } from 'react';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { segmentText } from './corpusIndex.js';
import { isFoundationWord } from './foundationContent.js';
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
  const openWord = useFoundationStore((s) => s.openWord);
  const dismiss = useFoundationStore((s) => s.dismiss);

  const candidate = useMemo<CoreWord | null>(() => {
    if (!index) return null;
    const seen = new Set<string>();
    for (const line of targets) {
      for (const seg of segmentText(line, index)) {
        const w = seg.word;
        if (!w || seen.has(w.conceptId)) continue;
        seen.add(w.conceptId);
        if (isFoundationWord(w) && !viewed.has(w.conceptId) && !dismissed.has(w.conceptId)) return w;
      }
    }
    return null;
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
        <button className="foundation-hint-learn" onClick={() => { tap(); openWord(candidate); }}>{t('foundationHintCta')}</button>
      </div>
    </div>
  );
}
