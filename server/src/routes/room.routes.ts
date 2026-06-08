import { Router } from 'express';
import {
  createRoom,
  getRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  listRooms,
  listMyRooms,
} from '../controllers/room.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

export const roomRoutes = Router();

roomRoutes.get('/mine', authenticate, listMyRooms);
roomRoutes.get('/', listRooms);
roomRoutes.post('/', optionalAuthenticate, createRoom);
roomRoutes.get('/:roomCode', getRoom);
roomRoutes.delete('/:roomCode', deleteRoom);
roomRoutes.post('/:roomCode/join', joinRoom);
roomRoutes.post('/:roomCode/leave', leaveRoom);
