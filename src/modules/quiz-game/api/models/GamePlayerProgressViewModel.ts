import { PlayerViewModel } from './PlayerViewModel';
import { AnswerViewModel } from './AnswerViewModel';
import { Player } from '../../domain/quiz-game.player.entity';

export class GamePlayerProgressViewModel {
  answers: AnswerViewModel[];
  player: PlayerViewModel;
  score: number;

  constructor(player: Player) {
    this.answers = player.answers
      ? player.answers.sort((a, b) => a.id - b.id).map((a) => new AnswerViewModel(a))
      : null;
    this.player = new PlayerViewModel(player);
    this.score = player.score;
  }
}
