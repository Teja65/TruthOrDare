import { Player } from '../../utils/Player';
import { Button } from '../ui/Button';
import translations from '../../en.json';

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
        <p>{translations.gameRoomPage.currentPlayer}</p>
        <h3>{player.name}</h3>
      </div>
      <div className='choice-row'>
        <Button variant='secondary' onClick={onSelectTruth} disabled={disabled}>
          {translations.gameRoomPage.truth}
        </Button>
        <Button variant='secondary' onClick={onSelectDare} disabled={disabled}>
          {translations.gameRoomPage.dare}
        </Button>
      </div>
      {activePrompt && activeType && (
        <div className={`prompt-card ${activeType}`}>
          <span className='prompt-type'>{activeType.toUpperCase()}</span>
          <p>{activePrompt}</p>
          <div className='result-actions'>
            <Button onClick={onComplete}>
              {translations.gameRoomPage.completed}
            </Button>
            <Button variant='secondary' onClick={onSkip}>
              {translations.gameRoomPage.skipped}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
