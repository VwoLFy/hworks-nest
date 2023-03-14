import { QuizQuestion } from '../../domain/quiz-question.entity';

export class QuestionViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(questionEntity: QuizQuestion) {
    this.id = questionEntity.id;
    this.body = questionEntity.body;
    this.correctAnswers = questionEntity.correctAnswers;
    this.published = questionEntity.published;
    this.createdAt = questionEntity.createdAt.toISOString();
    this.updatedAt = questionEntity.updatedAt ? questionEntity.updatedAt.toISOString() : null;
  }
}
