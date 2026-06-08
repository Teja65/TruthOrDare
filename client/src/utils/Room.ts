import { Player } from './Player';

export type RoomDisplayStatus = 'running' | 'ended';

export type Room = {
  code: string;
  host: string;
  players: Player[];
  createdAt: string;
  status?: 'waiting' | 'active' | 'ended';
  displayStatus?: RoomDisplayStatus;
};
