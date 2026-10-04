import { useEffect, useMemo, useState } from 'react';
import { L } from '../../shared/i18n/strings.js';
import { languageInfo } from '../../shared/i18n/languages.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { success, tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { useBootcampStore } from '../bootcamp/bootcampStore.js';
import { artUrl, type ArtVariant } from './companionAssets.js';
import { COPY, STAGE_COPY } from './companionCopy.js';
import { learnedMaterial } from './companionLearned.js';
import {
  LAST_STAGE, STAGES, companionLine, evolutionTimeline, motionFamily, resolveAnimation, speechAbility,
  type CompanionAnimation, type CompanionStage, type EvolutionPhase, type StageProgress,
} from './companionModel.js';
import { useCompanion, useCompanionStore } from './companionStore.js';
import './companion.css';

/**
 * The Language Companion's screens and reusable pieces. Everything visual goes through
 * `CompanionAvatar`, so the artwork (and, later, real animation files) is swapped in one place.
 * The mascot appears at meaningful moments only — the Path card, its own page, the end of a
 * mission and an evolution — and never competes with learning content for attention.
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

export function CompanionAvatar({ stage, size = 64, variant = 'compact', anim = 'idle', silhouette = false, label, className = '' }: {
  stage: CompanionStage; size?: number; variant?: ArtVariant; anim?: CompanionAnimation; silhouette?: boolean; label?: string; className?: string;
}) {
  return (
    <span
      className={`cmp-art ${variant === 'full' ? 'is-full' : ''} ${silhouette ? 'is-silhouette' : ''} ${className}`}
      style={{ width: size, height: size }}
      data-stage={stage}
      data-anim={silhouette ? 'rest' : resolveAnimation(stage, anim)}
      data-family={motionFamily(stage)}
      role="img"
      aria-label={label ?? L(STAGE_COPY[stage].name)}
    >
      <img src={artUrl(stage, variant)} alt="" draggable={false} />
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

/** A speech bubble. A target-language line keeps its own direction inside a Hebrew screen. */
export function SpeechBubble({ speech, lang }: { speech: CompanionSpeech; lang: string }) {
  return (
    <span className="cmp-bubble">
      {speech.target ? <span dir="ltr" lang={lang}>{speech.text}</span> : speech.text}
    </span>
  );
}

/* ── reusable reaction ─────────────────────────────────────────────────────────────────────────── */

export type ReactionKind = 'correct' | 'encouraging' | 'thinking' | 'recovery' | 'celebrate' | 'missionComplete';
const REACTION_ANIM: Record<ReactionKind, CompanionAnimation> = {
  correct: 'correct', encouraging: 'encouraging', thinking: 'thinking', recovery: 'celebrate', celebrate: 'celebrate', missionComplete: 'missionComplete',
};

/**
 * A small mascot reaction: the current companion, one short animation, optionally one short line
 * in the app language. Never negative — a wrong answer gets a thinking face and encouragement, and
 * using a conversation-help tool is celebrated as the win it is. Drop it into any screen.
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
              : L(COPY.reactions.celebrate));
  return (
    <div className="cmp-reaction" data-kind={kind}>
      <CompanionAvatar stage={stage} size={size} anim={REACTION_ANIM[kind]} />
      {line && <span className="cmp-bubble">{line}</span>}
    </div>
  );
}

/* ── inside a mission ──────────────────────────────────────────────────────────────────────────── */

/**
 * The companion beside one short app-language line — the mission's goal, or how to play a game.
 * Compact by design (an avatar and a line). Until it can say whole phrases (Stages 1–3) the line is
 * a plain caption NEXT to the character — coaching about it, not speech by it; from the Young Parrot
 * on it is the character's own bubble.
 */
export function CompanionCoachView({ stage, line, size = 40 }: { stage: CompanionStage; line: string; size?: number }) {
  const voice = stage <= 3 ? 'caption' : 'bubble';
  return (
    <div className="cmp-coach" data-voice={voice}>
      <CompanionAvatar stage={stage} size={size} anim="attention" />
      <span className={voice === 'bubble' ? 'cmp-bubble' : 'cmp-caption'}>{line}</span>
    </div>
  );
}
export function CompanionCoach({ line, size }: { line: string; size?: number }) {
  const { stage } = useCompanion();
  return <CompanionCoachView stage={stage} line={line} size={size} />;
}

/* ── Path card ─────────────────────────────────────────────────────────────────────────────────── */

/** The companion on the Path, beside Trip Readiness. The percentage stays the readiness card's;
 *  this card is the character and its stage, and opens the companion page. */
export function CompanionCard() {
  const navigate = useAppStore((s) => s.navigate);
  const { lang, stage, progress } = useCompanion();
  const language = useLanguageName(lang);
  return <CompanionCardView stage={stage} pct={progress.pct} language={language} onOpen={() => { tap(); navigate('companion'); }} />;
}

export function CompanionCardView({ stage, pct, language, onOpen }: { stage: CompanionStage; pct: number; language: string; onOpen?: () => void }) {
  const progress = { pct };
  return (
    <button className="card card-press cmp-card" onClick={onOpen} aria-label={L(COPY.open)}>
      <CompanionAvatar stage={stage} size={60} />
      <span className="cmp-card-body">
        <strong>{L(STAGE_COPY[stage].name)}</strong>
        <span className="dim small">{L(COPY.cardTitle(language))} · {L(COPY.stageOf(stage))}</span>
        <span className="cmp-bar" aria-hidden><span style={{ width: `${progress.pct}%` }} /></span>
      </span>
      <Icon name="chevron" size={20} flip />
    </button>
  );
}

