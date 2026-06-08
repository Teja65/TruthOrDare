import { useState } from 'react';
import { Player } from '../utils/Player';
import translations from '../en.json';

const starterPlayers: Player[] = [
  { id: crypto.randomUUID(), name: translations.player.starterOne, score: 0 },
  { id: crypto.randomUUID(), name: translations.player.starterTwo, score: 0 },
];

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>(starterPlayers);

  function addPlayer(name: string) {
    setPlayers((current) => [
      ...current,
      { id: crypto.randomUUID(), name, score: 0 },
    ]);
  }

  function updatePlayerName(id: string, name: string) {
    setPlayers((current) =>
      current.map((player) =>
        player.id === id ? { ...player, name } : player,
      ),
    );
  }

  function removePlayer(id: string) {
    setPlayers((current) => current.filter((player) => player.id !== id));
  }

  function resetPlayers() {
    setPlayers(starterPlayers);
  }

  return { players, addPlayer, updatePlayerName, removePlayer, resetPlayers };
}
