import { PipeTransform } from '@nestjs/common';
import { SortDirection } from '../../../../main/types/enums';
import { FindCommentsQueryModel } from '../../../posts/api/models/FindCommentsQueryModel';

class FindCommentsQueryPipe implements PipeTransform<any, FindCommentsQueryModel> {
  transform(query: any): FindCommentsQueryModel {
    let pageNumber = +query.pageNumber || 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    let pageSize = +query.pageSize || 10;
    pageSize = pageSize < 1 ? 10 : pageSize;

    let sortBy = query.sortBy || 'createdAt';
    const fields = ['id', 'content', 'userId', 'userLogin', 'createdAt'];
    sortBy = !fields.includes(sortBy) ? 'createdAt' : sortBy === 'id' ? '_id' : sortBy;

    let sortDirection = query.sortDirection || SortDirection.desc;
    sortDirection = sortDirection !== SortDirection.asc ? SortDirection.desc : SortDirection.asc;

    return { pageNumber, pageSize, sortBy, sortDirection };
  }
}

export const findCommentsQueryPipe = new FindCommentsQueryPipe();