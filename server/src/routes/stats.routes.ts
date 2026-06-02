import { Router } from 'express';
import { getPlayerStats, getRoomStats } from '../controllers/stats.controller';

export const statsRoutes = Router();

statsRoutes.get('/player/:playerId', getPlayerStats);
statsRoutes.get('/room/:roomCode', getRoomStats);
