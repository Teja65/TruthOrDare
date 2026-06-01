import translations from '../../en.json';

type RoomInfoProps = {
  roomCode: string;
  playerCount: number;
};

export function RoomInfo({ roomCode, playerCount }: RoomInfoProps) {
  return (
    <div className='room-info-card'>
      <p className='eyebrow'>{translations.labels.roomCode}</p>
      <h3>{roomCode}</h3>
      <p>{`${playerCount} player${playerCount === 1 ? '' : 's'}`}</p>
    </div>
  );
}
