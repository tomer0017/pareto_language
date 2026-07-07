import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: '/pareto_language/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['content/*.json'],
      workbox: {
        // Precache the app shell and the content packs — fully offline after first load (P7).
        // Videos are deliberately NOT precached (too large to bloat the SW install); they are
        // cached at runtime on first view so offline replay works without gating first load.
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\.mp4$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ready-videos',
              rangeRequests: true, // videos stream via HTTP range requests (206)
              cacheableResponse: { statuses: [0, 200, 206] },
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'READY — Travel Language Trainer',
        short_name: 'READY',
        description: 'Be demonstrably capable in the 10 situations every traveler faces.',
        theme_color: '#f4f3fb',
        background_color: '#f4f3fb',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@ready/content-schema': r('../../packages/content-schema/src/index.ts'),
      '@ready/engine': r('../../packages/engine/src/index.ts'),
      '@ready/data': r('../../packages/data/src/index.ts'),
    },
  },
});
