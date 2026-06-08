import { Request, Response } from 'express';
import * as questionService from '../services/question.service';
import translations from '../en.json';

export async function getQuestions(_req: Request, res: Response) {
  res.json(questionService.getQuestionsFromJson());
}

export async function getRandomQuestion(req: Request, res: Response) {
  const type = req.query.type as 'truth' | 'dare' | undefined;
  const category = req.query.category as string | undefined;
  const cursor = Number(req.query.cursor) || 0;

  if (!type) {
    return res.status(400).json({ message: translations.messages.questionUnavailable });
  }

  const question = questionService.getRotatingQuestion(type, category, cursor);
  if (!question) {
    return res.status(404).json({ message: translations.messages.questionUnavailable });
  }
  res.json(question);
}

export async function saveCustomQuestion(req: Request, res: Response) {
  const { text, type, category } = req.body;
  const question = await questionService.saveCustomQuestion(text, type, category);
  res.status(201).json({
    message: translations.messages.customQuestionSaved,
    question,
    questions: questionService.getQuestionsFromJson().questions,
  });
}
