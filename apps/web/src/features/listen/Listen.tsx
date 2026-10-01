import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t, type StringKey } from '../../shared/i18n/strings.js';
import { languageDirection, languageName, UI_LANGUAGES } from '../../shared/i18n/languages.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon, type IconName } from '../../shared/ui/Icon.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { Pair } from '../../shared/ui/Pair.js';
import { Seg, formatDuration, useParrotPlayback, type RepeatCount } from '../../shared/playback/index.js';
import { loadSettings, persistSettings } from '../../shared/playback/preferences.js';
import { READING_COLLECTIONS } from '../reading/collections.js';
import { LEVEL_BAND, featuredStory, readingTimeMin } from '../reading/readingCore.js';
import { useReadingStore } from '../reading/readingStore.js';
import { storyImageUrl } from '../reading/storyImages.js';
import { READING_LANGS, type ReadingLang, type Story } from '../reading/types.js';
import { buildDialoguePlaylist, buildPhrasePlaylist, buildStoryPlaylist, topicOfIndex, type ListenCategory, type ListenPlaylist } from './playlists.js';
import { LISTEN_MODES, loadListenMode, saveListenMode, speakOrderFor, type ListenMode } from './listenMode.js';

/** Minutes of one Quick Listen session (a sleep-timer value the shared engine supports). */
const QUICK_MINUTES = 10;
const REPEATS: RepeatCount[] = [1, 2, 3];

const CATEGORIES: { id: ListenCategory; key: StringKey; icon: IconName }[] = [
  { id: 'phrases', key: 'listenCatPhrases', icon: 'chat' },
  { id: 'dialogues', key: 'listenCatDialogues', icon: 'volume' },
  { id: 'stories', key: 'listenCatStories', icon: 'learn' },
];

/**
 * Listen — READY's passive mode: press Play and keep learning while driving, walking or cooking.
 *
 * It owns NO content and NO playback logic. Playlists are built from what the missions and stories
 * already contain (`playlists.ts`), and everything audible runs through the one shared playback
 * engine (`useParrotPlayback`). This screen only arranges a queue, a now-playing card and a few
 * strategies (listening mode, repeats, continuous play) — the same sentences, heard a different way.
 *
 * Stories are the third thing to do here, and the warmest: besides the Stories category in the
 * player, one real story (the learner's next unfinished one) is shown as a visual card that opens
 * the story reader. Stories stay under Listen — they are support, not a destination of their own.
 */
