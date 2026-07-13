import { Fragment, useMemo, useRef } from 'react';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { useAppStore } from '../../shared/stores/appStore.js';
import { tap } from '../../shared/ui/haptics.js';
import { segmentText, type CorpusIndex } from './corpusIndex.js';
import { useCoreWords } from './useCoreWords.js';
import { useFoundationStore } from './foundationStore.js';
import { TapCoachmark } from './TapCoachmark.js';

/**
 * Universal Tap. `TappableText` renders a learning-language sentence where every Core Corpus word is
 * a subtle tappable span that opens the shared Foundation word sheet — dialogue, flashcards, phrases,
 * anywhere. `TappableWord` is the single-word form (a whole Core word row/chip). Both funnel through
 * `foundationStore.openWord`, so there is exactly ONE word-sheet entry point and zero duplicated UI.
 *
 * It only marks the target (learning) language — an app-language gloss is never made tappable. While
 * the pack loads it renders plain text, so it degrades gracefully and never blocks reading.
 */

function openWord(word: CoreWord, surface?: string): void {
  tap();
  useFoundationStore.getState().openWord(word, surface);
}

/** A single tappable Core word (used where the whole element is one word — the shown text IS the
 *  canonical word, so no surface override is needed). */
export function TappableWord({ word, children, className = '' }: { word: CoreWord; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={`tappable-word ${className}`} onClick={(e) => { e.stopPropagation(); openWord(word); }}>
      {children}
    </button>
  );
}

/** Inline tappable words inside a sentence. `lang` defaults to the active learning language. */
export function TappableText({ text, lang, className }: { text: string; lang?: string; className?: string }) {
  const learningLang = useAppStore((s) => s.learningLang);
  const activeLang = lang ?? learningLang;
  const { index } = useCoreWords(activeLang);
  const segments = useMemo(() => (index ? segmentText(text, index) : null), [text, index]);
  const firstWordRef = useRef<HTMLButtonElement>(null);

  if (!segments) return <span className={className}>{text}</span>;
  let firstWordSeen = false;
  const hasTappable = segments.some((s) => s.word);
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (!seg.word) return <Fragment key={i}>{seg.text}</Fragment>;
        const isFirst = !firstWordSeen;
        firstWordSeen = true;
        return (
          <button
            key={i}
            ref={isFirst ? firstWordRef : undefined}
            type="button"
            className="tappable-word"
            // Pass the exact tapped surface so the sheet shows THIS form (e.g. "combien"), not the
            // pack's canonical realization ("Combien ?"). Preserves the learner's mental model.
            onClick={(e) => { e.stopPropagation(); openWord(seg.word!, seg.text); }}
            // Swallow the pointer so a tappable word inside a draggable/flip card never triggers it.
            onPointerDown={(e) => e.stopPropagation()}
          >
            {seg.text}
          </button>
        );
      })}
      {hasTappable && <TapCoachmark anchorRef={firstWordRef} />}
    </span>
  );
}

export type { CorpusIndex };
