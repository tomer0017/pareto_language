import { useEffect, useMemo, useRef, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { CheckPop } from '../../shared/ui/CheckPop.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { getAudioDiag, subscribeAudioDiag, testAudio, unlockAudio } from '../../shared/audio/tts.js';
import { useSyncExternalStore } from 'react';
import { BOOTCAMP_PLAN, CORE_MISSIONS, SPECIAL_MISSIONS, PHASES, missionNumber } from './plan.js';
import { DAYS, useBootcampStore } from './bootcampStore.js';
import type { BootcampItem, BootcampStep, BootcampDialogue, BootcampDayContent, BootcampVideo, DialogueChoice } from './types.js';
import { dialogueTranscript } from './transcript.js';

/** Resolve a public asset path (e.g. "/videos/x.mp4") against the app's base so it works in
 *  dev, on the deployed sub-path, and inside the PWA. Absolute URLs pass through unchanged. */
function resolveAsset(src: string): string {
  if (/^https?:\/\//.test(src) || src.startsWith('blob:') || src.startsWith('data:')) return src;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return src.startsWith('/') ? base + src : `${base}/${src}`;
}

/** The mission's canonical dialogue — used by the full-conversation reader (start + summary). */
function primaryDialogue(day: BootcampDayContent): BootcampDialogue | null {
  const step = day.steps.find((s): s is Extract<BootcampStep, { kind: 'dialogue' }> => s.kind === 'dialogue');
  const byStep = step ? day.dialogues[step.dialogueId] : undefined;
  return byStep ?? Object.values(day.dialogues)[0] ?? null;
}

/**
 * READY Missions (Sprint 7): phase map + the generic MissionPlayer.
 * Dialogues render one line at a time (visual novel) — the user never sees the
 * conversation in advance; wrong choices branch through recovery beats and continue.
 * Every screen answers: does this reduce fear?
 */

export function Bootcamp() {
  const activeDay = useBootcampStore((s) => s.activeDay);
  const stage = useBootcampStore((s) => s.stage);
  if (activeDay === null) return <MissionMap />;
  return stage === 'play' ? <MissionPlayer /> : <MissionHub />;
}

/* ── Mission Hub: three ways to learn, always available ──────────────────── */

/** The home of a mission (20/80). Exactly three learning modes — Practice, Transcript, Video —
 *  each always reachable. Completing a mission never removes access; it just becomes "Practice
 *  again". Practice enters the unchanged Bootcamp step-flow; Transcript/Video open as overlays. */
function MissionHub() {
  const bc = useBootcampStore();
  const [showReader, setShowReader] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => () => cancelSpeech(), []);
  const day = bc.currentDay();
  if (!day) return null;
  const convo = primaryDialogue(day);
  const video = day.introVideo;
  const done = bc.completedDays.includes(day.day);
  const resumable = (bc.stepIndex[String(day.day)] ?? 0) > 0 && !done;
  const practiceCta = done ? t('practiceAgain') : resumable ? t('continuePractice') : t('startPractice');

  if (showReader && convo) return <DialogueReader dialogue={convo} onClose={() => setShowReader(false)} onFinish={() => { setShowReader(false); bc.toHub(); }} />;
  if (showVideo && video) return <VideoOverlay video={video} onClose={() => setShowVideo(false)} />;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" onClick={() => { cancelSpeech(); bc.exit(); }}>{t('back')}</button>
        <span className="chip">{missionNumber(day.day) ? `${t('mission')} ${missionNumber(day.day)}` : '🛟'}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav">
        <LangStrip />
        <h1 style={{ textAlign: 'center', margin: '4px 0 6px' }}>🎖️ {L(day.title)}</h1>
        <p className="center" style={{ marginBottom: 14 }}>
          {done
            ? <span className="badge badge-ready">{t('completed')}</span>
            : <span className="dim small">{t('threeWaysToLearn')}</span>}
        </p>

        <HubCard
          icon="🎯" iconBg="var(--brand-soft)"
          title={t('practice')} desc={t('practiceCardDesc')}
          cta={practiceCta} ctaClass="btn-primary" onClick={() => bc.enterPractice()}
        />
        <HubCard
          icon="📖" iconBg="var(--accent-soft)"
          title={t('transcriptTitle')} desc={t('transcriptCardDesc')}
          cta={t('openTranscript')} ctaClass="btn-secondary"
          onClick={() => setShowReader(true)} disabled={!convo}
        />
        <HubCard
          icon="🎬" iconBg="#dbeafe"
          title={t('videoCardTitle')} desc={video ? t('videoCardDesc') : t('videoComingSoonDesc')}
          cta={video ? t('watchVideoCta') : t('comingSoon')} ctaClass="btn-secondary"
          onClick={() => setShowVideo(true)} disabled={!video}
        />

        <p className="faint small center" style={{ margin: '6px 4px 0' }}>ℹ️ {t('hubHint')}</p>
      </div>
    </div>
  );
}

