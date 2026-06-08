import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import translations from '../../en.json';
import { PlayerTurn } from '../../components/game/PlayerTurn';
import { ScoreBoard } from '../../components/game/ScoreBoard';
import { RoomInfo } from '../../components/room/RoomInfo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createQuestion } from '../../features/questions/questionService';
import { useGame } from '../../hooks/useGame';
import { useRoom } from '../../hooks/useRoom';
import type { QuestionCategory, QuestionType } from '../../utils/Game';

export function GameRoomPage() {
  const { roomCode: routeRoomCode = '' } = useParams();
  const [isEnded, setIsEnded] = useState(false);
  const [suggestionType, setSuggestionType] = useState<QuestionType>('truth');
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionError, setSuggestionError] = useState('');
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
  const sortedResults = useMemo(
    () => [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [players],
  );
  const winner = sortedResults[0];

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
    setIsEnded(false);
    await restartGame();
    toast.success(translations.toast.gameRestarted);
  }

  function handleEndGame() {
    setIsEnded(true);
    toast.success(translations.toast.gameEnded);
  }

  async function handleQuestionSuggestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = suggestionText.trim();
    if (!text) {
      setSuggestionError(translations.form.errors.questionRequired);
      return;
    }

    await createQuestion(text, suggestionType);
    setSuggestionText('');
    setSuggestionError('');
    toast.success(translations.toast.questionSaved);
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
            </>
          )}
          <div className='button-row small-gap'>
            <button
              className='secondary-button'
              type='button'
              onClick={handleRestart}
            >
              {translations.buttons.restart}
            </button>
            <button
              className='secondary-button danger-action'
              type='button'
              onClick={handleEndGame}
            >
              {translations.gameRoomPage.endGame}
            </button>
          </div>
          <form className='suggestion-panel' onSubmit={handleQuestionSuggestion}>
            <p className='eyebrow'>{translations.gameRoomPage.suggestQuestion}</p>
            <div className='button-row small-gap'>
              <button
                className={
                  suggestionType === 'truth'
                    ? 'category-card selected'
                    : 'category-card'
                }
                type='button'
                onClick={() => setSuggestionType('truth')}
              >
                {translations.gameRoomPage.truth}
              </button>
              <button
                className={
                  suggestionType === 'dare'
                    ? 'category-card selected'
                    : 'category-card'
                }
                type='button'
                onClick={() => setSuggestionType('dare')}
              >
                {translations.gameRoomPage.dare}
              </button>
            </div>
            <Input
              label={translations.gameRoomPage.questionText}
              value={suggestionText}
              error={suggestionError}
              onChange={(event) => {
                setSuggestionText(event.target.value);
                setSuggestionError('');
              }}
            />
            <Button type='submit'>{translations.gameRoomPage.saveQuestion}</Button>
          </form>
        </div>
        <ScoreBoard players={players} />
      </div>
    </section>
  );
}
