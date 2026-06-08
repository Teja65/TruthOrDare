import { Router } from 'express';
import {
  getQuestions,
  getRandomQuestion,
  saveCustomQuestion,
} from '../controllers/question.controller';

export const questionRoutes = Router();

questionRoutes.get('/', getQuestions);
questionRoutes.get('/random', getRandomQuestion);
questionRoutes.post('/custom', saveCustomQuestion);
