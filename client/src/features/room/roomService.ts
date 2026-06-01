import { generateRoomCode } from '../../utils/generateRoomCode';
import { RoomState } from './roomTypes';

export function createRoomState(host: string): RoomState {
  return {
    host,
    code: generateRoomCode(),
    players: [],
    createdAt: new Date().toISOString(),
  };
}
