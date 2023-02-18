import { PipeTransform } from '@nestjs/common';
import { FindCommentsQueryModel } from '../../../posts/api/models/FindCommentsQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindCommentsQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindCommentsQueryModel> {
  transform(query: any): FindCommentsQueryModel {
    const fields = ['id', 'content', 'createdAt'];
    return this.transformBasic(query, fields);
  }
}

export const findCommentsQueryPipe = new FindCommentsQueryPipe();
