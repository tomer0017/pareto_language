import { useAppStore } from '../../shared/stores/appStore.js';
import { L, t } from '../../shared/i18n/strings.js';
import { ChoiceCard } from '../../shared/ui/ChoiceCard.js';
import { PageHeader } from '../../shared/ui/PageHeader.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { useFoundationStore } from '../foundation/foundationStore.js';
import { ZERO_LANGS } from '../zerostart/types.js';

/**
 * Basic words — the fundamentals, one tap from Home. It owns NO content and NO progress: every row
 * opens a surface that already exists, exactly as it was reached before from the Situations screen:
 *
 *   🛟 Language foundations  the building blocks (I, you, questions, colours, numbers, time…) — the Foundation sheet
 *   💬 Sentence library      every sentence the situations teach, by topic (Introduce myself, Numbers & money…)
 *   📝 Words                 the core travel vocabulary — browse, hear, cards
 *   🌱 Start from zero       the guided path for a learner who knows no words yet
 *
 * Moving them here took the fundamentals out of the way of the 30 situations; the stores behind
 * them (Foundation progress, the review log, Zero Start progress) are the same ones, untouched.
 */

/** "Introduce Myself, Numbers & Money, Coffee Shop" — the first topics, read from the plan. */
export function firstTopics(n = 3): string {
  return BOOTCAMP_PLAN.slice(0, n).map((m) => L(m.title)).join(', ');
}

export function BasicWords() {
  const learningLang = useAppStore((s) => s.learningLang);
  const navigate = useAppStore((s) => s.navigate);
  const setCoreCategory = useAppStore((s) => s.setCoreCategory);
  const setCoreIntent = useAppStore((s) => s.setCoreIntent);
  const openFoundation = useFoundationStore((s) => s.openSheet);

  // The library opens on its own menu for the category, and its Back returns here.
  const library = (category: 'words' | 'phrases'): void => {
    setCoreCategory(category);
    setCoreIntent({ returnTo: 'basics' });
    navigate('core');
  };
  const zeroStart = (ZERO_LANGS as readonly string[]).includes(learningLang);

  return (
    <div className="screen screen-wide">
      <PageHeader title={t('basicsTitle')} sub={t('basicsSub')} onBack={() => navigate('home')} />
      <div className="screen-scroll">
        <div className="choice-list">
          <ChoiceCard id="foundations" icon="🛟" title={t('foundationEntryTitle')} sub={t('foundationEntryBody')} onSelect={() => openFoundation()} />
          <ChoiceCard id="phrases" icon="💬" tone="accent" title={t('phraseLibrary')} sub={t('basicsPhrasesSub', { topics: firstTopics() })} onSelect={() => library('phrases')} />
          <ChoiceCard id="words" icon="📝" tone="warn" title={t('homeLearnWords')} sub={t('homeLearnWordsSub')} onSelect={() => library('words')} />
          {zeroStart && <ChoiceCard id="zerostart" icon="🌱" tone="good" title={t('homeZeroStart')} sub={t('homeZeroStartSub')} onSelect={() => navigate('zerostart')} />}
        </div>
      </div>
    </div>
  );
}
