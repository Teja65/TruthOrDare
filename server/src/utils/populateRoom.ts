import { Room } from '../models/Room';

export async function getPopulatedRoom(roomCode: string) {
  return Room.findOne({ roomCode: roomCode.toUpperCase() })
    .populate('players')
    .populate('gameState.currentPlayer');
}

export async function populateGameRoom(room: any) {
  await room.populate('players');
  await room.populate('gameState.currentPlayer');
  return room;
}
