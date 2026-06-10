import { Request, Response } from 'express';
import * as gameService from '../services/game.service';
import * as roomService from '../services/room.service';
import { toDisplayStatus } from '../utils/roomStatus';
import translations from '../en.json';

function withDisplayStatus(room: any) {
  if (!room) return room;
  const plain = room.toObject ? room.toObject() : room;
  return {
    ...plain,
    displayStatus: toDisplayStatus(plain.status),
  };
}

export async function startGame(req: Request, res: Response) {
  const { roomCode } = req.params;
  const game = await gameService.startGame(roomCode);
  res.json(game);
}

export async function getGame(req: Request, res: Response) {
  const { roomCode } = req.params;
  const room = await roomService.getRoomByCode(roomCode);
  if (!room) {
    return res.status(404).json({ message: translations.messages.gameRoomNotFound });
  }
  res.json(withDisplayStatus(room));
}

export async function nextTurn(req: Request, res: Response) {
  const { roomCode } = req.params;
  const game = await gameService.nextTurn(roomCode);
  res.json(game);
}

export async function selectTruth(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { category } = req.body;
  const game = await gameService.selectTruth(roomCode, category);
  res.json(withDisplayStatus(game));
}

export async function selectDare(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { category } = req.body;
  const game = await gameService.selectDare(roomCode, category);
  res.json(withDisplayStatus(game));
}

export async function selectCategory(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { category } = req.body;
  const game = await gameService.selectCategory(roomCode, category);
  res.json(withDisplayStatus(game));
}

export async function completeTurn(req: Request, res: Response) {
  const { roomCode } = req.params;
  const { delta } = req.body;
  const game = await gameService.completeTurn(roomCode, Number(delta) || 0);
  res.json(withDisplayStatus(game));
}

export async function restartGame(req: Request, res: Response) {
  const { roomCode } = req.params;
  const game = await gameService.restartGame(roomCode);
  res.json(withDisplayStatus(game));
}

export async function skipTurn(req: Request, res: Response) {
  const { roomCode } = req.params;
  const game = await gameService.skipTurn(roomCode);
  res.json(game);
}

export async function endGame(req: Request, res: Response) {
  const { roomCode } = req.params;
  const history = await gameService.endGame(roomCode);
  res.json(history);
}
