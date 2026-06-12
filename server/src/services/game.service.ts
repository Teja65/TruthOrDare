import { Room } from '../models/Room';
import { GameHistory } from '../models/GameHistory';
import { Player } from '../models/Player';
import {
  getRotatingQuestion,
  loadTranslations,
  normalizeCategory,
} from './question.service';
import { populateGameRoom } from '../utils/populateRoom';
import translations from '../en.json';

function readPoolCursor(room: any, poolKey: string) {
  const root = room.questionCursors ?? {};
  const legacy = room.gameState?.questionCursors ?? {};
  return root[poolKey] ?? legacy[poolKey] ?? 0;
}

function writePoolCursor(room: any, poolKey: string, nextCursor: number) {
  room.questionCursors = {
    ...(room.questionCursors ?? {}),
    [poolKey]: nextCursor,
  };
  room.markModified('questionCursors');
}

export async function startGame(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  if (!room.players.length) {
    throw new Error(translations.messages.playerRequired);
  }

  room.status = 'active';
  room.questionCursors = {};
  room.markModified('questionCursors');
  room.gameState = {
    currentTurn: 1,
    currentPlayer: room.players[0]._id,
    currentCategory: translations.categories[0] as any,
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

  const currentPlayer = room.gameState?.currentPlayer;
  const currentPlayerId =
    currentPlayer?._id?.toString() ?? currentPlayer?.toString();
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
    throw new Error(translations.messages.roomNotFound);
  }

  if (room.status !== 'active') {
    throw new Error(translations.messages.gameInactive);
  }

  const nextPlayer = getNextPlayer(room);
  if (!nextPlayer) {
    throw new Error(translations.messages.nextTurnUnavailable);
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentPlayer = nextPlayer._id;
  gameState.currentTurn = (gameState.currentTurn || 0) + 1;
  gameState.currentQuestion = undefined;

  await room.save();
  return room;
}

export async function selectCategory(roomCode: string, category: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players').populate('gameState.currentPlayer');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentCategory = translations.categories.includes(category)
    ? category
    : translations.categories[0];
  gameState.currentQuestion = undefined;

  await room.save();
  return room;
}

async function selectQuestion(
  roomCode: string,
  type: 'truth' | 'dare',
  category?: string,
) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players').populate('gameState.currentPlayer');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  if (room.status !== 'active') {
    throw new Error(translations.messages.gameInactive);
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  const selectedCategory = normalizeCategory(
    category ?? gameState.currentCategory,
  );
  gameState.currentCategory = selectedCategory;

  const poolKey = `${type}:${selectedCategory}`;
  const cursor = readPoolCursor(room, poolKey);
  const question = getRotatingQuestion(type, selectedCategory, cursor);
  if (!question) {
    throw new Error(translations.messages.questionUnavailable);
  }

  writePoolCursor(room, poolKey, question.nextCursor);
  gameState.currentQuestion = {
    type: question.type,
    text: question.text,
  } as any;

  room.markModified('gameState');
  await room.save();
  return populateGameRoom(room);
}

export function selectTruth(roomCode: string, category?: string) {
  return selectQuestion(roomCode, 'truth', category);
}

export function selectDare(roomCode: string, category?: string) {
  return selectQuestion(roomCode, 'dare', category);
}

export async function skipTurn(roomCode: string) {
  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  if (room.status !== 'active') {
    throw new Error(translations.messages.gameInactive);
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  gameState.currentQuestion = undefined;
  await room.save();
  return room;
}

export async function completeTurn(roomCode: string, delta: number) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players').populate('gameState.currentPlayer');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  if (room.status !== 'active') {
    throw new Error(translations.messages.gameInactive);
  }

  const gameState: any =
    room.gameState ?? (room.gameState = { currentTurn: 0, scores: [] } as any);
  const currentPlayer = gameState.currentPlayer ?? room.players[0]?._id;
  const currentPlayerId =
    currentPlayer?._id?.toString() ?? currentPlayer?.toString();
  const score = gameState.scores.find(
    (item: any) => item.player?.toString() === currentPlayerId,
  );

  if (score) {
    score.score += delta;
  } else if (currentPlayerId) {
    gameState.scores.push({ player: currentPlayerId, score: delta });
  }

  if (currentPlayerId) {
    await Player.findByIdAndUpdate(currentPlayerId, { $inc: { score: delta } });
  }

  const nextPlayer = getNextPlayer(room);
  gameState.currentPlayer = nextPlayer?._id ?? room.players[0]?._id;
  gameState.currentTurn = (gameState.currentTurn || 0) + 1;
  gameState.currentQuestion = undefined;

  await room.save();
  return populateGameRoom(room);
}

export async function restartGame(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players').populate('gameState.currentPlayer');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  await Player.updateMany({ roomCode: room.roomCode }, { $set: { score: 0 } });
  room.status = 'active';
  room.questionCursors = {};
  room.markModified('questionCursors');
  room.set('gameState', {
    currentTurn: 1,
    currentPlayer: room.players[0]?._id,
    currentCategory: loadTranslations().categories[0] as any,
    currentQuestion: undefined,
    scores: room.players.map((player: any) => ({
      player: player._id,
      score: 0,
    })),
  });
  room.markModified('gameState');
  await room.save();

  room.players.forEach((player: any) => {
    player.score = 0;
  });
  return populateGameRoom(room);
}

export async function endGame(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  if (room.status !== 'active') {
    throw new Error(translations.messages.gameInactive);
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
    name: translations.messages.unknownPlayer,
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
