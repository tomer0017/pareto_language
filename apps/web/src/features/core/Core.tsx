import { useMemo, useState } from 'react';
import { L, t } from '../../shared/i18n/strings.js';
import { speak } from '../../shared/audio/tts.js';
import { tap } from '../../shared/ui/haptics.js';
import { LangStrip } from '../../shared/ui/LangStrip.js';
import { RECOVERY_ITEMS } from '../bootcamp/recovery.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { DAYS } from '../bootcamp/bootcampStore.js';
import type { BootcampItem } from '../bootcamp/types.js';

/**
 * Core — the practical communication engine: every sentence READY actually teaches, in one
 * place, tap to hear. This is not "1500 words" — it is the real phrases a traveler will say
 * and hear. Grouped by mission, deduped, audio on tap. (Spaced/weak-word review lands next.)
 */
interface Group { title: string; items: BootcampItem[] }

function buildGroups(): Group[] {
  const seen = new Set<string>();
  const groups: Group[] = [{ title: t('survivalKit'), items: RECOVERY_ITEMS }];
  for (const i of RECOVERY_ITEMS) seen.add(i.id);
  for (const m of BOOTCAMP_PLAN) {
    const day = DAYS[m.day];
    if (!day) continue;
    const items = day.items.filter((i) => !seen.has(i.id) && !i.id.startsWith('en.phrase.recovery.'));
    for (const i of items) seen.add(i.id);
    if (items.length) groups.push({ title: `${t('mission')} ${m.day} · ${L(m.title)}`, items });
  }
  return groups;
}

export function Core() {
  const groups = useMemo(buildGroups, []);
  const [playing, setPlaying] = useState<string | null>(null);
  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  const say = (item: BootcampItem): void => {
    tap();
    setPlaying(item.id);
    void speak(item.text, 'en').then(() => setPlaying((p) => (p === item.id ? null : p)));
  };

  return (
    <div className="screen">
      <div style={{ padding: '6px 0 2px' }}>
        <LangStrip />
        <h1>{t('coreTitle')}</h1>
        <p className="dim" style={{ marginTop: 4 }}>{t('coreSub', { n: total })}</p>
      </div>
      <div className="screen-scroll">
        {groups.map((g) => (
          <div key={g.title} style={{ marginTop: 14 }}>
            <h3 style={{ margin: '0 0 8px' }}>{g.title}</h3>
            {g.items.map((item) => (
              <button
                key={item.id}
                className={`list-row card-press ${playing === item.id ? 'core-playing' : ''}`}
                style={{ width: '100%', textAlign: 'start', background: 'var(--card)', borderRadius: 'var(--r-md)', border: 'none', padding: '12px 14px', marginBottom: 8, boxShadow: 'var(--shadow-card)' }}
                onClick={() => say(item)}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{item.text}</span>
                  <span className="dim small" style={{ display: 'block' }}>{L(item.meaning)}</span>
                </span>
                <span className="core-play" aria-hidden>🔊</span>
              </button>
            ))}
          </div>
        ))}
        <p className="faint small center" style={{ margin: '18px 4px 0' }}>ℹ️ {t('coreReviewSoon')}</p>
      </div>
    </div>
  );
}
