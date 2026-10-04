import { useEffect, useMemo, useRef, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { CheckPop } from '../../shared/ui/CheckPop.js';
import { AnswerFeedback, type AnswerContext } from '../../shared/ui/AnswerFeedback.js';
import { buildComprehensionContext, buildRespondContext } from '../../shared/ui/answerContext.js';
import { feedbackWrong } from '../../shared/ui/feedbackCue.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { BOOTCAMP_PLAN, missionNumber, nextMission } from './plan.js';
import { missionIcon, missionJourney, missionPhases, phaseOfIndex, primaryDialogue, type JourneyStepId, type JourneyStepState } from './missionFlow.js';
import { Learn } from './Learn.js';
import { CompanionReaction } from '../companion/Companion.js';
import { MiniMapStep, QuickReplyStep, SwapStep, VisualMatchStep } from './PracticeSteps.js';
import { missionsFor, useBootcampStore } from './bootcampStore.js';
import type { BootcampItem, BootcampStep, BootcampDialogue, BootcampVideo, DialogueChoice } from './types.js';
import { dialogueTranscript } from './transcript.js';
import { dialogueTr } from './i18n.js';
import { shuffle, mulberry32, sessionSeed } from '../../shared/util/shuffle.js';
import { FoundationHint } from '../foundation/FoundationHint.js';
import { TappableText, TargetText } from '../foundation/TappableText.js';
import { useParrotPlayback, PlaybackControls, type PlaybackItem } from '../../shared/playback/index.js';
import { Icon, type IconName } from '../../shared/ui/Icon.js';
import { BackButton } from '../../shared/ui/PageHeader.js';

/** Resolve a public asset path (e.g. "/videos/x.mp4") against the app's base so it works in
 *  dev, on the deployed sub-path, and inside the PWA. Absolute URLs pass through unchanged. */
function resolveAsset(src: string): string {
  if (/^https?:\/\//.test(src) || src.startsWith('blob:') || src.startsWith('data:')) return src;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return src.startsWith('/') ? base + src : `${base}/${src}`;
}

/** Speak a mission line in the ACTIVE learning language (the target — English pilot, French
 *  mission, …). Reads the app store at call time so it always matches the mission being played;
 *  replaces the old hardcoded English voice that made every mission sound English. */
function speakL(text: string, rate?: number): ReturnType<typeof speak> {
  return speak(text, useAppStore.getState().learningLang, rate);
}

/**
 * READY Missions: the Learn list, the guided mission overview and the generic MissionPlayer.
 * Dialogues render one line at a time (visual novel) — the user never sees the
 * conversation in advance; wrong choices branch through recovery beats and continue.
 * Every screen answers: does this reduce fear?
 */

export function Bootcamp() {
  const activeDay = useBootcampStore((s) => s.activeDay);
  const stage = useBootcampStore((s) => s.stage);
  if (activeDay === null) return <Learn />;
  return stage === 'play' ? <MissionPlayer /> : <MissionHub />;
}

/* ── Mission overview: one guided journey ────────────────────────────────── */

/**
 * The home of a mission — ONE guided path, not a menu of modes:
 *
 *   Watch (or Listen) → Learn → Practice → Watch again
 *
 * The journey is shown as a short list so the learner sees what is coming, but there is exactly ONE
 * primary action — "start / continue" — and it always runs the next step (`missionJourney`). A
 * first-time learner never has to choose between "Learn" and "Practice". Once the mission is
 * COMPLETED the steps become shortcuts for revisiting (a learner may jump straight to practice
 * then), and the primary action is the reward: watch the conversation again.
 *
 * Learn and Practice are entries into the SAME unchanged step-flow (see missionFlow.ts); the
 * pedagogy engine is untouched. The transcript and the video are tools inside this journey.
 */
function MissionHub() {
  const bc = useBootcampStore();
  const [showReader, setShowReader] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  // "Watched" is not stored progress, so it only steers the highlight within this visit.
  const [watched, setWatched] = useState(false);
  useEffect(() => () => cancelSpeech(), []);
  const day = bc.currentDay();
  if (!day) return null;
  const convo = primaryDialogue(day);
  const video = day.introVideo;
  const phases = missionPhases(day);
  const done = bc.completedDays.includes(day.day);
  const saved = done ? 0 : (bc.stepIndex[String(day.day)] ?? 0);
  const journey = missionJourney({ phases, canWatch: Boolean(video) || Boolean(convo), done, saved, watched });
  const { primary } = journey;
  // Where the guided path goes after watching/listening.
  const afterWatch = phases.hasLearn ? phases.learnStart : phases.practiceStart;

  // Watch = the video when the mission has one; otherwise the conversation itself, read aloud.
  const watch = (): void => {
    setWatched(true);
    if (video) setShowVideo(true);
    else if (convo) setShowReader(true);
  };
  const run = (step: JourneyStepId, resume = false): void => {
    tap();
    if (step === 'watch' || step === 'again') watch();
    else if (resume) bc.enterPractice(); // continue exactly where the learner stopped
    else bc.enterPractice(step === 'learn' ? phases.learnStart : phases.practiceStart);
  };

  if (showReader && convo) return <DialogueReader dialogue={convo} onClose={() => setShowReader(false)} onFinish={() => { setShowReader(false); bc.toHub(); }} />;
  if (showVideo && video) {
    return (
      <VideoOverlay
        video={video}
        onClose={() => setShowVideo(false)}
        // First pass through the mission: one obvious way forward. After completion the video is the
        // reward — there is nothing to continue to.
        onContinue={done ? undefined : () => { setShowVideo(false); bc.enterPractice(afterWatch); }}
        continueLabel={phases.hasLearn ? t('continueLearning') : t('journeyToPractice')}
      />
    );
  }

  const number = missionNumber(day.day) ?? day.day;
  const label: Record<JourneyStepId, { title: string; sub: string; icon: IconName }> = {
    watch: video ? { title: t('stepWatch'), sub: t('stepWatchSub'), icon: 'play' } : { title: t('stepListen'), sub: t('stepListenSub'), icon: 'listen' },
    learn: { title: t('stepLearn'), sub: t('stepLearnSub'), icon: 'learn' },
    practice: { title: t('stepPractice'), sub: t('stepPracticeSub'), icon: 'chat' },
    again: { title: video ? t('stepWatchAgain') : t('stepListenAgain'), sub: t('stepAgainSub'), icon: video ? 'play' : 'listen' },
  };
  const primaryLabel = primary.step === 'watch' ? (video ? t('journeyWatch') : t('journeyListen'))
    : primary.step === 'again' ? label.again.title
      : primary.step === 'learn' ? (primary.resume || journey.steps[0]?.id !== 'learn' ? t('continueLearning') : t('startLearning'))
        : t('journeyToPractice');

  return (
    <div className="screen">
      <div className="topbar">
        <BackButton onBack={() => { cancelSpeech(); bc.exit(); }} />
        <span className="chip">{t('situationOf', { n: number, total: BOOTCAMP_PLAN.length })}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav">
        <div className="hub-hero">
          <span className="icon-tile icon-tile-brand icon-tile-lg" aria-hidden>{missionIcon(day)}</span>
          <h1>{L(day.title)}</h1>
          {done && <p style={{ marginTop: 8 }}><span className="badge badge-ready">{t('completed')}</span></p>}
        </div>

        <ol className="journey" aria-label={t('journeySteps')}>
          {journey.steps.map((step, i) => (
            <JourneyStep
              key={step.id}
              n={i + 1}
              state={step.state}
              reward={step.id === 'again'}
              title={label[step.id].title}
              sub={label[step.id].sub}
              icon={<Icon name={label[step.id].icon} />}
              // Shortcuts only when revisiting a completed mission.
              onClick={journey.shortcuts ? () => run(step.id) : undefined}
            />
          ))}
        </ol>
        {!done && <p className="hint-card">💡 {video ? t('hubAfterHint') : t('hubAfterHintListen')}</p>}

        {/* Quiet tools — never competing with the primary action. */}
        <div className="hub-tools">
          {convo && video && (
            <button className="btn-link btn-icon" onClick={() => { tap(); setShowReader(true); }}>
              <Icon name="list" size={18} />{t('openTranscript')}
            </button>
          )}
          {primary.resume && (
            <button className="btn-link" onClick={() => { tap(); bc.enterPractice(afterWatch); }}>{t('resumeRestart')}</button>
          )}
        </div>
        {!video && <p className="faint small center" style={{ marginTop: 8 }}>{t('videoComingSoonDesc')}</p>}
      </div>

      <div className="action-zone">
        <button className="btn-primary btn-icon breathe" onClick={() => run(primary.step, primary.resume)}>
          {primaryLabel}
          <Icon name={primary.step === 'watch' || primary.step === 'again' ? label[primary.step].icon : 'arrow'} size={20} flip={primary.step === 'learn' || primary.step === 'practice'} />
        </button>
      </div>
    </div>
  );
}

/** One step of the mission journey. A plain list item on the guided path; a button (shortcut) only
 *  when `onClick` is given — i.e. when revisiting a completed mission. */
function JourneyStep({ n, title, sub, icon, state, reward, onClick }: {
  n: number; title: string; sub: string; icon: React.ReactNode; state: JourneyStepState; reward: boolean; onClick?: () => void;
}) {
  const cls = `jstep ${state === 'current' ? 'is-current' : ''} ${state === 'done' ? 'is-done' : ''} ${reward ? 'is-reward' : ''}`;
  const body = (
    <>
      <span className="jstep-num" aria-hidden>{state === 'done' || reward ? <Icon name="check" size={20} /> : n}</span>
      <span className="jstep-body">
        <span className="jstep-title">{title}</span>
        <span className="jstep-sub">{sub}</span>
      </span>
      <span className={`icon-tile ${state === 'current' ? 'icon-tile-brand' : ''}`} aria-hidden>{icon}</span>
    </>
  );
  return (
    <li aria-current={state === 'current' ? 'step' : undefined}>
      {onClick
        ? <button className={`${cls} card-press`} onClick={onClick}>{body}</button>
        : <div className={cls}>{body}</div>}
    </li>
  );
}

/* ── Mission player ─────────────────────────────────────────────────────── */

function MissionPlayer() {
  const bc = useBootcampStore();
  const [checkTrigger, setCheckTrigger] = useState(0);
  const [showReader, setShowReader] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const day = bc.currentDay();
  // Stop any lingering speech when the player unmounts (route change / back navigation).
  useEffect(() => () => cancelSpeech(), []);
  if (!day) return null;
  const step = day.steps[bc.index];
  const itemsById = new Map(day.items.map((i) => [i.id, i]));
  const convo = primaryDialogue(day);
  const video = day.introVideo;

  const pop = (): void => {
    success();
    setCheckTrigger((n) => n + 1);
  };
  const advance = (): void => {
    cancelSpeech(); // never let one step's audio bleed into the next
    bc.next();
  };
  // Back returns to the mission hub — the mission is a place you can always come back to,
  // never a dead end. (The hub's own back goes out to the map.)
  const back = (): void => {
    cancelSpeech();
    bc.toHub();
  };

  if (showReader && convo) return <DialogueReader dialogue={convo} onClose={() => setShowReader(false)} onFinish={() => { setShowReader(false); bc.toHub(); }} />;
  if (showVideo && video) return <VideoOverlay video={video} onClose={() => setShowVideo(false)} />;
  if (!step || step.kind === 'summary') return <VictoryScreen />;
  const progress = Math.round((bc.index / day.steps.length) * 100);
  const phases = missionPhases(day);
  const phase = phaseOfIndex(phases, bc.index);

  return (
    <div className="screen">
      <CheckPop trigger={checkTrigger} />
      <div className="topbar">
        <BackButton onBack={back} />
        <span className="chip">{missionIcon(day)} {L(day.title)}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="progress-track" style={{ marginBottom: 8 }}>
        <div className="progress-fill brand" style={{ width: `${progress}%` }} />
      </div>
      {/* The one orientation cue inside a lesson: where this step sits in the journey. */}
      {phases.hasLearn && step.kind !== 'video' && (
        <p className="phase-steps" aria-label={phase === 'learn' ? t('stepLearn') : t('stepPractice')}>
          <span className={phase === 'learn' ? 'on' : ''}>{t('stepLearn')}</span>
          <span className="sep" aria-hidden />
          <span className={phase === 'practice' ? 'on' : ''}>{t('stepPractice')}</span>
        </p>
      )}
      {/* Smart Foundation Detection: a tiny, non-blocking nudge for the first building-block word in
          this mission the learner has never viewed. Learn now / Dismiss — never gates the lesson. */}
      <FoundationHint targets={day.items.map((i) => i.text)} />
      {/* Video-first missions: the full conversation is one tap away at any moment. */}
      {video && step.kind !== 'video' && (
        <button className="btn-ghost" style={{ alignSelf: 'center', marginBottom: 4 }} onClick={() => { cancelSpeech(); setShowVideo(true); }}>
          {t('watchFullConvo')}
        </button>
      )}
      {/* Listen → Understand → Learn: missions without a video can still hear the scene up front. */}
      {!video && bc.index === 0 && convo && (
        <button className="btn-ghost" style={{ alignSelf: 'center', marginBottom: 4 }} onClick={() => setShowReader(true)}>
          {t('listenFullConvo')}
        </button>
      )}
      <div className="fade-in mission-step-body" key={bc.index}>
        {step.kind === 'video' && <VideoStep video={video} mode={step.mode} onNext={advance} />}
        {step.kind === 'talk' && <TalkStep step={step} onNext={advance} />}
        {step.kind === 'prime' && <PrimeStep step={step} itemsById={itemsById} onNext={advance} />}
        {step.kind === 'tool' && <ToolStep step={step} item={itemsById.get(step.itemId)!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'quiz' && <QuizStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
        {step.kind === 'replies' && <RepliesStep step={step} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'swipe' && <SwipeStep itemIds={step.itemIds} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'dialogue' && <DialogueStep dialogue={day.dialogues[step.dialogueId]!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'ambush' && <AmbushStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
        {step.kind === 'quickReply' && <QuickReplyStep step={step} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'visualMatch' && <VisualMatchStep step={step} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'swap' && <SwapStep step={step} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'miniMap' && <MiniMapStep step={step} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'receipt' && <ReceiptStep text={step.text} onNext={advance} />}
      </div>
    </div>
  );
}

/* ── Steps ──────────────────────────────────────────────────────────────── */

function TalkStep({ step, onNext }: { step: Extract<BootcampStep, { kind: 'talk' }>; onNext: () => void }) {
  return (
    <>
      <div className="drill-card" style={{ textAlign: 'start', gap: 16 }}>
        <p style={{ fontSize: '2.4rem', textAlign: 'center' }}>{step.icon}</p>
        <p className="drill-phrase" style={{ fontSize: '1.4rem', textAlign: 'center' }}>{L(step.title)}</p>
        {step.body.map((b, i) => (
          <p key={i} className="drill-meaning" style={{ fontSize: '1rem' }}>{L(b)}</p>
        ))}
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{step.cta ? L(step.cta) : t('continue')}</button>
      </div>
    </>
  );
}

/**
 * Vocabulary priming (Part 5) — "Before We Speak". A small set of building-block words shown on ONE
 * screen so a near-beginner recognizes the pieces before meeting a longer sentence. Each word is a
 * tap-to-hear chip (meaning always visible — this is preparation, not a test). When the step names a
 * canonical sentence (`buildFromItemId`), a "this builds" card reveals how the pieces combine into
 * the real, natural target sentence with its own audio. Sentences stay the learning unit.
 */
function PrimeStep({ step, itemsById, onNext }: { step: Extract<BootcampStep, { kind: 'prime' }>; itemsById: Map<string, BootcampItem>; onNext: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const built = step.buildFromItemId ? itemsById.get(step.buildFromItemId) : undefined;
  const say = (key: string, text: string, rate?: number): void => {
    tap();
    setPlaying(key);
    void speakL(text, rate).then((r) => { if (r !== 'interrupted') setPlaying((p) => (p === key ? null : p)); });
  };
  return (
    <>
      <div className="drill-card" style={{ textAlign: 'start', gap: 12 }}>
        <p className="drill-label" style={{ textAlign: 'center' }}>🗝️ {step.label ? L(step.label) : t('primeTitle')}</p>
        {step.intro && <p className="drill-meaning" style={{ textAlign: 'center' }}>{L(step.intro)}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {step.words.map((w, i) => (
            <button
              key={`${w.text}-${i}`}
              className={`list-row card-press ${playing === `w${i}` ? 'core-playing' : ''}`}
              style={{ width: '100%', textAlign: 'start', background: 'var(--card)', borderRadius: 'var(--r-md)', border: 'none', padding: '10px 14px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => say(`w${i}`, w.text)}
            >
              {w.emoji && <span style={{ fontSize: '1.6rem', width: 30, textAlign: 'center' }} aria-hidden>{w.emoji}</span>}
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontWeight: 700 }}><TargetText text={w.text} />{w.review && <span title={t('primeReview')} aria-label={t('primeReview')}> ♻️</span>}</span>
                <span className="dim small" style={{ display: 'block' }}>{L(w.meaning)}</span>
              </span>
              <span className="core-play" aria-hidden>🔊</span>
            </button>
          ))}
        </div>
        {built && (
          <div className="drill-card" style={{ marginTop: 4, gap: 6, background: 'var(--bg-soft, var(--card))' }}>
            <p className="faint small" style={{ textAlign: 'center' }}>{t('primeBuilds')}</p>
            <button className="listen-play" style={{ margin: '0 auto' }} onClick={() => say('full', built.text)} aria-label={t('playBtn')}>▶︎</button>
            <p className="drill-phrase" style={{ fontSize: '1.25rem', textAlign: 'center' }}><TappableText text={built.text} /></p>
            <p className="drill-meaning" style={{ textAlign: 'center' }}>{L(built.meaning)}</p>
          </div>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={() => { cancelSpeech(); onNext(); }}>{t('continue')}</button>
      </div>
    </>
  );
}

/**
 * Learn one sentence on ONE screen (Pareto UX sprint — "Listen → Understand → Continue").
 * Initial state: a play button + "Listening…" and nothing else. The moment playback FINISHES the
 * same screen transforms in place into the sentence + translation + Replay + Continue — no second
 * screen, no manual "tap when ready" gate (that gap was what made testers think the app froze).
 */
function ToolStep({ step, item, onDone }: { step: Extract<BootcampStep, { kind: 'tool' }>; item: BootcampItem; onDone: () => void }) {
  const bc = useBootcampStore();
  const [phase, setPhase] = useState<'listen' | 'reveal'>('listen');
  const played = useRef(false);
  const revealedRef = useRef(false);
  const reveal = (): void => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setPhase('reveal');
  };

  // Play on mount, then auto-transform the instant the audio ends (speak resolves on utterance end,
  // or immediately if audio is unavailable — either way the learner never stares at a frozen screen).
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    // Reveal on any terminal state (incl. audio unavailable) EXCEPT interruption — an interrupted
    // utterance means a newer one is now driving the screen.
    void speakL(item.text).then((r) => { if (r !== 'interrupted') reveal(); });
  }, [item.text]);

  const replayListen = (): void => void speakL(item.text).then((r) => { if (r !== 'interrupted') reveal(); });

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{step.label ? L(step.label) : t('toolOf', { i: step.index, n: step.total })}</p>
        {phase === 'listen' ? (
          <>
            <button className="listen-play" onClick={replayListen} aria-label={t('playBtn')}>▶︎</button>
            <p className="drill-meaning">{t('listenFirst')}</p>
          </>
        ) : (
          <>
            <p className="drill-phrase pop-in" style={{ fontSize: '1.5rem' }}><TappableText text={item.text} /></p>
            <p className="drill-meaning">{L(item.meaning)}</p>
            {item.tip && <p className="faint small">{L(item.tip)}</p>}
            <p className="faint small">🗣️ {t('sayItAloud')}</p>
          </>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speakL(item.text, phase === 'listen' ? 1 : 0.85)}>
          🔊 {t('replayAudio')}
        </button>
        {phase === 'reveal' && (
          <button className="btn-primary" onClick={() => { bc.recordDrill(item.id, 'echo', 'pass'); onDone(); }}>{t('continue')}</button>
        )}
      </div>
    </>
  );
}

function QuizStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'quiz' }>; itemsById: Map<string, BootcampItem>; onDone: (ok: boolean) => void }) {
  const bc = useBootcampStore();
  const item = itemsById.get(step.itemId)!;
  const [options] = useState(() =>
    // Uniform Fisher–Yates (seeded once per mount) — the old `.sort(() => random-0.5)` biased
    // which answer landed in which slot. Seed captured in state so re-renders never reorder.
    shuffle(
      [item, ...step.wrongIds.map((id) => itemsById.get(id)!)].map((i) => ({ id: i.id, label: L(i.meaning) })),
      mulberry32(sessionSeed()),
    ),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      void speakL(item.text);
    }
  }, [item.text]);

  // Answered — pause here. Full context: what you heard, your pick, what it means. Continue only on NEXT.
  if (picked !== null) {
    const ok = picked === item.id;
    const yourAnswer = options.find((o) => o.id === picked)?.label;
    return (
      <AnsweredView ok={ok} en={item.text} meaning={L(item.meaning)} tip={item.tip ? L(item.tip) : undefined}
        comprehension yourAnswer={ok ? undefined : yourAnswer} onRetry={ok ? undefined : () => setPicked(null)}
        onNext={() => onDone(ok)} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('whatDidItMean')}</p>
        <p style={{ fontSize: '2.6rem' }}>👂</p>
      </div>
      <div className="action-zone">
        {options.map((o) => (
          <button key={o.id} className="btn-secondary" onClick={() => {
            tap();
            setPicked(o.id);
            bc.recordDrill(item.id, 'listen', o.id === item.id ? 'pass' : 'fail');
          }}>
            <TargetText text={o.label} />
          </button>
        ))}
        <button className="btn-ghost" onClick={() => void speakL(item.text)}>🔊 {t('hearAgain')}</button>
      </div>
    </>
  );
}

/**
 * Adapter over the reusable AnswerFeedback (Part C). Builds the structured context from a drill's
 * data so every exercise gets the same full-context hierarchy:
 *  - `comprehension` drills (hear English → pick meaning): prompt = the English you heard (with
 *    replay); expected = its meaning ("What it means").
 *  - respond-to-prompt drills (ambush): prompt = the NPC line you heard (+ translation + replay);
 *    expected = the response that fit (+ translation + replay). This restores the lost context that
 *    made "That comes to fifteen fifty…" → "Fifteen fifty." confusing.
 */
function AnsweredView({ ok, en, meaning, yourAnswer, why, tip, prompt, comprehension, onRetry, onNext }: {
  ok: boolean; en: string; meaning: string; yourAnswer?: string; why?: string; tip?: string;
  prompt?: { en: string; he?: string }; comprehension?: boolean; onRetry?: () => void; onNext: () => void;
}) {
  const reason = why ?? tip ?? t('meansMapping', { en, meaning });
  const ctx = comprehension
    ? buildComprehensionContext({
        heard: en, onReplayHeard: () => void speakL(en),
        chosen: yourAnswer, meaning, why: reason, shouldLabel: t('theMeaning'),
      })
    : buildRespondContext({
        promptText: prompt?.en, promptTranslation: prompt?.he, onReplayPrompt: prompt ? () => void speakL(prompt.en) : undefined,
        chosen: yourAnswer, expectedText: en, expectedTranslation: meaning, onReplayExpected: () => void speakL(en),
        why: reason,
      });
  return <AnswerFeedback ok={ok} ctx={ctx} onRetry={onRetry} onContinue={onNext} />;
}

/** Expected Replies: "you said X — here's what they might answer." Comprehension-first. */
function RepliesStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'replies' }>; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const said = itemsById.get(step.saidItemId)!;
  const [idx, setIdx] = useState(-1); // -1 = intro
  const [picked, setPicked] = useState<string | null>(null);
  const [seed] = useState(sessionSeed); // stable across re-renders so options don't reshuffle mid-view
  const reply = idx >= 0 ? itemsById.get(step.replyIds[idx] ?? '') : undefined;

  const options = useMemo(() => {
    if (!reply) return [];
    const wrongs = step.replyIds.filter((id) => id !== reply.id).slice(0, 2).map((id) => itemsById.get(id)!);
    return shuffle([reply, ...wrongs].map((i) => ({ id: i.id, label: L(i.meaning) })), mulberry32(seed + idx));
  }, [reply, step.replyIds, itemsById, seed, idx]);

  useEffect(() => {
    if (reply) void speakL(reply.text);
  }, [reply]);

  if (idx === -1) {
    return (
      <>
        <div className="drill-card" style={{ gap: 10 }}>
          <p className="drill-label">{t('youSaid')}</p>
          <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>“<TappableText text={said.text} />”</p>
          <p className="drill-meaning" style={{ fontSize: '0.95rem' }}>{t('expectedReplies')}</p>
        </div>
        <div className="action-zone">
          <button className="btn-primary" onClick={() => setIdx(0)}>👂 {t('imReady')}</button>
        </div>
      </>
    );
  }
  if (!reply) return null;

  // Answered — learn this reply before moving to the next one.
  if (picked !== null) {
    const ok = picked === reply.id;
    const yourAnswer = options.find((o) => o.id === picked)?.label;
    return (
      <AnsweredView ok={ok} en={reply.text} meaning={L(reply.meaning)} tip={reply.tip ? L(reply.tip) : undefined}
        comprehension yourAnswer={ok ? undefined : yourAnswer} onRetry={ok ? undefined : () => setPicked(null)}
        onNext={() => {
          setPicked(null);
          if (idx + 1 >= step.replyIds.length) onDone();
          else setIdx(idx + 1);
        }} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('whichReply')} ({idx + 1}/{step.replyIds.length})</p>
        <p style={{ fontSize: '2.6rem' }}>👂</p>
      </div>
      <div className="action-zone">
        {options.map((o) => (
          <button key={o.id} className="btn-secondary" onClick={() => {
            tap();
            setPicked(o.id);
            bc.recordDrill(reply.id, 'listen', o.id === reply.id ? 'pass' : 'fail');
          }}>
            <TargetText text={o.label} />
          </button>
        ))}
        <button className="btn-ghost" onClick={() => void speakL(reply.text)}>🔊 {t('hearAgain')}</button>
      </div>
    </>
  );
}

