import { useEffect, useMemo } from 'react';
import translations from '../../en.json';
import { PlayerTurn } from '../../components/game/PlayerTurn';
import { ScoreBoard } from '../../components/game/ScoreBoard';
import { RoomInfo } from '../../components/room/RoomInfo';
import { useGame } from '../../hooks/useGame';
import { useRoom } from '../../hooks/useRoom';
import type { QuestionCategory } from '../../types/Game';

export function GameRoomPage() {
  const { roomCode, room } = useRoom();
  const {
    players,
    currentPlayer,
    category,
    activeType,
    currentPrompt,
    selectCategory,
    choosePrompt,
    finishTurn,
    restartGame,
    setPlayers,
  } = useGame();

  useEffect(() => {
    if (room.players.length) {
      setPlayers(room.players);
    }
  }, [room.players, setPlayers]);

  const canPlay = room.players.length >= 2;
  const playerCount = room.players.length;

  return (
    <section className='page-section room-page'>
      <div className='room-grid'>
        <RoomInfo roomCode={roomCode} playerCount={playerCount} />
        <div className='game-panel'>
          <div className='section-header'>
            <h2>{translations.gameRoomPage.heading}</h2>
            <p>{translations.gameRoomPage.description}</p>
          </div>
          <div className='category-grid'>
            {translations.categories.map((item) => (
              <button
                key={item}
                className={
                  item === category ? 'category-card selected' : 'category-card'
                }
                type='button'
                onClick={() => selectCategory(item as QuestionCategory)}
              >
                {item}
              </button>
            ))}
          </div>
          <PlayerTurn
            player={currentPlayer}
            onSelectTruth={() => choosePrompt('truth')}
            onSelectDare={() => choosePrompt('dare')}
            activePrompt={currentPrompt}
            activeType={activeType}
            onComplete={() => finishTurn(1)}
            onSkip={() => finishTurn(-1)}
            disabled={!canPlay}
          />
          <div className='button-row small-gap'>
            <button
              className='secondary-button'
              type='button'
              onClick={restartGame}
            >
              {translations.buttons.restart}
            </button>
          </div>
        </div>
        <ScoreBoard players={players} />
      </div>
    </section>
  );
}