function HubCard({ icon, iconBg, title, desc, cta, ctaClass, onClick, disabled }: {
  icon: string; iconBg: string; title: string; desc: string; cta: string; ctaClass: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <div className="card" style={{ opacity: disabled ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <span className="hub-icon" style={{ background: iconBg }}>{icon}</span>
        <span style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: '1.12rem' }}>{title}</p>
          <p className="dim small">{desc}</p>
        </span>
      </div>
      <button className={ctaClass} onClick={onClick} disabled={disabled}>{cta}{disabled ? '' : ' →'}</button>
    </div>
  );
}

/* ── The map: 30 missions in 5 phases ───────────────────────────────────── */

/** One mission row in the map. `badge` is the number (numbered journey) or an icon (special). */
function MissionCard({ mission, badge, special }: { mission: (typeof BOOTCAMP_PLAN)[number]; badge: string; special?: boolean }) {
  const bc = useBootcampStore();
  const built = mission.day in DAYS;
  const isDone = bc.completedDays.includes(mission.day);
  const resumable = (bc.stepIndex[String(mission.day)] ?? 0) > 0 && !isDone;
  const sub = isDone
    ? t('completed')
    : built
      ? special
        ? t('optionalMission')
        : resumable
          ? t('continueDay', { n: missionNumber(mission.day) ?? mission.day })
          : `${mission.minutes} ${t('min')} · ${L(mission.confidenceGain)}`
      : t('locked');
  return (
    <button
      className="game-card card-press"
      disabled={!built}
      style={built ? undefined : { opacity: 0.45 }}
      onClick={() => { tap(); bc.startDay(mission.day); }}
    >
      <span className="game-icon" style={{ background: isDone ? 'var(--good)' : special ? 'var(--accent)' : built ? 'var(--brand)' : 'var(--line)' }}>
        {isDone ? '✓' : badge}
      </span>
      <span>
        <p style={{ fontWeight: 800 }}>
          {L(mission.title)} {mission.checkpoint && <span className="badge badge-fading">{t('checkpointTag')}</span>}
        </p>
        <p className="dim small">{sub}</p>
      </span>
    </button>
  );
}

