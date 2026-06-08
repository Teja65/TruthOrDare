import { useCallback, useState } from 'react';
import { Room } from '../utils/Room';
import { Player } from '../utils/Player';
import {
  createBackendRoom,
  getBackendRoom,
  joinBackendRoom,
} from '../features/room/roomApi';
import { generateRoomCode } from '../utils/generateRoomCode';
import translations from '../en.json';

function createEmptyRoom(): Room {
  return {
    code: generateRoomCode(),
    host: translations.app.brand,
    players: [],
    createdAt: new Date().toISOString(),
  };
}

export function useRoom() {
  const [room, setRoom] = useState<Room>(createEmptyRoom);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRoom = useCallback(async (roomCode: string) => {
    setLoading(true);
    try {
      const snapshot = await getBackendRoom(roomCode);
      setRoom(snapshot.room);
      setStatusMessage('');
      return snapshot.room;
    } finally {
      setLoading(false);
    }
  }, []);

  async function createRoom(players: Player[]) {
    const namedPlayers = players.filter((player) => player.name.trim());
    const snapshot = await createBackendRoom(
      namedPlayers[0].name.trim(),
      room.code,
    );
    let latestRoom = snapshot.room;

    for (const player of namedPlayers.slice(1)) {
      const joined = await joinBackendRoom(
        snapshot.room.code,
        player.name.trim(),
      );
      latestRoom = joined.room;
    }

    setRoom(latestRoom);
    setStatusMessage('');
    return latestRoom;
  }

  async function joinRoom(code: string, playerName: string) {
    const snapshot = await joinBackendRoom(code.trim(), playerName.trim());
    setRoom(snapshot.room);
    setStatusMessage('');
    return snapshot.room;
  }

  function setPlayers(players: Player[]) {
    setRoom((current) => ({ ...current, players }));
  }

  return {
    roomCode: room.code,
    createRoom,
    joinRoom,
    loadRoom,
    setPlayers,
    room,
    loading,
    statusMessage,
  };
}
