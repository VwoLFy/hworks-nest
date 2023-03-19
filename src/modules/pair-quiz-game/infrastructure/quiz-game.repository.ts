import { Injectable } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { GameStatuses } from '../application/enums';
import { Player } from '../domain/quiz-game.player.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGame) private readonly quizGameRepositoryT: Repository<QuizGame>,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  async saveGame(game: QuizGame) {
    await this.quizGameRepositoryT.save(game);
  }

  async findPendingGame(): Promise<QuizGame> {
    return await this.quizGameRepositoryT.findOne({ where: { status: GameStatuses.PendingSecondPlayer } });
  }

  async findActiveGame(userId: string): Promise<QuizGame> {
    const quizGameIdSubQ = this.manager
      .createQueryBuilder(Player, 'pl')
      .select('pl.quizGameId')
      .where('pl.userId = :userId')
      .getQuery();

    return await this.quizGameRepositoryT
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'pl')
      .leftJoinAndSelect('pl.answers', 'ans')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.id = (${quizGameIdSubQ})`, { userId: userId })
      .andWhere(`g.status = '${GameStatuses.Active}'`)
      .getOne();
  }

  async isUserAlreadyPlaying(userId: string): Promise<boolean> {
    return !!(await this.quizGameRepositoryT.findOne({
      where: { players: { userId: userId }, status: Not(GameStatuses.Finished) },
    }));
  }
}
