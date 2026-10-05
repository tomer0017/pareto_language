import { useEffect, useState } from 'react';
import { Modal, ModalActions } from '../../shared/ui/Modal.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { useFoundationStore } from './foundationStore.js';
import { hasOnboardedFoundation, markOnboardedFoundation } from './foundationCoach.js';

/**
 * One-time Foundation introduction, shown the first time the learner reaches the Journey for a
 * learning language: what the building blocks are and where they live (the Foundations row here,
 * and Free learning). "Open" shows them right away; "Later" just closes. Either way it is marked
 * seen for this language (the existing `foundationCoach` bookkeeping) and never shown again — the
 * Foundations stay reachable by hand from the Journey and from Free learning.
 */
export function FoundationOnboarding() {
  const learningLang = useAppStore((s) => s.learningLang);
  const openSheet = useFoundationStore((s) => s.openSheet);
  const [show, setShow] = useState(false);

  useEffect(() => { setShow(!hasOnboardedFoundation(learningLang)); }, [learningLang]);

  if (!show) return null;
  const done = (open: boolean): void => {
    tap();
    markOnboardedFoundation(learningLang);
    setShow(false);
    if (open) openSheet();
  };

  return (
    <Modal icon="🛟" title={t('foundationOnboardTitle')} body={t('foundationOnboardBody')} onClose={() => done(false)}>
      <ModalActions>
        <button className="btn-primary" onClick={() => done(true)}>{t('foundationOnboardOpen')}</button>
        <button className="btn-ghost" onClick={() => done(false)}>{t('foundationOnboardLater')}</button>
      </ModalActions>
    </Modal>
  );
}
