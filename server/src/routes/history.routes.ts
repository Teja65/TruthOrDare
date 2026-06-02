import { Router } from 'express';
import { getHistory, getHistoryByRoom } from '../controllers/history.controller';

export const historyRoutes = Router();

historyRoutes.get('/', getHistory);
historyRoutes.get('/:roomCode', getHistoryByRoom);
