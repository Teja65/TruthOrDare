import { PlayerState } from './playerTypes';

export function sortPlayers(players: PlayerState[]) {
  return [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
}
