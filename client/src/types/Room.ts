import { Player } from './Player';

export type Room = {
  code: string;
  host: string;
  players: Player[];
  createdAt: string;
};
