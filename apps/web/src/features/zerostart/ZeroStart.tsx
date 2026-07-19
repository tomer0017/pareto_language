import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t, L } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { feedback } from '../../shared/ui/feedbackCue.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { languageTtsTag } from '../../shared/i18n/languages.js';
import { shuffle, mulberry32 } from '../../shared/util/shuffle.js';
import { TopBar } from '../../shared/ui/TopBar.js';
import { useFoundationStore } from '../foundation/foundationStore.js';
import { useBootcampStore, missionsFor } from '../bootcamp/bootcampStore.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { ZERO_PATH } from './content.js';
import { ZERO_LANGS, stepId, type ZeroChunk, type ZeroLang, type ZeroModule, type ZeroStep } from './types.js';
import { useZeroStartStore } from './zeroStartStore.js';
import { isModuleComplete, moduleDoneCount, pathProgress } from './zeroStartProgress.js';

/**
 * "מתחילים מאפס" — the guided zero-beginner path renderer.
 *
 * A data-driven walker over {@link ZERO_PATH}: the module/step CONTENT lives in `content.ts`, PROGRESS
 * in `zeroStartStore`, AUDIO in the shared `tts` engine, and this file is only the rendering + flow.
 * Cumulative building means each screen has one goal and one obvious action. Learning a chunk here
 * marks its Foundation concept viewed (progress sync, idempotent). Completing the checkpoint graduates
 * the learner into the existing first Bootcamp mission — never auto-completing it.
 */

/** A safe example name so introductions read naturally before the learner sets their own. */
const EXAMPLE_NAME = 'Alex';

/** The first real (non-special) Bootcamp mission for a language — the graduation target. */
function firstBootcampDay(lang: string): number | undefined {
  const missions = missionsFor(lang);
  return BOOTCAMP_PLAN.filter((m) => m.day in missions && !m.special)[0]?.day;
}

/** The chunk whose concept is "learned" by completing a step (drives Foundation sync). */
function primaryChunkId(step: ZeroStep): string {
  return step.kind === 'dialogue' ? step.answer : step.chunk;
}

