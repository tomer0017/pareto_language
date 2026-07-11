import { useEffect, useMemo, useState } from 'react';
import type { LocalizedText } from '@ready/content-schema';
import { L, t } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { loadCoreWords, toGameWords, coreCategories, type CoreWord } from '../../shared/content/coreWords.js';
import { PictureQuiz } from '../games/pictureQuiz/PictureQuiz.js';
import { SwipeRecall } from '../games/swipeRecall/SwipeRecall.js';

/**
 * Core Words (Part B) — the pilot's word-learning surface, backed by the REAL Core 100 (loaded
 * from the pipeline-generated, PWA-precached pack). One screen, one obvious next action: a small
 * menu of three modes — Browse · Picture Quiz · Swipe Recall — each opening a focused view.
 * Reuses the existing Core two-layer navigation (this renders inside the Core "Words" category).
 */
type Mode = 'menu' | 'browse' | 'quiz' | 'recall';

const CAT_LABEL: Record<string, LocalizedText> = {
  body: { en: 'Body', he: 'גוף' },
  food: { en: 'Food & drink', he: 'אוכל ושתייה' },
  animals: { en: 'Animals', he: 'חיות' },
  transport: { en: 'Transport', he: 'תחבורה' },
  places: { en: 'Places', he: 'מקומות' },
  objects: { en: 'Objects', he: 'חפצים' },
  clothing: { en: 'Clothing', he: 'ביגוד' },
  weather: { en: 'Weather', he: 'מזג אוויר' },
  health: { en: 'Health & emergency', he: 'בריאות וחירום' },
  nature: { en: 'Nature', he: 'טבע' },
  activities: { en: 'Activities', he: 'פעילויות' },
  people: { en: 'People & family', he: 'אנשים ומשפחה' },
  directions: { en: 'Directions', he: 'כיוונים' },
};

export function CoreWords() {
  const [words, setWords] = useState<CoreWord[] | null>(null);
  const [mode, setMode] = useState<Mode>('menu');
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => { void loadCoreWords().then(setWords); }, []);
  const gameWords = useMemo(() => (words ? toGameWords(words) : []), [words]);

  if (words === null) {
    return <div className="drill-card pop-in center" style={{ marginTop: 24 }}><p className="dim">{t('coreWordsLoading')}</p></div>;
  }
  if (words.length === 0) {
    return (
      <div className="drill-card pop-in center" style={{ marginTop: 24 }}>
        <p style={{ fontSize: '2.4rem' }}>📝</p>
        <p className="drill-meaning">{t('coreWordsEmpty')}</p>
      </div>
    );
  }

  if (mode === 'quiz') return <GameFrame onBack={() => setMode('menu')}><PictureQuiz words={gameWords} onDone={() => setMode('menu')} /></GameFrame>;
  if (mode === 'recall') return <GameFrame onBack={() => setMode('menu')}><SwipeRecall words={gameWords} onDone={() => setMode('menu')} /></GameFrame>;

  if (mode === 'browse') {
    const cats = coreCategories(words);
    const say = (w: CoreWord): void => { tap(); setPlaying(w.id); void speak(w.word, 'en').then(() => setPlaying((p) => (p === w.id ? null : p))); };
    return (
      <div style={{ marginTop: 8 }}>
        <button className="btn-ghost" onClick={() => setMode('menu')}>{t('back')}</button>
        {cats.map((cat) => (
          <div key={cat} style={{ marginTop: 12 }}>
            <h3 style={{ margin: '0 0 8px' }}>{L(CAT_LABEL[cat] ?? { en: cat })}</h3>
            {words.filter((w) => w.category === cat).map((w) => (
              <button
                key={w.id}
                className={`list-row card-press ${playing === w.id ? 'core-playing' : ''}`}
                style={{ width: '100%', textAlign: 'start', background: 'var(--card)', borderRadius: 'var(--r-md)', border: 'none', padding: '10px 14px', marginBottom: 8, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => say(w)}
              >
                <span style={{ fontSize: '1.8rem' }} aria-hidden>{w.emoji}</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{w.word}</span>
                  <span className="dim small" style={{ display: 'block' }}>{L(w.meaning)}</span>
                </span>
                <span className="core-play" aria-hidden>🔊</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // menu
  return (
    <div className="screen-scroll" style={{ paddingTop: 6 }}>
      <p className="dim" style={{ margin: '2px 0 12px' }}>{t('coreWordsPickMode', { n: words.length })}</p>
      <div className="home-actions stagger">
        <ModeCard icon="📖" title={t('browseWords')} sub={t('browseWordsSub', { n: words.length })} onClick={() => setMode('browse')} />
        <ModeCard icon="🖼️" title={t('gamePictureQuiz')} sub={t('gamePictureQuizSub')} onClick={() => setMode('quiz')} />
        <ModeCard icon="🔁" title={t('gameSwipeRecall')} sub={t('gameSwipeRecallSub')} onClick={() => setMode('recall')} />
      </div>
    </div>
  );
}

function ModeCard({ icon, title, sub, onClick }: { icon: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button className="game-card card-press" onClick={() => { tap(); onClick(); }}>
      <span className="game-icon" style={{ background: 'var(--brand)' }}>{icon}</span>
      <span style={{ textAlign: 'start' }}>
        <p style={{ fontWeight: 800 }}>{title}</p>
        <p className="dim small">{sub}</p>
      </span>
    </button>
  );
}

/** Focused game frame with a back-out that stops audio. Keeps games inside the Core screen. */
function GameFrame({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div style={{ marginTop: 8 }}>
      <button className="btn-ghost" onClick={onBack}>{t('back')}</button>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}
