import { useCallback, useEffect, useMemo, useState } from 'react';
import { categories } from '../utils/constants';
import { Player } from '../utils/Player';
import { QuestionCategory, QuestionType } from '../utils/Game';
import translations from '../en.json';
import { getQuestionsForPool, loadQuestionBankFromApi } from '../features/questions/questionPool';
import {
  chooseBackendPrompt,
  completeBackendTurn,
  getBackendRoom,
  restartBackendGame,
  setBackendCategory,
} from '../features/room/roomApi';

function getLocalPrompt(
  type: QuestionType,
  category: QuestionCategory,
  cursors: Record<string, number>,
) {
  const poolKey = `${type}:${category}`;
  const cursor = cursors[poolKey] ?? 0;
  const list = getQuestionsForPool(type, category);
  if (!list.length) return { text: '', nextCursors: cursors };
  return {
    text: list[cursor % list.length],
    nextCursors: { ...cursors, [poolKey]: cursor + 1 },
  };
}

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
  const [questionCursors, setQuestionCursors] = useState<Record<string, number>>(
    {},
  );

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

  useEffect(() => {
    if (!roomCode) return;
    loadQuestionBankFromApi().catch(() => undefined);
  }, [roomCode]);

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
    } catch {
      const local = getLocalPrompt(type, category, questionCursors);
      setQuestionCursors(local.nextCursors);
      setCurrentPrompt(local.text);
      return;
    } finally {
      window.setTimeout(() => setIsSpinning(false), 500);
    }

    const local = getLocalPrompt(type, category, questionCursors);
    setQuestionCursors(local.nextCursors);
    setCurrentPrompt(local.text);
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
    setQuestionCursors({});
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
