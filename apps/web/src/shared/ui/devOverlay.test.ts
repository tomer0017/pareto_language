import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { debugOverlayEnabled } from './devOverlay.js';

/**
 * The developer diagnostics ("IndexedDB cache" / "audio" badges) are not product UI. They must never
 * render in a production build, and not even in local development unless explicitly requested.
 */
const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

describe('debug diagnostics are opt-in and dev-only', () => {
  it('are OFF by default — even in a development build on localhost', () => {
    expect(debugOverlayEnabled({ dev: true, search: '', stored: null })).toBe(false);
    expect(debugOverlayEnabled({ dev: true, search: '?foo=bar', stored: null })).toBe(false);
  });

  it('turn on only when explicitly requested (?debug=1, or the remembered flag)', () => {
    expect(debugOverlayEnabled({ dev: true, search: '?debug=1', stored: null })).toBe(true);
    expect(debugOverlayEnabled({ dev: true, search: '', stored: '1' })).toBe(true);
    expect(debugOverlayEnabled({ dev: true, search: '?debug=0', stored: '1' })).toBe(false);
    expect(debugOverlayEnabled({ dev: true, search: '?debug=true', stored: null })).toBe(false);
  });

  it('can NEVER render in a production build, whatever is requested', () => {
    expect(debugOverlayEnabled({ dev: false, search: '?debug=1', stored: '1' })).toBe(false);
    expect(debugOverlayEnabled({ dev: false, search: '', stored: '1' })).toBe(false);
  });

  it('the app mounts the badges only behind that decision (not merely behind DEV)', () => {
    const app = read('../../app/App.tsx');
    expect(app).toContain('resolveDebugOverlay(import.meta.env.DEV)');
    expect(app).not.toMatch(/\{import\.meta\.env\.DEV && \(/);
    // The badges exist in exactly one place in the tree: inside the gated block.
    expect(app.match(/<AudioDebug \/>/g)).toHaveLength(1);
    expect(app.match(/<DataDebug \/>/g)).toHaveLength(1);
    expect(app.indexOf('showDebug && (')).toBeLessThan(app.indexOf('<AudioDebug />'));
  });
});
