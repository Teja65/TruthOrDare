import { Router } from 'express';
import {
  createRoom,
  getRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
} from '../controllers/room.controller';

export const roomRoutes = Router();

roomRoutes.post('/', createRoom);
roomRoutes.get('/:roomCode', getRoom);
roomRoutes.delete('/:roomCode', deleteRoom);
roomRoutes.post('/:roomCode/join', joinRoom);
roomRoutes.post('/:roomCode/leave', leaveRoom);
