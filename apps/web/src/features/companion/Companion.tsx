import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { L } from '../../shared/i18n/strings.js';
import { languageInfo } from '../../shared/i18n/languages.js';
import { evolveChime } from '../../shared/audio/sfx.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { useBootcampStore } from '../bootcamp/bootcampStore.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { useTravelReadiness } from '../bootcamp/useReadiness.js';
import { artUrl, isTransparentArt, preloadStageArt, type ArtVariant } from './companionAssets.js';
import { presenceFor, type Presence } from './companionCoach.js';
import { COPY, STAGE_COPY } from './companionCopy.js';
import { learnedMaterial } from './companionLearned.js';
import {
  LAST_STAGE, companionLine, evolutionTimeline, motionFamily, resolveAnimation, speechAbility,
  type CompanionStage, type EvolutionPhase,
} from './companionModel.js';
import { MOOD_ANIMATION, MOOD_POSE, resolveMood, type CompanionMood } from './companionMood.js';
import { useCompanion, useCompanionStore } from './companionStore.js';
import './companion.css';

/**
 * The learner's language buddy: one living character that is with them on Home, on the Route,
 * inside a mission and when they finish one. Everything visual goes through `CompanionFigure`, so
 * the artwork (and, later, real animation files) is swapped in one place.
 *
 * The evolution is a DISCOVERY. No screen here names a stage, counts stages, or shows a form the
 * learner has not reached. The character is only ever "your buddy".
 */

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** The learning language's name in the app language ("ספרדית" / "Spanish"). */
export function languageLabel(lang: string): string {
  const info = languageInfo(lang);
  return info.names ? L(info.names) : info.name;
}
function useLanguageName(lang: string): string {
  useAppStore((s) => s.uiLang); // re-render when the app language changes
  return languageLabel(lang);
}

/* ── the character ─────────────────────────────────────────────────────────────────────────────── */

/**
 * The character itself — no frame, no circle, no badge. Its mood picks one of its own drawn poses
 * (waving, winning, celebrating, studying, sad, proud, cheering) and a short motion; the mood is
 * never written on screen. Only its own artwork is used — nothing is pasted beside it.
 */
export function CompanionFigure({ stage, size = 72, variant = 'compact', mood = 'idle', className = '' }: {
  stage: CompanionStage; size?: number; variant?: ArtVariant; mood?: CompanionMood; className?: string;
}) {
  const shown = resolveMood(stage, mood);
  return (
    <span
      className={`cmp-fig ${isTransparentArt(stage) ? 'is-clean' : ''} ${className}`}
      style={{ width: size, height: size }}
      data-stage={stage}
      data-mood={shown}
      data-anim={resolveAnimation(stage, MOOD_ANIMATION[shown])}
      data-family={motionFamily(stage)}
      role="img"
      aria-label={L(COPY.buddy)}
    >
      <img src={artUrl(stage, variant, undefined, MOOD_POSE[shown])} alt="" draggable={false} />
    </span>
  );
}

export interface CompanionSpeech { text: string; /** true = a target-language line the learner already learned */ target: boolean }

/** What the companion "says" at its stage: symbols for a fish, learned language for a parrot (pure). */
export function companionSpeech(stage: CompanionStage, lang: string, completedDays: readonly number[]): CompanionSpeech {
  const ability = speechAbility(stage);
  if (ability === 'none') return { text: '? ? ?', target: false };
  if (ability === 'listening') return { text: '👂 …', target: false };
  const line = companionLine(stage, learnedMaterial(lang, completedDays));
  if (line) return { text: line, target: true };
  return { text: ability === 'babble' ? 'b… b…' : '♪', target: false };
}
function useCompanionSpeech(stage: CompanionStage, lang: string): CompanionSpeech {
  const completedDays = useBootcampStore((s) => s.completedDays);
  return useMemo(() => companionSpeech(stage, lang, completedDays), [stage, lang, completedDays]);
}

/** How an app-language line is attached to the character: a creature that cannot talk yet THINKS it
 *  (a bubble trailing small bubbles); one that talks says it. Never a label, never a caption. */
export type BubbleVoice = 'thought' | 'speech';
export const bubbleVoice = (stage: CompanionStage): BubbleVoice => (stage <= 3 ? 'thought' : 'speech');

