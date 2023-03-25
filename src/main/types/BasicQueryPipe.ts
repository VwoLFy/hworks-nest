import { SortDirection } from './enums';
import { BasicQueryModel } from './BasicQueryModel';

export class BasicQueryPipe {
  transformBasic(query: any, fields: string[], defaultSortField: string = 'createdAt'): BasicQueryModel {
    let pageNumber = +query.pageNumber || 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    let pageSize = +query.pageSize || 10;
    pageSize = pageSize < 1 ? 10 : pageSize;

    let sortBy = query.sortBy;
    sortBy = !fields.includes(sortBy) ? defaultSortField : sortBy;

    let sortDirection = query.sortDirection;
    sortDirection = sortDirection !== SortDirection.asc ? SortDirection.desc : SortDirection.asc;
    return { ...query, pageNumber, pageSize, sortBy, sortDirection };
  }
}
