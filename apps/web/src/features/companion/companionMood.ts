import type { ArtPose } from './companionAssets.js';
import { motionFamily, type CompanionAnimation, type CompanionStage } from './companionModel.js';

/**
 * How the companion FEELS at a moment — the vocabulary screens use. A mood is never shown as text;
 * it picks a pose (when the artwork has one), a motion and a small effect. Pure.
 */
export const BASE_MOODS = [
  'idle', 'resting', 'attentive', 'listening', 'curious', 'thinking', 'happy', 'proud', 'encouraging', 'surprised', 'celebrating',
  'recovery', 'missionComplete',
] as const;
/** Moods only a talking stage has; an earlier stage shows its nearest quiet equivalent. */
export const PARROT_MOODS = ['talking', 'laughing', 'excited', 'confident'] as const;
export type CompanionMood = (typeof BASE_MOODS)[number] | (typeof PARROT_MOODS)[number];

const QUIET: Record<(typeof PARROT_MOODS)[number], CompanionMood> = { talking: 'attentive', laughing: 'happy', excited: 'celebrating', confident: 'proud' };

/** The mood a stage can actually show. */
export function resolveMood(stage: CompanionStage, mood: CompanionMood): CompanionMood {
  if (motionFamily(stage) === 'parrot') return mood;
  return (PARROT_MOODS as readonly string[]).includes(mood) ? QUIET[mood as (typeof PARROT_MOODS)[number]] : mood;
}

/** The model's animation state behind each mood (kept so the animation system stays one list). */
export const MOOD_ANIMATION: Record<CompanionMood, CompanionAnimation> = {
  idle: 'idle', resting: 'rest', attentive: 'attention', listening: 'listening', curious: 'attention', thinking: 'thinking',
  happy: 'correct', proud: 'celebrate', encouraging: 'encouraging', surprised: 'correct', celebrating: 'celebrate',
  recovery: 'celebrate', missionComplete: 'missionComplete',
  talking: 'talking', laughing: 'laughing', excited: 'celebrate', confident: 'idle',
};

/** Which artwork pose a mood asks for (falls back to the base image when the pose has no art yet). */
export const MOOD_POSE: Record<CompanionMood, ArtPose> = {
  idle: 'idle', resting: 'idle', attentive: 'listening', listening: 'listening', curious: 'listening', thinking: 'thinking',
  happy: 'happy', proud: 'happy', encouraging: 'encouraging', surprised: 'happy', celebrating: 'celebrate',
  recovery: 'celebrate', missionComplete: 'celebrate',
  talking: 'talking', laughing: 'happy', excited: 'celebrate', confident: 'idle',
};

export type MoodEffect = 'none' | 'bubbles' | 'sparkle';
/** The small flourish around the character: a fish makes bubbles, a bird gets a sparkle; a recovery
 *  win always sparkles — it is the smart move, and it should look like one. */
export function moodEffect(stage: CompanionStage, mood: CompanionMood): MoodEffect {
  if (mood === 'recovery' || mood === 'proud' || mood === 'missionComplete') return 'sparkle';
  if (mood === 'happy' || mood === 'surprised' || mood === 'celebrating' || mood === 'excited' || mood === 'laughing') return motionFamily(stage) === 'parrot' ? 'sparkle' : 'bubbles';
  return 'none';
}

/** Moods that loop quietly; every other mood is one short gesture. */
export const isAmbient = (mood: CompanionMood): boolean => mood === 'idle' || mood === 'resting' || mood === 'confident';
