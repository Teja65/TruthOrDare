import { Player } from '../../types/Player';

export function updateScore(
  players: Player[],
  playerId: string,
  delta: number,
) {
  return players.map((player) =>
    player.id === playerId
      ? { ...player, score: player.score + delta }
      : player,
  );
}
