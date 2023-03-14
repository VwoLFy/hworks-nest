import { Injectable } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindQuestionsQueryModel } from '../api/models/FindQuestionsQueryModel';
import { QuestionViewModel } from '../api/models/QuestionViewModel';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestion } from '../domain/quiz-question.entity';
import { ILike, Repository } from 'typeorm';
import { PublishedStatuses } from '../api/models/QueryPublishedStatuses';

@Injectable()
export class QuizQuestionsQueryRepo {
  constructor(@InjectRepository(QuizQuestion) private readonly questionsRepositoryT: Repository<QuizQuestion>) {}

  async findQuestions(dto: FindQuestionsQueryModel): Promise<PageViewModel<QuestionViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection, publishedStatus, bodySearchTerm } = dto;

    let publishedFilter: boolean = null;
    if (publishedStatus === PublishedStatuses.published) publishedFilter = true;
    if (publishedStatus === PublishedStatuses.notPublished) publishedFilter = false;

    const [questions, totalCount] = await this.questionsRepositoryT.findAndCount({
      where: { published: publishedFilter, body: ILike(`%${bodySearchTerm}%`) },
      order: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);

    const items: QuestionViewModel[] = questions.map((q) => new QuestionViewModel(q));
    return new PageViewModel({ pageNumber, pagesCount, pageSize, totalCount }, items);
  }

  async findQuestion(questionId: string): Promise<QuestionViewModel> {
    const foundQuestion = await this.questionsRepositoryT.findOne({ where: { id: questionId } });
    return new QuestionViewModel(foundQuestion);
  }
}
