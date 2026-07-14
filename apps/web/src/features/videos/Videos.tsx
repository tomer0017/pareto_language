import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { missionsFor, useBootcampStore } from '../bootcamp/bootcampStore.js';
import { VideoPlayer } from '../bootcamp/Bootcamp.js';
import type { BootcampVideo } from '../bootcamp/types.js';
import { pickOne } from '../../shared/util/shuffle.js';

/**
 * Videos — an experience, not a list (Task 2). Play a random available mission video; when it
 * ends (or the learner says so), ask "Did you understand everything?" → either load another random
 * video, or drop into the exact Mission Hub that owns this video (Practice / Transcript / Video,
 * unchanged). Videos are the missions' optional `introVideo`s — sourced from the ACTIVE learning
 * language's missions, so a language with no videos (e.g. French) shows the honest empty state
 * instead of leaking English videos. Only English Mission 2 ships one today.
 */
interface VideoEntry { day: number; video: BootcampVideo }

function allVideos(lang: string): VideoEntry[] {
  const out: VideoEntry[] = [];
  for (const d of Object.values(missionsFor(lang))) {
    if (d.introVideo) out.push({ day: d.day, video: d.introVideo });
  }
  return out;
}

function pickRandom(pool: VideoEntry[], exclude: Set<number>): VideoEntry | null {
  return pickOne(pool.filter((v) => !exclude.has(v.day))) ?? null;
}

export function Videos() {
  const app = useAppStore();
  const bc = useBootcampStore();
  const pool = useMemo(() => allVideos(app.learningLang), [app.learningLang]);
  const [watched, setWatched] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState<VideoEntry | null>(() => pickRandom(pool, new Set()));

  const next = (): void => {
    const nw = new Set(watched);
    if (current) nw.add(current.day);
    setWatched(nw);
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
        <VideoPlayer key={current.day} video={current.video} onEnded={() => success()} />
      </div>
      {/* After watching, two honest next steps — no intermediate "I finished watching" popup. */}
      <div className="action-zone">
        <button className="btn-primary" onClick={practice}>🎯 {t('videoWantPractice')}</button>
        <button className="btn-secondary" onClick={() => { tap(); next(); }}>✅ {t('videoUnderstoodAll')}</button>
      </div>
    </div>
  );
}
