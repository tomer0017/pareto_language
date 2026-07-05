import { useMemo, useState } from 'react';
import type { ContentItem } from '@ready/content-schema';
import { useAppStore } from '../../shared/stores/appStore.js';
import { L } from '../../shared/i18n/strings.js';
import { TopBar } from '../../shared/ui/TopBar.js';
import { playItem } from '../../shared/audio/tts.js';

/**
 * Emergency Card (PDF §7.2, §10.3): static, offline, huge type, two taps from anywhere,
 * available even at 0% study progress. Show-to-a-local mode fills the screen with one phrase.
 */
export function EmergencyCard() {
  const app = useAppStore();
  const [showLocal, setShowLocal] = useState<ContentItem | null>(null);

  const emergency = useMemo(
    () => app.pack?.situations.find((s) => s.isEmergency) ?? null,
    [app.pack],
  );
  const phrases = useMemo(() => {
    if (!emergency) return [];
    return emergency.corePhraseIds
      .map((id) => app.itemsById.get(id))
      .filter((i): i is ContentItem => i !== undefined);
  }, [emergency, app.itemsById]);

  if (showLocal) {
    return (
      <div className="screen" onClick={() => setShowLocal(null)} role="button" tabIndex={0}>
        <p className="show-local">{showLocal.text}</p>
        <p className="dim" style={{ textAlign: 'center' }}>
          {L(showLocal.meaning)}
        </p>
        <div className="action-zone">
          <button className="btn-secondary" onClick={() => setShowLocal(null)}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Emergency" />
      <div className="screen-scroll">
        <div className="card card-sunken">
          <p>
            <strong>112</strong> — the single emergency number in Italy and across the EU.
          </p>
        </div>
        {phrases.map((item) => (
          <div className="card" key={item.id}>
            <p className="emergency-phrase">{item.text}</p>
            <p className="dim" style={{ margin: '6px 0 12px' }}>
              {L(item.meaning)}
            </p>
            <div className="btn-row">
              <button className="btn-secondary" onClick={() => void playItem(item)}>
                🔊 Play
              </button>
              <button className="btn-secondary" onClick={() => setShowLocal(item)}>
                Show to a local
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
