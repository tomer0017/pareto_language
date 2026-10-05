import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { useBootcampStore } from '../bootcamp/bootcampStore.js';
import { BackButton } from '../../shared/ui/PageHeader.js';
import { Icon } from '../../shared/ui/Icon.js';
import { VideoPlayer } from '../bootcamp/Bootcamp.js';
import type { BootcampVideo } from '../bootcamp/types.js';
import { pickOne } from '../../shared/util/shuffle.js';
import { missionVideos } from './missionVideo.js';

/**
 * Videos — an experience, not a list (Task 2). Play a random available mission video; when it
 * ends (or the learner says so), ask "Did you understand everything?" → either load another random
 * video, or drop into the exact Mission Hub that owns this video (Practice / Transcript / Video,
 * unchanged). The videos are whatever exists for the ACTIVE learning language (the central resolver,
 * `missionVideo.ts`), so a language with no videos shows the honest empty state instead of leaking
 * another language's.
 */
interface VideoEntry { day: number; video: BootcampVideo }

const allVideos = (lang: string): VideoEntry[] => missionVideos(lang).map(({ day, video }) => ({ day, video }));

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
          <BackButton onBack={() => app.navigate('listen')} />
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
          <button className="btn-primary" onClick={() => app.navigate('listen')}>{t('back')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <BackButton onBack={() => app.navigate('listen')} />
        <span className="chip">🎬 {current.video.title ? L(current.video.title) : t('videosTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="dim center" style={{ marginBottom: 12 }}>{t('videosWatchHint')}</p>
        <VideoPlayer key={current.day} video={current.video} onEnded={() => success()} />
      </div>
      {/* One guided next step (practice the situation this conversation belongs to); another video
          is a quiet alternative. The learner is never asked to certify "I understood everything". */}
      <div className="action-zone">
        <button className="btn-primary btn-icon" onClick={practice}>{t('videoWantPractice')}<Icon name="arrow" size={18} flip /></button>
        <button className="btn-ghost" style={{ alignSelf: 'center' }} onClick={() => { tap(); next(); }}>{t('videoAnother')}</button>
      </div>
    </div>
  );
}
