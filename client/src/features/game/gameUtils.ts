import { Player } from '../../utils/Player';

export function getNextPlayerIndex(currentIndex: number, players: Player[]) {
  return players.length ? (currentIndex + 1) % players.length : 0;
}
