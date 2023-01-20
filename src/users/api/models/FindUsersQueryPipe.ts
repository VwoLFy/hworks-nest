import { PipeTransform } from '@nestjs/common';
import { SortDirection } from '../../../main/types/enums';
import { FindUsersQueryModel } from './FindUsersQueryModel';

class FindUsersQueryPipe implements PipeTransform<any, FindUsersQueryModel> {
  transform(query: any): FindUsersQueryModel {
    const searchLoginTerm = query.searchLoginTerm || '';
    const searchEmailTerm = query.searchEmailTerm || '';

    let pageNumber = +query.pageNumber || 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    let pageSize = +query.pageSize || 10;
    pageSize = pageSize < 1 ? 10 : pageSize;

    let sortBy = query.sortBy || 'createdAt';
    const fields = ['id', 'login', 'email', 'createdAt'];
    sortBy = !fields.includes(sortBy) ? 'createdAt' : sortBy === 'id' ? '_id' : sortBy;

    let sortDirection = query.sortDirection || SortDirection.desc;
    sortDirection = sortDirection !== SortDirection.asc ? SortDirection.desc : SortDirection.asc;

    return { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm };
  }
}

export const findUsersQueryPipe = new FindUsersQueryPipe();
