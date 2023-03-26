import { QuizQuestionToGame } from '../../domain/quiz-game.game-to-question.entity';

export class QuestionInGameViewModel {
  id: string;
  body: string;

  constructor(question: QuizQuestionToGame) {
    this.id = question.quizQuestionId;
    this.body = question.body;
  }
}
