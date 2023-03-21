import { Injectable } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameStatuses } from '../application/enums';

@Injectable()
export class QuizGameRepository {
  constructor(@InjectRepository(QuizGame) private readonly quizGameRepositoryT: Repository<QuizGame>) {}

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
      .leftJoin('g.players', 'pl')
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
}