/**
 * Sentence review (Sprint: replaced the "Know it / Don't know" flashcard self-report — see
 * LEARNING FLOW RULE). No self-grading: the learner hears each trained sentence, sees its
 * meaning, can replay it freely, and moves on. Words are support; the sentence is the unit.
 */
function SwipeStep({ itemIds, itemsById, onDone }: { itemIds: string[]; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const [i, setI] = useState(0);
  const item = itemsById.get(itemIds[i] ?? '')!;
  useEffect(() => {
    if (item) void speakL(item.text);
  }, [item]);
  if (!item) return null;
  const last = i + 1 >= itemIds.length;
  const next = (): void => {
    tap();
    if (last) onDone();
    else setI(i + 1);
  };
  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('reviewProgress', { i: i + 1, n: itemIds.length })}</p>
        <p className="drill-phrase" style={{ fontSize: '1.5rem' }}><TappableText text={item.text} /></p>
        <p className="drill-meaning">{L(item.meaning)}</p>
        {item.tip && <p className="faint small">{L(item.tip)}</p>}
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speakL(item.text)}>🔊 {t('hearAgain')}</button>
        <button className="btn-primary" onClick={next}>{last ? t('continue') : t('nextBtn')}</button>
      </div>
    </>
  );
}

/** Visual-novel dialogue: ONE exchange on screen, choices branch, no transcript spoilers.
 *  Coaching mode (opt-in per dialogue; no current mission enables it): survival-tool badges, a "pick a way out" hint, and a pause after
 *  each choice that reframes it as more/less useful — never right/wrong — before continuing. */
