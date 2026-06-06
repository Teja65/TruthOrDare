import { Room } from '../models/Room';
import { GameHistory } from '../models/GameHistory';
import { Player } from '../models/Player';
import { getRandomQuestion } from './question.service';
import translations from '../en.json';

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
  const selectedCategory = translations.categories.includes(category ?? '')
    ? category
    : gameState.currentCategory ?? translations.categories[0];
  gameState.currentCategory = selectedCategory;

  const question = await getRandomQuestion(type, selectedCategory);
  if (!question) {
    throw new Error(translations.messages.questionUnavailable);
  }

  gameState.currentQuestion = {
    questionId: question._id,
    type: question.type,
    text: question.text,
  } as any;

  await room.save();
  return room;
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
  return Room.findOne({ roomCode: roomCode.toUpperCase() })
    .populate('players')
    .populate('gameState.currentPlayer');
}

export async function restartGame(roomCode: string) {
  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  }).populate('players').populate('gameState.currentPlayer');
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  await Player.updateMany({ roomCode: room.roomCode }, { score: 0 });
  room.status = 'active';
  room.gameState = {
    currentTurn: 1,
    currentPlayer: room.players[0]?._id,
    currentCategory: translations.categories[0] as any,
    currentQuestion: undefined,
    scores: room.players.map((player: any) => ({
      player: player._id,
      score: 0,
    })),
  } as any;

  await room.save();
  return Room.findOne({ roomCode: roomCode.toUpperCase() })
    .populate('players')
    .populate('gameState.currentPlayer');
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
