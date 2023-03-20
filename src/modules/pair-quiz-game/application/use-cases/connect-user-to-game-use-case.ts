import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameRepository } from '../../infrastructure/quiz-game.repository';
import { QuizQuestionsRepository } from '../../../sa.quiz/infrastructure/quiz-questions.repository';
import { ForbiddenException } from '@nestjs/common';
import { GameStatuses } from '../enums';

export class ConnectUserToGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectUserToGameCommand)
export class ConnectUserToGameUseCase implements ICommandHandler<ConnectUserToGameCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private quizGameRepository: QuizGameRepository,
    private quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute(command: ConnectUserToGameCommand): Promise<string> {
    const isUserAlreadyPlaying = await this.quizGameRepository.isUserAlreadyPlaying(command.userId);
    if (isUserAlreadyPlaying) throw new ForbiddenException('user is already playing in another game');

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(command.userId);
    let game = await this.quizGameRepository.findPendingGame();

    game = QuizGame.addPlayerToPendingOrNewGame(game, command.userId, userLogin);

    if (game.status === GameStatuses.Active) {
      const questions = await this.quizQuestionsRepository.find5Questions();
      game.addQuestions(questions);
    }

    await this.quizGameRepository.saveGame(game);
    return game.id;
  }
}
