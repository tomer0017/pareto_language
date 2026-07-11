import { useMemo, useState } from 'react';
import { L, t } from '../../../shared/i18n/strings.js';
import { speak } from '../../../shared/audio/tts.js';
import { tap } from '../../../shared/ui/haptics.js';
import { feedback } from '../../../shared/ui/feedbackCue.js';
import { Feedback } from '../../../shared/ui/Feedback.js';
import type { GameWord } from '../types.js';

/**
 * Picture Quiz (Task 8) — show one word, four emoji options, tap the match. The component is
 * generic: hand it any GameWord[] (demo data today, Core 1500 tomorrow) and it builds rounds with
 * three distractor pictures each. Reuses the ONE global feedback system (chime/haptic/burst).
 * Architecture first — no content is hardcoded here.
 */
interface Round {
  word: GameWord;
  options: GameWord[]; // 4 words; the correct one's emoji is the answer
}

function buildRounds(words: GameWord[]): Round[] {
  const pool = words.filter((w) => w.emoji);
  return pool.map((word) => {
    const distractors = pool
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [word, ...distractors].sort(() => Math.random() - 0.5);
    return { word, options };
  });
}

export function PictureQuiz({ words, onDone }: { words: GameWord[]; onDone?: (score: number) => void }) {
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [burst, setBurst] = useState({ kind: 'correct' as 'correct' | 'wrong', n: 0 });
  const round = rounds[i];

  if (!round) {
    return (
      <div className="drill-card pop-in">
        <p style={{ fontSize: '3rem' }}>🎉</p>
        <p className="drill-phrase">{t('deckComplete')}</p>
        <p className="dim">{t('gameScore', { n: score, total: rounds.length })}</p>
        {onDone && <button className="btn-primary" onClick={() => onDone(score)} style={{ marginTop: 12 }}>{t('continue')}</button>}
      </div>
    );
  }

  const choose = (opt: GameWord): void => {
    if (picked) return;
    tap();
    const ok = opt.id === round.word.id;
    feedback(ok);
    setBurst({ kind: ok ? 'correct' : 'wrong', n: Date.now() });
    setPicked(opt.id);
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      setI((n) => n + 1);
    }, 900);
  };

  return (
    <>
      <div className="drill-card" style={{ minHeight: 200 }}>
        <p className="drill-label">{t('pictureQuizPrompt')}</p>
        <button className="btn-ghost" onClick={() => void speak(round.word.word, 'en')} style={{ margin: '0 auto' }}>
          <span className="drill-phrase" style={{ fontSize: '1.8rem' }}>🔊 {round.word.word}</span>
        </button>
        <p className="dim small">{L(round.word.translation)}</p>
      </div>
      <div className="pic-grid">
        {round.options.map((opt) => {
          const state = picked
            ? opt.id === round.word.id ? 'option-correct' : opt.id === picked ? 'option-wrong' : ''
            : '';
          return (
            <button key={opt.id} className={`pic-option ${state}`} onClick={() => choose(opt)} aria-label={opt.word}>
              {opt.emoji}
            </button>
          );
        })}
      </div>
      <Feedback kind={burst.kind} trigger={burst.n} />
    </>
  );
}
