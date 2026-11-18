import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { useBootcampStore, missionsFor } from '../bootcamp/bootcampStore.js';
import { BackButton } from '../../shared/ui/PageHeader.js';
import { Icon } from '../../shared/ui/Icon.js';
import { VideoPlayer } from '../bootcamp/Bootcamp.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionIcon } from '../bootcamp/missionFlow.js';
import { missionVideos } from './missionVideo.js';

/**
 * Situation videos in a row — the Listening hub's fourth mode. Every situation that HAS a video in
 * the learning language (the central resolver, `missionVideo.ts`, reads the build-time manifest, so a
 * situation without a file is simply not in the list — nothing is probed, nothing is invented) plays
 * in journey order, one after another: when a clip ends the next one starts by itself. Previous /
 * next skip around; "practice this situation" opens the exact situation the clip belongs to.
 *
 * A clip that fails to load is skipped (safe-skip), never shown as a dead end; when the last clip
 * ends there is one calm "watched them all" screen. A language with no videos says so honestly.
 */
export interface QueuedVideo { day: number; missionNumber: number }

/** The next playable position after `from` in `dir`, skipping clips that failed; null past either end. */
export function stepVideo<T extends QueuedVideo>(pool: readonly T[], from: number, dir: 1 | -1, failed: ReadonlySet<number>): number | null {
  for (let i = from + dir; i >= 0 && i < pool.length; i += dir) if (!failed.has(pool[i]!.day)) return i;
  return null;
}

export function Videos() {
  const learningLang = useAppStore((s) => s.learningLang);
  const navigate = useAppStore((s) => s.navigate);
  const startDay = useBootcampStore((s) => s.startDay);
  const pool = useMemo(() => missionVideos(learningLang), [learningLang]);
  const missions = useMemo(() => missionsFor(learningLang), [learningLang]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [finished, setFinished] = useState(false);
  const current = finished ? undefined : pool[index];

  const back = (): void => navigate('listen');
  const go = (dir: 1 | -1, skipped: ReadonlySet<number> = failed): void => {
    const to = stepVideo(pool, index, dir, skipped);
    if (to !== null) setIndex(to);
    else if (dir === 1) setFinished(true); // past the last clip: the calm end
  };
  // The clip could not be played: remember it and move on, as if it had ended.
  const skip = (): void => {
    if (!current) return;
    const next = new Set(failed).add(current.day);
    setFailed(next);
    go(1, next);
  };
  const restart = (): void => {
    tap();
    const first = stepVideo(pool, -1, 1, failed);
    if (first === null) return;
    setIndex(first);
    setFinished(false);
  };
  const practice = (): void => {
    if (!current) return;
    tap();
    startDay(current.day); // opens the Mission Hub that owns this video
    navigate('bootcamp');
  };

  // No video in this language — or every clip has been watched: one honest, calm screen.
  if (!current) {
    const none = pool.length === 0 || failed.size >= pool.length;
    return (
      <div className="screen">
        <div className="topbar">
          <BackButton onBack={back} />
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
          {!none && <button className="btn-primary" onClick={restart}>{t('videosRestart')}</button>}
          <button className={none ? 'btn-primary' : 'btn-ghost'} onClick={() => { tap(); back(); }}>{t('back')}</button>
        </div>
      </div>
    );
  }

  const mission = BOOTCAMP_PLAN.find((m) => m.day === current.day);
  const prev = stepVideo(pool, index, -1, failed);
  const next = stepVideo(pool, index, 1, failed);
  return (
    <div className="screen">
      <div className="topbar">
        <BackButton onBack={back} />
        <span className="chip">🎬 {t('videosTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav videos-stage">
        <p className="videos-now">{t('videosSituation', { n: current.missionNumber, title: mission ? L(mission.title) : '' })}</p>
        {/* ONE player for the whole run: each clip arrives in the same video element and starts itself. */}
        <VideoPlayer video={current.video} icon={missionIcon(missions[current.day])} autoPlay onEnded={() => go(1)} onFailed={skip} />
      </div>
      {/* The run's controls live in the fixed bar, so nothing floating (the Daily Goal) ever sits on them. */}
      <div className="action-zone">
        <div className="videos-controls" dir="ltr">
          <button type="button" className="parrot-step" disabled={prev === null} onClick={() => { tap(); go(-1); }} aria-label={t('videosPrev')}><Icon name="skip" size={24} className="icon-prev" /></button>
          <span className="videos-pos" dir="auto">{t('listenPosition', { i: index + 1, n: pool.length })}</span>
          <button type="button" className="parrot-step" disabled={next === null} onClick={() => { tap(); go(1); }} aria-label={t('videosNext')}><Icon name="skip" size={24} /></button>
        </div>
        <button className="btn-ghost btn-icon" onClick={practice}>{t('videosPracticeThis')}<Icon name="arrow" size={18} flip /></button>
      </div>
    </div>
  );
}
