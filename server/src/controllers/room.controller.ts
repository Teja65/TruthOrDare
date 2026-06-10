import { Response } from 'express';
import * as roomService from '../services/room.service';
import { toDisplayStatus } from '../utils/roomStatus';
import { AuthRequest } from '../middleware/auth.middleware';
import translations from '../en.json';

function withDisplayStatus(room: any) {
  if (!room) return room;
  const plain = room.toObject ? room.toObject() : room;
  return {
    ...plain,
    displayStatus: toDisplayStatus(plain.status),
  };
}

export async function listRooms(_req: AuthRequest, res: Response) {
  const rooms = await roomService.listAllRooms();
  res.json(rooms);
}

export async function listMyRooms(req: AuthRequest, res: Response) {
  const ownerUid = req.user?.uid;
  if (!ownerUid) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
  const rooms = await roomService.listRoomsByOwner(ownerUid);
  res.json(rooms);
}

export async function createRoom(req: AuthRequest, res: Response) {
  const { name, hostName, roomCode } = req.body;
  const ownerUid = req.user?.uid as string | undefined;
  const room = await roomService.createRoom(name, hostName, roomCode, ownerUid);
  res.status(201).json(withDisplayStatus(room));
}

export async function getRoom(req: AuthRequest, res: Response) {
  const { roomCode } = req.params;
  const room = await roomService.getRoomByCode(roomCode);
  if (!room) {
    return res.status(404).json({ message: translations.messages.roomNotFound });
  }
  res.json(withDisplayStatus(room));
}

export async function updateRoom(req: AuthRequest, res: Response) {
  const { roomCode } = req.params;
  const { name, status } = req.body;
  const room = await roomService.updateRoom(roomCode, { name, status });
  if (!room) {
    return res.status(404).json({ message: translations.messages.roomNotFound });
  }
  res.json(withDisplayStatus(room));
}

export async function deleteRoom(req: AuthRequest, res: Response) {
  const { roomCode } = req.params;
  const result = await roomService.deleteRoom(roomCode);
  if (!result) {
    return res.status(404).json({ message: translations.messages.roomNotFound });
  }
  res.json({ message: translations.messages.roomDeleted });
}

export async function joinRoom(req: AuthRequest, res: Response) {
  const { roomCode } = req.params;
  const { playerName } = req.body;
  try {
    const payload = await roomService.joinRoom(roomCode, playerName);
    res.status(200).json({
      ...payload,
      room: withDisplayStatus(payload.room),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : translations.messages.roomNotFound;
    const status = message === translations.messages.roomEnded ? 410 : 400;
    res.status(status).json({ message });
  }
}

export async function leaveRoom(req: AuthRequest, res: Response) {
  const { roomCode } = req.params;
  const { playerId } = req.body;
  const room = await roomService.leaveRoom(roomCode, playerId);
  if (!room) {
    return res.json({ message: translations.messages.roomClosed });
  }
  res.json(withDisplayStatus(room));
}
