import { CreatePaginationDto } from '../../modules/blogs/api/models/CreatePaginationDto';

export class PageViewModel<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];

  constructor(dto: CreatePaginationDto, items: T[]) {
    this.pagesCount = dto.pagesCount;
    this.page = dto.pageNumber;
    this.pageSize = dto.pageSize;
    this.totalCount = dto.totalCount;
    this.items = items;
  }
}
