import { useEffect, useMemo, useState } from 'react';
import type { ContentItem, Outcome, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../../shared/stores/appStore.js';
import { playItem } from '../../../shared/audio/tts.js';
import { L, t } from '../../../shared/i18n/strings.js';
import { shuffle } from '../../../shared/util/shuffle.js';

/** Mode 4 — Listening: natural-speed reply → pick the meaning. Slow replay is logged. */
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
    const pool =
      sameSituation.length >= 2 ? sameSituation : (app.pack?.items ?? []).filter((i) => i.id !== item.id);
    const distractors = shuffle(pool).slice(0, 2);
    return shuffle([...distractors.map((d) => L(d.meaning)), L(item.meaning)]);
  }, [item, app.pack]);

  const choose = (meaning: string) => {
    if (picked) return;
    setPicked(meaning);
    const correct = meaning === L(item.meaning);
    setTimeout(() => onDone(correct ? 'pass' : 'fail', { usedSlowAudio: usedSlow }), 650);
  };

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('whatDidTheySay')}</p>
        <p style={{ fontSize: '2.5rem' }}>👂</p>
        {picked && (
          <p className="drill-meaning fade-in">
            “{item.text}” — {L(item.meaning)}
          </p>
        )}
      </div>
      <div className="action-zone">
        {options.map((meaning) => {
          const isCorrect = meaning === L(item.meaning);
          const cls =
            picked === null ? '' : isCorrect ? 'option-correct' : picked === meaning ? 'option-wrong' : '';
          return (
            <button key={meaning} className={`btn-secondary ${cls}`} onClick={() => choose(meaning)}>
              {meaning}
            </button>
          );
        })}
        <div className="btn-row">
          <button className="btn-ghost" onClick={() => void playItem(item)}>
            🔊 {t('replayAudio')}
          </button>
        </div>
      </div>
    </>
  );
}
