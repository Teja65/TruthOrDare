import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../../en.json';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useRoom } from '../../hooks/useRoom';

export function JoinRoomPage() {
  const navigate = useNavigate();
  const { joinRoom } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomCode.trim() || !playerName.trim()) {
      setError('Please enter both a room code and player name.');
      return;
    }

    if (!joinRoom(roomCode.trim(), playerName.trim())) {
      setError('Room code not found. Try another code.');
      return;
    }

    setError('');
    navigate('/room');
  }

  return (
    <section className='page-section'>
      <Card>
        <h2>{translations.joinRoomPage.heading}</h2>
        <p>{translations.joinRoomPage.description}</p>
        <form className='form-stack' onSubmit={handleSubmit}>
          <Input
            label={translations.joinRoomPage.roomCode}
            placeholder={translations.form.placeholderRoomCode}
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
          />
          <Input
            label={translations.joinRoomPage.yourName}
            placeholder={translations.form.placeholderName}
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
          />
          {error && <p className='form-error'>{error}</p>}
          <Button type='submit'>{translations.joinRoomPage.joinGame}</Button>
        </form>
      </Card>
    </section>
  );
}
