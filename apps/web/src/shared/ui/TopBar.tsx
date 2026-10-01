import { useAppStore, type View } from '../stores/appStore.js';
import { BackButton } from './PageHeader.js';

/** A focused screen's top bar: the shared back control, a centred title, a balancing spacer. */
export function TopBar({ title, backTo = 'mission' }: { title: string; backTo?: View }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="topbar">
      <BackButton onBack={() => navigate(backTo)} />
      <h2 style={{ margin: 0 }}>{title}</h2>
      <span style={{ width: 44 }} />
    </div>
  );
}
