import { QuestionCategory, QuestionType } from '../questions/questionTypes';

export type GameStage = 'setup' | 'category' | 'play';
export type GameState = {
  stage: GameStage;
  category: QuestionCategory;
  questionType: QuestionType | null;
  prompt: string;
  turnIndex: number;
};
