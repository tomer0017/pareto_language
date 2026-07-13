import { useEffect, useState } from 'react';
import { Modal, ModalActions } from '../../shared/ui/Modal.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { useFoundationStore } from './foundationStore.js';
import { hasOnboardedFoundation, markOnboardedFoundation } from './foundationCoach.js';

/**
 * One-time Foundation introduction. Shown the first time the learner reaches the Bootcamp (the map
 * where the 🛟 button lives) for a given learning language. After "Got it" it pulses the FAB so the
 * learner sees exactly where their building blocks live. Shown once per language, dismissal persisted.
 */
export function FoundationOnboarding() {
  const learningLang = useAppStore((s) => s.learningLang);
  const firePulse = useFoundationStore((s) => s.firePulse);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasOnboardedFoundation(learningLang)) setShow(true);
  }, [learningLang]);

  if (!show) return null;
  const dismiss = () => {
    tap();
    markOnboardedFoundation(learningLang);
    setShow(false);
    firePulse();
  };

  return (
    <Modal icon="🛟" title={t('foundationOnboardTitle')} body={t('foundationOnboardBody')} onClose={dismiss}>
      <ModalActions>
        <button className="btn-primary" onClick={dismiss}>{t('foundationOnboardCta')}</button>
      </ModalActions>
    </Modal>
  );
}
