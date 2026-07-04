import { useAppStore } from '../stores/appStore.js';

export function TopBar({ title, backTo = 'home' as const }: { title: string; backTo?: 'home' }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <div className="topbar">
      <button className="btn-ghost" onClick={() => navigate(backTo)} aria-label="Back">
        ← Back
      </button>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <span style={{ width: 64 }} />
    </div>
  );
}
