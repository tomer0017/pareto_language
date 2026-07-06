import { useSyncExternalStore, useState } from 'react';
import { getAudioDiag, subscribeAudioDiag, testAudio, unlockAudio } from '../audio/tts.js';

/**
 * Dev-only audio diagnostics + Test Audio (Sprint 8 P0). Rendered only under import.meta.env.DEV.
 * Shows the full speechSynthesis state so Chrome vs Safari behaviour is visible, and lets the
 * user confirm audio with a real English utterance — the app must never fail audio silently.
 */
export function AudioDebug() {
  const diag = useSyncExternalStore(subscribeAudioDiag, getAudioDiag, getAudioDiag);
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);

  const runTest = async (): Promise<void> => {
    setTesting(true);
    unlockAudio();
    await testAudio();
    setTesting(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          unlockAudio();
          setOpen(true);
        }}
        style={{
          position: 'fixed', bottom: 96, insetInlineEnd: 12, zIndex: 90, minHeight: 0,
          padding: '6px 10px', fontSize: '0.7rem', borderRadius: 999,
          background: diag.unlocked ? 'var(--good)' : 'var(--warn)', color: '#fff', boxShadow: 'var(--shadow-card)',
        }}
      >
        🔊 {diag.unlocked ? 'audio ✓' : 'audio ?'}
      </button>
    );
  }

  const Row = ({ k, v }: { k: string; v: string | number | boolean | null }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '2px 0' }}>
      <span style={{ color: 'var(--ink-faint)' }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: 'end', wordBreak: 'break-word' }}>{String(v ?? '—')}</span>
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
        <strong>Audio diagnostics (dev)</strong>
        <button onClick={() => setOpen(false)} style={{ minHeight: 0, padding: '2px 8px', background: 'none' }}>✕</button>
      </div>
      <Row k="browser" v={diag.browser} />
      <Row k="synthAvailable" v={diag.synthAvailable} />
      <Row k="voicesLoaded" v={diag.voicesLoaded} />
      <Row k="unlocked (gesture)" v={diag.unlocked} />
      <Row k="selectedVoice" v={diag.selectedVoice} />
      <Row k="selectedLang" v={diag.selectedLang} />
      <Row k="lastRequest" v={diag.lastRequest} />
      <Row k="lastError" v={diag.lastError} />
      <button className="btn-primary" style={{ marginTop: 10 }} onClick={() => void runTest()} disabled={testing}>
        {testing ? '🔊 speaking…' : '🔊 Test Audio (English)'}
      </button>
      {diag.lastError && (
        <p style={{ color: 'var(--danger)', marginTop: 6 }}>⚠ {diag.lastError}</p>
      )}
    </div>
  );
}
