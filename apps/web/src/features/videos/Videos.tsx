import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { DAYS, useBootcampStore } from '../bootcamp/bootcampStore.js';
import { VideoPlayer } from '../bootcamp/Bootcamp.js';
import type { BootcampVideo } from '../bootcamp/types.js';

/**
 * Videos — an experience, not a list (Task 2). Play a random available mission video; when it
 * ends (or the learner says so), ask "Did you understand everything?" → either load another random
 * video, or drop into the exact Mission Hub that owns this video (Practice / Transcript / Video,
 * unchanged). Videos are the missions' optional `introVideo`s — only Mission 2 ships one today.
 */
interface VideoEntry { day: number; video: BootcampVideo }

function allVideos(): VideoEntry[] {
  const out: VideoEntry[] = [];
  for (const d of Object.values(DAYS)) {
    if (d.introVideo) out.push({ day: d.day, video: d.introVideo });
  }
  return out;
}

function pickRandom(pool: VideoEntry[], exclude: Set<number>): VideoEntry | null {
  const avail = pool.filter((v) => !exclude.has(v.day));
  if (avail.length === 0) return null;
  return avail[Math.floor(Math.random() * avail.length)]!;
}

export function Videos() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const pool = useMemo(allVideos, []);
  const [watched, setWatched] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState<VideoEntry | null>(() => pickRandom(pool, new Set()));
  const [showPopup, setShowPopup] = useState(false);

  const next = (): void => {
    const nw = new Set(watched);
    if (current) nw.add(current.day);
    setWatched(nw);
    setShowPopup(false);
    setCurrent(pickRandom(pool, nw)); // null → the all-done empty state below
  };

  const practice = (): void => {
    if (!current) return;
    tap();
    bc.startDay(current.day); // opens the existing Mission Hub that owns this video
    app.navigate('bootcamp');
  };

  // Empty state — no videos exist yet, or every available one has been watched this session.
  if (!current) {
    const none = pool.length === 0;
    return (
      <div className="screen">
        <div className="topbar">
          <button className="btn-ghost" onClick={() => app.navigate('home')}>{t('back')}</button>
          <span className="chip">🎬 {t('videosTitle')}</span>
          <span style={{ width: 44 }} />
        </div>
        <div className="screen-scroll no-nav" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
          <div className="drill-card pop-in center">
            <p style={{ fontSize: '2.8rem' }}>🎬</p>
            <p className="drill-phrase" style={{ fontSize: '1.25rem' }}>{none ? t('videosNoneTitle') : t('videosAllDoneTitle')}</p>
            <p className="drill-meaning">{none ? t('videosNoneBody') : t('videosAllDoneBody')}</p>
          </div>
        </div>
        <div className="action-zone">
          <button className="btn-primary" onClick={() => app.navigate('home')}>{t('backHome')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" onClick={() => app.navigate('home')}>{t('back')}</button>
        <span className="chip">🎬 {current.video.title ? L(current.video.title) : t('videosTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="dim center" style={{ marginBottom: 12 }}>{t('videosWatchHint')}</p>
        <VideoPlayer key={current.day} video={current.video} onEnded={() => { success(); setShowPopup(true); }} />
        <button className="btn-ghost" style={{ marginTop: 14, alignSelf: 'center' }} onClick={() => setShowPopup(true)}>
          {t('videosImDone')}
        </button>
      </div>

      {showPopup && (
        <div className="modal-scrim" onClick={() => setShowPopup(false)}>
          <div className="modal-card pop-in" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: '3rem', textAlign: 'center' }}>🎉</p>
            <p className="drill-phrase center" style={{ fontSize: '1.35rem', margin: '4px 0 4px' }}>{t('videosPopupQ')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
              <button className="btn-primary" onClick={() => { tap(); next(); }}>✅ {t('videosUnderstood')}</button>
              <button className="btn-secondary" onClick={practice}>🎯 {t('videosPractice')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
