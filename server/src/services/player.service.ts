import { Player } from '../models/Player';

export async function getPlayerById(playerId: string) {
  return Player.findById(playerId);
}

export async function updatePlayer(
  playerId: string,
  data: Partial<{ name: string }>,
) {
  return Player.findByIdAndUpdate(playerId, data, { new: true });
}

export async function updatePlayerScore(playerId: string, score: number) {
  return Player.findByIdAndUpdate(playerId, { score }, { new: true });
}

export async function updatePlayerStats(
  playerId: string,
  stats: Partial<{ gamesPlayed: number; gamesWon: number }>,
) {
  const player = await Player.findById(playerId);
  if (!player) {
    return null;
  }

  player.stats = {
    gamesPlayed: player.stats?.gamesPlayed ?? 0,
    gamesWon: player.stats?.gamesWon ?? 0,
    ...stats,
  };

  return player.save();
}
