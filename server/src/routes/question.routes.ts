import { Router } from 'express';
import {
  getQuestions,
  getRandomQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question.controller';

export const questionRoutes = Router();

questionRoutes.get('/', getQuestions);
questionRoutes.get('/random', getRandomQuestion);
questionRoutes.post('/', createQuestion);
questionRoutes.patch('/:questionId', updateQuestion);
questionRoutes.delete('/:questionId', deleteQuestion);
