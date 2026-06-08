import { QuestionType } from '../../utils/Game';
import { fetchApi } from '../../services/api';

export function createQuestion(text: string, type: QuestionType) {
  return fetchApi('/questions', {
    method: 'POST',
    body: JSON.stringify({ text, type }),
  });
}
