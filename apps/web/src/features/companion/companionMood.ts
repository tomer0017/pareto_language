import type { ArtPose } from './companionAssets.js';
import { motionFamily, type CompanionAnimation, type CompanionStage } from './companionModel.js';

/**
 * How the companion FEELS at a moment — the vocabulary screens use. A mood is never shown as text;
 * it picks one of the character's own drawn poses and a short motion. Pure.
 *
 * Which pose goes with which moment (the expression sheets are the source of truth):
 *   hello     — greeting, welcome back
 *   winner    — a right answer, "nice!"
 *   celebrate — a mission / checkpoint finished, a real win
 *   learning  — explaining, hinting, showing how a game works
 *   sad       — a wrong answer; always paired with a supportive line, never a punishment
 *   crown     — a proud moment: something earned, a smart recovery
 *   cheer     — hype before starting: "let's go"
 *   idle      — simply being there: resting, watching, listening
 */
export const BASE_MOODS = [
  'idle', 'resting', 'attentive', 'listening', 'curious', 'thinking', 'teaching', 'greeting', 'cheering', 'happy', 'proud', 'encouraging',
  'surprised', 'celebrating', 'recovery', 'missionComplete',
] as const;
/** Moods only a talking stage has; an earlier stage shows its nearest quiet equivalent. */
export const PARROT_MOODS = ['talking', 'laughing', 'excited', 'confident'] as const;
export type CompanionMood = (typeof BASE_MOODS)[number] | (typeof PARROT_MOODS)[number];

const QUIET: Record<(typeof PARROT_MOODS)[number], CompanionMood> = { talking: 'attentive', laughing: 'happy', excited: 'cheering', confident: 'proud' };

/** The mood a stage can actually show. */
export function resolveMood(stage: CompanionStage, mood: CompanionMood): CompanionMood {
  if (motionFamily(stage) === 'parrot') return mood;
  return (PARROT_MOODS as readonly string[]).includes(mood) ? QUIET[mood as (typeof PARROT_MOODS)[number]] : mood;
}

/** The model's animation state behind each mood (kept so the animation system stays one list). */
export const MOOD_ANIMATION: Record<CompanionMood, CompanionAnimation> = {
  idle: 'idle', resting: 'rest', attentive: 'attention', listening: 'listening', curious: 'attention', thinking: 'thinking', teaching: 'attention',
  greeting: 'attention', cheering: 'celebrate', happy: 'correct', proud: 'celebrate', encouraging: 'encouraging', surprised: 'correct',
  celebrating: 'celebrate', recovery: 'celebrate', missionComplete: 'missionComplete',
  talking: 'talking', laughing: 'laughing', excited: 'celebrate', confident: 'idle',
};

/** The drawn pose each mood shows. */
export const MOOD_POSE: Record<CompanionMood, ArtPose> = {
  idle: 'idle', resting: 'idle', attentive: 'idle', listening: 'idle', curious: 'idle',
  thinking: 'learning', teaching: 'learning',
  greeting: 'hello',
  cheering: 'cheer', excited: 'cheer',
  happy: 'winner', surprised: 'winner', laughing: 'winner',
  proud: 'crown', recovery: 'crown', confident: 'crown',
  encouraging: 'sad',
  celebrating: 'celebrate', missionComplete: 'celebrate',
  talking: 'idle',
};

/** Moods that loop quietly; every other mood is one short gesture. */
export const isAmbient = (mood: CompanionMood): boolean => mood === 'idle' || mood === 'resting' || mood === 'listening';
