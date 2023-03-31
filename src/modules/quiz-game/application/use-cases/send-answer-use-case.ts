import { AnswerInputDto } from '../dto/AnswerInputDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quiz-game.repository';
import { ForbiddenException } from '@nestjs/common';
import { GameStatuses } from '../enums';
import { Statistic } from '../../domain/quiz-game.statistic.entity';
import { BaseTransaction } from '../../../../main/transaction';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

export class SendAnswerCommand {
  constructor(public userId: string, public dto: AnswerInputDto) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase
  extends BaseTransaction<SendAnswerCommand, number>
  implements ICommandHandler<SendAnswerCommand>
{
  constructor(private quizGameRepository: QuizGameRepository, @InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }

  async execute(command: SendAnswerCommand): Promise<number> {
    return this.run(command);
  }

  protected async onExecute(data: SendAnswerCommand, manager: EntityManager): Promise<number> {
    const { userId, dto } = data;

    const activeGameOfUser = await this.quizGameRepository.findActiveGameTrans(userId, manager);
    if (!activeGameOfUser) throw new ForbiddenException('user is not in the active game');

    const answer = activeGameOfUser.processAnswer(userId, dto.answer);
    if (!answer) throw new ForbiddenException('user has already answered to all questions');

    if (activeGameOfUser.status === GameStatuses.Finished) {
      for (const player of activeGameOfUser.players) {
        let statistic = await this.quizGameRepository.findUserStatistic(player.userId);
        if (!statistic) statistic = new Statistic(player.userId);

        statistic.processGameResult(player);
        await this.quizGameRepository.saveStatistic(statistic);
      }
    }

    await this.quizGameRepository.saveGameTrans(activeGameOfUser, manager);

    return answer.id;
  }
}
