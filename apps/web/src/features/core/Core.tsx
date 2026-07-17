import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t, type StringKey } from '../../shared/i18n/strings.js';
import { resolveLearningItem } from '../../shared/i18n/display.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { SpeakerButton } from '../../shared/ui/SpeakerButton.js';
import { TappableText } from '../foundation/TappableText.js';
import { CoreWords } from './CoreWords.js';
import { SentenceFlashcards } from './SentenceFlashcards.js';
import { ListenPanel, type PlaybackItem } from '../../shared/playback/index.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionsFor } from '../bootcamp/bootcampStore.js';
import type { BootcampItem } from '../bootcamp/types.js';

/**
 * Core — the travel knowledge center. Navigation is two layers (Task 3): first a grid of
 * category cards, then (once a category is picked) the existing tabbed page with its top tabs and
 * content. The picked category lives in appStore (`coreCategory`) so Home's cards can deep-link
 * straight into a category, and the Core bottom-nav tab resets it to the card grid. Only "Core
 * Phrases" carries content today; the rest are honest "coming soon". Content is unchanged.
 */
interface Group { title: string; items: BootcampItem[] }

type CoreTab = 'phrases' | 'words' | 'patterns' | 'questions' | 'emergency' | 'favorites';

const TABS: { id: CoreTab; key: StringKey }[] = [
  { id: 'phrases', key: 'coreTabPhrases' },
  { id: 'words', key: 'coreTabWords' },
  { id: 'patterns', key: 'coreTabPatterns' },
  { id: 'questions', key: 'coreTabQuestions' },
  { id: 'emergency', key: 'coreTabEmergency' },
  { id: 'favorites', key: 'coreTabFavorites' },
];

const CATEGORIES: { id: CoreTab; key: StringKey; icon: string }[] = [
  { id: 'phrases', key: 'coreTabPhrases', icon: '📖' },
  { id: 'words', key: 'coreTabWords', icon: '📝' },
  { id: 'questions', key: 'coreTabQuestions', icon: '❓' },
  { id: 'emergency', key: 'coreTabEmergency', icon: '🚨' },
  { id: 'patterns', key: 'coreTabPatterns', icon: '🧩' },
  { id: 'favorites', key: 'coreTabFavorites', icon: '⭐' },
];

/** Every phrase READY teaches IN THE ACTIVE LEARNING LANGUAGE, grouped by mission (root-cause fix
 *  for the French Core-Phrases leak): sourced from that language's own missions, never English. The
 *  survival kit = the recovery tools the language teaches (deduped). Language-agnostic id matching
 *  (`.phrase.recovery.`) so it works for `en.*`, `fr.*`, and any future language. */
function buildGroups(lang: string): Group[] {
  const missions = missionsFor(lang);
  const seen = new Set<string>();
  const recovery: BootcampItem[] = [];
  for (const m of BOOTCAMP_PLAN) {
    const day = missions[m.day];
    if (!day) continue;
    for (const i of day.items) {
      if (i.id.includes('.phrase.recovery.') && !seen.has(i.id)) { seen.add(i.id); recovery.push(i); }
    }
  }
  const groups: Group[] = recovery.length ? [{ title: t('survivalKit'), items: recovery }] : [];
  for (const m of BOOTCAMP_PLAN) {
    const day = missions[m.day];
    if (!day) continue;
    const items = day.items.filter((i) => !seen.has(i.id) && !i.id.includes('.phrase.recovery.'));
    for (const i of items) seen.add(i.id);
    if (items.length) groups.push({ title: `${t('mission')} ${m.day} · ${L(m.title)}`, items });
  }
  return groups;
}

