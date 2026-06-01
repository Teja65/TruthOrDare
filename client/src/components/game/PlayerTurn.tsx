import { Player } from '../../types/Player';
import { Button } from '../ui/Button';

type PlayerTurnProps = {
  player: Player;
  activePrompt: string;
  activeType: 'truth' | 'dare' | null;
  onSelectTruth: () => void;
  onSelectDare: () => void;
  onComplete: () => void;
  onSkip: () => void;
  disabled?: boolean;
};

export function PlayerTurn({
  player,
  activePrompt,
  activeType,
  onSelectTruth,
  onSelectDare,
  onComplete,
  onSkip,
  disabled = false,
}: PlayerTurnProps) {
  return (
    <div className='player-turn-card'>
      <div className='turn-header'>
        <p>Current player</p>
        <h3>{player.name}</h3>
      </div>
      <div className='choice-row'>
        <Button variant='secondary' onClick={onSelectTruth} disabled={disabled}>
          Truth
        </Button>
        <Button variant='secondary' onClick={onSelectDare} disabled={disabled}>
          Dare
        </Button>
      </div>
      {activePrompt && activeType && (
        <div className={`prompt-card ${activeType}`}>
          <span className='prompt-type'>{activeType.toUpperCase()}</span>
          <p>{activePrompt}</p>
          <div className='result-actions'>
            <Button onClick={onComplete}>Completed</Button>
            <Button variant='secondary' onClick={onSkip}>
              Skipped
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
