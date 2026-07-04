import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@ready/content-schema': r('./packages/content-schema/src/index.ts'),
      '@ready/engine': r('./packages/engine/src/index.ts'),
      '@ready/data': r('./packages/data/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'server/**/*.test.ts', 'content/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/engine/src/**/*.ts'],
      exclude: ['packages/engine/src/**/*.test.ts', 'packages/engine/src/index.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});
