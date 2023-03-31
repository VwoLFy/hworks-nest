import { Injectable } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { GameStatuses } from '../application/enums';
import { Statistic } from '../domain/quiz-game.statistic.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGame) private readonly quizGameRepositoryT: Repository<QuizGame>,
    @InjectRepository(Statistic) private readonly statisticRepositoryT: Repository<Statistic>,
  ) {}

  async findPendingGame(): Promise<QuizGame> {
    return await this.quizGameRepositoryT.findOne({ where: { status: GameStatuses.PendingSecondPlayer } });
  }

  async findActiveGameTrans(userId: string, manager: EntityManager): Promise<QuizGame> {
    const quizGameIdSubQ = await manager
      .getRepository(QuizGame)
      .createQueryBuilder('g')
      .setLock('pessimistic_write')
      .innerJoin('g.players', 'pl')
      .where('pl.userId = :userId', { userId: userId })
      .andWhere(`g.status = '${GameStatuses.Active}'`)
      .getOne();

    if (!quizGameIdSubQ) return null;

    return await manager
      .getRepository(QuizGame)
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'pl')
      .leftJoinAndSelect('pl.answers', 'ans')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.id = '${quizGameIdSubQ.id}'`)
      .orderBy('q.id')
      .addOrderBy('pl.id')
      .addOrderBy('ans.id')
      .getOne();
  }

  async saveGame(game: QuizGame) {
    await this.quizGameRepositoryT.save(game);
  }

  async isUserAlreadyPlaying(userId: string): Promise<boolean> {
    return !!(await this.quizGameRepositoryT.findOne({
      where: { players: { userId: userId }, status: Not(GameStatuses.Finished) },
    }));
  }

  async findUserStatistic(userId: string): Promise<Statistic> {
    return this.statisticRepositoryT.findOne({ where: { userId: userId } });
  }

  async saveStatistic(statistic: Statistic) {
    await this.statisticRepositoryT.save(statistic);
  }

  async saveGameTrans(game: QuizGame, manager: EntityManager) {
    await manager.getRepository(QuizGame).save(game);
  }
}
