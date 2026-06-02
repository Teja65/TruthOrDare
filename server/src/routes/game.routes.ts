import { Router } from 'express';
import {
  startGame,
  getGame,
  nextTurn,
  selectTruth,
  selectDare,
  skipTurn,
  endGame,
} from '../controllers/game.controller';

export const gameRoutes = Router();

gameRoutes.post('/:roomCode/start', startGame);
gameRoutes.get('/:roomCode', getGame);
gameRoutes.post('/:roomCode/next-turn', nextTurn);
gameRoutes.post('/:roomCode/select-truth', selectTruth);
gameRoutes.post('/:roomCode/select-dare', selectDare);
gameRoutes.post('/:roomCode/skip', skipTurn);
gameRoutes.post('/:roomCode/end', endGame);
