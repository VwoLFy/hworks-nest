import { Injectable } from '@nestjs/common';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindQuestionsQueryModel } from '../api/models/FindQuestionsQueryModel';
import { QuestionViewModel } from '../api/models/QuestionViewModel';

@Injectable()
export class QuizQueryRepo {
  async findQuestions(dto: FindQuestionsQueryModel): Promise<PageViewModel<QuestionViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection, publishedStatus, bodySearchTerm } = dto;
    const items: QuestionViewModel[] = [
      {
        id: 'string',
        body: 'string',
        correctAnswers: ['string'],
        published: true,
        createdAt: 'string',
        updatedAt: 'string',
      },
    ];
    return new PageViewModel({ pageNumber, pagesCount: 0, pageSize, totalCount: 0 }, items);
  }
}
