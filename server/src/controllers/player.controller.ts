import { Request, Response } from 'express';
import * as playerService from '../services/player.service';

export async function getPlayer(req: Request, res: Response) {
  const { playerId } = req.params;
  const player = await playerService.getPlayerById(playerId);
  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }
  res.json(player);
}

export async function updatePlayer(req: Request, res: Response) {
  const { playerId } = req.params;
  const player = await playerService.updatePlayer(playerId, req.body);
  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }
  res.json(player);
}

export async function updatePlayerScore(req: Request, res: Response) {
  const { playerId } = req.params;
  const { score } = req.body;
  const player = await playerService.updatePlayerScore(playerId, score);
  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }
  res.json(player);
}

export async function updatePlayerStats(req: Request, res: Response) {
  const { playerId } = req.params;
  const { stats } = req.body;
  const player = await playerService.updatePlayerStats(playerId, stats);
  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }
  res.json(player);
}
