import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import translations from '../en.json';

export async function createRoom(
  name?: string,
  hostName?: string,
  requestedRoomCode?: string,
) {
  const roomCode = (requestedRoomCode || generateRoomCode()).toUpperCase();
  const record: any = {
    roomCode,
    name: name ?? `${translations.messages.roomNamePrefix} ${roomCode}`,
  };

  if (hostName) {
    const host = await Player.create({ name: hostName, roomCode, score: 0 });
    record.hostId = host._id;
    record.players = [host._id];
    record.gameState = {
      currentTurn: 0,
      currentCategory: translations.categories[0],
      scores: [{ player: host._id, score: 0 }],
    };
  }

  const room = await Room.create(record);
  return room;
}

export async function getRoomByCode(roomCode: string) {
  return Room.findOne({ roomCode: roomCode.toUpperCase() })
    .populate('players')
    .populate('gameState.currentPlayer');
}

export async function deleteRoom(roomCode: string) {
  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    return null;
  }

  await Player.deleteMany({ roomCode: room.roomCode });
  return room.deleteOne();
}

export async function joinRoom(roomCode: string, playerName: string) {
  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  const player = await Player.create({
    name: playerName,
    roomCode: room.roomCode,
    score: 0,
  });
  room.players.push(player._id);
  const gameState: any =
    room.gameState ??
    (room.gameState = {
      currentTurn: 0,
      currentCategory: translations.categories[0],
      scores: [],
    } as any);
  gameState.scores = gameState.scores || [];
  gameState.scores.push({ player: player._id, score: 0 });
  await room.save();

  return { room, player };
}

export async function leaveRoom(roomCode: string, playerId: string) {
  const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }

  room.players = room.players.filter(
    (player) => player.toString() !== playerId,
  );
  if (room.gameState?.scores) {
    room.gameState.scores = room.gameState.scores.filter(
      (score) => score.player?.toString() !== playerId,
    );
  }
  await room.save();
  await Player.findByIdAndDelete(playerId);

  if (!room.players.length) {
    await room.deleteOne();
    return null;
  }

  return room;
}