/** A bubble. A target-language line keeps its own direction inside a Hebrew screen. */
export function SpeechBubble({ speech, lang, voice = 'speech' }: { speech: CompanionSpeech; lang: string; voice?: BubbleVoice }) {
  return (
    <span className="cmp-bubble" data-voice={voice}>
      {speech.target ? <span dir="ltr" lang={lang}>{speech.text}</span> : speech.text}
    </span>
  );
}
function Bubble({ stage, children }: { stage: CompanionStage; children: ReactNode }) {
  return <span className="cmp-bubble" data-voice={bubbleVoice(stage)}>{children}</span>;
}

/* ── reusable reaction ─────────────────────────────────────────────────────────────────────────── */

export type ReactionKind = 'correct' | 'encouraging' | 'thinking' | 'recovery' | 'proud' | 'celebrate' | 'missionComplete';
const REACTION_MOOD: Record<ReactionKind, CompanionMood> = {
  correct: 'happy', encouraging: 'encouraging', thinking: 'thinking', recovery: 'recovery', proud: 'proud', celebrate: 'celebrating', missionComplete: 'missionComplete',
};

/**
 * The buddy reacting to something the learner did: one short gesture (well under a second),
 * optionally one short app-language line. A wrong answer gets its sad face WITH a supportive line —
 * it is on your side, never punishing — and using a conversation-help tool gets the crown, as the
 * smart move it is. Display only: it reads the companion and writes nothing.
 */
export function CompanionReaction({ kind, text, size = 56 }: { kind: ReactionKind; text?: string | false; size?: number }) {
  const { stage, companion } = useCompanion();
  return <CompanionReactionView kind={kind} stage={stage} seed={companion.points} text={text} size={size} />;
}

export function CompanionReactionView({ kind, stage, seed = 0, text, size = 56 }: { kind: ReactionKind; stage: CompanionStage; seed?: number; text?: string | false; size?: number }) {
  const line = text === false ? null
    : text ?? (kind === 'missionComplete' ? L(COPY.missionDone[seed % COPY.missionDone.length]!)
      : kind === 'correct' ? L(COPY.reactions.correct)
        : kind === 'encouraging' ? L(COPY.reactions.encouraging)
          : kind === 'thinking' ? L(COPY.reactions.thinking)
            : kind === 'recovery' ? L(COPY.reactions.recovery)
              : kind === 'proud' ? L(COPY.reactions.proud)
              : L(COPY.reactions.celebrate));
  return (
    <div className="cmp-reaction" data-kind={kind}>
      <CompanionFigure stage={stage} size={size} mood={REACTION_MOOD[kind]} />
      {line && <Bubble stage={stage}>{line}</Bubble>}
    </div>
  );
}

/** The buddy simply being there beside a screen — watching, listening. No line. */
export function CompanionWatch({ mood = 'listening', size = 52 }: { mood?: CompanionMood; size?: number }) {
  const { stage } = useCompanion();
  return <span className="cmp-watch"><CompanionFigure stage={stage} size={size} mood={mood} /></span>;
}

/* ── inside a mission ──────────────────────────────────────────────────────────────────────────── */

/** The buddy explaining something — how a game works, a hint: its studying pose + one bubble. */
export function CompanionCoachView({ stage, line, mood = 'teaching', size = 76 }: { stage: CompanionStage; line: string; mood?: CompanionMood; size?: number }) {
  return (
    <div className="cmp-coach">
      <CompanionFigure stage={stage} size={size} mood={mood} />
      <Bubble stage={stage}>{line}</Bubble>
    </div>
  );
}
export function CompanionCoach({ line, mood, size }: { line: string; mood?: CompanionMood; size?: number }) {
  const { stage } = useCompanion();
  return <CompanionCoachView stage={stage} line={line} mood={mood} size={size} />;
}

/**
 * The buddy opening a mission: large, cheering you on ("let's go"), with the goal in one bubble.
 * Only its own artwork — no emoji or prop is placed beside it.
 */
export function CompanionIntroView({ stage, line, mood = 'cheering', size = 168 }: { stage: CompanionStage; line: string; mood?: CompanionMood; size?: number }) {
  return (
    <div className="cmp-intro">
      <Bubble stage={stage}>{line}</Bubble>
      <CompanionFigure stage={stage} size={size} mood={mood} />
    </div>
  );
}
export function CompanionIntro({ line, mood }: { line: string; mood?: CompanionMood }) {
  const { stage } = useCompanion();
  return <CompanionIntroView stage={stage} line={line} mood={mood} />;
}

