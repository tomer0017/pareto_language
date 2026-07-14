import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { resolveLearningItem } from '../../shared/i18n/display.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { sessionSeed } from '../../shared/util/shuffle.js';
import { SwipeOnboarding } from '../../shared/ui/SwipeOnboarding.js';
import { GestureCard, type GestureCardHandle } from '../../shared/ui/GestureCard.js';
import { TappableText } from '../foundation/TappableText.js';
import { buildSentenceDeck, shuffledDeck, nextIndex, type FlashDirection } from './flashcards.js';

/**
 * Sentence Flashcards (Part 2) — flip-card review over the canonical mission sentences. Uses the SAME
 * gesture/animation shell as the word flashcards (shared `GestureCard`): TAP to flip, SWIPE left/right
 * (or ←/→ buttons) to move, shuffle, direction toggle. Only the SEMANTICS differ (flip-review, no
 * self-grading — the intentional design for sentence review). Audio uses the ONE centralized
 * `speak(text, learningLang)`, auto-plays on every card change (listening-first), and cancels the
 * previous utterance first. Navigation is pure (`nextIndex`). No content lives here; it comes from the deck.
 */
export function SentenceFlashcards({ onBack }: { onBack: () => void }) {
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);
  const [seed, setSeed] = useState(sessionSeed);
  const base = useMemo(() => buildSentenceDeck(learningLang), [learningLang]);
  const deck = useMemo(() => shuffledDeck(base, seed), [base, seed]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<FlashDirection>('target-first');
  const [playing, setPlaying] = useState(false);
  const deckRef = useRef<GestureCardHandle>(null);

  const card = deck[i];
  const model = useMemo(
    () => (card ? resolveLearningItem({ id: card.id, target: card.target, meaning: card.meaning }, uiLang, learningLang) : null),
    [card, uiLang, learningLang],
  );

  // Auto-play the sentence on every card change (and shuffle) — listening-first. Cancels any prior
  // utterance first, so changing cards always stops the previous audio. Runs after a user gesture
  // (opening the deck / swipe / next) so browser autoplay policies are satisfied.
  useEffect(() => {
    if (!model) return;
    cancelSpeech();
    setPlaying(true);
    let live = true;
    void speak(model.audioText, model.audioLang).then(() => { if (live) setPlaying(false); });
    return () => { live = false; cancelSpeech(); };
  }, [model]);

  if (base.length === 0 || !card || !model) {
    return (
      <div style={{ marginTop: 8 }}>
        <button className="btn-ghost" onClick={onBack}>{t('back')}</button>
        <div className="drill-card pop-in center" style={{ marginTop: 24 }}>
          <p style={{ fontSize: '2.4rem' }}>🎴</p>
          <p className="drill-meaning">{t('flashcardsEmpty')}</p>
        </div>
      </div>
    );
  }

  const replay = (): void => {
    tap();
    cancelSpeech();
    setPlaying(true);
    void speak(model.audioText, model.audioLang).then(() => setPlaying(false));
  };
  const go = (delta: number): void => {
    setFlipped(false);
    setI((n) => nextIndex(n, delta, deck.length)); // cancel + replay handled by the card-change effect
  };
  const reshuffle = (): void => { setFlipped(false); setI(0); setSeed(sessionSeed()); };
  const toggleDirection = (): void => { setFlipped(false); setDirection((d) => (d === 'target-first' ? 'meaning-first' : 'target-first')); };

  // Front shows one side; flip reveals the other. target-first = comprehension; meaning-first = recall.
  const showTargetOnFront = direction === 'target-first';
  const front = showTargetOnFront
    ? { text: model.primaryText, dir: model.primaryDirection }
    : { text: model.secondaryText, dir: model.secondaryDirection };
  const backSide = showTargetOnFront
    ? { text: model.secondaryText, dir: model.secondaryDirection }
    : { text: model.primaryText, dir: model.primaryDirection };

  return (
    <div style={{ marginTop: 8 }}>
      <SwipeOnboarding variant="sentences" />
      <div className="topbar" style={{ marginBottom: 6 }}>
        <button className="btn-ghost" onClick={() => { cancelSpeech(); onBack(); }}>{t('back')}</button>
        <span className="chip">🎴 {i + 1} / {deck.length}</span>
        <button className="btn-ghost" onClick={toggleDirection}>{direction === 'target-first' ? t('flashDirComprehension') : t('flashDirRecall')}</button>
      </div>
      <div className="progress-track" style={{ marginBottom: 12 }}>
        <div className="progress-fill brand" style={{ width: `${((i + 1) / deck.length) * 100}%` }} />
      </div>

      {/* Same shared shell as the word cards — SWIPE left = next / right = prev, TAP = flip. */}
      <GestureCard
        ref={deckRef}
        dealKey={i}
        className="drill-card card-press"
        style={{ width: '100%', minHeight: 200, gap: 12 }}
        ariaLabel={front.text}
        onTap={() => setFlipped((f) => !f)}
        onCommit={(dir) => go(dir === 'left' ? 1 : -1)}
      >
        <p dir={front.dir} className="drill-phrase" style={{ fontSize: '1.6rem' }}>
          {showTargetOnFront && front.text ? <TappableText text={front.text} lang={learningLang} /> : front.text}
        </p>
        {flipped ? (
          <p dir={backSide.dir} className="drill-meaning pop-in" style={{ fontSize: '1.15rem' }}>
            {!showTargetOnFront && backSide.text ? <TappableText text={backSide.text} lang={learningLang} /> : backSide.text}
          </p>
        ) : (
          <p className="faint small">{t('flashTapToFlip')}</p>
        )}
      </GestureCard>

      <div className="action-zone" style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className={`btn-ghost ${playing ? 'core-playing' : ''}`} onClick={replay}>🔊 {t('replayAudio')}</button>
        <button className="btn-ghost" onClick={reshuffle}>🔀 {t('flashShuffle')}</button>
      </div>
      <div className="action-zone" style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => deckRef.current?.commit('right')}>← {t('flashPrev')}</button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => deckRef.current?.commit('left')}>{t('flashNext')} →</button>
      </div>
    </div>
  );
}
