import type { ReactNode } from 'react';
import { t } from '../../shared/i18n/strings.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { useBootcampStore } from './bootcampStore.js';
import { npcFor, type NpcLook } from './npcCast.js';

/**
 * The conversation shell shared by dialogues and Quick Reply: the other person on one side with
 * their words in a bubble, the learner's line on the other. The scene is laid out left-to-right in
 * every app language, because what is inside it is the target language.
 */

/** The person the current mission's conversations are with. */
export function useNpc(): NpcLook {
  const day = useBootcampStore((s) => s.activeDay);
  return npcFor(BOOTCAMP_PLAN.find((m) => m.day === day)?.id);
}

export function NpcFigure({ npc }: { npc: NpcLook }) {
  return npc.art
    ? <img className="npc-fig" src={npc.art} alt="" draggable={false} />
    : <span className="npc-fig" aria-hidden>{npc.glyph}</span>;
}

/** The other person speaking: figure + bubble. `gloss` is the app-language meaning, when it may be shown. */
export function NpcLine({ npc, children, gloss }: { npc: NpcLook; children: ReactNode; gloss?: string }) {
  return (
    <div className="convo-row npc" dir="ltr">
      <NpcFigure npc={npc} />
      <div className="convo-bubble npc">
        <div className="convo-text">{children}</div>
        {gloss && <p className="convo-gloss" dir="auto">{gloss}</p>}
      </div>
    </div>
  );
}

/** What goes inside the other speaker's bubble. In an audio-only scene (No Subtitles) the line is
 *  never written before the learner answers: the bubble holds a button that plays it again. */
export function NpcSpeech({ audioOnly, onPlay, children }: { audioOnly: boolean; onPlay: () => void; children: ReactNode }) {
  return audioOnly ? <AudioBubble onPlay={onPlay} /> : <>{children}</>;
}

/** What the learner just said, on their side of the conversation. */
export function YouLine({ children }: { children: ReactNode }) {
  return (
    <div className="convo-row you" dir="ltr">
      <div className="convo-bubble you">{children}</div>
    </div>
  );
}

/** A line that is HEARD, not read: a bubble that plays it again when tapped. */
export function AudioBubble({ onPlay }: { onPlay: () => void }) {
  return (
    <button className="audio-bubble" onClick={onPlay} aria-label={t('hearAgain')}>
      <span aria-hidden>🔊</span>
      <span className="audio-wave" aria-hidden><i /><i /><i /><i /><i /></span>
    </button>
  );
}