function DialogueStep({ dialogue, onDone }: { dialogue: BootcampDialogue; onDone: () => void }) {
  const bc = useBootcampStore();
  const coaching = dialogue.coaching ?? false;
  const nodesById = useMemo(() => new Map(dialogue.nodes.map((n) => [n.id, n])), [dialogue]);
  const [nodeId, setNodeId] = useState(dialogue.start);
  const [yourLine, setYourLine] = useState<string | null>(null); // your last spoken line (briefly shown)
  const [recovered, setRecovered] = useState(false);
  const [picked, setPicked] = useState<DialogueChoice | null>(null); // coaching feedback pause
  const node = nodesById.get(nodeId);

  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    if (node.who === 'npc') {
      void speakL(node.en, node.fast ? 1.08 : node.slow ? 0.75 : 0.95).then((r) => {
        if (cancelled || r !== 'ended') return; // interrupted audio never advances the dialogue
        if (node.end) {
          setTimeout(() => !cancelled && onDone(), 800);
        } else if (node.next) {
          setTimeout(() => !cancelled && setNodeId(node.next!), 700);
        }
      });
    } else if (node.who === 'you' && node.next && !node.choices) {
      // scripted you-line: the app voices it for you, then moves on
      setYourLine(node.en);
      void speakL(node.en, 0.92).then((r) => {
        if (!cancelled && r === 'ended') setTimeout(() => setNodeId(node.next!), 500);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  if (!node) return null;
  const npcNode = node.who === 'npc' ? node : [...nodesById.values()].find((n) => n.next === node.id || n.choices?.some((c) => c.next === node.id));
  const displayNpc = node.who === 'npc' ? node : npcNode;

  // Coaching pause: reframe the pick as more/less useful (never wrong), then continue on tap.
  if (coaching && picked) {
    const suits = picked.correct;
    const isTool = picked.itemId?.includes('.phrase.recovery.') ?? false;
    const message = picked.coach ? L(picked.coach) : suits && isTool ? t('usedSurvivalTool') : suits ? t('goodMoveGeneric') : t('lessUsefulGeneric');
    return (
      <>
        <div className="drill-card pop-in" style={{ gap: 12, minHeight: 240 }}>
          <span style={{ fontWeight: 800, letterSpacing: '0.04em', color: suits ? 'var(--good)' : 'var(--warn)' }}>
            {suits ? `🛟 ${t('suitsHere')}` : t('lessUsefulHere')}
          </span>
          <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>“<TappableText text={picked.en} />”</p>
          <p className="drill-meaning">{message}</p>
        </div>
        <div className="action-zone">
          <button className="btn-primary" onClick={() => { const next = picked.next; setPicked(null); setNodeId(next); }}>{t('nextBtn')}</button>
        </div>
      </>
    );
  }

  // Non-coaching FULL-correct pick: a short success screen (Correct · replay question · replay your
  // answer · Next) — the natural line is celebrated, not skipped past. Continue advances the dialogue.
  if (picked && picked.correct) {
    const ctx: AnswerContext = {
      prompt: displayNpc ? { text: displayNpc.en, translation: dialogueTr(displayNpc), onReplay: () => void speakL(displayNpc.en) } : undefined,
      expected: { text: picked.en, translation: dialogueTr(picked), onReplay: () => void speakL(picked.en) },
    };
    return (
      <AnswerFeedback
        ok
        ctx={ctx}
        onContinue={() => { const next = picked.next; setPicked(null); setNodeId(next); }}
      />
    );
  }

  // Non-coaching wrong pick: full-context correction so the mistake matters (never flashes past).
  // Shows WHAT YOU HEARD (the NPC line) → your pick → WHAT YOU SHOULD ANSWER (the line that fit).
  // Try again returns to the same decision; Continue proceeds to the NPC's believable recovery beat.
  if (picked) {
    const correctChoice = node.choices?.find((c) => c.correct);
    const ctx = buildRespondContext({
      promptText: displayNpc?.en, promptTranslation: displayNpc ? dialogueTr(displayNpc) : undefined,
      onReplayPrompt: displayNpc ? () => void speakL(displayNpc.en) : undefined,
      chosen: picked.en, chosenTranslation: dialogueTr(picked),
      expectedText: correctChoice?.en ?? picked.en, expectedTranslation: correctChoice ? dialogueTr(correctChoice) : undefined,
      onReplayExpected: correctChoice ? () => void speakL(correctChoice.en) : undefined,
      why: picked.coach ? L(picked.coach) : t('dialogueMisstep'),
    });
    return (
      <AnswerFeedback
        ok={false}
        ctx={ctx}
        onRetry={() => setPicked(null)}
        onContinue={() => { const next = picked.next; setPicked(null); setRecovered(true); setNodeId(next); }}
      />
    );
  }

  return (
    <>
      <div className="drill-card" style={{ gap: 14, minHeight: 240 }}>
        <p className="drill-label">{t(node.who === 'you' && node.choices?.length === 1 ? 'yourTurnSay' : 'yourTurn')}</p>
        {recovered && <p className="faint small fade-in">🛟 {t('niceRecovery')}</p>}
        {displayNpc && (
          <div className="fade-in" key={displayNpc.id}>
            <p style={{ fontSize: '1.9rem' }}>🧑‍🍳</p>
            <p className="drill-phrase" style={{ fontSize: '1.25rem' }}>“<TappableText text={displayNpc.en} />”</p>
            <p className="dim small">{dialogueTr(displayNpc)}</p>
          </div>
        )}
        {yourLine && node.who !== 'you' && <p className="faint small">🫵 {yourLine}</p>}
      </div>
      <div className="action-zone">
        {node.who === 'you' && node.choices ? (
          <>
            {coaching && <p className="dim small" style={{ textAlign: 'center', marginBottom: 2 }}>{t('chooseToEscape')}</p>}
            {node.choices.map((c, i) => {
              const isTool = c.itemId?.includes('.phrase.recovery.') ?? false;
              return (
                <button
                  key={i}
                  className="btn-secondary"
                  onClick={() => {
                    tap();
                    if (c.itemId) bc.recordDrill(c.itemId, 'simulator', c.correct ? 'pass' : 'partial');
                    setYourLine(c.en);
                    // A wrong pick ALWAYS pauses (coaching card in a coaching dialogue, "Not quite" card
                    // elsewhere) so the mistake registers before the NPC reacts. A FULL correct
                    // answer (the natural line, not merely a survival tool) now earns a short success
                    // screen too — it never just flashes past. Survival-tool picks stay fast (an
                    // emergency alternative isn't celebrated) and flow straight on.
                    if (coaching || !c.correct) {
                      if (!c.correct && !coaching) feedbackWrong(); // coaching stays "never wrong"
                      setPicked(c);
                      void speakL(c.en, 0.92);
                    } else if (!isTool) {
                      success();
                      setPicked(c); // → success screen (Correct · replay question · replay answer · Next)
                      void speakL(c.en, 0.92);
                    } else {
                      // Survival tool: advance when the line finishes naturally; a rapid re-tap that
                      // supersedes this utterance resolves 'interrupted' and must not double-advance.
                      const target = c.next;
                      void speakL(c.en, 0.92).then((r) => { if (r === 'ended') setNodeId(target); });
                    }
                  }}
                >
                  {coaching && isTool && (
                    <span className="badge badge-ready" style={{ display: 'inline-flex', marginBottom: 6 }}>🛟 {t('survivalTool')}</span>
                  )}
                  {/* Answer cards show ONLY the target language — the learner must understand the
                      option, not match the native translation. The translation still appears on the
                      question (NPC line above) and in the post-answer feedback. */}
                  <span style={{ display: 'block' }}>{c.en}</span>
                </button>
              );
            })}
            {/* Replay the question audio (item: every multiple-choice exercise can re-hear the prompt). */}
            {displayNpc && (
              <button className="btn-ghost" onClick={() => void speakL(displayNpc.en)}>🔊 {t('replayQuestion')}</button>
            )}
          </>
        ) : (
          <button className="btn-ghost" onClick={() => displayNpc && void speakL(displayNpc.en)}>
            🔊 {t('replayAudio')}
          </button>
        )}
      </div>
    </>
  );
}

function AmbushStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'ambush' }>; itemsById: Map<string, BootcampItem>; onDone: (ok: boolean) => void }) {
  const bc = useBootcampStore();
  const [fired, setFired] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const shownAt = useRef(0);
  const correct = itemsById.get(step.correctItemId)!;
  const wrong = itemsById.get(step.wrongItemId)!;
  const [order] = useState(() => shuffle([correct, wrong], mulberry32(sessionSeed())));
  // What is being tested. No mode = the original behaviour (every option badged as a tool).
  // 'recovery': the line is meant to be too hard — only the real conversation-help tool is badged.
  // 'speed': known language at speed — no tool badge, and the screen never says "use a tool".
  const isTool = (id: string): boolean => id.includes('.phrase.recovery.');
  const badge = (id: string): string => (step.mode === 'speed' ? '' : step.mode === 'recovery' ? (isTool(id) ? '🛟 ' : '') : '🛟 ');

  // Answered — full context: WHAT YOU HEARD (the fast NPC line) → your pick → what fit. This is the
  // Money & Numbers case: "That comes to fifteen fifty…" is now shown, so "Fifteen fifty." makes sense.
  if (picked !== null) {
    const ok = picked === correct.id;
    return (
      <AnsweredView ok={ok} en={correct.text} meaning={L(correct.meaning)} tip={correct.tip ? L(correct.tip) : undefined}
        prompt={{ en: step.npc.en, he: dialogueTr(step.npc) }} yourAnswer={ok ? undefined : wrong.text}
        onRetry={ok ? undefined : () => setPicked(null)} onNext={() => onDone(ok)} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t(step.mode === 'speed' ? 'speedHeadsUp' : 'fastOneComing')}</p>
        <p style={{ fontSize: '2.6rem' }}>⚡</p>
        {fired && <p className="faint small fade-in">“{step.npc.en}”</p>}
      </div>
      <div className="action-zone">
        {!fired ? (
          <button className="btn-primary" onClick={() => {
            setFired(true);
            shownAt.current = Date.now();
            void speakL(step.npc.en, 1.12);
          }}>
            👂 {t('imReady')}
          </button>
        ) : (
          <>
            {order.map((o) => (
              <button key={o.id} className="btn-secondary" onClick={() => {
                tap();
                bc.recordDrill(correct.id, 'listen', o.id === correct.id ? 'pass' : 'fail', Date.now() - shownAt.current);
                setPicked(o.id);
              }}>
                {badge(o.id)}{o.text}
              </button>
            ))}
            <button className="btn-ghost" onClick={() => void speakL(step.npc.en, 0.85)}>🔊 {t('hearAgain')}</button>
          </>
        )}
      </div>
    </>
  );
}