export function Core() {
  const app = useAppStore();
  const category = app.coreCategory as CoreTab | null;
  const groups = useMemo(() => buildGroups(app.learningLang), [app.learningLang]);
  // Core Sentences entry: three cards (Listen · Flashcards · View All). 'entry' is the default landing.
  const [phrasesView, setPhrasesView] = useState<'entry' | 'listen' | 'flashcards' | 'list'>('entry');
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  // One canonical display model per phrase (target + app-gloss + audio + directions + review id).
  const model = (item: BootcampItem) => resolveLearningItem({ id: item.id, target: item.text, meaning: item.meaning }, app.uiLang, app.learningLang);

  // Parrot Mode items: every taught sentence, in mission order, reusing the same display model.
  const listenItems = useMemo<PlaybackItem[]>(() => groups.flatMap((g) => g.items.map((item) => {
    const dm = model(item);
    return { id: dm.contentId, target: dm.audioText, targetLang: dm.audioLang, translation: dm.secondaryText, translationLang: app.uiLang } satisfies PlaybackItem;
  })), [groups, app.uiLang, app.learningLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Layer 1 — the category cards.
  if (!category) {
    return (
      <div className="screen">
        <div style={{ padding: '6px 0 2px' }}>
          <LangStrip />
          <h1>{t('coreTitle')}</h1>
          <p className="dim" style={{ marginTop: 4 }}>{t('corePickCategory')}</p>
        </div>
        <div className="screen-scroll">
          <div className="home-actions stagger">
            {CATEGORIES.map((c) => (
              <button key={c.id} className="action-card card-press" onClick={() => { tap(); app.setCoreCategory(c.id); }}>
                <span className="action-icon">{c.icon}</span>
                <span className="action-title">{t(c.key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Layer 2 — the existing tabbed page, opened on the chosen category.
  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <div className="topbar" style={{ marginBottom: 6 }}>
          <button className="btn-ghost" onClick={() => { tap(); app.setCoreCategory(null); }}>{t('back')}</button>
          <h2 style={{ margin: 0 }}>{t('coreTitle')}</h2>
          <span style={{ width: 44 }} />
        </div>
        <p className="dim" style={{ marginTop: 2 }}>{category === 'phrases' ? t('coreSub', { n: total }) : t('coreCenterSub')}</p>
      </div>
      <div className="core-tabs" role="tablist">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={category === tb.id}
            className={`core-tab ${category === tb.id ? 'active' : ''}`}
            onClick={() => { tap(); app.setCoreCategory(tb.id); }}
          >
            {t(tb.key)}
          </button>
        ))}
      </div>
      <div className="screen-scroll">
        {category === 'words' ? (
          <CoreWords />
        ) : category === 'phrases' ? (
          phrasesView === 'flashcards' ? (
            <SentenceFlashcards onBack={() => setPhrasesView('entry')} />
          ) : phrasesView === 'listen' ? (
            <>
              <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => { tap(); setPhrasesView('entry'); }}>{t('back')}</button>
              <ListenPanel items={listenItems} />
            </>
          ) : phrasesView === 'entry' ? (
            // Square cards — pick how to review sentences.
            <div className="home-actions stagger" style={{ marginTop: 8 }}>
              <button className="action-card card-press" onClick={() => { tap(); setPhrasesView('listen'); }}>
                <span className="action-icon">🎧</span>
                <span className="action-title">{t('listenMode')}</span>
              </button>
              <button className="action-card card-press" onClick={() => { tap(); setPhrasesView('flashcards'); }}>
                <span className="action-icon">🎴</span>
                <span className="action-title">{t('coreSentenceFlashcards')}</span>
              </button>
              <button className="action-card card-press" onClick={() => { tap(); setPhrasesView('list'); }}>
                <span className="action-icon">📋</span>
                <span className="action-title">{t('coreViewAllSentences')}</span>
              </button>
            </div>
          ) : (
          <>
            <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => { tap(); setPhrasesView('entry'); }}>{t('back')}</button>
            {groups.map((g) => (
              <div key={g.title} style={{ marginTop: 14 }}>
                <h3 style={{ margin: '0 0 8px' }}>{g.title}</h3>
                {g.items.map((item) => {
                  const dm = model(item);
                  return (
                  <div
                    key={dm.contentId}
                    className="list-row"
                    style={{ background: 'var(--card)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 8, boxShadow: 'var(--shadow-card)' }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span dir={dm.primaryDirection} style={{ display: 'block', fontWeight: 700 }}>
                        <TappableText text={dm.primaryText} lang={dm.audioLang} />
                      </span>
                      <span dir={dm.secondaryDirection} className="dim small" style={{ display: 'block' }}>{dm.secondaryText}</span>
                    </span>
                    <SpeakerButton text={dm.audioText} lang={dm.audioLang} size={40} />
                  </div>
                  );
                })}
              </div>
            ))}
          </>
          )
        ) : (
          <div className="drill-card pop-in center" style={{ marginTop: 24 }}>
            <p style={{ fontSize: '2.4rem' }}>🚧</p>
            <p className="drill-phrase" style={{ fontSize: '1.2rem' }}>{t(TABS.find((x) => x.id === category)!.key)}</p>
            <p className="drill-meaning">{t('coreTabComingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
