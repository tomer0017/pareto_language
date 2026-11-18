import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAppStore, type ListenPage, type View } from '../../shared/stores/appStore.js';
import { L, t, type StringKey } from '../../shared/i18n/strings.js';
import { languageDirection, languageName, UI_LANGUAGES } from '../../shared/i18n/languages.js';
import { tap } from '../../shared/ui/haptics.js';
import { ChoiceCard } from '../../shared/ui/ChoiceCard.js';
import { Icon } from '../../shared/ui/Icon.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { Pair } from '../../shared/ui/Pair.js';
import { Seg, formatDuration, useParrotPlayback, type RepeatCount } from '../../shared/playback/index.js';
import { loadBookmark, loadSettings, persistSettings } from '../../shared/playback/preferences.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { READING_COLLECTIONS } from '../reading/collections.js';
import { LEVEL_BAND, readingTimeMin } from '../reading/readingCore.js';
import { useReadingStore } from '../reading/readingStore.js';
import { storyImageUrl } from '../reading/storyImages.js';
import { READING_LANGS, type ReadingLang, type Story } from '../reading/types.js';
import { buildDialoguePlaylist, buildPhrasePlaylist, resumeTopicId, startIndexFor, topicOfIndex, type ListenCategory, type ListenPlaylist } from './playlists.js';
import { LISTEN_MODES, loadListenMode, saveListenMode, speakOrderFor, type ListenMode } from './listenMode.js';

/** Minutes of one Quick Listen session (a sleep-timer value the shared engine supports). */
const QUICK_MINUTES = 10;
const REPEATS: RepeatCount[] = [1, 2, 3];

/**
 * Listen — READY's listening hub. Three levels, never more than one at a time:
 *
 *   1. CHOOSE A MODE     📖 stories · 💬 situations · 🔊 sentences · 🎬 situation videos in a row
 *   2. CHOOSE CONTENT    a story · a situation's dialogue · a group of sentences
 *   3. LISTEN            the player (or the story reader, or the video player)
 *
 * It owns NO content and NO playback logic. Playlists are built from what the situations already
 * contain (`playlists.ts`), stories open in the existing story reader, the videos in the existing
 * Videos screen, and everything audible runs through the one shared playback engine
 * (`useParrotPlayback`). Where the hub is lives in the app store (`listenPage`), so a tap on the
 * Listen tab always lands back on the four modes.
 */
export const LISTEN_HUB_MODES = ['stories', 'situations', 'sentences', 'videos'] as const;
export type ListenHubMode = (typeof LISTEN_HUB_MODES)[number];

const MODE: Record<ListenHubMode, { icon: string; title: StringKey; sub: StringKey; tone: 'brand' | 'accent' | 'good' | 'warn' }> = {
  stories: { icon: '📖', title: 'listenModeStories', sub: 'listenModeStoriesSub', tone: 'warn' },
  situations: { icon: '💬', title: 'listenModeSituations', sub: 'listenModeSituationsSub', tone: 'accent' },
  sentences: { icon: '🔊', title: 'listenModeSentences', sub: 'listenModeSentencesSub', tone: 'brand' },
  videos: { icon: '🎬', title: 'listenModeVideos', sub: 'listenModeVideosSub', tone: 'good' },
};

type AudioMode = 'situations' | 'sentences';
/** The playlist each audio mode plays (the categories keep their stored bookmarks / preferences). */
const CATEGORY: Record<AudioMode, ListenCategory> = { situations: 'dialogues', sentences: 'phrases' };
const bookmarkKeyFor = (mode: AudioMode, lang: string): string => `listen:${CATEGORY[mode]}:${lang}`;

