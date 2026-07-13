import { useEffect, useMemo, useState } from 'react';
import { loadCoreWords, type CoreWord } from '../../shared/content/coreWords.js';
import { buildCorpusIndex, type CorpusIndex } from './corpusIndex.js';

/**
 * Load the active learning language's Core pack (cached by `loadCoreWords`) and derive the Universal
 * Tap surface index once per language. Every tappable surface uses this one hook, so there is a
 * single pack load + a single index per language — no per-component duplication. While the pack is
 * loading, `index` is null and callers render plain (non-tappable) text.
 */
export function useCoreWords(lang: string): { words: CoreWord[] | null; index: CorpusIndex | null } {
  const [words, setWords] = useState<CoreWord[] | null>(null);
  useEffect(() => {
    let alive = true;
    setWords(null);
    void loadCoreWords(lang).then((w) => { if (alive) setWords(w); });
    return () => { alive = false; };
  }, [lang]);
  const index = useMemo(() => (words ? buildCorpusIndex(words) : null), [words]);
  return { words, index };
}
