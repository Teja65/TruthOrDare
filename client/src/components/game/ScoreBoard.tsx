import { useState } from 'react';
import { Player } from '../../utils/Player';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { updateBackendPlayer } from '../../features/room/roomApi';
import translations from '../../en.json';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

type ScoreBoardProps = {
  players: Player[];
  roomCode?: string;
  onPlayerUpdated?: (player: Player) => void;
  onPlayerDeleted?: (playerId: string) => void;
  editable?: boolean;
};

export function ScoreBoard({
  players,
  onPlayerUpdated,
  onPlayerDeleted,
  editable = true,
}: ScoreBoardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedPlayers = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );

  function startEdit(player: Player) {
    setEditingId(player.id);
    setDraftName(player.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName('');
  }

  async function saveEdit(playerId: string) {
    const name = draftName.trim();
    if (!name) return;

    setSaving(true);
    try {
      await updateBackendPlayer(playerId, name);
      const score = players.find((player) => player.id === playerId)?.score ?? 0;
      onPlayerUpdated?.({ id: playerId, name, score });
      setEditingId(null);
      notifySuccess(translations.toast.playerUpdated);
    } catch {
      notifyError(translations.toast.errorDefault);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(playerId: string) {
    if (!window.confirm(translations.gameRoomPage.deletePlayerConfirm)) return;
    onPlayerDeleted?.(playerId);
  }

  return (
    <div className='score-board'>
      <div className='section-heading'>
        <p>{translations.labels.scoreBoard}</p>
      </div>
      <div className='score-list score-list-editable'>
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className='score-row'>
            <span>{index + 1}</span>
            {editable && editingId === player.id ? (
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className='score-player-input'
              />
            ) : (
              <strong>{player.name}</strong>
            )}
            <span>{player.score}</span>
            {editable && (
              <div className='score-row-actions'>
                {editingId === player.id ? (
                  <>
                    <Button
                      type='button'
                      variant='ghost'
                      disabled={saving}
                      onClick={() => saveEdit(player.id)}
                    >
                      {translations.gameRoomPage.savePlayer}
                    </Button>
                    <Button type='button' variant='ghost' onClick={cancelEdit}>
                      {translations.gameRoomPage.cancelEdit}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => startEdit(player)}
                    >
                      {translations.gameRoomPage.editPlayer}
                    </Button>
                    {players.length > 2 && (
                      <Button
                        type='button'
                        variant='ghost'
                        className='danger-action'
                        onClick={() => handleDelete(player.id)}
                      >
                        {translations.gameRoomPage.deletePlayer}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
