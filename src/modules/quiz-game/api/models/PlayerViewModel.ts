import { Player } from '../../domain/quiz-game.player.entity';

export class PlayerViewModel {
  id: string;
  login: string;

  constructor(player: Player) {
    this.id = player.userId;
    this.login = player.login;
  }
}
