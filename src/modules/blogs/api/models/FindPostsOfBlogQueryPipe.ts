import { PipeTransform } from '@nestjs/common';
import { FindPostsQueryModel } from '../../../posts/api/models/FindPostsQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindPostsOfBlogQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindPostsQueryModel> {
  transform(query: any): FindPostsQueryModel {
    const fields = ['id', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt'];
    return this.transformBasic(query, fields);
  }
}

export const findPostsOfBlogQueryPipe = new FindPostsOfBlogQueryPipe();
