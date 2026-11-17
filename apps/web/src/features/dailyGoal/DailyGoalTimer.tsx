import { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode, type RefObject } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import type { DailyGoalView } from './dailyGoalEngine.js';
import { GOAL_OPTIONS, formatActive, type GoalMinutes } from './dailyGoalTime.js';
import { celebrationFor, prefersReducedMotion, useBottomClearance, useDailyGoal } from './useDailyGoalTimer.js';
import './dailyGoal.css';

/**
 * Daily Goal — the floating timer bubble and its small panel. Mounted ONCE at the app shell (App.tsx),
 * so it is the same timer on every screen. It shows; the engine decides (dailyGoalEngine.ts).
 *
 *   ⏱ Daily goal      → no goal yet: tap, pick 5 / 10 / 15 minutes — the timer starts at once
 *   ⏱ 4:21 / 10m      → today's time toward the goal (brand colour while today's timer is on)
 *   ✓ 12:48           → goal reached: green, a ✓, and it keeps counting
 *
 * Never red, never a streak, never a score.
 */

/** The bubble's accessible name — the state in words, not only in colour. */
export function bubbleLabel(view: DailyGoalView): string {
  const time = formatActive(view.seconds * 1000);
  if (view.status === 'unset') return t('dailyGoalAriaUnset');
  if (view.status === 'done') return t('dailyGoalAriaDone', { time });
  return t(view.sessionActive ? 'dailyGoalAriaRunning' : 'dailyGoalAriaPaused', { goal: view.goalMinutes ?? 0, time });
}

export function DailyGoalBubble({ view, open, onToggle, buttonRef }: {
  view: DailyGoalView; open: boolean; onToggle?: () => void; buttonRef?: RefObject<HTMLButtonElement>;
}) {
  const time = formatActive(view.seconds * 1000);
  return (
    <button
      ref={buttonRef} type="button" className="dg-bubble" data-status={view.status} data-counting={view.counting}
      aria-haspopup="dialog" aria-expanded={open} aria-controls="dg-panel" aria-label={bubbleLabel(view)} onClick={onToggle}
    >
      {view.status === 'unset' ? (
        <><span className="dg-icon" aria-hidden>⏱</span><span>{t('dailyGoal')}</span></>
      ) : view.status === 'done' ? (
        <><span className="dg-icon" aria-hidden>✓</span><span className="dg-time" dir="ltr">{time}</span></>
      ) : (
        <>
          <span className="dg-icon" aria-hidden>⏱</span>
          <span className="dg-time" dir="ltr">{time}</span>
          <span className="dg-of">/ {t('dailyGoalShort', { n: view.goalMinutes ?? 0 })}</span>
        </>
      )}
    </button>
  );
}