/* ── companion page ────────────────────────────────────────────────────────────────────────────── */

export function CompanionPage() {
  const navigate = useAppStore((s) => s.navigate);
  const { lang, stage, progress } = useCompanion();
  const language = useLanguageName(lang);
  const speech = useCompanionSpeech(stage, lang);
  return <CompanionPageView lang={lang} language={language} stage={stage} progress={progress} speech={speech} onBack={() => navigate('bootcamp')} />;
}

export function CompanionPageView({ lang, language, stage, progress, speech, onBack }: {
  lang: string; language: string; stage: CompanionStage; progress: StageProgress; speech: CompanionSpeech; onBack?: () => void;
}) {
  const copy = STAGE_COPY[stage];
  const next = progress.next;
  return (
    <div className="screen screen-wide">
      <PageHeader title={L(COPY.pageTitle)} sub={L(COPY.perLanguage(language))} onBack={onBack ?? (() => undefined)} />
      <div className="screen-scroll">
        <div className="card cmp-hero">
          <SpeechBubble speech={speech} lang={lang} />
          <CompanionAvatar stage={stage} size={220} variant="full" anim={stage === LAST_STAGE ? 'phone' : 'idle'} />
          <span className="chip">{L(COPY.stageOf(stage))}</span>
          <h2>{L(copy.name)}</h2>
          <p style={{ fontWeight: 700 }}>{L(copy.feeling)}</p>
          <p className="dim">{L(copy.meaning)}</p>
          <p className="faint small">{L(COPY.whatItSays)}: {L(copy.speech)}</p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          {next ? (
            <div className="cmp-next">
              <CompanionAvatar stage={next} size={72} silhouette label={L(COPY.nextStage)} />
              <div>
                <span className="dim small">{L(COPY.nextStage)}</span>
                <strong>{L(STAGE_COPY[next].name)}</strong>
                <span className="cmp-bar" role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.pct}%` }} /></span>
                <span className="faint small">{L(COPY.toNext(progress.pct))}</span>
                <span className="faint small">{L(next === LAST_STAGE ? COPY.beyondCore : COPY.howToGrow)}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontWeight: 700, textAlign: 'center' }}>{L(COPY.finalStage)}</p>
          )}
        </div>

        <div className="section-head"><h2>{L(COPY.journey)}</h2></div>
        <div className="card" style={{ padding: 12 }}>
          <div className="cmp-track">
            {STAGES.map((s) => {
              const reached = s <= stage;
              return (
                <div key={s} className={`cmp-stage ${s === stage ? 'is-current' : ''} ${reached ? '' : 'is-locked'}`}>
                  <CompanionAvatar stage={s} size={64} silhouette={!reached} anim="rest" />
                  <span className="cmp-num">{s === stage ? L(COPY.now) : s}</span>
                  <span className="cmp-name">{L(STAGE_COPY[s].name)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="section-head"><h2>{L(COPY.whyTitle)}</h2></div>
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p>{L(COPY.why)}</p>
          <p className="dim small">{L(COPY.notReadiness)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── evolution ─────────────────────────────────────────────────────────────────────────────────── */

/** The level-up moment: old character → anticipation → transformation → reveal → what changed.
 *  A tap anywhere skips the build-up; with reduced motion the new stage is simply shown. */
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
    if (phase === 'reveal') success();
  }, [phase]);

  const revealed = phase === 'reveal' || phase === 'done';
  return (
    <div className="cmp-evo" data-phase={phase} role="dialog" aria-modal="true" aria-label={L(COPY.levelUp)}>
      {!revealed && <button className="cmp-evo-skip" aria-label={L(COPY.continue)} onClick={() => setAt(timeline.length - 1)} />}
      <div className="cmp-evo-stage">
        <span className="cmp-evo-burst" aria-hidden />
        <CompanionAvatar stage={from} variant="full" size={260} anim="rest" className="cmp-evo-old" />
        <CompanionAvatar stage={to} variant="full" size={260} anim={phase === 'done' ? 'celebrate' : 'rest'} className="cmp-evo-new" />
      </div>
      <div className="cmp-evo-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span className="chip">{L(COPY.stageOf(to))}</span>
        <h1>{L(COPY.levelUp)}</h1>
        <p className="cmp-evo-became">{L(COPY.became(L(STAGE_COPY[from].name), L(STAGE_COPY[to].name)))}</p>
        <p className="cmp-evo-meaning">{L(STAGE_COPY[to].meaning)}</p>
        {revealed && <SpeechBubble speech={speech} lang={lang} />}
        {revealed && <button className="btn-primary" onClick={() => { tap(); onDone(); }}>{L(COPY.continue)}</button>}
      </div>
    </div>
  );
}

/**
 * Mounted once in the app shell. When the active language's companion has reached a stage the
 * learner has not seen yet, it takes over the screen with the evolution — once. Acknowledging it
 * is persisted, so a reload never replays it.
 */
export function CompanionHost() {
  const { lang, evolution } = useCompanion();
  const acknowledge = useCompanionStore((s) => s.acknowledge);
  if (!evolution) return null;
  return <CompanionEvolution key={`${lang}-${evolution.to}`} lang={lang} from={evolution.from} to={evolution.to} onDone={() => acknowledge(lang)} />;
}
