import { SortDirection } from '../../../../main/types/enums';

export type FindCommentsForOwnBlogsDto = {
  userId: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
};
