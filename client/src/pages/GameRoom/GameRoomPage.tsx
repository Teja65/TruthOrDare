import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import translations from '../../en.json';
import { PlayerTurn } from '../../components/game/PlayerTurn';
import { ScoreBoard } from '../../components/game/ScoreBoard';
import { RoomInfo } from '../../components/room/RoomInfo';
import { useGame } from '../../hooks/useGame';
import { useRoom } from '../../hooks/useRoom';
import type { QuestionCategory } from '../../types/Game';

export function GameRoomPage() {
  const { roomCode: routeRoomCode = '' } = useParams();
  const { roomCode, room, loadRoom, loading } = useRoom();
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
    isSpinning,
    refreshGame,
  } = useGame(routeRoomCode);

  useEffect(() => {
    if (!routeRoomCode) return;

    loadRoom(routeRoomCode)
      .then((loadedRoom) => {
        setPlayers(loadedRoom.players);
      })
      .catch(() => {
        toast.error(translations.form.errors.roomNotFound);
      });
  }, [loadRoom, routeRoomCode, setPlayers]);

  useEffect(() => {
    if (room.players.length) {
      setPlayers(room.players);
    }
  }, [room.players, setPlayers]);

  useEffect(() => {
    refreshGame();
  }, [refreshGame]);

  const canPlay = room.players.length >= 2;
  const playerCount = room.players.length;

  async function handleCategorySelect(item: QuestionCategory) {
    await selectCategory(item);
    toast.success(translations.toast.categoryUpdated);
  }

  async function handlePrompt(type: 'truth' | 'dare') {
    await choosePrompt(type);
    toast.success(translations.toast.promptReady);
  }

  async function handleTurn(delta: number) {
    await finishTurn(delta);
    toast.success(
      delta > 0
        ? translations.toast.turnCompleted
        : translations.toast.turnSkipped,
    );
  }

  async function handleRestart() {
    await restartGame();
    toast.success(translations.toast.gameRestarted);
  }

  if (loading) {
    return <section className='page-section'>{translations.app.loading}</section>;
  }

  return (
    <section className='page-section room-page'>
      <div className='room-grid'>
        <RoomInfo roomCode={roomCode || routeRoomCode} playerCount={playerCount} />
        <div className='game-panel'>
          <div className='section-header'>
            <h2>{translations.gameRoomPage.heading}</h2>
            <p>{translations.gameRoomPage.description}</p>
          </div>
          <div className='section-heading'>
            <p>{translations.gameRoomPage.chooseCategory}</p>
          </div>
          <div className='category-grid'>
            {translations.categories.map((item) => (
              <button
                key={item}
                className={
                  item === category ? 'category-card selected' : 'category-card'
                }
                type='button'
                onClick={() => handleCategorySelect(item as QuestionCategory)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className={isSpinning ? 'choice-spin spinning' : 'choice-spin'}>
            <PlayerTurn
              player={currentPlayer}
              onSelectTruth={() => handlePrompt('truth')}
              onSelectDare={() => handlePrompt('dare')}
              activePrompt={currentPrompt}
              activeType={activeType}
              onComplete={() => handleTurn(1)}
              onSkip={() => handleTurn(-1)}
              disabled={!canPlay || isSpinning}
            />
          </div>
          <div className='button-row small-gap'>
            <button
              className='secondary-button'
              type='button'
              onClick={handleRestart}
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