export function Listen() {
  const page = useAppStore((s) => s.listenPage);
  const setPage = useAppStore((s) => s.setListenPage);
  const navigate = useAppStore((s) => s.navigate);

  // Back from a mode's first page: to the screen that opened it directly, else to the four modes.
  const leaveMode = (returnTo?: View): void => {
    setPage(null);
    if (returnTo) navigate(returnTo);
  };

  if (!page) {
    return <ListenLanding onMode={(mode) => (mode === 'videos' ? navigate('videos') : setPage({ mode, play: null }))} />;
  }
  if (page.mode === 'stories') return <StoriesPage onBack={() => leaveMode(page.returnTo)} />;
  return <AudioModePage page={page} mode={page.mode} onLeave={() => leaveMode(page.returnTo)} onPage={setPage} />;
}

/** Level 1 — the four ways to listen, and nothing else. */
function ListenLanding({ onMode }: { onMode: (mode: ListenHubMode) => void }) {
  return (
    <div className="screen screen-wide">
      <PageHeader title={t('listenTitle')} sub={t('listenSub')} icon={<Icon name="listen" />} />
      <div className="screen-scroll">
        <div className="choice-list listen-modes" role="group" aria-label={t('listenSub')}>
          {LISTEN_HUB_MODES.map((mode) => (
            <ChoiceCard key={mode} id={mode} icon={MODE[mode].icon} tone={MODE[mode].tone} title={t(MODE[mode].title)} sub={t(MODE[mode].sub)} onSelect={() => onMode(mode)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Level 2 for stories — the stories themselves; a tap opens one in the story reader (its player),
 *  already reading aloud. Stored reading progress marks the one under way and the ones finished. */
function StoriesPage({ onBack }: { onBack: () => void }) {
  const learningLang = useAppStore((s) => s.learningLang);
  const navigate = useAppStore((s) => s.navigate);
  const setReadingIntent = useAppStore((s) => s.setReadingIntent);
  const progress = useReadingStore((s) => s.stories);
  const [stories, setStories] = useState<Story[] | null>(null);
  const lang: ReadingLang = (READING_LANGS as readonly string[]).includes(learningLang) ? (learningLang as ReadingLang) : 'en';

  // Story bodies are code-split; load them once on arrival.
  useEffect(() => {
    let live = true;
    Promise.all(READING_COLLECTIONS.map((c) => c.load()))
      .then((cols) => { if (live) setStories(cols.flatMap((c) => c.stories)); })
      .catch((err) => { console.warn('[listen] stories unavailable', err); if (live) setStories([]); });
    return () => { live = false; };
  }, []);

  const open = (story: Story): void => {
    tap();
    // The reader is the story's player; leaving it comes back to this list.
    setReadingIntent({ story: story.id, returnTo: 'listen', play: true });
    navigate('reading');
  };

  return (
    <div className="screen screen-wide">
      <PageHeader title={t('listenModeStories')} sub={t('listenChooseStory')} onBack={onBack} />
      <div className="screen-scroll">
        {stories === null ? (
          <p className="dim center" style={{ padding: '32px 0' }}>{t('listenStoriesLoading')}</p>
        ) : stories.length === 0 ? (
          <div className="card center"><p className="dim">{t('listenEmpty')}</p></div>
        ) : (
          <div className="topic-list">
            {stories.map((story) => {
              const at = progress[story.id];
              return (
                <button key={story.id} type="button" className="link-row card-press topic-row story-row" data-story={story.id} onClick={() => open(story)}>
                  <StoryThumb story={story} />
                  <span className="link-row-body">
                    <span className="link-row-title target-text" dir={languageDirection(lang)} lang={lang}>{story.title.target[lang]}</span>
                    <span className="link-row-sub">{L(story.title.tr)} · {LEVEL_BAND[story.level]} · {t('readingMinN', { n: readingTimeMin(story, lang) })}</span>
                  </span>
                  {at?.done ? <span className="badge badge-ready">✓</span> : (at?.pos ?? 0) > 0 ? <span className="badge badge-inProgress">{t('continue')}</span> : null}
                  <span className="topic-play" aria-hidden><Icon name="play" size={16} /></span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** A story's own cover, small; a soft 📖 tile if the picture cannot load. */
function StoryThumb({ story }: { story: Story }) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <span className="icon-tile story-thumb" aria-hidden>📖</span>
    : <img className="story-thumb" src={storyImageUrl(story)} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

/** Levels 2 and 3 for the audio modes: choose a situation / a sentence group, then listen. */
function AudioModePage({ page, mode, onLeave, onPage }: { page: ListenPage; mode: AudioMode; onLeave: () => void; onPage: (page: ListenPage) => void }) {
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);
  const playlist = useMemo<ListenPlaylist>(
    () => (mode === 'situations' ? buildDialoguePlaylist(learningLang, uiLang) : buildPhrasePlaylist(learningLang, uiLang)),
    [mode, learningLang, uiLang],
  );
  const bookmarkKey = bookmarkKeyFor(mode, learningLang);
  const title = t(MODE[mode].title);

  if (page.play === null) {
    return <TopicsPage mode={mode} title={title} playlist={playlist} bookmarkKey={bookmarkKey} onBack={onLeave} onPlay={(topic) => onPage({ ...page, play: topic })} />;
  }
  return (
    <div className="screen screen-wide">
      <PageHeader title={title} onBack={() => onPage({ ...page, play: null })} />
      <div className="screen-scroll">
        {playlist.items.length === 0 ? (
          <div className="card center"><p className="dim">{t('listenEmpty')}</p></div>
        ) : (
          // Keyed by mode + topic + languages: each choice is a clean new session.
          <ListenPlayer
            key={`${mode}:${page.play}:${learningLang}:${uiLang}`}
            playlist={playlist}
            bookmarkKey={bookmarkKey}
            startIndex={startIndexFor(playlist, page.play, loadBookmark(bookmarkKey))}
          />
        )}
      </div>
    </div>
  );
}

/** The displayed number of a situation (1–30) for a topic that is one, else null. */
const situationNumber = (topicId: string): number | null => {
  const i = BOOTCAMP_PLAN.findIndex((m) => m.id === topicId);
  return i < 0 ? null : i + 1;
};

/** Level 2 for the audio modes — what to listen to. A tap starts it; the topic the learner was in is marked. */
function TopicsPage({ mode, title, playlist, bookmarkKey, onBack, onPlay }: {
  mode: AudioMode; title: string; playlist: ListenPlaylist; bookmarkKey: string; onBack: () => void; onPlay: (topicId: string) => void;
}) {
  const resume = useMemo(() => resumeTopicId(playlist, loadBookmark(bookmarkKey)), [playlist, bookmarkKey]);
  return (
    <div className="screen screen-wide">
      <PageHeader title={title} sub={t(mode === 'situations' ? 'listenChooseSituation' : 'listenChooseTopic')} onBack={onBack} />
      <div className="screen-scroll">
        {playlist.topics.length === 0 ? (
          <div className="card center"><p className="dim">{t('listenEmpty')}</p></div>
        ) : (
          <div className="topic-list">
            {playlist.topics.map((tp) => {
              const n = situationNumber(tp.id);
              return (
                <button key={tp.id} type="button" className="link-row card-press topic-row" data-topic={tp.id} onClick={() => { tap(); onPlay(tp.id); }}>
                  <span className="topic-num" aria-hidden>{n ?? ''}</span>
                  <span className="icon-tile" aria-hidden>{tp.icon}</span>
                  <span className="link-row-body">
                    <span className="link-row-title">{tp.title ?? t('survivalKit')}</span>
                    <span className="link-row-sub">{t(mode === 'situations' ? 'topicLines' : 'topicSentences', { n: tp.count })}</span>
                  </span>
                  {resume === tp.id && <span className="badge badge-inProgress">{t('continue')}</span>}
                  <span className="topic-play" aria-hidden><Icon name="play" size={16} /></span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Level 3 — the player: what is being said now, the transport, and the few listening options. */
function ListenPlayer({ playlist, bookmarkKey, startIndex }: { playlist: ListenPlaylist; bookmarkKey: string; startIndex: number }) {
  const uiLang = useAppStore((s) => s.uiLang);
  const learningLang = useAppStore((s) => s.learningLang);
  const [storedMode, setMode] = useState<ListenMode>(loadListenMode);
  // When the app language IS the learning language there is no translation to speak or show, so
  // the only meaningful strategy is the sentence alone (and the mode picker is not offered).
  const hasTranslation = uiLang !== learningLang;
  const mode: ListenMode = hasTranslation ? storedMode : 'target-only';
  const speakOrder = useMemo(() => speakOrderFor(mode), [mode]);
  // Listen's own scope: repeats / non-stop / shuffle chosen here stay here. Speech rate is not an
  // engine option at all — it is the one global preference (Profile).
  const pb = useParrotPlayback(playlist.items, { scope: 'listen', bookmarkKey, speakOrder });
  const item = playlist.items[pb.currentIndex];
  const topic = topicOfIndex(playlist, pb.currentIndex);
  const playing = pb.status === 'playing';

  // The learner chose what to hear a moment ago (a tap): start there at once.
  useEffect(() => { pb.jumpTo(startIndex, { play: true }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quick Listen = the engine's own sleep timer for QUICK_MINUTES, then it stops by itself.
  const [quick, setQuick] = useState<'off' | 'arming' | 'running' | 'done'>('off');
  const startQuick = (): void => { tap(); setQuick('arming'); };
  useEffect(() => {
    if (quick !== 'arming') return;
    if (pb.settings.sleepTimer !== QUICK_MINUTES) { pb.setSleepTimer(QUICK_MINUTES); return; }
    if (pb.status !== 'playing') pb.play();
    setQuick('running');
  }, [quick, pb.settings.sleepTimer]); // eslint-disable-line react-hooks/exhaustive-deps
  // The timer belongs to this session only: clear it when it expires and when leaving the screen,
  // so it never silently arms itself on another listening surface.
  const quickRef = useRef(quick);
  quickRef.current = quick;
  useEffect(() => {
    if (quick === 'running' && pb.sleepFinished) { setQuick('done'); pb.setSleepTimer(0); }
  }, [quick, pb.sleepFinished]); // eslint-disable-line react-hooks/exhaustive-deps
  // (On unmount the engine can no longer be asked, so the shared preference is reset directly.)
  useEffect(() => () => {
    if (quickRef.current === 'running' || quickRef.current === 'arming') persistSettings('listen', { ...loadSettings('listen'), sleepTimer: 0 });
  }, []);

  const chooseMode = (m: ListenMode): void => { tap(); setMode(m); saveListenMode(m); };
  const appName = UI_LANGUAGES.find((l) => l.code === uiLang)?.nativeName ?? uiLang;
  const targetName = languageName(learningLang);
  const modeLabel = (m: ListenMode): { title: ReactNode; sub: string } => m === 'tr-first'
    ? { title: <Pair from={appName} to={targetName} />, sub: t('modeTrFirstSub') }
    : m === 'target-only'
      ? { title: t('modeTargetOnly', { lang: targetName }), sub: t('modeTargetOnlySub') }
      : { title: <Pair from={targetName} to={appName} />, sub: t('modeTargetFirstSub') };

  const within = topic ? pb.currentIndex - topic.start + 1 : 0;
  const topicTitle = (title: string | null): string => title ?? t('survivalKit');
  const random = pb.settings.order === 'random';

  return (
    <div className="listen-player">
      {/* Now playing — the line itself is the screen; the transport sits right under it. */}
      <section className="card now-card" aria-label={t('nowPlaying')}>
        <p className="now-meta">{topic ? `${topicTitle(topic.title)} · ${t('listenPosition', { i: within, n: topic.count })}` : ''}</p>
        <p className="now-target target-text" dir={item ? languageDirection(item.targetLang) : 'ltr'} lang={item?.targetLang}>{item?.target}</p>
        <p className="now-translation" dir={languageDirection(uiLang)}>{mode !== 'target-only' ? item?.translation : ''}</p>
        <div className="now-progress" aria-hidden><span style={{ width: `${topic ? (within / topic.count) * 100 : 0}%` }} /></div>

        <span className="sr-only" role="status" aria-live="polite">{playing ? t('parrotStatusPlaying') : pb.status === 'paused' ? t('parrotStatusPaused') : ''}</span>
        {/* A media transport reads the same in every interface direction. */}
        <div className="transport">
          <button type="button" className="parrot-step" onClick={() => { tap(); pb.prev(); }} aria-label={t('parrotPrev')}><Icon name="skip" size={26} className="icon-prev" /></button>
          <button type="button" className="parrot-play" onClick={() => { tap(); pb.toggle(); }} aria-label={playing ? t('parrotPause') : t('parrotPlay')}>
            <Icon name={playing ? 'pause' : 'play'} size={30} />
          </button>
          <button type="button" className="parrot-step" onClick={() => { tap(); pb.next(); }} aria-label={t('parrotNext')}><Icon name="skip" size={26} /></button>
        </div>

        {/* Repeats = how many TIMES each sentence is said (1× once, 2× twice, 3× three times).
            It is not speed — speech speed is the one global preference in Profile. Continuous
            play is a separate switch: it restarts the list when it ends. */}
        <div className="control-row">
          <Seg
            label={t('listenRepeats')}
            value={pb.settings.repeat}
            options={REPEATS.map((r) => ({ v: r, label: `${r}×`, aria: t('listenRepeatsAria', { n: r }) }))}
            onChange={pb.setRepeat}
          />
          <button type="button" className={`toggle-pill ${pb.settings.loop ? 'on' : ''}`} aria-pressed={pb.settings.loop} aria-label={t('listenContinuousAria')} onClick={() => { tap(); pb.setLoop(!pb.settings.loop); }}>
            <Icon name="repeat" size={16} />{t('listenContinuous')}
          </button>
          <button type="button" className={`toggle-pill ${random ? 'on' : ''}`} aria-pressed={random} onClick={() => { tap(); pb.setOrder(random ? 'sequential' : 'random'); }}>
            <Icon name="shuffle" size={16} />{t('listenShuffle')}
          </button>
        </div>

        {hasTranslation && (
        <div>
          <p className="control-label" style={{ textAlign: 'start', marginBottom: 8 }}>{t('listenModeLabel')}</p>
          <div className="mode-grid" role="group" aria-label={t('listenModeLabel')}>
            {LISTEN_MODES.map((m) => {
              const label = modeLabel(m);
              return (
                <button key={m} type="button" className={`mode-card ${mode === m ? 'active' : ''}`} aria-pressed={mode === m} onClick={() => chooseMode(m)}>
                  <b>{label.title}</b>
                  <span>{label.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
        )}
        <p className="faint small">{t('listenSpeedNote')}</p>
      </section>

      {/* Quick Listen — ten hands-free minutes, then it stops by itself. */}
      <section className="card quick-strip" aria-label={t('quickListenTitle')}>
        <span className="icon-tile icon-tile-good" aria-hidden><Icon name="listen" /></span>
        <span className="link-row-body">
          <span className="link-row-title">{t('quickListenTitle')}</span>
          <span className="link-row-sub">
            {quick === 'running' && pb.sleepRemainingMs != null
              ? t('listenQuickLeft', { time: formatDuration(pb.sleepRemainingMs) })
              : quick === 'done' ? t('listenQuickDone') : t('quickListenSub')}
          </span>
        </span>
        {quick !== 'running' && (
          <button className="btn-outline good btn-icon" onClick={startQuick}><Icon name="play" size={18} />{t('quickListenCta')}</button>
        )}
      </section>
    </div>
  );
}
