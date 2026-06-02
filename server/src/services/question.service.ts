import { Question } from '../models/Question';

export async function getQuestions() {
  return Question.find().sort({ createdAt: -1 });
}

export async function getRandomQuestion(type?: 'truth' | 'dare') {
  const filter = type ? { type } : {};
  const count = await Question.countDocuments(filter);
  if (!count) {
    return null;
  }

  const skip = Math.floor(Math.random() * count);
  return Question.findOne(filter).skip(skip);
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
