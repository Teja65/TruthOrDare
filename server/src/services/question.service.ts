import fs from 'fs';
import translations from '../en.json';
import { getEnJsonReadPath, getEnJsonWritePaths } from '../utils/enJsonPaths';

export type QuestionType = 'truth' | 'dare';

export function loadTranslations() {
  const readPath = getEnJsonReadPath();
  if (readPath && fs.existsSync(readPath)) {
    return JSON.parse(fs.readFileSync(readPath, 'utf-8'));
  }
  return translations;
}

export function normalizeCategory(category?: string) {
  const source = loadTranslations();
  return source.categories.includes(category ?? '')
    ? category
    : source.categories[0];
}

export function getQuestionList(type: QuestionType, category: string) {
  const source = loadTranslations();
  const collection =
    type === 'truth' ? source.questions.truths : source.questions.dares;
  return (collection[category as keyof typeof collection] ?? []) as string[];
}

export function getQuestionsFromJson() {
  const source = loadTranslations();
  return {
    categories: source.categories,
    questions: source.questions,
  };
}

export function getRotatingQuestion(
  type: QuestionType,
  category: string | undefined,
  cursor: number,
) {
  const normalizedCategory = normalizeCategory(category);
  const list = getQuestionList(type, normalizedCategory);
  if (!list.length) {
    return null;
  }

  const index = cursor % list.length;
  return {
    type,
    text: list[index],
    nextCursor: cursor + 1,
    category: normalizedCategory,
    index,
    total: list.length,
  };
}

export async function saveCustomQuestion(
  text: string,
  type: QuestionType,
  category?: string,
) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(translations.messages.questionUnavailable);
  }

  const normalizedCategory = normalizeCategory(category);
  const writePaths = getEnJsonWritePaths();

  for (const filePath of writePaths) {
    if (!fs.existsSync(filePath)) continue;
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const collection =
      type === 'truth' ? content.questions.truths : content.questions.dares;
    if (!collection[normalizedCategory]) {
      collection[normalizedCategory] = [];
    }
    if (!collection[normalizedCategory].includes(trimmed)) {
      collection[normalizedCategory].push(trimmed);
    }
    fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`);
  }

  return {
    type,
    category: normalizedCategory,
    text: trimmed,
  };
}
