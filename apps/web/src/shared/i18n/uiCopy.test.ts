import { describe, expect, it } from 'vitest';
import { UI_DICTIONARIES, setUiLangDict, t, type StringKey } from './strings.js';
import { BOOTCAMP_PLAN } from '../../features/bootcamp/plan.js';

/**
 * Copy rules for the product IA: both interface languages name the same four destinations, arrows
 * belong to components (never to translated strings), and no string hard-codes the mission count
 * or leads with the retired "survival kit" concept.
 */
const NEW_KEYS: StringKey[] = [
  'homeTab', 'bootcampTab', 'listenTab', 'profileTab', 'readinessTitle', 'readinessSituations', 'readinessPhrases',
  'nextStepTitle', 'situationOf', 'continueLearning', 'startLearning', 'quickReviewTitle', 'quickListenTitle',
  'learnTitle', 'learnSub', 'stepWatch', 'stepListen', 'stepLearn', 'stepPractice', 'stepWatchAgain',
  'listenTitle', 'listenRepeats', 'listenModeLabel', 'survivalKit', 'nextMission', 'phraseLibrary',
];
const read = (lang: string, key: StringKey, vars?: Record<string, string | number>): string => { setUiLangDict(lang); return t(key, vars); };

describe('navigation labels', () => {
  it('English: Home · Path · Listen · Profile', () => {
    expect((['homeTab', 'bootcampTab', 'listenTab', 'profileTab'] as StringKey[]).map((k) => read('en', k))).toEqual(['Home', 'Path', 'Listen', 'Profile']);
  });
  it('Hebrew: בית · מסלול · להאזין · פרופיל', () => {
    expect((['homeTab', 'bootcampTab', 'listenTab', 'profileTab'] as StringKey[]).map((k) => read('he', k))).toEqual(['בית', 'מסלול', 'להאזין', 'פרופיל']);
  });
  it('the Path screen is titled like its tab (מסלול / Path), not the generic "Learn"', () => {
    expect(read('he', 'learnTitle')).toBe(read('he', 'bootcampTab'));
    expect(read('en', 'learnTitle')).toBe(read('en', 'bootcampTab'));
    expect(read('he', 'learnTitle')).toBe('מסלול');
    expect(read('he', 'learnSub', { n: 30 })).toBe('30 מצבים אמיתיים — לומדים רק מה שצריך לטיול');
  });
});

describe('copy rules', () => {
  it('every new key is translated in Hebrew (no silent English fallback)', () => {
    for (const key of NEW_KEYS) expect(read('he', key), key).not.toBe(read('en', key));
  });

  it('"Next mission" carries no arrow in either language — the button owns ONE direction-aware icon', () => {
    for (const lang of ['en', 'he']) {
      const label = read(lang, 'nextMission', { title: 'X' });
      expect(label).not.toMatch(/[▶►→←◀‹›»«]/u);
      expect(label).toContain('X');
    }
  });

  it('the mission count and position come from the plan, never from copy', () => {
    for (const lang of ['en', 'he']) {
      expect(read(lang, 'learnSub', { n: BOOTCAMP_PLAN.length })).toContain('30');
      expect(read(lang, 'learnSub', { n: 7 })).not.toContain('30');
      expect(read(lang, 'situationOf', { n: 3, total: BOOTCAMP_PLAN.length })).toMatch(/3.*30/);
      expect(read(lang, 'readinessSituations', { done: 8, total: BOOTCAMP_PLAN.length })).toMatch(/8.*30/);
    }
  });

  it('NO interface string in any language carries a directional arrow — icons own direction', () => {
    const offenders: string[] = [];
    for (const [lang, dict] of Object.entries(UI_DICTIONARIES)) {
      for (const [key, value] of Object.entries(dict)) {
        if (/[→←▶◀►◄➜➡⬅‹›»«]/u.test(value ?? '')) offenders.push(`${lang}.${key}: ${value}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('progress copy stays honest: sentences are "practiced", never "learned" / "mastered"', () => {
    expect(read('en', 'readinessPhrases', { done: 3, total: 10 })).toMatch(/practiced/);
    expect(read('en', 'readinessPhrases', { done: 3, total: 10 })).not.toMatch(/learned|mastered|known/i);
    expect(read('he', 'readinessPhrases', { done: 3, total: 10 })).toContain('תורגלו');
  });

  it('the old Home heading is gone; the supporting section is "more ways to practice"', () => {
    expect(read('he', 'homeGreeting')).not.toBe('האימון שלך');
    expect(read('he', 'listenMore')).toBe('עוד דרכים לתרגל');
  });

  it('continuous play is named as a mode, not as one more repeat count', () => {
    expect(read('he', 'listenContinuous')).toBe('ניגון רציף');
    expect(read('he', 'listenRepeatsAria', { n: 3 })).toBe('חזרות: כל משפט מושמע 3 פעמים');
  });

  it('recovery phrases are presented as conversation help, not as a "survival kit"', () => {
    expect(read('en', 'survivalKit')).toBe('Conversation help');
    expect(read('he', 'survivalKit')).toBe('עזרה בשיחה');
  });

  it('repeats are labelled as repeats (חזרות), distinct from speech speed', () => {
    expect(read('he', 'listenRepeats')).toBe('חזרות');
    expect(read('en', 'listenRepeats')).toBe('Repeats');
    expect(read('he', 'listenRepeats')).not.toBe(read('he', 'speechSpeed'));
  });
});
