import { Room } from '../models/Room';
import { GameHistory } from '../models/GameHistory';
import { Player } from '../models/Player';
import { getRandomQuestion } from './question.service';

export async function startGame(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  if (!room.players.length) {
    throw new Error('At least one player is required to start the game');
  }

  room.status = 'active';
  room.gameState = {
    currentTurn: 1,
    currentPlayer: room.players[0]._id,
    scores: room.players.map((player: any) => ({
      player: player._id,
      score: player.score ?? 0,
    })),
  };

  await room.save();
  return room;
}

function getNextPlayer(room: any) {
  if (!room.players.length) {
    return null;
  }

  const currentPlayerId = room.gameState?.currentPlayer?.toString();
  const ids = room.players.map((item: any) => item._id.toString());
  const currentIndex = ids.indexOf(currentPlayerId);
  const nextIndex =
    currentIndex < 0 || currentIndex === ids.length - 1 ? 0 : currentIndex + 1;
  return room.players[nextIndex];
}

export async function nextTurn(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'active') {
    throw new Error('Game is not active');
  }

  const nextPlayer = getNextPlayer(room);
  if (!nextPlayer) {
    throw new Error('No players available for next turn');
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentPlayer = nextPlayer._id;
  gameState.currentTurn = (gameState.currentTurn || 0) + 1;
  gameState.currentQuestion = undefined;

  await room.save();
  return room;
}

async function selectQuestion(roomCode: string, type: 'truth' | 'dare') {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'active') {
    throw new Error('Game is not active');
  }

  const question = await getRandomQuestion(type);
  if (!question) {
    throw new Error(`No ${type} questions available`);
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentQuestion = {
    questionId: question._id,
    type: question.type,
    text: question.text,
  } as any;

  await room.save();
  return room;
}

export function selectTruth(roomCode: string) {
  return selectQuestion(roomCode, 'truth');
}

export function selectDare(roomCode: string) {
  return selectQuestion(roomCode, 'dare');
}

export async function skipTurn(roomCode: string) {
  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'active') {
    throw new Error('Game is not active');
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentQuestion = undefined;
  await room.save();
  return room;
}

export async function endGame(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'active') {
    throw new Error('Game is not active');
  }

  const scores = (room.gameState?.scores ?? []) as Array<{
    player?: any;
    score: number;
  }>;
  const winnerScore = scores.reduce(
    (best, item) =>
      item.score > best.score
        ? { player: item.player ?? null, score: item.score }
        : best,
    { player: null as any, score: -Infinity },
  );

  const playerStats = room.players.map((player: any) => ({
    playerId: player._id,
    name: player.name,
    score:
      scores.find(
        (entry: any) => entry.player.toString() === player._id.toString(),
      )?.score ?? player.score,
  }));

  const winner = playerStats.find(
    (player) => player.playerId.toString() === winnerScore.player?.toString(),
  ) || {
    playerId: null,
    name: 'Unknown',
    score: 0,
  };

  const history = await GameHistory.create({
    roomCode: room.roomCode,
    roomName: room.name,
    players: playerStats,
    winner: {
      playerId: winner.playerId,
      name: winner.name,
      score: winner.score,
    },
    turns: room.gameState?.currentTurn ?? 0,
    questionLog: [],
    endedAt: new Date(),
  });

  await Promise.all(
    room.players.map(async (player: any) => {
      player.stats.gamesPlayed += 1;
      if (winner.playerId?.toString() === player._id.toString()) {
        player.stats.gamesWon += 1;
      }
      await Player.findByIdAndUpdate(player._id, { stats: player.stats });
    }),
  );

  room.status = 'ended';
  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentQuestion = undefined;
  await room.save();
  return history;
}
