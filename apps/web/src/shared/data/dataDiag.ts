import type { ContentSourceEvent } from '@ready/data';

/**
 * Dev data-source diagnostics (Sprint 8). Answers "where did content actually come from?" —
 * the live provider (API vs local-only), the API base URL, and whether the last pack was
 * served from the API, the IndexedDB cache, or the static public fallback (with the reason).
 * Same stable-snapshot contract as the audio diag so useSyncExternalStore never loops.
 */
export interface DataDiag {
  provider: 'api' | 'local-only';
  apiBase: string;
  /** Where the most recent content pack resolved from. */
  contentSource: 'api' | 'idb-cache' | 'static' | null;
  lang: string | null;
  version: string | null;
  /** ISO time of the last successful API pack fetch, if any. */
  lastApiSuccess: string | null;
  /** Why the app fell back off the API path (null while API-first is working). */
  fallbackReason: string | null;
}

const diag: DataDiag = {
  provider: 'local-only',
  apiBase: '',
  contentSource: null,
  lang: null,
  version: null,
  lastApiSuccess: null,
  fallbackReason: null,
};

const listeners = new Set<() => void>();
let snapshot: DataDiag = { ...diag };
function emit(): void {
  snapshot = { ...diag };
  for (const l of listeners) l();
}
export function subscribeDataDiag(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getDataDiag(): DataDiag {
  return snapshot;
}

/** Record the selected provider + API base at store construction. */
export function setProviderDiag(provider: 'api' | 'local-only', apiBase: string): void {
  diag.provider = provider;
  diag.apiBase = apiBase;
  if (import.meta.env.DEV) {
    console.info(`[data] provider=${provider} apiBase=${apiBase || '(none — local-only)'}`);
  }
  emit();
}

/** Reporter passed into the data providers; updates diag + logs in dev. reason is sticky. */
export function reportContentSource(e: ContentSourceEvent): void {
  diag.contentSource = e.source;
  diag.lang = e.lang;
  if (e.version) diag.version = e.version;
  if (e.source === 'api') {
    diag.lastApiSuccess = new Date().toISOString();
    diag.fallbackReason = null; // API-first is healthy again
  } else if (e.reason) {
    diag.fallbackReason = e.reason;
  }
  if (import.meta.env.DEV) {
    const tag = e.reason ? `${e.source} (${e.reason})` : e.source;
    console.info(`[data] content source: ${tag} · lang=${e.lang}${e.version ? ` v${e.version}` : ''}`);
  }
  emit();
}
