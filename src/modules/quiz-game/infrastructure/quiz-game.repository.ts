import { Injectable } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameStatuses } from '../application/enums';
import { Statistic } from '../domain/quiz-game.statistic.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGame) private readonly quizGameRepositoryT: Repository<QuizGame>,
    @InjectRepository(Statistic) private readonly statisticRepositoryT: Repository<Statistic>,
  ) {}

  async saveGame(game: QuizGame) {
    await this.quizGameRepositoryT.save(game);
  }

  async findPendingGame(): Promise<QuizGame> {
    return await this.quizGameRepositoryT.findOne({ where: { status: GameStatuses.PendingSecondPlayer } });
  }

  async findActiveGame(userId: string): Promise<QuizGame> {
    const quizGameIdSubQ = this.quizGameRepositoryT
      .createQueryBuilder('g')
      .select('g.id')
      .innerJoin('g.players', 'pl')
      .where('pl.userId = :userId')
      .andWhere(`g.status = '${GameStatuses.Active}'`)
      .getQuery();

    return await this.quizGameRepositoryT
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'pl')
      .leftJoinAndSelect('pl.answers', 'ans')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.id = (${quizGameIdSubQ})`, { userId: userId })
      .getOne();
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
}
