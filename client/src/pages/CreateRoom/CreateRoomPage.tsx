import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../../en.json';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PlayerList } from '../../components/room/PlayerList';
import { usePlayers } from '../../hooks/usePlayers';
import { useRoom } from '../../hooks/useRoom';

export function CreateRoomPage() {
  const navigate = useNavigate();
  const { roomCode, createRoom, setPlayers } = useRoom();
  const { players, addPlayer, updatePlayerName, removePlayer } = usePlayers();
  const [playerName, setPlayerName] = useState('');

  const canStart = useMemo(
    () => players.length >= 2 && players.every((player) => player.name.trim()),
    [players],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!playerName.trim()) return;
    addPlayer(playerName.trim());
    setPlayerName('');
  }

  function handleStart() {
    createRoom();
    setPlayers(players);
    navigate('/room');
  }

  return (
    <section className='page-section'>
      <Card>
        <h2>{translations.createRoomPage.heading}</h2>
        <p>{translations.createRoomPage.description}</p>
        <div className='form-group'>
          <Input
            label={translations.createRoomPage.roomCodeLabel}
            value={roomCode}
            disabled
          />
        </div>
        <PlayerList
          players={players}
          onNameChange={updatePlayerName}
          onRemove={removePlayer}
        />
        <form className='form-row' onSubmit={handleSubmit}>
          <Input
            label={translations.createRoomPage.playerName}
            placeholder={translations.form.placeholderName}
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />
          <Button type='submit'>{translations.createRoomPage.addPlayer}</Button>
        </form>
        <Button
          className='full-width'
          disabled={!canStart}
          onClick={handleStart}
        >
          {translations.createRoomPage.startGame}
        </Button>
      </Card>
    </section>
  );
}