export function DailyGoalPanel({ view, changing, panelRef, onChoose, onResume, onPause, onChange }: {
  view: DailyGoalView; changing: boolean; panelRef?: RefObject<HTMLDivElement>;
  onChoose?: (minutes: GoalMinutes) => void; onResume?: () => void; onPause?: () => void; onChange?: () => void;
}) {
  const goal = view.goalMinutes;
  const choosing = goal === null || changing;
  return (
    <div id="dg-panel" ref={panelRef} className="dg-panel" role="dialog" aria-label={t('dailyGoal')}>
      {choosing ? (
        <>
          <p className="dg-panel-title">{t('dailyGoalQuestion')}</p>
          <div className="dg-options">
            {GOAL_OPTIONS.map((n) => (
              <button key={n} type="button" className="dg-option" aria-pressed={goal === n} onClick={() => onChoose?.(n)}>
                {t('dailyGoalMinutes', { n })}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="dg-panel-eyebrow">{t('dailyGoalToday')} · {t('dailyGoalMinutes', { n: goal })}</p>
          <p className="dg-panel-time"><span dir="ltr">{formatActive(view.seconds * 1000)}</span></p>
          <div className="dg-progress" role="progressbar" aria-label={t('dailyGoalProgress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(view.progress * 100)}>
            <span className="dg-progress-fill" style={{ inlineSize: `${Math.round(view.progress * 100)}%` }} />
          </div>
          {view.status === 'done' && <p className="dg-done">{t('dailyGoalDone')}</p>}
          <div className="dg-actions">
            {view.sessionActive ? (
              <button type="button" className="dg-action" onClick={onPause}>{t('dailyGoalPause')}</button>
            ) : (
              <button type="button" className="dg-action is-primary" onClick={onResume}>{t(view.seconds > 0 ? 'dailyGoalResume' : 'dailyGoalStart')}</button>
            )}
            <button type="button" className="dg-action" onClick={onChange}>{t('dailyGoalChange')}</button>
          </div>
        </>
      )}
    </div>
  );
}

/** About one second of confetti — the app's own confetti style (`.confetti`), shorter and lighter. */
export const CELEBRATION_MS = 1100;
const CONFETTI_COLORS = ['#5b46e4', '#0ca678', '#e8a13c', '#15803d', '#2f6fed', '#e8590c'];
export function GoalConfetti() {
  const pieces = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.15,
      dur: 0.75 + Math.random() * 0.3,
      rot: Math.random() * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
    [],
  );
  return (
    <div className="confetti dg-confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, rotate: `${p.rot}deg` }} />
      ))}
    </div>
  );
}

/** The celebration the engine asked for, played once — never on a remount, a reload or a route change. */
function useCelebration(count: number): number {
  const seen = useRef(count);
  const [playing, setPlaying] = useState(0);
  useEffect(() => {
    if (count === seen.current) return undefined;
    seen.current = count;
    if (celebrationFor(prefersReducedMotion()) !== 'confetti') return undefined; // calm: the bubble just turns green ✓
    setPlaying(count);
    const id = window.setTimeout(() => setPlaying(0), CELEBRATION_MS);
    return () => window.clearTimeout(id);
  }, [count]);
  return playing;
}

export function DailyGoalTimer() {
  useAppStore((s) => s.uiLang); // re-render in the new app language
  const { view, engine } = useDailyGoal();
  const [open, setOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const confetti = useCelebration(view.celebrations);
  useBottomClearance(rootRef);

  // Opening (or switching to the goal choice) moves focus into the panel.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [open, changing]);

  if (!engine) return null;
  const close = (): void => {
    setOpen(false);
    setChanging(false);
    bubbleRef.current?.focus();
  };
  const then = (action: () => void) => (): void => { action(); close(); };

  return (
    <div
      ref={rootRef} className="dg-root" data-status={view.status}
      onKeyDown={(e) => { if (open && e.key === 'Escape') { e.stopPropagation(); close(); } }}
    >
      {/* A tap outside closes the panel — and only closes it (it never lands on an answer below). */}
      {open && <div className="dg-scrim" onClick={close} />}
      {open && (
        <DailyGoalPanel
          view={view} changing={changing} panelRef={panelRef}
          onChoose={(n) => then(() => engine.chooseGoal(n))()}
          onResume={then(() => engine.resume())}
          onPause={then(() => engine.pause())}
          onChange={() => setChanging(true)}
        />
      )}
      <DailyGoalBubble view={view} open={open} buttonRef={bubbleRef} onToggle={() => (open ? close() : setOpen(true))} />
      <span className="dg-live" aria-live="polite">{view.status === 'done' ? t('dailyGoalDone') : ''}</span>
      {confetti > 0 && <GoalConfetti key={confetti} />}
    </div>
  );
}

/** A floating utility must never take a screen down with it: on an error it simply disappears. */
export class DailyGoalBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  override componentDidCatch(error: Error, info: ErrorInfo): void { console.error('[dailyGoal]', error, info.componentStack); }
  override render(): ReactNode { return this.state.failed ? null : this.props.children; }
}
