import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { useFoundationStore } from '../foundation/foundationStore.js';
import { useSentenceProgress } from '../core/useSentenceProgress.js';

/**
 * Games & stories (Free learning) — free, fun practice, one tap from Home. One screen whose only job
 * is to put every self-directed tool one tap away:
 *
 *   word cards · sentence cards · word player · sentence player · stories · dialogues · foundations
 *
 * plus, first, a Quick review of sentences the learner has really practiced — shown only when there
 * is something to refresh (an empty, disabled card is noise). It owns nothing: each card opens a surface that already exists (the Core library's swipe cards and
 * players, the Listening hub's sentences / situations, Reading, the Foundation sheet) by handing it a
 * one-shot intent — and every one of them comes back here on Back.
 */
interface Entry { id: string; icon: string; title: string; sub: string; go: () => void }

export function FreeLearning() {
  const app = useAppStore();
  const openFoundation = useFoundationStore((s) => s.openSheet);
  const reviewCount = useSentenceProgress().reviewCards.length;

  const core = (category: 'words' | 'phrases', mode: 'wordCards' | 'wordPlayer' | 'sentenceCards' | 'sentenceList'): void => {
    app.setCoreCategory(category);
    app.setCoreIntent({ mode, returnTo: 'free' });
    app.navigate('core');
  };
  const listen = (mode: 'sentences' | 'situations'): void => {
    app.setListenPage({ mode, play: null, returnTo: 'free' });
    app.navigate('listen');
  };
  const stories = (): void => {
    app.setReadingIntent({ returnTo: 'free' });
    app.navigate('reading');
  };

  const entries: Entry[] = [
    ...(reviewCount > 0 ? [{ id: 'review', icon: '🔁', title: t('quickReviewTitle'), sub: reviewCount === 1 ? t('quickReviewSubOne') : t('quickReviewSub', { n: reviewCount }), go: () => app.navigate('review') }] : []),
    { id: 'wordCards', icon: '🃏', title: t('freeWordCards'), sub: t('freeWordCardsSub'), go: () => core('words', 'wordCards') },
    { id: 'sentenceCards', icon: '🎴', title: t('freeSentenceCards'), sub: t('freeSentenceCardsSub'), go: () => core('phrases', 'sentenceCards') },
    { id: 'wordPlayer', icon: '🎧', title: t('freeWordPlayer'), sub: t('freeWordPlayerSub'), go: () => core('words', 'wordPlayer') },
    { id: 'sentencePlayer', icon: '📻', title: t('freeSentencePlayer'), sub: t('freeSentencePlayerSub'), go: () => listen('sentences') },
    { id: 'stories', icon: '📖', title: t('freeStories'), sub: t('freeStoriesSub'), go: stories },
    { id: 'dialogues', icon: '💬', title: t('freeDialogues'), sub: t('freeDialoguesSub'), go: () => listen('situations') },
    { id: 'foundations', icon: '🛟', title: t('foundationTitle'), sub: t('foundationEntrySub'), go: () => openFoundation() },
  ];

  return (
    <div className="screen screen-wide">
      <PageHeader title={t('freeLearningTitle')} sub={t('freeLearningSub')} onBack={() => app.navigate('home')} />
      <div className="screen-scroll">
        <div className="home-actions free-grid stagger" role="list">
          {entries.map((e) => (
            <button key={e.id} role="listitem" className={`action-card card-press free-card free-${e.id}`} data-free={e.id} onClick={() => { tap(); e.go(); }}>
              <span className="action-icon" aria-hidden>{e.icon}</span>
              <span className="action-title">{e.title}</span>
              <span className="action-sub">{e.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
