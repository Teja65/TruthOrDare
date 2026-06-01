import { useEffect, useState } from 'react';
import { loadJson, saveJson } from '../services/localStorage';
import { generateRoomCode } from '../utils/generateRoomCode';
import { Room } from '../types/Room';
import { Player } from '../types/Player';

const STORAGE_KEY = 'truth-or-dare-room';

export function useRoom() {
  const [room, setRoom] = useState<Room>(() => {
    const stored = loadJson<Room>(STORAGE_KEY);
    return (
      stored ?? {
        code: generateRoomCode(),
        host: 'Host',
        players: [],
        createdAt: new Date().toISOString(),
      }
    );
  });

  useEffect(() => {
    saveJson(STORAGE_KEY, room);
  }, [room]);

  function createRoom() {
    const newRoom: Room = {
      ...room,
      code: generateRoomCode(),
      createdAt: new Date().toISOString(),
    };
    setRoom(newRoom);
  }

  function joinRoom(code: string, playerName?: string) {
    if (code.length < 4) {
      return false;
    }
    setRoom((current) => ({
      ...current,
      code: code.toUpperCase(),
      players: playerName
        ? [
            ...current.players,
            { id: crypto.randomUUID(), name: playerName, score: 0 },
          ]
        : current.players,
    }));
    return true;
  }

  function setPlayers(players: Player[]) {
    setRoom((current) => ({ ...current, players }));
  }

  return {
    roomCode: room.code,
    createRoom,
    joinRoom,
    setPlayers,
    room,
  };
}
