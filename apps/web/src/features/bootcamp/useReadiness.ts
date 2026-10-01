import { useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { missionsFor, useBootcampStore } from './bootcampStore.js';
import { travelReadiness, type TravelReadiness } from './readiness.js';

/** Travel Readiness for the ACTIVE learning language — the store-bound view of the pure
 *  `travelReadiness`. Every screen that shows progress reads this, so the numbers always agree. */
export function useTravelReadiness(): TravelReadiness {
  const learningLang = useAppStore((s) => s.learningLang);
  const completedDays = useBootcampStore((s) => s.completedDays);
  const stepIndex = useBootcampStore((s) => s.stepIndex);
  return useMemo(() => {
    const missions = missionsFor(learningLang);
    return travelReadiness({ completedDays, stepIndex }, (m) => m.day in missions);
  }, [learningLang, completedDays, stepIndex]);
}
