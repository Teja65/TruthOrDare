import { Request, Response } from 'express';
import * as roomService from '../services/room.service';
import translations from '../en.json';

export async function createRoom(req: Request, res: Response) {
  const { name, hostName, roomCode } = req.body;
  const room = await roomService.createRoom(name, hostName, roomCode);
  res.status(201).json(room);
}

export async function getRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const room = await roomService.getRoomByCode(roomCode);
  if (!room) {
    return res.status(404).json({ message: translations.messages.roomNotFound });
  }
  res.json(room);
}

export async function deleteRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const result = await roomService.deleteRoom(roomCode);
  if (!result) {
    return res.status(404).json({ message: translations.messages.roomNotFound });
  }
  res.json({ message: translations.messages.roomDeleted });
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
    return res.json({ message: translations.messages.roomClosed });
  }
  res.json(room);
}