/** The very first hello (onboarding): the buddy waving, with one welcoming line. */
export function CompanionHello() {
  const { stage } = useCompanion();
  return <CompanionIntroView stage={stage} line={L(COPY.welcome)} mood="greeting" size={176} />;
}

/* ── Route + Home ──────────────────────────────────────────────────────────────────────────────── */

function usePresence(): Presence {
  const readiness = useTravelReadiness();
  return presenceFor({ done: readiness.ready, resume: readiness.nextIsResume, allDone: readiness.allDone });
}

/** The buddy on the Route: floating beside the path, saying one thing about where you are. It is a
 *  character, not a statistic — no name, no number, no bar. Tapping it opens its own page. */
export function CompanionPresence() {
  const navigate = useAppStore((s) => s.navigate);
  const { lang, stage } = useCompanion();
  const language = useLanguageName(lang);
  const presence = usePresence();
  return <CompanionPresenceView stage={stage} language={language} line={L(presence.line)} mood={presence.mood} onOpen={() => { tap(); navigate('companion'); }} />;
}

export function CompanionPresenceView({ stage, language, line, mood = 'greeting', onOpen }: { stage: CompanionStage; language: string; line: string; mood?: CompanionMood; onOpen?: () => void }) {
  return (
    <button className="cmp-presence card-press" onClick={onOpen} aria-label={L(COPY.open)}>
      <CompanionFigure stage={stage} size={112} mood={mood} />
      <span className="cmp-presence-body">
        <Bubble stage={stage}>{line}</Bubble>
        <span className="cmp-whose">{L(COPY.buddyFor(language))}</span>
      </span>
    </button>
  );
}

/** The same buddy on Home, peeking over the "next step" card. No line, no card of its own. */
export function CompanionPeek() {
  const navigate = useAppStore((s) => s.navigate);
  const { stage } = useCompanion();
  const presence = usePresence();
  // Beside the "start" button it cheers you on; with everything done it simply rests.
  return <CompanionPeekView stage={stage} mood={presence.mood === 'resting' ? 'resting' : 'cheering'} onOpen={() => { tap(); navigate('companion'); }} />;
}
export function CompanionPeekView({ stage, mood = 'cheering', onOpen }: { stage: CompanionStage; mood?: CompanionMood; onOpen?: () => void }) {
  return (
    <button className="cmp-peek" onClick={onOpen} aria-label={L(COPY.open)}>
      <CompanionFigure stage={stage} size={84} mood={mood} />
    </button>
  );
}

/* ── the buddy's own page ──────────────────────────────────────────────────────────────────────── */

/** Titles of the missions done in this language, most recent first. */
export function recentMilestones(completedDays: readonly number[], limit = 3): string[] {
  return [...completedDays].reverse().map((d) => BOOTCAMP_PLAN.find((m) => m.day === d)).filter((m) => m !== undefined).slice(0, limit).map((m) => L(m.title));
}

/** How close to its next change the buddy must be before the page lets on that something is up. */
const STIRRING_FROM_PCT = 75;

export function CompanionPage() {
  const navigate = useAppStore((s) => s.navigate);
  const { lang, stage, progress } = useCompanion();
  const language = useLanguageName(lang);
  const speech = useCompanionSpeech(stage, lang);
  const completedDays = useBootcampStore((s) => s.completedDays);
  const milestones = useMemo(() => recentMilestones(completedDays), [completedDays]);
  const stirring = progress.next !== null && progress.pct >= STIRRING_FROM_PCT;
  return <CompanionPageView lang={lang} language={language} stage={stage} stirring={stirring} speech={speech} milestones={milestones} onBack={() => navigate('bootcamp')} />;
}

/** A character page, not an evolution menu: who it is right now and what you have done together.
 *  At most a hint that something is stirring — never what, never when. */
