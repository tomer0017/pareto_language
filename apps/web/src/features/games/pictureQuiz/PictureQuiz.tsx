import { useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { AnswerFeedback } from '../../../shared/ui/AnswerFeedback.js';
import { buildRespondContext } from '../../../shared/ui/answerContext.js';
import { recordReview } from '../../../shared/review/recordReview.js';
import { advanceQuiz, buildSession, DEFAULT_SESSION_SIZE, type QuizProgress } from './rounds.js';
import type { GameWord } from '../types.js';

/**
 * Picture Quiz (Beta polish — real game session). A full N-question round: randomized, no concept
 * repeats within a session (buildSession), a progress counter, the shared full-context feedback (no
 * auto-advance), review events per answer, then a Victory screen with Play Again / Back to Core
 * Words. Session size is configurable (defaults, clamped to available words) so the same component
 * serves Core 100 → 500 → 1500 unchanged.
 */
export function PictureQuiz({
  words,
  lang = 'en',
  sessionSize = DEFAULT_SESSION_SIZE,
  onExit,
}: {
  words: GameWord[];
  /** The learning language whose voice speaks each word (fr-FR, en-…). Defaults to English. */
  lang?: string;
  sessionSize?: number;
  onExit?: () => void;
}) {
  // A session is a fixed randomized set (words is stable once the pack has loaded). Play Again
  // reshuffles a brand-new session.
  const [rounds, setRounds] = useState(() => buildSession(words, sessionSize));
  const [progress, setProgress] = useState<QuizProgress>({ i: 0, score: 0 });
  const [picked, setPicked] = useState<GameWord | null>(null);
  const round = rounds[progress.i];

  const playAgain = (): void => { tap(); setRounds(buildSession(words, sessionSize)); setProgress({ i: 0, score: 0 }); setPicked(null); };

  // Victory — the session is complete.
  if (!round) {
    return (
      <div className="drill-card pop-in center" style={{ gap: 10 }}>
        <p style={{ fontSize: '3.4rem' }}>🎉</p>
        <p className="drill-phrase" style={{ fontSize: '1.4rem' }}>{t('victoryTitle')}</p>
        <p className="dim">{t('quizScore', { n: progress.score, total: rounds.length })}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, width: '100%' }}>
          <button className="btn-primary" onClick={playAgain}>🔁 {t('playAgain')}</button>
          {onExit && <button className="btn-secondary" onClick={() => { tap(); onExit(); }}>{t('backToWords')}</button>}
        </div>
      </div>
    );
  }

  // Answered — full-context feedback, explicit action to advance.
  if (picked) {
    const ok = picked.id === round.word.id;
    const ctx = buildRespondContext({
      promptText: round.word.word, promptTranslation: L(round.word.translation), onReplayPrompt: () => void speak(round.word.word, lang),
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
        onContinue={() => { setPicked(null); setProgress((p) => advanceQuiz(p, ok)); }}
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
      <p className="dim small center" style={{ margin: '0 0 6px' }}>{t('quizProgress', { i: progress.i + 1, n: rounds.length })}</p>
      <div className="drill-card" style={{ minHeight: 170 }}>
        <p className="drill-label">{t('pictureQuizPrompt')}</p>
        <button className="btn-ghost" onClick={() => void speak(round.word.word, lang)} style={{ margin: '0 auto' }}>
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
