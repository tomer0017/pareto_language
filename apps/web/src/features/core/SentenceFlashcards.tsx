import { useMemo, useState } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { resolveLearningItem } from '../../shared/i18n/display.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { sessionSeed } from '../../shared/util/shuffle.js';
import { buildSentenceDeck, shuffledDeck, type FlashDirection } from './flashcards.js';

/**
 * Sentence Flashcards (Part 2) — flip-card review over the canonical mission sentences. Shuffled per
 * session (Part 3); flip to reveal; replay audio; next/prev; toggle direction (comprehension vs
 * recognition). Uses `resolveLearningItem` so the target/gloss/audio-locale all match the active
 * languages — an English-UI learner reads English glosses, a Hebrew-UI learner reads Hebrew, and the
 * audio always speaks the LEARNING language. No content lives here; it all comes from the deck.
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

  const card = deck[i];
  const model = useMemo(
    () => (card ? resolveLearningItem({ id: card.id, target: card.target, meaning: card.meaning }, uiLang, learningLang) : null),
    [card, uiLang, learningLang],
  );

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

  const say = (): void => {
    tap();
    setPlaying(true);
    void speak(model.audioText, model.audioLang).then(() => setPlaying(false));
  };
  const go = (delta: number): void => {
    cancelSpeech();
    setFlipped(false);
    setI((n) => (n + delta + deck.length) % deck.length);
  };
  const reshuffle = (): void => { cancelSpeech(); setFlipped(false); setI(0); setSeed(sessionSeed()); };
  const toggleDirection = (): void => { cancelSpeech(); setFlipped(false); setDirection((d) => (d === 'target-first' ? 'meaning-first' : 'target-first')); };

  // Front shows one side; flip reveals the other. In target-first the front is the learning-language
  // sentence (comprehension); in meaning-first the front is the gloss (recall the useful sentence).
  const showTargetOnFront = direction === 'target-first';
  const front = showTargetOnFront
    ? { text: model.primaryText, dir: model.primaryDirection }
    : { text: model.secondaryText, dir: model.secondaryDirection };
  const backSide = showTargetOnFront
    ? { text: model.secondaryText, dir: model.secondaryDirection }
    : { text: model.primaryText, dir: model.primaryDirection };

  return (
    <div style={{ marginTop: 8 }}>
      <div className="topbar" style={{ marginBottom: 6 }}>
        <button className="btn-ghost" onClick={() => { cancelSpeech(); onBack(); }}>{t('back')}</button>
        <span className="chip">🎴 {i + 1} / {deck.length}</span>
        <button className="btn-ghost" onClick={toggleDirection}>{direction === 'target-first' ? t('flashDirComprehension') : t('flashDirRecall')}</button>
      </div>
      <div className="progress-track" style={{ marginBottom: 12 }}>
        <div className="progress-fill brand" style={{ width: `${((i + 1) / deck.length) * 100}%` }} />
      </div>

      <button
        className="drill-card card-press"
        style={{ width: '100%', minHeight: 200, cursor: 'pointer', gap: 12 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <p dir={front.dir} className="drill-phrase" style={{ fontSize: '1.6rem' }}>{front.text}</p>
        {flipped ? (
          <p dir={backSide.dir} className="drill-meaning pop-in" style={{ fontSize: '1.15rem' }}>{backSide.text}</p>
        ) : (
          <p className="faint small">{t('flashTapToFlip')}</p>
        )}
      </button>

      <div className="action-zone" style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className={`btn-ghost ${playing ? 'core-playing' : ''}`} onClick={say}>🔊 {t('replay')}</button>
        <button className="btn-ghost" onClick={reshuffle}>🔀 {t('flashShuffle')}</button>
      </div>
      <div className="action-zone" style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => go(-1)}>← {t('flashPrev')}</button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => go(1)}>{t('flashNext')} →</button>
      </div>
    </div>
  );
}
