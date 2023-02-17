import { SortDirection } from '../../../../main/types/enums';

export type FindBannedUsersForBlogQueryModel = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  searchLoginTerm: string;
};
