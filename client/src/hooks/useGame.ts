import { useMemo, useState } from 'react';
import { categories } from '../utils/constants';
import { prompts } from '../data/truthQuestions';
import { darePrompts } from '../data/dareQuestions';
import { Player } from '../types/Player';
import { QuestionCategory } from '../types/Game';

export function useGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [category, setCategory] = useState<QuestionCategory>(
    categories[0] as QuestionCategory,
  );
  const [turnIndex, setTurnIndex] = useState(0);
  const [activeType, setActiveType] = useState<'truth' | 'dare' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const currentPlayer = useMemo(
    () =>
      players[turnIndex % Math.max(players.length, 1)] ?? {
        id: '',
        name: 'Waiting',
        score: 0,
      },
    [players, turnIndex],
  );

  function setPlayersFromRoom(roomPlayers: Player[]) {
    setPlayers(roomPlayers);
  }

  function selectCategory(value: QuestionCategory) {
    setCategory(value);
    setActiveType(null);
    setCurrentPrompt('');
  }

  function choosePrompt(type: 'truth' | 'dare') {
    setActiveType(type);
    const collection = type === 'truth' ? prompts : darePrompts;
    const list = collection[category] ?? [];
    setCurrentPrompt(
      list[Math.floor(Math.random() * list.length)] || 'Pick another category.',
    );
  }

  function finishTurn(delta: number) {
    setPlayers((current) =>
      current.map((player, index) =>
        index === turnIndex % current.length
          ? { ...player, score: player.score + delta }
          : player,
      ),
    );
    setTurnIndex((current) => (current + 1) % Math.max(players.length, 1));
    setActiveType(null);
    setCurrentPrompt('');
  }

  function restartGame() {
    setPlayers((current) => current.map((player) => ({ ...player, score: 0 })));
    setTurnIndex(0);
    setActiveType(null);
    setCurrentPrompt('');
  }

  return {
    players,
    currentPlayer,
    category,
    activeType,
    currentPrompt,
    setPlayers: setPlayersFromRoom,
    selectCategory,
    choosePrompt,
    finishTurn,
    restartGame,
  };
}
