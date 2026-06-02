import { Router } from 'express';
import {
  getPlayer,
  updatePlayer,
  updatePlayerScore,
  updatePlayerStats,
} from '../controllers/player.controller';

export const playerRoutes = Router();

playerRoutes.get('/:playerId', getPlayer);
playerRoutes.patch('/:playerId', updatePlayer);
playerRoutes.patch('/:playerId/score', updatePlayerScore);
playerRoutes.patch('/:playerId/stats', updatePlayerStats);
