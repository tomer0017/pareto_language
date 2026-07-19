import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { TopBar } from '../../shared/ui/TopBar.js';
import { TappableText } from '../foundation/TappableText.js';
import { useParrotPlayback } from '../../shared/playback/index.js';
import { Sheet } from '../../shared/ui/Sheet.js';
import type { PlaybackSpeed } from '../../shared/playback/types.js';
import { READING_COLLECTIONS } from './collections.js';
import { buildStoryItems, readingTimeMin, scoreQuiz } from './readingCore.js';
import { useReadingStore, type ReadingPlayback } from './readingStore.js';
import { READING_LANGS, type QuizResponse, type ReadingCollection, type ReadingLang, type ReadingLevel, type Story } from './types.js';

/**
 * Reading Mode surface — collection browse → story reader (3 modes + Universal Tap + shared playback)
 * → comprehension quiz. Collection-agnostic: it renders whatever `READING_COLLECTIONS` declares and
 * lazy-loads each collection's story bodies on open. Every learning language (en/fr/es) uses the SAME
 * component; the target is `story.*.target[learningLang]`, the translation is the app-language gloss.
 */

const BAND: Record<ReadingLevel, string> = { 1: 'A1', 2: 'A1+', 3: 'A2' };

/** A top bar whose back button runs a LOCAL callback (in-surface navigation, not a view change). */
function LocalTopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="topbar">
      <button className="btn-ghost" onClick={() => { tap(); onBack(); }} aria-label={t('back')}>←</button>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <span style={{ width: 44 }} />
    </div>
  );
}

/** The active learning language clamped to a reading-supported one (defensive; pilot is en/fr/es). */
function useReadingLang(): ReadingLang {
  const learningLang = useAppStore((s) => s.learningLang);
  return (READING_LANGS as readonly string[]).includes(learningLang) ? (learningLang as ReadingLang) : 'en';
}

