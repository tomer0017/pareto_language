import { useEffect, useMemo, useState } from 'react';
import type { LocalizedText } from '@ready/content-schema';
import { L, t } from '../../shared/i18n/strings.js';
import { resolveLearningItem } from '../../shared/i18n/display.js';
import { tap } from '../../shared/ui/haptics.js';
import { SpeakerButton } from '../../shared/ui/SpeakerButton.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { loadCoreWords, toGameWords, coreCategories, type CoreWord } from '../../shared/content/coreWords.js';
import { TappableWord } from '../foundation/TappableText.js';
import { PictureQuiz } from '../games/pictureQuiz/PictureQuiz.js';
import { SwipeRecall } from '../games/swipeRecall/SwipeRecall.js';
import { ListenPanel, type PlaybackItem } from '../../shared/playback/index.js';

/**
 * Core Words — the word-learning surface, backed by the REAL Core Corpus pack for the active
 * learning language (pipeline-generated, PWA-precached; 500 concepts today). One screen, one
 * obvious next action: Browse · Picture Quiz · Swipe Recall. Games receive only icon-eligible
 * words (unique emoji); non-visual words appear in Browse with a neutral bullet.
 */
type Mode = 'menu' | 'browse' | 'quiz' | 'recall' | 'listen';

const CAT_LABEL: Record<string, LocalizedText> = {
  glue: { en: 'Conversation glue', he: 'ביטויי שיחה' },
  questions: { en: 'Questions', he: 'שאלות' },
  pronouns: { en: 'Pronouns', he: 'כינויי גוף' },
  numbers: { en: 'Numbers', he: 'מספרים' },
  time: { en: 'Time', he: 'זמן' },
  colors: { en: 'Colors', he: 'צבעים' },
  body: { en: 'Body', he: 'גוף' },
  food: { en: 'Food & drink', he: 'אוכל ושתייה' },
  animals: { en: 'Animals', he: 'חיות' },
  transport: { en: 'Transport', he: 'תחבורה' },
  places: { en: 'Places', he: 'מקומות' },
  directions: { en: 'Directions', he: 'כיוונים' },
  money: { en: 'Money & shopping', he: 'כסף וקניות' },
  objects: { en: 'Objects', he: 'חפצים' },
  clothing: { en: 'Clothing', he: 'ביגוד' },
  home: { en: 'Room & home', he: 'חדר ובית' },
  technology: { en: 'Technology', he: 'טכנולוגיה' },
  health: { en: 'Health', he: 'בריאות' },
  emergency: { en: 'Emergency', he: 'חירום' },
  weather: { en: 'Weather', he: 'מזג אוויר' },
  nature: { en: 'Nature', he: 'טבע' },
  activities: { en: 'Activities', he: 'פעילויות' },
  actions: { en: 'Actions', he: 'פעלים' },
  descriptions: { en: 'Descriptions', he: 'תיאורים' },
  people: { en: 'People & family', he: 'אנשים ומשפחה' },
};

export function CoreWords() {
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);
  const setCoreGameActive = useAppStore((s) => s.setCoreGameActive);
  const [words, setWords] = useState<CoreWord[] | null>(null);
  const [mode, setMode] = useState<Mode>('menu');

  useEffect(() => { void loadCoreWords(learningLang).then(setWords); }, [learningLang]);
  // A game session is a focused, nav-less flow: hide the bottom nav so the game's fixed action zone
  // (Continue / Next) is reachable rather than covered by the higher-z nav (the Picture Quiz
  // "stuck on feedback" bug). Cleared when returning to the menu and on leaving Core entirely.
  useEffect(() => { setCoreGameActive(mode === 'quiz' || mode === 'recall' || mode === 'listen'); }, [mode, setCoreGameActive]);
  useEffect(() => () => setCoreGameActive(false), [setCoreGameActive]);
  const gameWords = useMemo(() => (words ? toGameWords(words) : []), [words]);
  // Parrot Mode items: reuse the ONE canonical display model (target + app-gloss + audio locale).
  const listenItems = useMemo<PlaybackItem[]>(() => (words ?? []).map((w) => {
    const dm = resolveLearningItem({ id: w.id, target: w.word, meaning: w.meaning, emoji: w.emoji }, uiLang, learningLang);
    return { id: dm.contentId, target: dm.audioText, targetLang: dm.audioLang, translation: dm.secondaryText, translationLang: uiLang, emoji: dm.emoji };
  }), [words, uiLang, learningLang]);

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

  if (mode === 'quiz') return <GameFrame onBack={() => setMode('menu')}><PictureQuiz words={gameWords} lang={learningLang} onExit={() => setMode('menu')} /></GameFrame>;
  if (mode === 'recall') return <GameFrame onBack={() => setMode('menu')}><SwipeRecall words={gameWords} lang={learningLang} onExit={() => setMode('menu')} /></GameFrame>;
  if (mode === 'listen') return <GameFrame onBack={() => setMode('menu')}><ListenPanel items={listenItems} bookmarkKey={`words:${learningLang}`} /></GameFrame>;

  if (mode === 'browse') {
    const cats = coreCategories(words);
    // One canonical display model per word (target + app-gloss + audio + directions + review id).
    const model = (w: CoreWord) => resolveLearningItem({ id: w.id, target: w.word, meaning: w.meaning, emoji: w.emoji }, uiLang, learningLang);
    return (
      <div style={{ marginTop: 8 }}>
        <button className="btn-ghost" onClick={() => setMode('menu')}>{t('back')}</button>
        {cats.map((cat) => (
          <div key={cat} style={{ marginTop: 12 }}>
            <h3 style={{ margin: '0 0 8px' }}>{L(CAT_LABEL[cat] ?? { en: cat })}</h3>
            {words.filter((w) => w.category === cat).map((w) => {
              const dm = model(w);
              return (
              <div
                key={dm.contentId}
                className="list-row"
                style={{ background: 'var(--card)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 8, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                {/* Universal Tap: the word opens the shared Foundation word sheet. */}
                <TappableWord word={w} className="core-word-open">
                  <span style={{ fontSize: '1.8rem', width: 34, textAlign: 'center' }} aria-hidden>{dm.emoji ?? '·'}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span dir={dm.primaryDirection} style={{ display: 'block', fontWeight: 700 }}>{dm.primaryText}</span>
                    <span dir={dm.secondaryDirection} className="dim small" style={{ display: 'block' }}>{dm.secondaryText}</span>
                  </span>
                </TappableWord>
                <SpeakerButton text={dm.audioText} lang={dm.audioLang} size={40} />
              </div>
              );
            })}
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
        <ModeCard icon="🎧" title={t('listenMode')} sub={t('listenModeSub')} onClick={() => setMode('listen')} />
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
