import { QuestionCategory, QuestionType } from '../../utils/Game';
import { fetchApi } from '../../services/api';
import { setQuestionBank } from './questionPool';
import translations from '../../en.json';

export async function saveCustomQuestion(
  text: string,
  type: QuestionType,
  category: QuestionCategory,
) {
  const result = await fetchApi<{
    message: string;
    question: { type: QuestionType; category: string; text: string };
    questions: typeof translations.questions;
  }>('/questions/custom', {
    method: 'POST',
    body: JSON.stringify({ text, type, category }),
  });

  if (result.questions) {
    setQuestionBank(result.questions);
  }

  return result;
}
