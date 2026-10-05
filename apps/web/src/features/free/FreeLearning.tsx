import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { Icon } from '../../shared/ui/Icon.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { useFoundationStore } from '../foundation/foundationStore.js';

/**
 * Free learning — the second of READY's two obvious ways to learn (the first is the 30-mission
 * Journey). One screen whose only job is to put every self-directed tool one tap away:
 *
 *   word cards · sentence cards · word player · sentence player · stories · dialogues · foundations
 *
 * It owns nothing: each card opens a surface that already exists (the Core library's swipe cards and
 * players, Listen's playlists, Reading, the Foundation sheet) by handing it a one-shot intent.
 */
interface Entry { id: string; icon: string; title: string; sub: string; go: () => void }

export function FreeLearning() {
  const app = useAppStore();
  const openFoundation = useFoundationStore((s) => s.openSheet);

  const core = (category: 'words' | 'phrases', mode: 'wordCards' | 'wordPlayer' | 'sentenceCards' | 'sentenceList'): void => {
    app.setCoreCategory(category);
    app.setCoreIntent({ mode, returnTo: 'free' });
    app.navigate('core');
  };
  const listen = (category: 'phrases' | 'dialogues'): void => {
    app.setListenIntent(category);
    app.navigate('listen');
  };

  const entries: Entry[] = [
    { id: 'wordCards', icon: '🃏', title: t('freeWordCards'), sub: t('freeWordCardsSub'), go: () => core('words', 'wordCards') },
    { id: 'sentenceCards', icon: '🎴', title: t('freeSentenceCards'), sub: t('freeSentenceCardsSub'), go: () => core('phrases', 'sentenceCards') },
    { id: 'wordPlayer', icon: '🎧', title: t('freeWordPlayer'), sub: t('freeWordPlayerSub'), go: () => core('words', 'wordPlayer') },
    { id: 'sentencePlayer', icon: '📻', title: t('freeSentencePlayer'), sub: t('freeSentencePlayerSub'), go: () => listen('phrases') },
    { id: 'stories', icon: '📖', title: t('freeStories'), sub: t('freeStoriesSub'), go: () => app.navigate('reading') },
    { id: 'dialogues', icon: '💬', title: t('freeDialogues'), sub: t('freeDialoguesSub'), go: () => listen('dialogues') },
    { id: 'foundations', icon: '🛟', title: t('foundationTitle'), sub: t('foundationEntrySub'), go: () => openFoundation() },
  ];

  return (
    <div className="screen screen-wide">
      <div className="brand-top"><span className="brand-mark">READY <Icon name="plane" size={22} /></span></div>
      <LangStrip />
      <PageHeader title={t('freeLearningTitle')} sub={t('freeLearningSub')} icon={<Icon name="learn" />} />
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
