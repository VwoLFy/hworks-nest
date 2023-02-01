import { SortDirection } from '../../../../main/types/enums';
import { Allow } from 'class-validator';

export class FindBlogsQueryModel {
  @Allow()
  searchNameTerm: string;

  @Allow()
  pageNumber: number;

  @Allow()
  pageSize: number;

  @Allow()
  sortBy: string;

  @Allow()
  sortDirection: SortDirection;
}
