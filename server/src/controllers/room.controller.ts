import { Request, Response } from 'express';
import * as roomService from '../services/room.service';

export async function createRoom(req: Request, res: Response) {
  const { name, hostName } = req.body;
  const room = await roomService.createRoom(name, hostName);
  res.status(201).json(room);
}

export async function getRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const room = await roomService.getRoomByCode(roomCode);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  res.json(room);
}

export async function deleteRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const result = await roomService.deleteRoom(roomCode);
  if (!result) {
    return res.status(404).json({ message: 'Room not found' });
  }
  res.json({ message: 'Room deleted' });
}

export async function joinRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { playerName } = req.body;
  const payload = await roomService.joinRoom(roomCode, playerName);
  res.status(200).json(payload);
}

export async function leaveRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  const room = await roomService.leaveRoom(roomCode, playerId);
  if (!room) {
    return res.json({ message: 'Room closed because there are no players left' });
  }
  res.json(room);
}