function MissionMap() {
  const app = useAppStore();
  const bc = useBootcampStore();
  // Progress counts the numbered journey only — the optional Recovery Toolkit doesn't gate it.
  const total = CORE_MISSIONS.length;
  const done = CORE_MISSIONS.filter((m) => bc.completedDays.includes(m.day)).length;
  return (
    <div className="screen">
      <div className="topbar">
        <h2 style={{ margin: 0 }}>{t('bootcamp')}</h2>
        <button className="btn-ghost" onClick={() => app.navigate('languages')} aria-label={t('settings')}>🌐</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="dim small">{t('missionsProgress', { done, total })}</span>
      </div>
      <div className="screen-scroll no-nav">
        <LangStrip />
        <AudioEnable />
        {PHASES.map((phase) => {
          const missions = CORE_MISSIONS.filter((m) => m.phase === phase.n);
          if (missions.length === 0) return null;
          return (
            <div key={phase.n}>
              <h3 style={{ margin: '14px 0 8px' }}>{phase.icon} {L(phase.title)}</h3>
              {missions.map((m) => (
                <MissionCard key={m.day} mission={m} badge={String(missionNumber(m.day))} />
              ))}
            </div>
          );
        })}
        {SPECIAL_MISSIONS.length > 0 && (
          <div>
            <h3 style={{ margin: '18px 0 8px' }}>🛟 {t('specialMissions')}</h3>
            {SPECIAL_MISSIONS.map((m) => (
              <MissionCard key={m.day} mission={m} badge="🛟" special />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AudioEnable() {
  const diag = useSyncExternalStore(subscribeAudioDiag, getAudioDiag, getAudioDiag);
  const [testing, setTesting] = useState(false);
  return (
    <button
      className="card card-press"
      style={{ width: '100%', textAlign: 'start', display: 'flex', alignItems: 'center', gap: 10, background: diag.unlocked ? 'var(--good-soft)' : 'var(--warn-soft)' }}
      onClick={async () => {
        unlockAudio();
        setTesting(true);
        await testAudio();
        setTesting(false);
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>{diag.unlocked ? '🔊' : '🔈'}</span>
      <span>
        <p style={{ fontWeight: 700 }}>{testing ? t('listenFirst') : diag.unlocked ? t('audioReady') : t('testAudioBtn')}</p>
        {!diag.unlocked && <p className="dim small">{t('audioHint')}</p>}
      </span>
    </button>
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

  return (
    <div className="screen">
      <CheckPop trigger={checkTrigger} />
      <div className="topbar">
        <button className="btn-ghost" onClick={back}>{t('back')}</button>
        <span className="chip">🎖️ {L(day.title)}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="progress-track" style={{ marginBottom: 10 }}>
        <div className="progress-fill brand" style={{ width: `${progress}%` }} />
      </div>
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
      <div className="fade-in" key={bc.index}>
        {step.kind === 'video' && <VideoStep video={video} mode={step.mode} onNext={advance} />}
        {step.kind === 'talk' && <TalkStep step={step} onNext={advance} />}
        {step.kind === 'tool' && <ToolStep step={step} item={itemsById.get(step.itemId)!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'quiz' && <QuizStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
        {step.kind === 'replies' && <RepliesStep step={step} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'swipe' && <SwipeStep itemIds={step.itemIds} itemsById={itemsById} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'dialogue' && <DialogueStep dialogue={day.dialogues[step.dialogueId]!} onDone={() => { pop(); advance(); }} />}
        {step.kind === 'ambush' && <AmbushStep step={step} itemsById={itemsById} onDone={(ok) => { if (ok) pop(); advance(); }} />}
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
 * Learn one sentence: hear it, then see + say it. Two beats only — Learn → Practice → Next.
 * The old third "I said it" screen (which just repeated the exact same sentence and made testers
 * think the app had frozen) is gone: saying it aloud and continuing now happen on one screen.
 */
function ToolStep({ step, item, onDone }: { step: Extract<BootcampStep, { kind: 'tool' }>; item: BootcampItem; onDone: () => void }) {
  const bc = useBootcampStore();
  const [phase, setPhase] = useState<'listen' | 'reveal'>('listen');
  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      void speak(item.text, 'en');
    }
  }, [item.text]);

  const reveal = (): void => {
    setPhase('reveal');
    void speak(item.text, 'en', 0.85); // hear it again, slowly, as you read it
  };

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{step.label ? L(step.label) : t('toolOf', { i: step.index, n: step.total })}</p>
        {phase === 'listen' ? (
          <>
            <p style={{ fontSize: '2.6rem' }}>👂</p>
            <p className="drill-meaning">{t('listenFirst')}</p>
          </>
        ) : (
          <>
            <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{item.text}</p>
            <p className="drill-meaning">{L(item.meaning)}</p>
            {item.tip && <p className="faint small">{L(item.tip)}</p>}
            <p className="faint small">🗣️ {t('sayItAloud')}</p>
          </>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en', phase === 'listen' ? 1 : 0.85)}>
          🔊 {t('hearAgain')}
        </button>
        {phase === 'listen'
          ? <button className="btn-primary" onClick={reveal}>{t('tapWhenReady')}</button>
          : <button className="btn-primary" onClick={() => { bc.recordDrill(item.id, 'echo', 'pass'); onDone(); }}>{t('continue')}</button>}
      </div>
    </>
  );
}

function QuizStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'quiz' }>; itemsById: Map<string, BootcampItem>; onDone: (ok: boolean) => void }) {
  const bc = useBootcampStore();
  const item = itemsById.get(step.itemId)!;
  const [options] = useState(() =>
    [item, ...step.wrongIds.map((id) => itemsById.get(id)!)]
      .map((i) => ({ id: i.id, label: L(i.meaning) }))
      .sort(() => Math.random() - 0.5),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const played = useRef(false);
  useEffect(() => {
    if (!played.current) {
      played.current = true;
      void speak(item.text, 'en');
    }
  }, [item.text]);

  // Answered — pause here. Explain, translate, replay freely, continue only on NEXT.
  if (picked !== null) {
    const ok = picked === item.id;
    return (
      <AnsweredView ok={ok} en={item.text} meaning={L(item.meaning)} tip={item.tip ? L(item.tip) : undefined}
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
            {o.label}
          </button>
        ))}
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en')}>🔊 {t('hearAgain')}</button>
      </div>
    </>
  );
}

/** Shared "you answered — now learn" surface: success/failure state, the correct answer
 *  highlighted, translation, unlimited replay, time to breathe, and a manual NEXT. */
function AnsweredView({ ok, en, meaning, tip, onNext }: { ok: boolean; en: string; meaning: string; tip?: string; onNext: () => void }) {
  return (
    <>
      <div className="drill-card pop-in" style={{ gap: 12, minHeight: 240 }}>
        <span className={`feedback-head ${ok ? 'ok' : 'bad'}`}>{ok ? `✓ ${t('correctHeader')}` : `✗ ${t('wrongHeader')}`}</span>
        <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>“{en}”</p>
        <p className="drill-label">{t('theMeaning')}</p>
        <p className="answer-pill">{meaning}</p>
        {tip && <p className="faint small">{tip}</p>}
        <p className="dim small">{ok ? t('whyRight') : t('whyWrong')}</p>
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speak(en, 'en')}>🔊 {t('hearAgain')}</button>
        <p className="faint small" style={{ textAlign: 'center' }}>{t('takeYourTime')}</p>
        <button className="btn-primary" onClick={onNext}>{t('nextBtn')}</button>
      </div>
    </>
  );
}

/** Expected Replies: "you said X — here's what they might answer." Comprehension-first. */
function RepliesStep({ step, itemsById, onDone }: { step: Extract<BootcampStep, { kind: 'replies' }>; itemsById: Map<string, BootcampItem>; onDone: () => void }) {
  const bc = useBootcampStore();
  const said = itemsById.get(step.saidItemId)!;
  const [idx, setIdx] = useState(-1); // -1 = intro
  const [picked, setPicked] = useState<string | null>(null);
  const reply = idx >= 0 ? itemsById.get(step.replyIds[idx] ?? '') : undefined;

  const options = useMemo(() => {
    if (!reply) return [];
    const wrongs = step.replyIds.filter((id) => id !== reply.id).slice(0, 2).map((id) => itemsById.get(id)!);
    return [reply, ...wrongs].map((i) => ({ id: i.id, label: L(i.meaning) })).sort(() => Math.random() - 0.5);
  }, [reply, step.replyIds, itemsById]);

  useEffect(() => {
    if (reply) void speak(reply.text, 'en');
  }, [reply]);

  if (idx === -1) {
    return (
      <>
        <div className="drill-card" style={{ gap: 10 }}>
          <p className="drill-label">{t('youSaid')}</p>
          <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>“{said.text}”</p>
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
    return (
      <AnsweredView ok={ok} en={reply.text} meaning={L(reply.meaning)} tip={reply.tip ? L(reply.tip) : undefined}
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
            {o.label}
          </button>
        ))}
        <button className="btn-ghost" onClick={() => void speak(reply.text, 'en')}>🔊 {t('hearAgain')}</button>
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
    if (item) void speak(item.text, 'en');
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
        <p className="drill-phrase" style={{ fontSize: '1.5rem' }}>{item.text}</p>
        <p className="drill-meaning">{L(item.meaning)}</p>
        {item.tip && <p className="faint small">{L(item.tip)}</p>}
      </div>
      <div className="action-zone">
        <button className="btn-ghost" onClick={() => void speak(item.text, 'en')}>🔊 {t('hearAgain')}</button>
        <button className="btn-primary" onClick={next}>{last ? t('continue') : t('nextBtn')}</button>
      </div>
    </>
  );
}

/** Visual-novel dialogue: ONE exchange on screen, choices branch, no transcript spoilers.
 *  Coaching mode (Mission 1): survival-tool badges, a "pick a way out" hint, and a pause after
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
      void speak(node.en, 'en', node.fast ? 1.08 : node.slow ? 0.75 : 0.95).then(() => {
        if (cancelled) return;
        if (node.end) {
          setTimeout(() => !cancelled && onDone(), 800);
        } else if (node.next) {
          setTimeout(() => !cancelled && setNodeId(node.next!), 700);
        }
      });
    } else if (node.who === 'you' && node.next && !node.choices) {
      // scripted you-line: the app voices it for you, then moves on
      setYourLine(node.en);
      void speak(node.en, 'en', 0.92).then(() => {
        if (!cancelled) setTimeout(() => setNodeId(node.next!), 500);
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
    const isTool = picked.itemId?.startsWith('en.phrase.recovery.') ?? false;
    const message = picked.coach ? L(picked.coach) : suits && isTool ? t('usedSurvivalTool') : suits ? t('goodMoveGeneric') : t('lessUsefulGeneric');
    return (
      <>
        <div className="drill-card pop-in" style={{ gap: 12, minHeight: 240 }}>
          <span style={{ fontWeight: 800, letterSpacing: '0.04em', color: suits ? 'var(--good)' : 'var(--warn)' }}>
            {suits ? `🛟 ${t('suitsHere')}` : t('lessUsefulHere')}
          </span>
          <p className="drill-phrase" style={{ fontSize: '1.3rem' }}>“{picked.en}”</p>
          <p className="drill-meaning">{message}</p>
        </div>
        <div className="action-zone">
          <button className="btn-primary" onClick={() => { const next = picked.next; setPicked(null); setNodeId(next); }}>{t('nextBtn')}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="drill-card" style={{ gap: 14, minHeight: 240 }}>
        <p className="drill-label">{t('yourTurn')}</p>
        {recovered && <p className="faint small fade-in">🛟 {t('niceRecovery')}</p>}
        {displayNpc && (
          <div className="fade-in" key={displayNpc.id}>
            <p style={{ fontSize: '1.9rem' }}>🧑‍🍳</p>
            <p className="drill-phrase" style={{ fontSize: '1.25rem' }}>“{displayNpc.en}”</p>
            <p className="dim small">{displayNpc.he}</p>
          </div>
        )}
        {yourLine && node.who !== 'you' && <p className="faint small">🫵 {yourLine}</p>}
      </div>
      <div className="action-zone">
        {node.who === 'you' && node.choices ? (
          <>
            {coaching && <p className="dim small" style={{ textAlign: 'center', marginBottom: 2 }}>{t('chooseToEscape')}</p>}
            {node.choices.map((c, i) => {
              const isTool = c.itemId?.startsWith('en.phrase.recovery.') ?? false;
              return (
                <button
                  key={i}
                  className="btn-secondary"
                  onClick={() => {
                    tap();
                    if (c.itemId) bc.recordDrill(c.itemId, 'simulator', c.correct ? 'pass' : 'partial');
                    setYourLine(c.en);
                    if (coaching) {
                      setPicked(c); // pause on a coaching card before branching
                      void speak(c.en, 'en', 0.92);
                    } else {
                      setRecovered(!c.correct);
                      void speak(c.en, 'en', 0.92).then(() => setNodeId(c.next));
                    }
                  }}
                >
                  {coaching && isTool && (
                    <span className="badge badge-ready" style={{ display: 'inline-flex', marginBottom: 6 }}>🛟 {t('survivalTool')}</span>
                  )}
                  <span style={{ display: 'block' }}>{c.en}</span>
                  <span className="dim small" style={{ display: 'block' }}>{c.he}</span>
                </button>
              );
            })}
          </>
        ) : (
          <button className="btn-ghost" onClick={() => displayNpc && void speak(displayNpc.en, 'en', 0.8)}>
            🐢 {t('playSlow')}
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
  const [order] = useState(() => (Math.random() > 0.5 ? [correct, wrong] : [wrong, correct]));

  // Answered — explain what they threw at you and the tool that beats it; continue on NEXT.
  if (picked !== null) {
    const ok = picked === correct.id;
    return (
      <AnsweredView ok={ok} en={correct.text} meaning={L(correct.meaning)} tip={correct.tip ? L(correct.tip) : undefined}
        onNext={() => onDone(ok)} />
    );
  }

  return (
    <>
      <div className="drill-card">
        <p className="drill-label">{t('fastOneComing')}</p>
        <p style={{ fontSize: '2.6rem' }}>⚡</p>
        {fired && <p className="faint small fade-in">“{step.npc.en}”</p>}
      </div>
      <div className="action-zone">
        {!fired ? (
          <button className="btn-primary" onClick={() => {
            setFired(true);
            shownAt.current = Date.now();
            void speak(step.npc.en, 'en', 1.12);
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
                🛟 {o.text}
              </button>
            ))}
            <button className="btn-ghost" onClick={() => void speak(step.npc.en, 'en', 0.85)}>🔊 {t('hearAgain')}</button>
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
  if (!day) return null;
  const receipts = bc.receipts.filter((r) => r.day === day.day);
  const convo = primaryDialogue(day);
  const video = day.introVideo;
  const nextBuilt = BOOTCAMP_PLAN.find((m) => m.day > day.day && m.day in DAYS && !m.special && !bc.completedDays.includes(m.day));

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
        <button className="btn-ghost" onClick={() => { cancelSpeech(); bc.toHub(); }}>{t('back')}</button>
        <span className="chip">{missionNumber(day.day) ? `${t('mission')} ${missionNumber(day.day)}` : '🛟'}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="screen-scroll no-nav">
        <div className="center" style={{ padding: '8px 0 4px' }}>
          <p className="pop-in" style={{ fontSize: '3.6rem' }}>🎉</p>
          <h1 style={{ marginTop: 4 }}>{t('victoryTitle')}</h1>
          <p className="drill-phrase" style={{ fontSize: '1.2rem', margin: '6px 0' }}>🎖️ {L(day.title)}</p>
          <p className="dim" style={{ maxWidth: 340, margin: '10px auto 0' }}>{t('victoryEmotional')}</p>
        </div>
        {receipts.length > 0 && (
          <div className="card card-sunken" style={{ marginTop: 16, textAlign: 'start' }}>
            <p className="dim small" style={{ marginBottom: 6 }}>{t('yourEvidence')}:</p>
            {receipts.map((r, i) => (
              <p key={i} className="small">🧾 {r.text}</p>
            ))}
          </div>
        )}
      </div>
      <div className="action-zone">
        <button className="btn-primary breathe" onClick={watch}>{t('watchFullConvo')}</button>
        {convo && <button className="btn-secondary" onClick={() => setShowReader(true)}>{t('openTranscript')}</button>}
        <button className="btn-secondary" onClick={() => bc.enterPractice()}>🎯 {t('practiceAgain')}</button>
        {nextBuilt && (
          <button className="btn-ghost" onClick={() => bc.startDay(nextBuilt.day)}>
            ▶ {t('nextMission', { title: L(nextBuilt.title) })}
          </button>
        )}
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
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const runToken = useRef(0);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cancel any speech + abort any play-all loop when the reader closes.
  useEffect(() => () => { runToken.current += 1; cancelSpeech(); }, []);

  // Keep the active line in view as playback (or stepping) moves through the sheet.
  useEffect(() => {
    lineRefs.current[current]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [current]);

  const stop = (): void => {
    runToken.current += 1; // invalidate any in-flight play-all loop
    setPlaying(false);
    cancelSpeech();
  };

  const playOne = (i: number): void => {
    stop();
    setCurrent(i);
    void speak(lines[i]!.en, 'en', 0.95);
  };

  const playAll = (from: number): void => {
    const token = ++runToken.current;
    setPlaying(true);
    void (async () => {
      for (let i = from; i < lines.length; i++) {
        if (token !== runToken.current) return; // paused / closed / stepped away
        setCurrent(i);
        await speak(lines[i]!.en, 'en', 0.95);
        if (token !== runToken.current) return;
        await new Promise((r) => setTimeout(r, 350)); // a beat between speakers
      }
      if (token === runToken.current) setPlaying(false);
    })();
  };

  const atStart = current <= 0;
  const atEnd = current >= lines.length - 1;

  return (
    <div className="reader">
      <div className="topbar">
        <button className="reader-back" onClick={() => { stop(); onClose(); }} aria-label={t('back')}>←</button>
        <span className="chip">📖 {t('fullConversationTitle')}</span>
        <span style={{ width: 52 }} />
      </div>
      <p className="dim small" style={{ margin: '0 0 8px' }}>{t('studySheetSub')} · {t('lineProgress', { i: current + 1, n: lines.length })}</p>
      <div className="reader-scroll">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            className={`dline ${line.who === 'you' ? 'you' : ''} ${i === current ? 'now' : ''}`}
          >
            <div className="dline-top">
              <span className="dline-speaker">{line.who === 'you' ? `🫵 ${t('speakerYou')}` : `🧑 ${t('speakerThem')}`}</span>
              <button className="dline-play" onClick={() => playOne(i)} aria-label={t('replay')}>🔊</button>
            </div>
            <p className="dline-en">{line.en}</p>
            <p className="dline-he">{line.he}</p>
          </div>
        ))}
      </div>
      <div className="reader-transport">
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => playOne(Math.max(0, current - 1))} disabled={atStart}>‹ {t('prevLine')}</button>
          <button className="btn-secondary" onClick={() => { setCurrent(0); playAll(0); }}>{t('restartConvo')}</button>
          <button className="btn-secondary" onClick={() => playOne(Math.min(lines.length - 1, current + 1))} disabled={atEnd}>{t('nextLine')} ›</button>
        </div>
        <button className="btn-primary" onClick={() => (playing ? stop() : playAll(current))}>
          {playing ? t('pausePlay') : t('playAll')}
        </button>
        {onFinish && (
          <button className="btn-secondary" onClick={() => { stop(); onFinish(); }}>✓ {t('finishToHub')}</button>
        )}
      </div>
    </div>
  );
}

/* ── Video-first intro / review ─────────────────────────────────────────── */

/** Native <video> with manual play (never autoplays with sound), inline on iOS, fullscreen
 *  allowed, replayable. A missing/broken file degrades to a friendly note — never crashes. */
function VideoPlayer({ video }: { video: BootcampVideo }) {
  const [failed, setFailed] = useState(false);
  if (failed || !video.src) return <p className="dim small" style={{ padding: '20px 0' }}>{t('videoUnavailable')}</p>;
  return (
    <video
      className="video-player"
      src={resolveAsset(video.src)}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      onError={() => setFailed(true)}
    />
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

/** Full-screen "Watch full conversation" overlay — reachable any time during the mission. */
function VideoOverlay({ video, onClose }: { video: BootcampVideo; onClose: () => void }) {
  return (
    <div className="reader">
      <div className="topbar">
        <button className="btn-ghost" onClick={onClose} aria-label={t('close')}>←</button>
        <span className="chip">🎬 {video.title ? L(video.title) : t('fullConversationTitle')}</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="reader-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <VideoPlayer video={video} />
      </div>
    </div>
  );
}
