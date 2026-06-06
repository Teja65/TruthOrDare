import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import translations from '../../en.json';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PlayerList } from '../../components/room/PlayerList';
import { usePlayers } from '../../hooks/usePlayers';
import { useRoom } from '../../hooks/useRoom';
import { playerNameSchema } from '../../utils/validation';
import { startBackendGame } from '../../features/room/roomApi';

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { roomCode, createRoom, setPlayers, statusMessage } = useRoom();
  const { players, addPlayer, updatePlayerName, removePlayer } = usePlayers();
  const [playerName, setPlayerName] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [startError, setStartError] = useState('');
  const [playerTouched, setPlayerTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canStart = useMemo(
    () => players.length >= 2 && players.every((player) => player.name.trim()),
    [players],
  );

  function validatePlayerName(value: string) {
    const result = playerNameSchema.safeParse(value);
    if (!result.success) {
      setPlayerError(result.error.issues[0]?.message ?? '');
      return null;
    }

    setPlayerError('');
    return result.data;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlayerTouched(true);
    const validName = validatePlayerName(playerName);
    if (!validName) return;

    addPlayer(validName);
    setPlayerName('');
    setPlayerError('');
    setStartError('');
    setPlayerTouched(false);
  }

  async function handleStart() {
    const playersSchema = z
      .array(
        z.object({
          id: z.string(),
          name: playerNameSchema,
          score: z.number(),
        }),
      )
      .min(2, translations.form.errors.createPlayers);
    const result = playersSchema.safeParse(players);

    if (!result.success || !canStart) {
      setStartError(
        result.error?.issues[0]?.message ??
          translations.form.errors.createPlayers,
      );
      return;
    }

    setSubmitting(true);
    try {
      const room = await createRoom(result.data);
      await startBackendGame(room.code);
      setPlayers(room.players);
      toast.success(translations.toast.roomCreated);
      navigate(`/room/${room.code}`);
    } catch (error) {
      setStartError(translations.form.errors.backendUnavailable);
      toast.error(translations.toast.errorDefault);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className='page-section form-page'>
      <Card className='form-card'>
        <div className='form-hero'>
          <p className='eyebrow'>{translations.createRoomPage.setupTitle}</p>
          <h2>{translations.createRoomPage.heading}</h2>
          <p>{translations.createRoomPage.description}</p>
        </div>
        <div className='form-panel'>
          <Input
            label={translations.createRoomPage.roomCodeLabel}
            value={roomCode || translations.app.loading}
            disabled
          />
          <div className='players-panel'>
            <div className='section-heading'>
              <p>{translations.createRoomPage.playersTitle}</p>
            </div>
            <PlayerList
              players={players}
              onNameChange={updatePlayerName}
              onRemove={removePlayer}
            />
          </div>
          <form className='form-row compact-form' onSubmit={handleSubmit}>
            <Input
              label={translations.createRoomPage.playerName}
              placeholder={translations.form.placeholderName}
              value={playerName}
              error={playerError}
              onBlur={() => {
                setPlayerTouched(true);
                validatePlayerName(playerName);
              }}
              onChange={(event) => {
                setPlayerName(event.target.value);
                if (playerTouched) {
                  validatePlayerName(event.target.value);
                }
              }}
            />
            <Button type='submit'>{translations.createRoomPage.addPlayer}</Button>
          </form>
          {startError && <p className='form-error'>{startError}</p>}
          {statusMessage && <p className='input-helper'>{statusMessage}</p>}
          <Button
            className='full-width'
            disabled={!canStart || submitting}
            onClick={handleStart}
          >
            {translations.createRoomPage.startGame}
          </Button>
        </div>
      </Card>
    </section>
  );
}
