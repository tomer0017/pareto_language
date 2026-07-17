import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import { t } from '../../shared/i18n/strings.js';
import { languageName, languageDirection } from '../../shared/i18n/languages.js';
import { tap } from '../../shared/ui/haptics.js';
import { SpeakerButton } from '../../shared/ui/SpeakerButton.js';
import { loadCoreWords } from '../../shared/content/coreWords.js';
import { missionsFor } from '../bootcamp/bootcampStore.js';
import { buildTranslationIndex, lookupTranslation, type TranslatableItem } from './quickTranslate.js';

/**
 * Quick Translator — the compact Home hero. Source is LOCKED to the UI language and target is LOCKED
 * to the learning language (no swap): the learner types in their own language and instantly sees the
 * phrase they'll actually say abroad, with a speaker + copy. It is a pure offline dictionary over the
 * vocabulary READY already knows (Core Corpus + mission sentences) — no network, no external API.
 */
export function QuickTranslator() {
  const uiLang = useAppStore((s) => s.uiLang);
  const learningLang = useAppStore((s) => s.learningLang);
  const [items, setItems] = useState<TranslatableItem[]>([]);
  const [query, setQuery] = useState('');

  // Load the known vocabulary for the learning language once (Core words first — higher priority by
  // rank — then every mission sentence). Offline-first: a failed load just yields an honest empty state.
  useEffect(() => {
    let alive = true;
    void loadCoreWords(learningLang).then((words) => {
      if (!alive) return;
      const missionItems = Object.values(missionsFor(learningLang)).flatMap((day) => day.items);
      setItems([
        ...words.map((w) => ({ text: w.word, meaning: w.meaning })),
        ...missionItems.map((i) => ({ text: i.text, meaning: i.meaning })),
      ]);
    });
    return () => { alive = false; };
  }, [learningLang]);

  const index = useMemo(() => buildTranslationIndex(items, uiLang), [items, uiLang]);
  const result = useMemo(() => lookupTranslation(query, index), [query, index]);
  const trimmed = query.trim();

  const [copied, setCopied] = useState(false);
  const onCopy = (text: string): void => {
    tap();
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => { /* clipboard blocked — non-fatal */ });
  };

  return (
    <div className="card quick-translator">
      <div className="qt-langs">
        <span className="qt-lang">{languageName(uiLang)}</span>
        <span className="qt-arrow" aria-hidden>→</span>
        <span className="qt-lang qt-lang-target">{languageName(learningLang)}</span>
      </div>
      <input
        className="qt-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('quickTransPlaceholder')}
        dir={languageDirection(uiLang)}
        aria-label={t('quickTransPlaceholder')}
        autoComplete="off"
        autoCorrect="off"
      />
      {trimmed && (
        result ? (
          <div className="qt-result fade-in">
            <span className="qt-target" dir={languageDirection(learningLang)}>{result.target}</span>
            <span className="qt-result-actions">
              <button
                className="qt-copy"
                onClick={() => onCopy(result.target)}
                aria-label={t('quickTransCopy')}
              >
                {copied ? t('quickTransCopied') : `📋 ${t('quickTransCopy')}`}
              </button>
              <SpeakerButton text={result.target} lang={learningLang} size={40} />
            </span>
          </div>
        ) : (
          <p className="qt-empty dim small">{t('quickTransNoResult')}</p>
        )
      )}
    </div>
  );
}
