import { useMemo, useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { AnswerFeedback } from '../../../shared/ui/AnswerFeedback.js';
import { buildRespondContext } from '../../../shared/ui/answerContext.js';
import { recordReview } from '../../../shared/review/recordReview.js';
import { buildRounds } from './rounds.js';
import type { GameWord } from '../types.js';

/**
 * Picture Quiz (Part B2) — show one English word, four emoji options, tap the match. Generic over
 * any GameWord[] (now the real Core 100). Round construction lives in rounds.ts (pure, tested). On
 * answer it shows the shared full-context AnswerFeedback (no auto-advance — explicit Continue/Try
 * again) and records a review event through the canonical log.
 */

export function PictureQuiz({ words, onDone }: { words: GameWord[]; onDone?: (score: number) => void }) {
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<GameWord | null>(null);
  const [score, setScore] = useState(0);
  const round = rounds[i];

  if (!round) {
    return (
      <div className="drill-card pop-in center">
        <p style={{ fontSize: '3rem' }}>🎉</p>
        <p className="drill-phrase">{t('deckComplete')}</p>
        <p className="dim">{t('gameScore', { n: score, total: rounds.length })}</p>
        {onDone && <button className="btn-primary" onClick={() => onDone(score)} style={{ marginTop: 12 }}>{t('continue')}</button>}
      </div>
    );
  }

  // Answered — full-context feedback, explicit action to advance.
  if (picked) {
    const ok = picked.id === round.word.id;
    const ctx = buildRespondContext({
      promptText: round.word.word, promptTranslation: L(round.word.translation), onReplayPrompt: () => void speak(round.word.word, 'en'),
      chosen: ok ? undefined : picked.emoji,
      expectedText: round.word.emoji, expectedTranslation: L(round.word.translation),
      why: t('meansMapping', { en: round.word.word, meaning: L(round.word.translation) }),
      labels: { should: t('correctAnswerLabel') },
    });
    return (
      <AnswerFeedback
        ok={ok}
        ctx={ctx}
        onRetry={ok ? undefined : () => setPicked(null)}
        onContinue={() => { if (ok) setScore((s) => s + 1); setPicked(null); setI((n) => n + 1); }}
      />
    );
  }

  const choose = (opt: GameWord): void => {
    tap();
    const ok = opt.id === round.word.id;
    recordReview(round.word.id, 'flashRecall', ok ? 'pass' : 'fail');
    setPicked(opt);
  };

  return (
    <>
      <div className="drill-card" style={{ minHeight: 180 }}>
        <p className="drill-label">{t('pictureQuizPrompt')}</p>
        <button className="btn-ghost" onClick={() => void speak(round.word.word, 'en')} style={{ margin: '0 auto' }}>
          <span className="drill-phrase" style={{ fontSize: '1.8rem' }}>🔊 {round.word.word}</span>
        </button>
        <p className="dim small">{L(round.word.translation)}</p>
      </div>
      <div className="pic-grid">
        {round.options.map((opt) => (
          <button key={opt.id} className="pic-option" onClick={() => choose(opt)} aria-label={opt.word}>
            {opt.emoji}
          </button>
        ))}
      </div>
    </>
  );
}
