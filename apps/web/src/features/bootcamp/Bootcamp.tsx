import { useEffect, useRef, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { CheckPop } from '../../shared/ui/CheckPop.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { DAYS, useBootcampStore } from './bootcampStore.js';
import type { BootcampItem, BootcampStep, DialogueLine } from './day1.js';

/**
 * Bootcamp (Sprint 6): landing (20-day map) + the generic day player.
 * The player renders steps from data — days 2–20 need only content files.
 * Every screen answers: does this reduce fear? (Part 9)
 */

export function Bootcamp() {
  const activeDay = useBootcampStore((s) => s.activeDay);
  return activeDay === null ? <BootcampLanding /> : <DayPlayer />;
}

/* ── Landing: the 20-capability map ─────────────────────────────────────── */

function BootcampLanding() {
  const app = useAppStore();
  const bc = useBootcampStore();
  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" onClick={() => app.navigate('mission')} aria-label={t('back')}>←</button>
        <h2 style={{ margin: 0 }}>{t('bootcamp')}</h2>
        <span style={{ width: 44 }} />
      </div>
      <p className="dim small" style={{ marginBottom: 12 }}>{t('bootcampSub')}</p>
      <div className="screen-scroll no-nav">
        <div className="stagger">
          {BOOTCAMP_PLAN.map((d) => {
            const built = d.day in DAYS;
            const done = bc.completedDays.includes(d.day);
            const resumable = (bc.stepIndex[String(d.day)] ?? 0) > 0 && !done;
            return (
              <button
                key={d.day}
                className="game-card card-press"
                disabled={!built}
                style={built ? undefined : { opacity: 0.45 }}
                onClick={() => {
                  tap();
                  bc.startDay(d.day);
                }}
              >
                <span className="game-icon" style={{ background: done ? 'var(--good)' : built ? 'var(--brand)' : 'var(--line)' }}>
                  {done ? '✓' : d.day}
                </span>
                <span>
                  <p style={{ fontWeight: 800 }}>{L(d.title)}</p>
                  <p className="dim small">
                    {done ? t('completed') : built ? (resumable ? t('continueDay', { n: d.day }) : `${d.minutes} ${t('min')} · ${t('startDay', { n: d.day })}`) : t('locked')}
                  </p>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Day player: renders any day's steps ────────────────────────────────── */

function DayPlayer() {
  const bc = useBootcampStore();
  const [checkTrigger, setCheckTrigger] = useState(0);
  const day = bc.currentDay();
  if (!day) return null;
  const step = day.steps[bc.index];
  const itemsById = new Map(day.items.map((i) => [i.id, i]));

  const pop = (): void => {
    success();
    setCheckTrigger((n) => n + 1);
  };
  const advance = (): void => bc.next();

  if (!step) {
    // Past the last step (resume edge) — treat as summary.
    return <SummaryStep />;
  }

  const progress = Math.round((bc.index / day.steps.length) * 100);

  return (
    <div className="screen">
      <CheckPop trigger={checkTrigger} />
      <div className="topbar">
        <button className="btn-ghost" onClick={() => bc.exit()}>{t('back')}</button>
        <span className="chip">{t('day')} {day.day} · {L(day.title)}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="progress-track" style={{ marginBottom: 10 }}>
        <div className="progress-fill brand" style={{ width: `${progress}%` }} />
      </div>
      <div className="fade-in" key={bc.index}>
        {step.kind === 'talk' && <TalkStep step={step} onNext={advance} />}
        {step.kind === 'tool' && <ToolStep step={step} item={itemsById.get(step.itemId)!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'quiz' && <QuizStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
        {step.kind === 'swipe' && <SwipeStep itemIds={step.itemIds} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'dialogue' && <DialogueStep mode={step.mode} lines={day.dialogue} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
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

/** Listening-first tool intro: hear → understand → say (Part 6 order, always). */
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
        <p className="drill-label">{t('toolOf', { i: step.index, n: step.total })}</p>
        {phase === 'listen' && (
          <>
            <p style={{ fontSize: '2.6rem' }}>👂</p>
            <p className="drill-meaning">{t('listenFirst')}</p>
          </>
        )}
        {phase !== 'listen' && (
          <>
            <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{item.text}</p>
            <p className="drill-meaning">{L(item.meaning)}</p>
            {item.tip && <p className="faint small">{L(item.tip)}</p>}
            <p className="faint small">🛟 {t('notVocabulary')}</p>
          </>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en', phase === 'listen' ? 1 : 0.8)}>
          🔊 {t('hearAgain')}
        </button>
        {phase === 'listen' && (
          <button className="btn-primary" onClick={() => setPhase('reveal')}>{t('tapWhenReady')}</button>
        )}
        {phase === 'reveal' && (
          <button className="btn-primary" onClick={() => { setPhase('say'); void speak(item.text, 'en', 0.85); }}>
            {t('sayItAloud')}
          </button>
        )}
        {phase === 'say' && (
          <button
            className="btn-accent"
            onClick={() => {
              bc.recordDrill(item.id, 'echo', 'pass');
              onDone();
            }}
          >
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
  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('whatDidItMean')}</p>
        <p style={{ fontSize: '2.6rem' }}>👂</p>
        {picked && <p className="drill-meaning fade-in">“{item.text}”</p>}
      </div>
      <div className="action-zone">
        {options.map((o) => {
          const cls = picked === null ? '' : o.id === item.id ? 'option-correct' : picked === o.id ? 'option-wrong' : '';
          return (
            <button
              key={o.id}
              className={`btn-secondary ${cls}`}
              onClick={() => {
                if (picked) return;
                setPicked(o.id);
                const ok = o.id === item.id;
                bc.recordDrill(item.id, 'listen', ok ? 'pass' : 'fail');
                setTimeout(() => onDone(ok), 700);
              }}
            >
              {o.label}
            </button>
          );
        })}
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en')}>🔊 {t('hearAgain')}</button>
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
        <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{item.text}</p>
        <p className="faint small">{t('tapToFlip')}</p>
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

function DialogueStep({ mode, lines, itemsById, onDone }: { mode: 'watch' | 'play'; lines: DialogueLine[]; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const [idx, setIdx] = useState(0);
  const line = lines[idx];
  const shown = lines.slice(0, Math.min(idx + 1, lines.length)); // derived — StrictMode-safe

  useEffect(() => {
    if (!line) return;
    let cancelled = false;
    // Speak, THEN advance — a line is never cut off mid-sentence (zero-English users need the
    // full audio + a beat to read the subtitle).
    void speak(line.en, 'en', line.fast ? 1.05 : 0.92).then(() => {
      if (cancelled) return;
      if (mode === 'watch' || line.who === 'npc' || !line.choice) {
        setTimeout(() => {
          if (!cancelled) setIdx((n) => n + 1);
        }, 900);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, mode]);

  useEffect(() => {
    if (idx >= lines.length) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const needsChoice = mode === 'play' && line?.who === 'you' && line.choice;

  return (
    <>
      <div className="drill-card" style={{ justifyContent: 'flex-start', textAlign: 'start', gap: 10, maxHeight: '52vh', overflowY: 'auto' }}>
        <p className="drill-label">{mode === 'watch' ? t('watchFirst') : t('yourTurn')}</p>
        {shown.map((l, i) => (
          <div key={i}>
            <p style={{ fontWeight: l.who === 'you' ? 800 : 500 }}>
              {l.who === 'npc' ? '🧑‍🍳 ' : '🫵 '}{l.en}
            </p>
            <p className="faint small">{l.he}</p>
          </div>
        ))}
      </div>
      <div className="action-zone">
        {needsChoice && line.choice ? (
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                const correct = itemsById.get(line.choice!.correctItemId)!;
                bc.recordDrill(correct.id, 'simulator', 'pass');
                setIdx(idx + 1);
              }}
            >
              🛟 {itemsById.get(line.choice.correctItemId)!.text}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                bc.recordDrill(line.choice!.correctItemId, 'simulator', 'partial');
                setIdx(idx + 1); // wrong pick still advances — gently; the right line is spoken
              }}
            >
              {L(line.choice.wrong)}
            </button>
          </>
        ) : (
          <p className="faint small center">…</p>
        )}
      </div>
    </>
  );
}

function AmbushStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'ambush' }>; itemsById: Map<string, BootcampItem>; onDone: (ok: boolean) => void }) {
  const bc = useBootcampStore();
  const [fired, setFired] = useState(false);
  const shownAt = useRef(0);
  const correct = itemsById.get(step.correctItemId)!;
  const wrong = itemsById.get(step.wrongItemId)!;
  const [order] = useState(() => (Math.random() > 0.5 ? [correct, wrong] : [wrong, correct]));
  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('fastOneComing')}</p>
        <p style={{ fontSize: '2.6rem' }}>⚡</p>
        {fired && <p className="faint small fade-in">“{step.npc.en}”</p>}
      </div>
      <div className="action-zone">
        {!fired ? (
          <button
            className="btn-primary"
            onClick={() => {
              setFired(true);
              shownAt.current = Date.now();
              void speak(step.npc.en, 'en', 1.1);
            }}
          >
            👂 {t('imReady')}
          </button>
        ) : (
          order.map((o) => (
            <button
              key={o.id}
              className="btn-secondary"
              onClick={() => {
                const ok = o.id === correct.id;
                bc.recordDrill(correct.id, 'listen', ok ? 'pass' : 'fail', Date.now() - shownAt.current);
                onDone(ok);
              }}
            >
              🛟 {o.text}
            </button>
          ))
        )}
      </div>
    </>
  );
}

function ReceiptStep({ text, onNext }: { text: { [k: string]: string }; onNext: () => void }) {
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

function SummaryStep() {
  const bc = useBootcampStore();
  const day = bc.currentDay();
  const app = useAppStore();
  if (!day) return null;
  const receipts = bc.receipts.filter((r) => r.day === day.day);
  const tomorrow = BOOTCAMP_PLAN.find((d) => d.day === day.day + 1);
  return (
    <>
      <div className="drill-card pop-in" style={{ textAlign: 'start', gap: 12 }}>
        <p className="drill-label" style={{ textAlign: 'center' }}>{t('dayComplete', { n: day.day })}</p>
        <p className="drill-phrase" style={{ fontSize: '1.5rem', textAlign: 'center' }}>🎖️ {L(day.title)}</p>
        <p className="dim small">{t('yourEvidence')}:</p>
        {receipts.map((r, i) => (
          <p key={i} className="small">🧾 {r.text}</p>
        ))}
        {tomorrow && <p className="faint small" style={{ marginTop: 6 }}>{t('tomorrowTeaser', { title: L(tomorrow.title) })}</p>}
      </div>
      <div className="action-zone">
        <button
          className="btn-primary breathe"
          onClick={() => {
            bc.completeDay();
            bc.exit();
            app.navigate('bootcamp');
          }}
        >
          {t('finishDay', { n: day.day })}
        </button>
      </div>
    </>
  );
}
