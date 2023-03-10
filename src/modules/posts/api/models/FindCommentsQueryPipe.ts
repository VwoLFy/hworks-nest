import { PipeTransform } from '@nestjs/common';
import { FindCommentsQueryModel } from './FindCommentsQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindCommentsQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindCommentsQueryModel> {
  transform(query: any): FindCommentsQueryModel {
    const fields = ['id', 'content', 'userId', 'userLogin', 'createdAt'];
    return this.transformBasic(query, fields);
  }
}

export const findCommentsQueryPipe = new FindCommentsQueryPipe();
