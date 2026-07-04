import { useEffect, useMemo, useRef, useState } from 'react';
import type { DialogueNode, ReviewEvent, Situation } from '@ready/content-schema';
import { useAppStore } from '../../../shared/stores/appStore.js';
import { speak } from '../../../shared/audio/tts.js';
import { t } from '../../../shared/i18n/strings.js';
import { useAppStore as useApp2 } from '../../../shared/stores/appStore.js';

/**
 * Mode 6 — Situation Simulator (PDF §9): a 60–90s scripted branching dialogue. Deterministic,
 * offline, testable — no LLM. Completing it with correct choices confers L4 evidence on the
 * situation's core phrases the user actually produced (knowledge ladder §6.2).
 */
export function Simulator({
  situation,
  onFinish,
}: {
  situation: Situation;
  onFinish: (events: ReviewEvent[]) => void;
}) {
  const app = useAppStore();
  const nodesById = useMemo(
    () => new Map<string, DialogueNode>(situation.dialogue.nodes.map((n) => [n.id, n])),
    [situation],
  );
  const [nodeId, setNodeId] = useState(situation.dialogue.startNodeId);
  const [transcript, setTranscript] = useState<{ who: 'npc' | 'user'; text: string }[]>([]);
  const [done, setDone] = useState(false);
  const correctChoices = useRef<string[]>([]); // texts of correctly chosen user lines
  const wrongCount = useRef(0);

  const node = nodesById.get(nodeId);

  useEffect(() => {
    if (!node) return;
    if (node.speaker === 'npc') {
      setTranscript((t) => [...t, { who: 'npc', text: node.text }]);
      void speak(node.text, useApp2.getState().learningLang);
      if (node.next) {
        const nextId = node.next;
        const timer = setTimeout(() => setNodeId(nextId), 900);
        return () => clearTimeout(timer);
      }
      setDone(true);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  if (!node) {
    // Malformed dialogue is caught by the content pipeline; keep a safe exit regardless.
    return (
      <div className="error-box">
        <p>This dialogue is unavailable.</p>
        <button className="btn-secondary" onClick={() => onFinish([])}>
          Continue
        </button>
      </div>
    );
  }

  const choose = (optIdx: number) => {
    const opt = node.options?.[optIdx];
    if (!opt) return;
    setTranscript((t) => [...t, { who: 'user', text: opt.text }]);
    if (opt.correct) correctChoices.current.push(opt.text);
    else wrongCount.current++;
    setNodeId(opt.next);
  };

  const complete = () => {
    if (!app.user) {
      onFinish([]);
      return;
    }
    const userId = app.user.id;
    // Passed = more correct than wrong choices. Confer simulator evidence on the core phrases
    // whose text the user actually produced (fall back to the first core phrase).
    const passed = correctChoices.current.length > wrongCount.current;
    const produced = new Set(correctChoices.current);
    const targetIds = situation.corePhraseIds.filter((id) => {
      const item = app.itemsById.get(id);
      return item !== undefined && produced.has(item.text);
    });
    if (targetIds.length === 0 && situation.corePhraseIds[0]) {
      targetIds.push(situation.corePhraseIds[0]);
    }
    const events: ReviewEvent[] = targetIds.map((itemId) => ({
      id: crypto.randomUUID(),
      userId,
      itemId,
      mode: 'simulator',
      outcome: passed ? 'pass' : 'partial',
      at: new Date().toISOString(),
    }));
    onFinish(events);
  };

  return (
    <>
      <div className="drill-card" style={{ justifyContent: 'flex-start', textAlign: 'left', gap: 10, maxHeight: '50vh', overflowY: 'auto' }}>
        <p className="drill-label">{situation.name} — live</p>
        {transcript.map((line, i) => (
          <p key={i} className={line.who === 'npc' ? 'dim' : ''} style={{ fontWeight: line.who === 'user' ? 700 : 400 }}>
            {line.who === 'npc' ? '🗣 ' : 'You: '}
            {line.text}
          </p>
        ))}
      </div>
      <div className="action-zone">
        {done ? (
          <button className="btn-accent" onClick={complete}>
            {correctChoices.current.length > wrongCount.current ? t('youHandledIt') : t('finish')}
          </button>
        ) : node.speaker === 'user' && node.options ? (
          node.options.map((opt, i) => (
            <button key={i} className="btn-secondary" onClick={() => choose(i)}>
              {opt.text}
              <span className="dim small" style={{ display: 'block' }}>{opt.meaning}</span>
            </button>
          ))
        ) : (
          <p className="dim small" style={{ textAlign: 'center' }}>…</p>
        )}
      </div>
    </>
  );
}
