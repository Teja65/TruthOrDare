import { useCallback, useMemo, useState } from 'react';
import { categories } from '../utils/constants';
import { Player } from '../utils/Player';
import { QuestionCategory, QuestionType } from '../utils/Game';
import translations from '../en.json';
import {
  chooseBackendPrompt,
  completeBackendTurn,
  getBackendRoom,
  restartBackendGame,
  setBackendCategory,
} from '../features/room/roomApi';

export function useGame(roomCode?: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [category, setCategory] = useState<QuestionCategory>(
    categories[0] as QuestionCategory,
  );
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [activeType, setActiveType] = useState<QuestionType | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const currentPlayer = useMemo(
    () =>
      players.find((player) => player.id === currentPlayerId) ??
      players[turnIndex % Math.max(players.length, 1)] ?? {
        id: '',
        name: translations.player.waiting,
        score: 0,
      },
    [currentPlayerId, players, turnIndex],
  );

  const setPlayersFromRoom = useCallback((roomPlayers: Player[]) => {
    setPlayers(roomPlayers);
    setCurrentPlayerId((current) => current || roomPlayers[0]?.id || '');
  }, []);

  const refreshGame = useCallback(async () => {
    if (!roomCode) return;

    try {
      const snapshot = await getBackendRoom(roomCode);
      setPlayers(snapshot.room.players);
      setCurrentPlayerId(snapshot.currentPlayerId);
      setCategory(snapshot.category);
      setActiveType(snapshot.activeType);
      setCurrentPrompt(snapshot.currentPrompt);
    } catch (error) {
      return;
    }
  }, [roomCode]);

  async function selectCategory(value: QuestionCategory) {
    setCategory(value);
    setActiveType(null);
    setCurrentPrompt('');

    if (!roomCode) return;

    try {
      const snapshot = await setBackendCategory(roomCode, value);
      setCategory(snapshot.category);
      setActiveType(snapshot.activeType);
      setCurrentPrompt(snapshot.currentPrompt);
    } catch (error) {
      return;
    }
  }

  async function choosePrompt(type: QuestionType) {
    setIsSpinning(true);
    setActiveType(type);

    try {
      if (roomCode) {
        const snapshot = await chooseBackendPrompt(roomCode, type, category);
        setPlayers(snapshot.room.players);
        setCurrentPlayerId(snapshot.currentPlayerId);
        setCategory(snapshot.category);
        setActiveType(snapshot.activeType);
        setCurrentPrompt(snapshot.currentPrompt);
        return;
      }
    } catch (error) {
      const collection =
        type === 'truth'
          ? translations.questions.truths
          : translations.questions.dares;
      const list = collection[category] ?? [];
      setCurrentPrompt(
        list[Math.floor(Math.random() * list.length)] || '',
      );
      return;
    } finally {
      window.setTimeout(() => setIsSpinning(false), 500);
    }

    const collection =
      type === 'truth'
        ? translations.questions.truths
        : translations.questions.dares;
    const list = collection[category] ?? [];
    setCurrentPrompt(list[Math.floor(Math.random() * list.length)] || '');
  }

  async function finishTurn(delta: number) {
    if (roomCode) {
      try {
        const snapshot = await completeBackendTurn(roomCode, delta);
        setPlayers(snapshot.room.players);
        setCurrentPlayerId(snapshot.currentPlayerId);
        setCategory(snapshot.category);
        setActiveType(snapshot.activeType);
        setCurrentPrompt(snapshot.currentPrompt);
        return;
      } catch (error) {
        return;
      }
    }

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

  async function restartGame() {
    if (roomCode) {
      try {
        const snapshot = await restartBackendGame(roomCode);
        setPlayers(snapshot.room.players);
        setCurrentPlayerId(snapshot.currentPlayerId);
        setCategory(snapshot.category);
        setActiveType(snapshot.activeType);
        setCurrentPrompt(snapshot.currentPrompt);
        setTurnIndex(0);
        return;
      } catch (error) {
        return;
      }
    }

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
    isSpinning,
    setPlayers: setPlayersFromRoom,
    refreshGame,
    selectCategory,
    choosePrompt,
    finishTurn,
    restartGame,
  };
}
