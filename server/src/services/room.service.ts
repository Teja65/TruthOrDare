import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import { toDisplayStatus } from '../utils/roomStatus';
import { getPopulatedRoom } from '../utils/populateRoom';
import translations from '../en.json';

function mapRoomSummary(room: any) {
  return {
    roomCode: room.roomCode,
    name: room.name,
    status: room.status,
    displayStatus: toDisplayStatus(room.status),
    playerCount: room.players?.length ?? 0,
    ownerUid: room.ownerUid,
    updatedAt: room.updatedAt,
    createdAt: room.createdAt,
  };
}

export async function listAllRooms() {
  const rooms = await Room.find()
    .select('roomCode name status ownerUid updatedAt createdAt players')
    .sort({ updatedAt: -1 })
    .lean();
  return rooms.map(mapRoomSummary);
}

export async function listRoomsByOwner(ownerUid: string) {
  const rooms = await Room.find({ ownerUid })
    .select('roomCode name status ownerUid updatedAt createdAt players')
    .sort({ updatedAt: -1 })
    .lean();
  return rooms.map(mapRoomSummary);
}

export async function createRoom(
  name?: string,
  hostName?: string,
  requestedRoomCode?: string,
  ownerUid?: string,
) {
  const roomCode = (requestedRoomCode || generateRoomCode()).toUpperCase();
  const record: any = {
    roomCode,
    name: name ?? `${translations.messages.roomNamePrefix} ${roomCode}`,
    ownerUid,
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

export async function setupRoomWithPlayers(
  playerNames: string[],
  requestedRoomCode?: string,
  ownerUid?: string,
) {
  const roomCode = (requestedRoomCode || generateRoomCode()).toUpperCase();
  const names = playerNames.map((name) => name.trim()).filter(Boolean);

  if (names.length < 2) {
    throw new Error(translations.messages.playerRequired);
  }

  const players = await Promise.all(
    names.map((name) => Player.create({ name, roomCode, score: 0 })),
  );

  await Room.create({
    roomCode,
    name: `${translations.messages.roomNamePrefix} ${roomCode}`,
    ownerUid,
    hostId: players[0]._id,
    players: players.map((player) => player._id),
    status: 'active',
    questionCursors: {},
    gameState: {
      currentTurn: 1,
      currentPlayer: players[0]._id,
      currentCategory: translations.categories[0],
      scores: players.map((player) => ({ player: player._id, score: 0 })),
    },
  });

  const room = await getPopulatedRoom(roomCode);
  if (!room) {
    throw new Error(translations.messages.roomNotFound);
  }
  return room;
}

export async function getRoomByCode(roomCode: string) {
  return getPopulatedRoom(roomCode);
}

export async function updateRoom(
  roomCode: string,
  data: Partial<{ name: string; status: 'waiting' | 'active' | 'ended' }>,
) {
  return Room.findOneAndUpdate(
    { roomCode: roomCode.toUpperCase() },
    data,
    { new: true },
  )
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

  if (room.status === 'ended') {
    throw new Error(translations.messages.roomEnded);
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

  const populated = await getPopulatedRoom(room.roomCode);
  return { room: populated ?? room, player };
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
