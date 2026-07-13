import { useSyncExternalStore, useState } from 'react';
import { getDataDiag, subscribeDataDiag } from '../data/dataDiag.js';
import { DEV_BADGE_ANCHOR } from './devOverlay.js';

/**
 * Dev-only data-source diagnostics (Sprint 8). Makes it obvious at a glance whether content is
 * coming from the API (Mongo), the IndexedDB cache, or the static public fallback — and why the
 * app fell back if it did. Rendered only under import.meta.env.DEV, inside its own ErrorBoundary.
 */
const SOURCE_LABEL: Record<string, string> = {
  api: 'API (Mongo)',
  'idb-cache': 'IndexedDB cache',
  static: 'static public',
};

export function DataDebug() {
  const diag = useSyncExternalStore(subscribeDataDiag, getDataDiag, getDataDiag);
  const [open, setOpen] = useState(false);

  const healthy = diag.contentSource === 'api';
  const label = diag.contentSource ? (SOURCE_LABEL[diag.contentSource] ?? diag.contentSource) : 'loading…';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          ...DEV_BADGE_ANCHOR, bottom: 132,
          padding: '6px 10px', fontSize: '0.7rem', borderRadius: 999,
          background: healthy ? 'var(--good)' : 'var(--warn)', color: '#fff', boxShadow: 'var(--shadow-card)',
        }}
      >
        🗄 {label}
      </button>
    );
  }

  const Row = ({ k, v }: { k: string; v: string | null }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '2px 0' }}>
      <span style={{ color: 'var(--ink-faint)' }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: 'end', wordBreak: 'break-word' }}>{v ?? '—'}</span>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', bottom: 90, insetInline: 12, zIndex: 90,
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14,
        padding: 12, fontSize: '0.74rem', boxShadow: 'var(--shadow-pop)', maxWidth: 460, margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <strong>Data source (dev)</strong>
        <button onClick={() => setOpen(false)} style={{ minHeight: 0, padding: '2px 8px', background: 'none' }}>✕</button>
      </div>
      <Row k="provider" v={diag.provider === 'api' ? 'ApiProvider (API-first)' : 'LocalProvider (local-only)'} />
      <Row k="apiBase" v={diag.apiBase || '(none configured)'} />
      <Row k="content source" v={diag.contentSource ? (SOURCE_LABEL[diag.contentSource] ?? diag.contentSource) : null} />
      <Row k="lang / version" v={diag.lang ? `${diag.lang}${diag.version ? ` · v${diag.version}` : ''}` : null} />
      <Row k="last API success" v={diag.lastApiSuccess} />
      <Row k="fallback reason" v={diag.fallbackReason} />
      {diag.provider === 'local-only' && (
        <p style={{ color: 'var(--warn)', marginTop: 6 }}>
          ⚠ VITE_API_BASE not set — running local-only, no API calls. Set it in apps/web/.env* and restart.
        </p>
      )}
    </div>
  );
}
