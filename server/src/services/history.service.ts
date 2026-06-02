import { GameHistory } from '../models/GameHistory';

export async function getAllHistory() {
  return GameHistory.find().sort({ endedAt: -1 });
}

export async function getHistoryByRoom(roomCode: string) {
  return GameHistory.find({ roomCode: roomCode.toUpperCase() }).sort({ endedAt: -1 });
}
