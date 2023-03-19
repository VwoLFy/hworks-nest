import { AnswerStatuses } from '../../application/enums';
import { Answer } from '../../domain/quiz-game.answer.entity';

export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: string;

  constructor(answer: Answer) {
    this.questionId = answer.questionId;
    this.answerStatus = answer.answerStatus;
    this.addedAt = answer.addedAt.toISOString();
  }
}
