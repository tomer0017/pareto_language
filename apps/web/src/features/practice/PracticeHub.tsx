import { useAppStore } from '../../shared/stores/appStore.js';
import { useSessionStore, type PracticeGame } from '../../shared/stores/sessionStore.js';
import { t } from '../../shared/i18n/strings.js';
import { tap } from '../../shared/ui/haptics.js';

interface Game {
  id: PracticeGame;
  icon: string;
  color: string;
  titleKey: 'swipeTriage' | 'flashRecall' | 'listening' | 'speedChallenge' | 'simulator' | 'echo';
  subKey: 'swipeSub' | 'flashRecallSub' | 'listeningSub' | 'speedChallengeSub' | 'simulatorSub' | 'echoSub';
}

/** Practice = six mini-games, each with its own personality — never "flashcards". */
const GAMES: Game[] = [
  { id: 'swipe', icon: '🃏', color: '#5b46e4', titleKey: 'swipeTriage', subKey: 'swipeSub' },
  { id: 'flashRecall', icon: '🎙️', color: '#0ca678', titleKey: 'flashRecall', subKey: 'flashRecallSub' },
  { id: 'listen', icon: '👂', color: '#3b82f6', titleKey: 'listening', subKey: 'listeningSub' },
  { id: 'numberSprint', icon: '⚡', color: '#e8a13c', titleKey: 'speedChallenge', subKey: 'speedChallengeSub' },
  { id: 'simulator', icon: '🎬', color: '#e05252', titleKey: 'simulator', subKey: 'simulatorSub' },
  { id: 'echo', icon: '🔊', color: '#8b5cf6', titleKey: 'echo', subKey: 'echoSub' },
];

export function PracticeHub() {
  const app = useAppStore();
  const buildPractice = useSessionStore((s) => s.buildPractice);

  // Eligibility per game — a game a user can enter must always contain at least one drill.
  const seen = [...app.states.keys()]
    .map((id) => app.itemsById.get(id))
    .filter((i): i is NonNullable<typeof i> => i !== undefined);
  const seenPhrases = seen.filter((i) => i.kind === 'phrase').length;
  const startedSituations = new Set(seen.flatMap((i) => i.situationIds));
  const listenPool = (app.pack?.items ?? []).filter(
    (i) => i.kind === 'reply' && i.situationIds.some((sid) => startedSituations.has(sid)),
  ).length;
  const simulatorReady = (app.pack?.situations ?? []).some(
    (sit) =>
      sit.corePhraseIds.length > 0 &&
      sit.corePhraseIds.every((id) => (app.states.get(id)?.level ?? 0) >= 2),
  );
  const eligible: Record<PracticeGame, boolean> = {
    swipe: seen.length > 0,
    flashRecall: seenPhrases > 0,
    echo: seenPhrases > 0,
    listen: listenPool > 0,
    numberSprint: true,
    simulator: simulatorReady,
  };
  const anythingLearned = seen.length > 0;

  const start = (game: PracticeGame) => {
    tap();
    buildPractice(game);
    app.navigate('session');
  };

  return (
    <div className="screen">
      <h1 style={{ marginBottom: 4 }}>{t('practiceHub')}</h1>
      <p className="dim small" style={{ marginBottom: 14 }}>{t('practiceSub')}</p>
      <div className="screen-scroll">
        {!anythingLearned && (
          <div className="card card-sunken">
            <p className="dim small">{t('nothingToPractice')}</p>
          </div>
        )}
        <div className="stagger">
          {GAMES.map((g) => (
            <button
              key={g.id}
              className="game-card card-press"
              onClick={() => start(g.id)}
              disabled={!eligible[g.id]}
              style={eligible[g.id] ? undefined : { opacity: 0.5 }}
            >
              <span className="game-icon" style={{ background: g.color, boxShadow: `0 8px 20px ${g.color}55` }}>
                {g.icon}
              </span>
              <span>
                <p style={{ fontWeight: 800 }}>{t(g.titleKey)}</p>
                <p className="dim small">{eligible[g.id] ? t(g.subKey) : t('notEnoughItems')}</p>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
