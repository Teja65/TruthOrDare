import { Player } from '../types/Player';

export function pickRandomPlayer(players: Player[]) {
  if (!players.length) return null;
  return players[Math.floor(Math.random() * players.length)];
}
