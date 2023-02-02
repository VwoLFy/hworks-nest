import { PipeTransform } from '@nestjs/common';
import { BanStatuses, SortDirection } from '../../../../main/types/enums';
import { FindUsersQueryModel } from './FindUsersQueryModel';

class FindUsersQueryPipe implements PipeTransform<FindUsersQueryModel, FindUsersQueryModel> {
  transform(query: FindUsersQueryModel): FindUsersQueryModel {
    const searchLoginTerm = query.searchLoginTerm || '';
    const searchEmailTerm = query.searchEmailTerm || '';

    let pageNumber = +query.pageNumber || 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    let pageSize = +query.pageSize || 10;
    pageSize = pageSize < 1 ? 10 : pageSize;

    let sortBy = query.sortBy;
    const fields = ['id', 'login', 'email', 'createdAt'];
    sortBy = !fields.includes(sortBy) ? 'createdAt' : sortBy === 'id' ? '_id' : sortBy;

    let sortDirection = query.sortDirection;
    sortDirection = sortDirection !== SortDirection.asc ? SortDirection.desc : SortDirection.asc;

    let banStatus = query.banStatus;
    const statuses = [BanStatuses.banned, BanStatuses.notBanned];
    banStatus = statuses.includes(banStatus) ? banStatus : BanStatuses.all;

    return { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm, banStatus };
  }
}

export const findUsersQueryPipe = new FindUsersQueryPipe();
