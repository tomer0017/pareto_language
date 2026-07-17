import { useMemo } from 'react';
import { t } from '../i18n/strings.js';
import { languageDirection } from '../i18n/languages.js';
import { useAppStore } from '../stores/appStore.js';
import { PlaybackControls } from './PlaybackControls.js';
import { useParrotPlayback } from './useParrotPlayback.js';
import type { PlaybackItem } from './types.js';

/**
 * Reusable "now playing" listening screen for single-item surfaces (Core Words + Core Sentences share
 * THIS exact component). It renders the current target + translation as a large, glanceable card and
 * mounts the shared {@link PlaybackControls}; all behaviour comes from {@link useParrotPlayback}. A
 * screen only builds `items` (+ an optional `bookmarkKey` to remember the last item) and drops this
 * in — no playback code is written twice. The Dialogue Transcript uses the same engine directly (it
 * needs its full-list + highlight presentation).
 */
export function ListenPanel({ items, bookmarkKey, emptyText }: { items: PlaybackItem[]; bookmarkKey?: string; emptyText?: string }) {
  const uiLang = useAppStore((s) => s.uiLang);
  const pb = useParrotPlayback(items, { bookmarkKey });
  const item = items[pb.currentIndex];

  const targetDir = useMemo(() => (item ? languageDirection(item.targetLang) : 'ltr'), [item]);
  const trDir = useMemo(() => languageDirection(uiLang), [uiLang]);

  if (items.length === 0) {
    return (
      <div className="drill-card pop-in center" style={{ marginTop: 24 }}>
        <p style={{ fontSize: '2.4rem' }}>🎧</p>
        <p className="drill-meaning">{emptyText ?? t('listenEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="listen-panel">
      <div className={`listen-now ${pb.status === 'playing' ? 'is-playing' : ''}`}>
        <p className="dim small listen-progress">{t('lineProgress', { i: pb.position, n: pb.total })}</p>
        {item?.emoji && <p className="listen-emoji" aria-hidden>{item.emoji}</p>}
        <p className="listen-target" dir={targetDir}>{item?.target}</p>
        {pb.settings.translation && item?.translation && (
          <p className="listen-translation" dir={trDir}>{item.translation}</p>
        )}
      </div>
      <PlaybackControls pb={pb} />
    </div>
  );
}
