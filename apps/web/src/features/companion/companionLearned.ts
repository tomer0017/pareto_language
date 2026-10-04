import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { missionsFor } from '../bootcamp/registry.js';
import type { LearnedMaterial } from './companionModel.js';

/**
 * What the learner has already been taught in a language — the ONLY target-language material the
 * companion is allowed to say. Read-only over the mission registry: completed missions, in journey
 * order, give their primed words and their learner sentences. Nothing else is ever exposed.
 */
export function learnedMaterial(lang: string, completedDays: readonly number[]): LearnedMaterial {
  const missions = missionsFor(lang);
  const done = new Set(completedDays);
  const words: string[] = [];
  const sentences: string[] = [];
  for (const m of BOOTCAMP_PLAN) {
    const day = missions[m.day];
    if (!day || !done.has(m.day)) continue;
    for (const step of day.steps) if (step.kind === 'prime') for (const w of step.words) words.push(w.text);
    for (const item of day.items) {
      if (item.id.includes('.phrase.') && !item.id.includes('.phrase.recovery.')) sentences.push(item.text);
    }
  }
  return { words: [...new Set(words)], sentences: [...new Set(sentences)] };
}
