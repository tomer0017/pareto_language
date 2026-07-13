import { useEffect, useMemo, useState } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { cancelSpeech } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { Sheet } from '../../shared/ui/Sheet.js';
import { SpeakerButton } from '../../shared/ui/SpeakerButton.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { loadCoreWords, type CoreWord } from '../../shared/content/coreWords.js';
import { missionsFor } from '../bootcamp/bootcampStore.js';
import { buildFoundation, buildWord, type FoundationCategoryModel, type FoundationWord } from './foundationContent.js';
import { foundationProgress } from './foundationProgress.js';
import { useFoundationStore } from './foundationStore.js';

/**
 * Foundation sheet — ONE component renders every level from the data model (categories → word list →
 * word page); there is no per-category screen. It is the single shared word sheet: the 🛟 FAB opens
 * it on the category grid, and Universal Tap opens it straight to a tapped word's page (`store.target`).
 * Words come from the Core Corpus pack for the ACTIVE learning language, so English + French (and any
 * future pack) light up through one code path. Opening a word page marks the concept viewed (progress).
 */

type Level =
  | { level: 'categories' }
  | { level: 'words'; cat: FoundationCategoryModel }
  | { level: 'word'; word: FoundationWord; from: 'category' | 'tap'; cat: FoundationCategoryModel | null };

function Stars({ n }: { n: number }) {
  return (
    <span className="foundation-stars" aria-label={`${n}/5`}>
      {'★'.repeat(n)}
      <span className="foundation-stars-empty">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="foundation-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="foundation-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function FoundationSheet() {
  const open = useFoundationStore((s) => s.open);
  const target = useFoundationStore((s) => s.target);
  const close = useFoundationStore((s) => s.close);
  const viewed = useFoundationStore((s) => s.viewed);
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);

  const [words, setWords] = useState<CoreWord[] | null>(null);
  const [nav, setNav] = useState<Level>({ level: 'categories' });

  const missions = useMemo(() => missionsFor(learningLang), [learningLang]);

  // Load the active language's Core pack while open (cached across opens by loadCoreWords).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setWords(null);
    void loadCoreWords(learningLang).then((w) => { if (alive) setWords(w); });
    return () => { alive = false; };
  }, [open, learningLang]);

  // Each open: jump straight to a tapped word (Universal Tap), else the category grid. Closing stops audio.
  useEffect(() => {
    if (open) {
      setNav(target
        ? { level: 'word', word: buildWord(target, missions, uiLang, learningLang), from: 'tap', cat: null }
        : { level: 'categories' });
    } else {
      cancelSpeech();
    }
  }, [open, target, missions, uiLang, learningLang]);

  const model = useMemo(
    () => (words ? buildFoundation(words, missions, uiLang, learningLang) : []),
    [words, missions, uiLang, learningLang],
  );
  const progress = useMemo(() => foundationProgress(model, viewed), [model, viewed]);

  const back = () => {
    tap();
    cancelSpeech();
    setNav((n) => {
      if (n.level === 'word') return n.from === 'category' && n.cat ? { level: 'words', cat: n.cat } : { level: 'categories' };
      return { level: 'categories' };
    });
  };
  // A word opened via Universal Tap has no category context: back closes (returns to the lesson).
  const onBack = nav.level === 'word' && nav.from === 'tap' ? close : back;

  const title =
    nav.level === 'categories' ? t('foundationTitle')
    : nav.level === 'words' ? t(nav.cat.titleKey)
    : nav.word.display.primaryText;

  return (
    <Sheet open={open} onClose={close} labelledBy="foundation-title">
      <div className="sheet-header">
        {nav.level === 'categories'
          ? <span className="sheet-icon" aria-hidden>🛟</span>
          : <button className="sheet-back" onClick={onBack} aria-label={t('back')}>‹</button>}
        <h2 id="foundation-title" className="sheet-title">{title}</h2>
        <button className="sheet-close" onClick={() => { tap(); close(); }} aria-label={t('close')}>✕</button>
      </div>

      {nav.level === 'categories' && <p className="dim small sheet-sub">{t('foundationSubtitle')}</p>}

      <div className="sheet-body">
        {nav.level === 'word' ? (
          <WordPage word={nav.word} lang={learningLang} />
        ) : words === null ? (
          <p className="dim center" style={{ padding: '28px 0' }}>{t('loading')}</p>
        ) : model.length === 0 ? (
          <p className="dim center" style={{ padding: '28px 0' }}>{t('foundationEmpty')}</p>
        ) : nav.level === 'categories' ? (
          <>
            <div className="foundation-overall">
              <div className="foundation-overall-head">
                <span>{t('foundationProgress')}</span>
                <span className="foundation-overall-pct">{progress.overall.pct}%</span>
              </div>
              <Bar pct={progress.overall.pct} />
            </div>
            <div className="foundation-cats">
              {model.map((c) => {
                const p = progress.byCategory[c.id] ?? { id: c.id, viewed: 0, total: c.words.length, pct: 0 };
                return (
                  <button key={c.id} className="foundation-cat card-press" onClick={() => { tap(); setNav({ level: 'words', cat: c }); }}>
                    <span className="foundation-cat-icon" aria-hidden>{c.icon}</span>
                    <span className="foundation-cat-title">{t(c.titleKey)}</span>
                    <span className="foundation-cat-count dim">{p.viewed}/{p.total}</span>
                    <Bar pct={p.pct} />
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div>
            {nav.cat.words.map((w) => {
              const dm = w.display;
              const seen = viewed.has(w.conceptId);
              return (
                <div key={dm.contentId} className="foundation-word-row">
                  <button className="foundation-word-open" onClick={() => { tap(); setNav({ level: 'word', word: w, from: 'category', cat: nav.cat }); }}>
                    {seen && <span className="foundation-seen" aria-label={t('foundationViewed')}>✓</span>}
                    <span style={{ minWidth: 0 }}>
                      <span dir={dm.primaryDirection} className="foundation-word-target">{dm.primaryText}</span>
                      {dm.secondaryText && <span dir={dm.secondaryDirection} className="dim small foundation-word-gloss">{dm.secondaryText}</span>}
                    </span>
                  </button>
                  <SpeakerButton text={dm.audioText} lang={dm.audioLang} stop size={40} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}

function WordPage({ word, lang }: { word: FoundationWord; lang: string }) {
  const markViewed = useFoundationStore((s) => s.markViewed);
  const dm = word.display;
  // Opening a word page = "I looked at this brick" → count it toward progress (idempotent).
  useEffect(() => { markViewed(word.conceptId); }, [word.conceptId, markViewed]);

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
        <SpeakerButton text={dm.audioText} lang={lang} size={52} />
      </div>

      <div className="foundation-page-cat">
        {word.category
          ? <span className="foundation-chip"><span aria-hidden>{word.category.icon}</span> {t(word.category.titleKey)}</span>
          : <span className="foundation-chip">{word.corpusCategory}</span>}
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
