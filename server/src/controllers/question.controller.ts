import { Request, Response } from 'express';
import * as questionService from '../services/question.service';

export async function getQuestions(req: Request, res: Response) {
  const questions = await questionService.getQuestions();
  res.json(questions);
}

export async function getRandomQuestion(req: Request, res: Response) {
  const { type } = req.query;
  const question = await questionService.getRandomQuestion(type as 'truth' | 'dare');
  if (!question) {
    return res.status(404).json({ message: 'No question found' });
  }
  res.json(question);
}

export async function createQuestion(req: Request, res: Response) {
  const { text, type } = req.body;
  const question = await questionService.createQuestion(text, type);
  res.status(201).json(question);
}

export async function updateQuestion(req: Request, res: Response) {
  const { questionId } = req.params;
  const question = await questionService.updateQuestion(questionId, req.body);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  res.json(question);
}

export async function deleteQuestion(req: Request, res: Response) {
  const { questionId } = req.params;
  const question = await questionService.deleteQuestion(questionId);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  res.json({ message: 'Question deleted' });
}
