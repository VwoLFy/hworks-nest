import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GamePairViewModel } from '../api/models/GamePairViewModel';
import { AnswerViewModel } from '../api/models/AnswerViewModel';
import { Answer } from '../domain/quiz-game.answer.entity';
import { GameStatuses } from '../application/enums';
import { BasicQueryModel } from '../../../main/types/BasicQueryModel';
import { PageViewModel } from '../../../main/types/PageViewModel';

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
    const gameIdSubQuery = this.quizGameRepositoryT
      .createQueryBuilder('g')
      .select('g.id')
      .leftJoin('g.players', 'pl')
      .where('pl.userId = :userId')
      .andWhere(`g.status != '${GameStatuses.Finished}'`)
      .getQuery();

    const foundGame = await this.quizGameRepositoryT
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'pl')
      .leftJoinAndSelect('pl.answers', 'ans')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.id = (${gameIdSubQuery})`, { userId: userId })
      .getOne();

    if (!foundGame) throw new NotFoundException('game not found');

    return new GamePairViewModel(foundGame);
  }

  async findAnswerById(answerId: number): Promise<AnswerViewModel> {
    const answer = await this.manager.getRepository(Answer).findOne({ where: { id: answerId } });
    return new AnswerViewModel(answer);
  }

  async findUserGames(userId: string, dto: BasicQueryModel): Promise<PageViewModel<GamePairViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;

    const gameIdSubQuery = this.quizGameRepositoryT
      .createQueryBuilder('g')
      .select('g.id')
      .leftJoin('g.players', 'pl')
      .where('pl.userId = :userId')
      .getQuery();

    const [foundGames, totalCount] = await this.quizGameRepositoryT
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.players', 'pl')
      .leftJoinAndSelect('pl.answers', 'ans')
      .leftJoinAndSelect('g.questions', 'q')
      .where(`g.id IN(${gameIdSubQuery})`, { userId: userId })
      .orderBy({ [`g.${sortBy}`]: sortDirection === 'asc' ? 'ASC' : 'DESC' })
      .take(pageSize)
      .skip((pageNumber - 1) * pageSize)
      .getManyAndCount();

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = foundGames.map((g) => new GamePairViewModel(g));
    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }
}
