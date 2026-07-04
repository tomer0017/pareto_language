/**
 * Google Sign-In via Google Identity Services (mission M3 step 10).
 * The GIS script is loaded on demand; the ID token (credential) is verified server-side and
 * merged with the anonymous account so no progress is ever lost.
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';

interface GisCredentialResponse {
  credential: string;
}
interface GisApi {
  accounts: {
    id: {
      initialize(cfg: { client_id: string; callback: (r: GisCredentialResponse) => void }): void;
      renderButton(el: HTMLElement, opts: { theme: string; size: string; width?: number }): void;
    };
  };
}

export function googleSignInAvailable(): boolean {
  return CLIENT_ID !== '' && API_BASE !== '';
}

let scriptPromise: Promise<GisApi> | null = null;

function loadGis(): Promise<GisApi> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => {
      const gis = (window as unknown as { google?: GisApi }).google;
      if (gis) resolve(gis);
      else reject(new Error('GIS script loaded but window.google missing'));
    };
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Render the official Google button into `el`. On credential, POSTs to the server which
 * verifies the ID token and merges the anonymous identity. Resolves with the linked email.
 */
export async function mountGoogleButton(
  el: HTMLElement,
  onLinked: (email: string | undefined) => void,
  onError: (message: string) => void,
): Promise<void> {
  try {
    const gis = await loadGis();
    gis.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        void (async () => {
          try {
            const res = await fetch(`${API_BASE}/auth/google`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            });
            if (!res.ok) {
              const body = (await res.json().catch(() => null)) as {
                error?: { message?: string };
              } | null;
              throw new Error(body?.error?.message ?? `Sign-in failed (${res.status})`);
            }
            const body = (await res.json()) as {
              user: { identities: { provider: string; email?: string }[] };
            };
            const google = body.user.identities.find((i) => i.provider === 'google');
            onLinked(google?.email);
          } catch (err) {
            console.error('[auth] google sign-in failed', err);
            onError(err instanceof Error ? err.message : 'Sign-in failed');
          }
        })();
      },
    });
    gis.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large' });
  } catch (err) {
    console.error('[auth] GIS load failed', err);
    onError('Google Sign-In is unavailable right now.');
  }
}
