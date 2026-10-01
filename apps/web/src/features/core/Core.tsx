import { useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t, type StringKey } from '../../shared/i18n/strings.js';
import { resolveLearningItem } from '../../shared/i18n/display.js';
import { tap } from '../../shared/ui/haptics.js';
import { SpeakerButton } from '../../shared/ui/SpeakerButton.js';
import { TappableText } from '../foundation/TappableText.js';
import { CoreWords } from './CoreWords.js';
import { SentenceFlashcards } from './SentenceFlashcards.js';
import { missionNumber } from '../bootcamp/plan.js';
import type { BootcampItem } from '../bootcamp/types.js';
import { BackButton } from '../../shared/ui/PageHeader.js';
import { buildPhraseGroups } from './phraseGroups.js';

/**
 * The library — a SECONDARY surface under Learn: the words and the sentences the missions teach, to
 * browse, hear and review. It is not a destination of its own (the missions are the product; this is
 * support). Sentences are grouped exactly as `buildPhraseGroups` orders them — mission by mission,
 * with the shared conversation-help phrases last. Passive listening lives in the Listen tab.
 */
interface Group { title: string; items: BootcampItem[] }

type CoreTab = 'phrases' | 'words' | 'patterns' | 'questions' | 'emergency' | 'favorites';

// Pilot Learning Hub: only the two finished surfaces are exposed in production. Emergency, Common
// Questions (FAQ), Core Templates/Patterns and Favorites are temporarily removed from the UI (their
// implementation stays for a future release — the `else` branch below still renders them if reached).
const TABS: { id: CoreTab; key: StringKey }[] = [
  { id: 'words', key: 'coreTabWords' },
  { id: 'phrases', key: 'coreTabPhrases' },
];

/** Sentence groups for the active learning language, titled for display. */
function buildGroups(lang: string): Group[] {
  return buildPhraseGroups(lang).map((g) => ({
    title: g.mission ? `${t('mission')} ${missionNumber(g.mission.day) ?? g.mission.day} · ${L(g.mission.title)}` : t('survivalKit'),
    items: g.items,
  }));
}

export function Core() {
  const app = useAppStore();
  // Opened from Learn with a category; defaults to the sentences.
  const category = (app.coreCategory as CoreTab | null) ?? 'phrases';
  const groups = useMemo(() => buildGroups(app.learningLang), [app.learningLang]);
  // Sentences entry: three cards (Listen · Flashcards · View All). 'entry' is the default landing.
  const [phrasesView, setPhrasesView] = useState<'entry' | 'flashcards' | 'list'>('entry');
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  // One canonical display model per phrase (target + app-gloss + audio + directions + review id).
  const model = (item: BootcampItem) => resolveLearningItem({ id: item.id, target: item.text, meaning: item.meaning }, app.uiLang, app.learningLang);
  const backToLearn = (): void => { app.setCoreCategory(null); app.navigate('bootcamp'); };

  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <div className="topbar" style={{ marginBottom: 6 }}>
          <BackButton onBack={backToLearn} />
          <h2 style={{ margin: 0 }}>{category === 'words' ? t('coreTabWords') : t('phraseLibrary')}</h2>
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
          ) : phrasesView === 'entry' ? (
            // Square cards — pick how to review sentences.
            <div className="home-actions stagger" style={{ marginTop: 8 }}>
              <button className="action-card card-press" onClick={() => { tap(); app.navigate('listen'); }}>
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
