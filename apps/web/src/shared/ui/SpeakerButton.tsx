import { useState } from 'react';
import { speak, cancelSpeech } from '../audio/tts.js';
import { tap } from './haptics.js';
import { t } from '../i18n/strings.js';

/**
 * One reusable "tap to hear" button — the single place the play/playing-glow pattern lives, so every
 * surface (Foundation word list + page, Core Words, …) shares it instead of re-implementing audio
 * state. Speaks `text` in the given learning-language locale via the central `speak()`.
 */
export function SpeakerButton({ text, lang, className = '', size = 44, stop = false }: {
  text: string;
  lang: string;
  className?: string;
  size?: number;
  /** Stop event propagation (for buttons nested inside a tappable row). */
  stop?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      className={`speaker-btn ${playing ? 'core-playing' : ''} ${className}`}
      style={{ width: size, height: size, minHeight: size }}
      aria-label={t('play')}
      onClick={(e) => {
        if (stop) e.stopPropagation();
        tap();
        cancelSpeech();
        setPlaying(true);
        void speak(text, lang).then(() => setPlaying(false));
      }}
    >
      🔊
    </button>
  );
}