export function Listen() {
  const app = useAppStore();
  const intent = useAppStore((s) => s.listenIntent);
  const [category, setCategory] = useState<ListenCategory>('phrases');
  const [stories, setStories] = useState<Story[] | null>(null);
  // Capture a one-shot Quick Listen request from Home, then clear it (it must not replay on revisit).
  const [quick] = useState(intent === 'quick');
  useEffect(() => { if (intent) app.setListenIntent(null); }, [intent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Story bodies are code-split; load them once (they feed both the story card and the category).
  useEffect(() => {
    if (stories !== null) return;
    let live = true;
    Promise.all(READING_COLLECTIONS.map((c) => c.load()))
      .then((cols) => { if (live) setStories(cols.flatMap((c) => c.stories)); })
      .catch((err) => { console.warn('[listen] stories unavailable', err); if (live) setStories([]); });
    return () => { live = false; };
  }, [stories]);

  const readingLang: ReadingLang = (READING_LANGS as readonly string[]).includes(app.learningLang) ? (app.learningLang as ReadingLang) : 'en';
  const playlist = useMemo<ListenPlaylist | null>(() => {
    if (category === 'phrases') return buildPhrasePlaylist(app.learningLang, app.uiLang);
    if (category === 'dialogues') return buildDialoguePlaylist(app.learningLang, app.uiLang);
    return stories ? buildStoryPlaylist(stories, readingLang, app.uiLang) : null;
  }, [category, stories, app.learningLang, app.uiLang, readingLang]);

  const open = (view: 'reading' | 'videos' | 'core', storyId?: string): void => {
    tap();
    if (view === 'core') app.setCoreCategory('phrases');
    if (storyId) app.setReadingIntent(storyId);
    app.navigate(view);
  };

  return (
    <div className="screen screen-wide">
      <div className="brand-top"><span className="brand-mark">READY <Icon name="plane" size={22} /></span></div>
      <LangStrip />
      <PageHeader title={t('listenTitle')} sub={t('listenSub')} icon={<Icon name="listen" />} />
      <div className="screen-scroll">
        <div className="tabs" role="tablist" aria-label={t('listenTitle')}>
          {CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={category === c.id} className={`tab ${category === c.id ? 'active' : ''}`} onClick={() => { tap(); setCategory(c.id); }}>
              <Icon name={c.icon} size={17} />{t(c.key)}
            </button>
          ))}
        </div>

        {stories && stories.length > 0 && <StoryCard stories={stories} lang={readingLang} onOpen={(id) => open('reading', id)} onAll={() => open('reading')} />}

        {playlist === null ? (
          <p className="dim center" style={{ padding: '32px 0' }}>{t('listenStoriesLoading')}</p>
        ) : playlist.items.length === 0 ? (
          <div className="card center"><p className="dim">{t('listenEmpty')}</p></div>
        ) : (
          // Keyed by category + languages: switching any of them is a clean new session.
          <ListenPlayer
            key={`${category}:${app.learningLang}:${app.uiLang}`}
            playlist={playlist}
            bookmarkKey={`listen:${category}:${app.learningLang}`}
            autoQuick={quick && category === 'phrases'}
          />
        )}

        <div className="section-head"><h2>{t('listenMore')}</h2></div>
        <div className="support-grid">
          <button className="link-row card-press" onClick={() => open('videos')}>
            <span className="icon-tile" aria-hidden>🎬</span>
            <span className="link-row-body"><span className="link-row-title">{t('listenWatchVideos')}</span><span className="link-row-sub">{t('homeVideosSub')}</span></span>
            <Icon name="chevron" size={20} flip />
          </button>
          <button className="link-row card-press" onClick={() => open('core')}>
            <span className="icon-tile" aria-hidden>💬</span>
            <span className="link-row-body"><span className="link-row-title">{t('phraseLibrary')}</span><span className="link-row-sub">{t('phraseLibrarySub')}</span></span>
            <Icon name="chevron" size={20} flip />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The visual way into Stories: ONE real story with its own cover — the one the learner is reading,
 * else the first they have not finished (stored reading progress only; no invented progress).
 */
function StoryCard({ stories, lang, onOpen, onAll }: { stories: Story[]; lang: ReadingLang; onOpen: (storyId: string) => void; onAll: () => void }) {
  const progress = useReadingStore((s) => s.stories);
  const pick = useMemo(() => featuredStory(stories, progress), [stories, progress]);
  const [imageFailed, setImageFailed] = useState(false);
  if (!pick) return null;
  const { story } = pick;
  return (
    <section className="card story-card" aria-label={t('listenStoryEyebrow')}>
      <button className="story-card-cover card-press" onClick={() => onOpen(story.id)} aria-label={story.title.target[lang]}>
        {imageFailed
          ? <span className="story-img-fallback" aria-hidden>📖</span>
          : <img src={storyImageUrl(story)} alt="" loading="lazy" onError={() => setImageFailed(true)} />}
      </button>
      <div className="story-card-body">
        <p className="eyebrow"><Icon name="learn" size={16} />{t('listenStoryEyebrow')}</p>
        <p className="story-card-title"><span className="target-text" dir={languageDirection(lang)} lang={lang}>{story.title.target[lang]}</span></p>
        <p className="dim small">{L(story.title.tr)} · {t('listenStorySub')}</p>
        <p className="meta-row">
          <span className="badge badge-notStarted">{LEVEL_BAND[story.level]}</span>
          <span><Icon name="clock" size={15} />{t('readingMinN', { n: readingTimeMin(story, lang) })}</span>
        </p>
        <div className="story-card-actions">
          <button className="btn-primary btn-icon" onClick={() => onOpen(story.id)}>
            {pick.inProgress ? t('continue') : pick.allDone ? t('readingReadAgain') : t('readingStartReading')}
            <Icon name="arrow" size={18} flip />
          </button>
          <button className="btn-link" onClick={onAll}>{t('listenAllStories')}</button>
        </div>
      </div>
    </section>
  );
}

function ListenPlayer({ playlist, bookmarkKey, autoQuick }: { playlist: ListenPlaylist; bookmarkKey: string; autoQuick: boolean }) {
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
  const listRef = useRef<HTMLDivElement>(null);

  // Quick Listen = the engine's own sleep timer for QUICK_MINUTES, then it stops by itself.
  const [quick, setQuick] = useState<'off' | 'arming' | 'running' | 'done'>(autoQuick ? 'arming' : 'off');
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

  // Keep the playing topic visible inside the queue (scrolls the list only, never the page).
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('.queue-row.active');
    if (list && row) list.scrollTop = row.offsetTop - list.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
  }, [topic?.id]);

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
    <>
      <div className="listen-layout">
        {/* Queue — the topics of this playlist; tapping one starts it. */}
        <section className="card" aria-label={t('listenQueue')}>
          <div className="queue-head">
            <span>
              <h2>{t('listenQueue')}</h2>
              <p className="dim small">{t('listenQueueMeta', { topics: playlist.topics.length, n: playlist.items.length })}</p>
            </span>
            <button className="btn-link btn-icon" aria-pressed={random} onClick={() => { tap(); pb.setOrder(random ? 'sequential' : 'random'); }}>
              <Icon name="shuffle" size={18} />{random ? t('listenInOrder') : t('listenShuffle')}
            </button>
          </div>
          <div className="queue-list" ref={listRef}>
            {playlist.topics.map((tp, i) => {
              const active = tp.id === topic?.id;
              return (
                <button key={tp.id} className={`queue-row ${active ? 'active' : ''}`} aria-current={active ? 'true' : undefined} onClick={() => { tap(); pb.jumpTo(tp.start, { play: true }); }}>
                  <span className="queue-row-num" aria-hidden>{i + 1}</span>
                  <span className="icon-tile" aria-hidden>{tp.icon}</span>
                  <span className="link-row-body">
                    <span className="link-row-title">{topicTitle(tp.title)}</span>
                    <span className="link-row-sub">{t('topicSentences', { n: tp.count })}</span>
                  </span>
                  {active && playing && <Icon name="volume" size={18} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Now playing */}
        <section className="card now-card" aria-label={t('nowPlaying')}>
          <p className="now-meta">{topic ? `${t('listenPosition', { i: within, n: topic.count })} · ${topicTitle(topic.title)}` : ''}</p>
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
      </div>

      {/* Quick Listen — ten hands-free minutes, then it stops by itself. */}
      <section className="card quick-strip" style={{ marginTop: 14 }} aria-label={t('quickListenTitle')}>
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
    </>
  );
}