/** Deterministic per-step option order (no reshuffle on re-render). */
function seedFrom(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function ZeroStart() {
  const learningLang = useAppStore((s) => s.learningLang);
  const lang = (ZERO_LANGS as readonly string[]).includes(learningLang) ? (learningLang as ZeroLang) : null;

  if (!lang) {
    return (
      <div className="screen">
        <TopBar title={t('zeroStartTitle')} backTo="home" />
        <div className="screen-scroll">
          <div className="drill-card center pop-in" style={{ marginTop: 24 }}>
            <p style={{ fontSize: '2.4rem' }}>🌱</p>
            <p className="drill-meaning">{t('zeroStartUnsupported')}</p>
          </div>
        </div>
      </div>
    );
  }
  return <Path lang={lang} />;
}

type Mode =
  | { screen: 'hub' }
  | { screen: 'lesson'; mod: number; step: number }
  | { screen: 'moduleDone'; mod: number }
  | { screen: 'graduated' };

function Path({ lang }: { lang: ZeroLang }) {
  const { modules, chunks } = ZERO_PATH;
  const navigate = useAppStore((s) => s.navigate);
  const bc = useBootcampStore();
  const markViewed = useFoundationStore((s) => s.markViewed);

  const byLang = useZeroStartStore((s) => s.byLang[lang]);
  const completeStep = useZeroStartStore((s) => s.completeStep);
  const markPathComplete = useZeroStartStore((s) => s.markPathComplete);
  const restart = useZeroStartStore((s) => s.restart);
  const name = useZeroStartStore((s) => s.name);
  const setName = useZeroStartStore((s) => s.setName);

  const done = useMemo(() => new Set(byLang?.done ?? []), [byLang]);
  const progress = useMemo(() => pathProgress(modules, done), [modules, done]);

  const [mode, setMode] = useState<Mode>({ screen: 'hub' });
  const displayName = name ?? EXAMPLE_NAME;

  const enterModule = (mod: number): void => {
    const m = modules[mod]!;
    const firstIncomplete = m.steps.findIndex((_, i) => !done.has(stepId(m.id, i)));
    setMode({ screen: 'lesson', mod, step: firstIncomplete < 0 ? 0 : firstIncomplete });
  };
  const resume = (): void => {
    if (progress.isComplete) { setMode({ screen: 'graduated' }); return; }
    enterModule(progress.resume.moduleIndex);
  };

  /** Mark the current step done (+ sync Foundation) and advance to the next step / module / graduation. */
  const advance = (mod: number, step: number): void => {
    const m = modules[mod]!;
    const chunk = chunks[primaryChunkId(m.steps[step]!)];
    if (chunk?.conceptId) markViewed(chunk.conceptId);
    completeStep(lang, stepId(m.id, step));
    if (step + 1 < m.steps.length) { setMode({ screen: 'lesson', mod, step: step + 1 }); return; }
    // Module finished.
    if (mod === modules.length - 1) { markPathComplete(lang); setMode({ screen: 'graduated' }); return; }
    setMode({ screen: 'moduleDone', mod });
  };

  const goToBootcamp = (): void => {
    const day = firstBootcampDay(lang);
    tap();
    if (day !== undefined) bc.startDay(day);
    navigate('bootcamp');
  };

  if (mode.screen === 'graduated') {
    return <Graduated onBootcamp={goToBootcamp} onReplay={() => { restart(lang); setMode({ screen: 'hub' }); }} onHome={() => navigate('home')} />;
  }
  if (mode.screen === 'moduleDone') {
    const m = modules[mode.mod]!;
    return (
      <ModuleDone
        module={m}
        onNext={() => enterModule(mode.mod + 1)}
        onHub={() => { cancelSpeech(); setMode({ screen: 'hub' }); }}
      />
    );
  }
  if (mode.screen === 'lesson') {
    const m = modules[mode.mod]!;
    const step = m.steps[mode.step]!;
    return (
      <Lesson
        key={`${m.id}:${mode.step}`}
        lang={lang}
        module={m}
        moduleIndex={mode.mod}
        totalModules={modules.length}
        stepIndex={mode.step}
        step={step}
        displayName={displayName}
        hasName={name !== null}
        onSetName={setName}
        onDone={() => advance(mode.mod, mode.step)}
        onExit={() => { cancelSpeech(); setMode({ screen: 'hub' }); }}
      />
    );
  }

  // ── Hub ──
  return (
    <div className="screen">
      <TopBar title={t('zeroStartTitle')} backTo="home" />
      <div className="screen-scroll">
        <p className="dim small" style={{ marginBottom: 4 }}>{t('zeroStartSubtitle')}</p>
        <p className="dim small" style={{ marginBottom: 12 }}>{t('zeroStartDesc')}</p>

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 800 }}>{t('zeroStartModuleOf', { i: Math.min(progress.completedModules + (progress.isComplete ? 0 : 1), progress.totalModules), n: progress.totalModules })}</span>
            <strong style={{ color: 'var(--brand)' }}>{progress.pct}%</strong>
          </div>
          <div className="progress-track" style={{ marginTop: 10 }}>
            <div className="progress-fill brand" style={{ width: `${progress.pct}%` }} />
          </div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => { tap(); resume(); }}>
            {progress.doneSteps === 0 ? t('zeroStartStart') : progress.isComplete ? t('zeroStartReplayModule') : t('continue')}
          </button>
        </div>

        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modules.map((m, i) => {
            const dc = moduleDoneCount(m, done);
            const complete = isModuleComplete(m, done);
            return (
              <button key={m.id} className="card card-press" style={{ width: '100%', textAlign: 'start', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => { tap(); enterModule(i); }}>
                <span style={{ fontSize: '1.6rem' }} aria-hidden>{m.icon}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{L(m.title)}</span>
                  <span className="dim small">{t('zeroStartStepOf', { i: dc, n: m.steps.length })}</span>
                </span>
                {complete ? <span className="badge badge-ready">✓</span> : <span className="chip chip-accent">{dc > 0 ? t('continue') : t('zeroStartStart')}</span>}
              </button>
            );
          })}
        </div>

        {progress.doneSteps > 0 && (
          <button className="btn-ghost" style={{ marginTop: 18 }}
            onClick={() => { if (window.confirm(t('zeroStartRestartConfirm'))) { tap(); restart(lang); } }}>
            ↺ {t('zeroStartRestart')}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── One lesson step ─────────────────────────────────────────────────────── */

function Lesson(props: {
  lang: ZeroLang;
  module: ZeroModule;
  moduleIndex: number;
  totalModules: number;
  stepIndex: number;
  step: ZeroStep;
  displayName: string;
  hasName: boolean;
  onSetName: (name: string | null) => void;
  onDone: () => void;
  onExit: () => void;
}) {
  const { lang, module: m, moduleIndex, totalModules, stepIndex, step, displayName, hasName, onSetName, onDone, onExit } = props;
  const chunks = ZERO_PATH.chunks;
  const ttsTag = languageTtsTag(lang);
  const withName = (s: string): string => s.replace(/\{name\}/g, displayName);
  const target = (id: string): string => withName(chunks[id]!.target[lang]);
  const gloss = (id: string): string => withName(L(chunks[id]!.tr));

  // A step that introduces the name frame asks for the name once (skippable → example name).
  const primaryText = chunks[primaryChunkId(step)]?.target[lang] ?? '';
  const needsName = primaryText.includes('{name}');
  const [nameAsked, setNameAsked] = useState(false);
  const askName = needsName && !hasName && !nameAsked;

  const speakTarget = (text: string, slow = false): void => { cancelSpeech(); void speak(text, ttsTag, slow ? 0.6 : 1); };

  if (askName) {
    return <NamePrompt onSave={(v) => { onSetName(v); setNameAsked(true); }} onSkip={() => { setNameAsked(true); }} />;
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" onClick={onExit} aria-label={t('back')}>✕</button>
        <span className="chip">{m.icon} {L(m.title)}</span>
        <span style={{ width: 44 }} />
      </div>
      <p className="dim small" style={{ textAlign: 'center', margin: '2px 0 8px' }}>
        {t('zeroStartModuleOf', { i: moduleIndex + 1, n: totalModules })} · {t('zeroStartStepOf', { i: stepIndex + 1, n: m.steps.length })}
      </p>
      <div className="progress-track" style={{ marginBottom: 14 }}>
        <div className="progress-fill brand" style={{ width: `${((stepIndex + 1) / m.steps.length) * 100}%` }} />
      </div>

      <div className="screen-scroll">
        {step.kind === 'introduce' && <Introduce chunk={chunks[step.chunk]!} target={target(step.chunk)} gloss={gloss(step.chunk)} ttsTag={ttsTag} onSpeak={speakTarget} onDone={onDone} />}
        {step.kind === 'recall' && <Recall target={target(step.chunk)} gloss={gloss(step.chunk)} ttsTag={ttsTag} onSpeak={speakTarget} onDone={onDone} />}
        {step.kind === 'recognize' && (
          <Recognize
            stepKey={stepId(m.id, stepIndex)} ttsTag={ttsTag} onSpeak={speakTarget}
            target={target(step.chunk)} answer={gloss(step.chunk)}
            options={[step.chunk, ...step.distractors].map((id) => gloss(id))} onDone={onDone}
          />
        )}
        {step.kind === 'dialogue' && (
          <Dialogue
            stepKey={stepId(m.id, stepIndex)} ttsTag={ttsTag} onSpeak={speakTarget}
            npcTarget={target(step.npc)} npcGloss={gloss(step.npc)}
            answer={target(step.answer)} answerGloss={gloss(step.answer)}
            options={[step.answer, ...step.distractors].map((id) => target(id))} onDone={onDone}
          />
        )}
        {step.kind === 'build' && (
          <Build stepKey={stepId(m.id, stepIndex)} ttsTag={ttsTag} onSpeak={speakTarget} target={target(step.chunk)} gloss={gloss(step.chunk)} onDone={onDone} />
        )}
      </div>
    </div>
  );
}

/** A large, LTR-isolated target line (the learning language is always LTR in this pilot). */
function TargetLine({ text, ttsTag, size = '2rem' }: { text: string; ttsTag: string; size?: string }) {
  return <p dir="ltr" lang={ttsTag} className="drill-phrase" style={{ fontSize: size, unicodeBidi: 'isolate' }}>{text}</p>;
}

function AudioButtons({ text, onSpeak }: { text: string; onSpeak: (t: string, slow?: boolean) => void }) {
  return (
    <div className="action-zone" style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button className="btn-secondary" style={{ width: 'auto' }} onClick={() => { tap(); onSpeak(text); }} aria-label={t('replayAudio')}>🔊 {t('replayAudio')}</button>
      <button className="btn-ghost" onClick={() => { tap(); onSpeak(text, true); }} aria-label={t('zeroStartSlow')}>🐢 {t('zeroStartSlow')}</button>
    </div>
  );
}

function Introduce({ chunk, target, gloss, ttsTag, onSpeak, onDone }: { chunk: ZeroChunk; target: string; gloss: string; ttsTag: string; onSpeak: (t: string, slow?: boolean) => void; onDone: () => void }) {
  useEffect(() => { onSpeak(target); return () => cancelSpeech(); }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <div className="drill-card center pop-in" style={{ gap: 12 }}>
        {chunk.emoji && <span style={{ fontSize: '2.6rem' }} aria-hidden>{chunk.emoji}</span>}
        <TargetLine text={target} ttsTag={ttsTag} />
        <p className="drill-meaning">{gloss}</p>
      </div>
      <AudioButtons text={target} onSpeak={onSpeak} />
      <div className="action-zone"><button className="btn-primary" onClick={() => { tap(); cancelSpeech(); onDone(); }}>{t('continue')}</button></div>
    </>
  );
}

function Recall({ target, gloss, ttsTag, onSpeak, onDone }: { target: string; gloss: string; ttsTag: string; onSpeak: (t: string, slow?: boolean) => void; onDone: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <>
      <p className="drill-label" style={{ textAlign: 'center' }}>{t('zeroStartRecallPrompt')}</p>
      <div className="drill-card center pop-in" style={{ gap: 12 }}>
        <p className="drill-meaning" style={{ fontSize: '1.3rem' }}>{gloss}</p>
        {revealed ? <TargetLine text={target} ttsTag={ttsTag} size="1.7rem" /> : <p className="faint">• • •</p>}
      </div>
      {revealed
        ? <><AudioButtons text={target} onSpeak={onSpeak} /><div className="action-zone"><button className="btn-primary" onClick={() => { tap(); cancelSpeech(); onDone(); }}>{t('continue')}</button></div></>
        : <div className="action-zone"><button className="btn-primary" onClick={() => { tap(); setRevealed(true); onSpeak(target); }}>{t('zeroStartReveal')}</button></div>}
    </>
  );
}

function Recognize({ stepKey, target, answer, options, ttsTag, onSpeak, onDone }: { stepKey: string; target: string; answer: string; options: string[]; ttsTag: string; onSpeak: (t: string, slow?: boolean) => void; onDone: () => void }) {
  const shuffled = useMemo(() => shuffle(options, mulberry32(seedFrom(stepKey))), [stepKey, options]);
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;
  useEffect(() => { onSpeak(target); return () => cancelSpeech(); }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (opt: string): void => { if (picked === answer) return; setPicked(opt); feedback(opt === answer); };
  return (
    <>
      <p className="drill-label" style={{ textAlign: 'center' }}>{t('zeroStartChooseMeaning')}</p>
      <div className="drill-card center pop-in" style={{ gap: 8 }}>
        <TargetLine text={target} ttsTag={ttsTag} size="1.7rem" />
        <button className="btn-ghost" onClick={() => { tap(); onSpeak(target); }} aria-label={t('replayAudio')}>🔊</button>
      </div>
      <div className="reading-q-options" style={{ marginTop: 12 }}>
        {shuffled.map((opt) => {
          const isAnswer = opt === answer;
          const state = picked === null ? '' : isAnswer ? 'right' : picked === opt ? 'wrong' : '';
          return <button key={opt} className={`reading-opt ${state}`} disabled={correct} onClick={() => choose(opt)}>{opt}</button>;
        })}
      </div>
      <ResultBar picked={picked} correct={correct} answerText={answer} onRetry={() => setPicked(null)} onDone={onDone} />
    </>
  );
}

function Dialogue({ stepKey, npcTarget, npcGloss, answer, answerGloss, options, ttsTag, onSpeak, onDone }: { stepKey: string; npcTarget: string; npcGloss: string; answer: string; answerGloss: string; options: string[]; ttsTag: string; onSpeak: (t: string, slow?: boolean) => void; onDone: () => void }) {
  const shuffled = useMemo(() => shuffle(options, mulberry32(seedFrom(stepKey))), [stepKey, options]);
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;
  useEffect(() => { onSpeak(npcTarget); return () => cancelSpeech(); }, [npcTarget]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (opt: string): void => { if (picked === answer) return; setPicked(opt); feedback(opt === answer); if (opt === answer) onSpeak(answer); };
  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <p className="dim small">🧑 {npcGloss}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TargetLine text={npcTarget} ttsTag={ttsTag} size="1.35rem" />
          <button className="btn-ghost" onClick={() => { tap(); onSpeak(npcTarget); }} aria-label={t('replayAudio')}>🔊</button>
        </div>
      </div>
      <p className="drill-label" style={{ textAlign: 'center' }}>{t('zeroStartChooseReply')}</p>
      <div className="reading-q-options" style={{ marginTop: 8 }}>
        {shuffled.map((opt) => {
          const isAnswer = opt === answer;
          const state = picked === null ? '' : isAnswer ? 'right' : picked === opt ? 'wrong' : '';
          return <button key={opt} dir="ltr" lang={ttsTag} className={`reading-opt ${state}`} disabled={correct} onClick={() => choose(opt)}>{opt}</button>;
        })}
      </div>
      <ResultBar picked={picked} correct={correct} answerText={`${answer} — ${answerGloss}`} onRetry={() => setPicked(null)} onDone={onDone} />
    </>
  );
}

function Build({ stepKey, target, gloss, ttsTag, onSpeak, onDone }: { stepKey: string; target: string; gloss: string; ttsTag: string; onSpeak: (t: string, slow?: boolean) => void; onDone: () => void }) {
  const words = useMemo(() => target.split(/\s+/).filter(Boolean), [target]);
  const order = useMemo(() => shuffle(words.map((_, i) => i), mulberry32(seedFrom(stepKey))), [stepKey, words]);
  const [picked, setPicked] = useState<number[]>([]);
  const assembled = picked.map((i) => words[i]).join(' ');
  const complete = picked.length === words.length;
  const correct = complete && assembled === target;
  useEffect(() => { onSpeak(target); return () => cancelSpeech(); }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (correct) { feedback(true); onSpeak(target); } else if (complete) { feedback(false); } }, [complete]); // eslint-disable-line react-hooks/exhaustive-deps
  const remaining = order.filter((i) => !picked.includes(i));
  return (
    <>
      <p className="drill-label" style={{ textAlign: 'center' }}>{t('zeroStartBuildPrompt')}</p>
      <div className="drill-card center pop-in" style={{ gap: 6, minHeight: 90 }}>
        <p className="drill-meaning">{gloss}</p>
        <p dir="ltr" lang={ttsTag} className="drill-phrase" style={{ fontSize: '1.5rem', unicodeBidi: 'isolate', minHeight: '1.6em' }}>
          {assembled || '—'}
        </p>
      </div>
      <div dir="ltr" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        {remaining.map((i) => (
          <button key={i} className="btn-secondary" style={{ width: 'auto' }} onClick={() => { tap(); setPicked((p) => [...p, i]); }}>{words[i]}</button>
        ))}
      </div>
      {picked.length > 0 && !correct && (
        <div className="action-zone" style={{ marginTop: 8 }}>
          <button className="btn-ghost" onClick={() => { tap(); setPicked([]); }}>↺ {t('zeroStartClear')}</button>
        </div>
      )}
      {complete && !correct && (
        <div className="drill-card center" style={{ marginTop: 10 }}>
          <p className="dim small">{t('zeroStartAnswerWas')}:</p>
          <TargetLine text={target} ttsTag={ttsTag} size="1.3rem" />
          <button className="btn-ghost" onClick={() => { tap(); setPicked([]); }}>↺ {t('zeroStartClear')}</button>
        </div>
      )}
      {correct && (
        <>
          <p className="drill-meaning" style={{ textAlign: 'center', color: 'var(--brand)', fontWeight: 800, marginTop: 10 }}>✓ {t('zeroStartCorrect')}</p>
          <div className="action-zone"><button className="btn-primary" onClick={() => { tap(); cancelSpeech(); onDone(); }}>{t('continue')}</button></div>
        </>
      )}
    </>
  );
}

/** Shared post-answer bar for recognize/dialogue: reveal correct on a miss, continue on a hit. */
function ResultBar({ picked, correct, answerText, onRetry, onDone }: { picked: string | null; correct: boolean; answerText: string; onRetry: () => void; onDone: () => void }) {
  if (picked === null) return null;
  if (correct) {
    return (
      <>
        <p className="drill-meaning" style={{ textAlign: 'center', color: 'var(--brand)', fontWeight: 800, marginTop: 10 }}>✓ {t('zeroStartCorrect')}</p>
        <div className="action-zone"><button className="btn-primary" onClick={() => { tap(); cancelSpeech(); onDone(); }}>{t('continue')}</button></div>
      </>
    );
  }
  return (
    <div className="drill-card center" style={{ marginTop: 10, gap: 6 }}>
      <p className="dim small">{t('zeroStartAnswerWas')}:</p>
      <p className="drill-phrase" style={{ fontSize: '1.15rem' }}>{answerText}</p>
      <button className="btn-primary" style={{ marginTop: 6 }} onClick={() => { tap(); onRetry(); }}>{t('zeroStartReveal')} ↺</button>
    </div>
  );
}

function NamePrompt({ onSave, onSkip }: { onSave: (name: string) => void; onSkip: () => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="screen-scroll">
      <div className="drill-card center pop-in" style={{ gap: 14, marginTop: 24 }}>
        <span style={{ fontSize: '2.4rem' }} aria-hidden>🙂</span>
        <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>{t('zeroStartNamePrompt')}</p>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t('zeroStartNamePlaceholder')} aria-label={t('zeroStartNamePlaceholder')} maxLength={24} style={{ textAlign: 'center', width: '100%' }} />
      </div>
      <div className="action-zone" style={{ gap: 8 }}>
        <button className="btn-primary" disabled={!value.trim()} onClick={() => { tap(); onSave(value.trim()); }}>{t('zeroStartNameSave')}</button>
        <button className="btn-ghost" onClick={() => { tap(); onSkip(); }}>{t('zeroStartNameSkip')}</button>
      </div>
    </div>
  );
}

function ModuleDone({ module: m, onNext, onHub }: { module: ZeroModule; onNext: () => void; onHub: () => void }) {
  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div className="drill-card center pop-in" style={{ gap: 12 }}>
        <span style={{ fontSize: '3rem' }} aria-hidden>{m.icon}</span>
        <p className="drill-phrase" style={{ fontSize: '1.4rem' }}>{t('zeroStartModuleDone')}</p>
        <p className="drill-label">{t('zeroStartICanNow')}:</p>
        <p className="drill-meaning" style={{ fontSize: '1.15rem' }}>{L(m.outcome)}</p>
      </div>
      <div className="action-zone" style={{ gap: 8 }}>
        <button className="btn-primary" onClick={onNext}>{t('zeroStartNextModule')}</button>
        <button className="btn-ghost" onClick={onHub}>{t('zeroStartBackToPath')}</button>
      </div>
    </div>
  );
}

function Graduated({ onBootcamp, onReplay, onHome }: { onBootcamp: () => void; onReplay: () => void; onHome: () => void }) {
  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <div className="drill-card center pop-in" style={{ gap: 14 }}>
        <span style={{ fontSize: '3.4rem' }} aria-hidden>🎉</span>
        <p className="drill-phrase" style={{ fontSize: '1.35rem' }}>{t('zeroStartGradTitle')}</p>
        <p className="drill-meaning">{t('zeroStartGradBody')}</p>
      </div>
      <div className="action-zone" style={{ gap: 8 }}>
        <button className="btn-primary" onClick={onBootcamp}>🎖️ {t('zeroStartGradCta')}</button>
        <button className="btn-ghost" onClick={onReplay}>↺ {t('zeroStartReplayModule')}</button>
        <button className="btn-ghost" onClick={onHome}>{t('back')}</button>
      </div>
    </div>
  );
}
