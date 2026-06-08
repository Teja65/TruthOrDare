import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { RoomSummary } from '../../features/room/roomApi';

type RoomChoiceModalProps = {
  open: boolean;
  rooms: RoomSummary[];
  onClose: () => void;
  onCreateNew: () => void;
};

export function RoomChoiceModal({
  open,
  rooms,
  onClose,
  onCreateNew,
}: RoomChoiceModalProps) {
  const runningRooms = rooms.filter((room) => room.displayStatus === 'running');

  return (
    <Modal open={open} title={translations.homePage.roomChoiceTitle} onClose={onClose}>
      <p>{translations.homePage.roomChoiceMessage}</p>
      <div className='rooms-list compact'>
        {runningRooms.map((room) => (
          <div className='room-list-item' key={room.roomCode}>
            <div>
              <strong>{room.name ?? room.roomCode}</strong>
              <p className='room-list-meta'>{room.roomCode}</p>
            </div>
            <Button as={Link} to={`/room/${room.roomCode}`} onClick={onClose}>
              {translations.homePage.joinExisting}
            </Button>
          </div>
        ))}
      </div>
      <div className='button-row small-gap'>
        <Button variant='secondary' onClick={onCreateNew}>
          {translations.homePage.createNewRoom}
        </Button>
      </div>
    </Modal>
  );
}
