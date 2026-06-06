import { Question } from '../models/Question';
import translations from '../en.json';

export async function getQuestions() {
  return Question.find().sort({ createdAt: -1 });
}

export async function getRandomQuestion(
  type?: 'truth' | 'dare',
  category?: string,
) {
  const filter = type ? { type, active: true } : { active: true };
  const count = await Question.countDocuments(filter);
  if (count) {
    const skip = Math.floor(Math.random() * count);
    return Question.findOne(filter).skip(skip);
  }

  if (!type) return null;

  const normalizedCategory = translations.categories.includes(category ?? '')
    ? category
    : translations.categories[0];
  const collection =
    type === 'truth'
      ? translations.questions.truths
      : translations.questions.dares;
  const list = collection[normalizedCategory as keyof typeof collection] ?? [];
  const text = list[Math.floor(Math.random() * list.length)];

  return text
    ? {
        _id: undefined,
        type,
        text,
      }
    : null;
}

export async function createQuestion(text: string, type: 'truth' | 'dare') {
  return Question.create({ text, type });
}

export async function updateQuestion(questionId: string, data: Partial<{ text: string; type: 'truth' | 'dare'; active: boolean }>) {
  return Question.findByIdAndUpdate(questionId, data, { new: true });
}

export async function deleteQuestion(questionId: string) {
  return Question.findByIdAndDelete(questionId);
}
