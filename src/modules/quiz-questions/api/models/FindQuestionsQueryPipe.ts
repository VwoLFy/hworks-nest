import { PipeTransform } from '@nestjs/common';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';
import { FindQuestionsQueryModel } from './FindQuestionsQueryModel';
import { PublishedStatuses } from './QueryPublishedStatuses';

class FindQuestionsQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindQuestionsQueryModel> {
  transform(query: any): FindQuestionsQueryModel {
    const fields = ['id', 'body', 'published', 'updatedAt', 'createdAt'];
    const preparedQuery = this.transformBasic(query, fields);

    const bodySearchTerm = query.bodySearchTerm || '';

    let publishedStatus = query.publishedStatus;
    const statuses = [PublishedStatuses.published, PublishedStatuses.notPublished];
    publishedStatus = statuses.includes(publishedStatus) ? publishedStatus : PublishedStatuses.all;

    return { ...preparedQuery, bodySearchTerm, publishedStatus };
  }
}

export const findQuestionsQueryPipe = new FindQuestionsQueryPipe();
