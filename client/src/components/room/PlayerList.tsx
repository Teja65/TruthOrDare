import { Player } from '../../types/Player';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

type PlayerListProps = {
  players: Player[];
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
};

export function PlayerList({
  players,
  onNameChange,
  onRemove,
}: PlayerListProps) {
  return (
    <div className='player-list'>
      {players.map((player) => (
        <div className='player-row' key={player.id}>
          <Input
            value={player.name}
            onChange={(event) => onNameChange(player.id, event.target.value)}
            className='player-input'
          />
          <Button
            variant='ghost'
            type='button'
            onClick={() => onRemove(player.id)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
