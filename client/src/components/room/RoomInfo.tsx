import translations from '../../en.json';
import type { RoomDisplayStatus } from '../../utils/Room';

type RoomInfoProps = {
  roomCode: string;
  playerCount: number;
  displayStatus?: RoomDisplayStatus;
};

export function RoomInfo({
  roomCode,
  playerCount,
  displayStatus = 'running',
}: RoomInfoProps) {
  return (
    <div className='room-info-card'>
      <p className='eyebrow'>{translations.labels.roomCode}</p>
      <h3>{roomCode}</h3>
      <p>
        {playerCount}{' '}
        {playerCount === 1
          ? translations.player.countSingle
          : translations.player.countPlural}
      </p>
      <span
        className={
          displayStatus === 'ended' ? 'status-badge ended' : 'status-badge running'
        }
      >
        {displayStatus === 'ended'
          ? translations.roomsPage.ended
          : translations.roomsPage.running}
      </span>
    </div>
  );
}
