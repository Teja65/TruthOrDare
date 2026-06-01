import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import translations from '../../en.json';

type JoinRoomFormProps = {
  roomCode: string;
  playerName: string;
  onRoomCodeChange: (value: string) => void;
  onPlayerNameChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error?: string;
};

export function JoinRoomForm({
  roomCode,
  playerName,
  onRoomCodeChange,
  onPlayerNameChange,
  onSubmit,
  error,
}: JoinRoomFormProps) {
  return (
    <form className='form-stack' onSubmit={onSubmit}>
      <Input
        label={translations.joinRoomPage.roomCode}
        placeholder={translations.form.placeholderRoomCode}
        value={roomCode}
        onChange={(event) => onRoomCodeChange(event.target.value)}
      />
      <Input
        label={translations.joinRoomPage.yourName}
        placeholder={translations.form.placeholderName}
        value={playerName}
        onChange={(event) => onPlayerNameChange(event.target.value)}
      />
      {error && <p className='form-error'>{error}</p>}
      <Button type='submit'>{translations.joinRoomPage.joinGame}</Button>
    </form>
  );
}
