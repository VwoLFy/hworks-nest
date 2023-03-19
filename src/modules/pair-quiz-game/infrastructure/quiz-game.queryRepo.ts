import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GamePairViewModel } from '../api/models/GamePairViewModel';
import { Player } from '../domain/quiz-game.player.entity';
import { AnswerViewModel } from '../api/models/AnswerViewModel';
import { Answer } from '../domain/quiz-game.answer.entity';
import { GameStatuses } from '../application/enums';

@Injectable()
export class QuizGameQueryRepo {
  constructor(
    @InjectRepository(QuizGame) private readonly quizGameRepositoryT: Repository<QuizGame>,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  async findGameById(gameId): Promise<GamePairViewModel> {
    const foundGame = await this.quizGameRepositoryT.findOne({ where: { id: gameId } });
    if (!foundGame) throw new NotFoundException('game not found');
    return new GamePairViewModel(foundGame);
  }

  async findUsersCurrentGame(userId: string): Promise<GamePairViewModel> {
    const gameIdSubQuery = this.manager
      .createQueryBuilder(Player, 'pl')
      .select('pl.quizGameId')
      .where('pl.userId = :userId')
      .getQuery();

    const foundGame = await this.quizGameRepositoryT
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'pl')
      .leftJoinAndSelect('pl.answers', 'ans')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.id = (${gameIdSubQuery})`, { userId: userId })
      .andWhere(`g.status != '${GameStatuses.Finished}'`)
      .getOne();

    if (!foundGame) throw new NotFoundException('game not found');

    return new GamePairViewModel(foundGame);
  }

  async findAnswerById(answerId: number): Promise<AnswerViewModel> {
    const answer = await this.manager.getRepository(Answer).findOne({ where: { id: answerId } });
    return new AnswerViewModel(answer);
  }
}
