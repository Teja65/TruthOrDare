import { Request, Response } from 'express';
import * as historyService from '../services/history.service';

export async function getHistory(req: Request, res: Response) {
  const data = await historyService.getAllHistory();
  res.json(data);
}

export async function getHistoryByRoom(req: Request, res: Response) {
  const { roomCode } = req.params;
  const data = await historyService.getHistoryByRoom(roomCode);
  res.json(data);
}
