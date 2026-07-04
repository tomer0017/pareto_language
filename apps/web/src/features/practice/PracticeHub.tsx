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
  const anythingLearned = app.states.size > 0;

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
            <button key={g.id} className="game-card card-press" onClick={() => start(g.id)} disabled={!anythingLearned && g.id !== 'numberSprint'}>
              <span className="game-icon" style={{ background: g.color, boxShadow: `0 8px 20px ${g.color}55` }}>
                {g.icon}
              </span>
              <span>
                <p style={{ fontWeight: 800 }}>{t(g.titleKey)}</p>
                <p className="dim small">{t(g.subKey)}</p>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
