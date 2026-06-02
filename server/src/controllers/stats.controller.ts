import { Request, Response } from 'express';
import * as statsService from '../services/stats.service';

export async function getPlayerStats(req: Request, res: Response) {
  const { playerId } = req.params;
  const stats = await statsService.getPlayerStats(playerId);
  if (!stats) {
    return res.status(404).json({ message: 'Player not found' });
  }
  res.json(stats);
}

export async function getRoomStats(req: Request, res: Response) {
  const { roomCode } = req.params;
  const stats = await statsService.getRoomStats(roomCode);
  res.json(stats);
}
