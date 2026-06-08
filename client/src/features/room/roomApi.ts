import { Room } from '../../utils/Room';
import { Player } from '../../utils/Player';
import { QuestionCategory, QuestionType } from '../../utils/Game';
import { fetchApi } from '../../services/api';
import translations from '../../en.json';

type ServerPlayer = {
  _id?: string;
  id?: string;
  name: string;
  score?: number;
};

type ServerRoom = {
  roomCode: string;
  name?: string;
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
};

function getPlayerId(player: ServerPlayer) {
  return player._id ?? player.id ?? crypto.randomUUID();
}

function mapPlayers(serverRoom: ServerRoom): Player[] {
  const scores = serverRoom.gameState?.scores ?? [];
  return (serverRoom.players ?? []).map((player) => {
    const id = getPlayerId(player);
    const score =
      scores.find((entry) => {
        const playerRef =
          typeof entry.player === 'string'
            ? entry.player
            : entry.player?._id ?? entry.player?.id;
        return playerRef === id;
      })?.score ?? player.score ?? 0;

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
    },
    currentPlayerId,
    category:
      serverRoom.gameState?.currentCategory ??
      (translations.categories[0] as QuestionCategory),
    activeType: serverRoom.gameState?.currentQuestion?.type ?? null,
    currentPrompt: serverRoom.gameState?.currentQuestion?.text ?? '',
  };
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
