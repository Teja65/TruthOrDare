import { QuestionCategory, QuestionType } from './questionTypes';
import translations from '../../en.json';

export function getRandomQuestion(
  category: QuestionCategory,
  type: QuestionType,
) {
  const collection =
    type === 'truth'
      ? translations.questions.truths
      : translations.questions.dares;
  const list = collection[category];
  return list[Math.floor(Math.random() * list.length)];
}
