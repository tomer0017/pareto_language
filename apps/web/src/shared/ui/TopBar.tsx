import { t } from '../i18n/strings.js';
import { useAppStore, type View } from '../stores/appStore.js';

export function TopBar({ title, backTo = 'mission' }: { title: string; backTo?: View }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="topbar">
      <button className="btn-ghost" onClick={() => navigate(backTo)} aria-label={t('back')}>
        ←
      </button>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <span style={{ width: 44 }} />
    </div>
  );
}
