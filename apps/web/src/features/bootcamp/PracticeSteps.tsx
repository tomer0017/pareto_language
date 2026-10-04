import { useEffect, useMemo, useRef, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { AnswerFeedback } from '../../shared/ui/AnswerFeedback.js';
import { buildRespondContext } from '../../shared/ui/answerContext.js';
import { feedbackWrong } from '../../shared/ui/feedbackCue.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { mulberry32, sessionSeed, shuffle } from '../../shared/util/shuffle.js';
import { TargetText } from '../foundation/TappableText.js';
import { useBootcampStore } from './bootcampStore.js';
import { dialogueTr } from './i18n.js';
import { CompanionReaction } from '../companion/Companion.js';
import {
  builderHint, builderPool, builderSentence, builderSolved, fillFrame, frameParts, isHelpToolId, matchAnswerOrder, matchRecord, matchSpeaks, matchTap, newMatch,
  quickReplyLabel, quickReplyPrompt, type MatchSide, type StepOf,
} from './practiceEngines.js';
import type { BootcampItem, MapCell } from './types.js';

/**
 * The active-practice engines. Each is a generic, data-driven step: the mission supplies
 * rounds, the engine supplies the interaction. They share one rhythm — hear (or read a cue) → act →
 * see what it was → next — and READY's rule that a wrong answer teaches and never traps: "Try
 * again" and "Continue" are always both there. No translation is shown before the learner acts.
 */

const speakL = (text: string, rate?: number): ReturnType<typeof speak> => speak(text, useAppStore.getState().learningLang, rate);

/** "2 of 5" under a step title. */
function Progress({ i, n }: { i: number; n: number }) {
  return n > 1 ? <p className="faint small">{t('roundOf', { i: i + 1, n })}</p> : null;
}

/* ── Quick Reply ─────────────────────────────────────────────────────────────────────────────── */

/** Hear a question (or read a situation) → tap what YOU say. Buttons are target-language lines. */
export function QuickReplyStep({ step, itemsById, onDone }: { step: StepOf<'quickReply'>; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [seed] = useState(sessionSeed);
  const shownAt = useRef(0);
  const round = step.rounds[i]!;
  const prompt = quickReplyPrompt(round, itemsById);
  const options = useMemo(() => shuffle(round.options, mulberry32(seed + i)), [round, seed, i]);

  useEffect(() => {
    shownAt.current = Date.now();
    if (prompt.spoken) void speakL(prompt.spoken.en);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const next = (): void => {
    setPicked(null);
    if (i + 1 >= step.rounds.length) onDone();
    else setI(i + 1);
  };

  if (picked !== null) {
    const chosen = round.options.find((o) => o.itemId === picked)!;
    const fit = chosen.correct ? chosen : round.options.find((o) => o.correct)!;
    const fitItem = itemsById.get(fit.itemId)!;
    const fitText = quickReplyLabel(fit, itemsById);
    const ctx = buildRespondContext({
      promptText: prompt.spoken?.en ?? (round.situation ? L(round.situation) : undefined),
      promptTranslation: prompt.spoken ? dialogueTr(prompt.spoken) : undefined,
      onReplayPrompt: prompt.spoken ? () => void speakL(prompt.spoken!.en) : undefined,
      chosen: chosen.correct ? undefined : quickReplyLabel(chosen, itemsById),
      chosenTranslation: chosen.correct ? undefined : L(itemsById.get(chosen.itemId)!.meaning),
      expectedText: fitText, expectedTranslation: L(fitItem.meaning), onReplayExpected: () => void speakL(fitText),
      why: fitItem.tip ? L(fitItem.tip) : t('meansMapping', { en: fitItem.text, meaning: L(fitItem.meaning) }),
    });
    // Choosing a conversation-help tool where it is accepted is a win of its own — the companion says so.
    const kind = !chosen.correct ? 'encouraging' : isHelpToolId(chosen.itemId) ? 'recovery' : 'correct';
    return (
      <AnswerFeedback ok={chosen.correct} ctx={ctx} onRetry={chosen.correct ? undefined : () => setPicked(null)} onContinue={next}
        aside={<CompanionReaction kind={kind} text={kind === 'correct' ? false : undefined} size={40} />} />
    );
  }

  return (
    <>
      <div className="drill-card practice-card">
        <p className="drill-label">{step.label ? L(step.label) : t(round.situation ? 'quickReplySituation' : 'quickReplyTitle')}</p>
        <Progress i={i} n={step.rounds.length} />
        {round.situation ? <p className="drill-phrase" style={{ fontSize: '1.2rem' }}>{L(round.situation)}</p> : <p style={{ fontSize: '2.6rem' }}>👂</p>}
      </div>
      <div className="action-zone">
        {options.map((o) => (
          <button key={o.itemId} className="btn-secondary" onClick={() => {
            tap();
            if (o.correct) success(); else feedbackWrong();
            const scored = o.correct ? o.itemId : round.options.find((x) => x.correct)!.itemId;
            bc.recordDrill(scored, 'simulator', o.correct ? 'pass' : 'fail', Date.now() - shownAt.current);
            setPicked(o.itemId);
            if (o.correct) void speakL(quickReplyLabel(o, itemsById), 0.92);
          }}>
            <TargetText text={quickReplyLabel(o, itemsById)} />
          </button>
        ))}
        {prompt.spoken && <button className="btn-ghost" onClick={() => void speakL(prompt.spoken!.en)}>🔊 {t('hearAgain')}</button>}
      </div>
    </>
  );
}

/* ── shared result strip for the board engines ───────────────────────────────────────────────── */

function Heard({ ok, text, gloss, onReplay }: { ok: boolean; text: string; gloss: string; onReplay: () => void }) {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
      <span className={`feedback-head ${ok ? 'ok' : 'bad'}`}>{ok ? `✓ ${t('correctHeader')}` : `❌ ${t('wrongHeader')}`}</span>
      <CompanionReaction kind={ok ? 'correct' : 'encouraging'} text={ok ? false : undefined} size={40} />
      <p className="drill-phrase" style={{ fontSize: '1.15rem' }}><TargetText text={text} /></p>
      <p className="drill-meaning" style={{ fontSize: '0.95rem' }}>{gloss}</p>
      <button className="btn-ghost" style={{ minHeight: 36, padding: '4px 10px' }} onClick={onReplay} aria-label={t('replayAudio')}>🔊</button>
    </div>
  );
}

function ResultActions({ ok, last, onRetry, onNext }: { ok: boolean; last: boolean; onRetry: () => void; onNext: () => void }) {
  return (
    <div className="action-zone">
      {!ok && <button className="btn-secondary" onClick={onRetry}>{t('tryAgain')}</button>}
      <button className="btn-primary" onClick={onNext}>{last || !ok ? t('continue') : t('nextBtn')}</button>
    </div>
  );
}

/* ── Visual Match ────────────────────────────────────────────────────────────────────────────── */

/** Hear it → tap the tile that shows it. One 3×3 board, shuffled once, reused across the rounds. */
export function VisualMatchStep({ step, onDone }: { step: StepOf<'visualMatch'>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [tiles] = useState(() => shuffle(step.tiles, mulberry32(sessionSeed())));
  const shownAt = useRef(0);
  const round = step.rounds[i]!;
  const rate = step.challenge ? 1.12 : undefined;
  const play = (): void => void speakL(round.audio.en, rate);

  useEffect(() => {
    shownAt.current = Date.now();
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const ok = picked === round.correct;
  const last = i + 1 >= step.rounds.length;
  return (
    <>
      <div className="drill-card practice-card">
        <p className="drill-label">{step.challenge ? `⚡ ${t('speedHeadsUp')}` : step.label ? L(step.label) : t('visualMatchTitle')}</p>
        <Progress i={i} n={step.rounds.length} />
        <div className="pgrid">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              className={`ptile ${picked !== null && tile.id === round.correct ? 'is-ok' : ''} ${picked === tile.id && !ok ? 'is-bad' : ''}`}
              disabled={picked !== null}
              onClick={() => {
                tap();
                const right = tile.id === round.correct;
                if (right) success(); else feedbackWrong();
                if (round.itemId) bc.recordDrill(round.itemId, 'numberSprint', right ? 'pass' : 'fail', Date.now() - shownAt.current);
                setPicked(tile.id);
              }}
            >
              {tile.emoji && <span className="ptile-emoji" aria-hidden>{tile.emoji}</span>}
              {tile.label && <span dir="ltr">{tile.label}</span>}
            </button>
          ))}
        </div>
        {picked !== null && <Heard ok={ok} text={round.audio.en} gloss={dialogueTr(round.audio)} onReplay={() => void speakL(round.audio.en)} />}
      </div>
      {picked === null ? (
        <div className="action-zone">
          <button className="btn-ghost" onClick={() => void speakL(round.audio.en, step.challenge ? 0.85 : undefined)}>🔊 {t('hearAgain')}</button>
        </div>
      ) : (
        <ResultActions ok={ok} last={last} onRetry={() => { setPicked(null); play(); }} onNext={() => { setPicked(null); if (last) onDone(); else setI(i + 1); }} />
      )}
    </>
  );
}

/* ── Swap It ─────────────────────────────────────────────────────────────────────────────────── */

/** One frame, several endings: pick the ending that says what the cue shows. The completed sentence
 *  is then spoken and glossed — also for a "wrong" pick, which is still a real sentence. */
export function SwapStep({ step, onDone }: { step: StepOf<'swap'>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [seed] = useState(sessionSeed);
  const shownAt = useRef(0);
  const round = step.rounds[i]!;
  const options = useMemo(() => shuffle(round.options, mulberry32(seed + i)), [round, seed, i]);
  const [before, after] = frameParts(round.frame);
  const chosen = round.options.find((o) => o.slot === picked);
  const last = i + 1 >= step.rounds.length;

  useEffect(() => {
    shownAt.current = Date.now();
  }, [i]);

  return (
    <>
      <div className="drill-card practice-card">
        <p className="drill-label">{step.label ? L(step.label) : t('swapTitle')}</p>
        <Progress i={i} n={step.rounds.length} />
        <p style={{ fontSize: '2.4rem' }} aria-hidden>{round.cue.emoji}</p>
        <p className="drill-meaning">{L(round.cue.text)}</p>
        <p className="pframe">
          {before}<span className="pslot">{chosen ? chosen.slot : ' '}</span>{after}
        </p>
        {chosen && (
          <Heard ok={chosen.correct} text={fillFrame(round.frame, chosen.slot)} gloss={L(chosen.meaning)} onReplay={() => void speakL(fillFrame(round.frame, chosen.slot))} />
        )}
      </div>
      {!chosen ? (
        <div className="action-zone">
          {options.map((o) => (
            <button key={o.slot} className="btn-secondary" onClick={() => {
              tap();
              if (o.correct) success(); else feedbackWrong();
              if (round.itemId) bc.recordDrill(round.itemId, 'flashRecall', o.correct ? 'pass' : 'fail', Date.now() - shownAt.current);
              setPicked(o.slot);
              void speakL(fillFrame(round.frame, o.slot), 0.92);
            }}>
              <TargetText text={o.slot} />
            </button>
          ))}
        </div>
      ) : (
        <ResultActions ok={chosen.correct} last={last} onRetry={() => setPicked(null)} onNext={() => { setPicked(null); if (last) onDone(); else setI(i + 1); }} />
      )}
    </>
  );
}

/* ── Mini Map ────────────────────────────────────────────────────────────────────────────────── */

const GRID: readonly (readonly [0 | 1 | 2, 0 | 1 | 2])[] = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];

/** Hear a direction → act on it: tap the way to go, or the spot it describes. */
export function MiniMapStep({ step, onDone }: { step: StepOf<'miniMap'>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const shownAt = useRef(0);
  const round = step.rounds[i]!;
  const rate = step.challenge ? 1.12 : undefined;
  const play = (): void => void speakL(round.audio.en, rate);
  const at = (row: number, col: number): MapCell | undefined => round.cells.find((c) => c.row === row && c.col === col);

  useEffect(() => {
    shownAt.current = Date.now();
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const ok = picked === round.correct;
  const last = i + 1 >= step.rounds.length;
  return (
    <>
      <div className="drill-card practice-card">
        <p className="drill-label">{step.challenge ? `⚡ ${t('speedHeadsUp')}` : step.label ? L(step.label) : t('miniMapTitle')}</p>
        <Progress i={i} n={step.rounds.length} />
        {/* The map is a picture, not text: it keeps one orientation in Hebrew and English alike. */}
        <div className="pgrid" dir="ltr">
          {GRID.map(([row, col]) => {
            const cell = at(row, col);
            const inner = cell && (
              <>
                {cell.emoji && <span className="ptile-emoji" aria-hidden>{cell.emoji}</span>}
                {cell.label && <span className="ptile-label">{cell.label}</span>}
              </>
            );
            if (!cell) return <span key={`${row}${col}`} className="ptile is-road" aria-hidden />;
            if (!cell.tappable) return <span key={cell.id} className="ptile is-static">{inner}</span>;
            return (
              <button
                key={cell.id}
                className={`ptile ${picked !== null && cell.id === round.correct ? 'is-ok' : ''} ${picked === cell.id && !ok ? 'is-bad' : ''}`}
                disabled={picked !== null}
                aria-label={cell.id}
                onClick={() => {
                  tap();
                  const right = cell.id === round.correct;
                  if (right) success(); else feedbackWrong();
                  if (round.itemId) bc.recordDrill(round.itemId, 'listen', right ? 'pass' : 'fail', Date.now() - shownAt.current);
                  setPicked(cell.id);
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>
        {picked !== null && <Heard ok={ok} text={round.audio.en} gloss={dialogueTr(round.audio)} onReplay={() => void speakL(round.audio.en)} />}
      </div>
      {picked === null ? (
        <div className="action-zone">
          <button className="btn-ghost" onClick={() => void speakL(round.audio.en, step.challenge ? 0.85 : undefined)}>🔊 {t('hearAgain')}</button>
        </div>
      ) : (
        <ResultActions ok={ok} last={last} onRetry={() => { setPicked(null); play(); }} onNext={() => { setPicked(null); if (last) onDone(); else setI(i + 1); }} />
      )}
    </>
  );
}

/* ── Match Pairs ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Connect each question you HEAR to the line you SAY. Two groups of tiles: tap one, then its
 * partner (either order). A right pair locks under a shared number; a wrong one shakes and lets go.
 * The board is laid out left-to-right in every app language — it shows target-language sentences.
 */
export function MatchPairsStep({ step, itemsById, onDone }: { step: StepOf<'matchPairs'>; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [state, setState] = useState(newMatch);
  const [miss, setMiss] = useState<{ side: MatchSide; pair: number } | null>(null);
  const [answerOrder] = useState(() => matchAnswerOrder(step.pairs.length, sessionSeed()));
  const complete = state.matched.length >= step.pairs.length;
  const promptText = (i: number): string => itemsById.get(step.pairs[i]!.promptItemId)?.text ?? '';
  const answerText = (i: number): string => step.pairs[i]!.answerText ?? itemsById.get(step.pairs[i]!.answerItemId)?.text ?? '';

  const onTap = (side: MatchSide, pair: number): void => {
    tap();
    const result = matchTap(step.pairs.length, state, side, pair);
    const record = matchRecord(step.pairs, result);
    if (record) bc.recordDrill(record.itemId, 'simulator', record.outcome);
    if (result.outcome === 'matched') success();
    if (result.outcome === 'missed') { feedbackWrong(); setMiss({ side, pair }); setTimeout(() => setMiss(null), 450); }
    const heard = matchSpeaks(result, side);
    if (heard === 'answer') void speakL(answerText(pair), 0.92);
    if (heard === 'prompt') void speakL(promptText(pair));
    setState(result.state);
  };

  const tile = (side: MatchSide, pair: number) => {
    const order = state.matched.indexOf(pair);
    const matched = order !== -1;
    const picked = state.picked?.side === side && state.picked.pair === pair;
    const missed = miss?.side === side && miss.pair === pair;
    return (
      <button
        key={`${side}-${pair}`}
        className={`pmatch-tile ${picked ? 'is-picked' : ''} ${matched ? 'is-matched' : ''} ${missed ? 'is-miss' : ''}`}
        disabled={matched}
        aria-pressed={picked}
        onClick={() => onTap(side, pair)}
      >
        <span className="pmatch-mark" aria-hidden>{matched ? order + 1 : missed ? '✕' : picked ? '●' : side === 'prompt' ? '👂' : '🗣️'}</span>
        <span dir="ltr"><TargetText text={side === 'prompt' ? promptText(pair) : answerText(pair)} /></span>
      </button>
    );
  };

  return (
    <>
      <div className="drill-card practice-card">
        <p className="drill-label">{step.label ? L(step.label) : t('matchTitle')}</p>
        <div className="pmatch" dir="ltr">
          {step.pairs.map((_, i) => tile('prompt', i))}
          <span className="pmatch-sep" aria-hidden />
          {answerOrder.map((i) => tile('answer', i))}
        </div>
        {complete && <CompanionReaction kind="celebrate" size={44} />}
      </div>
      {complete && (
        <div className="action-zone">
          <button className="btn-primary" onClick={onDone}>{t('continue')}</button>
        </div>
      )}
    </>
  );
}

/* ── Sentence Builder ────────────────────────────────────────────────────────────────────────── */

/**
 * Rebuild a sentence the mission already taught. Its meaning is the cue; the chunks are tapped into
 * place (tap a placed chunk to take it back). Check appears once every chunk is used. A miss keeps
 * the learner in control: nothing is revealed, a hint is offered after one miss, and after two the
 * learner may simply continue. The chunks are the language's own, authored — never generated.
 */
export function SentenceBuilderStep({ step, itemsById, onDone }: { step: StepOf<'sentenceBuilder'>; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [status, setStatus] = useState<'building' | 'wrong' | 'right' | 'shown'>('building');
  const [misses, setMisses] = useState(0);
  const [seed] = useState(sessionSeed);
  const round = step.rounds[i]!;
  const item = itemsById.get(round.itemId)!;
  const pool = useMemo(() => builderPool(round.chunks, seed + i), [round, seed, i]);
  const sentence = builderSentence(round.chunks);
  const finished = status === 'right' || status === 'shown';
  const last = i + 1 >= step.rounds.length;

  const place = (chunk: number): void => { tap(); setStatus('building'); setPlaced((p) => [...p, chunk]); };
  const takeBack = (at: number): void => { tap(); setStatus('building'); setPlaced((p) => p.filter((_, k) => k !== at)); };
  const check = (): void => {
    const ok = builderSolved(round.chunks, placed);
    bc.recordDrill(item.id, 'flashRecall', ok ? 'pass' : 'fail');
    if (ok) { success(); setStatus('right'); void speakL(sentence, 0.92); }
    else { feedbackWrong(); setStatus('wrong'); setMisses((n) => n + 1); }
  };
  const next = (): void => {
    setPlaced([]); setStatus('building'); setMisses(0);
    if (last) onDone(); else setI(i + 1);
  };

  return (
    <>
      <div className="drill-card practice-card">
        <p className="drill-label">{step.label ? L(step.label) : t('builderTitle')}</p>
        <Progress i={i} n={step.rounds.length} />
        <p className="drill-meaning" style={{ fontWeight: 700 }}>{L(item.meaning)}</p>
        <div className={`pbuild-answer ${status === 'right' || status === 'shown' ? 'is-ok' : status === 'wrong' ? 'is-bad' : ''}`} dir="ltr" lang={useAppStore.getState().learningLang} aria-live="polite">
          {status === 'shown'
            ? round.chunks.map((c, k) => <span key={k} className="pchip">{c}</span>)
            : placed.length === 0
              ? <span className="faint small" dir="auto" style={{ margin: '0 auto' }}>{t('builderEmpty')}</span>
              : placed.map((chunk, k) => (
                <button key={`${chunk}-${k}`} className="pchip" disabled={finished} onClick={() => takeBack(k)}>{round.chunks[chunk]}</button>
              ))}
        </div>
        {!finished && (
          <div className="pbuild-pool" dir="ltr">
            {pool.map((chunk) => (
              <button key={chunk} className={`pchip ${placed.includes(chunk) ? 'is-used' : ''}`} disabled={placed.includes(chunk)} aria-hidden={placed.includes(chunk)} onClick={() => place(chunk)}>
                {round.chunks[chunk]}
              </button>
            ))}
          </div>
        )}
        {status === 'wrong' && <p className="feedback-head bad">❌ {t('builderNotYet')}</p>}
        {status === 'wrong' && <CompanionReaction kind="encouraging" size={40} />}
        {status === 'right' && <span className="feedback-head ok">✓ {t('correctHeader')}</span>}
        {status === 'right' && <CompanionReaction kind="correct" text={false} size={40} />}
        {finished && <button className="btn-ghost" style={{ alignSelf: 'center' }} onClick={() => void speakL(sentence)} aria-label={t('replayAudio')}>🔊 {t('hearAgain')}</button>}
      </div>
      <div className="action-zone">
        {finished ? (
          <button className="btn-primary" onClick={next}>{last ? t('continue') : t('nextBtn')}</button>
        ) : (
          <>
            {misses >= 1 && status !== 'building' && (
              <button className="btn-ghost" onClick={() => { tap(); setStatus('building'); setPlaced(builderHint(round.chunks, placed)); }}>💡 {t('builderHint')}</button>
            )}
            {misses >= 2 && status === 'wrong' && (
              <button className="btn-secondary" onClick={() => { setStatus('shown'); void speakL(sentence, 0.92); }}>{t('continue')}</button>
            )}
            <button className="btn-primary" disabled={placed.length !== round.chunks.length} onClick={check}>{t('builderCheck')}</button>
          </>
        )}
      </div>
    </>
  );
}
