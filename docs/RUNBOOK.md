# RUNBOOK — READY: The Travel Language Trainer

## Prerequisites

- Node.js ≥ 20 (repo developed on 20.19)
- npm 10 (workspaces)
- MongoDB only if you run the sync server (`npm run dev:server`); the PWA is fully
  functional without it.

## Setup

```bash
npm install
npm run build:content     # validate YAML → emit apps/web/public/content/it-IT.v0.1.0.json + manifest
```

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev:web` | Vite dev server for the PWA at http://localhost:5173 |
| `npm run dev:server` | Express API at http://localhost:4000 (needs MongoDB + `.env`) |
| `npm run typecheck` | `tsc -b` across all packages + content + web |
| `npm run lint` | ESLint 9 (flat config), `no-explicit-any` is an error |
| `npm test` | Vitest — engine, content gate, data providers, API (in-memory MongoDB) |
| `npm run coverage` | Engine coverage report (target ≥85%; currently ~98%) |
| `npm run build` | Production build: packages → content → PWA (`apps/web/dist`) + server (`server/dist`) |
| `npm run validate:content` | CI gate: schema + integrity checks on the YAML packs |
| `npm run smoke` | Scripted end-to-end: plan → session → events → readiness → offline reload |

## Environment variables

Copy `.env.example` → `.env` (repo root; the server loads it via dotenv):

| Var | Purpose |
| --- | --- |
| `PORT` | API port (default 4000) |
| `MONGODB_URI` | e.g. `mongodb://127.0.0.1:27017/ready` |
| `JWT_SECRET` | session signing — `openssl rand -hex 32`; required in production |
| `GOOGLE_CLIENT_ID` | OAuth Web client id (see below) |
| `CORS_ORIGIN` | the web origin, default `http://localhost:5173` |
| `VITE_API_BASE` | if set (e.g. `http://localhost:4000/api/v1`), the PWA syncs in the background; if unset the app is purely local/offline |
| `VITE_GOOGLE_CLIENT_ID` | same client id, exposed to the browser button |

## Google Cloud Console — steps only you can do

1. https://console.cloud.google.com → create (or pick) a project.
2. **APIs & Services → OAuth consent screen**: External, app name "READY", add your email;
   scopes: none beyond default (we only use the ID token). Publish to testing with your account.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**:
   - Authorized JavaScript origins: `http://localhost:5173` (and your production origin later)
   - No redirect URIs needed (Google Identity Services button flow).
4. Copy the client id into `.env` as both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.
5. Restart `npm run dev:server` and `npm run dev:web`. The "Save your progress" card appears in
   Plan & Settings; signing in merges anonymous progress into the Google account.

## Offline behaviour (P7)

- First load precaches the app shell + content pack via the service worker (vite-plugin-pwa).
- All learning writes land in IndexedDB instantly; the sync queue drains to the API in the
  background with exponential backoff when `VITE_API_BASE` is configured.
- To verify: load once, go offline (DevTools → Network → Offline), reload — the whole app,
  Emergency Card included, keeps working. `npm run smoke` asserts the same headlessly.

## Content authoring

- Source of truth: `content/it-IT/pack.yaml` (Tier 0/1). Edit → `npm run validate:content` →
  `npm run build:content`. IDs must stay stable across versions; bump `version` per semver.
- The pack ships `needsNativeReview: true` until a native Italian speaker signs off (risk R1).
- Audio: items resolve `audio/it/<itemId>.mp3` first; missing assets fall back to the Web
  Speech API automatically. Drop real recordings into `apps/web/public/audio/it/` to upgrade
  per-item with zero client changes.
