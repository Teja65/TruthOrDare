import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import translations from '../../en.json';
import { PlayerTurn } from '../../components/game/PlayerTurn';
import { ScoreBoard } from '../../components/game/ScoreBoard';
import { RoomInfo } from '../../components/room/RoomInfo';
import { Button } from '../../components/ui/Button';
import {
  endBackendGame,
  getBackendRoom,
  removeBackendPlayer,
  type GameSnapshot,
} from '../../features/room/roomApi';
import { useGame } from '../../hooks/useGame';
import type { QuestionCategory } from '../../utils/Game';
import type { Player } from '../../utils/Player';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

export function GameRoomPage() {
  const location = useLocation();
  const { roomCode: routeRoomCode = '' } = useParams();
  const initialSnapshot = (location.state as { snapshot?: GameSnapshot } | null)
    ?.snapshot;
  const [isEnded, setIsEnded] = useState(false);
  const [roomStatus, setRoomStatus] = useState<'running' | 'ended'>('running');
  const [loading, setLoading] = useState(!initialSnapshot);
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
    applySnapshot,
  } = useGame(routeRoomCode);

  useEffect(() => {
    if (!routeRoomCode) return;

    if (
      initialSnapshot &&
      initialSnapshot.room.code.toUpperCase() === routeRoomCode.toUpperCase()
    ) {
      applySnapshot(initialSnapshot);
      setRoomStatus(initialSnapshot.displayStatus);
      if (initialSnapshot.displayStatus === 'ended') setIsEnded(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    getBackendRoom(routeRoomCode)
      .then((snapshot) => {
        applySnapshot(snapshot);
        const ended = snapshot.displayStatus === 'ended';
        setRoomStatus(snapshot.displayStatus);
        if (ended) setIsEnded(true);
      })
      .catch(() => notifyError(translations.form.errors.roomNotFound))
      .finally(() => setLoading(false));
  }, [applySnapshot, initialSnapshot, routeRoomCode]);

  const canPlay = players.length >= 2 && roomStatus === 'running';
  const sortedResults = useMemo(
    () => [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [players],
  );
  const winner = sortedResults[0];

  function handlePlayerUpdated(player: Player) {
    setPlayers(players.map((item) => (item.id === player.id ? player : item)));
  }

  async function handlePlayerDeleted(playerId: string) {
    try {
      await removeBackendPlayer(routeRoomCode, playerId);
      setPlayers(players.filter((player) => player.id !== playerId));
      notifySuccess(translations.toast.playerDeleted);
    } catch {
      notifyError(translations.toast.errorDefault);
    }
  }

  function handleCategorySelect(item: QuestionCategory) {
    if (item === category) return;
    void selectCategory(item);
  }

  function handlePrompt(type: 'truth' | 'dare') {
    void choosePrompt(type);
  }

  function handleTurn(delta: number) {
    void finishTurn(delta);
  }

  async function handleRestart() {
    setIsEnded(false);
    setRoomStatus('running');
    const snapshot = await restartGame();
    if (snapshot) {
      notifySuccess(translations.toast.gameRestarted);
    }
  }

  async function handleEndGame() {
    try {
      await endBackendGame(routeRoomCode);
      setRoomStatus('ended');
      setIsEnded(true);
      notifySuccess(translations.toast.gameEnded);
    } catch {
      notifyError(translations.toast.errorDefault);
    }
  }

  if (loading) {
    return <section className='page-section page-centered'>{translations.app.loading}</section>;
  }

  return (
    <section className='page-section room-page page-centered'>
      <div className='room-grid'>
        <RoomInfo
          roomCode={routeRoomCode}
          playerCount={players.length}
          displayStatus={roomStatus}
        />
        <div className='game-panel'>
          <div className='section-header'>
            <h2>{translations.gameRoomPage.heading}</h2>
            <p>{translations.gameRoomPage.description}</p>
          </div>
          {isEnded ? (
            <div className='results-panel'>
              <p className='eyebrow'>{translations.gameRoomPage.results}</p>
              <h3>
                {translations.gameRoomPage.winner}: {winner?.name}
              </h3>
              <div className='score-list'>
                {sortedResults.map((player, index) => (
                  <div className='score-row' key={player.id}>
                    <span>{index + 1}</span>
                    <strong>{player.name}</strong>
                    <span>{player.score}</span>
                  </div>
                ))}
              </div>
              <Button as={Link} to='/'>
                {translations.gameRoomPage.returnHome}
              </Button>
            </div>
          ) : (
            <>
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
                    disabled={!canPlay}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className={isSpinning ? 'choice-spin spinning' : 'choice-spin'}>
                <PlayerTurn
                  player={currentPlayer}
                  category={category}
                  onSelectTruth={() => handlePrompt('truth')}
                  onSelectDare={() => handlePrompt('dare')}
                  activePrompt={currentPrompt}
                  activeType={activeType}
                  onComplete={() => handleTurn(1)}
                  onSkip={() => handleTurn(-1)}
                  disabled={!canPlay || isSpinning}
                />
              </div>
            </>
          )}
          {roomStatus === 'running' && (
            <div className='button-row small-gap'>
              <button
                className='secondary-button'
                type='button'
                onClick={() => void handleRestart()}
              >
                {translations.buttons.restart}
              </button>
              <button
                className='secondary-button danger-action'
                type='button'
                onClick={() => void handleEndGame()}
              >
                {translations.gameRoomPage.endGame}
              </button>
            </div>
          )}
        </div>
        <ScoreBoard
          players={players}
          roomCode={routeRoomCode}
          onPlayerUpdated={handlePlayerUpdated}
          onPlayerDeleted={handlePlayerDeleted}
          editable={roomStatus === 'running'}
        />
      </div>
    </section>
  );
}
