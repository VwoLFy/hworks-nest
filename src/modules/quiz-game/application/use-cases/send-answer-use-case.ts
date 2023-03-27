import { AnswerInputDto } from '../dto/AnswerInputDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quiz-game.repository';
import { ForbiddenException } from '@nestjs/common';
import { GameStatuses } from '../enums';
import { Statistic } from '../../domain/quiz-game.statistic.entity';

export class SendAnswerCommand {
  constructor(public userId: string, public dto: AnswerInputDto) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase implements ICommandHandler<SendAnswerCommand> {
  constructor(private quizGameRepository: QuizGameRepository) {}

  async execute(command: SendAnswerCommand): Promise<number> {
    const { userId, dto } = command;

    const activeGameOfUser = await this.quizGameRepository.findActiveGame(userId);
    if (!activeGameOfUser) throw new ForbiddenException('user is not in the active game');

    const answer = activeGameOfUser.processAnswer(userId, dto.answer);
    if (!answer) throw new ForbiddenException('user has already answered to all questions');

    if (activeGameOfUser.status === GameStatuses.Finished) {
      //console.log(activeGameOfUser.players);
      for (const player of activeGameOfUser.players) {
        let statistic = await this.quizGameRepository.findUserStatistic(player.userId);
        if (!statistic) statistic = new Statistic(player.userId);
        statistic.processGameResult(player);
        await this.quizGameRepository.saveStatistic(statistic);
      }
    }

    await this.quizGameRepository.saveGame(activeGameOfUser);
    return answer.id;
  }
}