function ReceiptStep({ text, onNext }: { text: Record<string, string>; onNext: () => void }) {
  const bc = useBootcampStore();
  useEffect(() => {
    bc.addReceipt(L(text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="drill-card pop-in">
        <p style={{ fontSize: '2.6rem' }}>🧾</p>
        <p className="drill-phrase" style={{ fontSize: '1.25rem' }}>{L(text)}</p>
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{t('continue')}</button>
      </div>
    </>
  );
}

/** Celebratory confetti burst (decorative). Honors prefers-reduced-motion via the global rule. */
const CONFETTI_COLORS = ['#5b46e4', '#0ca678', '#e8a13c', '#e05252', '#2f6fed', '#e8590c'];
function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 42 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.8 + Math.random() * 1.4,
      rot: Math.random() * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
    [],
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, rotate: `${p.rot}deg` }} />
      ))}
    </div>
  );
}

/**
 * Victory Screen — READY sells confidence, so completion celebrates, it doesn't summarize.
 * The reward is re-watching the conversation you now understand (primary), THEN transcript /
 * practice again; the next mission is a quiet ghost action (confidence before progress).
 * Completion is recorded on mount; nothing is ever locked afterwards.
 */
function VictoryScreen() {
  const bc = useBootcampStore();
  const learningLang = useAppStore((s) => s.learningLang);
  const day = bc.currentDay();
  const [showReader, setShowReader] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const recorded = useRef(false);
  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      success();
      bc.completeDay();
    }
    return () => cancelSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showLearned, setShowLearned] = useState(false);
  if (!day) return null;
  const receipts = bc.receipts.filter((r) => r.day === day.day);
  const convo = primaryDialogue(day);
  const video = day.introVideo;
  const meta = BOOTCAMP_PLAN.find((m) => m.day === day.day);
  // "Mastered phrases" = the say-phrases this mission taught (recovery tools + replies excluded).
  const mastered = day.items.filter((i) => i.id.includes('.phrase.') && !i.id.includes('.phrase.recovery.'));
  const missions = missionsFor(learningLang);
  const nextBuilt = nextMission(day.day, (m) => m.day in missions, (m) => bc.completedDays.includes(m.day));
  // Early Access end-state: no further built mission to do, but the language still has
  // missions "Coming Soon". The learner reached the edge of the built content — never
  // route them into an unbuilt mission; celebrate the available set honestly.
  const earlyAccessDone = !nextBuilt && BOOTCAMP_PLAN.some((m) => !(m.day in missions));

  if (showReader && convo) return <DialogueReader dialogue={convo} onClose={() => setShowReader(false)} onFinish={() => { setShowReader(false); bc.toHub(); }} />;
  if (showVideo && video) return <VideoOverlay video={video} onClose={() => setShowVideo(false)} />;

  // The reward: re-watch the full conversation — the video if there is one, else the transcript.
  const watch = (): void => {
    if (video) setShowVideo(true);
    else if (convo) setShowReader(true);
  };

  return (
    <div className="screen">
      <Confetti />
      <div className="topbar">
        <BackButton onBack={() => { cancelSpeech(); bc.toHub(); }} />
        <span className="chip">{t('situationOf', { n: missionNumber(day.day) ?? day.day, total: BOOTCAMP_PLAN.length })}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav">
        {/* Celebrate — no wall of text. One line: the mission is done. */}
        <div className="center" style={{ padding: '10px 0 8px' }}>
          <p className="pop-in" style={{ fontSize: '3.8rem' }}>🎉</p>
          <h1 style={{ marginTop: 6 }}>{t('victoryCompleted', { title: L(day.title) })}</h1>
          <CompanionReaction kind="missionComplete" />
        </div>

        {/* Early Access edge: honestly celebrate reaching the end of the available missions. */}
        {earlyAccessDone && (
          <div className="card fade-in center" style={{ marginBottom: 4 }}>
            <p className="drill-phrase" style={{ fontSize: '1.06rem' }}>🚀 {t('earlyAccessDoneTitle')}</p>
            <p className="dim small" style={{ marginTop: 4 }}>{t('earlyAccessDoneBody')}</p>
          </div>
        )}

        {/* Large action cards — the whole point of the screen. */}
        <button className="game-card card-press" onClick={watch}>
          <span className="game-icon" style={{ background: 'var(--brand)' }}>🎬</span>
          <span><p style={{ fontWeight: 800 }}>{t('watchConversationCard')}</p></span>
        </button>
        {convo && (
          <button className="game-card card-press" onClick={() => setShowReader(true)}>
            <span className="game-icon" style={{ background: 'var(--accent)' }}>📖</span>
            <span><p style={{ fontWeight: 800 }}>{t('openTranscript')}</p></span>
          </button>
        )}
        <button className="game-card card-press" onClick={() => bc.enterPractice()}>
          <span className="game-icon" style={{ background: 'var(--good)' }}>🎯</span>
          <span><p style={{ fontWeight: 800 }}>{t('practiceAgain')}</p></span>
        </button>

        {/* Evidence is opt-in, not a wall of reading — collapsed by default (Pareto). */}
        <button className="btn-ghost" style={{ margin: '8px auto 0' }} onClick={() => setShowLearned((v) => !v)}>
          {showLearned ? '▾' : '▸'} {t('whatDidILearn')}
        </button>
        {showLearned && (
          <div className="card card-sunken fade-in" style={{ textAlign: 'start' }}>
            {meta && (
              <>
                <p className="drill-label">{t('learnedSkill')}</p>
                <p className="small" style={{ marginBottom: 10 }}>✅ {L(meta.confidenceGain)}</p>
              </>
            )}
            {mastered.length > 0 && (
              <>
                <p className="drill-label">{t('masteredPhrases')}</p>
                {mastered.map((i) => (
                  <p key={i.id} className="small">🗣️ <TappableText text={i.text} /> <span className="dim">— {L(i.meaning)}</span></p>
                ))}
              </>
            )}
            {receipts.length > 0 && (
              <>
                <p className="drill-label" style={{ marginTop: 10 }}>{t('yourEvidence')}</p>
                {receipts.map((r, i) => (
                  <p key={i} className="small">🧾 {r.text}</p>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-primary breathe" onClick={watch}>{t('watchFullConvo')}</button>
        {nextBuilt ? (
          <button className="btn-ghost btn-icon" style={{ alignSelf: 'center' }} onClick={() => bc.startDay(nextBuilt.day)}>
            {t('nextMission', { title: L(nextBuilt.title) })}
            <Icon name="arrow" size={18} flip />
          </button>
        ) : earlyAccessDone ? (
          <button className="btn-ghost" onClick={() => { cancelSpeech(); bc.exit(); }}>{t('earlyAccessBackToMap')}</button>
        ) : null}
      </div>
    </div>
  );
}

/* ── Full dialogue reader — the premium study sheet ─────────────────────── */

/** The complete conversation as a reader: every line in both languages, per-line replay,
 *  play-all / pause / restart / prev / next, with the current line highlighted. Used before
 *  the mission (preview) and after it (study sheet). Pure playback — no scoring. */
function DialogueReader({ dialogue, onClose, onFinish }: { dialogue: BootcampDialogue; onClose: () => void; onFinish?: () => void }) {
  const lines = useMemo(() => dialogueTranscript(dialogue), [dialogue]);
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The SAME universal listen engine the Core surfaces use — the transcript adds no second player,
  // it just provides its lines as items and renders them as a scrolling, highlighted study sheet.
  const items = useMemo<PlaybackItem[]>(() => lines.map((line, i) => ({
    id: `${i}`, target: line.en, targetLang: learningLang, translation: dialogueTr(line), translationLang: uiLang,
  })), [lines, learningLang, uiLang]);
  // Remember the last-listened line per dialogue (by stable id) so returning refocuses it.
  const pb = useParrotPlayback(items, { scope: 'transcript', bookmarkKey: `transcript:${learningLang}:${dialogue.id}` });
  const current = pb.currentIndex;

  // Auto-scroll: keep the active line centred as playback (or stepping) moves through the sheet.
  useEffect(() => {
    lineRefs.current[current]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [current]);

  return (
    <div className="reader">
      <div className="topbar">
        <BackButton onBack={() => { pb.pause(); onClose(); }} />
        <span className="chip">📖 {t('fullConversationTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <p className="dim small" style={{ margin: '0 0 8px' }}>{t('studySheetSub')} · {t('lineProgress', { i: pb.position, n: pb.total })}</p>
      <div className="reader-scroll">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            className={`dline ${line.who === 'you' ? 'you' : ''} ${i === current ? 'now' : ''}`}
          >
            <div className="dline-top">
              <span className="dline-speaker">{line.who === 'you' ? `🫵 ${t('speakerYou')}` : `🧑 ${t('speakerThem')}`}</span>
              <button className="dline-play" onClick={() => pb.jumpTo(i)} aria-label={t('replayAudio')}>🔊</button>
            </div>
            <p className="dline-en"><TappableText text={line.en} /></p>
            <p className="dline-he">{dialogueTr(line)}</p>
          </div>
        ))}
      </div>
      <div className="reader-transport">
        <PlaybackControls pb={pb} />
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => pb.restart({ play: true })}>{t('restartConvo')}</button>
          {onFinish && (
            <button className="btn-secondary" onClick={() => { pb.pause(); onFinish(); }}>✓ {t('finishToHub')}</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Video-first intro / review ─────────────────────────────────────────── */

/** Custom video player — NO native controls: no seek bar, no ±10s, no fullscreen, no menu, no dark
 *  overlay, no letterbox bars. One tap toggles play/pause; a centered ▶︎ shows while paused. The
 *  video stays fully visible (frame == video box). A missing/broken file degrades to a friendly
 *  note — never crashes. Videos are short (20–35s), so play/pause is the only control needed. */
export function VideoPlayer({ video, onEnded }: { video: BootcampVideo; onEnded?: () => void }) {
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  if (failed || !video.src) return <p className="dim small" style={{ padding: '20px 0' }}>{t('videoUnavailable')}</p>;
  const toggle = (): void => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined);
    else v.pause();
  };
  return (
    <div className="video-frame" onClick={toggle} role="button" aria-label={t('playBtn')}>
      <video
        ref={ref}
        className="video-player"
        src={resolveAsset(video.src)}
        playsInline
        preload="metadata"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
        onEnded={() => { setPlaying(false); onEnded?.(); }}
      />
      {!playing && <span className="video-play-overlay" aria-hidden />}
    </div>
  );
}

/** A mission step that shows the full-conversation video — before practice (intro) and again
 *  near the end (again). The learner presses Play; then a single button moves the mission on. */
function VideoStep({ video, mode, onNext }: { video?: BootcampVideo; mode: 'intro' | 'again'; onNext: () => void }) {
  const intro = mode === 'intro';
  return (
    <>
      <div className="drill-card" style={{ gap: 14 }}>
        <p style={{ fontSize: '2.2rem' }}>🎬</p>
        <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>{intro ? t('videoIntroTitle') : t('videoAgainTitle')}</p>
        <p className="drill-meaning" style={{ fontSize: '0.98rem' }}>{intro ? t('videoIntroSub') : t('videoAgainSub')}</p>
        {video ? <VideoPlayer video={video} /> : <p className="dim small">{t('videoUnavailable')}</p>}
      </div>
      <div className="action-zone">
        <button className="btn-primary" onClick={onNext}>{intro ? t('startPractice') : t('continue')}</button>
      </div>
    </>
  );
}

/** Full-screen "Watch full conversation" overlay — reachable any time during the mission. When
 *  `onContinue` is given (the guided first pass) it offers ONE way forward; it never asks the
 *  learner to judge whether they "understood everything". */
function VideoOverlay({ video, onClose, onContinue, continueLabel }: { video: BootcampVideo; onClose: () => void; onContinue?: () => void; continueLabel?: string }) {
  return (
    <div className="reader">
      <div className="topbar">
        <BackButton onBack={onClose} />
        <span className="chip">🎬 {video.title ? L(video.title) : t('fullConversationTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="reader-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <VideoPlayer video={video} />
      </div>
      {onContinue && (
        <div className="reader-transport">
          <button className="btn-primary btn-icon" onClick={() => { tap(); onContinue(); }}>
            {continueLabel ?? t('continue')}<Icon name="arrow" size={20} flip />
          </button>
        </div>
      )}
    </div>
  );
}