export function CompanionPageView({ lang, language, stage, stirring = false, speech, milestones = [], onBack }: {
  lang: string; language: string; stage: CompanionStage; stirring?: boolean; speech: CompanionSpeech; milestones?: readonly string[]; onBack?: () => void;
}) {
  return (
    <div className="screen screen-wide">
      <PageHeader title={L(COPY.buddyFor(language))} onBack={onBack ?? (() => undefined)} />
      <div className="screen-scroll">
        <div className={`cmp-hero ${stirring ? 'is-stirring' : ''}`}>
          <SpeechBubble speech={speech} lang={lang} voice={speech.target ? 'speech' : 'thought'} />
          <CompanionFigure stage={stage} size={232} variant="full" mood={stage === LAST_STAGE ? 'talking' : 'idle'} />
          <p className="cmp-behaviour">{L(STAGE_COPY[stage].behaviour)}</p>
          {stirring && <p className="cmp-stirring">{L(COPY.stirring)}</p>}
        </div>

        <div className="section-head"><h2>{L(COPY.together)}</h2></div>
        <div className="card cmp-together">
          {milestones.length === 0 ? <p className="dim">{L(COPY.noMilestones)}</p> : (
            <ul>
              {milestones.map((title) => <li key={title}><span aria-hidden>✓</span>{title}</li>)}
            </ul>
          )}
        </div>

        <p className="cmp-note">{L(COPY.learnsWithYou)} {L(COPY.changes)}</p>
        <p className="cmp-note faint small">{L(COPY.perLanguage)}</p>
      </div>
    </div>
  );
}

/* ── the change ────────────────────────────────────────────────────────────────────────────────── */

/**
 * The moment the buddy changes: it pauses, light gathers, and a different creature is there. The
 * learner is told only that something changed — the new look is theirs to discover. A tap skips the
 * build-up; with reduced motion the new look is simply shown.
 */
export function CompanionEvolution({ lang, from, to, onDone }: { lang: string; from: CompanionStage; to: CompanionStage; onDone: () => void }) {
  const speech = useCompanionSpeech(to, lang);
  const timeline = useMemo(() => evolutionTimeline(prefersReducedMotion()), []);
  const [at, setAt] = useState(0);
  const phase: EvolutionPhase = timeline[at]!.phase;

  useEffect(() => {
    const step = timeline[at]!;
    if (step.phase === 'done') return;
    const id = setTimeout(() => setAt((i) => Math.min(i + 1, timeline.length - 1)), step.ms);
    return () => clearTimeout(id);
  }, [at, timeline]);
  useEffect(() => {
    if (phase === 'reveal') { success(); evolveChime(); }
  }, [phase]);

  const revealed = phase === 'reveal' || phase === 'done';
  return (
    <div className="cmp-evo" data-phase={phase} role="dialog" aria-modal="true" aria-label={L(COPY.changedTitle)}>
      {!revealed && <button className="cmp-evo-skip" aria-label={L(COPY.continue)} onClick={() => setAt(timeline.length - 1)} />}
      <div className="cmp-evo-stage">
        <span className="cmp-evo-burst" aria-hidden />
        <CompanionFigure stage={from} variant="full" size={260} mood="resting" className="cmp-evo-old" />
        <CompanionFigure stage={to} variant="full" size={260} mood={phase === 'done' ? 'celebrating' : 'resting'} className="cmp-evo-new" />
      </div>
      <div className="cmp-evo-text">
        <h1>{L(COPY.changedTitle)}</h1>
        <p className="cmp-evo-line">{L(COPY.changedLine)}</p>
        {revealed && <SpeechBubble speech={speech} lang={lang} voice={speech.target ? 'speech' : 'thought'} />}
        {revealed && <button className="btn-primary" onClick={() => { tap(); onDone(); }}>{L(COPY.continue)}</button>}
      </div>
    </div>
  );
}

/**
 * Mounted once in the app shell. When the active language's buddy has changed and the learner has
 * not seen it yet, it takes over the screen — once. Acknowledging it is persisted, so a reload
 * never replays it.
 */
export function CompanionHost() {
  const { lang, stage, evolution } = useCompanion();
  const acknowledge = useCompanionStore((s) => s.acknowledge);
  // Warm the CURRENT character's expressions (and only those) so reactions are instant and work offline.
  useEffect(() => { preloadStageArt(stage); }, [stage]);
  if (!evolution) return null;
  return <CompanionEvolution key={`${lang}-${evolution.to}`} lang={lang} from={evolution.from} to={evolution.to} onDone={() => acknowledge(lang)} />;
}
