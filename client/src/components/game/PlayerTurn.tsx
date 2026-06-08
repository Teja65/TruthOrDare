import { useState } from 'react';
import toast from 'react-hot-toast';
import { Player } from '../../utils/Player';
import { QuestionCategory } from '../../utils/Game';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { saveCustomQuestion } from '../../features/questions/questionService';
import translations from '../../en.json';

type PlayerTurnProps = {
  player: Player;
  activePrompt: string;
  activeType: 'truth' | 'dare' | null;
  category: QuestionCategory;
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
  category,
  onSelectTruth,
  onSelectDare,
  onComplete,
  onSkip,
  disabled = false,
}: PlayerTurnProps) {
  const [customText, setCustomText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSaveCustom() {
    if (!activeType || !customText.trim()) return;

    setSaving(true);
    try {
      await saveCustomQuestion(customText.trim(), activeType, category);
      setCustomText('');
      toast.success(
        translations.toast.customQuestionSaved,
      );
    } catch {
      toast.error(translations.toast.errorDefault);
    } finally {
      setSaving(false);
    }
  }

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
          <div className='prompt-with-custom'>
            <p>{activePrompt}</p>
            <div className='custom-question-inline'>
              <Input
                label={translations.gameRoomPage.customQuestion}
                value={customText}
                placeholder={translations.gameRoomPage.customPlaceholder}
                onChange={(event) => setCustomText(event.target.value)}
              />
              <Button
                type='button'
                variant='secondary'
                disabled={!customText.trim() || saving}
                onClick={handleSaveCustom}
              >
                {translations.gameRoomPage.saveCustom}
              </Button>
            </div>
          </div>
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
