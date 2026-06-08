import translations from '../../en.json';
import { fetchApi } from '../../services/api';
import type { QuestionCategory } from '../../utils/Game';

type QuestionBank = typeof translations.questions;

let questionBank: QuestionBank = translations.questions;

export function getQuestionBank() {
  return questionBank;
}

export function setQuestionBank(questions: QuestionBank) {
  questionBank = questions;
}

export function getQuestionsForPool(
  type: 'truth' | 'dare',
  category: QuestionCategory,
) {
  const collection =
    type === 'truth' ? questionBank.truths : questionBank.dares;
  return collection[category] ?? [];
}

export async function loadQuestionBankFromApi() {
  const data = await fetchApi<{ questions: QuestionBank }>('/questions');
  setQuestionBank(data.questions);
  return data.questions;
}
