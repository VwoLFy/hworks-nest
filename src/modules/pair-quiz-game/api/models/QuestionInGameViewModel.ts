import { QuizQuestion } from '../../../sa.quiz/domain/quiz-question.entity';

export class QuestionInGameViewModel {
  id: string;
  body: string;

  constructor(question: QuizQuestion) {
    this.id = question.id;
    this.body = question.body;
  }
}
