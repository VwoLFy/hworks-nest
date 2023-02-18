import { PipeTransform } from '@nestjs/common';
import { FindBannedUsersForBlogQueryModel } from './FindBannedUsersForBlogQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindBannedUsersForBlogQueryPipe
  extends BasicQueryPipe
  implements PipeTransform<any, FindBannedUsersForBlogQueryModel>
{
  transform(query: any): FindBannedUsersForBlogQueryModel {
    const fields = ['id', 'login', 'banDate', 'banReason'];
    const preparedQuery = this.transformBasic(query, fields);

    if (preparedQuery.sortBy === 'createdAt') preparedQuery.sortBy = 'banDate';
    const searchLoginTerm = query.searchLoginTerm || '';

    return { ...preparedQuery, searchLoginTerm };
  }
}

export const findBannedUsersForBlogQueryPipe = new FindBannedUsersForBlogQueryPipe();
