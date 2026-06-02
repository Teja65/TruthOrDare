import { GameHistory } from '../models/GameHistory';
import { Player } from '../models/Player';

export async function getPlayerStats(playerId: string) {
  const player = await Player.findById(playerId);
  if (!player) {
    return null;
  }

  const games = await GameHistory.find({ 'players.playerId': player._id });
  const stats = player.stats || { gamesPlayed: 0, gamesWon: 0 };
  return {
    player,
    totalGames: games.length,
    wins: stats.gamesWon,
    gamesPlayed: stats.gamesPlayed,
  };
}

export async function getRoomStats(roomCode: string) {
  const history = await GameHistory.find({ roomCode: roomCode.toUpperCase() });
  return {
    roomCode: roomCode.toUpperCase(),
    totalMatches: history.length,
    recentMatches: history.slice(0, 10),
  };
}
