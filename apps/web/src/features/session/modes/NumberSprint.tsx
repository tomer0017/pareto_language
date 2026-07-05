import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ContentItem, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../../shared/stores/appStore.js';
import { playItem } from '../../../shared/audio/tts.js';
import { L, t } from '../../../shared/i18n/strings.js';

const SPRINT_SECONDS = 60;

/**
 * Mode 5 — Number Sprint (PDF §9): 60-second run — hear an Italian number, tap its value.
 * Speed pressure is the learning mechanism (automaticity), not decoration. Personal best is a
 * real capability metric. Each answer logs a numberSprint ReviewEvent for that number item.
 */
export function NumberSprint({ onFinish }: { onFinish: (events: ReviewEvent[]) => void }) {
  const app = useAppStore();
  const numberItems = useMemo(
    () => (app.pack?.items ?? []).filter((i) => i.kind === 'number'),
    [app.pack],
  );
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SPRINT_SECONDS);
  const [current, setCurrent] = useState<ContentItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const events = useRef<ReviewEvent[]>([]);
  const best = useRef(Number(localStorage.getItem('ready.sprintBest') ?? '0'));

  const nextPrompt = useCallback(() => {
    if (numberItems.length < 4) return;
    const target = numberItems[Math.floor(Math.random() * numberItems.length)];
    if (!target) return;
    const distractors = numberItems
      .filter((n) => n.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((n) => L(n.meaning));
    setCurrent(target);
    setOptions([...distractors, L(target.meaning)].sort(() => Math.random() - 0.5));
    setLocked(false);
    void playItem(target);
  }, [numberItems]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          if (score > best.current) {
            best.current = score;
            localStorage.setItem('ready.sprintBest', String(score));
          }
          onFinish(events.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const answer = (meaning: string) => {
    if (!current || !app.user || locked) return;
    setLocked(true);
    const pass = meaning === L(current.meaning);
    events.current.push({
      id: crypto.randomUUID(),
      userId: app.user.id,
      itemId: current.id,
      mode: 'numberSprint',
      outcome: pass ? 'pass' : 'fail',
      at: new Date().toISOString(),
    });
    if (pass) setScore((s) => s + 1);
    setTimeout(nextPrompt, 250);
  };

  if (!running && secondsLeft === SPRINT_SECONDS) {
    return (
      <>
        <div className="drill-card">
          <p className="drill-label">{t('speedChallenge')}</p>
          <p className="drill-phrase">60 seconds</p>
          <p className="drill-meaning">Hear the number, tap its value. Speed builds automaticity.</p>
          {best.current > 0 && <p className="dim small">{t('personalBest', { n: best.current })}</p>}
        </div>
        <div className="action-zone">
          <button
            className="btn-accent"
            onClick={() => {
              setRunning(true);
              setScore(0);
              events.current = [];
              nextPrompt();
            }}
          >
            {t('startSprint')}
          </button>
          <button className="btn-ghost" onClick={() => onFinish([])}>
            {t('skip')}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="drill-card" style={{ minHeight: 200 }}>
        <p className="drill-label">
          {secondsLeft}s · score {score}
        </p>
        <p style={{ fontSize: '2.4rem' }}>🔊</p>
        <button className="btn-ghost" onClick={() => current && void playItem(current)}>
          {t('playAgain')}
        </button>
      </div>
      <div className="action-zone">
        <div className="keypad">
          {options.map((o) => (
            <button key={o} className="btn-secondary" onClick={() => answer(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
