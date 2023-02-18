import { PipeTransform } from '@nestjs/common';
import { FindPostsQueryModel } from './FindPostsQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindPostsQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindPostsQueryModel> {
  transform(query: any): FindPostsQueryModel {
    const fields = ['id', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt'];
    return this.transformBasic(query, fields);
  }
}

export const findPostsQueryPipe = new FindPostsQueryPipe();