export function Reading() {
  const [collection, setCollection] = useState<ReadingCollection | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const rl = useReadingLang();
  const completed = useReadingStore((s) => s.completedCount());
  const streak = useReadingStore((s) => s.streak.count);

  if (story) return <StoryReader story={story} onExit={() => setStory(null)} />;

  const openCollection = async (id: string): Promise<void> => {
    const meta = READING_COLLECTIONS.find((c) => c.id === id);
    if (!meta) return;
    tap();
    setLoadingId(id);
    try {
      setCollection(await meta.load());
    } finally {
      setLoadingId(null);
    }
  };

  // ── Story list for an opened collection ──
  if (collection) {
    return (
      <div className="screen">
        <LocalTopBar title={L(collection.title)} onBack={() => setCollection(null)} />
        <div className="screen-scroll">
          <p className="dim small" style={{ marginBottom: 12 }}>{L(collection.description)}</p>
          <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {collection.stories.map((st) => <StoryRow key={st.id} story={st} rl={rl} onOpen={() => { tap(); setStory(st); }} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Collection browse (top level) ──
  return (
    <div className="screen">
      <TopBar title={t('readingTitle')} backTo="home" />
      <div className="screen-scroll">
        <p className="dim small" style={{ marginBottom: 6 }}>{t('readingIntro')}</p>
        <div className="reading-stats">
          <span className="chip chip-accent">📚 {t('readingCompletedN', { n: completed })}</span>
          {streak > 0 && <span className="chip">🔥 {t('readingStreakN', { n: streak })}</span>}
        </div>
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {READING_COLLECTIONS.map((c) => (
            <button key={c.id} className="card card-press reading-collection" onClick={() => void openCollection(c.id)} disabled={loadingId !== null}>
              <span className="reading-collection-emoji">{c.emoji}</span>
              <span style={{ minWidth: 0 }}>
                <span className="reading-collection-title">{L(c.title)}</span>
                <span className="dim small">{L(c.description)}</span>
                <span className="dim small">· {t('readingStoriesN', { n: c.count })}</span>
              </span>
              <span className="chip">{loadingId === c.id ? '…' : t('read')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One story row in a collection list — title (target + native), difficulty, time, done/resume state. */
function StoryRow({ story, rl, onOpen }: { story: Story; rl: ReadingLang; onOpen: () => void }) {
  const progress = useReadingStore((s) => s.stories[story.id]);
  const done = progress?.done ?? false;
  const inProgress = !done && (progress?.pos ?? 0) > 0;
  return (
    <button className="card card-press reading-story-row" onClick={onOpen}>
      <span style={{ minWidth: 0, textAlign: 'start' }}>
        <span className="reading-story-title">{story.title.target[rl]}</span>
        <span className="dim small">{L(story.title.tr)}</span>
        <span className="reading-story-meta">
          <span className="badge">{BAND[story.level]}</span>
          <span className="dim small">⏱ {t('readingMinN', { n: readingTimeMin(story, rl) })}</span>
          {done && <span className="badge badge-ready">✓ {t('readingDone')}</span>}
        </span>
      </span>
      <span className="chip chip-accent">{done ? t('readingReadAgain') : inProgress ? t('continue') : t('readingStart')}</span>
    </button>
  );
}

/** The full-screen story reader: modes, per-sentence audio (shared engine), Universal Tap, transport. */
function StoryReader({ story, onExit }: { story: Story; onExit: () => void }) {
  const rl = useReadingLang();
  const uiLang = useAppStore((s) => s.uiLang);
  const mode = useReadingStore((s) => s.mode);
  const setMode = useReadingStore((s) => s.setMode);
  const savePosition = useReadingStore((s) => s.savePosition);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The SAME shared playback engine every listening surface uses — the reader just supplies its
  // sentences as items and renders them as a scrolling, highlighted, tappable reading sheet. Reading
  // is ALWAYS sequential (`order: 'sequential'` pins it, ignoring the shared shuffle preference).
  // Voice-playback order (restored) — Reading owns this preference so it NEVER changes the shared
  // Parrot `translation` setting other surfaces use. It persists in the Reading store and is applied
  // to the engine purely as a per-surface `speakOrder` override (speed stays global). The target line
  // always uses the learning voice, the translation the app voice (per-line locales owned by the
  // engine). Changing it pauses playback so no stale speech continues under the previous order.
  const playback = useReadingStore((s) => s.playback);
  const setPlayback = useReadingStore((s) => s.setPlayback);
  const speakOrder = useMemo(
    () => ({ translation: playback !== 'target', translationFirst: playback === 'tr-target' }),
    [playback],
  );

  const items = useMemo(() => buildStoryItems(story, rl, uiLang), [story, rl, uiLang]);
  const pb = useParrotPlayback(items, { bookmarkKey: `reading:${rl}:${story.id}`, order: 'sequential', speakOrder });
  const playing = pb.status === 'playing';
  const current = pb.currentIndex;
  const SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25];

  const setPlayOrder = (o: ReadingPlayback): void => { tap(); pb.pause(); setPlayback(o); };
  const PLAY_ORDERS = [
    { id: 'target', key: 'readingPlayTarget' },
    { id: 'target-tr', key: 'readingPlayTargetTr' },
    { id: 'tr-target', key: 'readingPlayTrTarget' },
  ] as const;

  // Persist the read position for "resume reading" (store guards forward-only).
  useEffect(() => { savePosition(story.id, current); }, [current, story.id, savePosition]);
  useEffect(() => { lineRefs.current[current]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [current]);

  if (showQuiz) return <StoryQuiz story={story} onExit={onExit} onBack={() => setShowQuiz(false)} />;

  const showTr = (i: number): boolean => mode === 'bilingual' || (mode === 'hidden' && revealed.has(i));

  return (
    <div className="reader">
      <div className="topbar">
        <button className="reader-back" onClick={() => { pb.pause(); onExit(); }} aria-label={t('back')}>←</button>
        <span className="chip">📖 {story.title.target[rl]}</span>
        <span style={{ width: 52 }} />
      </div>
      <p className="dim small reading-meta">
        <span className="badge">{BAND[story.level]}</span> · ⏱ {t('readingMinN', { n: readingTimeMin(story, rl) })} · {t('lineProgress', { i: pb.position, n: pb.total })}
      </p>

      {/* The story is the hero — it fills the scroll area; controls stay minimal below. */}
      <div className="reader-scroll">
        {story.sentences.map((sen, i) => (
          <div key={i} ref={(el) => { lineRefs.current[i] = el; }} className={`rline ${i === current ? 'now' : ''}`}>
            <div className="rline-top">
              <button className="dline-play" onClick={() => pb.jumpTo(i)} aria-label={t('replayAudio')}>🔊</button>
            </div>
            <p className="rline-target"><TappableText text={sen.target[rl]} lang={rl} /></p>
            {mode !== 'target' && (
              showTr(i)
                ? <p className="rline-tr">{L(sen.tr)}</p>
                : <button className="rline-reveal" onClick={() => { tap(); setRevealed((s) => new Set(s).add(i)); }}>{t('readingTapReveal')}</button>
            )}
          </div>
        ))}
      </div>

      {/* Essential controls only: media transport (LTR, consistent) + settings + go to quiz. */}
      <div className="reader-transport reading-transport">
        <div className="parrot-transport" dir="ltr">
          <button type="button" className="parrot-step" onClick={() => { tap(); pb.prev(); }} aria-label={t('parrotPrev')}>‹</button>
          <button type="button" className="parrot-play" onClick={() => { tap(); pb.toggle(); }} aria-label={playing ? t('parrotPause') : t('parrotPlay')}>{playing ? '❚❚' : '▶'}</button>
          <button type="button" className="parrot-step" onClick={() => { tap(); pb.next(); }} aria-label={t('parrotNext')}>›</button>
        </div>
        <button type="button" className="reading-gear btn-secondary" onClick={() => { tap(); setSettingsOpen(true); }} aria-label={t('readingSettings')}>⚙</button>
        <button type="button" className="btn-accent reading-quiz-btn" onClick={() => { tap(); pb.pause(); setShowQuiz(true); }}>✓ {t('readingToQuiz')}</button>
      </div>

      {/* Secondary settings (only what's meaningful while reading) live in a compact bottom sheet. */}
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} labelledBy="reading-settings-title">
        <h3 id="reading-settings-title" style={{ margin: '0 0 12px' }}>{t('readingSettings')}</h3>
        <p className="parrot-label">{t('readingMode')}</p>
        <div className="btn-row" role="group" aria-label={t('readingMode')} style={{ marginBottom: 16 }}>
          {(['target', 'bilingual', 'hidden'] as const).map((m) => (
            <button key={m} aria-pressed={mode === m}
              className={mode === m ? 'btn-accent' : 'btn-secondary'}
              onClick={() => { tap(); setMode(m); }}>
              {t(m === 'target' ? 'readingModeTarget' : m === 'bilingual' ? 'readingModeBilingual' : 'readingModeHidden')}
            </button>
          ))}
        </div>
        <p className="parrot-label">{t('readingPlayback')}</p>
        <div className="reading-q-options" role="group" aria-label={t('readingPlayback')} style={{ marginTop: 0, marginBottom: 16 }}>
          {PLAY_ORDERS.map((o) => (
            <button key={o.id} aria-pressed={playback === o.id}
              className={playback === o.id ? 'btn-accent' : 'btn-secondary'}
              onClick={() => setPlayOrder(o.id)}>
              {t(o.key)}
            </button>
          ))}
        </div>
        <p className="parrot-label">{t('parrotSpeed')}</p>
        <div className="seg" role="group" aria-label={t('parrotSpeed')}>
          {SPEEDS.map((sp) => (
            <button key={sp} className={`seg-btn ${pb.settings.speed === sp ? 'on' : ''}`} aria-pressed={pb.settings.speed === sp}
              onClick={() => { tap(); pb.setSpeed(sp); }}>{sp}×</button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

/** Short comprehension quiz — app-language questions; scores understanding, marks the story complete. */
function StoryQuiz({ story, onExit, onBack }: { story: Story; onExit: () => void; onBack: () => void }) {
  const completeStory = useReadingStore((s) => s.completeStory);
  const [responses, setResponses] = useState<QuizResponse[]>(() => story.quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const score = scoreQuiz(story.quiz, responses);
  const answeredAll = responses.every((r) => r !== null);

  const setAnswer = (i: number, value: QuizResponse): void => {
    if (submitted) return;
    tap();
    setResponses((prev) => prev.map((r, j) => (j === i ? value : r)));
  };

  const submit = (): void => {
    tap();
    setSubmitted(true);
    completeStory(story.id, score.pct);
  };

  return (
    <div className="screen">
      <LocalTopBar title={t("readingQuizTitle")} onBack={onBack} />
      <div className="screen-scroll">
        <p className="dim small" style={{ marginBottom: 10 }}>{t('readingQuizSub')}</p>
        {story.quiz.map((q, i) => {
          const resp = responses[i];
          return (
            <div key={i} className="card reading-q">
              <p className="reading-q-text">{i + 1}. {L(q.q)}</p>
              {q.kind === 'mc' && (
                <div className="reading-q-options">
                  {q.options.map((opt, oi) => (
                    <button key={oi}
                      className={`reading-opt ${resp === oi ? 'chosen' : ''} ${submitted ? (oi === q.answer ? 'right' : resp === oi ? 'wrong' : '') : ''}`}
                      onClick={() => setAnswer(i, oi)} disabled={submitted}>
                      {L(opt)}
                    </button>
                  ))}
                </div>
              )}
              {q.kind === 'tf' && (
                <div className="reading-q-options reading-tf">
                  {[true, false].map((val) => (
                    <button key={String(val)}
                      className={`reading-opt ${resp === val ? 'chosen' : ''} ${submitted ? (val === q.answer ? 'right' : resp === val ? 'wrong' : '') : ''}`}
                      onClick={() => setAnswer(i, val)} disabled={submitted}>
                      {val ? t('readingTrue') : t('readingFalse')}
                    </button>
                  ))}
                </div>
              )}
              {q.kind === 'order' && <p className="dim small">{q.items.map((it) => L(it)).join(' · ')}</p>}
            </div>
          );
        })}

        {!submitted ? (
          <div className="action-zone">
            <button className="btn-primary" onClick={submit} disabled={!answeredAll}>{t('readingCheck')}</button>
          </div>
        ) : (
          <div className="drill-card center pop-in" style={{ marginTop: 8 }}>
            <p style={{ fontSize: '2rem' }}>{score.passed ? '🎉' : '📗'}</p>
            <p className="drill-phrase">{t('readingScore', { correct: score.correct, total: score.total })}</p>
            <div className="action-zone" style={{ marginTop: 10 }}>
              <button className="btn-primary" onClick={() => { tap(); onExit(); }}>{t('readingDoneBtn')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
