import { CreatePaginationDto } from '../../modules/blogs/api/models/CreatePaginationDto';

export class PaginationPageModel {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: [];

  constructor(dto: CreatePaginationDto) {
    this.pagesCount = dto.pagesCount;
    this.page = dto.pageNumber;
    this.pageSize = dto.pageSize;
    this.totalCount = dto.totalCount;
  }
}
