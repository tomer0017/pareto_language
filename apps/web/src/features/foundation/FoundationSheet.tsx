import { useEffect, useMemo, useState } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { cancelSpeech, speak } from '../../shared/audio/tts.js';
import { sessionSeed } from '../../shared/util/shuffle.js';
import { tap } from '../../shared/ui/haptics.js';
import { Sheet } from '../../shared/ui/Sheet.js';
import { SpeakerButton } from '../../shared/ui/SpeakerButton.js';
import { IconButton } from '../../shared/ui/IconButton.js';
import { Icon } from '../../shared/ui/Icon.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { languageDirection } from '../../shared/i18n/languages.js';
import { loadCoreWords, type CoreWord } from '../../shared/content/coreWords.js';
import { alternateSenses, senseLabel } from './corpusIndex.js';
import { missionsFor } from '../bootcamp/bootcampStore.js';
import { buildFoundation, buildWord, type FoundationCategoryModel, type FoundationWord } from './foundationContent.js';
import { foundationProgress } from './foundationProgress.js';
import { useFoundationStore } from './foundationStore.js';
import { categoriesOf, swatchOf, tileOrder } from './foundationTiles.js';
import { FOUNDATION_TAXONOMY } from './taxonomy.js';

/**
 * Foundation sheet — ONE component renders every mode from the data model, no per-category screen:
 *  • the 🛟 FAB opens the category grid (browse: categories → word list → word page);
 *  • Universal Tap opens straight to a tapped word's page (`store.target`, back returns to the lesson);
 *  • the mission "Learn now" opens a GUIDED mini-session (`store.session`) with a header, progress bar
 *    and Prev / Next / ✓ Back to Mission over EXACTLY the current mission's Foundation words.
 * It is the single shared word sheet; opening a word page marks the concept viewed (progress).
 *
 * Browsing is built for a thumb: categories are tiles in two groups (the building blocks, then the
 * world — animals, colours, food…), and a category is a grid of tappable tiles — tap to HEAR the
 * word (and count it as seen), ⓘ for its page. Colour tiles are painted in their colour.
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
  const targetSurface = useFoundationStore((s) => s.targetSurface);
  const targetSenses = useFoundationStore((s) => s.targetSenses);
  const openWord = useFoundationStore((s) => s.openWord);
  const session = useFoundationStore((s) => s.session);
  const sessionGo = useFoundationStore((s) => s.sessionGo);
  const close = useFoundationStore((s) => s.close);
  const viewed = useFoundationStore((s) => s.viewed);
  const markViewed = useFoundationStore((s) => s.markViewed);
  const learningLang = useAppStore((s) => s.learningLang);
  const uiLang = useAppStore((s) => s.uiLang);

  const [words, setWords] = useState<CoreWord[] | null>(null);
  const [browse, setBrowse] = useState<BrowseLevel>({ level: 'categories' });
  // One tile order per visit to a category (lively, but never reshuffling under the thumb).
  const [seed, setSeed] = useState(sessionSeed);
  const [said, setSaid] = useState<string | null>(null); // the tile that is being heard right now

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
    () => (target ? buildWord(target, missions, uiLang, learningLang, targetSurface ?? undefined) : null),
    [target, targetSurface, missions, uiLang, learningLang],
  );
  // Homograph disambiguation: the tapped surface (e.g. "book") has more than one sense. Offer the
  // OTHER sense(s) as chips — each labelled with its OWN meaning (ספר / להזמין), not a generic
  // "other meaning" — so the learner reaches the sense they intended. Universal Tap is surface-only
  // and cannot infer part-of-speech from context, so it never silently guesses; it lets them choose.
  const otherSenses = useMemo(() => (target ? alternateSenses(target, targetSenses) : []), [target, targetSenses]);

  const mode: 'session' | 'tap' | 'browse' = session ? 'session' : target ? 'tap' : 'browse';
  const onBrowseBack = () => {
    tap();
    cancelSpeech();
    setSaid(null);
    setBrowse((n) => (n.level === 'word' ? { level: 'words', cat: n.cat } : { level: 'categories' }));
  };
  const openCategory = (cat: FoundationCategoryModel): void => { tap(); setSeed(sessionSeed()); setSaid(null); setBrowse({ level: 'words', cat }); };
  /** Tap a tile: hear the word, count it as seen, light the tile while it plays. */
  const hear = (w: FoundationWord): void => {
    tap();
    cancelSpeech();
    markViewed(w.conceptId);
    setSaid(w.conceptId);
    void speak(w.display.audioText, w.display.audioLang).then(() => setSaid((cur) => (cur === w.conceptId ? null : cur)));
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
          : <IconButton icon="‹" label={t('back')} className="sheet-back" variant="surface" size={40} onClick={headerBack ?? close} />}
        <h2 id="foundation-title" className="sheet-title">{title}</h2>
        <IconButton icon="✕" label={t('close')} className="sheet-close" variant="surface" size={40} onClick={close} />
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
              <button className="btn-ghost" disabled={session.index === 0} onClick={() => { tap(); cancelSpeech(); sessionGo(-1); }}><Icon name="chevron" size={16} className="icon-back" /> {t('flashPrev')}</button>
              {session.index < session.words.length - 1
                ? <button className="btn-primary" style={{ flex: 1 }} onClick={() => { tap(); cancelSpeech(); sessionGo(1); }}>{t('flashNext')} <Icon name="arrow" size={16} flip /></button>
                : <button className="btn-primary" style={{ flex: 1 }} onClick={() => { tap(); close(); }}>✓ {t('foundationBackToMission')}</button>}
            </div>
          </>
        ) : mode === 'tap' && tapWord ? (
          <>
            <WordPage word={tapWord} lang={learningLang} />
            {otherSenses.length > 0 && (
              <div className="foundation-senses">
                <span className="dim small foundation-senses-label">{t('foundationOtherMeaning')}</span>
                <div className="foundation-senses-chips">
                  {otherSenses.map((cw) => (
                    <button
                      key={cw.conceptId}
                      type="button"
                      className="foundation-sense-chip card-press"
                      onClick={() => { tap(); cancelSpeech(); openWord(cw, targetSurface ?? undefined, targetSenses ?? undefined); }}
                    >
                      <span className="foundation-sense-meaning" dir={languageDirection(uiLang)}>{senseLabel(cw, uiLang)}</span>
                      <span className="dim small foundation-sense-pos">{cw.pos}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
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
            {(['world', 'blocks'] as const).map((group) => {
              const cats = categoriesOf(model, FOUNDATION_TAXONOMY, group);
              if (cats.length === 0) return null;
              return (
                <section key={group} className={`foundation-group foundation-group-${group}`} aria-label={t(group === 'world' ? 'foundationGroupWorld' : 'foundationGroupBlocks')}>
                  <h3 className="foundation-group-title">{t(group === 'world' ? 'foundationGroupWorld' : 'foundationGroupBlocks')}</h3>
                  <p className="dim small foundation-group-sub">{t(group === 'world' ? 'foundationGroupWorldSub' : 'foundationGroupBlocksSub')}</p>
                  <div className="foundation-cats">
                    {cats.map((c) => {
                      const p = progress.byCategory[c.id] ?? { id: c.id, viewed: 0, total: c.words.length, pct: 0 };
                      return (
                        <button key={c.id} className={`foundation-cat card-press ${p.pct === 100 ? 'is-done' : ''}`} onClick={() => openCategory(c)} aria-label={`${t(c.titleKey)} · ${p.viewed}/${p.total}`}>
                          <span className="foundation-cat-icon" aria-hidden>{c.icon}</span>
                          <span className="foundation-cat-title">{t(c.titleKey)}</span>
                          <span className="foundation-cat-count dim">{p.pct === 100 ? '✓' : `${p.viewed}/${p.total}`}</span>
                          <Bar pct={p.pct} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </>
        ) : (
          <div className="foundation-tiles-wrap">
            <p className="dim small foundation-tiles-hint"><span aria-hidden>🔊</span> {t('foundationTileHint')} · {t('foundationWordsN', { n: browse.cat.words.length })}</p>
            <div className="foundation-tiles" role="list">
              {tileOrder(browse.cat.words, seed, viewed).map((w) => {
                const dm = w.display;
                const seen = viewed.has(w.conceptId);
                const swatch = swatchOf(w.conceptId);
                const playing = said === w.conceptId;
                return (
                  <div key={dm.contentId} role="listitem" className={`foundation-tile ${swatch ? 'is-color' : ''} ${seen ? 'is-seen' : ''} ${playing ? 'is-playing' : ''}`} style={swatch ? { background: swatch.bg, color: swatch.ink } : undefined}>
                    <button className="foundation-tile-hear" onClick={() => hear(w)} aria-label={`🔊 ${dm.primaryText}`}>
                      {!swatch && <span className="foundation-tile-emoji" aria-hidden>{dm.emoji ?? '✦'}</span>}
                      <span dir={dm.primaryDirection} className="foundation-tile-word">{dm.primaryText}</span>
                      {dm.secondaryText && dm.secondaryText !== dm.primaryText && <span dir={dm.secondaryDirection} className="foundation-tile-gloss">{dm.secondaryText}</span>}
                      <span className="foundation-tile-play" aria-hidden><Icon name={playing ? 'volume' : 'play'} size={14} /></span>
                    </button>
                    <button className="foundation-tile-info" onClick={() => { tap(); cancelSpeech(); setSaid(null); setBrowse({ level: 'word', word: w, cat: browse.cat }); }} aria-label={`${t('foundationTileDetails')}: ${dm.primaryText}`}>ⓘ</button>
                    {seen && <span className="foundation-tile-seen" aria-label={t('foundationViewed')}>✓</span>}
                  </div>
                );
              })}
            </div>
            <div className="foundation-tiles-fade" aria-hidden />
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
          {word.baseForm && <p dir={dm.primaryDirection} className="dim small foundation-page-base">{t('foundationBaseForm')}: {word.baseForm}</p>}
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

      {word.example && (word.example.target || word.example.gloss) && (
        <div className="foundation-section">
          <h3 className="foundation-section-title">{t('foundationExamples')}</h3>
          <div className="foundation-example">
            {word.example.target ? (
              <>
                <div className="foundation-example-row">
                  <p dir={dm.primaryDirection} className="foundation-example-target">{word.example.target}</p>
                  <SpeakerButton text={word.example.target} lang={lang} size={36} stop />
                </div>
                {word.example.gloss && <p dir={dm.secondaryDirection} className="dim small foundation-example-gloss">{word.example.gloss}</p>}
              </>
            ) : (
              // No target-language example yet — show the meaning in the learner's app language.
              <p dir={dm.secondaryDirection} className="foundation-example-target">{word.example.gloss}</p>
            )}
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
