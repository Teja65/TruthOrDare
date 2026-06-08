import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { listAllRooms, type RoomSummary } from '../../features/room/roomApi';

export function RoomsPage() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'ended'>('all');

  useEffect(() => {
    listAllRooms()
      .then(setRooms)
      .catch(() => toast.error(translations.toast.errorDefault))
      .finally(() => setLoading(false));
  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'all') return true;
    return room.displayStatus === filter;
  });

  return (
    <section className='page-section form-page rooms-page'>
      <Card className='form-card slim rooms-card'>
        <div className='section-header rooms-header'>
          <h2>{translations.roomsPage.heading}</h2>
          <p>{translations.roomsPage.description}</p>
        </div>

        <div className='rooms-filter-row'>
          <button
            type='button'
            className={filter === 'all' ? 'filter-chip selected' : 'filter-chip'}
            onClick={() => setFilter('all')}
          >
            {translations.roomsPage.all}
          </button>
          <button
            type='button'
            className={
              filter === 'running' ? 'filter-chip selected' : 'filter-chip'
            }
            onClick={() => setFilter('running')}
          >
            {translations.roomsPage.running}
          </button>
          <button
            type='button'
            className={filter === 'ended' ? 'filter-chip selected' : 'filter-chip'}
            onClick={() => setFilter('ended')}
          >
            {translations.roomsPage.ended}
          </button>
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
                  <strong>{room.name ?? room.roomCode}</strong>
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
                  <Button
                    as={Link}
                    to={`/room/${room.roomCode}`}
                    variant='secondary'
                  >
                    {room.displayStatus === 'ended'
                      ? translations.roomsPage.view
                      : translations.roomsPage.open}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
