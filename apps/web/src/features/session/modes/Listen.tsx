import { useEffect, useMemo, useState } from 'react';
import type { ContentItem, Outcome, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../../shared/stores/appStore.js';
import { playItem } from '../../../shared/audio/tts.js';

/**
 * Mode 4 — Understand the Answer (PDF §9): natural-speed audio of a likely reply → choose the
 * meaning from 3 options. Distractors are plausible same-situation replies. Slow replay is
 * available but logged (usedSlowAudio) — mastery requires success without it.
 */
export function Listen({
  item,
  onDone,
}: {
  item: ContentItem;
  onDone: (o: Outcome, extras?: Partial<ReviewEvent>) => void;
}) {
  const app = useAppStore();
  const [usedSlow, setUsedSlow] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setUsedSlow(false);
    setPicked(null);
    void playItem(item);
  }, [item]);

  const options = useMemo(() => {
    const sameSituation = (app.pack?.items ?? []).filter(
      (i) =>
        i.id !== item.id &&
        (i.kind === 'reply' || i.kind === 'phrase') &&
        i.situationIds.some((sid) => item.situationIds.includes(sid)),
    );
    const pool = sameSituation.length >= 2 ? sameSituation : (app.pack?.items ?? []).filter((i) => i.id !== item.id);
    const distractors = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
    return [...distractors.map((d) => d.meaning), item.meaning].sort(() => Math.random() - 0.5);
  }, [item, app.pack]);

  const choose = (meaning: string) => {
    if (picked) return;
    setPicked(meaning);
    const correct = meaning === item.meaning;
    setTimeout(() => onDone(correct ? 'pass' : 'fail', { usedSlowAudio: usedSlow }), 650);
  };

  return (
    <>
      <div className="drill-card">
        <p className="drill-prompt-label">What did they say?</p>
        <p style={{ fontSize: '2.4rem' }}>🔊</p>
        {picked && (
          <p className="drill-meaning fade-in">
            “{item.text}” — {item.meaning}
          </p>
        )}
      </div>
      <div className="action-zone">
        {options.map((meaning) => {
          const isCorrect = meaning === item.meaning;
          const style =
            picked === null
              ? undefined
              : isCorrect
                ? { outline: '2px solid var(--accent)' }
                : picked === meaning
                  ? { outline: '2px solid var(--danger)' }
                  : undefined;
          return (
            <button key={meaning} className="btn-secondary" style={style} onClick={() => choose(meaning)}>
              {meaning}
            </button>
          );
        })}
        <div className="btn-row">
          <button className="btn-ghost" onClick={() => void playItem(item)}>
            🔊 Again
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setUsedSlow(true);
              void playItem(item, { slow: true });
            }}
          >
            🐢 Slow
          </button>
        </div>
      </div>
    </>
  );
}
