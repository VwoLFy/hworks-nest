import { PipeTransform } from '@nestjs/common';
import { SortDirection } from '../../../main/types/enums';
import { FindPostsQueryModel } from './FindPostsQueryModel';

class FindPostsQueryPipe implements PipeTransform<any, FindPostsQueryModel> {
  transform(query: any): FindPostsQueryModel {
    let pageNumber = +query.pageNumber || 1;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    let pageSize = +query.pageSize || 10;
    pageSize = pageSize < 1 ? 10 : pageSize;

    let sortBy = query.sortBy || 'createdAt';
    const fields = ['id', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt'];
    sortBy = !fields.includes(sortBy) ? 'createdAt' : sortBy === 'id' ? '_id' : sortBy;

    let sortDirection = query.sortDirection || SortDirection.desc;
    sortDirection = sortDirection !== SortDirection.asc ? SortDirection.desc : SortDirection.asc;

    return { pageNumber, pageSize, sortBy, sortDirection };
  }
}

export const findPostsQueryPipe = new FindPostsQueryPipe();
