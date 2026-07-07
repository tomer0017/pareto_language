import { useEffect, useMemo, useRef, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { CheckPop } from '../../shared/ui/CheckPop.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { getAudioDiag, subscribeAudioDiag, testAudio, unlockAudio } from '../../shared/audio/tts.js';
import { useSyncExternalStore } from 'react';
import { BOOTCAMP_PLAN, PHASES } from './plan.js';
import { DAYS, useBootcampStore } from './bootcampStore.js';
import type { BootcampItem, BootcampStep, BootcampDialogue, BootcampDayContent } from './types.js';
import { dialogueTranscript } from './transcript.js';

/** The mission's canonical dialogue — used by the full-conversation reader (start + summary). */
function primaryDialogue(day: BootcampDayContent): BootcampDialogue | null {
  const step = day.steps.find((s): s is Extract<BootcampStep, { kind: 'dialogue' }> => s.kind === 'dialogue');
  const byStep = step ? day.dialogues[step.dialogueId] : undefined;
  return byStep ?? Object.values(day.dialogues)[0] ?? null;
}

/**
 * READY Missions (Sprint 7): phase map + the generic MissionPlayer.
 * Dialogues render one line at a time (visual novel) — the user never sees the
 * conversation in advance; wrong choices branch through recovery beats and continue.
 * Every screen answers: does this reduce fear?
 */

export function Bootcamp() {
  const activeDay = useBootcampStore((s) => s.activeDay);
  return activeDay === null ? <MissionMap /> : <MissionPlayer />;
}

/* ── The map: 30 missions in 5 phases ───────────────────────────────────── */

function MissionMap() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const done = bc.completedDays.length;
  return (
    <div className="screen">
      <div className="topbar">
        <h2 style={{ margin: 0 }}>{t('bootcamp')}</h2>
        <button className="btn-ghost" onClick={() => app.navigate('languages')} aria-label={t('settings')}>🌐</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${(done / 30) * 100}%` }} />
        </div>
        <span className="dim small">{t('missionsProgress', { done, total: 30 })}</span>
      </div>
      <div className="screen-scroll no-nav">
        <AudioEnable />
        {PHASES.map((phase) => (
          <div key={phase.n}>
            <h3 style={{ margin: '14px 0 8px' }}>{phase.icon} {L(phase.title)}</h3>
            {BOOTCAMP_PLAN.filter((m) => m.phase === phase.n).map((m) => {
              const built = m.day in DAYS;
              const isDone = bc.completedDays.includes(m.day);
              const resumable = (bc.stepIndex[String(m.day)] ?? 0) > 0 && !isDone;
              return (
                <button
                  key={m.day}
                  className="game-card card-press"
                  disabled={!built}
                  style={built ? undefined : { opacity: 0.45 }}
                  onClick={() => {
                    tap();
                    bc.startDay(m.day);
                  }}
                >
                  <span className="game-icon" style={{ background: isDone ? 'var(--good)' : built ? 'var(--brand)' : 'var(--line)' }}>
                    {isDone ? '✓' : m.day}
                  </span>
                  <span>
                    <p style={{ fontWeight: 800 }}>
                      {L(m.title)} {m.checkpoint && <span className="badge badge-fading">{t('checkpointTag')}</span>}
                    </p>
                    <p className="dim small">
                      {isDone ? t('completed') : built ? (resumable ? t('continueDay', { n: m.day }) : `${m.minutes} ${t('min')} · ${L(m.confidenceGain)}`) : t('locked')}
                    </p>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AudioEnable() {
  const diag = useSyncExternalStore(subscribeAudioDiag, getAudioDiag, getAudioDiag);
  const [testing, setTesting] = useState(false);
  return (
    <button
      className="card card-press"
      style={{ width: '100%', textAlign: 'start', display: 'flex', alignItems: 'center', gap: 10, background: diag.unlocked ? 'var(--good-soft)' : 'var(--warn-soft)' }}
      onClick={async () => {
        unlockAudio();
        setTesting(true);
        await testAudio();
        setTesting(false);
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>{diag.unlocked ? '🔊' : '🔈'}</span>
      <span>
        <p style={{ fontWeight: 700 }}>{testing ? t('listenFirst') : diag.unlocked ? t('audioReady') : t('testAudioBtn')}</p>
        {!diag.unlocked && <p className="dim small">{t('audioHint')}</p>}
      </span>
    </button>
  );
}

/* ── Mission player ─────────────────────────────────────────────────────── */

function MissionPlayer() {
  const bc = useBootcampStore();
  const [checkTrigger, setCheckTrigger] = useState(0);
  const [showReader, setShowReader] = useState(false);
  const day = bc.currentDay();
  // Stop any lingering speech when the player unmounts (route change / back navigation).
  useEffect(() => () => cancelSpeech(), []);
  if (!day) return null;
  const step = day.steps[bc.index];
  const itemsById = new Map(day.items.map((i) => [i.id, i]));
  const convo = primaryDialogue(day);

  const pop = (): void => {
    success();
    setCheckTrigger((n) => n + 1);
  };
  const advance = (): void => {
    cancelSpeech(); // never let one step's audio bleed into the next
    bc.next();
  };
  const exit = (): void => {
    cancelSpeech();
    bc.exit();
  };

  if (showReader && convo) return <DialogueReader dialogue={convo} onClose={() => setShowReader(false)} />;
  if (!step) return <SummaryStep />;
  const progress = Math.round((bc.index / day.steps.length) * 100);

  return (
    <div className="screen">
      <CheckPop trigger={checkTrigger} />
      <div className="topbar">
        <button className="btn-ghost" onClick={exit}>{t('back')}</button>
        <span className="chip">{t('mission')} {day.day} · {L(day.title)}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="progress-track" style={{ marginBottom: 10 }}>
        <div className="progress-fill brand" style={{ width: `${progress}%` }} />
      </div>
      {/* Listen → Understand → Learn: advanced users can hear the whole scene up front. */}
      {bc.index === 0 && convo && (
        <button className="btn-ghost" style={{ alignSelf: 'center', marginBottom: 4 }} onClick={() => setShowReader(true)}>
          {t('listenFullConvo')}
        </button>
      )}
      <div className="fade-in" key={bc.index}>
        {step.kind === 'talk' && <TalkStep step={step} onNext={advance} />}
        {step.kind === 'tool' && <ToolStep step={step} item={itemsById.get(step.itemId)!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'quiz' && <QuizStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
        {step.kind === 'replies' && <RepliesStep step={step} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'swipe' && <SwipeStep itemIds={step.itemIds} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'dialogue' && <DialogueStep dialogue={day.dialogues[step.dialogueId]!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'ambush' && <AmbushStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
        {step.kind === 'receipt' && <ReceiptStep text={step.text} onNext={advance} />}
        {step.kind === 'summary' && <SummaryStep />}
      </div>
    </div>
  );
}

/* ── Steps ──────────────────────────────────────────────────────────────── */

function TalkStep({ step, onNext }: { step: Extract<BootcampStep, { kind: 'talk' }>; onNext: () => void }) {
  return (
    <>
      <div className="drill-card" style={{ textAlign: 'start', gap: 16 }}>
        <p style={{ fontSize: '2.4rem', textAlign: 'center' }}>{step.icon}</p>
        <p className="drill-phrase" style={{ fontSize: '1.4rem', textAlign: 'center' }}>{L(step.title)}</p>
        {step.body.map((b, i) => (
          <p key={i} className="drill-meaning" style={{ fontSize: '1rem' }}>{L(b)}</p>
        ))}
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{step.cta ? L(step.cta) : t('continue')}</button>
      </div>
    </>
  );
}

function ToolStep({ step, item, onDone }: { step: Extract<BootcampStep, { kind: 'tool' }>; item: BootcampItem; onDone: () => void }) {
  const bc = useBootcampStore();
  const [phase, setPhase] = useState<'listen' | 'reveal' | 'say'>('listen');
  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      void speak(item.text, 'en');
    }
  }, [item.text]);
  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{step.label ? L(step.label) : t('toolOf', { i: step.index, n: step.total })}</p>
        {phase === 'listen' ? (
          <>
            <p style={{ fontSize: '2.6rem' }}>👂</p>
            <p className="drill-meaning">{t('listenFirst')}</p>
          </>
        ) : (
          <>
            <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{item.text}</p>
            <p className="drill-meaning">{L(item.meaning)}</p>
            {item.tip && <p className="faint small">{L(item.tip)}</p>}
          </>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en', phase === 'listen' ? 1 : 0.8)}>
          🔊 {t('hearAgain')}
        </button>
        {phase === 'listen' && <button className="btn-primary" onClick={() => setPhase('reveal')}>{t('tapWhenReady')}</button>}
        {phase === 'reveal' && (
          <button className="btn-primary" onClick={() => { setPhase('say'); void speak(item.text, 'en', 0.85); }}>
            {t('sayItAloud')}
          </button>
        )}
        {phase === 'say' && (
          <button className="btn-accent" onClick={() => { bc.recordDrill(item.id, 'echo', 'pass'); onDone(); }}>
            {t('saidItBtn')}
          </button>
        )}
      </div>
    </>
  );
}

function QuizStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'quiz' }>; itemsById: Map<string, BootcampItem>; onDone: (ok: boolean) => void }) {
  const bc = useBootcampStore();
  const item = itemsById.get(step.itemId)!;
  const [options] = useState(() =>
    [item, ...step.wrongIds.map((id) => itemsById.get(id)!)]
      .map((i) => ({ id: i.id, label: L(i.meaning) }))
      .sort(() => Math.random() - 0.5),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      void speak(item.text, 'en');
    }
  }, [item.text]);

  // Answered — pause here. Explain, translate, replay freely, continue only on NEXT.
  if (picked !== null) {
    const ok = picked === item.id;
    return (
      <AnsweredView ok={ok} en={item.text} meaning={L(item.meaning)} tip={item.tip ? L(item.tip) : undefined}
        onNext={() => onDone(ok)} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('whatDidItMean')}</p>
        <p style={{ fontSize: '2.6rem' }}>👂</p>
      </div>
      <div className="action-zone">
        {options.map((o) => (
          <button key={o.id} className="btn-secondary" onClick={() => {
            tap();
            setPicked(o.id);
            bc.recordDrill(item.id, 'listen', o.id === item.id ? 'pass' : 'fail');
          }}>
            {o.label}
          </button>
        ))}
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en')}>🔊 {t('hearAgain')}</button>
      </div>
    </>
  );
}

/** Shared "you answered — now learn" surface: success/failure state, the correct answer
 *  highlighted, translation, unlimited replay, time to breathe, and a manual NEXT. */
function AnsweredView({ ok, en, meaning, tip, onNext }: { ok: boolean; en: string; meaning: string; tip?: string; onNext: () => void }) {
  return (
    <>
      <div className="drill-card pop-in" style={{ gap: 12, minHeight: 240 }}>
        <span className={`feedback-head ${ok ? 'ok' : 'bad'}`}>{ok ? `✓ ${t('correctHeader')}` : `✗ ${t('wrongHeader')}`}</span>
        <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>“{en}”</p>
        <p className="drill-label">{t('theMeaning')}</p>
        <p className="answer-pill">{meaning}</p>
        {tip && <p className="faint small">{tip}</p>}
        <p className="dim small">{ok ? t('whyRight') : t('whyWrong')}</p>
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speak(en, 'en')}>🔊 {t('hearAgain')}</button>
        <p className="faint small" style={{ textAlign: 'center' }}>{t('takeYourTime')}</p>
        <button className="btn-primary" onClick={onNext}>{t('nextBtn')}</button>
      </div>
    </>
  );
}

/** Expected Replies: "you said X — here's what they might answer." Comprehension-first. */
function RepliesStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'replies' }>; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const said = itemsById.get(step.saidItemId)!;
  const [idx, setIdx] = useState(-1); // -1 = intro
  const [picked, setPicked] = useState<string | null>(null);
  const reply = idx >= 0 ? itemsById.get(step.replyIds[idx] ?? '') : undefined;

  const options = useMemo(() => {
    if (!reply) return [];
    const wrongs = step.replyIds.filter((id) => id !== reply.id).slice(0, 2).map((id) => itemsById.get(id)!);
    return [reply, ...wrongs].map((i) => ({ id: i.id, label: L(i.meaning) })).sort(() => Math.random() - 0.5);
  }, [reply, step.replyIds, itemsById]);

  useEffect(() => {
    if (reply) void speak(reply.text, 'en');
  }, [reply]);

  if (idx === -1) {
    return (
      <>
        <div className="drill-card" style={{ gap: 10 }}>
          <p className="drill-label">{t('youSaid')}</p>
          <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>“{said.text}”</p>
          <p className="drill-meaning" style={{ fontSize: '0.95rem' }}>{t('expectedReplies')}</p>
        </div>
        <div className="action-zone">
          <button className="btn-primary" onClick={() => setIdx(0)}>👂 {t('imReady')}</button>
        </div>
      </>
    );
  }
  if (!reply) return null;

  // Answered — learn this reply before moving to the next one.
  if (picked !== null) {
    const ok = picked === reply.id;
    return (
      <AnsweredView ok={ok} en={reply.text} meaning={L(reply.meaning)} tip={reply.tip ? L(reply.tip) : undefined}
        onNext={() => {
          setPicked(null);
          if (idx + 1 >= step.replyIds.length) onDone();
          else setIdx(idx + 1);
        }} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('whichReply')} ({idx + 1}/{step.replyIds.length})</p>
        <p style={{ fontSize: '2.6rem' }}>👂</p>
      </div>
      <div className="action-zone">
        {options.map((o) => (
          <button key={o.id} className="btn-secondary" onClick={() => {
            tap();
            setPicked(o.id);
            bc.recordDrill(reply.id, 'listen', o.id === reply.id ? 'pass' : 'fail');
          }}>
            {o.label}
          </button>
        ))}
        <button className="btn-ghost" onClick={() => void speak(reply.text, 'en')}>🔊 {t('hearAgain')}</button>
      </div>
    </>
  );
}

function SwipeStep({ itemIds, itemsById, onDone }: { itemIds: string[]; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [i, setI] = useState(0);
  const item = itemsById.get(itemIds[i] ?? '')!;
  useEffect(() => {
    if (item) void speak(item.text, 'en');
  }, [item]);
  if (!item) return null;
  const answer = (know: boolean): void => {
    tap();
    bc.recordDrill(item.id, 'swipe', know ? 'pass' : 'fail');
    if (i + 1 >= itemIds.length) onDone();
    else setI(i + 1);
  };
  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{i + 1} / {itemIds.length}</p>
        <p className="drill-phrase" style={{ fontSize: '1.4rem' }}>{item.text}</p>
      </div>
      <div className="action-zone">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => answer(false)}>{t('dontKnow')}</button>
          <button className="btn-accent" onClick={() => answer(true)}>{t('know')}</button>
        </div>
      </div>
    </>
  );
}

/** Visual-novel dialogue: ONE exchange on screen, choices branch, no transcript spoilers. */
function DialogueStep({ dialogue, onDone }: { dialogue: BootcampDialogue; onDone: () => void }) {
  const bc = useBootcampStore();
  const nodesById = useMemo(() => new Map(dialogue.nodes.map((n) => [n.id, n])), [dialogue]);
  const [nodeId, setNodeId] = useState(dialogue.start);
  const [yourLine, setYourLine] = useState<string | null>(null); // your last spoken line (briefly shown)
  const [recovered, setRecovered] = useState(false);
  const node = nodesById.get(nodeId);

  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    if (node.who === 'npc') {
      void speak(node.en, 'en', node.fast ? 1.08 : node.slow ? 0.75 : 0.95).then(() => {
        if (cancelled) return;
        if (node.end) {
          setTimeout(() => !cancelled && onDone(), 800);
        } else if (node.next) {
          setTimeout(() => !cancelled && setNodeId(node.next!), 700);
        }
      });
    } else if (node.who === 'you' && node.next && !node.choices) {
      // scripted you-line: the app voices it for you, then moves on
      setYourLine(node.en);
      void speak(node.en, 'en', 0.92).then(() => {
        if (!cancelled) setTimeout(() => setNodeId(node.next!), 500);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  if (!node) return null;
  const npcNode = node.who === 'npc' ? node : [...nodesById.values()].find((n) => n.next === node.id || n.choices?.some((c) => c.next === node.id));
  const displayNpc = node.who === 'npc' ? node : npcNode;

  return (
    <>
      <div className="drill-card" style={{ gap: 14, minHeight: 240 }}>
        <p className="drill-label">{t('yourTurn')}</p>
        {recovered && <p className="faint small fade-in">🛟 {t('niceRecovery')}</p>}
        {displayNpc && (
          <div className="fade-in" key={displayNpc.id}>
            <p style={{ fontSize: '1.9rem' }}>🧑‍🍳</p>
            <p className="drill-phrase" style={{ fontSize: '1.25rem' }}>“{displayNpc.en}”</p>
            <p className="dim small">{displayNpc.he}</p>
          </div>
        )}
        {yourLine && node.who !== 'you' && <p className="faint small">🫵 {yourLine}</p>}
      </div>
      <div className="action-zone">
        {node.who === 'you' && node.choices ? (
          node.choices.map((c, i) => (
            <button
              key={i}
              className="btn-secondary"
              onClick={() => {
                tap();
                if (c.itemId) bc.recordDrill(c.itemId, 'simulator', c.correct ? 'pass' : 'partial');
                setRecovered(!c.correct);
                setYourLine(c.en);
                void speak(c.en, 'en', 0.92).then(() => setNodeId(c.next));
              }}
            >
              {c.en}
              <span className="dim small" style={{ display: 'block' }}>{c.he}</span>
            </button>
          ))
        ) : (
          <button className="btn-ghost" onClick={() => displayNpc && void speak(displayNpc.en, 'en', 0.8)}>
            🐢 {t('playSlow')}
          </button>
        )}
      </div>
    </>
  );
}

function AmbushStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'ambush' }>; itemsById: Map<string, BootcampItem>; onDone: (ok: boolean) => void }) {
  const bc = useBootcampStore();
  const [fired, setFired] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const shownAt = useRef(0);
  const correct = itemsById.get(step.correctItemId)!;
  const wrong = itemsById.get(step.wrongItemId)!;
  const [order] = useState(() => (Math.random() > 0.5 ? [correct, wrong] : [wrong, correct]));

  // Answered — explain what they threw at you and the tool that beats it; continue on NEXT.
  if (picked !== null) {
    const ok = picked === correct.id;
    return (
      <AnsweredView ok={ok} en={correct.text} meaning={L(correct.meaning)} tip={correct.tip ? L(correct.tip) : undefined}
        onNext={() => onDone(ok)} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('fastOneComing')}</p>
        <p style={{ fontSize: '2.6rem' }}>⚡</p>
        {fired && <p className="faint small fade-in">“{step.npc.en}”</p>}
      </div>
      <div className="action-zone">
        {!fired ? (
          <button className="btn-primary" onClick={() => {
            setFired(true);
            shownAt.current = Date.now();
            void speak(step.npc.en, 'en', 1.12);
          }}>
            👂 {t('imReady')}
          </button>
        ) : (
          <>
            {order.map((o) => (
              <button key={o.id} className="btn-secondary" onClick={() => {
                tap();
                bc.recordDrill(correct.id, 'listen', o.id === correct.id ? 'pass' : 'fail', Date.now() - shownAt.current);
                setPicked(o.id);
              }}>
                🛟 {o.text}
              </button>
            ))}
            <button className="btn-ghost" onClick={() => void speak(step.npc.en, 'en', 0.85)}>🔊 {t('hearAgain')}</button>
          </>
        )}
      </div>
    </>
  );
}

function ReceiptStep({ text, onNext }: { text: Record<string, string>; onNext: () => void }) {
  const bc = useBootcampStore();
  useEffect(() => {
    bc.addReceipt(L(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="drill-card pop-in">
        <p style={{ fontSize: '2.6rem' }}>🧾</p>
        <p className="drill-phrase" style={{ fontSize: '1.25rem' }}>{L(text)}</p>
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{t('continue')}</button>
      </div>
    </>
  );
}

/** Mission complete — capability card, receipts, and the "one more mission" loop. */
function SummaryStep() {
  const bc = useBootcampStore();
  const day = bc.currentDay();
  const app = useAppStore();
  const [showReader, setShowReader] = useState(false);
  if (!day) return null;
  const receipts = bc.receipts.filter((r) => r.day === day.day);
  const convo = primaryDialogue(day);
  const nextBuilt = BOOTCAMP_PLAN.find((m) => m.day > day.day && m.day in DAYS && !bc.completedDays.includes(m.day));
  const finish = (): void => {
    cancelSpeech();
    bc.completeDay();
    bc.exit();
  };
  if (showReader && convo) return <DialogueReader dialogue={convo} onClose={() => setShowReader(false)} />;
  return (
    <>
      <div className="drill-card pop-in" style={{ textAlign: 'start', gap: 12 }}>
        <p className="drill-label" style={{ textAlign: 'center' }}>{t('dayComplete', { n: day.day })}</p>
        <p className="drill-phrase" style={{ fontSize: '1.5rem', textAlign: 'center' }}>🎖️ {L(day.title)}</p>
        <p className="dim small">{t('yourEvidence')}:</p>
        {receipts.map((r, i) => (
          <p key={i} className="small">🧾 {r.text}</p>
        ))}
      </div>
      <div className="action-zone">
        {convo && (
          <button className="btn-secondary" onClick={() => setShowReader(true)}>{t('reviewConversation')}</button>
        )}
        {nextBuilt && (
          <button
            className="btn-primary breathe"
            onClick={() => {
              bc.completeDay();
              bc.startDay(nextBuilt.day);
            }}
          >
            {t('nextMission', { title: L(nextBuilt.title) })}
          </button>
        )}
        <button className={nextBuilt ? 'btn-ghost' : 'btn-primary'} onClick={() => { finish(); app.navigate('bootcamp'); }}>
          {t('backToMap')}
        </button>
      </div>
    </>
  );
}

/* ── Full dialogue reader — the premium study sheet ─────────────────────── */

/** The complete conversation as a reader: every line in both languages, per-line replay,
 *  play-all / pause / restart / prev / next, with the current line highlighted. Used before
 *  the mission (preview) and after it (study sheet). Pure playback — no scoring. */
function DialogueReader({ dialogue, onClose }: { dialogue: BootcampDialogue; onClose: () => void }) {
  const lines = useMemo(() => dialogueTranscript(dialogue), [dialogue]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const runToken = useRef(0);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cancel any speech + abort any play-all loop when the reader closes.
  useEffect(() => () => { runToken.current += 1; cancelSpeech(); }, []);

  // Keep the active line in view as playback (or stepping) moves through the sheet.
  useEffect(() => {
    lineRefs.current[current]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [current]);

  const stop = (): void => {
    runToken.current += 1; // invalidate any in-flight play-all loop
    setPlaying(false);
    cancelSpeech();
  };

  const playOne = (i: number): void => {
    stop();
    setCurrent(i);
    void speak(lines[i]!.en, 'en', 0.95);
  };

  const playAll = (from: number): void => {
    const token = ++runToken.current;
    setPlaying(true);
    void (async () => {
      for (let i = from; i < lines.length; i++) {
        if (token !== runToken.current) return; // paused / closed / stepped away
        setCurrent(i);
        await speak(lines[i]!.en, 'en', 0.95);
        if (token !== runToken.current) return;
        await new Promise((r) => setTimeout(r, 350)); // a beat between speakers
      }
      if (token === runToken.current) setPlaying(false);
    })();
  };

  const atStart = current <= 0;
  const atEnd = current >= lines.length - 1;

  return (
    <div className="reader">
      <div className="topbar">
        <button className="btn-ghost" onClick={() => { stop(); onClose(); }} aria-label={t('close')}>←</button>
        <span className="chip">📖 {t('fullConversationTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <p className="dim small" style={{ margin: '0 0 8px' }}>{t('studySheetSub')} · {t('lineProgress', { i: current + 1, n: lines.length })}</p>
      <div className="reader-scroll">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            className={`dline ${line.who === 'you' ? 'you' : ''} ${i === current ? 'now' : ''}`}
          >
            <div className="dline-top">
              <span className="dline-speaker">{line.who === 'you' ? `🫵 ${t('speakerYou')}` : `🧑 ${t('speakerThem')}`}</span>
              <button className="dline-play" onClick={() => playOne(i)} aria-label={t('replay')}>🔊</button>
            </div>
            <p className="dline-en">{line.en}</p>
            <p className="dline-he">{line.he}</p>
          </div>
        ))}
      </div>
      <div className="reader-transport">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => playOne(Math.max(0, current - 1))} disabled={atStart}>‹ {t('prevLine')}</button>
          <button className="btn-secondary" onClick={() => { setCurrent(0); playAll(0); }}>{t('restartConvo')}</button>
          <button className="btn-secondary" onClick={() => playOne(Math.min(lines.length - 1, current + 1))} disabled={atEnd}>{t('nextLine')} ›</button>
        </div>
        <button className="btn-primary" onClick={() => (playing ? stop() : playAll(current))}>
          {playing ? t('pausePlay') : t('playAll')}
        </button>
      </div>
    </div>
  );
}
