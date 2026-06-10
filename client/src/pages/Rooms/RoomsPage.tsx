import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  deleteBackendRoom,
  listAllRooms,
  updateBackendRoom,
  type RoomSummary,
} from '../../features/room/roomApi';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

export function RoomsPage() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'ended'>('all');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [busyCode, setBusyCode] = useState('');

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      setRooms(await listAllRooms());
    } catch {
      notifyError(translations.toast.errorDefault);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'all') return true;
    return room.displayStatus === filter;
  });

  function startEdit(room: RoomSummary) {
    setEditingCode(room.roomCode);
    setDraftName(room.name ?? room.roomCode);
  }

  async function saveRoom(roomCode: string) {
    const name = draftName.trim();
    if (!name) return;

    setBusyCode(roomCode);
    try {
      await updateBackendRoom(roomCode, { name });
      setRooms((current) =>
        current.map((room) =>
          room.roomCode === roomCode ? { ...room, name } : room,
        ),
      );
      setEditingCode(null);
      notifySuccess(translations.toast.roomUpdated);
    } catch {
      notifyError(translations.toast.errorDefault);
    } finally {
      setBusyCode('');
    }
  }

  async function handleDelete(roomCode: string) {
    if (!window.confirm(translations.roomsPage.deleteConfirm)) return;

    setBusyCode(roomCode);
    try {
      await deleteBackendRoom(roomCode);
      setRooms((current) => current.filter((room) => room.roomCode !== roomCode));
      notifySuccess(translations.toast.roomDeleted);
    } catch {
      notifyError(translations.toast.errorDefault);
    } finally {
      setBusyCode('');
    }
  }

  return (
    <section className='page-section form-page rooms-page'>
      <Card className='form-card slim rooms-card'>
        <div className='section-header rooms-header'>
          <h2>{translations.roomsPage.heading}</h2>
          <p>{translations.roomsPage.description}</p>
          <Button as={Link} to='/create' className='rooms-create-btn'>
            {translations.roomsPage.create}
          </Button>
        </div>

        <div className='rooms-filter-row'>
          {(['all', 'running', 'ended'] as const).map((value) => (
            <button
              key={value}
              type='button'
              className={filter === value ? 'filter-chip selected' : 'filter-chip'}
              onClick={() => setFilter(value)}
            >
              {translations.roomsPage[value]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className='rooms-status'>{translations.app.loading}</p>
        ) : filteredRooms.length === 0 ? (
          <p className='rooms-status input-helper'>
            {rooms.length === 0
              ? translations.roomsPage.empty
              : translations.roomsPage.emptyFiltered}
          </p>
        ) : (
          <div className='rooms-list'>
            {filteredRooms.map((room) => (
              <div className='room-list-item' key={room.roomCode}>
                <div className='room-list-info'>
                  {editingCode === room.roomCode ? (
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className='room-name-input'
                    />
                  ) : (
                    <strong>{room.name ?? room.roomCode}</strong>
                  )}
                  <p className='room-list-meta'>
                    {translations.labels.roomCode}: {room.roomCode} ·{' '}
                    {room.playerCount}{' '}
                    {room.playerCount === 1
                      ? translations.player.countSingle
                      : translations.player.countPlural}
                  </p>
                </div>
                <div className='room-list-actions'>
                  <span
                    className={
                      room.displayStatus === 'ended'
                        ? 'status-badge ended'
                        : 'status-badge running'
                    }
                  >
                    {room.displayStatus === 'ended'
                      ? translations.roomsPage.ended
                      : translations.roomsPage.running}
                  </span>
                  {editingCode === room.roomCode ? (
                    <>
                      <Button
                        type='button'
                        disabled={busyCode === room.roomCode}
                        onClick={() => saveRoom(room.roomCode)}
                      >
                        {translations.roomsPage.save}
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        onClick={() => setEditingCode(null)}
                      >
                        {translations.gameRoomPage.cancelEdit}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        as={Link}
                        to={`/room/${room.roomCode}`}
                        variant='secondary'
                      >
                        {room.displayStatus === 'ended'
                          ? translations.roomsPage.view
                          : translations.roomsPage.open}
                      </Button>
                      {room.displayStatus === 'running' && (
                        <Button
                          type='button'
                          variant='ghost'
                          disabled={busyCode === room.roomCode}
                          onClick={() => startEdit(room)}
                        >
                          {translations.roomsPage.edit}
                        </Button>
                      )}
                      <Button
                        type='button'
                        variant='ghost'
                        className='danger-action'
                        disabled={busyCode === room.roomCode}
                        onClick={() => handleDelete(room.roomCode)}
                      >
                        {translations.roomsPage.delete}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
