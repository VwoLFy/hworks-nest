import { PipeTransform } from '@nestjs/common';
import { FindBlogsQueryModel } from './FindBlogsQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindBlogsQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindBlogsQueryModel> {
  transform(query: any): FindBlogsQueryModel {
    const fields = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
    const preparedQuery = this.transformBasic(query, fields);

    const searchNameTerm = query.searchNameTerm || '';

    return { ...preparedQuery, searchNameTerm };
  }
}

export const findBlogsQueryPipe = new FindBlogsQueryPipe();
