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
 * Foundation sheet — ONE component renders every mode from the data model, no per-category screen:
 *  • the 🛟 FAB opens the category grid (browse: categories → word list → word page);
 *  • Universal Tap opens straight to a tapped word's page (`store.target`, back returns to the lesson);
 *  • the mission "Learn now" opens a GUIDED mini-session (`store.session`) with a header, progress bar
 *    and Prev / Next / ✓ Back to Mission over EXACTLY the current mission's Foundation words.
 * It is the single shared word sheet; opening a word page marks the concept viewed (progress).
 */

type BrowseLevel =
  | { level: 'categories' }
  | { level: 'words'; cat: FoundationCategoryModel }
  | { level: 'word'; word: FoundationWord; cat: FoundationCategoryModel };

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
  const session = useFoundationStore((s) => s.session);
  const sessionGo = useFoundationStore((s) => s.sessionGo);
  const close = useFoundationStore((s) => s.close);
  const viewed = useFoundationStore((s) => s.viewed);
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);

  const [words, setWords] = useState<CoreWord[] | null>(null);
  const [browse, setBrowse] = useState<BrowseLevel>({ level: 'categories' });

  const missions = useMemo(() => missionsFor(learningLang), [learningLang]);

  // Load the active language's Core pack while open (cached across opens by loadCoreWords). Only the
  // browse (FAB) flow needs it; the guided session / single tap build straight from the tapped word.
  useEffect(() => {
    if (!open || target || session) return;
    let alive = true;
    setWords(null);
    void loadCoreWords(learningLang).then((w) => { if (alive) setWords(w); });
    return () => { alive = false; };
  }, [open, target, session, learningLang]);

  // Reset browse navigation each fresh browse open; stop audio on close.
  useEffect(() => {
    if (open && !target && !session) setBrowse({ level: 'categories' });
    if (!open) cancelSpeech();
  }, [open, target, session]);

  const model = useMemo(
    () => (words ? buildFoundation(words, missions, uiLang, learningLang) : []),
    [words, missions, uiLang, learningLang],
  );
  const progress = useMemo(() => foundationProgress(model, viewed), [model, viewed]);

  // Guided session word (store-driven) and single tapped word (store-driven).
  const sessionWord = useMemo(() => {
    const cw = session?.words[session.index];
    return cw ? buildWord(cw, missions, uiLang, learningLang) : null;
  }, [session, missions, uiLang, learningLang]);
  const tapWord = useMemo(
    () => (target ? buildWord(target, missions, uiLang, learningLang) : null),
    [target, missions, uiLang, learningLang],
  );

  const mode: 'session' | 'tap' | 'browse' = session ? 'session' : target ? 'tap' : 'browse';
  const onBrowseBack = () => {
    tap();
    cancelSpeech();
    setBrowse((n) => (n.level === 'word' ? { level: 'words', cat: n.cat } : { level: 'categories' }));
  };

  // Header: a word page NEVER repeats the word in the header (the big page title is the sole word).
  const showsIcon = mode === 'session' || (mode === 'browse' && browse.level === 'categories');
  const headerBack =
    mode === 'tap' ? close
    : mode === 'browse' && browse.level !== 'categories' ? onBrowseBack
    : null;
  const title =
    mode === 'session' ? t('foundationSessionTitle')
    : mode === 'browse' && browse.level === 'words' ? t(browse.cat.titleKey)
    : t('foundationTitle');

  return (
    <Sheet open={open} onClose={close} labelledBy="foundation-title">
      <div className="sheet-header">
        {showsIcon
          ? <span className="sheet-icon" aria-hidden>🛟</span>
          : <button className="sheet-back" onClick={headerBack ?? close} aria-label={t('back')}>‹</button>}
        <h2 id="foundation-title" className="sheet-title">{title}</h2>
        <button className="sheet-close" onClick={() => { tap(); close(); }} aria-label={t('close')}>✕</button>
      </div>

      {mode === 'browse' && browse.level === 'categories' && <p className="dim small sheet-sub">{t('foundationSubtitle')}</p>}

      <div className="sheet-body">
        {mode === 'session' && sessionWord && session ? (
          <>
            <div className="foundation-session-head">
              <span className="foundation-session-count">{t('foundationWordOf', { i: session.index + 1, n: session.words.length })}</span>
              <Bar pct={Math.round(((session.index + 1) / session.words.length) * 100)} />
            </div>
            <WordPage word={sessionWord} lang={learningLang} />
            <div className="foundation-session-nav">
              <button className="btn-ghost" disabled={session.index === 0} onClick={() => { tap(); cancelSpeech(); sessionGo(-1); }}>← {t('flashPrev')}</button>
              {session.index < session.words.length - 1
                ? <button className="btn-primary" style={{ flex: 1 }} onClick={() => { tap(); cancelSpeech(); sessionGo(1); }}>{t('flashNext')} →</button>
                : <button className="btn-primary" style={{ flex: 1 }} onClick={() => { tap(); close(); }}>✓ {t('foundationBackToMission')}</button>}
            </div>
          </>
        ) : mode === 'tap' && tapWord ? (
          <WordPage word={tapWord} lang={learningLang} />
        ) : words === null ? (
          <p className="dim center" style={{ padding: '28px 0' }}>{t('loading')}</p>
        ) : model.length === 0 ? (
          <p className="dim center" style={{ padding: '28px 0' }}>{t('foundationEmpty')}</p>
        ) : browse.level === 'word' ? (
          <WordPage word={browse.word} lang={learningLang} />
        ) : browse.level === 'categories' ? (
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
                  <button key={c.id} className="foundation-cat card-press" onClick={() => { tap(); setBrowse({ level: 'words', cat: c }); }}>
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
            {browse.cat.words.map((w) => {
              const dm = w.display;
              const seen = viewed.has(w.conceptId);
              return (
                <div key={dm.contentId} className="foundation-word-row">
                  <button className="foundation-word-open" onClick={() => { tap(); setBrowse({ level: 'word', word: w, cat: browse.cat }); }}>
                    {seen && <span className="foundation-seen" aria-label={t('foundationViewed')}>✓</span>}
                    <span style={{ minWidth: 0 }}>
                      <span dir={dm.primaryDirection} className="foundation-word-target">{dm.primaryText}</span>
                      {dm.secondaryText && dm.secondaryText !== dm.primaryText && <span dir={dm.secondaryDirection} className="dim small foundation-word-gloss">{dm.secondaryText}</span>}
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
  // The learner sees the word ONCE, as this clear page title — the gloss shows only when it adds meaning.
  const showGloss = !!dm.secondaryText && dm.secondaryText !== dm.primaryText;

  return (
    <div className="foundation-page">
      <div className="foundation-page-head">
        <div style={{ minWidth: 0 }}>
          <p dir={dm.primaryDirection} className="foundation-page-word">{dm.primaryText}</p>
          {showGloss && <p dir={dm.secondaryDirection} className="dim foundation-page-gloss">{dm.secondaryText}</p>}
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
          <div className="foundation-example">
            <div className="foundation-example-row">
              <p dir={dm.primaryDirection} className="foundation-example-target">{word.example.target}</p>
              <SpeakerButton text={word.example.target} lang={lang} size={36} stop />
            </div>
            {word.example.gloss && <p dir={dm.secondaryDirection} className="dim small foundation-example-gloss">{word.example.gloss}</p>}
          </div>
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
