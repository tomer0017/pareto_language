import { useEffect, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { feedbackWrong } from '../../shared/ui/feedbackCue.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { softChime } from '../../shared/audio/sfx.js';
import { TargetText } from '../foundation/TappableText.js';
import { useBootcampStore } from './bootcampStore.js';
import { NpcFigure, YouLine } from './ConvoScene.js';
import { npcFor } from './npcCast.js';
import {
  checkpointScreen, isRestorable, proceed, respond, sceneProgress, startCheckpoint, turnForConcept,
  type CaptureChoice, type CaptureGroup, type CheckpointPlan, type CheckpointState,
} from './checkpoint.js';
import type { SpokenLine } from './types.js';
import type { StepOf } from './practiceEngines.js';

/**
 * The adaptive checkpoint on screen — one continuous day, not a row of quizzes. Everything shown comes
 * from `checkpointScreen` (pure); every answer goes through `respond` / `proceed` and is SAVED at once
 * (`saveCheckpoint`), so leaving, watching the video or reloading resumes exactly here, with every
 * result and repair intact. Between turns there is no praise screen: a right answer simply moves the
 * day on; a miss gets one quiet beat — the line, its meaning, its sound — and the day goes on.
 */

const speakL = (text: string, rate?: number): ReturnType<typeof speak> => speak(text, useAppStore.getState().learningLang, rate);
const rateOf = (line: SpokenLine): number => (line.pace === 'fast' ? 1.08 : 0.95);

export function CheckpointStep({ step, onDone }: { step: StepOf<'checkpoint'>; onDone: () => void }) {
  const plan = step.plan;
  const saved = useBootcampStore((s) => (s.activeDay === null ? undefined : s.checkpoints[String(s.activeDay)]));
  const save = useBootcampStore((s) => s.saveCheckpoint);
  const addReceipt = useBootcampStore((s) => s.addReceipt);
  const recordDrill = useBootcampStore((s) => s.recordDrill);
  const state: CheckpointState = isRestorable(plan, saved) ? saved : startCheckpoint(plan);
  useEffect(() => {
    if (!isRestorable(plan, saved)) save(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <CheckpointView
      plan={plan} state={state} onChange={save}
      onAnswer={(itemId, ok) => recordDrill(itemId, 'simulator', ok ? 'pass' : 'fail')}
      onDone={() => { addReceipt(`${L(plan.copy.completeTitle)} — ${L(plan.copy.completeBody)}`); onDone(); }}
    />
  );
}

/** The checkpoint for a given state — pure presentation: every change goes out through `onChange`. */
export function CheckpointView({ plan, state, onChange, onAnswer, onDone }: {
  plan: CheckpointPlan; state: CheckpointState; onChange: (next: CheckpointState) => void; onAnswer?: (itemId: string, ok: boolean) => void; onDone: () => void;
}) {
  const screen = checkpointScreen(plan, state);
  const scene = plan.scenes.find((s) => s.id === state.scene)!;
  const go = onChange;
  // The conversation keeps going: what you just said stays on screen as the other person answers.
  const last = state.attempts.at(-1);
  const lastTurn = last ? turnForConcept(plan, last.conceptId) : undefined;
  const youSaid = state.beat === 'ask' && last?.correct && last.phase === state.phase && lastTurn?.kind === 'say' && lastTurn.scene === state.scene ? lastTurn.answer.text : undefined;

  return (
    <div className="pcanvas checkpoint" data-engine="checkpoint" data-phase={state.phase}>
      <DayProgress plan={plan} state={state} />
      {screen.kind === 'intro' && <IntroBeat text={L(screen.text)} onNext={() => go(proceed(plan, state))} />}
      {youSaid && (screen.kind === 'say' || screen.kind === 'capture') && <YouLine><TargetText text={youSaid} /></YouLine>}
      {screen.kind === 'say' && (
        <SayBeat
          key={`${state.phase}.${state.cursor}.${state.attempts.length}`}
          cast={scene.cast} cue={screen.turn.cue} heard={(screen.turn.heard ?? false) && (state.phase === 'diagnostic' || state.phase === 'one-take')} situation={screen.situation ? L(screen.situation) : undefined}
          options={screen.options.map((o) => ({ id: o.conceptId, text: o.text }))}
          onPick={(id) => {
            const right = id === screen.turn.conceptId;
            tap();
            if (right) { success(); softChime(); } else feedbackWrong();
            onAnswer?.(screen.turn.answer.itemId, right);
            if (right) void speakL(screen.turn.answer.text, 0.95);
            go(respond(plan, state, { kind: 'say', conceptId: id }));
          }}
        />
      )}
      {screen.kind === 'capture' && (
        <CaptureBeat
          key={`${state.phase}.${state.cursor}.${state.attempts.length}`}
          cast={scene.cast} cue={screen.turn.cue} groups={screen.groups}
          onConfirm={(picks) => {
            const right = screen.groups.every((g) => picks[g.conceptId] === g.correct);
            tap();
            if (right) { success(); softChime(); } else feedbackWrong();
            go(respond(plan, state, { kind: 'capture', picks }));
          }}
        />
      )}
      {(screen.kind === 'reveal' || screen.kind === 'card') && (
        <ShownBeat
          key={`${state.phase}.${state.cursor}.${screen.kind}`}
          card={screen.kind === 'card'} text={screen.line.text} meaning={L(screen.line.meaning)} spoken={screen.line.spoken}
          values={screen.values.map((v) => ({ id: v.conceptId, label: L(v.label), choice: v.choice }))}
          onNext={() => go(proceed(plan, state))}
        />
      )}
      {screen.kind === 'scene-end' && (
        <SceneEndBeat key={`${state.phase}.${screen.scene.id}`} cast={screen.scene.cast} closing={screen.scene.closing} stamp={L(screen.scene.stamp)} onNext={() => go(proceed(plan, state))} />
      )}
      {screen.kind === 'complete' && (
        <CompleteBeat plan={plan} onNext={onDone} />
      )}
    </div>
  );
}

/** 🛂 ✅ · 🚕 · 🏨 — where the day stands; in a repair, how many fixes are left instead. */
function DayProgress({ plan, state }: { plan: CheckpointPlan; state: CheckpointState }) {
  if (state.phase === 'repair' || state.phase === 'final-repair') {
    const left = state.phase === 'repair' ? state.repairQueue.length : state.finalRepairQueue.length;
    return <p className="checkpoint-progress is-repair" data-left={left}>🔧 {t('checkpointFixesLeft', { n: left })}</p>;
  }
  return (
    <ol className="checkpoint-progress" aria-label={t('journeySteps')}>
      {sceneProgress(plan, state).map((p) => {
        const s = plan.scenes.find((x) => x.id === p.id)!;
        return (
          <li key={p.id} className={`is-${p.state}`} aria-current={p.state === 'current' ? 'step' : undefined}>
            <span aria-hidden>{s.icon}</span> {L(s.label)}{p.state === 'done' ? ' ✅' : ''}
          </li>
        );
      })}
    </ol>
  );
}

/** The other person's line: their figure, the words (never translated before the answer), its sound. */
function Speaker({ cast, line, play }: { cast: string; line: SpokenLine; play: boolean }) {
  useEffect(() => {
    if (play) void speakL(line.en, rateOf(line));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="convo-row npc" dir="ltr">
      <NpcFigure npc={npcFor(cast)} />
      <div className="convo-bubble npc">
        <div className="convo-text"><TargetText text={line.en} /></div>
        <button className="btn-ghost checkpoint-replay" onClick={() => void speakL(line.en, 0.9)} aria-label={t('hearAgain')}>🔊</button>
      </div>
    </div>
  );
}

function SayBeat({ cast, cue, heard, situation, options, onPick }: {
  cast: string; cue: SpokenLine; heard: boolean; situation?: string; options: { id: string; text: string }[]; onPick: (id: string) => void;
}) {
  return (
    <>
      <Speaker cast={cast} line={cue} play={!heard} />
      {situation && <p className="scene-note">{situation}</p>}
      <div className="action-zone checkpoint-say">
        {options.map((o) => (
          <button key={o.id} className="btn-secondary btn-reply" onClick={() => onPick(o.id)}><TargetText text={o.text} /></button>
        ))}
      </div>
    </>
  );
}

/** One compact screen: every value the line gave, each in its own row, then one confirm. */
function CaptureBeat({ cast, cue, groups, onConfirm }: { cast: string; cue: SpokenLine; groups: CaptureGroup[]; onConfirm: (picks: Record<string, string>) => void }) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const ready = groups.every((g) => picks[g.conceptId]);
  return (
    <>
      <Speaker cast={cast} line={cue} play />
      <div className="checkpoint-capture">
        {groups.map((g) => (
          <fieldset key={g.conceptId} className={`capture-group is-${g.ui}`} dir="ltr">
            <legend dir="auto">{L(g.label)}</legend>
            {g.ui === 'floor' && <span className="capture-lift" aria-hidden />}
            <div className="capture-choices">
              {g.choices.map((c) => (
                <button key={c.id} className={`capture-choice${picks[g.conceptId] === c.id ? ' is-picked' : ''}`} aria-pressed={picks[g.conceptId] === c.id}
                  onClick={() => { tap(); setPicks({ ...picks, [g.conceptId]: c.id }); }}>
                  <Choice choice={c} />
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="action-zone">
        <button className="btn-primary" disabled={!ready} onClick={() => onConfirm(picks)}>{t('checkpointConfirm')}</button>
      </div>
    </>
  );
}

function Choice({ choice }: { choice: CaptureChoice }) {
  return (
    <>
      {choice.emoji && <span className="capture-emoji" aria-hidden>{choice.emoji}</span>}
      {choice.label && <span className="capture-figure">{choice.label}</span>}
      {choice.caption && <span className="capture-caption" dir="auto">{L(choice.caption)}</span>}
    </>
  );
}

/** A miss, quietly corrected — or a final-repair card: the line, what it means, its sound. */
function ShownBeat({ card, text, meaning, spoken, values, onNext }: {
  card: boolean; text: string; meaning: string; spoken?: SpokenLine; values: { id: string; label: string; choice: CaptureChoice }[]; onNext: () => void;
}) {
  useEffect(() => {
    void speakL(text, spoken ? rateOf(spoken) : 0.92);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="checkpoint-shown fade-in">
        {!card && <span className="feedback-head bad">✕</span>}
        <p className="drill-phrase"><TargetText text={text} /></p>
        <p className="drill-meaning">{meaning}</p>
        {values.length > 0 && (
          <dl className="checkpoint-values">
            {values.map((v) => <div key={v.id}><dt>{v.label}</dt><dd dir="ltr"><Choice choice={v.choice} /></dd></div>)}
          </dl>
        )}
        <button className="btn-ghost" onClick={() => void speakL(text, 0.9)} aria-label={t('replayAudio')}>🔊</button>
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{t('continue')}</button>
      </div>
    </>
  );
}

function SceneEndBeat({ cast, closing, stamp, onNext }: { cast: string; closing?: SpokenLine; stamp: string; onNext: () => void }) {
  return (
    <>
      {closing && <Speaker cast={cast} line={closing} play />}
      <p className="checkpoint-stamp pop-in">{stamp}</p>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{t('continue')}</button>
      </div>
    </>
  );
}

function IntroBeat({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <>
      <p className="checkpoint-intro fade-in">{text}</p>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{t('continue')}</button>
      </div>
    </>
  );
}

function CompleteBeat({ plan, onNext }: { plan: CheckpointPlan; onNext: () => void }) {
  return (
    <>
      <div className="checkpoint-complete pop-in">
        <h2>{L(plan.copy.completeTitle)}</h2>
        <p>{L(plan.copy.completeBody)}</p>
        <ul>{plan.scenes.map((s) => <li key={s.id}><span aria-hidden>{s.icon}</span> {L(s.label)} ✅</li>)}</ul>
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{t('continue')}</button>
      </div>
    </>
  );
}
