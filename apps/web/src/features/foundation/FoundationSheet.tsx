import { useEffect, useMemo, useState } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { speak, cancelSpeech } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { Sheet } from '../../shared/ui/Sheet.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { loadCoreWords, type CoreWord } from '../../shared/content/coreWords.js';
import { missionsFor } from '../bootcamp/bootcampStore.js';
import { buildFoundation, type FoundationCategoryModel, type FoundationWord } from './foundationContent.js';
import { useFoundationStore } from './foundationStore.js';

/**
 * Foundation sheet — ONE component renders every level from the data model (categories → word list
 * → word page); there is no per-category screen. The words come from the Core Corpus pack for the
 * ACTIVE learning language (`loadCoreWords`), so English + French (and any future pack) light up
 * through the same code. Opening/closing is global (`foundationStore`); the level navigation below
 * is local state, reset each time the sheet opens.
 */

type Level =
  | { level: 'categories' }
  | { level: 'words'; cat: FoundationCategoryModel }
  | { level: 'word'; cat: FoundationCategoryModel; word: FoundationWord };

function Stars({ n }: { n: number }) {
  return (
    <span className="foundation-stars" aria-label={`${n}/5`}>
      {'★'.repeat(n)}
      <span className="foundation-stars-empty">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export function FoundationSheet() {
  const open = useFoundationStore((s) => s.open);
  const close = useFoundationStore((s) => s.close);
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);

  const [words, setWords] = useState<CoreWord[] | null>(null);
  const [nav, setNav] = useState<Level>({ level: 'categories' });
  const [playing, setPlaying] = useState<string | null>(null);

  // Load the active language's Core pack once open (cached across opens by loadCoreWords).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setWords(null);
    void loadCoreWords(learningLang).then((w) => { if (alive) setWords(w); });
    return () => { alive = false; };
  }, [open, learningLang]);

  // Reset internal navigation and audio each time the sheet opens/closes.
  useEffect(() => {
    if (open) setNav({ level: 'categories' });
    else { cancelSpeech(); setPlaying(null); }
  }, [open]);

  const model = useMemo(
    () => (words ? buildFoundation(words, missionsFor(learningLang), uiLang, learningLang) : []),
    [words, learningLang, uiLang],
  );

  const say = (w: FoundationWord) => {
    tap();
    const dm = w.display;
    setPlaying(dm.contentId);
    void speak(dm.audioText, dm.audioLang).then(() => setPlaying((p) => (p === dm.contentId ? null : p)));
  };

  const back = () => {
    tap();
    cancelSpeech();
    setPlaying(null);
    setNav((n) => (n.level === 'word' ? { level: 'words', cat: n.cat } : { level: 'categories' }));
  };

  const title =
    nav.level === 'categories' ? t('foundationTitle')
    : nav.level === 'words' ? t(nav.cat.titleKey)
    : nav.word.display.primaryText;

  return (
    <Sheet open={open} onClose={close} labelledBy="foundation-title">
      <div className="sheet-header">
        {nav.level === 'categories'
          ? <span className="sheet-icon" aria-hidden>🛟</span>
          : <button className="sheet-back" onClick={back} aria-label={t('back')}>‹</button>}
        <h2 id="foundation-title" className="sheet-title">{title}</h2>
        <button className="sheet-close" onClick={() => { tap(); close(); }} aria-label={t('close')}>✕</button>
      </div>

      {nav.level === 'categories' && <p className="dim small sheet-sub">{t('foundationSubtitle')}</p>}

      <div className="sheet-body">
        {words === null ? (
          <p className="dim center" style={{ padding: '28px 0' }}>{t('loading')}</p>
        ) : model.length === 0 ? (
          <p className="dim center" style={{ padding: '28px 0' }}>{t('foundationEmpty')}</p>
        ) : nav.level === 'categories' ? (
          <div className="foundation-cats">
            {model.map((c) => (
              <button key={c.id} className="foundation-cat card-press" onClick={() => { tap(); setNav({ level: 'words', cat: c }); }}>
                <span className="foundation-cat-icon" aria-hidden>{c.icon}</span>
                <span className="foundation-cat-title">{t(c.titleKey)}</span>
                <span className="foundation-cat-count dim">{c.words.length}</span>
              </button>
            ))}
          </div>
        ) : nav.level === 'words' ? (
          <div>
            {nav.cat.words.map((w) => {
              const dm = w.display;
              return (
                <button
                  key={dm.contentId}
                  className={`list-row card-press foundation-word-row ${playing === dm.contentId ? 'core-playing' : ''}`}
                  onClick={() => { tap(); setNav({ level: 'word', cat: nav.cat, word: w }); }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span dir={dm.primaryDirection} className="foundation-word-target">{dm.primaryText}</span>
                    {dm.secondaryText && <span dir={dm.secondaryDirection} className="dim small foundation-word-gloss">{dm.secondaryText}</span>}
                  </span>
                  <span className="foundation-word-say" onClick={(e) => { e.stopPropagation(); say(w); }} aria-label={t('play')}>🔊</span>
                </button>
              );
            })}
          </div>
        ) : (
          <WordPage word={nav.word} playing={playing === nav.word.display.contentId} onSay={() => say(nav.word)} />
        )}
      </div>
    </Sheet>
  );
}

function WordPage({ word, playing, onSay }: { word: FoundationWord; playing: boolean; onSay: () => void }) {
  const dm = word.display;
  return (
    <div className="foundation-page">
      <div className="foundation-page-head">
        <div style={{ minWidth: 0 }}>
          <p dir={dm.primaryDirection} className="foundation-page-word">{dm.primaryText}</p>
          {dm.secondaryText && <p dir={dm.secondaryDirection} className="dim foundation-page-gloss">{dm.secondaryText}</p>}
          <span className="foundation-page-freq">
            <Stars n={word.stars} />
            {word.stars === 5 && <span className="foundation-essential">{t('foundationEssential')}</span>}
          </span>
        </div>
        <button className={`foundation-audio ${playing ? 'core-playing' : ''}`} onClick={onSay} aria-label={t('play')}>🔊</button>
      </div>

      {word.example && (
        <div className="foundation-section">
          <h3 className="foundation-section-title">{t('foundationExamples')}</h3>
          <p className="foundation-example">{word.example}</p>
        </div>
      )}

      {word.relatedMissions.length > 0 && (
        <div className="foundation-section">
          <h3 className="foundation-section-title">{t('foundationAppearsIn')}</h3>
          <div className="foundation-chips">
            {word.relatedMissions.map((m) => (
              <span key={m.day} className="foundation-chip">
                {m.number !== null && <b>{m.number}</b>} {m.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
