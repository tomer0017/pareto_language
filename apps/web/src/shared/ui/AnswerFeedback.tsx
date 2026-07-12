import { useEffect, useState } from 'react';
import { t } from '../i18n/strings.js';
import { feedback } from './feedbackCue.js';
import { Feedback } from './Feedback.js';

/**
 * Reusable answer-feedback with FULL context (Part C) — the one learning-hierarchy surface shared
 * by quizzes, expected-reply drills, dialogue picks, ambushes and the Picture Quiz.
 *
 * The wrong-answer state restores the missing connection: WHAT YOU HEARD (original prompt +
 * translation + replay) → YOUR ANSWER (what you chose, red) → WHAT YOU SHOULD ANSWER (target +
 * translation + replay) → WHY (one line) → Try again / Continue. It never auto-advances.
 * The correct state stays fast: a short success + the answer + optional compact prompt + Continue.
 *
 * Layout-only + data-driven: callers pass structured context, so no exercise hardcodes the design.
 */
export interface AnswerParty {
  /** The line shown (target-language for prompt/expected; may be an emoji for picture games). */
  text: string;
  /** Learner-language translation, when available. */
  translation?: string;
  /** Replay this line's audio, when it has audio. */
  onReplay?: () => void;
}

export interface AnswerContext {
  /** The original question/sentence the learner was responding to ("What you heard"). */
  prompt?: AnswerParty;
  /** Exactly what the learner selected ("Your answer"). */
  selected?: AnswerParty;
  /** The response that fit ("What you should answer"). */
  expected: AnswerParty;
  /** One short sentence: why. */
  why?: string;
  /** Optional label overrides when the conversational role differs (kept a consistent hierarchy). */
  labels?: { heard?: string; your?: string; should?: string };
}

function Line({ party, big }: { party: AnswerParty; big?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      <span className="drill-phrase" style={{ fontSize: big ? '1.35rem' : '1.1rem' }}>“{party.text}”</span>
      {party.onReplay && (
        <button className="btn-ghost" style={{ minHeight: 36, padding: '4px 10px' }} onClick={party.onReplay} aria-label={t('replay')}>🔊</button>
      )}
    </div>
  );
}

export function AnswerFeedback({
  ok,
  ctx,
  onRetry,
  onContinue,
}: {
  ok: boolean;
  ctx: AnswerContext;
  onRetry?: () => void;
  onContinue: () => void;
}) {
  const [burst] = useState(() => Date.now());
  useEffect(() => { feedback(ok); }, [ok]);

  if (ok) {
    return (
      <>
        <div className="drill-card fx-correct pop-in" style={{ gap: 10, minHeight: 220 }}>
          <span className="feedback-head ok">✓ {t('correctHeader')}</span>
          <Line party={ctx.expected} big />
          {ctx.expected.translation && <p className="answer-pill">{ctx.expected.translation}</p>}
          {/* The strongest reinforcement is right after a CORRECT answer — keep the sentence
              replayable (learning-language audio), not just static text. When the prompt carries
              audio (Picture Quiz word, comprehension heard-line) show it with its replay button;
              otherwise keep the compact recap line. Replay never advances or records review. */}
          {ctx.prompt && (
            ctx.prompt.onReplay ? (
              <div>
                <p className="drill-label">{ctx.labels?.heard ?? t('whatYouHeard')}</p>
                <Line party={ctx.prompt} />
              </div>
            ) : (
              <p className="faint small">{t('whatYouHeard')}: “{ctx.prompt.text}”</p>
            )
          )}
        </div>
        <div className="action-zone">
          <button className="btn-primary" onClick={onContinue}>{t('nextBtn')}</button>
        </div>
        <Feedback kind="correct" trigger={burst} />
      </>
    );
  }

  return (
    <>
      <div className="drill-card fx-wrong pop-in" style={{ gap: 12, minHeight: 240, textAlign: 'center' }}>
        <span className="feedback-head bad">❌ {t('wrongHeader')}</span>

        {ctx.prompt && (
          <div>
            <p className="drill-label">{ctx.labels?.heard ?? t('whatYouHeard')}</p>
            <Line party={ctx.prompt} />
            {ctx.prompt.translation && <p className="dim small">{ctx.prompt.translation}</p>}
          </div>
        )}

        {ctx.selected && (
          <div>
            <p className="drill-label">{ctx.labels?.your ?? t('yourAnswerLabel')}</p>
            <p className="answer-pill answer-pill-bad">{ctx.selected.text}{ctx.selected.translation ? ` — ${ctx.selected.translation}` : ''}</p>
          </div>
        )}

        <div>
          <p className="drill-label">{ctx.labels?.should ?? t('whatYouShouldAnswer')}</p>
          <Line party={ctx.expected} />
          {ctx.expected.translation && <p className="answer-pill">{ctx.expected.translation}</p>}
        </div>

        {ctx.why && <p className="dim small"><strong>{t('whyLabel')}</strong> {ctx.why}</p>}
      </div>
      <div className="action-zone">
        <div className="btn-row">
          {onRetry && <button className="btn-secondary" onClick={onRetry}>{t('tryAgain')}</button>}
          <button className="btn-primary" onClick={onContinue}>{t('continue')}</button>
        </div>
      </div>
      <Feedback kind="wrong" trigger={burst} />
    </>
  );
}
