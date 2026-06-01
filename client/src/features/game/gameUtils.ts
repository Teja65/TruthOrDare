import { Player } from '../../types/Player';

export function getNextPlayerIndex(currentIndex: number, players: Player[]) {
  return players.length ? (currentIndex + 1) % players.length : 0;
}
