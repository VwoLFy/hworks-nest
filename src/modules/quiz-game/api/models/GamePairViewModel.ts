import { GameStatuses } from '../../application/enums';
import { QuestionInGameViewModel } from './QuestionInGameViewModel';
import { GamePlayerProgressViewModel } from './GamePlayerProgressViewModel';
import { QuizGame } from '../../domain/quiz-game.entity';

export class GamePairViewModel {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel;
  questions: QuestionInGameViewModel[];
  status: GameStatuses;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;

  constructor(game: QuizGame) {
    this.id = game.id;
    game.players.sort((a, b) => a.id - b.id);
    this.firstPlayerProgress = new GamePlayerProgressViewModel(game.players[0]);
    this.secondPlayerProgress = game.players[1] ? new GamePlayerProgressViewModel(game.players[1]) : null;
    this.questions =
      game.questions && game.questions.length > 0
        ? game.questions.sort((a, b) => a.id - b.id).map((q) => new QuestionInGameViewModel(q))
        : null;
    this.status = game.status;
    this.pairCreatedDate = game.pairCreatedDate.toISOString();
    this.startGameDate = game.startGameDate ? game.startGameDate.toISOString() : null;
    this.finishGameDate = game.finishGameDate ? game.finishGameDate.toISOString() : null;
  }
}
