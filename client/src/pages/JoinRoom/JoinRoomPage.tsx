import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import translations from '../../en.json';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useRoom } from '../../hooks/useRoom';
import {
  getFieldError,
  joinRoomSchema,
  playerNameSchema,
  roomCodeSchema,
} from '../../utils/validation';

export function JoinRoomPage() {
  const navigate = useNavigate();
  const { joinRoom } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [errors, setErrors] = useState({ roomCode: '', playerName: '', form: '' });
  const [touched, setTouched] = useState({ roomCode: false, playerName: false });
  const [submitting, setSubmitting] = useState(false);

  function validateRoomCode(value: string) {
    const result = roomCodeSchema.safeParse(value);
    setErrors((current) => ({
      ...current,
      roomCode: result.success ? '' : result.error.issues[0]?.message ?? '',
      form: '',
    }));
  }

  function validatePlayerName(value: string) {
    const result = playerNameSchema.safeParse(value);
    setErrors((current) => ({
      ...current,
      playerName: result.success ? '' : result.error.issues[0]?.message ?? '',
      form: '',
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = joinRoomSchema.safeParse({ roomCode, playerName });

    if (!result.success) {
      setErrors({
        roomCode: getFieldError(result.error, 'roomCode') ?? '',
        playerName: getFieldError(result.error, 'playerName') ?? '',
        form: '',
      });
      return;
    }

    setSubmitting(true);
    try {
      const room = await joinRoom(result.data.roomCode, result.data.playerName);
      setErrors({ roomCode: '', playerName: '', form: '' });
      toast.success(translations.toast.roomJoined);
      navigate(`/room/${room.code}`);
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes('ended')
          ? translations.form.errors.roomEnded
          : translations.form.errors.roomNotFound;
      setErrors({
        roomCode: '',
        playerName: '',
        form: message,
      });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className='page-section form-page'>
      <Card className='form-card slim'>
        <div className='form-hero'>
          <h2>{translations.joinRoomPage.heading}</h2>
          <p>{translations.joinRoomPage.description}</p>
        </div>
        <form className='form-stack form-panel' onSubmit={handleSubmit}>
          <Input
            label={translations.joinRoomPage.roomCode}
            placeholder={translations.form.placeholderRoomCode}
            value={roomCode}
            error={errors.roomCode}
            onBlur={() => {
              setTouched((current) => ({ ...current, roomCode: true }));
              validateRoomCode(roomCode);
            }}
            onChange={(event) => {
              setRoomCode(event.target.value);
              if (touched.roomCode) {
                validateRoomCode(event.target.value);
              }
            }}
          />
          <Input
            label={translations.joinRoomPage.yourName}
            placeholder={translations.form.placeholderName}
            value={playerName}
            error={errors.playerName}
            onBlur={() => {
              setTouched((current) => ({ ...current, playerName: true }));
              validatePlayerName(playerName);
            }}
            onChange={(event) => {
              setPlayerName(event.target.value);
              if (touched.playerName) {
                validatePlayerName(event.target.value);
              }
            }}
          />
          {errors.form && <p className='form-error'>{errors.form}</p>}
          {errors.form === translations.form.errors.roomEnded && (
            <Button as={Link} to='/create' variant='secondary'>
              {translations.homePage.createRoom}
            </Button>
          )}
          <Button type='submit' disabled={submitting}>
            {translations.joinRoomPage.joinGame}
          </Button>
        </form>
      </Card>
    </section>
  );
}
