import type { BootcampDialogue, DialogueNodeB } from './types.js';
import type { SpeakResult } from '../../shared/audio/tts.js';

/**
 * What happens when the other person's line comes up in a conversation — PURE, so the timing can be
 * tested without a browser.
 *
 * Audio is instructional media, never a loading state: when the learner answers next, the answer
 * choices are shown AT ONCE, with the line still on screen and its audio playing alongside. Picking
 * an answer while it plays is fine — the next line spoken (`speak`) replaces the current one, so two
 * lines never overlap. Only where nothing is asked of the learner (the other person speaks again, or
 * the scene ends) does the next beat wait for the line to finish, so lines are not talked over.
 */

/** The node after an NPC line is a decision of the learner's (one or more choices). */
export function answersFollow(dialogue: Pick<BootcampDialogue, 'nodes'>, node: DialogueNodeB): boolean {
  if (node.who !== 'npc' || !node.next) return false;
  const next = dialogue.nodes.find((n) => n.id === node.next);
  return next?.who === 'you' && (next.choices?.length ?? 0) > 0;
}

export interface BeatDeps {
  speak: () => Promise<SpeakResult>;
  /** Move the conversation to a node; `heard` is the NPC line that stays on screen above the choices. */
  go: (nodeId: string, heard: string) => void;
  end: () => void;
  later: (fn: () => void, ms: number) => void;
  cancelled: () => boolean;
}

/** Run one NPC beat: speak the line; show the choices now, or move on once the line has been said. */
export function runNpcBeat(dialogue: Pick<BootcampDialogue, 'nodes'>, node: DialogueNodeB, deps: BeatDeps): void {
  const spoken = deps.speak();
  if (answersFollow(dialogue, node)) {
    deps.go(node.next!, node.id); // the choices appear immediately; the audio keeps playing
    return;
  }
  void spoken.then((r) => {
    if (deps.cancelled() || r !== 'ended') return; // interrupted audio never advances the dialogue
    if (node.end) deps.later(() => !deps.cancelled() && deps.end(), 800);
    else if (node.next) deps.later(() => !deps.cancelled() && deps.go(node.next!, node.id), 700);
  });
}
