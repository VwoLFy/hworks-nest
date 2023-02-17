import { PipeTransform } from '@nestjs/common';
import { SortDirection } from '../../../../main/types/enums';
import { FindUsersQueryModel } from './FindUsersQueryModel';
import { FindBannedUsersForBlogQueryModel } from './FindBannedUsersForBlogQueryModel';

class FindBannedUsersForBlogQueryPipe implements PipeTransform<FindUsersQueryModel, FindBannedUsersForBlogQueryModel> {
  transform(query: FindBannedUsersForBlogQueryModel): FindBannedUsersForBlogQueryModel {
    const searchLoginTerm = query.searchLoginTerm || '';

    let pageNumber = +query.pageNumber || 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    let pageSize = +query.pageSize || 10;
    pageSize = pageSize < 1 ? 10 : pageSize;

    let sortBy = query.sortBy;
    const fields = ['id', 'login', 'banDate', 'banReason'];
    sortBy = !fields.includes(sortBy) ? 'banDate' : sortBy === 'id' ? '_id' : sortBy;

    let sortDirection = query.sortDirection;
    sortDirection = sortDirection !== SortDirection.asc ? SortDirection.desc : SortDirection.asc;

    return { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm };
  }
}

export const findBannedUsersForBlogQueryPipe = new FindBannedUsersForBlogQueryPipe();
