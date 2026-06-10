import { Room } from '../../utils/Room';
import { Player } from '../../utils/Player';
import { QuestionCategory, QuestionType } from '../../utils/Game';
import { fetchApi } from '../../services/api';
import translations from '../../en.json';

export type RoomDisplayStatus = 'running' | 'ended';

export type RoomSummary = {
  roomCode: string;
  name?: string;
  status: 'waiting' | 'active' | 'ended';
  displayStatus: RoomDisplayStatus;
  playerCount: number;
  ownerUid?: string;
  updatedAt?: string;
  createdAt?: string;
};

type ServerPlayer = {
  _id?: string;
  id?: string;
  name: string;
  score?: number;
};

type ServerRoom = {
  roomCode: string;
  name?: string;
  status?: 'waiting' | 'active' | 'ended';
  displayStatus?: RoomDisplayStatus;
  players?: ServerPlayer[];
  createdAt?: string;
  gameState?: {
    currentPlayer?: ServerPlayer;
    currentCategory?: QuestionCategory;
    currentQuestion?: {
      type?: QuestionType;
      text?: string;
    };
    scores?: Array<{
      player?: string | ServerPlayer;
      score: number;
    }>;
  };
};

export type GameSnapshot = {
  room: Room;
  currentPlayerId: string;
  category: QuestionCategory;
  activeType: QuestionType | null;
  currentPrompt: string;
  displayStatus: RoomDisplayStatus;
};

function normalizeId(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    if ('_id' in value && (value as { _id?: unknown })._id) {
      return String((value as { _id: unknown })._id);
    }
    if ('id' in value && (value as { id?: unknown }).id) {
      return String((value as { id: unknown }).id);
    }
  }
  return String(value);
}

function getPlayerId(player: ServerPlayer) {
  return normalizeId(player._id ?? player.id) || crypto.randomUUID();
}

function resolveDisplayStatus(serverRoom: ServerRoom): RoomDisplayStatus {
  if (serverRoom.displayStatus) return serverRoom.displayStatus;
  return serverRoom.status === 'ended' ? 'ended' : 'running';
}

function mapPlayers(serverRoom: ServerRoom): Player[] {
  const scores = serverRoom.gameState?.scores ?? [];
  return (serverRoom.players ?? []).map((player) => {
    const id = getPlayerId(player);
    const scoreEntry = scores.find(
      (entry) => normalizeId(entry.player) === id,
    );
    const score = scoreEntry?.score ?? player.score ?? 0;

    return {
      id,
      name: player.name,
      score,
    };
  });
}

export function mapServerRoom(serverRoom: ServerRoom): GameSnapshot {
  const players = mapPlayers(serverRoom);
  const currentPlayerId = serverRoom.gameState?.currentPlayer
    ? getPlayerId(serverRoom.gameState.currentPlayer)
    : players[0]?.id ?? '';

  return {
    room: {
      code: serverRoom.roomCode,
      host: serverRoom.name ?? translations.app.brand,
      players,
      createdAt: serverRoom.createdAt ?? new Date().toISOString(),
      status: serverRoom.status ?? 'waiting',
      displayStatus: resolveDisplayStatus(serverRoom),
    },
    currentPlayerId,
    category:
      serverRoom.gameState?.currentCategory ??
      (translations.categories[0] as QuestionCategory),
    activeType: serverRoom.gameState?.currentQuestion?.type ?? null,
    currentPrompt: serverRoom.gameState?.currentQuestion?.text ?? '',
    displayStatus: resolveDisplayStatus(serverRoom),
  };
}

export async function listAllRooms() {
  return fetchApi<RoomSummary[]>('/rooms');
}

export async function listMyRooms() {
  return fetchApi<RoomSummary[]>('/rooms/mine');
}

export async function createBackendRoom(hostName: string, roomCode: string) {
  const room = await fetchApi<ServerRoom>('/rooms', {
    method: 'POST',
    body: JSON.stringify({ hostName, roomCode }),
  });
  return mapServerRoom(room);
}

export async function getBackendRoom(roomCode: string) {
  const room = await fetchApi<ServerRoom>(`/rooms/${roomCode}`);
  return mapServerRoom(room);
}

export async function joinBackendRoom(roomCode: string, playerName: string) {
  await fetchApi(`/rooms/${roomCode}/join`, {
    method: 'POST',
    body: JSON.stringify({ playerName }),
  });
  return getBackendRoom(roomCode);
}

export async function updateBackendPlayer(playerId: string, name: string) {
  return fetchApi(`/players/${playerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function startBackendGame(roomCode: string) {
  const room = await fetchApi<ServerRoom>(`/games/${roomCode}/start`, {
    method: 'POST',
  });
  return mapServerRoom(room);
}

export async function setBackendCategory(
  roomCode: string,
  category: QuestionCategory,
) {
  const room = await fetchApi<ServerRoom>(`/games/${roomCode}/category`, {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
  return mapServerRoom(room);
}

export async function chooseBackendPrompt(
  roomCode: string,
  type: QuestionType,
  category: QuestionCategory,
) {
  const path = type === 'truth' ? 'select-truth' : 'select-dare';
  const room = await fetchApi<ServerRoom>(`/games/${roomCode}/${path}`, {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
  return mapServerRoom(room);
}

export async function completeBackendTurn(roomCode: string, delta: number) {
  const room = await fetchApi<ServerRoom>(`/games/${roomCode}/complete`, {
    method: 'POST',
    body: JSON.stringify({ delta }),
  });
  return mapServerRoom(room);
}

export async function restartBackendGame(roomCode: string) {
  const room = await fetchApi<ServerRoom>(`/games/${roomCode}/restart`, {
    method: 'POST',
  });
  return mapServerRoom(room);
}

export async function endBackendGame(roomCode: string) {
  return fetchApi(`/games/${roomCode}/end`, { method: 'POST' });
}

export async function updateBackendRoom(
  roomCode: string,
  data: { name?: string; status?: 'waiting' | 'active' | 'ended' },
) {
  return fetchApi<ServerRoom>(`/rooms/${roomCode}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteBackendRoom(roomCode: string) {
  return fetchApi(`/rooms/${roomCode}`, { method: 'DELETE' });
}

export async function removeBackendPlayer(roomCode: string, playerId: string) {
  return fetchApi(`/rooms/${roomCode}/leave`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  });
}
